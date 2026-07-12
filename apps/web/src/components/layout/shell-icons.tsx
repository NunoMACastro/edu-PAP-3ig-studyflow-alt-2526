import type { ReactNode, SVGProps } from "react";

export type ShellIconName =
    | "arrowRight"
    | "book"
    | "calendar"
    | "chart"
    | "clipboard"
    | "file"
    | "folder"
    | "graduation"
    | "history"
    | "home"
    | "help"
    | "info"
    | "lock"
    | "logOut"
    | "menu"
    | "megaphone"
    | "message"
    | "plus"
    | "shield"
    | "spark"
    | "trash"
    | "user"
    | "users"
    | "bell";

type ShellIconProps = SVGProps<SVGSVGElement> & {
    name: ShellIconName;
};

type IconTooltipProps = {
    align?: "center" | "right";
    children: ReactNode;
    side?: "bottom" | "right" | "top";
};

/**
 * Ícones SVG leves usados na shell sem adicionar dependências novas.
 *
 * @param props Nome do ícone e atributos SVG opcionais.
 * @returns Ícone decorativo herdando a cor do elemento pai.
 */
export function ShellIcon({ name, ...props }: ShellIconProps) {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            {...props}
        >
            {renderIconPath(name)}
        </svg>
    );
}

/**
 * Label visual para botões de ícone na shell.
 *
 * @param props Texto visível, alinhamento e lado relativo ao ícone.
 * @returns Tooltip acessível por hover/focus sem depender do `title` nativo.
 */
export function IconTooltip({ align = "right", children, side = "bottom" }: IconTooltipProps) {
    const horizontalAlignment = align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "right-0";
    const positionClass = side === "right"
        ? "left-full top-1/2 ml-2 -translate-y-1/2"
        : side === "top"
            ? `bottom-full mb-2 ${horizontalAlignment}`
            : `top-full mt-2 ${horizontalAlignment}`;

    return (
        <span
            aria-hidden="true"
            className={`pointer-events-none absolute z-40 whitespace-nowrap rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 bg-studyflow-card px-2 py-1 text-xs font-semibold text-studyflow-text opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 ${positionClass}`}
            data-tooltip-side={side}
        >
            {children}
        </span>
    );
}

/**
 * Mantém os paths num switch explícito para evitar dependências e strings mágicas espalhadas.
 *
 * @param name Nome funcional do ícone.
 * @returns Elementos SVG correspondentes.
 */
function renderIconPath(name: ShellIconName) {
    switch (name) {
        case "arrowRight":
            return (
                <>
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                </>
            );
        case "bell":
            return (
                <>
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                </>
            );
        case "book":
            return (
                <>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
                </>
            );
        case "calendar":
            return (
                <>
                    <path d="M7 2v4" />
                    <path d="M17 2v4" />
                    <rect height="18" rx="2" width="18" x="3" y="4" />
                    <path d="M3 10h18" />
                </>
            );
        case "chart":
            return (
                <>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-3" />
                </>
            );
        case "clipboard":
            return (
                <>
                    <rect height="18" rx="2" width="14" x="5" y="4" />
                    <path d="M9 4a3 3 0 0 1 6 0" />
                    <path d="M9 12h6" />
                    <path d="M9 16h4" />
                </>
            );
        case "file":
            return (
                <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                </>
            );
        case "folder":
            return (
                <>
                    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </>
            );
        case "graduation":
            return (
                <>
                    <path d="M3 8l9-5 9 5-9 5z" />
                    <path d="M7 10v5c3 2 7 2 10 0v-5" />
                    <path d="M21 8v6" />
                </>
            );
        case "history":
            return (
                <>
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                    <path d="M12 7v6l4 2" />
                </>
            );
        case "home":
            return (
                <>
                    <path d="M3 11l9-8 9 8" />
                    <path d="M5 10v10h14V10" />
                    <path d="M9 20v-6h6v6" />
                </>
            );
        case "help":
            return (
                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9.5 9a2.5 2.5 0 0 1 4.3 1.7c0 1.7-1.2 2.3-2 2.8-.6.4-.8.7-.8 1.5" />
                    <path d="M12 18h.01" />
                </>
            );
        case "info":
            return (
                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5" />
                    <path d="M12 8h.01" />
                </>
            );
        case "lock":
            return (
                <>
                    <rect height="11" rx="2" width="16" x="4" y="11" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </>
            );
        case "logOut":
            return (
                <>
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 3v18" />
                </>
            );
        case "menu":
            return (
                <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                </>
            );
        case "megaphone":
            return (
                <>
                    <path d="M3 11v2a2 2 0 0 0 2 2h2l4 4v-5l8 3V7l-8 3V5L7 9H5a2 2 0 0 0-2 2z" />
                </>
            );
        case "message":
            return (
                <>
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </>
            );
        case "plus":
            return (
                <>
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                </>
            );
        case "shield":
            return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
        case "spark":
            return (
                <>
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
                    <path d="M19 16l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5z" />
                </>
            );
        case "trash":
            return (
                <>
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                </>
            );
        case "user":
            return (
                <>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                </>
            );
        case "users":
            return (
                <>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
                    <path d="M16 3.1a4 4 0 0 1 0 7.8" />
                </>
            );
    }
}
