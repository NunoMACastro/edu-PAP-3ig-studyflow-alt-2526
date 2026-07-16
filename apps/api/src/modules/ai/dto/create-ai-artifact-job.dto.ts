/**
 * Valida pedidos assíncronos de geração de materiais privados por IA.
 */
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import {
    AI_ARTIFACT_GENERATION_TYPES,
    type AiArtifactGenerationType,
} from "../ai-artifact-generation.types.js";

/**
 * Payload público de um job de resumo, explicação, flashcards ou quiz.
 */
export class CreateAiArtifactJobDto {
    @IsIn(AI_ARTIFACT_GENERATION_TYPES)
    type!: AiArtifactGenerationType;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}
