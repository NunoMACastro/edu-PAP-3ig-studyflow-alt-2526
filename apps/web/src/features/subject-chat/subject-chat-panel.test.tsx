/**
 * Testa handshake, reconciliação e ack do chat sem abrir sockets reais.
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

type EventHandler = (...args: any[]) => void;

class FakeSocket {
    readonly handlers = new Map<string, EventHandler>();
    joinAck: { ok: boolean; subjectId?: string; error?: { code: string; message: string } } = {
        ok: true,
        subjectId: "subject-id",
    };
    sendAck: { ok: boolean; message?: Record<string, unknown>; error?: { code: string; message: string } } = {
        ok: true,
        message: {
            _id: "sent-id",
            threadId: "thread-id",
            subjectId: "subject-id",
            classId: "class-id",
            authorUserId: "student-id",
            authorRole: "STUDENT",
            authorDisplayName: "Leonor Martins",
            text: "Mensagem enviada",
            createdAt: "2026-07-10T11:00:00.000Z",
        },
    };
    disconnected = false;
    readonly sentPayloads: Array<Record<string, unknown>> = [];

    on(event: string, handler: EventHandler): this {
        this.handlers.set(event, handler);
        return this;
    }

    emit(event: string, payload: unknown, acknowledge: EventHandler): this {
        if (event === "subject-chat:join") acknowledge(this.joinAck);
        if (event === "subject-chat:send") {
            this.sentPayloads.push(payload as Record<string, unknown>);
            acknowledge(this.sendAck);
        }
        return this;
    }

    connect(): this {
        this.handlers.get("connect")?.();
        return this;
    }

    disconnect(): this {
        this.disconnected = true;
        return this;
    }

    trigger(event: string, value?: unknown): void {
        this.handlers.get(event)?.(value);
    }
}

const clientMocks = vi.hoisted(() => ({
    createSubjectChatSocket: vi.fn(),
    listSubjectChatMessages: vi.fn(),
}));

vi.mock("./subject-chat-client.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./subject-chat-client.js")>()),
    ...clientMocks,
}));

import { SubjectChatPanel } from "./SubjectChatPanel.js";

let socket: FakeSocket;

beforeEach(() => {
    socket = new FakeSocket();
    clientMocks.createSubjectChatSocket.mockReset().mockReturnValue(socket);
    clientMocks.listSubjectChatMessages.mockReset().mockResolvedValue([
        {
            _id: "history-id",
            threadId: "thread-id",
            subjectId: "subject-id",
            classId: "class-id",
            authorUserId: "teacher-id",
            authorRole: "TEACHER",
            authorDisplayName: "Professor",
            text: "Mensagem do histórico",
            createdAt: "2026-07-10T10:00:00.000Z",
        },
    ]);
});

describe("SubjectChatPanel", () => {
    it("confirma join, reconcilia eventos e só limpa o rascunho após ack", async () => {
        const user = userEvent.setup();
        const { unmount } = render(<SubjectChatPanel role="STUDENT" subjectId="subject-id" />);

        expect(await screen.findByText("Mensagem do histórico")).toBeTruthy();
        expect(screen.getByText("Online")).toBeTruthy();
        expect(clientMocks.listSubjectChatMessages).toHaveBeenCalledWith("STUDENT", "subject-id");

        act(() => {
            socket.trigger("subject-chat:message", {
                _id: "ignored-id",
                subjectId: "other-subject",
                text: "Não deve aparecer",
            });
            socket.trigger("subject-chat:message", {
                _id: "live-id",
                threadId: "thread-id",
                subjectId: "subject-id",
                classId: "class-id",
                authorUserId: "student-id",
                authorRole: "STUDENT",
                authorDisplayName: "Leonor Martins",
                text: "Mensagem em direto",
            });
        });
        expect(screen.queryByText("Não deve aparecer")).toBeNull();
        expect(screen.getByText("Mensagem em direto")).toBeTruthy();

        const draft = screen.getByLabelText("Mensagem") as HTMLTextAreaElement;
        await user.type(draft, "Mensagem enviada");
        expect(screen.getByText("16/4000")).toBeTruthy();
        await user.click(screen.getByRole("button", { name: "Enviar" }));
        expect(await screen.findByText("Mensagem enviada")).toBeTruthy();
        expect(draft.value).toBe("");

        act(() => socket.trigger("disconnect"));
        expect(screen.getByText("Offline")).toBeTruthy();
        unmount();
        expect(socket.disconnected).toBe(true);
    });

    it("mantém o rascunho e mostra erro perante ack recusado", async () => {
        const user = userEvent.setup();
        socket.sendAck = { ok: false, error: { code: "FORBIDDEN", message: "Envio recusado" } };
        render(<SubjectChatPanel role="TEACHER" subjectId="subject-id" />);
        await screen.findByText("Online");

        const draft = screen.getByLabelText("Mensagem") as HTMLTextAreaElement;
        await user.type(draft, "Não apagar");
        await user.click(screen.getByRole("button", { name: "Enviar" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Envio recusado");
        expect(draft.value).toBe("Não apagar");
        await user.click(screen.getByRole("button", { name: "Enviar" }));
        await waitFor(() => expect(socket.sentPayloads).toHaveLength(2));
        expect(socket.sentPayloads[0]?.clientMessageId).toBe(
            socket.sentPayloads[1]?.clientMessageId,
        );
    });

    it("expõe falhas controladas de join, ligação e histórico", async () => {
        socket.joinAck = { ok: false, error: { code: "FORBIDDEN", message: "Entrada recusada" } };
        const first = render(<SubjectChatPanel role="STUDENT" subjectId="subject-id" />);
        expect(await screen.findByText("Entrada recusada")).toBeTruthy();
        first.unmount();

        socket = new FakeSocket();
        socket.connect = function connectWithoutAck() {
            this.handlers.get("connect_error")?.();
            return this;
        };
        clientMocks.createSubjectChatSocket.mockReturnValue(socket);
        const second = render(<SubjectChatPanel role="STUDENT" subjectId="subject-id" />);
        expect(await screen.findByText(/Não foi possível ligar/)).toBeTruthy();
        second.unmount();

        socket = new FakeSocket();
        clientMocks.createSubjectChatSocket.mockReturnValue(socket);
        clientMocks.listSubjectChatMessages.mockRejectedValueOnce(new Error("Histórico indisponível"));
        render(<SubjectChatPanel role="STUDENT" subjectId="subject-id" />);
        await waitFor(() => expect(screen.getByText("Histórico indisponível")).toBeTruthy());
    });
});
