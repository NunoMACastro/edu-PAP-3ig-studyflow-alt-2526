// apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx
/**
 * Implementa a funcionalidade frontend de IA com fontes obrigatórias.
 */
import { type FormEvent, useState } from "react";
import { messageKeys, t } from "../../lib/messages.js";
import {
    askSourceGroundedAi,
    SourceGroundedAnswer,
} from "./ask-source-grounded-ai.js";

/**
 * Painel de resposta fundamentada em fontes autorizadas.
 *
 * @returns Formulário e resposta fundamentada com citações.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Envia a pergunta para a API de IA fundamentada em fontes.
     *
     * @param event Submissão do formulário de pergunta.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            // A lista é normalizada no frontend, mas a autorização das fontes continua no backend.
            setAnswer(
                await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                }),
            );
        } catch {
            setError(t(messageKeys.sourceError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">{t(messageKeys.sourceTitle)}</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    {t(messageKeys.sourceJobIdsLabel)}
                    <input
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <label className="block">
                    {t(messageKeys.sourceQuestionLabel)}
                    <textarea
                        rows={3}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                </label>
                <button
                    className="sf-button-primary"
                    disabled={
                        loading ||
                        sourceJobIds.trim().length === 0 ||
                        question.trim().length < 5
                    }
                >
                    {loading ? t(messageKeys.sourceLoading) : t(messageKeys.sourceSubmit)}
                </button>
            </form>
            {answer ? (
                <div className="space-y-3 text-sm">
                    <h3 className="font-semibold">{t(messageKeys.sourceAnswerTitle)}</h3>
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.citations.length > 0 ? (
                        <div className="space-y-2">
                            <p className="font-semibold">{t(messageKeys.sourceCitationsTitle)}</p>
                            {answer.citations.map((citation) => (
                                <p
                                    className="rounded-md border border-slate-200 p-2"
                                    key={`${citation.sourceJobId}-${citation.locator}`}
                                >
                                    {citation.sourceLabel} · {citation.locator}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>{t(messageKeys.aiNoSources)}</p>
                    )}
                </div>
            ) : null}
        </section>
    );
}