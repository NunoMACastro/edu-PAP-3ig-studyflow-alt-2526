/**
 * Define o modelo persistido de jobs de geração de quizzes privados.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    AI_ARTIFACT_TARGET_KINDS,
    type AiArtifactTargetKind,
} from "../ai-artifact-generation.types.js";

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

    @Prop({ type: Types.ObjectId, index: true })
    studyAreaId?: Types.ObjectId;

    @Prop({ enum: AI_ARTIFACT_TARGET_KINDS, index: true })
    targetKind?: AiArtifactTargetKind;

    @Prop({ type: Types.ObjectId, index: true })
    targetId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 160 })
    targetLabelSnapshot?: string;

    @Prop({ enum: ["SUBJECT", "STUDY_AREA", "STUDY_GROUP", "STUDY_ROOM", "GUIDED_ROOM"] })
    sourceContextKind?: string;

    @Prop({
        required: true,
        enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"],
        default: "QUEUED",
    })
    status!: QuizGenerationJobStatus;

    @Prop({ type: Types.ObjectId })
    artifactId?: Types.ObjectId;

    /** Conversa do Assistente que pediu o quiz, sem alterar os jobs legacy. */
    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    assistantConversationId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudentAiArtifactGenerationSnapshot", index: true })
    assistantSnapshotId?: Types.ObjectId;

    /** Hash opaco de idempotência mantido também depois do estado terminal. */
    @Prop({ trim: true, maxlength: 128 })
    assistantRequestKey?: string;

    @Prop({ trim: true, maxlength: 120 })
    topic?: string;

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

    /**
     * Token monotónico incrementado em cada claim. Um worker antigo nunca pode
     * fechar um job depois de outro claim ter recebido um token superior.
     */
    @Prop({ required: true, min: 0, default: 0 })
    leaseToken!: number;

    @Prop({ index: true })
    leaseExpiresAt?: Date;

    /** Chave opaca libertada apenas quando o job atinge um estado terminal. */
    @Prop({ trim: true, maxlength: 256 })
    activeKey?: string;

    @Prop()
    completedAt?: Date;
}

export const QuizGenerationJobSchema =
    SchemaFactory.createForClass(QuizGenerationJob);
QuizGenerationJobSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
QuizGenerationJobSchema.index({ userId: 1, targetKind: 1, targetId: 1, createdAt: -1 });
QuizGenerationJobSchema.index(
    { activeKey: 1 },
    {
        unique: true,
        partialFilterExpression: { activeKey: { $type: "string" } },
    },
);
QuizGenerationJobSchema.index(
    { assistantRequestKey: 1 },
    {
        unique: true,
        partialFilterExpression: { assistantRequestKey: { $type: "string" } },
    },
);
QuizGenerationJobSchema.index({
    status: 1,
    availableAt: 1,
    leaseExpiresAt: 1,
    createdAt: 1,
});
