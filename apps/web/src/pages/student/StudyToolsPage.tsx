/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { ExplanationPanel } from "../../components/ai/ExplanationPanel.js";
import { FlashcardsPanel } from "../../components/ai/FlashcardsPanel.js";
import { QuizPanel } from "../../components/ai/QuizPanel.js";
import { SummaryPanel } from "../../components/ai/SummaryPanel.js";
import {
    AiArtifact,
    createQuizGenerationJob,
    generateStudyTool,
    generateSummary,
    getQuizGenerationJob,
    listStudyTools,
    listSummaries,
    QuizGenerationJob,
    StudyToolType,
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
    const [type, setType] = useState<StudyToolType>("EXPLANATION");
    const [topic, setTopic] = useState("");
    const [artifact, setArtifact] = useState<AiArtifact | null>(null);
    const [summaries, setSummaries] = useState<AiArtifact[]>([]);
    const [studyTools, setStudyTools] = useState<AiArtifact[]>([]);
    const [quizJob, setQuizJob] = useState<QuizGenerationJob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingExisting, setIsLoadingExisting] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isGeneratingTool, setIsGeneratingTool] = useState(false);

    /**
     * Recarrega artefactos IA já persistidos para a área.
     *
     * @returns Promise resolvida depois de atualizar as listas.
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
            setArtifact((current) => {
                const allArtifacts = [...summaryList, ...toolList];
                if (preferredArtifactId) {
                    const preferred = allArtifacts.find(
                        (item) => item._id === preferredArtifactId,
                    );
                    if (preferred) return preferred;
                }
                const currentStillExists = [...summaryList, ...toolList].find(
                    (item) => item._id === current?._id,
                );
                return currentStillExists ?? summaryList[0] ?? toolList[0] ?? null;
            });
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar artefactos.",
            );
        } finally {
            setIsLoadingExisting(false);
        }
    }

    useEffect(() => {
        void refreshArtifacts();
    }, [studyAreaId]);

    useEffect(() => {
        if (!quizJob || !["QUEUED", "PROCESSING"].includes(quizJob.status)) {
            return undefined;
        }

        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getQuizGenerationJob(studyAreaId, quizJob._id);
                setQuizJob(nextJob);
                if (nextJob.status === "DONE" && nextJob.artifactId) {
                    await refreshArtifacts(nextJob.artifactId);
                }
            } catch (caught) {
                // A UI não mostra detalhes técnicos que possam revelar fontes privadas ou prompts.
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível atualizar o estado do quiz.",
                );
            }
        }, 1500);

        return () => window.clearInterval(timer);
    }, [quizJob, studyAreaId]);

    /**
     * Gera um resumo para a área.
     *
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleSummary(): Promise<void> {
        if (isGeneratingSummary || isGeneratingTool) return;
        setError(null);
        setIsGeneratingSummary(true);
        try {
            const created = await generateSummary(studyAreaId);
            setArtifact(created);
            setSummaries((current) => [created, ...current]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        } finally {
            setIsGeneratingSummary(false);
        }
    }

    /**
     * Gera a ferramenta de estudo escolhida.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleTool(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (isGeneratingSummary || isGeneratingTool) return;
        setError(null);
        setIsGeneratingTool(true);
        try {
            if (type === "QUIZ") {
                const normalizedTopic = topic.trim();
                const createdJob = await createQuizGenerationJob(studyAreaId, {
                    topic: normalizedTopic || undefined,
                });
                setArtifact(null);
                setQuizJob(createdJob);
                return;
            }
            const created = await generateStudyTool(studyAreaId, { type, topic });
            setArtifact(created);
            setStudyTools((current) => [created, ...current]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível gerar.");
        } finally {
            setIsGeneratingTool(false);
        }
    }

    const isQuizJobActive =
        quizJob?.status === "QUEUED" || quizJob?.status === "PROCESSING";
    const isGenerating = isGeneratingSummary || isGeneratingTool || isQuizJobActive;

    return (
        <section className="space-y-6">
            <div className="sf-panel space-y-4">
                <h1 className="text-xl font-bold">IA da área</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                {isGenerating ? (
                    <p className="text-sm text-slate-600">
                        {isGeneratingSummary
                            ? "A gerar resumo..."
                            : isQuizJobActive
                              ? "A preparar quiz em background..."
                              : "A gerar ferramenta..."}
                    </p>
                ) : null}
                {quizJob ? (
                    <p className="text-sm text-slate-600" aria-live="polite">
                        {quizJob.status === "DONE"
                            ? "Quiz pronto para resolver."
                            : quizJob.status === "FAILED"
                              ? quizJob.errorMessage ?? "Não foi possível gerar o quiz."
                              : `Quiz em ${quizJob.status === "QUEUED" ? "fila" : "processamento"}.`}
                    </p>
                ) : null}
                {isLoadingExisting ? (
                    <p className="text-sm text-slate-600">A carregar artefactos...</p>
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
                <form className="grid gap-3 md:grid-cols-[180px_1fr_auto]" onSubmit={(event) => void handleTool(event)}>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value as StudyToolType)}
                        disabled={isGenerating}
                    >
                        <option value="EXPLANATION">Explicação</option>
                        <option value="FLASHCARDS">Cards</option>
                        <option value="QUIZ">Quiz</option>
                    </select>
                    <input
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        placeholder="Tópico opcional"
                        disabled={isGenerating}
                    />
                    <button className="sf-button-primary" type="submit" disabled={isGenerating}>
                        {isGeneratingTool ? "A gerar..." : "Gerar"}
                    </button>
                </form>
            </div>
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
            {artifact?.type === "SUMMARY" ? <SummaryPanel artifact={artifact} /> : null}
            {artifact?.type === "EXPLANATION" ? <ExplanationPanel artifact={artifact} /> : null}
            {artifact?.type === "FLASHCARDS" ? <FlashcardsPanel artifact={artifact} /> : null}
            {artifact?.type === "QUIZ" ? (
                <QuizPanel artifact={artifact} studyAreaId={studyAreaId} />
            ) : null}
        </section>
    );
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
        <div className="sf-panel space-y-3">
            <h2 className="text-lg font-bold">{title}</h2>
            {artifacts.length === 0 ? (
                <p className="text-sm text-slate-600">{emptyText}</p>
            ) : (
                <ul className="space-y-2">
                    {artifacts.map((item) => (
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
                    ))}
                </ul>
            )}
        </div>
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
