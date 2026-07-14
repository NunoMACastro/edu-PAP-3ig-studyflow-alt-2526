/**
 * Define o modelo persistido de turma ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    StudentAiCitationSnapshotRecord,
    StudentAiCitationSnapshotSchema,
} from "../../ai/schemas/student-ai-citation-snapshot.schema.js";

/**
 * Documento Mongoose de IA da disciplina, usado apenas dentro da camada de persistência.
 */
export type ClassAiInteractionDocument = HydratedDocument<ClassAiInteraction>;

/**
 * Interação IA limitada de uma disciplina/turma.
 */
@Schema({ timestamps: true, collection: "class_ai_interactions" })
export class ClassAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 8000 })
    answer!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "OfficialMaterial" }], default: [] })
    sourceMaterialIds!: Types.ObjectId[];

    @Prop({ type: [String], default: [] })
    voiceRulesApplied!: string[];

    @Prop({ enum: ["SUBJECT_OVERRIDE", "CLASS_BASE", "DEFAULT"], default: "DEFAULT" })
    voiceSource!: "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    conversationId?: Types.ObjectId;

    @Prop({ type: [StudentAiCitationSnapshotSchema], default: [] })
    citationSnapshots!: StudentAiCitationSnapshotRecord[];

    @Prop({ type: String, index: true })
    migrationRunId?: string;
}

export const ClassAiInteractionSchema =
    SchemaFactory.createForClass(ClassAiInteraction);
ClassAiInteractionSchema.index({ subjectId: 1, studentId: 1, createdAt: -1 });
ClassAiInteractionSchema.index({ conversationId: 1, studentId: 1, createdAt: -1 });
