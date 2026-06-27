/**
 * Define políticas administrativas de modelos IA.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";

export type AiModelPolicyDocument = HydratedDocument<AiModelPolicy>;

/**
 * Configuração por finalidade IA.
 */
@Schema({ timestamps: true, collection: "ai_model_policies" })
export class AiModelPolicy {
    @Prop({ required: true, unique: true })
    purpose!: AiConsentPurpose;

    @Prop({ required: true, default: true })
    enabled!: boolean;

    @Prop({ required: true, trim: true, maxlength: 40, default: "openai" })
    provider!: string;

    @Prop({ required: true, trim: true, maxlength: 80, default: "gpt-5.4-mini" })
    model!: string;

    @Prop({ required: true, min: 1000, max: 30000, default: 8000 })
    timeoutMs!: number;

    @Prop({ required: true, min: 1, max: 100, default: 10 })
    maxSourceCount!: number;

    @Prop({ required: true, min: 500, max: 50000, default: 12000 })
    maxPromptChars!: number;
}

export const AiModelPolicySchema = SchemaFactory.createForClass(AiModelPolicy);
