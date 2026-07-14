/** Cursor pessoal de leitura do chat oficial de uma disciplina. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudentSubjectChatReadStateDocument =
    HydratedDocument<StudentSubjectChatReadState>;

@Schema({ timestamps: true, collection: "student_subject_chat_read_states" })
export class StudentSubjectChatReadState {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ required: true })
    lastReadAt!: Date;

    @Prop({ type: Types.ObjectId, ref: "TeacherStudentChatMessage" })
    lastReadMessageId?: Types.ObjectId;
}

export const StudentSubjectChatReadStateSchema =
    SchemaFactory.createForClass(StudentSubjectChatReadState);
StudentSubjectChatReadStateSchema.index(
    { studentId: 1, subjectId: 1 },
    { unique: true },
);
