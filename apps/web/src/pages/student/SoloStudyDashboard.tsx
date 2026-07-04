// apps/web/src/pages/student/SoloStudyDashboard.tsx
/**
 * Implementa uma página React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { MockupAlignmentPanel } from "../../features/mf8/mockup-alignment-panel.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient.js";

/**
 * Dashboard do modo individual sem turma obrigatória.
 *
 * @returns Painel inicial do aluno.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function load(): Promise<void> {
            const measurement = startPerformanceBudget("solo-study-dashboard");
            setLoading(true);
            setError(null);
            setPerformanceWarning(null);
            try {
                const nextState = await getSoloStudyState();
                if (active) setState(nextState);
            } catch (caught) {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Erro ao carregar estudo individual.",
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

        void load();
        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="space-y-6">
            <PageHeader
                title={state ? `Olá, ${state.studentName}` : "Estudo individual"}
                description={
                    state?.hasClass
                        ? `Turma: ${state.className}`
                        : "Modo individual ativo para organizar áreas, rotinas e materiais."
                }
                action={<a className="sf-button-primary" href="/app/areas">Criar área</a>}
            />

            {loading ? <p className="text-sm text-slate-600">A carregar estudo...</p> : null}
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {performanceWarning ? (
                <p className="sf-panel text-sm text-amber-900" role="status">
                    {performanceWarning}
                </p>
            ) : null}

            {state ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Áreas</p>
                        <p className="mt-2 text-3xl font-bold">{state.studyAreasCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Rotinas</p>
                        <p className="mt-2 text-3xl font-bold">{state.routinesCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-slate-500">Materiais</p>
                        <p className="mt-2 text-3xl font-bold">{state.materialsCount}</p>
                    </article>
                </div>
            ) : null}

            {state && state.studyAreasCount === 0 ? (
                <p className="sf-panel text-sm text-slate-600">
                    Ainda não há áreas de estudo. Cria a primeira área para juntar materiais e IA privada.
                </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
                <a className="sf-button-secondary" href="/app/rotinas">Organizar rotinas</a>
            </div>

            {/* A checklist fica no dashboard para ser fácil recolher evidence no fecho da PAP. */}
            <MockupAlignmentPanel />
        </section>
    );
}