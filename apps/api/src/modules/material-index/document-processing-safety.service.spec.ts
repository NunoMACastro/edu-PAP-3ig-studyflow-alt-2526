/**
 * Testa a sandbox aplicacional de processamento de documentos.
 */
import {
    DocumentWorkerPort,
    DocumentProcessingSafetyService,
    DOCUMENT_PROCESSING_RESOURCE_LIMITS,
    DOCUMENT_PROCESSING_TIMEOUT_MS,
} from "./document-processing-safety.service.js";
import type { WorkerOptions } from "node:worker_threads";
import { MAX_UPLOAD_BYTES } from "../materials/validators/material-upload.validator.js";
import { EventEmitter } from "node:events";

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

    it("termina realmente o worker quando o parsing excede timeout", async () => {
        const worker = new FakeWorker();

        await expect(
            service.parseDocument(
                {
                    type: "PDF",
                    buffer: Buffer.from("pdf preso"),
                    label: "ficheiro preso",
                    timeoutMs: 1,
                },
                () => worker,
            ),
        ).rejects.toThrow("demorou demasiado");

        expect(worker.terminate).toHaveBeenCalledTimes(1);
    });

    it("aplica limites explícitos de heap, código e stack ao worker", async () => {
        const worker = new FakeWorker();
        let receivedOptions: WorkerOptions | undefined;
        const parsing = service.parseDocument(
            {
                type: "DOCX",
                buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
                label: "ficha limitada",
            },
            (_url, options) => {
                receivedOptions = options;
                return worker;
            },
        );

        await Promise.resolve();
        worker.emit("message", { ok: true, text: "Texto seguro" });

        await expect(parsing).resolves.toBe("Texto seguro");
        expect(receivedOptions?.resourceLimits).toEqual(
            DOCUMENT_PROCESSING_RESOURCE_LIMITS,
        );
        expect(receivedOptions?.resourceLimits).toEqual({
            maxOldGenerationSizeMb: 128,
            maxYoungGenerationSizeMb: 32,
            codeRangeSizeMb: 16,
            stackSizeMb: 4,
        });
    });

    it("limita parsing concorrente a dois workers", async () => {
        const workers: FakeWorker[] = [];
        const factory = () => {
            const worker = new FakeWorker();
            workers.push(worker);
            return worker;
        };

        const jobs = ["a", "b", "c"].map((label) =>
            service.parseDocument(
                {
                    type: "DOCX",
                    buffer: Buffer.from(label),
                    label,
                    timeoutMs: 1_000,
                },
                factory,
            ),
        );
        await Promise.resolve();
        expect(workers).toHaveLength(2);

        workers[0].emit("message", { ok: true, text: "A" });
        workers[1].emit("message", { ok: true, text: "B" });
        await expect(Promise.all(jobs.slice(0, 2))).resolves.toEqual(["A", "B"]);
        expect(workers).toHaveLength(3);
        workers[2].emit("message", { ok: true, text: "C" });

        await expect(Promise.all(jobs)).resolves.toEqual(["A", "B", "C"]);
    });
});

class FakeWorker extends EventEmitter implements DocumentWorkerPort {
    terminate = jest.fn(async () => 1);
}
