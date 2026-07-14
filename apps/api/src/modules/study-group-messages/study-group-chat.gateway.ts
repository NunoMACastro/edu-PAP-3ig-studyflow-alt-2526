/** Implementa o gateway WebSocket exclusivo do chat de grupos de estudo. */
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import {
    assertAllowedSocketOrigin,
    AuthenticatedSocket,
    getAllowedWebOrigins,
    getSocketSessionId,
    isSocketSessionFailure,
    PublicSocketError,
    requireLiveSocketUser,
    toPublicSocketError,
} from "../../common/websockets/authenticated-socket-session.js";
import { SessionService } from "../auth/session.service.js";
import { StudyGroupMessagesService } from "./study-group-messages.service.js";

type StudyGroupChatSocket = AuthenticatedSocket & {
    disconnect(force?: boolean): void;
    emit(event: string, payload: unknown): void;
    join(room: string): Promise<void> | void;
};

type StudyGroupChatServer = {
    in(room: string): { fetchSockets(): Promise<StudyGroupChatSocket[]> };
    to(room: string): { emit(event: string, payload: unknown): void };
};

/** Ack explícito emitido depois de validar membership e entrar na room. */
export type StudyGroupChatJoinAck =
    | { ok: true; groupId: string }
    | { ok: false; error: PublicSocketError };

/** Ack explícito emitido apenas depois de persistir e fazer broadcast. */
export type StudyGroupChatSendAck =
    | { ok: true; message: unknown }
    | { ok: false; error: PublicSocketError };

/** Namespace isolado do domínio de grupos de estudo. */
@WebSocketGateway({
    namespace: "/study-group-chat",
    transports: ["websocket"],
    cors: {
        origin: getAllowedWebOrigins(),
        credentials: true,
    },
})
export class StudyGroupChatGateway {
    @WebSocketServer()
    private server!: StudyGroupChatServer;

    /**
     * @param sessionService Serviço canónico de sessões opacas.
     * @param messagesService Regras e persistência do chat do grupo.
     * @param accountLifecycleBarrier Barreira entre mutações e eliminação de conta.
     */
    constructor(
        private readonly sessionService: SessionService,
        private readonly messagesService: StudyGroupMessagesService,
        private readonly accountLifecycleBarrier: AccountLifecycleBarrierService,
    ) {}

    /** Valida origem, cookie, sessão ativa e role antes de aceitar eventos. */
    async handleConnection(client: StudyGroupChatSocket): Promise<void> {
        try {
            assertAllowedSocketOrigin(client, "STUDY_GROUP_CHAT_ORIGIN_DENIED");
            client.data.sessionId = getSocketSessionId(client);
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
        } catch (error) {
            client.emit("study-group-chat:error", this.publicError(error));
            client.disconnect(true);
        }
    }

    /** Junta apenas membros STUDENT à room do grupo pedida no payload. */
    @SubscribeMessage("study-group-chat:join")
    async handleJoin(
        @ConnectedSocket() client: StudyGroupChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<StudyGroupChatJoinAck> {
        try {
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
            const groupId = this.extractGroupId(payload);
            const group = await this.messagesService.assertCanJoin(user, groupId);
            await client.join(this.messagesService.roomName(group._id));
            return { ok: true, groupId: group._id };
        } catch (error) {
            const publicError = this.publicError(error);
            client.emit("study-group-chat:error", publicError);
            if (isSocketSessionFailure(publicError.code)) client.disconnect(true);
            return { ok: false, error: publicError };
        }
    }

    /** Revalida membership, persiste e só depois emite a mensagem. */
    @SubscribeMessage("study-group-chat:send")
    async handleSend(
        @ConnectedSocket() client: StudyGroupChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<StudyGroupChatSendAck> {
        try {
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
            const releaseMutation = this.accountLifecycleBarrier.enterMutation(user.id);
            try {
                const groupId = this.extractGroupId(payload);
                const message = await this.messagesService.sendRealtimeMessage(
                    user,
                    groupId,
                    this.extractString(payload, "text"),
                    this.extractString(payload, "clientMessageId"),
                );
                const room = this.messagesService.roomName(message.groupId);
                await this.disconnectRevokedRoomMembers(room, message.groupId);
                this.server.to(room).emit("study-group-chat:message", message);
                return { ok: true, message };
            } finally {
                releaseMutation();
            }
        } catch (error) {
            const publicError = this.publicError(error);
            client.emit("study-group-chat:error", publicError);
            if (isSocketSessionFailure(publicError.code)) client.disconnect(true);
            return { ok: false, error: publicError };
        }
    }

    /** Expulsa sockets cuja sessão, role ou membership deixou de ser válida. */
    private async disconnectRevokedRoomMembers(
        room: string,
        groupId: string,
    ): Promise<void> {
        const sockets = await this.server.in(room).fetchSockets();
        await Promise.all(
            sockets.map(async (socket) => {
                try {
                    const user = await requireLiveSocketUser(socket, this.sessionService);
                    this.assertStudentRole(user.role);
                    await this.messagesService.assertCanJoin(user, groupId);
                } catch (error) {
                    socket.emit("study-group-chat:error", this.publicError(error));
                    socket.disconnect(true);
                }
            }),
        );
    }

    /** Extrai um groupId sem aceitar campos de autorização enviados pelo cliente. */
    private extractGroupId(payload: unknown): string {
        const groupId = this.extractString(payload, "groupId").trim();
        if (!groupId) {
            throw {
                response: {
                    code: "STUDY_GROUP_CHAT_GROUP_REQUIRED",
                    message: "Indica o grupo do chat.",
                },
            };
        }
        return groupId;
    }

    /** Lê apenas strings dos payloads Socket.IO. */
    private extractString(payload: unknown, field: string): string {
        if (typeof payload !== "object" || payload === null || !(field in payload)) {
            return "";
        }
        const value = (payload as Record<string, unknown>)[field];
        return typeof value === "string" ? value : String(value ?? "");
    }

    /** Bloqueia qualquer role diferente de STUDENT com erro não enumerável. */
    private assertStudentRole(role: string): void {
        if (role !== "STUDENT") {
            throw {
                response: {
                    code: "STUDY_GROUP_CHAT_ACCESS_DENIED",
                    message: "Não tens acesso a este chat de grupo.",
                },
            };
        }
    }

    /** Normaliza erros desconhecidos para um contrato seguro. */
    private publicError(error: unknown): PublicSocketError {
        return toPublicSocketError(error, {
            code: "STUDY_GROUP_CHAT_ERROR",
            message: "Não foi possível processar o chat do grupo.",
        });
    }
}
