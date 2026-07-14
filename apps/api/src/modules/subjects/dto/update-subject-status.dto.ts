/** Contrato explícito para arquivar ou restaurar uma disciplina. */
import { IsIn } from "class-validator";
import {
    SUBJECT_STATUSES,
    SubjectStatus,
} from "../schemas/subject.schema.js";

export class UpdateSubjectStatusDto {
    @IsIn(SUBJECT_STATUSES)
    status!: SubjectStatus;
}
