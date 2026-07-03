/**
 * Define payload administrativo de política de modelo IA.
 */
import { IsBoolean, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/**
 * Dados editáveis de modelo e limites técnicos.
 */
export class UpsertAiModelPolicyDto {
    @IsBoolean()
    enabled!: boolean;

    @IsString()
    @MinLength(2)
    @MaxLength(40)
    provider!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(80)
    model!: string;

    @IsInt()
    @Min(1000)
    @Max(30000)
    timeoutMs!: number;

    @IsInt()
    @Min(1)
    @Max(100)
    maxSourceCount!: number;

    @IsInt()
    @Min(500)
    @Max(50000)
    maxPromptChars!: number;
}
