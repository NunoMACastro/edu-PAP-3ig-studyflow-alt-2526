/**
 * Define contratos de dados usados nas entradas e saídas de IA coletiva do grupo.
 */
import { IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido para IA coletiva com fontes partilhadas do grupo.
 */
export class AskStudyGroupAiDto {
    /**
     * Pergunta coletiva.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;

    /**
     * Partilhas específicas a usar como fontes, quando o grupo as escolher.
     */
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    sourceShareIds?: string[];
}
