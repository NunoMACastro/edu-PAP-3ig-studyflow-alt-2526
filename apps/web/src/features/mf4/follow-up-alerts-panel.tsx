/**
 * Centro docente de acompanhamento baseado apenas em dados já existentes.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    EmptyState,
    InlineNotice,
    SectionHeader,
    StatusBadge,
    Toolbar,
} from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { formatDatePt } from "../../lib/format-date-pt.js";
import { listTeacherClasses, SchoolClass } from "../../lib/apiClient.js";
import {
    ContextNotification,
    createContextNotification,
    createFollowUpRule,
    FollowUpAlertsSummary,
    FollowUpOfficialTest,
    FollowUpStudentOverview,
    FollowUpSummaryRule,
    getFollowUpAlertsSummary,
    getFollowUpStudentOverview,
    listContextNotifications,
    notifyFollowUpStudent,
    runFollowUpRule,
} from "./mf4-client.js";

const DEFAULT_FOLLOW_UP_TITLE = "Acompanhamento de estudo";
const DEFAULT_FOLLOW_UP_MESSAGE = "Há alunos sem atividade recente.";

type StudentFilter = "ALL" | "INACTIVE";

type FollowUpStudentRow = {
    id: string;
    displayName: string;
    email: string;
    inactiveRules: FollowUpSummaryRule[];
};

/**
 * UI docente para alunos, regras e notificações de acompanhamento.
 *
 * @returns Centro de acompanhamento sem métricas ou classificações novas.
 */
