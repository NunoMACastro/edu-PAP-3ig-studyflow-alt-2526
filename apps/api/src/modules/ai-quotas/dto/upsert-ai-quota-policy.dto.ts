/**
 * Define payload administrativo de quotas IA.
 */
import { IsIn, IsInt, IsMongoId, Max, Min } from "class-validator";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";
import { AiQuotaScope } from "../schemas/ai-quota-policy.schema.js";

/**
 * Dados de criação/alteração de quota mensal.
 */
export class UpsertAiQuotaPolicyDto {
    @IsIn(["USER", "CLASS", "GROUP"])
    scope!: AiQuotaScope;

    @IsMongoId()
    targetId!: string;

    @IsIn(["PRIVATE_AREA_AI", "GROUP_AI", "CLASS_AI", "PROJECT_AI", "SOURCE_GROUNDED_AI", "EXTERNAL_KNOWLEDGE_AI", "ADAPTIVE_EXPLANATION", "SUMMARY", "STUDY_TOOL", "ROOM_AI"])
    purpose!: AiConsentPurpose;

    @IsInt()
    @Min(1)
    @Max(100000)
    monthlyLimitUnits!: number;
}
