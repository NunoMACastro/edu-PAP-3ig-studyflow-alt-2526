/**
 * Constrói Content-Disposition sem refletir caracteres perigosos no header.
 */

export type ContentDispositionKind = "inline" | "attachment";

/**
 * Produz fallback ASCII e filename UTF-8 segundo RFC 5987.
 *
 * @param kind Modo de apresentação permitido pelo endpoint.
 * @param originalName Nome persistido apenas como metadado não confiável.
 * @returns Header seguro e compatível com nomes portugueses.
 */
export function buildSafeContentDisposition(
    kind: ContentDispositionKind,
    originalName: string,
): string {
    const normalized = originalName.normalize("NFC").trim();
    const asciiFallback = normalized
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "")
        .replace(/[^A-Za-z0-9._ -]/gu, "_")
        .replace(/\s+/gu, " ")
        .slice(0, 180) || "material";
    const encoded = encodeURIComponent(normalized).replace(/[!'()*]/gu, (value) =>
        `%${value.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    return `${kind}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
