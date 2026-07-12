/**
 * Implementa o gateway WebSocket do chat professor-aluno por disciplina.
 */
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    SESSION_COOKIE_NAME,
    SessionService,
} from "../auth/session.service.js";
import { TeacherStudentChatService } from "./teacher-student-chat.service.js";

type SubjectChatSocket = {
    data: {
        sessionId?: string;
        user?: AuthenticatedUser;
    };
    disconnect(force?: boolean): void;
    emit(event: string, payload: unknown): void;
    handshake: {
        headers: {
            cookie?: string;
            origin?: string;
        };
    };
    join(room: string): Promise<void> | void;
};

type SubjectChatError = {
    code: string;
    message: string;
};

/**
 * Confirmação explícita do join, usada pelo cliente antes de reconciliar REST.
 */
export type SubjectChatJoinAck =
    | { ok: true; subjectId: string }
    | { ok: false; error: SubjectChatError };

/**
 * Confirmação explícita de persistência do envio.
 */
export type SubjectChatSendAck =
    | { ok: true; message: unknown }
    | { ok: false; error: SubjectChatError };

type SubjectChatServer = {
    in(room: string): {
        fetchSockets(): Promise<SubjectChatSocket[]>;
    };
    to(room: string): {
        emit(event: string, payload: unknown): void;
    };
};

const DEFAULT_WEB_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

/**
 * Gateway Socket.IO para o canal em tempo real da disciplina.
 */
@WebSocketGateway({
    namespace: "/subject-chat",
    cors: {
        origin: getAllowedWebOrigins(),
        credentials: true,
    },
})
export class TeacherStudentChatGateway {
    @WebSocketServer()
    private server!: SubjectChatServer;

    /**
     * Recebe dependências para validar sessão e delegar regras do domínio.
     *
     * @param sessionService Service canónico de sessões opacas.
     * @param chatService Service de autorização e persistência do chat.
     * @param accountLifecycleBarrier Barreira que serializa envios com a eliminação da conta.
     */
    constructor(
        private readonly sessionService: SessionService,
        private readonly chatService: TeacherStudentChatService,
        private readonly accountLifecycleBarrier: AccountLifecycleBarrierService,
    ) {}

    /**
     * Valida origem e sessão no handshake antes de aceitar eventos do cliente.
     *
     * @param client Socket ligada ao namespace.
     * @returns Promise resolvida quando a sessão fica anexada à socket.
     */
    async handleConnection(client: SubjectChatSocket): Promise<void> {
        try {
            this.assertAllowedOrigin(client);
            const sessionId = this.getSessionIdFromCookie(client);
            client.data.sessionId = sessionId;
            client.data.user = await this.sessionService.requireSession(sessionId);
        } catch (error) {
            client.emit("subject-chat:error", this.toPublicError(error));
            client.disconnect(true);
        }
    }

