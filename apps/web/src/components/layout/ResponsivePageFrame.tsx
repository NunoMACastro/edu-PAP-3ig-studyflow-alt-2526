/**
 * Organiza paginas autenticadas com conteudo principal e zona secundaria.
 */
import type { ReactNode } from "react";

/**
 * Props do frame responsivo; a pagina continua responsavel pelos dados e permissoes.
 */
type ResponsivePageFrameProps = {
    /** Conteudo principal que deve aparecer primeiro no DOM e em mobile. */
    main: ReactNode;
    /** Zona secundaria opcional, como formularios, filtros ou acoes de apoio. */
    aside?: ReactNode;
    /** Nome acessivel da zona secundaria quando ela existe. */
    asideLabel?: string;
};

/**
 * Organiza uma pagina em uma coluna no mobile e duas zonas no desktop.
 *
 * @param props Conteudo principal, zona secundaria opcional e etiqueta acessivel.
 * @returns Estrutura responsiva sem logica de dominio.
 */
export function ResponsivePageFrame({
    main,
    aside,
    asideLabel = "Acoes secundarias",
}: ResponsivePageFrameProps) {
    if (!aside) {
        return <div className="min-w-0 space-y-4">{main}</div>;
    }

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* O conteudo principal vem primeiro para preservar leitura natural em mobile. */}
            <div className="min-w-0 space-y-4">{main}</div>

            <aside
                aria-label={asideLabel}
                className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start"
            >
                {/* min-w-0 impede que URLs, emails ou titulos longos criem scroll horizontal. */}
                {aside}
            </aside>
        </div>
    );
}
