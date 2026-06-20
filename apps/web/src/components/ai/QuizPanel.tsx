/**
 * Implementa um componente React reutilizavel para ai.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    AiArtifact,
    QuizAttemptResult,
    submitQuizAttempt,
} from "../../lib/apiClient.js";
import { ArtifactSources } from "./ArtifactSources.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type QuizPanelProps = {
    artifact: AiArtifact | null;
    studyAreaId: string;
};

/**
 * Mostra um quiz gerado pela IA.
 *
 * @param props Artefacto de quiz.
 * @returns Lista de perguntas com opções.
 */
export function QuizPanel({ artifact, studyAreaId }: QuizPanelProps) {
    const [answers, setAnswers] = useState<number[]>([]);
    const [attempt, setAttempt] = useState<QuizAttemptResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setAnswers([]);
        setAttempt(null);
        setError(null);
    }, [artifact?._id]);

    if (!artifact) return null;
    const quizArtifact = artifact;
    const content = artifact.contentJson as {
        questions?: Array<{
            question: string;
            options: string[];
            correctOptionIndex: number;
            explanation: string;
            sourceMaterialIds?: string[];
        }>;
    };
    const questions = content.questions ?? [];

    /**
     * Submete respostas para cálculo seguro no backend.
     *
     * @param event Evento do formulário.
     * @returns Promise resolvida depois de guardar resultado.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);

        if (
            questions.length === 0 ||
            questions.some((_, index) => !Number.isInteger(answers[index]))
        ) {
            setError("Responde a todas as perguntas antes de submeter.");
            return;
        }

        setIsSubmitting(true);
        try {
            setAttempt(
                await submitQuizAttempt(studyAreaId, quizArtifact._id, answers),
            );
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível guardar a tentativa.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {attempt ? (
                <div className="sf-panel">
                    <p className="text-sm font-semibold text-teal-800">
                        Resultado: {attempt.correctCount}/{attempt.totalQuestions} (
                        {attempt.scorePercent}%)
                    </p>
                </div>
            ) : null}
            {error ? <p className="sf-error">{error}</p> : null}
            {questions.map((question, index) => {
                const result = attempt?.results.find(
                    (item) => item.questionIndex === index,
                );
                return (
                <article className="sf-panel space-y-3" key={index}>
                    <h2 className="font-semibold">{question.question}</h2>
                    <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                            <label
                                className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
                                key={optionIndex}
                            >
                                <input
                                    checked={answers[index] === optionIndex}
                                    disabled={Boolean(attempt) || isSubmitting}
                                    name={`quiz-question-${quizArtifact._id}-${index}`}
                                    onChange={() =>
                                        setAnswers((current) => {
                                            const next = [...current];
                                            next[index] = optionIndex;
                                            return next;
                                        })
                                    }
                                    type="radio"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                    {result ? (
                        <>
                            <p
                                className={
                                    result.isCorrect
                                        ? "text-sm text-teal-800"
                                        : "text-sm text-red-700"
                                }
                            >
                                Correta: {result.correctOptionIndex + 1}.{" "}
                                {question.explanation}
                            </p>
                            <ArtifactSources
                                sourceMaterialIds={result.sourceMaterialIds}
                                sources={artifact.sourcesJson}
                            />
                        </>
                    ) : null}
                </article>
                );
            })}
            {!attempt ? (
                <button
                    className="sf-button-primary"
                    disabled={isSubmitting || questions.length === 0}
                    type="submit"
                >
                    {isSubmitting ? "A guardar..." : "Submeter respostas"}
                </button>
            ) : null}
        </form>
    );
}
