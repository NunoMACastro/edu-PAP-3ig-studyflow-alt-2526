/**
 * Define contratos de dados usados nas entradas e saídas de turma projects.
 */
import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ClassProjectStatus } from "../schemas/class-project.schema.js";

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
    @IsString()
    @MaxLength(120)
    subject?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsIn(["DRAFT", "PUBLISHED"])
    status?: ClassProjectStatus;
}
