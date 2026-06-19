// apps/api/src/modules/ai-quotas/schemas/ai-quota-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "../dto/upsert-ai-quota-policy.dto.js";

export type AiQuotaPolicyDocument = HydratedDocument<AiQuotaPolicy>;

/**
 * Limite mensal configurado por admin.
 */
@Schema({ timestamps: true, collection: "ai_quota_policies" })
export class AiQuotaPolicy {
    @Prop({ required: true, enum: Object.values(AiQuotaScopeType), index: true })
    scopeType!: AiQuotaScopeType;

    @Prop({ type: Types.ObjectId, index: true })
    scopeId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, min: 1, max: 100000 })
    monthlyLimit!: number;
}

export const AiQuotaPolicySchema = SchemaFactory.createForClass(AiQuotaPolicy);
AiQuotaPolicySchema.index({ scopeType: 1, scopeId: 1, purpose: 1 }, { unique: true });