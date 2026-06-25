/**
 * Implementa as regras de negócio de IA com fontes obrigatórias e concentra validações do domínio.
 */
import {
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
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { MaterialTextChunk } from "../material-index/schemas/material-index-job.schema.js";
import { AskSourceGroundedAiDto } from "./dto/ask-source-grounded-ai.dto.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerDocument,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";

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
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     */
    constructor(
        @InjectModel(SourceGroundedAiAnswer.name)
        private readonly answerModel: Model<SourceGroundedAiAnswerDocument>,
        private readonly materialIndexService: MaterialIndexService,
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

        const answer = await this.generateAnswer(input.question, citations);

        // Persistir as citações junto da resposta permite auditoria posterior do output da IA.
        const document = await this.answerModel.create({
            actorId: new Types.ObjectId(actor.id),
            sourceJobIds: input.sourceJobIds.map((jobId) => new Types.ObjectId(jobId)),
            question: input.question.trim(),
            answer,
            citations,
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
        // A seleção lexical é simples de propósito: é explicável para alunos e não introduz pesquisa externa.
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
     * @returns Citação com excerto limitado.
     */
    private toCitation(
        job: MaterialIndexJobView,
        chunk: MaterialTextChunk,
    ): SourceGroundedCitation {
        return {
            sourceJobId: job._id,
            materialId: job.materialId,
            sourceLabel: chunk.sourceLabel,
            locator: chunk.locator,
            excerpt: chunk.text.trim().slice(0, 420),
        };
    }

    /**
     * Chama o provider IA com um prompt limitado aos excertos citados.
     *
     * @param question Pergunta original.
     * @param citations Citações autorizadas.
     * @returns Resposta validada.
     */
    private async generateAnswer(
        question: string,
        citations: SourceGroundedCitation[],
    ): Promise<string> {
        const prompt = [
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

        let providerResult: Record<string, unknown>;
        try {
            // Mesmo usando IA, o backend mantém a regra de só responder com excertos citados.
            providerResult = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
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