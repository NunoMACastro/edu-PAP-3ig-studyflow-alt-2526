/**
 * Implementa a funcionalidade frontend de adaptive explanations e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { askMf3AdaptiveExplanation } from "./ask-adaptive-explanation.js";

/**
 * Painel MF3 de explicações adaptadas ao perfil.
 *
 * @returns Formulário e explicação gerada.
 */
export function AdaptiveExplanationPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AdaptiveExplanation | null>(null);
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
            setAnswer(await askMf3AdaptiveExplanation({ studyAreaId, question }));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao responder.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Explicação adaptada</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Área
                    <input value={studyAreaId} onChange={(event) => setStudyAreaId(event.target.value)} />
                </label>
                <label className="block">
                    Pergunta
                    <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || question.trim().length < 5}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-2 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.suggestedNextSteps.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5">
                            {answer.suggestedNextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}
