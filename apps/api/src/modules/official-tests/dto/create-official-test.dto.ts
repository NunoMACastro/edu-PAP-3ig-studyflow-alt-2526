/**
 * Define contratos de dados usados nas entradas e saídas de testes oficiais.
 */
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OfficialTestStatus } from "../schemas/official-test.schema.js";

/**
 * DTO que representa dados validados de testes oficiais.
 */
export class CreateOfficialTestQuestionDto {
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    statement!: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;

    @IsArray()
    @ArrayMinSize(4)
    @ArrayMaxSize(4)
    @IsString({ each: true })
    options!: string[];

    @IsInt()
    @Min(0)
    @Max(3)
    correctOptionIndex!: number;
}

/**
 * Dados de criação de teste oficial.
 */
export class CreateOfficialTestDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    description?: string;

    @IsOptional()
    @IsIn(["DRAFT"])
    status?: OfficialTestStatus;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(60)
    @ValidateNested({ each: true })
    @Type(() => CreateOfficialTestQuestionDto)
    questions!: CreateOfficialTestQuestionDto[];
}
