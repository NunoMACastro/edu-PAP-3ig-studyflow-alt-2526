/**
 * Disponibiliza feedback imediato para acoes assincronas autenticadas.
 */
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type FeedbackTone = "loading" | "success" | "error";

type FeedbackMessage = {
    tone: FeedbackTone;
    text: string;
};

type ActionFeedbackContextValue = {
    feedback: FeedbackMessage | null;
    notifyLoading: (text: string) => void;
    notifySuccess: (text: string) => void;
    notifyError: (text: string) => void;
    clearFeedback: () => void;
};

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(
    null,
);

const toneClasses: Record<FeedbackTone, string> = {
    loading: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
};

/**
 * Envolve rotas protegidas com uma regiao visual e acessivel de feedback.
 *
 * @param props Conteudo autenticado que pode emitir mensagens seguras.
 * @returns Provider React com `aria-live` e toast visual.
 */
export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
    const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

    const value = useMemo<ActionFeedbackContextValue>(
        () => ({
            feedback,
            /**
             * Notifica notify loading para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface.
             *
             * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            notifyLoading: (text) => setFeedback({ tone: "loading", text }),
            /**
             * Notifica notify success para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface.
             *
             * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            notifySuccess: (text) => setFeedback({ tone: "success", text }),
            /**
             * Notifica notify error para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface.
             *
             * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
             * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
             */
            notifyError: (text) => setFeedback({ tone: "error", text }),
            /**
             * Remove clear feedback para interface MF5, escondendo os detalhes técnicos atrás de uma API simples para a interface.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            clearFeedback: () => setFeedback(null),
        }),
        [feedback],
    );

    return (
        <ActionFeedbackContext.Provider value={value}>
            {/* aria-live anuncia o estado sem expor prompts, cookies ou dados privados. */}
            <div
                aria-live="polite"
                className="sr-only"
                data-testid="action-feedback-live"
            >
                {feedback?.text ?? ""}
            </div>

            {children}

            {feedback ? (
                <div
                    className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm px-0 sm:right-6 sm:w-auto"
                    role="status"
                >
                    <div
                        className={`rounded-lg border p-4 text-sm shadow-lg ${toneClasses[feedback.tone]}`}
                    >
                        {/* Mensagens globais devem ser curtas e seguras; detalhes ficam no local autorizado. */}
                        {feedback.text}
                    </div>
                </div>
            ) : null}
        </ActionFeedbackContext.Provider>
    );
}

/**
 * Lê o contrato de feedback imediato dentro das rotas protegidas.
 *
 * @returns Funcoes para emitir loading, sucesso, erro e limpar feedback.
 * @throws Error quando usado fora de `ActionFeedbackProvider`.
 */
export function useActionFeedback(): ActionFeedbackContextValue {
    const context = useContext(ActionFeedbackContext);
    if (!context) {
        throw new Error(
            "useActionFeedback deve ser usado dentro de ActionFeedbackProvider.",
        );
    }

    return context;
}
