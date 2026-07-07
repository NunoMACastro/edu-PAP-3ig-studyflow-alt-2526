/**
 * Define contratos de dados usados nas entradas e saídas de students.
 */
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Campos que o aluno pode editar no próprio perfil.
 *
 * O DTO não expõe `userId`, `role`, email ou permissões, prevenindo mass
 * assignment em BK-MF0-03.
 */
export class UpdateStudentProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    year?: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    course?: string;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    className?: string | null;
}
