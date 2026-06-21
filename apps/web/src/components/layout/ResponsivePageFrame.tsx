// apps/web/src/components/layout/ResponsivePageFrame.tsx
import { ReactNode } from "react";

/**
 * Dados necessários para organizar uma página com conteúdo principal e zona secundária.
 */
type ResponsivePageFrameProps = {
    /** Conteúdo principal da página, por exemplo uma lista de materiais ou turmas. */
    main: ReactNode;
    /** Conteúdo secundário, por exemplo formulário, filtros ou ações de apoio. */
    aside?: ReactNode;
    /** Nome acessível da zona secundária, usado apenas quando existe `aside`. */
    asideLabel?: string;
};

/**
 * Organiza páginas StudyFlow em uma coluna no mobile e duas zonas no desktop.
 *
 * @param props Conteúdo principal, zona secundária opcional e etiqueta acessível.
 * @returns Frame responsivo sem lógica de domínio.
 */
export function ResponsivePageFrame({
    main,
    aside,
    asideLabel = "Ações secundárias",
}: ResponsivePageFrameProps) {
    if (!aside) {
        return <div className="min-w-0 space-y-4">{main}</div>;
    }

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* O conteúdo principal vem primeiro no DOM para preservar leitura natural em mobile e leitores de ecrã. */}
            <div className="min-w-0 space-y-4">{main}</div>

            <aside
                aria-label={asideLabel}
                className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start"
            >
                {/* min-w-0 impede que URLs, emails ou títulos longos criem scroll horizontal dentro da grelha. */}
                {aside}
            </aside>
        </div>
    );
}