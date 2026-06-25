// ============================================================================
// FICHEIRO 1: apps/api/src/modules/material-index/document-processing-safety.service.ts
// ============================================================================

import {
    BadRequestException,
    Injectable,
    PayloadTooLargeException,
    RequestTimeoutException,
    Module,
} from "@nestjs/common";
import { InjectModel, MongooseModule } from "@nestjs/mongoose";
import { Model } from "mongoose";

// Mocks dos validadores de upload importados do módulo de materiais
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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

// ============================================================================
// FICHEIRO 2: apps/api/src/modules/material-index/material-index.service.ts
// ============================================================================

// Mocks das dependências externas do ecossistema do projeto
class MaterialsService { async readStoredFile(key: string): Promise<Buffer> { return Buffer.from("mock"); } }
class OfficialMaterialsService {}
class SubjectsService {}
const MaterialIndexJob = { name: "MaterialIndexJob" };
type MaterialIndexJobDocument = any;

type IndexablePrivateMaterial = {
    _id: unknown;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    title: string;
    url?: string;
    storageKey?: string;
    contentText?: string;
    mimeType?: string;
    sizeBytes?: number;
};

@Injectable()
export class MaterialIndexService {
    constructor(
        @InjectModel(MaterialIndexJob.name)
        private readonly jobModel: Model<MaterialIndexJobDocument>,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly subjectsService: SubjectsService,
        private readonly documentSafety: DocumentProcessingSafetyService,
    ) {}

    /**
     * Extrai e valida o material privado aplicando os guardrails da sandbox aplicacional.
     */
    private async extractPrivateMaterial(
        userId: string,
        material: IndexablePrivateMaterial,
    ): Promise<{ text?: string; errorMessage?: string }> {
        try {
            if (material.type === "TOPIC") {
                return { text: material.contentText };
            }
            if (material.type === "URL") {
                return { text: await this.fetchTextFromUrl(material.url) };
            }
            if (!material.storageKey) {
                return { errorMessage: "O ficheiro do material não está disponível." };
            }

            // 1. Leitura do buffer de bytes
            const buffer = await this.materialsService.readStoredFile(material.storageKey);

            // 2. Validação preventiva na sandbox aplicacional (RNF18)
            this.documentSafety.assertSafeStoredDocument({
                type: material.type,
                mimeType: material.mimeType,
                byteLength: buffer.byteLength,
                declaredSizeBytes: material.sizeBytes,
                title: material.title,
            });

            // 3. Processamento com timeout estrito
            if (material.type === "PDF") {
                return {
                    text: await this.documentSafety.runWithTimeout({
                        label: material.title,
                        operation: () => this.extractPdfText(buffer),
                    }),
                };
            }
            if (material.type === "DOCX") {
                return {
                    text: await this.documentSafety.runWithTimeout({
                        label: material.title,
                        operation: () => this.extractDocxText(buffer),
                    }),
                };
            }
            return { errorMessage: "Tipo de material privado não suportado." };
        } catch (error: any) {
            return { errorMessage: this.toExtractionError(error) };
        }
    }

    private async fetchTextFromUrl(url?: string): Promise<string> { return ""; }
    private async extractPdfText(buffer: Buffer): Promise<string> { return "Texto PDF"; }
    private async extractDocxText(buffer: Buffer): Promise<string> { return "Texto DOCX"; }
    private toExtractionError(error: any): string {
        return error?.response?.message || error?.message || "Erro de extração.";
    }
}

// ============================================================================
// FICHEIRO 3: apps/api/src/modules/material-index/material-index.module.ts
// ============================================================================

// Mocks para módulos locais adicionais
class AuthModule {}
class MaterialsModule {}
class OfficialMaterialsModule {}
class SubjectsModule {}
class MaterialIndexController {}
const MaterialIndexJobSchema = {};

@Module({
    imports: [
        AuthModule,
        MaterialsModule,
        OfficialMaterialsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: MaterialIndexJob.name, schema: MaterialIndexJobSchema },
        ]),
    ],
    controllers: [MaterialIndexController],
    providers: [
        MaterialIndexService, 
        DocumentProcessingSafetyService,
        MaterialsService,
        OfficialMaterialsService,
        SubjectsService
    ],
    exports: [MaterialIndexService],
})
export class MaterialIndexModule {}

// ============================================================================
// FICHEIRO 4: apps/api/src/modules/material-index/document-processing-safety.service.spec.ts
// ============================================================================

describe("DocumentProcessingSafetyService - Testes Unitários", () => {
    let service: DocumentProcessingSafetyService;

    beforeEach(() => {
        service = new DocumentProcessingSafetyService();
    });

    it("deve aceitar um documento PDF com dados válidos e coerentes", () => {
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: 2048,
                declaredSizeBytes: 2048,
                title: "Sebenta de Anatomia",
            }),
        ).not.toThrow();
    });

    it("deve bloquear o processamento se o tamanho do buffer exceder o limite", () => {
        expect(() =>
            service.assertSafeStoredDocument({
                type: "PDF",
                mimeType: "application/pdf",
                byteLength: MAX_UPLOAD_BYTES + 1,
                title: "Ficheiro Malicioso Gigante",
            }),
        ).toThrow("tamanho máximo");
    });

    it("deve rejeitar documentos com extensões ou MIME types inconsistentes", () => {
        expect(() =>
            service.assertSafeStoredDocument({
                type: "DOCX",
                mimeType: "application/pdf", // MIME falso mascarado
                byteLength: 1024,
                title: "Incoerencia de Formato",
            }),
        ).toThrow("tipo esperado");
    });

    it("deve disparar erro de timeout se a operação de parsing travar", async () => {
        await expect(
            service.runWithTimeout({
                label: "Loop Infinito",
                timeoutMs: 5,
                operation: () => new Promise((resolve) => setTimeout(resolve, 50)),
            }),
        ).rejects.toThrow("demorou demasiado");
    });
});