/**
 * Define o registo canónico, minimizado e imutável de atividade pedagógica
 * associada a uma turma oficial.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/** Fontes oficiais que podem contribuir para a atividade de uma turma. */
export const CLASS_LEARNING_ACTIVITY_TYPES = [
    "OFFICIAL_TEST_ATTEMPT",
    "CLASS_AI_INTERACTION",
    "PROJECT_AI_PLAN",
    "APPROVED_AI_QUIZ_ATTEMPT",
    "GUIDED_ROOM_VIEWED",
    "GUIDED_ROOM_COMPLETED",
    "GUIDED_ROOM_AI_INTERACTION",
    "OFFICIAL_CHAT_MESSAGE",
] as const;

export type ClassLearningActivityType =
    (typeof CLASS_LEARNING_ACTIVITY_TYPES)[number];
export type ClassLearningActivityDocument =
    HydratedDocument<ClassLearningActivity>;

/**
 * Evento append-only sem texto, respostas, notas ou conteúdo de mensagens.
 * `sourceEventKey` torna retries dos fluxos de origem idempotentes.
 */
@Schema({
    timestamps: { createdAt: true, updatedAt: false },
    collection: "class_learning_activities",
})
export class ClassLearningActivity {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", default: null, index: true })
    subjectId?: Types.ObjectId | null;

    @Prop({
        type: String,
        enum: CLASS_LEARNING_ACTIVITY_TYPES,
        required: true,
        index: true,
    })
    type!: ClassLearningActivityType;

    @Prop({ type: Date, required: true, index: true })
    occurredAt!: Date;

    @Prop({ type: String, required: true, trim: true, maxlength: 240 })
    sourceEventKey!: string;
}

export const ClassLearningActivitySchema =
    SchemaFactory.createForClass(ClassLearningActivity);

ClassLearningActivitySchema.index(
    { sourceEventKey: 1 },
    { unique: true },
);
ClassLearningActivitySchema.index(
    { classId: 1, studentId: 1, occurredAt: -1 },
);
ClassLearningActivitySchema.index(
    { studentId: 1, occurredAt: -1 },
);
