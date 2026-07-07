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
 * Entra pela UI para validar sessão real com cookies HttpOnly.
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
    await expect(page.getByText(credentials.email)).toBeVisible();
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
 * Lê endpoints da API usando a própria sessão autenticada do browser.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @param path Caminho de ficheiro ou rota usado para localizar a origem ou destino da operação.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
async function apiGet<T>(page: Page, path: string): Promise<T> {
    return apiRequest(page, "GET", path);
}

/**
 * Executa o apoio de teste para testes E2E, mantendo o cenário legível e próximo do comportamento real validado.
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
    return page.evaluate(async ({ apiPath, requestMethod, requestBody }) => {
        const response = await fetch(apiPath, {
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
                    : `${requestMethod} ${apiPath} devolveu HTTP ${response.status}.`;
            throw new Error(message);
        }
        return payload;
    }, { apiPath: path, requestMethod: method, requestBody: body }) as Promise<T>;
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
        policyVersion: "e2e-2026-06-30",
    });
}

test("MF2 smoke: professor e aluno percorrem projectos, testes, indexacao e IA privada", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const className = `Turma MF2 Smoke ${suffix}`;
    const classCode = `MF2${suffix}`.slice(-10).toUpperCase();
    const subjectName = `Fisica MF2 ${suffix}`;
    const subjectCode = `FIS${suffix}`.slice(-10).toUpperCase();
    const officialMaterialTitle = `Material oficial MF2 ${suffix}`;
    const guidedRoomTitle = `Sala guiada MF2 ${suffix}`;
    const projectTitle = `Projecto MF2 ${suffix}`;
    const officialTestTitle = `Teste oficial MF2 ${suffix}`;
    const progressNoteTitle = `Nota progresso MF2 ${suffix}`;
    const areaName = `Area privada MF2 ${suffix}`;
    const privateMaterialTitle = `Material privado MF2 ${suffix}`;

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

    const subjectsHref = await classCard
        .getByRole("link", { name: "Disciplinas" })
        .getAttribute("href");
    const classId = extractIdFromHref(subjectsHref, /\/turmas\/([^/]+)\/disciplinas/);
    await classCard.getByRole("link", { name: "Disciplinas" }).click();

    await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
    await page.getByPlaceholder("Nome").fill(subjectName);
    await page.getByPlaceholder("Código").fill(subjectCode);
    await page.getByPlaceholder("Descrição").fill("Disciplina criada pelo smoke MF2.");
    await page.getByRole("button", { name: "Criar disciplina" }).click();

    const subjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(subjectCard).toBeVisible();
    const materialsHref = await subjectCard
        .getByRole("link", { name: "Materiais" })
        .getAttribute("href");
    const subjectId = extractIdFromHref(materialsHref, /\/disciplinas\/([^/]+)\/materiais/);
    await subjectCard.getByRole("link", { name: "Materiais" }).click();

    await expect(page.getByRole("heading", { name: "Materiais oficiais" })).toBeVisible();
    await page.getByPlaceholder("Título").fill(officialMaterialTitle);
    await page
        .getByPlaceholder("Conteúdo textual oficial")
        .fill("Energia cinetica depende da massa e do quadrado da velocidade.");
    await page.getByRole("button", { name: "Guardar material" }).click();

    const officialMaterialCard = page.locator("article").filter({ hasText: officialMaterialTitle });
    await expect(officialMaterialCard).toBeVisible();
    const officialMaterials = await apiGet<Array<{ _id: string; title: string }>>(
        page,
        `/api/teacher/subjects/${subjectId}/materials`,
    );
    const officialMaterial = officialMaterials.find((material) => material.title === officialMaterialTitle);
    expect(officialMaterial, "material oficial criado pela UI").toBeTruthy();

    await officialMaterialCard.getByRole("button", { name: "Indexar" }).click();
    const versionsLink = officialMaterialCard.getByRole("link", { name: "Versões" });
    await expect(versionsLink).toBeVisible();
    await versionsLink.click();
    await expect(page.getByRole("heading", { name: "Versões do material" })).toBeVisible();
    await page.getByPlaceholder("Título da versão").fill(`v1 ${suffix}`);
    await page.getByPlaceholder("Resumo das alterações").fill("Snapshot criado pelo smoke MF2.");
    await page.getByRole("button", { name: "Criar versão" }).click();
    await expect(page.getByText(`v1 · v1 ${suffix}`)).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/contextos-materiais`);
    await expect(page.getByRole("heading", { name: "Contexts de materiais" })).toBeVisible();
    await expect(page.getByText(officialMaterialTitle)).toBeVisible();
    await expect(page.getByText("Disciplina oficial")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/salas-guiadas`);
    await expect(page.getByRole("heading", { name: "Salas guiadas" })).toBeVisible();
    await page.getByLabel("Título").fill(guidedRoomTitle);
    await page.getByLabel("Descrição").fill("Sala orientada para o smoke da MF2.");
    await page.getByLabel("Disciplina").selectOption(subjectId);
    await page.getByRole("button", { name: "Criar sala" }).click();
    const guidedRoomCard = page.locator("article").filter({ hasText: guidedRoomTitle });
    await expect(guidedRoomCard).toBeVisible();
    await expect(guidedRoomCard.getByText(subjectName)).toBeVisible();
    await expect(guidedRoomCard.getByText("Voz: disciplina")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/projectos`);
    await expect(page.getByRole("heading", { name: "Projectos da turma" })).toBeVisible();
    await page.getByLabel("Título").fill(projectTitle);
    await page
        .getByLabel("Enunciado")
        .fill("Construir uma explicacao orientada sobre energia mecanica com exemplo aplicado.");
    await page.getByLabel("Estado").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Criar projecto" }).click();
    await expect(page.locator("article").filter({ hasText: projectTitle })).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/testes`);
    await expect(page.getByRole("heading", { name: "Testes oficiais" })).toBeVisible();
    await page.getByLabel("Título").fill(officialTestTitle);
    await page.getByLabel("Pergunta").fill("Qual e a unidade SI de energia?");
    await page.getByLabel("Opções").fill("Joule\nNewton\nWatt\nPascal");
    await page.getByRole("button", { name: "Criar rascunho" }).click();
    await expect(page.locator("article").filter({ hasText: officialTestTitle })).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/revisoes-ia`);
    await expect(page.getByRole("heading", { name: "Revisões IA" })).toBeVisible();
    await page.getByPlaceholder("ID do material oficial").fill(officialMaterial!._id);
    await page.getByPlaceholder("Conteúdo gerado a rever").fill("Resumo IA validado pelo professor.");
    await page.getByRole("button", { name: "Criar revisão" }).click();
    const reviewCard = page.locator("article").filter({ hasText: "Resumo IA validado pelo professor." });
    await expect(reviewCard).toBeVisible();
    await reviewCard.getByRole("button", { name: "Aprovar" }).click();
    await expect(reviewCard.getByText("APPROVED")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/progresso`);
    await expect(page.getByRole("heading", { name: "Acompanhamento da turma" })).toBeVisible();
    await page.getByPlaceholder("Título").fill(progressNoteTitle);
    await page.getByPlaceholder("Observações").fill("Acompanhar dificuldades no conceito de energia.");
    await page.getByPlaceholder("Dificuldades separadas por vírgulas").fill("energia, unidades");
    await page.getByRole("button", { name: "Guardar nota" }).click();
    await expect(page.locator("article").filter({ hasText: progressNoteTitle })).toBeVisible();
    await expect(page.getByText("energia").first()).toBeVisible();

    await logout(page);

    await loginAs(page, student);
    await grantAiConsent(page, "PROJECT_AI");
    await grantAiConsent(page, "PRIVATE_AREA_AI");
    await page.goto(`/app/turmas/${classId}/salas-guiadas`);
    await expect(page.getByRole("heading", { name: "Salas guiadas" })).toBeVisible();
    const studentGuidedRoomCard = page.locator("article").filter({ hasText: guidedRoomTitle });
    await expect(studentGuidedRoomCard).toBeVisible();
    await expect(studentGuidedRoomCard.getByText(subjectName)).toBeVisible();

    await page.goto(`/app/turmas/${classId}/projectos`);
    await expect(page.getByRole("heading", { name: "Projectos da turma" })).toBeVisible();
    const studentProjectCard = page.locator("article").filter({ hasText: projectTitle });
    await expect(studentProjectCard).toBeVisible();
    await studentProjectCard.getByRole("link", { name: "Criar plano IA" }).click();
    await expect(page.getByRole("heading", { name: "Plano IA do projecto" })).toBeVisible();
    await page.getByLabel("Objectivo").fill("Organizar o projecto em passos simples.");
    await page.getByRole("button", { name: "Gerar plano" }).click();
    await expect(page.getByRole("heading", { name: "Passos sugeridos" })).toBeVisible();
    await expect(page.getByText("Ler o enunciado oficial.")).toBeVisible();

    await page.goto(`/app/disciplinas/${subjectId}/contextos-materiais`);
    await expect(page.getByText(officialMaterialTitle)).toBeVisible();
    await expect(page.getByText("Disciplina oficial")).toBeVisible();

    await page.goto("/app/areas");
    await expect(page.getByRole("heading", { name: "Áreas de estudo" })).toBeVisible();
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area privada criada pelo smoke MF2.");
    await page.getByRole("button", { name: "Criar área" }).click();
    const areaCard = page.getByRole("link", { name: new RegExp(areaName) });
    await expect(areaCard).toBeVisible();
    const areaHref = await areaCard.getAttribute("href");
    const areaId = extractIdFromHref(areaHref, /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await expect(page.getByRole("heading", { name: "Materiais", exact: true })).toBeVisible();
    const privateMaterialForm = page.locator("form").filter({ hasText: "Novo material" });
    await privateMaterialForm.getByLabel("Título", { exact: true }).fill(privateMaterialTitle);
    await privateMaterialForm
        .getByLabel("Texto")
        .fill("A energia potencial gravitica aumenta com a altura e a massa.");
    await privateMaterialForm.getByRole("button", { name: "Submeter" }).click();
    const privateMaterialItem = page.locator("li").filter({ hasText: privateMaterialTitle });
    await expect(privateMaterialItem).toBeVisible();
    await privateMaterialItem.getByRole("button", { name: "Indexar" }).click();
    await expect(privateMaterialItem.getByRole("link", { name: "Versões" })).toBeVisible();

    await page.goto(`/app/areas/${areaId}/contextos-materiais`);
    await expect(page.getByRole("heading", { name: "Contexts de materiais" })).toBeVisible();
    await expect(page.getByText(privateMaterialTitle)).toBeVisible();
    await expect(page.getByText("Área privada")).toBeVisible();

    await page.goto(`/app/areas/${areaId}/ia-privada`);
    await expect(page.getByRole("heading", { name: "IA privada da área" })).toBeVisible();
    await page.locator("textarea").fill("Explica energia potencial com base nos meus materiais.");
    await page.getByRole("button", { name: "Perguntar" }).click();
    await expect(page.getByText("Resposta deterministica da IA privada para smoke E2E.")).toBeVisible();
});
