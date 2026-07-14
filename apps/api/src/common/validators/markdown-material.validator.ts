/**
 * Valida e canoniza fontes Markdown partilhadas por materiais e salas antes de
 * serem persistidas ou usadas pela IA.
 *
 * A validação usa a mesma gramática GFM do frontend. HTML raw e protocolos
 * perigosos são rejeitados no limite de confiança da API, em vez de dependerem
 * apenas do renderer do browser.
 */
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";

export const MAX_MARKDOWN_UPLOAD_BYTES = 128 * 1024;
export const MAX_MARKDOWN_CHARACTERS = 20_000;
export const MIN_MARKDOWN_VISIBLE_CHARACTERS = 10;
export const MARKDOWN_MIME_TYPE = "text/markdown";
export const MARKDOWN_UPLOAD_MIME_TYPES = [
    "text/markdown",
    "text/x-markdown",
    "text/plain",
    "application/octet-stream",
] as const;

const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
let markdownRuntimePromise: Promise<{
    parse: (source: string) => unknown;
    visit: (tree: unknown, visitor: (node: MarkdownAstNode) => void) => void;
}> | null = null;

type MarkdownAstNode = {
    type: string;
    value?: string;
    url?: string;
};

export type ValidatedMarkdown = {
    markdownSource: string;
    sizeBytes: number;
};

/**
 * Decodifica um upload Markdown com UTF-8 estrito e aplica o contrato textual.
 *
 * @param file Ficheiro multipart já aceite pela validação de metadados.
 * @returns Fonte canónica e tamanho efetivamente persistido.
 */
export async function validateMarkdownUpload(file: Express.Multer.File): Promise<ValidatedMarkdown> {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        throw markdownError("MARKDOWN_EMPTY", "O documento Markdown está vazio.");
    }
    if (file.buffer.byteLength > MAX_MARKDOWN_UPLOAD_BYTES) {
        throw new PayloadTooLargeException({
            code: "MARKDOWN_TOO_LARGE",
            message: "O documento Markdown excede o limite de 128 KiB.",
        });
    }

    let decoded: string;
    try {
        decoded = new TextDecoder("utf-8", { fatal: true }).decode(file.buffer);
    } catch {
        throw markdownError(
            "MARKDOWN_INVALID_UTF8",
            "O documento Markdown deve usar codificação UTF-8 válida.",
        );
    }
    return validateMarkdownSource(decoded);
}

/**
 * Canoniza e valida uma fonte Markdown recebida por JSON ou upload.
 *
 * @param value Fonte Markdown não confiável.
 * @returns Fonte canónica pronta a persistir.
 */
export async function validateMarkdownSource(value: unknown): Promise<ValidatedMarkdown> {
    if (typeof value !== "string") {
        throw markdownError("MARKDOWN_EMPTY", "Indica conteúdo Markdown válido.");
    }

    let normalized = value.replace(/^\uFEFF/u, "").replace(/\r\n?/gu, "\n").normalize("NFC");
    if (FORBIDDEN_CONTROL_CHARACTERS.test(normalized)) {
        throw markdownError(
            "MARKDOWN_INVALID_UTF8",
            "O documento Markdown contém caracteres de controlo inválidos.",
        );
    }

    const characterCount = Array.from(normalized).length;
    if (characterCount > MAX_MARKDOWN_CHARACTERS) {
        throw new PayloadTooLargeException({
            code: "MARKDOWN_TOO_LARGE",
            message: `O documento Markdown não pode exceder ${MAX_MARKDOWN_CHARACTERS} caracteres.`,
        });
    }

    normalized = normalized.replace(/\n+$/u, "") + "\n";
    const runtime = await markdownRuntime();
    const tree = runtime.parse(normalized);
    const visibleParts: string[] = [];

    runtime.visit(tree, (rawNode) => {
        const node = rawNode as MarkdownAstNode;
        if (node.type === "html") {
            throw markdownError(
                "MARKDOWN_RAW_HTML_NOT_ALLOWED",
                "HTML raw não é permitido em documentos Markdown.",
            );
        }
        if (node.type === "link" && node.url) {
            assertSafeMarkdownUrl(node.url, false);
        }
        if (node.type === "image" && node.url) {
            assertSafeMarkdownUrl(node.url, true);
        }
        if (["text", "code", "inlineCode"].includes(node.type) && node.value) {
            visibleParts.push(node.value);
        }
    });

    const visibleCharacterCount = Array.from(
        visibleParts.join(" ").replace(/\s+/gu, "").trim(),
    ).length;
    if (visibleCharacterCount < MIN_MARKDOWN_VISIBLE_CHARACTERS) {
        throw markdownError(
            "MARKDOWN_EMPTY",
            `O documento Markdown deve ter pelo menos ${MIN_MARKDOWN_VISIBLE_CHARACTERS} caracteres visíveis.`,
        );
    }

    const sizeBytes = Buffer.byteLength(normalized, "utf8");
    if (sizeBytes > MAX_MARKDOWN_UPLOAD_BYTES) {
        throw new PayloadTooLargeException({
            code: "MARKDOWN_TOO_LARGE",
            message: "O documento Markdown excede o limite de 128 KiB.",
        });
    }
    return { markdownSource: normalized, sizeBytes };
}

/** Carrega o parser ESM apenas nos pedidos Markdown, mantendo Jest compatível. */
async function markdownRuntime(): Promise<{
    parse: (source: string) => unknown;
    visit: (tree: unknown, visitor: (node: MarkdownAstNode) => void) => void;
}> {
    markdownRuntimePromise ??= Promise.all([
        import("unified"),
        import("remark-parse"),
        import("remark-gfm"),
        import("unist-util-visit"),
    ]).then(([unifiedModule, remarkParseModule, remarkGfmModule, visitModule]) => {
        const parser = unifiedModule
            .unified()
            .use(remarkParseModule.default)
            .use(remarkGfmModule.default);
        return {
            parse: (source: string) => parser.parse(source),
            visit: (tree, visitor) => visitModule.visit(tree as never, visitor as never),
        };
    });
    return markdownRuntimePromise;
}

/** Valida URLs de links e imagens sem executar ou resolver o destino. */
function assertSafeMarkdownUrl(value: string, image: boolean): void {
    if (value.startsWith("#")) return;
    if (
        !image &&
        !value.startsWith("//") &&
        !/^[a-z][a-z\d+.-]*:/iu.test(value)
    ) {
        try {
            new URL(value, "https://markdown.local/");
            return;
        } catch {
            throw markdownError(
                "MARKDOWN_UNSAFE_URL",
                "O documento Markdown contém uma ligação inválida ou insegura.",
            );
        }
    }

    let protocol: string;
    try {
        protocol = new URL(value).protocol.toLowerCase();
    } catch {
        throw markdownError(
            "MARKDOWN_UNSAFE_URL",
            "O documento Markdown contém uma ligação inválida ou insegura.",
        );
    }
    const allowed = image ? ["http:", "https:"] : ["http:", "https:", "mailto:"];
    if (!allowed.includes(protocol)) {
        throw markdownError(
            "MARKDOWN_UNSAFE_URL",
            "O documento Markdown contém uma ligação inválida ou insegura.",
        );
    }
}

/** Constrói erros públicos estáveis sem refletir o conteúdo recebido. */
function markdownError(code: string, message: string): BadRequestException {
    return new BadRequestException({ code, message });
}
