/**
 * Define payload interno/administrativo para reservar consumo IA.
 */
import { IsIn, IsInt, IsMongoId, Max, Min } from "class-validator";
import { AiConsentPurpose } from "../../ai-consents/schemas/ai-consent.schema.js";
import { AiQuotaScope } from "../schemas/ai-quota-policy.schema.js";

/**
 * Reserva de unidades de IA antes do provider.
 */
export class ReserveAiUsageDto {
    @IsIn(["USER", "CLASS", "GROUP"])
    scope!: AiQuotaScope;

    @IsMongoId()
    targetId!: string;

    @IsIn(["PRIVATE_AREA_AI", "GROUP_AI", "CLASS_AI", "PROJECT_AI", "SOURCE_GROUNDED_AI", "EXTERNAL_KNOWLEDGE_AI", "ADAPTIVE_EXPLANATION", "SUMMARY", "STUDY_TOOL", "ROOM_AI"])
    purpose!: AiConsentPurpose;

    @IsInt()
    @Min(1)
    @Max(1000)
    units!: number;
}
