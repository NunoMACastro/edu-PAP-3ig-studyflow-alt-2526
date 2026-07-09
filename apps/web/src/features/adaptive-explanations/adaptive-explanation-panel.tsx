/**
 * Painel React para explicações adaptadas ao perfil do aluno.
 */
import { FormEvent, useState } from "react";
import { AdaptiveExplanation } from "../../lib/apiClient.js";
import { askMf3AdaptiveExplanation } from "./ask-adaptive-explanation.js";

/**
 * Formulário simples para pedir e apresentar uma explicação adaptada.
 *
 * @returns Componente com estados de vazio, loading, erro e sucesso.
 */
export function AdaptiveExplanationPanel() {
    const [studyAreaId, setStudyAreaId] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AdaptiveExplanation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = studyAreaId.trim().length === 24 && question.trim().length >= 5;

    /**
     * Envia o pedido ao backend e atualiza apenas estado visual.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!canSubmit) {
            setError("Escolhe uma área válida e escreve uma pergunta com pelo menos 5 caracteres.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            // A autorização fica no backend; a UI só recolhe input e mostra o resultado.
            setAnswer(
                await askMf3AdaptiveExplanation({
                    studyAreaId: studyAreaId.trim(),
                    question: question.trim(),
                }),
            );
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível gerar a explicação adaptada.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4" aria-labelledby="adaptive-explanation-title">
            <header>
                <h2 id="adaptive-explanation-title" className="text-lg font-semibold">
                    Explicação adaptada
                </h2>
                <p className="text-sm text-studyflow-text">
                    A resposta usa o perfil pedagógico guardado para esta área.
                </p>
            </header>

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block text-sm font-medium" htmlFor="adaptive-study-area-id">
                    Área de estudo
                </label>
                <input
                    id="adaptive-study-area-id"
                    className="sf-input"
                    value={studyAreaId}
                    onChange={(event) => setStudyAreaId(event.target.value)}
                    placeholder="ID da área de estudo"
                />

                <label className="block text-sm font-medium" htmlFor="adaptive-question">
                    Pergunta
                </label>
                <textarea
                    id="adaptive-question"
                    className="sf-input min-h-28"
                    rows={4}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Escreve a dúvida que queres esclarecer."
                />

                <button className="sf-button-primary" disabled={loading || !canSubmit}>
                    {loading ? "A adaptar explicação..." : "Gerar explicação"}
                </button>
            </form>

            {error ? <p className="sf-error" role="alert">{error}</p> : null}

            {!answer && !loading && !error ? (
                <p className="text-sm text-studyflow-text">
                    Ainda não existe uma explicação nesta sessão.
                </p>
            ) : null}

            {answer ? (
                <article className="space-y-3 rounded border border-studyflow-border p-4">
                    <p className="whitespace-pre-line text-sm text-studyflow-text">{answer.answer}</p>
                    {answer.suggestedNextSteps.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-studyflow-text">
                            {answer.suggestedNextSteps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    ) : null}
                </article>
            ) : null}
        </section>
    );
}
