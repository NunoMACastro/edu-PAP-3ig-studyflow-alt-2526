/**
 * Define o modelo persistido de indexação textual de materiais usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de indexação textual de materiais, usado apenas dentro da camada de persistência.
 */
export type MaterialIndexJobDocument = HydratedDocument<MaterialIndexJob>;
/**
 * Estados permitidos de indexação textual de materiais; evitam strings soltas no código.
 */
export type MaterialIndexStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type MaterialIndexScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
/**
 * Contrato de indexação textual de materiais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type MaterialTextChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

/**
 * Job de indexação de material privado ou oficial.
 */
@Schema({ timestamps: true, collection: "material_index_jobs" })
export class MaterialIndexJob {
    @Prop({ required: true, enum: ["PRIVATE_AREA", "OFFICIAL_SUBJECT"], index: true })
    scope!: MaterialIndexScope;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    studyAreaId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    teacherId?: Types.ObjectId;

    @Prop({ required: true, enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"], default: "QUEUED" })
    status!: MaterialIndexStatus;

    @Prop({ type: [Object], default: [] })
    extractedTextChunks!: MaterialTextChunk[];

    @Prop({ trim: true, maxlength: 1000 })
    errorMessage?: string;
}

export const MaterialIndexJobSchema =
    SchemaFactory.createForClass(MaterialIndexJob);
MaterialIndexJobSchema.index({ materialId: 1, scope: 1, createdAt: -1 });
