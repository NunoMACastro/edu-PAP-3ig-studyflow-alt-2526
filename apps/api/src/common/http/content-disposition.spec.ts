/** Testa a defesa contra header injection em nomes de download. */
import { buildSafeContentDisposition } from "./content-disposition.js";

describe("buildSafeContentDisposition", () => {
    it("preserva UTF-8 por filename* e usa fallback ASCII seguro", () => {
        expect(
            buildSafeContentDisposition("attachment", 'função "final".pdf'),
        ).toBe(
            "attachment; filename=\"funcao _final_.pdf\"; filename*=UTF-8''fun%C3%A7%C3%A3o%20%22final%22.pdf",
        );
    });
});
