// apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx
/**
 * Painel React para perguntas com conhecimento externo limitado.
 */
import { FormEvent, useState } from "react";
import {
    askExternalKnowledgeAi,
    ExternalKnowledgeAnswer,
} from "./ask-external-knowledge-ai.js";

/**
 * Interface onde o aluno pede uma resposta com fontes internas e nota externa opcional.
 *
 * @returns Formulário, estados de execução e resultado explicado.
 */
export function ExternalKnowledgeAiPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [allowExternalKnowledge, setAllowExternalKnowledge] = useState(false);
    const [answer, setAnswer] = useState<ExternalKnowledgeAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const canSubmit = studyAreaId.trim().length > 0 && question.trim().length >= 5 && !loading;

    /**
     * Submete o formulário e sincroniza estados de UI.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // A UI envia apenas a intenção; permissões e ownership continuam no backend.
            setAnswer(
                await askExternalKnowledgeAi({
                    studyAreaId: studyAreaId.trim(),
                    question: question.trim(),
                    allowExternalKnowledge,
                }),
            );
        } catch (caught) {
            setAnswer(null);
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível obter resposta da IA.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4" aria-labelledby="external-knowledge-title">
            <header>
                <h2 id="external-knowledge-title" className="text-lg font-semibold">
                    Conhecimento externo limitado
                </h2>
                <p className="text-sm text-slate-600">
                    A resposta usa fontes internas como base e marca qualquer nota externa.
                </p>
            </header>

            {error ? (
                <p className="sf-error" role="alert">
                    {error}
                </p>
            ) : null}

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block text-sm font-medium" htmlFor="external-study-area">
                    Área de estudo
                </label>
                <input
                    id="external-study-area"
                    className="sf-input"
                    value={studyAreaId}
                    onChange={(event) => setStudyAreaId(event.target.value)}
                    placeholder="Id da área de estudo"
                />

                <label className="block text-sm font-medium" htmlFor="external-question">
                    Pergunta
                </label>
                <textarea
                    id="external-question"
                    className="sf-input min-h-28"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Escreve uma pergunta baseada nos teus materiais."
                />

                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={allowExternalKnowledge}
                        onChange={(event) => setAllowExternalKnowledge(event.target.checked)}
                    />
                    <span>
                        Permitir uma nota externa curta, separada das fontes internas.
                    </span>
                </label>

                <button className="sf-button-primary" type="submit" disabled={!canSubmit}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>

            {!answer && !loading && !error ? (
                <p className="text-sm text-slate-600">
                    Ainda não existe resposta para esta pergunta.
                </p>
            ) : null}

            {answer ? (
                <article className="space-y-3 text-sm" aria-live="polite">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    <p className="font-medium text-slate-700">
                        {answer.externalUsed ? "Nota externa usada" : "Só fontes internas"}
                    </p>

                    <section aria-labelledby="internal-citations-title">
                        <h3 id="internal-citations-title" className="font-semibold">
                            Fontes internas usadas
                        </h3>
                        <ul className="list-disc space-y-1 pl-5">
                            {answer.internalCitations.map((citation) => (
                                <li key={citation.materialId}>
                                    <strong>{citation.title}</strong>: {citation.excerpt}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {answer.externalNotes.length > 0 ? (
                        <section aria-labelledby="external-notes-title">
                            <h3 id="external-notes-title" className="font-semibold">
                                Notas externas
                            </h3>
                            <ul className="list-disc space-y-1 pl-5">
                                {answer.externalNotes.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </article>
            ) : null}
        </section>
    );
}