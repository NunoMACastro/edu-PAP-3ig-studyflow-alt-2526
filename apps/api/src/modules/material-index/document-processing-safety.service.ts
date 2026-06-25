// apps/api/src/modules/material-index/document-processing-safety.service.ts
/**
 * Aplica limites de segurança antes de processar PDF/DOCX com parsers externos.
 */
import {
    BadRequestException,
    Injectable,
    PayloadTooLargeException,
    RequestTimeoutException,
} from "@nestjs/common";
import {
    ALLOWED_MIME_TYPES,
    MAX_UPLOAD_BYTES,
} from "../materials/validators/material-upload.validator.js";

export const DOCUMENT_PROCESSING_TIMEOUT_MS = 5_000;

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

const MIME_BY_TYPE = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

/**
 * Centraliza a sandbox aplicacional de documentos usados pela indexação textual.
 */
@Injectable()
export class DocumentProcessingSafetyService {
    /**
     * Rejeita documentos incoerentes antes de qualquer parser externo ler bytes.
     *
     * @param input Metadados e tamanho do documento já carregado pelo backend.
     */
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
     * Executa o parser com limite temporal para impedir pedidos presos.
     *
     * @param input Operação de parsing e limite temporal opcional.
     * @returns Resultado produzido pelo parser antes do timeout.
     */
    async runWithTimeout<T>(input: TimedDocumentProcessingInput<T>): Promise<T> {
        let timer: NodeJS.Timeout | undefined;
        const timeoutMs = input.timeoutMs ?? DOCUMENT_PROCESSING_TIMEOUT_MS;
        const timeout = new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => {
                reject(
                    new RequestTimeoutException({
                        code: "DOCUMENT_PROCESSING_TIMEOUT",
                        message: "O documento demorou demasiado a processar.",
                    }),
                );
            }, timeoutMs);
        });

        try {
            return await Promise.race([input.operation(), timeout]);
        } finally {
            if (timer) clearTimeout(timer);
        }
    }
}