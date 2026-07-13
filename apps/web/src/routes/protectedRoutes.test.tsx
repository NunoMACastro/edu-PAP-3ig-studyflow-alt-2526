/**
 * Testa a matriz de acesso de rotas antes da montagem lazy.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
    hasRouteAccess,
    ProtectedRoutes,
    RoleGuard,
    resolveLegacyCommunityPath,
    resolveLegacyStudentPath,
} from "./protectedRoutes.js";
import { getSafeReturnTo } from "./safeReturnTo.js";

describe("hasRouteAccess", () => {
    it("permite apenas papéis explicitamente declarados", () => {
        expect(hasRouteAccess("STUDENT", ["STUDENT"])).toBe(true);
        expect(hasRouteAccess("TEACHER", ["STUDENT"])).toBe(false);
        expect(hasRouteAccess("ADMIN", ["TEACHER"])).toBe(false);
    });

    it("suporta rotas comuns sem transformar o frontend em autoridade", () => {
        const commonRoles = ["STUDENT", "TEACHER", "ADMIN"] as const;
        expect(commonRoles.every((role) => hasRouteAccess(role, commonRoles))).toBe(
            true,
        );
    });
});

describe("RoleGuard", () => {
    it("não monta conteúdo de um papel proibido", () => {
        const ProtectedPage = vi.fn(() => <p>Conteúdo sensível</p>);
        render(
            <RoleGuard allowedRoles={["TEACHER"]} role="STUDENT">
                <ProtectedPage />
            </RoleGuard>,
        );

        expect(ProtectedPage).not.toHaveBeenCalled();
        expect(
            screen.getByRole("heading", { name: "Acesso não permitido" }),
        ).toBeTruthy();
    });
});

describe("ProtectedRoutes", () => {
    it("apresenta 404 explícito para uma rota autenticada desconhecida", async () => {
        render(
            <MemoryRouter initialEntries={["/app/rota-inexistente"]}>
                <ProtectedRoutes
                    onLogout={vi.fn().mockResolvedValue(undefined)}
                    user={{
                        id: "student-1",
                        email: "student@example.test",
                        role: "STUDENT",
                    }}
                />
            </MemoryRouter>,
        );

        expect(
            await screen.findByRole("heading", { name: "Página não encontrada" }),
        ).toBeTruthy();
    });

    it.each([
        ["/app/hoje", "", "", "/app/hoje"],
        ["/app/estudar?vista=escola", "?filtro=ativo", "#lista", "/app/estudar?vista=escola&filtro=ativo#lista"],
        ["/app/estudar?vista=pessoal", "", "#criar-area", "/app/estudar?vista=pessoal#criar-area"],
        ["/app/plano?tab=agenda", "", "", "/app/plano?tab=agenda"],
        ["/app/plano?tab=historico", "", "", "/app/plano?tab=historico"],
    ])("resolve redirect legacy para %s", (to, search, hash, expected) => {
        expect(resolveLegacyStudentPath(to, search, hash)).toBe(expected);
    });

    it("encaminha o grupo legacy para o workspace canónico", () => {
        expect(resolveLegacyCommunityPath("?grupo=507f1f77bcf86cd799439011")).toBe("/app/grupos/507f1f77bcf86cd799439011");
    });
});

describe("getSafeReturnTo", () => {
    it("aceita apenas paths internos da aplicação", () => {
        expect(getSafeReturnTo("/app/areas?tab=recentes#topo")).toBe(
            "/app/areas?tab=recentes#topo",
        );
        expect(getSafeReturnTo("https://evil.example/app/areas")).toBeNull();
        expect(getSafeReturnTo("//evil.example/app/areas")).toBeNull();
        expect(getSafeReturnTo("/login")).toBeNull();
        expect(getSafeReturnTo("/application")).toBeNull();
    });

    it("falha fechado quando o parser de URL não consegue normalizar", () => {
        vi.stubGlobal(
            "URL",
            class {
                constructor() {
                    throw new TypeError("URL inválido");
                }
            },
        );
        expect(getSafeReturnTo("/app")).toBeNull();
    });
});
