/**
 * Testa mensagens por campo e deteção de erros de formulários.
 */
import { describe, expect, it } from "vitest";
import { hasFieldErrors, requireFields } from "./form-validation.js";

describe("form-validation", () => {
    it("ignora campos preenchidos e aponta whitespace como vazio", () => {
        const errors = requireFields([
            { name: "title", label: "Título", value: "  " },
            { name: "body", label: "Mensagem", value: "Conteúdo" },
        ] as const);

        expect(errors).toEqual({ title: "Título é obrigatório." });
        expect(hasFieldErrors(errors)).toBe(true);
        expect(hasFieldErrors({})).toBe(false);
    });
});
