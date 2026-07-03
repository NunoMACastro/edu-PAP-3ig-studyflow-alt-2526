// apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts
/**
 * Entrada mínima para decidir se a resposta pode receber contexto externo.
 */
export type ExternalAiPolicyInput = {
    allowExternalKnowledge: boolean;
    internalSourceCount: number;
};

/**
 * Resultado da policy usado pelo service antes de chamar o provider IA.
 */
export type ExternalAiPolicyDecision = {
    externalAllowed: boolean;
    reason: string;
    externalNotes: string[];
};

/**
 * Decide se o contexto externo limitado pode ser usado numa resposta StudyFlow.
 *
 * @param input Permissão explícita do aluno e número de fontes internas autorizadas.
 * @returns Decisão que separa resposta interna, nota externa e motivo observável em testes.
 */
export function resolveExternalAiPolicy(
    input: ExternalAiPolicyInput,
): ExternalAiPolicyDecision {
    if (input.internalSourceCount <= 0) {
        return {
            externalAllowed: false,
            reason: "Sem fontes internas processáveis.",
            externalNotes: [],
        };
    }

    // Contexto externo nunca substitui as fontes internas autorizadas pelo StudyFlow.
    if (!input.allowExternalKnowledge) {
        return {
            externalAllowed: false,
            reason: "O aluno não permitiu contexto externo.",
            externalNotes: [],
        };
    }

    // A nota visível impede que a UI apresente contexto externo como citação interna.
    return {
        externalAllowed: true,
        reason: "Contexto externo limitado permitido.",
        externalNotes: [
            "Nota externa limitada: a resposta pode acrescentar enquadramento pedagógico geral, separado das fontes internas.",
        ],
    };
}