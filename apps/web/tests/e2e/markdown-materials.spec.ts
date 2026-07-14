/**
 * Valida os percursos Markdown completos sobre a API e a UI reais do StudyFlow.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
    expectAuthenticatedShell,
    logoutIfAuthenticated,
    logoutFromShell,
} from "./authenticated-shell.js";

const teacher = {
    email:
        process.env.STUDYFLOW_E2E_TEACHER_EMAIL ??
        "professor.dev@studyflow.local",
    password:
        process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ??
        "professor-dev-12345",
};

const student = {
    email:
        process.env.STUDYFLOW_E2E_STUDENT_EMAIL ??
        "aluno.dev@studyflow.local",
    password:
        process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ??
        "aluno-dev-12345",
};

type IdentifiedResource = {
    _id: string;
};

type SchoolClass = IdentifiedResource & {
    status: "ACTIVE" | "ARCHIVED";
};

type Subject = IdentifiedResource & {
    status: "ACTIVE" | "ARCHIVED";
};

type MarkdownMaterial = IdentifiedResource & {
    contentRevision: number;
    status: "READY" | "DRAFT" | "PROCESSED";
    title: string;
    type: "MARKDOWN";
};

/**
 * Autentica uma conta pela interface para preservar o contrato real de sessão
 * HttpOnly e CSRF usado pelos pedidos seguintes.
 *
 * @param page Página Playwright associada ao contexto do teste.
 * @param credentials Conta seedada que deve iniciar sessão.
 */
async function login(
    page: Page,
    credentials: { email: string; password: string },
): Promise<void> {
    await page.goto("/login");
    await logoutIfAuthenticated(page);
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

/**
 * Executa um pedido JSON autenticado dentro da origem da aplicação.
 *
 * @param page Página que detém a sessão autenticada.
 * @param method Método HTTP permitido neste cenário.
 * @param path Rota absoluta da API.
 * @param body Payload JSON opcional.
 * @returns Contrato JSON devolvido pela API.
 */
async function apiRequest<T>(
    page: Page,
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
): Promise<T> {
    return page.evaluate(
        async ({ requestMethod, requestPath, requestBody }) => {
            const response = await fetch(requestPath, {
                method: requestMethod,
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                    "x-studyflow-csrf": "1",
                },
                body: requestBody ? JSON.stringify(requestBody) : undefined,
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message =
                    typeof payload.message === "string"
                        ? payload.message
                        : `${requestMethod} ${requestPath} devolveu HTTP ${response.status}.`;
                throw new Error(message);
            }
            return payload;
        },
        { requestMethod: method, requestPath: path, requestBody: body },
    ) as Promise<T>;
}

/**
 * Falha quando o documento atual contém violações WCAG de impacto sério ou
 * crítico, mantendo o mesmo gate usado pelos restantes percursos materiais.
 *
 * @param page Página já estabilizada no estado que deve ser auditado.
 */
async function expectNoSeriousAccessibilityViolations(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    expect(
        results.violations.filter(
            (violation) =>
                violation.impact === "serious" ||
                violation.impact === "critical",
        ),
    ).toEqual([]);
}

test("Markdown privado: editor, revisão, upload, visualização segura e download", async ({
    page,
}) => {
    const suffix = Date.now().toString(36);
    const title = `Apontamentos Markdown ${suffix}`;
    const uploadedTitle = `Upload Markdown ${suffix}`;
    const initialSource =
        "# Cinemática\n\n- [ ] Rever velocidade média\n\n![Gráfico externo](https://example.test/tracking.png)\n";
    const updatedSource = `${initialSource}\n## Exercício\n\nCalcular a aceleração em SI.\n`;

    await login(page, student);
    const area = await apiRequest<IdentifiedResource>(
        page,
        "POST",
        "/api/study-areas",
        {
            name: `Área Markdown ${suffix}`,
            description: "Área efémera para o smoke E2E de Markdown.",
        },
    );

    await page.goto(`/app/areas/${area._id}/materiais`);
    await page.getByRole("button", { name: "Novo material" }).click();
    const panel = page.getByRole("dialog", { name: "Novo material" });
    await panel.getByLabel("Tipo").selectOption("MARKDOWN");
    await panel.getByLabel("Título").fill(title);
    await panel.getByLabel("Fonte Markdown").fill(initialSource);
    await panel.getByRole("button", { name: "Criar Markdown" }).click();

    await expect(page).toHaveURL(/\/materiais\/[a-f\d]{24}\?edit=1$/u);
    await expect(page.getByText("Disponível para IA", { exact: true })).toBeVisible();
    await expect(page.getByText("Revisão 1", { exact: true })).toBeVisible();
    await page.getByLabel("Fonte Markdown").fill(updatedSource);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Revisão 2", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Ver documento" }).click();
    await expect(page.getByRole("heading", { name: "Cinemática" })).toBeVisible();
    await expect(page.getByText("Imagem externa: Gráfico externo")).toBeVisible();
    await expect(page.locator("img[src*='example.test']")).toHaveCount(0);
    await expectNoSeriousAccessibilityViolations(page);

    const materialId = page.url().match(/\/materiais\/([a-f\d]{24})/u)?.[1];
    expect(materialId).toBeTruthy();
    const download = await page.context().request.get(
        `/api/study-areas/${area._id}/materials/${materialId}/download`,
    );
    expect(download.status()).toBe(200);
    expect(download.headers()["content-type"]).toContain(
        "text/markdown; charset=utf-8",
    );
    expect(download.headers()["content-disposition"]).toContain("attachment");
    expect(download.headers()["cache-control"]).toBe("private, no-store");
    expect(await download.text()).toBe(updatedSource);

    await page.goto(`/app/areas/${area._id}/materiais`);
    await page.getByRole("button", { name: "Novo material" }).click();
    const uploadPanel = page.getByRole("dialog", { name: "Novo material" });
    await uploadPanel.getByLabel("Tipo").selectOption("FILE");
    await uploadPanel.getByLabel("Título").fill(uploadedTitle);
    await uploadPanel.getByLabel("Ficheiro").setInputFiles({
        name: "apontamentos.md",
        mimeType: "text/markdown",
        buffer: Buffer.from("# Upload válido\n\nConteúdo carregado pelo aluno.\n", "utf8"),
    });
    await uploadPanel.getByRole("button", { name: "Submeter" }).click();
    await expect(page).toHaveURL(/\/materiais\/[a-f\d]{24}\?edit=1$/u);
    await expect(page.getByLabel("Fonte Markdown")).toHaveValue(
        /Conteúdo carregado pelo aluno\./u,
    );
});

