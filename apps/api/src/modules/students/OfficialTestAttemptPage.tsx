// apps/web/src/pages/student/OfficialTestAttemptPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    listPublishedOfficialTests,
    OfficialTestAttemptResult,
    OfficialTestForStudent,
    submitOfficialTestAttempt,
} from "../../lib/apiClient.js";

type OfficialTestAttemptPageProps = {
    subjectId: string;
};

/**
 * Página de aluno para realização de mini-testes oficiais publicados.
 *
 * @param props Propriedades da rota protegida.
 * @returns Interface com listagem, formulário de respostas e resultado.
 */
export function OfficialTestAttemptPage({ subjectId }: OfficialTestAttemptPageProps) {
    const [tests, setTests] = useState<OfficialTestForStudent[]>([]);
    const [selectedTestId, setSelectedTestId] = useState("");
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<OfficialTestAttemptResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedTest = useMemo(
        () => tests.find((test) => test._id === selectedTestId) ?? null,
        [tests, selectedTestId],
    );

    useEffect(() => {
        let isActive = true;

        async function loadTests(): Promise<void> {
            setIsLoading(true);
            setError(null);
            try {
                const publishedTests = await listPublishedOfficialTests(subjectId);
                if (!isActive) return;
                setTests(publishedTests);
                setSelectedTestId(publishedTests[0]?._id ?? "");
                setAnswers({});
                setResult(null);
            } catch (caught) {
                if (!isActive) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar os mini-testes.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        void loadTests();

        return () => {
            isActive = false;
        };
    }, [subjectId]);

    /**
     * Atualiza uma resposta local sem calcular permissões nem pontuação.
     *
     * @param questionIndex Índice da pergunta.
     * @param selectedOptionIndex Índice da opção escolhida.
     */
    function selectAnswer(questionIndex: number, selectedOptionIndex: number): void {
        setAnswers((current) => ({
            ...current,
            [questionIndex]: selectedOptionIndex,
        }));
        setResult(null);
    }

    /**
     * Submete respostas para correção backend.
     *
     * @param event Evento do formulário.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!selectedTest) return;

        const selectedOptionIndexes = selectedTest.questions.map(
            (_question, questionIndex) => answers[questionIndex] ?? -1,
        );

        setIsSubmitting(true);
        setError(null);
        try {
            const attemptResult = await submitOfficialTestAttempt(
                subjectId,
                selectedTest._id,
                selectedOptionIndexes,
            );
            setResult(attemptResult);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível submeter o mini-teste.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <p className="sf-panel">A carregar mini-testes oficiais...</p>;
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="sf-panel space-y-3">
                <h1 className="text-xl font-bold">Mini-testes oficiais</h1>
                {tests.length === 0 ? (
                    <p className="text-sm text-slate-600">
                        Ainda não existem mini-testes publicados para esta disciplina.
                    </p>
                ) : (
                    <label className="block text-sm font-medium">
                        Escolhe o mini-teste
                        <select
                            className="mt-2 w-full"
                            value={selectedTestId}
                            onChange={(event) => {
                                setSelectedTestId(event.target.value);
                                setAnswers({});
                                setResult(null);
                            }}
                        >
                            {tests.map((test) => (
                                <option key={test._id} value={test._id}>
                                    {test.title}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {error ? <p className="sf-error">{error}</p> : null}
            </aside>

            {selectedTest ? (
                <form className="sf-panel space-y-5" onSubmit={(event) => void handleSubmit(event)}>
                    <div>
                        <h2 className="text-lg font-semibold">{selectedTest.title}</h2>
                        {selectedTest.description ? (
                            <p className="text-sm text-slate-600">{selectedTest.description}</p>
                        ) : null}
                    </div>

                    {selectedTest.questions.map((question, questionIndex) => (
                        <fieldset className="space-y-2" key={`${selectedTest._id}-${questionIndex}`}>
                            <legend className="font-medium">
                                {questionIndex + 1}. {question.statement}
                            </legend>
                            {question.topic ? (
                                <p className="text-xs text-slate-500">Tópico: {question.topic}</p>
                            ) : null}
                            {question.options.map((option, optionIndex) => {
                                const inputId = `official-test-${questionIndex}-${optionIndex}`;
                                return (
                                    <label className="flex gap-2 text-sm" htmlFor={inputId} key={inputId}>
                                        <input
                                            checked={answers[questionIndex] === optionIndex}
                                            id={inputId}
                                            name={`question-${questionIndex}`}
                                            onChange={() => selectAnswer(questionIndex, optionIndex)}
                                            type="radio"
                                            value={optionIndex}
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </fieldset>
                    ))}

                    <button className="sf-button-primary" disabled={isSubmitting}>
                        {isSubmitting ? "A submeter..." : "Submeter respostas"}
                    </button>

                    {result ? (
                        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                            <h3 className="font-semibold">Resultado</h3>
                            <p>
                                {result.correctAnswers}/{result.totalQuestions} respostas certas ·{" "}
                                {result.percentage}%
                            </p>
                        </section>
                    ) : null}
                </form>
            ) : null}
        </section>
    );
}