/**
 * Define notificações internas por contexto de grupo ou turma.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ContextNotificationDocument = HydratedDocument<ContextNotification>;
export const CONTEXT_NOTIFICATION_TYPES = [
    "NEW_MATERIAL",
    "FEEDBACK",
    "TASK",
    "FOLLOW_UP",
    "CLASS_MEMBERSHIP_ADDED",
    "CLASS_MEMBERSHIP_REMOVED",
    "CLASS_ARCHIVED",
    "CLASS_RESTORED",
    "SUBJECT_AVAILABLE",
    "SUBJECT_ARCHIVED",
    "SUBJECT_RESTORED",
    "CLASS_POST_PUBLISHED",
    "OFFICIAL_MATERIAL_AVAILABLE",
    "OFFICIAL_MATERIAL_PUBLISHED",
    "OFFICIAL_MATERIAL_UPDATED",
    "CLASS_PROJECT_PUBLISHED",
    "OFFICIAL_TEST_PUBLISHED",
    "OFFICIAL_TEST_CLOSED",
    "AI_CONTENT_APPROVED",
    "AI_CONTENT_WITHDRAWN",
    "GUIDED_ROOM_OPENED",
    "GUIDED_ROOM_REOPENED",
    "GUIDED_ROOM_CLOSED",
] as const;
/** Tipos criados por ação manual e, por isso, sujeitos a quota anti-spam. */
export const MANUAL_QUOTA_NOTIFICATION_TYPES = [
    "NEW_MATERIAL",
    "FEEDBACK",
    "TASK",
    "FOLLOW_UP",
] as const;
export type ContextNotificationType = (typeof CONTEXT_NOTIFICATION_TYPES)[number];
export type ContextNotificationContextType = "CLASS" | "GROUP";

/**
 * Notificação in-app calculada pelo backend sem destinatários vindos do frontend.
 */
@Schema({ timestamps: true, collection: "context_notifications" })
export class ContextNotification {
    @Prop({ required: true, enum: ["CLASS", "GROUP"], index: true })
    contextType!: ContextNotificationContextType;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: CONTEXT_NOTIFICATION_TYPES })
    type!: ContextNotificationType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    body!: string;

    @Prop({ type: [Types.ObjectId], default: [] })
    recipientIds!: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], default: [] })
    suppressedRecipientIds!: Types.ObjectId[];

    @Prop({ trim: true, maxlength: 500 })
    targetPath?: string;

    @Prop({ trim: true, maxlength: 240, unique: true, sparse: true, index: true })
    sourceEventKey?: string;
}

export const ContextNotificationSchema = SchemaFactory.createForClass(ContextNotification);
ContextNotificationSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });
