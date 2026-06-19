// apps/api/src/modules/ai-quotas/dto/upsert-ai-quota-policy.dto.ts
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from "class-validator";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";

export enum AiQuotaScopeType {
    USER = "USER",
    CLASS = "CLASS",
    GROUP = "GROUP",
}

/**
 * Política mensal de quota IA.
 */
export class UpsertAiQuotaPolicyDto {
    @IsEnum(AiQuotaScopeType)
    scopeType!: AiQuotaScopeType;

    @IsOptional()
    @IsMongoId()
    scopeId?: string;

    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsInt()
    @Min(1)
    @Max(100000)
    monthlyLimit!: number;
}