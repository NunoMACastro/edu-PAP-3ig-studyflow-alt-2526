/**
 * Define o modelo persistido de jobs de geração de quizzes privados.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de job de quiz, usado apenas dentro da camada de persistência.
 */
export type QuizGenerationJobDocument = HydratedDocument<QuizGenerationJob>;

/**
 * Estados permitidos do job de geração de quiz.
 */
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

    @Prop({
        required: true,
        enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"],
        default: "QUEUED",
    })
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
