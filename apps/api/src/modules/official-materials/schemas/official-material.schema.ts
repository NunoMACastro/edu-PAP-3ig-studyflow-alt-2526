/**
 * Define o modelo persistido de materiais oficiais usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { MAX_MATERIAL_ORIGINAL_NAME_LENGTH } from "../../materials/validators/material-upload.contract.js";

/**
 * Documento Mongoose de materiais oficiais, usado apenas dentro da camada de persistência.
 */
export type OfficialMaterialDocument = HydratedDocument<OfficialMaterial>;
/**
 * Tipos permitidos de materiais oficiais; direcionam validação e renderização.
 */
export type OfficialMaterialType = "TEXT" | "URL" | "PDF" | "DOCX";
/**
 * Estados permitidos de materiais oficiais; evitam strings soltas no código.
 */
export type OfficialMaterialStatus =
    | "PROCESSED"
    | "REFERENCE_ONLY"
    | "PENDING_PROCESSING";

/**
 * Material oficial submetido por professor para uma disciplina.
 */
@Schema({ timestamps: true, collection: "official_materials" })
export class OfficialMaterial {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["TEXT", "URL", "PDF", "DOCX"] })
    type!: OfficialMaterialType;

    @Prop({
        required: true,
        enum: ["PROCESSED", "REFERENCE_ONLY", "PENDING_PROCESSING"],
    })
    status!: OfficialMaterialStatus;

    @Prop({ trim: true, maxlength: 20000 })
    textContent?: string;

    @Prop({ trim: true })
    sourceUrl?: string;

    @Prop()
    storageKey?: string;

    @Prop({ match: /^[a-f0-9]{64}$/ })
    storageSha256?: string;

    @Prop({ trim: true, maxlength: MAX_MATERIAL_ORIGINAL_NAME_LENGTH })
    originalName?: string;

    @Prop()
    mimeType?: string;

    @Prop({ min: 0 })
    sizeBytes?: number;

    @Prop({ type: Types.ObjectId, ref: "MaterialVersion", index: true })
    activeVersionId?: Types.ObjectId;

    @Prop({ required: true, min: 0, default: 0 })
    contentRevision!: number;

    @Prop()
    activeVersionUpdatedAt?: Date;

    @Prop({ trim: true, maxlength: 1000 })
    activeVersionChangeSummary?: string;
}

export const OfficialMaterialSchema =
    SchemaFactory.createForClass(OfficialMaterial);
OfficialMaterialSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
