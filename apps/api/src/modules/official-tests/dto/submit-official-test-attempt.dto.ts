/**
 * Define o contrato de submissão de respostas para mini-testes oficiais.
 */
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    IsUUID,
    Max,
    Min,
} from "class-validator";

/**
 * Payload aceite quando um aluno realiza um teste oficial publicado.
 */
export class SubmitOfficialTestAttemptDto {
    /**
     * Identifica logicamente uma submissão no browser e permite repetir o mesmo
     * pedido após falha de rede sem gastar outra tentativa.
     */
    @IsUUID("4")
    attemptKey!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(3, { each: true })
    selectedOptionIndexes!: number[];
}
