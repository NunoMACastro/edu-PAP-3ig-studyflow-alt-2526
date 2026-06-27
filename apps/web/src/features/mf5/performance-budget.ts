/**
 * Mede budgets locais de performance da MF5 sem recolher dados pessoais.
 */
export type PerformanceBudgetMeasurement = {
    name: string;
    startedAtMs: number;
};

export type PerformanceBudgetResult = {
    name: string;
    durationMs: number;
    budgetMs: number;
    exceeded: boolean;
};

export const DASHBOARD_PERFORMANCE_BUDGET_MS = 2000;

/**
 * Inicia uma medição local para uma página ou fluxo visível.
 *
 * @param name Nome técnico da medição, sem dados pessoais, tokens ou conteúdo de estudo.
 * @returns Medição opaca que deve ser terminada com `finishPerformanceBudget`.
 */
export function startPerformanceBudget(name: string): PerformanceBudgetMeasurement {
    return {
        name,
        startedAtMs: performance.now(),
    };
}

/**
 * Termina a medição e indica se o budget foi excedido.
 *
 * @param measurement Medição devolvida por `startPerformanceBudget`.
 * @param budgetMs Limite máximo esperado em milissegundos.
 * @returns Resultado seguro para apresentar na UI ou usar em evidence técnica.
 */
export function finishPerformanceBudget(
    measurement: PerformanceBudgetMeasurement,
    budgetMs = DASHBOARD_PERFORMANCE_BUDGET_MS,
): PerformanceBudgetResult {
    const durationMs = Math.max(
        0,
        Math.round(performance.now() - measurement.startedAtMs),
    );

    return {
        name: measurement.name,
        durationMs,
        budgetMs,
        exceeded: durationMs > budgetMs,
    };
}

/**
 * Cria texto visível e seguro quando uma página excede o budget.
 *
 * @param result Resultado calculado no fim da medição.
 * @returns Mensagem curta sem nomes, emails, IDs, cookies, prompts ou respostas IA.
 */
export function formatPerformanceBudgetMessage(
    result: PerformanceBudgetResult,
): string {
    return `Esta página demorou ${result.durationMs} ms a ficar disponível. O objetivo é ${result.budgetMs} ms.`;
}
