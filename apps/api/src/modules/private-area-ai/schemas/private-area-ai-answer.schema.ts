/**
 * Define o modelo persistido de private área ai usado pelo Mongoose.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
    StudentAiCitationSnapshotRecord,
    StudentAiCitationSnapshotSchema,
} from "../../ai/schemas/student-ai-citation-snapshot.schema.js";

/**
 * Documento Mongoose de IA privada da área de estudo, usado apenas dentro da camada de persistência.
 */
export type PrivateAreaAiAnswerDocument = HydratedDocument<PrivateAreaAiAnswer>;

/**
 * Resposta da IA privada restrita à área de estudo do aluno.
 */
@Schema({ timestamps: true, collection: "private_area_ai_answers" })
export class PrivateAreaAiAnswer {
    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 1000 })
    question!: string;

    @Prop({ required: true, trim: true, minlength: 1, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [Types.ObjectId], default: [] })
    sourceMaterialIds!: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: "StudentAiConversation", index: true })
    conversationId?: Types.ObjectId;

    @Prop({ type: [StudentAiCitationSnapshotSchema], default: [] })
    citationSnapshots!: StudentAiCitationSnapshotRecord[];

    @Prop({ type: String, index: true })
    migrationRunId?: string;
}

export const PrivateAreaAiAnswerSchema =
    SchemaFactory.createForClass(PrivateAreaAiAnswer);
PrivateAreaAiAnswerSchema.index({ studyAreaId: 1, studentId: 1, createdAt: -1 });
PrivateAreaAiAnswerSchema.index({ conversationId: 1, studentId: 1, createdAt: -1 });
