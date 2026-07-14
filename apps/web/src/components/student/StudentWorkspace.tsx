/** Primitivas de navegação e cartões para workspaces do aluno. */
import { useEffect, useId, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { ShellIcon, type ShellIconName } from "../layout/shell-icons.js";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
    return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-sm text-studyflow-text/60">{items.map((item, index) => <li className="flex items-center gap-2" key={`${item.label}:${index}`}>{index ? <span aria-hidden="true">/</span> : null}{item.href ? <a className="min-h-11 content-center font-semibold hover:text-studyflow-brandText" href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}

/**
 * Renderiza tabs de workspace sem cortar rótulos em ecrãs estreitos.
 *
 * Em mobile usa duas colunas flexíveis; a partir de `sm` recupera a linha
 * horizontal adequada aos workspaces com mais destinos.
 */
export function WorkspaceTabs({ items }: { items: { label: string; href: string; active: boolean }[] }) {
    const baseClassName = "flex min-h-11 min-w-0 basis-[calc(50%-0.125rem)] grow items-center justify-center border-b-2 px-2 py-2 text-center text-sm font-semibold leading-5 sm:min-w-max sm:basis-auto sm:flex-none sm:px-3 sm:py-3";

    return (
        <nav aria-label="Secções do workspace" className="flex flex-wrap gap-1 border-b border-studyflow-border/10 sm:flex-nowrap sm:overflow-x-auto">
            {items.map((item) => (
                <a
                    aria-current={item.active ? "page" : undefined}
                    className={item.active
                        ? `${baseClassName} border-studyflow-brand text-studyflow-brandText`
                        : `${baseClassName} border-transparent text-studyflow-text/60 hover:text-studyflow-text`}
                    href={item.href}
                    key={item.href}
                >
                    {item.label}
                </a>
            ))}
        </nav>
    );
}

export function PrimaryActionCard({ title, description, href, actionLabel, icon = "book", meta }: { title: string; description?: string; href: string; actionLabel: string; icon?: ShellIconName; meta?: ReactNode }) {
    return <article className="rounded-2xl border border-studyflow-border/10 bg-studyflow-card p-5 shadow-lg shadow-black/5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-studyflow-brand/15 text-studyflow-brandText"><ShellIcon className="h-5 w-5" name={icon} /></span><h3 className="mt-4 text-lg font-bold">{title}</h3>{description ? <p className="mt-2 text-sm leading-6 text-studyflow-text/65">{description}</p> : null}{meta ? <div className="mt-3 text-sm text-studyflow-text/60">{meta}</div> : null}<a className="sf-button-primary mt-5 inline-flex" href={href}>{actionLabel}</a></article>;
}

export function ContextCard({ title, description, href, actionLabel = "Abrir", meta }: { title: string; description?: string; href: string; actionLabel?: string; meta?: ReactNode }) {
    return <article className="sf-list-card"><h3 className="text-lg font-semibold">{title}</h3>{description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-studyflow-text/65">{description}</p> : null}{meta ? <div className="mt-3 text-sm text-studyflow-text/60">{meta}</div> : null}<a className="sf-button-primary mt-4 inline-flex" href={href}>{actionLabel}</a></article>;
}

export function OverflowActions({
    label = "Mais ações",
    children,
    triggerRef: externalTriggerRef,
}: {
    label?: string;
    children: ReactNode;
    triggerRef?: MutableRefObject<HTMLButtonElement | null>;
}) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return undefined;

        const close = (restoreFocus: boolean) => {
            setOpen(false);
            if (restoreFocus) {
                window.requestAnimationFrame(() => triggerRef.current?.focus());
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            close(true);
        };
        const handlePointerDown = (event: PointerEvent) => {
            if (!(event.target instanceof Node)) return;
            if (
                panelRef.current?.contains(event.target) ||
                triggerRef.current?.contains(event.target)
            ) {
                return;
            }
            close(true);
        };

        document.addEventListener("keydown", handleKeyDown, true);
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [open]);

    return (
        <div className="relative">
            <button
                ref={(element) => {
                    triggerRef.current = element;
                    if (externalTriggerRef) externalTriggerRef.current = element;
                }}
                aria-controls={panelId}
                aria-expanded={open}
                className="sf-button-secondary min-h-11"
                onClick={() => setOpen((value) => !value)}
                type="button"
            >
                {label}
            </button>
            {open ? (
                <div
                    ref={panelRef}
                    aria-label="Ações da conversa"
                    className="absolute right-0 z-30 mt-2 min-w-56 rounded-xl border border-studyflow-border/10 bg-studyflow-card p-2 shadow-xl"
                    id={panelId}
                    onClick={(event) => {
                        if (!(event.target instanceof Element)) return;
                        if (!event.target.closest("a, button")) return;
                        setOpen(false);
                        window.requestAnimationFrame(() => triggerRef.current?.focus());
                    }}
                    role="group"
                >
                    {children}
                </div>
            ) : null}
        </div>
    );
}
