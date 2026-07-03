// apps/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts
/**
 * Define o payload público de uma explicação adaptada.
 */
import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido para gerar explicação adaptada ao perfil da área do aluno.
 */
export class AskMf3AdaptiveExplanationDto {
    /**
     * Área de estudo privada. O backend confirma ownership antes de gerar resposta.
     */
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta do aluno. O nível e o ritmo vêm do perfil guardado, não deste body.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;
}