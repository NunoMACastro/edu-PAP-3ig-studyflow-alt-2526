/**
 * Implementa as regras de negócio de IA com fontes obrigatórias e concentra validações do domínio.
 */
import {
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import {
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "../ai/utils/with-ai-response-budget.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import {
    AiModelPoliciesService,
    assertPromptWithinLimit,
    type ResolvedAiModelPolicy,
} from "../ai-model-policies/ai-model-policies.service.js";
import { AiQuotasService } from "../ai-quotas/ai-quotas.service.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
    type MaterialTextChunk,
} from "../material-index/material-index.service.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerDocument,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { normalizePublicCitation } from "./citation-policy.js";

const SOURCE_GROUNDED_AI_PURPOSE = "SOURCE_GROUNDED_AI";

/**
 * Vista pública de IA com fontes obrigatórias, sem detalhes internos de Mongoose.
 */
export type SourceGroundedAiAnswerView = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: SourceGroundedCitation[];
    createdAt?: Date;
};

/**
 * Serviço de respostas com citações obrigatórias.
 *
 * A resposta é pedida ao provider isolado de IA depois de o backend validar
 * fontes autorizadas. O prompt inclui apenas excertos processáveis e impede
 * conhecimento externo, preservando o contrato anti-alucinação do BK.
 */
