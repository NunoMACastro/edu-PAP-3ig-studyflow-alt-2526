/**
 * Calcula a pontuação de tentativas oficiais sem depender de Mongoose ou HTTP.
 */
import { OfficialTestQuestion } from "./schemas/official-test.schema.js";
import { OfficialTestAttemptQuestionResult } from "./schemas/official-test-attempt.schema.js";

/**
 * Resultado agregado da correção de uma tentativa oficial.
 */
export type OfficialTestAttemptScore = {
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
};

/**
 * Compara respostas do aluno com a versão oficial criada pelo professor.
 *
 * @param questions Perguntas oficiais persistidas, incluindo índice correto.
 * @param selectedOptionIndexes Índices escolhidos pelo aluno no formulário.
 * @returns Pontuação agregada e resultado por pergunta.
 */
export function scoreOfficialTestAttempt(
    questions: OfficialTestQuestion[],
    selectedOptionIndexes: number[],
): OfficialTestAttemptScore {
    const results = questions.map((question, questionIndex) => {
        const selectedOptionIndex = selectedOptionIndexes[questionIndex];
        const isCorrect = selectedOptionIndex === question.correctOptionIndex;

        return {
            questionIndex,
            selectedOptionIndex,
            correctOptionIndex: question.correctOptionIndex,
            isCorrect,
        };
    });
    const correctAnswers = results.filter((result) => result.isCorrect).length;

    return {
        correctAnswers,
        totalQuestions: questions.length,
        percentage: Math.round((correctAnswers / questions.length) * 100),
        results,
    };
}
