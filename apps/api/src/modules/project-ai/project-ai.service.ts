/**
 * Implementa as regras de negócio de planeamento de projetos com IA e concentra validações do domínio.
 */
import {
    ForbiddenException,
    HttpException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { ProjectAiPlanResult } from "../ai/providers/ai-provider.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassProjectsService } from "../class-projects/class-projects.service.js";
import { CreateProjectAiPlanDto } from "./dto/create-project-ai-plan.dto.js";
import { buildProjectAiPrompt } from "./prompts/project-ai.prompt.js";
import { ProjectAiPlan, ProjectAiPlanDocument } from "./schemas/project-ai-plan.schema.js";

/**
 * Serviço de IA assistiva para planear projectos publicados.
 */
@Injectable()
export class ProjectAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param planModel Modelo Mongoose injetado para ler e persistir planeamento de projetos com IA.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param projectsService Service injetado para reutilizar regras de projects sem duplicar validações.
     * @param auditLogService Service injetado para auditoria IA minimizada.
     */
    constructor(
        @InjectModel(ProjectAiPlan.name)
        private readonly planModel: Model<ProjectAiPlanDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly projectsService: ClassProjectsService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Cria planeamento de projetos com IA depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param projectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async createPlan(
        actor: AuthenticatedUser,
        projectId: string,
        input: CreateProjectAiPlanDto,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const project = await this.projectsService.findPublishedForStudent(
            actor.id,
            projectId,
        );
        const knownDifficulties = (input.knownDifficulties ?? [])
            .map((difficulty) => difficulty.trim())
            .filter(Boolean);

        const authorization = await this.aiExecution.authorize(actor.id, "PROJECT_AI");
        const policy = authorization.policy;
        const prompt = buildProjectAiPrompt({
            project,
            studentGoal: input.studentGoal.trim(),
            knownDifficulties,
        });

        try {
            const execution = await this.aiExecution.executeAuthorized(
                authorization,
                {
                    quota: {
                        scope: "USER",
                        targetId: actor.id,
                        units: () => this.estimateUsageUnits(prompt),
                    },
                    sources: [],
                    guardrailText: input.studentGoal,
                    buildPrompt: () => prompt,
                    invoke: ({ provider, prompt: governedPrompt, options }) =>
                        provider.generateProjectPlan({
                            prompt: governedPrompt,
                            options,
                        }),
                    validateResult: (result) => this.validateResult(result),
                },
            );
            const { result } = execution;
            this.validateResult(result);

            const plan = await this.planModel.create({
                projectId: new Types.ObjectId(project._id),
                studentId: new Types.ObjectId(actor.id),
                studentGoal: input.studentGoal.trim(),
                knownDifficulties,
                steps: result.steps.map((step) => step.trim()),
                rationale: result.rationale.trim(),
            });

            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "PROJECT_AI_REQUESTED",
                resourceType: "ClassProject",
                resourceId: projectId,
                result: "SUCCESS",
                metadata: {
                    purpose: "PROJECT_AI",
                    model: policy.model,
                    stepCount: result.steps.length,
                },
            });

            return {
                _id: String(plan._id),
                projectId: project._id,
                studentGoal: plan.studentGoal,
                knownDifficulties: plan.knownDifficulties,
                steps: plan.steps,
                rationale: plan.rationale,
                createdAt: (plan.toObject() as { createdAt?: Date }).createdAt,
            };
        } catch (error) {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "PROJECT_AI_REQUESTED",
                resourceType: "ClassProject",
                resourceId: projectId,
                result: "FAILED",
                metadata: {
                    purpose: "PROJECT_AI",
                    model: policy.model,
                },
            });
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Executa estimate usage units no domínio de planeamento de projetos com IA, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param prompt Valor de prompt usado pela função para executar estimate usage units com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

    /**
     * Confirma que os dados de planeamento de projetos com IA cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido por uma operação externa antes da validação final.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private validateResult(result: ProjectAiPlanResult): void {
        if (
            !Array.isArray(result.steps) ||
            result.steps.length === 0 ||
            result.steps.some((step) => typeof step !== "string" || !step.trim()) ||
            typeof result.rationale !== "string" ||
            !result.rationale.trim()
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_PROJECT_PLAN",
                message: "A IA devolveu um plano de projecto inválido.",
            });
        }
    }
}
