// apps/web/src/features/notification-policies/notification-policies-panel.tsx
import { useEffect, useState } from "react";
import { loadNotificationPolicies, NotificationPolicy, saveNotificationPolicy } from "./notification-policies-client.js";

/**
 * Painel administrativo para quotas de notificação.
 */
export function NotificationPoliciesPanel() {
    const [policies, setPolicies] = useState<NotificationPolicy[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNotificationPolicies().then(setPolicies).catch((err: Error) => setError(err.message));
    }, []);

    async function togglePolicy(policy: NotificationPolicy) {
        try {
            const saved = await saveNotificationPolicy({ ...policy, enabled: !policy.enabled });
            setPolicies((items) => items.map((item) => (item.channel === saved.channel ? saved : item)));
        } catch (err) {
            // A falha fica visível para o admin e não altera estado local indevidamente.
            setError(err instanceof Error ? err.message : "Não foi possível guardar a política.");
        }
    }

    return (
        <section aria-labelledby="notification-policies-title">
            <h2 id="notification-policies-title">Políticas de notificação</h2>
            {error ? <p role="alert">{error}</p> : null}
            {policies.map((policy) => (
                <button key={policy.channel} type="button" onClick={() => togglePolicy(policy)}>
                    {policy.channel}: {policy.enabled ? "activo" : "inactivo"}
                </button>
            ))}
        </section>
    );
}