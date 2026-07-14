/** Testa o consumo de conteúdo aprovado sem antecipar soluções. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listApprovedAiContent = vi.hoisted(() => vi.fn());
const listApprovedAiQuizAttempts = vi.hoisted(() => vi.fn());
const submitApprovedAiQuizAttempt = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    listApprovedAiContent,
    listApprovedAiQuizAttempts,
    submitApprovedAiQuizAttempt,
}));

import { StudentApprovedAiContentPage } from "./StudentApprovedAiContentPage.js";

beforeEach(() => {
    listApprovedAiContent.mockReset().mockResolvedValue([{
        reviewId: "review-id",
        subjectId: "subject-id",
        material: { id: "material-id", title: "Funções" },
        contentType: "QUIZ",
        approvedAt: "2026-07-11T10:00:00.000Z",
        content: {
            questions: [{
                questionIndex: 0,
                question: "Quanto é dois mais dois?",
                options: ["1", "2", "3", "4"],
            }],
        },
    }]);
    submitApprovedAiQuizAttempt.mockReset().mockResolvedValue({
        attemptId: "attempt-2",
        attemptNumber: 2,
        reviewId: "review-id",
        correctCount: 1,
        totalQuestions: 1,
        scorePercent: 100,
        answeredAt: "2026-07-11T11:00:00.000Z",
        results: [{
            questionIndex: 0,
            selectedOptionIndex: 3,
            correctOptionIndex: 3,
            isCorrect: true,
            explanation: "Dois mais dois são quatro.",
        }],
    });
    listApprovedAiQuizAttempts.mockReset().mockResolvedValue([{
        attemptId: "attempt-1",
        reviewId: "review-id",
        attemptNumber: 1,
        selectedOptionIndexes: [2],
        correctCount: 0,
        totalQuestions: 1,
        scorePercent: 0,
        answeredAt: "2026-07-11T10:30:00.000Z",
    }]);
});

describe("StudentApprovedAiContentPage", () => {
    it("só mostra a solução depois de submeter todas as respostas", async () => {
        const user = userEvent.setup();
        render(<StudentApprovedAiContentPage subjectId="subject-id" />);

        expect(await screen.findByText(/Quanto é dois mais dois/)).toBeTruthy();
        expect(await screen.findByText("Tentativa 1")).toBeTruthy();
        expect(listApprovedAiQuizAttempts).toHaveBeenCalledWith(
            "subject-id",
            "review-id",
        );
        expect(screen.queryByText("Dois mais dois são quatro.")).toBeNull();
        await user.click(screen.getByLabelText("4"));
        await user.click(screen.getByRole("button", { name: "Submeter respostas" }));

        expect(submitApprovedAiQuizAttempt).toHaveBeenCalledWith(
            "subject-id",
            "review-id",
            [3],
        );
        expect(await screen.findByText("Dois mais dois são quatro.")).toBeTruthy();
        expect(screen.getByText(/100%/)).toBeTruthy();
        expect(screen.getByRole("button", { name: "Repetir quiz" })).toBeTruthy();
        expect(listApprovedAiQuizAttempts).toHaveBeenCalledTimes(2);
    });
});
