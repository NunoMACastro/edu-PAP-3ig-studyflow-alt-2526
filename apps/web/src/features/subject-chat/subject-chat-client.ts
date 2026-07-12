/**
 * Implementa o cliente REST e WebSocket do chat professor-aluno por disciplina.
 */
import { io, Socket } from "socket.io-client";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Papel da página que consome o chat.
 */
export type SubjectChatViewerRole = "STUDENT" | "TEACHER";

/**
 * Mensagem pública do chat por disciplina.
 */
export type SubjectChatMessage = {
    _id: string;
    threadId: string;
    subjectId: string;
    classId: string;
    authorUserId: string | null;
    authorRole: "STUDENT" | "TEACHER" | null;
    text: string | null;
    tombstoned?: boolean;
    tombstonedAt?: string;
    createdAt?: string;
};

/**
 * Erro público emitido pelo gateway.
 */
export type SubjectChatError = {
    code: string;
    message: string;
};

export type SubjectChatJoinAck =
    | { ok: true; subjectId: string }
    | { ok: false; error: SubjectChatError };

export type SubjectChatSendAck =
    | { ok: true; message: SubjectChatMessage }
    | { ok: false; error: SubjectChatError };

type ServerToClientEvents = {
    "subject-chat:message": (message: SubjectChatMessage) => void;
    "subject-chat:error": (error: SubjectChatError) => void;
};

type ClientToServerEvents = {
    "subject-chat:join": (
        payload: { subjectId: string },
        acknowledge: (ack: SubjectChatJoinAck) => void,
    ) => void;
    "subject-chat:send": (
        payload: { subjectId: string; text: string; clientMessageId: string },
        acknowledge: (ack: SubjectChatSendAck) => void,
    ) => void;
};

/**
 * Socket tipada usada pelo painel de chat.
 */
export type SubjectChatSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;

/**
 * Carrega o histórico persistido por REST.
 *
 * @param role Papel da página atual.
 * @param subjectId Disciplina alvo.
 * @returns Últimas mensagens autorizadas.
 */
export function listSubjectChatMessages(
    role: SubjectChatViewerRole,
    subjectId: string,
): Promise<SubjectChatMessage[]> {
    const rolePath = role === "STUDENT" ? "student" : "teacher";
    return requestMf3Json<SubjectChatMessage[]>(
        `/api/${rolePath}/subjects/${subjectId}/chat/messages`,
    );
}

/**
 * Cria uma socket para o namespace do chat da disciplina.
 *
 * @returns Socket desligada, pronta para registar handlers antes do connect.
 */
export function createSubjectChatSocket(): SubjectChatSocket {
    return io("/subject-chat", {
        autoConnect: false,
        transports: ["websocket"],
        withCredentials: true,
    });
}
