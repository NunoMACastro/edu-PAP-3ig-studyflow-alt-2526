/** Gateway WebSocket da conversa das salas, isolado do contrato legado dos grupos. */
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
    type AuthenticatedSocket,
    getAllowedWebOrigins,
    getSocketSessionId,
    isSocketSessionFailure,
    type PublicSocketError,
    requireLiveSocketUser,
    toPublicSocketError,
} from "../../common/websockets/authenticated-socket-session.js";
import { SessionService } from "../auth/session.service.js";
import {
    StudyGroupMessagesService,
    type StudyGroupMessageView,
} from "./study-group-messages.service.js";

type StudyRoomChatSocket = AuthenticatedSocket & {
    disconnect(force?: boolean): void;
    emit(event: string, payload: unknown): void;
    join(room: string): Promise<void> | void;
};

type StudyRoomChatServer = {
    in(room: string): { fetchSockets(): Promise<StudyRoomChatSocket[]> };
    to(room: string): { emit(event: string, payload: unknown): void };
};

type JoinAck =
    | { ok: true; roomId: string }
    | { ok: false; error: PublicSocketError };
type SendAck =
    | { ok: true; message: unknown }
    | { ok: false; error: PublicSocketError };

@WebSocketGateway({
    namespace: "/study-room-chat",
    transports: ["websocket"],
    cors: { origin: getAllowedWebOrigins(), credentials: true },
})
export class StudyRoomChatGateway {
    @WebSocketServer()
    private server!: StudyRoomChatServer;

    constructor(
        private readonly sessionService: SessionService,
        private readonly messagesService: StudyGroupMessagesService,
        private readonly accountLifecycleBarrier: AccountLifecycleBarrierService,
    ) {}

    /** Rejeita a ligação antes de aceitar eventos quando origem ou sessão são inválidas. */
    async handleConnection(client: StudyRoomChatSocket): Promise<void> {
        try {
            assertAllowedSocketOrigin(client, "STUDY_ROOM_CHAT_ORIGIN_DENIED");
            client.data.sessionId = getSocketSessionId(client);
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
        } catch (error) {
            client.emit("study-room-chat:error", this.publicError(error));
            client.disconnect(true);
        }
    }

    /** Junta apenas membros atuais à room Socket.IO da sala. */
    @SubscribeMessage("study-room-chat:join")
    async handleJoin(
        @ConnectedSocket() client: StudyRoomChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<JoinAck> {
        try {
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
            const roomId = this.extractRoomId(payload);
            const room = await this.messagesService.assertCanJoin(
                user,
                roomId,
                "STUDY_ROOM",
            );
            await client.join(this.messagesService.roomName(room._id, "STUDY_ROOM"));
            return { ok: true, roomId: room._id };
        } catch (error) {
            return this.reject(client, error);
        }
    }

    /** Revalida membership, persiste de forma idempotente e só depois publica. */
    @SubscribeMessage("study-room-chat:send")
    async handleSend(
        @ConnectedSocket() client: StudyRoomChatSocket,
        @MessageBody() payload: unknown,
    ): Promise<SendAck> {
        try {
            const user = await requireLiveSocketUser(client, this.sessionService);
            this.assertStudentRole(user.role);
            const releaseMutation = this.accountLifecycleBarrier.enterMutation(user.id);
            try {
                const roomId = this.extractRoomId(payload);
                const message = await this.messagesService.sendRealtimeMessage(
                    user,
                    roomId,
                    this.extractString(payload, "text"),
                    this.extractString(payload, "clientMessageId"),
                    "STUDY_ROOM",
                );
                const socketRoom = this.messagesService.roomName(roomId, "STUDY_ROOM");
                await this.disconnectRevokedMembers(socketRoom, roomId);
                const publicMessage = this.toRoomMessage(message);
                this.server.to(socketRoom).emit("study-room-chat:message", publicMessage);
                return { ok: true, message: publicMessage };
            } finally {
                releaseMutation();
            }
        } catch (error) {
            return this.reject(client, error);
        }
    }

    /** Expulsa sockets cuja sessão ou membership deixou de ser válida. */
    private async disconnectRevokedMembers(
        socketRoom: string,
        roomId: string,
    ): Promise<void> {
        const sockets = await this.server.in(socketRoom).fetchSockets();
        await Promise.all(sockets.map(async (socket) => {
            try {
                const user = await requireLiveSocketUser(socket, this.sessionService);
                this.assertStudentRole(user.role);
                await this.messagesService.assertCanJoin(user, roomId, "STUDY_ROOM");
            } catch (error) {
                socket.emit("study-room-chat:error", this.publicError(error));
                socket.disconnect(true);
            }
        }));
    }

    private toRoomMessage(message: StudyGroupMessageView) {
        const { groupId, ...row } = message;
        return { ...row, roomId: groupId };
    }

    private extractRoomId(payload: unknown): string {
        const roomId = this.extractString(payload, "roomId").trim();
        if (!roomId) {
            throw {
                response: {
                    code: "STUDY_ROOM_CHAT_ROOM_REQUIRED",
                    message: "Indica a sala do chat.",
                },
            };
        }
        return roomId;
    }

    private extractString(payload: unknown, field: string): string {
        if (typeof payload !== "object" || payload === null || !(field in payload)) {
            return "";
        }
        const value = (payload as Record<string, unknown>)[field];
        return typeof value === "string" ? value : String(value ?? "");
    }

    private assertStudentRole(role: string): void {
        if (role !== "STUDENT") {
            throw {
                response: {
                    code: "STUDY_ROOM_CHAT_ACCESS_DENIED",
                    message: "Não tens acesso a este chat de sala.",
                },
            };
        }
    }

    private reject(client: StudyRoomChatSocket, error: unknown): { ok: false; error: PublicSocketError } {
        const publicError = this.publicError(error);
        client.emit("study-room-chat:error", publicError);
        if (isSocketSessionFailure(publicError.code)) client.disconnect(true);
        return { ok: false, error: publicError };
    }

    private publicError(error: unknown): PublicSocketError {
        return toPublicSocketError(error, {
            code: "STUDY_ROOM_CHAT_ERROR",
            message: "Não foi possível processar o chat da sala.",
        });
    }
}
