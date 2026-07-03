// apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx
/**
 * Mostra uma interface simples para validar guardrails IA antes do provider.
 */
import { FormEvent, useState } from "react";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
    isAiSafetyBlock,
} from "./check-ai-guardrails.js";

/**
 * Painel manual para validar guardrails IA.
 *
 * @returns Formulário e decisão do backend.
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
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a validação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setDecision(null);

        try {
            // A UI envia o pedido, mas a decisão de segurança fica sempre no backend.
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao validar.");
        } finally {
            setLoading(false);
        }
    }

    const canSubmit = resourceId.trim().length >= 3 && prompt.trim().length >= 5;

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Guardrails IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form
                className="space-y-3"
                onSubmit={(event) => void handleSubmit(event)}
            >
                <label className="block">
                    Contexto
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">Área privada</option>
                        <option value="STUDY_ROOM">Sala de estudo</option>
                        <option value="CLASS_SUBJECT">Disciplina</option>
                    </select>
                </label>
                <label className="block">
                    Recurso
                    <input
                        value={resourceId}
                        onChange={(event) => setResourceId(event.target.value)}
                    />
                </label>
                <label className="block">
                    Pedido
                    <textarea
                        rows={3}
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                    />
                </label>
                <button className="sf-button-primary" disabled={loading || !canSubmit}>
                    {loading ? "A validar..." : "Validar"}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p
                        className={
                            decision.allowed ? "text-emerald-700" : "text-red-700"
                        }
                    >
                        {decision.allowed ? "Permitido" : "Bloqueado"}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                    {isAiSafetyBlock(decision) ? (
                        <p className="mt-2 text-slate-600">
                            Este bloqueio protege a segurança ética da IA antes de
                            qualquer resposta ser gerada.
                        </p>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}