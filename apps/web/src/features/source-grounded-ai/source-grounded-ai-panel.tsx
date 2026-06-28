// apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx
/**
 * Implementa a funcionalidade frontend de IA com fontes obrigatórias e o respetivo contrato com a API.
 */
import { FormEvent, useState } from "react";
import { requestMf3Json } from "../mf3/request-mf3-json.js";

/**
 * Contrato de IA com fontes obrigatórias que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type SourceGroundedAnswer = {
    _id: string;
    sourceJobIds: string[];
    question: string;
    answer: string;
    citations: {
        sourceJobId: string;
        materialId: string;
        sourceLabel: string;
        locator: string;
        excerpt: string;
    }[];
    createdAt?: string;
};

/**
 * Pede resposta fundamentada em fontes indexadas.
 *
 * @param input Jobs autorizados e pergunta.
 * @returns Resposta com citações.
 */
export function askSourceGroundedAi(input: {
    sourceJobIds: string[];
    question: string;
}): Promise<SourceGroundedAnswer> {
    return requestMf3Json<SourceGroundedAnswer>(
        "/api/ai/source-grounded-answers",
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Painel de resposta com citações obrigatórias.
 *
 * @returns Formulário e resposta fundamentada.
 */
export function SourceGroundedAiPanel() {
    const [sourceJobIds, setSourceJobIds] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<SourceGroundedAnswer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Trata a ação do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a ação.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // O frontend envia apenas ids de jobs e pergunta; o backend decide se as fontes são legíveis.
            setAnswer(
                await askSourceGroundedAi({
                    sourceJobIds: sourceJobIds
                        .split(",")
                        .map((sourceJobId) => sourceJobId.trim())
                        .filter(Boolean),
                    question,
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao responder.");
        } finaly {
            setLoading(false);
        }
    }

    return (
        <section className="sf-panel space-y-4">
            <h2 className="text-lg font-semibold">Resposta com fontes</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <label className="block">
                    Jobs de indexação
                    <input
                        value={sourceJobIds}
                        onChange={(event) => setSourceJobIds(event.target.value)}
                    />
                </label>
                <label className="block">
                    Pergunta
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
                    {loading ? "A responder..." : "Responder"}
                </button>
            </form>
            {answer ? (
                <div className="space-y-3 text-sm">
                    <p className="whitespace-pre-line text-slate-800">{answer.answer}</p>
                    {answer.citations.map((citation) => (
                        <article
                            className="rounded-md border border-slate-200 p-3"
                            key={`${citation.sourceJobId}-${citation.locator}`}
                        >
                            <p className="font-medium text-slate-900">
                                {citation.sourceLabel} · {citation.locator}
                            </p>
                            {/* O excerto é limitado no backend para explicar a origem sem expor o material completo. */}
                            <p className="mt-1 text-slate-700">{citation.excerpt}</p>
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}