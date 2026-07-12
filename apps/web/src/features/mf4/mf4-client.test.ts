/**
 * Garante que todos os adaptadores MF4 permanecem restritos à API local e
 * passam pelo cliente comum com cookies/CSRF.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMf3Json = vi.hoisted(() => vi.fn());

vi.mock("../mf3/request-mf3-json.js", () => ({ requestMf3Json }));

import * as client from "./mf4-client.js";

describe("cliente MF4", () => {
    beforeEach(() => {
        requestMf3Json.mockReset().mockResolvedValue({ ok: true });
    });

    it("encaminha toda a superfície pública apenas para /api", async () => {
        const functions = Object.entries(client)
            .filter(([, value]) => typeof value === "function")
            .map(([name, value]) => [name, value as (...args: unknown[]) => unknown] as const);

        expect(functions.length).toBeGreaterThan(20);

        for (const [name, fn] of functions) {
            try {
                await Promise.resolve(fn("resource-id", "ADMIN"));
            } catch (error) {
                expect(error, name).toMatchObject({ code: "API_RESPONSE_INVALID" });
            }
        }

        expect(requestMf3Json).toHaveBeenCalledTimes(functions.length);
        for (const [path] of requestMf3Json.mock.calls as [string, RequestInit | undefined][]) {
            expect(path).toMatch(/^\/api\//);
            expect(path).not.toContain("undefined");
        }
    });
});
