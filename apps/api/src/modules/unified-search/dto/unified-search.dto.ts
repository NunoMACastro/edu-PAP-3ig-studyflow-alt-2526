/**
 * Define contratos de dados usados nas entradas e saídas de pesquisa unificada.
 */
import {
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Pesquisa textual sobre jobs de indexação autorizados.
 */
export class UnifiedSearchDto {
    /**
     * Termo, tópico ou conceito pesquisado.
     */
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    query!: string;

    /**
     * Jobs `DONE` onde o utilizador já tem autorização.
     */
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    jobIds!: string[];
}
