/**
 * Worker isolado e terminável para parsers de documentos não confiáveis.
 */
import { parentPort, workerData } from "node:worker_threads";
import mammoth from "mammoth";

type WorkerInput = {
    type: "PDF" | "DOCX";
    bytes: ArrayBuffer;
};

async function parse(input: WorkerInput): Promise<string> {
    const buffer = Buffer.from(input.bytes);
    if (input.type === "DOCX") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
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

const port = parentPort;
if (!port) {
    throw new Error("Document parser worker sem parentPort.");
}

parse(workerData as WorkerInput)
    .then((text) => port.postMessage({ ok: true, text }))
    .catch(() =>
        port.postMessage({
            ok: false,
            code: "DOCUMENT_PROCESSING_FAILED",
        }),
    );
