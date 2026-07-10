/**
 * Define o modelo persistido de mensagens do chat professor-aluno por disciplina.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de mensagem do chat professor-aluno.
 */
export type TeacherStudentChatMessageDocument =
    HydratedDocument<TeacherStudentChatMessage>;

/**
 * Papel público do autor da mensagem.
 */
export type TeacherStudentChatAuthorRole = "STUDENT" | "TEACHER";

/**
 * Mensagem persistida no canal da disciplina.
 */
@Schema({ timestamps: true, collection: "teacher_student_chat_messages" })
export class TeacherStudentChatMessage {
    @Prop({
        type: Types.ObjectId,
        ref: "TeacherStudentChatThread",
        required: true,
        index: true,
    })
    threadId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", index: true })
    authorUserId!: Types.ObjectId;

    @Prop({ enum: ["STUDENT", "TEACHER"], index: true })
    authorRole!: TeacherStudentChatAuthorRole;

    @Prop({ trim: true, minlength: 1, maxlength: 4000 })
    text!: string;

    @Prop({ trim: true, maxlength: 64 })
    clientMessageId?: string;

    @Prop()
    tombstonedAt?: Date;
}

export const TeacherStudentChatMessageSchema = SchemaFactory.createForClass(
    TeacherStudentChatMessage,
);
TeacherStudentChatMessageSchema.index({ threadId: 1, createdAt: -1 });
TeacherStudentChatMessageSchema.index({
    threadId: 1,
    authorUserId: 1,
    createdAt: -1,
});
TeacherStudentChatMessageSchema.index(
    { threadId: 1, authorUserId: 1, clientMessageId: 1 },
    {
        unique: true,
        partialFilterExpression: { clientMessageId: { $type: "string" } },
    },
);
