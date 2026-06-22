// apps/web/tests/e2e/mf5-form-validation.spec.ts
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
 * Entra pela UI para validar que a sessão usa o fluxo real da aplicação.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais de desenvolvimento.
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
 * Extrai o id de uma rota criada pela própria UI.
 *
 * @param href Endereço lido de um link.
 * @param pattern Expressão regular com o grupo do id.
 */
function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Não foi possível extrair id a partir de href: ${href ?? "<null>"}`);
    }

    return match[1];
}

test("MF5 valida criação de turma antes de chamar a API", async ({ page }) => {
    let createClassRequests = 0;

    await page.route("**/api/teacher/classes", async (route, request) => {
        if (request.method() === "POST") {
            // Este contador prova que o handler bloqueou o submit inválido antes da rede.
            createClassRequests += 1;
        }
        await route.continue();
    });

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");
    await page.getByRole("button", { name: "Criar turma" }).click();

    await expect(page.getByText("Nome é obrigatório.")).toBeVisible();
    await expect(page.getByText("Código é obrigatório.")).toBeVisible();
    await expect(page.getByText("Ano letivo é obrigatório.")).toBeVisible();
    expect(createClassRequests).toBe(0);
});

test("MF5 valida material privado antes de chamar a API", async ({ page }) => {
    let createMaterialRequests = 0;
    const suffix = Date.now().toString(36);
    const areaName = `Área MF5 validação ${suffix}`;

    await page.route("**/api/study-areas/*/materials**", async (route, request) => {
        if (request.method() === "POST") {
            createMaterialRequests += 1;
        }
        await route.continue();
    });

    await loginAs(page, student);
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar formulários.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const areaId = extractIdFromHref(await areaLink.getAttribute("href"), /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await page.getByRole("button", { name: "Submeter" }).click();

    await expect(page.getByText("Título é obrigatório.")).toBeVisible();
    await expect(page.getByText("Texto é obrigatório.")).toBeVisible();
    expect(createMaterialRequests).toBe(0);
});