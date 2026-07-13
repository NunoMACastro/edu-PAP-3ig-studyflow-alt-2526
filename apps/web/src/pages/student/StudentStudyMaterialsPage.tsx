/** Arquivo privado transversal dos materiais criados no Assistente. */
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.js";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel.js";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel.js";
import { QuizPanel } from "../../components/ai/QuizPanel.js";
import { SummaryPanel } from "../../components/ai/SummaryPanel.js";
import { Breadcrumbs } from "../../components/student/StudentWorkspace.js";
import {
    EmptyState,
    InlineNotice,
    SectionHeader,
    StatusBadge,
    Toolbar,
} from "../../components/ui/CalmUi.js";
import {
    deleteStudentStudyMaterial,
    exportStudentStudyMaterial,
    getStudentStudyMaterial,
    listStudentStudyMaterials,
    submitStudentStudyMaterialQuizAttempt,
    type AiArtifact,
    type ArtifactExportFile,
    type ArtifactExportFormat,
    type StudentAssistantArtifact,
    type StudentAssistantArtifactType,
    type StudentStudyMaterialDetail,
    type StudentStudyMaterialTargetKind,
} from "../../lib/apiClient.js";

export function StudentStudyMaterialsPage({
    targetKind,
    targetId,
}: {
    targetKind?: StudentStudyMaterialTargetKind;
    targetId?: string;
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = (searchParams.get("tipo") || undefined) as
        | StudentAssistantArtifactType
        | undefined;
    const state = searchParams.get("estado") === "arquivo"
        ? "READ_ONLY_ARCHIVED" as const
        : undefined;
    const [items, setItems] = useState<StudentAssistantArtifact[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentStudyMaterials({ targetKind, targetId, type, state, limit: 20 })
            .then((page) => {
                if (!active) return;
                setItems(page.items);
                setNextCursor(page.nextCursor);
            })
            .catch((caught) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível carregar os materiais.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [state, targetId, targetKind, type]);

    async function loadMore(): Promise<void> {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        setError(null);
        try {
            const page = await listStudentStudyMaterials({
                targetKind,
                targetId,
                type,
                state,
                cursor: nextCursor,
                limit: 20,
            });
            setItems((current) => [
                ...current,
                ...page.items.filter(
                    (item) => !current.some((existing) => existing.id === item.id),
                ),
            ]);
            setNextCursor(page.nextCursor);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar mais materiais.",
            );
        } finally {
            setLoadingMore(false);
        }
    }

    function updateFilter(key: "tipo" | "estado", value: string): void {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next, { replace: true });
    }

    const scopedLabel = targetKind && targetId ? items[0]?.target.label : undefined;
    return (
        <section className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Estudar", href: "/app/estudar" },
                    { label: scopedLabel ?? "Materiais de estudo" },
                ]}
            />
            <PageHeader
                description="Resumos, explicações, flashcards e quizzes privados criados a partir das tuas conversas."
                title={scopedLabel ? `Materiais — ${scopedLabel}` : "Materiais de estudo"}
            />
            <InlineNotice>
                Estes materiais são privados. A disciplina, turma ou área indicada serve
                apenas para os organizar na tua conta.
            </InlineNotice>
            <Toolbar ariaLabel="Filtros de materiais">
                <label className="min-w-48 text-sm font-semibold" htmlFor="study-material-type">
                    Tipo
                    <select
                        className="mt-1 block w-full"
                        id="study-material-type"
                        onChange={(event) => updateFilter("tipo", event.target.value)}
                        value={type ?? ""}
                    >
                        <option value="">Todos</option>
                        <option value="SUMMARY">Resumos</option>
                        <option value="EXPLANATION">Explicações</option>
                        <option value="FLASHCARDS">Flashcards</option>
                        <option value="QUIZ">Quizzes</option>
                    </select>
                </label>
                <label className="min-w-48 text-sm font-semibold" htmlFor="study-material-state">
                    Estado do contexto
                    <select
                        className="mt-1 block w-full"
                        id="study-material-state"
                        onChange={(event) => updateFilter("estado", event.target.value)}
                        value={state ? "arquivo" : ""}
                    >
                        <option value="">Ativos e em arquivo</option>
                        <option value="arquivo">Só em arquivo</option>
                    </select>
                </label>
            </Toolbar>

            {loading ? <InlineNotice>A carregar materiais…</InlineNotice> : null}
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
            {!loading && !error && items.length === 0 ? (
                <EmptyState
                    action={<Link className="sf-button-primary" to="/app/assistente">Abrir Assistente</Link>}
                    description="Cria um material a partir de uma conversa com pelo menos uma resposta."
                    icon="spark"
                    title="Ainda não há materiais neste arquivo"
                />
            ) : null}
            {items.length ? (
                <section className="space-y-4" aria-label="Materiais privados">
                    <SectionHeader title={`${items.length} material(is) nesta página`} />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <article className="sf-list-card" key={item.id}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge tone="brand">{artifactTypeLabel(item.type)}</StatusBadge>
                                    {item.target.state === "READ_ONLY_ARCHIVED" ? (
                                        <StatusBadge tone="attention">Em arquivo</StatusBadge>
                                    ) : null}
                                </div>
                                <h2 className="mt-3 break-words text-lg font-semibold">{item.title}</h2>
                                <p className="mt-2 text-sm text-studyflow-text/65">
                                    {item.target.label} · {targetKindLabel(item.target.kind)}
                                </p>
                                <p className="mt-1 text-xs text-studyflow-text/60">
                                    {new Date(item.createdAt).toLocaleString("pt-PT")}
                                </p>
                                <Link className="sf-button-primary mt-4 inline-flex" to={item.targetPath}>
                                    Abrir material
                                </Link>
                            </article>
                        ))}
                    </div>
                    {nextCursor ? (
                        <button
                            className="sf-button-secondary"
                            disabled={loadingMore}
                            onClick={() => void loadMore()}
                            type="button"
                        >
                            {loadingMore ? "A carregar…" : "Mostrar mais"}
                        </button>
                    ) : null}
                </section>
            ) : null}
        </section>
    );
}

