import { expect, test, type Page } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
});

const teacher = readCredentials("TEACHER", {
    email: "professor.dev@studyflow.local",
    password: "professor-dev-12345",
});

/**
 * Lê credenciais E2E com fallback para as contas seedadas localmente.
 *
 * @param role Role usado no sufixo das variáveis de ambiente.
 * @param fallback Conta criada pela seed E2E local.
 * @returns Credenciais a usar no login pela UI.
 */
function readCredentials(role: "STUDENT" | "TEACHER", fallback: Credentials): Credentials {
    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password: process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ?? fallback.password,
    };
}

/**
 * Entra pela UI para validar sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAs(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(credentials.email)).toBeVisible();
}

/**
 * Termina a sessão atual antes de validar outro role.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a página de login aparece.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

test("MF5 navegação: links mudam por role e página atual fica marcada", async ({
    page,
}) => {
    await loginAs(page, student);
    await page.goto("/app/areas");

    const studentNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(studentNav.getByRole("link", { name: "Áreas" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(studentNav.getByRole("link", { name: "Área docente" })).toHaveCount(0);
    await expect(studentNav.getByRole("link", { name: "Governança" })).toHaveCount(0);

    await logout(page);

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const teacherNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(teacherNav.getByRole("link", { name: "Área docente" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(teacherNav.getByRole("link", { name: "Acompanhamento" })).toBeVisible();
    await expect(teacherNav.getByRole("link", { name: "Estudo" })).toHaveCount(0);
});
