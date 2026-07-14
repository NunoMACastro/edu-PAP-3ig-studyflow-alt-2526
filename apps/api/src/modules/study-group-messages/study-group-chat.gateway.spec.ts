/** Testa handshake, autorização e broadcast do chat de grupos de estudo. */
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { SESSION_COOKIE_NAME } from "../auth/session.service.js";
import { StudyGroupChatGateway } from "./study-group-chat.gateway.js";

const groupId = "507f1f77bcf86cd799439013";
const student = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};
const clientMessageId = "123e4567-e89b-42d3-a456-426614174000";

describe("StudyGroupChatGateway", () => {
    beforeEach(() => { process.env.WEB_ORIGIN = "http://localhost:5173"; });
    afterEach(() => { jest.clearAllMocks(); });

    it("rejeita handshake sem cookie e origem inválida", async () => {
        const missingCookie = makeGateway();
        await missingCookie.gateway.handleConnection(missingCookie.client as never);
        expect(missingCookie.client.emit).toHaveBeenCalledWith(
            "study-group-chat:error",
            expect.objectContaining({ code: "UNAUTHENTICATED" }),
        );

        const invalidOrigin = makeGateway({
            cookie: `${SESSION_COOKIE_NAME}=sessao`,
            origin: "https://attacker.invalid",
        });
        await invalidOrigin.gateway.handleConnection(invalidOrigin.client as never);
        expect(invalidOrigin.client.emit).toHaveBeenCalledWith(
            "study-group-chat:error",
            expect.objectContaining({ code: "STUDY_GROUP_CHAT_ORIGIN_DENIED" }),
        );
    });

    it("rejeita professor no handshake e membro inexistente no join", async () => {
        const teacher = makeGateway({
            cookie: `${SESSION_COOKIE_NAME}=sessao`,
            sessionUser: { ...student, role: "TEACHER" },
        });
        await teacher.gateway.handleConnection(teacher.client as never);
        expect(teacher.client.disconnect).toHaveBeenCalledWith(true);

        const outsider = makeGateway({ user: student });
        outsider.messagesService.assertCanJoin.mockRejectedValue({
            response: { code: "ROOM_ACCESS_DENIED", message: "Não tens acesso a esta sala." },
        });
        await expect(outsider.gateway.handleJoin(outsider.client as never, { groupId }))
            .resolves.toEqual({ ok: false, error: expect.objectContaining({ code: "ROOM_ACCESS_DENIED" }) });
        expect(outsider.client.join).not.toHaveBeenCalled();
    });

    it("persiste antes do broadcast e deriva autor da sessão", async () => {
        const { client, gateway, messagesService, server } = makeGateway({ user: student });
        const ack = await gateway.handleSend(client as never, {
            groupId,
            text: "Olá grupo",
            clientMessageId,
            authorStudentId: "forjado",
        });
        expect(messagesService.sendRealtimeMessage).toHaveBeenCalledWith(
            student,
            groupId,
            "Olá grupo",
            clientMessageId,
        );
        expect(messagesService.sendRealtimeMessage.mock.invocationCallOrder[0])
            .toBeLessThan(server.emit.mock.invocationCallOrder[0]);
        expect(ack).toEqual({ ok: true, message: expect.objectContaining({ groupId }) });
    });

    it("desliga sockets passivas sem membership antes do broadcast", async () => {
        const { client, gateway, messagesService, server } = makeGateway({ user: student });
        const passive = {
            ...client,
            data: { sessionId: "passiva", user: student },
            disconnect: jest.fn(),
            emit: jest.fn(),
        };
        server.fetchSockets.mockResolvedValueOnce([passive]);
        messagesService.assertCanJoin.mockRejectedValueOnce({
            response: { code: "ROOM_ACCESS_DENIED", message: "Não tens acesso a esta sala." },
        });
        await gateway.handleSend(client as never, { groupId, text: "Nova", clientMessageId });
        expect(passive.disconnect).toHaveBeenCalledWith(true);
        expect(server.emit).toHaveBeenCalledTimes(1);
    });

    it("recusa evento e desliga a socket quando a sessão foi revogada", async () => {
        const { client, gateway, messagesService, sessionService } = makeGateway({ user: student });
        sessionService.requireSession.mockRejectedValueOnce({
            response: { code: "SESSION_REVOKED", message: "Sessão revogada." },
        });
        await expect(gateway.handleSend(client as never, {
            groupId,
            text: "Não persistir",
            clientMessageId,
        })).resolves.toEqual({
            ok: false,
            error: expect.objectContaining({ code: "SESSION_REVOKED" }),
        });
        expect(messagesService.sendRealtimeMessage).not.toHaveBeenCalled();
        expect(client.disconnect).toHaveBeenCalledWith(true);
    });
});

/** Cria gateway unitário sem abrir portas ou sockets reais. */
function makeGateway(options: {
    cookie?: string;
    origin?: string;
    user?: typeof student;
    sessionUser?: { id: string; email: string; role: "STUDENT" | "TEACHER" };
} = {}) {
    const sessionService = {
        requireSession: jest.fn().mockResolvedValue(options.sessionUser ?? student),
    };
    const messagesService = {
        assertCanJoin: jest.fn().mockResolvedValue({ _id: groupId }),
        roomName: jest.fn((id: string) => `study-group:${id}`),
        sendRealtimeMessage: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439099",
            groupId,
            authorStudentId: student.id,
            authorDisplayName: "Leonor Martins",
            kind: "MESSAGE",
            text: "Olá grupo",
        }),
    };
    const gateway = new StudyGroupChatGateway(
        sessionService as never,
        messagesService as never,
        new AccountLifecycleBarrierService(),
    );
    const server = {
        emit: jest.fn(),
        fetchSockets: jest.fn().mockResolvedValue([]),
        in: jest.fn().mockReturnThis(),
        to: jest.fn().mockReturnThis(),
    };
    Object.assign(gateway, { server });
    const client = {
        data: { sessionId: options.user ? "sessao-evento" : undefined, user: options.user },
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: { headers: { cookie: options.cookie, origin: options.origin ?? "http://localhost:5173" } },
        join: jest.fn(),
    };
    return { client, gateway, messagesService, server, sessionService };
}
