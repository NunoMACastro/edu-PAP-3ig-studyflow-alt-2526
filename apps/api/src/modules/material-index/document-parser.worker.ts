/**
 * Worker isolado e terminável para parsers de documentos não confiáveis.
 */
import { parentPort, workerData } from "node:worker_threads";
import { parseDocumentBuffer } from "./document-parser.js";

type WorkerInput = {
    type: "PDF" | "DOCX";
    bytes: ArrayBuffer;
};

const port = parentPort;
if (!port) {
    throw new Error("Document parser worker sem parentPort.");
}

const input = workerData as WorkerInput;
parseDocumentBuffer(input.type, new Uint8Array(input.bytes))
    .then((text) => port.postMessage({ ok: true, text }))
    .catch(() =>
        port.postMessage({
            ok: false,
            code: "DOCUMENT_PROCESSING_FAILED",
        }),
    );
