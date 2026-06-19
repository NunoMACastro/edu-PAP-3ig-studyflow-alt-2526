// apps/web/src/features/ai-quotas/ai-quotas-panel.tsx
import { useState } from "react";
import { saveAiQuotaPolicy } from "./ai-quotas-client.js";

/**
 * Painel admin mínimo para configurar quota IA global por utilizador.
 */
export function AiQuotasPanel() {
    const [limit, setLimit] = useState(100);
    const [message, setMessage] = useState<string | null>(null);

    async function save() {
        await saveAiQuotaPolicy({ scopeType: "USER", purpose: "PRIVATE_AREA_AI", monthlyLimit: limit });
        setMessage("Quota guardada.");
    }

    return (
        <section aria-labelledby="ai-quotas-title">
            <h2 id="ai-quotas-title">Quotas de IA</h2>
            {message ? <p>{message}</p> : null}
            <label>Limite mensal<input type="number" min={1} value={limit} onChange={(event) => setLimit(Number(event.target.value))} /></label>
            <button type="button" onClick={save}>Guardar quota</button>
        </section>
    );
}