/**
 * Painel docente de alertas de acompanhamento.
 */
import { useEffect, useState } from "react";
import {
    createContextNotification,
    createFollowUpRule,
    FollowUpRule,
    listContextNotifications,
    listFollowUpRules,
    runFollowUpRule,
} from "./mf4-client.js";

/**
 * UI docente para regras e notificações.
 *
 * @returns Painel de acompanhamento.
 */
export function FollowUpAlertsPanel() {
    const [classId, setClassId] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [rules, setRules] = useState<FollowUpRule[]>([]);
    const [notifications, setNotifications] = useState<unknown[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        const [nextRules, nextNotifications] = await Promise.all([
            listFollowUpRules(),
            listContextNotifications(),
        ]);
        setRules(nextRules);
        setNotifications(nextNotifications);
    }

    useEffect(() => {
        refresh().catch((caught) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar acompanhamento."),
        );
    }, []);

    async function createRule(): Promise<void> {
        setError(null);
        await createFollowUpRule({
            classId,
            inactiveDays: 7,
            title: title || "Acompanhamento de estudo",
            message: message || "Há alunos sem atividade recente.",
        });
        await refresh();
    }

    async function notifyTask(): Promise<void> {
        setError(null);
        await createContextNotification({
            contextType: "CLASS",
            contextId: classId,
            type: "TASK",
            title: title || "Nova tarefa",
            body: message || "Consulta a nova tarefa da turma.",
        });
        await refresh();
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Acompanhamento</h1>
                <p className="text-sm text-slate-600">Alertas docentes e notificações internas de turma.</p>
            </header>
            {error ? <p className="sf-error">{error}</p> : null}
            <section className="sf-panel grid gap-3">
                <input value={classId} onChange={(event) => setClassId(event.target.value)} placeholder="ID da turma" />
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensagem" />
                <div className="flex flex-wrap gap-2">
                    <button className="sf-button-primary" disabled={!classId} onClick={() => void createRule()}>
                        Criar regra
                    </button>
                    <button className="sf-button-secondary" disabled={!classId} onClick={() => void notifyTask()}>
                        Notificar turma
                    </button>
                </div>
            </section>
            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Regras</h2>
                {rules.map((rule) => (
                    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3" key={rule.id}>
                        <span className="text-sm">{rule.title} · {rule.inactiveDays} dias</span>
                        <button className="sf-button-secondary" onClick={() => void runFollowUpRule(rule.id)}>
                            Executar
                        </button>
                    </article>
                ))}
            </section>
            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Notificações recentes</h2>
                <pre className="max-h-72 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-50">
                    {JSON.stringify(notifications, null, 2)}
                </pre>
            </section>
        </section>
    );
}
