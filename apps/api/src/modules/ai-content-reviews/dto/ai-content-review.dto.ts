/**
 * Define contratos de dados usados nas entradas e saídas de revisão docente de conteúdos IA.
 */
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsIn,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import {
    AiContentReviewStatus,
    AiContentReviewType,
} from "../schemas/ai-content-review.schema.js";

/**
 * Dados para criar revisão docente pendente.
 */
export class CreateAiContentReviewDto {
    @IsString()
    materialId!: string;

    @IsIn(["SUMMARY", "QUIZ"])
    contentType!: AiContentReviewType;

    @IsObject()
    contentJson!: Record<string, unknown>;
}

/**
 * Decisão docente sobre conteúdo IA.
 */
export class DecideAiContentReviewDto {
    @IsIn(["APPROVED", "REJECTED"])
    status!: Exclude<AiContentReviewStatus, "PENDING">;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    teacherComment?: string;
}

/**
 * Respostas transitórias de um aluno a um quiz aprovado.
 */
export class SubmitApprovedAiQuizAttemptDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(3, { each: true })
    selectedOptionIndexes!: number[];
}
