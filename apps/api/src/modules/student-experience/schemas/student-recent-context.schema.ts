/**
 * Persiste apenas a referência mínima necessária para o aluno continuar um
 * contexto de aprendizagem noutro dispositivo.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export const STUDENT_CONTEXT_KINDS = [
    "SUBJECT",
    "STUDY_AREA",
    "GUIDED_ROOM",
    "STUDY_ROOM",
    "STUDY_GROUP",
    "OFFICIAL_TEST",
    "CLASS_PROJECT",
] as const;

export type StudentRecentContextKind =
    (typeof STUDENT_CONTEXT_KINDS)[number];
export type StudentRecentContextDocument =
    HydratedDocument<StudentRecentContext>;

/** Referência privada sem títulos, rotas ou conteúdo fornecido pelo cliente. */
@Schema({ timestamps: true, collection: "student_recent_contexts" })
export class StudentRecentContext {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: STUDENT_CONTEXT_KINDS })
    kind!: StudentRecentContextKind;

    @Prop({ type: Types.ObjectId, required: true })
    contextId!: Types.ObjectId;

    @Prop({ required: true, default: Date.now, index: true })
    lastOpenedAt!: Date;
}

export const StudentRecentContextSchema =
    SchemaFactory.createForClass(StudentRecentContext);

StudentRecentContextSchema.index(
    { userId: 1, kind: 1, contextId: 1 },
    { unique: true },
);
StudentRecentContextSchema.index({ userId: 1, lastOpenedAt: -1 });
