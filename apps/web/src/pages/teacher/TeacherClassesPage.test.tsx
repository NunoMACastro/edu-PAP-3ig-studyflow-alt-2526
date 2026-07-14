/**
 * Testa pesquisa, validação e gestão de alunos nas turmas docentes.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    addClassStudent: vi.fn(),
    changeTeacherClassStatus: vi.fn(),
    createTeacherClass: vi.fn(),
    listTeacherClasses: vi.fn(),
    removeClassStudent: vi.fn(),
    updateTeacherClass: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

vi.mock("./TeacherAiVoicePage.js", () => ({
    TeacherClassAiVoiceDialog: ({ className, onClose }: { className?: string; onClose: () => void }) => (
        <div role="dialog"><p>Voz de {className}</p><button onClick={onClose}>Fechar voz</button></div>
    ),
}));

import { TeacherClassesPage } from "./TeacherClassesPage.js";

const classWithStudent = {
    _id: "class-a",
    teacherId: "teacher-id",
    name: "Álgebra A",
    code: "ALG-A",
    schoolYear: "2025/2026",
    studentIds: ["student-id"],
    students: [{ id: "student-id", email: "student@example.test" }],
    createdAt: "2026-07-09T10:00:00.000Z",
};
const classWithoutEmail = {
    _id: "class-b",
    teacherId: "teacher-id",
    name: "Biologia",
    code: "BIO",
    schoolYear: "2024/2025",
    studentIds: ["legacy-student"],
    students: [],
    createdAt: "data-inválida",
};
const emptyClass = {
    _id: "class-c",
    teacherId: "teacher-id",
    name: "Ciências",
    code: "CIE",
    schoolYear: "inválido",
    studentIds: [],
    createdAt: undefined,
};

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listTeacherClasses.mockResolvedValue([classWithStudent, classWithoutEmail, emptyClass]);
    api.createTeacherClass.mockResolvedValue({ ...emptyClass, _id: "new-class", name: "Nova Turma", code: "NT", schoolYear: "2025/2026" });
    api.addClassStudent.mockImplementation((classId: string, email: string) => Promise.resolve({
        ...(classId === "class-c" ? emptyClass : classWithStudent),
        _id: classId,
        studentIds: ["added-id"],
        students: [{ id: "added-id", email }],
    }));
    api.removeClassStudent.mockResolvedValue({ ...classWithStudent, studentIds: [], students: [] });
    api.updateTeacherClass.mockResolvedValue({
        ...classWithStudent,
        name: "Álgebra atualizada",
        code: "ALG-N",
    });
    api.changeTeacherClassStatus.mockResolvedValue({ ...classWithStudent, status: "ARCHIVED" });
    vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("TeacherClassesPage", () => {
    it("separa trabalho ativo do arquivo de turmas", async () => {
        const user = userEvent.setup();
        api.listTeacherClasses.mockResolvedValueOnce([
            { ...classWithStudent, status: "ACTIVE" },
            { ...emptyClass, _id: "archived-class", name: "Turma histórica", status: "ARCHIVED" },
        ]);
        render(<TeacherClassesPage />);

        expect(await screen.findByText("Álgebra A")).toBeTruthy();
        expect(screen.queryByText("Turma histórica")).toBeNull();
        await user.selectOptions(screen.getByLabelText("Estado"), "ARCHIVED");
        expect(await screen.findByText("Turma histórica")).toBeTruthy();
        expect(screen.queryByText("Álgebra A")).toBeNull();
        expect(screen.getByText("1 turma arquivada")).toBeTruthy();
    });

    it("pesquisa/ordena e distingue alunos com ou sem email disponível", async () => {
        const user = userEvent.setup();
        render(<TeacherClassesPage />);
        expect(await screen.findByText("Álgebra A")).toBeTruthy();
        expect(screen.getByText("3 turmas ativas")).toBeTruthy();

        const populatedClassCard = screen.getByText("Álgebra A").closest("article")!;
        expect(
            within(populatedClassCard)
                .getByRole("link", { name: "Gerir disciplinas" })
                .getAttribute("href"),
        ).toBe("/app/professor/turmas/class-a/disciplinas");
        expect(
            within(populatedClassCard).queryByRole("link", {
                name: "Disciplinas de Álgebra A",
            }),
        ).toBeNull();

        await user.type(screen.getByLabelText("Pesquisar turma"), "algebra");
        expect(screen.getByText("1 de 3 turmas visíveis")).toBeTruthy();
        expect(screen.queryByText("Biologia")).toBeNull();
        await user.clear(screen.getByLabelText("Pesquisar turma"));
        await user.selectOptions(screen.getByLabelText("Ordenar"), "name");
        await user.selectOptions(screen.getByLabelText("Ordenar"), "schoolYear");
        await user.selectOptions(screen.getByLabelText("Ordenar"), "recent");

        await user.type(screen.getByLabelText("Pesquisar turma"), "sem correspondência");
        expect(screen.getByText("Nenhuma turma corresponde à pesquisa.")).toBeTruthy();
        await user.clear(screen.getByLabelText("Pesquisar turma"));

        const legacyCard = screen.getByText("Biologia").closest("article")!;
        await user.click(within(legacyCard).getByRole("button", { name: "Gerir 1 aluno" }));
        expect(within(legacyCard).getByText("Há alunos inscritos sem email disponível.")).toBeTruthy();

        const emptyCard = screen.getByText("Ciências").closest("article")!;
        await user.click(
            within(emptyCard).getByRole("button", {
                name: "Adicionar primeiro aluno",
            }),
        );
        expect(within(emptyCard).getByText("Ainda não há alunos inscritos.")).toBeTruthy();
    });

    it("valida/cria turma e adiciona/remove aluno com confirmação", async () => {
        const user = userEvent.setup();
        render(<TeacherClassesPage />);
        await screen.findByText("Álgebra A");

        await user.click(screen.getByRole("button", { name: "Nova turma" }));
        await user.click(screen.getByRole("button", { name: "Criar turma" }));
        expect(screen.getByText("Nome é obrigatório.")).toBeTruthy();
        expect(screen.getByText("Código é obrigatório.")).toBeTruthy();

        await user.type(screen.getByLabelText("Nome", { selector: "#teacherClassName" }), "Nova Turma");
        await user.type(screen.getByLabelText("Código"), "NT");
        await user.click(screen.getByRole("button", { name: "Criar turma" }));
        await waitFor(() => expect(api.createTeacherClass).toHaveBeenCalledWith({ name: "Nova Turma", code: "NT", schoolYear: "2025/2026" }));
        expect(await screen.findByRole("status")).toHaveProperty("textContent", "Turma criada.");

        const emptyCard = screen.getByText("Ciências").closest("article")!;
        await user.click(
            within(emptyCard).getByRole("button", {
                name: "Adicionar primeiro aluno",
            }),
        );
        await user.click(within(emptyCard).getByRole("button", { name: "Adicionar aluno" }));
        expect(within(emptyCard).getByText("Email do aluno é obrigatório.")).toBeTruthy();
        await user.type(within(emptyCard).getByLabelText("Adicionar aluno"), "added@example.test");
        await user.click(within(emptyCard).getByRole("button", { name: "Adicionar aluno" }));
        await waitFor(() => expect(api.addClassStudent).toHaveBeenCalledWith("class-c", "added@example.test"));

        const studentCard = screen.getByText("Álgebra A").closest("article")!;
        await user.click(within(studentCard).getByRole("button", { name: "Gerir 1 aluno" }));
        vi.mocked(window.confirm).mockReturnValueOnce(false);
        await user.click(within(studentCard).getByRole("button", { name: /Remover student@example.test/ }));
        expect(api.removeClassStudent).not.toHaveBeenCalled();
        vi.mocked(window.confirm).mockReturnValueOnce(true);
        await user.click(within(studentCard).getByRole("button", { name: /Remover student@example.test/ }));
        await waitFor(() => expect(api.removeClassStudent).toHaveBeenCalledWith("class-a", "student-id"));
    });

    it("abre e fecha configuração contextual da voz", async () => {
        const user = userEvent.setup();
        render(<TeacherClassesPage />);
        await screen.findByText("Álgebra A");
        await user.click(screen.getByRole("button", { name: "Voz IA da turma Álgebra A" }));
        expect(screen.getByRole("dialog").textContent).toContain("Álgebra A");
        await user.click(screen.getByRole("button", { name: "Fechar voz" }));
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("edita a turma num painel acessível e fecha apenas após sucesso", async () => {
        const user = userEvent.setup();
        render(<TeacherClassesPage />);
        const classCard = (await screen.findByText("Álgebra A")).closest("article")!;

        await user.click(within(classCard).getByRole("button", { name: "Editar" }));
        const panel = screen.getByRole("dialog", { name: "Editar turma" });
        const nameInput = within(panel).getByLabelText("Nome");
        expect(nameInput).toHaveProperty("value", "Álgebra A");

        await user.clear(nameInput);
        await user.type(nameInput, "Álgebra atualizada");
        await user.clear(within(panel).getByLabelText("Código"));
        await user.type(within(panel).getByLabelText("Código"), "ALG-N");
        await user.click(within(panel).getByRole("button", { name: "Guardar alterações" }));

        await waitFor(() => expect(api.updateTeacherClass).toHaveBeenCalledWith("class-a", {
            name: "Álgebra atualizada",
            code: "ALG-N",
            schoolYear: "2025/2026",
        }));
        expect(screen.queryByRole("dialog", { name: "Editar turma" })).toBeNull();
        expect(screen.getByRole("status")).toHaveProperty("textContent", "Turma atualizada.");
    });
});
