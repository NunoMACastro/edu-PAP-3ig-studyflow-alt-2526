/**
 * Testa a sandbox aplicacional de processamento de documentos.
 */
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

    it("bloqueia MIME incoerente antes do parser", () => {
        // Esta falha protege contra ficheiros mascarados com tipo declarado errado.
        expect(() =>
            service.assertSafeStoredDocument({
                type: "DOCX",
                mimeType: "application/pdf",
                byteLength: 1024,
                title: "Ficha",
            }),
        ).toThrow("O documento não corresponde");
    });

    it("bloqueia documento acima do limite de upload", () => {
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: MAX_UPLOAD_BYTES + 1,
                title: "Livro grande",
            }),
        ).toThrow("tamanho máximo");
    });

    it("interrompe parser que excede timeout", async () => {
        let blockingTimer: NodeJS.Timeout | undefined;

        try {
            await expect(
                service.runWithTimeout({
                    label: "ficheiro preso",
                    timeoutMs: 1,
                    /**
                     * Executa o apoio de teste para indexação segura de materiais, mantendo o cenário legível e próximo do comportamento real validado.
                     *
                     * @returns Resultado da operação no formato esperado pelo chamador.
                     */
                    operation: () =>
                        new Promise((resolve) => {
                            blockingTimer = setTimeout(
                                resolve,
                                DOCUMENT_PROCESSING_TIMEOUT_MS,
                            );
                        }),
                }),
            ).rejects.toThrow("demorou demasiado");
        } finally {
            if (blockingTimer) clearTimeout(blockingTimer);
        }
    });
});
