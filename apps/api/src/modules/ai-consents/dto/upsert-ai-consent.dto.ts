/**
 * Define payload de concessão de consentimento IA.
 */
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Payload para aceitar uma versão de política.
 */
export class UpsertAiConsentDto {
    @IsOptional()
    @IsString()
    @MaxLength(40)
    policyVersion?: string;
}
