/**
 * Implementa a funcionalidade frontend de mensagens de grupos de estudo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    createStudyGroupMessage,
    listStudyGroupMessages,
    StudyGroupMessage,
} from "./create-study-group-message.js";

/**
 * Props do componente React de mensagens do grupo de estudo; mantêm explícitas as dependências vindas da página.
 */
type StudyGroupMessagesPanelProps = {
    initialGroupId?: string | null;
};

/**
 * Painel de mensagens e notas coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e histórico.
 */
export function StudyGroupMessagesPanel({ initialGroupId }: StudyGroupMessagesPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [kind, setKind] = useState<"MESSAGE" | "NOTE">("MESSAGE");
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @param targetGroupId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) return;
        setMessages(await listStudyGroupMessages(targetGroupId));
    }

    useEffect(() => {
        const nextGroupId = initialGroupId ?? "";
        setGroupId(nextGroupId);
        if (nextGroupId) void refresh(nextGroupId);
    }, [initialGroupId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createStudyGroupMessage(groupId, { kind, text });
            setText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Mensagens e notas</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Grupo
                    <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                </label>
                <label className="block">
                    Tipo
                    <select value={kind} onChange={(event) => setKind(event.target.value as "MESSAGE" | "NOTE")}>
                        <option value="MESSAGE">Mensagem</option>
                        <option value="NOTE">Nota</option>
                    </select>
                </label>
                <label className="block">
                    Conteúdo
                    <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || text.trim().length === 0}>
                    Guardar
                </button>
            </form>
            {messages.length === 0 ? <p className="text-sm text-studyflow-text">Sem histórico.</p> : null}
            <div className="grid gap-2">
                {messages.map((message) => (
                    <article className="rounded-md border border-studyflow-border p-3 text-sm" key={message._id}>
                        <strong>{message.kind === "NOTE" ? "Nota" : "Mensagem"}</strong>
                        <p className="whitespace-pre-line text-studyflow-text">{message.text}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
