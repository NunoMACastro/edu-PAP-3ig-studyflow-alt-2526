/**
 * Define contratos de dados usados nas entradas e saídas de ai.
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
 * Dados editáveis do perfil de aprendizagem.
 */
export class UpdateLearningProfileDto {
    @IsOptional()
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace?: "SLOW" | "BALANCED" | "FAST";

    @IsOptional()
    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    difficulties?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(200)
    preferredExplanationStyle?: string;
}
