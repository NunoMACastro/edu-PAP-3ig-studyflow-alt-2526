/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import { IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

/**
 * Dados para criar uma sala de estudo.
 */
export class CreateStudyRoomDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsIn(["FREE", "SUBJECT"])
    type!: "FREE" | "SUBJECT";

    @ValidateIf((body: CreateStudyRoomDto) => body.type === "SUBJECT")
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    disciplineName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
