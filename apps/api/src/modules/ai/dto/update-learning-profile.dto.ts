// apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
/**
 * Define os dados editáveis do perfil pedagógico.
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
 * Payload usado quando o aluno ajusta ritmo, nível e preferências da IA.
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