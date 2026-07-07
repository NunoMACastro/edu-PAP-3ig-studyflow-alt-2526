/**
 * Avalia pedidos de IA quanto a enviesamento, insegurança e falta de finalidade pedagógica.
 */
export type AiSafetyReasonCode =
    | "SAFE"
    | "BIAS_RISK"
    | "UNSAFE_REQUEST"
    | "NON_PEDAGOGICAL";

/**
 * Resultado interno da policy de segurança ética da IA.
 */
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

const nonPedagogicalTerms = [
    "cola no teste",
    "fazer batota",
    "faz o trabalho por mim",
    "responde por mim sem eu estudar",
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
 * Avalia uma pergunta antes de qualquer fluxo posterior de IA.
 *
 * @param question Pergunta do aluno já validada pelo DTO do endpoint.
 * @returns Decisão segura para o service usar antes de autorizar o pedido.
 */
export function evaluateAiSafetyInput(question: string): AiSafetyDecision {
    const normalized = normalizeSafetyText(question);

    // Esta validação vive no backend para impedir que uma UI alterada contorne a regra ética.
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

    // Pedidos perigosos falham antes de qualquer provider para evitar gerar conteúdo inseguro.
    if (unsafeTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
            reason: "A IA bloqueou o pedido por segurança.",
        };
    }

    if (nonPedagogicalTerms.some((term) => normalized.includes(term))) {
        return {
            allowed: false,
            reasonCode: "NON_PEDAGOGICAL",
            reason: "Escreve uma pergunta de estudo concreta.",
        };
    }

    return {
        allowed: true,
        reasonCode: "SAFE",
        reason: "Pedido pedagógico aceite.",
    };
}
