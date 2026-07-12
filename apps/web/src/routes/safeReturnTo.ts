/**
 * Valida destinos de regresso para impedir open redirects depois do login.
 */

/**
 * Aceita apenas paths internos autenticados e remove qualquer origem externa.
 *
 * @param value Valor vindo do estado de navegação, nunca de confiança.
 * @returns Path interno normalizado ou `null` quando é inseguro/inadequado.
 */
export function getSafeReturnTo(value: unknown): string | null {
    if (typeof value !== "string" || !value.startsWith("/")) return null;
    try {
        const base = "https://studyflow.local";
        const parsed = new URL(value, base);
        if (
            parsed.origin !== base ||
            (parsed.pathname !== "/app" &&
                !parsed.pathname.startsWith("/app/"))
        ) {
            return null;
        }
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return null;
    }
}
