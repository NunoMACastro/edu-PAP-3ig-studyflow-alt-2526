/**
 * Define o modelo persistido de preferências de notificação usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { NotificationContext } from "../dto/update-notification-preferences.dto.js";

/**
 * Documento Mongoose de preferências de notificação, usado apenas dentro da camada de persistência.
 */
export type NotificationPreferenceDocument =
    HydratedDocument<NotificationPreference>;

/**
 * Preferência de notificação por utilizador e contexto.
 */
@Schema({ timestamps: true })
export class NotificationPreference {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(NotificationContext), index: true })
    context!: NotificationContext;

    @Prop({ required: true, default: false })
    email!: boolean;

    @Prop({ required: true, default: false })
    push!: boolean;

    @Prop({ required: true, default: true })
    inApp!: boolean;
}

export const NotificationPreferenceSchema =
    SchemaFactory.createForClass(NotificationPreference);

NotificationPreferenceSchema.index({ userId: 1, context: 1 }, { unique: true });
