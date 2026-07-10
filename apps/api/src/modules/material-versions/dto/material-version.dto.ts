/**
 * Define contratos de dados usados nas entradas e saídas de material versions.
 */
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados opcionais para criar uma versão de material indexado.
 */
export class CreateMaterialVersionDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    changeSummary?: string;
}
