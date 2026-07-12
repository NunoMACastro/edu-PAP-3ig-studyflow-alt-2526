/** DTO de edição integral dos campos mutáveis de uma sala guiada. */
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsISO8601,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";

export class UpdateGuidedStudyRoomDto {
    @IsOptional() @IsString() @MinLength(3) @MaxLength(160) title?: string;
    @IsOptional() @IsString() @MinLength(5) @MaxLength(8000) description?: string;
    @IsOptional() @IsString() @MaxLength(500) goal?: string | null;
    @IsOptional() @IsMongoId() subjectId?: string | null;
    @IsOptional() @IsArray() @ArrayMaxSize(20) @IsMongoId({ each: true }) materialIds?: string[];
    @IsOptional() @IsMongoId() officialTestId?: string | null;
    @IsOptional() @IsISO8601() startsAt?: string | null;
    @IsOptional() @IsInt() @Min(10) @Max(480) durationMinutes?: number | null;
    @IsOptional() @IsBoolean() aiEnabled?: boolean;
}
