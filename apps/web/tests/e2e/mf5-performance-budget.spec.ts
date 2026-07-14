import { expect, test, type Page } from "@playwright/test";
import { expectAuthenticatedShell } from "./authenticated-shell.js";

type Credentials = {
    email: string;
    password: string;
};

const teacher = readCredentials("TEACHER", {
    email: "professor.dev@studyflow.local",
    password: "professor-dev-12345",
});

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
});

/**
 * Lê credenciais E2E com fallback para as contas seedadas localmente.
 *
 * @param role Role usado no sufixo das variáveis de ambiente.
 * @param fallback Conta criada pela seed E2E local.
 * @returns Credenciais a usar no login pela UI.
 */
function readCredentials(role: "STUDENT" | "TEACHER", fallback: Credentials): Credentials {
    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password: process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ?? fallback.password,
    };
}

/**
 * Entra pela UI para manter sessão por cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAs(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

test("MF5 mantém estado de loading explícito enquanto Hoje agrega os dados", async ({ page }) => {
    await loginAs(page, student);
    await page.route("**/api/student/today", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2100));
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify({
                continue: null,
                priorities: [],
                recentContexts: [],
            }),
        });
    });

    await page.goto("/app/hoje");
    await expect(page.getByText("A preparar o teu dia...")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Escolhe o teu primeiro contexto" })).toBeVisible();
});

test("MF5 avisa quando página de turmas excede 2 segundos", async ({ page }) => {
    await loginAs(page, teacher);
    await page.route("**/api/teacher/classes", async (route) => {
        if (route.request().method() !== "GET") {
            await route.continue();
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2100));
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify([]),
        });
    });

    await page.goto("/app/professor/turmas");

    await expect(page.getByText(/objetivo é 2000 ms/i)).toBeVisible();
    await expect(page.getByText("Ainda não tens turmas criadas.")).toBeVisible();
});
