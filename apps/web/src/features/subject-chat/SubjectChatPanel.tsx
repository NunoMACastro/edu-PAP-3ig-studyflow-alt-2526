/** Adapter fino entre o domínio da disciplina e o núcleo comum de chat. */
import {
    mergeMessages,
    RealtimeChatPanel,
    type RealtimeChatTransport,
} from "../realtime-chat/RealtimeChatPanel.js";
import {
    createSubjectChatSocket,
    listSubjectChatMessages,
    markStudentSubjectChatRead,
    type SubjectChatMessage,
    type SubjectChatViewerRole,
} from "./subject-chat-client.js";

type SubjectChatPanelProps = {
    subjectId: string;
    role: SubjectChatViewerRole;
    readOnly?: boolean;
};

/** Mantém rotas e eventos existentes, delegando apenas comportamento visual comum. */
export function SubjectChatPanel({ subjectId, role, readOnly = false }: SubjectChatPanelProps) {
    return (
        <RealtimeChatPanel
            archivedNotice="Esta disciplina está arquivada. Podes consultar as mensagens anteriores, mas já não podes enviar novas mensagens."
            contextKey={`subject:${subjectId}:${role}`}
            createTransport={() => createSubjectTransport(subjectId)}
            emptyTitle="Ainda não há mensagens nesta disciplina"
            listMessages={() => listSubjectChatMessages(role, subjectId)}
            markRead={role === "STUDENT" ? () => markStudentSubjectChatRead(subjectId) : undefined}
            messageBelongsToContext={(message) => message.subjectId === subjectId}
            readOnly={readOnly}
        />
    );
}

/** Converte a socket tipada da disciplina para o contrato comum. */
function createSubjectTransport(subjectId: string): RealtimeChatTransport<SubjectChatMessage> {
    const socket = createSubjectChatSocket();
    return {
        connect: () => { socket.connect(); },
        disconnect: () => { socket.disconnect(); },
        clearHandlers: () => { if (typeof socket.off === "function") socket.off(); },
        join: (acknowledge) => socket.emit("subject-chat:join", { subjectId }, (ack) => acknowledge(ack.ok ? { ok: true } : ack)),
        send: (payload, acknowledge) => socket.emit("subject-chat:send", { subjectId, ...payload }, acknowledge),
        onConnect: (handler) => { socket.on("connect", handler); },
        onDisconnect: (handler) => { socket.on("disconnect", handler); },
        onConnectError: (handler) => { socket.on("connect_error", handler); },
        onError: (handler) => { socket.on("subject-chat:error", handler); },
        onMessage: (handler) => { socket.on("subject-chat:message", handler); },
    };
}

export { mergeMessages };
