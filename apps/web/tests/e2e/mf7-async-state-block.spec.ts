import { expect, test, type Page, type Route } from "@playwright/test";
import { expectAuthenticatedShell } from "./authenticated-shell.js";

type Credentials = {
    email: string;
    password: string;
};

const fallbackCredentials = {
    STUDENT: {
        email: "aluno.dev@studyflow.local",
        password: "aluno-dev-12345",
    },
    TEACHER: {
        email: "professor.dev@studyflow.local",
        password: "professor-dev-12345",
    },
} satisfies Record<"STUDENT" | "TEACHER", Credentials>;

test.setTimeout(120_000);

/**
 * Lê uma variável de ambiente E2E com fallback para os utilizadores semeados.
 *
 * @param name Nome da variável esperada.
 * @param fallback Valor de desenvolvimento criado pelo `start:e2e`.
 * @returns Valor configurado no ambiente ou fallback local previsível.
 */
function readEnvironmentVariable(name: string, fallback: string): string {
    return process.env[name] ?? fallback;
}

/**
 * Lê credenciais E2E do ambiente ou dos utilizadores de desenvolvimento semeados.
 *
 * @param role Role autenticado usado para escolher variáveis de ambiente.
 * @returns Credenciais de teste para o ambiente E2E local.
 */
function readCredentials(role: "STUDENT" | "TEACHER"): Credentials {
    const fallback = fallbackCredentials[role];

    return {
        email: readEnvironmentVariable(`STUDYFLOW_E2E_${role}_EMAIL`, fallback.email),
        password: readEnvironmentVariable(
            `STUDYFLOW_E2E_${role}_PASSWORD`,
            fallback.password,
        ),
    };
}

/**
 * Entra pela UI para validar uma sessão protegida real com cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 * @returns Promise resolvida quando a shell autenticada aparece.
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
 * Responde a uma rota HTTP com JSON controlado para validar estados visuais sem dados privados.
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

    await expect(
        page.getByText("Ainda não há resumos nem ferramentas geradas."),
    ).toBeVisible();
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

    await expect(page.getByRole("alert")).toContainText(
        "Falha controlada ao carregar resumos.",
    );
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
    await expect(page.getByRole("button", { name: "Resumo MF7" })).toBeVisible();
    await page.getByRole("button", { name: "Gerar resumo" }).click();

    await expect(page.getByRole("alert")).toContainText("Limite de geração atingido.");
    await expect(page.getByRole("button", { name: "Resumo MF7" })).toBeVisible();
});

test("MF7 professor mostra erro de listagem sem bloquear formulário", async ({ page }) => {
    await page.route("**/api/teacher/subjects/subject-mf7/materials", (route) =>
        fulfillJson(route, 403, {
            message: "Sem permissão para listar materiais oficiais.",
        }),
    );

    await loginAs(page, readCredentials("TEACHER"));
    await page.goto("/app/professor/disciplinas/subject-mf7/materiais");

    await expect(page.getByRole("alert")).toContainText(
        "Sem permissão para listar materiais oficiais.",
    );
    await page.getByRole("button", { name: "Novo material" }).click();
    await expect(page.getByRole("button", { name: "Guardar material" })).toBeVisible();
});
