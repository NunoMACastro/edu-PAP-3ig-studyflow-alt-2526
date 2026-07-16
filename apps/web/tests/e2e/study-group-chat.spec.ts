/** Cenário crítico multi-contexto do chat em tempo real de grupos de estudo. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectAuthenticatedShell } from "./authenticated-shell.js";

const accounts = {
    owner: {
        email: requiredEnvironment("STUDYFLOW_E2E_STUDENT_EMAIL"),
        displayName: requiredEnvironment("STUDYFLOW_E2E_STUDENT_DISPLAY_NAME"),
        password: requiredEnvironment("STUDYFLOW_E2E_STUDENT_PASSWORD"),
    },
    member: {
        email: requiredEnvironment("STUDYFLOW_E2E_SECOND_STUDENT_EMAIL"),
        displayName: requiredEnvironment("STUDYFLOW_E2E_SECOND_STUDENT_DISPLAY_NAME"),
        password: requiredEnvironment("STUDYFLOW_E2E_STUDENT_PASSWORD"),
    },
    outsider: {
        email: requiredEnvironment("STUDYFLOW_E2E_THIRD_STUDENT_EMAIL"),
        displayName: requiredEnvironment("STUDYFLOW_E2E_THIRD_STUDENT_DISPLAY_NAME"),
        password: requiredEnvironment("STUDYFLOW_E2E_STUDENT_PASSWORD"),
    },
};

/** Lê apenas as identidades preparadas a partir do input privado pelo runner. */
function requiredEnvironment(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} não foi definida pelo runner E2E.`);
    return value;
}

test("chat de grupo: dois membros, unread, notas isoladas e outsider recusado", async ({ browser }) => {
    const ownerContext = await browser.newContext();
    const memberContext = await browser.newContext();
    const outsiderContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    const memberPage = await memberContext.newPage();
    const outsiderPage = await outsiderContext.newPage();
    try {
        await Promise.all([
            login(ownerPage, accounts.owner),
            login(memberPage, accounts.member),
            login(outsiderPage, accounts.outsider),
        ]);
        const groupName = `Grupo chat ${Date.now().toString(36)}`;
        await ownerPage.goto("/app/em-grupo?vista=grupos");
        await ownerPage.getByRole("button", { name: "Novo grupo" }).click();
        const createPanel = ownerPage.getByRole("dialog", { name: "Novo grupo" });
        await createPanel.getByLabel("Nome").fill(groupName);
        await createPanel.getByLabel("Descrição").fill("Validação multi-contexto do chat em tempo real.");
        await createPanel.getByRole("button", { name: "Criar grupo" }).click();
        const card = ownerPage.locator("article").filter({ hasText: groupName });
        await card.getByRole("link", { name: "Abrir grupo" }).click();
        const groupId = ownerPage.url().match(/\/app\/grupos\/([a-f0-9]{24})/)?.[1];
        expect(groupId).toMatch(/^[a-f0-9]{24}$/);

        await ownerPage.getByRole("button", { name: "Adicionar membro" }).click();
        const memberPanel = ownerPage.getByRole("dialog", { name: "Adicionar membro" });
        await memberPanel.getByLabel("Email do aluno").fill(accounts.member.email);
        await memberPanel.getByRole("button", { name: "Adicionar", exact: true }).click();
        await expect(memberPanel).toBeHidden();

        await memberPage.goto(`/app/grupos/${groupId}/mensagens`);
        await expect(ownerPage.getByText("Online", { exact: true })).toBeVisible();
        await expect(memberPage.getByText("Online", { exact: true })).toBeVisible();
        await ownerPage.getByLabel("Mensagem").fill("Olá Inês, recebeste?");
        await ownerPage.getByRole("button", { name: "Enviar" }).click();
        await expect(memberPage.getByText("Olá Inês, recebeste?")).toBeVisible();
        await expect(memberPage.getByText(accounts.owner.displayName, { exact: true })).toBeVisible();

        await memberPage.getByLabel("Mensagem").fill("Recebi sem atualizar.");
        await memberPage.getByRole("button", { name: "Enviar" }).click();
        await expect(ownerPage.getByText("Recebi sem atualizar.")).toBeVisible();
        await expect(ownerPage.getByText(accounts.member.displayName, { exact: true })).toBeVisible();

        await memberPage.getByRole("link", { name: "Notas" }).click();
        await ownerPage.getByLabel("Mensagem").fill("Mensagem para unread");
        await ownerPage.getByRole("button", { name: "Enviar" }).click();
        await memberPage.goto("/app/em-grupo?vista=grupos");
        const memberCard = memberPage.locator("article").filter({ hasText: groupName });
        await expect(memberCard.getByText("1 por ler")).toBeVisible();
        await memberCard.getByRole("link", { name: "Abrir grupo" }).click();
        await expect(memberPage.getByText("Mensagem para unread")).toBeVisible();
        await expect.poll(async () => {
            const response = await memberContext.request.get("/api/student/study-group-chat/unread");
            const unread = await response.json() as Array<{ groupId: string; unreadCount: number }>;
            return unread.find((item) => item.groupId === groupId)?.unreadCount ?? 0;
        }).toBe(0);

        await memberPage.getByRole("link", { name: "Notas" }).click();
        await memberPage.getByLabel("Nova nota").fill("Nota apenas no fluxo REST");
        await memberPage.getByRole("button", { name: "Guardar nota" }).click();
        await expect(memberPage.getByText("Nota apenas no fluxo REST")).toBeVisible();
        await expect(ownerPage.getByText("Nota apenas no fluxo REST")).toHaveCount(0);
        await ownerPage.getByRole("link", { name: "Notas" }).click();
        await expect(ownerPage.getByText("Nota apenas no fluxo REST")).toBeVisible();

        await outsiderPage.goto(`/app/grupos/${groupId}/mensagens`);
        await expect(outsiderPage.getByText("Grupo não encontrado.")).toBeVisible();
        await expect(outsiderPage.getByText("Conversa em tempo real")).toHaveCount(0);

        await validateResponsiveChat(memberPage, `/app/grupos/${groupId}/mensagens`);
        const axeResults = await new AxeBuilder({ page: memberPage })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();
        expect(axeResults.violations.filter((violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        )).toEqual([]);
    } finally {
        await Promise.all([ownerContext.close(), memberContext.close(), outsiderContext.close()]);
    }
});

/** Entra pela UI e preserva cookies HttpOnly em cada contexto independente. */
async function login(page: Page, account: { email: string; password: string }) {
    await page.goto("/login");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

/** Valida viewports exigidos e ausência de scroll horizontal no estado populado. */
async function validateResponsiveChat(page: Page, url: string) {
    for (const viewport of [
        { width: 320, height: 720 },
        { width: 375, height: 812 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
    ]) {
        await page.setViewportSize(viewport);
        await page.goto(url);
        await expect(page.getByRole("heading", { name: "Conversa em tempo real" })).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
        await page.getByLabel("Mensagem").focus();
        await expect(page.getByLabel("Mensagem")).toBeFocused();
    }
}
