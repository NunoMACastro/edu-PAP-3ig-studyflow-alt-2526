/**
 * Define o modelo persistido de voz base da IA docente por turma.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import type {
    TeacherAiDetailLevel,
    TeacherAiTone,
} from "./teacher-ai-voice.schema.js";

/**
 * Documento Mongoose de voz base da IA docente por turma.
 */
export type TeacherClassAiVoiceDocument = HydratedDocument<TeacherClassAiVoice>;

/**
 * Voz pedagógica textual base definida pelo professor para uma turma.
 */
@Schema({ timestamps: true, collection: "teacher_class_ai_voices" })
export class TeacherClassAiVoice {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"], default: "CALM" })
    tone!: TeacherAiTone;

    @Prop({
        required: true,
        enum: ["SHORT", "BALANCED", "DETAILED"],
        default: "BALANCED",
    })
    detailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    rules!: string[];
}

export const TeacherClassAiVoiceSchema =
    SchemaFactory.createForClass(TeacherClassAiVoice);
TeacherClassAiVoiceSchema.index({ classId: 1 }, { unique: true });
TeacherClassAiVoiceSchema.index({ teacherId: 1, classId: 1 });
