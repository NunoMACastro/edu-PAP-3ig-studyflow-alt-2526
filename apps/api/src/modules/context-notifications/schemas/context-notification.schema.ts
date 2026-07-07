/**
 * Define notificações internas por contexto de grupo ou turma.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ContextNotificationDocument = HydratedDocument<ContextNotification>;
export type ContextNotificationType = "NEW_MATERIAL" | "FEEDBACK" | "TASK" | "FOLLOW_UP";
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

    @Prop({ required: true, enum: ["NEW_MATERIAL", "FEEDBACK", "TASK", "FOLLOW_UP"] })
    type!: ContextNotificationType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    body!: string;

    @Prop({ type: [Types.ObjectId], default: [] })
    recipientIds!: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], default: [] })
    suppressedRecipientIds!: Types.ObjectId[];
}

export const ContextNotificationSchema = SchemaFactory.createForClass(ContextNotification);
ContextNotificationSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });
