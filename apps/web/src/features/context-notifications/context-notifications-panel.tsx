// apps/web/src/features/context-notifications/context-notifications-panel.tsx
import { useEffect, useState } from "react";
import { ContextNotification, loadContextNotifications } from "./context-notifications-client.js";

/**
 * Painel simples para validar RF49 durante desenvolvimento.
 */
export function ContextNotificationsPanel() {
    const [items, setItems] = useState<ContextNotification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        loadContextNotifications()
            .then((nextItems) => {
                if (active) setItems(nextItems);
            })
            .catch((err: Error) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                // O flag evita setState depois de desmontar o componente.
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (loading) return <p>A carregar notificações...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
        <section aria-labelledby="context-notifications-title">
            <h2 id="context-notifications-title">Notificações</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        <small>{item.recipientIds.length} destinatários activos</small>
                    </li>
                ))}
            </ul>
        </section>
    );
}