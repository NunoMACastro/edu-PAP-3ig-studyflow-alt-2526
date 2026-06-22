// apps/web/src/features/mf5/action-feedback.tsx
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

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

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(null);

const toneClasses: Record<FeedbackTone, string> = {
    loading: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
};

/**
 * Disponibiliza feedback imediato para ações autenticadas.
 *
 * @param props Conteúdo protegido que pode emitir mensagens de feedback.
 * @returns Provider com região visual e região acessível.
 */
export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
    const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

    const value = useMemo<ActionFeedbackContextValue>(
        () => ({
            feedback,
            notifyLoading: (text) => setFeedback({ tone: "loading", text }),
            notifySuccess: (text) => setFeedback({ tone: "success", text }),
            notifyError: (text) => setFeedback({ tone: "error", text }),
            clearFeedback: () => setFeedback(null),
        }),
        [feedback],
    );

    return (
        <ActionFeedbackContext.Provider value={value}>
            {/* aria-live anuncia mudanças de estado sem expor prompts, tokens ou dados privados. */}
            <div aria-live="polite" className="sr-only" data-testid="action-feedback-live">
                {feedback?.text ?? ""}
            </div>

            {children}

            {feedback ? (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4" role="status">
                    <div className={`rounded-lg border p-4 text-sm shadow-lg ${toneClasses[feedback.tone]}`}>
                        {/* A mensagem deve ser curta e segura; detalhes técnicos ficam nos logs controlados do backend. */}
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
 * @returns Funções para emitir loading, sucesso, erro e limpar feedback.
 */
export function useActionFeedback(): ActionFeedbackContextValue {
    const context = useContext(ActionFeedbackContext);
    if (!context) {
        throw new Error("useActionFeedback deve ser usado dentro de ActionFeedbackProvider.");
    }

    return context;
}