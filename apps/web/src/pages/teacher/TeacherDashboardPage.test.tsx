/**
 * Testa o dashboard docente com agregados ricos e sem dados individuais.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getTeacherDashboard = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    getTeacherDashboard,
}));

import { TeacherDashboardPage } from "./TeacherDashboardPage.js";

const dashboard = {
    totals: {
        classes: 2,
        students: 5,
        subjects: 2,
        officialMaterials: 3,
        publishedTests: 2,
        pendingAiReviews: 3,
        approvedAiReviews: 4,
        posts: 2,
        progressNotes: 1,
        followUpRules: 1,
        inactiveStudents: 3,
    },
    attention: {
        classesWithoutSubjects: 1,
        classesWithoutMaterials: 1,
        classesWithLowActivity: 1,
        classesWithoutFollowUpRules: 1,
        pendingAiReviews: 3,
        inactiveStudents: 3,
    },
    followUp: {
        rulesCount: 1,
        classesWithRules: 1,
        classesWithoutRules: 1,
        inactiveStudentsCount: 3,
    },
    gaps: ["Resultados académicos não disponíveis"],
    classes: [
        {
            classId: "class-rich",
            className: "Turma Completa",
            studentsCount: 4,
            subjectsCount: 2,
            officialMaterialsCount: 3,
            publishedTestsCount: 2,
            approvedAiContentCount: 1,
            pendingAiReviewsCount: 1,
            postCount: 2,
            noteCount: 1,
            followUpRulesCount: 1,
            inactiveStudentsCount: 1,
            openGuidedRoomsCount: 1,
            closedGuidedRoomsCount: 1,
            activitySignalTotal: 8,
            activityCoveragePercent: 80,
            activityScorePercent: 75,
            activityStatus: "ALTA" as const,
            activityBasis: ["SUBJECTS", "MATERIALS"],
            difficultyTags: ["equações"],
            subjects: [
                {
                    subjectId: "subject-rich",
                    subjectName: "Matemática",
                    subjectCode: "MAT",
                    officialMaterialsCount: 1,
                    publishedTestsCount: 1,
                    pendingAiReviewsCount: 1,
                    openGuidedRoomsCount: 1,
                    closedGuidedRoomsCount: 1,
                },
                {
                    subjectId: "subject-zero",
                    subjectName: "Física",
                    officialMaterialsCount: 0,
                    publishedTestsCount: 0,
                    pendingAiReviewsCount: 0,
                    openGuidedRoomsCount: 0,
                    closedGuidedRoomsCount: 0,
                },
            ],
        },
        {
            classId: "class-empty",
            className: "Turma Sem Base",
            studentsCount: 1,
            subjectsCount: 0,
            officialMaterialsCount: 0,
            publishedTestsCount: 0,
            approvedAiContentCount: 0,
            pendingAiReviewsCount: 2,
            postCount: 0,
            noteCount: 0,
            followUpRulesCount: 0,
            inactiveStudentsCount: 2,
            openGuidedRoomsCount: 0,
            closedGuidedRoomsCount: 0,
            activitySignalTotal: 0,
            activityCoveragePercent: 0,
            activityScorePercent: 0,
            activityStatus: "SEM_BASE" as const,
            activityBasis: [],
            difficultyTags: [],
            subjects: [],
        },
    ],
};

beforeEach(() => {
    getTeacherDashboard.mockReset().mockResolvedValue(dashboard);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

describe("TeacherDashboardPage", () => {
    it("renderiza métricas, badges e detalhes de disciplinas com singular/plural", async () => {
        const user = userEvent.setup();
        render(<TeacherDashboardPage />);

        expect(await screen.findByText("Turma Completa")).toBeTruthy();
        expect(screen.getByText("Turma Sem Base")).toBeTruthy();
        expect(screen.getByText("1 aluno sem atividade recente")).toBeTruthy();
        expect(screen.getByText("2 alunos sem atividade recente")).toBeTruthy();
        expect(screen.getByText("1 revisão IA pendente")).toBeTruthy();
        expect(screen.getByText("2 revisões IA pendentes")).toBeTruthy();
        expect(screen.getByRole("progressbar", { name: /Turma Completa/ }).getAttribute("aria-valuenow")).toBe("75");

        const expanders = screen.getAllByRole("button", { name: "Disciplinas e apoio" });
        await user.click(expanders[0]);
        expect(screen.getByText("Matemática")).toBeTruthy();
        expect(screen.getByText(/1 material · 1 mini-teste · 1 revisão IA pendente · 1 sala guiada aberta · 1 sala fechada/)).toBeTruthy();
        expect(screen.getByText(/sem materiais · sem mini-testes · sem sala guiada/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Revisões IA de Matemática" })).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Ocultar disciplinas e apoio" }));

        await user.click(expanders[1]);
        expect(screen.getByText("Esta turma ainda não tem disciplinas.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Gerir disciplinas" })).toBeTruthy();

        const closeDrawer = screen.queryByRole("button", { name: "Fechar sinais de atenção" });
        if (closeDrawer) {
            await user.click(closeDrawer);
        }
    });

    it("apresenta falha pública sem fabricar conteúdo agregado", async () => {
        getTeacherDashboard.mockRejectedValueOnce(new Error("Dashboard indisponível"));
        render(<TeacherDashboardPage />);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Dashboard indisponível");
        expect(screen.queryByText("Resumo por turma")).toBeNull();
    });
});
