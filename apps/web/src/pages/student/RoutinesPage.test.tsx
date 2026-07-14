/**
 * Testa o ciclo de criação, edição, conclusão e arquivo de rotinas/objetivos.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    archiveGoal: vi.fn(),
    archiveRoutine: vi.fn(),
    createGoal: vi.fn(),
    createRoutine: vi.fn(),
    listRoutines: vi.fn(),
    updateGoal: vi.fn(),
    updateRoutine: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { RoutinesPage } from "./RoutinesPage.js";

const data = {
    routines: [
        { _id: "routine-id", title: "Estudar álgebra", weekdays: ["segunda", "quarta"], startTime: "18:00", durationMinutes: 45 },
        { _id: "legacy-routine-id", title: "Rotina legacy", weekdays: ["TUESDAY", "THURSDAY"], startTime: "19:15", durationMinutes: 35 },
    ],
    goals: [
        { _id: "goal-id", title: "Terminar módulo", description: "Resolver exercícios", targetDate: "2026-07-20T00:00:00.000Z", completed: false },
        { _id: "completed-id", title: "Meta concluída", completed: true },
    ],
};

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset().mockResolvedValue({ ok: true });
    api.listRoutines.mockResolvedValue(data);
});

describe("RoutinesPage", () => {
    it("apresenta dias canónicos e legacy em português de Portugal", async () => {
        render(<RoutinesPage />);

        expect(await screen.findByText("Segunda-feira e quarta-feira às 18:00, 45 min")).toBeTruthy();
        expect(screen.getByText("Terça-feira e quinta-feira às 19:15, 35 min")).toBeTruthy();
    });

    it("cria e edita rotinas com dias, hora e duração explícitos", async () => {
        const user = userEvent.setup();
        render(<RoutinesPage />);
        await screen.findByText("Estudar álgebra");

        await user.click(screen.getByRole("button", { name: "Nova rotina" }));
        expect(screen.getByRole("dialog", { name: "Criar rotina" })).toBeTruthy();
        await user.type(screen.getByLabelText("Título", { selector: "#routineTitle" }), "Revisão semanal");
        expect(screen.getByRole("dialog", { name: "Criar rotina" })).toBeTruthy();
        await user.click(screen.getByRole("checkbox", { name: "Seg" }));
        fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "17:30" } });
        await user.clear(screen.getByLabelText("Duração"));
        await user.type(screen.getByLabelText("Duração"), "30");
        await user.click(screen.getByRole("button", { name: "Criar rotina" }));
        await waitFor(() => expect(api.createRoutine).toHaveBeenCalledWith({
            title: "Revisão semanal",
            weekdays: ["segunda"],
            startTime: "17:30",
            durationMinutes: 30,
        }));

        const item = screen.getByText("Estudar álgebra").closest("li")!;
        await user.click(within(item).getByRole("button", { name: "Editar" }));
        expect((screen.getByLabelText("Título", { selector: "#routineTitle" }) as HTMLInputElement).value).toBe("Estudar álgebra");
        await user.click(screen.getByRole("checkbox", { name: "Seg" }));
        await user.click(screen.getByRole("checkbox", { name: "Sex" }));
        await user.click(screen.getByRole("button", { name: "Guardar rotina" }));
        await waitFor(() => expect(api.updateRoutine).toHaveBeenCalledWith("routine-id", expect.objectContaining({ weekdays: ["quarta", "sexta"] })));

        await user.click(within(item).getByRole("button", { name: "Editar" }));
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(screen.getByRole("button", { name: "Criar rotina" })).toBeTruthy();

        await user.click(within(item).getByRole("button", { name: "Arquivar" }));
        await waitFor(() => expect(api.archiveRoutine).toHaveBeenCalledWith("routine-id"));
    });

    it("cria, edita, conclui/reabre e arquiva objetivos", async () => {
        const user = userEvent.setup();
        render(<RoutinesPage />);
        await screen.findByText("Terminar módulo");

        await user.click(screen.getByRole("button", { name: "Novo objetivo" }));
        expect(screen.getByRole("dialog", { name: "Criar objetivo" })).toBeTruthy();
        await user.type(screen.getByLabelText("Título", { selector: "#goalTitle" }), "Nova meta");
        expect(screen.getByRole("dialog", { name: "Criar objetivo" })).toBeTruthy();
        await user.type(screen.getByLabelText("Descrição", { selector: "#goalDescription" }), "Descrição da meta");
        fireEvent.change(screen.getByLabelText("Data alvo", { selector: "#goalTargetDate" }), { target: { value: "2026-08-01" } });
        await user.click(screen.getByRole("button", { name: "Criar objetivo" }));
        await waitFor(() => expect(api.createGoal).toHaveBeenCalledWith({
            title: "Nova meta",
            description: "Descrição da meta",
            targetDate: "2026-08-01",
        }));

        const pending = screen.getByText("Terminar módulo").closest("li")!;
        await user.click(within(pending).getByRole("button", { name: "Concluir" }));
        await waitFor(() => expect(api.updateGoal).toHaveBeenCalledWith("goal-id", { completed: true }));
        await user.click(within(pending).getByRole("button", { name: "Editar" }));
        expect((screen.getByLabelText("Data alvo", { selector: "#goalTargetDate" }) as HTMLInputElement).value).toBe("2026-07-20");
        await user.click(screen.getByRole("button", { name: "Guardar objetivo" }));
        await waitFor(() => expect(api.updateGoal).toHaveBeenCalledWith("goal-id", expect.objectContaining({ title: "Terminar módulo" })));
        await user.click(within(pending).getByRole("button", { name: "Arquivar" }));
        expect(api.archiveGoal).toHaveBeenCalledWith("goal-id");

        const complete = screen.getByText("Meta concluída").closest("li")!;
        expect(within(complete).getByText("Sem data alvo")).toBeTruthy();
        await user.click(within(complete).getByRole("button", { name: "Reabrir" }));
        await waitFor(() => expect(api.updateGoal).toHaveBeenCalledWith("completed-id", { completed: false }));
    });

    it("apresenta o erro público sem perder os dados carregados", async () => {
        const user = userEvent.setup();
        api.archiveRoutine.mockRejectedValueOnce(new Error("Arquivo recusado"));
        render(<RoutinesPage />);
        const item = (await screen.findByText("Estudar álgebra")).closest("li")!;
        await user.click(within(item).getByRole("button", { name: "Arquivar" }));
        expect(await screen.findByText("Arquivo recusado")).toBeTruthy();
        expect(screen.getByText("Estudar álgebra")).toBeTruthy();
    });
});
