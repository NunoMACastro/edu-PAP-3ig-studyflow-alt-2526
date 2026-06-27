/**
 * Define payload de regras docentes de acompanhamento.
 */
import { IsInt, IsMongoId, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

/**
 * Dados necessários para configurar uma regra de aluno inativo.
 */
export class CreateFollowUpAlertRuleDto {
    @IsMongoId()
    classId!: string;

    @IsInt()
    @Min(1)
    @Max(90)
    inactiveDays!: number;

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    message!: string;
}
