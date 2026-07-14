/** Persistência temporária dos convites para fork de conversas colaborativas. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export const STUDENT_AI_FORK_CONTEXT_KINDS = ["STUDY_GROUP", "STUDY_ROOM"] as const;
export const STUDENT_AI_FORK_INVITATION_STATUSES = [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
    "CANCELLED",
    "EXPIRED",
] as const;

export type StudentAiForkContextKind =
    (typeof STUDENT_AI_FORK_CONTEXT_KINDS)[number];
export type StudentAiForkInvitationStatus =
    (typeof STUDENT_AI_FORK_INVITATION_STATUSES)[number];
export type StudentAiConversationForkInvitationDocument =
    HydratedDocument<StudentAiConversationForkInvitation>;

/**
 * Convite minimizado: referencia o snapshot, mas nunca duplica conteúdo da
 * conversa antes de o destinatário aceitar explicitamente.
 */
@Schema({ timestamps: true, collection: "student_ai_conversation_fork_invitations" })
export class StudentAiConversationForkInvitation {
    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", required: true, index: true })
    sourceConversationId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    sourceStudentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    recipientStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: STUDENT_AI_FORK_CONTEXT_KINDS, index: true })
    contextKind!: StudentAiForkContextKind;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    snapshotLastTurnId!: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 200 })
    snapshotTurnCount!: number;

    @Prop({ required: true, min: 1, max: 500_000 })
    snapshotCharacterCount!: number;

    @Prop({
        required: true,
        enum: STUDENT_AI_FORK_INVITATION_STATUSES,
        default: "PENDING",
        index: true,
    })
    status!: StudentAiForkInvitationStatus;

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation" })
    acceptedConversationId?: Types.ObjectId;

    @Prop({ type: Date, required: true, index: true })
    expiresAt!: Date;

    @Prop({ type: Date })
    actedAt?: Date;

    @Prop({ type: Date, required: true })
    purgeAt!: Date;
}

export const StudentAiConversationForkInvitationSchema =
    SchemaFactory.createForClass(StudentAiConversationForkInvitation);

StudentAiConversationForkInvitationSchema.index(
    { sourceConversationId: 1, recipientStudentId: 1 },
    {
        name: "uniq_pending_conversation_recipient",
        unique: true,
        partialFilterExpression: { status: "PENDING" },
    },
);
StudentAiConversationForkInvitationSchema.index({
    recipientStudentId: 1,
    status: 1,
    createdAt: -1,
});
StudentAiConversationForkInvitationSchema.index({
    sourceStudentId: 1,
    status: 1,
    createdAt: -1,
});
StudentAiConversationForkInvitationSchema.index(
    { purgeAt: 1 },
    { name: "ttl_terminal_fork_invitations", expireAfterSeconds: 0 },
);
