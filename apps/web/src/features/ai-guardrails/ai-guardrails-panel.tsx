// apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx
/**
 * Implementa a funcionalidade frontend de guardrails de IA e o respetivo contrato com a API.
 */
import { type FormEvent, useState } from "react";
import { messageKeys, t } from "../../lib/messages.js";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
} from "./check-ai-guardrails.js";

/**
 * Painel manual para validar guardrails de IA.
 *
 * @returns Formulário e decisão devolvida pelo backend.
 */
export function AiGuardrailsPanel() {
    const [contextType, setContextType] =
        useState<AiGuardrailContextType>("SOLO");
    const [resourceId, setResourceId] = useState("");
    const [prompt, setPrompt] = useState("");
    const [decision, setDecision] = useState<AiGuardrailDecision | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Envia o pedido ao backend e atualiza o estado visual do painel.
     *
     * @param event Submissão do formulário de guardrails.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setDecision(null);

        try {
            // A decisão continua a vir do backend; o catálogo só resolve texto visível.
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch {
            setError(t(messageKeys.guardrailsError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">
                {t(messageKeys.guardrailsTitle)}
            </h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    {t(messageKeys.guardrailsContextLabel)}
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">{t(messageKeys.guardrailsOptionSolo)}</option>
                        <option value="STUDY_ROOM">
                            {t(messageKeys.guardrailsOptionStudyRoom)}
                        </option>
                        <option value="CLASS_SUBJECT">
                            {t(messageKeys.guardrailsOptionClassSubject)}
                        </option>
                    </select>
                </label>
                <label className="block">
                    {t(messageKeys.guardrailsResourceLabel)}
                    <input
                        value={resourceId}
                        onChange={(event) => setResourceId(event.target.value)}
                    />
                </label>
                <label className="block">
                    {t(messageKeys.guardrailsPromptLabel)}
                    <textarea
                        rows={3}
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                    />
                </label>
                <button
                    className="sf-button-primary"
                    disabled={loading || prompt.trim().length < 5}
                >
                    {loading
                        ? t(messageKeys.guardrailsLoading)
                        : t(messageKeys.guardrailsSubmit)}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className={decision.allowed ? "text-emerald-700" : "text-red-700"}>
                        {decision.allowed
                            ? t(messageKeys.guardrailsAllowed)
                            : t(messageKeys.guardrailsBlocked)}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                </div>
            ) : null}
        </section>
    );
}