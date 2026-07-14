/** Filtro validado usado nas listagens de disciplinas do aluno. */
import { IsIn, IsOptional } from "class-validator";
import {
    SUBJECT_STATUSES,
    SubjectStatus,
} from "../schemas/subject.schema.js";

export class ListSubjectStatusDto {
    @IsOptional()
    @IsIn(SUBJECT_STATUSES)
    status?: SubjectStatus;
}
