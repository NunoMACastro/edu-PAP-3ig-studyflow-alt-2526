// apps/web/tests/e2e/mf5-responsive-layout.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const viewports = [
    { height: 844, width: 390 },
    { height: 1024, width: 768 },
    { height: 900, width: 1440 },
];

/**
 * Entra pela UI para validar a sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 */
async function loginAs(
    page: Page,
    credentials: { email: string; password: string },
): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(credentials.email)).toBeVisible();
}

/**
 * Confirma que a página não obriga o utilizador a fazer scroll horizontal.
 *
 * @param page Página Playwright.
 */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
    const hasHorizontalScroll = await page.evaluate(() => {
        // Compara largura total e largura visível para detetar overflow real no documento.
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
}

test("MF5 responsive: materiais do aluno mantêm layout em mobile, tablet e desktop", async ({ page }) => {
    await loginAs(page, student);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/app/areas");
        await expect(page.getByRole("heading", { name: /Áreas|Estudo/i })).toBeVisible();

        await expectNoHorizontalScroll(page);
    }
});

test("MF5 responsive: turmas do professor mantêm layout em mobile, tablet e desktop", async ({ page }) => {
    await loginAs(page, teacher);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/app/professor/turmas");
        await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();

        // O teste valida o contrato visual, não substitui testes de autorização no backend.
        await expectNoHorizontalScroll(page);
    }
});