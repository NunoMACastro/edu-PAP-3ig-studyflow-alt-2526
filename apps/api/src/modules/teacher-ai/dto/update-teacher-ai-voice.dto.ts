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

export const MAX_TEACHER_AI_VOICE_RULES = 12;

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
    @ArrayMaxSize(MAX_TEACHER_AI_VOICE_RULES)
    @IsString({ each: true })
    @MaxLength(180, { each: true })
    rules?: string[];
}
