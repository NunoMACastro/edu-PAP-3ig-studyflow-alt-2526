/**
 * Define o modelo persistido de planeamento de projetos com IA usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    TeacherAiDetailLevel,
    TeacherAiTone,
} from "../../teacher-ai/schemas/teacher-ai-voice.schema.js";
import { TeacherAiVoiceSource } from "../../teacher-ai/teacher-ai-voice.service.js";

/**
 * Documento Mongoose de planeamento de projetos com IA, usado apenas dentro da camada de persistência.
 */
export type ProjectAiPlanDocument = HydratedDocument<ProjectAiPlan>;

/**
 * Plano gradual de projecto gerado para um aluno.
 */
@Schema({ timestamps: true, collection: "project_ai_plans" })
export class ProjectAiPlan {
    @Prop({ type: Types.ObjectId, ref: "ClassProject", required: true, index: true })
    projectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 240 })
    studentGoal!: string;

    @Prop({ type: [String], default: [] })
    knownDifficulties!: string[];

    @Prop({ type: [String], required: true })
    steps!: string[];

    @Prop({ trim: true, maxlength: 12000 })
    rationale?: string;

    @Prop({ required: true, enum: ["SUBJECT_OVERRIDE", "CLASS_BASE", "DEFAULT"] })
    voiceSource!: TeacherAiVoiceSource;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"] })
    voiceTone!: TeacherAiTone;

    @Prop({ required: true, enum: ["SHORT", "BALANCED", "DETAILED"] })
    voiceDetailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    voiceRulesApplied!: string[];
}

export const ProjectAiPlanSchema = SchemaFactory.createForClass(ProjectAiPlan);
ProjectAiPlanSchema.index({ projectId: 1, studentId: 1, createdAt: -1 });
