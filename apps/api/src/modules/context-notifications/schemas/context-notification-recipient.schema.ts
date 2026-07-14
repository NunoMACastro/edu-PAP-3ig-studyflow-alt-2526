/**
 * Persiste o estado individual de entrega e leitura de uma notificação in-app.
 *
 * O envelope da notificação permanece separado deste documento para evitar
 * arrays mutáveis por destinatário e para permitir paginação eficiente da inbox.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ContextNotificationRecipientDocument =
    HydratedDocument<ContextNotificationRecipient>;
export type ContextNotificationRecipientStatus =
    | "DELIVERED"
    | "SUPPRESSED"
    | "FAILED";

@Schema({ timestamps: true, collection: "context_notification_recipients" })
export class ContextNotificationRecipient {
    @Prop({ type: Types.ObjectId, ref: "ContextNotification", required: true, index: true })
    notificationId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    recipientId!: Types.ObjectId;

    @Prop({ required: true, enum: ["DELIVERED", "SUPPRESSED", "FAILED"] })
    status!: ContextNotificationRecipientStatus;

    @Prop()
    deliveredAt?: Date;

    @Prop()
    readAt?: Date;

    @Prop()
    archivedAt?: Date;

    @Prop({ required: true, default: false })
    migratedAsRead!: boolean;
}

export const ContextNotificationRecipientSchema =
    SchemaFactory.createForClass(ContextNotificationRecipient);

ContextNotificationRecipientSchema.index(
    { notificationId: 1, recipientId: 1 },
    { unique: true },
);
ContextNotificationRecipientSchema.index({
    recipientId: 1,
    archivedAt: 1,
    _id: -1,
});
ContextNotificationRecipientSchema.index({
    recipientId: 1,
    readAt: 1,
    _id: -1,
});
