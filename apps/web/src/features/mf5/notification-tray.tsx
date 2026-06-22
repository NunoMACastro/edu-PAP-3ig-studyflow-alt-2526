// apps/web/src/features/mf5/notification-tray.tsx
import { useEffect, useState } from "react";
import {
    ContextNotification,
    listContextNotifications,
} from "../mf4/mf4-client.js";

type NotificationStatus = "loading" | "success" | "error";

/**
 * Converte o contexto técnico numa palavra curta para a interface.
 *
 * @param notification Notificação recebida da API.
 * @returns Texto visível para enquadrar o aviso.
 */
function getContextLabel(notification: ContextNotification): string {
    if (notification.contextType === "CLASS") return "Turma";
    if (notification.contextType === "GROUP") return "Grupo";
    return "Contexto";
}

/**
 * Painel discreto de notificações autenticadas do StudyFlow.
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
                // As notificações ficam apenas em memória React para reduzir exposição de dados.
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

    const countLabel = items.length === 1 ? "1" : String(items.length);

    return (
        <div className="relative">
            <button
                aria-controls="studyflow-notification-tray"
                aria-expanded={open}
                className="sf-button-secondary"
                onClick={() => setOpen((current) => !current)}
                type="button"
            >
                Notificações ({countLabel})
            </button>

            {open ? (
                <section
                    aria-label="Notificações contextualizadas"
                    className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-slate-200 bg-white p-4 shadow-lg"
                    id="studyflow-notification-tray"
                >
                    {status === "loading" ? (
                        <p className="text-sm text-slate-600">A carregar notificações...</p>
                    ) : null}

                    {status === "error" ? (
                        <p className="text-sm text-red-700">Não foi possível carregar notificações.</p>
                    ) : null}

                    {status === "success" && items.length === 0 ? (
                        <p className="text-sm text-slate-600">Sem notificações novas.</p>
                    ) : null}

                    {items.length > 0 ? (
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li className="rounded-md bg-slate-50 p-3" key={item.id}>
                                    <p className="text-xs font-medium uppercase text-teal-700">
                                        {getContextLabel(item)}
                                    </p>
                                    <strong className="block text-sm text-slate-900">{item.title}</strong>
                                    <p className="mt-1 text-sm text-slate-700">{item.body}</p>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}