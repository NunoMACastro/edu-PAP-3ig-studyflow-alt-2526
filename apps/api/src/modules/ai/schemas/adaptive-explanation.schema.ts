/**
 * Define o modelo persistido de ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de artefactos de IA, usado apenas dentro da camada de persistência.
 */
export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

/**
 * Interação IA adaptativa guardada como evidência do BK-MF1-01.
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
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
