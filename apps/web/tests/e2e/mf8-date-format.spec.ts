/**
 * Valida o contrato RNF43 sem depender de API, sessão ou dados reais do aluno.
 */
import { expect, test } from "@playwright/test";
import { formatDatePt } from "../../src/lib/format-date-pt.js";

test("MF8 datas: formata datas visíveis em dd/mm/aaaa", async ({ page }) => {
    const formatted = formatDatePt("2026-01-01T10:00:00.000Z");

    expect(formatted).toBe("01/01/2026");
    expect(formatDatePt("data-invalida")).toBe("Data inválida");
    expect(formatDatePt(undefined)).toBe("Data indisponível");

    await page.setContent(`
        <main>
            <p data-testid="study-date">${formatted}</p>
        </main>
    `);

    // A prova visual usa o mesmo texto que o utilizador vê na interface.
    await expect(page.getByTestId("study-date")).toHaveText("01/01/2026");
});
