/**
 * Testa handshake e eventos WebSocket do chat professor-aluno por disciplina.
 */
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { SESSION_COOKIE_NAME } from "../auth/session.service.js";
import { TeacherStudentChatGateway } from "./teacher-student-chat.gateway.js";

const subjectId = "507f1f77bcf86cd799439013";
const student = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT" as const,
};

describe("TeacherStudentChatGateway", () => {
    const previousOrigin = process.env.WEB_ORIGIN;

    beforeEach(() => {
        process.env.WEB_ORIGIN = "http://localhost:5173";
    });

    afterEach(() => {
        process.env.WEB_ORIGIN = previousOrigin;
        jest.clearAllMocks();
    });

    it("rejeita handshake sem cookie de sessão", async () => {
        const { client, gateway } = makeGateway();

        await gateway.handleConnection(client as never);

        expect(client.emit).toHaveBeenCalledWith(
            "subject-chat:error",
            expect.objectContaining({ code: "UNAUTHENTICATED" }),
        );
        expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it("anexa utilizador autenticado quando origem e sessão são válidas", async () => {
        const { client, gateway, sessionService } = makeGateway({
            cookie: `${SESSION_COOKIE_NAME}=sessao-valida`,
        });

        await gateway.handleConnection(client as never);

        expect(sessionService.requireSession).toHaveBeenCalledWith("sessao-valida");
        expect(client.data.sessionId).toBe("sessao-valida");
        expect(client.data.user).toEqual(student);
        expect(client.disconnect).not.toHaveBeenCalled();
    });

    it("aceita 127.0.0.1 como origem local equivalente", async () => {
        const { client, gateway, sessionService } = makeGateway({
            cookie: `${SESSION_COOKIE_NAME}=sessao-valida`,
            origin: "http://127.0.0.1:5173",
        });

        await gateway.handleConnection(client as never);

        expect(sessionService.requireSession).toHaveBeenCalledWith("sessao-valida");
        expect(client.disconnect).not.toHaveBeenCalled();
    });

    it("envia erro público quando join falha por autorização", async () => {
        const { chatService, client, gateway } = makeGateway({
            user: student,
        });
        chatService.assertCanJoin.mockRejectedValue({
            response: {
                code: "CLASS_ENROLLMENT_REQUIRED",
                message: "Não estás inscrito nesta turma.",
            },
        });

        const ack = await gateway.handleJoin(client as never, { subjectId });

        expect(client.emit).toHaveBeenCalledWith(
            "subject-chat:error",
            expect.objectContaining({ code: "CLASS_ENROLLMENT_REQUIRED" }),
        );
        expect(client.join).not.toHaveBeenCalled();
        expect(ack).toEqual({
            ok: false,
            error: expect.objectContaining({ code: "CLASS_ENROLLMENT_REQUIRED" }),
        });
    });

    it("persiste e emite mensagem para a room da disciplina", async () => {
        const { chatService, client, gateway, server, sessionService } = makeGateway({
            user: student,
        });

        const ack = await gateway.handleSend(client as never, {
            subjectId,
            text: "Olá!",
        });

        expect(chatService.sendMessage).toHaveBeenCalledWith(
            student,
            subjectId,
            "Olá!",
            undefined,
        );
        expect(sessionService.requireSession).toHaveBeenCalledWith(
            "sessao-do-evento",
        );
        expect(server.to).toHaveBeenCalledWith(`subject:${subjectId}`);
        expect(server.emit).toHaveBeenCalledWith(
            "subject-chat:message",
            expect.objectContaining({ text: "Olá!" }),
        );
        expect(ack).toEqual({
            ok: true,
            message: expect.objectContaining({ text: "Olá!" }),
        });
    });

    it("rejeita o evento e desliga a socket quando a sessão foi revogada", async () => {
        const { chatService, client, gateway, sessionService } = makeGateway({
            user: student,
        });
        sessionService.requireSession.mockRejectedValueOnce({
            response: {
                code: "SESSION_REVOKED",
                message: "A sessão foi revogada. Inicia sessão novamente.",
            },
        });

        await expect(
            gateway.handleSend(client as never, { subjectId, text: "Olá!" }),
        ).resolves.toEqual({
            ok: false,
            error: expect.objectContaining({ code: "SESSION_REVOKED" }),
        });
        expect(chatService.sendMessage).not.toHaveBeenCalled();
        expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it("desliga membro passivo revogado antes de emitir a próxima mensagem", async () => {
        const { client, gateway, server, sessionService } = makeGateway({
            user: student,
        });
        const passiveClient = {
            ...client,
            data: { sessionId: "sessao-passiva", user: student },
            disconnect: jest.fn(),
            emit: jest.fn(),
        };
        server.fetchSockets.mockResolvedValueOnce([passiveClient]);
        sessionService.requireSession
            .mockResolvedValueOnce(student)
            .mockRejectedValueOnce({
                response: {
                    code: "SESSION_REVOKED",
                    message: "A sessão foi revogada. Inicia sessão novamente.",
                },
            });

        await gateway.handleSend(client as never, { subjectId, text: "Nova" });

        expect(passiveClient.disconnect).toHaveBeenCalledWith(true);
        expect(passiveClient.emit).toHaveBeenCalledWith(
            "subject-chat:error",
            expect.objectContaining({ code: "SESSION_REVOKED" }),
        );
        expect(server.emit).toHaveBeenCalledTimes(1);
    });

    it("serializa o envio com a eliminação e bloqueia novo send durante a corrida", async () => {
        const { accountLifecycleBarrier, chatService, client, gateway } =
            makeGateway({ user: student });
        const persistedMessage = {
            _id: "507f1f77bcf86cd799439099",
            threadId: "507f1f77bcf86cd799439015",
            subjectId,
            classId: "507f1f77bcf86cd799439014",
            authorUserId: student.id,
            authorRole: "STUDENT",
            text: "Primeira",
        };
        let persistFirstMessage!: (message: typeof persistedMessage) => void;
        chatService.sendMessage.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    persistFirstMessage = resolve;
                }),
        );

        const firstSend = gateway.handleSend(client as never, {
            subjectId,
            text: "Primeira",
        });
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(chatService.sendMessage).toHaveBeenCalledTimes(1);

        const exclusiveDeletion = jest.fn().mockResolvedValue(undefined);
        const deletion = accountLifecycleBarrier.runDeletionExclusive(
            student.id,
            exclusiveDeletion,
        );
        await Promise.resolve();
        expect(exclusiveDeletion).not.toHaveBeenCalled();

        await expect(
            gateway.handleSend(client as never, {
                subjectId,
                text: "Segunda",
            }),
        ).resolves.toEqual({
            ok: false,
            error: expect.objectContaining({
                code: "ACCOUNT_DELETION_IN_PROGRESS",
            }),
        });
        expect(chatService.sendMessage).toHaveBeenCalledTimes(1);

        persistFirstMessage(persistedMessage);
        await expect(firstSend).resolves.toEqual({
            ok: true,
            message: persistedMessage,
        });
        await expect(deletion).resolves.toBeUndefined();
        expect(exclusiveDeletion).toHaveBeenCalledTimes(1);
    });
});

/**
 * Cria gateway com mocks de Socket.IO e services.
 *
 * @param options Overrides do cenário.
 * @returns Gateway e mocks.
 */
function makeGateway(
    options: { cookie?: string; origin?: string; user?: typeof student } = {},
) {
    const sessionService = {
        requireSession: jest.fn().mockResolvedValue(student),
    };
    const chatService = {
        assertCanJoin: jest.fn().mockResolvedValue({ subjectId }),
        roomName: jest.fn((targetSubjectId: string) => `subject:${targetSubjectId}`),
        sendMessage: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439099",
            threadId: "507f1f77bcf86cd799439015",
            subjectId,
            classId: "507f1f77bcf86cd799439014",
            authorUserId: student.id,
            authorRole: "STUDENT",
            text: "Olá!",
        }),
    };
    const accountLifecycleBarrier = new AccountLifecycleBarrierService();
    const gateway = new TeacherStudentChatGateway(
        sessionService as never,
        chatService as never,
        accountLifecycleBarrier,
    );
    const server = {
        emit: jest.fn(),
        fetchSockets: jest.fn().mockResolvedValue([]),
        in: jest.fn().mockReturnThis(),
        to: jest.fn().mockReturnThis(),
    };
    Object.assign(gateway, { server });
    const client = {
        data: {
            user: options.user,
            sessionId: options.user ? "sessao-do-evento" : undefined,
        },
        disconnect: jest.fn(),
        emit: jest.fn(),
        handshake: {
            headers: {
                cookie: options.cookie,
                origin: options.origin ?? "http://localhost:5173",
            },
        },
        join: jest.fn(),
    };

    return {
        accountLifecycleBarrier,
        chatService,
        client,
        gateway,
        server,
        sessionService,
    };
}
