/**
 * Implementa as regras de negócio de IA com fontes obrigatórias e concentra validações do domínio.
 */
import {
    HttpException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
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
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     */
    constructor(
        @InjectModel(SourceGroundedAiAnswer.name)
        private readonly answerModel: Model<SourceGroundedAiAnswerDocument>,
        private readonly materialIndexService: MaterialIndexService,
        private readonly aiExecution: GovernedAiExecutionService,
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
            this.selectChunks(job, input.question)
                .map((chunk) => this.toCitationOrNull(job, chunk))
                .filter((citation): citation is SourceGroundedCitation => citation !== null),
        );

        if (citations.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_INDEXED_SOURCES",
                message: "Os materiais ainda não têm fontes processáveis para citar.",
            });
        }

        const authorization = await this.aiExecution.authorize(
            actor.id,
            SOURCE_GROUNDED_AI_PURPOSE,
        );
        const policy = authorization.policy;
        const limitedCitations = citations.slice(0, policy.maxSourceCount);
        let execution;
        try {
            execution = await this.aiExecution.executeAuthorized(
                authorization,
                {
                    quota: {
                        scope: "USER",
                        targetId: actor.id,
                        units: (prompt) => this.estimateUsageUnits(prompt),
                    },
                    sources: limitedCitations,
                    guardrailText: input.question,
                    buildPrompt: (selectedCitations) =>
                        this.buildPrompt(
                            input.question,
                            [...selectedCitations],
                        ),
                    invoke: ({ provider, prompt, options }) =>
                        provider.generateStudyTool({
                            prompt,
                            type: "EXPLANATION",
                            options,
                        }),
                    validateResult: (result) => {
                        if (
                            typeof result.answer !== "string" ||
                            result.answer.trim().length === 0
                        ) {
                            throw new ServiceUnavailableException({
                                code: "AI_PROVIDER_INVALID_RESPONSE",
                                message: "A IA devolveu uma resposta inválida.",
                            });
                        }
                    },
                },
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
        const answerValue = execution.result.answer;
        if (typeof answerValue !== "string" || answerValue.trim().length === 0) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_RESPONSE",
                message: "A IA devolveu uma resposta inválida.",
            });
        }
        const answer = answerValue.trim();
        const selectedCitations = [...execution.sources];

        // Persistir as citações junto da resposta permite auditoria posterior do output da IA.
        const document = await this.answerModel.create({
            actorId: new Types.ObjectId(actor.id),
            sourceJobIds: input.sourceJobIds.map((jobId) => new Types.ObjectId(jobId)),
            question: input.question.trim(),
            answer,
            citations: selectedCitations,
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
    private toCitationOrNull(
        job: MaterialIndexJobView,
        chunk: MaterialTextChunk,
    ): SourceGroundedCitation | null {
        // A autorizacao ja aconteceu em findReadableDoneJob(...); aqui so normalizamos a parte publica.
        try {
            return normalizePublicCitation({
                sourceJobId: job._id,
                materialId: job.materialId,
                sourceLabel: chunk.sourceLabel,
                locator: chunk.locator,
                excerpt: chunk.text,
            });
        } catch {
            // Um chunk sem campos publicos verificaveis nao pode sustentar uma resposta factual.
            return null;
        }
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

    /**
     * Executa estimate usage units no domínio de IA apoiada em fontes autorizadas, aplicando validações, autorização e persistência de forma coesa.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param prompt Valor de prompt usado pela função para executar estimate usage units com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

}
