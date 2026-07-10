/**
 * Define consumo mensal de IA.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";
import { AiQuotaScope } from "./ai-quota-policy.schema.js";

export type AiQuotaUsageDocument = HydratedDocument<AiQuotaUsage>;

/**
 * Contador mensal simples e auditável.
 */
@Schema({ timestamps: true, collection: "ai_quota_usage" })
export class AiQuotaUsage {
    @Prop({ required: true, enum: ["USER", "CLASS", "GROUP"], index: true })
    scope!: AiQuotaScope;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    targetId!: Types.ObjectId;

    @Prop({ required: true, index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, match: /^\d{4}-\d{2}$/ })
    period!: string;

    @Prop({ required: true, min: 0, default: 0 })
    usedUnits!: number;
}

export const AiQuotaUsageSchema = SchemaFactory.createForClass(AiQuotaUsage);
AiQuotaUsageSchema.index({ scope: 1, targetId: 1, purpose: 1, period: 1 }, { unique: true });
