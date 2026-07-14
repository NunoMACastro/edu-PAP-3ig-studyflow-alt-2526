/** Verifica namespace, credenciais e endpoints REST do chat de grupos. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ io: vi.fn(), request: vi.fn() }));
vi.mock("socket.io-client", () => ({ io: mocks.io }));
vi.mock("../mf3/request-mf3-json.js", () => ({ requestMf3Json: mocks.request }));

import {
    createStudyGroupChatSocket,
    listStudyGroupChatUnread,
    markStudyGroupChatRead,
} from "./study-group-chat-client.js";

beforeEach(() => {
    mocks.io.mockReset().mockReturnValue({ socket: true });
    mocks.request.mockReset().mockResolvedValue([]);
});

describe("study-group-chat-client", () => {
    it("usa o namespace isolado com WebSocket e cookies", () => {
        expect(createStudyGroupChatSocket()).toEqual({ socket: true });
        expect(mocks.io).toHaveBeenCalledWith("/study-group-chat", {
            autoConnect: false,
            transports: ["websocket"],
            withCredentials: true,
        });
    });

    it("lê unread bulk e marca o grupo sem passar identidade do aluno", async () => {
        await listStudyGroupChatUnread();
        await markStudyGroupChatRead("group-id");
        expect(mocks.request).toHaveBeenNthCalledWith(1, "/api/student/study-group-chat/unread");
        expect(mocks.request).toHaveBeenNthCalledWith(
            2,
            "/api/study-groups/group-id/messages/read",
            { method: "PUT" },
        );
    });
});
