/**
 * Implementa o dashboard principal do professor com métricas agregadas reais.
 */
import { useEffect, useState } from "react";
import {
    IconTooltip,
    ShellIcon,
    type ShellIconName,
} from "../../components/layout/shell-icons.js";
import { PageHeader } from "../../components/PageHeader.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import {
    getTeacherDashboard,
    TeacherDashboardClassRow,
    TeacherDashboardSummary,
    TeacherDashboardSubjectRow,
} from "../../lib/apiClient.js";

/**
 * Página inicial docente com visão agregada de turmas, materiais, testes e sinais de acompanhamento.
 *
 * @returns Dashboard docente pronto a renderizar.
 */
export function TeacherDashboardPage() {
    const [dashboard, setDashboard] = useState<TeacherDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
    const attentionItems = dashboard ? getAttentionItems(dashboard) : [];

    useEffect(() => {
        let active = true;

        /**
         * Carrega o dashboard respeitando unmounts durante chamadas assíncronas.
         *
         * @returns Promise resolvida quando o estado local fica sincronizado.
         */
        async function loadDashboard(): Promise<void> {
            const measurement = startPerformanceBudget("teacher-dashboard");
            setLoading(true);
            setError(null);
            setPerformanceWarning(null);
            try {
                const nextDashboard = await getTeacherDashboard();
                if (active) setDashboard(nextDashboard);
            } catch (caught) {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Erro ao carregar dashboard docente.",
                    );
                }
            } finally {
                if (active) {
                    const result = finishPerformanceBudget(measurement);
                    setPerformanceWarning(
                        result.exceeded
                            ? formatPerformanceBudgetMessage(result)
                            : null,
                    );
                    setLoading(false);
                }
            }
        }

        void loadDashboard();
        return () => {
            active = false;
        };
    }, []);

    return (
        <>
            <AttentionDrawer items={attentionItems} />
            <section className="space-y-6">
                <PageHeader
                    title="Dashboard docente"
                    description="Visão agregada das turmas, materiais, mini-testes, conteúdos docentes e sinais de acompanhamento."
                    action={<TeacherDashboardActions />}
                />

                {loading ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-text">A carregar dashboard docente...</p>
                ) : null}
                {error ? <p className="sf-error" role="alert">{error}</p> : null}
                {performanceWarning ? (
                    <p className="sf-surface-subtle text-sm text-studyflow-alertText" role="status">
                        {performanceWarning}
                    </p>
                ) : null}

                {dashboard ? <DashboardContent dashboard={dashboard} /> : null}
            </section>
        </>
    );
}

/**
 * Renderiza o conteúdo depois de carregado para manter estados iniciais simples.
 *
 * @param props Dashboard recebido da API.
 * @returns Conteúdo principal do dashboard.
 */
