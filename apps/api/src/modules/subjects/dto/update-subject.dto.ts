/** Campos editáveis de uma disciplina oficial ativa. */
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateSubjectDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
