// apps/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AiModelPurpose, AiProviderName } from "../dto/upsert-ai-model-policy.dto.js";

export type AiModelPolicyDocument = HydratedDocument<AiModelPolicy>;

/**
 * Política de modelo IA por finalidade.
 */
@Schema({ timestamps: true, collection: "ai_model_policies" })
export class AiModelPolicy {
    @Prop({ required: true, unique: true, enum: Object.values(AiModelPurpose), index: true })
    purpose!: AiModelPurpose;

    @Prop({ required: true, enum: Object.values(AiProviderName), default: AiProviderName.OPENAI })
    provider!: AiProviderName;

    @Prop({ required: true, trim: true, maxlength: 80 })
    model!: string;

    @Prop({ required: true, min: 500, max: 50000 })
    maxPromptChars!: number;

    @Prop({ required: true, min: 1000, max: 30000 })
    timeoutMs!: number;

    @Prop({ required: true, default: true })
    enabled!: boolean;
}

export const AiModelPolicySchema = SchemaFactory.createForClass(AiModelPolicy);