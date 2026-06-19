// apps/web/src/features/audit-log/audit-log-panel.tsx
import { useEffect, useState } from "react";
import { AuditEvent, loadAuditEvents } from "./audit-log-client.js";

/**
 * Painel administrativo de auditoria.
 */
export function AuditLogPanel() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAuditEvents().then(setEvents).catch((err: Error) => setError(err.message));
    }, []);

    return (
        <section aria-labelledby="audit-log-title">
            <h2 id="audit-log-title">Auditoria</h2>
            {error ? <p role="alert">{error}</p> : null}
            <ol>{events.map((event) => <li key={event._id}>{event.domain} - {event.action} - {event.result}</li>)}</ol>
        </section>
    );
}