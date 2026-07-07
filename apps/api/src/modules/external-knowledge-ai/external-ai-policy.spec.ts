/**
 * Testa a policy isolada de conhecimento externo limitado antes da integracao com o service.
 */
import { resolveExternalAiPolicy } from "./external-ai-policy.js";

describe("resolveExternalAiPolicy", () => {
    it("bloqueia contexto externo quando nao existem fontes internas", () => {
        expect(
            resolveExternalAiPolicy({
                allowExternalKnowledge: true,
                internalSourceCount: 0,
            }),
        ).toEqual({
            externalAllowed: false,
            reason: "Sem fontes internas processaveis.",
            externalNotes: [],
        });
    });

    it("bloqueia contexto externo quando o aluno nao deu permissao explicita", () => {
        expect(
            resolveExternalAiPolicy({
                allowExternalKnowledge: false,
                internalSourceCount: 2,
            }),
        ).toEqual({
            externalAllowed: false,
            reason: "O aluno nao permitiu contexto externo.",
            externalNotes: [],
        });
    });

    it("permite nota externa limitada quando ha permissao e fontes internas", () => {
        expect(
            resolveExternalAiPolicy({
                allowExternalKnowledge: true,
                internalSourceCount: 2,
            }),
        ).toMatchObject({
            externalAllowed: true,
            reason: "Contexto externo limitado permitido.",
            externalNotes: [expect.stringContaining("Nota externa limitada")],
        });
    });
});
