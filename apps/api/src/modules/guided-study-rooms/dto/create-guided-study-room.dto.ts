/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo guiado.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Dados enviados pelo professor para criar uma sala guiada.
 */
export class CreateGuidedStudyRoomDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(8000)
    description!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    materialIds?: string[];
}
