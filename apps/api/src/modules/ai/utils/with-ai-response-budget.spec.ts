/**
 * Testa o helper de budget público para respostas IA da MF5.
 */
import { GatewayTimeoutException } from "@nestjs/common";
import {
    AI_RESPONSE_BUDGET_MS,
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "./with-ai-response-budget.js";

describe("withAiResponseBudget", () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it("usa o menor timeout positivo entre política e RNF09", () => {
        expect(resolveAiBudgetMs()).toBe(AI_RESPONSE_BUDGET_MS);
        expect(resolveAiBudgetMs(6000)).toBe(AI_RESPONSE_BUDGET_MS);
        expect(resolveAiBudgetMs(1500)).toBe(1500);
        expect(resolveAiBudgetMs(0)).toBe(AI_RESPONSE_BUDGET_MS);
        expect(resolveAiBudgetMs(Number.NaN)).toBe(AI_RESPONSE_BUDGET_MS);
    });

    it("devolve o resultado quando o provider termina dentro do budget", async () => {
        await expect(
            withAiResponseBudget(Promise.resolve("resposta"), 25),
        ).resolves.toBe("resposta");
    });

    it("lança GatewayTimeoutException quando o provider excede o budget", async () => {
        jest.useFakeTimers();

        const promise = withAiResponseBudget(
            new Promise<string>(() => undefined),
            10,
        );
        const assertion = expect(promise).rejects.toBeInstanceOf(
            GatewayTimeoutException,
        );

        await jest.advanceTimersByTimeAsync(10);
        await assertion;
    });
});
