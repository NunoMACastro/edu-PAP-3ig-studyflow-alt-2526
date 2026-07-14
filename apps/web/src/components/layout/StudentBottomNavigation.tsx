/** Navegação móvel persistente, textual e compatível com safe areas. */
import { NavLink, useLocation } from "react-router-dom";
import { getNavigationForRole, isNavigationItemActive } from "./navigation.js";
import { ShellIcon } from "./shell-icons.js";

export function StudentBottomNavigation() {
    const { pathname } = useLocation();
    return (
        <nav
            aria-label="Navegação principal"
            className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-studyflow-border/10 bg-studyflow-card/95 px-1 pb-[max(.25rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden"
        >
            {getNavigationForRole("STUDENT").map((item) => {
                const active = isNavigationItemActive(item, pathname);
                return (
                    <NavLink
                        aria-current={active ? "page" : undefined}
                        className={active ? "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl bg-studyflow-brand/15 px-1 text-[.7rem] font-semibold text-studyflow-brandText" : "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[.7rem] font-semibold text-studyflow-text/65"}
                        key={item.href}
                        to={item.href}
                    >
                        <ShellIcon className="h-5 w-5" name={item.icon} />
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
}
