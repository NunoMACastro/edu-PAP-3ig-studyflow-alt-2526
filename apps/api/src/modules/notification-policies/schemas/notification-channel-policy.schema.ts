// apps/api/src/modules/notification-policies/schemas/notification-channel-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { NotificationChannel } from "../dto/upsert-notification-policy.dto.js";

export type NotificationChannelPolicyDocument = HydratedDocument<NotificationChannelPolicy>;

/**
 * Política global de envio por canal.
 */
@Schema({ timestamps: true, collection: "notification_channel_policies" })
export class NotificationChannelPolicy {
    @Prop({ required: true, unique: true, enum: Object.values(NotificationChannel), index: true })
    channel!: NotificationChannel;

    @Prop({ required: true, default: true })
    enabled!: boolean;

    @Prop({ required: true, min: 1, max: 200 })
    maxPerUserPerDay!: number;

    @Prop({ required: true, min: 1, max: 500 })
    maxPerTargetPerHour!: number;
}

export const NotificationChannelPolicySchema = SchemaFactory.createForClass(NotificationChannelPolicy);