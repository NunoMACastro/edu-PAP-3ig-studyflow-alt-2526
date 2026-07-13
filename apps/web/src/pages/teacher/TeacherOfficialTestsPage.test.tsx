/**
 * Testa o editor e a visibilidade das ações do ciclo de mini-testes.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createOfficialTest,
    listOfficialTests,
} from "../../lib/apiClient.js";
import { TeacherOfficialTestsPage } from "./TeacherOfficialTestsPage.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/apiClient.js")>();
    return {
        ...actual,
        createOfficialTest: vi.fn(),
        listOfficialTests: vi.fn(),
        publishOfficialTest: vi.fn(),
        closeOfficialTest: vi.fn(),
        updateOfficialTestDraft: vi.fn(),
    };
});

const subjectId = "subject-1";

describe("TeacherOfficialTestsPage", () => {
    beforeEach(() => {
        vi.mocked(listOfficialTests).mockReset().mockResolvedValue([]);
        vi.mocked(createOfficialTest).mockReset().mockResolvedValue({
            _id: "test-1",
            subjectId,
            classId: "class-1",
            teacherId: "teacher-1",
            title: "Mini-teste",
            status: "DRAFT",
            questions: [],
        });
    });

    it("exige escolha explícita da opção correta antes de criar", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <TeacherOfficialTestsPage subjectId={subjectId} />
            </MemoryRouter>,
        );
        await screen.findByRole("heading", { name: "Testes oficiais" });
        await user.type(screen.getByLabelText("Título"), "Mini-teste");
        await user.type(screen.getByLabelText("Enunciado"), "Pergunta válida?");
        for (const [index, value] of ["A", "B", "C", "D"].entries()) {
            await user.type(
                screen.getByLabelText(`Opção ${index + 1} da pergunta 1`),
                value,
            );
        }

        const submit = screen.getByRole("button", { name: "Criar rascunho" });
        expect((submit as HTMLButtonElement).disabled).toBe(true);
        await user.click(
            screen.getByLabelText("Marcar opção 2 como correta na pergunta 1"),
        );
        expect((submit as HTMLButtonElement).disabled).toBe(false);
        await user.click(submit);

        await waitFor(() =>
            expect(createOfficialTest).toHaveBeenCalledWith(
                subjectId,
                expect.objectContaining({
                    status: "DRAFT",
                    questions: [expect.objectContaining({ correctOptionIndex: 1 })],
                }),
            ),
        );
    });

    it("só apresenta edição para rascunhos", async () => {
        vi.mocked(listOfficialTests).mockResolvedValueOnce([
            officialTest("draft", "DRAFT"),
            officialTest("published", "PUBLISHED"),
            officialTest("closed", "CLOSED"),
        ]);
        render(
            <MemoryRouter>
                <TeacherOfficialTestsPage subjectId={subjectId} />
            </MemoryRouter>,
        );

        expect(await screen.findAllByRole("button", { name: "Editar" })).toHaveLength(1);
    });
});

function officialTest(
    id: string,
    status: "DRAFT" | "PUBLISHED" | "CLOSED",
) {
    return {
        _id: id,
        subjectId,
        classId: "class-1",
        teacherId: "teacher-1",
        title: id,
        status,
        questions: [
            {
                statement: "Pergunta válida?",
                options: ["A", "B", "C", "D"],
                correctOptionIndex: 0,
            },
        ],
    };
}
