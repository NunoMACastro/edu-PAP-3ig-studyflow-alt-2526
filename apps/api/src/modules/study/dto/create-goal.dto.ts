/**
 * Define contratos de dados usados nas entradas e saídas de study.
 */
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Dados para criar um objetivo pessoal de estudo.
 */
export class CreateGoalDto {
    @IsString()
    @MaxLength(120)
    title!: string;

    @IsOptional()
    @IsString()
    targetDate?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}

/**
 * Campos editáveis de um objetivo pessoal de estudo.
 */
export class UpdateGoalDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    title?: string;

    @IsOptional()
    @IsString()
    targetDate?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;
}
