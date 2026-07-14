/**
 * Define contratos de dados usados nas entradas e saídas de ai.
 */
import { Allow } from "class-validator";

/**
 * Respostas escolhidas pelo aluno num quiz gerado pela IA.
 */
export class CreateQuizAttemptDto {
    @Allow()
    answers!: number[];
}
