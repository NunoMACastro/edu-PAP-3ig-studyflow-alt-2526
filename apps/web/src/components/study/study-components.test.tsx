/**
 * Testa formulários reutilizáveis e histórico da área privada.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateStudyAreaVoice = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    updateStudyAreaVoice,
}));

import { StudyAreaForm } from "./StudyAreaForm.js";
import { StudyAreaVoiceForm } from "./StudyAreaVoiceForm.js";
import { StudyHistoryList } from "./StudyHistoryList.js";

beforeEach(() => {
    updateStudyAreaVoice.mockReset().mockResolvedValue({
        _id: "area-id",
        name: "Matemática",
        voiceTone: "rigorous",
        voiceDetailLevel: "detailed",
        voiceNotes: "Usar exemplos",
    });
});

describe("StudyAreaForm", () => {
    it("limpa criação bem-sucedida e preserva valores perante retorno false", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        render(<StudyAreaForm onSubmit={onSubmit} submitLabel="Criar" />);
        const name = screen.getByLabelText("Nome") as HTMLInputElement;
        const description = screen.getByLabelText("Descrição") as HTMLTextAreaElement;
        await user.type(name, "Matemática");
        await user.type(description, "Área privada");
        await user.click(screen.getByRole("button", { name: "Criar" }));
        expect(name.value).toBe("Matemática");
        await user.click(screen.getByRole("button", { name: "Criar" }));
        await waitFor(() => expect(name.value).toBe(""));
        expect(description.value).toBe("");
    });

    it("sincroniza edição, mostra erro e executa cancelamento", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const onSubmit = vi.fn().mockResolvedValue(true);
        const { rerender } = render(
            <StudyAreaForm
                area={{ _id: "area-id", name: "Inicial", description: "Descrição" }}
                error="Erro público"
                onCancel={onCancel}
                onSubmit={onSubmit}
                submitLabel="Guardar"
            />,
        );
        expect(screen.getByText("Erro público")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
        rerender(
            <StudyAreaForm
                area={{ _id: "area-2", name: "Atualizada", description: "Outra" }}
                onCancel={onCancel}
                onSubmit={onSubmit}
                submitLabel="Guardar"
            />,
        );
        expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("Atualizada");
        await user.click(screen.getByRole("button", { name: "Guardar" }));
        expect(onSubmit).toHaveBeenCalledWith({ name: "Atualizada", description: "Outra" });
    });
});

describe("StudyAreaVoiceForm", () => {
    it("guarda tom/detalhe/notas e reporta recusas", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        const area = { _id: "area-id", name: "Matemática" };
        const first = render(<StudyAreaVoiceForm area={area} onSaved={onSaved} />);
        await user.selectOptions(screen.getByLabelText("Tom"), "rigorous");
        await user.selectOptions(screen.getByLabelText("Detalhe"), "detailed");
        await user.type(screen.getByLabelText("Notas"), "Usar exemplos");
        await user.click(screen.getByRole("button", { name: "Guardar voz" }));
        await waitFor(() => expect(updateStudyAreaVoice).toHaveBeenCalledWith("area-id", {
            voiceTone: "rigorous",
            voiceDetailLevel: "detailed",
            voiceNotes: "Usar exemplos",
        }));
        expect(onSaved).toHaveBeenCalled();
        first.unmount();

        updateStudyAreaVoice.mockRejectedValueOnce(new Error("Voz recusada"));
        render(<StudyAreaVoiceForm area={area} onSaved={onSaved} />);
        await user.click(screen.getByRole("button", { name: "Guardar voz" }));
        expect(await screen.findByText("Voz recusada")).toBeTruthy();
    });
});

describe("StudyHistoryList", () => {
    it("distingue vazio e eventos com/sem descrição ou data", () => {
        const first = render(<StudyHistoryList events={[]} />);
        expect(screen.getByText("Ainda não há eventos.")).toBeTruthy();
        first.unmount();
        render(
            <StudyHistoryList
                events={[
                    { id: "event-1", type: "ROUTINE_CREATED", title: "Rotina criada", description: "Detalhe", occurredAt: "2026-07-10T12:00:00.000Z" },
                    { id: "event-2", type: "GOAL_CREATED", title: "Objetivo criado" },
                ]}
            />,
        );
        expect(screen.getByText("Detalhe")).toBeTruthy();
        expect(screen.getByText("Data indisponível")).toBeTruthy();
        expect(screen.getByText(/10\/07\/2026/)).toBeTruthy();
    });
});
