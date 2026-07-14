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
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(teacher.email);
    await page.getByLabel("Password").fill(teacher.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("MF5 mostra notificações in-app usando o campo body", async ({ page }) => {
    await page.route("**/api/context-notifications/inbox**", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify({
                items: [
                    {
                        id: "notification-mf5-1",
                        contextType: "CLASS",
                        contextId: "class-mf5",
                        type: "TASK",
                        title: "Novo material disponível",
                        body: "A turma recebeu uma tarefa de estudo.",
                        readAt: null,
                        recipientCount: 1,
                        suppressedRecipientCount: 0,
                    },
                ],
                unreadCount: 1,
                nextCursor: null,
            }),
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
    await page.route("**/api/context-notifications/inbox**", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            status: 500,
            body: JSON.stringify({ message: "Erro controlado no smoke." }),
        });
    });

    await loginAsTeacher(page);
    await page.getByRole("button", { name: "Notificações (0)" }).click();

    await expect(page.getByText("Erro controlado no smoke.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
