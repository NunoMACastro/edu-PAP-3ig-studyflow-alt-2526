import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { logoutFromShell } from "./authenticated-shell.js";

const student = {
    // Conta dedicada a este percurso para que os testes de outros módulos não
    // consumam a quota USER que este cenário pretende validar.
    email: process.env.STUDYFLOW_E2E_ASSISTANT_STUDENT_EMAIL ?? "ines.silva@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

type AssistantContext = {
    kind: "STUDY_AREA";
    id: string;
    label: string;
    targetPath: string;
};

test.setTimeout(120_000);

/** Autentica o aluno pela UI para validar a sessão real em cookie HttpOnly. */
async function loginAsStudent(
    page: Page,
    account: { email: string; password: string } = student,
): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: `Conta: ${account.email}` })).toBeVisible();
}

/** Executa um pedido autenticado e validado através da origem da aplicação. */
async function apiRequest<T>(
    page: Page,
    method: "DELETE" | "GET" | "POST" | "PUT",
    path: string,
    body?: Record<string, unknown>,
): Promise<T> {
    return page.evaluate(async ({ requestMethod, requestPath, requestBody }) => {
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
            throw new Error(
                typeof payload.message === "string"
                    ? payload.message
                    : `${requestMethod} ${requestPath} devolveu HTTP ${response.status}.`,
            );
        }
        return payload;
    }, { requestMethod: method, requestPath: path, requestBody: body }) as Promise<T>;
}

/** Confirma o gate de acessibilidade definido para as superfícies principais. */
async function expectNoSeriousAxeFindings(page: Page): Promise<void> {
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(
        result.violations.filter(
            (violation) => violation.impact === "serious" || violation.impact === "critical",
        ),
    ).toEqual([]);
}

