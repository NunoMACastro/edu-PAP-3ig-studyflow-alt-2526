/** Testes do painel de seleção, consentimento e cancelamento de forks. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../lib/apiClient.js";
import { StudentAssistantForkPanel } from "./StudentAssistantForkPanel.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    cancelStudentAssistantForkInvitation: vi.fn(),
    createStudentAssistantForkInvitation: vi.fn(),
    listStudentAssistantForkInvitations: vi.fn(),
    listStudentAssistantForkRecipients: vi.fn(),
}));

const pending: api.StudentAssistantForkInvitation = {
    id: "invite-id",
    status: "PENDING",
    conversationTitle: "Conversa",
    context: { kind: "STUDY_GROUP", id: "group-id", label: "Grupo de Física" },
    sender: { id: "source-id", email: "origem@example.test" },
    recipient: { id: "pending-id", email: "pendente@example.test" },
    turnCount: 4,
    expiresAt: "2026-07-20T10:00:00.000Z",
};

describe("StudentAssistantForkPanel", () => {
    beforeEach(() => {
        vi.mocked(api.listStudentAssistantForkRecipients).mockReset();
        vi.mocked(api.listStudentAssistantForkInvitations).mockReset();
        vi.mocked(api.createStudentAssistantForkInvitation).mockReset();
        vi.mocked(api.cancelStudentAssistantForkInvitation).mockReset();
        vi.mocked(api.listStudentAssistantForkRecipients).mockResolvedValue({
            items: [{ id: "recipient-id", email: "colega@example.test" }],
            nextCursor: null,
        });
        vi.mocked(api.listStudentAssistantForkInvitations).mockResolvedValue({
            items: [pending],
            nextCursor: null,
        });
    });

    it("exige destinatário e confirmação antes de enviar", async () => {
        vi.mocked(api.createStudentAssistantForkInvitation).mockResolvedValue(pending);
        render(<StudentAssistantForkPanel conversationId="conversation-id" onClose={vi.fn()} open />);

        const send = await screen.findByRole("button", { name: "Enviar convite" });
        expect((send as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole("radio", { name: "colega@example.test" }));
        expect((send as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole("checkbox", {
            name: "Compreendo e quero enviar este snapshot.",
        }));
        fireEvent.click(send);

        await waitFor(() => expect(api.createStudentAssistantForkInvitation)
            .toHaveBeenCalledWith("conversation-id", "recipient-id"));
        expect(await screen.findByText(/snapshot ficou congelado/)).toBeTruthy();
    });

    it("cancela um convite pendente sem fechar o painel", async () => {
        vi.mocked(api.cancelStudentAssistantForkInvitation).mockResolvedValue({
            id: pending.id,
            status: "CANCELLED",
        });
        render(<StudentAssistantForkPanel conversationId="conversation-id" onClose={vi.fn()} open />);

        fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
        await waitFor(() => expect(api.cancelStudentAssistantForkInvitation)
            .toHaveBeenCalledWith(pending.id));
        expect(screen.queryByText("pendente@example.test")).toBeNull();
        expect(screen.getByText("Convite cancelado.")).toBeTruthy();
    });
});
