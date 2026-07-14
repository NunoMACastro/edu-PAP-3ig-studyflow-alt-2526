/**
 * Shell autenticada responsiva do StudyFlow Calm Focus.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { NotificationProvider } from "../../features/mf5/notification-provider.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import type { User } from "../../lib/apiClient.js";
import {
    getDefaultPathForRole,
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";
import { IconTooltip, ShellIcon } from "./shell-icons.js";
import { StudentShell } from "./StudentShell.js";

type AppShellProps = {
    user: User;
    children: ReactNode;
    onLogout: () => Promise<void>;
};

const roleLabels: Record<User["role"], string> = {
    ADMIN: "Administração",
    STUDENT: "Área de aluno",
    TEACHER: "Área docente",
};

/**
 * Organiza as páginas protegidas numa sidebar desktop e menu sobreposto mobile.
 *
 * @param props Utilizador autenticado, conteúdo e ação de logout.
 * @returns Estrutura visual e de navegação consistente entre papéis.
 */
export function AppShell({ user, children, onLogout }: AppShellProps) {
    if (user.role === "STUDENT") {
        return <StudentShell user={user} onLogout={onLogout}>{children}</StudentShell>;
    }
    const navigation = getNavigationForRole(user.role);
    const { pathname: currentPathname } = useLocation();
    const homePath = getDefaultPathForRole(user.role);
    const [menuOpen, setMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const logoutAction = useAsyncAction();

    useEffect(() => {
        setMenuOpen(false);
    }, [currentPathname]);

    /** Aguarda confirmação do backend antes de remover a shell autenticada. */
    async function handleLogout(): Promise<void> {
        await logoutAction.run(
            "logout",
            onLogout,
            "Não foi possível terminar a sessão.",
        );
    }

    useEffect(() => {
        if (!menuOpen) return undefined;
        const closeAndRestoreFocus = (): void => {
            setMenuOpen(false);
            window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        };
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") closeAndRestoreFocus();
        };
        const handlePointerDown = (event: PointerEvent): void => {
            if (!(event.target instanceof Node)) return;
            if (mobileMenuRef.current?.contains(event.target)) return;
            if (menuButtonRef.current?.contains(event.target)) return;
            closeAndRestoreFocus();
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [menuOpen]);

    const gridColumns = sidebarCollapsed
        ? "lg:grid-cols-[6rem_minmax(0,1fr)]"
        : "lg:grid-cols-[18rem_minmax(0,1fr)]";

    return (
        <NotificationProvider>
        <div className={`min-h-screen bg-studyflow-page lg:grid ${gridColumns}`}>
            <a
                className="sr-only z-[80] rounded-xl bg-studyflow-card px-4 py-3 text-studyflow-text focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
                href="#studyflow-main-content"
            >
                Saltar para o conteúdo principal
            </a>

            <aside
                className="sticky top-0 z-30 hidden h-screen min-w-0 flex-col border-r border-studyflow-border/10 bg-studyflow-card/30 p-3 transition-[width] duration-200 lg:flex"
                data-collapsed={sidebarCollapsed ? "true" : "false"}
            >
                <div className={`flex h-16 items-center ${sidebarCollapsed ? "justify-center" : "gap-3 px-2"}`}>
                    <Link
                        aria-label="StudyFlow"
                        className="group relative flex min-w-0 items-center gap-3"
                        to={homePath}
                    >
                        <img
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-black/20"
                            src="/assets/studyflow-logo.svg"
                        />
                        {!sidebarCollapsed ? (
                            <span className="truncate text-lg font-bold tracking-tight">StudyFlow</span>
                        ) : (
                            <IconTooltip align="center">StudyFlow</IconTooltip>
                        )}
                    </Link>
                </div>

                <div className={sidebarCollapsed ? "px-1 py-3" : "px-3 py-3"}>
                    {!sidebarCollapsed ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studyflow-text/45">
                            {roleLabels[user.role]}
                        </p>
                    ) : (
                        <div className="mx-auto h-px w-8 bg-studyflow-border/10" />
                    )}
                </div>

                <nav
                    aria-label="Navegação principal"
                    className={`min-h-0 flex-1 space-y-1 py-2 ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}
                >
                    {navigation.map((item) => {
                        const isActive = isNavigationItemActive(item, currentPathname);
                        return (
                            <NavLink
                                aria-current={isActive ? "page" : undefined}
                                aria-label={item.label}
                                className={
                                    isActive
                                        ? `group relative flex min-h-11 items-center rounded-xl bg-studyflow-brand text-white shadow-lg shadow-black/10 ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`
                                        : `group relative flex min-h-11 items-center rounded-xl text-studyflow-text/70 transition hover:bg-studyflow-card/70 hover:text-studyflow-text ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`
                                }
                                key={item.href}
                                to={item.href}
                            >
                                <ShellIcon className="h-5 w-5 shrink-0" name={item.icon} />
                                {!sidebarCollapsed ? (
                                    <span className="truncate text-sm font-semibold">{item.label}</span>
                                ) : (
                                    <IconTooltip side="right">{item.label}</IconTooltip>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="space-y-2 border-t border-studyflow-border/10 pt-3">
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between gap-2 px-2"}`}>
                        {!sidebarCollapsed ? (
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-studyflow-text">{user.email}</p>
                                <p className="mt-0.5 text-xs text-studyflow-text/50">{roleLabels[user.role]}</p>
                            </div>
                        ) : null}
                        <NotificationTray placement="side" />
                    </div>
                    <NavLink
                        aria-current={currentPathname === "/app/privacidade" ? "page" : undefined}
                        aria-label={`Privacidade da conta: ${user.email}`}
                        className={
                            currentPathname === "/app/privacidade"
                                ? `group relative flex min-h-11 items-center rounded-xl bg-studyflow-card text-studyflow-text ${sidebarCollapsed ? "justify-center" : "gap-3 px-3"}`
                                : `group relative flex min-h-11 items-center rounded-xl text-studyflow-text/70 transition hover:bg-studyflow-card/70 hover:text-studyflow-text ${sidebarCollapsed ? "justify-center" : "gap-3 px-3"}`
                        }
                        to="/app/privacidade"
                    >
                        <ShellIcon className="h-5 w-5 shrink-0" name="user" />
                        {!sidebarCollapsed ? <span className="text-sm font-semibold">Privacidade</span> : <IconTooltip side="right">Privacidade</IconTooltip>}
                    </NavLink>
                    <button
                        aria-label="Sair"
                        className={`group relative flex min-h-11 w-full items-center rounded-xl text-studyflow-text/70 transition hover:bg-studyflow-card/70 hover:text-studyflow-text ${sidebarCollapsed ? "justify-center" : "gap-3 px-3"}`}
                        disabled={logoutAction.isPending}
                        onClick={() => void handleLogout()}
                        type="button"
                    >
                        <ShellIcon className="h-5 w-5 shrink-0" name="logOut" />
                        {!sidebarCollapsed ? (
                            <span>{logoutAction.isPending ? "A sair..." : "Sair"}</span>
                        ) : (
                            <IconTooltip side="right">Sair</IconTooltip>
                        )}
                    </button>
                    <button
                        aria-label={sidebarCollapsed ? "Expandir navegação" : "Recolher navegação"}
                        className="group relative flex min-h-10 w-full items-center justify-center rounded-xl border border-studyflow-border/10 text-studyflow-text/55 transition hover:bg-studyflow-card/70 hover:text-studyflow-text"
                        onClick={() => setSidebarCollapsed((current) => !current)}
                        type="button"
                    >
                        <ShellIcon
                            className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
                            name="arrowRight"
                        />
                        <IconTooltip align="center" side={sidebarCollapsed ? "right" : "top"}>
                            {sidebarCollapsed ? "Expandir navegação" : "Recolher navegação"}
                        </IconTooltip>
                    </button>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-50 border-b border-studyflow-border/10 bg-studyflow-page/90 backdrop-blur-xl lg:hidden">
                    <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                        <Link className="flex min-w-0 items-center gap-2" to={homePath}>
                            <img alt="" aria-hidden="true" className="h-9 w-9 rounded-lg" src="/assets/studyflow-logo.svg" />
                            <span className="truncate text-lg font-bold tracking-tight">StudyFlow</span>
                        </Link>
                        <div className="ml-auto flex items-center gap-1">
                            <NotificationTray />
                            <button
                                ref={menuButtonRef}
                                aria-controls="studyflow-mobile-navigation"
                                aria-expanded={menuOpen}
                                aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                                className="sf-icon-button"
                                onClick={() => setMenuOpen((current) => !current)}
                                type="button"
                            >
                                <ShellIcon className="h-5 w-5" name="menu" />
                            </button>
                        </div>
                    </div>
                </header>

                {menuOpen ? (
                    <div className="fixed inset-0 z-40 bg-studyflow-page/65 backdrop-blur-sm lg:hidden">
                        <div
                            ref={mobileMenuRef}
                            className="absolute inset-x-3 top-[4.75rem] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-studyflow-border/10 bg-studyflow-card p-3 shadow-2xl sm:left-auto sm:right-4 sm:w-80"
                            id="studyflow-mobile-navigation"
                        >
                            <div className="border-b border-studyflow-border/10 px-3 pb-3 pt-1">
                                <p className="truncate text-sm font-semibold">{user.email}</p>
                                <p className="mt-1 text-xs text-studyflow-text/75">{roleLabels[user.role]}</p>
                            </div>
                            <nav aria-label="Navegação principal móvel" className="space-y-1 py-3">
                                {navigation.map((item) => {
                                    const isActive = isNavigationItemActive(item, currentPathname);
                                    return (
                                        <NavLink
                                            aria-current={isActive ? "page" : undefined}
                                            className={
                                                isActive
                                                    ? "flex min-h-11 items-center gap-3 rounded-xl bg-studyflow-brand px-3 text-sm font-semibold text-white"
                                                    : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-studyflow-text/75 hover:bg-studyflow-page/55 hover:text-studyflow-text"
                                            }
                                            key={item.href}
                                            to={item.href}
                                        >
                                            <ShellIcon className="h-5 w-5" name={item.icon} />
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                                <NavLink
                                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-studyflow-text/75 hover:bg-studyflow-page/55 hover:text-studyflow-text"
                                    to="/app/privacidade"
                                >
                                    <ShellIcon className="h-5 w-5" name="user" />
                                    Privacidade da conta
                                </NavLink>
                                <button
                                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-studyflow-text/75 hover:bg-studyflow-page/55 hover:text-studyflow-text"
                                    disabled={logoutAction.isPending}
                                    onClick={() => void handleLogout()}
                                    type="button"
                                >
                                    <ShellIcon className="h-5 w-5" name="logOut" />
                                    {logoutAction.isPending ? "A sair..." : "Sair"}
                                </button>
                            </nav>
                        </div>
                    </div>
                ) : null}

                <main
                    className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 xl:px-12"
                    id="studyflow-main-content"
                    tabIndex={-1}
                >
                    {logoutAction.error ? (
                        <p className="sf-error mb-5" role="alert">{logoutAction.error}</p>
                    ) : null}
                    {children}
                </main>
            </div>
        </div>
        </NotificationProvider>
    );
}
