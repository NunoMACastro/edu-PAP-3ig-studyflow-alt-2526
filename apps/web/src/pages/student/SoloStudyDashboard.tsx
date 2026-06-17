/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { getSoloStudyState, SoloStudyState } from "../../lib/apiClient.js";

/**
 * Dashboard do modo individual sem turma obrigatória.
 *
 * @returns Painel inicial do aluno.
 */
export function SoloStudyDashboard() {
    const [state, setState] = useState<SoloStudyState | null>(null);

    useEffect(() => {
        void getSoloStudyState().then(setState);
    }, []);

    if (!state) {
        return <p className="text-sm text-slate-600">A carregar estudo...</p>;
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Olá, {state.studentName}</h1>
                <p className="mt-1 text-sm text-slate-600">
                    {state.hasClass ? `Turma: ${state.className}` : "Modo individual ativo"}
                </p>
            </div>
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
