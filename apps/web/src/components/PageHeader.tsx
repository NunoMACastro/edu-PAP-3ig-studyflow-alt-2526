// apps/web/src/components/PageHeader.tsx
import { ReactNode } from "react";

/**
 * Dados necessários para construir o topo comum de uma página StudyFlow.
 */
type PageHeaderProps = {
    /** Título principal da página; deve originar exatamente um `h1`. */
    title: string;
    /** Texto curto que explica ao utilizador o que pode fazer neste ecrã. */
    description: string;
    /** Ação principal opcional, por exemplo uma ligação ou botão. */
    action?: ReactNode;
};

/**
 * Mostra o título, a descrição e uma ação principal de forma consistente.
 *
 * @param props Dados visuais recebidos da página que usa o componente.
 * @returns Cabeçalho reutilizável para páginas protegidas do StudyFlow.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <header className="sf-panel flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-2">
                {/* Um único h1 por página torna a navegação mais previsível para leitores de ecrã e testes. */}
                <h1 className="text-2xl font-bold text-teal-900">{title}</h1>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>

            {action ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {/* A ação vem da página para este componente não decidir regras de domínio ou permissões. */}
                    {action}
                </div>
            ) : null}
        </header>
    );
}