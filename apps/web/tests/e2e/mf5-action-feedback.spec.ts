import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra como aluno pela UI para manter sessão por cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Cria uma área privada com ownership real para o smoke.
 *
 * @param page Página autenticada como aluno.
 * @returns Identificador extraído do link da área.
 */
async function createStudyArea(page: Page): Promise<string> {
    const areaName = `Area MF5 Feedback ${Date.now().toString(36)}`;
    await page.goto("/app/areas");
    await page.getByRole("button", { name: "Nova área" }).click();
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area criada para validar feedback imediato.");
    await page.getByRole("dialog", { name: "Criar área" }).getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const href = await areaLink.getAttribute("href");
    const match = href?.match(/\/areas\/([^/]+)$/);
    if (!match) {
        throw new Error(`Nao foi possivel extrair areaId de ${href ?? "<null>"}.`);
    }

    return match[1];
}

test("MF5 feedback: submissão de material mostra sucesso e aria-live", async ({
    page,
}) => {
    await loginAsStudent(page);
    const areaId = await createStudyArea(page);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await expect(page.getByTestId("action-feedback-live")).toBeAttached();

    await page.getByRole("button", { name: "Novo material" }).click();
    const form = page.getByRole("dialog", { name: "Novo material" }).locator("form");
    await form.getByLabel("Título").fill("Material feedback MF5");
    await form.getByLabel("Texto").fill("Conteúdo mínimo para validar feedback imediato.");
    await form.getByRole("button", { name: "Submeter" }).click();

    await expect(page.getByRole("status")).toContainText("Material submetido com sucesso.");
    await expect(page.getByTestId("action-feedback-live")).toContainText(
        "Material submetido com sucesso.",
    );
});
