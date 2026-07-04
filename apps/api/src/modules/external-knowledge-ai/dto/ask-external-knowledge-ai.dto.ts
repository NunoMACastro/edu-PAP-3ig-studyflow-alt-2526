/**
 * DTO para solicitar resposta de IA com conhecimento externo limitado.
 */

import { IsBoolean, IsString, MinLength } from "class-validator";

/**
 * Payload enviado pelo frontend para obter resposta.
 */
export class AskExternalKnowledgeAiDto {
    @IsString()
    @MinLength(1)
    studyAreaId!: string;

    @IsString()
    @MinLength(3)
    question!: string;

    @IsBoolean()
    allowExternalKnowledge!: boolean;
}