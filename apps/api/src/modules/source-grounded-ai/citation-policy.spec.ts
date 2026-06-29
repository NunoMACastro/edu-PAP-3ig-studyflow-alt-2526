// apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts
import { normalizePublicCitation } from "./citation-policy.js";

describe("normalizePublicCitation", () => {
    it("normaliza campos públicos e limita o excerto", () => {
        const result = normalizePublicCitation({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: " PDF de Matemática ",
            locator: " página 2 ",
            excerpt: "x".repeat(500),
        });

        // O caminho principal prova rastreabilidade sem devolver a página inteira.
        expect(result).toEqual({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: "PDF de Matemática",
            locator: "página 2",
            excerpt: "x".repeat(420),
        });
    });

    it("recusa citação sem nome de fonte", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: " ",
                locator: "página 2",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de nome de fonte.");
    });

    it("recusa citação sem localização verificável", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citação precisa de página, secção ou chunk.");
    });

    it("recusa citação sem excerto verificável", () => {
        // Sem excerto verificável, a UI não consegue mostrar ao aluno de onde veio a resposta.
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matemática",
                locator: "página 2",
                excerpt: " ",
            }),
        ).toThrow("A citação precisa de excerto verificável.");
    });
});