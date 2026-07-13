/**
 * Regras locais para praticar flashcards sem persistir dados privados.
 */
export type FlashcardPracticeMode = "exercise" | "review";

/**
 * Estado minimo que a UI precisa para o treino ativo de flashcards.
 */
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
 * Revela a resposta do cartao atual sem mudar de cartao.
 *
 * @param state Estado atual do treino.
 * @returns Novo estado com resposta visivel.
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
 * Avanca para o cartao seguinte ou termina o treino.
 *
 * @param state Estado atual do treino.
 * @param totalCards Numero de cartoes autorizados recebidos da API.
 * @returns Novo estado, sempre limitado a lista recebida.
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
        // No modo exercicio, cada cartao novo volta a esconder a resposta.
        answerVisible: state.mode === "review",
        completed: false,
        mode: state.mode,
    };
}

/**
 * Alterna entre modo exercicio e modo revisao.
 *
 * @param state Estado atual do treino.
 * @param mode Novo modo escolhido pelo aluno.
 * @returns Estado atualizado sem perder o cartao atual.
 */
export function setFlashcardPracticeMode(
    state: FlashcardPracticeState,
    mode: FlashcardPracticeMode,
): FlashcardPracticeState {
    return {
        ...state,
        // Entrar em exercicio esconde a resposta para preservar a revisao ativa.
        answerVisible: mode === "review",
        mode,
    };
}

/**
 * Recomeca a sessao no cartao inicial.
 *
 * @param mode Modo visual escolhido para o recomeco.
 * @returns Estado inicial do treino.
 */
export function restartFlashcardPractice(
    mode: FlashcardPracticeMode = "exercise",
): FlashcardPracticeState {
    return createFlashcardPracticeState(mode);
}
