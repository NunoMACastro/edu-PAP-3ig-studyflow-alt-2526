/**
 * Valida os campos textuais do multipart de um material oficial em ficheiro.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/** Dados públicos aceites juntamente com o campo multipart `file`. */
export class CreateOfficialFileMaterialDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;
}
