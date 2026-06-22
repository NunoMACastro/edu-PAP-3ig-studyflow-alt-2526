// apps/web/tests/e2e/mf5-performance-budget.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Inicia sessão com credenciais de desenvolvimento usadas nos smokes StudyFlow.
 *
 * @param page Página Playwright controlada pelo teste.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
}

test("MF5 mostra aviso quando o dashboard excede 2 segundos", async ({ page }) => {
    await page.route("**/api/study/solo", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2100));
        // A resposta tem só dados públicos do resumo do aluno, iguais ao contrato da API.
        await route.fulfill({
            contentType: "application/json",
            status: 200,
            body: JSON.stringify({
                studentName: "Aluno Dev",
                hasClass: false,
                className: null,
                studyAreasCount: 2,
                routinesCount: 1,
                materialsCount: 4,
            }),
        });
    });

    await loginAsStudent(page);

    await expect(page.getByText("Esta página demorou")).toBeVisible();
    await expect(page.getByText("O objetivo é 2000 ms.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar área" })).toBeVisible();
});