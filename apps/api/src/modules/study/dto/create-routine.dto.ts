/**
 * Define contratos de dados usados nas entradas e saídas de study.
 */
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsIn,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
} from "class-validator";

export const STUDY_WEEKDAYS = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
] as const;

/**
 * Contrato de rotinas e objetivos de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyWeekday = (typeof STUDY_WEEKDAYS)[number];

/**
 * Dados para criar uma rotina pessoal de estudo.
 */
export class CreateRoutineDto {
    @IsString()
    @MaxLength(120)
    title!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsIn(STUDY_WEEKDAYS, { each: true })
    weekdays!: StudyWeekday[];

    @IsString()
    @MaxLength(5)
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    startTime!: string;

    @IsInt()
    @Min(5)
    @Max(480)
    durationMinutes!: number;
}

/**
 * Campos editáveis de uma rotina pessoal de estudo.
 */
export class UpdateRoutineDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    title?: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsIn(STUDY_WEEKDAYS, { each: true })
    weekdays?: StudyWeekday[];

    @IsOptional()
    @IsString()
    @MaxLength(5)
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    startTime?: string;

    @IsOptional()
    @IsInt()
    @Min(5)
    @Max(480)
    durationMinutes?: number;
}
