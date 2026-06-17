/**
 * Define contratos de dados usados nas entradas e saídas de sessões de estudo em grupo.
 */
import {
    IsISO8601,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";

/**
 * Dados para agendar uma sessão coletiva de estudo.
 */
export class CreateStudyGroupSessionDto {
    /**
     * Título visível da sessão.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    /**
     * Início em ISO-8601.
     */
    @IsISO8601()
    startsAt!: string;

    /**
     * Duração prevista em minutos.
     */
    @IsInt()
    @Min(10)
    @Max(480)
    durationMinutes!: number;

    /**
     * Objetivo pedagógico curto.
     */
    @IsOptional()
    @IsString()
    @MaxLength(500)
    goal?: string;
}