test("Assistente global cria, responde e retoma a mesma conversa contextual", async ({ page }) => {
    await loginAsStudent(page);
    await apiRequest(page, "PUT", "/api/ai-consents/PRIVATE_AREA_AI", {
        policyVersion: "2026-07-09",
    });
    await apiRequest(page, "PUT", "/api/ai-consents/STUDY_TOOL", {
        policyVersion: "2026-07-09",
    });
    const contexts = await apiRequest<{ items: AssistantContext[] }>(
        page,
        "GET",
        "/api/student/assistant/contexts?limit=50",
    );
    const context = contexts.items.find((item) => item.kind === "STUDY_AREA");
    expect(context).toBeTruthy();

    await page.goto("/app/hoje");
    const launcher = page.getByRole("button", { name: "Abrir Assistente de estudo" });
    await launcher.click();
    const activeLauncher = page.getByRole("button", { name: "Fechar Assistente de estudo" });
    await expect(activeLauncher).toBeVisible();
    await expect(activeLauncher).toHaveAttribute("aria-expanded", "true");
    await expect(activeLauncher).toContainText("Assistente ativo");
    const dialog = page.getByRole("dialog", { name: "Assistente de estudo" });
    await expect(dialog.getByRole("heading", { name: "Onde queres estudar?" })).toBeVisible();
    await dialog
        .getByRole("button", { name: new RegExp(context!.label, "i") })
        .filter({ hasText: "Estudo pessoal" })
        .click();

    const question = `Explica este tema com um exemplo simples ${Date.now()}.`;
    await dialog.getByLabel("Pergunta ao Assistente").fill(question);
    const replyResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === "POST" &&
            /\/api\/student\/assistant\/conversations\/[a-f0-9]{24}\/messages$/.test(
                new URL(response.url()).pathname,
            ),
    );
    await dialog.getByRole("button", { name: "Enviar" }).click();
    const replyResponse = await replyResponsePromise;
    expect(replyResponse.ok()).toBe(true);
    const askedConversationId = new URL(replyResponse.url()).pathname.match(
        /\/conversations\/([a-f0-9]{24})\/messages$/,
    )?.[1];
    expect(askedConversationId).toBeTruthy();
    await expect(dialog.getByText("A preparar resposta...")).toBeVisible();
    await expect(
        dialog.getByLabel("Mensagens da conversa").getByText(question, { exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText("A preparar resposta...")).toHaveCount(0);
    const createMaterialButton = dialog.getByRole("button", {
        name: "Criar material de estudo",
    });
    await expect(createMaterialButton).toBeVisible();
    expect(
        await createMaterialButton.evaluate((button, messageRegion) =>
            messageRegion instanceof HTMLElement && messageRegion.contains(button),
        await dialog.getByLabel("Mensagens da conversa").elementHandle()),
    ).toBe(false);
    await expectNoSeriousAxeFindings(page);

    const fullPageLink = dialog.getByRole("link", { name: "Abrir página" });
    const fullPageHref = await fullPageLink.getAttribute("href");
    const drawerConversationId = fullPageHref?.match(/\/app\/assistente\/([a-f0-9]{24})$/)?.[1];
    expect(drawerConversationId).toBeTruthy();
    expect(drawerConversationId).toBe(askedConversationId);
    const drawerConversation = await apiRequest<{ id: string; title: string; status: string }>(
        page,
        "GET",
        `/api/student/assistant/conversations/${drawerConversationId}`,
    );
    expect(drawerConversation).toMatchObject({ title: question, status: "ACTIVE" });
    const activeConversations = await apiRequest<{
        items: Array<{ id: string; title: string }>;
    }>(
        page,
        "GET",
        `/api/student/assistant/conversations?contextKind=STUDY_AREA&contextId=${context!.id}&limit=50`,
    );
    expect(activeConversations.items.map((item) => item.title)).toContain(question);
    const persistedConversation = activeConversations.items.find(
        (item) => item.title === question,
    )!;
    await expect(fullPageLink).toHaveAttribute(
        "href",
        `/app/assistente/${persistedConversation.id}`,
    );
    await fullPageLink.click();
    await expect(page).toHaveURL(/\/app\/assistente\/[a-f0-9]{24}$/);
    const fullPageConversationId = page.url().match(/\/app\/assistente\/([a-f0-9]{24})$/)?.[1];
    expect(fullPageConversationId).toBeTruthy();
    const persistedMessages = await apiRequest<{ items: Array<{ question: string }> }>(
        page,
        "GET",
        `/api/student/assistant/conversations/${fullPageConversationId}/messages`,
    );
    expect(persistedMessages.items.some((item) => item.question === question)).toBe(true);
    await expect(
        page.getByLabel("Mensagens da conversa").getByText(question, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Criar material de estudo" }).click();
    const artifactPanel = page.getByRole("dialog", {
        name: "Criar material de estudo",
    });
    await artifactPanel.getByLabel("Tipo de material").selectOption("FLASHCARDS");
    const artifactTopic = `Revisão assistida ${Date.now()}`;
    await artifactPanel.getByLabel("Tópico opcional").fill(artifactTopic);
    const artifactResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === "POST" &&
            /\/api\/student\/assistant\/conversations\/[a-f0-9]{24}\/artifacts$/.test(
                new URL(response.url()).pathname,
            ),
    );
    await artifactPanel.getByRole("button", { name: "Criar material" }).click();
    expect((await artifactResponsePromise).status()).toBe(201);
    await expect(artifactPanel).toHaveCount(0);
    const artifactLink = page.getByRole("link", { name: "Abrir material" }).last();
    await expect(artifactLink).toHaveAttribute(
        "href",
        /\/app\/estudar\/materiais\/[a-f0-9]{24}$/,
    );
    await artifactLink.click();
    await expect(page).toHaveURL(
        /\/app\/estudar\/materiais\/[a-f0-9]{24}$/,
    );
    await page.goto(`/app/assistente/${fullPageConversationId}`);
    await expect(page.getByRole("button", { name: "Abrir Assistente de estudo" })).toHaveCount(0);
    await expectNoSeriousAxeFindings(page);

    await page.goto(context!.targetPath);
    await launcher.click();
    await expect(
        page
            .getByRole("dialog", { name: "Assistente de estudo" })
            .getByLabel("Mensagens da conversa")
            .getByText(question, { exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(launcher).toBeFocused();
});

test("Assistente mobile abre como modal, respeita o viewport e restitui o foco", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await loginAsStudent(page);
    await page.goto("/app/hoje");

    const launcher = page.getByRole("button", { name: "Abrir Assistente de estudo" });
    await launcher.click();
    const dialog = page.getByRole("dialog", { name: "Assistente de estudo" });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(launcher).toHaveCount(0);
    expect(
        await dialog.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.left >= 0 && bounds.right <= window.innerWidth && bounds.bottom <= window.innerHeight;
        }),
    ).toBe(true);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ),
    ).toBe(false);
    await expectNoSeriousAxeFindings(page);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(launcher).toBeFocused();
});

