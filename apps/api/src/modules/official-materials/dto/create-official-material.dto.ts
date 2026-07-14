/**
 * Define contratos de dados usados nas entradas e saídas de materiais oficiais.
 */
import { IsIn, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from "class-validator";

/**
 * Dados para criar material oficial de disciplina.
 */
export class CreateOfficialMaterialDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsIn(["TEXT", "URL", "MARKDOWN"])
    type!: "TEXT" | "URL" | "MARKDOWN";

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "TEXT")
    @IsString()
    @MinLength(20)
    @MaxLength(20000)
    textContent?: string;

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "URL")
    @IsUrl({ protocols: ["http", "https"], require_protocol: true })
    sourceUrl?: string;

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "MARKDOWN")
    @IsString()
    @MaxLength(20000)
    markdownSource?: string;

}
