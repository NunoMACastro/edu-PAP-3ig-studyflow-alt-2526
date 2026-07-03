import { normalizePublicCitation } from "./citation-policy.js";

describe("normalizePublicCitation", () => {
    it("normaliza campos publicos e limita o excerto", () => {
        const result = normalizePublicCitation({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: " PDF de Matematica ",
            locator: " pagina 2 ",
            excerpt: "x".repeat(500),
        });

        // O caminho principal prova rastreabilidade sem devolver a pagina inteira.
        expect(result).toEqual({
            sourceJobId: "job-1",
            materialId: "mat-1",
            sourceLabel: "PDF de Matematica",
            locator: "pagina 2",
            excerpt: "x".repeat(420),
        });
    });

    it("recusa citacao sem nome de fonte", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: " ",
                locator: "pagina 2",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citacao precisa de nome de fonte.");
    });

    it("recusa citacao sem localizacao verificavel", () => {
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matematica",
                locator: "",
                excerpt: "Limites laterais",
            }),
        ).toThrow("A citacao precisa de pagina, seccao ou chunk.");
    });

    it("recusa citacao sem excerto verificavel", () => {
        // Sem excerto verificavel, a UI nao consegue mostrar ao aluno de onde veio a resposta.
        expect(() =>
            normalizePublicCitation({
                sourceJobId: "job-1",
                materialId: "mat-1",
                sourceLabel: "PDF de Matematica",
                locator: "pagina 2",
                excerpt: " ",
            }),
        ).toThrow("A citacao precisa de excerto verificavel.");
    });
});
