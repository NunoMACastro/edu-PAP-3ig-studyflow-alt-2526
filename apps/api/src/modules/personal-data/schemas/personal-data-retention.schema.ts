/**
 * Recibo anonimizado e temporário de operações RGPD.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PersonalDataRetentionDocument =
    HydratedDocument<PersonalDataRetention>;

/**
 * Mantém apenas evidência agregada, sem userId, durante 90 dias.
 */
@Schema({ timestamps: true, collection: "personal_data_retentions" })
export class PersonalDataRetention {
    /** Referência aleatória; nunca é derivada de userId, email ou outro PII. */
    @Prop({ required: true, unique: true, index: true })
    receiptReference!: string;

    @Prop({ required: true })
    registryVersion!: string;

    @Prop({ type: Object, required: true })
    affectedCounts!: Record<string, number>;

    @Prop({ required: true })
    expiresAt!: Date;
}

export const PersonalDataRetentionSchema = SchemaFactory.createForClass(
    PersonalDataRetention,
);
PersonalDataRetentionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
