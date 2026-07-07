/**
 * Implementa as regras de negócio de private área ai e concentra validações do domínio.
 */
import {
    ForbiddenException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider, PrivateAreaAiResult } from "../ai/providers/ai-provider.js";
import {
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "../ai/utils/with-ai-response-budget.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
} from "../ai-model-policies/ai-model-policies.service.js";
import { AiQuotasService } from "../ai-quotas/ai-quotas.service.js";
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
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param studyAreasService Service injetado para reutilizar regras de áreas de estudo sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param aiConsentsService Service injetado para aplicar consentimento antes de chamar IA externa.
     * @param aiModelPoliciesService Service injetado para aplicar política administrativa por finalidade.
     * @param aiQuotasService Service injetado para reservar quota antes de consumir IA.
     * @param auditLogService Service injetado para registar uso IA sem prompts ou respostas completas.
     */
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answerModel: Model<PrivateAreaAiAnswerDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        private readonly aiConsentsService: AiConsentsService,
        private readonly aiModelPoliciesService: AiModelPoliciesService,
        private readonly aiQuotasService: AiQuotasService,
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

        await this.aiConsentsService.assertGranted(actor.id, "PRIVATE_AREA_AI");
        const policy = await this.aiModelPoliciesService.resolveForUse("PRIVATE_AREA_AI");
        const limitedSources = sources.slice(0, policy.maxSourceCount);
        const prompt = buildPrivateAreaAiPrompt({
            areaName: area.name,
            question: input.question.trim(),
            sources: limitedSources,
        });
        assertPromptWithinLimit(prompt, policy);
        await this.aiQuotasService.reserveUsage({
            scope: "USER",
            targetId: actor.id,
            purpose: "PRIVATE_AREA_AI",
            units: this.estimateUsageUnits(prompt),
        });

        try {
            const budgetMs = resolveAiBudgetMs(policy.timeoutMs);
            // O provider só recebe fontes já filtradas para o dono da área de estudo.
            const result = await withAiResponseBudget(
                this.aiProvider.generatePrivateAreaAnswer({
                    prompt,
                    options: { model: policy.model, timeoutMs: budgetMs },
                }),
                budgetMs,
            );
            // Uma resposta sem fontes válidas é rejeitada para não criar confiança falsa no resultado.
            this.validateResult(result, limitedSources.map((source) => source.materialId));

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
                    sourceCount: limitedSources.length,
                },
            });

            return {
                _id: String(answer._id),
                studyAreaId,
                question: answer.question,
                answer: answer.answer,
                sources: limitedSources.filter((source) =>
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
            if (
                error instanceof GatewayTimeoutException ||
                error instanceof ServiceUnavailableException ||
                error instanceof UnprocessableEntityException
            ) {
                throw error;
            }
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
