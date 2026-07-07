/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { askClassAi, ClassAiAnswer } from "../../lib/apiClient.js";

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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            setAnswer(await askClassAi(subjectId, question));
            setQuestion("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao perguntar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">IA da disciplina</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} />
                <button className="sf-button-primary" disabled={loading || question.trim().length < 4}>
                    Perguntar
                </button>
            </form>
            {answer ? (
                <article className="sf-panel space-y-3">
                    <h2 className="font-semibold">Resposta</h2>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{answer.answer}</p>
                    <p className="text-sm text-slate-600">Fontes oficiais: {answer.sources.map((source) => source.title).join(", ")}</p>
                </article>
            ) : null}
        </section>
    );
}
