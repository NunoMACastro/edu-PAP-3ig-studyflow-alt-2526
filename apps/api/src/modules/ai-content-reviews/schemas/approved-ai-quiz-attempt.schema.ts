/**
 * Persiste uma tentativa individual num quiz gerado por IA e aprovado pelo
 * professor. A solução correta não é duplicada neste documento: permanece no
 * conteúdo governado da revisão e só é projetada na resposta imediata.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ApprovedAiQuizAttemptDocument =
    HydratedDocument<ApprovedAiQuizAttempt>;

@Schema({ timestamps: true, collection: "approved_ai_quiz_attempts" })
export class ApprovedAiQuizAttempt {
    @Prop({ type: Types.ObjectId, ref: "AiContentReview", required: true, index: true })
    reviewId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    attemptNumber!: number;

    @Prop({ type: [Number], required: true })
    selectedOptionIndexes!: number[];

    @Prop({ required: true, min: 0 })
    correctCount!: number;

    @Prop({ required: true, min: 1 })
    totalQuestions!: number;

    @Prop({ required: true, min: 0, max: 100 })
    scorePercent!: number;

    @Prop({ required: true, default: Date.now, index: true })
    answeredAt!: Date;
}

export const ApprovedAiQuizAttemptSchema =
    SchemaFactory.createForClass(ApprovedAiQuizAttempt);

ApprovedAiQuizAttemptSchema.index(
    { reviewId: 1, studentId: 1, attemptNumber: 1 },
    { unique: true },
);
ApprovedAiQuizAttemptSchema.index({
    classId: 1,
    studentId: 1,
    answeredAt: -1,
});
