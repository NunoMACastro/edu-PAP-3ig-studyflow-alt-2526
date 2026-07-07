/**
 * Identifica erros de chave única lançados pelo MongoDB/Mongoose.
 *
 * @param error Erro desconhecido vindo da operação de persistência.
 * @returns `true` quando o erro corresponde a duplicate key.
 */
export function isMongoDuplicateKeyError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const mongoError = error as { code?: number | string };
    return mongoError.code === 11000 || mongoError.code === "11000";
}
