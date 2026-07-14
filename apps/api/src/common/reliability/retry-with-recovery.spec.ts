/**
 * Testa recovery controlado para operações idempotentes.
 */
import {
    isTransientNetworkError,
    retryWithRecovery,
    validateRetryOptions,
} from "./retry-with-recovery.js";

describe("retryWithRecovery", () => {
    it("repete falha transitória e devolve sucesso", async () => {
        let calls = 0;
        const events: string[] = [];

        const result = await retryWithRecovery(
            async () => {
                calls += 1;
                if (calls === 1) {
                    throw new Error("ECONNRESET");
                }
                return "ok";
            },
            {
                attempts: 3,
                baseDelayMs: 1,
                maxDelayMs: 5,
                shouldRetry: isTransientNetworkError,
                /**
                 * Executa o apoio de teste para recuperação de falhas, mantendo o cenário legível e próximo do comportamento real validado.
                 *
                 * @returns Resultado da operação no formato esperado pelo chamador.
                 */
                sleep: async () => undefined,
                /**
                 * Executa o apoio de teste para recuperação de falhas, mantendo o cenário legível e próximo do comportamento real validado.
                 *
                 * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
                 * @returns Resultado da operação no formato esperado pelo chamador.
                 */
                onEvent: async (event) => {
                    events.push(event.code);
                },
            },
        );

        expect(result).toBe("ok");
        expect(calls).toBe(2);
        expect(events).toEqual(["RECOVERY_RETRY_SCHEDULED"]);
    });

    it("não repete erro permanente", async () => {
        let calls = 0;

        await expect(
            retryWithRecovery(
                async () => {
                    calls += 1;
                    // URL privada é erro permanente; retry não pode mascarar insegurança.
                    throw new Error("URL local ou privada não pode ser indexada.");
                },
                {
                    attempts: 3,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
                    /**
                     * Executa o apoio de teste para recuperação de falhas, mantendo o cenário legível e próximo do comportamento real validado.
                     *
                     * @returns Resultado da operação no formato esperado pelo chamador.
                     */
                    sleep: async () => undefined,
                },
            ),
        ).rejects.toThrow("URL local ou privada");

        expect(calls).toBe(1);
    });

    it("para no limite de tentativas", async () => {
        let calls = 0;

        await expect(
            retryWithRecovery(
                async () => {
                    calls += 1;
                    throw new Error("ETIMEDOUT");
                },
                {
                    attempts: 2,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
                    /**
                     * Executa o apoio de teste para recuperação de falhas, mantendo o cenário legível e próximo do comportamento real validado.
                     *
                     * @returns Resultado da operação no formato esperado pelo chamador.
                     */
                    sleep: async () => undefined,
                },
            ),
        ).rejects.toThrow("ETIMEDOUT");

        expect(calls).toBe(2);
    });

    it("rejeita configuração sem tentativas válidas", () => {
        expect(() =>
            validateRetryOptions({
                attempts: 0,
                baseDelayMs: 1,
                maxDelayMs: 5,
                shouldRetry: isTransientNetworkError,
            }),
        ).toThrow("attempts");
    });
});
