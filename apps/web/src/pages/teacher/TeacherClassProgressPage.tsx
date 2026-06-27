/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    ClassProgress,
    createClassProgressNote,
    getClassProgress,
} from "../../lib/apiClient.js";

/**
 * Página docente com métricas agregadas da turma.
 */
export function TeacherClassProgressPage({ classId }: { classId: string }) {
    const [progress, setProgress] = useState<ClassProgress | null>(null);
    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [difficultyTags, setDifficultyTags] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        void loadProgress();
    }, [classId]);

    if (error) return <p className="sf-error">{error}</p>;
    if (!progress) return <p className="sf-panel text-sm text-slate-600">A carregar acompanhamento...</p>;

    /**
     * Carrega teacher no formato necessário ao próximo passo do fluxo.
     * @returns Entidade de teacher já filtrada pelo contexto recebido.
     */
    async function loadProgress() {
        try {
            setError(null);
            setProgress(await getClassProgress(classId));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao carregar acompanhamento.",
            );
        }
    }

    /**
     * Trata a interação do utilizador em teacher, sincronizando formulário, estado e pedido à API.
     *
     * @param event Evento da interface que dispara submissão ou atualização de estado.
     * @returns Valor de teacher no contrato esperado pelo chamador.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        try {
            await createClassProgressNote(classId, {
                title,
                note,
                difficultyTags: difficultyTags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            });
            setTitle("");
            setNote("");
            setDifficultyTags("");
            await loadProgress();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao guardar nota de acompanhamento.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Acompanhamento da turma</h1>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Alunos" value={progress.studentsCount} />
                <Metric label="Disciplinas" value={progress.subjectsCount} />
                <Metric label="Testes publicados" value={progress.publishedTestsCount} />
                <Metric label="Conteúdos aprovados" value={progress.approvedAiContentCount} />
            </div>
            <div className="sf-panel space-y-2">
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Progresso de aprendizagem: ainda sem dados de submissões ou resultados nesta macrofase.
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-slate-600">Sinais de acompanhamento</p>
                        <p className="text-2xl font-bold">{progress.activityCoveragePercent}%</p>
                        <p className="text-xs text-slate-500">
                            {progress.activitySignalTotal} sinais registados
                        </p>
                    </div>
                    <p className="text-sm text-slate-600">
                        {progress.postCount} publicações · {progress.noteCount} notas
                    </p>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-200">
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${progress.activityCoveragePercent}%` }}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {progress.difficultyTags.map((tag) => (
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700" key={tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <form className="sf-panel space-y-3" onSubmit={handleSubmit}>
                <h2 className="font-semibold">Nota de acompanhamento</h2>
                <input
                    className="sf-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Título"
                    required
                />
                <textarea
                    className="sf-input min-h-28"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Observações"
                    required
                />
                <input
                    className="sf-input"
                    value={difficultyTags}
                    onChange={(event) => setDifficultyTags(event.target.value)}
                    placeholder="Dificuldades separadas por vírgulas"
                />
                <button className="sf-button-primary" disabled={saving} type="submit">
                    {saving ? "A guardar..." : "Guardar nota"}
                </button>
            </form>

            <div className="space-y-3">
                {progress.notes.map((item) => (
                    <article className="sf-panel" key={item._id}>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-700">{item.note}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {item.difficultyTags.map((tag) => (
                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700" key={tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
            {(progress.gaps ?? []).map((gap) => (
                <p className="sf-panel text-sm text-slate-600" key={gap}>{gap}</p>
            ))}
        </section>
    );
}

/**
 * Executa a operação metric no domínio de teacher com contrato explícito.
 * @returns Valor de teacher no contrato esperado pelo chamador.
 */
function Metric({ label, value }: { label: string; value: number }) {
    return (
        <article className="sf-panel">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </article>
    );
}
