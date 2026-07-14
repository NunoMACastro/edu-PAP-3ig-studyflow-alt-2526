/** Cliente REST e WebSocket da conversa das salas de estudo. */
import { io, type Socket } from "socket.io-client";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

export type StudyRoomMessage = {
    _id: string;
    roomId: string;
    authorStudentId: string | null;
    authorDisplayName: string | null;
    kind: "MESSAGE";
    text: string | null;
    tombstoned: boolean;
    tombstonedAt?: string;
    createdAt?: string;
};

export type StudyRoomChatUnread = {
    roomId: string;
    unreadCount: number;
    lastMessageAt?: string;
};

type ChatError = { code: string; message: string };
type JoinAck = { ok: true; roomId: string } | { ok: false; error: ChatError };
type SendAck = { ok: true; message: StudyRoomMessage } | { ok: false; error: ChatError };
type ServerEvents = {
    "study-room-chat:message": (message: StudyRoomMessage) => void;
    "study-room-chat:error": (error: ChatError) => void;
};
type ClientEvents = {
    "study-room-chat:join": (
        payload: { roomId: string },
        acknowledge: (ack: JoinAck) => void,
    ) => void;
    "study-room-chat:send": (
        payload: { roomId: string; text: string; clientMessageId: string },
        acknowledge: (ack: SendAck) => void,
    ) => void;
};

export type StudyRoomChatSocket = Socket<ServerEvents, ClientEvents>;

export function createStudyRoomChatSocket(): StudyRoomChatSocket {
    return io("/study-room-chat", {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials: true,
    });
}

export function listStudyRoomMessages(roomId: string): Promise<StudyRoomMessage[]> {
    return requestMf3Json<StudyRoomMessage[]>(`/api/study-rooms/${roomId}/messages`);
}

export function markStudyRoomChatRead(roomId: string): Promise<void> {
    return requestMf3Json<void>(`/api/study-rooms/${roomId}/messages/read`, {
        method: "PUT",
    }).then(() => {
        window.dispatchEvent(new CustomEvent("student-study-room-chat-read", {
            detail: { roomId },
        }));
    });
}

export function listStudyRoomChatUnread(): Promise<StudyRoomChatUnread[]> {
    return requestMf3Json<StudyRoomChatUnread[]>(
        "/api/student/study-room-chat/unread",
    );
}
