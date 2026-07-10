/**
 * Painel docente de alertas de acompanhamento.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    listTeacherClasses,
    SchoolClass,
} from "../../lib/apiClient.js";
import {
    createContextNotification,
    createFollowUpRule,
    getFollowUpAlertsSummary,
    ContextNotification,
    FollowUpAlertsSummary,
    FollowUpSummaryRule,
    listContextNotifications,
    runFollowUpRule,
} from "./mf4-client.js";

/**
 * UI docente para regras e notificações.
 *
 * @returns Painel de acompanhamento.
 */
export function FollowUpAlertsPanel() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [inactiveDays, setInactiveDays] = useState(7);
    const [title, setTitle] = useState("Acompanhamento de estudo");
    const [message, setMessage] = useState("Há alunos sem atividade recente.");
    const [summary, setSummary] = useState<FollowUpAlertsSummary>({ rules: [] });
    const [notifications, setNotifications] = useState<ContextNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const selectedClass = classes.find((schoolClass) => schoolClass._id === selectedClassId);
    const rulesByClass = useMemo(() => groupRulesByClass(summary.rules), [summary.rules]);

    /**
     * Recarrega a ação de interface ligada a alertas de acompanhamento, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        const [nextClasses, nextSummary, nextNotifications] = await Promise.all([
            listTeacherClasses(),
            getFollowUpAlertsSummary(),
            listContextNotifications(),
        ]);
        setClasses(nextClasses);
        setSummary(nextSummary);
        setNotifications(nextNotifications);
        setSelectedClassId((current) => current || nextClasses[0]?._id || "");
    }

    useEffect(() => {
        let active = true;

        async function load(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                await refresh();
            } catch (caught) {
                if (active) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar acompanhamento.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void load();
        return () => {
            active = false;
        };
    }, []);

    /**
     * Cria uma regra para a turma escolhida.
     *
     * @param event Submissão do formulário.
     * @returns Não devolve payload; termina quando a UI fica sincronizada.
     */
    async function createRule(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setError(null);
        setStatus(null);
        if (!selectedClassId) return;
        if (!Number.isInteger(inactiveDays) || inactiveDays < 1 || inactiveDays > 90) {
            setError("Define um número de dias entre 1 e 90.");
            return;
        }

        setSaving(true);
        try {
            await createFollowUpRule({
                classId: selectedClassId,
                inactiveDays,
                title: title.trim() || "Acompanhamento de estudo",
                message: message.trim() || "Há alunos sem atividade recente.",
            });
            await refresh();
            setStatus("Regra de acompanhamento criada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar regra.");
        } finally {
            setSaving(false);
        }
    }

    /**
     * Envia uma notificação manual para a turma selecionada.
     *
     * @returns Não devolve payload; termina quando a UI fica sincronizada.
     */
    async function notifyTask(): Promise<void> {
        setError(null);
        setStatus(null);
        if (!selectedClassId) return;

        setSaving(true);
        try {
            await createContextNotification({
                contextType: "CLASS",
                contextId: selectedClassId,
                type: "TASK",
                title: title.trim() || "Nova tarefa",
                body: message.trim() || "Consulta a nova tarefa da turma.",
            });
            await refresh();
            setStatus("Notificação enviada para a turma.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao notificar turma.");
        } finally {
            setSaving(false);
        }
    }

    /**
     * Executa uma regra de acompanhamento com feedback visual claro.
     *
     * @param rule Regra escolhida.
     * @returns Não devolve payload; termina quando a UI fica sincronizada.
     */
    async function runRule(rule: FollowUpSummaryRule): Promise<void> {
        setError(null);
        setStatus(null);
        setRunningRuleId(rule.id);
        try {
            const result = await runFollowUpRule(rule.id);
            await refresh();
            setStatus(
                result.notification
                    ? `Regra executada: ${formatStudentCount(result.inactiveStudentIds.length)} notificados.`
                    : "Regra executada: não foram detetados alunos inativos.",
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao executar regra.");
        } finally {
            setRunningRuleId(null);
        }
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-studyflow-text">Acompanhamento</h1>
                <p className="text-sm text-studyflow-text">
                    Regras de inatividade, preview de alunos a rever e notificações internas.
                </p>
            </header>

            {loading ? <p className="sf-panel text-sm text-studyflow-text">A carregar acompanhamento...</p> : null}
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {status ? <p className="sf-panel text-sm text-studyflow-text" role="status">{status}</p> : null}

            <form className="sf-panel grid gap-4" onSubmit={(event) => void createRule(event)}>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
                    <div className="grid gap-2 text-sm text-studyflow-text">
                        <label className="font-semibold" htmlFor="followUpClassId">
                            Turma
                        </label>
                        <select
                            className="rounded-md border border-studyflow-border bg-studyflow-page px-3 py-2 text-studyflow-text"
                            disabled={classes.length === 0}
                            id="followUpClassId"
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            value={selectedClassId}
                        >
                            {classes.map((schoolClass) => (
                                <option key={schoolClass._id} value={schoolClass._id}>
                                    {schoolClass.name} · {schoolClass.schoolYear}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2 text-sm text-studyflow-text">
                        <label className="font-semibold" htmlFor="followUpInactiveDays">
                            Dias sem atividade
                        </label>
                        <input
                            className="rounded-md border border-studyflow-border bg-studyflow-page px-3 py-2 text-studyflow-text"
                            id="followUpInactiveDays"
                            max={90}
                            min={1}
                            onChange={(event) => setInactiveDays(Number(event.target.value))}
                            type="number"
                            value={inactiveDays}
                        />
                    </div>
                </div>

                <label className="grid gap-2 text-sm text-studyflow-text">
                    <span className="font-semibold">Título</span>
                    <input
                        className="rounded-md border border-studyflow-border bg-studyflow-page px-3 py-2 text-studyflow-text"
                        maxLength={160}
                        onChange={(event) => setTitle(event.target.value)}
                        value={title}
                    />
                </label>

                <label className="grid gap-2 text-sm text-studyflow-text">
                    <span className="font-semibold">Mensagem</span>
                    <textarea
                        className="min-h-28 rounded-md border border-studyflow-border bg-studyflow-page px-3 py-2 text-studyflow-text"
                        maxLength={1000}
                        onChange={(event) => setMessage(event.target.value)}
                        value={message}
                    />
                </label>

                <div className="flex flex-wrap gap-2">
                    <button
                        className="sf-button-primary"
                        disabled={!selectedClass || saving}
                        type="submit"
                    >
                        Criar regra
                    </button>
                    <button
                        className="sf-button-secondary"
                        disabled={!selectedClass || saving}
                        onClick={() => void notifyTask()}
                        type="button"
                    >
                        Notificar turma
                    </button>
                </div>
                {classes.length === 0 ? (
                    <p className="text-sm text-studyflow-text">
                        Cria uma turma antes de configurares regras de acompanhamento.
                    </p>
                ) : null}
            </form>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Regras por turma</h2>
                {classes.length === 0 ? (
                    <p className="sf-panel text-sm text-studyflow-text">Ainda não há turmas para acompanhar.</p>
                ) : (
                    classes.map((schoolClass) => (
                        <ClassRulesPanel
                            key={schoolClass._id}
                            rules={rulesByClass.get(schoolClass._id) ?? []}
                            runningRuleId={runningRuleId}
                            schoolClass={schoolClass}
                            onRunRule={runRule}
                        />
                    ))
                )}
            </section>

            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Notificações recentes</h2>
                {notifications.length === 0 ? (
                    <p className="text-sm text-studyflow-text">Ainda não existem notificações recentes.</p>
                ) : (
                    <div className="space-y-2">
                        {notifications.slice(0, 6).map((notification) => (
                            <article
                                className="rounded-md border border-studyflow-border p-3 text-sm text-studyflow-text"
                                key={notification.id}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    <span>{formatStudentCount(notification.recipientCount)}</span>
                                </div>
                                <p className="mt-1">{notification.body}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </section>
    );
}

/**
 * Mostra as regras de uma turma e o respetivo preview de alunos inativos.
 *
 * @param props Dados da turma, regras e callback de execução.
 * @returns Painel de regras da turma.
 */
function ClassRulesPanel({
    schoolClass,
    rules,
    runningRuleId,
    onRunRule,
}: {
    schoolClass: SchoolClass;
    rules: FollowUpSummaryRule[];
    runningRuleId: string | null;
    onRunRule: (rule: FollowUpSummaryRule) => Promise<void>;
}) {
    return (
        <article className="sf-panel space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold">{schoolClass.name}</h3>
                    <p className="text-sm text-studyflow-text">
                        {schoolClass.students?.length ?? schoolClass.studentIds.length} alunos · {rules.length} regras
                    </p>
                </div>
            </div>

            {rules.length === 0 ? (
                <p className="text-sm text-studyflow-text">Sem regras configuradas para esta turma.</p>
            ) : (
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <article
                            className="rounded-md border border-studyflow-border p-3"
                            key={rule.id}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold">{rule.title}</h4>
                                    <p className="text-sm text-studyflow-text">
                                        {rule.inactiveDays} dias sem atividade · {formatStudentCount(rule.inactiveStudentsCount)} a rever
                                    </p>
                                </div>
                                <button
                                    className="sf-button-secondary"
                                    disabled={runningRuleId === rule.id}
                                    onClick={() => void onRunRule(rule)}
                                    type="button"
                                >
                                    {runningRuleId === rule.id ? "A executar..." : "Executar regra"}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-studyflow-text">{rule.message}</p>
                            {rule.inactiveStudents.length > 0 ? (
                                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {rule.inactiveStudents.map((student) => (
                                        <li
                                            className="rounded bg-studyflow-page px-3 py-2 text-sm text-studyflow-text"
                                            key={`${rule.id}-${student.studentId}`}
                                        >
                                            {student.displayName}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-3 text-sm text-studyflow-text">
                                    Sem alunos inativos neste preview.
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </article>
    );
}

/**
 * Agrupa regras por turma para apresentação em painéis claros.
 *
 * @param rules Regras devolvidas pelo summary.
 * @returns Índice por turma.
 */
function groupRulesByClass(rules: FollowUpSummaryRule[]): Map<string, FollowUpSummaryRule[]> {
    const grouped = new Map<string, FollowUpSummaryRule[]>();
    for (const rule of rules) {
        grouped.set(rule.classId, [...(grouped.get(rule.classId) ?? []), rule]);
    }
    return grouped;
}

/**
 * Formata contagens de alunos com plural correto.
 *
 * @param count Número de alunos.
 * @returns Texto curto para UI.
 */
function formatStudentCount(count: number): string {
    return count === 1 ? "1 aluno" : `${count} alunos`;
}
