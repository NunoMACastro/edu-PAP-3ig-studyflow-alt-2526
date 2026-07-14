/**
 * Define o modelo persistido de materials usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { MAX_MATERIAL_ORIGINAL_NAME_LENGTH } from "../validators/material-upload.contract.js";

/**
 * Documento Mongoose de materiais privados, usado apenas dentro da camada de persistência.
 */
export type MaterialDocument = HydratedDocument<Material>;
/**
 * Tipos permitidos de materiais privados; direcionam validação e renderização.
 */
export type MaterialType = "PDF" | "DOCX" | "URL" | "TOPIC" | "MARKDOWN";
/**
 * Estados permitidos de materiais privados; evitam strings soltas no código.
 */
export type MaterialStatus = "PENDING_PROCESSING" | "READY" | "FAILED";

/**
 * Material submetido numa área de estudo pessoal.
 */
@Schema({ timestamps: true, collection: "materials" })
export class Material {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["PDF", "DOCX", "URL", "TOPIC", "MARKDOWN"] })
    type!: MaterialType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({
        required: true,
        enum: ["PENDING_PROCESSING", "READY", "FAILED"],
        default: "PENDING_PROCESSING",
    })
    status!: MaterialStatus;

    @Prop({ trim: true })
    url?: string;

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

    @Prop({ maxlength: 10000 })
    contentText?: string;

    @Prop({ maxlength: 20000 })
    markdownSource?: string;

    @Prop({ required: true, min: 0, default: 0 })
    contentRevision!: number;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
MaterialSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
