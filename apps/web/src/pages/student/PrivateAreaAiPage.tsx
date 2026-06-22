// apps/web/src/pages/student/PrivateAreaAiPage.tsx
import { FormEvent, useState } from "react";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { askPrivateAreaAi, PrivateAreaAiAnswer } from "../../lib/apiClient.js";

/**
 * Props da página de IA privada.
 */
type PrivateAreaAiPageProps = {
    /** Área privada usada pelo backend para validar ownership e fontes autorizadas. */
    studyAreaId: string;
};

/**
 * Página do assistente IA privado por área.
 *
 * @param props Identificador da área privada.
 * @returns Formulário de pergunta e resposta IA autorizada.
 */
export function PrivateAreaAiPage({ studyAreaId }: PrivateAreaAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<PrivateAreaAiAnswer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAsking, setIsAsking] = useState(false);
    const { clearFeedback, notifyError, notifyLoading, notifySuccess } = useActionFeedback();

    /**
     * Envia uma pergunta para a IA privada da área autenticada.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de receber resposta ou erro.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        clearFeedback();

        try {
            setIsAsking(true);
            notifyLoading("A perguntar à IA privada...");

            // O backend limita fontes e ownership; a UI não envia userId nem decide permissões.
            const createdAnswer = await askPrivateAreaAi(studyAreaId, question);
            setAnswer(createdAnswer);
            setQuestion("");
            notifySuccess("IA privada respondeu com fontes autorizadas.");
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Erro ao perguntar à IA.";
            setError(message);
            // Não repetimos a pergunta nem a resposta no feedback global para proteger conteúdo privado.
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
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={5}
                        value={question}
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
                    <p className="text-sm text-slate-600">{answer.question}</p>
                    <p className="mt-3 whitespace-pre-wrap">{answer.answer}</p>
                </article>
            ) : null}
        </section>
    );
}
