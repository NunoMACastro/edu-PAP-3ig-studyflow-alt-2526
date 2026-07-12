/** Contrato explícito para arquivar ou restaurar uma turma. */
import { IsIn } from "class-validator";
import {
    SCHOOL_CLASS_STATUSES,
    SchoolClassStatus,
} from "../schemas/school-class.schema.js";

export class UpdateClassStatusDto {
    @IsIn(SCHOOL_CLASS_STATUSES)
    status!: SchoolClassStatus;
}
