/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { createProjectAiPlan, ProjectAiPlan } from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

/**
 * Página para gerar plano gradual de projecto.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function ProjectAiPlanPage({ projectId }: { projectId: string }) {
    const [studentGoal, setStudentGoal] = useState("");
    const [plan, setPlan] = useState<ProjectAiPlan | null>(null);
    const generateAction = useAsyncAction();

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const created = await generateAction.run(
            "generate-plan",
            () => createProjectAiPlan(projectId, { studentGoal }),
            "Erro ao criar plano.",
        );
        if (created) setPlan(created);
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Plano IA do projecto</h1>
                {generateAction.error ? <p className="sf-error" role="alert">{generateAction.error}</p> : null}
                <label className="block">
                    Objectivo
                    <textarea value={studentGoal} onChange={(event) => setStudentGoal(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={studentGoal.trim().length < 3 || generateAction.isPending}>
                    {generateAction.isPending ? "A gerar..." : "Gerar plano"}
                </button>
            </form>
            {plan ? (
                <article className="sf-panel">
                    <h2 className="font-semibold">Passos sugeridos</h2>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-studyflow-text">
                        {plan.steps.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                    {plan.rationale ? <p className="mt-3 text-sm text-studyflow-text">{plan.rationale}</p> : null}
                </article>
            ) : null}
        </section>
    );
}
