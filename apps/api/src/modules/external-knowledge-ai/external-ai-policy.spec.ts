// apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts
/**
 * Testa a policy pura de conhecimento externo limitado.
 */
import { resolveExternalAiPolicy } from "./external-ai-policy.js";

describe("resolveExternalAiPolicy", () => {
    it("permite contexto externo apenas com fonte interna e permissão explícita", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: true,
            internalSourceCount: 2,
        });

        // O teste prova a regra de RNF37 sem depender de HTTP, BD ou provider IA.
        expect(decision).toMatchObject({
            externalAllowed: true,
            reason: "Contexto externo limitado permitido.",
        });
        expect(decision.externalNotes).toHaveLength(1);
    });

    it("bloqueia contexto externo quando o aluno não deu permissão", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: false,
            internalSourceCount: 2,
        });

        expect(decision.externalAllowed).toBe(false);
        expect(decision.externalNotes).toEqual([]);
    });

    it("bloqueia contexto externo quando não há fontes internas", () => {
        const decision = resolveExternalAiPolicy({
            allowExternalKnowledge: true,
            internalSourceCount: 0,
        });

        expect(decision.externalAllowed).toBe(false);
        expect(decision.reason).toBe("Sem fontes internas processáveis.");
    });
});