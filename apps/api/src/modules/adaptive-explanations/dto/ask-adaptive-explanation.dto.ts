/**
 * Define contratos de dados usados nas entradas e saídas de adaptive explanations.
 */
import { IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido MF3 para explicação adaptada ao perfil do aluno.
 */
export class AskMf3AdaptiveExplanationDto {
    /**
     * Área de estudo privada do aluno.
     */
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta que deve respeitar o perfil de aprendizagem já existente.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;
}
