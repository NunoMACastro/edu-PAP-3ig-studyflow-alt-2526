/** Núcleo comum para agendar sessões colaborativas em grupos ou salas. */
import { type FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { EmptyState, InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { Surface } from "../../components/ui/Surface.js";

export type StudySessionView = {
    _id: string;
    title: string;
    startsAt: string;
    durationMinutes: number;
    goal?: string;
};

type SessionInput = {
    title: string;
    startsAt: string;
    durationMinutes: number;
    goal?: string;
};

type StudySessionsPanelProps = {
    initialContextId?: string | null;
    contextLocked?: boolean;
    contextLabel: "grupo" | "sala";
    listSessions: (contextId: string) => Promise<StudySessionView[]>;
    createSession: (contextId: string, input: SessionInput) => Promise<StudySessionView>;
};

export function StudySessionsPanel({
    initialContextId,
    contextLocked = false,
    contextLabel,
    listSessions,
    createSession,
}: StudySessionsPanelProps) {
    const [contextId, setContextId] = useState(initialContextId ?? "");
    const [title, setTitle] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(45);
    const [goal, setGoal] = useState("");
    const [sessions, setSessions] = useState<StudySessionView[]>([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh(targetContextId = contextId): Promise<void> {
        if (!targetContextId) {
            setSessions([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            setSessions(await listSessions(targetContextId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao carregar sessões.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const nextContextId = initialContextId ?? "";
        setContextId(nextContextId);
        if (nextContextId) void refresh(nextContextId);
        // As funções são adapters estáveis escolhidos pelo wrapper de domínio.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContextId]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSaving(true);
        try {
            await createSession(contextId, {
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
            <SectionHeader
                action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => { setError(null); setCreateOpen(true); }} type="button">Agendar sessão</button>}
                description={`Agenda e consulta momentos de estudo coletivo desta ${contextLabel}.`}
                title="Sessões coletivas"
            />
            {error && !createOpen ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!contextId ? <InlineNotice>Seleciona primeiro um {contextLabel} de estudo.</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar sessões...</InlineNotice> : null}
            {!loading && contextId && !error && sessions.length === 0 ? <EmptyState icon="calendar" title="Ainda não há sessões agendadas" /> : null}
            <div className="grid gap-2">
                {sessions.map((session) => (
                    <article className="sf-surface-subtle text-sm" key={session._id}>
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-studyflow-text/70">{new Date(session.startsAt).toLocaleString("pt-PT")}</p>
                        {session.goal ? <p className="mt-1 text-studyflow-text/70">{session.goal}</p> : null}
                    </article>
                ))}
            </div>
            <SidePanel closeDisabled={saving} description={`Define o horário, a duração e o objetivo da sessão desta ${contextLabel}.`} onClose={() => setCreateOpen(false)} open={createOpen} title="Agendar sessão">
                <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    {error ? <p className="sf-error" role="alert">{error}</p> : null}
                    {!contextLocked ? <FormField id={`${contextLabel}-session-context`} label={contextLabel === "grupo" ? "Grupo" : "Sala"}>
                        <input value={contextId} onBlur={() => void refresh()} onChange={(event) => setContextId(event.target.value)} />
                    </FormField> : null}
                    <FormField id={`${contextLabel}-session-title`} label="Título">
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </FormField>
                    <FormField id={`${contextLabel}-session-start`} label="Início">
                        <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                    </FormField>
                    <FormField id={`${contextLabel}-session-duration`} label="Minutos">
                        <input type="number" min={10} max={480} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
                    </FormField>
                    <FormField id={`${contextLabel}-session-goal`} label="Objetivo">
                        <textarea rows={2} value={goal} onChange={(event) => setGoal(event.target.value)} />
                    </FormField>
                    <button className="sf-button-primary" disabled={saving || !contextId || title.trim().length < 3 || !startsAt}>
                        {saving ? "A agendar..." : "Agendar"}
                    </button>
                </form>
            </SidePanel>
        </Surface>
    );
}
