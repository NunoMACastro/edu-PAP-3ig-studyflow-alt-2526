/** Inbox in-app discreta, partilhada pela shell desktop e mobile. */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { ContextNotification } from "../mf4/mf4-client.js";
import { IconTooltip, ShellIcon } from "../../components/layout/shell-icons.js";
import { useNotificationInbox } from "./notification-provider.js";

type NotificationTrayProps = { placement?: "below-end" | "side" };

function getContextLabel(notification: ContextNotification): string {
    if (notification.contextType === "CLASS") return "Turma";
    if (notification.contextType === "GROUP") return "Grupo";
    if (notification.contextType === "STUDY_ROOM") return "Sala de estudo";
    if (notification.contextType === "PRIVATE_AREA") return "Área privada";
    return "Contexto";
}

/** Renderiza uma vista da inbox comum sem duplicar pedidos ou estado. */
export function NotificationTray({ placement = "below-end" }: NotificationTrayProps) {
    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const trayRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inbox = useNotificationInbox();

    useEffect(() => {
        if (!open) return undefined;
        void inbox.refresh();
        const closeAndRestoreFocus = (): void => {
            setOpen(false);
            window.requestAnimationFrame(() => buttonRef.current?.focus());
        };
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") closeAndRestoreFocus();
        };
        const handlePointerDown = (event: PointerEvent): void => {
            if (!(event.target instanceof Node)) return;
            if (trayRef.current?.contains(event.target)) return;
            closeAndRestoreFocus();
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [inbox.refresh, open]);

    async function run(action: () => Promise<void>): Promise<void> {
        setActionError(null);
        try {
            await action();
        } catch (caught) {
            setActionError(caught instanceof Error ? caught.message : "Não foi possível atualizar a notificação.");
        }
    }

    async function openNotification(
        event: MouseEvent<HTMLAnchorElement>,
        notification: ContextNotification,
    ): Promise<void> {
        event.preventDefault();
        if (!notification.targetPath) return;
        await run(() => inbox.markRead(notification.id));
        window.location.assign(notification.targetPath);
    }

    return (
        <div className="relative" ref={trayRef}>
            <button
                ref={buttonRef}
                aria-label={`Notificações (${inbox.unreadCount})`}
                aria-controls="studyflow-notification-tray"
                aria-expanded={open}
                className={open ? "group relative inline-flex h-11 w-11 items-center justify-center rounded-md bg-studyflow-brand text-white" : "group relative inline-flex h-11 w-11 items-center justify-center rounded-md text-studyflow-text transition hover:bg-studyflow-navyHover"}
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                <ShellIcon className="h-5 w-5" name="bell" />
                {inbox.unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-studyflow-brand px-1 text-center text-xs font-bold text-white">{inbox.unreadCount}</span> : null}
                <IconTooltip side={placement === "side" ? "right" : "bottom"}>{`Notificações (${inbox.unreadCount})`}</IconTooltip>
            </button>

            {open ? (
                <section
                    aria-label="Notificações contextualizadas"
                    className={`z-50 max-h-[32rem] overflow-y-auto rounded-xl border border-studyflow-border bg-studyflow-card p-4 shadow-2xl ${placement === "side" ? "absolute bottom-0 left-full ml-3 w-96 max-w-[calc(100vw-2rem)]" : "fixed left-4 right-4 top-[4.5rem] w-auto max-w-none sm:left-auto sm:right-4 sm:w-96 sm:max-w-[calc(100vw-2rem)]"}`}
                    data-placement={placement}
                    id="studyflow-notification-tray"
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <strong>Notificações</strong>
                        {inbox.unreadCount > 0 ? <button className="text-xs font-semibold text-studyflow-brandText underline" onClick={() => void run(inbox.markAllRead)} type="button">Marcar todas como lidas</button> : null}
                    </div>
                    {inbox.loading ? <p className="text-sm">A carregar notificações...</p> : null}
                    {inbox.error || actionError ? <p className="sf-error text-sm" role="alert">{actionError ?? inbox.error}</p> : null}
                    {!inbox.loading && inbox.items.length === 0 ? <p className="text-sm">Sem notificações.</p> : null}
                    {inbox.items.length > 0 ? (
                        <ul className="space-y-3">
                            {inbox.items.map((item) => (
                                <li className={`rounded-xl border p-3 ${item.readAt ? "border-studyflow-border/10 bg-studyflow-page/30" : "border-studyflow-brand/35 bg-studyflow-page/60"}`} key={item.id}>
                                    <p className="text-xs font-medium uppercase text-studyflow-brandText">{getContextLabel(item)}</p>
                                    <strong className="block text-sm">{item.title}</strong>
                                    <p className="mt-1 text-sm">{item.body}</p>
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                                        {item.targetPath ? <a className="text-studyflow-brandText underline" href={item.targetPath} onClick={(event) => void openNotification(event, item)}>Abrir</a> : null}
                                        {!item.readAt ? <button className="text-studyflow-brandText underline" onClick={() => void run(() => inbox.markRead(item.id))} type="button">Marcar como lida</button> : null}
                                        <button className="text-studyflow-text/70 underline" onClick={() => void run(() => inbox.archive(item.id))} type="button">Arquivar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    {inbox.nextCursor ? <button className="sf-button-secondary mt-3 w-full" disabled={inbox.refreshing} onClick={() => void inbox.loadMore()} type="button">{inbox.refreshing ? "A carregar..." : "Carregar mais"}</button> : null}
                </section>
            ) : null}
        </div>
    );
}
