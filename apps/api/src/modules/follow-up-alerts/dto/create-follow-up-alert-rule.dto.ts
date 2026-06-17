// apps/api/src/modules/follow-up-alerts/dto/create-follow-up-alert-rule.dto.ts
import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/**
 * Entrada para criar uma regra de acompanhamento docente.
 */
export class CreateFollowUpAlertRuleDto {
    @IsMongoId()
    classId!: string;

    /** Janela curta evita regras abusivas ou impossíveis de interpretar. */
    @IsInt()
    @Min(1)
    @Max(60)
    inactivityDays!: number;

    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(500)
    message!: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}