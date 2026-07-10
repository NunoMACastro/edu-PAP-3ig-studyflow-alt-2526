/**
 * Define políticas administrativas de canais de notificação.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NotificationChannelPolicyDocument = HydratedDocument<NotificationChannelPolicy>;
export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";

/**
 * Política única por canal.
 */
@Schema({ timestamps: true, collection: "notification_channel_policies" })
export class NotificationChannelPolicy {
    @Prop({ required: true, unique: true, enum: ["IN_APP", "EMAIL", "PUSH"] })
    channel!: NotificationChannel;

    @Prop({ required: true, default: true })
    enabled!: boolean;

    @Prop({ required: true, min: 1, max: 200, default: 20 })
    maxPerUserPerDay!: number;

    @Prop({ required: true, min: 1, max: 200, default: 50 })
    maxPerContextPerHour!: number;
}

export const NotificationChannelPolicySchema = SchemaFactory.createForClass(NotificationChannelPolicy);
