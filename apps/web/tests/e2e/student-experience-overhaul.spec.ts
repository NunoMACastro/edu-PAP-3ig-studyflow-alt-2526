import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

test.setTimeout(120_000);

/** Autentica um utilizador pela UI e espera pela shell adequada ao seu papel. */
async function loginAs(
    page: Page,
    credentials: { email: string; password: string },
    role: "STUDENT" | "TEACHER",
): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    if (role === "STUDENT") {
        await expect(page.getByRole("button", { name: `Conta: ${credentials.email}` })).toBeVisible();
    } else {
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
    }
}

/** Confirma que a página não introduz scroll horizontal no viewport atual. */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
}

/** Executa Axe e falha perante violações serious ou critical nas páginas representativas. */
async function expectNoCriticalAxeViolations(page: Page): Promise<void> {
    const result = await new AxeBuilder({ page }).analyze();
    expect(
        result.violations.filter((violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        ),
    ).toEqual([]);
}

test("aluno usa quatro destinos, páginas canónicas e redirects compatíveis", async ({ page }) => {
    await loginAs(page, student, "STUDENT");

    const destinations = [
        ["Hoje", "/app/hoje"],
        ["Estudar", "/app/estudar"],
        ["Em grupo", "/app/em-grupo"],
        ["Plano", "/app/plano"],
    ] as const;
    const navigation = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(navigation.getByRole("link")).toHaveCount(4);
    for (const [label, href] of destinations) {
        await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
    }

    for (const [label, href] of destinations) {
        await page.goto(href);
        await expect(page.getByRole("heading", { level: 1, name: label === "Hoje" ? /^(?:Hoje|Olá, )/ : label })).toBeVisible();
        await expectNoCriticalAxeViolations(page);
    }

    await page.goto("/app/hoje");
    await expect(page.getByText("Terça-feira e quinta-feira · 19:15", { exact: true }).first()).toBeVisible();
    await page.goto("/app/plano");
    await expect(page.getByText("Terça-feira e quinta-feira às 19:15, 35 min", { exact: true })).toBeVisible();
    await expect(page.getByText(/\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY)\b/u)).toHaveCount(0);

    await page.goto("/app/estudo?origem=bookmark#prioridades");
    await expect(page).toHaveURL(/\/app\/hoje\?origem=bookmark#prioridades$/);
    await page.goto("/app/turmas?filtro=ativas#escola");
    await expect(page).toHaveURL(/\/app\/estudar\?vista=escola&filtro=ativas#escola$/);
});

test("mobile mantém navegação legível, pesquisa acessível e restituição de foco", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await loginAs(page, student, "STUDENT");
    await page.goto("/app/hoje");
    await expectNoHorizontalScroll(page);

    const navigation = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(navigation.getByRole("link")).toHaveCount(4);
    for (const label of ["Hoje", "Estudar", "Em grupo", "Plano"]) {
        await expect(navigation.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    const searchButton = page.getByRole("button", { name: "Pesquisar nos meus estudos" });
    await searchButton.click();
    const searchInput = page.getByRole("textbox", { name: "O que procuras?" });
    await expect(searchInput).toBeFocused();
    await searchInput.press("Escape");
    await expect(page.getByRole("dialog", { name: "Pesquisar nos meus estudos" })).toHaveCount(0);
    await expect(searchButton).toBeFocused();

    await page.goto("/app/em-grupo");
    const workspaceTabs = page.getByRole("navigation", { name: "Secções do workspace" });
    await expect(workspaceTabs.getByRole("link", { name: "Salas partilhadas" })).toBeVisible();
    expect(await workspaceTabs.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const links = [...element.querySelectorAll("a")];
        return {
            hasHorizontalOverflow: element.scrollWidth > element.clientWidth,
            linksInsideBounds: links.every((link) => {
                const linkBounds = link.getBoundingClientRect();
                return linkBounds.left >= bounds.left && linkBounds.right <= bounds.right;
            }),
        };
    })).toEqual({ hasHorizontalOverflow: false, linksInsideBounds: true });
});

test("disciplinas usam filtro compacto e materiais mantêm badges numa linha", async ({ page }) => {
    await loginAs(page, student, "STUDENT");
    await page.goto("/app/estudar");
    await page.getByRole("link", { name: "Abrir turma" }).first().click();

    const filter = page.getByRole("region", { name: "Filtrar disciplinas por estado" });
    await expect(filter.getByRole("button", { name: "Ativas" })).toHaveAttribute("aria-pressed", "true");
    expect(await filter.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThan(260);
    await expectNoCriticalAxeViolations(page);

    await page.getByRole("link", { name: "Abrir disciplina" }).first().click();
    await page
        .getByRole("navigation", { name: "Secções do workspace" })
        .getByRole("link", { name: "Materiais" })
        .click();
    const aiBadge = page.getByText("Disponível para IA", { exact: true }).first();
    await expect(aiBadge).toBeVisible();
    expect(await aiBadge.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
    await expectNoCriticalAxeViolations(page);
});

test("onboarding é não bloqueante e o adiamento é limpo no logout", async ({ page }, testInfo) => {
    const suffix = `${Date.now()}-${testInfo.project.name}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const credentials = { email: `overhaul-${suffix}@example.test`, password: "Overhaul-seguro-12345" };
    await page.goto("/registar");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password", { exact: true }).fill(credentials.password);
    await page.getByLabel("Confirmar password").fill(credentials.password);
    await page.getByRole("button", { name: "Registar" }).click();
    await expect(page.getByText("Conta criada. Já podes entrar.")).toBeVisible();

    await loginAs(page, credentials, "STUDENT");
    const contracts = await page.evaluate(async () => {
        const [profile, today] = await Promise.all([
            fetch("/api/students/me/profile", { credentials: "include" }),
            fetch("/api/student/today", { credentials: "include" }),
        ]);
        const profileText = await profile.text();
        const todayText = await today.text();
        return {
            profile: { status: profile.status, body: profileText ? JSON.parse(profileText) : null },
            today: { status: today.status, body: todayText ? JSON.parse(todayText) : null },
        };
    });
    expect([200, 204]).toContain(contracts.profile.status);
    expect(contracts.profile.body).toBeNull();
    expect(contracts.today.status, JSON.stringify(contracts.today.body)).toBe(200);
    await expect(page.getByRole("heading", { name: "Vamos adaptar o teu estudo" })).toBeVisible();
    await page.getByRole("button", { name: "Agora não" }).click();
    await expect(page.getByRole("heading", { name: "Vamos adaptar o teu estudo" })).toHaveCount(0);

    await page.getByRole("button", { name: `Conta: ${credentials.email}` }).click();
    await page.getByRole("menuitem", { name: "Sair" }).click();
    await loginAs(page, credentials, "STUDENT");
    await expect(page.getByRole("heading", { name: "Vamos adaptar o teu estudo" })).toBeVisible();
});

test("shell docente mantém a navegação atual isolada", async ({ page }) => {
    await loginAs(page, teacher, "TEACHER");
    const navigation = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(navigation.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Turmas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Recolher navegação" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Abrir Assistente de estudo" })).toHaveCount(0);
    await page.getByRole("button", { name: "Expandir navegação" }).click();
    await expect(page.getByRole("button", { name: "Recolher navegação" })).toBeVisible();
});
