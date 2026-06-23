import { expect, test, type Page } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

const teacher = readCredentials("TEACHER", {
    email: "professor.dev@studyflow.local",
    password: "professor-dev-12345",
});

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
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
 * Entra pela UI para manter sessão por cookies HttpOnly.
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
 * Cria uma área privada para chegar ao formulário real de materiais.
 *
 * @param page Página autenticada como aluno.
 * @returns Identificador extraído do link da área.
 */
async function createStudyArea(page: Page): Promise<string> {
    const areaName = `Area MF5 Validacao ${Date.now().toString(36)}`;
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area criada para validar formularios.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const href = await areaLink.getAttribute("href");
    const match = href?.match(/\/areas\/([^/]+)$/);
    if (!match) {
        throw new Error(`Nao foi possivel extrair areaId de ${href ?? "<null>"}.`);
    }

    return match[1];
}

test("MF5 valida criação de turma antes de chamar a API", async ({ page }) => {
    let createClassRequests = 0;
    await page.route("**/api/teacher/classes", async (route) => {
        if (route.request().method() === "POST") {
            createClassRequests += 1;
            await route.fulfill({
                contentType: "application/json",
                status: 500,
                body: JSON.stringify({ message: "POST inesperado no smoke." }),
            });
            return;
        }

        await route.continue();
    });

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const classForm = page.locator("form").filter({
        has: page.getByRole("heading", { name: "Criar turma" }),
    });
    await classForm.getByLabel("Ano letivo").fill("");
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    await expect(classForm.getByText("Nome é obrigatório.")).toBeVisible();
    await expect(classForm.getByText("Código é obrigatório.")).toBeVisible();
    await expect(classForm.getByText("Ano letivo é obrigatório.")).toBeVisible();
    expect(createClassRequests).toBe(0);
});

test("MF5 valida submissão de material antes de chamar a API", async ({ page }) => {
    await loginAs(page, student);
    const areaId = await createStudyArea(page);

    let materialPostRequests = 0;
    await page.route("**/api/study-areas/*/materials*", async (route) => {
        if (route.request().method() === "POST") {
            materialPostRequests += 1;
            await route.fulfill({
                contentType: "application/json",
                status: 500,
                body: JSON.stringify({ message: "POST inesperado no smoke." }),
            });
            return;
        }

        await route.continue();
    });

    await page.goto(`/app/areas/${areaId}/materiais`);
    const materialForm = page.locator("form").filter({
        has: page.getByRole("heading", { name: "Novo material" }),
    });
    await materialForm.getByRole("button", { name: "Submeter" }).click();

    await expect(materialForm.getByText("Título é obrigatório.")).toBeVisible();
    await expect(materialForm.getByText("Texto ou tópico é obrigatório.")).toBeVisible();
    expect(materialPostRequests).toBe(0);
});
