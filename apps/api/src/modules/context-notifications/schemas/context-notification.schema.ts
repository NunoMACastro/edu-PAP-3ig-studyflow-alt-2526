// apps/api/src/modules/context-notifications/schemas/context-notification.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "../dto/create-context-notification.dto.js";

export type ContextNotificationDocument = HydratedDocument<ContextNotification>;

/**
 * Notificação persistida com destinatários calculados no backend.
 */
@Schema({ timestamps: true, collection: "context_notifications" })
export class ContextNotification {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ContextNotificationTargetType), index: true })
    targetType!: ContextNotificationTargetType;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    targetId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(ContextNotificationEventType), index: true })
    eventType!: ContextNotificationEventType;

    @Prop({ required: true, trim: true, maxlength: 120 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 500 })
    body!: string;

    @Prop({ type: Types.ObjectId })
    sourceId?: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
    recipientIds!: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
    suppressedRecipientIds!: Types.ObjectId[];
}

export const ContextNotificationSchema = SchemaFactory.createForClass(ContextNotification);
ContextNotificationSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });