/** Conversa reutilizada pelo launcher e pela página completa. */
import {
    type Dispatch,
    type FormEvent,
    type SetStateAction,
    lazy,
    Suspense,
    useEffect,
    useRef,
    useState,
} from "react";
import { Link } from "react-router-dom";
import { AiConsentGate } from "../../components/ai/AiConsentGate.js";
import { ShellIcon } from "../../components/layout/shell-icons.js";
import { OverflowActions } from "../../components/student/StudentWorkspace.js";
import { EmptyState, InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import { usePollingTask } from "../../hooks/usePollingTask.js";
import {
    askStudentAssistant,
    deleteStudentAssistantConversation,
    getStudentAssistantArtifactJob,
    getStudentAssistantConversation,
    listStudentAssistantArtifactJobs,
    listStudentAssistantArtifacts,
    listStudentAssistantMessages,
    updateStudentAssistantConversation,
    type StudentAssistantConversation,
    type StudentAssistantArtifact,
    type StudentAssistantArtifactGenerationResult,
    type StudentAssistantArtifactJob,
    type StudentAssistantTurn,
} from "../../lib/apiClient.js";

const StudentAssistantArtifactPanel = lazy(() =>
    import("./StudentAssistantArtifactPanel.js").then((module) => ({
        default: module.StudentAssistantArtifactPanel,
    })),
);

const StudentAssistantForkPanel = lazy(() =>
    import("./StudentAssistantForkPanel.js").then((module) => ({
        default: module.StudentAssistantForkPanel,
    })),
);

export function StudentAssistantConversationView({
    conversationId,
    launcherActions,
    onBlockingOverlayChange,
    onDeleted,
    onChanged,
    variant = "page",
}: {
    conversationId: string;
    launcherActions?: {
        onChangeContext: () => void;
        onNewConversation: () => void;
    };
    onBlockingOverlayChange?: (open: boolean) => void;
    onDeleted?: (message: string) => void;
    onChanged?: (conversation: StudentAssistantConversation) => void;
    variant?: "launcher" | "page";
}) {
    const [conversation, setConversation] = useState<StudentAssistantConversation | null>(null);
    const [turns, setTurns] = useState<StudentAssistantTurn[]>([]);
    const [artifacts, setArtifacts] = useState<StudentAssistantArtifact[]>([]);
    const [artifactJobs, setArtifactJobs] = useState<StudentAssistantArtifactJob[]>([]);
    const [previousCursor, setPreviousCursor] = useState<string | null>(null);
    const [artifactCursor, setArtifactCursor] = useState<string | null>(null);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [title, setTitle] = useState("");
    const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
    const [forkPanelOpen, setForkPanelOpen] = useState(false);
    const [retryJob, setRetryJob] = useState<StudentAssistantArtifactJob | null>(null);
    const artifactTriggerRef = useRef<HTMLButtonElement | null>(null);
    const overflowTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(
        () => () => onBlockingOverlayChange?.(false),
        [onBlockingOverlayChange],
    );

    const refreshConversation = async () => {
        const next = await getStudentAssistantConversation(conversationId);
        setConversation(next);
        setTitle(next.title);
        onChanged?.(next);
        return next;
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        getStudentAssistantConversation(conversationId)
            .then(async (nextConversation) => {
                const [page, artifactPage, jobs] = await Promise.all([
                    listStudentAssistantMessages(conversationId),
                    listStudentAssistantArtifacts(conversationId),
                    listStudentAssistantArtifactJobs(conversationId, {
                        limit: 10,
                    }),
                ]);
                return { nextConversation, page, artifactPage, jobs };
            })
            .then(({ nextConversation, page, artifactPage, jobs }) => {
                if (!active) return;
                setConversation(nextConversation);
                setTitle(nextConversation.title);
                setTurns(page.items);
                setPreviousCursor(page.previousCursor);
                setArtifacts(artifactPage.items);
                setArtifactCursor(artifactPage.previousCursor);
                setArtifactJobs(jobs);
            })
            .catch((caught) => {
                if (active) setError(caught instanceof Error ? caught.message : "Não foi possível abrir a conversa.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [conversationId]);

    const activeJobs = artifactJobs.filter(
        (job) => job.status === "QUEUED" || job.status === "PROCESSING",
    );
    usePollingTask(
        async (signal) => {
            const nextJobs = await Promise.all(
                activeJobs.map((job) =>
                    getStudentAssistantArtifactJob(
                        conversationId,
                        job.id,
                        signal,
                    ),
                ),
            );
            if (signal.aborted) return;
            setArtifactJobs((current) =>
                current.map(
                    (job) => nextJobs.find((next) => next.id === job.id) ?? job,
                ),
            );
            const completed = nextJobs.flatMap((job) =>
                job.status === "DONE" && job.artifact ? [job.artifact] : [],
            );
            if (completed.length) {
                setArtifacts((current) => mergeArtifacts(current, completed));
                await refreshConversation();
            }
        },
        { enabled: activeJobs.length > 0, intervalMs: 1500 },
    );

    async function send(event: FormEvent): Promise<void> {
        event.preventDefault();
        const normalized = question.trim();
        if (normalized.length < 4 || sending) return;
        setSending(true);
        setError(null);
        try {
            const turn = await askStudentAssistant(conversationId, normalized);
            setTurns((current) => [...current, turn]);
            setQuestion("");
            await refreshConversation();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível obter uma resposta.");
        } finally {
            setSending(false);
        }
    }

    async function loadMore(): Promise<void> {
        if (!previousCursor && !artifactCursor) return;
        setLoadingMore(true);
        setError(null);
        try {
            const [page, artifactPage] = await Promise.all([
                previousCursor
                    ? listStudentAssistantMessages(conversationId, {
                          before: previousCursor,
                      })
                    : Promise.resolve({ items: [], previousCursor: null }),
                artifactCursor
                    ? listStudentAssistantArtifacts(conversationId, {
                          before: artifactCursor,
                      })
                    : Promise.resolve({ items: [], previousCursor: null }),
            ]);
            setTurns((current) => [...page.items, ...current]);
            setArtifacts((current) =>
                mergeArtifacts(artifactPage.items, current),
            );
            setPreviousCursor(page.previousCursor);
            setArtifactCursor(artifactPage.previousCursor);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível carregar mensagens anteriores.");
        } finally {
            setLoadingMore(false);
        }
    }

    async function saveTitle(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            const next = await updateStudentAssistantConversation(conversationId, { title });
            setConversation(next);
            setRenaming(false);
            onChanged?.(next);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível alterar o título.");
        }
    }

    async function toggleArchive(): Promise<void> {
        if (!conversation) return;
        setError(null);
        try {
            const next = await updateStudentAssistantConversation(conversationId, {
                status: conversation.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED",
            });
            setConversation(next);
            onChanged?.(next);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível organizar a conversa.");
        }
    }

    async function remove(): Promise<void> {
        setError(null);
        try {
            const result = await deleteStudentAssistantConversation(conversationId);
            const retained = result.retainedTurnCount > 0
                ? ` ${result.retainedTurnCount} resposta(s) permanecem por terem sido partilhadas ou supervisionadas.`
                : "";
            const preserved = result.preservedArtifactCount > 0
                ? ` ${result.preservedArtifactCount} material(is) continuam disponíveis no arquivo privado.`
                : "";
            onDeleted?.(`Conversa apagada.${retained}${preserved}`);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível apagar a conversa.");
        }
    }

    function openArtifactPanel(job: StudentAssistantArtifactJob | null = null): void {
        setRetryJob(job);
        setArtifactPanelOpen(true);
        onBlockingOverlayChange?.(true);
    }

    function closeArtifactPanel(): void {
        setArtifactPanelOpen(false);
        setRetryJob(null);
        onBlockingOverlayChange?.(false);
    }

    function openForkPanel(): void {
        setConfirmDelete(false);
        setRenaming(false);
        setForkPanelOpen(true);
        onBlockingOverlayChange?.(true);
    }

    function closeForkPanel(): void {
        setForkPanelOpen(false);
        onBlockingOverlayChange?.(false);
    }

    if (loading) return <InlineNotice>A carregar conversa...</InlineNotice>;
    if (!conversation) return <InlineNotice tone="danger">{error ?? "Conversa indisponível."}</InlineNotice>;
    const purpose = consentPurpose(conversation.context.kind);
    const canCreateArtifacts =
        conversation.capabilities.canCreateArtifact && activeJobs.length === 0;
    const activity = [
        ...turns.map((turn) => ({
            kind: "TURN" as const,
            createdAt: turn.createdAt,
            turn,
        })),
        ...artifacts.map((artifact) => ({
            kind: "ARTIFACT" as const,
            createdAt: artifact.createdAt,
            artifact,
        })),
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    const canCompose = !conversation.readOnly && conversation.status !== "ARCHIVED";
    const contextType = contextTypeLabel(conversation.context.kind);
    const contextMeta = [
        contextType,
        conversation.context.secondaryLabel !== contextType
            ? conversation.context.secondaryLabel
            : undefined,
    ].filter((value): value is string => Boolean(value));

    const composer = canCompose ? (
        <>
            {canCreateArtifacts ? (
                <button
                    ref={artifactTriggerRef}
                    className={
                        variant === "launcher"
                            ? "sf-button-secondary mb-3 min-h-11 w-full gap-2 border-studyflow-brand/35 bg-studyflow-brand/10 text-studyflow-brandText"
                            : "sf-button-secondary mb-3 min-h-11 gap-2"
                    }
                    onClick={() => openArtifactPanel()}
                    type="button"
                >
                    <ShellIcon className="h-5 w-5" name="spark" />
                    Criar material de estudo
                </button>
            ) : null}
            <AiConsentGate
                description="Aceita o tratamento necessário para usar o Assistente neste contexto."
                purpose={purpose}
            >
                <form onSubmit={(event) => void send(event)}>
                    <label
                        className="sr-only"
                        htmlFor={`assistant-question-${conversationId}`}
                    >
                        Pergunta ao Assistente
                    </label>
                    <textarea
                        id={`assistant-question-${conversationId}`}
                        maxLength={1000}
                        minLength={4}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Pergunta, pede uma explicação ou solicita um exemplo..."
                        rows={3}
                        value={question}
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            className="sf-button-primary min-h-11"
                            disabled={sending || question.trim().length < 4}
                            type="submit"
                        >
                            {sending ? "A responder..." : "Enviar"}
                        </button>
                    </div>
                </form>
            </AiConsentGate>
        </>
    ) : null;

    return (
        <section className="flex min-h-0 flex-1 flex-col" aria-label={`Conversa ${conversation.title}`}>
            <header className="shrink-0 border-b border-studyflow-border/10 pb-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold">{conversation.title}</h2>
                        {conversation.origin === "FORK" ? <div className="mt-2"><StatusBadge tone="brand">Fork recebido</StatusBadge></div> : null}
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
                            <p className="min-w-0 text-studyflow-text/65">
                                <span className="font-semibold text-studyflow-text/80">{conversation.context.label}</span>
                                {contextMeta.length ? ` · ${contextMeta.join(" · ")}` : ""}
                            </p>
                            {conversation.context.targetPath ? (
                                <Link
                                    className="inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-studyflow-brandText hover:bg-studyflow-card/45"
                                    to={conversation.context.targetPath}
                                >
                                    {contextLinkLabel(conversation.context.kind)}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <OverflowActions triggerRef={overflowTriggerRef}>
                        {conversation.capabilities.canInviteFork ? (
                            <button
                                className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-studyflow-page/50"
                                onClick={openForkPanel}
                                type="button"
                            >
                                Partilhar conversa
                            </button>
                        ) : null}
                        <button
                            className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-studyflow-page/50"
                            onClick={() => setRenaming((value) => !value)}
                            type="button"
                        >
                            Renomear
                        </button>
                        <button
                            className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-semibold hover:bg-studyflow-page/50"
                            disabled={activeJobs.length > 0}
                            onClick={() => void toggleArchive()}
                            type="button"
                        >
                            {conversation.status === "ARCHIVED" ? "Restaurar" : "Arquivar"}
                        </button>
                        <button
                            className="flex min-h-11 w-full items-center gap-2 rounded-lg bg-studyflow-alert/10 px-3 text-left text-sm font-semibold text-studyflow-alertText hover:bg-studyflow-alert/20"
                            disabled={activeJobs.length > 0}
                            onClick={() => setConfirmDelete(true)}
                            type="button"
                        >
                            <ShellIcon className="h-4 w-4" name="trash" />
                            Apagar
                        </button>
                    </OverflowActions>
                </div>
                {renaming ? <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => void saveTitle(event)}><label className="sr-only" htmlFor="assistant-conversation-title">Título da conversa</label><input className="min-w-0 flex-1" id="assistant-conversation-title" maxLength={80} onChange={(event) => setTitle(event.target.value)} value={title} /><button className="sf-button-primary">Guardar</button><button className="sf-button-secondary" onClick={() => setRenaming(false)} type="button">Cancelar</button></form> : null}
                {confirmDelete ? <InlineNotice tone="danger"><p>Apagar esta conversa? Respostas já partilhadas ou supervisionadas podem ter de ser preservadas. Os materiais de estudo criados nesta conversa continuarão disponíveis no arquivo privado.</p><div className="mt-3 flex gap-2"><button className="sf-button-primary" onClick={() => void remove()} type="button">Confirmar eliminação</button><button className="sf-button-secondary" onClick={() => setConfirmDelete(false)} type="button">Cancelar</button></div></InlineNotice> : null}
            </header>

            {error ? <div className="py-3"><InlineNotice tone="danger">{error}</InlineNotice></div> : null}
            {conversation.fork ? <div className="py-3"><InlineNotice>Esta conversa começou com {conversation.fork.inheritedTurnCount} turno(s) herdados. A partir daqui, evolui de forma independente.</InlineNotice></div> : null}
            {conversation.readOnly ? <div className="py-3"><InlineNotice tone="attention">{conversation.readOnlyReason === "ACCESS_REVOKED" ? "O acesso a este contexto terminou. Podes rever o histórico, mas não abrir fontes nem fazer novas perguntas." : "Este histórico anterior está disponível apenas para consulta."}</InlineNotice></div> : null}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4" aria-label="Mensagens da conversa">
                {previousCursor || artifactCursor ? <button className="sf-button-secondary" disabled={loadingMore} onClick={() => void loadMore()} type="button">{loadingMore ? "A carregar..." : "Carregar anteriores"}</button> : null}
                {activity.length === 0 ? <EmptyState compact={variant === "launcher"} description="Faz uma pergunta ou cria um material de estudo." icon="message" title="Ainda não há mensagens" /> : null}
                {activity.map((item) => item.kind === "TURN" ? <TurnMessage key={`turn:${item.turn.id}`} turn={item.turn} /> : <ArtifactCard artifact={item.artifact} key={`artifact:${item.artifact.id}`} />)}
                {artifactJobs.filter((job) => job.status !== "DONE").map((job) => <ArtifactJobCard job={job} key={`job:${job.id}`} onRetry={() => openArtifactPanel(job)} />)}
                {sending ? <InlineNotice>A preparar resposta...</InlineNotice> : null}
            </div>

            {variant === "launcher" ? (
                <div className="shrink-0 border-t border-studyflow-border/10 pt-3">
                    {composer}
                    {launcherActions ? (
                        <div className={`${canCompose ? "mt-3 border-t border-studyflow-border/10 pt-2" : ""} flex items-center justify-between gap-2`}>
                            <button className="min-h-11 rounded-xl px-2 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-card/45 hover:text-studyflow-text" onClick={launcherActions.onNewConversation} type="button">Nova conversa</button>
                            <button className="min-h-11 rounded-xl px-2 text-sm font-semibold text-studyflow-brandText hover:bg-studyflow-card/45" onClick={launcherActions.onChangeContext} type="button">Mudar contexto</button>
                        </div>
                    ) : null}
                </div>
            ) : composer ? (
                <div className="shrink-0 border-t border-studyflow-border/10 pt-4">{composer}</div>
            ) : null}
            {artifactPanelOpen ? <Suspense fallback={<InlineNotice>A preparar opções…</InlineNotice>}><StudentAssistantArtifactPanel conversationId={conversationId} initialTopic={retryJob?.topic} initialType={retryJob?.type ?? "SUMMARY"} onClose={closeArtifactPanel} onGenerated={(result) => { handleArtifactResult(result, setArtifacts, setArtifactJobs); void refreshConversation(); }} open returnFocusRef={artifactTriggerRef} /></Suspense> : null}
            {forkPanelOpen ? <Suspense fallback={<InlineNotice>A preparar partilha…</InlineNotice>}><StudentAssistantForkPanel conversationId={conversationId} onClose={closeForkPanel} open returnFocusRef={overflowTriggerRef} /></Suspense> : null}
        </section>
    );
}

function TurnMessage({ turn }: { turn: StudentAssistantTurn }) {
    return <article className="space-y-3">{turn.inherited ? <p className="text-right text-xs font-semibold uppercase tracking-[.12em] text-studyflow-text/60">Pergunta herdada</p> : null}<div className="ml-auto max-w-[85%] rounded-2xl bg-studyflow-brand px-4 py-3 text-white"><p className="whitespace-pre-wrap break-words">{turn.question}</p></div><div className="max-w-[92%] rounded-2xl bg-studyflow-card/70 px-4 py-3"><p className="whitespace-pre-wrap break-words leading-6">{turn.answer}</p>{turn.teacherVoiceApplied ? <p className="mt-3 text-xs text-studyflow-text/65">Resposta orientada pelo professor</p> : null}{turn.visibility === "SHARED" ? <div className="mt-3"><StatusBadge tone="brand">Partilhada</StatusBadge></div> : null}{turn.citations.length ? <div className="mt-3 flex flex-wrap gap-2" aria-label="Fontes da resposta">{turn.citations.map((citation, index) => citation.targetPath ? <Link className="max-w-full truncate whitespace-nowrap rounded-full border border-studyflow-border/15 px-3 py-1 text-xs text-studyflow-brandText" key={`${turn.id}:${index}`} to={citation.targetPath}>{citation.label}</Link> : <span className="max-w-full truncate whitespace-nowrap rounded-full border border-studyflow-border/15 px-3 py-1 text-xs text-studyflow-text/65" key={`${turn.id}:${index}`}>{citation.label}</span>)}</div> : null}</div></article>;
}

function ArtifactCard({ artifact }: { artifact: StudentAssistantArtifact }) {
    return <article className="max-w-[92%] rounded-2xl border border-studyflow-border/10 bg-studyflow-card/35 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[.12em] text-studyflow-brandText">{artifactTypeLabel(artifact.type)}</p><h3 className="mt-1 break-words font-semibold">{artifact.title}</h3><p className="mt-1 text-xs text-studyflow-text/60">{artifact.target.label} · {new Date(artifact.createdAt).toLocaleString("pt-PT")}</p><Link className="sf-button-secondary mt-3 inline-flex" to={artifact.targetPath}>Abrir material</Link></article>;
}

function ArtifactJobCard({ job, onRetry }: { job: StudentAssistantArtifactJob; onRetry: () => void }) {
    const active = job.status === "QUEUED" || job.status === "PROCESSING";
    const typeLabel = artifactTypeLabel(job.type);
    return <InlineNotice tone={job.status === "FAILED" ? "danger" : "neutral"}><p className="font-semibold">{typeLabel}{job.topic ? ` — ${job.topic}` : ""}</p><p className="mt-1">{job.status === "QUEUED" ? `${typeLabel} em fila.` : job.status === "PROCESSING" ? `A preparar ${artifactTypeLabelWithArticle(job.type)}…` : job.errorMessage ?? "Não foi possível criar o material."}</p>{!active && job.status === "FAILED" ? <button className="sf-button-secondary mt-3" onClick={onRetry} type="button">Tentar novamente</button> : null}</InlineNotice>;
}

function handleArtifactResult(
    result: StudentAssistantArtifactGenerationResult,
    setArtifacts: Dispatch<SetStateAction<StudentAssistantArtifact[]>>,
    setJobs: Dispatch<SetStateAction<StudentAssistantArtifactJob[]>>,
): void {
    if (result.status === "DONE") {
        setArtifacts((current) => mergeArtifacts(current, [result.artifact]));
        return;
    }
    setJobs((current) => [
        result.job,
        ...current.filter((job) => job.id !== result.job.id),
    ]);
}

function mergeArtifacts(
    current: StudentAssistantArtifact[],
    incoming: StudentAssistantArtifact[],
): StudentAssistantArtifact[] {
    return [
        ...new Map(
            [...current, ...incoming].map((artifact) => [artifact.id, artifact]),
        ).values(),
    ].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function artifactTypeLabel(type: StudentAssistantArtifact["type"]): string {
    if (type === "SUMMARY") return "Resumo";
    if (type === "EXPLANATION") return "Explicação";
    if (type === "FLASHCARDS") return "Flashcards";
    return "Quiz";
}

function artifactTypeLabelWithArticle(
    type: StudentAssistantArtifact["type"],
): string {
    if (type === "SUMMARY") return "o resumo";
    if (type === "EXPLANATION") return "a explicação";
    if (type === "FLASHCARDS") return "os flashcards";
    return "o quiz";
}

function contextTypeLabel(kind: StudentAssistantConversation["context"]["kind"]): string {
    if (kind === "SUBJECT") return "Disciplina";
    if (kind === "STUDY_AREA") return "Estudo pessoal";
    if (kind === "STUDY_GROUP") return "Grupo";
    if (kind === "STUDY_ROOM") return "Sala partilhada";
    return "Sala guiada";
}

function contextLinkLabel(kind: StudentAssistantConversation["context"]["kind"]): string {
    if (kind === "SUBJECT") return "Abrir disciplina";
    if (kind === "STUDY_AREA") return "Abrir área";
    if (kind === "STUDY_GROUP") return "Abrir grupo";
    if (kind === "STUDY_ROOM") return "Abrir sala";
    return "Abrir sala guiada";
}

function consentPurpose(kind: StudentAssistantConversation["context"]["kind"]): "CLASS_AI" | "PRIVATE_AREA_AI" | "GROUP_AI" | "ROOM_AI" {
    if (kind === "SUBJECT" || kind === "GUIDED_ROOM") return "CLASS_AI";
    if (kind === "STUDY_AREA") return "PRIVATE_AREA_AI";
    if (kind === "STUDY_GROUP") return "GROUP_AI";
    return "ROOM_AI";
}
