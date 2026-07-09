/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { askPrivateAreaAi, PrivateAreaAiAnswer } from "../../lib/apiClient.js";

/**
 * Props da pagina da IA privada; o backend valida ownership da area.
 */
type PrivateAreaAiPageProps = {
    studyAreaId: string;
};

/**
 * Página do assistente IA privado por área.
 *
 * @param props Identificador da area privada.
 * @returns Formulario de pergunta e resposta IA autorizada.
 */
export function PrivateAreaAiPage({ studyAreaId }: PrivateAreaAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<PrivateAreaAiAnswer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAsking, setIsAsking] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } =
        useActionFeedback();

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        try {
            setIsAsking(true);
            notifyLoading("A perguntar à IA privada...");

            // A UI envia apenas a pergunta; ownership, fontes e guardrails ficam no backend.
            setAnswer(await askPrivateAreaAi(studyAreaId, question));
            setQuestion("");
            notifySuccess("IA privada respondeu com fontes autorizadas.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar à IA.");
            notifyError("Não foi possível concluir o pedido à IA privada.");
        } finally {
            setIsAsking(false);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA privada da área</h1>
                {error ? <p className="sf-error">{error}</p> : null}

                <label className="block" htmlFor="privateAreaQuestion">
                    Pergunta
                    <textarea
                        disabled={isAsking}
                        id="privateAreaQuestion"
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={5}
                    />
                </label>

                <button
                    className="sf-button-primary"
                    disabled={isAsking || question.trim().length < 3}
                    type="submit"
                >
                    {isAsking ? "A perguntar..." : "Perguntar"}
                </button>
            </form>
            {answer ? (
                <article className="sf-panel">
                    <p className="text-sm text-studyflow-text">{answer.question}</p>
                    <p className="mt-3 whitespace-pre-wrap">{answer.answer}</p>
                </article>
            ) : null}
        </section>
    );
}
