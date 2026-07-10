/**
 * Implementa notificações in-app discretas para a shell autenticada.
 */
import { useEffect, useRef, useState } from "react";
import {
    type ContextNotification,
    listContextNotifications,
} from "../mf4/mf4-client.js";
import { IconTooltip, ShellIcon } from "../../components/layout/shell-icons.js";

type NotificationStatus = "loading" | "success" | "error";

/**
 * Traduz o contexto técnico para uma etiqueta curta e segura para a UI.
 *
 * @param notification Notificação devolvida pela API.
 * @returns Texto visível que enquadra o aviso.
 */
function getContextLabel(notification: ContextNotification): string {
    if (notification.contextType === "CLASS") return "Turma";
    if (notification.contextType === "GROUP") return "Grupo";
    return "Contexto";
}

/**
 * Painel discreto de notificações contextualizadas do utilizador autenticado.
 *
 * @returns Botão e painel com estados de carregamento, erro, vazio e lista.
 */
export function NotificationTray() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ContextNotification[]>([]);
    const [status, setStatus] = useState<NotificationStatus>("loading");
    const trayRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let active = true;

        listContextNotifications()
            .then((notifications) => {
                if (!active) return;
                // As notificações ficam apenas em memória React; não persistimos dados contextuais.
                setItems(notifications);
                setStatus("success");
            })
            .catch(() => {
                if (!active) return;
                setItems([]);
                setStatus("error");
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!open) return undefined;
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
    }, [open]);

    return (
        <div className="relative" ref={trayRef}>
            <button
                ref={buttonRef}
                aria-label={`Notificações (${items.length})`}
                aria-controls="studyflow-notification-tray"
                aria-expanded={open}
                className={
                    open
                        ? "group relative inline-flex h-11 w-11 items-center justify-center rounded-md bg-studyflow-brand text-white"
                        : "group relative inline-flex h-11 w-11 items-center justify-center rounded-md text-studyflow-text transition hover:bg-studyflow-navyHover"
                }
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                <ShellIcon className="h-5 w-5" name="bell" />
                {items.length > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-studyflow-brand px-1 text-center text-xs font-bold text-white">
                        {items.length}
                    </span>
                ) : null}
                <IconTooltip>{`Notificações (${items.length})`}</IconTooltip>
            </button>

            {open ? (
                <section
                    aria-label="Notificações contextualizadas"
                    className="absolute right-0 z-20 mt-2 max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-studyflow-border bg-studyflow-card p-4"
                    id="studyflow-notification-tray"
                >
                    {status === "loading" ? (
                        <p className="text-sm text-studyflow-text">A carregar notificações...</p>
                    ) : null}

                    {status === "error" ? (
                        <p className="text-sm text-studyflow-alertText">
                            Não foi possível carregar notificações.
                        </p>
                    ) : null}

                    {status === "success" && items.length === 0 ? (
                        <p className="text-sm text-studyflow-text">Sem notificações novas.</p>
                    ) : null}

                    {items.length > 0 ? (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li className="rounded-md bg-studyflow-page p-3" key={item.id}>
                                    <p className="text-xs font-medium uppercase text-studyflow-brandText">
                                        {getContextLabel(item)}
                                    </p>
                                    <strong className="block text-sm text-studyflow-text">
                                        {item.title}
                                    </strong>
                                    <p className="mt-1 text-sm text-studyflow-text">{item.body}</p>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}
