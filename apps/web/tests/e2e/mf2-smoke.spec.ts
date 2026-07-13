import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectAuthenticatedShell, logoutFromShell } from "./authenticated-shell.js";

const teacher = {
    email: process.env.STUDYFLOW_E2E_TEACHER_EMAIL ?? "professor.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_TEACHER_PASSWORD ?? "professor-dev-12345",
};

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

const guidedRoomViewports = [
    { width: 320, height: 720 },
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
];

test.setTimeout(240_000);

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
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

/**
 * Executa o apoio de teste para testes E2E, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function logout(page: Page): Promise<void> {
    await logoutFromShell(page);
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
        policyVersion: purpose === "CLASS_AI" ? "2026-07-11" : "2026-07-09",
    });
}

/** Confirma que a página não ganhou scroll horizontal no viewport atual. */
async function expectNoHorizontalScroll(page: Page): Promise<void> {
    expect(
        await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        ),
    ).toBe(false);
}

/** Aceita apenas resultados Axe sem impacto serious ou critical. */
async function expectNoSeriousAxeFindings(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    expect(
        results.violations.filter(
            (violation) =>
                violation.impact === "serious" || violation.impact === "critical",
        ),
    ).toEqual([]);
}

/** Cria um PDF pequeno e estruturalmente válido sem depender de fixtures externas. */
function createPdfFixture(text: string): Buffer {
    const stream = `BT /F1 12 Tf 72 720 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`;
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
    ];
    let document = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(document, "ascii"));
        document += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(document, "ascii");
    document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    document += offsets
        .slice(1)
        .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
        .join("");
    document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(document, "ascii");
}

/** Cria um DOCX mínimo real através de um ZIP sem compressão com CRC-32 válido. */
function createDocxFixture(text: string): Buffer {
    const files = [
        {
            name: "[Content_Types].xml",
            content:
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
                '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
                '<Default Extension="xml" ContentType="application/xml"/>' +
                '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
                "</Types>",
        },
        {
            name: "_rels/.rels",
            content:
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
                "</Relationships>",
        },
        {
            name: "word/document.xml",
            content:
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
                `<w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p><w:sectPr/></w:body></w:document>`,
        },
    ];
    const locals: Buffer[] = [];
    const centrals: Buffer[] = [];
    let localOffset = 0;
    for (const file of files) {
        const name = Buffer.from(file.name, "utf8");
        const content = Buffer.from(file.content, "utf8");
        const crc = crc32(content);
        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(content.length, 18);
        localHeader.writeUInt32LE(content.length, 22);
        localHeader.writeUInt16LE(name.length, 26);
        const local = Buffer.concat([localHeader, name, content]);
        locals.push(local);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(content.length, 20);
        centralHeader.writeUInt32LE(content.length, 24);
        centralHeader.writeUInt16LE(name.length, 28);
        centralHeader.writeUInt32LE(localOffset, 42);
        centrals.push(Buffer.concat([centralHeader, name]));
        localOffset += local.length;
    }
    const centralDirectory = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(localOffset, 16);
    return Buffer.concat([...locals, centralDirectory, end]);
}

