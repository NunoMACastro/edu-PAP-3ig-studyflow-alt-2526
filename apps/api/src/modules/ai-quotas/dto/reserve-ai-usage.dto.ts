// apps/api/src/modules/ai-quotas/dto/reserve-ai-usage.dto.ts
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from "class-validator";
import { AiModelPurpose } from "../../ai-model-policies/dto/upsert-ai-model-policy.dto.js";
import { AiQuotaScopeType } from "./upsert-ai-quota-policy.dto.js";

/**
 * Reserva de consumo feita por um service IA antes do provider.
 */
export class ReserveAiUsageDto {
    @IsEnum(AiQuotaScopeType)
    scopeType!: AiQuotaScopeType;

    @IsOptional()
    @IsMongoId()
    scopeId?: string;

    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsInt()
    @Min(1)
    @Max(10000)
    units!: number;
}