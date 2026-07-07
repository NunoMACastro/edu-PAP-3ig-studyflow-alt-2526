/**
 * Define contratos de dados usados nas entradas e saídas de voz da IA docente.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

/**
 * Dados editáveis da voz docente textual.
 */
export class UpdateTeacherAiVoiceDto {
    @IsIn(["CALM", "DIRECT", "SOCRATIC"])
    tone!: "CALM" | "DIRECT" | "SOCRATIC";

    @IsIn(["SHORT", "BALANCED", "DETAILED"])
    detailLevel!: "SHORT" | "BALANCED" | "DETAILED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(180, { each: true })
    rules?: string[];
}
