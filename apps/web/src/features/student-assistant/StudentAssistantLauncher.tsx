/** Launcher contextual do aluno com janela desktop e sheet modal mobile. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import {
    createStudentAssistantConversation,
    getStudentAssistantContext,
    listStudentAssistantConversations,
    type StudentAssistantContext,
} from "../../lib/apiClient.js";
import { StudentAssistantContextChooser } from "./StudentAssistantContextChooser.js";
import { resolveStudentAssistantRouteContext } from "./student-assistant-context.js";

const FOCUSABLE = "a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex='-1'])";
const StudentAssistantConversationView = lazy(() =>
    import("./StudentAssistantConversationView.js").then((module) => ({
        default: module.StudentAssistantConversationView,
    })),
);

export function StudentAssistantLauncher() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [suggestedContext, setSuggestedContext] = useState<StudentAssistantContext | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [blockingOverlayOpen, setBlockingOverlayOpen] = useState(false);
    const launcherRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);
    const blockingOverlayRef = useRef(false);
    const isMobile = useMobileViewport();
    const routeContext = resolveStudentAssistantRouteContext(location.pathname);
    const hidden = location.pathname.startsWith("/app/assistente");

    useEffect(() => {
        if (!open) return;
        let active = true;
        setLoading(true);
        setError(null);
        setNotice(null);
        setConversationId(null);
        setSuggestedContext(null);
        const task = routeContext
            ? Promise.all([
                listStudentAssistantConversations({
                    contextKind: routeContext.kind,
                    contextId: routeContext.id,
                    limit: 1,
                }),
                getStudentAssistantContext(routeContext.kind, routeContext.id),
            ]).then(([page, context]) => {
                if (!active) return;
                setConversationId(page.items[0]?.id ?? null);
                setSuggestedContext(context);
            })
            : Promise.resolve();
        task.catch((caught) => {
            if (active) setError(caught instanceof Error ? caught.message : "Não foi possível abrir o Assistente.");
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [open, location.pathname]);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        const frame = window.requestAnimationFrame(() => {
            panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
        });
        if (isMobile) document.body.style.overflow = "hidden";
        const keydown = (event: KeyboardEvent) => {
            if (blockingOverlayRef.current) return;
            if (event.key === "Escape") {
                setOpen(false);
                return;
            }
            if (!isMobile || event.key !== "Tab" || !panelRef.current) return;
            const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable.at(-1)!;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", keydown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener("keydown", keydown);
            document.body.style.overflow = previousOverflow;
            window.requestAnimationFrame(() => launcherRef.current?.focus());
        };
    }, [isMobile, open]);

    const handleBlockingOverlayChange = useCallback((nextOpen: boolean) => {
        blockingOverlayRef.current = nextOpen;
        setBlockingOverlayOpen(nextOpen);
    }, []);

    async function create(context: StudentAssistantContext): Promise<void> {
        setLoading(true);
        setError(null);
        try {
            const conversation = await createStudentAssistantConversation({ kind: context.kind, id: context.id });
            setConversationId(conversation.id);
            setSuggestedContext(context);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível começar a conversa.");
        } finally {
            setLoading(false);
        }
    }

    if (hidden) return null;
    return (
        <>
            <button
                ref={launcherRef}
                aria-controls="student-assistant-dialog"
                aria-expanded={open}
                aria-label={open ? "Fechar Assistente de estudo" : "Abrir Assistente de estudo"}
                className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-[60] min-h-12 items-center gap-2 rounded-full px-4 font-semibold shadow-xl lg:bottom-6 lg:right-6 ${open ? "hidden border border-studyflow-brand bg-studyflow-card text-studyflow-brandText hover:bg-studyflow-card/80 sm:flex" : "flex bg-studyflow-brand text-white hover:bg-studyflow-brandHover"}`}
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                <span aria-hidden="true">✦</span>
                <span className="hidden sm:inline">{open ? "Assistente ativo" : "Assistente"}</span>
            </button>
            {open ? (
                <div
                    className={isMobile ? "fixed inset-0 z-[60] flex items-end bg-studyflow-page/80" : "pointer-events-none fixed inset-0 z-[60]"}
                    onPointerDown={(event) => {
                        if (isMobile && event.target === event.currentTarget) setOpen(false);
                    }}
                >
                    <section
                        ref={panelRef}
                        id="student-assistant-dialog"
                        aria-hidden={blockingOverlayOpen || undefined}
                        aria-label="Assistente de estudo"
                        aria-modal={isMobile || undefined}
                        className="pointer-events-auto flex h-[88dvh] w-full flex-col overflow-hidden border border-studyflow-border/15 bg-studyflow-page p-4 shadow-2xl max-[375px]:h-dvh sm:fixed sm:bottom-32 sm:right-6 sm:h-[min(44rem,calc(100dvh-10rem))] sm:w-[min(28rem,calc(100vw-3rem))] sm:rounded-2xl lg:bottom-20 lg:h-[min(44rem,calc(100dvh-7rem))]"
                        inert={blockingOverlayOpen}
                        role="dialog"
                    >
                        <header className="flex shrink-0 items-center justify-between gap-1 border-b border-studyflow-border/10 pb-3 sm:gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-bold sm:text-base">Assistente de estudo</p>
                            <Link
                                className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-1 text-sm font-semibold text-studyflow-brandText hover:bg-studyflow-card/45 sm:px-2"
                                onClick={() => setOpen(false)}
                                to={conversationId ? `/app/assistente/${conversationId}` : "/app/assistente"}
                            >
                                Abrir página
                            </Link>
                            {isMobile ? <button aria-label="Fechar Assistente" className="sf-icon-button min-h-11 min-w-11 shrink-0" onClick={() => setOpen(false)} type="button">×</button> : null}
                        </header>
                        <div className="flex min-h-0 flex-1 flex-col">
                            {notice || error ? (
                                <div className="shrink-0 space-y-2 pt-3">
                                    {notice ? <InlineNotice>{notice}</InlineNotice> : null}
                                    {error ? <InlineNotice tone="danger">{error}</InlineNotice> : null}
                                </div>
                            ) : null}
                            {loading ? <div className="overflow-y-auto py-4"><InlineNotice>A preparar o Assistente...</InlineNotice></div> : null}
                            {!loading && conversationId ? (
                                <div className="flex min-h-0 flex-1 flex-col pt-4">
                                    <Suspense fallback={<InlineNotice>A preparar conversa...</InlineNotice>}>
                                        <StudentAssistantConversationView
                                            conversationId={conversationId}
                                            launcherActions={{
                                                onChangeContext: () => {
                                                    setConversationId(null);
                                                    setSuggestedContext(null);
                                                },
                                                onNewConversation: () => setConversationId(null),
                                            }}
                                            onBlockingOverlayChange={handleBlockingOverlayChange}
                                            onDeleted={(message) => {
                                                setConversationId(null);
                                                setNotice(message);
                                            }}
                                            variant="launcher"
                                        />
                                    </Suspense>
                                </div>
                            ) : null}
                            {!loading && !conversationId && suggestedContext ? (
                                <div className="min-h-0 flex-1 overflow-y-auto py-4">
                                    <section className="space-y-4">
                                        <div><h2 className="text-lg font-semibold">{suggestedContext.label}</h2><p className="mt-1 text-sm text-studyflow-text/65">{suggestedContext.secondaryLabel}</p></div>
                                        <p className="text-sm leading-6 text-studyflow-text/70">Começa uma conversa baseada apenas nas fontes autorizadas deste contexto.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button className="sf-button-primary min-h-11" onClick={() => void create(suggestedContext)} type="button">Começar nova conversa</button>
                                            <button className="sf-button-secondary min-h-11" onClick={() => setSuggestedContext(null)} type="button">Mudar contexto</button>
                                        </div>
                                    </section>
                                </div>
                            ) : null}
                            {!loading && !conversationId && !suggestedContext ? (
                                <div className="min-h-0 flex-1 overflow-y-auto py-4">
                                    <StudentAssistantContextChooser onSelect={(context) => void create(context)} />
                                </div>
                            ) : null}
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}

function useMobileViewport(): boolean {
    const [mobile, setMobile] = useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 639px)").matches);
    useEffect(() => {
        if (typeof window.matchMedia !== "function") return undefined;
        const media = window.matchMedia("(max-width: 639px)");
        const update = () => setMobile(media.matches);
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    return mobile;
}
