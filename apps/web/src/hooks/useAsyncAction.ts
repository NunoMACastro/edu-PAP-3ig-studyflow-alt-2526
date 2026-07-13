/**
 * Centraliza o ciclo de vida de ações assíncronas iniciadas pelo utilizador.
 */
import { useCallback, useRef, useState } from "react";

export type AsyncActionState = {
    pendingKey: string | null;
    error: string | null;
};

/**
 * Evita double-submit, normaliza erros e ignora conclusões de uma execução já
 * substituída. O chamador continua responsável por atualizar dados de domínio.
 *
 * @returns Estado atual e operações para executar ou limpar uma ação.
 */
export function useAsyncAction() {
    const [state, setState] = useState<AsyncActionState>({
        pendingKey: null,
        error: null,
    });
    const activeRun = useRef(0);
    const pendingRef = useRef<string | null>(null);

    const run = useCallback(
        async <T,>(
            key: string,
            action: () => Promise<T>,
            fallbackMessage = "Não foi possível concluir a operação.",
        ): Promise<T | undefined> => {
            if (pendingRef.current !== null) return undefined;
            const runId = activeRun.current + 1;
            activeRun.current = runId;
            pendingRef.current = key;
            setState({ pendingKey: key, error: null });
            try {
                return await action();
            } catch (caught) {
                if (activeRun.current === runId) {
                    setState({
                        pendingKey: null,
                        error:
                            caught instanceof Error
                                ? caught.message
                                : fallbackMessage,
                    });
                }
                return undefined;
            } finally {
                if (activeRun.current === runId) {
                    pendingRef.current = null;
                    setState((current) => ({ ...current, pendingKey: null }));
                }
            }
        },
        [],
    );

    const clearError = useCallback(() => {
        setState((current) => ({ ...current, error: null }));
    }, []);

    return {
        pendingKey: state.pendingKey,
        error: state.error,
        isPending: state.pendingKey !== null,
        run,
        clearError,
    };
}