test("fork completo copia sala e grupo, permite repartilhar e sobrevive à origem", async ({ page }, testInfo) => {
    const password = student.password;
    const flows = [
        {
            kind: "STUDY_GROUP" as const,
            sourceEmail: "aluno.dev@studyflow.local",
        },
        {
            kind: "STUDY_ROOM" as const,
            sourceEmail: "aluno.dev@studyflow.local",
        },
    ];

    for (const [flowIndex, flow] of flows.entries()) {
        await loginAsStudent(page, { email: flow.sourceEmail, password });
        const conversations = await apiRequest<{
            items: Array<{ id: string; context: { id: string } }>;
        }>(
            page,
            "GET",
            `/api/student/assistant/conversations?contextKind=${flow.kind}&status=ACTIVE&limit=50`,
        );
        const conversation = conversations.items[0];
        expect(conversation).toBeTruthy();
        const originalMessages = await apiRequest<{
            items: Array<{ question: string }>;
        }>(page, "GET", `/api/student/assistant/conversations/${conversation.id}/messages?limit=50`);
        const inheritedQuestion = originalMessages.items[0]?.question;
        if (!inheritedQuestion) throw new Error(`Fixture ${flow.kind} sem turnos.`);
        const excludedQuestion = `Posterior ${flow.kind} ${Date.now()} ${flowIndex}`;
        const recipients = await apiRequest<{
            items: Array<{ id: string; email: string }>;
        }>(
            page,
            "GET",
            `/api/student/assistant/conversations/${conversation.id}/fork-recipients?limit=50`,
        );
        expect(recipients.items.length).toBeGreaterThanOrEqual(2);
        const recipient = recipients.items[0];
        const invitation = await apiRequest<{ id: string; conversationTitle: string }>(
            page,
            "POST",
            `/api/student/assistant/conversations/${conversation.id}/fork-invitations`,
            { recipientId: recipient.id },
        );

        await logoutFromShell(page);
        await loginAsStudent(page, { email: recipient.email, password });
        await page.goto("/app/assistente");
        const invite = page.getByRole("listitem").filter({
            hasText: invitation.conversationTitle,
        });
        await expect(invite).toBeVisible();
        await invite.getByRole("button", { name: "Aceitar" }).click();
        await expect(page).toHaveURL(/\/app\/assistente\/[a-f0-9]{24}$/);
        const forkId = page.url().match(/\/app\/assistente\/([a-f0-9]{24})$/)?.[1];
        expect(forkId).toBeTruthy();
        await expect(page.getByText("Fork recebido").first()).toBeVisible();
        await expect(page.getByText("Pergunta herdada")).toBeVisible();
        await expect(page.getByText(inheritedQuestion, { exact: true })).toBeVisible();
        await expect(page.getByText(excludedQuestion, { exact: true })).toHaveCount(0);

        const continuation = `Continuação privada ${flow.kind} ${Date.now()}`;
        const messages = await apiRequest<{
            items: Array<{ question: string; inherited: boolean }>;
        }>(page, "GET", `/api/student/assistant/conversations/${forkId}/messages?limit=50`);
        expect(messages.items.some((item) => item.question === inheritedQuestion && item.inherited)).toBe(true);
        expect(messages.items.some((item) => item.question === continuation)).toBe(false);
        expect(messages.items.some((item) => item.question === excludedQuestion)).toBe(false);
        await expectNoSeriousAxeFindings(page);

        if (flow.kind === "STUDY_GROUP") {
            const nextRecipients = await apiRequest<{
                items: Array<{ id: string; email: string }>;
            }>(page, "GET", `/api/student/assistant/conversations/${forkId}/fork-recipients?limit=50`);
            const nextRecipient = nextRecipients.items.find((item) => item.email !== flow.sourceEmail);
            expect(nextRecipient).toBeTruthy();
            await apiRequest(
                page,
                "POST",
                `/api/student/assistant/conversations/${forkId}/fork-invitations`,
                { recipientId: nextRecipient!.id },
            );
            await logoutFromShell(page);
            await loginAsStudent(page, { email: nextRecipient!.email, password });
            const received = await apiRequest<{
                items: Array<{ id: string; conversationTitle: string }>;
            }>(page, "GET", "/api/student/assistant/fork-invitations?direction=received&limit=50");
            const refork = received.items.find((item) => item.conversationTitle.startsWith("Fork —"));
            expect(refork).toBeTruthy();
            const accepted = await apiRequest<{ id: string; origin: string }>(
                page,
                "POST",
                `/api/student/assistant/fork-invitations/${refork!.id}/accept`,
            );
            expect(accepted.origin).toBe("FORK");
            const inheritedAgain = await apiRequest<{
                items: Array<{ question: string; inherited: boolean }>;
            }>(page, "GET", `/api/student/assistant/conversations/${accepted.id}/messages?limit=50`);
            expect(inheritedAgain.items.every((item) => item.inherited)).toBe(true);
            expect(inheritedAgain.items.map((item) => item.question)).toEqual([
                inheritedQuestion,
            ]);

            if (testInfo.project.name === "webkit-critical") {
                await logoutFromShell(page);
                await loginAsStudent(page, { email: flow.sourceEmail, password });
                await apiRequest(
                    page,
                    "DELETE",
                    `/api/student/assistant/conversations/${conversation.id}`,
                );
                await logoutFromShell(page);
                await loginAsStudent(page, { email: recipient.email, password });
                const survivingFork = await apiRequest<{ id: string; origin: string }>(
                    page,
                    "GET",
                    `/api/student/assistant/conversations/${forkId}`,
                );
                expect(survivingFork).toMatchObject({ id: forkId, origin: "FORK" });
            }
        }

        await logoutFromShell(page);
    }
});

