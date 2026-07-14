/** Núcleo visual e comportamental comum aos chats em tempo real do StudyFlow. */
import { FormEvent, useEffect, useRef, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import {
    EmptyState,
    InlineNotice,
    SectionHeader,
    StatusBadge,
} from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";

const MAX_MESSAGE_LENGTH = 4000;
const JOIN_ACK_TIMEOUT_MS = 10_000;
const SEND_ACK_TIMEOUT_MS = 10_000;

/** Forma mínima partilhada pelos contratos públicos dos dois domínios. */
export type RealtimeChatMessage = {
    _id: string;
    authorDisplayName?: string | null;
    authorRole?: "STUDENT" | "TEACHER" | null;
    text: string | null;
    tombstoned?: boolean;
    createdAt?: string;
};

export type RealtimeChatError = { code: string; message: string };
export type RealtimeChatJoinAck =
    | { ok: true }
    | { ok: false; error: RealtimeChatError };
export type RealtimeChatSendAck<Message extends RealtimeChatMessage> =
    | { ok: true; message: Message }
    | { ok: false; error: RealtimeChatError };

/** Adapter de transporte que mantém Socket.IO fora do componente visual comum. */
export type RealtimeChatTransport<Message extends RealtimeChatMessage> = {
    connect(): void;
    disconnect(): void;
    clearHandlers(): void;
    join(acknowledge: (ack: RealtimeChatJoinAck) => void): void;
    send(
        payload: { text: string; clientMessageId: string },
        acknowledge: (ack: RealtimeChatSendAck<Message>) => void,
    ): void;
    onConnect(handler: () => void): void;
    onDisconnect(handler: () => void): void;
    onConnectError(handler: () => void): void;
    onError(handler: (error: RealtimeChatError) => void): void;
    onMessage(handler: (message: Message) => void): void;
};

type RealtimeChatPanelProps<Message extends RealtimeChatMessage> = {
    contextKey: string;
    createTransport: () => RealtimeChatTransport<Message>;
    listMessages: () => Promise<Message[]>;
    messageBelongsToContext: (message: Message) => boolean;
    markRead?: () => Promise<void>;
    readOnly?: boolean;
    archivedNotice?: string;
    emptyTitle: string;
};

/**
 * Controla histórico, reconciliação, ligação, retry idempotente e acessibilidade.
 * As regras de autorização e persistência permanecem nos adapters e backend.
 */
export function RealtimeChatPanel<Message extends RealtimeChatMessage>({
    contextKey,
    createTransport,
    listMessages,
    messageBelongsToContext,
    markRead,
    readOnly = false,
    archivedNotice = "Este chat está disponível apenas para consulta.",
    emptyTitle,
}: RealtimeChatPanelProps<Message>) {
    const transportRef = useRef<RealtimeChatTransport<Message> | null>(null);
    const pendingSendRef = useRef<{ text: string; clientMessageId: string } | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        let joinGeneration = 0;
        let joinTimeoutId: number | undefined;
        const transport = createTransport();
        setLoading(true);
        setConnected(false);
        setError(null);
        setMessages([]);

        /** Reconcilição REST preserva eventos que possam chegar durante o fetch. */
        async function reconcileHistory(): Promise<void> {
            try {
                const history = await listMessages();
                if (!active) return;
                setMessages((current) => mergeMessages(history, current));
                if (markRead) void markRead().catch(() => undefined);
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

        void reconcileHistory();
        if (readOnly) {
            return () => {
                active = false;
                transport.clearHandlers();
                transport.disconnect();
            };
        }
        transportRef.current = transport;
        transport.onConnect(() => {
            if (!active) return;
            setConnected(false);
            const generation = ++joinGeneration;
            window.clearTimeout(joinTimeoutId);
            joinTimeoutId = window.setTimeout(() => {
                if (!active || generation !== joinGeneration) return;
                setLoading(false);
                setError("A entrada no chat não foi confirmada. Tenta novamente.");
            }, JOIN_ACK_TIMEOUT_MS);
            transport.join((ack) => {
                window.clearTimeout(joinTimeoutId);
                if (!active || generation !== joinGeneration) return;
                if (!ack.ok) {
                    setError(ack.error.message);
                    setLoading(false);
                    return;
                }
                setConnected(true);
                setError(null);
            });
        });
        transport.onDisconnect(() => {
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            if (active) setConnected(false);
        });
        transport.onConnectError(() => {
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            if (!active) return;
            setConnected(false);
            setLoading(false);
            setError("Não foi possível ligar ao chat em tempo real.");
        });
        transport.onError((nextError) => {
            if (active) setError(nextError.message);
        });
        transport.onMessage((message) => {
            if (!active || !messageBelongsToContext(message)) return;
            setMessages((current) => mergeMessages(current, [message]));
            if (markRead) void markRead().catch(() => undefined);
        });
        transport.connect();

        return () => {
            active = false;
            joinGeneration += 1;
            window.clearTimeout(joinTimeoutId);
            transport.clearHandlers();
            transport.disconnect();
            if (transportRef.current === transport) transportRef.current = null;
        };
        // O contextKey é a fronteira explícita que força uma nova ligação.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextKey, readOnly]);

    /** Mantém texto e UUID até existir ack de persistência. */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const cleanDraft = draft.trim();
        if (!cleanDraft || sending) return;
        const transport = transportRef.current;
        if (!transport || !connected) {
            setError("O chat em tempo real não está ligado.");
            return;
        }
        setSending(true);
        setError(null);
        try {
            const pending =
                pendingSendRef.current?.text === cleanDraft
                    ? pendingSendRef.current
                    : { text: cleanDraft, clientMessageId: crypto.randomUUID() };
            pendingSendRef.current = pending;
            const ack = await sendWithTimeout(transport, pending);
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

    const canSend = connected && draft.trim().length > 0 && !loading && !sending;
    return (
        <Surface as="section" className="space-y-4" variant="elevated">
            <SectionHeader
                action={<StatusBadge tone={connected ? "brand" : "neutral"}>{readOnly ? "Consulta" : connected ? "Online" : "Offline"}</StatusBadge>}
                description={readOnly ? "Histórico disponível apenas para consulta." : connected ? "Ligado em tempo real." : "A aguardar ligação autorizada ao chat."}
                title="Conversa em tempo real"
            />
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {loading ? <InlineNotice>A carregar histórico...</InlineNotice> : null}
            <div
                aria-live="polite"
                className="grid min-h-64 max-h-[520px] gap-3 overflow-y-auto rounded-2xl border border-studyflow-border/10 bg-studyflow-page/25 p-3"
            >
                {!loading && messages.length === 0 ? (
                    <EmptyState
                        description="A primeira mensagem ficará disponível para os participantes autorizados."
                        icon="message"
                        title={emptyTitle}
                    />
                ) : null}
                {messages.map((message) => (
                    <article className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3 text-sm" key={message._id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong>{authorLabel(message)}</strong>
                            {message.createdAt ? <time className="text-xs text-studyflow-text">{new Date(message.createdAt).toLocaleString("pt-PT")}</time> : null}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-studyflow-text">
                            {message.tombstoned ? "Conteúdo removido." : message.text}
                        </p>
                    </article>
                ))}
            </div>
            {!readOnly ? (
                <form className="sticky bottom-3 space-y-3 rounded-2xl border border-studyflow-border/10 bg-studyflow-card/95 p-3 shadow-2xl backdrop-blur-xl" onSubmit={(event) => void handleSubmit(event)}>
                    <FormField id={`realtime-chat-message-${contextKey}`} label="Mensagem">
                        <textarea maxLength={MAX_MESSAGE_LENGTH} onChange={(event) => setDraft(event.target.value)} rows={3} value={draft} />
                    </FormField>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-studyflow-text">{draft.length}/{MAX_MESSAGE_LENGTH}</span>
                        <button className="sf-button-primary" disabled={!canSend}>{sending ? "A enviar..." : "Enviar"}</button>
                    </div>
                </form>
            ) : <InlineNotice>{archivedNotice}</InlineNotice>}
        </Surface>
    );
}

/** Une histórico e eventos por id e ordena cronologicamente. */
export function mergeMessages<Message extends RealtimeChatMessage>(
    first: Message[],
    second: Message[],
): Message[] {
    const byId = new Map<string, Message>();
    for (const message of [...first, ...second]) byId.set(message._id, message);
    return [...byId.values()].sort((left, right) => {
        if (!left.createdAt || !right.createdAt) return 0;
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });
}

/** Aguarda o ack sem perder o payload idempotente usado num eventual retry. */
function sendWithTimeout<Message extends RealtimeChatMessage>(
    transport: RealtimeChatTransport<Message>,
    payload: { text: string; clientMessageId: string },
): Promise<RealtimeChatSendAck<Message>> {
    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(
            () => reject(new Error("O envio não foi confirmado. Tenta novamente.")),
            SEND_ACK_TIMEOUT_MS,
        );
        transport.send(payload, (ack) => {
            window.clearTimeout(timeoutId);
            resolve(ack);
        });
    });
}

/** Escolhe identidade pública sem recorrer a email. */
function authorLabel(message: RealtimeChatMessage): string {
    if (message.tombstoned) return "Conta removida";
    if (message.authorDisplayName) return message.authorDisplayName;
    return message.authorRole === "TEACHER" ? "Professor" : "Aluno";
}
