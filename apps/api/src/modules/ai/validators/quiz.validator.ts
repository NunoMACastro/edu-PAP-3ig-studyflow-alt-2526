/**
 * Centraliza validações reutilizáveis de ai.
 */
import { BadGatewayException } from "@nestjs/common";

/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type QuizQuestion = {
    question?: unknown;
    options?: unknown;
    correctOptionIndex?: unknown;
    explanation?: unknown;
    sourceMaterialIds?: unknown;
};

/**
 * Valida a estrutura de quiz devolvida pela IA.
 *
 * @param content Conteúdo JSON devolvido pelo provider.
 * @returns Nada quando o quiz cumpre o contrato.
 */
export function validateQuizArtifact(
    content: Record<string, unknown>,
    allowedSourceIds: string[] = [],
): void {
    const questions = content.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
        rejectInvalidQuiz("QUIZ_WITHOUT_QUESTIONS");
    }

    for (const rawQuestion of questions as QuizQuestion[]) {
        if (
            typeof rawQuestion.question !== "string" ||
            rawQuestion.question.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_QUESTION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.options) ||
            rawQuestion.options.length !== 4
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTIONS");
        }

        if (
            !rawQuestion.options.every(
                (option) =>
                    typeof option === "string" && option.trim().length > 0,
            )
        ) {
            rejectInvalidQuiz("INVALID_QUIZ_OPTION_TEXT");
        }

        const normalizedOptions = rawQuestion.options.map((option) =>
            String(option).trim().toLowerCase(),
        );
        if (new Set(normalizedOptions).size !== rawQuestion.options.length) {
            rejectInvalidQuiz("DUPLICATED_QUIZ_OPTIONS");
        }

        const correctOptionIndex = rawQuestion.correctOptionIndex;
        if (
            typeof correctOptionIndex !== "number" ||
            !Number.isInteger(correctOptionIndex) ||
            correctOptionIndex < 0 ||
            correctOptionIndex > 3
        ) {
            rejectInvalidQuiz("INVALID_CORRECT_OPTION_INDEX");
        }

        if (
            typeof rawQuestion.explanation !== "string" ||
            rawQuestion.explanation.trim().length === 0
        ) {
            rejectInvalidQuiz("QUIZ_EXPLANATION_REQUIRED");
        }

        if (
            !Array.isArray(rawQuestion.sourceMaterialIds) ||
            rawQuestion.sourceMaterialIds.length === 0 ||
            !rawQuestion.sourceMaterialIds.every(
                (sourceId) =>
                    typeof sourceId === "string" && sourceId.trim().length > 0,
            )
        ) {
            rejectInvalidQuiz("QUIZ_SOURCE_REQUIRED");
        }

        if (
            allowedSourceIds.length > 0 &&
            !rawQuestion.sourceMaterialIds.every((sourceId) =>
                allowedSourceIds.includes(sourceId as string),
            )
        ) {
            rejectInvalidQuiz("QUIZ_UNKNOWN_SOURCE");
        }
    }
}

/**
 * Lança erro padronizado para quizzes inválidos.
 *
 * @param code Código técnico do contrato quebrado.
 * @returns Nunca retorna; lança exceção.
 */
function rejectInvalidQuiz(code: string): never {
    throw new BadGatewayException({
        code,
        message: "A IA devolveu um quiz com formato inválido. Tenta novamente.",
    });
}
