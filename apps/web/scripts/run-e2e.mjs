/**
 * Executa Playwright e elimina o diretório temporário da execução depois de
 * todos os reporters terminarem, incluindo o metadata `.last-run.json`.
 */
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanupE2eRunArtifacts } from "./e2e-temp-cleanup.mjs";

const PRIVATE_SEED_DATA_PATH = resolve(
    process.cwd(),
    "..",
    "seed-input-private",
    "dados.md",
);

/**
 * Obtém as contas E2E diretamente do input privado que alimenta o seed.
 * Assim, a suite nunca volta a depender das identidades genéricas removidas.
 *
 * @returns {Promise<Record<string, string>>} Variáveis de ambiente privadas.
 */
async function readPrivateSeedAccounts() {
    const source = await readFile(PRIVATE_SEED_DATA_PATH, "utf8");
    const professorSection = source.match(
        /^# Professor\s*$([\s\S]*?)(?=^# )/mu,
    )?.[1];
    const studentsSection = source.match(
        /^# Alunos\s*$([\s\S]*)/mu,
    )?.[1];
    const professorEmail = professorSection?.match(
        /^Email de demonstração:\s*([^\s]+)\s*$/imu,
    )?.[1];
    const studentBlocks = studentsSection
        ?.split(/^## Aluno \d+\s*$/gmu)
        .slice(1) ?? [];
    const studentEmails = studentBlocks.map((block) =>
        block.match(/^Email de demonstração:\s*([^\s]+)\s*$/imu)?.[1],
    );
    const studentNames = studentBlocks.map((block) =>
        block.match(/^Nome:\s*(.+)\s*$/imu)?.[1]?.trim(),
    );

    if (
        !professorEmail ||
        studentEmails.length !== 4 ||
        studentEmails.some((value) => !value) ||
        studentNames.some((value) => !value)
    ) {
        throw new Error(
            "dados.md tem de definir um professor e exatamente quatro alunos para os testes E2E.",
        );
    }

    return {
        STUDYFLOW_E2E_TEACHER_EMAIL: professorEmail,
        STUDYFLOW_E2E_TEACHER_PASSWORD: "professor-dev-12345",
        STUDYFLOW_E2E_STUDENT_EMAIL: studentEmails[0],
        STUDYFLOW_E2E_STUDENT_DISPLAY_NAME: studentNames[0],
        STUDYFLOW_E2E_ASSISTANT_STUDENT_EMAIL: studentEmails[1],
        STUDYFLOW_E2E_ASSISTANT_STUDENT_DISPLAY_NAME: studentNames[1],
        STUDYFLOW_E2E_SECOND_STUDENT_EMAIL: studentEmails[1],
        STUDYFLOW_E2E_SECOND_STUDENT_DISPLAY_NAME: studentNames[1],
        STUDYFLOW_E2E_THIRD_STUDENT_EMAIL: studentEmails[2],
        STUDYFLOW_E2E_THIRD_STUDENT_DISPLAY_NAME: studentNames[2],
        STUDYFLOW_E2E_FOURTH_STUDENT_EMAIL: studentEmails[3],
        STUDYFLOW_E2E_FOURTH_STUDENT_DISPLAY_NAME: studentNames[3],
        STUDYFLOW_E2E_STUDENT_PASSWORD: "aluno-dev-12345",
    };
}

const runId =
    process.env.STUDYFLOW_E2E_RUN_ID ?? `${Date.now()}-${process.pid}`;

if (!/^[A-Za-z0-9_-]{1,80}$/.test(runId)) {
    throw new Error("STUDYFLOW_E2E_RUN_ID contém caracteres inválidos.");
}

const cliPath = resolve("node_modules", "@playwright", "test", "cli.js");
const privateSeedAccounts = await readPrivateSeedAccounts();
const child = spawn(
    process.execPath,
    [cliPath, "test", ...process.argv.slice(2)],
    {
        stdio: "inherit",
        env: {
            ...process.env,
            ...privateSeedAccounts,
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
