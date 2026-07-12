/**
 * Centraliza a navegação autenticada do StudyFlow para evitar menus divergentes.
 */
import type { User } from "../../lib/apiClient.js";
import type { ShellIconName } from "./shell-icons.js";

export type NavigationItem = {
    href: string;
    icon: ShellIconName;
    label: string;
    roles: User["role"][];
};

const navigationItems: NavigationItem[] = [
    { href: "/app/estudo", icon: "home", label: "Estudo", roles: ["STUDENT"] },
    { href: "/app/turmas", icon: "graduation", label: "Turmas", roles: ["STUDENT"] },
    { href: "/app/salas-guiadas", icon: "clipboard", label: "Salas guiadas", roles: ["STUDENT"] },
    { href: "/app/salas", icon: "users", label: "Salas de estudo", roles: ["STUDENT"] },
    { href: "/app/areas", icon: "folder", label: "Áreas", roles: ["STUDENT"] },
    { href: "/app/rotinas", icon: "calendar", label: "Rotinas", roles: ["STUDENT"] },
    { href: "/app/historico", icon: "history", label: "Histórico", roles: ["STUDENT"] },
    { href: "/app/comunidade", icon: "message", label: "Comunidade", roles: ["STUDENT"] },
    { href: "/app/perfil", icon: "user", label: "Perfil", roles: ["STUDENT"] },
    { href: "/app/professor", icon: "home", label: "Dashboard", roles: ["TEACHER"] },
    { href: "/app/professor/turmas", icon: "graduation", label: "Turmas", roles: ["TEACHER"] },
    { href: "/app/professor/acompanhamento", icon: "chart", label: "Centro de Acompanhamento", roles: ["TEACHER"] },
    { href: "/app/admin/governanca", icon: "shield", label: "Governança", roles: ["ADMIN"] },
];

/**
 * Devolve a navegação visível para o role autenticado.
 *
 * @param role Role real devolvido pela sessão autenticada.
 * @returns Links que devem aparecer na shell desse role.
 */
export function getNavigationForRole(role: User["role"]): NavigationItem[] {
    // Esta filtragem organiza a UI; autorização real continua nos guards/services do backend.
    return navigationItems.filter((item) => item.roles.includes(role));
}

/**
 * Resolve a página inicial de cada role com base nas rotas existentes.
 *
 * @param role Role autenticado devolvido pela sessão.
 * @returns Caminho inicial seguro para esse perfil.
 */
export function getDefaultPathForRole(role: User["role"]): string {
    if (role === "TEACHER") return "/app/professor";
    if (role === "ADMIN") return "/app/admin/governanca";
    return "/app/estudo";
}

/**
 * Indica se um item representa a página atual ou uma rota filha.
 *
 * @param item Link de navegação renderizado.
 * @param pathname Caminho atual do browser.
 * @returns Verdadeiro quando o link deve receber `aria-current`.
 */
export function isNavigationItemActive(
    item: NavigationItem,
    pathname: string,
): boolean {
    const isRoleLandingPath = pathname === "/" || pathname === "/app" || pathname === "/app/estudo";

    if (item.href === "/app/estudo") {
        return isRoleLandingPath;
    }

    if (item.href === "/app/professor") {
        return isRoleLandingPath || pathname === "/app/professor";
    }

    if (item.href === "/app/admin/governanca") {
        return isRoleLandingPath || pathname === "/app/admin/governanca";
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
