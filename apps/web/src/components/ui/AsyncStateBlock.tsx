/**
 * Apresenta estados assíncronos reutilizáveis nas páginas StudyFlow.
 */
import type { ReactNode } from "react";
import { EmptyState, InlineNotice } from "./CalmUi.js";

export type AsyncStateBlockProps = {
    isLoading: boolean;
    error?: string;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
    onRetry?: () => void;
};

/**
 * Componente visual para loading, erro, vazio e conteúdo com dados.
 *
 * @param props Estado assíncrono calculado pela página chamadora.
 * @returns Bloco React acessível e reutilizável.
 */
export function AsyncStateBlock(props: AsyncStateBlockProps) {
    if (props.isLoading) {
        return <InlineNotice>A carregar dados...</InlineNotice>;
    }

    if (props.error) {
        // A mensagem fica visível, mas autorização e ownership continuam a pertencer ao backend.
        return (
            <div className="space-y-3">
                <InlineNotice tone="danger">{props.error}</InlineNotice>
                {props.onRetry ? (
                    <button className="sf-button-secondary" onClick={props.onRetry} type="button">
                        Tentar novamente
                    </button>
                ) : null}
            </div>
        );
    }

    if (props.isEmpty) {
        // O estado vazio fica explícito para evitar listas silenciosamente sem conteúdo.
        return <EmptyState title={props.emptyMessage} />;
    }

    return <>{props.children}</>;
}
