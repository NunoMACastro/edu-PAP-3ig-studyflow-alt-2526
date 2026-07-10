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

    @Prop({ required: true, min: 0, default: 0 })
    attempts!: number;

    @Prop({ required: true, min: 1, max: 5, default: 3 })
    maxAttempts!: number;

    @Prop({ required: true, default: () => new Date(), index: true })
    availableAt!: Date;

    @Prop({ trim: true, maxlength: 128, index: true })
    leaseOwner?: string;

    /** Token de fencing monotónico, incrementado atomicamente em cada claim. */
    @Prop({ required: true, min: 0, default: 0 })
    leaseToken!: number;

    @Prop({ trim: true, maxlength: 128 })
    activeKey?: string;

    @Prop({ index: true })
    leaseExpiresAt?: Date;

    @Prop()
    completedAt?: Date;
}

export const MaterialIndexJobSchema =
    SchemaFactory.createForClass(MaterialIndexJob);
MaterialIndexJobSchema.index({ materialId: 1, scope: 1, createdAt: -1 });
MaterialIndexJobSchema.index({
    scope: 1,
    status: 1,
    availableAt: 1,
    leaseExpiresAt: 1,
    createdAt: 1,
});
MaterialIndexJobSchema.index(
    { activeKey: 1 },
    {
        unique: true,
        partialFilterExpression: { activeKey: { $type: "string" } },
    },
);
MaterialIndexJobSchema.index({
    scope: 1,
    userId: 1,
    studyAreaId: 1,
    materialId: 1,
    createdAt: -1,
});
