/**
 * Primitives de superfície do design system StudyFlow Calm Focus.
 */
import type { HTMLAttributes, ReactNode } from "react";

type SurfaceElement = "article" | "aside" | "div" | "form" | "li" | "main" | "section";
type SurfaceVariant = "default" | "elevated" | "interactive" | "subtle";
export type SurfaceTone = "attention" | "brand" | "danger" | "neutral";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
    as?: SurfaceElement;
    children: ReactNode;
    tone?: SurfaceTone;
    variant?: SurfaceVariant;
};

const variantClasses: Record<SurfaceVariant, string> = {
    default: "sf-surface",
    elevated: "sf-surface sf-surface-elevated",
    interactive: "sf-surface sf-surface-interactive",
    subtle: "sf-surface-subtle",
};

const toneClasses: Record<SurfaceTone, string> = {
    attention: "sf-surface-tone-attention",
    brand: "sf-surface-tone-brand",
    danger: "sf-surface-tone-danger",
    neutral: "",
};

/**
 * Aplica hierarquia visual consistente sem impor regras de domínio ou conteúdo.
 *
 * @param props Elemento semântico, variante e atributos HTML da superfície.
 * @returns Contentor semântico com os tokens visuais StudyFlow.
 */
export function Surface({
    as: Element = "div",
    children,
    className = "",
    tone = "neutral",
    variant = "default",
    ...rest
}: SurfaceProps): ReactNode {
    return (
        <Element
            className={`${variantClasses[variant]} ${toneClasses[tone]} ${className}`.trim()}
            {...rest}
        >
            {children}
        </Element>
    );
}
