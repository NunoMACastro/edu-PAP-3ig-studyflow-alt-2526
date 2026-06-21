// apps/web/src/pages/student/SoloStudyDashboard.tsx
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    getSoloStudyState,
    type SoloStudyState,
} from "../../lib/apiClient.js";

/**
 * Dashboard do modo individual do aluno.
 *
 * @returns Página inicial do aluno com estado, métricas e ações principais.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        /**
         * Carrega o resumo do aluno autenticado sem aceitar identificadores vindos da UI.
         */
        async function loadSoloStudyState(): Promise<void> {
            try {
                const nextState = await getSoloStudyState();

                if (isMounted) {
                    setState(nextState);
                    setError(null);
                }
            } catch (caught) {
                if (isMounted) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar o estudo.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // A API usa a sessão HttpOnly; a página não escolhe que aluno está a consultar.
        void loadSoloStudyState();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">A carregar o teu estudo...</p>;
    }

    if (error) {
        return (
            <section className="space-y-4">
                <PageHeader
                    title="Estudo"
                    description="Não foi possível carregar o resumo do teu estudo."
                />
                <p className="sf-error">{error}</p>
            </section>
        );
    }

    if (!state) {
        return (
            <section className="space-y-4">
                <PageHeader
                    title="Estudo"
                    description="Ainda não há dados de estudo para apresentar."
                />
                <p className="sf-panel text-sm text-slate-600">
                    Cria a primeira área de estudo para começares a organizar materiais e rotinas.
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <PageHeader
                title={`Olá, ${state.studentName}`}
                description={
                    state.hasClass && state.className
                        ? `Estás a estudar em modo individual e também associado à turma ${state.className}.`
                        : "Estás em modo individual, sem turma obrigatória."
                }
                action={
                    <a className="sf-button-primary" href="/app/areas">
                        Criar área
                    </a>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Áreas de estudo</p>
                    <p className="mt-2 text-3xl font-bold">{state.studyAreasCount}</p>
                </article>
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Rotinas ativas</p>
                    <p className="mt-2 text-3xl font-bold">{state.routinesCount}</p>
                </article>
                <article className="sf-panel">
                    <p className="text-sm text-slate-500">Materiais submetidos</p>
                    <p className="mt-2 text-3xl font-bold">{state.materialsCount}</p>
                </article>
            </div>

            <article className="sf-panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-semibold text-slate-950">Próxima ação sugerida</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Revê as tuas rotinas para manter continuidade no estudo.
                    </p>
                </div>
                {/* A ligação aponta para rota existente e não transporta dados sensíveis no URL. */}
                <a className="sf-button-secondary" href="/app/rotinas">
                    Rever rotinas
                </a>
            </article>
        </section>
    );
}