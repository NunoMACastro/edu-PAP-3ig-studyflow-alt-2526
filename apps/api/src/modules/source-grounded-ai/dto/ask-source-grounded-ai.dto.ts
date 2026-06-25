/**
 * DTO de pergunta à IA com fontes obrigatórias.
 *
 * O cliente escolhe fontes visíveis na UI, mas a autorização final dessas
 * fontes acontece no service através do utilizador autenticado.
 */
import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId, IsString, MaxLength } from "class-validator";

export class AskSourceGroundedAiDto {
    /**
     * Jobs de indexação que o aluno pretende usar como fontes.
     * Cada id será validado no backend antes de entrar no prompt.
     */
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(8)
    @IsMongoId({ each: true })
    sourceJobIds!: string[];

    /**
     * Pergunta do aluno, limitada para reduzir abuso e prompts demasiado longos.
     */
    @IsString()
    @MaxLength(800)
    question!: string;
}