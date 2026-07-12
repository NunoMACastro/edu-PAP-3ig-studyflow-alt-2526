/** Testes das superfícies que refletem lifecycle e conteúdo do professor. */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    listStudentClasses: vi.fn(),
    listStudentOfficialMaterials: vi.fn(),
    listStudentSubjects: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { StudentClassesPage } from "./StudentClassesPage.js";
import { StudentClassSubjectsPage } from "./StudentClassSubjectsPage.js";
import { StudentOfficialMaterialsPage } from "./StudentOfficialMaterialsPage.js";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listStudentClasses.mockImplementation((status: "ACTIVE" | "ARCHIVED") => Promise.resolve(status === "ACTIVE" ? [{ _id: "class-active", name: "12.º A", code: "12A", schoolYear: "2025/2026", status: "ACTIVE" }] : [{ _id: "class-archive", name: "11.º A", code: "11A", schoolYear: "2024/2025", status: "ARCHIVED" }]));
    api.listStudentSubjects.mockImplementation((_classId: string, status: "ACTIVE" | "ARCHIVED") => Promise.resolve(status === "ACTIVE" ? [{ _id: "subject-active", classId: "class-active", name: "Matemática", code: "MAT", description: "Funções e estatística", status: "ACTIVE" }] : []));
    api.listStudentOfficialMaterials.mockResolvedValue({ items: [{ _id: "material-id", subjectId: "subject-active", classId: "class-active", title: "Resumo de funções", type: "TEXT", status: "PROCESSED", textContent: "Conteúdo", contentRevision: 2, availableToAi: true }], nextCursor: null });
});

describe("paridade professor → aluno", () => {
    it("separa turmas ativas do arquivo sem expor colegas", async () => {
        const user = userEvent.setup();
        render(<StudentClassesPage />);
        expect(await screen.findByText("12.º A")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Arquivo" }));
        expect(await screen.findByText("11.º A")).toBeTruthy();
        expect(api.listStudentClasses).toHaveBeenLastCalledWith("ARCHIVED");
        expect(screen.queryByText(/studentIds/i)).toBeNull();
    });

    it("mostra descrição e entrada para materiais oficiais da disciplina", async () => {
        render(<StudentClassSubjectsPage classId="class-active" />);
        expect(await screen.findByText("Funções e estatística")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Materiais oficiais" }).getAttribute("href")).toBe("/app/disciplinas/subject-active/materiais");
    });

    it("não mostra ações IA sem endpoint histórico para disciplinas arquivadas", async () => {
        const user = userEvent.setup();
        api.listStudentSubjects.mockImplementation(
            (_classId: string, status: "ACTIVE" | "ARCHIVED") =>
                Promise.resolve(
                    status === "ACTIVE"
                        ? []
                        : [{
                              _id: "subject-archive",
                              classId: "class-active",
                              name: "Matemática arquivada",
                              code: "MAT-A",
                              status: "ARCHIVED",
                              readOnly: true,
                          }],
                ),
        );
        render(<StudentClassSubjectsPage classId="class-active" />);
        await user.click(screen.getByRole("button", { name: "Arquivo" }));
        expect(await screen.findByText("Matemática arquivada")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Conteúdos aprovados" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Fontes da IA" })).toBeNull();
        expect(screen.getByRole("link", { name: "Materiais oficiais" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Mini-testes" })).toBeTruthy();
    });

    it("apresenta revisão ativa e disponibilidade para IA no catálogo seguro", async () => {
        render(<StudentOfficialMaterialsPage subjectId="subject-active" />);
        expect(await screen.findByText("Resumo de funções")).toBeTruthy();
        expect(screen.getByText(/revisão 2/i)).toBeTruthy();
        expect(screen.getByText("Disponível para IA")).toBeTruthy();
        await waitFor(() => expect(api.listStudentOfficialMaterials).toHaveBeenCalledWith("subject-active", { limit: 24 }));
    });
});
