/**
 * Define contratos de dados usados nas entradas e saídas de turma ai.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido do aluno à IA limitada da disciplina.
 */
export class AskClassAiDto {
    @IsString()
    @MinLength(4)
    @MaxLength(1000)
    question!: string;
}
