/**
 * Define o modelo persistido de revisão docente de conteúdos IA usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de revisão docente de conteúdos IA, usado apenas dentro da camada de persistência.
 */
export type AiContentReviewDocument = HydratedDocument<AiContentReview>;
/**
 * Estados permitidos de revisão docente de conteúdos IA; evitam strings soltas no código.
 */
export type AiContentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
/**
 * Tipos permitidos de revisão docente de conteúdos IA; direcionam validação e renderização.
 */
export type AiContentReviewType = "SUMMARY" | "QUIZ";
export type ApprovedContentOrigin = "TEACHER_AUTHORED";

/**
 * Revisão docente de conteúdo gerado por IA.
 */
@Schema({ timestamps: true, collection: "ai_content_reviews" })
export class AiContentReview {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "OfficialMaterial", required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SUMMARY", "QUIZ"] })
    contentType!: AiContentReviewType;

    @Prop({ type: Object, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ required: true, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" })
    status!: AiContentReviewStatus;

    @Prop({ trim: true, maxlength: 1000 })
    teacherComment?: string;

    @Prop({ enum: ["TEACHER_AUTHORED"] })
    origin?: ApprovedContentOrigin;
}

export const AiContentReviewSchema =
    SchemaFactory.createForClass(AiContentReview);
AiContentReviewSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
