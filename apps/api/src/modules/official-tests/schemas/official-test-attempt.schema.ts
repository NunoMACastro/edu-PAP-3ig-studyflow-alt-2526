/**
 * Define a persistência das tentativas oficiais feitas por alunos.
 */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

/**
 * Documento Mongoose de uma tentativa oficial de aluno.
 */
export type OfficialTestAttemptDocument = HydratedDocument<OfficialTestAttempt>;

/**
 * Resultado calculado para uma pergunta dentro da tentativa.
 */
export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
};

/**
 * Tentativa persistida de um aluno para um mini-teste oficial publicado.
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

    /**
     * Posição única da tentativa no limite de três tentativas por aluno/teste.
     *
     * O índice composto abaixo torna o limite resistente a submissões concorrentes:
     * duas operações não conseguem ocupar a mesma posição.
     */
    @Prop({ required: true, min: 1, max: 3 })
    attemptNumber!: number;

    /**
     * Chave idempotente criada pelo cliente para que um retry de rede não consuma
     * uma nova tentativa nem duplique a pontuação.
     */
    @Prop({ required: true, trim: true })
    attemptKey!: string;

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

OfficialTestAttemptSchema.index({ testId: 1, subjectId: 1, percentage: -1 });
OfficialTestAttemptSchema.index({ studentId: 1, testId: 1, answeredAt: -1 });
OfficialTestAttemptSchema.index(
    { studentId: 1, testId: 1, attemptNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { attemptNumber: { $type: "number" } },
    },
);
OfficialTestAttemptSchema.index(
    { studentId: 1, testId: 1, attemptKey: 1 },
    {
        unique: true,
        partialFilterExpression: { attemptKey: { $type: "string" } },
    },
);
