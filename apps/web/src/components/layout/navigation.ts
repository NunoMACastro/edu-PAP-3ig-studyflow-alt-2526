// apps/web/src/components/layout/navigation.ts
import type { User } from "../../lib/apiClient.js";

export type NavigationItem = {
    href: string;
    label: string;
    roles: User["role"][];
};

const navigationItems: NavigationItem[] = [
    { href: "/app/estudo", label: "Estudo", roles: ["STUDENT"] },
    { href: "/app/perfil", label: "Perfil", roles: ["STUDENT"] },
    { href: "/app/privacidade", label: "Privacidade", roles: ["STUDENT", "TEACHER", "ADMIN"] },
    { href: "/app/rotinas", label: "Rotinas", roles: ["STUDENT"] },
    { href: "/app/historico", label: "Histórico", roles: ["STUDENT"] },
    { href: "/app/areas", label: "Áreas", roles: ["STUDENT"] },
    { href: "/app/salas", label: "Salas", roles: ["STUDENT"] },
    { href: "/app/comunidade", label: "Comunidade", roles: ["STUDENT"] },
    { href: "/app/turmas", label: "Turmas", roles: ["STUDENT"] },
    { href: "/app/professor/turmas", label: "Área docente", roles: ["TEACHER"] },
    { href: "/app/professor/acompanhamento", label: "Acompanhamento", roles: ["TEACHER"] },
    { href: "/app/admin/governanca", label: "Governança", roles: ["ADMIN"] },
];

/**
 * Devolve a navegação visível para o role autenticado.
 *
 * @param role Role real devolvido pela sessão autenticada.
 * @returns Lista de links visíveis para esse role.
 */
export function getNavigationForRole(role: User["role"]): NavigationItem[] {
    // A filtragem só organiza a interface; autorização real continua nos guards e services do backend.
    return navigationItems.filter((item) => item.roles.includes(role));
}

/**
 * Indica se um link representa a página atual ou uma página filha.
 *
 * @param item Link de navegação que está a ser renderizado.
 * @param pathname Caminho atual do browser.
 * @returns Verdadeiro quando o link deve receber `aria-current`.
 */
export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
    if (pathname === item.href) return true;
    if (item.href === "/app/estudo") return pathname === "/app";

    // Módulos com páginas filhas, como áreas e turmas, mantêm o item principal ativo.
    return pathname.startsWith(`${item.href}/`);
}