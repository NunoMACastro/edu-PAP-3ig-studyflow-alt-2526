/**
 * Concentra a extração de texto de documentos para que o worker de produção
 * e as ferramentas locais de preparação usem exatamente os mesmos parsers.
 */
import mammoth from "mammoth";
import { spawn } from "node:child_process";

export type ParsedDocumentType = "PDF" | "DOCX";

/**
 * Extrai texto normalizado de bytes já validados pelo contrato de upload.
 *
 * @param type Tipo de documento aceite pelo pipeline de materiais.
 * @param bytes Conteúdo integral do documento, nunca vindo de um path livre.
 * @returns Texto sem espaços laterais, pronto para chunking e indexação.
 */
export async function parseDocumentBuffer(
    type: ParsedDocumentType,
    bytes: Uint8Array,
): Promise<string> {
    const buffer = Buffer.from(bytes);
    if (type === "DOCX") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }

    if (process.env.JEST_WORKER_ID) {
        return parsePdfInNodeSubprocess(buffer);
    }
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
        const result = await parser.getText();
        return result.text.trim();
    } finally {
        await parser.destroy();
    }
}

/**
 * Executa o mesmo parser oficial num processo Node normal durante testes Jest.
 * O VM CommonJS do Jest não suporta o import dinâmico do worker ESM do PDF.js;
 * isolar apenas essa limitação permite testar extração real sem mocks.
 */
async function parsePdfInNodeSubprocess(buffer: Buffer): Promise<string> {
    const script = [
        'import { PDFParse } from "pdf-parse";',
        "const chunks = [];",
        "for await (const chunk of process.stdin) chunks.push(chunk);",
        "const parser = new PDFParse({ data: new Uint8Array(Buffer.concat(chunks)) });",
        "try { const result = await parser.getText(); process.stdout.write(result.text.trim()); }",
        "finally { await parser.destroy(); }",
    ].join("\n");
    return new Promise<string>((resolve, reject) => {
        const child = spawn(process.execPath, ["--input-type=module", "-e", script], {
            cwd: process.cwd(),
            stdio: ["pipe", "pipe", "pipe"],
        });
        const output: Buffer[] = [];
        const errors: Buffer[] = [];
        child.stdout.on("data", (chunk: Buffer) => output.push(chunk));
        child.stderr.on("data", (chunk: Buffer) => errors.push(chunk));
        child.once("error", reject);
        child.once("close", (code) => {
            if (code === 0) resolve(Buffer.concat(output).toString("utf8").trim());
            else reject(new Error(
                `Falha na extração PDF isolada (${code ?? "sem código"}): ${Buffer.concat(errors).toString("utf8").trim()}`,
            ));
        });
        child.stdin.end(buffer);
    });
}
