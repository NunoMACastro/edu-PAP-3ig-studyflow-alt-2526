/**
 * Define contratos de dados usados nas entradas e saídas de ai.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido de explicação adaptativa.
 */
export class AskAdaptiveExplanationDto {
    @IsString()
    @MinLength(4)
    @MaxLength(1000)
    question!: string;
}
