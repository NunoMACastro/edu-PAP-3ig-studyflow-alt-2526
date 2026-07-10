/**
 * Implementa um componente React reutilizavel para layout.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { User } from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    getDefaultPathForRole,
    getNavigationForRole,
    isNavigationItemActive,
} from "./navigation.js";
import { IconTooltip, ShellIcon } from "./shell-icons.js";

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
    const { pathname: currentPathname } = useLocation();
    const homePath = getDefaultPathForRole(user.role);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const logoutAction = useAsyncAction();

    useEffect(() => {
        setMenuOpen(false);
    }, [currentPathname]);

    /**
     * Aguarda confirmação do backend antes de remover a shell autenticada.
     */
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

    return (
        <div className="min-h-screen bg-studyflow-page">
            <a
                className="sr-only z-50 rounded-md bg-studyflow-card px-4 py-3 text-studyflow-text focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
                href="#studyflow-main-content"
            >
                Saltar para o conteúdo principal
            </a>
            <header className="border-b border-studyflow-card bg-studyflow-navy">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
                    <Link
                        to={homePath}
                        className="min-w-0 shrink-0 truncate text-xl font-bold tracking-tight text-studyflow-text"
                    >
                        StudyFlow
                    </Link>

                    <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
                        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
                            {navigation.map((item) => {
                                const isActive = isNavigationItemActive(item, currentPathname);
                                return (
                                    <NavLink
                                        aria-current={isActive ? "page" : undefined}
                                        aria-label={item.label}
                                        className={
                                            isActive
                                                ? "group relative inline-flex h-11 w-11 items-center justify-center rounded-md bg-studyflow-brand text-white xl:w-auto xl:gap-2 xl:px-3"
                                                : "group relative inline-flex h-11 w-11 items-center justify-center rounded-md text-studyflow-text transition hover:bg-studyflow-navyHover xl:w-auto xl:gap-2 xl:px-3"
                                        }
                                        key={item.href}
                                        to={item.href}
                                    >
                                        <ShellIcon className="h-5 w-5" name={item.icon} />
                                        <span className="hidden text-sm font-semibold xl:inline">
                                            {item.label}
                                        </span>
                                        <span className="xl:hidden">
                                            <IconTooltip align="center">{item.label}</IconTooltip>
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                        {/* O tray só apresenta notificações; filtragem e permissões continuam na API. */}
                        <NotificationTray />
                        <NavLink
                            aria-current={currentPathname === "/app/privacidade" ? "page" : undefined}
                            aria-label={`Privacidade da conta: ${user.email}`}
                            className={
                                currentPathname === "/app/privacidade"
                                    ? "group relative hidden h-11 w-11 items-center justify-center rounded-md bg-studyflow-brand text-white md:inline-flex"
                                    : "group relative hidden h-11 w-11 items-center justify-center rounded-md text-studyflow-text transition hover:bg-studyflow-navyHover md:inline-flex"
                            }
                            to="/app/privacidade"
                        >
                            <ShellIcon className="h-5 w-5" name="user" />
                            <span className="sr-only">Privacidade da conta</span>
                            <IconTooltip>Privacidade</IconTooltip>
                        </NavLink>
                        <button
                            aria-label="Sair"
                            className="group relative hidden h-11 w-11 items-center justify-center rounded-md text-studyflow-text transition hover:bg-studyflow-navyHover md:inline-flex"
                            disabled={logoutAction.isPending}
                            onClick={() => void handleLogout()}
                            type="button"
                        >
                            <ShellIcon className="h-5 w-5" name="logOut" />
                            <span className="sr-only">Sair</span>
                            <IconTooltip>Sair</IconTooltip>
                        </button>
                        <button
                            ref={menuButtonRef}
                            aria-controls="studyflow-mobile-navigation"
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-studyflow-text hover:bg-studyflow-navyHover md:hidden"
                            onClick={() => setMenuOpen((current) => !current)}
                            type="button"
                        >
                            <ShellIcon className="h-5 w-5" name="menu" />
                        </button>
                    </div>
                </div>

                {menuOpen ? (
                    <div
                        ref={mobileMenuRef}
                        className="border-t border-studyflow-card px-4 pb-3 sm:px-6 md:hidden"
                        id="studyflow-mobile-navigation"
                    >
                        <nav
                            aria-label="Navegação principal móvel"
                            className="grid gap-1 pt-3"
                        >
                            {navigation.map((item) => {
                                const isActive = isNavigationItemActive(
                                    item,
                                    currentPathname,
                                );
                                return (
                                    <NavLink
                                        aria-current={isActive ? "page" : undefined}
                                        className={
                                            isActive
                                                ? "flex min-h-11 items-center gap-3 rounded-md bg-studyflow-brand px-3 text-sm font-semibold text-white"
                                                : "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-studyflow-text hover:bg-studyflow-navyHover"
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
                                className={
                                    currentPathname === "/app/privacidade"
                                        ? "flex min-h-11 items-center gap-3 rounded-md bg-studyflow-brand px-3 text-sm font-semibold text-white"
                                        : "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-studyflow-text hover:bg-studyflow-navyHover"
                                }
                                to="/app/privacidade"
                            >
                                <ShellIcon className="h-5 w-5" name="user" />
                                Privacidade da conta
                            </NavLink>
                            <button
                                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-studyflow-text hover:bg-studyflow-navyHover"
                                disabled={logoutAction.isPending}
                                onClick={() => void handleLogout()}
                                type="button"
                            >
                                <ShellIcon className="h-5 w-5" name="logOut" />
                                {logoutAction.isPending ? "A sair..." : "Sair"}
                            </button>
                        </nav>
                    </div>
                ) : null}
            </header>
            <main
                className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
                id="studyflow-main-content"
                tabIndex={-1}
            >
                {logoutAction.error ? (
                    <p className="sf-error mb-4" role="alert">
                        {logoutAction.error}
                    </p>
                ) : null}
                {children}
            </main>
        </div>
    );
}
