import { expect, test, type Page } from "@playwright/test";
import { expectAuthenticatedShell, logoutFromShell } from "./authenticated-shell.js";

type Credentials = {
    email: string;
    password: string;
};

const student = readCredentials("STUDENT");
const teacher = readCredentials("TEACHER");

/**
 * Lê credenciais de smoke a partir do ambiente ou da seed E2E local.
 *
 * @param role Sufixo do conjunto de variaveis E2E.
 * @returns Credenciais usadas para autenticar pela UI real.
 */
function readCredentials(role: "STUDENT" | "TEACHER"): Credentials {
    const fallback =
        role === "STUDENT"
            ? {
                  email: "aluno.dev@studyflow.local",
                  password: "aluno-dev-12345",
              }
            : {
                  email: "professor.dev@studyflow.local",
                  password: "professor-dev-12345",
              };

    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password:
            process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ??
            fallback.password,
    };
}

/**
 * Entra pela UI para validar cookies HttpOnly e shell real.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @param credentials Credenciais de teste usadas para autenticar o utilizador no fluxo real.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function loginAs(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

/**
 * Confirma que a pagina tem uma hierarquia principal previsivel.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function expectSingleMainHeading(page: Page): Promise<void> {
    await expect(page.locator("h1")).toHaveCount(1);
}

/**
 * Extrai um ObjectId de um link da UI para reutilizar a rota real seguinte.
 *
 * @param href Valor `href` lido do link.
 * @param pattern Expressao regular com um grupo para o id.
 * @returns Identificador extraido.
 * @throws Error quando o link nao tem o formato esperado.
 */
function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Nao foi possivel extrair id a partir de href: ${href ?? "<null>"}`);
    }
    return match[1];
}

test("MF5 interface: aluno e professor veem paginas claras com uma acao principal", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const areaName = `Area MF5 Smoke ${suffix}`;
    const privateImportTitle = `Drive MF5 ${suffix}`;
    const className = `Turma MF5 Smoke ${suffix}`;
    const classCode = `MF5${suffix}`.slice(-10).toUpperCase();
    const subjectName = `Disciplina MF5 ${suffix}`;
    const subjectCode = `D5${suffix}`.slice(-10).toUpperCase();
    const officialImportTitle = `OneDrive MF5 ${suffix}`;

    await loginAs(page, student);
    await page.goto("/app/estudo");
    await expectSingleMainHeading(page);
    await expect(page.getByRole("heading", { name: /Olá,|Hoje/ })).toBeVisible();
    const studentNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(studentNav.getByRole("link")).toHaveCount(4);
    await expect(studentNav.getByRole("link", { name: "Estudar" })).toBeVisible();
    await expect(studentNav.getByRole("link", { name: "Plano" })).toBeVisible();

    await page.goto("/app/areas");
    await expect(page.getByRole("heading", { name: "Estudar", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Nova área" }).click();
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area privada criada pelo smoke MF5.");
    await page.getByRole("dialog", { name: "Criar área" }).getByRole("button", { name: "Criar área" }).click();
    const areaCard = page.locator("article").filter({ hasText: areaName });
    const areaLink = areaCard.getByRole("link", { name: "Continuar" });
    await expect(areaLink).toBeVisible();
    const areaHref = await areaLink.getAttribute("href");
    const areaId = extractIdFromHref(areaHref, /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await expect(
        page.getByRole("heading", { level: 1, name: "Materiais" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Importar link" }).click();
    const privateImportForm = page.getByRole("dialog", { name: "Importar link externo" }).locator("form");
    await expect(privateImportForm.getByRole("button", { name: "Importar link" })).toBeDisabled();
    await privateImportForm.getByLabel("Título importado").fill(privateImportTitle);
    await privateImportForm
        .getByLabel("Link externo")
        .fill(`https://drive.google.com/file/d/${suffix}/view`);
    await privateImportForm.getByRole("button", { name: "Importar link" }).click();
    await expect(page.getByRole("dialog", { name: "Importar link externo" })).toBeHidden();
    await expect(page.locator("li").filter({ hasText: privateImportTitle })).toBeVisible();

    await logoutFromShell(page);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");
    await expect(
        page.getByRole("heading", { level: 1, name: "Turmas" }),
    ).toBeVisible();
    await expect(page.getByText("A carregar turmas...")).toHaveCount(0);
    await expectSingleMainHeading(page);

    const classForm = page.locator("form#criar-turma");
    if (!(await classForm.isVisible())) {
        await page.getByRole("button", { name: /^(Nova turma|Criar turma)$/ }).click();
    }
    await expect(classForm.getByLabel("Nome")).toBeVisible();
    await expect(classForm.getByLabel("Código")).toBeVisible();
    await expect(classForm.getByLabel("Ano letivo")).toBeVisible();
    await expect(classForm.getByRole("button", { name: "Criar turma" })).toBeVisible();
    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByLabel("Ano letivo").fill("2025/2026");
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await expect(classCard).toBeVisible();
    const subjectsHref = await classCard
        .getByRole("link", { name: "Gerir disciplinas" })
        .getAttribute("href");
    const classId = extractIdFromHref(subjectsHref, /\/turmas\/([^/]+)\/disciplinas/);
    await page.goto(`/app/professor/turmas/${classId}/disciplinas`);

    await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
    if (!(await page.getByLabel("Nome").isVisible())) {
        await page.getByRole("button", { name: "Nova disciplina" }).click();
    }
    await page.getByLabel("Nome").fill(subjectName);
    await page.getByLabel("Código").fill(subjectCode);
    await page.getByLabel("Descrição").fill("Disciplina criada pelo smoke MF5.");
    await page.getByRole("button", { name: "Criar disciplina" }).click();
    const subjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(subjectCard).toBeVisible();
    const materialsHref = await subjectCard
        .getByRole("link", { name: "Materiais" })
        .getAttribute("href");
    const subjectId = extractIdFromHref(materialsHref, /\/disciplinas\/([^/]+)\/materiais/);

    await page.goto(`/app/professor/disciplinas/${subjectId}/materiais`);
    await expect(page.getByRole("heading", { name: "Materiais oficiais", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Importar link" }).click();
    const officialImportForm = page.getByRole("dialog", { name: "Importar link externo" }).locator("form");
    await officialImportForm.getByLabel("Origem externa").selectOption("ONE_DRIVE");
    await officialImportForm.getByLabel("Título importado").fill(officialImportTitle);
    await officialImportForm.getByLabel("Link externo").fill(`https://1drv.ms/b/s-mf5-${suffix}`);
    await officialImportForm.getByRole("button", { name: "Importar link" }).click();
    await expect(page.getByRole("dialog", { name: "Importar link externo" })).toBeHidden();
    await expect(page.locator("article").filter({ hasText: officialImportTitle })).toBeVisible();
});
