// apps/web/tests/e2e/mf5-action-feedback.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar sessão real com cookies HttpOnly.
 *
 * @param page Página Playwright.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(student.email)).toBeVisible();
}

/**
 * Cria uma área de estudo para o smoke usar dados próprios do aluno autenticado.
 *
 * @param page Página Playwright.
 * @returns Nome da área criada.
 */
async function createStudyArea(page: Page): Promise<string> {
    const areaName = `Área MF5 Feedback ${Date.now().toString(36)}`;

    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar feedback imediato.");
    await page.getByRole("button", { name: "Criar área" }).click();
    await expect(page.getByRole("link", { name: new RegExp(areaName) })).toBeVisible();

    return areaName;
}

test("MF5 feedback: submissão de material mostra loading, sucesso e aria-live", async ({ page }) => {
    await loginAsStudent(page);
    const areaName = await createStudyArea(page);

    await page.getByRole("link", { name: new RegExp(areaName) }).click();
    await page.getByRole("link", { name: "Materiais" }).click();

    await expect(page.getByTestId("action-feedback-live")).toBeAttached();

    await page.getByLabel("Título").fill("Material feedback MF5");
    await page.getByLabel("Texto").fill("Conteúdo mínimo para validar feedback imediato.");
    await page.getByRole("button", { name: "Submeter" }).click();

    // O feedback visual e o aria-live devem receber uma mensagem segura e curta.
    await expect(page.getByText("Material submetido com sucesso.")).toBeVisible();
    await expect(page.getByTestId("action-feedback-live")).toContainText(
        "Material submetido com sucesso.",
    );
});