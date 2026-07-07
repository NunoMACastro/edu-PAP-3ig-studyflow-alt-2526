/**
 * Define o contrato de submissão de respostas para mini-testes oficiais.
 */
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Max, Min } from "class-validator";

/**
 * Payload aceite quando um aluno realiza um teste oficial publicado.
 */
export class SubmitOfficialTestAttemptDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(3, { each: true })
    selectedOptionIndexes!: number[];
}
