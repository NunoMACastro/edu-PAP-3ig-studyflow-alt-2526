// apps/web/src/features/mf8/flashcard-practice.ts
/**
 * Regras locais para praticar flashcards sem persistir dados privados.
 */
export type FlashcardPracticeMode = "exercise" | "review";

export type FlashcardPracticeState = {
    currentIndex: number;
    answerVisible: boolean;
    completed: boolean;
    mode: FlashcardPracticeMode;
};

/**
 * Cria o estado inicial do treino.
 *
 * @param mode Modo visual escolhido pelo aluno.
 * @returns Estado inicial seguro para a UI.
 */
export function createFlashcardPracticeState(
    mode: FlashcardPracticeMode = "exercise",
): FlashcardPracticeState {
    return {
        currentIndex: 0,
        answerVisible: mode === "review",
        completed: false,
        mode,
    };
}

/**
 * Revela a resposta do cartão atual sem mudar de cartão.
 *
 * @param state Estado atual do treino.
 * @returns Novo estado com resposta visível.
 */
export function revealFlashcardAnswer(
    state: FlashcardPracticeState,
): FlashcardPracticeState {
    return {
        ...state,
        answerVisible: true,
    };
}

/**
 * Avança para o cartão seguinte ou termina o treino.
 *
 * @param state Estado atual do treino.
 * @param totalCards Número de cartões autorizados recebidos da API.
 * @returns Novo estado, sempre limitado à lista recebida.
 */
export function moveToNextFlashcard(
    state: FlashcardPracticeState,
    totalCards: number,
): FlashcardPracticeState {
    const safeTotal = Math.max(0, Math.floor(totalCards));

    if (safeTotal === 0 || state.currentIndex + 1 >= safeTotal) {
        return {
            ...state,
            answerVisible: state.mode === "review",
            completed: true,
        };
    }

    return {
        currentIndex: state.currentIndex + 1,
        // No modo exercício, cada cartão novo volta a esconder a resposta.
        answerVisible: state.mode === "review",
        completed: false,
        mode: state.mode,
    };
}

/**
 * Alterna entre modo exercício e modo revisão.
 *
 * @param state Estado atual do treino.
 * @param mode Novo modo escolhido pelo aluno.
 * @returns Estado atualizado sem perder o cartão atual.
 */
export function setFlashcardPracticeMode(
    state: FlashcardPracticeState,
    mode: FlashcardPracticeMode,
): FlashcardPracticeState {
    return {
        ...state,
        answerVisible: mode === "review" ? true : state.answerVisible,
        mode,
    };
}

/**
 * Recomeça a sessão no cartão inicial.
 *
 * @param mode Modo visual escolhido para o recomeço.
 * @returns Estado inicial do treino.
 */
export function restartFlashcardPractice(
    mode: FlashcardPracticeMode = "exercise",
): FlashcardPracticeState {
    return createFlashcardPracticeState(mode);
}