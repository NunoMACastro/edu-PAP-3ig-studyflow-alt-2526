/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    AiContentReview,
    createAiContentReview,
    decideAiContentReview,
    listAiContentReviews,
} from "../../lib/apiClient.js";

const CONTENT_TYPE_LABELS: Record<AiContentReview["contentType"], string> = {
    SUMMARY: "Resumo",
    QUIZ: "Questionário",
};

const REVIEW_STATUS_LABELS: Record<AiContentReview["status"], string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
};

/**
 * Traduz os enums da revisão para labels adequados à interface docente.
 *
 * @param review Revisão devolvida pela API.
 * @returns Labels de tipo e estado em português.
 */
function getReviewLabels(review: AiContentReview): { contentType: string; status: string } {
    return {
        contentType: CONTENT_TYPE_LABELS[review.contentType],
        status: REVIEW_STATUS_LABELS[review.status],
    };
}

/**
 * Página docente para rever conteúdo gerado por IA.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherAiContentReviewsPage({ subjectId }: { subjectId: string }) {
    const [reviews, setReviews] = useState<AiContentReview[]>([]);
    const [materialId, setMaterialId] = useState("");
    const [contentType, setContentType] = useState<"SUMMARY" | "QUIZ">("SUMMARY");
    const [contentText, setContentText] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setReviews(await listAiContentReviews(subjectId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar revisões."),
        );
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createAiContentReview(subjectId, {
                materialId,
                contentType,
                contentJson: { text: contentText },
            });
            setMaterialId("");
            setContentText("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao criar revisão.");
        }
    }

    /**
     * Executa a operação decide no domínio de teacher com contrato explícito.
     *
     * @param reviewId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param status Estado funcional usado para decidir o próximo passo ou a resposta pública.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async function decide(reviewId: string, status: "APPROVED" | "REJECTED") {
        setError(null);
        try {
            await decideAiContentReview(reviewId, { status });
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao decidir revisão.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form className="sf-panel space-y-4" id="criar-revisao-ia" onSubmit={(event) => void handleCreate(event)}>
                <h1 className="text-xl font-bold">Revisões IA</h1>
                {error ? <p className="sf-error" role="alert">{error}</p> : null}
                <label className="block space-y-2">
                    <span>ID do material oficial</span>
                    <input value={materialId} onChange={(event) => setMaterialId(event.target.value)} />
                </label>
                <label className="block space-y-2">
                    <span>Tipo de conteúdo</span>
                    <select value={contentType} onChange={(event) => setContentType(event.target.value as "SUMMARY" | "QUIZ")}>
                        <option value="SUMMARY">Resumo</option>
                        <option value="QUIZ">Quiz</option>
                    </select>
                </label>
                <label className="block space-y-2">
                    <span>Conteúdo gerado a rever</span>
                    <textarea value={contentText} onChange={(event) => setContentText(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={!materialId.trim() || !contentText.trim()}>
                    Criar revisão
                </button>
            </form>
            <div className="grid gap-3">
                {reviews.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Sem conteúdo pendente de revisão.</p> : null}
                {reviews.map((review) => {
                    const labels = getReviewLabels(review);

                    return (
                        <article className="sf-panel space-y-2" key={review._id}>
                            <h2 className="font-semibold">{labels.contentType}</h2>
                            <p className="text-sm text-studyflow-text">{labels.status} · material {review.materialId}</p>
                            <pre className="overflow-auto rounded bg-studyflow-card p-3 text-xs">
                                {JSON.stringify(review.contentJson, null, 2)}
                            </pre>
                            {review.status === "PENDING" ? (
                                <div className="flex flex-wrap gap-2">
                                    <button className="sf-button-secondary" onClick={() => void decide(review._id, "APPROVED")}>Aprovar</button>
                                    <button className="sf-button-secondary" onClick={() => void decide(review._id, "REJECTED")}>Rejeitar</button>
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
