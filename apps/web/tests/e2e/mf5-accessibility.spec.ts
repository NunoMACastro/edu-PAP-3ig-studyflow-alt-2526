// apps/web/tests/e2e/mf5-accessibility.spec.ts
import { expect, test, type Page } from "@playwright/test";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra pela UI para validar sessão real e labels em páginas protegidas.
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
 * Termina a sessão atual para validar outro fluxo.
 *
 * @param page Página Playwright.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Não foi possível obter id a partir de ${href ?? "<sem href>"}.`);
    }
    return match[1];
}

test("MF5 acessibilidade: formulários críticos têm labels e ajuda associada", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const className = `Turma acessível ${suffix}`;
    const classCode = `AX${suffix}`.slice(-10).toUpperCase();
    const areaName = `Área acessível ${suffix}`;

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const classForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Turmas" }) });
    await expect(classForm.getByLabel("Nome")).toHaveAttribute("aria-describedby", "teacherClassName-help");
    await expect(classForm.getByLabel("Código")).toHaveAttribute("aria-describedby", "teacherClassCode-help");
    await expect(classForm.getByLabel("Ano letivo")).toHaveAttribute("aria-describedby", "teacherClassSchoolYear-help");

    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await expect(classCard.getByLabel(new RegExp(`Email do aluno para ${className}`))).toBeVisible();

    await logout(page);

    await loginAs(page, student);
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar acessibilidade da MF5.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const areaId = extractIdFromHref(await areaLink.getAttribute("href"), /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    const materialForm = page.locator("form").filter({ has: page.getByRole("heading", { name: "Novo material" }) });
    await expect(materialForm.getByLabel("Tipo")).toHaveAttribute("aria-describedby", "materialMode-help");
    await expect(materialForm.getByLabel("Título")).toHaveAttribute("aria-describedby", "materialTitle-help");
    await expect(materialForm.getByLabel("Texto ou tópico")).toHaveAttribute("aria-describedby", "materialBody-help");
});