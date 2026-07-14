/**
 * Implementa a funcionalidade frontend de IA com fontes obrigatórias e o respetivo contrato com a API.
 */
import { type FormEvent, useState } from "react";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { messageKeys, t } from "../../lib/messages.js";
import {
    askSourceGroundedAi,
    SourceGroundedAnswer,
} from "./ask-source-grounded-ai.js";

/**
 * Painel de resposta com citações obrigatórias.
 *
 * @returns Formulário e resposta fundamentada.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const submitAction = useAsyncAction();
    const loading = submitAction.isPending;

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setAnswer(null);
        const nextAnswer = await submitAction.run(
            "ask-source-grounded-ai",
            async () => {
                try {
                    // O frontend envia apenas ids de jobs e pergunta; o backend decide se as fontes sao legiveis.
                    return await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                    });
                } catch {
                    // Este painel sempre apresentou a mensagem pública traduzida,
                    // independentemente do detalhe técnico devolvido pela API.
                    throw new Error(t(messageKeys.sourceError));
                }
            },
            t(messageKeys.sourceError),
        );
        if (nextAnswer) setAnswer(nextAnswer);
    }

    const canSubmit =
        !loading &&
        sourceJobIds
            .split(",")
            .map((sourceJobId) => sourceJobId.trim())
            .filter(Boolean).length > 0 &&
        question.trim().length >= 5;

    return (
        <section className="sf-surface space-y-4">
            <h2 className="text-lg font-semibold">{t(messageKeys.sourceTitle)}</h2>
            {submitAction.error ? (
                <p className="sf-error" role="alert">
                    {submitAction.error}
                </p>
            ) : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block" htmlFor="source-grounded-jobs">
                    {t(messageKeys.sourceJobIdsLabel)}
                    <input
                        aria-describedby="source-grounded-jobs-help"
                        id="source-grounded-jobs"
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <p id="source-grounded-jobs-help" className="text-xs text-studyflow-text">
                    {t(messageKeys.sourceJobIdsHelp)}
                </p>
                <label className="block" htmlFor="source-grounded-question">
                    {t(messageKeys.sourceQuestionLabel)}
                    <textarea
                        id="source-grounded-question"
                        rows={3}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                </label>
                <button className="sf-button-primary" disabled={!canSubmit}>
                    {loading ? t(messageKeys.sourceLoading) : t(messageKeys.sourceSubmit)}
                </button>
            </form>
            {!answer && !submitAction.error && !loading ? (
                <p className="text-sm text-studyflow-text">
                    {t(messageKeys.sourceEmptyState)}
                </p>
            ) : null}
            {answer ? (
                <div className="space-y-3 text-sm">
                    <h3 className="font-semibold">{t(messageKeys.sourceAnswerTitle)}</h3>
                    <p className="whitespace-pre-line text-studyflow-text">{answer.answer}</p>
                    {answer.citations.length > 0 ? (
                        <div className="space-y-2">
                            <p className="font-semibold">{t(messageKeys.sourceCitationsTitle)}</p>
                            {answer.citations.map((citation) => (
                                <article
                                    className="rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3"
                                    key={`${citation.sourceJobId}-${citation.locator}`}
                                >
                                    <p className="font-medium text-studyflow-text">
                                        {citation.sourceLabel} · {citation.locator}
                                    </p>
                                    {/* O excerto vem limitado do backend para explicar a origem sem expor o material completo. */}
                                    <p className="mt-1 text-studyflow-text">{citation.excerpt}</p>
                                </article>
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
