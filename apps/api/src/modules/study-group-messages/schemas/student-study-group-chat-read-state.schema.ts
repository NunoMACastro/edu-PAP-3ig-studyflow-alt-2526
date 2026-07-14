/** Cursor pessoal de leitura do chat de um grupo de estudo. */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import type { CollaborationKind } from "../../study-rooms/schemas/study-room.schema.js";

export type StudentStudyGroupChatReadStateDocument =
    HydratedDocument<StudentStudyGroupChatReadState>;

/** Estado de leitura isolado por aluno e grupo. */
@Schema({ timestamps: true, collection: "student_study_group_chat_read_states" })
export class StudentStudyGroupChatReadState {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, enum: ["STUDY_GROUP", "STUDY_ROOM"], index: true })
    collaborationKind!: CollaborationKind;

    @Prop({ required: true })
    lastReadAt!: Date;

    @Prop({ type: Types.ObjectId, ref: "StudyGroupMessage" })
    lastReadMessageId?: Types.ObjectId;
}

export const StudentStudyGroupChatReadStateSchema =
    SchemaFactory.createForClass(StudentStudyGroupChatReadState);
StudentStudyGroupChatReadStateSchema.index(
    { studentId: 1, groupId: 1, collaborationKind: 1 },
    { unique: true },
);
