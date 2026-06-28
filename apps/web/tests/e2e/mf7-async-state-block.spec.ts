// apps/web/tests/e2e/mf7-async-state-block.spec.ts
import { expect, test, type Page, type Route } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

/**
 * Lê credenciais E2E sem as gravar no repositório.
 *
 * @param role Role autenticado usado no nome das variáveis.
 * @returns Credenciais a usar no login pela UI.
 */
function readCredentials(role: "STUDENT" | "TEACHER"): Credentials {
    const email = process.env[`STUDYFLOW_E2E_${role}_EMAIL`];
    const password = process.env[`STUDYFLOW_E2E_${role}_PASSWORD`];

    if (!email || !password) {
        throw new Error(`Define STUDYFLOW_E2E_${role}_EMAIL e STUDYFLOW_E2E_${role}_PASSWORD.`);
    }

    return { email, password };
}

/**
 * Entra pela UI para validar uma sessão protegida real.
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
 * Responde a uma rota HTTP com JSON para controlar a evidence do estado visual.
 *
 * @param route Rota intercetada pelo Playwright.
 * @param status Código HTTP pretendido.
 * @param body Corpo JSON enviado à página.
 * @returns Promise resolvida quando a rota fica satisfeita.
 */
async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
    await route.fulfill({
        contentType: "application/json",
        status,
        body: JSON.stringify(body),
    });
}

test("MF7 aluno mostra estado vazio quando não há artefactos", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) =>
        fulfillJson(route, 200, []),
    );
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");

    await expect(page.getByText("Ainda não há resumos nem ferramentas geradas.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Gerar resumo" })).toBeVisible();
});

test("MF7 aluno mostra erro de carregamento sem bloquear ações", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) =>
        fulfillJson(route, 500, { message: "Falha controlada ao carregar resumos." }),
    );
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");

    await expect(page.getByRole("alert")).toContainText("Falha controlada ao carregar resumos.");
    await expect(page.getByRole("button", { name: "Gerar resumo" })).toBeVisible();
});

test("MF7 aluno mostra erro de geração sem perder listas", async ({ page }) => {
    await page.route("**/api/study-areas/area-mf7/summaries", (route) => {
        if (route.request().method() === "POST") {
            return fulfillJson(route, 429, { message: "Limite de geração atingido." });
        }

        return fulfillJson(route, 200, [
            {
                _id: "summary-mf7",
                studyAreaId: "area-mf7",
                type: "SUMMARY",
                contentJson: { title: "Resumo MF7" },
                sourcesJson: [],
            },
        ]);
    });
    await page.route("**/api/study-areas/area-mf7/study-tools**", (route) =>
        fulfillJson(route, 200, []),
    );

    await loginAs(page, readCredentials("STUDENT"));
    await page.goto("/app/areas/area-mf7/ferramentas");
    await page.getByRole("button", { name: "Gerar resumo" }).click();

    await expect(page.getByRole("alert")).toContainText("Limite de geração atingido.");
    await expect(page.getByRole("button", { name: "Resumo MF7" })).toBeVisible();
});

test("MF7 professor mostra erro de listagem sem bloquear formulário", async ({ page }) => {
    await page.route("**/api/teacher/subjects/subject-mf7/materials", (route) =>
        fulfillJson(route, 403, { message: "Sem permissão para listar materiais oficiais." }),
    );

    await loginAs(page, readCredentials("TEACHER"));
    await page.goto("/app/professor/disciplinas/subject-mf7/materiais");

    await expect(page.getByRole("alert")).toContainText("Sem permissão para listar materiais oficiais.");
    await expect(page.getByRole("button", { name: "Guardar material" })).toBeVisible();
});