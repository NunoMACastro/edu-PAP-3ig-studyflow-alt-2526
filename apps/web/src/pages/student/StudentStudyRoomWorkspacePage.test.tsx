/** Valida o shell compatível e a metadata essencial da sala. */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    getStudyRoom: vi.fn(),
    listRoomShares: vi.fn(),
    listStudyAreas: vi.fn(),
    rememberStudentContext: vi.fn(),
}));
const listStudyRoomChatUnread = vi.hoisted(() => vi.fn());

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));
vi.mock("../../features/study-room-messages/study-room-chat-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../features/study-room-messages/study-room-chat-client.js")>()),
    listStudyRoomChatUnread,
}));

import { StudentStudyRoomWorkspacePage } from "./StudentStudyRoomWorkspacePage.js";

beforeEach(() => {
    api.getCurrentUser.mockResolvedValue({ id: "student-2", email: "aluno@example.test", role: "STUDENT" });
    api.getStudyRoom.mockResolvedValue({
        _id: "room-1",
        ownerStudentId: "student-1",
        name: "Sala SQL",
        type: "SUBJECT",
        disciplineName: "Bases de Dados",
        memberIds: ["student-1", "student-2"],
        collaborationKind: "STUDY_ROOM",
        collaborationKindSource: "NATIVE",
    });
    api.listRoomShares.mockResolvedValue([]);
    api.listStudyAreas.mockResolvedValue([]);
    api.rememberStudentContext.mockResolvedValue(undefined);
    listStudyRoomChatUnread.mockResolvedValue([]);
});

describe("StudentStudyRoomWorkspacePage", () => {
    it("mantém Partilhas como entrada e apresenta as novas áreas da sala", async () => {
        render(<MemoryRouter><StudentStudyRoomWorkspacePage roomId="room-1" /></MemoryRouter>);

        expect(await screen.findByRole("heading", { name: "Sala SQL" })).toBeTruthy();
        expect(screen.getByText("Criada por outro aluno")).toBeTruthy();
        expect(screen.getByText("Partilhada · 2 membros")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Partilhas" }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: "Conversar" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Notas" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Sessões" })).toBeTruthy();
    });
});
