/**
 * Define contratos de dados usados nas entradas e saídas de materials.
 */
import { IsIn, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from "class-validator";

/**
 * Dados para submeter URL ou tópico textual.
 */
export class CreateMaterialDto {
    @IsIn(["URL", "TOPIC", "MARKDOWN"])
    type!: "URL" | "TOPIC" | "MARKDOWN";

    @IsString()
    @MaxLength(160)
    title!: string;

    @IsOptional()
    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    url?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10000)
    topicText?: string;

    @ValidateIf((body: CreateMaterialDto) => body.type === "MARKDOWN")
    @IsString()
    @MaxLength(20000)
    markdownSource?: string;
}
