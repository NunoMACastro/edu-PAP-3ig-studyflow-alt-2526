// apps/api/src/common/text/pt-text-normalization.spec.ts
import { normalizePortugueseStudyText } from "./pt-text-normalization.js";

describe("normalizePortugueseStudyText", () => {
    it("preserva acentos e cedilhas em NFC", () => {
        const result = normalizePortugueseStudyText("  func\u0327a\u0303o quadrática  ");

        expect(result).toEqual({
            text: "função quadrática",
            hasReadableContent: true,
        });
    });

    it("normaliza espaços e quebras de linha sem apagar parágrafos", () => {
        const result = normalizePortugueseStudyText("Linha  1\r\n\r\n\r\nLinha\t2");

        // Duas quebras mantêm parágrafos úteis para chunks e exportação futura.
        expect(result.text).toBe("Linha 1\n\nLinha 2");
        expect(result.hasReadableContent).toBe(true);
    });

    it("rejeita texto vazio ou com caracteres de substituição", () => {
        expect(normalizePortugueseStudyText("   ").hasReadableContent).toBe(false);
        expect(normalizePortugueseStudyText("���").hasReadableContent).toBe(false);
    });
});