test("painel de fork respeita viewports, teclado, foco e Axe", async ({ page }) => {
    await loginAsStudent(page, {
        email: "aluno.dev@studyflow.local",
        password: student.password,
    });
    const conversations = await apiRequest<{
        items: Array<{ id: string }>;
    }>(
        page,
        "GET",
        "/api/student/assistant/conversations?contextKind=STUDY_ROOM&status=ACTIVE&limit=50",
    );
    const conversation = conversations.items[0];
    expect(conversation).toBeTruthy();

    for (const viewport of [
        { width: 320, height: 720 },
        { width: 375, height: 812 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
    ]) {
        await page.setViewportSize(viewport);
        await page.goto(`/app/assistente/${conversation.id}`);
        const trigger = page.getByRole("button", { name: "Mais ações" });
        await trigger.click();
        await page.getByRole("button", { name: "Partilhar conversa" }).click();
        const dialog = page.getByRole("dialog", { name: "Partilhar conversa" });
        await expect(dialog).toBeVisible();
        await expect.poll(() => dialog.evaluate((element) =>
            element.getBoundingClientRect().right - window.innerWidth)).toBeLessThanOrEqual(1);
        const bounds = await dialog.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return {
                bottom: bounds.bottom,
                left: bounds.left,
                right: bounds.right,
                viewportHeight: window.innerHeight,
                viewportWidth: window.innerWidth,
            };
        });
        expect(bounds.left, JSON.stringify({ viewport, bounds })).toBeGreaterThanOrEqual(-1);
        expect(bounds.right, JSON.stringify({ viewport, bounds })).toBeLessThanOrEqual(bounds.viewportWidth + 1);
        expect(bounds.bottom, JSON.stringify({ viewport, bounds })).toBeLessThanOrEqual(bounds.viewportHeight + 1);
        expect(await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        )).toBe(true);
        await expectNoSeriousAxeFindings(page);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
    }
});

test("materiais privados transversais respeitam arquivo, destinos, viewports e Axe", async ({ page }) => {
    await loginAsStudent(page, {
        email: "aluno.dev@studyflow.local",
        password: student.password,
    });
    const conversations = await apiRequest<{
        items: Array<{ id: string }>;
    }>(
        page,
        "GET",
        "/api/student/assistant/conversations?contextKind=STUDY_ROOM&status=ACTIVE&limit=50",
    );
    const conversation = conversations.items[0];
    expect(conversation).toBeTruthy();

    for (const viewport of [
        { width: 320, height: 720 },
        { width: 375, height: 812 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
    ]) {
        await page.setViewportSize(viewport);
        await page.goto("/app/estudar/materiais");
        await expect(
            page.getByRole("heading", { level: 1, name: "Materiais de estudo" }),
        ).toBeVisible();
        await expect(page.getByText("Estes materiais são privados.", { exact: false })).toBeVisible();
        await expect(
            page.getByRole("region", { name: "Materiais privados" }).getByRole("article"),
        ).not.toHaveCount(0);
        expect(await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        )).toBe(true);
        await expectNoSeriousAxeFindings(page);

        await page.goto(`/app/assistente/${conversation.id}`);
        const trigger = page.getByRole("button", { name: "Criar material de estudo" });
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: "Criar material de estudo" });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText("O material fica privado na tua conta.", { exact: false })).toBeVisible();
        await expect(dialog.getByRole("radio")).not.toHaveCount(0);
        expect(await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        )).toBe(true);
        await expectNoSeriousAxeFindings(page);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
    }
});
