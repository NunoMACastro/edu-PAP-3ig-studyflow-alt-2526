/**
 * Centraliza validações reutilizáveis de materials.
 */
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common";
import { extname } from "path";
import { MAX_MATERIAL_ORIGINAL_NAME_LENGTH } from "./material-upload.contract.js";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const FORBIDDEN_FILE_NAME_CHARACTERS =
    /[\u0000-\u001f\u007f/\\\u200e\u200f\u202a-\u202e\u2066-\u2069]/u;

const ALLOWED_EXTENSIONS_BY_MIME = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
} as const;

/**
 * Contrato de materiais privados que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const MATERIAL_UPLOAD_OPTIONS = {
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
    },
    /**
     * Executa file filter para materiais de estudo, transformando regras de negócio em feedback previsível para o chamador.
     *
     * @param _request Pedido autenticado recebido pelo controller, incluindo a sessão e o utilizador atual.
     * @param file Ficheiro recebido ou processado pela operação.
     * @param callback Callback chamado pela API externa para concluir a operação assíncrona simulada.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    fileFilter: (
        _request: unknown,
        file: Express.Multer.File,
        callback: FileFilterCallback,
    ) => {
        try {
            validateMaterialUploadMetadata(file);
            callback(null, true);
        } catch (error) {
            callback(error as Error, false);
        }
    },
};

/**
 * Valida ficheiros submetidos no BK-MF0-08.
 *
 * @param file Ficheiro recebido via multipart.
 * @returns Nada quando o ficheiro é aceite.
 * @throws BadRequestException quando falta ficheiro ou MIME é inválido.
 * @throws PayloadTooLargeException quando excede 10 MB.
 */
export function validateMaterialUpload(
    file: Express.Multer.File,
): ValidatedMaterialUploadMetadata {
    const metadata = validateMaterialUploadMetadata(file);

    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        throw new BadRequestException({
            code: "FILE_REQUIRED",
            message: "Envia um ficheiro PDF ou DOCX.",
        });
    }

    if (!hasExpectedSignature(file)) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }

    return metadata;
}

export type ValidatedMaterialUploadMetadata = {
    originalName: string;
};

/**
 * Valida metadados do upload antes do ficheiro ser aceite pelo Multer.
 *
 * @param file Ficheiro recebido via multipart.
 * @returns Nada quando os metadados são aceites.
 */
export function validateMaterialUploadMetadata(
    file: Express.Multer.File,
): ValidatedMaterialUploadMetadata {
    if (!file) {
        throw new BadRequestException({
            code: "FILE_REQUIRED",
            message: "Envia um ficheiro PDF ou DOCX.",
        });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        throw new PayloadTooLargeException({
            code: "FILE_TOO_LARGE",
            message: "O ficheiro excede o limite permitido.",
        });
    }

    if (!isAllowedMimeType(file.mimetype)) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }

    const originalName = normalizeMaterialOriginalName(file.originalname);
    const extension = extname(originalName).toLowerCase();
    if (extension !== ALLOWED_EXTENSIONS_BY_MIME[file.mimetype]) {
        throw new BadRequestException({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Só são aceites ficheiros PDF ou DOCX.",
        });
    }

    const stem = originalName.slice(0, -extension.length).trim();
    if (!stem) {
        throw invalidOriginalName();
    }

    return { originalName };
}

/**
 * Canoniza o nome apresentado sem nunca o transformar numa chave de storage.
 * Paths, controlos e caracteres bidi são rejeitados para impedir spoofing e
 * metadata ambígua; Unicode e whitespace benignos são normalizados.
 *
 * @param value Nome recebido no cabeçalho multipart.
 * @returns Nome NFC, aparado e com whitespace interno canónico.
 */
export function normalizeMaterialOriginalName(value: unknown): string {
    if (typeof value !== "string") {
        throw invalidOriginalName();
    }

    const unicodeNormalized = value.normalize("NFC");
    if (FORBIDDEN_FILE_NAME_CHARACTERS.test(unicodeNormalized)) {
        throw invalidOriginalName();
    }

    const normalized = unicodeNormalized.trim().replace(/\s+/gu, " ");
    if (!normalized) {
        throw invalidOriginalName();
    }
    if (normalized.length > MAX_MATERIAL_ORIGINAL_NAME_LENGTH) {
        throw new BadRequestException({
            code: "FILE_NAME_TOO_LONG",
            message: `O nome original do ficheiro não pode exceder ${MAX_MATERIAL_ORIGINAL_NAME_LENGTH} caracteres.`,
        });
    }

    return normalized;
}

/**
 * Converte MIME validado para tipo canónico de material.
 *
 * @param mimeType MIME do ficheiro já validado.
 * @returns Tipo `PDF` ou `DOCX`.
 */
export function materialTypeFromMime(mimeType: string): "PDF" | "DOCX" {
    return mimeType === "application/pdf" ? "PDF" : "DOCX";
}

/**
 * Confirma se o MIME pertence ao contrato MF0.
 *
 * @param mimeType MIME recebido no multipart.
 * @returns `true` quando é PDF ou DOCX.
 */
function isAllowedMimeType(
    mimeType: string,
): mimeType is (typeof ALLOWED_MIME_TYPES)[number] {
    return ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof ALLOWED_MIME_TYPES)[number],
    );
}

/**
 * Cria a falha pública estável para nomes ausentes, ambíguos ou perigosos.
 *
 * @returns Exceção HTTP sem refletir o valor recebido.
 */
function invalidOriginalName(): BadRequestException {
    return new BadRequestException({
        code: "FILE_NAME_INVALID",
        message: "O nome original do ficheiro é inválido.",
    });
}

/**
 * Valida a assinatura binária mínima do ficheiro.
 *
 * @param file Ficheiro com buffer já carregado em memória.
 * @returns `true` quando a assinatura corresponde ao MIME.
 */
function hasExpectedSignature(file: Express.Multer.File): boolean {
    if (file.mimetype === "application/pdf") {
        return file.buffer.subarray(0, 5).toString("ascii") === "%PDF-";
    }

    return (
        file.buffer.length >= 2 &&
        file.buffer[0] === 0x50 &&
        file.buffer[1] === 0x4b
    );
}
