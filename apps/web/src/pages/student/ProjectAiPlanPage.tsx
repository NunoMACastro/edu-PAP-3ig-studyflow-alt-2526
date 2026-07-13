/** Planos IA privados de um projeto oficial, com voz docente e histórico. */
import { type FormEvent, useEffect, useState } from "react";
import { AiConsentGate } from "../../components/ai/AiConsentGate.js";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState, InlineNotice, SectionHeader, StatusBadge } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import { Breadcrumbs } from "../../components/student/StudentWorkspace.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    createProjectAiPlan,
    getStudentClassProject,
    listProjectAiPlans,
    type ProjectAiPlan,
    type StudentClassProject,
} from "../../lib/apiClient.js";

export function ProjectAiPlanPage({ projectId }: { projectId: string }) {
    const [studentGoal, setStudentGoal] = useState("");
    const [plans, setPlans] = useState<ProjectAiPlan[]>([]);
    const [project, setProject] = useState<StudentClassProject | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const generateAction = useAsyncAction();

    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError(null);
        Promise.all([getStudentClassProject(projectId), listProjectAiPlans(projectId, { limit: 20 })])
            .then(([nextProject, page]) => {
                if (!active) return;
                setProject(nextProject);
                setPlans(page.items);
                setNextCursor(page.nextCursor);
            })
            .catch((caught) => {
                if (active) setLoadError(caught instanceof Error ? caught.message : "Erro ao carregar planos.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [projectId, reloadToken]);

    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const created = await generateAction.run(
            "generate-plan",
            () => createProjectAiPlan(projectId, { studentGoal }),
            "Erro ao criar plano.",
        );
        if (created) {
            setPlans((current) => [created, ...current]);
            setStudentGoal("");
        }
    }

    async function loadMore(): Promise<void> {
        if (!nextCursor) return;
        setLoadingMore(true);
        setLoadError(null);
        try {
            const page = await listProjectAiPlans(projectId, { cursor: nextCursor, limit: 20 });
            setPlans((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
        } catch (caught) {
            setLoadError(caught instanceof Error ? caught.message : "Erro ao carregar mais planos.");
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <section className="space-y-6">
            <Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, ...(project ? [{ label: "Projetos", href: `/app/turmas/${project.classId}/projectos` }, { label: project.title }] : [{ label: "Projeto" }])]} />
            <PageHeader description={project ? `${project.brief}${project.dueDate ? ` · prazo ${new Date(project.dueDate).toLocaleDateString("pt-PT")}` : ""}` : "Transforma o teu objetivo num percurso gradual para desenvolver o projeto."} title={project?.title ?? "Plano IA do projeto"} />
            {!project?.readOnly ? <AiConsentGate description="Aceita o tratamento PROJECT_AI para gerar planos de projeto." purpose="PROJECT_AI">
                <Surface as="form" className="max-w-4xl space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                    <SectionHeader title="Definir objetivo" />
                    {generateAction.error ? <p className="sf-error" role="alert">{generateAction.error}</p> : null}
                    <FormField id="project-ai-goal" label="Objetivo">
                        <textarea value={studentGoal} onChange={(event) => setStudentGoal(event.target.value)} />
                    </FormField>
                    <button className="sf-button-primary" disabled={studentGoal.trim().length < 3 || generateAction.isPending}>{generateAction.isPending ? "A gerar..." : "Gerar plano"}</button>
                </Surface>
            </AiConsentGate> : <InlineNotice>Este projeto está disponível apenas para consulta histórica.</InlineNotice>}

            <section className="space-y-4">
                <SectionHeader description="Histórico privado dos teus próprios planos." title="Planos anteriores" />
                {loading ? <InlineNotice>A carregar planos...</InlineNotice> : null}
                {loadError ? <div className="space-y-3"><InlineNotice tone="danger">{loadError}</InlineNotice><button className="sf-button-secondary" onClick={() => setReloadToken((value) => value + 1)} type="button">Tentar novamente</button></div> : null}
                {!loading && !loadError && plans.length === 0 ? <EmptyState title="Ainda não criaste planos para este projeto" /> : null}
                {plans.map((plan) => (
                    <Surface as="article" className="space-y-3" key={plan._id} variant="subtle">
                        <p><strong>Objetivo:</strong> {plan.studentGoal}</p>
                        <ol className="list-decimal space-y-2 pl-5 text-sm">{plan.steps.map((step, index) => <li key={`${plan._id}-${index}`}>{step}</li>)}</ol>
                        {plan.rationale ? <p className="text-sm">{plan.rationale}</p> : null}
                        {plan.teacherVoiceApplied ? <StatusBadge tone="brand">Plano com voz definida pelo professor</StatusBadge> : null}
                    </Surface>
                ))}
                {nextCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar mais"}</button> : null}
            </section>
        </section>
    );
}
