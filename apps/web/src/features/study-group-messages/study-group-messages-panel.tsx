/**
 * Implementa a funcionalidade frontend de mensagens de grupos de estudo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
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
    contextLocked?: boolean;
};

/**
 * Painel de mensagens e notas coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e histórico.
 */
export function StudyGroupMessagesPanel({ initialGroupId, contextLocked = false }: StudyGroupMessagesPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [kind, setKind] = useState<"MESSAGE" | "NOTE">("MESSAGE");
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<StudyGroupMessage[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @param targetGroupId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) {
            setMessages([]);
            return;
        }
        setListLoading(true);
        setError(null);
        try {
            setMessages(await listStudyGroupMessages(targetGroupId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar histórico.");
        } finally {
            setListLoading(false);
        }
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
        <Surface as="section" className="space-y-4">
            <SectionHeader description="Partilha mensagens e notas no contexto do grupo selecionado." title="Mensagens e notas" />
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                {!contextLocked ? <FormField id="group-message-group" label="Grupo">
                    <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                </FormField> : null}
                <FormField id="group-message-kind" label="Tipo">
                    <select value={kind} onChange={(event) => setKind(event.target.value as "MESSAGE" | "NOTE")}>
                        <option value="MESSAGE">Mensagem</option>
                        <option value="NOTE">Nota</option>
                    </select>
                </FormField>
                <FormField id="group-message-content" label="Conteúdo">
                    <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} />
                </FormField>
                <button className="sf-button-primary" disabled={loading || text.trim().length === 0}>
                    Guardar
                </button>
            </form>
            {listLoading ? <InlineNotice>A carregar histórico...</InlineNotice> : null}
            {!listLoading && messages.length === 0 ? <EmptyState icon="message" title="Sem histórico" /> : null}
            <div className="grid gap-2">
                {messages.map((message) => (
                    <article className="sf-surface-subtle text-sm" key={message._id}>
                        <h3 className="font-semibold">{message.kind === "NOTE" ? "Nota" : "Mensagem"}</h3>
                        <p className="whitespace-pre-line text-studyflow-text">
                            {message.tombstoned ? "Conteúdo removido." : message.text}
                        </p>
                    </article>
                ))}
            </div>
        </Surface>
    );
}
