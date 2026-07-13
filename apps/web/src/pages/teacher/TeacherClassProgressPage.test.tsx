/**
 * Testa o resumo factual da turma e o registo docente append-only.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getTeacherClassSummary = vi.hoisted(() => vi.fn());
const createClassProgressNote = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    getTeacherClassSummary,
    createClassProgressNote,
}));

import { TeacherClassProgressPage } from "./TeacherClassProgressPage.js";

const summary = {
    classId: "class-id",
    className: "12.º A",
    studentsCount: 2,
    subjectsCount: 2,
    publishedTestsCount: 1,
    approvedAiContentCount: 0,
    postCount: 1,
    noteCount: 2,
    difficultyTags: ["derivadas"],
    notes: [
        {
            _id: "note-current",
            classId: "class-id",
            teacherId: "teacher-id",
            title: "Consolidação semanal",
            note: "Rever os exercícios indicados na aula.",
            difficultyTags: ["derivadas"],
            createdAt: "2026-07-10T10:30:00.000Z",
        },
        {
            _id: "note-legacy",
            classId: "class-id",
            teacherId: "teacher-id",
            title: "Nota antiga",
            note: "Registo anterior sem timestamp disponível.",
            difficultyTags: [],
        },
    ],
};

beforeEach(() => {
    getTeacherClassSummary.mockReset().mockResolvedValue(summary);
    createClassProgressNote.mockReset().mockResolvedValue({});
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    window.history.replaceState({}, "", "/app/professor/turmas/class-id/progresso");
});

describe("TeacherClassProgressPage", () => {
    it("mostra apenas contexto factual, atalhos e notas com data", async () => {
        render(<TeacherClassProgressPage classId="class-id" />);

        expect(await screen.findByRole("heading", { name: "Resumo da turma", level: 1 })).toBeTruthy();
        expect(screen.getByText(/12.º A: contexto existente/)).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Contexto da turma" })).toBeTruthy();
        expect(screen.getByText("Mini-testes publicados")).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Registo docente" })).toBeTruthy();
        expect(screen.getByText("10/07/2026")).toBeTruthy();
        expect(screen.getByText("Data não disponível")).toBeTruthy();
        expect(screen.getByText("derivadas")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Gerir alunos" }).getAttribute("href")).toBe(
            "/app/professor/turmas#students-class-id",
        );
        expect(screen.getAllByRole("link", { name: "Centro de Acompanhamento" })[0].getAttribute("href")).toBe(
            "/app/professor/acompanhamento?classId=class-id",
        );
        expect(screen.queryByText(/sinais registados/i)).toBeNull();
        expect(screen.queryByText(/macrofase/i)).toBeNull();
        expect(screen.queryByRole("progressbar")).toBeNull();
        expect(screen.queryByText("Conteúdos aprovados")).toBeNull();
    });

    it("cria uma nota normalizada e confirma sem abandonar a página", async () => {
        const user = userEvent.setup();
        getTeacherClassSummary
            .mockResolvedValueOnce(summary)
            .mockResolvedValueOnce({
                ...summary,
                noteCount: 3,
                notes: [
                    {
                        _id: "note-new",
                        classId: "class-id",
                        teacherId: "teacher-id",
                        title: "Nova observação",
                        note: "A turma consolidou a matéria.",
                        difficultyTags: ["funções", "gráficos"],
                        createdAt: "2026-07-11T08:00:00.000Z",
                    },
                    ...summary.notes,
                ],
            });
        render(<TeacherClassProgressPage classId="class-id" />);
        await screen.findByRole("heading", { name: "Resumo da turma" });

        await user.click(screen.getAllByRole("button", { name: "Nova nota" })[0]);
        await user.type(screen.getByLabelText("Título da nota"), "  Nova observação  ");
        await user.type(screen.getByLabelText("Observações"), "  A turma consolidou a matéria.  ");
        await user.type(screen.getByLabelText("Etiquetas"), " funções, gráficos ");
        await user.click(screen.getByRole("button", { name: "Guardar nota" }));

        expect(createClassProgressNote).toHaveBeenCalledWith("class-id", {
            title: "Nova observação",
            note: "A turma consolidou a matéria.",
            difficultyTags: ["funções", "gráficos"],
        });
        expect(await screen.findByRole("status")).toHaveProperty(
            "textContent",
            "Nota guardada no registo docente.",
        );
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(screen.getByText("Nova observação")).toBeTruthy();
    });

    it("mantém o resumo utilizável quando a criação da nota falha", async () => {
        const user = userEvent.setup();
        createClassProgressNote.mockRejectedValueOnce(new Error("Nota indisponível"));
        render(<TeacherClassProgressPage classId="class-id" />);
        await screen.findByRole("heading", { name: "Resumo da turma" });

        await user.click(screen.getAllByRole("button", { name: "Nova nota" })[0]);
        await user.type(screen.getByLabelText("Título da nota"), "Observação");
        await user.type(screen.getByLabelText("Observações"), "Texto suficiente");
        await user.click(screen.getByRole("button", { name: "Guardar nota" }));

        const dialog = screen.getByRole("dialog", { name: "Nova nota" });
        expect(within(dialog).getByRole("alert")).toHaveProperty("textContent", "Nota indisponível");
        expect(screen.getByRole("heading", { name: "Contexto da turma" })).toBeTruthy();
    });
});
