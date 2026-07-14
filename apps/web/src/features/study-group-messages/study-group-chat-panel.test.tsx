/** Confirma que o adapter de grupo usa o núcleo comum e reage a eventos live. */
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (...args: any[]) => void;
class FakeSocket {
    handlers = new Map<string, Handler>();
    sent: Record<string, unknown>[] = [];
    on(event: string, handler: Handler) { this.handlers.set(event, handler); return this; }
    off() { this.handlers.clear(); return this; }
    connect() { this.handlers.get("connect")?.(); return this; }
    disconnect() { return this; }
    emit(event: string, payload: Record<string, unknown>, ack: Handler) {
        if (event === "study-group-chat:join") ack({ ok: true, groupId: "group-id" });
        if (event === "study-group-chat:send") {
            this.sent.push(payload);
            ack({ ok: true, message: message("sent", String(payload.text)) });
        }
        return this;
    }
    trigger(event: string, payload?: unknown) { this.handlers.get(event)?.(payload); }
}

const mocks = vi.hoisted(() => ({ createSocket: vi.fn(), list: vi.fn(), markRead: vi.fn() }));
vi.mock("./study-group-chat-client.js", () => ({
    createStudyGroupChatSocket: mocks.createSocket,
    markStudyGroupChatRead: mocks.markRead,
}));
vi.mock("./create-study-group-message.js", () => ({ listStudyGroupMessages: mocks.list }));

import { StudyGroupChatPanel } from "./StudyGroupChatPanel.js";

let socket: FakeSocket;
beforeEach(() => {
    socket = new FakeSocket();
    mocks.createSocket.mockReset().mockReturnValue(socket);
    mocks.list.mockReset().mockResolvedValue([message("history", "Histórico")]);
    mocks.markRead.mockReset().mockResolvedValue(undefined);
});

describe("StudyGroupChatPanel", () => {
    it("filtra MESSAGE, recebe sem refresh e envia UUID idempotente", async () => {
        const user = userEvent.setup();
        render(<StudyGroupChatPanel groupId="group-id" />);
        expect(await screen.findByText("Histórico")).toBeTruthy();
        expect(mocks.list).toHaveBeenCalledWith("group-id", "MESSAGE");

        act(() => socket.trigger("study-group-chat:message", message("live", "Em direto")));
        expect(screen.getByText("Em direto")).toBeTruthy();
        const draft = screen.getByLabelText("Mensagem");
        await user.type(draft, "Resposta");
        await user.click(screen.getByRole("button", { name: "Enviar" }));
        expect(await screen.findByText("Resposta")).toBeTruthy();
        expect(socket.sent[0]).toMatchObject({ groupId: "group-id", text: "Resposta" });
        expect(socket.sent[0]?.clientMessageId).toMatch(/^[0-9a-f-]{36}$/i);
        expect(mocks.markRead).toHaveBeenCalled();
    });
});

function message(id: string, text: string) {
    return {
        _id: id,
        groupId: "group-id",
        authorStudentId: "student-id",
        authorDisplayName: "Leonor Martins",
        kind: "MESSAGE" as const,
        text,
        createdAt: `2026-07-14T10:0${id === "history" ? "0" : "1"}:00.000Z`,
    };
}
