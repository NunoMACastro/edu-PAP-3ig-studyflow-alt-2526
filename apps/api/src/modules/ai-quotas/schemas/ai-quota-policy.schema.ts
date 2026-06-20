/**
 * Define políticas administrativas de quota IA.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";

export type AiQuotaPolicyDocument = HydratedDocument<AiQuotaPolicy>;
export type AiQuotaScope = "USER" | "CLASS" | "GROUP";

/**
 * Limite mensal por alvo e finalidade.
 */
@Schema({ timestamps: true, collection: "ai_quota_policies" })
export class AiQuotaPolicy {
    @Prop({ required: true, enum: ["USER", "CLASS", "GROUP"], index: true })
    scope!: AiQuotaScope;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    targetId!: Types.ObjectId;

    @Prop({ required: true, index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, min: 1, max: 100000 })
    monthlyLimitUnits!: number;
}

export const AiQuotaPolicySchema = SchemaFactory.createForClass(AiQuotaPolicy);
AiQuotaPolicySchema.index({ scope: 1, targetId: 1, purpose: 1 }, { unique: true });
