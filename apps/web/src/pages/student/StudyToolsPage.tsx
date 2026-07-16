/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel.js";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel.js";
import { QuizPanel } from "../../components/ai/QuizPanel.js";
import { SummaryPanel } from "../../components/ai/SummaryPanel.js";
import { FormField } from "../../components/forms/FormField.js";
import { StudyAreaWorkspaceHeader } from "../../components/student/StudyAreaWorkspaceHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { usePollingTask } from "../../hooks/usePollingTask.js";
import {
    type ArtifactExportFile,
    type ArtifactExportFormat,
    createAiArtifactGenerationJob,
    exportStudyToolArtifact,
    getAiArtifactGenerationJob,
    listStudyTools,
    listSummaries,
    type AiArtifact,
    type AiArtifactGenerationJob,
    type StudyToolType,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudyToolsPageProps = {
    studyAreaId: string;
};

/**
 * Página de resumos e ferramentas IA da área.
 *
 * @param props Identificador da área.
 * @returns Controlos de geração e resultado.
 */
export function StudyToolsPage({ studyAreaId }: StudyToolsPageProps) {
    const preferredArtifactId = new URLSearchParams(window.location.search).get(
        "artefacto",
    ) ?? undefined;
    const resultRef = useRef<HTMLDivElement | null>(null);
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [summaries, setSummaries] = useState<AiArtifact[]>([]);
    const [studyTools, setStudyTools] = useState<AiArtifact[]>([]);
    const [artifactJob, setArtifactJob] =
        useState<AiArtifactGenerationJob | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [pollingError, setPollingError] = useState<string | null>(null);
    const [isLoadingExisting, setIsLoadingExisting] = useState(true);
    const generationAction = useAsyncAction();
    const isGeneratingSummary = generationAction.pendingKey === "generate-summary";
    const isGeneratingTool = generationAction.pendingKey === "generate-tool";

    /**
     * Recarrega artefactos IA já persistidos para a área.
     *
     * @param preferredArtifactId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refreshArtifacts(preferredArtifactId?: string): Promise<void> {
        setIsLoadingExisting(true);
        try {
            const [summaryList, toolList] = await Promise.all([
                listSummaries(studyAreaId),
                listStudyTools(studyAreaId),
            ]);
            setSummaries(summaryList);
            setStudyTools(toolList);
            setLoadError(null);
            const preferredExists = preferredArtifactId
                ? [...summaryList, ...toolList].some(
                      (item) => item._id === preferredArtifactId,
                  )
                : false;
            setArtifact((current) => {
                const allArtifacts = [...summaryList, ...toolList];
                if (preferredArtifactId) {
                    const preferred = allArtifacts.find(
                        (item) => item._id === preferredArtifactId,
                    );
                    if (preferred) return preferred;
                }
                const currentStillExists = allArtifacts.find(
                    (item) => item._id === current?._id,
                );
                return currentStillExists ?? summaryList[0] ?? toolList[0] ?? null;
            });
            if (preferredExists) {
                window.requestAnimationFrame(() => {
                    resultRef.current?.scrollIntoView({ block: "start" });
                    resultRef.current?.focus({ preventScroll: true });
                });
            }
        } catch (caught) {
            setLoadError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar artefactos.",
            );
        } finally {
            setIsLoadingExisting(false);
        }
    }

    useEffect(() => {
        void refreshArtifacts(preferredArtifactId);
    }, [studyAreaId, preferredArtifactId]);

    const isArtifactPolling = Boolean(
        artifactJob && ["QUEUED", "PROCESSING"].includes(artifactJob.status),
    );
    usePollingTask(
        async (signal) => {
            if (!artifactJob) return;
            try {
                const nextJob = await getAiArtifactGenerationJob(
                    studyAreaId,
                    artifactJob._id,
                    signal,
                );
                setArtifactJob((current) =>
                    current && !canAdvanceArtifactJob(current.status, nextJob.status)
                        ? current
                        : nextJob,
                );
                if (nextJob.status === "DONE" && nextJob.artifactId) {
                    await refreshArtifacts(nextJob.artifactId);
                }
            } catch (caught) {
                if (signal.aborted) return;
                // A UI não mostra detalhes técnicos que possam revelar fontes privadas ou prompts.
                setPollingError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível atualizar o estado do material.",
                );
            }
        },
        { enabled: isArtifactPolling, intervalMs: 1500 },
    );

    /**
     * Gera um resumo para a área.
     *
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleSummary(): Promise<void> {
        setPollingError(null);
        await generationAction.run("generate-summary", async () => {
            const createdJob = await createAiArtifactGenerationJob(studyAreaId, {
                type: "SUMMARY",
            });
            setArtifact(null);
            setArtifactJob(createdJob);
        }, "Não foi possível gerar.");
    }

    /**
     * Gera a ferramenta de estudo escolhida.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleTool(event: FormEvent): Promise<void> {
        event.preventDefault();
        setPollingError(null);
        await generationAction.run("generate-tool", async () => {
            const normalizedTopic = topic.trim();
            const createdJob = await createAiArtifactGenerationJob(studyAreaId, {
                type,
                topic: normalizedTopic || undefined,
            });
            setArtifact(null);
            setArtifactJob(createdJob);
        }, "Não foi possível gerar.");
    }

    const isArtifactJobActive =
        artifactJob?.status === "QUEUED" ||
        artifactJob?.status === "PROCESSING";
    const isGenerating =
        isGeneratingSummary || isGeneratingTool || isArtifactJobActive;
    const hasArtifacts = summaries.length > 0 || studyTools.length > 0;

    return (
        <section className="space-y-6">
            <StudyAreaWorkspaceHeader active="practice" studyAreaId={studyAreaId} />
            <Surface as="section" className="space-y-4">
                <SectionHeader description="Escolhe o tipo de apoio e um tópico opcional para orientar a geração." title="Gerar conteúdo de estudo" />
                {generationAction.error ?? pollingError ? (
                    <p className="sf-error" role="alert">
                        {generationAction.error ?? pollingError}
                    </p>
                ) : null}
                {isGenerating ? (
                    <InlineNotice>
                        {isGeneratingSummary
                            ? "A gerar resumo..."
                            : isArtifactJobActive && artifactJob
                              ? `A preparar ${artifactTypeLabel(artifactJob.artifactType).toLocaleLowerCase("pt-PT")} em background...`
                              : "A gerar ferramenta..."}
                    </InlineNotice>
                ) : null}
                {artifactJob ? (
                    <p className="text-sm text-studyflow-text" aria-live="polite">
                        {artifactJob.status === "DONE"
                            ? `${artifactTypeLabel(artifactJob.artifactType)}: material pronto.`
                            : artifactJob.status === "FAILED"
                              ? artifactJob.errorMessage ?? "Não foi possível gerar o material."
                              : `${artifactTypeLabel(artifactJob.artifactType)} em ${artifactJob.status === "QUEUED" ? "fila" : "processamento"}.`}
                    </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                    <button
                        className="sf-button-secondary"
                        type="button"
                        onClick={() => void handleSummary()}
                        disabled={isGenerating}
                    >
                        {isGeneratingSummary ? "A gerar..." : "Gerar resumo"}
                    </button>
                </div>
                <form className="grid items-end gap-3 md:grid-cols-[180px_1fr_auto]" onSubmit={(event) => void handleTool(event)}>
                    <FormField id="study-tool-type" label="Tipo de ferramenta">
                        <select
                            value={type}
                            onChange={(event) => setType(event.target.value as StudyToolType)}
                            disabled={isGenerating}
                        >
                            <option value="EXPLANATION">Explicação</option>
                            <option value="FLASHCARDS">Cards</option>
                            <option value="QUIZ">Quiz</option>
                        </select>
                    </FormField>
                    <FormField id="study-tool-topic" label="Tópico opcional">
                        <input
                            value={topic}
                            onChange={(event) => setTopic(event.target.value)}
                            placeholder="Tópico opcional"
                            disabled={isGenerating}
                        />
                    </FormField>
                    <button className="sf-button-primary" type="submit" disabled={isGenerating}>
                        {isGeneratingTool ? "A gerar..." : "Gerar"}
                    </button>
                </form>
            </Surface>
            <AsyncStateBlock
                isLoading={isLoadingExisting}
                error={loadError ?? undefined}
                isEmpty={!hasArtifacts}
                emptyMessage="Ainda não há resumos nem ferramentas geradas."
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <ArtifactList
                        artifacts={summaries}
                        emptyText="Ainda não há resumos gerados."
                        onSelect={setArtifact}
                        selectedId={artifact?._id}
                        title="Resumos"
                    />
                    <ArtifactList
                        artifacts={studyTools}
                        emptyText="Ainda não há ferramentas geradas."
                        onSelect={setArtifact}
                        selectedId={artifact?._id}
                        title="Ferramentas"
                    />
                </div>
            </AsyncStateBlock>
            <div ref={resultRef} className="space-y-6 outline-none" tabIndex={-1}>
                <ArtifactExportPanel artifact={artifact} studyAreaId={studyAreaId} />
                {artifact?.type === "SUMMARY" ? <SummaryPanel artifact={artifact} /> : null}
                {artifact?.type === "EXPLANATION" ? <ExplanationPanel artifact={artifact} /> : null}
                {artifact?.type === "FLASHCARDS" ? <FlashcardsPanel artifact={artifact} /> : null}
                {artifact?.type === "QUIZ" ? (
                    <QuizPanel artifact={artifact} studyAreaId={studyAreaId} />
                ) : null}
            </div>
        </section>
    );
}

/**
 * Props do painel de exportação de artefactos de estudo.
 */
type ArtifactExportPanelProps = {
    artifact: AiArtifact | null;
    studyAreaId: string;
};

/**
 * Mostra ações de exportação para resumos e quizzes autorizados.
 *
 * @param props Artefacto selecionado e área privada.
 * @returns Painel com ações e estados de exportação.
 */
function ArtifactExportPanel({
    artifact,
    studyAreaId,
}: ArtifactExportPanelProps) {
    const [exportMessage, setExportMessage] = useState<string | null>(null);
    const exportAction = useAsyncAction();
    const isExporting = exportAction.isPending;
    const isExportable =
        artifact?.type === "SUMMARY" || artifact?.type === "QUIZ";

    /**
     * Executa exportação segura através do backend.
     *
     * @param format Formato pedido pelo aluno.
     * @returns Promise resolvida depois da ação local.
     */
    async function handleExport(format: ArtifactExportFormat): Promise<void> {
        if (!artifact || !isExportable) return;
        setExportMessage(null);
        await exportAction.run(`export-${format}`, async () => {
            const file = await exportStudyToolArtifact(
                studyAreaId,
                artifact._id,
                format,
            );
            if (format === "pdf") {
                openPrintableArtifact(file);
                setExportMessage("Documento preparado para guardar como PDF.");
            } else {
                downloadArtifactFile(file);
                setExportMessage("Markdown exportado com sucesso.");
            }
        }, "Não foi possível exportar o artefacto.");
    }

    if (!artifact) {
        return (
            <Surface className="space-y-2">
                <SectionHeader title="Exportação" />
                <p className="text-sm text-studyflow-text">
                    Escolhe ou gera um resumo ou quiz para ativar a exportação.
                </p>
            </Surface>
        );
    }

    return (
        <Surface className="space-y-3">
            <SectionHeader title="Exportação" />
            {!isExportable ? (
                <p className="text-sm text-studyflow-text">
                    Este tipo de artefacto não é exportado neste BK.
                </p>
            ) : (
                <div className="flex flex-wrap gap-3">
                    <button
                        className="sf-button-secondary"
                        disabled={isExporting}
                        onClick={() => void handleExport("md")}
                        type="button"
                    >
                        {isExporting ? "A exportar..." : "Exportar MD"}
                    </button>
                    <button
                        className="sf-button-secondary"
                        disabled={isExporting}
                        onClick={() => void handleExport("pdf")}
                        type="button"
                    >
                        {isExporting ? "A preparar..." : "Preparar PDF"}
                    </button>
                </div>
            )}
            {exportMessage ? (
                <p className="text-sm text-studyflow-brandText" aria-live="polite">
                    {exportMessage}
                </p>
            ) : null}
            {exportAction.error ? (
                <p className="sf-error" role="alert">{exportAction.error}</p>
            ) : null}
        </Surface>
    );
}

/**
 * Descarrega ficheiro textual devolvido pelo backend.
 *
 * @param file Ficheiro recebido ou processado pela operação.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
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

/**
 * Abre documento de impressão preparado pela API.
 *
 * @param file Ficheiro recebido ou processado pela operação.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
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

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type ArtifactListProps = {
    artifacts: AiArtifact[];
    emptyText: string;
    onSelect: (artifact: AiArtifact) => void;
    selectedId?: string;
    title: string;
};

/**
 * Lista artefactos já persistidos da área.
 *
 * @param props Artefactos, seleção e texto vazio.
 * @returns Lista compacta de artefactos.
 */
function ArtifactList({
    artifacts,
    emptyText,
    onSelect,
    selectedId,
    title,
}: ArtifactListProps) {
    return (
        <Surface className="space-y-3">
            <SectionHeader title={title} />
            <AsyncStateBlock
                isLoading={false}
                isEmpty={artifacts.length === 0}
                emptyMessage={emptyText}
            >
                <ul className="space-y-2">
                    {artifacts.map((item) => {
                        // A API já filtra os artefactos pela área autenticada antes da lista renderizar.
                        return (
                            <li key={item._id}>
                                <button
                                    className={
                                        item._id === selectedId
                                            ? "sf-button-primary w-full text-left"
                                            : "sf-button-secondary w-full text-left"
                                    }
                                    onClick={() => onSelect(item)}
                                    type="button"
                                >
                                    {artifactLabel(item)}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </AsyncStateBlock>
        </Surface>
    );
}

/**
 * Obtém uma etiqueta curta para um artefacto.
 *
 * @param artifact Artefacto IA.
 * @returns Texto visível na lista.
 */
function artifactLabel(artifact: AiArtifact): string {
    const title = artifact.contentJson.title;
    if (typeof title === "string" && title.trim()) return title;
    if (artifact.type === "FLASHCARDS") return "Cards";
    if (artifact.type === "QUIZ") return "Quiz";
    return artifact.type === "EXPLANATION" ? "Explicação" : "Resumo";
}

/**
 * Mantém estados de jobs de material monotónicos perante respostas tardias.
 */
function canAdvanceArtifactJob(
    previous: AiArtifactGenerationJob["status"],
    next: AiArtifactGenerationJob["status"],
): boolean {
    if (previous === "DONE" || previous === "FAILED") return next === previous;
    const rank: Record<AiArtifactGenerationJob["status"], number> = {
        QUEUED: 0,
        PROCESSING: 1,
        DONE: 2,
        FAILED: 2,
    };
    return rank[next] >= rank[previous];
}

/** Traduz o discriminador persistido para linguagem visível ao aluno. */
function artifactTypeLabel(type: AiArtifact["type"]): string {
    if (type === "SUMMARY") return "Resumo";
    if (type === "EXPLANATION") return "Explicação";
    if (type === "FLASHCARDS") return "Flashcards";
    return "Quiz";
}
