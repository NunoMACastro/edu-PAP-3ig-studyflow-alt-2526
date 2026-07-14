/** Persistência aditiva da organização de conversas do Assistente. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    STUDENT_ASSISTANT_CONTEXT_KINDS,
    type StudentAssistantContextKind,
} from "../student-ai-assistant.types.js";

export type StudentAiConversationStatus =
    | "DRAFT"
    | "ACTIVE"
    | "ARCHIVED"
    | "DELETED_RETAINED";
export type StudentAiConversationOrigin =
    | "NATIVE"
    | "LEGACY_MIGRATION"
    | "LEGACY_API"
    | "FORK";
export type StudentAiConversationDocument = HydratedDocument<StudentAiConversation>;

@Schema({ timestamps: true, collection: "student_ai_conversations" })
export class StudentAiConversation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, enum: STUDENT_ASSISTANT_CONTEXT_KINDS, index: true })
    contextKind!: StudentAssistantContextKind;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 160 })
    contextLabelSnapshot!: string;

    @Prop({ trim: true, maxlength: 160 })
    contextSecondaryLabelSnapshot?: string;

    @Prop({ required: true, trim: true, minlength: 1, maxlength: 80 })
    title!: string;

    @Prop({
        required: true,
        enum: ["DRAFT", "ACTIVE", "ARCHIVED", "DELETED_RETAINED"],
        default: "DRAFT",
        index: true,
    })
    status!: StudentAiConversationStatus;

    @Prop({
        required: true,
        enum: ["NATIVE", "LEGACY_MIGRATION", "LEGACY_API", "FORK"],
        default: "NATIVE",
        index: true,
    })
    origin!: StudentAiConversationOrigin;

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation" })
    forkedFromConversationId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation" })
    forkRootConversationId?: Types.ObjectId;

    @Prop({ type: Number, min: 1 })
    forkDepth?: number;

    @Prop({ type: Number, min: 1, max: 200 })
    inheritedTurnCount?: number;

    @Prop({ type: Date })
    forkedAt?: Date;

    @Prop({ required: true, default: false })
    readOnly!: boolean;

    @Prop({ enum: ["LEGACY_MIGRATION"] })
    readOnlyReason?: "LEGACY_MIGRATION";

    @Prop({ type: Date, index: true })
    lastMessageAt?: Date;

    @Prop({ type: Date })
    draftExpiresAt?: Date;

    @Prop({ type: Date })
    replyLeaseExpiresAt?: Date;

    /** Lease independente para impedir duas gerações de artefactos simultâneas. */
    @Prop({ type: Date })
    artifactGenerationLeaseExpiresAt?: Date;

    @Prop({ type: String, index: true })
    migrationRunId?: string;

    @Prop({ type: String })
    legacyGroupKey?: string;

    @Prop({ type: Date })
    deletedAt?: Date;
}

export const StudentAiConversationSchema =
    SchemaFactory.createForClass(StudentAiConversation);
StudentAiConversationSchema.index({ studentId: 1, status: 1, lastMessageAt: -1, _id: -1 });
StudentAiConversationSchema.index({
    studentId: 1,
    contextKind: 1,
    contextId: 1,
    status: 1,
    lastMessageAt: -1,
});
StudentAiConversationSchema.index(
    { legacyGroupKey: 1 },
    {
        unique: true,
        partialFilterExpression: { legacyGroupKey: { $type: "string" } },
    },
);
StudentAiConversationSchema.index(
    { draftExpiresAt: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: { status: "DRAFT" },
    },
);
