/** Adapter fino entre a sala de estudo e o núcleo comum de conversa. */
import {
    RealtimeChatPanel,
    type RealtimeChatTransport,
} from "../realtime-chat/RealtimeChatPanel.js";
import {
    createStudyRoomChatSocket,
    listStudyRoomMessages,
    markStudyRoomChatRead,
    type StudyRoomMessage,
} from "./study-room-chat-client.js";

export function StudyRoomChatPanel({ roomId }: { roomId: string }) {
    return (
        <RealtimeChatPanel
            contextKey={`study-room:${roomId}`}
            createTransport={() => createRoomTransport(roomId)}
            emptyTitle="Ainda não há mensagens nesta sala"
            listMessages={() => listStudyRoomMessages(roomId)}
            markRead={() => markStudyRoomChatRead(roomId)}
            messageBelongsToContext={(message) => message.roomId === roomId}
        />
    );
}

function createRoomTransport(roomId: string): RealtimeChatTransport<StudyRoomMessage> {
    const socket = createStudyRoomChatSocket();
    return {
        connect: () => { socket.connect(); },
        disconnect: () => { socket.disconnect(); },
        clearHandlers: () => { if (typeof socket.off === "function") socket.off(); },
        join: (acknowledge) => socket.emit(
            "study-room-chat:join",
            { roomId },
            (ack) => acknowledge(ack.ok ? { ok: true } : ack),
        ),
        send: (payload, acknowledge) => socket.emit(
            "study-room-chat:send",
            { roomId, ...payload },
            acknowledge,
        ),
        onConnect: (handler) => { socket.on("connect", handler); },
        onDisconnect: (handler) => { socket.on("disconnect", handler); },
        onConnectError: (handler) => { socket.on("connect_error", handler); },
        onError: (handler) => { socket.on("study-room-chat:error", handler); },
        onMessage: (handler) => { socket.on("study-room-chat:message", handler); },
    };
}
