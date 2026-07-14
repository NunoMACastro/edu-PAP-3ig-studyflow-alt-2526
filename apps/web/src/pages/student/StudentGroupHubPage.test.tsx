/** Confirma que o hub expõe salas enriquecidas sem reabrir grupos na UI. */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    createStudyRoom: vi.fn(),
    getCurrentUser: vi.fn(),
    listAllStudentGuidedStudyRooms: vi.fn(),
    listStudyRooms: vi.fn(),
}));
const listStudyRoomChatUnread = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));
vi.mock("../../features/study-room-messages/study-room-chat-client.js", () => ({
    listStudyRoomChatUnread,
}));

import { StudentGroupHubPage } from "./StudentGroupHubPage.js";

beforeEach(() => {
    api.getCurrentUser.mockResolvedValue({ id: "student-1", email: "aluno@example.test", role: "STUDENT" });
    api.listAllStudentGuidedStudyRooms.mockResolvedValue({ items: [], nextCursor: null });
    api.listStudyRooms.mockResolvedValue([{
        _id: "room-1",
        ownerStudentId: "student-1",
        name: "Preparação para exame",
        type: "FREE",
        memberIds: ["student-1", "student-2"],
        collaborationKind: "STUDY_ROOM",
        collaborationKindSource: "NATIVE",
    }]);
    listStudyRoomChatUnread.mockResolvedValue([{ roomId: "room-1", unreadCount: 2 }]);
});

describe("StudentGroupHubPage", () => {
    it("mostra criador e partilha da sala sem tab ou criação de grupos", async () => {
        render(<MemoryRouter initialEntries={["/app/em-grupo?vista=salas"]}><StudentGroupHubPage /></MemoryRouter>);

        expect(await screen.findByText("Preparação para exame")).toBeTruthy();
        expect(screen.getByText("Criada por ti")).toBeTruthy();
        expect(screen.getByText("Partilhada · 2 membros · 2 por ler")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Grupos" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Novo grupo" })).toBeNull();
    });
});