export function FollowUpAlertsPanel() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState(getRequestedClassId);
    const [searchTerm, setSearchTerm] = useState("");
    const [studentFilter, setStudentFilter] = useState<StudentFilter>("ALL");
    const [inactiveDays, setInactiveDays] = useState(7);
    const [title, setTitle] = useState(DEFAULT_FOLLOW_UP_TITLE);
    const [message, setMessage] = useState(DEFAULT_FOLLOW_UP_MESSAGE);
    const [notificationDestination, setNotificationDestination] = useState<"TODAY" | "CLASS_SUBJECTS" | "CLASS_POSTS" | "CLASS_PROJECTS">("TODAY");
    const [summary, setSummary] = useState<FollowUpAlertsSummary>({ rules: [] });
    const [notifications, setNotifications] = useState<ContextNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<FollowUpStudentRow | null>(null);
    const [studentTests, setStudentTests] = useState<FollowUpOfficialTest[]>([]);
    const [studentOverview, setStudentOverview] =
        useState<FollowUpStudentOverview | null>(null);
    const [studentTestsLoading, setStudentTestsLoading] = useState(false);
    const [studentSaving, setStudentSaving] = useState(false);
    const [studentPanelError, setStudentPanelError] = useState<string | null>(null);
    const [studentPanelStatus, setStudentPanelStatus] = useState<string | null>(null);
    const [studentNotificationTitle, setStudentNotificationTitle] = useState(
        DEFAULT_FOLLOW_UP_TITLE,
    );
    const [studentNotificationMessage, setStudentNotificationMessage] = useState(
        DEFAULT_FOLLOW_UP_MESSAGE,
    );

    const selectedClass = classes.find(
        (schoolClass) => schoolClass._id === selectedClassId,
    );
    const selectedRules = useMemo(
        () => summary.rules.filter((rule) => rule.classId === selectedClassId),
        [selectedClassId, summary.rules],
    );
    const students = useMemo(
        () => buildStudentRows(selectedClass, selectedRules),
        [selectedClass, selectedRules],
    );
    const visibleStudents = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-PT");
        return students.filter((student) => {
            if (studentFilter === "INACTIVE" && student.inactiveRules.length === 0) {
                return false;
            }
            return normalizedSearch.length === 0
                ? true
                : `${student.displayName} ${student.email}`
                    .toLocaleLowerCase("pt-PT")
                    .includes(normalizedSearch);
        });
    }, [searchTerm, studentFilter, students]);

    /** Recarrega os contratos já existentes e mantém a turma selecionada autorizada. */
    async function refresh(): Promise<void> {
        const [nextClasses, nextSummary, nextNotifications] = await Promise.all([
            listTeacherClasses(),
            getFollowUpAlertsSummary(),
            listContextNotifications(),
        ]);
        const activeClasses = nextClasses.filter(
            (schoolClass) => schoolClass.status !== "ARCHIVED",
        );
        const allowedClassIds = new Set(activeClasses.map((schoolClass) => schoolClass._id));
        const allowedStudentIds = new Set(
            activeClasses.flatMap((schoolClass) => schoolClass.studentIds),
        );

        setClasses(activeClasses);
        setSummary(nextSummary);
        setNotifications(nextNotifications);
        setSelectedClassId((current) => {
            const nextClassId = allowedClassIds.has(current)
                ? current
                : activeClasses[0]?._id ?? "";
            syncClassIdInUrl(nextClassId);
            return nextClassId;
        });
        setSelectedStudent((current) =>
            current && allowedStudentIds.has(current.id) ? current : null,
        );
    }

    useEffect(() => {
        let active = true;
        async function load(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                await refresh();
            } catch (caught) {
                if (active) setError(getErrorMessage(caught, "Erro ao carregar acompanhamento."));
            } finally {
                if (active) setLoading(false);
            }
        }
        void load();
        return () => {
            active = false;
        };
    }, []);

    /** Seleciona uma turma autorizada e sincroniza o URL partilhável. */
    function selectClass(classId: string): void {
        setSelectedClassId(classId);
        setSelectedStudent(null);
        setSearchTerm("");
        setStudentFilter("ALL");
        syncClassIdInUrl(classId);
    }

    /** Cria uma regra de inatividade para a turma selecionada. */
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
                title: title.trim() || DEFAULT_FOLLOW_UP_TITLE,
                message: message.trim() || DEFAULT_FOLLOW_UP_MESSAGE,
            });
            await refresh();
            setStatus("Regra de acompanhamento criada.");
        } catch (caught) {
            setError(getErrorMessage(caught, "Erro ao criar regra."));
        } finally {
            setSaving(false);
        }
    }

    /** Envia a notificação TASK existente para toda a turma selecionada. */
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
                destination: notificationDestination,
            });
            await refresh();
            setStatus("Notificação enviada para a turma.");
        } catch (caught) {
            setError(getErrorMessage(caught, "Erro ao notificar turma."));
        } finally {
            setSaving(false);
        }
    }

    /** Executa uma regra e mantém o feedback coerente com os destinatários reais. */
    async function runRule(rule: FollowUpSummaryRule): Promise<void> {
        setError(null);
        setStatus(null);
        setRunningRuleId(rule.id);
        try {
            const result = await runFollowUpRule(rule.id);
            await refresh();
            const count = result.inactiveStudentIds.length;
            setStatus(
                result.notification
                    ? `Regra executada: ${formatStudentCount(count)} ${count === 1 ? "notificado" : "notificados"}.`
                    : "Regra executada: não foram detetados alunos inativos.",
            );
        } catch (caught) {
            setError(getErrorMessage(caught, "Erro ao executar regra."));
        } finally {
            setRunningRuleId(null);
        }
    }

    /** Abre o detalhe e carrega mini-testes apenas para o aluno escolhido. */
    async function openStudentDetail(student: FollowUpStudentRow): Promise<void> {
        setSelectedStudent(student);
        setStudentTests([]);
        setStudentOverview(null);
        setStudentPanelError(null);
        setStudentPanelStatus(null);
        setStudentNotificationTitle(DEFAULT_FOLLOW_UP_TITLE);
        setStudentNotificationMessage(DEFAULT_FOLLOW_UP_MESSAGE);
        setStudentTestsLoading(true);
        try {
            const overview = await getFollowUpStudentOverview(
                selectedClassId,
                student.id,
            );
            setStudentOverview(overview);
            setStudentTests(overview.officialTests.items);
        } catch (caught) {
            const caughtMessage = getErrorMessage(
                caught,
                "Não foi possível carregar os mini-testes do aluno.",
            );
            if (isMissingStudentMessage(caughtMessage)) {
                setSelectedStudent(null);
                setStatus("O aluno já não pertence à turma. Os dados foram atualizados.");
                await refreshAfterMissingStudent();
            } else {
                setStudentPanelError(caughtMessage);
            }
        } finally {
            setStudentTestsLoading(false);
        }
    }

    /** Envia uma notificação FOLLOW_UP apenas ao aluno do painel. */
    async function notifySelectedStudent(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!selectedStudent || !selectedClassId) return;
        setStudentPanelError(null);
        setStudentPanelStatus(null);
        setStudentSaving(true);
        try {
            const notification = await notifyFollowUpStudent(
                selectedClassId,
                selectedStudent.id,
                {
                    title: studentNotificationTitle.trim(),
                    message: studentNotificationMessage.trim(),
                },
            );
            await refresh();
            setStudentPanelStatus(
                (notification.recipientCount ?? 0) > 0
                    ? "Notificação enviada ao aluno."
                    : (notification.suppressedRecipientCount ?? 0) > 0
                      ? "Notificação não entregue devido às preferências do aluno."
                      : "A notificação não teve destinatários elegíveis.",
            );
        } catch (caught) {
            const caughtMessage = getErrorMessage(caught, "Erro ao notificar aluno.");
            if (isMissingStudentMessage(caughtMessage)) {
                setSelectedStudent(null);
                setStatus("O aluno já não pertence à turma. Os dados foram atualizados.");
                await refreshAfterMissingStudent();
            } else {
                setStudentPanelError(caughtMessage);
            }
        } finally {
            setStudentSaving(false);
        }
    }

    /** Atualiza a página depois de o backend indicar uma inscrição removida. */
    async function refreshAfterMissingStudent(): Promise<void> {
        try {
            await refresh();
        } catch (caught) {
            setError(getErrorMessage(caught, "Erro ao atualizar acompanhamento."));
        }
    }

    return (
        <section className="space-y-8">
            <PageHeader
                description="Consulta atividade pedagógica por turma, progresso factual e notificações internas sem classificações ocultas."
                title="Centro de Acompanhamento"
            />

            {loading ? <InlineNotice>A carregar acompanhamento...</InlineNotice> : null}
            {error ? <InlineNotice role="alert" tone="danger">{error}</InlineNotice> : null}
            {status ? <InlineNotice role="status">{status}</InlineNotice> : null}

            {!loading && classes.length === 0 ? (
                <EmptyState
                    action={<a className="sf-button-primary" href="/app/professor/turmas#criar-turma">Criar turma</a>}
                    description="É necessária uma turma antes de acompanhares alunos e configurares regras."
                    icon="graduation"
                    title="Ainda não há turmas para acompanhar"
                />
            ) : null}

            {selectedClass ? (
                <>
                    <Toolbar ariaLabel="Filtros do centro de acompanhamento" className="grid gap-3 lg:grid-cols-[minmax(14rem,0.8fr)_minmax(14rem,1fr)_minmax(12rem,0.6fr)]">
                        <div className="grid gap-1 text-sm font-semibold">
                            <label htmlFor="followUpClassId">Turma</label>
                            <select className="sf-input" id="followUpClassId" onChange={(event) => selectClass(event.target.value)} value={selectedClassId}>
                                {classes.map((schoolClass) => (
                                    <option key={schoolClass._id} value={schoolClass._id}>
                                        {schoolClass.name} · {schoolClass.schoolYear}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1 text-sm font-semibold">
                            <label htmlFor="followUpStudentSearch">Pesquisar aluno</label>
                            <input className="sf-input" id="followUpStudentSearch" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Email do aluno" type="search" value={searchTerm} />
                        </div>
                        <div className="grid gap-1 text-sm font-semibold">
                            <label htmlFor="followUpStudentFilter">Alertas</label>
                            <select className="sf-input" id="followUpStudentFilter" onChange={(event) => setStudentFilter(event.target.value as StudentFilter)} value={studentFilter}>
                                <option value="ALL">Todos os alunos</option>
                                <option value="INACTIVE">Com alerta de inatividade</option>
                            </select>
                        </div>
                    </Toolbar>

                    <section className="space-y-4" aria-label="Alunos da turma">
                        <SectionHeader
                            action={<a className="sf-button-secondary" href={`/app/professor/turmas/${selectedClassId}/progresso`}>Resumo da turma</a>}
                            description="Os alertas abaixo resultam apenas das regras de inatividade já configuradas."
                            title="Alunos da turma"
                        />
                        {students.length === 0 ? (
                            <EmptyState
                                action={<a className="sf-button-secondary" href={`/app/professor/turmas#students-${selectedClassId}`}>Gerir alunos</a>}
                                description="Adiciona alunos à turma para os consultares neste centro."
                                icon="users"
                                title="Esta turma ainda não tem alunos"
                            />
                        ) : visibleStudents.length === 0 ? (
                            <EmptyState description="Altera a pesquisa ou o filtro de alertas." title="Nenhum aluno corresponde aos filtros" />
                        ) : (
                            <div className="grid gap-3 lg:grid-cols-2">
                                {visibleStudents.map((student) => (
                                    <article className="sf-list-card space-y-3" key={student.id}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold">{student.displayName}</h3>
                                                {student.displayName !== student.email ? (
                                                    <p className="break-all text-xs text-studyflow-text/60">{student.email}</p>
                                                ) : null}
                                                {student.inactiveRules.length === 0 ? (
                                                    <p className="mt-1 text-sm text-studyflow-text/65">Sem alertas pelas regras atuais.</p>
                                                ) : (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {student.inactiveRules.map((rule) => (
                                                            <StatusBadge key={`${student.id}-${rule.id}`} tone="attention">
                                                                {rule.title} · {rule.inactiveDays} dias
                                                            </StatusBadge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button className="sf-button-secondary" onClick={() => void openStudentDetail(student)} type="button">Ver detalhe</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4" aria-label="Regras de inatividade">
                        <SectionHeader description={`Configuração aplicada apenas a ${selectedClass.name}.`} title="Regras de inatividade" />
                        <form className="sf-surface grid gap-4" onSubmit={(event) => void createRule(event)}>
                            <label className="grid gap-2 text-sm text-studyflow-text">
                                <span className="font-semibold">Dias sem atividade</span>
                                <input className="sf-input" id="followUpInactiveDays" max={90} min={1} onChange={(event) => setInactiveDays(Number(event.target.value))} type="number" value={inactiveDays} />
                            </label>
                            <label className="grid gap-2 text-sm text-studyflow-text">
                                <span className="font-semibold">Título</span>
                                <input className="sf-input" maxLength={160} onChange={(event) => setTitle(event.target.value)} value={title} />
                            </label>
                            <label className="grid gap-2 text-sm text-studyflow-text">
                                <span className="font-semibold">Mensagem</span>
                                <textarea className="sf-input min-h-28" maxLength={1000} onChange={(event) => setMessage(event.target.value)} value={message} />
                            </label>
                            <label className="grid gap-2 text-sm text-studyflow-text">
                                <span className="font-semibold">Destino da notificação manual</span>
                                <select className="sf-input" onChange={(event) => setNotificationDestination(event.target.value as typeof notificationDestination)} value={notificationDestination}>
                                    <option value="TODAY">Hoje</option>
                                    <option value="CLASS_SUBJECTS">Disciplinas da turma</option>
                                    <option value="CLASS_POSTS">Publicações da turma</option>
                                    <option value="CLASS_PROJECTS">Projetos da turma</option>
                                </select>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button className="sf-button-primary" disabled={saving} type="submit">Criar regra</button>
                                <button className="sf-button-secondary" disabled={saving} onClick={() => void notifyTask()} type="button">Notificar turma</button>
                            </div>
                        </form>
                        <ClassRulesPanel rules={selectedRules} runningRuleId={runningRuleId} schoolClass={selectedClass} onRunRule={runRule} />
                    </section>

                    <section className="sf-surface space-y-3" aria-label="Notificações recentes">
                        <SectionHeader description="Últimas notificações internas visíveis ao professor." title="Notificações recentes" />
                        {notifications.length === 0 ? (
                            <p className="text-sm text-studyflow-text/65">Ainda não existem notificações recentes.</p>
                        ) : (
                            <div className="space-y-2">
                                {notifications.slice(0, 6).map((notification) => (
                                    <article className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3 text-sm text-studyflow-text" key={notification.id}>
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <span>{formatStudentCount(notification.recipientCount ?? 0)}</span>
                                        </div>
                                        <p className="mt-1">{notification.body}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            ) : null}

            <SidePanel
                closeDisabled={studentSaving}
                description="Resultados oficiais existentes e contacto interno, sem classificações de risco."
                onClose={() => setSelectedStudent(null)}
                open={Boolean(selectedStudent)}
                title={selectedStudent?.displayName ?? "Aluno"}
            >
                <div className="space-y-6">
                    {studentPanelError ? <InlineNotice role="alert" tone="danger">{studentPanelError}</InlineNotice> : null}
                    {studentPanelStatus ? <InlineNotice role="status">{studentPanelStatus}</InlineNotice> : null}
                    {studentOverview ? (
                        <>
                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold">Atividade da turma</h3>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <p className="sf-list-card text-sm">Última atividade: {studentOverview.activity.lastActivityAt ? formatDatePt(studentOverview.activity.lastActivityAt) : "Sem registo"}</p>
                                    <p className="sf-list-card text-sm">Últimos 30 dias: {studentOverview.activity.current30DaysCount} ações</p>
                                    <p className="sf-list-card text-sm">30 dias anteriores: {studentOverview.activity.previous30DaysCount} ações</p>
                                    <p className="sf-list-card text-sm">Total registado: {studentOverview.activity.activityCount} ações</p>
                                </div>
                                {studentOverview.factualSignals.length > 0 ? (
                                    <ul className="space-y-2" aria-label="Sinais factuais">
                                        {studentOverview.factualSignals.map((signal) => (
                                            <li className="rounded-xl border border-studyflow-attention/30 bg-studyflow-attention/10 p-3 text-sm" key={signal.code}>
                                                <strong>{signal.label}</strong>
                                                <p className="mt-1 text-studyflow-text/70">{signal.evidence}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-studyflow-text/65">Sem sinais factuais adicionais.</p>}
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold">Salas guiadas</h3>
                                <p className="text-sm text-studyflow-text/70">
                                    {studentOverview.guidedRooms.completedRooms} de {studentOverview.guidedRooms.totalRooms} concluídas · {studentOverview.guidedRooms.completionPercent}%
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold">Quizzes IA aprovados</h3>
                                {studentOverview.approvedAiQuizzes.attemptCount > 0 ? (
                                    <p className="text-sm text-studyflow-text/70">
                                        {studentOverview.approvedAiQuizzes.attemptCount} tentativas em {studentOverview.approvedAiQuizzes.quizCount} quizzes · média {studentOverview.approvedAiQuizzes.averageScorePercent}% · melhor {studentOverview.approvedAiQuizzes.bestScorePercent}%
                                    </p>
                                ) : <p className="text-sm text-studyflow-text/65">Sem tentativas registadas.</p>}
                            </section>
                        </>
                    ) : null}
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold">Mini-testes oficiais</h3>
                        {studentTestsLoading ? <InlineNotice>A carregar mini-testes...</InlineNotice> : null}
                        {!studentTestsLoading && studentTests.length === 0 && !studentPanelError ? (
                            <EmptyState description="Só são apresentados testes publicados ou encerrados." title="Sem mini-testes oficiais" />
                        ) : null}
                        {studentTests.map((test) => (
                            <article className="sf-list-card space-y-2" key={test.testId}>
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-studyflow-brandText">{test.subjectName}</p>
                                        <h4 className="font-semibold">{test.title}</h4>
                                    </div>
                                    <StatusBadge tone={test.status === "PUBLISHED" ? "brand" : "neutral"}>
                                        {test.status === "PUBLISHED" ? "Publicado" : "Encerrado"}
                                    </StatusBadge>
                                </div>
                                {test.bestAttempt ? (
                                    <div className="text-sm text-studyflow-text/70">
                                        <p>Melhor tentativa: {test.bestAttempt.percentage}% · {test.bestAttempt.correctAnswers}/{test.bestAttempt.totalQuestions} respostas certas</p>
                                        <p>{test.bestAttempt.attemptCount === 1 ? "1 tentativa" : `${test.bestAttempt.attemptCount} tentativas`} · {formatDatePt(test.bestAttempt.answeredAt)}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-studyflow-text/65">Sem tentativa.</p>
                                )}
                            </article>
                        ))}
                    </section>

                    <form className="space-y-3 border-t border-studyflow-border/10 pt-5" onSubmit={(event) => void notifySelectedStudent(event)}>
                        <h3 className="text-lg font-semibold">Notificar aluno</h3>
                        <label className="grid gap-2 text-sm font-semibold">
                            <span>Título</span>
                            <input className="sf-input" maxLength={160} minLength={2} onChange={(event) => setStudentNotificationTitle(event.target.value)} required value={studentNotificationTitle} />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                            <span>Mensagem</span>
                            <textarea className="sf-input min-h-28" maxLength={1000} minLength={5} onChange={(event) => setStudentNotificationMessage(event.target.value)} required value={studentNotificationMessage} />
                        </label>
                        <button className="sf-button-primary" disabled={studentSaving || studentTestsLoading} type="submit">
                            {studentSaving ? "A enviar..." : "Notificar aluno"}
                        </button>
                    </form>

                    {selectedClassId ? <a className="sf-button-secondary" href={`/app/professor/turmas/${selectedClassId}/progresso`}>Abrir resumo da turma</a> : null}
                </div>
            </SidePanel>
        </section>
    );
}

/** Mostra regras da turma selecionada e o preview já autorizado. */
function ClassRulesPanel({ schoolClass, rules, runningRuleId, onRunRule }: {
    schoolClass: SchoolClass;
    rules: FollowUpSummaryRule[];
    runningRuleId: string | null;
    onRunRule: (rule: FollowUpSummaryRule) => Promise<void>;
}) {
    return (
        <article className="sf-list-card space-y-3">
            <div>
                <h3 className="font-semibold">{schoolClass.name}</h3>
                <p className="text-sm text-studyflow-text/65">{rules.length === 1 ? "1 regra" : `${rules.length} regras`}</p>
            </div>
            {rules.length === 0 ? (
                <p className="text-sm text-studyflow-text/65">Sem regras configuradas para esta turma.</p>
            ) : (
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <article className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3" key={rule.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold">{rule.title}</h4>
                                    <p className="text-sm text-studyflow-text/65">{rule.inactiveDays} dias sem atividade · {formatStudentCount(rule.inactiveStudentsCount)} a rever</p>
                                </div>
                                <button className="sf-button-secondary" disabled={runningRuleId === rule.id} onClick={() => void onRunRule(rule)} type="button">
                                    {runningRuleId === rule.id ? "A executar..." : "Executar regra"}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-studyflow-text/70">{rule.message}</p>
                            {rule.inactiveStudents.length > 0 ? (
                                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {rule.inactiveStudents.map((student) => (
                                        <li className="rounded bg-studyflow-page px-3 py-2 text-sm text-studyflow-text" key={`${rule.id}-${student.studentId}`}>{student.displayName}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-3 text-sm text-studyflow-text/65">Sem alunos inativos neste preview.</p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </article>
    );
}

/** Junta os alunos públicos da turma aos previews das regras existentes. */
function buildStudentRows(
    schoolClass: SchoolClass | undefined,
    rules: FollowUpSummaryRule[],
): FollowUpStudentRow[] {
    if (!schoolClass) return [];
    const inactiveRulesByStudent = new Map<string, FollowUpSummaryRule[]>();
    for (const rule of rules) {
        for (const student of rule.inactiveStudents) {
            inactiveRulesByStudent.set(student.studentId, [
                ...(inactiveRulesByStudent.get(student.studentId) ?? []),
                rule,
            ]);
        }
    }
    const publicStudents = schoolClass.students?.length
        ? schoolClass.students
        : (schoolClass.studentIds ?? []).map((id) => ({
              id,
              displayName: `Aluno ${id.slice(-4).toUpperCase()}`,
              email: `Aluno ${id.slice(-4)}`,
          }));
    return publicStudents
        .map((student) => ({
            id: student.id,
            displayName: student.displayName ?? student.email,
            email: student.email,
            inactiveRules: inactiveRulesByStudent.get(student.id) ?? [],
        }))
        .sort((left, right) => left.displayName.localeCompare(right.displayName, "pt-PT"));
}

/** Obtém o classId pedido sem assumir que é autorizado. */
function getRequestedClassId(): string {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("classId") ?? "";
}

/** Mantém apenas a turma selecionada no URL sem provocar navegação completa. */
function syncClassIdInUrl(classId: string): void {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (classId) url.searchParams.set("classId", classId);
    else url.searchParams.delete("classId");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

/** Normaliza erros desconhecidos para mensagens visíveis e honestas. */
function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/** Identifica a remoção concorrente de aluno ou turma sem depender de dados internos. */
function isMissingStudentMessage(message: string): boolean {
    return message === "Aluno não encontrado nesta turma." || message === "Turma não encontrada.";
}

/** Formata contagens de alunos com plural correto. */
function formatStudentCount(count: number): string {
    return count === 1 ? "1 aluno" : `${count} alunos`;
}
