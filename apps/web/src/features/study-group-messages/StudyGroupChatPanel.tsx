/** Adapter fino entre o grupo de estudo e o núcleo comum de conversa. */
import {
    RealtimeChatPanel,
    type RealtimeChatTransport,
} from "../realtime-chat/RealtimeChatPanel.js";
import {
    listStudyGroupMessages,
    type StudyGroupMessage,
} from "./create-study-group-message.js";
import {
    createStudyGroupChatSocket,
    markStudyGroupChatRead,
} from "./study-group-chat-client.js";

/** Apresenta mensagens em tempo real sem misturar o fluxo REST de notas. */
export function StudyGroupChatPanel({ groupId }: { groupId: string }) {
    return (
        <RealtimeChatPanel
            contextKey={`study-group:${groupId}`}
            createTransport={() => createGroupTransport(groupId)}
            emptyTitle="Ainda não há mensagens neste grupo"
            listMessages={() => listStudyGroupMessages(groupId, "MESSAGE")}
            markRead={() => markStudyGroupChatRead(groupId)}
            messageBelongsToContext={(message) => message.groupId === groupId && message.kind === "MESSAGE"}
        />
    );
}

/** Converte a socket tipada do grupo para o contrato comum. */
function createGroupTransport(groupId: string): RealtimeChatTransport<StudyGroupMessage> {
    const socket = createStudyGroupChatSocket();
    return {
        connect: () => { socket.connect(); },
        disconnect: () => { socket.disconnect(); },
        clearHandlers: () => { if (typeof socket.off === "function") socket.off(); },
        join: (acknowledge) => socket.emit("study-group-chat:join", { groupId }, (ack) => acknowledge(ack.ok ? { ok: true } : ack)),
        send: (payload, acknowledge) => socket.emit("study-group-chat:send", { groupId, ...payload }, acknowledge),
        onConnect: (handler) => { socket.on("connect", handler); },
        onDisconnect: (handler) => { socket.on("disconnect", handler); },
        onConnectError: (handler) => { socket.on("connect_error", handler); },
        onError: (handler) => { socket.on("study-group-chat:error", handler); },
        onMessage: (handler) => { socket.on("study-group-chat:message", handler); },
    };
}
