// apps/api/src/modules/ai-quotas/schemas/ai-quota-usage.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "../dto/upsert-ai-quota-policy.dto.js";

export type AiQuotaUsageDocument = HydratedDocument<AiQuotaUsage>;

/**
 * Consumo acumulado por período mensal.
 */
@Schema({ timestamps: true, collection: "ai_quota_usage" })
export class AiQuotaUsage {
    @Prop({ required: true, enum: Object.values(AiQuotaScopeType), index: true })
    scopeType!: AiQuotaScopeType;

    @Prop({ type: Types.ObjectId, index: true })
    scopeId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, match: /^\d{4}-\d{2}$/, index: true })
    period!: string;

    @Prop({ required: true, min: 0, default: 0 })
    usedUnits!: number;
}

export const AiQuotaUsageSchema = SchemaFactory.createForClass(AiQuotaUsage);
AiQuotaUsageSchema.index({ scopeType: 1, scopeId: 1, purpose: 1, period: 1 }, { unique: true });