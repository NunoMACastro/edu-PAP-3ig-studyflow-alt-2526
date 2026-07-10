/**
 * Implementa a autoria e o ciclo de vida de mini-testes oficiais.
 */
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    closeOfficialTest,
    createOfficialTest,
    listOfficialTests,
    publishOfficialTest,
    type OfficialTest,
    updateOfficialTestDraft,
} from "../../lib/apiClient.js";

type DraftOfficialTestQuestion = {
    statement: string;
    topic?: string;
    options: string[];
    correctOptionIndex: number | null;
};

/**
 * Cria uma pergunta independente para evitar partilha acidental dos arrays.
 */
function createEmptyQuestion(): DraftOfficialTestQuestion {
    return {
        statement: "",
        topic: "",
        options: ["", "", "", ""],
        correctOptionIndex: null,
    };
}

/**
 * Página docente de mini-testes oficiais.
 *
 * @param props Disciplina validada novamente pelo backend em cada operação.
 * @returns Editor multi-pergunta e lista com transições DRAFT-PUBLISHED-CLOSED.
 */
export function TeacherOfficialTestsPage({ subjectId }: { subjectId: string }) {
    const [tests, setTests] = useState<OfficialTest[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<DraftOfficialTestQuestion[]>([
        createEmptyQuestion(),
    ]);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [transitioningTestId, setTransitioningTestId] = useState<string | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega os testes docentes sem tomar decisões de autorização no browser.
     */
    async function refresh(): Promise<void> {
        setTests(await listOfficialTests(subjectId));
    }

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listOfficialTests(subjectId)
            .then((items) => {
                if (active) setTests(items);
            })
            .catch((caught: unknown) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Erro ao carregar testes.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [subjectId]);

    /**
     * Atualiza uma pergunta de forma imutável.
     *
     * @param questionIndex Posição da pergunta.
     * @param nextQuestion Pergunta completa após a alteração local.
     */
    function updateQuestion(
        questionIndex: number,
        nextQuestion: DraftOfficialTestQuestion,
    ): void {
        setQuestions((current) =>
            current.map((question, index) =>
                index === questionIndex ? nextQuestion : question,
            ),
        );
    }

    /**
     * Cria sempre um rascunho; publicar é uma ação posterior explícita.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!isDraftValid(title, questions) || creating) return;

        setCreating(true);
        setError(null);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                status: "DRAFT",
                questions: questions.map((question) => ({
                    statement: question.statement.trim(),
                    topic: question.topic?.trim() || undefined,
                    options: question.options.map((option) => option.trim()),
                    // `isDraftValid` garante que o professor escolheu um radio.
                    correctOptionIndex: question.correctOptionIndex as number,
                })),
            } as const;
            if (editingTestId) {
                await updateOfficialTestDraft(subjectId, editingTestId, payload);
            } else {
                await createOfficialTest(subjectId, payload);
            }
            setTitle("");
            setDescription("");
            setQuestions([createEmptyQuestion()]);
            setEditingTestId(null);
            await refresh();
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Erro ao criar teste.",
            );
        } finally {
            setCreating(false);
        }
    }

    /**
     * Publica ou encerra um teste aguardando confirmação da API.
     *
     * @param test Teste no estado conhecido pela UI.
     */
    async function advanceStatus(test: OfficialTest): Promise<void> {
        if (test.status === "CLOSED" || transitioningTestId) return;
        const nextStatus = test.status === "DRAFT" ? "PUBLISHED" : "CLOSED";
        setTransitioningTestId(test._id);
        setError(null);
        try {
            const updated =
                nextStatus === "PUBLISHED"
                    ? await publishOfficialTest(subjectId, test._id)
                    : await closeOfficialTest(subjectId, test._id);
            setTests((current) =>
                current.map((item) => (item._id === updated._id ? updated : item)),
            );
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível alterar o estado do teste.",
            );
        } finally {
            setTransitioningTestId(null);
        }
    }

    return (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
            <form
                className="sf-panel space-y-5"
                id="criar-teste"
                onSubmit={(event) => void handleSubmit(event)}
            >
                <div>
                    <h1 className="text-xl font-bold">Testes oficiais</h1>
                    <p className="mt-1 text-sm text-studyflow-text">
                        O teste nasce em rascunho e só fica disponível aos alunos após
                        publicação explícita.
                    </p>
                </div>
                {error ? (
                    <p className="sf-error" role="alert">
                        {error}
                    </p>
                ) : null}

                <label className="block space-y-2">
                    <span>Título</span>
                    <input
                        maxLength={160}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        value={title}
                    />
                </label>
                <label className="block space-y-2">
                    <span>Descrição (opcional)</span>
                    <textarea
                        maxLength={4000}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        value={description}
                    />
                </label>

                <div className="space-y-4">
                    {questions.map((question, questionIndex) => (
                        <fieldset
                            className="space-y-3 rounded-md border border-studyflow-border p-4"
                            key={questionIndex}
                        >
                            <legend className="px-1 font-semibold">
                                Pergunta {questionIndex + 1}
                            </legend>
                            <label className="block space-y-2">
                                <span>Enunciado</span>
                                <textarea
                                    maxLength={1000}
                                    onChange={(event) =>
                                        updateQuestion(questionIndex, {
                                            ...question,
                                            statement: event.target.value,
                                        })
                                    }
                                    required
                                    rows={2}
                                    value={question.statement}
                                />
                            </label>
                            <label className="block space-y-2">
                                <span>Tópico (opcional)</span>
                                <input
                                    maxLength={120}
                                    onChange={(event) =>
                                        updateQuestion(questionIndex, {
                                            ...question,
                                            topic: event.target.value,
                                        })
                                    }
                                    value={question.topic ?? ""}
                                />
                            </label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Opções — seleciona a resposta correta
                                </p>
                                {question.options.map((option, optionIndex) => (
                                    <div
                                        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3"
                                        key={optionIndex}
                                    >
                                        <input
                                            aria-label={`Marcar opção ${optionIndex + 1} como correta na pergunta ${questionIndex + 1}`}
                                            checked={
                                                question.correctOptionIndex === optionIndex
                                            }
                                            className="h-4 w-4"
                                            name={`correct-${questionIndex}`}
                                            onChange={() =>
                                                updateQuestion(questionIndex, {
                                                    ...question,
                                                    correctOptionIndex: optionIndex,
                                                })
                                            }
                                            type="radio"
                                        />
                                        <label className="space-y-1">
                                            <span className="sr-only">
                                                Opção {optionIndex + 1}
                                            </span>
                                            <input
                                                aria-label={`Opção ${optionIndex + 1} da pergunta ${questionIndex + 1}`}
                                                maxLength={500}
                                                onChange={(event) => {
                                                    const options = [...question.options];
                                                    options[optionIndex] = event.target.value;
                                                    updateQuestion(questionIndex, {
                                                        ...question,
                                                        options,
                                                    });
                                                }}
                                                required
                                                value={option}
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {questions.length > 1 ? (
                                <button
                                    className="sf-button-secondary"
                                    onClick={() =>
                                        setQuestions((current) =>
                                            current.filter(
                                                (_, index) => index !== questionIndex,
                                            ),
                                        )
                                    }
                                    type="button"
                                >
                                    Remover pergunta
                                </button>
                            ) : null}
                        </fieldset>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        className="sf-button-secondary"
                        disabled={questions.length >= 60}
                        onClick={() =>
                            setQuestions((current) => [
                                ...current,
                                createEmptyQuestion(),
                            ])
                        }
                        type="button"
                    >
                        Adicionar pergunta
                    </button>
                    <button
                        className="sf-button-primary"
                        disabled={!isDraftValid(title, questions) || creating}
                    >
                        {creating
                            ? "A guardar..."
                            : editingTestId
                              ? "Guardar rascunho"
                              : "Criar rascunho"}
                    </button>
                    {editingTestId ? (
                        <button
                            className="sf-button-secondary"
                            onClick={() => {
                                setEditingTestId(null);
                                setTitle("");
                                setDescription("");
                                setQuestions([createEmptyQuestion()]);
                            }}
                            type="button"
                        >
                            Cancelar edição
                        </button>
                    ) : null}
                </div>
            </form>

            <div className="grid content-start gap-3">
                {loading ? (
                    <p className="sf-panel text-sm" aria-live="polite">
                        A carregar testes...
                    </p>
                ) : null}
                {!loading && tests.length === 0 ? (
                    <p className="sf-panel text-sm">
                        Ainda não existem testes nesta disciplina.
                    </p>
                ) : null}
                {tests.map((test) => {
                    const pending = transitioningTestId === test._id;
                    return (
                        <article className="sf-panel space-y-3" key={test._id}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h2 className="font-semibold">{test.title}</h2>
                                <span className="rounded-full border border-studyflow-border px-2 py-1 text-xs font-semibold">
                                    {statusLabel(test.status)}
                                </span>
                            </div>
                            <p className="text-sm text-studyflow-text">
                                {test.questions.length} perguntas
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {test.status !== "CLOSED" ? (
                                    <button
                                        className="sf-button-primary"
                                        disabled={pending || Boolean(transitioningTestId)}
                                        onClick={() => void advanceStatus(test)}
                                        type="button"
                                    >
                                        {pending
                                            ? "A atualizar..."
                                            : test.status === "DRAFT"
                                              ? "Publicar"
                                              : "Encerrar"}
                                    </button>
                                ) : null}
                                {test.status === "DRAFT" ? (
                                    <button
                                        className="sf-button-secondary"
                                        disabled={creating || Boolean(transitioningTestId)}
                                        onClick={() => {
                                            setEditingTestId(test._id);
                                            setTitle(test.title);
                                            setDescription(test.description ?? "");
                                            setQuestions(
                                                test.questions.map((question) => ({
                                                    ...question,
                                                    options: [...question.options],
                                                })),
                                            );
                                            document
                                                .getElementById("criar-teste")
                                                ?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        type="button"
                                    >
                                        Editar
                                    </button>
                                ) : null}
                                {test.status !== "DRAFT" ? (
                                    <Link
                                        className="sf-button-secondary"
                                        to={`/app/professor/disciplinas/${subjectId}/testes/${test._id}/ranking`}
                                    >
                                        Ver ranking
                                    </Link>
                                ) : null}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

/**
 * Valida localmente apenas os requisitos úteis para feedback imediato.
 *
 * @param title Título ainda não normalizado.
 * @param questions Perguntas editadas no formulário.
 * @returns `true` quando o payload pode ser submetido ao DTO backend.
 */
function isDraftValid(
    title: string,
    questions: DraftOfficialTestQuestion[],
): boolean {
    return (
        title.trim().length >= 3 &&
        questions.length > 0 &&
        questions.every((question) => {
            const options = question.options.map((option) => option.trim());
            return (
                question.statement.trim().length >= 5 &&
                question.correctOptionIndex !== null &&
                options.every(Boolean) &&
                new Set(
                    options.map((option) => option.toLocaleLowerCase("pt-PT")),
                ).size === 4
            );
        })
    );
}

/**
 * Traduz o estado persistido para linguagem de produto.
 */
function statusLabel(status: OfficialTest["status"]): string {
    if (status === "DRAFT") return "Rascunho";
    if (status === "PUBLISHED") return "Publicado";
    return "Encerrado";
}
