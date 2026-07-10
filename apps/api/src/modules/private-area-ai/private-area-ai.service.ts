/**
 * Implementa as regras de negócio de private área ai e concentra validações do domínio.
 */
import {
    ForbiddenException,
    HttpException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { PrivateAreaAiResult } from "../ai/providers/ai-provider.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskPrivateAreaAiDto } from "./dto/ask-private-area-ai.dto.js";
import { buildPrivateAreaAiPrompt } from "./prompts/private-area-ai.prompt.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerDocument,
} from "./schemas/private-area-ai-answer.schema.js";

/**
 * Serviço de IA privada por área de estudo.
 */
@Injectable()
export class PrivateAreaAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA privada da área de estudo.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param auditLogService Service injetado para registar uso IA sem prompts ou respostas completas.
     */
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answerModel: Model<PrivateAreaAiAnswerDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Orquestra uma pergunta de IA em IA privada da área de estudo, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param studyAreaId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async ask(
        actor: AuthenticatedUser,
        studyAreaId: string,
        input: AskPrivateAreaAiDto,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // A área é carregada pelo service do aluno para garantir ownership antes de obter fontes privadas.
        const area = await this.studyAreasService.getMyStudyArea(
            actor.id,
            studyAreaId,
        );
        const materials = await this.materialsService.listReadyTextSources(
            actor.id,
            studyAreaId,
        );
        const sources = materials.map((material) => ({
            materialId: String(material._id),
            title: material.title,
            contentText: material.contentText ?? "",
        }));
        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PRIVATE_AI_SOURCES",
                message: "Esta área ainda não tem materiais processáveis para IA.",
            });
        }

        const authorization = await this.aiExecution.authorize(
            actor.id,
            "PRIVATE_AREA_AI",
        );
        const policy = authorization.policy;
        const limitedSources = sources.slice(0, policy.maxSourceCount);

        try {
            const execution = await this.aiExecution.executeAuthorized(
                authorization,
                {
                    quota: {
                        scope: "USER",
                        targetId: actor.id,
                        units: (prompt) => this.estimateUsageUnits(prompt),
                    },
                    sources: limitedSources,
                    guardrailText: input.question,
                    buildPrompt: (selectedSources) =>
                        buildPrivateAreaAiPrompt({
                            areaName: area.name,
                            question: input.question.trim(),
                            sources: [...selectedSources],
                        }),
                    invoke: ({ provider, prompt, options }) =>
                        provider.generatePrivateAreaAnswer({ prompt, options }),
                    validateResult: (result, selectedSources) =>
                        this.validateResult(
                            result,
                            selectedSources.map((source) => source.materialId),
                        ),
                },
            );
            const { result } = execution;
            const selectedSources = [...execution.sources];
            // Uma resposta sem fontes válidas é rejeitada para não criar confiança falsa no resultado.
            this.validateResult(
                result,
                selectedSources.map((source) => source.materialId),
            );

            const answer = await this.answerModel.create({
                studyAreaId: new Types.ObjectId(studyAreaId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "PRIVATE_AREA_AI_REQUESTED",
                resourceType: "StudyArea",
                resourceId: studyAreaId,
                result: "SUCCESS",
                metadata: {
                    purpose: "PRIVATE_AREA_AI",
                    model: policy.model,
                    sourceCount: selectedSources.length,
                },
            });

            return {
                _id: String(answer._id),
                studyAreaId,
                question: answer.question,
                answer: answer.answer,
                sources: selectedSources.filter((source) =>
                    result.sourceMaterialIds.includes(source.materialId),
                ),
                createdAt: (answer.toObject() as { createdAt?: Date }).createdAt,
            };
        } catch (error) {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "PRIVATE_AREA_AI_REQUESTED",
                resourceType: "StudyArea",
                resourceId: studyAreaId,
                result: "FAILED",
                metadata: {
                    purpose: "PRIVATE_AREA_AI",
                    model: policy.model,
                    sourceCount: limitedSources.length,
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
     * Executa estimate usage units no domínio de IA da área privada, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param prompt Valor de prompt usado pela função para executar estimate usage units com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

    /**
     * Confirma que os dados de IA privada da área de estudo cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido por uma operação externa antes da validação final.
     * @param allowedIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private validateResult(result: PrivateAreaAiResult, allowedIds: string[]): void {
        const allowed = new Set(allowedIds);
        if (
            typeof result.answer !== "string" ||
            !result.answer.trim() ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((sourceId) => !allowed.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_PRIVATE_ANSWER",
                message: "A IA devolveu uma resposta inválida para a área.",
            });
        }
    }
}
