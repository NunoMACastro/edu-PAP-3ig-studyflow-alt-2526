/**
 * Implementa a funcionalidade frontend de pesquisa unificada e o respetivo contrato com a API.
 */
import { requestMf3Json } from "../mf3/request-mf3-json.js";

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
 * Pesquisa em jobs de indexação autorizados.
 *
 * @param input Query e jobs.
 * @returns Resultados com origem.
 */
export function runUnifiedSearch(input: {
    query: string;
    jobIds: string[];
}): Promise<UnifiedSearchResponse> {
    return requestMf3Json<UnifiedSearchResponse>("/api/search", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
