/**
 * Evento durável para transformar mutações pedagógicas em notificações in-app.
 *
 * A chave idempotente liga uma única alteração de domínio a uma única
 * notificação, mesmo quando o worker é reiniciado ou perde o lease.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    ContextNotificationContextType,
    ContextNotificationType,
} from "./context-notification.schema.js";

export type NotificationOutboxEventDocument =
    HydratedDocument<NotificationOutboxEvent>;
export type NotificationOutboxStatus =
    | "PENDING"
    | "PROCESSING"
    | "DELIVERED"
    | "FAILED";

@Schema({ timestamps: true, collection: "notification_outbox_events" })
export class NotificationOutboxEvent {
    @Prop({ required: true, unique: true, index: true, maxlength: 240 })
    idempotencyKey!: string;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    actorId!: Types.ObjectId;

    @Prop({ required: true, enum: ["CLASS", "GROUP"] })
    contextType!: ContextNotificationContextType;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ required: true })
    type!: ContextNotificationType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    body!: string;

    @Prop({ trim: true, maxlength: 500 })
    targetPath?: string;

    @Prop({ type: [Types.ObjectId], default: [] })
    recipientIdsSnapshot!: Types.ObjectId[];

    @Prop({ required: true, trim: true, maxlength: 80 })
    preferenceContext!: string;

    @Prop({
        required: true,
        enum: ["PENDING", "PROCESSING", "DELIVERED", "FAILED"],
        default: "PENDING",
        index: true,
    })
    status!: NotificationOutboxStatus;

    @Prop({ required: true, default: 0, min: 0 })
    attempts!: number;

    @Prop({ required: true, default: Date.now, index: true })
    availableAt!: Date;

    @Prop()
    leaseExpiresAt?: Date;

    @Prop({ trim: true, maxlength: 120 })
    leaseToken?: string;

    @Prop()
    completedAt?: Date;

    @Prop({ trim: true, maxlength: 160 })
    lastErrorCode?: string;
}

export const NotificationOutboxEventSchema =
    SchemaFactory.createForClass(NotificationOutboxEvent);

NotificationOutboxEventSchema.index({ status: 1, availableAt: 1, _id: 1 });