    /**
     * Junta o utilizador autorizado à room da disciplina.
     *
     * @param client Socket autenticada.
     * @param payload Payload com `subjectId`.
     * @returns Ack explícito; o evento de erro mantém compatibilidade com clientes antigos.
     */
    @SubscribeMessage("subject-chat:join")
    async handleJoin(
        @ConnectedSocket() client: SubjectChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<SubjectChatJoinAck> {
        try {
            const user = await this.requireLiveSocketUser(client);
            const subjectId = this.extractSubjectId(payload);
            const access = await this.chatService.assertCanJoin(user, subjectId);
            await client.join(this.chatService.roomName(access.subjectId));
            return { ok: true, subjectId: access.subjectId };
        } catch (error) {
            const publicError = this.toPublicError(error);
            client.emit("subject-chat:error", publicError);
            if (this.isSessionFailure(publicError.code)) client.disconnect(true);
            return { ok: false, error: publicError };
        }
    }

    /**
     * Persiste e emite uma mensagem para todos os participantes ligados à disciplina.
     *
     * @param client Socket autenticada.
     * @param payload Payload com `subjectId` e `text`.
     * @returns Ack que só confirma sucesso depois da persistência e do broadcast.
     */
    @SubscribeMessage("subject-chat:send")
    async handleSend(
        @ConnectedSocket() client: SubjectChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<SubjectChatSendAck> {
        try {
            const user = await this.requireLiveSocketUser(client);
            const releaseMutation = this.accountLifecycleBarrier.enterMutation(
                user.id,
            );
            try {
                const subjectId = this.extractSubjectId(payload);
                const text = this.extractText(payload);
                const clientMessageId = this.extractClientMessageId(payload);
                const message = await this.chatService.sendMessage(
                    user,
                    subjectId,
                    text,
                    clientMessageId,
                );
                const room = this.chatService.roomName(message.subjectId);
                await this.disconnectRevokedRoomMembers(room, message.subjectId);
                this.server
                    .to(room)
                    .emit("subject-chat:message", message);
                return { ok: true, message };
            } finally {
                releaseMutation();
            }
        } catch (error) {
            const publicError = this.toPublicError(error);
            client.emit("subject-chat:error", publicError);
            if (this.isSessionFailure(publicError.code)) client.disconnect(true);
            return { ok: false, error: publicError };
        }
    }

    /**
     * Rejeita sockets de origens que não correspondem ao frontend configurado.
     *
     * @param client Socket em handshake.
     * @returns Nada quando a origem é aceite.
     */
    private assertAllowedOrigin(client: SubjectChatSocket): void {
        const origin = client.handshake.headers.origin;
        if (!origin || !getAllowedWebOrigins().includes(origin)) {
            throw {
                response: {
                    code: "SUBJECT_CHAT_ORIGIN_DENIED",
                    message: "Origem WebSocket não autorizada.",
                },
            };
        }
    }

    /**
     * Extrai o identificador de sessão do cookie HttpOnly enviado pelo browser.
     *
     * @param client Socket em handshake.
     * @returns Identificador opaco da sessão.
     */
    private getSessionIdFromCookie(client: SubjectChatSocket): string {
        const cookies = parseCookieHeader(client.handshake.headers.cookie ?? "");
        const sessionId = cookies[SESSION_COOKIE_NAME];
        if (!sessionId) {
            throw {
                response: {
                    code: "UNAUTHENTICATED",
                    message: "Inicia sessão para continuar.",
                },
            };
        }
        return sessionId;
    }

    /**
     * Relê a sessão em cada evento para não reutilizar role, estado de conta ou
     * geração de segurança guardados no handshake.
     *
     * @param client Socket autenticada.
     * @returns Utilizador da sessão.
     */
    private async requireLiveSocketUser(
        client: SubjectChatSocket,
    ): Promise<AuthenticatedUser> {
        if (!client.data.sessionId) {
            throw {
                response: {
                    code: "UNAUTHENTICATED",
                    message: "Inicia sessão para continuar.",
                },
            };
        }
        const user = await this.sessionService.requireSession(
            client.data.sessionId,
        );
        client.data.user = user;
        return user;
    }

    /**
     * Revalida todos os membros antes de cada broadcast. Assim, uma socket que
     * ficou passiva depois de mudança de papel/eliminação não recebe a próxima
     * mensagem apenas por continuar inscrita na room.
     *
     * @param room Room Socket.IO da disciplina.
     * @param subjectId Disciplina usada para revalidar membership/role.
     */
    private async disconnectRevokedRoomMembers(
        room: string,
        subjectId: string,
    ): Promise<void> {
        const sockets = await this.server.in(room).fetchSockets();
        await Promise.all(
            sockets.map(async (socket) => {
                try {
                    const user = await this.requireLiveSocketUser(socket);
                    await this.chatService.assertCanJoin(user, subjectId);
                } catch (error) {
                    socket.emit("subject-chat:error", this.toPublicError(error));
                    socket.disconnect(true);
                }
            }),
        );
    }

    /**
     * Extrai e valida o identificador da disciplina do payload.
     *
     * @param payload Payload recebido por Socket.IO.
     * @returns `subjectId` textual.
     */
    private extractSubjectId(payload: unknown): string {
        const subjectId =
            typeof payload === "object" && payload !== null && "subjectId" in payload
                ? String((payload as { subjectId?: unknown }).subjectId ?? "").trim()
                : "";
        if (!subjectId) {
            throw {
                response: {
                    code: "SUBJECT_CHAT_SUBJECT_REQUIRED",
                    message: "Indica a disciplina do chat.",
                },
            };
        }
        return subjectId;
    }

    /** Obtém a chave de idempotência opcional enviada pelos clientes atuais. */
    private extractClientMessageId(payload: unknown): string | undefined {
        if (
            typeof payload !== "object" ||
            payload === null ||
            !("clientMessageId" in payload)
        ) {
            return undefined;
        }
        const value = (payload as { clientMessageId?: unknown }).clientMessageId;
        return typeof value === "string" ? value : String(value ?? "");
    }

    /**
     * Extrai texto bruto do payload de envio.
     *
     * @param payload Payload recebido por Socket.IO.
     * @returns Texto enviado pelo cliente.
     */
    private extractText(payload: unknown): string {
        return typeof payload === "object" && payload !== null && "text" in payload
            ? String((payload as { text?: unknown }).text ?? "")
            : "";
    }

    /**
     * Converte exceções em erro público estável para o frontend.
     *
     * @param error Exceção do domínio ou valor desconhecido.
     * @returns Código e mensagem seguros.
     */
    private toPublicError(error: unknown): SubjectChatError {
        const response =
            typeof error === "object" && error !== null && "response" in error
                ? (error as { response?: { code?: unknown; message?: unknown } })
                      .response
                : undefined;
        return {
            code:
                typeof response?.code === "string"
                    ? response.code
                    : "SUBJECT_CHAT_ERROR",
            message:
                typeof response?.message === "string"
                    ? response.message
                    : "Não foi possível processar o chat.",
        };
    }

    private isSessionFailure(code: string): boolean {
        return code === "UNAUTHENTICATED" || code === "SESSION_REVOKED";
    }
}

/**
 * Faz parsing mínimo do header Cookie sem expor o valor da sessão à aplicação cliente.
 *
 * @param cookieHeader Header Cookie recebido no handshake.
 * @returns Mapa simples de cookies.
 */
function parseCookieHeader(cookieHeader: string): Record<string, string> {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce<Record<string, string>>((cookies, part) => {
            const separatorIndex = part.indexOf("=");
            if (separatorIndex === -1) return cookies;
            const name = part.slice(0, separatorIndex).trim();
            const value = part.slice(separatorIndex + 1).trim();
            if (name) cookies[name] = decodeURIComponent(value);
            return cookies;
        }, {});
}

/**
 * Resolve as origens Web autorizadas para o handshake Socket.IO.
 *
 * @returns Lista de origens permitidas.
 */
function getAllowedWebOrigins(): string[] {
    const rawOrigin = process.env.WEB_ORIGIN?.trim();
    if (!rawOrigin || rawOrigin === DEFAULT_WEB_ORIGINS[0]) {
        return DEFAULT_WEB_ORIGINS;
    }

    return rawOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}
