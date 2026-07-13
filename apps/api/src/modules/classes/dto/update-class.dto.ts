/** Contratos de atualização controlada de turmas oficiais. */
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateClassDto {
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
    @MaxLength(20)
    schoolYear?: string;
}
