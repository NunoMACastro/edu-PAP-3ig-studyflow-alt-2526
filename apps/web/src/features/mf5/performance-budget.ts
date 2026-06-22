// apps/web/src/features/mf5/performance-budget.ts
export type PerformanceBudgetResult = {
    name: string;
    durationMs: number;
    budgetMs: number;
    exceeded: boolean;
};

const DEFAULT_DASHBOARD_BUDGET_MS = 2000;

/**
 * Inicia uma medição local para uma página ou fluxo visível.
 *
 * @param name Nome técnico da medição, sem dados pessoais.
 */
export function startPerformanceBudget(name: string): void {
    performance.mark(`${name}:start`);
}

/**
 * Termina a medição e indica se o budget foi excedido.
 *
 * @param name Nome usado em `startPerformanceBudget`.
 * @param budgetMs Limite máximo esperado em milissegundos.
 * @returns Resultado seguro para apresentar na UI ou usar em testes.
 */
export function finishPerformanceBudget(
    name: string,
    budgetMs = DEFAULT_DASHBOARD_BUDGET_MS,
): PerformanceBudgetResult {
    const startMark = `${name}:start`;
    const endMark = `${name}:end`;

    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name);
    const entry = entries[entries.length - 1];
    const durationMs = Math.round(entry?.duration ?? 0);

    // Limpar marcas evita que navegações prolongadas acumulem medições antigas.
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(name);

    return {
        name,
        durationMs,
        budgetMs,
        exceeded: durationMs > budgetMs,
    };
}

/**
 * Cria texto visível e seguro quando uma página excede o budget.
 *
 * @param result Resultado calculado no fim da medição.
 * @returns Mensagem curta para o utilizador e para evidence.
 */
export function formatPerformanceBudgetMessage(
    result: PerformanceBudgetResult,
): string {
    return `Esta página demorou ${result.durationMs} ms a carregar. O objetivo é ${result.budgetMs} ms.`;
}