/**
 * Implementa notificações in-app discretas para a shell autenticada.
 */
import { useEffect, useState } from "react";
import {
    type ContextNotification,
    listContextNotifications,
} from "../mf4/mf4-client.js";

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

    return (
        <div className="relative">
            <button
                aria-controls="studyflow-notification-tray"
                aria-expanded={open}
                className="sf-button-secondary"
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                Notificações ({items.length})
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
                        <p className="text-sm text-studyflow-alert">
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
                                    <p className="text-xs font-medium uppercase text-studyflow-brand">
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
