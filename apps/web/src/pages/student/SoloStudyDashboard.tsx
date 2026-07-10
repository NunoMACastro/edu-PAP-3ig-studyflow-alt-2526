/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
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

        /**
         * Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
         *
         * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
         */
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
            />

            {loading ? <p className="text-sm text-studyflow-text">A carregar estudo...</p> : null}
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {performanceWarning ? (
                <p className="sf-panel text-sm text-studyflow-alertText" role="status">
                    {performanceWarning}
                </p>
            ) : null}

            {state ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <article className="sf-panel">
                        <p className="text-sm text-studyflow-text">Áreas</p>
                        <p className="mt-2 text-3xl font-bold text-studyflow-brandText">{state.studyAreasCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-studyflow-text">Rotinas</p>
                        <p className="mt-2 text-3xl font-bold text-studyflow-brandText">{state.routinesCount}</p>
                    </article>
                    <article className="sf-panel">
                        <p className="text-sm text-studyflow-text">Materiais</p>
                        <p className="mt-2 text-3xl font-bold text-studyflow-brandText">{state.materialsCount}</p>
                    </article>
                </div>
            ) : null}

            {state && state.studyAreasCount === 0 ? (
                <p className="sf-panel text-sm text-studyflow-text">
                    Ainda não há áreas de estudo. Cria a primeira área para juntar materiais e IA privada.
                </p>
            ) : null}

        </section>
    );
}
