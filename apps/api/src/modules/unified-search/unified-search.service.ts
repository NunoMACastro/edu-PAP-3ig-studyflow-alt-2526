/**
 * Implementa as regras de negócio de pesquisa unificada e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
    type MaterialTextChunk,
} from "../material-index/material-index.service.js";
import { UnifiedSearchDto } from "./dto/unified-search.dto.js";
import {
    UnifiedSearchLog,
    UnifiedSearchLogDocument,
} from "./schemas/unified-search-log.schema.js";

/**
 * Resultado calculado em pesquisa unificada depois de validação do backend.
 */
export type UnifiedSearchResult = {
    jobId: string;
    materialId: string;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};

/**
 * Resposta tipada de pesquisa unificada devolvida pela API ou por um helper frontend.
 */
export type UnifiedSearchResponse = {
    query: string;
    results: UnifiedSearchResult[];
};

/**
 * Serviço de pesquisa unificada sobre fontes já autorizadas.
 */
@Injectable()
export class UnifiedSearchService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param logModel Modelo Mongoose injetado para ler e persistir pesquisa unificada.
     * @param materialIndexService Service injetado para reutilizar regras de indexação textual de materiais sem duplicar validações.
     */
    constructor(
        @InjectModel(UnifiedSearchLog.name)
        private readonly logModel: Model<UnifiedSearchLogDocument>,
        private readonly materialIndexService: MaterialIndexService,
    ) {}

    /**
     * Pesquisa em chunks autorizados e devolve origem de cada resultado.
     *
     * @param actor Utilizador autenticado.
     * @param input Query e jobs alvo.
     * @returns Resultados com excertos.
     */
    async search(
        actor: AuthenticatedUser,
        input: UnifiedSearchDto,
    ): Promise<UnifiedSearchResponse> {
        const jobs = await Promise.all(
            input.jobIds.map((jobId) =>
                this.materialIndexService.findReadableDoneJob(actor, jobId),
            ),
        );
        const results = jobs.flatMap((job) => this.searchJob(job, input.query));
        await this.logModel.create({
            actorId: new Types.ObjectId(actor.id),
            query: input.query.trim(),
            jobIds: input.jobIds.map((jobId) => new Types.ObjectId(jobId)),
            resultCount: results.length,
        });
        return { query: input.query.trim(), results };
    }

    /**
     * Pesquisa textual simples num job autorizado.
     *
     * @param job Job validado.
     * @param query Texto pesquisado.
     * @returns Resultados do job.
     */
    private searchJob(
        job: MaterialIndexJobView,
        query: string,
    ): UnifiedSearchResult[] {
        const normalizedQuery = query.trim().toLowerCase();
        return job.extractedTextChunks
            .filter((chunk) => this.matches(chunk, normalizedQuery))
            .slice(0, 10)
            .map((chunk) => ({
                jobId: job._id,
                materialId: job.materialId,
                sourceLabel: chunk.sourceLabel,
                locator: chunk.locator,
                excerpt: this.excerpt(chunk.text, normalizedQuery),
            }));
    }

    /**
     * Valida se um chunk contém a pesquisa ou um dos seus termos úteis.
     *
     * @param chunk Chunk indexado.
     * @param query Pesquisa normalizada.
     * @returns `true` quando há correspondência.
     */
    private matches(chunk: MaterialTextChunk, query: string): boolean {
        const text = chunk.text.toLowerCase();
        if (text.includes(query)) return true;
        return query
            .split(/\W+/)
            .filter((term) => term.length >= 4)
            .some((term) => text.includes(term));
    }

    /**
     * Gera excerto curto em torno da primeira ocorrência encontrada.
     *
     * @param text Texto do chunk.
     * @param query Pesquisa normalizada.
     * @returns Excerto público.
     */
    private excerpt(text: string, query: string): string {
        const lower = text.toLowerCase();
        const index = lower.indexOf(query);
        const start = index >= 0 ? Math.max(0, index - 80) : 0;
        return text.slice(start, start + 360).trim();
    }
}
