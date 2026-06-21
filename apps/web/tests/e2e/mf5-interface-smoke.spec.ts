// apps/web/tests/e2e/mf5-interface-smoke.spec.ts
import { expect, Page, test } from "@playwright/test";

/**
 * Entra na aplicação com uma conta de teste.
 *
 * @param page Página Playwright.
 * @param email Email da conta de teste.
 * @param password Password da conta de teste.
 */
async function login(page: Page, email: string, password: string): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    // A presença do email confirma que a sessão foi carregada no layout protegido.
    await expect(page.getByText(email)).toBeVisible();
}

test.describe("MF5 - clareza da interface", () => {
    test("dashboard do aluno mantém título único e ações de estudo", async ({ page }) => {
        const email = process.env.STUDYFLOW_E2E_STUDENT_EMAIL;
        const password = process.env.STUDYFLOW_E2E_STUDENT_PASSWORD;

        if (!email || !password) {
            test.skip(true, "Credenciais E2E do aluno são necessárias.");
            return;
        }

        await login(page, email, password);
        await page.goto("/app/estudo");

        // Um único h1 evita páginas ambíguas para leitores de ecrã e para testes.
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Olá,");
        await expect(page.getByRole("link", { name: "Criar área" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Rever rotinas" })).toBeVisible();
    });

    test("página de turmas do professor mantém título único e ações de gestão", async ({ page }) => {
        const email = process.env.STUDYFLOW_E2E_TEACHER_EMAIL;
        const password = process.env.STUDYFLOW_E2E_TEACHER_PASSWORD;

        if (!email || !password) {
            test.skip(true, "Credenciais E2E do professor são necessárias.");
            return;
        }

        await login(page, email, password);
        await page.goto("/app/professor/turmas");

        // O teste valida navegação e hierarquia visual, não substitui testes backend de permissões.
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Nova turma" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Criar turma" })).toBeVisible();
    });
});