import { expect, type Page } from "@playwright/test";

/** Aguarda pela shell autenticada de aluno ou de staff sem acoplar o teste ao chrome do papel. */
export async function expectAuthenticatedShell(page: Page): Promise<void> {
    const account = page.getByRole("button", { name: /^Conta:/ });
    const staffLogout = page.getByRole("button", { name: "Sair" });
    await expect(account.or(staffLogout)).toBeVisible();
}

/** Termina sessão através do menu de conta do aluno ou do botão direto de staff. */
export async function logoutFromShell(page: Page): Promise<void> {
    const account = page.getByRole("button", { name: /^Conta:/ });
    if (await account.isVisible().catch(() => false)) {
        await account.click();
        await page.getByRole("menuitem", { name: "Sair" }).click();
        return;
    }
    await page.getByRole("button", { name: "Sair" }).click();
}

/** Fecha uma eventual sessão existente antes de iniciar um cenário isolado. */
export async function logoutIfAuthenticated(page: Page): Promise<void> {
    const account = page.getByRole("button", { name: /^Conta:/ });
    const staffLogout = page.getByRole("button", { name: "Sair" });
    if (await account.isVisible().catch(() => false) || await staffLogout.isVisible().catch(() => false)) {
        await logoutFromShell(page);
    }
}