export function StudentStudyMaterialDetailPage({ artifactId }: { artifactId: string }) {
    const navigate = useNavigate();
    const [material, setMaterial] = useState<StudentStudyMaterialDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState<ArtifactExportFormat | null>(null);
    const [exportMessage, setExportMessage] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getStudentStudyMaterial(artifactId)
            .then((next) => {
                if (active) setMaterial(next);
            })
            .catch((caught) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível abrir o material.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [artifactId]);

    async function remove(): Promise<void> {
        if (deleting) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteStudentStudyMaterial(artifactId);
            navigate("/app/estudar/materiais", { replace: true });
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível apagar o material.",
            );
            setDeleting(false);
        }
    }

    async function exportMaterial(format: ArtifactExportFormat): Promise<void> {
        setExporting(format);
        setExportMessage(null);
        setError(null);
        try {
            const file = await exportStudentStudyMaterial(artifactId, format);
            if (format === "pdf") {
                openPrintableArtifact(file);
                setExportMessage("Documento preparado para guardar como PDF.");
            } else {
                downloadArtifactFile(file);
                setExportMessage("Markdown exportado com sucesso.");
            }
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Não foi possível exportar o material.",
            );
        } finally {
            setExporting(null);
        }
    }

    if (loading) return <InlineNotice>A carregar material…</InlineNotice>;
    if (!material) return <InlineNotice tone="danger">{error ?? "Material indisponível."}</InlineNotice>;
    const artifact: AiArtifact = {
        _id: material.id,
        type: material.type,
        contentJson: material.content,
        sourcesJson: material.sources,
        createdAt: material.createdAt,
    };
    return (
        <section className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Estudar", href: "/app/estudar" },
                    { label: "Materiais de estudo", href: "/app/estudar/materiais" },
                    { label: material.title },
                ]}
            />
            <PageHeader
                action={
                    <button
                        className="sf-button-secondary text-studyflow-alertText"
                        onClick={() => setConfirmDelete(true)}
                        type="button"
                    >
                        Apagar
                    </button>
                }
                description={`${material.target.label} · ${targetKindLabel(material.target.kind)}`}
                title={material.title}
            />
            <div className="flex flex-wrap gap-2">
                <StatusBadge tone="brand">{artifactTypeLabel(material.type)}</StatusBadge>
                <StatusBadge>
                    {material.provenance.groundingMode === "CHAT_ONLY"
                        ? "Apenas conversa"
                        : "Conversa e fontes"}
                </StatusBadge>
                {material.target.state === "READ_ONLY_ARCHIVED" ? (
                    <StatusBadge tone="attention">Contexto em arquivo</StatusBadge>
                ) : null}
            </div>
            {material.target.state === "READ_ONLY_ARCHIVED" ? (
                <InlineNotice tone="attention">
                    O contexto terminou. Podes consultar e exportar esta cópia privada,
                    mas não iniciar novas tentativas de quiz.
                </InlineNotice>
            ) : null}
            {material.target.contextPath ? (
                <Link className="sf-button-secondary inline-flex" to={material.target.contextPath}>
                    Abrir {targetKindLabel(material.target.kind).toLocaleLowerCase("pt-PT")}
                </Link>
            ) : null}
            {confirmDelete ? (
                <InlineNotice tone="danger">
                    <p>Apagar definitivamente este material privado e as tentativas associadas?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            className="sf-button-primary"
                            disabled={deleting}
                            onClick={() => void remove()}
                            type="button"
                        >
                            {deleting ? "A apagar…" : "Confirmar eliminação"}
                        </button>
                        <button
                            className="sf-button-secondary"
                            disabled={deleting}
                            onClick={() => setConfirmDelete(false)}
                            type="button"
                        >
                            Cancelar
                        </button>
                    </div>
                </InlineNotice>
            ) : null}
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}

            {material.capabilities.canExport ? (
                <section className="sf-surface space-y-3" aria-label="Exportar material">
                    <SectionHeader title="Exportar" />
                    <div className="flex flex-wrap gap-2">
                        <button
                            className="sf-button-secondary"
                            disabled={Boolean(exporting)}
                            onClick={() => void exportMaterial("md")}
                            type="button"
                        >
                            {exporting === "md" ? "A exportar…" : "Exportar MD"}
                        </button>
                        <button
                            className="sf-button-secondary"
                            disabled={Boolean(exporting)}
                            onClick={() => void exportMaterial("pdf")}
                            type="button"
                        >
                            {exporting === "pdf" ? "A preparar…" : "Preparar PDF"}
                        </button>
                    </div>
                    {exportMessage ? <p className="text-sm text-studyflow-brandText">{exportMessage}</p> : null}
                </section>
            ) : null}

            {material.type === "SUMMARY" ? <SummaryPanel artifact={artifact} /> : null}
            {material.type === "EXPLANATION" ? <ExplanationPanel artifact={artifact} /> : null}
            {material.type === "FLASHCARDS" ? <FlashcardsPanel artifact={artifact} /> : null}
            {material.type === "QUIZ" ? (
                <QuizPanel
                    artifact={artifact}
                    canAttempt={material.capabilities.canAttempt}
                    submitAnswers={(answers) =>
                        submitStudentStudyMaterialQuizAttempt(material.id, answers)
                    }
                />
            ) : null}

            <section className="sf-surface space-y-2" aria-label="Origem do material">
                <SectionHeader title="Origem" />
                <p className="text-sm leading-6 text-studyflow-text/65">
                    Snapshot de {new Date(material.provenance.snapshotAt).toLocaleString("pt-PT")};
                    {` ${material.provenance.usedTurnCount} de ${material.provenance.snapshotTurnCount} turno(s)`}
                    {` e ${material.provenance.usedSourceCount} de ${material.provenance.candidateSourceCount} fonte(s) usados.`}
                </p>
            </section>
        </section>
    );
}

function artifactTypeLabel(type: StudentAssistantArtifactType): string {
    if (type === "SUMMARY") return "Resumo";
    if (type === "EXPLANATION") return "Explicação";
    if (type === "FLASHCARDS") return "Flashcards";
    return "Quiz";
}

function targetKindLabel(kind: StudentStudyMaterialTargetKind): string {
    if (kind === "SUBJECT") return "Disciplina";
    if (kind === "CLASS") return "Turma";
    return "Estudo pessoal";
}

function downloadArtifactFile(file: ArtifactExportFile): void {
    const blob = new Blob([file.body], { type: file.contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function openPrintableArtifact(file: ArtifactExportFile): void {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
        downloadArtifactFile(file);
        return;
    }
    printWindow.document.open();
    printWindow.document.write(file.body);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 350);
}
