/**
 * Testa exclusão mútua e normalização de erro do hook de ações.
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncAction } from "./useAsyncAction.js";

describe("useAsyncAction", () => {
    it("não inicia uma segunda ação enquanto a primeira está pendente", async () => {
        let release!: () => void;
        const first = new Promise<void>((resolve) => {
            release = resolve;
        });
        const secondAction = vi.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useAsyncAction());

        let firstRun!: Promise<void | undefined>;
        await act(async () => {
            firstRun = result.current.run("save", () => first);
        });
        expect(result.current.pendingKey).toBe("save");

        await act(async () => {
            await result.current.run("delete", secondAction);
        });
        expect(secondAction).not.toHaveBeenCalled();

        await act(async () => {
            release();
            await firstRun;
        });
        expect(result.current.pendingKey).toBeNull();
    });

    it("expõe uma mensagem pública quando a ação falha", async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () => {
            await result.current.run("save", async () => {
                throw new Error("Falha controlada.");
            });
        });

        expect(result.current.error).toBe("Falha controlada.");
    });
});
