/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { SectionHeader } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
import { useActionFeedback } from "../../features/mf5/action-feedback.js";
import { askPrivateAreaAi, PrivateAreaAiAnswer } from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

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
    const askAction = useAsyncAction();
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
        clearFeedback();
        notifyLoading("A perguntar à IA privada...");
        const nextAnswer = await askAction.run(
            "ask-private-ai",
            () => askPrivateAreaAi(studyAreaId, question),
            "Erro ao perguntar à IA.",
        );
        if (nextAnswer) {
            setAnswer(nextAnswer);
            setQuestion("");
            notifySuccess("IA privada respondeu com fontes autorizadas.");
        } else {
            notifyError("Não foi possível concluir o pedido à IA privada.");
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader description="Faz perguntas com contexto limitado aos materiais autorizados desta área privada." title="IA privada da área" />
            <Surface as="form" className="max-w-4xl space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <SectionHeader description="A resposta permanece no teu contexto privado." title="Fazer uma pergunta" />
                {askAction.error ? <p className="sf-error" role="alert">{askAction.error}</p> : null}
                <FormField id="privateAreaQuestion" label="Pergunta">
                    <textarea
                        disabled={askAction.isPending}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={5}
                    />
                </FormField>

                <button
                    className="sf-button-primary"
                    disabled={askAction.isPending || question.trim().length < 3}
                    type="submit"
                >
                    {askAction.isPending ? "A perguntar..." : "Perguntar"}
                </button>
            </Surface>
            {answer ? (
                <Surface as="article" className="space-y-3" variant="subtle">
                    <SectionHeader title="Resposta" />
                    <p className="text-sm text-studyflow-text">{answer.question}</p>
                    <p className="mt-3 whitespace-pre-wrap">{answer.answer}</p>
                </Surface>
            ) : null}
        </section>
    );
}
