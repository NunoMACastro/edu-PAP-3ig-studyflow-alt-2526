// apps/api/src/common/operations/availability-budget.ts
/**
 * Estados operacionais permitidos para a meta mensal de disponibilidade.
 *
 * `HEALTHY` significa que a margem operacional ainda é confortável, `WARNING`
 * avisa que a equipa está perto do limite e `BREACHED` marca incumprimento de
 * `RNF24`.
 */
export type AvailabilityStatus = "HEALTHY" | "WARNING" | "BREACHED";

/**
 * Resultado público e agregado da avaliação de disponibilidade.
 *
 * Não inclui emails, userIds, materiais, prompts nem respostas IA porque a
 * disponibilidade mensal é uma métrica operacional, não um dado pessoal.
 */
export type AvailabilityBudgetResult = {
    downtimeMinutes: number;
    limitMinutes: number;
    status: AvailabilityStatus;
};

const MONTHLY_DOWNTIME_LIMIT_MINUTES = 60;

/**
 * Avalia se os minutos de indisponibilidade continuam dentro do RNF24.
 *
 * @param downtimeMinutes Total mensal de minutos indisponíveis.
 * @returns Estado operacional pronto para evidence.
 */
export function evaluateAvailabilityBudget(
    downtimeMinutes: number,
): AvailabilityBudgetResult {
    if (!Number.isFinite(downtimeMinutes) || downtimeMinutes < 0) {
        // Rejeitar valores impossíveis impede evidence enganadora sobre a fiabilidade real da API.
        throw new Error("downtimeMinutes deve ser um número positivo ou zero.");
    }

    // O aviso aos 80% dá tempo para corrigir antes de falhar a meta mensal.
    const warningThreshold = MONTHLY_DOWNTIME_LIMIT_MINUTES * 0.8;
    const status =
        downtimeMinutes >= MONTHLY_DOWNTIME_LIMIT_MINUTES
            ? "BREACHED"
            : downtimeMinutes >= warningThreshold
              ? "WARNING"
              : "HEALTHY";

    return {
        downtimeMinutes,
        limitMinutes: MONTHLY_DOWNTIME_LIMIT_MINUTES,
        status,
    };
}