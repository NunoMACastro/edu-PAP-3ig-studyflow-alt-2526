/**
 * Implementa a realização de mini-testes oficiais por alunos inscritos.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    listStudentOfficialTests,
    listMyOfficialTestAttempts,
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
    const [attemptKeysByTestId, setAttemptKeysByTestId] = useState<
        Record<string, string>
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
                const availableTests = await listStudentOfficialTests(subjectId);
                const attemptEntries = await Promise.all(
                    availableTests.map(async (test) => {
                        const attempts = await listMyOfficialTestAttempts(
                            subjectId,
                            test._id,
                        );
                        return [test._id, attempts.at(-1)] as const;
                    }),
                );
                if (!cancelled) {
                    setTests(availableTests);
                    const persistedAttempts = Object.fromEntries(
                        attemptEntries.filter(
                            (entry): entry is readonly [string, OfficialTestAttempt] =>
                                entry[1] !== undefined,
                        ),
                    );
                    setAttemptsByTestId(persistedAttempts);
                    setAnswersByTestId(
                        Object.fromEntries(
                            Object.entries(persistedAttempts).map(
                                ([testId, attempt]) => [
                                    testId,
                                    attempt.selectedOptionIndexes,
                                ],
                            ),
                        ),
                    );
                }
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
        const attemptKey =
            attemptKeysByTestId[test._id] ?? window.crypto.randomUUID();
        setAttemptKeysByTestId((current) => ({
            ...current,
            [test._id]: attemptKey,
        }));
        try {
            const attempt = await submitOfficialTestAttempt(subjectId, test._id, {
                attemptKey,
                selectedOptionIndexes,
            });
            setAttemptsByTestId((current) => ({ ...current, [test._id]: attempt }));
            setTests((current) =>
                current.map((item) =>
                    item._id === test._id
                        ? {
                              ...item,
                              attemptsUsed: attempt.attemptNumber,
                              attemptsRemaining: attempt.attemptsRemaining,
                          }
                        : item,
                ),
            );
            setAttemptKeysByTestId((current) => {
                const next = { ...current };
                delete next[test._id];
                return next;
            });
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

    /**
     * Limpa apenas a correção local para preparar uma nova tentativa consciente.
     *
     * @param testId Teste cuja tentativa seguinte será preenchida.
     */
    function prepareNextAttempt(testId: string): void {
        setAttemptsByTestId((current) => {
            const next = { ...current };
            delete next[testId];
            return next;
        });
        setAnswersByTestId((current) => {
            const next = { ...current };
            delete next[testId];
            return next;
        });
    }

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-bold">Mini-testes oficiais</h1>
                {error ? <p className="sf-error mt-3">{error}</p> : null}
            </div>

            {loading ? (
                <p className="sf-panel text-sm text-studyflow-text">
                    A carregar mini-testes publicados.
                </p>
            ) : null}

            {!loading && tests.length === 0 ? (
                <p className="sf-panel text-sm text-studyflow-text">
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
                                    <p className="mt-1 text-sm text-studyflow-text">
                                        {test.description}
                                    </p>
                                ) : null}
                                <p className="mt-1 text-sm text-studyflow-text">
                                    {test.questions.length} perguntas · {test.attemptsRemaining} de {test.maxAttempts} tentativas disponíveis
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
                                                    disabled={
                                                        Boolean(attempt) ||
                                                        isSubmitting ||
                                                        test.attemptsRemaining === 0 ||
                                                        test.status === "CLOSED"
                                                    }
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
                                <div className="space-y-3">
                                    <div className="sf-success text-sm" role="status">
                                        Tentativa {attempt.attemptNumber}: {attempt.correctAnswers}/
                                        {attempt.totalQuestions} ({attempt.percentage}%)
                                    </div>
                                    {!attempt.solutionUnlocked ? (
                                        <p className="text-sm text-studyflow-text">
                                            As soluções completas ficam disponíveis após a
                                            terceira tentativa ou quando o teste encerrar.
                                        </p>
                                    ) : null}
                                    {attempt.attemptsRemaining > 0 && test.status === "PUBLISHED" ? (
                                        <button
                                            className="sf-button-secondary"
                                            onClick={() => prepareNextAttempt(test._id)}
                                            type="button"
                                        >
                                            Preparar nova tentativa
                                        </button>
                                    ) : (
                                        <p className="text-sm text-studyflow-text">
                                            {test.status === "CLOSED" &&
                                            attempt.attemptsRemaining > 0
                                                ? "O mini-teste foi encerrado pelo professor."
                                                : "Utilizaste as três tentativas permitidas."}
                                        </p>
                                    )}
                                </div>
                            ) : test.attemptsRemaining === 0 || test.status === "CLOSED" ? (
                                <p className="sf-panel text-sm">
                                    {test.status === "CLOSED" &&
                                    test.attemptsRemaining > 0
                                        ? "O mini-teste foi encerrado pelo professor."
                                        : "Já utilizaste as três tentativas permitidas neste mini-teste."}
                                </p>
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
