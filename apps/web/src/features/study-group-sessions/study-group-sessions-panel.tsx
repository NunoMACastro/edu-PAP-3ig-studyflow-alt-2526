/**
 * Implementa a funcionalidade frontend de sessões de estudo em grupo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
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
};

/**
 * Painel de sessões coletivas.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e lista de sessões.
 */
export function StudyGroupSessionsPanel({ initialGroupId }: StudyGroupSessionsPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [title, setTitle] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(45);
    const [goal, setGoal] = useState("");
    const [sessions, setSessions] = useState<StudyGroupSession[]>([]);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @param targetGroupId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(targetGroupId = groupId): Promise<void> {
        if (!targetGroupId) return;
        setSessions(await listStudyGroupSessions(targetGroupId));
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
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao agendar.");
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Sessões coletivas</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Grupo
                    <input value={groupId} onBlur={() => void refresh()} onChange={(event) => setGroupId(event.target.value)} />
                </label>
                <label className="block">
                    Título
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block">
                    Início
                    <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </label>
                <label className="block">
                    Minutos
                    <input type="number" min={10} max={480} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
                </label>
                <label className="block">
                    Objetivo
                    <textarea rows={2} value={goal} onChange={(event) => setGoal(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={!groupId || title.trim().length < 3 || !startsAt}>
                    Agendar
                </button>
            </form>
            <div className="grid gap-2">
                {sessions.map((session) => (
                    <article className="rounded-md border border-slate-200 p-3 text-sm" key={session._id}>
                        <strong>{session.title}</strong>
                        <p className="text-slate-600">{new Date(session.startsAt).toLocaleString("pt-PT")}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
