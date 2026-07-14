/**
 * Componente visual comum para o topo das paginas StudyFlow.
 */
import type { ReactNode } from "react";

/**
 * Props do cabecalho comum; regras de dominio ficam sempre na pagina ou backend.
 */
type PageHeaderProps = {
    title: string;
    description: string;
    action?: ReactNode;
};

/**
 * Mostra titulo principal, descricao e acao opcional com uma hierarquia previsivel.
 *
 * @param props Conteudo visual do cabecalho.
 * @returns Cabecalho reutilizavel com exatamente um `h1`.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-2">
                {/* Um unico h1 por pagina ajuda leitores de ecra, testes e navegacao por headings. */}
                <h1 className="text-3xl font-bold tracking-tight text-studyflow-text">{title}</h1>
                <p className="text-sm leading-6 text-studyflow-text/80 sm:text-base">{description}</p>
            </div>
            {action ? (
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {action}
                </div>
            ) : null}
        </header>
    );
}
