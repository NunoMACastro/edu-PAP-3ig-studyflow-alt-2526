/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState, InlineNotice, MetricStrip } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../../features/mf5/performance-budget.js";
import {
    getSoloStudyState,
    type SoloStudyState,
} from "../../lib/apiClient.js";

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
    const [reloadToken, setReloadToken] = useState(0);

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
    }, [reloadToken]);

    return (
        <section className="space-y-6">
            <PageHeader
                title={state ? `Olá, ${state.studentName}` : "Estudo individual"}
                description={
                    state?.officialClasses.length
                        ? `${state.officialClasses.length} ${state.officialClasses.length === 1 ? "turma oficial ativa" : "turmas oficiais ativas"} · estudo autónomo sempre disponível.`
                        : "Sem turma oficial. O modo autónomo continua disponível para áreas, rotinas e materiais."
                }
            />

            {loading ? <InlineNotice>A carregar estudo...</InlineNotice> : null}
            {error ? <div className="space-y-3"><p className="sf-error" role="alert">{error}</p><button className="sf-button-secondary" onClick={() => setReloadToken((value) => value + 1)} type="button">Tentar novamente</button></div> : null}
            {performanceWarning ? (
                <InlineNotice tone="attention">{performanceWarning}</InlineNotice>
            ) : null}

            {state ? (
                <Surface className="space-y-5" variant="subtle">
                    <MetricStrip
                        ariaLabel="Resumo do estudo individual"
                        items={[
                            { href: "/app/areas", label: "Áreas", value: state.studyAreasCount },
                            { href: "/app/rotinas", label: "Rotinas", value: state.routinesCount },
                            { href: "/app/areas", label: "Materiais", value: state.materialsCount },
                        ]}
                    />
                    <nav aria-label="Atalhos de estudo" className="flex flex-wrap gap-2">
                        <a className="sf-button-primary" href="/app/areas">Áreas de estudo</a>
                        <a className="sf-button-secondary" href="/app/rotinas">Rotinas</a>
                        <a className="sf-button-secondary" href="/app/historico">Histórico</a>
                        <a className="sf-button-secondary" href="/app/turmas">Turmas oficiais</a>
                    </nav>
                </Surface>
            ) : null}

            {state && state.officialClasses.length > 0 ? (
                <Surface className="space-y-3" variant="subtle">
                    <h2 className="font-semibold">Turmas oficiais</h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {state.officialClasses.map((schoolClass) => (
                            <a
                                className="sf-list-card"
                                href={`/app/turmas/${schoolClass._id}/disciplinas`}
                                key={schoolClass._id}
                            >
                                <strong className="block">{schoolClass.name}</strong>
                                <span className="text-sm text-studyflow-text/70">
                                    {schoolClass.code} · {schoolClass.schoolYear}
                                </span>
                            </a>
                        ))}
                    </div>
                </Surface>
            ) : null}

            {state && state.studyAreasCount === 0 ? (
                <EmptyState
                    action={<a className="sf-button-primary" href="/app/areas#criar-area">Criar primeira área</a>}
                    description="Cria a primeira área para juntar materiais e IA privada."
                    icon="folder"
                    title="Ainda não há áreas de estudo"
                />
            ) : null}

        </section>
    );
}
