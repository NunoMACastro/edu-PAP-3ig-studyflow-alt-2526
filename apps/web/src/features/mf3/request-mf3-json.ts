import { requestJson } from "../../lib/apiClient.js";

/**
 * Alias de compatibilidade para os painéis MF3/MF4.
 *
 * A implementação vive no cliente HTTP canónico para que autenticação expirada,
 * erros de validação e respostas vazias tenham o mesmo comportamento em toda a UI.
 *
 * @param path Caminho relativo da API.
 * @param options Opções fetch.
 * @returns JSON parseado pelo cliente partilhado.
 */
export function requestMf3Json<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    return requestJson<T>(path, options);
}
