/**
 * Valida o lifecycle visual das disciplinas e o formulário acessível de edição.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    changeSubjectStatus: vi.fn(),
    createSubject: vi.fn(),
    listSubjects: vi.fn(),
    updateSubject: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { TeacherSubjectsPage } from "./TeacherSubjectsPage.js";

const subject = {
    _id: "subject-a",
    classId: "class-a",
    teacherId: "teacher-a",
    name: "Matemática",
    code: "MAT",
    description: "Álgebra e funções.",
    status: "ACTIVE" as const,
    createdAt: "2026-07-11T10:00:00.000Z",
};

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listSubjects.mockResolvedValue([subject]);
    api.updateSubject.mockResolvedValue({
        ...subject,
        name: "Matemática A",
        code: "MAT-A",
        description: "Álgebra, funções e geometria.",
    });
    api.changeSubjectStatus.mockResolvedValue({ ...subject, status: "ARCHIVED" });
});

describe("TeacherSubjectsPage", () => {
    it("separa disciplinas ativas do arquivo", async () => {
        const user = userEvent.setup();
        api.listSubjects.mockResolvedValueOnce([
            subject,
            { ...subject, _id: "subject-history", name: "Matemática histórica", status: "ARCHIVED" },
        ]);
        render(<TeacherSubjectsPage classId="class-a" />);

        expect(await screen.findByText("Matemática")).toBeTruthy();
        expect(screen.queryByText("Matemática histórica")).toBeNull();
        await user.selectOptions(screen.getByLabelText("Estado"), "ARCHIVED");
        expect(await screen.findByText("Matemática histórica")).toBeTruthy();
        expect(screen.queryByText("Matemática")).toBeNull();
        expect(screen.getByText("1 disciplina arquivada")).toBeTruthy();
    });

    it("edita a disciplina num SidePanel e reflete os dados confirmados pela API", async () => {
        const user = userEvent.setup();
        render(<TeacherSubjectsPage classId="class-a" />);
        const card = (await screen.findByText("Matemática")).closest("article")!;

        await user.click(within(card).getByRole("button", { name: "Editar" }));
        const panel = screen.getByRole("dialog", { name: "Editar disciplina" });
        expect(within(panel).getByLabelText("Nome")).toHaveProperty("value", "Matemática");

        await user.clear(within(panel).getByLabelText("Nome"));
        await user.type(within(panel).getByLabelText("Nome"), "Matemática A");
        await user.clear(within(panel).getByLabelText("Código"));
        await user.type(within(panel).getByLabelText("Código"), "MAT-A");
        await user.clear(within(panel).getByLabelText("Descrição"));
        await user.type(
            within(panel).getByLabelText("Descrição"),
            "Álgebra, funções e geometria.",
        );
        await user.click(within(panel).getByRole("button", { name: "Guardar alterações" }));

        await waitFor(() => expect(api.updateSubject).toHaveBeenCalledWith(
            "class-a",
            "subject-a",
            {
                name: "Matemática A",
                code: "MAT-A",
                description: "Álgebra, funções e geometria.",
            },
        ));
        expect(screen.queryByRole("dialog", { name: "Editar disciplina" })).toBeNull();
        expect(screen.getByRole("status")).toHaveProperty(
            "textContent",
            "Disciplina atualizada.",
        );
    });
});
