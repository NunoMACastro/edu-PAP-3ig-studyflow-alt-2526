/**
 * Painel de flashcards com modo exercício e modo revisão.
 */
import { useEffect, useMemo, useState } from "react";
import { AiArtifact } from "../../lib/apiClient.js";
import {
    createFlashcardPracticeState,
    moveToNextFlashcard,
    restartFlashcardPractice,
    revealFlashcardAnswer,
    setFlashcardPracticeMode,
    type FlashcardPracticeMode,
    type FlashcardPracticeState,
} from "../../features/mf8/flashcard-practice.js";
import { ArtifactSources } from "./ArtifactSources.js";

/**
 * Props do componente React de artefactos de IA; mantêm explícitas as dependências vindas da página.
 */
type FlashcardsPanelProps = {
    artifact: AiArtifact | null;
};

type Flashcard = {
    front: string;
    back: string;
    sourceMaterialIds?: string[];
};

/**
 * Lê cartões de um artefacto IA sem confiar cegamente no formato dinâmico.
 *
 * @param artifact Artefacto autorizado recebido da API.
 * @returns Lista de cartões válidos para renderizar.
 */
function readFlashcards(artifact: AiArtifact): Flashcard[] {
    const maybeCards = artifact.contentJson.cards;

    if (!Array.isArray(maybeCards)) {
        return [];
    }

    return maybeCards.filter((card): card is Flashcard => {
        if (!card || typeof card !== "object") return false;

        const candidate = card as Record<string, unknown>;
        return (
            typeof candidate.front === "string" &&
            candidate.front.trim().length > 0 &&
            typeof candidate.back === "string" &&
            candidate.back.trim().length > 0
        );
    });
}

/**
 * Mostra flashcards gerados pela IA em modo exercício ou revisão.
 *
 * @param props Artefacto de flashcards autorizado para a área do aluno.
 * @returns Painel interativo de estudo.
 */
export function FlashcardsPanel({ artifact }: FlashcardsPanelProps) {
    const cards = useMemo(
        () => (artifact ? readFlashcards(artifact) : []),
        [artifact],
    );
    const [practice, setPractice] = useState<FlashcardPracticeState>(
        createFlashcardPracticeState(),
    );

    useEffect(() => {
        setPractice(createFlashcardPracticeState());
    }, [artifact?._id]);

    if (!artifact) return null;

    if (cards.length === 0) {
        return (
            <section className="sf-panel" aria-label="Flashcards">
                <h2 className="text-lg font-bold">Flashcards</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Este artefacto não tem cartões válidos para rever.
                </p>
            </section>
        );
    }

    const currentCard = cards[Math.min(practice.currentIndex, cards.length - 1)];
    const progressLabel = `${Math.min(practice.currentIndex + 1, cards.length)} de ${cards.length}`;

    /**
     * Troca o modo visual sem persistir dados privados.
     *
     * @param mode Valor de mode usado pela função para executar handle mode change com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    function handleModeChange(mode: FlashcardPracticeMode): void {
        setPractice((current) => setFlashcardPracticeMode(current, mode));
    }

    return (
        <section className="sf-panel space-y-4" aria-label="Flashcards">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Flashcards</h2>
                    <p className="text-sm text-slate-600">
                        Treina a resposta antes de veres a solução, ou usa
                        revisão para ler tudo de seguida.
                    </p>
                </div>
                <p className="rounded-full bg-studyflow-page px-3 py-1 text-sm font-semibold text-studyflow-brand">
                    {progressLabel}
                </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de estudo">
                <button
                    className={
                        practice.mode === "exercise"
                            ? "sf-button-primary"
                            : "sf-button-secondary"
                    }
                    onClick={() => handleModeChange("exercise")}
                    type="button"
                >
                    Modo exercício
                </button>
                <button
                    className={
                        practice.mode === "review"
                            ? "sf-button-primary"
                            : "sf-button-secondary"
                    }
                    onClick={() => handleModeChange("review")}
                    type="button"
                >
                    Modo revisão
                </button>
            </div>

            {practice.completed ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4" role="status">
                    <p className="font-semibold text-emerald-900">Sessão concluída.</p>
                    <p className="mt-1 text-sm text-emerald-800">
                        Recomeça para repetir os cartões e reforçar a memória.
                    </p>
                    <button
                        className="sf-button-secondary mt-3"
                        onClick={() =>
                            setPractice(restartFlashcardPractice(practice.mode))
                        }
                        type="button"
                    >
                        Recomeçar
                    </button>
                </div>
            ) : (
                <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-studyflow-brand">
                        Pergunta
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {currentCard.front}
                    </h3>

                    {practice.answerVisible ? (
                        <div
                            className="mt-4 rounded-md bg-studyflow-page p-4"
                            aria-live="polite"
                        >
                            <p className="text-xs font-semibold uppercase text-slate-500">
                                Resposta
                            </p>
                            <p className="mt-1 text-slate-800">{currentCard.back}</p>
                        </div>
                    ) : (
                        <p
                            className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600"
                            aria-live="polite"
                        >
                            Resposta escondida. Tenta responder antes de a revelar.
                        </p>
                    )}

                    <div className="mt-3">
                        <ArtifactSources
                            sourceMaterialIds={currentCard.sourceMaterialIds}
                            sources={artifact.sourcesJson}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {practice.answerVisible ? null : (
                            <button
                                className="sf-button-primary"
                                onClick={() =>
                                    setPractice((current) =>
                                        revealFlashcardAnswer(current),
                                    )
                                }
                                type="button"
                            >
                                Mostrar resposta
                            </button>
                        )}
                        <button
                            className="sf-button-secondary"
                            onClick={() =>
                                setPractice((current) =>
                                    moveToNextFlashcard(current, cards.length),
                                )
                            }
                            type="button"
                        >
                            {practice.currentIndex + 1 >= cards.length
                                ? "Concluir"
                                : "Seguinte"}
                        </button>
                    </div>
                </article>
            )}
        </section>
    );
}
