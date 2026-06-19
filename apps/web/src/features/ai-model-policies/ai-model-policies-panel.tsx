// apps/web/src/features/ai-model-policies/ai-model-policies-panel.tsx
import { useEffect, useState } from "react";
import { AiModelPolicy, loadAiModelPolicies, saveAiModelPolicy } from "./ai-model-policies-client.js";

/**
 * Painel admin de políticas IA.
 */
export function AiModelPoliciesPanel() {
    const [items, setItems] = useState<AiModelPolicy[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAiModelPolicies().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function toggle(policy: AiModelPolicy) {
        const saved = await saveAiModelPolicy({ ...policy, enabled: !policy.enabled });
        setItems((current) => current.map((item) => (item.purpose === saved.purpose ? saved : item)));
    }

    return (
        <section aria-labelledby="ai-model-policies-title">
            <h2 id="ai-model-policies-title">Modelos de IA</h2>
            {error ? <p role="alert">{error}</p> : null}
            {items.map((item) => <button key={item.purpose} type="button" onClick={() => toggle(item)}>{item.purpose}: {item.model}</button>)}
        </section>
    );
}