/**
 * Painel lateral acessível para formulários contextuais e tarefas focadas.
 */
import {
    useEffect,
    useId,
    useRef,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type FocusTargetRef = {
    readonly current: HTMLElement | null;
};

export type SidePanelProps = {
    children: ReactNode;
    closeDisabled?: boolean;
    description: string;
    initialFocusRef?: FocusTargetRef;
    returnFocusRef?: FocusTargetRef;
    onClose: () => void;
    open: boolean;
    size?: "default" | "wide";
    title: string;
};

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Mostra um drawer modal com gestão de foco, teclado e scroll da página.
 *
 * @param props Estado, conteúdo, copy acessível e ação de fecho.
 * @returns Painel fixo à direita em desktop e sheet integral em mobile.
 */
export function SidePanel({
    children,
    closeDisabled = false,
    description,
    initialFocusRef,
    returnFocusRef,
    onClose,
    open,
    size = "default",
    title,
}: SidePanelProps): ReactNode {
    const panelRef = useRef<HTMLElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const openerRef = useRef<HTMLElement | null>(null);
    const closeDisabledRef = useRef(closeDisabled);
    const onCloseRef = useRef(onClose);
    const titleId = useId();
    const descriptionId = useId();
    closeDisabledRef.current = closeDisabled;
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;

        openerRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = Math.max(
            0,
            window.innerWidth - document.documentElement.clientWidth,
        );
        if (scrollbarWidth > 0) {
            const currentPaddingRight = Number.parseFloat(
                window.getComputedStyle(document.body).paddingRight,
            ) || 0;
            document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }
        document.body.style.overflow = "hidden";

        const focusFrame = window.requestAnimationFrame(() => {
            if (panelRef.current?.contains(document.activeElement)) return;
            const content = panelRef.current?.querySelector<HTMLElement>(
                "[data-side-panel-content]",
            );
            const firstContentControl = content?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (initialFocusRef?.current ?? firstContentControl ?? closeButtonRef.current)?.focus();
        });

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape") {
                if (!closeDisabledRef.current) onCloseRef.current();
                return;
            }
            if (event.key !== "Tab" || !panelRef.current) return;

            const focusable = Array.from(
                panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
            ).filter(
                (element) =>
                    !element.hidden && element.getAttribute("aria-hidden") !== "true",
            );
            if (focusable.length === 0) {
                event.preventDefault();
                panelRef.current.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            window.requestAnimationFrame(() =>
                (returnFocusRef?.current ?? openerRef.current)?.focus());
        };
    }, [initialFocusRef, open, returnFocusRef]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[70] flex h-dvh justify-end bg-studyflow-page/80 backdrop-blur-sm"
            data-testid="side-panel-backdrop"
            onPointerDown={(event) => {
                if (event.target === event.currentTarget && !closeDisabled) onClose();
            }}
        >
            <section
                ref={panelRef}
                aria-describedby={descriptionId}
                aria-labelledby={titleId}
                aria-modal="true"
                className={`flex h-dvh w-full ${size === "wide" ? "max-w-4xl" : "max-w-[440px]"} flex-col border-l border-studyflow-border/15 bg-studyflow-card shadow-2xl outline-none motion-safe:animate-[sf-slide-in_180ms_ease-out]`}
                role="dialog"
                tabIndex={-1}
            >
                <header className="flex items-start gap-4 border-b border-studyflow-border/10 px-5 py-5 sm:px-6">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studyflow-brandText">
                            StudyFlow
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight" id={titleId}>
                            {title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-studyflow-text/70" id={descriptionId}>
                            {description}
                        </p>
                    </div>
                    <button
                        ref={closeButtonRef}
                        aria-label="Fechar painel lateral"
                        className="sf-icon-button shrink-0 text-xl leading-none"
                        disabled={closeDisabled}
                        onClick={onClose}
                        type="button"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6" data-side-panel-content>
                    {children}
                </div>
            </section>
        </div>,
        document.body,
    );
}
