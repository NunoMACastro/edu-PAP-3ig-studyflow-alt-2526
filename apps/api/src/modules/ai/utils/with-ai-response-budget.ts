// apps/api/src/modules/ai/utils/with-ai-response-budget.ts
import { GatewayTimeoutException } from "@nestjs/common";

export const AI_RESPONSE_BUDGET_MS = 4000;

/**
 * Escolhe o budget efetivo para uma chamada IA.
 *
 * @param policyTimeoutMs Timeout configurado em política administrativa.
 * @param rnBudgetMs Limite máximo definido pelo RNF09.
 * @returns Menor timeout positivo entre política e RNF09.
 */
export function resolveAiBudgetMs(
    policyTimeoutMs?: number,
    rnBudgetMs = AI_RESPONSE_BUDGET_MS,
): number {
    if (
        typeof policyTimeoutMs !== "number" ||
        !Number.isFinite(policyTimeoutMs) ||
        policyTimeoutMs <= 0
    ) {
        return rnBudgetMs;
    }

    return Math.min(policyTimeoutMs, rnBudgetMs);
}

/**
 * Executa uma chamada IA dentro do budget público do StudyFlow.
 *
 * @param operation Promessa devolvida pelo provider depois das validações de domínio.
 * @param budgetMs Tempo máximo de espera em milissegundos.
 * @returns Resultado da operação quando termina dentro do limite.
 * @throws GatewayTimeoutException quando a operação excede o budget.
 */
export async function withAiResponseBudget<T>(
    operation: Promise<T>,
    budgetMs = AI_RESPONSE_BUDGET_MS,
): Promise<T> {
    let timeoutRef: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timeoutRef = setTimeout(() => {
            // O timeout devolve erro honesto em vez de fabricar uma resposta IA.
            reject(new GatewayTimeoutException({
                code: "AI_RESPONSE_TIMEOUT",
                message: "A IA demorou demasiado a responder. Tenta novamente com uma pergunta mais focada.",
            }));
        }, budgetMs);
    });

    try {
        return await Promise.race([operation, timeout]);
    } finally {
        if (timeoutRef) {
            clearTimeout(timeoutRef);
        }
    }
}