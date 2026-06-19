// apps/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts
import { IsBoolean, IsEnum, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export enum AiModelPurpose {
    PRIVATE_AREA_AI = "PRIVATE_AREA_AI",
    STUDY_GROUP_AI = "STUDY_GROUP_AI",
    CLASS_AI = "CLASS_AI",
    PROJECT_AI = "PROJECT_AI",
    SUMMARY = "SUMMARY",
    STUDY_TOOL = "STUDY_TOOL",
}

export enum AiProviderName {
    OPENAI = "OPENAI",
}

/**
 * Política administrativa de modelo IA.
 */
export class UpsertAiModelPolicyDto {
    @IsEnum(AiModelPurpose)
    purpose!: AiModelPurpose;

    @IsEnum(AiProviderName)
    provider!: AiProviderName;

    @IsString()
    @MinLength(3)
    @MaxLength(80)
    model!: string;

    /** Limita prompt antes de enviar dados ao provider. */
    @IsInt()
    @Min(500)
    @Max(50000)
    maxPromptChars!: number;

    @IsInt()
    @Min(1000)
    @Max(30000)
    timeoutMs!: number;

    @IsBoolean()
    enabled!: boolean;
}