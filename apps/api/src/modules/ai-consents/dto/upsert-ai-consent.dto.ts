// apps/api/src/modules/ai-consents/dto/upsert-ai-consent.dto.ts
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export enum AiConsentPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
    STUDY_GROUP_AI = "STUDY_GROUP_AI",
    CLASS_AI = "CLASS_AI",
    PROJECT_AI = "PROJECT_AI",
}

export const CURRENT_AI_CONSENT_VERSION = "2026-06-16";

/**
 * Entrada para conceder consentimento IA numa finalidade.
 */
export class UpsertAiConsentDto {
    @IsEnum(AiConsentPurpose)
    purpose!: AiConsentPurpose;

    /** Versão aceite pelo utilizador, registada para auditoria futura. */
    @IsString()
    @MinLength(10)
    @MaxLength(40)
    policyVersion!: string;
}