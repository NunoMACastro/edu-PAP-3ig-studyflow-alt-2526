/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { askPrivateAreaAi, PrivateAreaAiAnswer } from "../../lib/apiClient.js";

/**
 * Página do assistente IA privado por área.
 */
export function PrivateAreaAiPage({ studyAreaId }: { studyAreaId: string }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<PrivateAreaAiAnswer | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            setAnswer(await askPrivateAreaAi(studyAreaId, question));
            setQuestion("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar à IA.");
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA privada da área</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
                <button className="sf-button-primary" disabled={question.trim().length < 3}>
                    Perguntar
                </button>
            </form>
            {answer ? (
                <article className="sf-panel">
                    <p className="text-sm text-slate-600">{answer.question}</p>
                    <p className="mt-3 whitespace-pre-wrap">{answer.answer}</p>
                </article>
            ) : null}
        </section>
    );
}
