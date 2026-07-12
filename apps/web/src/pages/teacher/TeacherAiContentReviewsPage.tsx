/**
 * Fila docente de curadoria de conteúdo IA ligado a materiais oficiais.
 */
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import {
    EmptyState,
    InlineNotice,
    StatusBadge,
    Toolbar,
} from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";
import {
    AiContentReview,
    createAiContentReview,
    decideAiContentReview,
    listAiContentReviews,
    listOfficialMaterials,
    OfficialMaterial,
} from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";

type ReviewStatusFilter = AiContentReview["status"] | "ALL";
type ReviewTypeFilter = AiContentReview["contentType"] | "ALL";
type DraftQuizQuestion = {
    question: string;
    options: string[];
    correctOptionIndex: number | null;
    explanation: string;
};

const TYPE_LABELS = { SUMMARY: "Resumo", QUIZ: "Quiz" } as const;
const STATUS_LABELS = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
} as const;

function emptyQuizQuestion(): DraftQuizQuestion {
    return {
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: null,
        explanation: "",
    };
}

function reviewQuestions(review: AiContentReview) {
    if (!Array.isArray(review.contentJson.questions)) return [];
    return review.contentJson.questions.flatMap((raw) => {
        if (!raw || typeof raw !== "object") return [];
        const item = raw as Record<string, unknown>;
        if (
            typeof item.question !== "string" ||
            !Array.isArray(item.options) ||
            !item.options.every((option) => typeof option === "string")
        ) return [];
        return [{
            question: item.question,
            options: item.options as string[],
            correctOptionIndex:
                typeof item.correctOptionIndex === "number"
                    ? item.correctOptionIndex
                    : null,
            explanation:
                typeof item.explanation === "string" ? item.explanation : "",
        }];
    });
}

function statusTone(status: AiContentReview["status"]) {
    if (status === "REJECTED") return "danger" as const;
    if (status === "APPROVED") return "brand" as const;
    return "attention" as const;
}

