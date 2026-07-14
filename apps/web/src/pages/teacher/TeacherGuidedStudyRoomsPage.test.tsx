/** Cobre estados assíncronos e submissão da gestão docente de salas guiadas. */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    createGuidedStudyRoom: vi.fn(),
    listOfficialMaterials: vi.fn(),
    listOfficialTests: vi.fn(),
    listSubjects: vi.fn(),
    listTeacherGuidedStudyRooms: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { TeacherGuidedStudyRoomsPage } from "./TeacherGuidedStudyRoomsPage.js";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listTeacherGuidedStudyRooms.mockResolvedValue([]);
    api.listSubjects.mockResolvedValue([]);
    api.listOfficialMaterials.mockResolvedValue([]);
    api.listOfficialTests.mockResolvedValue([]);
});

describe("TeacherGuidedStudyRoomsPage", () => {
    it("não apresenta um falso estado vazio quando o carregamento falha", async () => {
        api.listTeacherGuidedStudyRooms.mockRejectedValueOnce(
            new Error("Falha controlada ao carregar"),
        );

        renderPage();

        expect(await screen.findByText("Falha controlada ao carregar")).toBeTruthy();
        expect(screen.queryByText("Ainda não existem salas guiadas")).toBeNull();
    });

    it("apresenta o estado vazio apenas depois de uma resposta válida", async () => {
        renderPage();

        expect(await screen.findByText("Ainda não existem salas guiadas")).toBeTruthy();
    });

    it("bloqueia submissão duplicada enquanto cria e disponibiliza", async () => {
        const user = userEvent.setup();
        let resolveCreate!: (value: unknown) => void;
        api.createGuidedStudyRoom.mockReturnValue(
            new Promise((resolve) => {
                resolveCreate = resolve;
            }),
        );
        renderPage();
        await screen.findByText("Ainda não existem salas guiadas");
        await user.click(screen.getByRole("button", { name: "Nova sala guiada" }));
        const panel = screen.getByRole("dialog", { name: "Criar sala guiada" });
        await user.type(withinLabel(panel, "Título"), "Revisão de energia");
        await user.type(
            withinLabel(panel, "Instruções"),
            "Lê o material e resolve a atividade.",
        );
        await user.click(
            screen.getByRole("button", { name: "Criar e disponibilizar" }),
        );

        expect(
            screen.getByRole("button", { name: "A guardar..." }),
        ).toHaveProperty("disabled", true);
        expect(api.createGuidedStudyRoom).toHaveBeenCalledTimes(1);
        resolveCreate({});
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: "A guardar..." })).toBeNull(),
        );
    });

    it("só permite selecionar materiais processados para a IA", async () => {
        const user = userEvent.setup();
        api.listSubjects.mockResolvedValueOnce([
            { _id: "subject-id", name: "Matemática" },
        ]);
        api.listOfficialMaterials.mockResolvedValueOnce([
            {
                _id: "ready-id",
                subjectId: "subject-id",
                title: "Manual processado",
                status: "PROCESSED",
                availableToAi: true,
            },
            {
                _id: "pending-id",
                subjectId: "subject-id",
                title: "Manual por indexar",
                status: "PENDING_PROCESSING",
                availableToAi: false,
            },
        ]);
        renderPage();
        await screen.findByText("Ainda não existem salas guiadas");
        await user.click(screen.getByRole("button", { name: "Nova sala guiada" }));
        const panel = screen.getByRole("dialog", { name: "Criar sala guiada" });
        await user.selectOptions(withinLabel(panel, "Disciplina"), "subject-id");

        expect(screen.getByText("Manual processado")).toBeTruthy();
        expect(screen.queryByText("Manual por indexar")).toBeNull();
        expect(
            screen.getByText("A IA utilizará apenas os materiais processados que selecionares."),
        ).toBeTruthy();
    });
});

function renderPage(): void {
    render(
        <MemoryRouter>
            <TeacherGuidedStudyRoomsPage classId="class-id" />
        </MemoryRouter>,
    );
}

function withinLabel(container: HTMLElement, label: string): HTMLElement {
    const control = Array.from(container.querySelectorAll("label")).find((item) =>
        item.textContent?.startsWith(label),
    )?.querySelector("input, textarea, select");
    if (!(control instanceof HTMLElement)) throw new Error(`Campo ${label} em falta.`);
    return control;
}
