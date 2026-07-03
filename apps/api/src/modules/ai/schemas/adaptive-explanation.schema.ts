// apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
/**
 * Define o modelo persistido das explicações adaptadas.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de uma explicação adaptada.
 */
export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

/**
 * Explicação gerada para uma área privada do aluno.
 */
@Schema({ timestamps: true, collection: "adaptive_explanations" })
export class AdaptiveExplanation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    suggestedNextSteps!: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: "Material" }], default: [] })
    sourceMaterialIds!: Types.ObjectId[];
}

export const AdaptiveExplanationSchema =
    SchemaFactory.createForClass(AdaptiveExplanation);

// Este índice torna eficiente listar histórico por aluno e área sem misturar contextos.
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });