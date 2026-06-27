/**
 * Implementa a funcionalidade frontend de ai guardrails e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import {
    AiGuardrailContextType,
    AiGuardrailDecision,
    checkAiGuardrails,
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
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setDecision(await checkAiGuardrails({ contextType, resourceId, prompt }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao validar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Guardrails IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Contexto
                    <select
                        value={contextType}
                        onChange={(event) =>
                            setContextType(event.target.value as AiGuardrailContextType)
                        }
                    >
                        <option value="SOLO">Solo</option>
                        <option value="STUDY_ROOM">Grupo</option>
                        <option value="CLASS_SUBJECT">Disciplina</option>
                    </select>
                </label>
                <label className="block">
                    Recurso
                    <input value={resourceId} onChange={(event) => setResourceId(event.target.value)} />
                </label>
                <label className="block">
                    Pedido
                    <textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || prompt.trim().length < 5}>
                    {loading ? "A validar..." : "Validar"}
                </button>
            </form>
            {decision ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                    <p className={decision.allowed ? "text-emerald-700" : "text-red-700"}>
                        {decision.allowed ? "Permitido" : "Bloqueado"}
                    </p>
                    <p className="text-slate-700">{decision.reason}</p>
                </div>
            ) : null}
        </section>
    );
}
