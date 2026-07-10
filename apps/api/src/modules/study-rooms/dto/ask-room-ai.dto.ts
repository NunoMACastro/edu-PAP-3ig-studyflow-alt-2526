/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import { IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido de resposta IA dentro de uma sala.
 */
export class AskRoomAiDto {
    @IsString()
    @MinLength(4)
    @MaxLength(1000)
    question!: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    sourceIds?: string[];
}
