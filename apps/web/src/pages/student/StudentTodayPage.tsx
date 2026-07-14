/** Página inicial do aluno orientada às próximas ações. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { StudentOnboardingCard } from "../../components/student/StudentOnboardingCard.js";
import { PrimaryActionCard } from "../../components/student/StudentWorkspace.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { getProfile, getStudentToday, type StudentAction, type StudentProfile, type StudentTodayState } from "../../lib/apiClient.js";

const urgencyLabels = { OVERDUE: "Em atraso", TODAY: "Hoje", UPCOMING: "Próximos dias", AVAILABLE: "Disponível" } as const;

export function StudentTodayPage() {
    const [state, setState] = useState<StudentTodayState | null>(null);
    const [profile, setProfile] = useState<StudentProfile | null | undefined>(undefined);
    const [deferred, setDeferred] = useState(() => sessionStorage.getItem("studyflow:onboarding-deferred") === "1");
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let active = true;
        Promise.all([getStudentToday(), getProfile()]).then(([today, nextProfile]) => { if (active) { setState(today); setProfile(nextProfile); } }).catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível carregar o dia.") );
        return () => { active = false; };
    }, [reload]);
    const defer = () => { sessionStorage.setItem("studyflow:onboarding-deferred", "1"); setDeferred(true); };
    return (
        <section className="space-y-8">
            <PageHeader
                title={profile?.name ? `Olá, ${profile.name}` : "Hoje"}
                description="Continua de onde paraste e vê o que tens para hoje."
            />
            {error ? (
                <div className="space-y-3">
                    <InlineNotice tone="danger">{error}</InlineNotice>
                    <button
                        className="sf-button-secondary"
                        onClick={() => {
                            setError(null);
                            setReload((value) => value + 1);
                        }}
                        type="button"
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : null}
            {profile === null && !deferred ? (
                <StudentOnboardingCard onDeferred={defer} onSaved={setProfile} />
            ) : null}
            {profile === undefined || !state ? (
                !error ? <InlineNotice>A preparar o teu dia...</InlineNotice> : null
            ) : (
                <>
                    {state.continue ? (
                        <section className="space-y-4">
                            <SectionHeader eyebrow="Retomar" title="Continuar" />
                            <div className="max-w-2xl">
                                <PrimaryActionCard
                                    actionLabel="Continuar"
                                    description={state.continue.contextLabel}
                                    href={state.continue.targetPath}
                                    icon="book"
                                    meta={state.continue.contextMeta ? <ContextMeta action={state.continue} compact /> : undefined}
                                    title={state.continue.title}
                                />
                            </div>
                        </section>
                    ) : (
                        <EmptyState
                            action={<Link className="sf-button-primary" to="/app/estudar">Escolher o que estudar</Link>}
                            description="Abre uma disciplina ou área pessoal. Depois, ela ficará disponível aqui."
                            icon="book"
                            title="Escolhe o teu primeiro contexto"
                        />
                    )}
                    <section className="space-y-4">
                        <SectionHeader title="Para hoje" description="Até seis atividades ordenadas por urgência." />
                        {state.priorities.length ? (
                            <div className="grid gap-3 lg:grid-cols-2">
                                {state.priorities.map((action) => (
                                    <ActionRow action={action} key={action.key} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-studyflow-text/65">
                                Não tens atividades urgentes. Podes avançar ao teu ritmo.
                            </p>
                        )}
                    </section>
                    {state.recentContexts.length ? (
                        <section className="space-y-4">
                            <SectionHeader title="Recentes" />
                            <div className="grid gap-3 sm:grid-cols-3">
                                {state.recentContexts.map((action) => (
                                    <ActionRow action={action} key={action.key} />
                                ))}
                            </div>
                        </section>
                    ) : null}
                    <nav aria-label="Outros destinos" className="flex flex-wrap gap-2">
                        <Link className="sf-button-secondary" to="/app/estudar">Estudar</Link>
                        <Link className="sf-button-secondary" to="/app/em-grupo">Em grupo</Link>
                        <Link className="sf-button-secondary" to="/app/plano">Plano</Link>
                    </nav>
                </>
            )}
        </section>
    );
}

function ActionRow({ action }: { action: StudentAction }) {
    return <article className="sf-list-card"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{action.title}</h3><StatusBadge tone={action.urgency === "OVERDUE" ? "danger" : action.urgency === "TODAY" ? "attention" : "neutral"}>{urgencyLabels[action.urgency]}</StatusBadge></div>{action.contextLabel ? <p className="mt-2 text-sm text-studyflow-text/65">{action.contextLabel}</p> : null}<ContextMeta action={action} /><Link className="sf-button-primary mt-4 inline-flex" to={action.targetPath}>Abrir</Link></article>;
}

/** Traduz metadata do domínio em, no máximo, dois indicadores compactos. */
function ContextMeta({ action, compact = false }: { action: StudentAction; compact?: boolean }) {
    const meta = action.contextMeta;
    if (!meta) return null;
    const creator = meta.creator === "SELF"
        ? "Criada por ti"
        : meta.creator === "TEACHER"
            ? "Criada pelo professor"
            : "Criada por outro aluno";
    const access = meta.access === "PRIVATE"
        ? "Privada"
        : meta.access === "CLASS"
            ? "Partilhada com a turma"
            : `Partilhada${meta.memberCount ? ` · ${meta.memberCount} ${meta.memberCount === 1 ? "membro" : "membros"}` : ""}`;
    return <div className={`${compact ? "" : "mt-3 "}flex flex-wrap gap-2`}><StatusBadge>{creator}</StatusBadge><StatusBadge tone={meta.access === "PRIVATE" ? "neutral" : "brand"}>{access}</StatusBadge></div>;
}
