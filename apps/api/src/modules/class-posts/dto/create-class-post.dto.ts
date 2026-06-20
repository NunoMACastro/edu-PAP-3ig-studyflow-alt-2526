/**
 * Define contratos de dados usados nas entradas e saídas de turma posts.
 */
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados de criação de aviso/publicação.
 */
export class CreateClassPostDto {
    @IsIn(["NOTICE", "POST"])
    type!: "NOTICE" | "POST";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    body!: string;
}
