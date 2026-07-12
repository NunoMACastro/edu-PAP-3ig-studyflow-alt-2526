/**
 * Implementa as regras de negócio de planeamento de projetos com IA e concentra validações do domínio.
 */
import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    Optional,
    ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { ProjectAiPlanResult } from "../ai/providers/ai-provider.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ClassProjectsService } from "../class-projects/class-projects.service.js";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service.js";
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
        private readonly voiceService: TeacherAiVoiceService,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
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
        const voice = await this.voiceService.resolveTeacherVoice({
            classId: project.classId,
            subjectId: project.subjectId,
        });
        const prompt = buildProjectAiPrompt({
            project,
            studentGoal: input.studentGoal.trim(),
            knownDifficulties,
            voice,
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
                classId: new Types.ObjectId(project.classId),
                ...(project.subjectId
                    ? { subjectId: new Types.ObjectId(project.subjectId) }
                    : {}),
                studentId: new Types.ObjectId(actor.id),
                studentGoal: input.studentGoal.trim(),
                knownDifficulties,
                steps: result.steps.map((step) => step.trim()),
                rationale: result.rationale.trim(),
                voiceSource: voice.source,
                voiceTone: voice.tone,
                voiceDetailLevel: voice.detailLevel,
                voiceRulesApplied: voice.rules,
            });

            const created = plan.toObject() as { createdAt?: Date };
            await this.classLearningActivityService?.recordBestEffort({
                classId: project.classId,
                studentId: actor.id,
                ...(project.subjectId ? { subjectId: project.subjectId } : {}),
                type: "PROJECT_AI_PLAN",
                sourceEventKey: `project-ai-plan:${String(plan._id)}`,
                occurredAt: created.createdAt,
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

            return this.toStudentView({
                ...plan.toObject(),
                _id: plan._id,
                projectId: plan.projectId,
                studentGoal: plan.studentGoal,
                knownDifficulties: plan.knownDifficulties,
                steps: plan.steps,
                rationale: plan.rationale,
                voiceSource: plan.voiceSource,
            });
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

    /** Lista apenas planos do próprio aluno depois de revalidar a membership. */
    async listPlans(
        actor: AuthenticatedUser,
        projectId: string,
        cursor?: string,
        requestedLimit = 20,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        await this.projectsService.findPublishedForStudentHistory(
            actor.id,
            projectId,
        );
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw new BadRequestException({
                code: "PROJECT_AI_CURSOR_INVALID",
                message: "Cursor de histórico inválido.",
            });
        }
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const rows = await this.planModel
            .find({
                projectId: new Types.ObjectId(projectId),
                studentId: new Types.ObjectId(actor.id),
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        return {
            items: pageRows.map((row) => this.toStudentView(row)),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    /** Omite regras e detalhes internos da voz docente no contrato do aluno. */
    private toStudentView(plan: {
        _id: unknown;
        projectId: unknown;
        studentGoal: string;
        knownDifficulties?: string[];
        steps: string[];
        rationale?: string;
        voiceSource?: "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";
        createdAt?: Date;
    }) {
        return {
            _id: String(plan._id),
            projectId: String(plan.projectId),
            studentGoal: plan.studentGoal,
            knownDifficulties: plan.knownDifficulties ?? [],
            steps: plan.steps,
            rationale: plan.rationale,
            teacherVoiceApplied:
                Boolean(plan.voiceSource) && plan.voiceSource !== "DEFAULT",
            createdAt: plan.createdAt,
        };
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
