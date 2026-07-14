/** Define o contrato de edição otimista de Markdown oficial. */
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class UpdateOfficialMarkdownDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title?: string;

    @IsString()
    @MaxLength(20000)
    markdownSource!: string;

    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    expectedRevision!: number;
}
