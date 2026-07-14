/**
 * Helpers de recovery controlado para operações idempotentes.
 */
export type RetryRecoveryEvent = {
    code: "RECOVERY_RETRY_SCHEDULED" | "RECOVERY_RETRY_EXHAUSTED";
    attempt: number;
    maxAttempts: number;
    delayMs: number;
    errorMessage: string;
};

export type RetryWithRecoveryOptions = {
    attempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    shouldRetry: (error: unknown, attempt: number) => boolean;
    sleep?: (delayMs: number) => Promise<void>;
    onEvent?: (event: RetryRecoveryEvent) => void | Promise<void>;
};

/**
 * Executa uma operação recuperável com limites explícitos de tentativas.
 *
 * @param operation Operação idempotente que pode ser repetida.
 * @param options Configuração de limites, espera e decisão de retry.
 * @returns Resultado da operação quando uma tentativa termina com sucesso.
 */
export async function retryWithRecovery<T>(
    operation: () => Promise<T>,
    options: RetryWithRecoveryOptions,
): Promise<T> {
    const config = validateRetryOptions(options);

    for (let attempt = 1; attempt <= config.attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            const canRetry =
                attempt < config.attempts && config.shouldRetry(error, attempt);
            if (!canRetry) {
                if (attempt > 1) {
                    await config.onEvent({
                        code: "RECOVERY_RETRY_EXHAUSTED",
                        attempt,
                        maxAttempts: config.attempts,
                        delayMs: 0,
                        errorMessage: toPublicErrorMessage(error),
                    });
                }
                throw error;
            }

            const delayMs = Math.min(
                config.baseDelayMs * attempt,
                config.maxDelayMs,
            );
            await config.onEvent({
                code: "RECOVERY_RETRY_SCHEDULED",
                attempt,
                maxAttempts: config.attempts,
                delayMs,
                errorMessage: toPublicErrorMessage(error),
            });
            await config.sleep(delayMs);
        }
    }

    throw new Error("Operação recuperável terminou sem resultado.");
}

/**
 * Valida limites para impedir retry infinito ou configuração perigosa.
 *
 * @param options Configuração recebida pelo chamador.
 * @returns Configuração com callbacks por defeito.
 */
export function validateRetryOptions(
    options: RetryWithRecoveryOptions,
): Required<RetryWithRecoveryOptions> {
    if (
        !Number.isInteger(options.attempts) ||
        options.attempts < 1 ||
        options.attempts > 5
    ) {
        throw new Error("attempts deve ser um inteiro entre 1 e 5.");
    }
    if (
        !Number.isInteger(options.baseDelayMs) ||
        options.baseDelayMs < 0 ||
        options.baseDelayMs > 5_000
    ) {
        throw new Error("baseDelayMs deve ser um inteiro entre 0 e 5000.");
    }
    if (
        !Number.isInteger(options.maxDelayMs) ||
        options.maxDelayMs < options.baseDelayMs ||
        options.maxDelayMs > 10_000
    ) {
        throw new Error(
            "maxDelayMs deve ser maior ou igual a baseDelayMs e no máximo 10000.",
        );
    }

    return {
        ...options,
        sleep: options.sleep ?? defaultSleep,
        onEvent: options.onEvent ?? (() => undefined),
    };
}

/**
 * Identifica erros temporários de rede que podem ser repetidos em leituras.
 *
 * @param error Erro capturado pela operação.
 * @returns `true` apenas para falhas transitórias conhecidas.
 */
export function isTransientNetworkError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return [
        "econnreset",
        "etimedout",
        "timeout",
        "tempor",
        "socket hang up",
        "transient_http_502",
        "transient_http_503",
        "transient_http_504",
    ].some((term) => message.includes(term));
}

/**
 * Converte erros para mensagem curta, sem stack trace nem dados internos.
 *
 * @param error Erro original.
 * @returns Mensagem segura para testes, eventos e evidence.
 */
function toPublicErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message.slice(0, 300);
    }
    return "Falha recuperável sem mensagem pública.";
}

/**
 * Espera assíncrona usada quando o chamador não injeta sleep em teste.
 *
 * @param delayMs Milissegundos a aguardar antes da próxima tentativa.
 * @returns Promise resolvida após a espera.
 */
function defaultSleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}
