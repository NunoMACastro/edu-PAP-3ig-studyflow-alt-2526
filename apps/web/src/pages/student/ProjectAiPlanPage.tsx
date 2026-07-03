/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { createProjectAiPlan, ProjectAiPlan } from "../../lib/apiClient.js";

/**
 * Página para gerar plano gradual de projecto.
 */
export function ProjectAiPlanPage({ projectId }: { projectId: string }) {
    const [studentGoal, setStudentGoal] = useState("");
    const [plan, setPlan] = useState<ProjectAiPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            setPlan(await createProjectAiPlan(projectId, { studentGoal }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar plano.");
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Plano IA do projecto</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">
                    Objectivo
                    <textarea value={studentGoal} onChange={(event) => setStudentGoal(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={studentGoal.trim().length < 3}>
                    Gerar plano
                </button>
            </form>
            {plan ? (
                <article className="sf-panel">
                    <h2 className="font-semibold">Passos sugeridos</h2>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                        {plan.steps.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                    {plan.rationale ? <p className="mt-3 text-sm text-slate-600">{plan.rationale}</p> : null}
                </article>
            ) : null}
        </section>
    );
}
