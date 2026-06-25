// apps/api/src/modules/material-index/document-processing-safety.service.spec.ts
import {
    DocumentProcessingSafetyService,
    DOCUMENT_PROCESSING_TIMEOUT_MS,
} from "./document-processing-safety.service.js";
import { MAX_UPLOAD_BYTES } from "../materials/validators/material-upload.validator.js";

describe("DocumentProcessingSafetyService", () => {
    let service: DocumentProcessingSafetyService;

    beforeEach(() => {
        service = new DocumentProcessingSafetyService();
    });

    it("aceita PDF dentro do limite com MIME coerente", () => {
        // O caminho feliz prova que a proteção não bloqueia documentos válidos da StudyFlow.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: 1024,
                declaredSizeBytes: 1024,
                title: "Resumo de biologia",
            }),
        ).not.toThrow();
    });

    it("bloqueia documentos maiores do que o limite de upload", () => {
        // Este negativo impede que um ficheiro pesado chegue ao parser e consuma recursos da API.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: MAX_UPLOAD_BYTES + 1,
                declaredSizeBytes: MAX_UPLOAD_BYTES + 1,
                title: "Documento demasiado grande",
            }),
        ).toThrow("tamanho máximo");
    });

    it("bloqueia MIME incompatível com o tipo do material", () => {
        // MIME incoerente é bloqueado para evitar que a extensão esconda conteúdo de outro formato.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "DOCX",
                mimeType: "application/pdf",
                byteLength: 1024,
                declaredSizeBytes: 1024,
                title: "Documento incoerente",
            }),
        ).toThrow("tipo esperado");
    });

    it("bloqueia parser que demora mais do que o timeout", async () => {
        // O timeout transforma parser preso em erro controlado, sem bloquear a fila de indexação.
        await expect(
            service.runWithTimeout({
                label: "Documento preso",
                timeoutMs: 5,
                operation: () =>
                    new Promise<string>((resolve) => {
                        setTimeout(
                            () => resolve("texto tardio"),
                            DOCUMENT_PROCESSING_TIMEOUT_MS,
                        );
                    }),
            }),
        ).rejects.toThrow("demorou demasiado");
    });
});