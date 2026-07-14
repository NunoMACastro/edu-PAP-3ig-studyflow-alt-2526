/**
 * Define limites mensais predefinidos para contextos sem política específica.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";
import { AiQuotaScope } from "./ai-quota-policy.schema.js";

export type AiQuotaDefaultPolicyDocument =
    HydratedDocument<AiQuotaDefaultPolicy>;
export type AiQuotaDefaultPolicySource = "DEMO_SEED" | "E2E_SEED";

/**
 * Configuração técnica sem identificadores pessoais. O limite é aplicado por
 * alvo real; este documento nunca acumula consumo partilhado.
 */
@Schema({ timestamps: true, collection: "ai_quota_default_policies" })
export class AiQuotaDefaultPolicy {
    @Prop({ required: true, enum: ["USER", "CLASS", "GROUP"], index: true })
    scope!: AiQuotaScope;

    @Prop({ required: true, index: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, min: 1, max: 100000 })
    monthlyLimitUnits!: number;

    @Prop({ required: true, enum: ["DEMO_SEED", "E2E_SEED"] })
    source!: AiQuotaDefaultPolicySource;
}

export const AiQuotaDefaultPolicySchema = SchemaFactory.createForClass(
    AiQuotaDefaultPolicy,
);
AiQuotaDefaultPolicySchema.index(
    { scope: 1, purpose: 1 },
    { unique: true },
);
