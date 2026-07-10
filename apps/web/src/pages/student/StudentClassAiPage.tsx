/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { askClassAi, ClassAiAnswer } from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudentClassAiPageProps = {
    subjectId: string;
};

/**
 * Página da IA limitada da disciplina.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassAiPage({ subjectId }: StudentClassAiPageProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<ClassAiAnswer | null>(null);
    const askAction = useAsyncAction();

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        const nextAnswer = await askAction.run(
            "ask-class-ai",
            () => askClassAi(subjectId, question),
            "Erro ao perguntar.",
        );
        if (nextAnswer) {
            setAnswer(nextAnswer);
            setQuestion("");
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da disciplina</h1>
                {askAction.error ? <p className="sf-error" role="alert">{askAction.error}</p> : null}
                <label className="block space-y-2">
                    <span>Pergunta sobre a disciplina</span>
                    <textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={askAction.isPending || question.trim().length < 4}>
                    {askAction.isPending ? "A perguntar..." : "Perguntar"}
                </button>
            </form>
            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
                    <p className="whitespace-pre-wrap text-sm text-studyflow-text">{answer.answer}</p>
                    <p className="text-sm text-studyflow-text">Fontes oficiais: {answer.sources.map((source) => source.title).join(", ")}</p>
                </article>
            ) : null}
        </section>
    );
}
