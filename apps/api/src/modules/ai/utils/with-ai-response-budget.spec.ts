// apps/api/src/modules/ai/utils/with-ai-response-budget.spec.ts
import { GatewayTimeoutException } from "@nestjs/common";
import {
    AI_RESPONSE_BUDGET_MS,
    resolveAiBudgetMs,
    withAiResponseBudget,
} from "./with-ai-response-budget.js";

describe("withAiResponseBudget", () => {
    it("usa 4000 ms como limite RNF09 quando a política é maior", () => {
        expect(resolveAiBudgetMs(6000)).toBe(AI_RESPONSE_BUDGET_MS);
    });

    it("respeita política mais restritiva do que RNF09", () => {
        expect(resolveAiBudgetMs(1500)).toBe(1500);
    });

    it("devolve resultado quando a operação termina dentro do budget", async () => {
        await expect(withAiResponseBudget(Promise.resolve("ok"), 50)).resolves.toBe("ok");
    });

    it("lança GatewayTimeoutException quando a operação excede o budget", async () => {
        const slowOperation = new Promise<string>((resolve) => {
            setTimeout(() => resolve("tarde"), 30);
        });

        // O teste prova o fallback honesto: uma resposta tardia não é apresentada como sucesso.
        await expect(withAiResponseBudget(slowOperation, 5)).rejects.toBeInstanceOf(
            GatewayTimeoutException,
        );
    });
});