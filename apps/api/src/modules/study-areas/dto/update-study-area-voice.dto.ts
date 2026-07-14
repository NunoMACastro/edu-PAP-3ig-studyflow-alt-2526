/**
 * Define contratos de dados usados nas entradas e saídas de study áreas.
 */
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export const VOICE_TONES = [
    "simple",
    "rigorous",
    "step_by_step",
    "examples_first",
] as const;

export const VOICE_DETAIL_LEVELS = ["short", "normal", "detailed"] as const;

/**
 * Preferências de estilo/tom associadas à área de estudo.
 */
export class UpdateStudyAreaVoiceDto {
    @IsIn(VOICE_TONES)
    voiceTone!: "simple" | "rigorous" | "step_by_step" | "examples_first";

    @IsIn(VOICE_DETAIL_LEVELS)
    voiceDetailLevel!: "short" | "normal" | "detailed";

    @IsOptional()
    @IsString()
    @MaxLength(500)
    voiceNotes?: string;
}
