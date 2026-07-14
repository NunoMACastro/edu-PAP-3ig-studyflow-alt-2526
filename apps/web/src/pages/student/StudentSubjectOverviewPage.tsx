/** Visão geral canónica de disciplina sem dados internos do professor. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import {
    Breadcrumbs,
    PrimaryActionCard,
    WorkspaceTabs,
} from "../../components/student/StudentWorkspace.js";
import { InlineNotice, MetricStrip, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    getStudentSubjectOverview,
    rememberStudentContext,
    type StudentSubjectOverview,
} from "../../lib/apiClient.js";

export function StudentSubjectOverviewPage({ subjectId }: { subjectId: string }) {
    const [overview, setOverview] = useState<StudentSubjectOverview | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let active = true;
        getStudentSubjectOverview(subjectId)
            .then((value) => {
                if (!active) return;
                setOverview(value);
                void rememberStudentContext({ kind: "SUBJECT", contextId: subjectId }).catch(() => undefined);
            })
            .catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível abrir a disciplina."));
        return () => { active = false; };
    }, [subjectId]);
    if (error) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (!overview) return <InlineNotice>A carregar disciplina...</InlineNotice>;
    const base = `/app/disciplinas/${subjectId}`;
    return (
        <section className="space-y-6">
            <Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, { label: overview.subject.className, href: `/app/turmas/${overview.subject.classId}/disciplinas` }, { label: overview.subject.name }]} />
            <PageHeader action={overview.readOnly ? <StatusBadge>Consulta</StatusBadge> : undefined} title={overview.subject.name} description={overview.subject.description ?? `${overview.subject.code} · ${overview.subject.className}`} />
            <WorkspaceTabs items={[{ label: "Visão geral", href: base, active: true }, { label: "Materiais", href: `${base}/materiais`, active: false }, { label: "Praticar", href: `${base}/praticar`, active: false }, { label: "Conversar", href: `${base}/chat`, active: false }]} />
            <MetricStrip ariaLabel="Resumo da disciplina" items={[{ label: "Materiais", value: overview.counts.materials }, { label: "Testes", value: overview.counts.tests }, { label: "Conteúdos", value: overview.counts.approvedContent }, { label: "Mensagens novas", value: overview.counts.unreadChat }]} />
            <div className="grid gap-4 lg:grid-cols-2">
                {overview.recentMaterial ? <PrimaryActionCard actionLabel="Estudar material" href={`${base}/materiais/${overview.recentMaterial._id}`} icon="file" title={overview.recentMaterial.title} description="Material recente da disciplina" /> : <PrimaryActionCard actionLabel="Ver materiais" href={`${base}/materiais`} icon="file" title="Materiais" description="Consulta os materiais publicados pelo professor." />}
                {overview.nextTest ? <PrimaryActionCard actionLabel="Praticar" href={`${base}/praticar`} icon="clipboard" title={overview.nextTest.title} description="Mini-teste disponível" /> : <PrimaryActionCard actionLabel="Abrir Assistente" href={`${base}/ia`} icon="spark" title="Assistente de estudo" description="Estuda com as fontes autorizadas desta disciplina." />}
            </div>
            {overview.counts.approvedContent > 0 ? <Link className="sf-button-secondary inline-flex" to={`${base}/conteudos-aprovados`}>Ver conteúdos aprovados ({overview.counts.approvedContent})</Link> : null}
            {overview.counts.unreadChat > 0 ? <Link className="sf-button-secondary inline-flex" to={`${base}/chat`}>Ler mensagens novas ({overview.counts.unreadChat})</Link> : null}
            <Link className="sf-button-secondary inline-flex" to={`/app/turmas/${overview.subject.classId}/disciplinas`}>Voltar à turma</Link>
        </section>
    );
}