/** Página docente para criar, rever e decidir conteúdo IA oficial. */
export function TeacherAiContentReviewsPage({ subjectId }: { subjectId: string }) {
    const [reviews, setReviews] = useState<AiContentReview[]>([]);
    const [materials, setMaterials] = useState<OfficialMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [status, setStatus] = useState<ReviewStatusFilter>("PENDING");
    const [type, setType] = useState<ReviewTypeFilter>("ALL");
    const [selectedReview, setSelectedReview] = useState<AiContentReview | null>(null);
    const [decisionComment, setDecisionComment] = useState("");
    const [decisionError, setDecisionError] = useState<string | null>(null);
    const [deciding, setDeciding] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [materialId, setMaterialId] = useState("");
    const [contentType, setContentType] = useState<"SUMMARY" | "QUIZ">("SUMMARY");
    const [summaryText, setSummaryText] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<DraftQuizQuestion[]>([
        emptyQuizQuestion(),
    ]);
    const [createError, setCreateError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    useHashSidePanel("#criar-revisao-ia", setCreateOpen);

    const processedMaterials = useMemo(
        () => materials.filter((material) => material.status === "PROCESSED"),
        [materials],
    );
    const visibleReviews = useMemo(
        () => reviews.filter((review) =>
            (status === "ALL" || review.status === status) &&
            (type === "ALL" || review.contentType === type),
        ),
        [reviews, status, type],
    );

    async function refresh(): Promise<void> {
        const [nextReviews, nextMaterials] = await Promise.all([
            listAiContentReviews(subjectId),
            listOfficialMaterials(subjectId),
        ]);
        setReviews(nextReviews);
        setMaterials(nextMaterials);
        setSelectedReview((current) =>
            current
                ? nextReviews.find((review) => review._id === current._id) ?? null
                : null,
        );
    }

    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError(null);
        Promise.all([
            listAiContentReviews(subjectId),
            listOfficialMaterials(subjectId),
        ])
            .then(([nextReviews, nextMaterials]) => {
                if (!active) return;
                setReviews(nextReviews);
                setMaterials(nextMaterials);
            })
            .catch((caught: unknown) => {
                if (active) setLoadError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar as revisões.",
                );
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [subjectId]);

    function openReview(review: AiContentReview): void {
        setSelectedReview(review);
        setDecisionComment(review.teacherComment ?? "");
        setDecisionError(null);
        setSuccess(null);
    }

    async function decide(statusToApply: "APPROVED" | "REJECTED"): Promise<void> {
        if (!selectedReview || deciding) return;
        if (statusToApply === "REJECTED" && decisionComment.trim().length < 5) {
            setDecisionError("Indica um motivo com pelo menos 5 caracteres.");
            return;
        }
        setDeciding(true);
        setDecisionError(null);
        try {
            const updated = await decideAiContentReview(selectedReview._id, {
                status: statusToApply,
                teacherComment: decisionComment.trim() || undefined,
            });
            setReviews((current) =>
                current.map((review) => review._id === updated._id ? updated : review),
            );
            setSelectedReview(null);
            setSuccess(
                statusToApply === "APPROVED"
                    ? "Conteúdo aprovado e disponível aos alunos da disciplina."
                    : "Conteúdo rejeitado e retirado da área dos alunos.",
            );
        } catch (caught) {
            setDecisionError(
                caught instanceof Error ? caught.message : "Não foi possível guardar a decisão.",
            );
        } finally {
            setDeciding(false);
        }
    }

    async function handleCreate(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (creating) return;
        setCreating(true);
        setCreateError(null);
        try {
            const contentJson = contentType === "SUMMARY"
                ? { text: summaryText.trim() }
                : {
                      questions: quizQuestions.map((question) => ({
                          question: question.question.trim(),
                          options: question.options.map((option) => option.trim()),
                          correctOptionIndex: question.correctOptionIndex,
                          explanation: question.explanation.trim(),
                      })),
                  };
            await createAiContentReview(subjectId, {
                materialId,
                contentType,
                contentJson,
            });
            setMaterialId("");
            setSummaryText("");
            setQuizQuestions([emptyQuizQuestion()]);
            await refresh();
            setCreateOpen(false);
            setStatus("PENDING");
            setSuccess("Revisão criada e adicionada à fila de pendentes.");
        } catch (caught) {
            setCreateError(
                caught instanceof Error ? caught.message : "Não foi possível criar a revisão.",
            );
        } finally {
            setCreating(false);
        }
    }

    function updateQuestion(index: number, next: DraftQuizQuestion): void {
        setQuizQuestions((current) =>
            current.map((question, questionIndex) =>
                questionIndex === index ? next : question,
            ),
        );
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={
                    <button
                        aria-expanded={createOpen}
                        className="sf-button-primary"
                        onClick={() => setCreateOpen(true)}
                        type="button"
                    >
                        Nova revisão
                    </button>
                }
                description="Revê conteúdos associados a materiais oficiais. Ao aprovar, ficam disponíveis aos alunos da disciplina."
                title="Revisões IA"
            />

            {loadError ? <InlineNotice role="alert" tone="danger">{loadError}</InlineNotice> : null}
            {success ? <InlineNotice role="status" tone="brand">{success}</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar revisões...</InlineNotice> : null}

            {!loading && !loadError ? (
                <>
                    <Toolbar ariaLabel="Filtros da fila de revisões IA">
                        <label className="space-y-1 text-sm">
                            <span className="font-semibold">Estado</span>
                            <select value={status} onChange={(event) => setStatus(event.target.value as ReviewStatusFilter)}>
                                <option value="PENDING">Pendentes</option>
                                <option value="APPROVED">Aprovadas</option>
                                <option value="REJECTED">Rejeitadas</option>
                                <option value="ALL">Todas</option>
                            </select>
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-semibold">Tipo</span>
                            <select value={type} onChange={(event) => setType(event.target.value as ReviewTypeFilter)}>
                                <option value="ALL">Resumos e quizzes</option>
                                <option value="SUMMARY">Resumos</option>
                                <option value="QUIZ">Quizzes</option>
                            </select>
                        </label>
                    </Toolbar>

                    {visibleReviews.length === 0 ? (
                        <EmptyState
                            icon="spark"
                            title="Sem revisões neste filtro"
                            description={reviews.length === 0
                                ? "Cria uma revisão a partir de um material oficial processado."
                                : "Altera os filtros para consultar outras decisões."}
                        />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {visibleReviews.map((review) => (
                                <article className="sf-list-card space-y-3" key={review._id}>
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studyflow-brandText">
                                                {TYPE_LABELS[review.contentType]}
                                            </p>
                                            <h2 className="mt-1 font-semibold">{review.materialTitle}</h2>
                                        </div>
                                        <StatusBadge tone={statusTone(review.status)}>
                                            {STATUS_LABELS[review.status]}
                                        </StatusBadge>
                                    </div>
                                    <dl className="grid gap-1 text-sm text-studyflow-text/65">
                                        <div><dt className="inline font-semibold">Criada: </dt><dd className="inline">{formatDatePt(review.createdAt)}</dd></div>
                                        {review.decidedAt ? <div><dt className="inline font-semibold">Decisão: </dt><dd className="inline">{formatDatePt(review.decidedAt)}</dd></div> : null}
                                    </dl>
                                    <button className="sf-button-secondary" onClick={() => openReview(review)} type="button">
                                        Rever conteúdo
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            ) : null}

            <SidePanel
                closeDisabled={deciding}
                description={selectedReview ? `Material oficial: ${selectedReview.materialTitle}` : "Detalhe da revisão docente."}
                onClose={() => setSelectedReview(null)}
                open={Boolean(selectedReview)}
                title={selectedReview ? `${TYPE_LABELS[selectedReview.contentType]} para revisão` : "Revisão IA"}
            >
                {selectedReview ? (
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge tone={statusTone(selectedReview.status)}>{STATUS_LABELS[selectedReview.status]}</StatusBadge>
                            <StatusBadge>{formatDatePt(selectedReview.createdAt)}</StatusBadge>
                        </div>
                        <ReviewContent review={selectedReview} />
                        {selectedReview.teacherComment ? (
                            <div className="sf-surface">
                                <p className="text-sm font-semibold">Comentário da decisão atual</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm">{selectedReview.teacherComment}</p>
                            </div>
                        ) : null}
                        {decisionError ? <InlineNotice role="alert" tone="danger">{decisionError}</InlineNotice> : null}
                        <label className="block space-y-2">
                            <span className="font-semibold">Comentário docente</span>
                            <textarea
                                maxLength={1000}
                                onChange={(event) => setDecisionComment(event.target.value)}
                                placeholder="Obrigatório ao rejeitar; opcional ao aprovar."
                                rows={4}
                                value={decisionComment}
                            />
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {selectedReview.status !== "APPROVED" ? (
                                <button className="sf-button-primary" disabled={deciding} onClick={() => void decide("APPROVED")} type="button">
                                    {selectedReview.status === "REJECTED" ? "Reaprovar" : "Aprovar"}
                                </button>
                            ) : null}
                            {selectedReview.status !== "REJECTED" ? (
                                <button className="sf-button-secondary" disabled={deciding} onClick={() => void decide("REJECTED")} type="button">
                                    {selectedReview.status === "APPROVED" ? "Retirar dos alunos" : "Rejeitar"}
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </SidePanel>

            <SidePanel
                closeDisabled={creating}
                description="Escolhe um material processado e regista conteúdo estruturado para decisão docente."
                onClose={() => setCreateOpen(false)}
                open={createOpen}
                title="Criar revisão IA"
            >
                <form className="space-y-5" id="criar-revisao-ia" onSubmit={(event) => void handleCreate(event)}>
                    {createError ? <InlineNotice role="alert" tone="danger">{createError}</InlineNotice> : null}
                    {processedMaterials.length === 0 ? (
                        <EmptyState
                            action={<a className="sf-button-secondary" href={`/app/professor/disciplinas/${subjectId}/materiais`}>Gerir materiais</a>}
                            description="É necessário pelo menos um material oficial processado."
                            icon="book"
                            title="Sem materiais processados"
                        />
                    ) : (
                        <>
                            <label className="block space-y-2">
                                <span className="font-semibold">Material oficial</span>
                                <select required value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
                                    <option value="">Seleciona um material</option>
                                    {processedMaterials.map((material) => <option key={material._id} value={material._id}>{material.title}</option>)}
                                </select>
                            </label>
                            <label className="block space-y-2">
                                <span className="font-semibold">Tipo de conteúdo</span>
                                <select value={contentType} onChange={(event) => setContentType(event.target.value as "SUMMARY" | "QUIZ")}>
                                    <option value="SUMMARY">Resumo</option>
                                    <option value="QUIZ">Quiz</option>
                                </select>
                            </label>
                            {contentType === "SUMMARY" ? (
                                <label className="block space-y-2">
                                    <span className="font-semibold">Resumo a rever</span>
                                    <textarea minLength={20} maxLength={20000} required rows={10} value={summaryText} onChange={(event) => setSummaryText(event.target.value)} />
                                    <span className="text-xs text-studyflow-text/60">Entre 20 e 20 000 caracteres.</span>
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    {quizQuestions.map((question, questionIndex) => (
                                        <fieldset className="sf-list-card space-y-3" key={questionIndex}>
                                            <legend className="font-semibold">Pergunta {questionIndex + 1}</legend>
                                            <label className="block space-y-1">
                                                <span>Enunciado</span>
                                                <textarea minLength={5} maxLength={1000} required value={question.question} onChange={(event) => updateQuestion(questionIndex, { ...question, question: event.target.value })} />
                                            </label>
                                            {question.options.map((option, optionIndex) => (
                                                <label className="flex items-center gap-2" key={optionIndex}>
                                                    <input
                                                        aria-label={`Opção ${optionIndex + 1} correta`}
                                                        checked={question.correctOptionIndex === optionIndex}
                                                        name={`correct-${questionIndex}`}
                                                        onChange={() => updateQuestion(questionIndex, { ...question, correctOptionIndex: optionIndex })}
                                                        required
                                                        type="radio"
                                                    />
                                                    <input
                                                        aria-label={`Opção ${optionIndex + 1}`}
                                                        required
                                                        value={option}
                                                        onChange={(event) => {
                                                            const options = [...question.options];
                                                            options[optionIndex] = event.target.value;
                                                            updateQuestion(questionIndex, { ...question, options });
                                                        }}
                                                    />
                                                </label>
                                            ))}
                                            <label className="block space-y-1">
                                                <span>Explicação da resposta</span>
                                                <textarea required value={question.explanation} onChange={(event) => updateQuestion(questionIndex, { ...question, explanation: event.target.value })} />
                                            </label>
                                            {quizQuestions.length > 1 ? (
                                                <button className="sf-button-secondary" onClick={() => setQuizQuestions((current) => current.filter((_, index) => index !== questionIndex))} type="button">Remover pergunta</button>
                                            ) : null}
                                        </fieldset>
                                    ))}
                                    {quizQuestions.length < 60 ? (
                                        <button className="sf-button-secondary" onClick={() => setQuizQuestions((current) => [...current, emptyQuizQuestion()])} type="button">Adicionar pergunta</button>
                                    ) : null}
                                </div>
                            )}
                            <button className="sf-button-primary" disabled={creating || !materialId} type="submit">
                                {creating ? "A criar..." : "Adicionar à fila"}
                            </button>
                        </>
                    )}
                </form>
            </SidePanel>
        </section>
    );
}

function ReviewContent({ review }: { review: AiContentReview }) {
    if (review.contentType === "SUMMARY") {
        const text = typeof review.contentJson.text === "string" ? review.contentJson.text : "";
        const bullets = Array.isArray(review.contentJson.bullets)
            ? review.contentJson.bullets.filter((item): item is string => typeof item === "string")
            : [];
        return (
            <article className="sf-surface space-y-3">
                {text ? <p className="whitespace-pre-wrap text-sm leading-6">{text}</p> : null}
                {bullets.length ? <ul className="list-disc space-y-2 pl-5 text-sm">{bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul> : null}
            </article>
        );
    }
    const questions = reviewQuestions(review);
    if (!questions.length) {
        return <InlineNotice tone="attention">Este quiz legado não tem perguntas estruturadas e não pode ser aprovado para utilização interativa.</InlineNotice>;
    }
    return (
        <div className="space-y-3">
            {questions.map((question, questionIndex) => (
                <article className="sf-list-card space-y-2" key={questionIndex}>
                    <h3 className="font-semibold">{questionIndex + 1}. {question.question}</h3>
                    <ol className="list-[upper-alpha] space-y-1 pl-6 text-sm">
                        {question.options.map((option, optionIndex) => (
                            <li className={question.correctOptionIndex === optionIndex ? "font-semibold text-studyflow-brandText" : ""} key={optionIndex}>{option}</li>
                        ))}
                    </ol>
                    <p className="text-sm text-studyflow-text/70"><span className="font-semibold">Explicação:</span> {question.explanation}</p>
                </article>
            ))}
        </div>
    );
}
