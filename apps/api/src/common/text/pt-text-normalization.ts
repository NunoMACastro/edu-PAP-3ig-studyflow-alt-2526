export type NormalizedPortugueseText = {
    text: string;
    hasReadableContent: boolean;
};

const READABLE_PORTUGUESE_TEXT_PATTERN = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]/;
const REPLACEMENT_CHARACTER_PATTERN = /\uFFFD/;

/**
 * Normaliza texto importado sem remover acentos, cedilhas ou quebras de parágrafo úteis.
 *
 * @param value Texto extraído de formulário, URL, PDF, DOCX ou material oficial.
 * @returns Texto em NFC e indicação de conteúdo legível.
 */
export function normalizePortugueseStudyText(
    value: string,
): NormalizedPortugueseText {
    const text = value
        .normalize("NFC")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // O backend rejeita texto vazio ou partido antes de o marcar como fonte para IA.
    const hasReadableContent =
        READABLE_PORTUGUESE_TEXT_PATTERN.test(text) &&
        !REPLACEMENT_CHARACTER_PATTERN.test(text);

    return { text, hasReadableContent };
}
