/**
 * Define contratos de dados usados nas entradas e saídas de classes.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados de criação de turma oficial.
 */
export class CreateClassDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(40)
    code!: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    schoolYear!: string;
}
