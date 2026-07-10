/**
 * Implementa a funcionalidade frontend de IA coletiva do grupo e o respetivo contrato com a API.
 */
import { FormEvent, useEffect, useState } from "react";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { askStudyGroupAi, StudyGroupAiAnswer } from "./ask-study-group-ai.js";

/**
 * Props do componente React de IA coletiva do grupo; mantêm explícitas as dependências vindas da página.
 */
type StudyGroupAiPanelProps = {
    initialGroupId?: string | null;
};

/**
 * Painel de IA coletiva.
 *
 * @param props Grupo selecionado pela página agregadora.
 * @returns Formulário e resposta.
 */
export function StudyGroupAiPanel({ initialGroupId }: StudyGroupAiPanelProps) {
    const [groupId, setGroupId] = useState(initialGroupId ?? "");
    const [question, setQuestion] = useState("");
    const [sourceShareIds, setSourceShareIds] = useState("");
    const [answer, setAnswer] = useState<StudyGroupAiAnswer | null>(null);
    const submitAction = useAsyncAction();
    const loading = submitAction.isPending;

    useEffect(() => {
        setGroupId(initialGroupId ?? "");
    }, [initialGroupId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const nextAnswer = await submitAction.run(
            "ask-study-group-ai",
            () =>
                askStudyGroupAi(groupId, {
                    question,
                    sourceShareIds: sourceShareIds
                        .split(",")
                        .map((sourceId) => sourceId.trim())
                        .filter(Boolean),
                }),
            "Erro ao responder.",
        );
        if (nextAnswer) setAnswer(nextAnswer);
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">IA coletiva</h2>
            {submitAction.error ? (
                <p className="sf-error" role="alert">{submitAction.error}</p>
            ) : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Grupo
                    <input value={groupId} onChange={(event) => setGroupId(event.target.value)} />
                </label>
                <label className="block">
                    Fontes
                    <input value={sourceShareIds} onChange={(event) => setSourceShareIds(event.target.value)} />
                </label>
                <label className="block">
                    Pergunta
                    <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={loading || !groupId || question.trim().length < 5}>
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-2 text-sm">
                    <p className="whitespace-pre-line text-studyflow-text">{answer.answer}</p>
                    {answer.sources.map((source) => (
                        <p className="text-studyflow-text" key={source.shareId}>{source.title}</p>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
