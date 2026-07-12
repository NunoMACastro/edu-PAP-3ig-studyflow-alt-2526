/**
 * Persistência das conversas supervisionadas da IA de uma sala guiada.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    TeacherAiDetailLevel,
    TeacherAiTone,
} from "../../teacher-ai/schemas/teacher-ai-voice.schema.js";
import { TeacherAiVoiceSource } from "../../teacher-ai/teacher-ai-voice.service.js";

export type GuidedStudyRoomAiInteractionDocument =
    HydratedDocument<GuidedStudyRoomAiInteraction>;

/** Interação privada entre um aluno e a IA supervisionada pelo professor. */
@Schema({ timestamps: true, collection: "guided_study_room_ai_interactions" })
export class GuidedStudyRoomAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "GuidedStudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "OfficialMaterial" }], default: [] })
    sourceMaterialIds!: Types.ObjectId[];

    @Prop({ required: true, enum: ["SUBJECT_OVERRIDE", "CLASS_BASE", "DEFAULT"] })
    voiceSource!: TeacherAiVoiceSource;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"] })
    voiceTone!: TeacherAiTone;

    @Prop({ required: true, enum: ["SHORT", "BALANCED", "DETAILED"] })
    voiceDetailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    voiceRulesApplied!: string[];
}

export const GuidedStudyRoomAiInteractionSchema =
    SchemaFactory.createForClass(GuidedStudyRoomAiInteraction);
GuidedStudyRoomAiInteractionSchema.index({ roomId: 1, studentId: 1, _id: -1 });
