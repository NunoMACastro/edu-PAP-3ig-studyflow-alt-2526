import { expect, test, type Page } from "@playwright/test";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

/**
 * Entra pela UI para manter sessão real por cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAsTeacher(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(teacher.email);
    await page.getByLabel("Password").fill(teacher.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(teacher.email)).toBeVisible();
}

test("MF5 mostra notificações in-app usando o campo body", async ({ page }) => {
    await page.route("**/api/context-notifications", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify([
                {
                    id: "notification-mf5-1",
                    contextType: "CLASS",
                    contextId: "class-mf5",
                    type: "TASK",
                    title: "Novo material disponível",
                    body: "A turma recebeu uma tarefa de estudo.",
                    recipientIds: [],
                    suppressedRecipientIds: [],
                },
            ]),
        });
    });

    await loginAsTeacher(page);
    await page.getByRole("button", { name: "Notificações (1)" }).click();

    await expect(
        page.getByRole("region", { name: "Notificações contextualizadas" }),
    ).toBeVisible();
    await expect(page.getByText("Novo material disponível")).toBeVisible();
    await expect(page.getByText("A turma recebeu uma tarefa de estudo.")).toBeVisible();
    await expect(page.getByText("Turma", { exact: true })).toBeVisible();
});

test("MF5 isola erro de notificações sem bloquear a shell", async ({ page }) => {
    await page.route("**/api/context-notifications", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 500,
            body: JSON.stringify({ message: "Erro controlado no smoke." }),
        });
    });

    await loginAsTeacher(page);
    await page.getByRole("button", { name: "Notificações (0)" }).click();

    await expect(page.getByText("Não foi possível carregar notificações.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
