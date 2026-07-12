/**
 * Testa a máquina de estados de sessão no ponto de entrada da aplicação.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const protectedRoutes = vi.hoisted(() => vi.fn());

vi.mock("./hooks/useSession.js", () => ({
    useSession: () => session.current,
}));

vi.mock("./routes/protectedRoutes.js", () => ({
    ProtectedRoutes: (props: { user: { email: string } }) => protectedRoutes(props),
}));

import { App } from "./App.js";

const refresh = vi.fn().mockResolvedValue(undefined);
const signOut = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
    window.history.replaceState({}, "", "/");
    refresh.mockClear();
    signOut.mockClear();
    protectedRoutes.mockReset().mockImplementation(({ user }) => (
        <p>Área protegida de {user.email}</p>
    ));
});

describe("App", () => {
    it("não monta rotas antes da decisão de sessão", () => {
        session.current = {
            loading: true,
            status: "checking",
            user: null,
            error: null,
            refresh,
            signOut,
        };
        render(<App />);
        expect(screen.getByText("A carregar sessão...")).toBeTruthy();
        expect(protectedRoutes).not.toHaveBeenCalled();
    });

    it("distingue indisponibilidade e permite retry explícito", async () => {
        const user = userEvent.setup();
        session.current = {
            loading: false,
            status: "unavailable",
            user: null,
            error: "API sem resposta",
            refresh,
            signOut,
        };
        render(<App />);
        expect(screen.getByRole("alert").textContent).toContain("API sem resposta");
        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it("expõe apenas login/registo e preserva um returnTo interno", async () => {
        session.current = {
            loading: false,
            status: "anonymous",
            user: null,
            error: null,
            refresh,
            signOut,
        };
        window.history.replaceState({}, "", "/registar");
        const first = render(<App />);
        expect(screen.getByRole("heading", { name: "Registar" })).toBeTruthy();
        first.unmount();

        window.history.replaceState({}, "", "/app/areas?tab=recentes");
        render(<App />);
        await waitFor(() => expect(window.location.pathname).toBe("/login"));
        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("monta as rotas protegidas apenas com utilizador autenticado", () => {
        session.current = {
            loading: false,
            status: "authenticated",
            user: { id: "student-id", email: "student@example.test", role: "STUDENT" },
            error: null,
            refresh,
            signOut,
        };
        window.history.replaceState({}, "", "/app/estudo");
        render(<App />);
        expect(screen.getByText("Área protegida de student@example.test")).toBeTruthy();
        expect(protectedRoutes).toHaveBeenCalledWith(expect.objectContaining({
            user: expect.objectContaining({ role: "STUDENT" }),
            onLogout: signOut,
        }));
    });
});
