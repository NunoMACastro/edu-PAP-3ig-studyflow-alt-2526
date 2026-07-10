/**
 * Verifica o contrato REST e a configuração fail-closed da socket do chat.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ io: vi.fn(), request: vi.fn() }));

vi.mock("socket.io-client", () => ({ io: mocks.io }));
vi.mock("../mf3/request-mf3-json.js", () => ({ requestMf3Json: mocks.request }));

import { createSubjectChatSocket, listSubjectChatMessages } from "./subject-chat-client.js";

beforeEach(() => {
    mocks.io.mockReset().mockReturnValue({ socket: true });
    mocks.request.mockReset().mockResolvedValue([]);
});

describe("subject-chat-client", () => {
    it("separa os endpoints de aluno e professor", async () => {
        await listSubjectChatMessages("STUDENT", "subject-id");
        await listSubjectChatMessages("TEACHER", "subject-id");
        expect(mocks.request).toHaveBeenNthCalledWith(1, "/api/student/subjects/subject-id/chat/messages");
        expect(mocks.request).toHaveBeenNthCalledWith(2, "/api/teacher/subjects/subject-id/chat/messages");
    });

    it("cria a socket desligada com credenciais e transporte explícito", () => {
        expect(createSubjectChatSocket()).toEqual({ socket: true });
        expect(mocks.io).toHaveBeenCalledWith("/subject-chat", {
            autoConnect: false,
            transports: ["websocket"],
            withCredentials: true,
        });
    });
});
