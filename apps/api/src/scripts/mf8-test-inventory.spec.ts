// apps/api/src/scripts/mf8-test-inventory.spec.ts
import {
    checkTestCoverage,
    findMissingCriticalTests,
    renderInventoryMarkdown,
    type CriticalTestTarget,
    type TestInventorySummary,
} from "./mf8-test-inventory";

const targets: CriticalTestTarget[] = [
    {
        area: "api",
        module: "Módulo coberto",
        sourcePath: "apps/api/src/modules/covered/covered.service.ts",
        expectedSpecPath: "apps/api/src/modules/covered/covered.service.spec.ts",
        priority: "P0",
        reason: "Prova o estado coberto.",
    },
    {
        area: "api",
        module: "Módulo sem teste",
        sourcePath: "apps/api/src/modules/missing/missing.service.ts",
        expectedSpecPath: "apps/api/src/modules/missing/missing.service.spec.ts",
        priority: "P0",
        reason: "Prova a deteção de teste em falta.",
    },
    {
        area: "web-e2e",
        module: "Fluxo sem ficheiro base",
        sourcePath: "apps/web/src/pages/missing/MissingPage.tsx",
        expectedSpecPath: "apps/web/tests/e2e/missing-page.spec.ts",
        priority: "P1",
        reason: "Prova a deteção de ficheiro base em falta.",
    },
];

describe("mf8-test-inventory", () => {
    it("classifica alvos cobertos, sem teste e sem ficheiro base", () => {
        const existingFiles = new Set([
            "apps/api/src/modules/covered/covered.service.ts",
            "apps/api/src/modules/covered/covered.service.spec.ts",
            "apps/api/src/modules/missing/missing.service.ts",
        ]);

        const result = checkTestCoverage(targets, existingFiles);

        // O teste usa os três estados para garantir que a evidence não mistura causas diferentes.
        expect(result).toEqual([
            expect.objectContaining({
                module: "Módulo coberto",
                status: "covered",
            }),
            expect.objectContaining({
                module: "Módulo sem teste",
                status: "missing-spec",
            }),
            expect.objectContaining({
                module: "Fluxo sem ficheiro base",
                status: "missing-source",
            }),
        ]);
    });

    it("devolve apenas alvos com ficheiro base e teste em falta", () => {
        const existingFiles = new Set([
            "apps/api/src/modules/covered/covered.service.ts",
            "apps/api/src/modules/covered/covered.service.spec.ts",
            "apps/api/src/modules/missing/missing.service.ts",
        ]);

        const missing = findMissingCriticalTests(targets, existingFiles);

        expect(missing).toEqual([
            expect.objectContaining({
                module: "Módulo sem teste",
                expectedSpecPath: "apps/api/src/modules/missing/missing.service.spec.ts",
            }),
        ]);
    });

    it("gera Markdown determinístico para evidence", () => {
        const summary: TestInventorySummary = {
            generatedAt: "2026-07-02T00:00:00.000Z",
            checkedRoot: "/repo",
            totalTargets: 1,
            coveredTargets: 0,
            missingSpecs: 1,
            missingSources: 0,
            items: [
                {
                    ...targets[1],
                    sourceExists: true,
                    specExists: false,
                    status: "missing-spec",
                },
            ],
        };

        const markdown = renderInventoryMarkdown(summary);

        // A evidence precisa de campos estáveis para ser comparável entre PR, defesa e BK-MF8-16.
        expect(markdown).toContain("# TESTES-EM-FALTA - MF8");
        expect(markdown).toContain("| P0 | api | Módulo sem teste | missing-spec |");
        expect(markdown).toContain("Não avances para a execução final");
    });
});