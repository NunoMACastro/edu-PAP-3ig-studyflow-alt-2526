/**
 * Define o modelo persistido de materials usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de materiais privados, usado apenas dentro da camada de persistência.
 */
export type MaterialDocument = HydratedDocument<Material>;
/**
 * Tipos permitidos de materiais privados; direcionam validação e renderização.
 */
export type MaterialType = "PDF" | "DOCX" | "URL" | "TOPIC";
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

    @Prop({ required: true, enum: ["PDF", "DOCX", "URL", "TOPIC"] })
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

    @Prop()
    originalName?: string;

    @Prop()
    mimeType?: string;

    @Prop({ min: 0 })
    sizeBytes?: number;

    @Prop({ maxlength: 10000 })
    contentText?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
MaterialSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
