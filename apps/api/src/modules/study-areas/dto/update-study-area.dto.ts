/**
 * Define contratos de dados usados nas entradas e saídas de study áreas.
 */
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Dados editáveis de uma área de estudo.
 */
export class UpdateStudyAreaDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(24)
    color?: string;

    @IsOptional()
    @IsBoolean()
    archived?: boolean;
}
