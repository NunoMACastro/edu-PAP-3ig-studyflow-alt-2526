/**
 * Define a policy pequena e testavel que limita o uso de conhecimento externo na IA.
 */

/**
 * Entrada minima para decidir se contexto externo limitado pode ser usado.
 */
export type ExternalAiPolicyInput = {
    /**
     * Permissao explicita escolhida pelo aluno na UI.
     */
    allowExternalKnowledge: boolean;
    /**
     * Numero de fontes internas ja autorizadas pelo backend.
     */
    internalSourceCount: number;
};

/**
 * Resultado observavel da policy antes da chamada ao provider IA.
 */
export type ExternalAiPolicyDecision = {
    externalAllowed: boolean;
    reason: string;
    externalNotes: string[];
};

const EXTERNAL_AI_NOTE =
    "Nota externa limitada: a resposta pode acrescentar enquadramento pedagogico geral, separado das fontes internas.";

/**
 * Decide se uma resposta StudyFlow pode receber contexto externo limitado.
 *
 * @param input Permissao explicita do aluno e quantidade de fontes internas autorizadas.
 * @returns Decisao que o service usa antes de chamar o provider IA.
 */
export function resolveExternalAiPolicy(
    input: ExternalAiPolicyInput,
): ExternalAiPolicyDecision {
    if (input.internalSourceCount <= 0) {
        return {
            externalAllowed: false,
            reason: "Sem fontes internas processaveis.",
            externalNotes: [],
        };
    }

    // Contexto externo nunca substitui fontes internas autorizadas pelo StudyFlow.
    if (!input.allowExternalKnowledge) {
        return {
            externalAllowed: false,
            reason: "O aluno nao permitiu contexto externo.",
            externalNotes: [],
        };
    }

    return {
        externalAllowed: true,
        reason: "Contexto externo limitado permitido.",
        externalNotes: [EXTERNAL_AI_NOTE],
    };
}
