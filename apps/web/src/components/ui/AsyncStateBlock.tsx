/**
 * Apresenta estados assíncronos reutilizáveis nas páginas StudyFlow.
 */
import type { ReactNode } from "react";

export type AsyncStateBlockProps = {
    isLoading: boolean;
    error?: string;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
};

/**
 * Componente visual para loading, erro, vazio e conteúdo com dados.
 *
 * @param props Estado assíncrono calculado pela página chamadora.
 * @returns Bloco React acessível e reutilizável.
 */
export function AsyncStateBlock(props: AsyncStateBlockProps) {
    if (props.isLoading) {
        return (
            <p className="text-sm text-studyflow-text" aria-live="polite">
                A carregar dados...
            </p>
        );
    }

    if (props.error) {
        // A mensagem fica visível, mas autorização e ownership continuam a pertencer ao backend.
        return (
            <p className="sf-error" role="alert">
                {props.error}
            </p>
        );
    }

    if (props.isEmpty) {
        // O estado vazio fica explícito para evitar listas silenciosamente sem conteúdo.
        return (
            <p className="text-sm text-studyflow-text" aria-live="polite">
                {props.emptyMessage}
            </p>
        );
    }

    return <>{props.children}</>;
}
