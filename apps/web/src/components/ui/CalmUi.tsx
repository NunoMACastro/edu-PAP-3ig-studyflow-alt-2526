/**
 * Primitivas semânticas do sistema visual StudyFlow Calm Focus.
 */
import type { ReactNode } from "react";
import { ShellIcon, type ShellIconName } from "../layout/shell-icons.js";

export type CalmTone = "attention" | "brand" | "danger" | "neutral";

type SectionHeaderProps = {
    action?: ReactNode;
    description?: string;
    eyebrow?: string;
    title: string;
};

/** Apresenta uma secção interna sem competir com o título principal da página. */
export function SectionHeader({ action, description, eyebrow, title }: SectionHeaderProps) {
    return (
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-studyflow-brandText">
                        {eyebrow}
                    </p>
                ) : null}
                <h2 className="mt-1 text-xl font-bold tracking-tight text-studyflow-text">{title}</h2>
                {description ? (
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-studyflow-text/65">{description}</p>
                ) : null}
            </div>
            {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
        </header>
    );
}

/** Região compacta para pesquisa, filtros, ordenação e contagens. */
export function Toolbar({ ariaLabel, children, className = "" }: {
    ariaLabel: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section aria-label={ariaLabel} className={`sf-toolbar ${className}`.trim()}>
            {children}
        </section>
    );
}

/** Estado vazio consistente com ação opcional e iconografia existente. */
export function EmptyState({ action, description, icon = "info", title }: {
    action?: ReactNode;
    description?: string;
    icon?: ShellIconName;
    title: string;
}) {
    return (
        <div className="sf-empty-state" aria-live="polite">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-studyflow-brand/10 text-studyflow-brandText">
                <ShellIcon className="h-5 w-5" name={icon} />
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
            {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-studyflow-text/65">{description}</p> : null}
            {action ? <div className="mt-5 flex flex-wrap gap-2">{action}</div> : null}
        </div>
    );
}

/** Badge de estado sem introduzir semântica de domínio nova. */
export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: CalmTone }) {
    return <span className={`sf-badge sf-badge-${tone}`}>{children}</span>;
}

/** Notice acessível para feedback assíncrono e estados globais. */
export function InlineNotice({ children, role, tone = "neutral" }: {
    children: ReactNode;
    role?: "alert" | "status";
    tone?: CalmTone;
}) {
    return (
        <div className={`sf-notice sf-notice-${tone}`} role={role ?? (tone === "danger" ? "alert" : "status")}>
            {children}
        </div>
    );
}

export type MetricItem = {
    href?: string;
    label: string;
    value: ReactNode;
};

/** Faixa de métricas integrada para dashboards e resumos de recurso. */
export function MetricStrip({ ariaLabel, items }: { ariaLabel: string; items: MetricItem[] }) {
    const columnsClass = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "";
    return (
        <dl aria-label={ariaLabel} className={`sf-metric-strip ${columnsClass}`.trim()}>
            {items.map((item) => (
                <div className="min-w-0 px-4 py-4 sm:px-5" key={item.label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-studyflow-text/70">{item.label}</dt>
                    <dd className="mt-2 text-3xl font-bold tracking-tight text-studyflow-text">
                        {item.href ? <a className="hover:text-studyflow-brandText" href={item.href}>{item.value}</a> : item.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
