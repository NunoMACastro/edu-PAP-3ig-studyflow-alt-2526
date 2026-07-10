/**
 * Define contratos de dados usados nas entradas e saídas de private área ai.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pergunta do aluno ao assistente privado da área.
 */
export class AskPrivateAreaAiDto {
    @IsString()
    @MinLength(3)
    @MaxLength(1000)
    question!: string;
}
