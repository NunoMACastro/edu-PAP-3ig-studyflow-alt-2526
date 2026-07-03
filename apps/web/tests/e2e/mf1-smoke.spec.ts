import { expect, test, type Page } from "@playwright/test";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

test.setTimeout(120_000);

/**
 * Entra pela UI para garantir que o cookie HttpOnly e o refresh de sessao sao reais.
 *
 * @param page Pagina Playwright.
 * @param credentials Credenciais do utilizador de smoke.
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

async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

function extractIdFromHref(href: string | null, pattern: RegExp): string {
    const match = href?.match(pattern);
    if (!match) {
        throw new Error(`Nao foi possivel extrair id a partir de href: ${href ?? "<null>"}`);
    }
    return match[1];
}

/**
 * Chama a API com a sessão real do browser.
 *
 * @param page Pagina Playwright autenticada.
 * @param method Metodo HTTP.
 * @param path Caminho relativo da API.
 * @param body Payload opcional.
 */
async function apiRequest<T>(
    page: Page,
    method: "GET" | "POST" | "PUT" | "DELETE",
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

async function grantAiConsent(page: Page, purpose: string): Promise<void> {
    await apiRequest(page, "PUT", `/api/ai-consents/${purpose}`, {
        policyVersion: "e2e-2026-06-30",
    });
}

test("MF1 smoke: professor e aluno percorrem os fluxos principais com sessao real", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const className = `Turma Smoke ${suffix}`;
    const classCode = `SM${suffix}`.slice(-10).toUpperCase();
    const subjectName = `Matematica Smoke ${suffix}`;
    const subjectCode = `MAT${suffix}`.slice(-10).toUpperCase();
    const materialTitle = `Material oficial ${suffix}`;
    const postTitle = `Aviso smoke ${suffix}`;
    const roomName = `Sala smoke ${suffix}`;
    const shareTitle = `Apontamento smoke ${suffix}`;

    await loginAs(page, teacher);
    await page.goto("/app/professor/turmas");
    await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();

    const classForm = page.getByRole("complementary", { name: "Criar turma" });
    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByLabel("Ano letivo").fill("2025/2026");
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await expect(classCard).toBeVisible();
    await classCard.getByLabel(/Email do aluno/).fill(student.email);
    await classCard.getByRole("button", { name: "Adicionar aluno" }).click();
    await expect(classCard.getByText("1 alunos")).toBeVisible();

    const classSubjectsHref = await classCard
        .getByRole("link", { name: "Disciplinas" })
        .getAttribute("href");
    const classId = extractIdFromHref(classSubjectsHref, /\/turmas\/([^/]+)\/disciplinas/);
    await classCard.getByRole("link", { name: "Disciplinas" }).click();

    await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
    await page.getByPlaceholder("Nome").fill(subjectName);
    await page.getByPlaceholder("Código").fill(subjectCode);
    await page.getByPlaceholder("Descrição").fill("Disciplina criada pelo smoke E2E.");
    await page.getByRole("button", { name: "Criar disciplina" }).click();

    const subjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(subjectCard).toBeVisible();
    const materialsHref = await subjectCard
        .getByRole("link", { name: "Materiais" })
        .getAttribute("href");
    const subjectId = extractIdFromHref(materialsHref, /\/disciplinas\/([^/]+)\/materiais/);

    await subjectCard.getByRole("link", { name: "Materiais" }).click();
    await expect(page.getByRole("heading", { name: "Materiais oficiais" })).toBeVisible();
    await page.getByPlaceholder("Título").fill(materialTitle);
    await page
        .getByPlaceholder("Conteúdo textual oficial")
        .fill("Funcao afim tem representacao grafica linear e taxa de variacao constante.");
    await page.getByRole("button", { name: "Guardar material" }).click();
    await expect(page.locator("article").filter({ hasText: materialTitle })).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/voz`);
    await expect(page.getByRole("heading", { name: "Voz da IA docente" })).toBeVisible();
    await page.getByLabel("Tom").selectOption("DIRECT");
    await page.getByLabel("Detalhe").selectOption("BALANCED");
    await page.getByLabel("Regras").fill("Usar exemplos curtos.");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Voz da turma guardada.")).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/voz`);
    await expect(page.getByRole("heading", { name: "Voz da IA docente" })).toBeVisible();
    await expect(page.getByText("Origem: Turma")).toBeVisible();
    await page.getByLabel("Tom").selectOption("SOCRATIC");
    await page.getByLabel("Detalhe").selectOption("BALANCED");
    await page.getByLabel("Regras").fill("Fazer perguntas de verificacao.\nUsar exemplos curtos.");
    await page.getByRole("button", { name: "Guardar override" }).click();
    await expect(page.getByText("Override da disciplina guardado.")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/publicacoes`);
    await expect(page.getByRole("heading", { name: "Publicações" })).toBeVisible();
    await page.getByPlaceholder("Título").fill(postTitle);
    await page.getByPlaceholder("Mensagem").fill("Leiam o material oficial antes da proxima aula.");
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.locator("article").filter({ hasText: postTitle })).toBeVisible();

    await logout(page);

    await loginAs(page, student);
    await grantAiConsent(page, "CLASS_AI");
    await page.getByRole("link", { name: "Turmas" }).click();
    const studentClassCard = page.locator("article").filter({ hasText: className });
    await expect(studentClassCard).toBeVisible();
    await studentClassCard.getByRole("link", { name: "Ver disciplinas" }).click();

    const studentSubjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(studentSubjectCard).toBeVisible();
    await studentSubjectCard.getByRole("link", { name: "Abrir IA da disciplina" }).click();
    await expect(page.getByRole("heading", { name: "IA da disciplina" })).toBeVisible();
    await page.locator("textarea").fill("Explica funcao afim com base no material oficial.");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(page.getByRole("heading", { name: "Resposta" })).toBeVisible();
    await expect(page.getByText("Resposta deterministica da IA da disciplina")).toBeVisible();
    await expect(page.getByText(materialTitle)).toBeVisible();

    await page.goto(`/app/turmas/${classId}/publicacoes`);
    await expect(page.locator("article").filter({ hasText: postTitle })).toBeVisible();

    await page.getByRole("link", { name: "Salas" }).click();
    await expect(page.getByRole("heading", { name: "Salas de estudo" })).toBeVisible();
    const roomForm = page.locator("form").filter({ hasText: "Salas de estudo" });
    await roomForm.getByLabel("Nome").fill(roomName);
    await roomForm.getByLabel("Descrição").fill("Sala criada pelo smoke E2E.");
    await roomForm.getByRole("button", { name: "Criar sala" }).click();

    const roomCard = page.locator("article").filter({ hasText: roomName });
    await expect(roomCard).toBeVisible();
    const sharesHref = await roomCard.getByRole("link", { name: "Partilhas" }).getAttribute("href");
    const roomId = extractIdFromHref(sharesHref, /\/salas\/([^/]+)$/);
    await roomCard.getByRole("link", { name: "Partilhas" }).click();

    await expect(page.getByRole("heading", { name: "Partilhas da sala" })).toBeVisible();
    await page.getByLabel("Título").fill(shareTitle);
    await page.getByLabel("Texto").fill("A taxa de variacao indica quanto a funcao cresce por unidade.");
    await page.getByRole("button", { name: "Partilhar" }).click();
    await expect(page.locator("article").filter({ hasText: shareTitle })).toBeVisible();

    await page.goto(`/app/salas/${roomId}/ia`);
    await expect(page.getByRole("heading", { name: "IA da sala" })).toBeVisible();
    await page.locator("textarea").fill("O que diz o apontamento sobre taxa de variacao?");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(page.getByRole("heading", { name: "Resposta" })).toBeVisible();
    await expect(page.getByText("Resposta deterministica da IA da sala")).toBeVisible();
    await expect(page.getByText(shareTitle)).toBeVisible();
});
