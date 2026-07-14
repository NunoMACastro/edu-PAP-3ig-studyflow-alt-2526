/** Contrato mínimo aceite ao registar o último contexto aberto pelo aluno. */
import { IsIn, IsMongoId } from "class-validator";
import {
    STUDENT_CONTEXT_KINDS,
    type StudentRecentContextKind,
} from "../schemas/student-recent-context.schema.js";

export class UpdateRecentContextDto {
    @IsIn(STUDENT_CONTEXT_KINDS)
    kind!: StudentRecentContextKind;

    @IsMongoId()
    contextId!: string;
}
