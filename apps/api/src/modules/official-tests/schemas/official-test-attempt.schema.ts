// apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Resultado de uma pergunta dentro de uma tentativa oficial.
 */
export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
};

/**
 * Documento Mongoose de tentativas oficiais de aluno.
 */
export type OfficialTestAttemptDocument = HydratedDocument<OfficialTestAttempt>;

/**
 * Tentativa persistida de um aluno sobre um teste oficial publicado.
 */
@Schema({ timestamps: true, collection: "official_test_attempts" })
export class OfficialTestAttempt {
    @Prop({ type: Types.ObjectId, ref: "OfficialTest", required: true, index: true })
    testId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: [Number], required: true })
    selectedOptionIndexes!: number[];

    @Prop({ required: true, min: 0 })
    correctAnswers!: number;

    @Prop({ required: true, min: 1 })
    totalQuestions!: number;

    @Prop({ required: true, min: 0, max: 100 })
    percentage!: number;

    @Prop({ type: [Object], required: true })
    results!: OfficialTestAttemptQuestionResult[];

    @Prop({ required: true })
    answeredAt!: Date;
}

export const OfficialTestAttemptSchema =
    SchemaFactory.createForClass(OfficialTestAttempt);

OfficialTestAttemptSchema.index({ testId: 1, studentId: 1, answeredAt: -1 });
OfficialTestAttemptSchema.index({ subjectId: 1, percentage: -1, answeredAt: 1 });