/** Calcula CRC-32 para as entradas STORE do DOCX de teste. */
function crc32(buffer: Buffer): number {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

test("MF2 smoke: professor e aluno percorrem projectos, testes, indexacao e IA privada", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const className = `Turma MF2 Smoke ${suffix}`;
    const classCode = `MF2${suffix}`.slice(-10).toUpperCase();
    const subjectName = `Fisica MF2 ${suffix}`;
    const subjectCode = `FIS${suffix}`.slice(-10).toUpperCase();
    const officialMaterialTitle = `Material oficial MF2 ${suffix}`;
    const officialPdfTitle = `PDF oficial MF2 ${suffix}`;
    const officialDocxTitle = `DOCX oficial MF2 ${suffix}`;
    const guidedRoomTitle = `Sala guiada MF2 ${suffix}`;
    const projectTitle = `Projecto MF2 ${suffix}`;
    const officialTestTitle = `Teste oficial MF2 ${suffix}`;
    const progressNoteTitle = `Nota progresso MF2 ${suffix}`;
    const areaName = `Area privada MF2 ${suffix}`;
    const privateMaterialTitle = `Material privado MF2 ${suffix}`;
    const teacherChatMessage = `Mensagem do professor MF2 ${suffix}`;
    const studentChatMessage = `Resposta do aluno MF2 ${suffix}`;

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

    const subjectsHref = await classCard
        .getByRole("link", { name: "Gerir disciplinas" })
        .getAttribute("href");
    const classId = extractIdFromHref(subjectsHref, /\/turmas\/([^/]+)\/disciplinas/);
    await classCard.getByRole("link", { name: "Gerir disciplinas" }).click();

    await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
    if (!(await page.getByLabel("Nome").isVisible())) {
        await page.getByRole("button", { name: "Nova disciplina" }).click();
    }
    await page.getByLabel("Nome").fill(subjectName);
    await page.getByLabel("Código").fill(subjectCode);
    await page.getByLabel("Descrição").fill("Disciplina criada pelo smoke MF2.");
    await page.getByRole("button", { name: "Criar disciplina" }).click();

    const subjectCard = page.locator("article").filter({ hasText: subjectName });
    await expect(subjectCard).toBeVisible();
    const materialsHref = await subjectCard
        .getByRole("link", { name: "Materiais" })
        .getAttribute("href");
    const subjectId = extractIdFromHref(materialsHref, /\/disciplinas\/([^/]+)\/materiais/);

    await page.goto(`/app/professor/turmas/${classId}/voz`);
    const classVoiceDialog = page.getByRole("dialog", { name: "Voz IA da turma" });
    await expect(classVoiceDialog).toBeVisible();
    await classVoiceDialog.getByLabel("Tom").selectOption("SOCRATIC");
    await classVoiceDialog.getByLabel("Detalhe").selectOption("BALANCED");
    await classVoiceDialog
        .getByRole("textbox", { name: "Orientações da IA" })
        .fill("Guiar o aluno com perguntas curtas.");
    await classVoiceDialog.getByRole("button", { name: "Guardar" }).click();
    await expect(classVoiceDialog).toBeHidden();

    await page.goto(`/app/professor/disciplinas/${subjectId}/chat`);
    await expect(page.getByRole("heading", { name: "Chat da disciplina" })).toBeVisible();
    await expect(page.getByText("Online", { exact: true })).toBeVisible();
    await page.getByLabel("Mensagem").fill(teacherChatMessage);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.locator("article").filter({ hasText: teacherChatMessage })).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/materiais`);

    await expect(page.getByRole("heading", { name: "Materiais oficiais", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Novo material" }).click();
    await page.getByLabel("Título", { exact: true }).fill(officialMaterialTitle);
    await page
        .getByLabel("Conteúdo textual oficial")
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

    for (const fixture of [
        {
            type: "PDF",
            title: officialPdfTitle,
            name: "energia-oficial.pdf",
            mimeType: "application/pdf",
            buffer: createPdfFixture("Energia oficial em PDF"),
        },
        {
            type: "DOCX",
            title: officialDocxTitle,
            name: "energia-oficial.docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            buffer: createDocxFixture("Energia oficial em DOCX"),
        },
    ]) {
        await page.getByRole("button", { name: "Novo material" }).click();
        const panel = page.getByRole("dialog", { name: "Criar material oficial" });
        await panel.getByLabel("Tipo de material").selectOption(fixture.type);
        await panel.getByLabel("Título").fill(fixture.title);
        await panel.getByLabel(new RegExp(`Ficheiro ${fixture.type}`)).setInputFiles({
            name: fixture.name,
            mimeType: fixture.mimeType,
            buffer: fixture.buffer,
        });
        await panel.getByRole("button", { name: "Guardar material" }).click();
        const card = page.locator("article").filter({ hasText: fixture.title });
        await expect(card).toContainText("Por indexar");
        await card.getByRole("button", { name: "Indexar" }).click();
        await expect(card.getByText("Disponível para IA")).toBeVisible({ timeout: 30_000 });
    }

    const materialsWithFiles = await apiGet<Array<{ _id: string; title: string }>>(
        page,
        `/api/teacher/subjects/${subjectId}/materials`,
    );
    const officialPdf = materialsWithFiles.find((material) => material.title === officialPdfTitle)!;
    const officialDocx = materialsWithFiles.find((material) => material.title === officialDocxTitle)!;
    const teacherPdfContent = await page.context().request.get(
        `/api/official-materials/${officialPdf._id}/content`,
    );
    expect(teacherPdfContent.status()).toBe(200);
    expect(teacherPdfContent.headers()["content-disposition"]).toContain("inline");
    expect(teacherPdfContent.headers()["cache-control"]).toBe("private, no-store");
    const teacherDocxContent = await page.context().request.get(
        `/api/official-materials/${officialDocx._id}/content`,
    );
    expect(teacherDocxContent.status()).toBe(200);
    expect(teacherDocxContent.headers()["content-disposition"]).toContain("attachment");

    await officialMaterialCard.getByRole("button", { name: "Indexar" }).click();
    const versionsLink = officialMaterialCard.getByRole("link", { name: "Versões" });
    await expect(versionsLink).toBeVisible();
    await versionsLink.click();
    await expect(page.getByRole("heading", { name: "Versões do material" })).toBeVisible();
    await page.getByRole("button", { name: "Criar versão" }).click();
    await page.getByLabel("Título da versão").fill(`v1 ${suffix}`);
    await page.getByLabel("Resumo das alterações").fill("Snapshot criado pelo smoke MF2.");
    await page.getByRole("button", { name: "Criar versão", exact: true }).last().click();
    await expect(page.getByText(`v1 · v1 ${suffix}`)).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/contextos-materiais`);
    await expect(page.getByRole("heading", { name: "Fontes da IA" })).toBeVisible();
    await expect(page.getByText(officialMaterialTitle)).toBeVisible();
    await expect(page.getByText("Disciplina oficial").first()).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/salas-guiadas`);
    await expect(page.getByRole("heading", { name: "Salas guiadas", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Nova sala guiada" }).click();
    await page.getByLabel("Título").fill(guidedRoomTitle);
    await page.getByLabel("Objetivo").fill("Compreender o conceito de energia.");
    await page.getByLabel("Instruções").fill("Sala orientada para o smoke da MF2.");
    await page
        .getByRole("dialog", { name: "Criar sala guiada" })
        .locator("select")
        .first()
        .selectOption(subjectId);
    await page
        .getByRole("dialog", { name: "Criar sala guiada" })
        .getByLabel(new RegExp(officialPdfTitle))
        .check();
    await page.getByRole("button", { name: "Criar e disponibilizar" }).click();
    const guidedRoomCard = page.locator("article").filter({ hasText: guidedRoomTitle });
    await expect(guidedRoomCard).toBeVisible();
    await expect(guidedRoomCard.getByText(/IA inativa/)).toBeVisible();
    const editGuidedRoom = guidedRoomCard.getByRole("button", { name: "Editar" });
    await editGuidedRoom.click();
    const guidedRoomPanel = page.getByRole("dialog", { name: "Editar sala guiada" });
    await expect(guidedRoomPanel.getByLabel("Título")).toBeFocused();
    for (const viewport of guidedRoomViewports) {
        await page.setViewportSize(viewport);
        await expect(guidedRoomPanel).toBeVisible();
        await expectNoHorizontalScroll(page);
    }
    await expectNoSeriousAxeFindings(page);
    await page.keyboard.press("Escape");
    await expect(guidedRoomPanel).toBeHidden();
    await expect(editGuidedRoom).toBeFocused();
    await page.setViewportSize({ width: 1280, height: 800 });
    const guidedRoomHref = await guidedRoomCard
        .getByRole("link", { name: "Abrir" })
        .getAttribute("href");
    if (!guidedRoomHref) throw new Error("Sala guiada sem link de detalhe.");

    await page.goto(`/app/professor/turmas/${classId}/projectos`);
    await expect(page.getByRole("heading", { name: "Projectos da turma", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Novo projecto" }).click();
    await page.getByLabel("Título").fill(projectTitle);
    await page
        .getByLabel("Enunciado")
        .fill("Construir uma explicacao orientada sobre energia mecanica com exemplo aplicado.");
    await page.getByLabel("Disciplina oficial (opcional)").selectOption(subjectId);
    await page.getByRole("button", { name: "Criar rascunho" }).click();
    const teacherProjectCard = page.locator("article").filter({ hasText: projectTitle });
    await expect(teacherProjectCard).toContainText("Rascunho");
    await teacherProjectCard.getByRole("button", { name: "Publicar" }).click();
    await expect(teacherProjectCard).toContainText("Publicado");

    await page.goto(`/app/professor/disciplinas/${subjectId}/testes`);
    await expect(page.getByRole("heading", { name: "Testes oficiais" })).toBeVisible();
    await page.getByLabel("Título").fill(officialTestTitle);
    await page.getByLabel("Enunciado").fill("Qual e a unidade SI de energia?");
    for (const [index, option] of ["Joule", "Newton", "Watt", "Pascal"].entries()) {
        await page
            .getByLabel(`Opção ${index + 1} da pergunta 1`)
            .fill(option);
    }
    await page
        .getByLabel("Marcar opção 1 como correta na pergunta 1")
        .check();
    await page.getByRole("button", { name: "Criar rascunho" }).click();
    const officialTestCard = page.locator("article").filter({
        hasText: officialTestTitle,
    });
    await expect(officialTestCard).toBeVisible();
    await officialTestCard.getByRole("button", { name: "Publicar" }).click();
    await expect(officialTestCard.getByText("Publicado")).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/salas-guiadas`);
    const roomToAssociate = page.locator("article").filter({ hasText: guidedRoomTitle });
    await roomToAssociate.getByRole("button", { name: "Editar" }).click();
    const associationPanel = page.getByRole("dialog", { name: "Editar sala guiada" });
    await associationPanel
        .locator("select")
        .nth(1)
        .selectOption({ label: officialTestTitle });
    await associationPanel
        .getByRole("button", { name: "Guardar alterações" })
        .click();
    await expect(associationPanel).toBeHidden();

    await page.goto(`/app/professor/disciplinas/${subjectId}/revisoes-ia`);
    await expect(page.getByRole("heading", { name: "Conteúdos aprovados", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Novo conteúdo" }).click();
    const reviewDialog = page.getByRole("dialog", { name: "Criar conteúdo docente" });
    await reviewDialog.getByLabel("Material oficial").selectOption(officialMaterial!._id);
    await reviewDialog.getByLabel("Tipo de conteúdo").selectOption("QUIZ");
    await reviewDialog.getByLabel("Enunciado").fill("Qual é a unidade SI de energia?");
    for (const [index, option] of ["Newton", "Watt", "Joule", "Pascal"].entries()) {
        await reviewDialog.getByLabel(`Opção ${index + 1}`, { exact: true }).fill(option);
    }
    await reviewDialog.getByLabel("Opção 3 correta").check();
    await reviewDialog.getByLabel("Explicação da resposta").fill("A unidade SI de energia é o joule.");
    await reviewDialog.getByRole("button", { name: "Adicionar à fila" }).click();
    const reviewCard = page.locator("article").filter({ hasText: officialMaterialTitle });
    await expect(reviewCard).toBeVisible();
    await reviewCard.getByRole("button", { name: "Rever conteúdo" }).click();
    await page.getByRole("dialog", { name: "Quiz para aprovação" }).getByRole("button", { name: "Aprovar" }).click();
    await expect(page.getByText(/disponível aos alunos/)).toBeVisible();

    await page.goto(`/app/professor/turmas/${classId}/progresso`);
    await expect(page.getByRole("heading", { name: "Resumo da turma" })).toBeVisible();
    await page.getByRole("button", { name: "Nova nota" }).click();
    await page.getByLabel("Título da nota").fill(progressNoteTitle);
    await page.getByLabel("Observações").fill("Acompanhar dificuldades no conceito de energia.");
    await page
        .getByLabel("Etiquetas", { exact: true })
        .fill("energia, unidades");
    await page.getByRole("button", { name: "Guardar nota" }).click();
    await expect(page.locator("article").filter({ hasText: progressNoteTitle })).toBeVisible();
    await expect(page.getByText("energia").first()).toBeVisible();
    await expect(page.locator("article").filter({ hasText: progressNoteTitle }).getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeVisible();

    await logout(page);

    const anonymousPdf = await page.context().request.get(
        `/api/official-materials/${officialPdf._id}/content`,
    );
    expect(anonymousPdf.status()).toBe(401);

    await loginAs(page, student);
    await grantAiConsent(page, "PROJECT_AI");
    await grantAiConsent(page, "PRIVATE_AREA_AI");
    await page.goto("/app/turmas");
    await expect(page.locator("article").filter({ hasText: className })).toBeVisible();

    await page.goto(`/app/disciplinas/${subjectId}/chat`);
    await expect(page.getByRole("heading", { name: "Conversar" })).toBeVisible();
    await expect(page.getByText("Online", { exact: true })).toBeVisible();
    await expect(page.locator("article").filter({ hasText: teacherChatMessage })).toBeVisible();
    await page.getByLabel("Mensagem").fill(studentChatMessage);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.locator("article").filter({ hasText: studentChatMessage })).toBeVisible();

    await page.goto(`/app/disciplinas/${subjectId}/materiais`);
    await expect(page.getByRole("heading", { name: "Materiais", exact: true })).toBeVisible();
    await expect(page.locator("article").filter({ hasText: officialMaterialTitle })).toBeVisible();
    const studentPdfCard = page.locator("article").filter({ hasText: officialPdfTitle });
    const studentDocxCard = page.locator("article").filter({ hasText: officialDocxTitle });
    const studentPdfActions = studentPdfCard.getByRole("group", {
        name: `Ações de ${officialPdfTitle}`,
    });
    const openPdfAction = studentPdfActions.getByRole("link", { name: "Abrir PDF" });
    await expect(studentPdfActions.getByRole("link", { name: "Consultar material" })).toBeVisible();
    await expect(openPdfAction).toBeVisible();
    await expect(studentPdfActions.getByRole("link", { name: "Descarregar" })).toBeVisible();
    const openPdfTooltip = openPdfAction.locator("[data-tooltip-side='top']");
    await openPdfAction.hover();
    await expect(openPdfTooltip).toBeVisible();
    await expect(openPdfTooltip).toHaveCSS("opacity", "1");
    await openPdfAction.focus();
    await expect(openPdfTooltip).toBeVisible();
    await expect(openPdfTooltip).toHaveCSS("opacity", "1");
    await expect(studentDocxCard.getByRole("link", { name: "Descarregar" })).toBeVisible();
    const materialAxeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    expect(
        materialAxeResults.violations.filter(
            (violation) => violation.impact === "serious" || violation.impact === "critical",
        ),
    ).toEqual([]);
    expect(
        (await page.context().request.get(
            `/api/official-materials/${officialPdf._id}/download`,
        )).status(),
    ).toBe(200);

    await page.goto(`/app/disciplinas/${subjectId}/conteudos-ia`);
    await expect(page.getByRole("heading", { name: "Praticar" })).toBeVisible();
    const approvedQuiz = page.locator("article").filter({ hasText: officialMaterialTitle });
    await approvedQuiz.getByLabel("Joule").check();
    await approvedQuiz.getByRole("button", { name: "Submeter respostas" }).click();
    await expect(approvedQuiz.getByText("A unidade SI de energia é o joule.")).toBeVisible();
    await expect(approvedQuiz.getByText(/^Resultado:.*100%/)).toBeVisible();

    await page.goto(`/app/disciplinas/${subjectId}/testes`);
    const attemptForm = page.locator("form").filter({ hasText: officialTestTitle });
    await expect(attemptForm).toBeVisible();
    for (const optionIndex of [1, 2, 0]) {
        await attemptForm.getByRole("radio").nth(optionIndex).check();
        await attemptForm.getByRole("button", { name: "Submeter respostas" }).click();
        if (optionIndex !== 0) {
            await expect(attemptForm.getByText(/As soluções completas ficam disponíveis/)).toBeVisible();
            await expect(attemptForm.getByText(/\(correta\)/)).toHaveCount(0);
            await attemptForm.getByRole("button", { name: "Preparar nova tentativa" }).click();
        }
    }
    await expect(attemptForm.getByText("Joule (correta)")).toBeVisible();
    await expect(attemptForm.getByText(/Tentativa 3:/)).toBeVisible();
    await page.getByRole("button", { name: /Notificações \([1-9]\d*\)/ }).click();
    const guidedRoomNotification = page
        .getByRole("listitem")
        .filter({ hasText: guidedRoomTitle });
    await expect(guidedRoomNotification).toBeVisible();
    await guidedRoomNotification.getByRole("link", { name: "Abrir" }).click();
    await expect(page.getByRole("heading", { name: guidedRoomTitle })).toBeVisible();
    await expect(page.getByText("Compreender o conceito de energia.")).toBeVisible();
    await expect(
        page.getByRole("link", { name: new RegExp(officialTestTitle) }),
    ).toBeVisible();
    for (const viewport of guidedRoomViewports) {
        await page.setViewportSize(viewport);
        await expectNoHorizontalScroll(page);
    }
    await expectNoSeriousAxeFindings(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByRole("button", { name: "Marcar como concluída" }).click();
    await expect(page.getByText("Concluída")).toBeVisible();

    await page.goto(`/app/turmas/${classId}/projectos`);
    await expect(page.getByRole("heading", { name: "Projetos" })).toBeVisible();
    const studentProjectCard = page.locator("article").filter({ hasText: projectTitle });
    await expect(studentProjectCard).toBeVisible();
    const studentProjectActions = studentProjectCard.getByRole("group", {
        name: `Ações de ${projectTitle}`,
    });
    await expect(studentProjectActions.getByRole("button", { name: "Marcar em curso" })).toBeVisible();
    await expect(studentProjectActions.getByRole("button", { name: "Concluir" })).toBeVisible();
    const projectPlanLink = studentProjectActions.getByRole("link", { name: "Criar plano IA" });
    const projectPlanTooltip = projectPlanLink.locator("[data-tooltip-side='top']");
    await projectPlanLink.hover();
    await expect(projectPlanTooltip).toHaveCSS("opacity", "1");
    await projectPlanLink.focus();
    await expect(projectPlanTooltip).toHaveCSS("opacity", "1");
    for (const viewport of guidedRoomViewports) {
        await page.setViewportSize(viewport);
        await expectNoHorizontalScroll(page);
    }
    await expectNoSeriousAxeFindings(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    const projectPlanHref = await projectPlanLink.getAttribute("href");
    const projectId = extractIdFromHref(projectPlanHref, /\/projectos\/([^/]+)\/plano-ia/);
    await projectPlanLink.click();
    await expect(page.getByRole("heading", { name: projectTitle })).toBeVisible();
    await page.getByLabel("Objetivo").fill("Organizar o projeto em passos simples.");
    await page.getByRole("button", { name: "Gerar plano" }).click();
    await expect(page.getByText("Plano com voz definida pelo professor")).toBeVisible();
    const projectPlanHistory = await apiGet<{
        items: Array<{ projectId: string; teacherVoiceApplied: unknown }>;
    }>(page, `/api/student/projects/${projectId}/ai-plans?limit=20`);
    expect(projectPlanHistory.items[0]?.projectId).toBe(projectId);
    expect(projectPlanHistory.items[0]?.teacherVoiceApplied).toBe(true);

    await page.goto(`/app/disciplinas/${subjectId}/contextos-materiais`);
    await expect(page.getByText(officialMaterialTitle)).toBeVisible();
    await expect(page.getByText("Disciplina oficial").first()).toBeVisible();

    await page.goto("/app/areas");
    await expect(page.getByRole("heading", { name: "Estudar", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Nova área" }).click();
    await page.getByLabel("Nome").fill(areaName);
    await page.getByLabel("Descrição").fill("Area privada criada pelo smoke MF2.");
    await page.getByRole("dialog", { name: "Criar área" }).getByRole("button", { name: "Criar área" }).click();
    const areaCard = page.locator("article").filter({ hasText: areaName });
    const areaLink = areaCard.getByRole("link", { name: "Continuar" });
    await expect(areaLink).toBeVisible();
    const areaHref = await areaLink.getAttribute("href");
    const areaId = extractIdFromHref(areaHref, /\/areas\/([^/]+)$/);

    await page.goto(`/app/areas/${areaId}/materiais`);
    await expect(page.getByRole("heading", { name: "Materiais", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Novo material" }).click();
    const privateMaterialForm = page.getByRole("dialog", { name: "Novo material" }).locator("form");
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
    await expect(page.getByRole("heading", { name: "Contextos de materiais" })).toBeVisible();
    await expect(page.getByText(privateMaterialTitle)).toBeVisible();
    await expect(page.getByText("Área privada")).toBeVisible();

    await page.goto(`/app/areas/${areaId}/ia-privada`);
    await expect(page).toHaveURL(new RegExp(`/app/assistente/novo/STUDY_AREA/${areaId}$`));
    await expect(page.getByRole("heading", { name: "Assistente de estudo" })).toBeVisible();
    await page.getByRole("button", { name: "Começar conversa" }).click();
    await page.getByLabel("Pergunta ao Assistente").fill("Explica energia potencial com base nos meus materiais.");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Resposta deterministica da IA privada para smoke E2E.")).toBeVisible();

    await logout(page);
    await loginAs(page, teacher);

    await page.goto(`/app/professor/disciplinas/${subjectId}/chat`);
    await expect(page.getByText("Online", { exact: true })).toBeVisible();
    await expect(page.locator("article").filter({ hasText: studentChatMessage })).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/testes`);
    let completedTestCard = page.locator("article").filter({
        hasText: officialTestTitle,
    });
    await completedTestCard.getByRole("button", { name: "Encerrar" }).click();
    await expect(
        page.getByRole("alert").filter({
            hasText: "Encerra primeiro as salas guiadas abertas que exigem este mini-teste.",
        }),
    ).toBeVisible();
    await expect(completedTestCard.getByText("Publicado")).toBeVisible();

    await page.goto(guidedRoomHref);
    await expect(page.getByRole("heading", { name: guidedRoomTitle })).toBeVisible();
    await expect(page.getByText(student.email, { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Concluiu", { exact: true })).toBeVisible();
    for (const viewport of guidedRoomViewports) {
        await page.setViewportSize(viewport);
        await expectNoHorizontalScroll(page);
    }
    await expectNoSeriousAxeFindings(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Encerrar" }).click();
    await expect(page.getByText("Encerrada", { exact: true })).toBeVisible();

    await page.goto(`/app/professor/disciplinas/${subjectId}/testes`);
    completedTestCard = page.locator("article").filter({ hasText: officialTestTitle });
    await completedTestCard.getByRole("button", { name: "Encerrar" }).click();
    await expect(completedTestCard.getByText("Encerrado")).toBeVisible();
    await completedTestCard.getByRole("link", { name: "Ver ranking" }).click();
    await expect(page.getByRole("heading", { name: "Ranking do mini-teste" })).toBeVisible();
    const rankingRow = page.locator("tbody tr").first();
    await expect(rankingRow).toContainText("100%");
    await expect(rankingRow).toContainText("3");

    await page.goto(`/app/professor/disciplinas/${subjectId}/revisoes-ia`);
    await page.getByLabel("Estado").selectOption("APPROVED");
    const approvedReviewCard = page.locator("article").filter({ hasText: officialMaterialTitle });
    await approvedReviewCard.getByRole("button", { name: "Rever conteúdo" }).click();
    const approvedReviewDialog = page.getByRole("dialog", { name: "Quiz para aprovação" });
    await approvedReviewDialog.getByLabel("Comentário docente").fill("Retirado após revisão adicional.");
    await approvedReviewDialog.getByRole("button", { name: "Retirar dos alunos" }).click();
    await expect(page.getByText(/retirado da área dos alunos/)).toBeVisible();

    await logout(page);
    await loginAs(page, student);
    await page.goto(`/app/disciplinas/${subjectId}/conteudos-ia`);
    await expect(page.getByText("Ainda não existem conteúdos aprovados")).toBeVisible();
    await page.goto(`/app/turmas/${classId}/salas-guiadas`);
    await page.getByRole("button", { name: "Histórico" }).click();
    const historicalRoom = page.locator("article").filter({ hasText: guidedRoomTitle });
    await expect(historicalRoom).toBeVisible();
    await historicalRoom.getByRole("link", { name: "Consultar histórico" }).click();
    await expect(page.getByText("Encerrada · consulta")).toBeVisible();
    await expect(page.getByRole("button", { name: "Marcar como concluída" })).toHaveCount(0);
});
