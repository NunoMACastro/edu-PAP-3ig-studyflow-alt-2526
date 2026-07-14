/** Cliente REST e WebSocket do chat de grupos de estudo. */
import { io, Socket } from "socket.io-client";
import { requestMf3Json } from "../mf3/request-mf3-json.js";
import type { StudyGroupMessage } from "./create-study-group-message.js";

export type StudyGroupChatError = { code: string; message: string };
export type StudyGroupChatJoinAck =
    | { ok: true; groupId: string }
    | { ok: false; error: StudyGroupChatError };
export type StudyGroupChatSendAck =
    | { ok: true; message: StudyGroupMessage }
    | { ok: false; error: StudyGroupChatError };
export type StudyGroupChatUnread = {
    groupId: string;
    unreadCount: number;
    lastMessageAt?: string;
};

type ServerToClientEvents = {
    "study-group-chat:message": (message: StudyGroupMessage) => void;
    "study-group-chat:error": (error: StudyGroupChatError) => void;
};
type ClientToServerEvents = {
    "study-group-chat:join": (
        payload: { groupId: string },
        acknowledge: (ack: StudyGroupChatJoinAck) => void,
    ) => void;
    "study-group-chat:send": (
        payload: { groupId: string; text: string; clientMessageId: string },
        acknowledge: (ack: StudyGroupChatSendAck) => void,
    ) => void;
};

export type StudyGroupChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Cria uma socket desligada, com cookies e transporte WebSocket explícitos. */
export function createStudyGroupChatSocket(): StudyGroupChatSocket {
    return io("/study-group-chat", {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials: true,
    });
}

/** Marca como lidas as mensagens que ficaram visíveis no grupo. */
export function markStudyGroupChatRead(groupId: string): Promise<void> {
    return requestMf3Json<void>(`/api/study-groups/${groupId}/messages/read`, {
        method: "PUT",
    }).then(() => {
        window.dispatchEvent(new CustomEvent("student-study-group-chat-read", {
            detail: { groupId },
        }));
    });
}

/** Lista contadores bulk para tabs e cartões do hub. */
export function listStudyGroupChatUnread(): Promise<StudyGroupChatUnread[]> {
    return requestMf3Json<StudyGroupChatUnread[]>(
        "/api/student/study-group-chat/unread",
    );
}
