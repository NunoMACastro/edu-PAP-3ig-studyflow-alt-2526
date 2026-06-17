import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar cookies HttpOnly e sessão real.
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

test("MF3 smoke: aluno abre comunidade e cria grupo com sessão real", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const groupName = `Grupo MF3 Smoke ${suffix}`;

    await loginAsStudent(page);
    await page.goto("/app/comunidade");

    await expect(
        page.getByRole("heading", { name: "Comunidade e guardrails" }),
    ).toBeVisible();
    for (const heading of [
        "Alertas",
        "Notificações",
        "Grupos de estudo",
        "Mensagens e notas",
        "Sessões coletivas",
        "IA coletiva",
        "Guardrails IA",
        "Resposta com fontes",
        "Conhecimento externo",
        "Explicação adaptada",
        "Pesquisa",
        "Currículo",
    ]) {
        await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }

    const groupsPanel = page
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: "Grupos de estudo" }) });
    await groupsPanel.getByLabel("Nome").fill(groupName);
    await groupsPanel.getByLabel("Disciplina").fill("Matemática");
    await groupsPanel.getByLabel("Descrição").fill("Grupo criado pelo smoke MF3.");
    await groupsPanel.getByRole("button", { name: "Criar grupo" }).click();

    await expect(groupsPanel.getByText(groupName)).toBeVisible();

    await groupsPanel.getByRole("link", { name: new RegExp(groupName) }).click();
    await expect(
        page.getByRole("heading", { name: "Comunidade e guardrails" }),
    ).toBeVisible();

    const selectedGroupId = new URL(page.url()).searchParams.get("grupo");
    expect(selectedGroupId).toMatch(/^[a-f0-9]{24}$/);

    const messagesPanel = page
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: "Mensagens e notas" }) });
    const sessionsPanel = page
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: "Sessões coletivas" }) });
    const groupAiPanel = page
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: "IA coletiva" }) });

    await expect(messagesPanel.getByLabel("Grupo")).toHaveValue(selectedGroupId!);
    await expect(sessionsPanel.getByLabel("Grupo")).toHaveValue(selectedGroupId!);
    await expect(groupAiPanel.getByLabel("Grupo")).toHaveValue(selectedGroupId!);
});
