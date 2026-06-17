/**
 * Define contratos de dados usados nas entradas e saídas de study áreas.
 */
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Dados para criar uma área de estudo independente.
 */
export class CreateStudyAreaDto {
    @IsString()
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(24)
    color?: string;
}
