// apps/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts
import {
    ForbiddenException,
    PayloadTooLargeException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { assertPromptWithinLimit } from "./ai-model-policies.service.js";

describe("assertPromptWithinLimit", () => {
    it("bloqueia prompt que excede o limite docente", () => {
        // Este negativo confirma que o limite do professor trava a pergunta antes de qualquer custo de IA.
        expect(() =>
            assertPromptWithinLimit("x".repeat(11), { maxPromptChars: 10 }),
        ).toThrow(PayloadTooLargeException);
    });

    it("aceita prompt dentro do limite configurado", () => {
        // A função valida o contrato antes de o ClassAiService chamar o provider externo.
        expect(() =>
            assertPromptWithinLimit("explica limites", { maxPromptChars: 100 }),
        ).not.toThrow();
    });
});