@Injectable()
export class SourceGroundedAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA com fontes obrigatórias.
     * @param materialIndexService Service injetado para reutilizar regras de indexação textual de materiais sem duplicar validações.
     * @param aiConsentsService Service injetado para aplicar consentimento antes de chamar IA externa.
     * @param aiModelPoliciesService Service injetado para aplicar política administrativa por finalidade.
     * @param aiQuotasService Service injetado para reservar quota antes de consumir IA.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     */
    constructor(
        @InjectModel(SourceGroundedAiAnswer.name)
        private readonly answerModel: Model<SourceGroundedAiAnswerDocument>,
        private readonly materialIndexService: MaterialIndexService,
        private readonly aiConsentsService: AiConsentsService,
        private readonly aiModelPoliciesService: AiModelPoliciesService,
        private readonly aiQuotasService: AiQuotasService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    /**
     * Responde com base exclusiva nos jobs de indexação autorizados.
     *
     * @param actor Utilizador autenticado.
     * @param input Pergunta e jobs alvo.
     * @returns Resposta persistida com citações.
     * @throws UnprocessableEntityException quando não há fontes citáveis.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        input: AskSourceGroundedAiDto,
    ): Promise<SourceGroundedAiAnswerView> {
        // Cada job é autorizado individualmente porque a lista pode misturar materiais privados e oficiais.
        const jobs = await Promise.all(
            input.sourceJobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const citations = jobs.flatMap((job) =>
            this.selectChunks(job, input.question).map((chunk) =>
                this.toCitation(job, chunk),
            ),
        );

        if (citations.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INDEXED_SOURCES",
                message: "Os materiais ainda não têm fontes processáveis para citar.",
            });
        }

        await this.aiConsentsService.assertGranted(
            actor.id,
            SOURCE_GROUNDED_AI_PURPOSE,
        );
        const policy = await this.aiModelPoliciesService.resolveForUse(
            SOURCE_GROUNDED_AI_PURPOSE,
        );
        const limitedCitations = citations.slice(0, policy.maxSourceCount);
        const prompt = this.buildPrompt(input.question, limitedCitations);
        assertPromptWithinLimit(prompt, policy);
        await this.aiQuotasService.reserveUsage({
            scope: "USER",
            targetId: actor.id,
            purpose: SOURCE_GROUNDED_AI_PURPOSE,
            units: this.estimateUsageUnits(prompt),
        });

        const answer = await this.generateAnswer(prompt, policy);

        // Persistir as citações junto da resposta permite auditoria posterior do output da IA.
        const document = await this.answerModel.create({
            actorId: new Types.ObjectId(actor.id),
            sourceJobIds: input.sourceJobIds.map((jobId) => new Types.ObjectId(jobId)),
            question: input.question.trim(),
            answer,
            citations: limitedCitations,
        });
        const created = document.toObject() as { createdAt?: Date };
        return {
            _id: String(document._id),
            sourceJobIds: input.sourceJobIds,
            question: document.question,
            answer: document.answer,
            citations: document.citations,
            createdAt: created.createdAt,
        };
    }

    /**
     * Escolhe os chunks mais relevantes por correspondência textual simples.
     *
     * @param job Job autorizado e concluído.
     * @param question Pergunta do utilizador.
     * @returns Até três chunks para citar.
     */
    private selectChunks(
        job: MaterialIndexJobView,
        question: string,
    ): MaterialTextChunk[] {
        // A seleção lexical é simples de propósito: é explicável para alunos e não introduz recuperação externa.
        const terms = question
            .toLowerCase()
            .split(/\W+/)
            .filter((term) => term.length >= 4);
        const scored = job.extractedTextChunks.map((chunk) => ({
            chunk,
            score: terms.reduce(
                (total, term) =>
                    total + (chunk.text.toLowerCase().includes(term) ? 1 : 0),
                0,
            ),
        }));

        const matches = scored
            .filter((item) => item.score > 0)
            .sort((left, right) => right.score - left.score)
            .map((item) => item.chunk);

        return (matches.length > 0 ? matches : job.extractedTextChunks).slice(0, 3);
    }

    /**
     * Converte um chunk interno numa citação pública.
     *
     * @param job Job autorizado.
     * @param chunk Chunk indexado.
     * @returns Citação com origem legível e excerto limitado.
     */
    private toCitation(
        job: MaterialIndexJobView,
        chunk: MaterialTextChunk,
    ): SourceGroundedCitation {
        // A autorizacao ja aconteceu em findReadableDoneJob(...); aqui so normalizamos a parte publica.
        return normalizePublicCitation({
            sourceJobId: job._id,
            materialId: job.materialId,
            sourceLabel: chunk.sourceLabel,
            locator: chunk.locator,
            excerpt: chunk.text,
        });
    }

    /**
     * Constrói o prompt final com fontes já autorizadas e limitadas por política.
     *
     * @param question Pergunta original.
     * @param citations Citações autorizadas.
     * @returns Prompt final a validar antes da reserva de quota e chamada externa.
     */
    private buildPrompt(
        question: string,
        citations: SourceGroundedCitation[],
    ): string {
        return [
            "Responde em português de Portugal e só usa factos suportados pelas fontes.",
            "Não acrescentes conhecimento externo nem conteúdo não citado.",
            "Pergunta:",
            question.trim(),
            "Fontes autorizadas:",
            citations
                .map(
                    (citation, index) =>
                        `Fonte ${index + 1} (${citation.sourceJobId}, ${citation.locator}): ${citation.excerpt}`,
                )
                .join("\n"),
            "Devolve JSON com a chave answer.",
        ].join("\n");
    }

    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

    /**
     * Chama o provider IA com um prompt limitado aos excertos citados e governado por política.
     *
     * @param prompt Prompt final já validado por consentimento, política e quota.
     * @param policy Política efetiva resolvida para a finalidade SOURCE_GROUNDED_AI.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        prompt: string,
        policy: ResolvedAiModelPolicy,
    ): Promise<string> {
        let providerResult: Record<string, unknown>;
        try {
            const budgetMs = resolveAiBudgetMs(policy.timeoutMs);
            // Mesmo usando IA, o backend mantém a regra de só responder com excertos citados.
            providerResult = await withAiResponseBudget(
                this.aiProvider.generateStudyTool({
                    prompt,
                    type: "EXPLANATION",
                    options: { model: policy.model, timeoutMs: budgetMs },
                }),
                budgetMs,
            );
        } catch (error) {
            if (error instanceof GatewayTimeoutException) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }

        const answer = providerResult.answer;
        if (typeof answer !== "string" || answer.trim().length === 0) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_RESPONSE",
                message: "A IA devolveu uma resposta inválida.",
            });
        }

        return answer.trim();
    }
}
