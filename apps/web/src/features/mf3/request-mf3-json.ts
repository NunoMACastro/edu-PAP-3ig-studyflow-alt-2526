/**
 * Executa pedidos JSON dos painéis MF3 mantendo cookies HttpOnly.
 *
 * @param path Caminho relativo da API.
 * @param options Opções fetch.
 * @returns JSON parseado.
 */
export async function requestMf3Json<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    // O header CSRF acompanha cookies HttpOnly sem expor tokens ao JavaScript da aplicação.
    headers.set("x-studyflow-csrf", "1");

    const response = await fetch(path, {
        ...options,
        // Cookies de sessão continuam protegidos pelo browser e seguem apenas com pedidos same-origin.
        credentials: "include",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Ocorreu um erro inesperado.",
        }));
        throw new Error(error.message ?? "Ocorreu um erro inesperado.");
    }

    return response.json() as Promise<T>;
}
