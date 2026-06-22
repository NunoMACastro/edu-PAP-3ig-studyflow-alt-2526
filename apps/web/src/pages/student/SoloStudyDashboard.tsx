// apps/web/src/pages/student/SoloStudyDashboard.tsx
import { useEffect, useState } from "react";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    PerformanceBudgetResult,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";

const SOLO_STUDY_MEASURE = "solo-study-dashboard";

/**
 * Dashboard do modo individual sem turma obrigatória.
 *
 * @returns Painel inicial do aluno com estados de carregamento, erro e performance.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [performanceResult, setPerformanceResult] =
        useState<PerformanceBudgetResult | null>(null);

    useEffect(() => {
        let active = true;

        startPerformanceBudget(SOLO_STUDY_MEASURE);

        async function loadDashboard(): Promise<void> {
            try {
                const nextState = await getSoloStudyState();
                if (!active) return;
                // O dashboard só guarda o resumo público devolvido pela API autenticada.
                setState(nextState);
                setError(null);
            } catch (caught: unknown) {
                if (!active) return;
                setError(caught instanceof Error ? caught.message : "Não foi possível carregar o estudo.");
            } finally {
                if (!active) return;
                setPerformanceResult(finishPerformanceBudget(SOLO_STUDY_MEASURE));
                setLoading(false);
            }
        }

        void loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar estudo...</p>;
    }

    if (error) {
        return (
            <section className="sf-panel space-y-2" role="alert">
                <h1 className="text-xl font-bold">Não foi possível abrir o estudo</h1>
                <p className="text-sm text-red-700">{error}</p>
            </section>
        );
    }

    if (!state) {
        return (
            <section className="sf-panel" role="status">
                <p className="text-sm text-slate-600">Ainda não existem dados de estudo para apresentar.</p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Olá, {state.studentName}</h1>
                <p className="mt-1 text-sm text-slate-600">
                    {state.hasClass ? `Turma: ${state.className}` : "Modo individual ativo"}
                </p>
            </div>

            {performanceResult?.exceeded ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                    {formatPerformanceBudgetMessage(performanceResult)}
                </p>
            ) : null}

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

            <div className="flex flex-wrap gap-3">
                <a className="sf-button-primary" href="/app/areas">Criar área</a>
                <a className="sf-button-secondary" href="/app/rotinas">Organizar rotinas</a>
            </div>
        </section>
    );
}