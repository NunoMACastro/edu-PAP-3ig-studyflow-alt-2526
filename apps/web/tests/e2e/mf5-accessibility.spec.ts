import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
 * Entra pela UI para validar sessão real e labels em páginas protegidas.
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
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Termina a sessão atual antes de validar outro fluxo.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a página de login aparece.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

/**
 * Extrai um identificador a partir de um link real da aplicação.
 *
 * @param href Valor do atributo `href`.
 * @param pattern Expressão regular com um grupo de captura para o id.
 * @returns Identificador extraído.
 * @throws Error quando o link não tem o formato esperado.
 */
function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Não foi possível obter id a partir de ${href ?? "<sem href>"}.`);
    }

    return match[1];
}

test("MF5 acessibilidade: formulários críticos têm labels e ajuda associada", async ({
    page,
}) => {
    const suffix = Date.now().toString(36);
    const className = `Turma acessível ${suffix}`;
    const classCode = `AX${suffix}`.slice(-10).toUpperCase();
    const areaName = `Área acessível ${suffix}`;

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");

    const createClassDisclosure = page.getByRole("button", {
        name: "Nova turma",
        exact: true,
    });
    await expect(createClassDisclosure).toHaveAttribute("aria-expanded", "false");
    await createClassDisclosure.click();
    await expect(createClassDisclosure).toHaveAttribute("aria-expanded", "true");

    const classForm = page.locator("form#criar-turma");
    await expect(classForm).toBeVisible();
    await expect(classForm.getByLabel("Nome")).toHaveAttribute(
        "aria-describedby",
        "teacherClassName-help",
    );
    await expect(classForm.getByLabel("Código")).toHaveAttribute(
        "aria-describedby",
        "teacherClassCode-help",
    );
    await expect(classForm.getByLabel("Ano letivo")).toHaveAttribute(
        "aria-describedby",
        "teacherClassSchoolYear-help",
    );

    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await classCard
        .getByRole("button", {
            name: new RegExp(`Adicionar primeiro aluno a ${className}`),
        })
        .click();
    await expect(classCard.getByLabel("Adicionar aluno")).toHaveAttribute(
        "aria-describedby",
        expect.stringContaining("studentEmail-"),
    );

    await logout(page);

    await loginAs(page, student);
    await page.goto("/app/areas");
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Área criada para validar acessibilidade da MF5.");
    await page.getByRole("button", { name: "Criar área" }).click();

    const areaLink = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaLink).toBeVisible();
    const areaId = extractIdFromHref(
        await areaLink.getAttribute("href"),
        /\/areas\/([^/]+)$/,
    );

    await page.goto(`/app/areas/${areaId}/materiais`);
    const materialForm = page.locator("form").filter({
        has: page.getByRole("heading", { name: "Novo material" }),
    });
    await expect(materialForm.getByLabel("Tipo")).toHaveAttribute(
        "aria-describedby",
        "materialMode-help",
    );
    await expect(materialForm.getByLabel("Título")).toHaveAttribute(
        "aria-describedby",
        "materialTitle-help",
    );
    await expect(materialForm.getByLabel("Texto ou tópico")).toHaveAttribute(
        "aria-describedby",
        "materialBody-help",
    );
});

test("G6 acessibilidade: login e shell móvel não têm violações WCAG A/AA", async ({
    page,
}) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/login");
    const loginResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    expect(loginResults.violations).toEqual([]);

    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, teacher);
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/app/professor/turmas");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const mobileNavigation = page.getByRole("navigation", {
        name: "Navegação principal móvel",
    });
    await expect(mobileNavigation).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(mobileNavigation).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);

    const shellResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    expect(shellResults.violations).toEqual([]);
});
