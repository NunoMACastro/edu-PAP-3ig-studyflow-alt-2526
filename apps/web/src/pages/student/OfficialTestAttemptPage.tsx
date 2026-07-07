/**
 * Implementa a realização de mini-testes oficiais por alunos inscritos.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    listStudentOfficialTests,
    OfficialTestAttempt,
    StudentOfficialTest,
    submitOfficialTestAttempt,
} from "../../lib/apiClient.js";

/**
 * Props da página de mini-testes oficiais do aluno.
 */
type OfficialTestAttemptPageProps = {
    subjectId: string;
};

/**
 * Respostas locais por mini-teste, antes da submissão backend.
 */
type AnswersByTestId = Record<string, number[]>;

/**
 * Página onde o aluno realiza mini-testes publicados por professores.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function OfficialTestAttemptPage({ subjectId }: OfficialTestAttemptPageProps) {
    const [tests, setTests] = useState<StudentOfficialTest[]>([]);
    const [answersByTestId, setAnswersByTestId] = useState<AnswersByTestId>({});
    const [attemptsByTestId, setAttemptsByTestId] = useState<
        Record<string, OfficialTestAttempt>
    >({});
    const [loading, setLoading] = useState(true);
    const [submittingTestId, setSubmittingTestId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        /**
         * Obtém a ação de interface ligada a páginas React, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
         *
         * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
         */
        async function loadTests(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                const publishedTests = await listStudentOfficialTests(subjectId);
                if (!cancelled) setTests(publishedTests);
            } catch (caught) {
                if (!cancelled) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Erro ao carregar mini-testes.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadTests();

        return () => {
            cancelled = true;
        };
    }, [subjectId]);

    /**
     * Guarda localmente uma opção escolhida sem calcular pontuação no browser.
     *
     * @param testId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param questionIndex Posição usada para relacionar itens derivados com a sua origem.
     * @param optionIndex Posição usada para relacionar itens derivados com a sua origem.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    function updateAnswer(
        testId: string,
        questionIndex: number,
        optionIndex: number,
    ): void {
        setAnswersByTestId((current) => {
            const nextAnswers = [...(current[testId] ?? [])];
            nextAnswers[questionIndex] = optionIndex;
            return { ...current, [testId]: nextAnswers };
        });
    }

    /**
     * Extrai respostas completas antes de permitir submissão.
     *
     * @param test Mini-teste publicado.
     * @returns Lista completa de respostas ou `null` quando falta alguma.
     */
    function getCompleteAnswers(test: StudentOfficialTest): number[] | null {
        const currentAnswers = answersByTestId[test._id] ?? [];
        const selectedOptionIndexes: number[] = [];

        for (let index = 0; index < test.questions.length; index += 1) {
            const selectedOptionIndex = currentAnswers[index];
            if (selectedOptionIndex === undefined) return null;
            selectedOptionIndexes.push(selectedOptionIndex);
        }

        return selectedOptionIndexes;
    }

    /**
     * Envia respostas ao backend para validação, pontuação e persistência.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @param test Valor de test usado pela função para executar handle submit com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(
        event: FormEvent,
        test: StudentOfficialTest,
    ): Promise<void> {
        event.preventDefault();
        const selectedOptionIndexes = getCompleteAnswers(test);
        if (!selectedOptionIndexes) return;

        setSubmittingTestId(test._id);
        setError(null);
        try {
            const attempt = await submitOfficialTestAttempt(subjectId, test._id, {
                selectedOptionIndexes,
            });
            setAttemptsByTestId((current) => ({ ...current, [test._id]: attempt }));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao submeter mini-teste.",
            );
        } finally {
            setSubmittingTestId(null);
        }
    }

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-bold">Mini-testes oficiais</h1>
                {error ? <p className="sf-error mt-3">{error}</p> : null}
            </div>

            {loading ? (
                <p className="sf-panel text-sm text-slate-600">
                    A carregar mini-testes publicados.
                </p>
            ) : null}

            {!loading && tests.length === 0 ? (
                <p className="sf-panel text-sm text-slate-600">
                    Ainda não há mini-testes publicados nesta disciplina.
                </p>
            ) : null}

            <div className="grid gap-4">
                {tests.map((test) => {
                    const attempt = attemptsByTestId[test._id];
                    const completeAnswers = getCompleteAnswers(test);
                    const isSubmitting = submittingTestId === test._id;

                    return (
                        <form
                            className="sf-panel space-y-4"
                            key={test._id}
                            onSubmit={(event) => void handleSubmit(event, test)}
                        >
                            <div>
                                <h2 className="font-semibold">{test.title}</h2>
                                {test.description ? (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {test.description}
                                    </p>
                                ) : null}
                                <p className="mt-1 text-sm text-slate-600">
                                    {test.questions.length} perguntas
                                </p>
                            </div>

                            {test.questions.map((question, questionIndex) => (
                                <fieldset className="space-y-2" key={questionIndex}>
                                    <legend className="font-medium">
                                        {question.statement}
                                    </legend>
                                    {question.options.map((option, optionIndex) => {
                                        const fieldName = `${test._id}-${questionIndex}`;
                                        const result = attempt?.results.find(
                                            (item) => item.questionIndex === questionIndex,
                                        );
                                        const isSelected =
                                            (answersByTestId[test._id] ?? [])[questionIndex] ===
                                            optionIndex;
                                        const isCorrectAfterSubmit =
                                            result?.correctOptionIndex === optionIndex;

                                        return (
                                            <label
                                                className="flex items-center gap-2 text-sm"
                                                key={optionIndex}
                                            >
                                                <input
                                                    checked={isSelected}
                                                    disabled={Boolean(attempt) || isSubmitting}
                                                    name={fieldName}
                                                    onChange={() =>
                                                        updateAnswer(
                                                            test._id,
                                                            questionIndex,
                                                            optionIndex,
                                                        )
                                                    }
                                                    type="radio"
                                                />
                                                <span>
                                                    {option}
                                                    {attempt && isCorrectAfterSubmit
                                                        ? " (correta)"
                                                        : ""}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </fieldset>
                            ))}

                            {attempt ? (
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                                    Resultado: {attempt.correctAnswers}/
                                    {attempt.totalQuestions} ({attempt.percentage}%)
                                </div>
                            ) : (
                                <button
                                    className="sf-button-primary"
                                    disabled={!completeAnswers || isSubmitting}
                                >
                                    {isSubmitting ? "A submeter..." : "Submeter respostas"}
                                </button>
                            )}
                        </form>
                    );
                })}
            </div>
        </section>
    );
}
