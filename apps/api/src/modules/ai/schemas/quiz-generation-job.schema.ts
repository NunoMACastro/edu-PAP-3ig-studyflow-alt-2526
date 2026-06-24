// apps/api/src/modules/ai/schemas/quiz-generation-job.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type QuizGenerationJobDocument = HydratedDocument<QuizGenerationJob>;
export type QuizGenerationJobStatus =
    | "QUEUED"
    | "PROCESSING"
    | "DONE"
    | "FAILED";

/**
 * Job persistido para geração de quizzes privados.
 */
@Schema({ timestamps: true, collection: "quiz_generation_jobs" })
export class QuizGenerationJob {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"], default: "QUEUED" })
    status!: QuizGenerationJobStatus;

    @Prop({ type: Types.ObjectId })
    artifactId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 120 })
    topic?: string;

    @Prop({ trim: true, maxlength: 1000 })
    errorMessage?: string;
}

export const QuizGenerationJobSchema =
    SchemaFactory.createForClass(QuizGenerationJob);
QuizGenerationJobSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });