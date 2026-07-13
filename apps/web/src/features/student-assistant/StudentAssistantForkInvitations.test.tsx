/** Testa aceitação e recusa de convites na página completa do Assistente. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../lib/apiClient.js";
import { StudentAssistantForkInvitations } from "./StudentAssistantForkInvitations.js";

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    acceptStudentAssistantForkInvitation: vi.fn(),
    declineStudentAssistantForkInvitation: vi.fn(),
    listStudentAssistantForkInvitations: vi.fn(),
}));

const invitation: api.StudentAssistantForkInvitation = {
    id: "invite-id",
    status: "PENDING",
    conversationTitle: "Energia e trabalho",
    context: { kind: "STUDY_ROOM", id: "room-id", label: "Sala de Física" },
    sender: { id: "sender-id", email: "origem@example.test" },
    recipient: { id: "recipient-id", email: "destino@example.test" },
    turnCount: 3,
    expiresAt: "2026-07-20T10:00:00.000Z",
};

describe("StudentAssistantForkInvitations", () => {
    beforeEach(() => {
        vi.mocked(api.listStudentAssistantForkInvitations).mockReset();
        vi.mocked(api.acceptStudentAssistantForkInvitation).mockReset();
        vi.mocked(api.declineStudentAssistantForkInvitation).mockReset();
        vi.mocked(api.listStudentAssistantForkInvitations).mockResolvedValue({
            items: [invitation],
            nextCursor: null,
        });
    });

    it("aceita o convite e entrega a nova conversa ao chamador", async () => {
        const onAccepted = vi.fn();
        const conversation: api.StudentAssistantConversation = {
            id: "fork-id",
            title: "Fork — Energia e trabalho",
            status: "ACTIVE",
            origin: "FORK",
            context: {
                kind: "STUDY_ROOM",
                id: "room-id",
                label: "Sala de Física",
                access: "ACTIVE",
            },
            readOnly: false,
            capabilities: { canInviteFork: true, canCreateArtifact: true },
        };
        vi.mocked(api.acceptStudentAssistantForkInvitation).mockResolvedValue(conversation);
        render(<StudentAssistantForkInvitations onAccepted={onAccepted} />);

        fireEvent.click(await screen.findByRole("button", { name: "Aceitar" }));
        await waitFor(() => expect(onAccepted).toHaveBeenCalledWith(conversation));
        expect(screen.queryByText("Energia e trabalho")).toBeNull();
    });

    it("recusa e remove o convite sem recarregar a página", async () => {
        vi.mocked(api.declineStudentAssistantForkInvitation).mockResolvedValue({
            id: invitation.id,
            status: "DECLINED",
        });
        render(<StudentAssistantForkInvitations onAccepted={vi.fn()} />);

        fireEvent.click(await screen.findByRole("button", { name: "Recusar" }));
        await waitFor(() => expect(screen.queryByText("Energia e trabalho")).toBeNull());
        expect(api.listStudentAssistantForkInvitations).toHaveBeenCalledTimes(1);
    });
});
