/**
 * Apresenta um resumo factual e o registo docente append-only de uma turma.
 */
import { type FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    EmptyState,
    InlineNotice,
    SectionHeader,
    StatusBadge,
} from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import {
    createClassProgressNote,
    getTeacherClassSummary,
    type TeacherClassSummary,
} from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";

/**
 * Página docente de contexto e notas da turma, sem inferir progresso académico.
 *
 * @param props Identificador da turma validado pela rota protegida.
 * @returns Resumo factual, atalhos e registo cronológico da turma.
 */
export function TeacherClassProgressPage({ classId }: { classId: string }) {
    const [summary, setSummary] = useState<TeacherClassSummary | null>(null);
    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [difficultyTags, setDifficultyTags] = useState("");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [noteError, setNoteError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    useHashSidePanel("#criar-nota-progresso", setNoteOpen);

    useEffect(() => {
        setSummary(null);
        setStatus(null);
        void loadSummary();
    }, [classId]);

    /** Carrega apenas os factos e as notas autorizadas da turma atual. */
    async function loadSummary(): Promise<boolean> {
        try {
            setLoadError(null);
            setSummary(await getTeacherClassSummary(classId));
            return true;
        } catch (caught) {
            setLoadError(getErrorMessage(caught, "Erro ao carregar o resumo da turma."));
            return false;
        }
    }

    /** Regista uma nota append-only e atualiza o histórico sem desmontar a página. */
    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const normalizedTitle = title.trim();
        const normalizedNote = note.trim();
        if (!normalizedTitle || !normalizedNote) {
            setNoteError("Preenche o título e as observações da nota.");
            return;
        }

        setSaving(true);
        setNoteError(null);
        setStatus(null);
        try {
            await createClassProgressNote(classId, {
                title: normalizedTitle,
                note: normalizedNote,
                difficultyTags: difficultyTags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            });
            const refreshed = await loadSummary();
            if (!refreshed) {
                setNoteError("A nota foi guardada, mas não foi possível atualizar o registo.");
                return;
            }
            setTitle("");
            setNote("");
            setDifficultyTags("");
            setNoteOpen(false);
            setStatus("Nota guardada no registo docente.");
        } catch (caught) {
            setNoteError(getErrorMessage(caught, "Erro ao guardar a nota."));
        } finally {
            setSaving(false);
        }
    }

    const headerActions = (
        <div className="flex flex-wrap gap-2">
            <a
                className="sf-button-secondary"
                href={`/app/professor/acompanhamento?classId=${classId}`}
            >
                Centro de Acompanhamento
            </a>
            <button
                aria-expanded={noteOpen}
                className="sf-button-primary"
                disabled={!summary}
                onClick={() => {
                    setNoteError(null);
                    setNoteOpen(true);
                }}
                type="button"
            >
                Nova nota
            </button>
        </div>
    );

    return (
        <section className="space-y-7">
            <PageHeader
                action={headerActions}
                description={
                    summary
                        ? `${summary.className}: contexto existente e notas registadas pelo professor.`
                        : "Contexto existente e notas registadas pelo professor."
                }
                title="Resumo da turma"
            />

            {loadError ? (
                <InlineNotice role="alert" tone="danger">
                    <span>{loadError}</span>{" "}
                    <button className="underline" onClick={() => void loadSummary()} type="button">
                        Tentar novamente
                    </button>
                </InlineNotice>
            ) : null}
            {status ? <InlineNotice role="status">{status}</InlineNotice> : null}
            {!summary && !loadError ? <InlineNotice>A carregar resumo da turma...</InlineNotice> : null}

            {summary ? (
                <>
                    <section className="space-y-4" aria-label="Contexto da turma">
                        <SectionHeader
                            description="Contagens factuais já existentes, sem classificação de desempenho."
                            title="Contexto da turma"
                        />
                        <dl className="sf-surface grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <SummaryFact label="Alunos" value={summary.studentsCount} />
                            <SummaryFact label="Disciplinas" value={summary.subjectsCount} />
                            <SummaryFact label="Mini-testes publicados" value={summary.publishedTestsCount} />
                            <SummaryFact label="Publicações" value={summary.postCount} />
                            <SummaryFact label="Notas registadas" value={summary.noteCount} />
                        </dl>
                    </section>

                    <section className="space-y-4" aria-label="Ações da turma">
                        <SectionHeader
                            description="Abre os fluxos docentes já disponíveis para esta turma."
                            title="Ações da turma"
                        />
                        <nav className="flex flex-wrap gap-2" aria-label="Atalhos da turma">
                            <a className="sf-button-secondary" href={`/app/professor/turmas#students-${classId}`}>Gerir alunos</a>
                            <a className="sf-button-secondary" href={`/app/professor/turmas/${classId}/disciplinas`}>Disciplinas</a>
                            <a className="sf-button-secondary" href={`/app/professor/turmas/${classId}/publicacoes`}>Publicações</a>
                            <a className="sf-button-secondary" href={`/app/professor/acompanhamento?classId=${classId}`}>Centro de Acompanhamento</a>
                        </nav>
                    </section>

                    <section className="space-y-4" aria-label="Registo docente">
                        <SectionHeader
                            description="Observações append-only, apresentadas da mais recente para a mais antiga."
                            title="Registo docente"
                        />
                        {summary.notes.length === 0 ? (
                            <EmptyState
                                action={<button className="sf-button-primary" onClick={() => setNoteOpen(true)} type="button">Criar primeira nota</button>}
                                description="Regista uma observação quando existir contexto docente relevante."
                                title="Ainda não existem notas"
                            />
                        ) : (
                            <div className="space-y-3">
                                {summary.notes.map((item) => (
                                    <article className="sf-list-card space-y-3" key={item._id}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <h3 className="font-semibold">{item.title}</h3>
                                            {item.createdAt ? (
                                                <time className="text-sm text-studyflow-text/60" dateTime={item.createdAt}>
                                                    {formatDatePt(item.createdAt)}
                                                </time>
                                            ) : (
                                                <span className="text-sm text-studyflow-text/60">Data não disponível</span>
                                            )}
                                        </div>
                                        <p className="text-sm leading-6 text-studyflow-text/80">{item.note}</p>
                                        {item.difficultyTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2" aria-label="Etiquetas da nota">
                                                {item.difficultyTags.map((tag) => (
                                                    <StatusBadge key={`${item._id}-${tag}`} tone="neutral">{tag}</StatusBadge>
                                                ))}
                                            </div>
                                        ) : null}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            ) : null}

            <SidePanel
                closeDisabled={saving}
                description="Regista uma observação factual associada à turma."
                onClose={() => setNoteOpen(false)}
                open={noteOpen}
                title="Nova nota"
            >
                <form className="space-y-4" id="criar-nota-progresso" onSubmit={handleSubmit}>
                    {noteError ? <InlineNotice role="alert" tone="danger">{noteError}</InlineNotice> : null}
                    <label className="grid gap-2">
                        <span>Título da nota</span>
                        <input className="sf-input" maxLength={160} minLength={3} onChange={(event) => setTitle(event.target.value)} required value={title} />
                    </label>
                    <label className="grid gap-2">
                        <span>Observações</span>
                        <textarea className="sf-input min-h-28" maxLength={4000} minLength={5} onChange={(event) => setNote(event.target.value)} required value={note} />
                    </label>
                    <label className="grid gap-2">
                        <span>Etiquetas</span>
                        <input aria-describedby="progress-tags-help" className="sf-input" onChange={(event) => setDifficultyTags(event.target.value)} value={difficultyTags} />
                    </label>
                    <p className="text-xs text-studyflow-text/65" id="progress-tags-help">
                        Separa várias etiquetas por vírgulas.
                    </p>
                    <button className="sf-button-primary" disabled={saving} type="submit">
                        {saving ? "A guardar..." : "Guardar nota"}
                    </button>
                </form>
            </SidePanel>
        </section>
    );
}

/** Facto numérico simples, sem inferência de desempenho. */
function SummaryFact({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-0 border-b border-studyflow-border/10 pb-3 last:border-b-0 sm:border-b-0 sm:border-r sm:pr-4 sm:last:border-r-0">
            <dt className="text-sm text-studyflow-text/65">{label}</dt>
            <dd className="mt-1 text-2xl font-bold">{value}</dd>
        </div>
    );
}

/** Normaliza erros desconhecidos para feedback público curto. */
function getErrorMessage(caught: unknown, fallback: string): string {
    return caught instanceof Error ? caught.message : fallback;
}
