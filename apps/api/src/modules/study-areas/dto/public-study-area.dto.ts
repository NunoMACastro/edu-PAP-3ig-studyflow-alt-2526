/**
 * Define contratos de dados usados nas entradas e saídas de study áreas.
 */
import {
    StudyAreaVoiceDetailLevel,
    StudyAreaVoiceTone,
} from "../schemas/study-area.schema.js";

/**
 * DTO que define os dados aceites ou devolvidos no fluxo de áreas de estudo.
 */
export type PublicStudyAreaDto = {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    archived?: boolean;
    voiceTone?: StudyAreaVoiceTone;
    voiceDetailLevel?: StudyAreaVoiceDetailLevel;
    voiceNotes?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Forma mínima de áreas de estudo aceite por mappers e testes sem exigir documento completo.
 */
type StudyAreaLike = Omit<PublicStudyAreaDto, "_id"> & {
    _id: unknown;
    toObject?: () => StudyAreaLike;
};

/**
 * Converte uma área de estudo no contrato público da MF0.
 *
 * @param área Documento Mongoose ou objeto lean.
 * @returns Área sem `userId` nem metadados internos.
 */
export function toPublicStudyArea(area: StudyAreaLike): PublicStudyAreaDto {
    const value = normalizeDocument(area);
    return {
        _id: String(value._id),
        name: value.name,
        ...(value.description !== undefined
            ? { description: value.description }
            : {}),
        ...(value.color !== undefined ? { color: value.color } : {}),
        ...(value.archived !== undefined ? { archived: value.archived } : {}),
        ...(value.voiceTone !== undefined ? { voiceTone: value.voiceTone } : {}),
        ...(value.voiceDetailLevel !== undefined
            ? { voiceDetailLevel: value.voiceDetailLevel }
            : {}),
        ...(value.voiceNotes !== undefined ? { voiceNotes: value.voiceNotes } : {}),
        ...(value.createdAt ? { createdAt: value.createdAt } : {}),
        ...(value.updatedAt ? { updatedAt: value.updatedAt } : {}),
    };
}

/**
 * Usa `toObject` quando existe para lidar com documentos Mongoose.
 *
 * @param value Documento ou objeto já serializado.
 * @returns Objeto serializável.
 */
function normalizeDocument<T extends { toObject?: () => T }>(value: T): T {
    return typeof value.toObject === "function" ? value.toObject() : value;
}
