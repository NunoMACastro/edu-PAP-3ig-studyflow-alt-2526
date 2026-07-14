/**
 * Define o modelo persistido de threads do chat professor-aluno por disciplina.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de thread do chat professor-aluno.
 */
export type TeacherStudentChatThreadDocument =
    HydratedDocument<TeacherStudentChatThread>;

/**
 * Estados suportados para uma thread de chat da disciplina.
 */
export type TeacherStudentChatThreadStatus = "OPEN" | "ARCHIVED";

/**
 * Thread única de conversa entre o professor responsável e alunos inscritos numa disciplina.
 */
@Schema({ timestamps: true, collection: "teacher_student_chat_threads" })
export class TeacherStudentChatThread {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["OPEN", "ARCHIVED"], default: "OPEN" })
    status!: TeacherStudentChatThreadStatus;
}

export const TeacherStudentChatThreadSchema = SchemaFactory.createForClass(
    TeacherStudentChatThread,
);
TeacherStudentChatThreadSchema.index({ subjectId: 1 }, { unique: true });
