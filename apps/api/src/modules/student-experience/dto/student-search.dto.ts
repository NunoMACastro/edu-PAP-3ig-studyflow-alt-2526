import { Type } from "class-transformer";
import {
    IsIn,
    IsMongoId,
    IsString,
    MaxLength,
    MinLength,
    ValidateIf,
    ValidateNested,
} from "class-validator";

export class StudentSearchScopeDto {
    @IsIn(["SUBJECT", "STUDY_AREA", "ALL_STUDIES"])
    type!: "SUBJECT" | "STUDY_AREA" | "ALL_STUDIES";

    @ValidateIf((scope: StudentSearchScopeDto) => scope.type !== "ALL_STUDIES")
    @IsString()
    @IsMongoId()
    id?: string;

}

export class StudentSearchDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    query!: string;

    @ValidateNested()
    @Type(() => StudentSearchScopeDto)
    scope!: StudentSearchScopeDto;
}
