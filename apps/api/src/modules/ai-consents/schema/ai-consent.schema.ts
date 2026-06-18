// apps/api/src/modules/ai-consents/schemas/ai-consent.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiConsentPurpose } from "../dto/upsert-ai-consent.dto.js";

export type AiConsentDocument = HydratedDocument<AiConsent>;
export type AiConsentStatus = "GRANTED" | "REVOKED";

/**
 * Consentimento IA por utilizador, finalidade e versão.
 */
@Schema({ timestamps: true, collection: "ai_consents" })
export class AiConsent {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiConsentPurpose), index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, trim: true, maxlength: 40 })
    policyVersion!: string;

    @Prop({ required: true, enum: ["GRANTED", "REVOKED"], default: "GRANTED" })
    status!: AiConsentStatus;

    @Prop({ required: true, default: Date.now })
    decidedAt!: Date;
}

export const AiConsentSchema = SchemaFactory.createForClass(AiConsent);
AiConsentSchema.index({ userId: 1, purpose: 1, decidedAt: -1 });