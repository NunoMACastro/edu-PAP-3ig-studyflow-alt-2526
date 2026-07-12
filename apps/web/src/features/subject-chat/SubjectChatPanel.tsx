/**
 * Implementa o painel reutilizável de chat por disciplina.
 */
import { FormEvent, useEffect, useRef, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    createSubjectChatSocket,
    listSubjectChatMessages,
    type SubjectChatError,
    type SubjectChatMessage,
    type SubjectChatSendAck,
    type SubjectChatSocket,
    type SubjectChatViewerRole,
} from "./subject-chat-client.js";

const MAX_MESSAGE_LENGTH = 4000;
const JOIN_ACK_TIMEOUT_MS = 10_000;
const SEND_ACK_TIMEOUT_MS = 10_000;

type SubjectChatPanelProps = {
    subjectId: string;
    role: SubjectChatViewerRole;
};

/**
 * Painel com join confirmado, histórico REST reconciliado e envio com ack.
 *
 * @param props Disciplina e papel usados apenas para escolher o endpoint; a API
 * revalida sessão, membership e ownership em todos os caminhos.
 * @returns Interface de chat resiliente a reconnects e respostas fora de ordem.
 */
export function SubjectChatPanel({ subjectId, role }: SubjectChatPanelProps) {
    const socketRef = useRef<SubjectChatSocket | null>(null);
    const pendingSendRef = useRef<{ text: string; clientMessageId: string } | null>(null);
    const [messages, setMessages] = useState<SubjectChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        let joinGeneration = 0;
        let joinTimeoutId: number | undefined;
        const socket = createSubjectChatSocket();
        socketRef.current = socket;
        setLoading(true);
        setConnected(false);
        setError(null);
        setMessages([]);

        /**
         * Obtém o histórico depois do join e funde-o com eventos já recebidos.
         */
        async function reconcileHistory(): Promise<void> {
            try {
                const history = await listSubjectChatMessages(role, subjectId);
                if (!active) return;
                setMessages((current) => mergeMessages(history, current));
            } catch (caught) {
                if (!active) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Erro ao reconciliar o histórico do chat.",
                );
            } finally {
                if (active) setLoading(false);
            }
        }

        socket.on("connect", () => {
            if (!active) return;
            setConnected(false);
            const generation = ++joinGeneration;
            window.clearTimeout(joinTimeoutId);
            joinTimeoutId = window.setTimeout(() => {
                if (!active || generation !== joinGeneration) return;
                setLoading(false);
                setError("A entrada no chat não foi confirmada. Tenta novamente.");
            }, JOIN_ACK_TIMEOUT_MS);
            socket.emit("subject-chat:join", { subjectId }, (ack) => {
                window.clearTimeout(joinTimeoutId);
                if (!active || generation !== joinGeneration) return;
                if (!ack.ok) {
                    setError(ack.error.message);
                    setLoading(false);
                    return;
                }
                setConnected(true);
                setError(null);
                void reconcileHistory();
            });
        });
        socket.on("disconnect", () => {
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            if (active) setConnected(false);
        });
        socket.on("connect_error", () => {
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            if (!active) return;
            setConnected(false);
            setLoading(false);
            setError("Não foi possível ligar ao chat em tempo real.");
        });
        socket.on("subject-chat:error", (nextError: SubjectChatError) => {
            if (active) setError(nextError.message);
        });
        socket.on("subject-chat:message", (message: SubjectChatMessage) => {
            if (!active || message.subjectId !== subjectId) return;
            setMessages((current) => mergeMessages(current, [message]));
        });

        socket.connect();

        return () => {
            active = false;
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            socket.disconnect();
            if (socketRef.current === socket) socketRef.current = null;
        };
    }, [role, subjectId]);

    /**
     * Mantém o rascunho até o backend confirmar persistência por ack.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const cleanDraft = draft.trim();
        if (!cleanDraft || sending) return;

        const socket = socketRef.current;
        if (!socket || !connected) {
            setError("O chat em tempo real não está ligado.");
            return;
        }

        setSending(true);
        setError(null);
        try {
            const pending =
                pendingSendRef.current?.text === cleanDraft
                    ? pendingSendRef.current
                    : {
                          text: cleanDraft,
                          clientMessageId: crypto.randomUUID(),
                      };
            pendingSendRef.current = pending;
            const ack = await emitMessageWithAck(socket, {
                subjectId,
                text: cleanDraft,
                clientMessageId: pending.clientMessageId,
            });
            if (!ack.ok) throw new Error(ack.error.message);
            setMessages((current) => mergeMessages(current, [ack.message]));
            setDraft((current) => (current.trim() === cleanDraft ? "" : current));
            pendingSendRef.current = null;
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível enviar a mensagem.",
            );
        } finally {
            setSending(false);
        }
    }

    const canSend =
        connected && draft.trim().length > 0 && !loading && !sending;

    return (
        <Surface as="section" className="space-y-4" variant="elevated">
            <SectionHeader
                action={<StatusBadge tone={connected ? "brand" : "neutral"}>{connected ? "Online" : "Offline"}</StatusBadge>}
                description={connected ? "Ligado em tempo real." : "A aguardar ligação autorizada ao chat."}
                title="Conversa em tempo real"
            />

            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}
            {loading ? (
                <InlineNotice>A ligar e reconciliar histórico...</InlineNotice>
            ) : null}

            <div
                aria-live="polite"
                className="grid min-h-64 max-h-[520px] gap-3 overflow-y-auto rounded-2xl border border-studyflow-border/10 bg-studyflow-page/25 p-3"
            >
                {!loading && messages.length === 0 ? (
                    <EmptyState description="A primeira mensagem ficará disponível para os participantes autorizados." icon="message" title="Ainda não há mensagens nesta disciplina" />
                ) : null}
                {messages.map((message) => (
                    <article
                        className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3 text-sm"
                        key={message._id}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong>
                                {message.tombstoned
                                    ? "Conta removida"
                                    : message.authorRole === "TEACHER"
                                      ? "Professor"
                                      : "Aluno"}
                            </strong>
                            {message.createdAt ? (
                                <time className="text-xs text-studyflow-text">
                                    {new Date(message.createdAt).toLocaleString("pt-PT")}
                                </time>
                            ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-studyflow-text">
                            {message.tombstoned ? "Conteúdo removido." : message.text}
                        </p>
                    </article>
                ))}
            </div>

            <form className="sticky bottom-3 space-y-3 rounded-2xl border border-studyflow-border/10 bg-studyflow-card/95 p-3 shadow-2xl backdrop-blur-xl" onSubmit={(event) => void handleSubmit(event)}>
                <FormField id="subject-chat-message" label="Mensagem">
                    <textarea
                        maxLength={MAX_MESSAGE_LENGTH}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={3}
                        value={draft}
                    />
                </FormField>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-studyflow-text">
                        {draft.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                    <button className="sf-button-primary" disabled={!canSend}>
                        {sending ? "A enviar..." : "Enviar"}
                    </button>
                </div>
            </form>
        </Surface>
    );
}

/**
 * Emite uma mensagem com timeout local sem perder o rascunho no chamador.
 */
function emitMessageWithAck(
    socket: SubjectChatSocket,
    payload: { subjectId: string; text: string; clientMessageId: string },
): Promise<SubjectChatSendAck> {
    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            reject(new Error("O envio não foi confirmado. Tenta novamente."));
        }, SEND_ACK_TIMEOUT_MS);

        socket.emit("subject-chat:send", payload, (ack) => {
            window.clearTimeout(timeoutId);
            resolve(ack);
        });
    });
}

/**
 * Une histórico e eventos em tempo real por id, ordenando apenas quando há data.
 */
export function mergeMessages(
    first: SubjectChatMessage[],
    second: SubjectChatMessage[],
): SubjectChatMessage[] {
    const byId = new Map<string, SubjectChatMessage>();
    for (const message of [...first, ...second]) byId.set(message._id, message);
    return [...byId.values()].sort((left, right) => {
        if (!left.createdAt || !right.createdAt) return 0;
        return (
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()
        );
    });
}
