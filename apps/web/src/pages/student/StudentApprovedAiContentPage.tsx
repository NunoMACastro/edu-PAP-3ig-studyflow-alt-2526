/**
 * Conteúdo IA aprovado pelo professor e disponibilizado à disciplina.
 */
import { FormEvent, useEffect, useState } from "react";
import { SubjectWorkspaceHeader } from "../../components/student/SubjectWorkspaceHeader.js";
import { EmptyState, InlineNotice, StatusBadge } from "../../components/ui/CalmUi.js";
import {
    ApprovedAiContent,
    ApprovedAiQuizAttemptHistoryItem,
    ApprovedAiQuizAttemptResult,
    listApprovedAiQuizAttempts,
    listApprovedAiContent,
    submitApprovedAiQuizAttempt,
} from "../../lib/apiClient.js";
import { formatDatePt } from "../../lib/format-date-pt.js";

/** Página do aluno para consultar resumos e realizar quizzes aprovados. */
export function StudentApprovedAiContentPage({ subjectId }: { subjectId: string }) {
    const [items, setItems] = useState<ApprovedAiContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listApprovedAiContent(subjectId)
            .then((content) => { if (active) setItems(content); })
            .catch((caught: unknown) => {
                if (active) setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar os conteúdos aprovados.",
                );
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [subjectId]);

    return (
        <section className="space-y-6">
            <SubjectWorkspaceHeader active="practice" subjectId={subjectId} />
            {error ? <InlineNotice role="alert" tone="danger">{error}</InlineNotice> : null}
            {loading ? <InlineNotice>A carregar conteúdos...</InlineNotice> : null}
            {!loading && !error && items.length === 0 ? (
                <EmptyState
                    description="Quando o professor aprovar um resumo ou quiz, ficará disponível aqui."
                    icon="spark"
                    title="Ainda não existem conteúdos aprovados"
                />
            ) : null}
            {!loading && !error ? (
                <div className="space-y-5">
                    {items.map((item) => (
                        <article className="sf-surface space-y-4" key={item.reviewId}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studyflow-brandText">
                                        {item.material.title}
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold">
                                        {item.content.title ?? (item.contentType === "SUMMARY" ? "Resumo" : "Quiz")}
                                    </h2>
                                    <p className="mt-1 text-sm text-studyflow-text/60">Criado e aprovado pelo professor · {formatDatePt(item.approvedAt)}</p>
                                </div>
                                <StatusBadge tone="brand">{item.contentType === "SUMMARY" ? "Resumo" : "Quiz"}</StatusBadge>
                            </div>
                            {item.contentType === "SUMMARY" ? (
                                <SummaryContent item={item} />
                            ) : (
                                <ApprovedQuiz subjectId={subjectId} item={item} />
                            )}
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function SummaryContent({ item }: { item: Extract<ApprovedAiContent, { contentType: "SUMMARY" }> }) {
    return (
        <div className="space-y-3">
            {item.content.text ? <p className="whitespace-pre-wrap text-sm leading-6">{item.content.text}</p> : null}
            {item.content.bullets?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm">
                    {item.content.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
                </ul>
            ) : null}
        </div>
    );
}

function ApprovedQuiz({
    item,
    subjectId,
}: {
    item: Extract<ApprovedAiContent, { contentType: "QUIZ" }>;
    subjectId: string;
}) {
    const questions = item.content.questions ?? [];
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<ApprovedAiQuizAttemptResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState<ApprovedAiQuizAttemptHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyReloadToken, setHistoryReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setHistoryLoading(true);
        setHistoryError(null);
        listApprovedAiQuizAttempts(subjectId, item.reviewId)
            .then((attempts) => {
                if (active) setHistory(attempts);
            })
            .catch((caught: unknown) => {
                if (active) {
                    setHistoryError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível carregar o histórico de tentativas.",
                    );
                }
            })
            .finally(() => {
                if (active) setHistoryLoading(false);
            });
        return () => {
            active = false;
        };
    }, [historyReloadToken, item.reviewId, subjectId]);

    async function submit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (
            questions.length === 0 ||
            questions.some((_, index) => !Number.isInteger(answers[index]))
        ) {
            setError("Responde a todas as perguntas antes de submeter.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const nextResult = await submitApprovedAiQuizAttempt(
                subjectId,
                item.reviewId,
                answers,
            );
            setResult(nextResult);
            setHistoryReloadToken((value) => value + 1);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível corrigir o quiz.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (!questions.length) {
        return item.content.text
            ? <p className="whitespace-pre-wrap text-sm leading-6">{item.content.text}</p>
            : <InlineNotice>Este quiz está disponível apenas para consulta.</InlineNotice>;
    }

    return (
        <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            {result ? (
                <InlineNotice tone="brand">
                    Resultado: {result.correctCount}/{result.totalQuestions} respostas corretas ({result.scorePercent}%).
                </InlineNotice>
            ) : null}
            {error ? <InlineNotice role="alert" tone="danger">{error}</InlineNotice> : null}
            {questions.map((question, questionIndex) => {
                const correction = result?.results.find(
                    (entry) => entry.questionIndex === question.questionIndex,
                );
                return (
                    <fieldset className="sf-list-card space-y-3" key={question.questionIndex}>
                        <legend className="font-semibold">{questionIndex + 1}. {question.question}</legend>
                        <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                                <label
                                    className="flex items-center gap-3 rounded-xl border border-studyflow-border/10 px-3 py-2 text-sm"
                                    htmlFor={`approved-quiz-${item.reviewId}-${questionIndex}-${optionIndex}`}
                                    key={optionIndex}
                                >
                                    <input
                                        checked={answers[questionIndex] === optionIndex}
                                        disabled={item.canAttempt === false || Boolean(result) || submitting}
                                        id={`approved-quiz-${item.reviewId}-${questionIndex}-${optionIndex}`}
                                        name={`approved-quiz-${item.reviewId}-${questionIndex}`}
                                        onChange={() => setAnswers((current) => {
                                            const next = [...current];
                                            next[questionIndex] = optionIndex;
                                            return next;
                                        })}
                                        type="radio"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        {correction ? (
                            <div className="space-y-1 text-sm">
                                <p className={correction.isCorrect ? "text-studyflow-brandText" : "text-studyflow-alertText"}>
                                    {correction.isCorrect ? "Resposta correta." : `Resposta correta: ${question.options[correction.correctOptionIndex]}.`}
                                </p>
                                <p>{correction.explanation}</p>
                            </div>
                        ) : null}
                    </fieldset>
                );
            })}
            {item.canAttempt === false ? (
                <InlineNotice>Este conteúdo está disponível apenas para consulta porque a disciplina ou turma está arquivada.</InlineNotice>
            ) : result ? (
                <button className="sf-button-secondary" onClick={() => { setAnswers([]); setResult(null); setError(null); }} type="button">Repetir quiz</button>
            ) : (
                <button className="sf-button-primary" disabled={submitting} type="submit">{submitting ? "A corrigir..." : "Submeter respostas"}</button>
            )}
            <section className="space-y-3 border-t border-studyflow-border/10 pt-4" aria-label={`Histórico de tentativas de ${item.content.title ?? "Quiz"}`}>
                <h3 className="font-semibold">Histórico de tentativas</h3>
                {historyLoading ? <InlineNotice>A carregar histórico...</InlineNotice> : null}
                {historyError ? (
                    <div className="space-y-2">
                        <InlineNotice role="alert" tone="danger">{historyError}</InlineNotice>
                        <button className="sf-button-secondary" onClick={() => setHistoryReloadToken((value) => value + 1)} type="button">Tentar novamente</button>
                    </div>
                ) : null}
                {!historyLoading && !historyError && history.length === 0 ? (
                    <p className="text-sm text-studyflow-text/65">Ainda não existem tentativas guardadas.</p>
                ) : null}
                {history.length > 0 ? (
                    <ol className="space-y-2">
                        {history.map((attempt) => (
                            <li className="sf-list-card text-sm" key={attempt.attemptId}>
                                <strong>Tentativa {attempt.attemptNumber}</strong>
                                <p>{attempt.correctCount}/{attempt.totalQuestions} respostas corretas · {attempt.scorePercent}% · {formatDatePt(attempt.answeredAt)}</p>
                            </li>
                        ))}
                    </ol>
                ) : null}
            </section>
        </form>
    );
}
