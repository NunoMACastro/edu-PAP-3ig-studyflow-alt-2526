/**
 * Testa exclusão de pedidos e cancelamento do polling React.
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePollingTask } from "./usePollingTask.js";

describe("usePollingTask", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("não sobrepõe iterações e cancela a ativa no unmount", async () => {
        let resolveTask!: () => void;
        const task = vi.fn(
            (_signal: AbortSignal) =>
                new Promise<void>((resolve) => {
                    resolveTask = resolve;
                }),
        );
        const { unmount } = renderHook(() =>
            usePollingTask(task, {
                enabled: true,
                intervalMs: 100,
                runImmediately: true,
            }),
        );

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(task).toHaveBeenCalledTimes(1);
        const signal = task.mock.calls[0]?.[0];
        expect(signal).toBeDefined();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });
        expect(task).toHaveBeenCalledTimes(1);

        unmount();
        expect(signal?.aborted).toBe(true);
        await act(async () => resolveTask());
    });

    it("não agenda trabalho quando está desativado", async () => {
        const task = vi.fn(async (_signal: AbortSignal) => undefined);
        renderHook(() =>
            usePollingTask(task, { enabled: false, intervalMs: 100 }),
        );

        await act(async () => vi.advanceTimersByTimeAsync(500));
        expect(task).not.toHaveBeenCalled();
    });

    it("pausa oculto e retoma imediatamente quando volta a visível", async () => {
        const task = vi.fn(async (_signal: AbortSignal) => undefined);
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "hidden",
        });
        const { unmount } = renderHook(() =>
            usePollingTask(task, {
                enabled: true,
                intervalMs: 100,
                runImmediately: true,
            }),
        );

        await act(async () => vi.advanceTimersByTimeAsync(0));
        expect(task).not.toHaveBeenCalled();
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });
        await act(async () => {
            document.dispatchEvent(new Event("visibilitychange"));
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(task).toHaveBeenCalledTimes(1);
        unmount();
    });

    it("respeita o atraso inicial quando runImmediately não é pedido", async () => {
        const task = vi.fn(async (_signal: AbortSignal) => undefined);
        renderHook(() =>
            usePollingTask(task, { enabled: true, intervalMs: 100 }),
        );

        await act(async () => vi.advanceTimersByTimeAsync(99));
        expect(task).not.toHaveBeenCalled();
        await act(async () => vi.advanceTimersByTimeAsync(1));
        expect(task).toHaveBeenCalledTimes(1);
    });

    it("não sobrepõe a tarefa ativa ao receber visibilitychange", async () => {
        let resolveTask!: () => void;
        const task = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveTask = resolve;
                }),
        );
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            value: "visible",
        });
        const { unmount } = renderHook(() =>
            usePollingTask(task, {
                enabled: true,
                intervalMs: 100,
                runImmediately: true,
            }),
        );

        await act(async () => vi.advanceTimersByTimeAsync(0));
        document.dispatchEvent(new Event("visibilitychange"));
        await act(async () => vi.advanceTimersByTimeAsync(0));
        expect(task).toHaveBeenCalledTimes(1);
        await act(async () => resolveTask());
        await act(async () => vi.advanceTimersByTimeAsync(100));
        expect(task).toHaveBeenCalledTimes(2);
        unmount();
    });
});
