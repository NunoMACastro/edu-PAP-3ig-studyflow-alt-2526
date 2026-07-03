/**
 * Implementa a funcionalidade frontend de IA com conhecimento externo limitado e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import {
    askExternalKnowledgeAi,
    ExternalKnowledgeAnswer,
} from "./ask-external-knowledge-ai.js";

/**
 * Painel de conhecimento externo limitado.
 *
 * @returns Formulário e resposta separada por fontes internas/notas externas.
 */
export function ExternalKnowledgeAiPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [allowExternalKnowledge, setAllowExternalKnowledge] = useState(false);
    const [answer, setAnswer] = useState<ExternalKnowledgeAnswer | null>(null);
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
            setAnswer(
                await askExternalKnowledgeAi({
                    studyAreaId,
                    question,
                    allowExternalKnowledge,
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao responder.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Conhecimento externo</h2>
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
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={allowExternalKnowledge}
                        onChange={(event) => setAllowExternalKnowledge(event.target.checked)}
                    />
                    Permitir nota externa
                </label>
                <button className="sf-button-primary" disabled={loading || question.trim().length < 5}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-2 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    <p className="text-slate-600">
                        {answer.externalUsed ? "Nota externa usada" : "Só fontes internas"}
                    </p>
                </div>
            ) : null}
        </section>
    );
}
