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
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @param credentials Credenciais de teste usadas para autenticar o utilizador no fluxo real.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
 * Executa o apoio de teste para testes E2E, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

/**
 * Extrai o apoio de teste para testes E2E, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param href Valor de href usado pela função para executar extract id from href com dados explícitos.
 * @param pattern Valor de pattern usado pela função para executar extract id from href com dados explícitos.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
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
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @param method Valor de method usado pela função para executar api request com dados explícitos.
 * @param path Caminho de ficheiro ou rota usado para localizar a origem ou destino da operação.
 * @param body Payload validado recebido no pedido HTTP antes de ser entregue ao domínio.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
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

/**
 * Regista o apoio de teste para testes E2E, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function grantAiConsent(page: Page, purpose: string): Promise<void> {
    await apiRequest(page, "PUT", `/api/ai-consents/${purpose}`, {
        policyVersion: "2026-07-09",
    });
}

/** Garante a precondição negativa mesmo quando o teste corre noutro browser. */
async function revokeAiConsent(page: Page, purpose: string): Promise<void> {
    await apiRequest(page, "DELETE", `/api/ai-consents/${purpose}`);
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
    await expect(page.getByText("A carregar turmas...")).toHaveCount(0);

    const classForm = page.locator("form#criar-turma");
    if (!(await classForm.isVisible())) {
        await page.getByRole("button", { name: /^(Nova turma|Criar turma)$/ }).click();
    }
    await classForm.getByLabel("Nome").fill(className);
    await classForm.getByLabel("Código").fill(classCode);
    await classForm.getByLabel("Ano letivo").fill("2025/2026");
    await classForm.getByRole("button", { name: "Criar turma" }).click();

    const classCard = page.locator("article").filter({ hasText: className });
    await expect(classCard).toBeVisible();
    await classCard
        .getByRole("button", { name: /^(Adicionar primeiro aluno|Gerir \d+ alunos?)$/ })
        .click();
    await classCard.getByLabel("Adicionar aluno").fill(student.email);
    await classCard.getByRole("button", { name: "Adicionar aluno" }).click();
    await expect(classCard.getByRole("button", { name: "Gerir 1 aluno" })).toBeVisible();

    const classSubjectsHref = await classCard
        .getByRole("link", { name: "Gerir disciplinas" })
        .getAttribute("href");
    const classId = extractIdFromHref(classSubjectsHref, /\/turmas\/([^/]+)\/disciplinas/);
    await classCard.getByRole("link", { name: "Gerir disciplinas" }).click();

    await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
    await page.getByLabel("Nome").fill(subjectName);
    await page.getByLabel("Código").fill(subjectCode);
    await page.getByLabel("Descrição").fill("Disciplina criada pelo smoke E2E.");
    await page.getByRole("button", { name: "Criar disciplina" }).click();

    const subjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(subjectCard).toBeVisible();
    const materialsHref = await subjectCard
        .getByRole("link", { name: "Materiais" })
        .getAttribute("href");
    const subjectId = extractIdFromHref(materialsHref, /\/disciplinas\/([^/]+)\/materiais/);

    await subjectCard.getByRole("link", { name: "Materiais" }).click();
    await expect(page.getByRole("heading", { name: "Materiais oficiais" })).toBeVisible();
    await page.getByLabel("Título", { exact: true }).fill(materialTitle);
    await page
        .getByLabel("Conteúdo textual oficial")
        .fill("Funcao afim tem representacao grafica linear e taxa de variacao constante.");
    await page.getByRole("button", { name: "Guardar material" }).click();
    await expect(page.locator("article").filter({ hasText: materialTitle })).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/voz`);
    const classVoiceDialog = page.getByRole("dialog", { name: "Voz IA da turma" });
    await expect(classVoiceDialog).toBeVisible();
    await classVoiceDialog.getByLabel("Tom").selectOption("DIRECT");
    await classVoiceDialog.getByLabel("Detalhe").selectOption("BALANCED");
    await classVoiceDialog
        .getByRole("textbox", { name: "Orientações da IA" })
        .fill("Usar exemplos curtos.");
    await classVoiceDialog.getByRole("button", { name: "Guardar" }).click();
    await expect(classVoiceDialog).toBeHidden();

    await page.goto(`/app/professor/disciplinas/${subjectId}/voz`);
    await expect(page.getByRole("heading", { name: "Voz da IA docente" })).toBeVisible();
    await expect(page.getByText("Origem: Turma")).toBeVisible();
    await page.getByLabel("Tom").selectOption("SOCRATIC");
    await page.getByLabel("Detalhe").selectOption("BALANCED");
    await page
        .getByRole("textbox", { name: "Orientações da IA" })
        .fill("Fazer perguntas de verificacao.\nUsar exemplos curtos.");
    await page.getByRole("button", { name: "Guardar override" }).click();
    await expect(page.getByText("Override da disciplina guardado.")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/publicacoes`);
    await expect(page.getByRole("heading", { name: "Publicações" })).toBeVisible();
    await page.getByLabel("Título", { exact: true }).fill(postTitle);
    await page.getByLabel("Mensagem").fill("Leiam o material oficial antes da proxima aula.");
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.locator("article").filter({ hasText: postTitle })).toBeVisible();

    await logout(page);

    await loginAs(page, student);
    await grantAiConsent(page, "CLASS_AI");
    await page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Turmas" })
        .click();
    const studentClassCard = page.locator("article").filter({ hasText: className });
    await expect(studentClassCard).toBeVisible();
    await studentClassCard.getByRole("link", { name: "Ver disciplinas" }).click();

    const studentSubjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(studentSubjectCard).toBeVisible();
    await studentSubjectCard.getByRole("link", { name: "Abrir IA da disciplina" }).click();
    await expect(page.getByRole("heading", { name: "IA da disciplina" })).toBeVisible();
    await page.locator("textarea").fill("Explica funcao afim com base no material oficial.");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(
        page.getByText("Esta finalidade de IA ainda não tem quota administrativa."),
    ).toBeVisible();
    await expect(
        page.getByRole("heading", { name: "Resposta", exact: true }),
    ).toHaveCount(0);

    await page.goto(`/app/turmas/${classId}/publicacoes`);
    await expect(page.locator("article").filter({ hasText: postTitle })).toBeVisible();

    await page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Salas" })
        .click();
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

    await revokeAiConsent(page, "ROOM_AI");
    await page.goto(`/app/salas/${roomId}/ia`);
    await expect(page.getByRole("heading", { name: "IA da sala" })).toBeVisible();
    await page.locator("textarea").fill("O que diz o apontamento sobre taxa de variacao?");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(
        page.getByText(
            "É necessário consentimento ativo para usar esta funcionalidade de IA.",
        ),
    ).toBeVisible();
    await grantAiConsent(page, "ROOM_AI");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(
        page.getByText("Esta funcionalidade de IA está temporariamente desativada."),
    ).toBeVisible();
    await expect(
        page.getByRole("heading", { name: "Resposta", exact: true }),
    ).toHaveCount(0);
});
