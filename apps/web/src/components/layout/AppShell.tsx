// apps/web/src/components/layout/AppShell.tsx
import { ReactNode } from "react";
import { User } from "../../lib/apiClient.js";
import {
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";

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
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <a href="/app/estudo" className="text-xl font-bold text-teal-800">
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
                                            ? "rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800"
                                            : "rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    }
                                    href={item.href}
                                    key={item.href}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{user.email}</span>
                        <button className="sf-button-secondary" onClick={() => void onLogout()}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            {/* A zona principal mantém o conteúdo da rota protegida sem decidir permissões. */}
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}