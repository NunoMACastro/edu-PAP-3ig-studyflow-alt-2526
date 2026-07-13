/**
 * Disponibiliza polling sem sobreposição e respeitando a visibilidade da página.
 */
import { useEffect, useRef } from "react";

/**
 * Executa uma tarefa repetida com `setTimeout` recursivo.
 *
 * Uma nova iteração só é agendada depois da anterior terminar; isto elimina a
 * sobreposição típica de `setInterval(async ...)`. O polling pausa em tabs
 * ocultos e retoma quando a página volta a ficar visível.
 *
 * @param task Operação assíncrona; recebe um signal cancelado no unmount/disable.
 * @param options Ativação, intervalo e execução inicial.
 */
export function usePollingTask(
    task: (signal: AbortSignal) => Promise<void>,
    options: {
        enabled: boolean;
        intervalMs: number;
        runImmediately?: boolean;
    },
): void {
    const taskRef = useRef(task);
    taskRef.current = task;

    useEffect(() => {
        if (!options.enabled) return undefined;
        let stopped = false;
        let timeoutId: number | undefined;
        let controller: AbortController | null = null;
        let running = false;

        const schedule = (delay: number): void => {
            if (stopped) return;
            timeoutId = window.setTimeout(() => void run(), delay);
        };

        const run = async (): Promise<void> => {
            if (running) return;
            if (document.visibilityState === "hidden") {
                schedule(options.intervalMs);
                return;
            }
            running = true;
            controller = new AbortController();
            try {
                await taskRef.current(controller.signal);
            } finally {
                controller = null;
                running = false;
                schedule(options.intervalMs);
            }
        };

        const handleVisibility = (): void => {
            if (document.visibilityState !== "visible") return;
            window.clearTimeout(timeoutId);
            schedule(0);
        };

        document.addEventListener("visibilitychange", handleVisibility);
        schedule(options.runImmediately ? 0 : options.intervalMs);

        return () => {
            stopped = true;
            controller?.abort();
            window.clearTimeout(timeoutId);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [options.enabled, options.intervalMs, options.runImmediately]);
}
