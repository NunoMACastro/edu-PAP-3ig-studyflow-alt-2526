/**
 * Define o modelo persistido de ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { QuizAttemptQuestionResultDto } from "../dto/quiz-attempt.dto.js";

/**
 * Documento Mongoose de artefactos de IA, usado apenas dentro da camada de persistência.
 */
export type AiQuizAttemptDocument = HydratedDocument<AiQuizAttempt>;

/**
 * Tentativa mínima de quiz gerado pela IA.
 *
 * Este schema fecha o handoff MF0 -> MF1 sem introduzir métricas avançadas:
 * guarda respostas e resultado por pergunta, ligados ao artefacto `QUIZ`.
 */
@Schema({ timestamps: true, collection: "ai_quiz_attempts" })
export class AiQuizAttempt {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "AiArtifact",
        required: true,
        index: true,
    })
    artifactId!: Types.ObjectId;

    @Prop({ type: [Number], required: true })
    answers!: number[];

    @Prop({ required: true, min: 0 })
    correctCount!: number;

    @Prop({ required: true, min: 1 })
    totalQuestions!: number;

    @Prop({ required: true, min: 0, max: 100 })
    scorePercent!: number;

    @Prop({ required: true, default: Date.now, index: true })
    answeredAt!: Date;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    results!: QuizAttemptQuestionResultDto[];
}

export const AiQuizAttemptSchema =
    SchemaFactory.createForClass(AiQuizAttempt);
AiQuizAttemptSchema.index({ userId: 1, studyAreaId: 1, answeredAt: -1 });
