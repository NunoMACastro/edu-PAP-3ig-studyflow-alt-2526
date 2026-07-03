// apps/api/src/modules/ai-safety/ai-safety-policy.ts
export type AiSafetyReasonCode =
    | "SAFE"
    | "BIAS_RISK"
    | "UNSAFE_REQUEST"
    | "NON_PEDAGOGICAL";

export type AiSafetyDecision = {
    allowed: boolean;
    reasonCode: AiSafetyReasonCode;
    reason: string;
};

const biasedTerms = [
    "inferior",
    "incapaz por origem",
    "merece menos apoio",
    "alunos de uma origem sao piores",
];

const unsafeTerms = [
    "autoagressao",
    "violencia detalhada",
    "burlar sistema",
    "fabricar credenciais",
];

/**
 * Normaliza texto livre para comparações simples e previsíveis.
 *
 * @param value Texto recebido do DTO.
 * @returns Texto em minúsculas, sem acentos e sem espaços duplicados.
 */
function normalizeSafetyText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

/**
 * Avalia uma pergunta antes de a IA gerar resposta.
 *
 * @param question Pergunta do aluno já validada pelo DTO do endpoint.
 * @returns Decisão segura para o service usar antes do provider.
 */
export function evaluateAiSafetyInput(question: string): AiSafetyDecision {
    const normalized = normalizeSafetyText(question);

    // A validação acontece no backend para impedir que uma UI alterada contorne a regra ética.
    if (!normalized) {
        return {
            allowed: false,
            reasonCode: "NON_PEDAGOGICAL",
            reason: "Escreve uma pergunta de estudo concreta.",
        };
    }

    if (biasedTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "BIAS_RISK",
            reason:
                "A IA não responde a pedidos discriminatórios ou enviesados.",
        };
    }

    // Pedidos perigosos falham antes do provider para evitar gerar conteúdo inseguro.
    if (unsafeTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
            reason: "A IA bloqueou o pedido por segurança.",
        };
    }

    return {
        allowed: true,
        reasonCode: "SAFE",
        reason: "Pedido pedagógico aceite.",
    };
}