function DashboardContent({ dashboard }: { dashboard: TeacherDashboardSummary }) {
    const hasClasses = dashboard.classes.length > 0;
    const attentionItems = getAttentionItems(dashboard);
    const attentionTotal = attentionItems.reduce((total, item) => total + item.value, 0);
    const primaryMetrics: DashboardMetric[] = [
        {
            label: "Turmas",
            value: dashboard.totals.classes,
            href: "/app/professor/turmas",
            actionLabel: "Abrir turmas",
        },
        {
            label: "Alunos",
            value: dashboard.totals.students,
            href: "/app/professor/turmas",
            actionLabel: "Gerir alunos nas turmas",
        },
        {
            label: "Sinais a rever",
            value: attentionTotal,
            helpText:
                "Soma de alertas operacionais que podem precisar da tua atenção: turmas sem base configurada, revisões IA pendentes ou alunos sinalizados por regras de acompanhamento.",
        },
        {
            label: "Regras de acompanhamento",
            value: dashboard.followUp.rulesCount,
            href: "/app/professor/acompanhamento",
            actionLabel: "Gerir regras de acompanhamento",
            helpText:
                "Regras configuradas pelo professor para detetar situações como alunos sem atividade recente. Não são resultados académicos.",
        },
    ];
    const secondaryMetrics: DashboardMetric[] = [
        { label: "Materiais do professor", value: dashboard.totals.officialMaterials },
        { label: "Mini-testes publicados", value: dashboard.totals.publishedTests },
        { label: "Publicações do professor", value: dashboard.totals.posts },
        { label: "Notas de acompanhamento", value: dashboard.totals.progressNotes },
        {
            label: "Conteúdos pendentes/aprovados",
            value: dashboard.totals.pendingAiReviews + dashboard.totals.approvedAiReviews,
        },
    ];

    return (
        <div className="space-y-6">
            <OverviewPanel primaryMetrics={primaryMetrics} secondaryMetrics={secondaryMetrics} />

            {!hasClasses ? (
                <EmptyClassesPanel />
            ) : (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold">Resumo por turma</h2>
                    </div>
                    <div className="space-y-3">
                        {dashboard.classes.map((schoolClass) => (
                            <ClassSummaryCard schoolClass={schoolClass} key={schoolClass.classId} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

type DashboardMetric = {
    label: string;
    value: number;
    actionLabel?: string;
    helpText?: string;
    href?: string;
};

type ClassAction = {
    label: string;
    icon: ShellIconName;
    href: (classId: string) => string;
};

type SubjectAction = {
    label: string;
    icon: ShellIconName;
    group: "content" | "support";
    href: (classId: string, subjectId: string) => string;
};

type ClassBadge = {
    label: string;
    value: string;
};

const CLASS_ACTIONS: ClassAction[] = [
    {
        label: "Alunos",
        icon: "users",
        href: (classId) => `/app/professor/turmas#students-${classId}`,
    },
    {
        label: "Centro de Acompanhamento",
        icon: "chart",
        href: (classId) => `/app/professor/acompanhamento?classId=${classId}`,
    },
    {
        label: "Resumo da turma",
        icon: "chart",
        href: (classId) => `/app/professor/turmas/${classId}/progresso`,
    },
    {
        label: "Disciplinas",
        icon: "book",
        href: (classId) => `/app/professor/turmas/${classId}/disciplinas`,
    },
    {
        label: "Materiais/testes",
        icon: "clipboard",
        href: (classId) => `/app/professor/turmas/${classId}/disciplinas`,
    },
    {
        label: "Publicações",
        icon: "megaphone",
        href: (classId) => `/app/professor/turmas/${classId}/publicacoes`,
    },
    {
        label: "Nota",
        icon: "plus",
        href: (classId) => `/app/professor/turmas/${classId}/progresso#criar-nota-progresso`,
    },
];

const SUBJECT_ACTIONS: SubjectAction[] = [
    {
        label: "Materiais",
        icon: "file",
        group: "content",
        href: (_classId, subjectId) =>
            `/app/professor/disciplinas/${subjectId}/materiais`,
    },
    {
        label: "Testes",
        icon: "clipboard",
        group: "content",
        href: (_classId, subjectId) =>
            `/app/professor/disciplinas/${subjectId}/testes`,
    },
    {
        label: "Conteúdos aprovados",
        icon: "spark",
        group: "content",
        href: (_classId, subjectId) =>
            `/app/professor/disciplinas/${subjectId}/revisoes-ia`,
    },
    {
        label: "Chat",
        icon: "message",
        group: "support",
        href: (_classId, subjectId) =>
            `/app/professor/disciplinas/${subjectId}/chat`,
    },
    {
        label: "Salas guiadas",
        icon: "graduation",
        group: "support",
        href: (classId) => `/app/professor/turmas/${classId}/salas-guiadas`,
    },
];

const ATTENTION_DRAWER_TIMEOUT_MS = 8000;
const ATTENTION_DRAWER_ANIMATION_MS = 300;

type AttentionDrawerPhase = "closed" | "entering" | "open" | "exiting";

/**
 * Atalhos principais do dashboard, junto da acao primária de criação.
 *
 * @returns Grupo de links do topo da página.
 */
function TeacherDashboardActions() {
    return (
        <>
            <a className="sf-button-secondary" href="/app/professor/turmas">
                Turmas
            </a>
            <a className="sf-button-secondary" href="/app/professor/acompanhamento">
                Centro de Acompanhamento
            </a>
            <a className="sf-button-primary" href="/app/professor/turmas#criar-turma">
                Criar turma
            </a>
        </>
    );
}

/**
 * Seleciona apenas os sinais de atenção que realmente exigem leitura.
 *
 * @param dashboard Dados agregados recebidos da API.
 * @returns Lista sem métricas a zero para reduzir ruído visual.
 */
function getAttentionItems(dashboard: TeacherDashboardSummary): DashboardMetric[] {
    return [
        {
            label: "Turmas sem disciplinas",
            value: dashboard.attention.classesWithoutSubjects,
        },
        {
            label: "Turmas sem materiais",
            value: dashboard.attention.classesWithoutMaterials,
        },
        {
            label: "Turmas com atividade baixa",
            value: dashboard.attention.classesWithLowActivity,
        },
        {
            label: "Turmas sem regras",
            value: dashboard.attention.classesWithoutFollowUpRules,
        },
        {
            label: "Alunos a rever",
            value: dashboard.attention.inactiveStudents,
        },
        {
            label: "Conteúdos pendentes",
            value: dashboard.attention.pendingAiReviews,
        },
    ].filter((item) => item.value > 0);
}

/**
 * Mostra a visão geral sem transformar cada métrica num card independente.
 *
 * @param props Métricas principais e secundárias do dashboard.
 * @returns Painel de topo com hierarquia mais leve.
 */
function OverviewPanel({
    primaryMetrics,
    secondaryMetrics,
}: {
    primaryMetrics: DashboardMetric[];
    secondaryMetrics: DashboardMetric[];
}) {
    return (
        <section className="sf-surface space-y-6" aria-labelledby="teacher-dashboard-overview-title">
            <div>
                <h2 className="text-xl font-bold tracking-tight" id="teacher-dashboard-overview-title">
                    Visão geral
                </h2>
                <p className="mt-1 text-sm text-studyflow-text/65">
                    Estado operacional das turmas e dos sinais que podem exigir revisão.
                </p>
            </div>

            <dl className="grid overflow-hidden rounded-2xl border border-studyflow-border/10 bg-studyflow-page/35 sm:grid-cols-2 lg:grid-cols-4">
                {primaryMetrics.map((metric, index) => (
                    <MetricBlock
                        helpAlign={
                            index === 0
                                ? "left"
                                : index === primaryMetrics.length - 1
                                  ? "right"
                                  : "center"
                        }
                        metric={metric}
                        key={metric.label}
                    />
                ))}
            </dl>

            <div className="border-t border-studyflow-border/10 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-studyflow-text/50">
                    Conteúdo do professor e acompanhamento registado
                </p>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                    {secondaryMetrics.map((metric) => (
                        <InlineMetric metric={metric} key={metric.label} />
                    ))}
                </dl>
            </div>
        </section>
    );
}

/**
 * Métrica principal do topo, sem caixa própria.
 *
 * @param props Métrica a apresentar.
 * @returns Par label/valor para uma grelha de resumo.
 */
function MetricBlock({
    metric,
    helpAlign,
}: {
    metric: DashboardMetric;
    helpAlign: "left" | "center" | "right";
}) {
    return (
        <div className="min-w-0 border-b border-studyflow-border/10 p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
            <dt className="flex min-w-0 items-center gap-1.5 text-sm text-studyflow-text/65">
                <span className="min-w-0">{metric.label}</span>
                {metric.helpText ? (
                    <MetricHelp align={helpAlign} text={metric.helpText} />
                ) : null}
            </dt>
            <dd className="mt-2 flex min-w-0 items-center gap-2 text-3xl font-bold tracking-tight text-studyflow-text">
                <span>{metric.value}</span>
            {metric.href ? (
                <a
                    aria-label={metric.actionLabel ?? `Abrir ${metric.label}`}
                    className="sf-icon-button group relative h-8 w-8 shrink-0"
                    href={metric.href}
                >
                    <ShellIcon className="h-5 w-5" name="arrowRight" />
                    <IconTooltip align="center">
                        {metric.actionLabel ?? `Abrir ${metric.label}`}
                    </IconTooltip>
                </a>
            ) : null}
            </dd>
        </div>
    );
}

/**
 * Ícone de ajuda compacto para métricas de topo que precisam de contexto.
 *
 * @param props Texto explicativo e alinhamento seguro dentro da grelha.
 * @returns Botão informativo com tooltip.
 */
function MetricHelp({
    text,
    align,
}: {
    text: string;
    align: "left" | "center" | "right";
}) {
    const positionClass =
        align === "left"
            ? "left-0"
            : align === "right"
              ? "right-0"
              : "left-1/2 -translate-x-1/2";

    return (
        <span className="group relative inline-flex shrink-0">
            <button
                aria-label={text}
                className="inline-flex h-5 w-5 items-center justify-center rounded text-studyflow-text transition hover:bg-studyflow-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
                type="button"
            >
                <ShellIcon className="h-4 w-4" name="help" />
            </button>
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-studyflow-border/10 bg-studyflow-card px-3 py-2 text-xs font-medium leading-5 text-studyflow-text opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100 ${positionClass}`}
            >
                {text}
            </span>
        </span>
    );
}

/**
 * Métrica secundária inline usada para evitar cards redundantes.
 *
 * @param props Métrica a apresentar.
 * @returns Item compacto de definição.
 */
function InlineMetric({ metric }: { metric: DashboardMetric }) {
    return (
        <div className="flex min-w-0 items-baseline gap-1 text-sm">
            <dt className="text-studyflow-text">{metric.label}:</dt>
            <dd className="text-base font-bold text-studyflow-text">{metric.value}</dd>
        </div>
    );
}

/**
 * Estado vazio quando o professor ainda não tem turmas.
 *
 * @returns Painel com próxima ação clara.
 */
function EmptyClassesPanel() {
    return (
        <section className="sf-empty-state space-y-3 lg:col-start-1 lg:row-start-1">
            <span className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-studyflow-brand/15 text-studyflow-brandText">
                <ShellIcon className="h-6 w-6" name="graduation" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Ainda não há turmas</h2>
            <p className="max-w-2xl text-sm leading-6 text-studyflow-text/65">
                Cria a primeira turma para começares a organizar disciplinas, materiais,
                publicações, mini-testes e acompanhamento.
            </p>
            <a className="sf-button-secondary" href="/app/professor/turmas#criar-turma">
                Criar primeira turma
            </a>
        </section>
    );
}

/**
 * Mostra sinais de atenção como drawer temporário no topo da shell.
 *
 * @param props Itens já filtrados para apresentação.
 * @returns Drawer fixo, compacto, fechável e temporário.
 */
function AttentionDrawer({ items }: { items: DashboardMetric[] }) {
    const [phase, setPhase] = useState<AttentionDrawerPhase>("closed");
    const itemSignature = items.map((item) => `${item.label}:${item.value}`).join("|");

    useEffect(() => {
        if (items.length === 0) {
            setPhase("closed");
            return;
        }

        setPhase("entering");
        const enterFrameId = window.requestAnimationFrame(() => {
            setPhase("open");
        });
        const exitTimeoutId = window.setTimeout(() => {
            setPhase("exiting");
        }, ATTENTION_DRAWER_TIMEOUT_MS);

        return () => {
            window.cancelAnimationFrame(enterFrameId);
            window.clearTimeout(exitTimeoutId);
        };
    }, [itemSignature, items.length]);

    useEffect(() => {
        if (phase !== "exiting") return undefined;

        const closeTimeoutId = window.setTimeout(() => {
            setPhase("closed");
        }, ATTENTION_DRAWER_ANIMATION_MS);

        return () => window.clearTimeout(closeTimeoutId);
    }, [phase]);

    if (phase === "closed" || items.length === 0) return null;

    const isVisible = phase === "open";

    return (
        <aside
            aria-label="Sinais que precisam de atenção"
            className={
                isVisible
                    ? "fixed left-1/2 top-0 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 translate-y-0 opacity-100 transition-all duration-300 ease-out sm:w-[min(36rem,calc(100vw-2rem))] lg:w-[min(42rem,calc(100vw-24rem))]"
                    : "fixed left-1/2 top-0 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-full opacity-0 transition-all duration-300 ease-in sm:w-[min(36rem,calc(100vw-2rem))] lg:w-[min(42rem,calc(100vw-24rem))]"
            }
            role="status"
        >
            <div className="rounded-b-2xl border-x border-b border-studyflow-border/10 bg-studyflow-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <p className="shrink-0 text-sm font-bold text-studyflow-text">
                        Precisa de atenção
                    </p>
                    <dl className="flex min-w-0 flex-1 flex-wrap gap-2">
                        {items.map((item) => (
                            <div
                                className="rounded-full border border-studyflow-border/10 bg-studyflow-page/55 px-3 py-1.5 text-sm text-studyflow-text"
                                key={item.label}
                            >
                                <dt className="inline">{item.label}: </dt>
                                <dd className="inline font-bold">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <button
                        aria-label="Fechar sinais de atenção"
                        className="sf-icon-button h-8 w-8 shrink-0"
                        onClick={() => setPhase("exiting")}
                        type="button"
                    >
                        ×
                    </button>
                </div>
            </div>
        </aside>
    );
}

/**
 * Renderiza uma turma no dashboard sem expor dados individuais dos alunos.
 *
 * @param props Turma agregada.
 * @returns Cartão com métricas e atalhos.
 */
function ClassSummaryCard({ schoolClass }: { schoolClass: TeacherDashboardClassRow }) {
    const [supportOpen, setSupportOpen] = useState(false);
    const signalWidth = `${schoolClass.activityScorePercent}%`;
    const classMetrics: DashboardMetric[] = [
        { label: "Materiais do professor", value: schoolClass.officialMaterialsCount },
        { label: "Mini-testes publicados", value: schoolClass.publishedTestsCount },
        { label: "Publicações do professor", value: schoolClass.postCount },
        {
            label: "Conclusões em salas abertas",
            value: schoolClass.guidedRoomCompletionsCount ?? 0,
        },
    ];
    const badges = buildClassActionBadges(schoolClass);
    const activityStatusLabel = formatActivityStatus(schoolClass.activityStatus);
    const supportSectionId = `class-support-${schoolClass.classId}`;

    return (
        <article className="sf-list-card sf-surface-interactive space-y-4 p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                <div className="min-w-0 space-y-3">
                    <h3 className="text-lg font-bold">{schoolClass.className}</h3>
                    <p className="text-sm text-studyflow-text/65">
                        {schoolClass.studentsCount} alunos · {schoolClass.subjectsCount} disciplinas
                    </p>

                    <dl className="grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2 2xl:flex 2xl:flex-wrap">
                        {classMetrics.map((metric) => (
                            <ClassMetric metric={metric} key={metric.label} />
                        ))}
                    </dl>

                    <ClassBadgeList badges={badges} />
                </div>

                <div className="flex h-full flex-col gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm text-studyflow-text/70">
                            <span className="inline-flex min-w-0 items-center gap-2">
                                <span>Atividade de acompanhamento</span>
                                <CoverageHelp />
                            </span>
                            <span className="shrink-0 font-semibold">
                                {activityStatusLabel} · {schoolClass.activityScorePercent}%
                            </span>
                        </div>
                        <div
                            aria-label={`Atividade de acompanhamento de ${schoolClass.className}`}
                            aria-valuemax={100}
                            aria-valuemin={0}
                            aria-valuenow={schoolClass.activityScorePercent}
                            className="h-2 overflow-hidden rounded-full bg-studyflow-page/70"
                            role="progressbar"
                        >
                            <div className="h-full bg-studyflow-brand" style={{ width: signalWidth }} />
                        </div>
                    </div>

                    <nav aria-label={`Atalhos da turma ${schoolClass.className}`} className="mt-auto flex flex-wrap gap-2 xl:justify-end">
                        {CLASS_ACTIONS.map((action) => (
                            <a
                                aria-label={`${action.label} de ${schoolClass.className}`}
                                className="sf-icon-button group relative"
                                href={action.href(schoolClass.classId)}
                                key={action.label}
                            >
                                <ShellIcon className="h-5 w-5" name={action.icon} />
                                <span className="sr-only">{action.label}</span>
                                <IconTooltip align="center">{action.label}</IconTooltip>
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="border-t border-studyflow-border/10 pt-3">
                <button
                    aria-controls={supportSectionId}
                    aria-expanded={supportOpen}
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-studyflow-text/75 transition hover:bg-studyflow-page/45 hover:text-studyflow-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
                    onClick={() => setSupportOpen((current) => !current)}
                    type="button"
                >
                    <ShellIcon
                        className={`h-4 w-4 transition-transform ${supportOpen ? "rotate-90" : ""}`}
                        name="arrowRight"
                    />
                    {supportOpen ? "Ocultar disciplinas e apoio" : "Disciplinas e apoio"}
                </button>

                {supportOpen ? (
                    <ClassSupportDetails
                        schoolClass={schoolClass}
                        sectionId={supportSectionId}
                    />
                ) : null}
            </div>
        </article>
    );
}

/**
 * Lista disciplinas, contexto operacional e atalhos reais de apoio da turma.
 *
 * @param props Turma agregada e id acessível da secção.
 * @returns Conteúdo colapsável com linhas por disciplina.
 */
function ClassSupportDetails({
    schoolClass,
    sectionId,
}: {
    schoolClass: TeacherDashboardClassRow;
    sectionId: string;
}) {
    if (schoolClass.subjects.length === 0) {
        return (
            <div className="mt-3 rounded-xl bg-studyflow-page/45 px-4 py-4 text-sm text-studyflow-text" id={sectionId}>
                <p>Esta turma ainda não tem disciplinas.</p>
                <a
                    className="mt-3 inline-flex text-sm font-semibold text-studyflow-brandText underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brandText"
                    href={`/app/professor/turmas/${schoolClass.classId}/disciplinas#criar-disciplina`}
                >
                    Gerir disciplinas
                </a>
            </div>
        );
    }

    return (
        <div className="mt-3 overflow-visible rounded-xl border border-studyflow-border/10" id={sectionId}>
            <div className="grid grid-cols-[minmax(10rem,1fr)_minmax(18rem,1.6fr)_auto] gap-3 rounded-t-xl border-b border-studyflow-border/10 bg-studyflow-page/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-studyflow-text/55 max-lg:hidden">
                <span>Disciplina</span>
                <span>Estado</span>
                <span className="text-right">Ações</span>
            </div>
            <div className="divide-y divide-studyflow-border/10">
                {schoolClass.subjects.map((subject) => (
                    <SubjectSupportRow
                        classId={schoolClass.classId}
                        key={subject.subjectId}
                        subject={subject}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Linha compacta de uma disciplina dentro do detalhe colapsável da turma.
 *
 * @param props Disciplina e turma usadas para gerar labels e links.
 * @returns Linha responsiva com estado e ações existentes.
 */
function SubjectSupportRow({
    classId,
    subject,
}: {
    classId: string;
    subject: TeacherDashboardSubjectRow;
}) {
    return (
        <div className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(10rem,1fr)_minmax(18rem,1.6fr)_auto] lg:items-center">
            <div className="min-w-0">
                <p className="font-semibold text-studyflow-text">{subject.subjectName}</p>
                {subject.subjectCode ? (
                    <p className="text-xs uppercase text-studyflow-text">{subject.subjectCode}</p>
                ) : null}
            </div>
            <p className="text-sm text-studyflow-text/65">
                {buildSubjectStatusText(subject)}
            </p>
            <SubjectActionToolbar classId={classId} subject={subject} />
        </div>
    );
}

/**
 * Mostra todas as ações da disciplina numa toolbar estável e pouco ruidosa.
 *
 * @param props Turma e disciplina usadas para gerar links e badges.
 * @returns Grupo de ícones com tooltips e divisão entre conteúdo e apoio.
 */
function SubjectActionToolbar({
    classId,
    subject,
}: {
    classId: string;
    subject: TeacherDashboardSubjectRow;
}) {
    const contentActions = SUBJECT_ACTIONS.filter(
        (action) => action.group === "content",
    );
    const supportActions = SUBJECT_ACTIONS.filter(
        (action) => action.group === "support",
    );

    return (
        <nav
            aria-label={`Ações de ${subject.subjectName}`}
            className="flex flex-wrap gap-1.5 lg:justify-end"
        >
            <div className="inline-flex rounded-xl border border-studyflow-border/10 bg-studyflow-page/45 p-1">
                {contentActions.map((action) => (
                    <SubjectActionLink
                        action={action}
                        classId={classId}
                        key={action.label}
                        subject={subject}
                    />
                ))}
            </div>
            <div className="inline-flex rounded-xl border border-studyflow-border/10 bg-studyflow-page/45 p-1">
                {supportActions.map((action) => (
                    <SubjectActionLink
                        action={action}
                        classId={classId}
                        key={action.label}
                        subject={subject}
                    />
                ))}
            </div>
        </nav>
    );
}

/**
 * Link de ação por disciplina com tooltip e badge contextual discreta.
 *
 * @param props Ação, turma e disciplina.
 * @returns Link de ícone acessível.
 */
function SubjectActionLink({
    action,
    classId,
    subject,
}: {
    action: SubjectAction;
    classId: string;
    subject: TeacherDashboardSubjectRow;
}) {
    const badge = getSubjectActionBadge(action, subject);

    return (
        <a
            aria-label={`${action.label} de ${subject.subjectName}`}
            className="group relative inline-flex h-8 w-8 items-center justify-center rounded text-studyflow-text transition hover:bg-studyflow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
            href={action.href(classId, subject.subjectId)}
        >
            <ShellIcon className="h-4 w-4" name={action.icon} />
            <span className="sr-only">{action.label}</span>
            {badge ? (
                <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-studyflow-brand px-1 text-[10px] font-bold leading-none text-white"
                >
                    {badge}
                </span>
            ) : null}
            <IconTooltip align="center">{action.label}</IconTooltip>
        </a>
    );
}

/**
 * Métrica compacta de uma turma com separador explícito entre label e valor.
 *
 * @param props Métrica agregada.
 * @returns Item de definição legível.
 */
function ClassMetric({ metric }: { metric: DashboardMetric }) {
    return (
        <div className="flex min-w-0 items-baseline gap-1">
            <dt className="text-studyflow-text/65">{metric.label}:</dt>
            <dd className="font-bold text-studyflow-text">{metric.value}</dd>
        </div>
    );
}

/**
 * Resume o estado operacional de uma disciplina sem expor conteúdos ou mensagens.
 *
 * @param subject Disciplina agregada recebida no dashboard.
 * @returns Texto curto para a coluna de estado.
 */
function buildSubjectStatusText(subject: TeacherDashboardSubjectRow): string {
    const parts = [
        subject.officialMaterialsCount > 0
            ? formatCount(subject.officialMaterialsCount, "material", "materiais")
            : "sem materiais",
        subject.publishedTestsCount > 0
            ? formatCount(subject.publishedTestsCount, "mini-teste", "mini-testes")
            : "sem mini-testes",
    ];

    if (subject.pendingAiReviewsCount > 0) {
        parts.push(
            formatCount(
                subject.pendingAiReviewsCount,
                "revisão IA pendente",
                "revisões IA pendentes",
            ),
        );
    }

    if (subject.openGuidedRoomsCount > 0) {
        parts.push(
            formatCount(
                subject.openGuidedRoomsCount,
                "sala guiada aberta",
                "salas guiadas abertas",
            ),
        );
    } else {
        parts.push("sem sala guiada");
    }

    if (subject.closedGuidedRoomsCount > 0) {
        parts.push(
            formatCount(
                subject.closedGuidedRoomsCount,
                "sala fechada",
                "salas fechadas",
            ),
        );
    }

    return parts.join(" · ");
}

/**
 * Decide se uma ação deve ter badge numérica sem esconder ações concorrentes.
 *
 * @param action Ação representada pelo ícone.
 * @param subject Disciplina agregada.
 * @returns Número da badge ou null quando não há destaque.
 */
function getSubjectActionBadge(
    action: SubjectAction,
    subject: TeacherDashboardSubjectRow,
): number | null {
    if (action.label === "Conteúdos aprovados" && subject.pendingAiReviewsCount > 0) {
        return subject.pendingAiReviewsCount;
    }
    return null;
}

/**
 * Aplica singular/plural a contadores pequenos do dashboard.
 *
 * @param count Valor numérico.
 * @param singular Label singular.
 * @param plural Label plural.
 * @returns Texto formatado com número e label correto.
 */
function formatCount(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Constrói apenas badges acionáveis para o dashboard.
 *
 * @param schoolClass Turma agregada.
 * @returns Lista de alertas compactos para a turma.
 */
function buildClassActionBadges(schoolClass: TeacherDashboardClassRow): ClassBadge[] {
    const badges: ClassBadge[] = [];
    if (schoolClass.inactiveStudentsCount > 0) {
        badges.push({
            label: "A rever",
            value:
                schoolClass.inactiveStudentsCount === 1
                    ? "1 aluno sem atividade recente"
                    : `${schoolClass.inactiveStudentsCount} alunos sem atividade recente`,
        });
    }
    if (schoolClass.pendingAiReviewsCount > 0) {
        badges.push({
            label: "Atenção",
            value: formatPendingAiReviews(schoolClass.pendingAiReviewsCount),
        });
    }
    return badges;
}

/**
 * Mostra badges acionáveis quando a turma tem sinais úteis.
 *
 * @param props Badges já normalizadas.
 * @returns Lista visual compacta ou nada quando vazia.
 */
function ClassBadgeList({ badges }: { badges: ClassBadge[] }) {
    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <span
                    className="sf-badge"
                    key={`${badge.label}-${badge.value}`}
                >
                    <span className="font-semibold">{badge.label}:</span> {badge.value}
                </span>
            ))}
        </div>
    );
}

/**
 * Explica a percentagem de cobertura sem ocupar espaço permanente no card.
 *
 * @returns Ícone de ajuda com tooltip em hover/focus.
 */
function CoverageHelp() {
    return (
        <span className="group relative inline-flex">
            <button
                aria-label="Atividade de acompanhamento combina bases operacionais da turma, como disciplinas, materiais, mini-testes, publicações, notas, conteúdo IA aprovado e regras de acompanhamento. Não mede desempenho académico individual."
                className="inline-flex h-5 w-5 items-center justify-center rounded text-studyflow-text transition hover:bg-studyflow-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studyflow-brand"
                type="button"
            >
                <ShellIcon className="h-4 w-4" name="info" />
            </button>
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-studyflow-border/10 bg-studyflow-card px-3 py-2 text-xs font-medium leading-5 text-studyflow-text opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
                Atividade de acompanhamento combina bases operacionais da turma:
                disciplinas, materiais, mini-testes, publicações, notas, conteúdo IA
                aprovado e regras de acompanhamento. Não mede desempenho académico
                individual.
            </span>
        </span>
    );
}

/**
 * Traduz o estado técnico da API para texto curto na UI.
 *
 * @param status Estado operacional da turma.
 * @returns Label legível para professores.
 */
function formatActivityStatus(status: TeacherDashboardClassRow["activityStatus"]): string {
    const labels: Record<TeacherDashboardClassRow["activityStatus"], string> = {
        SEM_BASE: "Sem base",
        BAIXA: "Baixa",
        REGULAR: "Regular",
        ALTA: "Alta",
    };
    return labels[status];
}

/**
 * Formata a badge de revisões IA pendentes com plural correto.
 *
 * @param count Número de revisões pendentes.
 * @returns Texto compacto para badge.
 */
function formatPendingAiReviews(count: number): string {
    return count === 1 ? "1 revisão IA pendente" : `${count} revisões IA pendentes`;
}
