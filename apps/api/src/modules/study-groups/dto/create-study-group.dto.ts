/**
 * Define contratos de dados usados nas entradas e saídas de grupos de estudo.
 */
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados para criar um grupo de estudo sobre salas existentes.
 */
export class CreateStudyGroupDto {
    /**
     * Nome visível do grupo.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    /**
     * Disciplina ou tema associado quando o grupo não é livre.
     */
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    disciplineName?: string;

    /**
     * Objetivo curto do grupo.
     */
    @IsOptional()
    @IsString()
    @MaxLength(600)
    description?: string;
}
