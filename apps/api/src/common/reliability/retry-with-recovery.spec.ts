// apps/api/src/common/reliability/retry-with-recovery.spec.ts
import {
    isTransientNetworkError,
    retryWithRecovery,
    validateRetryOptions,
} from "./retry-with-recovery.js";

describe("retryWithRecovery", () => {
    it("repete falha transitória e devolve sucesso", async () => {
        let calls = 0;
        // Os eventos provam que o retry é observável pela MF7 sem registar dados privados.
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
                // Só erros transitórios podem ser repetidos; erros de segurança não entram em retry.
                shouldRetry: isTransientNetworkError,
                sleep: async () => undefined,
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
                    // URL privada é erro permanente: repetir poderia mascarar uma tentativa insegura.
                    throw new Error("URL local ou privada não pode ser indexada.");
                },
                {
                    attempts: 3,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
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
                    // Mesmo erro transitório tem limite para evitar loops infinitos em falhas externas.
                    throw new Error("ETIMEDOUT");
                },
                {
                    attempts: 2,
                    baseDelayMs: 1,
                    maxDelayMs: 5,
                    shouldRetry: isTransientNetworkError,
                    sleep: async () => undefined,
                },
            ),
        ).rejects.toThrow("ETIMEDOUT");

        expect(calls).toBe(2);
    });

    it("rejeita configuração sem tentativas válidas", () => {
        // Configuração inválida falha antes de executar a operação, evitando recovery mal definido.
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