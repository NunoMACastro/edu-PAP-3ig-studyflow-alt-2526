// apps/web/src/lib/apiClient.ts
export type OfficialTestForStudentQuestion = {
    statement: string;
    topic?: string;
    options: string[];
};

export type OfficialTestForStudent = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    description?: string;
    questions: OfficialTestForStudentQuestion[];
    createdAt?: string;
};

export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
};

export type OfficialTestAttemptResult = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: string;
};

/**
 * Lista mini-testes oficiais publicados para um aluno inscrito.
 *
 * @param subjectId Disciplina oficial do aluno.
 * @returns Testes publicados sem respostas corretas.
 */
export function listPublishedOfficialTests(
    subjectId: string,
): Promise<OfficialTestForStudent[]> {
    return requestJson<OfficialTestForStudent[]>(
        `/api/student/subjects/${subjectId}/tests`,
    );
}

/**
 * Submete respostas de aluno para correção backend.
 *
 * @param subjectId Disciplina oficial do aluno.
 * @param testId Teste oficial publicado.
 * @param selectedOptionIndexes Índices escolhidos pelo aluno.
 * @returns Tentativa corrigida no backend.
 */
export function submitOfficialTestAttempt(
    subjectId: string,
    testId: string,
    selectedOptionIndexes: number[],
): Promise<OfficialTestAttemptResult> {
    return requestJson<OfficialTestAttemptResult>(
        `/api/student/subjects/${subjectId}/tests/${testId}/attempts`,
        {
            method: "POST",
            body: JSON.stringify({ selectedOptionIndexes }),
        },
    );
}

export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: string;
};

export type OfficialTestRanking = {
    testId: string;
    subjectId: string;
    classId: string;
    rows: OfficialTestRankingRow[];
};

/**
 * Obtém ranking docente de um mini-teste oficial.
 *
 * @param subjectId Disciplina do professor autenticado.
 * @param testId Mini-teste oficial.
 * @returns Ranking minimizado e autorizado pelo backend.
 */
export function getOfficialTestRanking(
    subjectId: string,
    testId: string,
): Promise<OfficialTestRanking> {
    return requestJson<OfficialTestRanking>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/ranking`,
    );
}