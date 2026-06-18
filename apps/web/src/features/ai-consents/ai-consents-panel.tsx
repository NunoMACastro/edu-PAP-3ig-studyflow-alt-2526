// apps/web/src/features/ai-consents/ai-consents-panel.tsx
import { useEffect, useState } from "react";
import {
    grantAiConsent,
    loadAiConsents,
    revokeAiConsent,
} from "./ai-consents-client.js";
import type { AiConsent, AiConsentPurpose } from "./ai-consents-client.js";

const PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI",
    "STUDY_GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
];

/**
 * Painel de consentimentos IA por finalidade.
 */
export function AiConsentsPanel() {
    const [items, setItems] = useState<AiConsent[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingPurpose, setPendingPurpose] =
        useState<AiConsentPurpose | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiConsents()
            .then(setItems)
            .catch((caught: unknown) =>
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar consentimentos.",
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    /**
     * Alterna a decisão de uma finalidade e mantém feedback visível ao utilizador.
     */
    async function toggle(
        purpose: AiConsentPurpose,
        granted: boolean,
    ): Promise<void> {
        setError(null);
        setPendingPurpose(purpose);
        try {
            const saved = granted
                ? await revokeAiConsent(purpose)
                : await grantAiConsent(purpose);
            // Mantém o histórico visível colocando a decisão mais recente no topo.
            setItems((current) => [saved, ...current]);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível guardar a decisão.",
            );
        } finally {
            setPendingPurpose(null);
        }
    }

    return (
        <section aria-labelledby="ai-consents-title">
            <h2 id="ai-consents-title">Consentimentos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {loading ? <p>A carregar consentimentos...</p> : null}
            {PURPOSES.map((purpose) => {
                const latest = items.find((item) => item.purpose === purpose);
                const granted = latest?.status === "GRANTED";
                const pending = pendingPurpose === purpose;
                return (
                    <button
                        key={purpose}
                        type="button"
                        disabled={pending}
                        onClick={() => toggle(purpose, granted)}
                    >
                        {purpose}:{" "}
                        {pending ? "a guardar" : granted ? "revogar" : "conceder"}
                    </button>
                );
            })}
        </section>
    );
}