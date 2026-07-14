/**
 * Utilitários para manter leases Mongo vivos durante operações demoradas.
 *
 * O token de fencing continua a ser validado pelo chamador em cada heartbeat e
 * em cada transição terminal. Este helper apenas gere o relógio e garante que
 * uma operação nunca é considerada concluída depois de perder o lease.
 */

/** Erro interno usado para distinguir perda de lease de falhas do processador. */
export class MongoLeaseLostError extends Error {
    constructor() {
        super("O lease Mongo deixou de pertencer a este processador.");
        this.name = "MongoLeaseLostError";
    }
}

export type MongoLeaseHeartbeatOptions<T> = {
    leaseMs: number;
    heartbeat: () => Promise<boolean>;
    operation: () => Promise<T>;
};

/**
 * Executa trabalho mantendo o lease renovado a um terço da sua duração.
 *
 * Um heartbeat que devolva `false` ou falhe torna o lease definitivamente
 * perdido para esta execução. Antes de devolver ou propagar a falha original,
 * é feito um heartbeat final; assim, a transição CAS seguinte dispõe de uma
 * janela completa e não tenta fechar trabalho com um lease já expirado.
 *
 * @param options Lease, callback de renovação e operação protegida.
 * @returns Resultado da operação quando o lease permaneceu válido.
 * @throws MongoLeaseLostError quando já não é seguro persistir o resultado.
 */
export async function executeWithMongoLeaseHeartbeat<T>(
    options: MongoLeaseHeartbeatOptions<T>,
): Promise<T> {
    if (!Number.isSafeInteger(options.leaseMs) || options.leaseMs <= 0) {
        throw new Error("leaseMs deve ser um inteiro positivo.");
    }

    const heartbeatIntervalMs = Math.max(10, Math.floor(options.leaseMs / 3));
    let leaseLost = false;
    let heartbeatInFlight: Promise<void> | undefined;

    const startHeartbeat = (): void => {
        if (leaseLost || heartbeatInFlight) return;
        heartbeatInFlight = options
            .heartbeat()
            .then((held) => {
                if (!held) leaseLost = true;
            })
            .catch(() => {
                // Falhar fechado evita que uma indisponibilidade Mongo permita
                // a dois processadores persistirem o mesmo resultado.
                leaseLost = true;
            })
            .finally(() => {
                heartbeatInFlight = undefined;
            });
    };

    const timer = setInterval(startHeartbeat, heartbeatIntervalMs);
    timer.unref();

    let result: T | undefined;
    let operationError: unknown;
    let operationFailed = false;
    try {
        result = await options.operation();
    } catch (error) {
        operationFailed = true;
        operationError = error;
    } finally {
        clearInterval(timer);
        if (heartbeatInFlight) await heartbeatInFlight;
    }

    if (!leaseLost) {
        try {
            leaseLost = !(await options.heartbeat());
        } catch {
            leaseLost = true;
        }
    }
    if (leaseLost) throw new MongoLeaseLostError();
    if (operationFailed) throw operationError;
    return result as T;
}
