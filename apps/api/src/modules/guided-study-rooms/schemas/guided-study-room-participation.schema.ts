/**
 * Persistência da participação factual de alunos em salas guiadas.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type GuidedStudyRoomParticipationDocument =
    HydratedDocument<GuidedStudyRoomParticipation>;
export type GuidedStudyRoomParticipationStatus = "VIEWED" | "COMPLETED";

/** Participação monotónica de um aluno numa sala guiada. */
@Schema({ timestamps: true, collection: "guided_study_room_participations" })
export class GuidedStudyRoomParticipation {
    @Prop({ type: Types.ObjectId, ref: "GuidedStudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["VIEWED", "COMPLETED"] })
    status!: GuidedStudyRoomParticipationStatus;

    @Prop({ required: true })
    firstViewedAt!: Date;

    @Prop({ required: true })
    lastViewedAt!: Date;

    @Prop()
    completedAt?: Date;
}

export const GuidedStudyRoomParticipationSchema =
    SchemaFactory.createForClass(GuidedStudyRoomParticipation);
GuidedStudyRoomParticipationSchema.index(
    { roomId: 1, studentId: 1 },
    { unique: true },
);
