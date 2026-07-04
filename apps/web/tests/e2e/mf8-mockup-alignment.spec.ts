// apps/web/tests/e2e/mf8-mockup-alignment.spec.ts
import { expect, test, type Page } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
});

/**
 * Lê credenciais E2E sem as escrever no teste.
 *
 * @param role Role usado no sufixo das variáveis de ambiente.
 * @param fallback Conta local criada pelas seeds de desenvolvimento.
 * @returns Credenciais para login pela UI.
 */
function readCredentials(role: "STUDENT", fallback: Credentials): Credentials {
    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password: process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ?? fallback.password,
    };
}

/**
 * Entra como aluno para validar a checklist dentro de uma sessão real.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando o dashboard autenticado fica visível.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(student.email)).toBeVisible();
}

test("MF8 RNF38 mostra checklist de alinhamento ao mockup com rotas reais", async ({
    page,
}) => {
    await loginAsStudent(page);
    await page.goto("/app");

    await expect(page.getByRole("heading", { name: "Alinhamento ao mockup" })).toBeVisible();
    await expect(page.getByText("MF8 · RNF38")).toBeVisible();

    // As rotas validadas são as rotas reais de protectedRoutes.tsx.
    await expect(page.getByRole("link", { name: "/app" })).toBeVisible();
    await expect(page.getByRole("link", { name: "/app/salas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "/app/professor/turmas" })).toBeVisible();

    // Este negativo impede regressão para nomes antigos que não existem na app atual.
    await expect(page.getByText("/student/dashboard")).toHaveCount(0);
    await expect(page.getByText("/student/rooms")).toHaveCount(0);
    await expect(page.getByText("/teacher/classes")).toHaveCount(0);
});