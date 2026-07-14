/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo guiado.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsISO8601,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    MaxLength,
    Max,
    Min,
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
    @IsMongoId()
    subjectId?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @IsMongoId({ each: true })
    materialIds?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(500)
    goal?: string;

    @IsOptional()
    @IsMongoId()
    officialTestId?: string;

    @IsOptional()
    @IsISO8601()
    startsAt?: string;

    @IsOptional()
    @IsInt()
    @Min(10)
    @Max(480)
    durationMinutes?: number;

    @IsOptional()
    @IsBoolean()
    aiEnabled?: boolean;
}
