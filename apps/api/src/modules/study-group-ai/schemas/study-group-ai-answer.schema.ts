/**
 * Define o modelo persistido de IA coletiva do grupo usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    StudentAiCitationSnapshotRecord,
    StudentAiCitationSnapshotSchema,
} from "../../ai/schemas/student-ai-citation-snapshot.schema.js";

/**
 * Documento Mongoose de IA coletiva do grupo, usado apenas dentro da camada de persistência.
 */
export type StudyGroupAiAnswerDocument = HydratedDocument<StudyGroupAiAnswer>;

/**
 * Classe StudyGroupAiSource usada no domínio de IA coletiva do grupo.
 */
@Schema({ _id: false })
export class StudyGroupAiSource {
    @Prop({ required: true })
    shareId!: string;

    @Prop({ required: true })
    title!: string;
}

export const StudyGroupAiSourceSchema =
    SchemaFactory.createForClass(StudyGroupAiSource);

/**
 * Resposta de IA coletiva associada a um grupo.
 */
@Schema({ timestamps: true })
export class StudyGroupAiAnswer {
    _id!: { toString(): string };

    @Prop({ required: true, type: Types.ObjectId, index: true })
    groupId!: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true })
    question!: string;

    @Prop({ required: true })
    answer!: string;

    @Prop({ required: true, type: [StudyGroupAiSourceSchema] })
    sources!: StudyGroupAiSource[];

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    conversationId?: Types.ObjectId;

    @Prop({ type: [StudentAiCitationSnapshotSchema], default: [] })
    citationSnapshots!: StudentAiCitationSnapshotRecord[];

    @Prop({ required: true, default: false })
    inheritedFromFork!: boolean;

    @Prop({ type: String, index: true })
    migrationRunId?: string;
}

export const StudyGroupAiAnswerSchema =
    SchemaFactory.createForClass(StudyGroupAiAnswer);
StudyGroupAiAnswerSchema.index({ conversationId: 1, studentId: 1, createdAt: -1 });
