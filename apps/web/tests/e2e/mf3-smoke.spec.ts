import { expect, test, type Page } from "@playwright/test";
import { expectAuthenticatedShell } from "./authenticated-shell.js";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar cookies HttpOnly e sessão real.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

test("MF3 smoke: aluno usa o novo workspace de grupo com sessão real", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const groupName = `Grupo MF3 Smoke ${suffix}`;

    await loginAsStudent(page);
    await page.goto("/app/comunidade");
    await expect(page).toHaveURL(/\/app\/em-grupo\?vista=grupos$/);
    await expect(page.getByRole("heading", { name: "Em grupo" })).toBeVisible();
    await page.getByRole("button", { name: "Novo grupo" }).click();
    let dialog = page.getByRole("dialog", { name: "Novo grupo" });
    await dialog.getByLabel("Nome").fill(groupName);
    await dialog.getByLabel("Disciplina").fill("Matemática");
    await dialog.getByLabel("Descrição").fill("Grupo criado pelo smoke MF3.");
    await dialog.getByRole("button", { name: "Criar grupo" }).click();

    const groupCard = page.locator("article").filter({ hasText: groupName });
    await expect(groupCard).toBeVisible();
    await groupCard.getByRole("link", { name: "Abrir grupo" }).click();
    await expect(page.getByRole("heading", { name: groupName })).toBeVisible();

    const selectedGroupId = page.url().match(/\/app\/grupos\/([a-f0-9]{24})/)?.[1];
    expect(selectedGroupId).toMatch(/^[a-f0-9]{24}$/);
    const workspace = page.getByRole("navigation", { name: "Secções do workspace" });
    await expect(workspace.getByRole("link", { name: "Mensagens e notas" })).toBeVisible();
    await expect(workspace.getByRole("link", { name: "Assistente de estudo" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Abrir Assistente de estudo" })).toBeVisible();
    await workspace.getByRole("link", { name: "Sessões" }).click();
    await page.getByRole("button", { name: "Agendar sessão" }).click();
    dialog = page.getByRole("dialog", { name: "Agendar sessão" });
    await expect(dialog.getByLabel("Grupo")).toHaveCount(0);
});
