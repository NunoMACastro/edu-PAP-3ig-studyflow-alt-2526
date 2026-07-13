/**
 * Testa login/registo, erros públicos e redirecionamento interno seguro.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ login: vi.fn(), registerStudent: vi.fn() }));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { LoginPage } from "./LoginPage.js";
import { RegisterPage } from "./RegisterPage.js";

beforeEach(() => {
    api.login.mockReset().mockResolvedValue({ id: "student-id", email: "student@example.test", role: "STUDENT" });
    api.registerStudent.mockReset().mockResolvedValue({ id: "student-id" });
});

async function fillCredentials(user: ReturnType<typeof userEvent.setup>): Promise<void> {
    await user.type(screen.getByLabelText("Email"), "student@example.test");
    await user.type(screen.getByLabelText("Password"), "password-segura");
}

describe("LoginPage", () => {
    it("mantém marca, formulário e ligação de registo no layout dividido", () => {
        const { container } = render(<MemoryRouter><LoginPage onLoggedIn={vi.fn()} /></MemoryRouter>);
        expect(screen.getByRole("heading", { name: "StudyFlow" }).className).toContain("sr-only");
        expect(screen.getAllByText("StudyFlow")).toHaveLength(1);
        expect(container.querySelectorAll('img[src="/assets/studyflow-logo.svg"]')).toHaveLength(2);
        expect(screen.getByRole("region", { name: "Formulario de login" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Registar" }).getAttribute("href")).toBe(
            "/registar",
        );
    });

    it("preserva returnTo interno após recarregar a sessão", async () => {
        const user = userEvent.setup();
        const onLoggedIn = vi.fn().mockResolvedValue(undefined);
        render(
            <MemoryRouter initialEntries={[{ pathname: "/login", state: { returnTo: "/app/areas?tab=recentes" } }]}>
                <Routes>
                    <Route path="/login" element={<LoginPage onLoggedIn={onLoggedIn} />} />
                    <Route path="/app/areas" element={<p>Destino interno</p>} />
                </Routes>
            </MemoryRouter>,
        );
        await fillCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));
        expect(await screen.findByText("Destino interno")).toBeTruthy();
        expect(api.login).toHaveBeenCalledWith({ email: "student@example.test", password: "password-segura" });
        expect(onLoggedIn).toHaveBeenCalledTimes(1);
    });

    it("usa home do papel e apresenta recusas sem navegar", async () => {
        const user = userEvent.setup();
        api.login.mockResolvedValueOnce({ id: "teacher-id", email: "teacher@example.test", role: "TEACHER" });
        const first = render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<LoginPage onLoggedIn={vi.fn().mockResolvedValue(undefined)} />} />
                    <Route path="/app/professor" element={<p>Home professor</p>} />
                </Routes>
            </MemoryRouter>,
        );
        await fillCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));
        expect(await screen.findByText("Home professor")).toBeTruthy();
        first.unmount();

        api.login.mockRejectedValueOnce(new Error("Credenciais inválidas"));
        render(<MemoryRouter><LoginPage onLoggedIn={vi.fn()} /></MemoryRouter>);
        await fillCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Credenciais inválidas");
    });
});

describe("RegisterPage", () => {
    it("envia confirmação e mostra sucesso", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><RegisterPage /></MemoryRouter>);
        await user.type(screen.getByLabelText("Email"), "new@example.test");
        await user.type(screen.getByLabelText("Password"), "password-segura");
        await user.type(screen.getByLabelText("Confirmar password"), "password-segura");
        await user.click(screen.getByRole("button", { name: "Registar" }));
        expect(await screen.findByRole("status")).toHaveProperty("textContent", "Conta criada. Já podes entrar.");
        expect(api.registerStudent).toHaveBeenCalledWith({
            email: "new@example.test",
            password: "password-segura",
            confirmPassword: "password-segura",
        });
    });

    it("mostra erro de registo e remove sucesso anterior", async () => {
        const user = userEvent.setup();
        api.registerStudent.mockRejectedValueOnce(new Error("Email já utilizado"));
        render(<MemoryRouter><RegisterPage /></MemoryRouter>);
        await user.type(screen.getByLabelText("Email"), "used@example.test");
        await user.type(screen.getByLabelText("Password"), "password-segura");
        await user.type(screen.getByLabelText("Confirmar password"), "password-segura");
        await user.click(screen.getByRole("button", { name: "Registar" }));
        await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Email já utilizado"));
        expect(screen.queryByRole("status")).toBeNull();
    });
});
