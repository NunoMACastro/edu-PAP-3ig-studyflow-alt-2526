/** Snapshot transitório usado pelos quizzes assíncronos do Assistente. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import {
    AI_ARTIFACT_TARGET_KINDS,
    type AiArtifactGroundingMode,
    type AiArtifactTargetKind,
} from "../../ai/ai-artifact-generation.types.js";

export type StudentAiArtifactGenerationSnapshotDocument =
    HydratedDocument<StudentAiArtifactGenerationSnapshot>;

@Schema({ timestamps: true, collection: "student_ai_artifact_generation_snapshots" })
export class StudentAiArtifactGenerationSnapshot {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", required: true, index: true })
    conversationId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SUBJECT", "STUDY_AREA", "STUDY_GROUP", "STUDY_ROOM", "GUIDED_ROOM"] })
    sourceContextKind!: string;

    @Prop({ type: Types.ObjectId, required: true })
    sourceContextId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    contextLabel!: string;

    @Prop({ required: true, enum: AI_ARTIFACT_TARGET_KINDS })
    targetKind!: AiArtifactTargetKind;

    @Prop({ type: Types.ObjectId, required: true })
    targetId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    targetLabel!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], required: true, default: [] })
    sources!: Array<{ materialId: string; title: string; contentText: string }>;

    @Prop({ required: true, min: 0 })
    candidateSourceCount!: number;

    @Prop({ type: [MongooseSchema.Types.Mixed], required: true, default: [] })
    conversationTurns!: Array<{ question: string; answer: string }>;

    @Prop({ required: true, min: 1, max: 6 })
    snapshotTurnCount!: number;

    @Prop({ required: true, enum: ["CHAT_AND_SOURCES", "CHAT_ONLY"] })
    groundingMode!: AiArtifactGroundingMode;

    @Prop({ required: true, trim: true, minlength: 64, maxlength: 64 })
    snapshotDigest!: string;

    @Prop({ trim: true, maxlength: 40 })
    voiceTone?: string;

    @Prop({ required: true, default: Date.now })
    snapshotAt!: Date;

    @Prop({ required: true })
    purgeAt!: Date;
}

export const StudentAiArtifactGenerationSnapshotSchema =
    SchemaFactory.createForClass(StudentAiArtifactGenerationSnapshot);
StudentAiArtifactGenerationSnapshotSchema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
StudentAiArtifactGenerationSnapshotSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });
