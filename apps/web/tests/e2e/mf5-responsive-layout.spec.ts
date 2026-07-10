import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const viewports = [
    { height: 720, width: 320 },
    { height: 780, width: 360 },
    { height: 812, width: 375 },
    { height: 844, width: 390 },
    { height: 1024, width: 768 },
    { height: 900, width: 1440 },
];

/**
 * Entra pela UI para validar a sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E vindas do ambiente ou da seed local.
 * @returns Promise resolvida depois de a shell autenticada aparecer.
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
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Cria uma área privada para testar a rota real de materiais.
 *
 * @param page Página Playwright autenticada como aluno.
 * @returns Identificador extraído do link real da área.
 */
async function createStudyArea(page: Page): Promise<string> {
    const areaName = `Area MF5 Responsive ${Date.now().toString(36)}`;
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area criada para validar responsividade.");
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

/**
 * Confirma que o documento não tem overflow horizontal real.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a página não tem scroll lateral.
 */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
    const hasHorizontalScroll = await page.evaluate(
        () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
    );

    expect(hasHorizontalScroll).toBe(false);
}

test("MF5 responsive: materiais do aluno mantêm layout em mobile, tablet e desktop", async ({
    page,
}) => {
    await loginAs(page, student);
    const areaId = await createStudyArea(page);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(`/app/areas/${areaId}/materiais`);
        await expect(page.getByRole("heading", { level: 1, name: "Materiais" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Materiais submetidos" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Novo material" })).toBeVisible();
        await expectNoHorizontalScroll(page);
    }
});

test("MF5 responsive: turmas do professor mantêm layout em mobile, tablet e desktop", async ({
    page,
}) => {
    await loginAs(page, teacher);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto("/app/professor/turmas");
        await expect(page.getByRole("heading", { level: 1, name: "Turmas" })).toBeVisible();
        const createHeading = page.getByRole("heading", { name: "Criar turma" });
        if (!(await createHeading.isVisible())) {
            await page
                .getByRole("button", { name: /^(?:Nova turma|Criar turma)$/ })
                .click();
        }
        await expect(createHeading).toBeVisible();
        // Este smoke valida RNF02; autorização e ownership continuam cobertos no backend.
        await expectNoHorizontalScroll(page);
    }
});
