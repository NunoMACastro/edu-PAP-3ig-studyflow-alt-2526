// apps/web/src/features/ai-consents/ai-consents-panel.tsx
import { useEffect, useState } from "react";
import { AiConsent, AiConsentPurpose, grantAiConsent, loadAiConsents, revokeAiConsent } from "./ai-consents-client.js";

const PURPOSES: AiConsentPurpose[] = ["PRIVATE_AREA_AI", "STUDY_GROUP_AI", "CLASS_AI", "PROJECT_AI"];

/**
 * Painel de consentimentos IA por finalidade.
 */
export function AiConsentsPanel() {
    const [items, setItems] = useState<AiConsent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiConsents().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function toggle(purpose: AiConsentPurpose, granted: boolean) {
        const saved = granted ? await revokeAiConsent(purpose) : await grantAiConsent(purpose);
        // Mantém o histórico visível colocando a decisão mais recente no topo.
        setItems((current) => [saved, ...current]);
    }

    return (
        <section aria-labelledby="ai-consents-title">
            <h2 id="ai-consents-title">Consentimentos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {PURPOSES.map((purpose) => {
                const latest = items.find((item) => item.purpose === purpose);
                const granted = latest?.status === "GRANTED";
                return <button key={purpose} type="button" onClick={() => toggle(purpose, granted)}>{purpose}: {granted ? "revogar" : "conceder"}</button>;
            })}
        </section>
    );
}