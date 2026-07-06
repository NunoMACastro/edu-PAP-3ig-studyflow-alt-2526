// apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    Max,
    Min,
} from "class-validator";

/**
 * DTO usado quando um aluno submete respostas para um teste oficial publicado.
 *
 * O frontend envia apenas índices de opções. O backend obtém `studentId`,
 * `subjectId`, `classId`, perguntas e respostas corretas a partir da sessão
 * e da base de dados, evitando manipulação de identidade ou pontuação.
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