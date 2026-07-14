/**
 * Implementa a funcionalidade frontend de sessões de estudo em grupo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    createStudyGroupSession,
    listStudyGroupSessions,
    StudyGroupSession,
} from "./create-study-group-session.js";

/**
 * Props do componente React de sessões de estudo em grupo; mantêm explícitas as dependências vindas da página.
 */
type StudyGroupSessionsPanelProps = {
    initialGroupId?: string | null;
    contextLocked?: boolean;
};

/**
 * Painel de sessões coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e lista de sessões.
 */
export function StudyGroupSessionsPanel({ initialGroupId, contextLocked = false }: StudyGroupSessionsPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [title, setTitle] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(45);
    const [goal, setGoal] = useState("");
    const [sessions, setSessions] = useState<StudyGroupSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @param targetGroupId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) {
            setSessions([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            setSessions(await listStudyGroupSessions(targetGroupId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar sessões.");
        } finally {
            setLoading(false);
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
        setError(null);
        setSaving(true);
        try {
            await createStudyGroupSession(groupId, {
                title,
                startsAt: new Date(startsAt).toISOString(),
                durationMinutes,
                goal,
            });
            setTitle("");
            setGoal("");
            await refresh();
            setCreateOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao agendar.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Surface as="section" className="space-y-4">
            <SectionHeader action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => { setError(null); setCreateOpen(true); }} type="button">Agendar sessão</button>} description="Agenda e consulta momentos de estudo coletivo do grupo selecionado." title="Sessões coletivas" />
            {error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!groupId ? <InlineNotice>Seleciona primeiro um grupo de estudo.</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar sessões...</InlineNotice> : null}
            {!loading && groupId && !error && sessions.length === 0 ? <EmptyState icon="calendar" title="Ainda não há sessões agendadas" /> : null}
            <div className="grid gap-2">
                {sessions.map((session) => (
                    <article className="sf-surface-subtle text-sm" key={session._id}>
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-studyflow-text/70">{new Date(session.startsAt).toLocaleString("pt-PT")}</p>
                    </article>
                ))}
            </div>
            <SidePanel closeDisabled={saving} description="Define o grupo, horário, duração e objetivo da sessão." onClose={() => setCreateOpen(false)} open={createOpen} title="Agendar sessão">
                <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    {error ? <p className="sf-error" role="alert">{error}</p> : null}
                    {!contextLocked ? <FormField id="group-session-group" label="Grupo">
                        <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                    </FormField> : null}
                    <FormField id="group-session-title" label="Título">
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </FormField>
                    <FormField id="group-session-start" label="Início">
                        <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                    </FormField>
                    <FormField id="group-session-duration" label="Minutos">
                        <input type="number" min={10} max={480} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
                    </FormField>
                    <FormField id="group-session-goal" label="Objetivo">
                        <textarea rows={2} value={goal} onChange={(event) => setGoal(event.target.value)} />
                    </FormField>
                    <button className="sf-button-primary" disabled={saving || !groupId || title.trim().length < 3 || !startsAt}>
                        {saving ? "A agendar..." : "Agendar"}
                    </button>
                </form>
            </SidePanel>
        </Surface>
    );
}
