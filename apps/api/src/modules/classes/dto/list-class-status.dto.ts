/** Filtro validado usado pelas listagens de turmas do aluno. */
import { IsIn, IsOptional } from "class-validator";
import {
    SCHOOL_CLASS_STATUSES,
    SchoolClassStatus,
} from "../schemas/school-class.schema.js";

export class ListClassStatusDto {
    @IsOptional()
    @IsIn(SCHOOL_CLASS_STATUSES)
    status?: SchoolClassStatus;
}
