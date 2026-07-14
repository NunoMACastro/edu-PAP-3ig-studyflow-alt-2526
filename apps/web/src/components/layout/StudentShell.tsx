/** Shell dedicada ao aluno: quatro destinos, pesquisa e conta. */
import { useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NotificationProvider } from "../../features/mf5/notification-provider.js";
import { NotificationTray } from "../../features/mf5/notification-tray.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import type { User } from "../../lib/apiClient.js";
import { AccountMenu } from "./AccountMenu.js";
import { getNavigationForRole, isNavigationItemActive } from "./navigation.js";
import { SearchOverlay } from "./SearchOverlay.js";
import { ShellIcon } from "./shell-icons.js";
import { StudentBottomNavigation } from "./StudentBottomNavigation.js";
import { StudentAssistantLauncher } from "../../features/student-assistant/StudentAssistantLauncher.js";

export function StudentShell({ user, children, onLogout }: { user: User; children: ReactNode; onLogout: () => Promise<void> }) {
    const { pathname } = useLocation();
    const [searchOpen, setSearchOpen] = useState(false);
    const searchButtonRef = useRef<HTMLButtonElement>(null);
    const searchScope = resolveSearchScope(pathname);
    const logoutAction = useAsyncAction();
    const logout = () => void logoutAction.run("student-logout", async () => {
        // Limpa antes do await: o logout pode desmontar imediatamente a shell
        // e não deve deixar o adiamento preso à sessão seguinte do browser.
        sessionStorage.removeItem("studyflow:onboarding-deferred");
        await onLogout();
    }, "Não foi possível terminar a sessão.");
    const closeSearch = () => {
        setSearchOpen(false);
        requestAnimationFrame(() => searchButtonRef.current?.focus());
    };
    return (
        <NotificationProvider>
            <div className="min-h-screen bg-studyflow-page lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
                <a className="sr-only z-[80] rounded-xl bg-studyflow-card px-4 py-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3" href="#studyflow-main-content">Saltar para o conteúdo principal</a>
                <aside className="sticky top-0 hidden h-screen flex-col border-r border-studyflow-border/10 bg-studyflow-card/30 p-4 lg:flex">
                    <Link className="flex h-16 items-center gap-3 px-2" to="/app/hoje"><img alt="" aria-hidden="true" className="h-10 w-10 rounded-xl" src="/assets/studyflow-logo.svg" /><span className="text-lg font-bold">StudyFlow</span></Link>
                    <p className="px-3 pb-3 pt-5 text-xs font-semibold uppercase tracking-[.18em] text-studyflow-text/65">Área de aluno</p>
                    <nav aria-label="Navegação principal" className="space-y-1">
                        {getNavigationForRole("STUDENT").map((item) => {
                            const active = isNavigationItemActive(item, pathname);
                            return <NavLink aria-current={active ? "page" : undefined} className={active ? "flex min-h-11 items-center gap-3 rounded-xl bg-studyflow-brand px-3 text-sm font-semibold text-white" : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-card/70 hover:text-studyflow-text"} key={item.href} to={item.href}><ShellIcon className="h-5 w-5" name={item.icon} /><span>{item.label}</span></NavLink>;
                        })}
                    </nav>
                    <div className="mt-auto rounded-2xl border border-studyflow-border/10 bg-studyflow-page/30 p-3"><p className="truncate text-sm font-semibold">{user.email}</p><p className="mt-1 text-xs text-studyflow-text/55">Tudo o resto fica no menu da conta.</p></div>
                </aside>
                <div className="min-w-0 pb-20 lg:pb-0">
                    <header className="sticky top-0 z-40 border-b border-studyflow-border/10 bg-studyflow-page/90 backdrop-blur-xl">
                        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">
                            <Link aria-label="StudyFlow" className="flex items-center gap-2 lg:hidden" to="/app/hoje"><img alt="" aria-hidden="true" className="h-9 w-9 rounded-lg" src="/assets/studyflow-logo.svg" /><span className="hidden font-bold sm:inline">StudyFlow</span></Link>
                            <button ref={searchButtonRef} aria-label="Pesquisar nos meus estudos" className="ml-auto flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-studyflow-border/10 px-3 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-card sm:min-w-56 sm:justify-start" onClick={() => setSearchOpen(true)} type="button"><ShellIcon className="h-5 w-5" name="search" /><span className="hidden sm:inline">Pesquisar nos meus estudos</span></button>
                            <NotificationTray />
                            <AccountMenu onLogout={logout} pending={logoutAction.isPending} user={user} />
                        </div>
                    </header>
                    <main className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 xl:px-12" id="studyflow-main-content" tabIndex={-1}>
                        {logoutAction.error ? <p className="sf-error mb-5" role="alert">{logoutAction.error}</p> : null}
                        {children}
                    </main>
                </div>
                <StudentBottomNavigation />
                <SearchOverlay onClose={closeSearch} open={searchOpen} scope={searchScope} />
                <StudentAssistantLauncher />
            </div>
        </NotificationProvider>
    );
}

function resolveSearchScope(pathname: string): { type: "SUBJECT" | "STUDY_AREA"; id: string } | { type: "ALL_STUDIES" } {
    const subject = pathname.match(/^\/app\/disciplinas\/([^/]+)/)?.[1];
    if (subject) return { type: "SUBJECT", id: subject };
    const area = pathname.match(/^\/app\/areas\/([^/]+)/)?.[1];
    if (area) return { type: "STUDY_AREA", id: area };
    return { type: "ALL_STUDIES" };
}
