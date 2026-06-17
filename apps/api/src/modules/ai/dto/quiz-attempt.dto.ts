/**
 * Define contratos de dados usados nas entradas e saídas de ai.
 */
export type QuizAttemptQuestionResultDto = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    sourceMaterialIds: string[];
};

/**
 * DTO que define os dados aceites ou devolvidos no fluxo de artefactos de IA.
 */
export type QuizAttemptResultDto = {
    _id: string;
    artifactId: string;
    studyAreaId: string;
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    answeredAt: Date;
    results: QuizAttemptQuestionResultDto[];
};

/**
 * Forma mínima de artefactos de IA aceite por mappers e testes sem exigir documento completo.
 */
type QuizAttemptLike = Omit<QuizAttemptResultDto, "_id" | "artifactId" | "studyAreaId"> & {
    _id: unknown;
    artifactId: unknown;
    studyAreaId: unknown;
    toObject?: () => QuizAttemptLike;
};

/**
 * Converte uma tentativa de quiz no contrato público da MF0.
 *
 * @param attempt Documento Mongoose ou objeto lean.
 * @returns Tentativa sem `userId` nem campos internos Mongo.
 */
export function toQuizAttemptResultDto(
    attempt: QuizAttemptLike,
): QuizAttemptResultDto {
    const value = normalizeDocument(attempt);
    return {
        _id: String(value._id),
        artifactId: String(value.artifactId),
        studyAreaId: String(value.studyAreaId),
        correctCount: value.correctCount,
        totalQuestions: value.totalQuestions,
        scorePercent: value.scorePercent,
        answeredAt: value.answeredAt,
        results: value.results,
    };
}

/**
 * Usa `toObject` quando existe para lidar com documentos Mongoose.
 *
 * @param value Documento ou objeto já serializado.
 * @returns Objeto serializável.
 */
function normalizeDocument<T extends { toObject?: () => T }>(value: T): T {
    return typeof value.toObject === "function" ? value.toObject() : value;
}
