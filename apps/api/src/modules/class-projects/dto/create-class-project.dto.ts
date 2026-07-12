/**
 * Define contratos de dados usados nas entradas e saídas de turma projects.
 */
import { IsDateString, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados de criação de projecto de turma.
 */
export class CreateClassProjectDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(20)
    @MaxLength(12000)
    brief!: string;

    @IsOptional()
    @IsMongoId()
    subjectId?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

}

/** Campos mutáveis enquanto o projeto permanece em rascunho. */
export class UpdateClassProjectDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(20)
    @MaxLength(12000)
    brief?: string;

    @IsOptional()
    @IsMongoId()
    subjectId?: string | null;

    @IsOptional()
    @IsDateString()
    dueDate?: string | null;
}