test("Markdown oficial: rascunho docente, publicação e leitura pelo aluno", async ({
    page,
}) => {
    const suffix = Date.now().toString(36);
    const title = `Markdown oficial ${suffix}`;
    const source =
        "# Leis de Newton\n\n| Lei | Síntese |\n| --- | --- |\n| Segunda | A força resultante determina a aceleração. |\n";

    await login(page, teacher);
    const classes = await apiRequest<SchoolClass[]>(
        page,
        "GET",
        "/api/teacher/classes",
    );
    const activeClass = classes.find((item) => item.status === "ACTIVE");
    expect(activeClass, "a seed E2E deve fornecer uma turma ativa").toBeTruthy();
    const subjects = await apiRequest<Subject[]>(
        page,
        "GET",
        `/api/teacher/classes/${activeClass!._id}/subjects?status=ACTIVE`,
    );
    const subject = subjects.find((item) => item.status === "ACTIVE");
    expect(subject, "a seed E2E deve fornecer uma disciplina ativa").toBeTruthy();

    await page.goto(`/app/professor/disciplinas/${subject!._id}/materiais`);
    await page.getByRole("button", { name: "Novo material" }).click();
    const panel = page.getByRole("dialog", { name: "Criar material oficial" });
    await panel.getByLabel("Tipo de material").selectOption("MARKDOWN");
    await panel.getByLabel("Título").fill(title);
    await panel.getByLabel("Fonte Markdown").fill(source);
    await panel.getByRole("button", { name: "Guardar rascunho" }).click();

    await expect(page).toHaveURL(/\/materiais\/[a-f\d]{24}\?edit=1$/u);
    await expect(page.getByText("Rascunho", { exact: true })).toBeVisible();
    await expect(
        page.getByText(/não alimenta a IA e não está visível aos alunos/u),
    ).toBeVisible();
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Publicado", { exact: true })).toBeVisible();

    const materialId = page.url().match(/\/materiais\/([a-f\d]{24})/u)?.[1];
    expect(materialId).toBeTruthy();
    const published = await apiRequest<MarkdownMaterial>(
        page,
        "GET",
        `/api/teacher/subjects/${subject!._id}/materials/${materialId}`,
    );
    expect(published).toMatchObject({
        status: "PROCESSED",
        type: "MARKDOWN",
        contentRevision: 1,
    });

    await logoutFromShell(page);
    await login(page, student);
    await page.goto(
        `/app/disciplinas/${subject!._id}/materiais/${materialId}`,
    );
    await expect(page.getByRole("heading", { name: "Leis de Newton" })).toBeVisible();
    await expect(page.getByRole("table")).toContainText("Segunda");
    await expectNoSeriousAccessibilityViolations(page);
    const download = await page.context().request.get(
        `/api/official-materials/${materialId}/download`,
    );
    expect(download.status()).toBe(200);
    expect(download.headers()["content-type"]).toContain(
        "text/markdown; charset=utf-8",
    );
    expect(await download.text()).toBe(source);
});
