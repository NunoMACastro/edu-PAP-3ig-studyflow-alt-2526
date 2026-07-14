/**
 * Aplica limites de segurança e isolamento a parsers PDF/DOCX.
 */
import {
    BadRequestException,
    Injectable,
    PayloadTooLargeException,
    RequestTimeoutException,
} from "@nestjs/common";
import { Worker, type WorkerOptions } from "node:worker_threads";
import { dirname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import {
    ALLOWED_MIME_TYPES,
    MAX_UPLOAD_BYTES,
} from "../materials/validators/material-upload.validator.js";

export const DOCUMENT_PROCESSING_TIMEOUT_MS = 5_000;
export const DOCUMENT_PROCESSING_CONCURRENCY = 2;
export const DOCUMENT_PROCESSING_RESOURCE_LIMITS: NonNullable<
    WorkerOptions["resourceLimits"]
> = {
    maxOldGenerationSizeMb: 128,
    maxYoungGenerationSizeMb: 32,
    codeRangeSizeMb: 16,
    stackSizeMb: 4,
};

export type SafeStoredDocumentInput = {
    type: "PDF" | "DOCX";
    mimeType?: string;
    byteLength: number;
    declaredSizeBytes?: number;
    title: string;
};

export type TimedDocumentProcessingInput<T> = {
    label: string;
    operation: () => Promise<T>;
    timeoutMs?: number;
};

export type WorkerDocumentProcessingInput = {
    type: "PDF" | "DOCX";
    buffer: Buffer;
    label: string;
    timeoutMs?: number;
};

export type DocumentWorkerPort = {
    once(event: "message", listener: (message: unknown) => void): unknown;
    once(event: "error", listener: (error: Error) => void): unknown;
    once(event: "exit", listener: (code: number) => void): unknown;
    removeAllListeners(): unknown;
    terminate(): Promise<number>;
};

export type DocumentWorkerFactory = (
    url: URL,
    options: WorkerOptions,
) => DocumentWorkerPort;

type WorkerResult =
    | { ok: true; text: string }
    | { ok: false; code: string };

const MIME_BY_TYPE = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

/**
 * O semáforo limita CPU/memória a dois parsers. O timeout termina efetivamente
 * o worker, ao contrário de `Promise.race`, que deixava o parser a correr.
 */
@Injectable()
export class DocumentProcessingSafetyService {
    private activeWorkers = 0;
    private readonly waiters: Array<() => void> = [];

    assertSafeStoredDocument(input: SafeStoredDocumentInput): void {
        const expectedMimeType = MIME_BY_TYPE[input.type];
        if (!ALLOWED_MIME_TYPES.includes(expectedMimeType)) {
            throw new BadRequestException({
                code: "UNSUPPORTED_DOCUMENT_TYPE",
                message: "Tipo de documento não suportado.",
            });
        }
        if (input.mimeType && input.mimeType !== expectedMimeType) {
            throw new BadRequestException({
                code: "DOCUMENT_MIME_MISMATCH",
                message: "O documento não corresponde ao tipo esperado.",
            });
        }
        if (input.byteLength <= 0) {
            throw new BadRequestException({
                code: "DOCUMENT_EMPTY",
                message: "O documento não tem conteúdo processável.",
            });
        }
        if (
            input.byteLength > MAX_UPLOAD_BYTES ||
            (input.declaredSizeBytes ?? input.byteLength) > MAX_UPLOAD_BYTES
        ) {
            throw new PayloadTooLargeException({
                code: "DOCUMENT_TOO_LARGE",
                message: "O documento excede o tamanho máximo permitido.",
            });
        }
    }

    /**
     * Executa parsing num worker terminável. A factory opcional existe apenas para
     * testes focados, sem alterar a injeção Nest do runtime.
     */
    async parseDocument(
        input: WorkerDocumentProcessingInput,
        workerFactory: DocumentWorkerFactory = (url, options) =>
            new Worker(url, options),
    ): Promise<string> {
        await this.acquireSlot();
        try {
            return await this.runWorker(input, workerFactory);
        } finally {
            this.releaseSlot();
        }
    }

    /**
     * Mantém o contrato antigo apenas para operações assíncronas canceláveis pelo
     * próprio chamador. Parsers de documentos já não usam este método.
     */
    async runWithTimeout<T>(input: TimedDocumentProcessingInput<T>): Promise<T> {
        let timer: NodeJS.Timeout | undefined;
        const timeoutMs = input.timeoutMs ?? DOCUMENT_PROCESSING_TIMEOUT_MS;
        const timeout = new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => {
                reject(this.timeoutError());
            }, timeoutMs);
        });
        try {
            return await Promise.race([input.operation(), timeout]);
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    private runWorker(
        input: WorkerDocumentProcessingInput,
        workerFactory: DocumentWorkerFactory,
    ): Promise<string> {
        // A cópia produz um ArrayBuffer transferível inequívoco. Um Buffer pode
        // estar apoiado por SharedArrayBuffer, que worker_threads não aceita na
        // transferList e que o TypeScript corretamente não deixa assumir.
        const bytes = new ArrayBuffer(input.buffer.byteLength);
        new Uint8Array(bytes).set(input.buffer);
        const worker = workerFactory(
            this.resolveWorkerUrl(),
            {
                workerData: { type: input.type, bytes },
                transferList: [bytes],
                // O limite do upload continua a ser 10 MiB, mas parsers podem
                // expandir estruturas comprimidas. Estes caps limitam o heap,
                // código JIT e stack de cada worker descartável.
                resourceLimits: { ...DOCUMENT_PROCESSING_RESOURCE_LIMITS },
            },
        );
        const timeoutMs = input.timeoutMs ?? DOCUMENT_PROCESSING_TIMEOUT_MS;

        return new Promise<string>((resolve, reject) => {
            let settled = false;
            const finish = (
                callback: () => void,
                terminateWorker = true,
            ) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                worker.removeAllListeners();
                if (!terminateWorker) {
                    callback();
                    return;
                }
                // O worker é descartável por documento. Terminá-lo também no
                // sucesso impede handles/listeners residuais entre jobs e testes.
                void worker.terminate().then(callback, callback);
            };
            const timer = setTimeout(() => {
                finish(() => reject(this.timeoutError()));
            }, timeoutMs);

            worker.once("message", (message) => {
                finish(() => {
                    const result = message as WorkerResult;
                    if (result?.ok === true && typeof result.text === "string") {
                        resolve(result.text);
                        return;
                    }
                    reject(
                        new BadRequestException({
                            code: "DOCUMENT_PROCESSING_FAILED",
                            message: "Não foi possível processar o documento.",
                        }),
                    );
                });
            });
            worker.once("error", () => {
                finish(
                    () => reject(
                        new BadRequestException({
                            code: "DOCUMENT_PROCESSING_FAILED",
                            message: "Não foi possível processar o documento.",
                        }),
                    ),
                    false,
                );
            });
            worker.once("exit", (code) => {
                if (code === 0 || settled) return;
                finish(
                    () => reject(
                        new BadRequestException({
                            code: "DOCUMENT_PROCESSING_FAILED",
                            message: "Não foi possível processar o documento.",
                        }),
                    ),
                    false,
                );
            });
        });
    }

    /**
     * Resolve o worker compilado sem `import.meta`, mantendo compatibilidade com
     * o transform ESM do ts-jest. Em runtime parte do entrypoint em `dist/`, pelo
     * que também funciona quando a API é iniciada fora do seu diretório de projeto.
     */
    private resolveWorkerUrl(): URL {
        const entryPoint = resolve(process.argv[1] ?? "dist/main.js");
        const distMarker = `${sep}dist${sep}`;
        const distPosition = entryPoint.lastIndexOf(distMarker);
        const distRoot =
            distPosition >= 0
                ? join(entryPoint.slice(0, distPosition), "dist")
                : resolve(process.cwd(), "dist");

        return pathToFileURL(
            join(dirname(join(distRoot, "main.js")), "modules/material-index/document-parser.worker.js"),
        );
    }

    private timeoutError(): RequestTimeoutException {
        return new RequestTimeoutException({
            code: "DOCUMENT_PROCESSING_TIMEOUT",
            message: "O documento demorou demasiado a processar.",
        });
    }

    private async acquireSlot(): Promise<void> {
        if (this.activeWorkers < DOCUMENT_PROCESSING_CONCURRENCY) {
            this.activeWorkers += 1;
            return;
        }
        await new Promise<void>((resolve) => this.waiters.push(resolve));
        this.activeWorkers += 1;
    }

    private releaseSlot(): void {
        this.activeWorkers -= 1;
        this.waiters.shift()?.();
    }
}
