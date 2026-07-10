/**
 * Executa Playwright e elimina o diretório temporário da execução depois de
 * todos os reporters terminarem, incluindo o metadata `.last-run.json`.
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { cleanupE2eRunArtifacts } from "./e2e-temp-cleanup.mjs";

const runId =
    process.env.STUDYFLOW_E2E_RUN_ID ?? `${Date.now()}-${process.pid}`;

if (!/^[A-Za-z0-9_-]{1,80}$/.test(runId)) {
    throw new Error("STUDYFLOW_E2E_RUN_ID contém caracteres inválidos.");
}

const cliPath = resolve("node_modules", "@playwright", "test", "cli.js");
const child = spawn(
    process.execPath,
    [cliPath, "test", ...process.argv.slice(2)],
    {
        stdio: "inherit",
        env: {
            ...process.env,
            STUDYFLOW_E2E_RUN_ID: runId,
        },
    },
);

const forwardedSignals = ["SIGINT", "SIGTERM", "SIGHUP"];
let receivedSignal;
const signalHandlers = new Map(
    forwardedSignals.map((signal) => {
        const handler = () => {
            receivedSignal ??= signal;
            if (!child.killed) child.kill(signal);
        };
        process.on(signal, handler);
        return [signal, handler];
    }),
);

let exitCode = 1;
try {
    exitCode = await new Promise((resolveExit, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (signal) {
                receivedSignal ??= signal;
                resolveExit(1);
                return;
            }
            resolveExit(code ?? 1);
        });
    });
} finally {
    await cleanupE2eRunArtifacts({ runId });
    for (const [signal, handler] of signalHandlers) {
        process.off(signal, handler);
    }
}

if (receivedSignal) {
    process.kill(process.pid, receivedSignal);
} else {
    process.exitCode = exitCode;
}
