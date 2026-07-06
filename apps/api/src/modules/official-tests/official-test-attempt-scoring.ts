// apps/api/src/modules/official-tests/official-test-attempt-scoring.ts
import { BadRequestException } from "@nestjs/common";
import { OfficialTestQuestion } from "./schemas/official-test.schema.js";

export type OfficialTestAttemptScore = {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
};

/**
 * Calcula a pontuação de uma tentativa oficial.
 *
 * @param questions Perguntas oficiais publicadas pelo professor.
 * @param selectedOptionIndexes Índices escolhidos pelo aluno autenticado.
 * @returns Pontuação agregada da tentativa.
 * @throws BadRequestException quando o número de respostas não corresponde ao teste.
 */
export function scoreOfficialTestAttempt(
    questions: OfficialTestQuestion[],
    selectedOptionIndexes: number[],
): OfficialTestAttemptScore {
    if (questions.length !== selectedOptionIndexes.length) {
        throw new BadRequestException({
            code: "OFFICIAL_TEST_ATTEMPT_INCOMPLETE",
            message: "Responde a todas as perguntas antes de submeter o mini-teste.",
        });
    }

    const correctAnswers = questions.reduce((total, question, index) => {
        const selectedOptionIndex = selectedOptionIndexes[index];
        return total + (question.correctOptionIndex === selectedOptionIndex ? 1 : 0);
    }, 0);

    // A percentagem é calculada no backend para impedir manipulação pela interface.
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    return {
        totalQuestions: questions.length,
        correctAnswers,
        percentage,
    };
}