import {
    checkTestCoverage,
    findMissingCriticalTests,
    renderInventoryMarkdown,
    type CriticalTestTarget,
    type TestInventorySummary,
} from "./mf8-test-inventory.js";
import {
    assertLegacyMf8EvidenceOptIn,
    legacyMf8EvidencePath,
} from "./legacy-mf8-evidence.js";

const targets: CriticalTestTarget[] = [
    {
        area: "api",
        module: "Modulo coberto",
        sourcePath: "real_dev/api/src/modules/covered/covered.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/covered/covered.service.spec.ts",
        priority: "P0",
        reason: "Prova o estado coberto.",
    },
    {
        area: "api",
        module: "Modulo sem teste",
        sourcePath: "real_dev/api/src/modules/missing/missing.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/missing/missing.service.spec.ts",
        priority: "P0",
        reason: "Prova a detecao de teste em falta.",
    },
    {
        area: "web-e2e",
        module: "Fluxo sem ficheiro base",
        sourcePath: "real_dev/web/src/pages/missing/MissingPage.tsx",
        expectedSpecPath: "real_dev/web/tests/e2e/missing-page.spec.ts",
        priority: "P1",
        reason: "Prova a detecao de ficheiro base em falta.",
    },
];

describe("mf8-test-inventory", () => {
    it("classifica alvos cobertos, sem teste e sem ficheiro base", () => {
        const existingFiles = new Set([
            "real_dev/api/src/modules/covered/covered.service.ts",
            "real_dev/api/src/modules/covered/covered.service.spec.ts",
            "real_dev/api/src/modules/missing/missing.service.ts",
        ]);

        const result = checkTestCoverage(targets, existingFiles);

        // Os tres estados sao distintos para evitar evidence ambigua no fecho da MF8.
        expect(result).toEqual([
            expect.objectContaining({
                module: "Modulo coberto",
                status: "covered",
            }),
            expect.objectContaining({
                module: "Modulo sem teste",
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
            "real_dev/api/src/modules/covered/covered.service.ts",
            "real_dev/api/src/modules/covered/covered.service.spec.ts",
            "real_dev/api/src/modules/missing/missing.service.ts",
        ]);

        const missing = findMissingCriticalTests(targets, existingFiles);

        expect(missing).toEqual([
            expect.objectContaining({
                module: "Modulo sem teste",
                expectedSpecPath: "real_dev/api/src/modules/missing/missing.service.spec.ts",
            }),
        ]);
    });

    it("gera Markdown deterministico para evidence", () => {
        const summary: TestInventorySummary = {
            generatedAt: "2026-07-02T00:00:00.000Z",
            checkedRoot: "real_dev",
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

        // O BK-MF8-16 precisa de campos estaveis para decidir se pode executar a bateria final.
        expect(markdown).toContain("# TESTES-EM-FALTA - MF8 (historico)");
        expect(markdown).toContain("authoritative_for_release: false");
        expect(markdown).toContain("| P0 | api | Modulo sem teste | missing-spec |");
        expect(markdown).toContain("Snapshot historico com lacunas");
        expect(markdown).not.toContain("evidence pronta");
    });

    it("exige opt-in e fixa os outputs na arvore historica", () => {
        expect(() => assertLegacyMf8EvidenceOptIn({})).toThrow(
            "STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE=true",
        );
        expect(() =>
            assertLegacyMf8EvidenceOptIn({
                STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE: "true",
            }),
        ).not.toThrow();
        expect(legacyMf8EvidencePath("TESTES-FINAIS.md")).toBe(
            "docs/evidence/MF8/historico/gerado/TESTES-FINAIS.md",
        );
        expect(() => legacyMf8EvidencePath("../TESTES-FINAIS.md")).toThrow(
            "Nome de evidence MF8 historica invalido",
        );
    });
});
