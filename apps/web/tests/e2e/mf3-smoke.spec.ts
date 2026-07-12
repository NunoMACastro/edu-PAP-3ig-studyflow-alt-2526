import { expect, test, type Page } from "@playwright/test";

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
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
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
        "Conhecimento externo limitado",
        "Explicação adaptada",
        "Pesquisa",
        "Currículo",
    ]) {
        await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }

    const groupsPanel = page
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: "Grupos de estudo" }) });
    await groupsPanel.getByRole("button", { name: "Criar grupo" }).click();
    let dialog = page.getByRole("dialog", { name: "Criar grupo" });
    await dialog.getByLabel("Nome").fill(groupName);
    await dialog.getByLabel("Disciplina").fill("Matemática");
    await dialog.getByLabel("Descrição").fill("Grupo criado pelo smoke MF3.");
    await dialog.getByRole("button", { name: "Criar grupo" }).click();

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
    await expect(groupAiPanel.getByLabel("Grupo")).toHaveValue(selectedGroupId!);
    await sessionsPanel.getByRole("button", { name: "Agendar sessão" }).click();
    dialog = page.getByRole("dialog", { name: "Agendar sessão" });
    await expect(dialog.getByLabel("Grupo")).toHaveValue(selectedGroupId!);
});
