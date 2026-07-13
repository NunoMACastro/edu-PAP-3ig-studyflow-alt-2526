/**
 * Define contratos de dados usados nas entradas e saídas de turma progress.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Dados para registar uma nota docente de progresso da turma.
 */
export class CreateClassProgressNoteDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    note!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(12)
    @IsString({ each: true })
    @MaxLength(80, { each: true })
    difficultyTags?: string[];
}
