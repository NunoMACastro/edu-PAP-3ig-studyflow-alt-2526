/**
 * Implementa um componente React reutilizavel para layout.
 */
import type { ReactNode } from "react";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { User } from "../../lib/apiClient.js";
import {
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";

/**
 * Props do componente React de layout; mantêm explícitas as dependências vindas da página.
 */
type AppShellProps = {
    user: User;
    children: ReactNode;
    onLogout: () => Promise<void>;
};

/**
 * Layout principal das páginas protegidas.
 *
 * @param props Utilizador autenticado, conteúdo e ação de logout.
 * @returns Estrutura visual com navegação consistente.
 */
export function AppShell({ user, children, onLogout }: AppShellProps) {
    const navigation = getNavigationForRole(user.role);
    const currentPathname = window.location.pathname;

    return (
        <div className="min-h-screen bg-studyflow-page">
            <header className="border-b border-studyflow-navy bg-studyflow-navy">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <a href="/app/estudo" className="text-xl font-bold text-studyflow-text">
                        StudyFlow
                    </a>
                    <nav aria-label="Navegação principal" className="flex flex-wrap gap-2">
                        {navigation.map((item) => {
                            const isActive = isNavigationItemActive(item, currentPathname);
                            return (
                                <a
                                    aria-current={isActive ? "page" : undefined}
                                    className={
                                        isActive
                                            ? "rounded-md bg-studyflow-brand px-3 py-2 text-sm font-semibold text-studyflow-text"
                                            : "rounded-md px-3 py-2 text-sm font-medium text-studyflow-text hover:bg-studyflow-navyHover"
                                    }
                                    href={item.href}
                                    key={item.href}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* O tray só apresenta notificações; filtragem e permissões continuam na API. */}
                        <NotificationTray />
                        <span className="text-sm text-studyflow-text">{user.email}</span>
                        <button
                            className="inline-flex items-center justify-center rounded-md border border-studyflow-border bg-studyflow-card px-4 py-2 text-sm font-semibold text-studyflow-text transition hover:bg-studyflow-card"
                            onClick={() => void onLogout()}
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}
