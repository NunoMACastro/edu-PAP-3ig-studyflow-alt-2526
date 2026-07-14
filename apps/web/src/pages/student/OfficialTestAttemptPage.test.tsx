/**
 * Testa o bloqueio visual de soluções em tentativas oficiais.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    listStudentOfficialTests,
    submitOfficialTestAttempt,
} from "../../lib/apiClient.js";
import { OfficialTestAttemptPage } from "./OfficialTestAttemptPage.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...actual,
        listStudentOfficialTests: vi.fn(),
        submitOfficialTestAttempt: vi.fn(),
    };
});

describe("OfficialTestAttemptPage", () => {
    beforeEach(() => {
        vi.mocked(submitOfficialTestAttempt).mockReset();
        vi.mocked(listStudentOfficialTests).mockReset().mockResolvedValue([
            {
                _id: "test-1",
                subjectId: "subject-1",
                title: "Mini-teste",
                status: "PUBLISHED",
                questions: [
                    { statement: "Pergunta?", options: ["A", "B", "C", "D"] },
                ],
                attemptsUsed: 1,
                attemptsRemaining: 2,
                maxAttempts: 3,
                canSubmit: true,
                blockedReason: null,
                latestAttempt: attempt(false, 1, [
                    { questionIndex: 0, selectedOptionIndex: 1 },
                ]),
            },
        ]);
    });

    it("não marca a solução depois da primeira tentativa", async () => {
        render(<OfficialTestAttemptPage subjectId="subject-1" />);

        expect(
            await screen.findByText(/As soluções completas ficam disponíveis/),
        ).toBeTruthy();
        expect(screen.queryByText(/\(correta\)/)).toBeNull();
    });

    it("mostra a solução quando a terceira tentativa a desbloqueia", async () => {
        vi.mocked(listStudentOfficialTests).mockResolvedValueOnce([{
            _id: "test-1",
            subjectId: "subject-1",
            title: "Mini-teste",
            status: "PUBLISHED",
            questions: [{ statement: "Pergunta?", options: ["A", "B", "C", "D"] }],
            attemptsUsed: 3,
            attemptsRemaining: 0,
            maxAttempts: 3,
            canSubmit: false,
            blockedReason: "ATTEMPT_LIMIT_REACHED",
            latestAttempt: attempt(true, 3, [
                {
                    questionIndex: 0,
                    selectedOptionIndex: 1,
                    correctOptionIndex: 1,
                    isCorrect: true,
                },
            ]),
        }]);
        render(<OfficialTestAttemptPage subjectId="subject-1" />);

        expect(await screen.findByText("B (correta)")).toBeTruthy();
    });

    it("distingue fecho antecipado de três tentativas usadas", async () => {
        vi.mocked(listStudentOfficialTests).mockResolvedValueOnce([
            {
                _id: "test-1",
                subjectId: "subject-1",
                title: "Mini-teste",
                status: "CLOSED",
                questions: [
                    { statement: "Pergunta?", options: ["A", "B", "C", "D"] },
                ],
                attemptsUsed: 0,
                attemptsRemaining: 0,
                maxAttempts: 3,
                canSubmit: false,
                blockedReason: "TEST_CLOSED",
            },
        ]);

        render(<OfficialTestAttemptPage subjectId="subject-1" />);
        expect(
            await screen.findByText("O mini-teste foi encerrado pelo professor."),
        ).toBeTruthy();
        expect(screen.queryByText(/Já utilizaste as três/)).toBeNull();
    });

    it("isola erro de submissão sem substituir a lista já carregada", async () => {
        const user = userEvent.setup();
        vi.mocked(listStudentOfficialTests).mockResolvedValueOnce([{
            _id: "test-1",
            subjectId: "subject-1",
            title: "Mini-teste",
            status: "PUBLISHED",
            questions: [{ statement: "Pergunta?", options: ["A", "B", "C", "D"] }],
            attemptsUsed: 0,
            attemptsRemaining: 3,
            maxAttempts: 3,
            canSubmit: true,
            blockedReason: null,
        }]);
        vi.mocked(submitOfficialTestAttempt).mockRejectedValueOnce(
            new Error("Falha controlada ao submeter."),
        );

        render(<OfficialTestAttemptPage subjectId="subject-1" />);
        await user.click(await screen.findByRole("radio", { name: "A" }));
        await user.click(screen.getByRole("button", { name: "Submeter respostas" }));

        expect(await screen.findByRole("alert")).toHaveProperty(
            "textContent",
            "Falha controlada ao submeter.",
        );
        expect(screen.getByRole("heading", { name: "Mini-teste" })).toBeTruthy();
        await waitFor(() => expect(submitOfficialTestAttempt).toHaveBeenCalledTimes(1));
        expect(listStudentOfficialTests).toHaveBeenCalledTimes(1);
    });
});

function attempt(
    solutionUnlocked: boolean,
    attemptNumber: number,
    results: Array<{
        questionIndex: number;
        selectedOptionIndex: number;
        correctOptionIndex?: number;
        isCorrect?: boolean;
    }>,
) {
    return {
        _id: `attempt-${attemptNumber}`,
        testId: "test-1",
        subjectId: "subject-1",
        classId: "class-1",
        studentId: "student-1",
        attemptNumber,
        attemptsRemaining: 3 - attemptNumber,
        selectedOptionIndexes: [1],
        correctAnswers: 1,
        totalQuestions: 1,
        percentage: 100,
        solutionUnlocked,
        results,
        answeredAt: "2026-07-09T10:00:00.000Z",
    };
}
