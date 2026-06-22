// apps/web/tests/e2e/mf5-navigation.spec.ts
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

/**
 * Entra pela UI para validar cookies HttpOnly e navegação autenticada.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E locais.
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
 * Termina a sessão atual para validar outro role no mesmo teste.
 *
 * @param page Página Playwright.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

test("MF5 navegação: links mudam por role e página atual fica marcada", async ({ page }) => {
    await loginAs(page, student);
    await page.goto("/app/areas");

    const studentNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(studentNav.getByRole("link", { name: "Áreas" })).toHaveAttribute("aria-current", "page");
    await expect(studentNav.getByRole("link", { name: "Área docente" })).toHaveCount(0);
    await expect(studentNav.getByRole("link", { name: "Governança" })).toHaveCount(0);

    await logout(page);

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const teacherNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(teacherNav.getByRole("link", { name: "Área docente" })).toHaveAttribute("aria-current", "page");
    await expect(teacherNav.getByRole("link", { name: "Acompanhamento" })).toBeVisible();
    await expect(teacherNav.getByRole("link", { name: "Estudo" })).toHaveCount(0);
});