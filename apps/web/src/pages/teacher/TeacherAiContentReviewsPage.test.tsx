/** Testa a fila docente de curadoria IA sem detalhes técnicos visíveis. */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    createAiContentReview: vi.fn(),
    decideAiContentReview: vi.fn(),
    listAiContentReviews: vi.fn(),
    listOfficialMaterials: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { TeacherAiContentReviewsPage } from "./TeacherAiContentReviewsPage.js";

const review = {
    _id: "review-id",
    subjectId: "subject-id",
    materialId: "material-id",
    teacherId: "teacher-id",
    materialTitle: "Funções quadráticas",
    materialStatus: "PROCESSED" as const,
    contentType: "SUMMARY" as const,
    contentJson: { text: "Resumo oficial suficientemente longo para revisão." },
    status: "PENDING" as const,
    createdAt: "2026-07-10T10:00:00.000Z",
    decidedAt: null,
};

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listAiContentReviews.mockResolvedValue([review]);
    api.listOfficialMaterials.mockResolvedValue([{
        _id: "material-id",
        subjectId: "subject-id",
        classId: "class-id",
        teacherId: "teacher-id",
        title: "Funções quadráticas",
        type: "TEXT",
        status: "PROCESSED",
    }]);
    api.decideAiContentReview.mockResolvedValue({
        ...review,
        status: "APPROVED",
        teacherComment: "Conteúdo confirmado.",
        decidedAt: "2026-07-11T10:00:00.000Z",
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    window.history.replaceState({}, "", "/app/professor/disciplinas/subject-id/revisoes-ia");
});

describe("TeacherAiContentReviewsPage", () => {
    it("mostra a fila por material e aprova com comentário sem JSON ou ids", async () => {
        const user = userEvent.setup();
        render(<TeacherAiContentReviewsPage subjectId="subject-id" />);

        expect(await screen.findByText("Funções quadráticas")).toBeTruthy();
        expect(screen.queryByText("material-id")).toBeNull();
        expect(screen.queryByText(/contentJson/)).toBeNull();

        await user.click(screen.getByRole("button", { name: "Rever conteúdo" }));
        const dialog = screen.getByRole("dialog", { name: "Resumo para revisão" });
        await user.type(within(dialog).getByLabelText("Comentário docente"), "Conteúdo confirmado.");
        await user.click(within(dialog).getByRole("button", { name: "Aprovar" }));

        expect(api.decideAiContentReview).toHaveBeenCalledWith("review-id", {
            status: "APPROVED",
            teacherComment: "Conteúdo confirmado.",
        });
        expect(await screen.findByText(/disponível aos alunos/)).toBeTruthy();
    });

    it("usa um seletor de materiais processados na criação", async () => {
        const user = userEvent.setup();
        render(<TeacherAiContentReviewsPage subjectId="subject-id" />);
        await screen.findByText("Funções quadráticas");

        await user.click(screen.getByRole("button", { name: "Nova revisão" }));
        const dialog = screen.getByRole("dialog", { name: "Criar revisão IA" });
        expect(within(dialog).getByRole("option", { name: "Funções quadráticas" })).toBeTruthy();
        expect(within(dialog).queryByText(/ID do material/i)).toBeNull();
    });
});
