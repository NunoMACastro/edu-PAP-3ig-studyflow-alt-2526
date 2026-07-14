/** Testes das ações compactas e das transições de progresso dos projetos do aluno. */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentClassProject } from "../../lib/apiClient.js";

const api = vi.hoisted(() => ({
    listStudentClassProjects: vi.fn(),
    updateStudentClassProjectProgress: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { StudentClassProjectsPage } from "./StudentClassProjectsPage.js";

const project: StudentClassProject = {
    _id: "project-id",
    classId: "class-id",
    title: "API de gestão de biblioteca",
    brief: "Construir uma API REST segura.",
    subjectName: "Programação",
    status: "PUBLISHED",
    readOnly: false,
    myProgress: "NOT_STARTED",
};

describe("StudentClassProjectsPage", () => {
    beforeEach(() => {
        api.listStudentClassProjects.mockReset().mockResolvedValue([project]);
        api.updateStudentClassProjectProgress.mockReset().mockImplementation(
            (_projectId: string, myProgress: StudentClassProject["myProgress"]) =>
                Promise.resolve({ ...project, myProgress }),
        );
    });

    it("agrupa ícones alinhados com nomes e tooltips acessíveis", async () => {
        render(<StudentClassProjectsPage classId="class-id" />);

        expect(await screen.findByText(project.title)).toBeTruthy();
        const actions = screen.getByRole("group", { name: `Ações de ${project.title}` });
        expect(actions.className).toContain("justify-start");
        expect(actions.className).not.toContain("pr-");
        const startAction = within(actions).getByRole("button", { name: "Marcar em curso" });
        expect(startAction.className).toContain("min-h-12");
        expect(startAction.querySelector("svg")?.getAttribute("class")).toContain("h-6");
        expect(within(actions).getByRole("button", { name: "Concluir" })).toBeTruthy();
        expect(within(actions).getByRole("link", { name: "Criar plano IA" }).getAttribute("href")).toBe("/app/projectos/project-id/plano-ia");
        expect(within(actions).getByText("Marcar em curso").getAttribute("data-tooltip-side")).toBe("top");
        expect(within(actions).getByText("Concluir").getAttribute("data-tooltip-side")).toBe("top");
        expect(within(actions).getByText("Criar plano IA").getAttribute("data-tooltip-side")).toBe("top");
    });

    it("preserva a transição de progresso e troca iniciar por reabrir quando concluído", async () => {
        const user = userEvent.setup();
        render(<StudentClassProjectsPage classId="class-id" />);
        await user.click(await screen.findByRole("button", { name: "Marcar em curso" }));
        await waitFor(() => expect(api.updateStudentClassProjectProgress).toHaveBeenCalledWith("project-id", "IN_PROGRESS"));
        expect(await screen.findByText("Em curso")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Concluir" }));
        await waitFor(() => expect(api.updateStudentClassProjectProgress).toHaveBeenLastCalledWith("project-id", "COMPLETED"));
        expect(await screen.findByRole("button", { name: "Reabrir" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Concluir" })).toBeNull();
    });

    it("mantém projetos históricos sem ações mutáveis", async () => {
        api.listStudentClassProjects.mockResolvedValueOnce([{ ...project, readOnly: true }]);
        render(<StudentClassProjectsPage classId="class-id" />);

        expect(await screen.findByText("Projeto disponível apenas para consulta histórica.")).toBeTruthy();
        expect(screen.queryByRole("group", { name: `Ações de ${project.title}` })).toBeNull();
    });
});
