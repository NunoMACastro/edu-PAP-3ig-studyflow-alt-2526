// apps/web/src/components/layout/AppShell.tsx
import type { ReactNode } from "react";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { User } from "../../lib/apiClient.js";

type AppShellProps = {
    user: User;
    children: ReactNode;
    onLogout: () => Promise<void>;
};

const studentNavigation = [
    { href: "/app/estudo", label: "Estudo" },
    { href: "/app/perfil", label: "Perfil" },
    { href: "/app/privacidade", label: "Privacidade" },
    { href: "/app/rotinas", label: "Rotinas" },
    { href: "/app/historico", label: "Histórico" },
    { href: "/app/areas", label: "Áreas" },
    { href: "/app/salas", label: "Salas" },
    { href: "/app/comunidade", label: "Comunidade" },
    { href: "/app/turmas", label: "Turmas" },
];

const teacherNavigation = [
    { href: "/app/professor/turmas", label: "Área docente" },
    { href: "/app/professor/acompanhamento", label: "Acompanhamento" },
    { href: "/app/privacidade", label: "Privacidade" },
];

const adminNavigation = [
    { href: "/app/admin/governanca", label: "Governança" },
    { href: "/app/privacidade", label: "Privacidade" },
];

/**
 * Layout principal das páginas protegidas.
 *
 * @param props Utilizador autenticado, conteúdo e ação de logout.
 * @returns Estrutura visual com navegação consistente e notificações in-app.
 */
export function AppShell({ user, children, onLogout }: AppShellProps) {
    const navigation =
        user.role === "ADMIN"
            ? adminNavigation
            : user.role === "TEACHER"
              ? teacherNavigation
              : studentNavigation;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <a href="/app/estudo" className="text-xl font-bold text-teal-800">
                        StudyFlow
                    </a>
                    <nav className="flex flex-wrap gap-2">
                        {navigation.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        {/* O tray é apenas apresentação; a API decide que notificações o utilizador pode ver. */}
                        <NotificationTray />
                        <span className="text-sm text-slate-600">{user.email}</span>
                        <button className="sf-button-secondary" onClick={() => void onLogout()}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}