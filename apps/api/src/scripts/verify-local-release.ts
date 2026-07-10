/** Gate fail-closed e reproduzível da release `PAP_LOCAL_ENDURECIDA`. */
import "../common/config/load-env.js";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, isAbsolute, resolve } from "node:path";
import { listActiveE2eVariables } from "../common/config/e2e-runtime-boundary.js";

const EXPECTED_NODE = "24.11.1";
const EXPECTED_NPM = "11.6.2";

export type ReleaseCommand = {
    id: string;
    cwd: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
};

type CommandResult = { stdout: string };
type CommandRunner = (command: ReleaseCommand) => Promise<CommandResult>;
export type ReleaseStepResult = {
    id: string;
    status: "PASS" | "FAIL";
    exitCode: number;
};

class ReleaseCommandError extends Error {
    constructor(
        readonly stepId: string,
        readonly exitCode: number,
    ) {
        super(`Gate ${stepId} falhou com exit code ${exitCode}.`);
    }
}

/** Lista todas as provas automáticas; três runs E2E são deliberadamente distintos. */
export function buildReleaseCommands(apiRoot: string, webRoot: string): ReleaseCommand[] {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const commands: ReleaseCommand[] = [
        command("secrets", apiRoot, npm, ["run", "secrets:scan"]),
        command("documentation", apiRoot, npm, ["run", "docs:verify"]),
        command("api-clean-install", apiRoot, npm, ["ci"]),
        command("api-build", apiRoot, npm, ["run", "build"]),
        command("technical-map-canonical", apiRoot, process.execPath, [
            "dist/scripts/export-technical-map.js",
            "--check",
        ]),
        command("api-unit-integration-contracts", apiRoot, npm, ["run", "test:unit", "--", "--runInBand"]),
        command("api-dependency-audit", apiRoot, npm, ["audit", "--audit-level=low"]),
        command("restore-synthetic", apiRoot, npm, ["test", "--", "--runInBand", "src/scripts/backup-database.spec.ts", "src/scripts/restore-database.spec.ts"]),
        command("readiness-negative-unit", apiRoot, npm, ["test", "--", "--runInBand", "src/common/health/health.controller.spec.ts"]),
        command("jobs-crash-recovery", apiRoot, npm, ["test", "--", "--runInBand", "src/modules/ai/quiz-generation-jobs.service.spec.ts", "src/modules/material-index/material-index-queue.service.spec.ts"]),
        command("web-clean-install", webRoot, npm, ["ci"]),
        command("web-coverage", webRoot, npm, ["run", "test:coverage"]),
        command("web-build", webRoot, npm, ["run", "build"]),
        command("web-bundle-budget", webRoot, npm, ["run", "check:bundle"]),
        command("web-dependency-audit", webRoot, npm, ["audit", "--audit-level=low"]),
    ];
    for (let run = 1; run <= 3; run += 1) {
        commands.push({
            ...command(`e2e-isolated-${run}`, webRoot, npm, [
                "run",
                "test:e2e",
                "--",
                "--project=chromium",
                "--reporter=line",
            ]),
            env: {
                STUDYFLOW_E2E_REUSE_SERVERS: "false",
                STUDYFLOW_E2E_RUN_ID: `local-release-${run}`,
                STUDYFLOW_E2E_API_PORT: String(43_100 + run * 10),
                STUDYFLOW_E2E_WEB_PORT: String(43_175 + run * 10),
            },
        });
    }
    commands.push(
        {
            ...command("e2e-critical-cross-browser", webRoot, npm, [
                "run",
                "test:e2e",
                "--",
                "--project=firefox-critical",
                "--project=webkit-critical",
                "--reporter=line",
            ]),
            env: {
                STUDYFLOW_E2E_REUSE_SERVERS: "false",
                STUDYFLOW_E2E_RUN_ID: "local-release-cross-browser",
                STUDYFLOW_E2E_API_PORT: "43140",
                STUDYFLOW_E2E_WEB_PORT: "43215",
            },
        },
        command("readiness-negative-live", apiRoot, process.execPath, [
            "src/scripts/smoke-readiness-negative.mjs",
        ]),
        command("smoke-200-authenticated", apiRoot, npm, ["run", "smoke:200-users"]),
    );
    return commands;
}

/** Valida configuração local sem imprimir qualquer valor sensível. */
export async function assertLocalReleaseConfiguration(
    env: NodeJS.ProcessEnv,
    apiRoot: string,
    webRoot: string,
): Promise<void> {
    const activeE2eVariables = listActiveE2eVariables(env);
    if (activeE2eVariables.length > 0) {
        throw new Error(
            `A release local recusa configuração E2E ativa: ${activeE2eVariables.join(", ")}.`,
        );
    }
    if (process.version !== `v${EXPECTED_NODE}`) {
        throw new Error(`Node deve ser exatamente ${EXPECTED_NODE}.`);
    }
    if (
        env.STUDYFLOW_DEPLOYMENT_SCOPE !== "local-pap" ||
        env.HOST !== "127.0.0.1" ||
        env.STUDYFLOW_TRUST_PROXY !== "false"
    ) {
        throw new Error("O gate exige scope local-pap, HOST loopback e trust proxy desligado.");
    }
    assertMongoConfiguration(env.MONGODB_URI);
    assertRedisConfiguration(env.REDIS_URL);
    const storage = env.MATERIALS_STORAGE_DIR?.trim();
    if (!storage || !isAbsolute(storage) || !/^studyflow-/.test(basename(storage))) {
        throw new Error("MATERIALS_STORAGE_DIR tem de ser um diretório absoluto dedicado.");
    }
    if (!env.STUDYFLOW_RELEASE_SNAPSHOT_ROOT || !env.STUDYFLOW_RELEASE_SNAPSHOT_KEY) {
        throw new Error("Configura a raiz e chave do snapshot de release.");
    }
    if (
        !env.STUDYFLOW_NEGATIVE_READINESS_URL ||
        !(env.STUDYFLOW_SMOKE_COOKIE ||
            (env.STUDYFLOW_SMOKE_EMAIL && env.STUDYFLOW_SMOKE_PASSWORD))
    ) {
        throw new Error("Faltam os alvos locais dos smokes negativo e autenticado.");
    }
    assertLoopbackSmokeConfiguration(env);
    for (const root of [apiRoot, webRoot]) {
        const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
        if (
            packageJson.packageManager !== `npm@${EXPECTED_NPM}` ||
            packageJson.engines?.node !== EXPECTED_NODE ||
            packageJson.engines?.npm !== EXPECTED_NPM
        ) {
            throw new Error("packageManager/engines não coincidem com a baseline fixada.");
        }
        await readFile(resolve(root, "package-lock.json"));
    }
}

/** Impede que o gate envie cookies ou passwords para um destino configurável remoto. */
function assertLoopbackSmokeConfiguration(env: NodeJS.ProcessEnv): void {
    const base = new URL(env.STUDYFLOW_BASE_URL ?? "http://127.0.0.1:3000");
    if (
        base.protocol !== "http:" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname.toLowerCase()) ||
        base.username ||
        base.password ||
        base.pathname !== "/" ||
        base.search ||
        base.hash ||
        (env.STUDYFLOW_SMOKE_PATH ?? "/api/auth/me") !== "/api/auth/me"
    ) {
        throw new Error("O smoke autenticado só pode usar /api/auth/me numa origem HTTP loopback.");
    }

    const readiness = new URL(env.STUDYFLOW_NEGATIVE_READINESS_URL!);
    if (
        readiness.protocol !== "http:" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(
            readiness.hostname.toLowerCase(),
        ) ||
        !["/api/health", "/api/health/ready"].includes(readiness.pathname) ||
        readiness.username ||
        readiness.password ||
        readiness.search ||
        readiness.hash
    ) {
        throw new Error("O smoke de readiness só pode usar um endpoint health HTTP loopback.");
    }
}

/** Confirmações humanas ficam ligadas ao hash que foi efetivamente validado. */
export function assertManualGates(env: NodeJS.ProcessEnv, sha256: string): void {
    const gates = [
        "STUDYFLOW_RELEASE_RESTORE_DRILL_SHA256",
        "STUDYFLOW_RELEASE_CRASH_RECOVERY_SHA256",
        "STUDYFLOW_RELEASE_CROSS_BROWSER_SHA256",
    ];
    const missing = gates.filter((name) => env[name] !== sha256);
    if (missing.length > 0) {
        throw new Error(`Gates manuais em falta ou obsoletos: ${missing.join(", ")}.`);
    }
}

async function verifyLocalRelease(): Promise<void> {
    const apiRoot = resolve(process.cwd());
    const webRoot = resolve(apiRoot, "../web");
    const commands = buildReleaseCommands(apiRoot, webRoot);
    if (process.argv.includes("--list")) {
        console.log(JSON.stringify({ ok: true, steps: commands.map(({ id }) => id) }, null, 2));
        return;
    }
    const steps: ReleaseStepResult[] = [];
    let implementationSha256: string | undefined;
    try {
        const initialHash = await readImplementationHash(apiRoot);
        implementationSha256 = initialHash;
        await assertLocalReleaseConfiguration(process.env, apiRoot, webRoot);
        const npmVersion = (await runCommand(command("npm-version", apiRoot, "npm", ["--version"]))).stdout.trim();
        if (npmVersion !== EXPECTED_NPM) throw new Error(`npm deve ser exatamente ${EXPECTED_NPM}.`);

        assertManualGates(process.env, initialHash);
        for (const step of commands) {
            try {
                await runCommand(step);
                steps.push({ id: step.id, status: "PASS", exitCode: 0 });
            } catch (error) {
                const exitCode = error instanceof ReleaseCommandError ? error.exitCode : 1;
                steps.push({ id: step.id, status: "FAIL", exitCode });
                throw error;
            }
        }
        const finalHash = await readImplementationHash(apiRoot);
        if (finalHash !== initialHash) {
            throw new Error("A implementação mudou durante o gate; toda a evidence foi invalidada.");
        }

        const snapshot = parseJsonOutput(
            (await runCommand(command("release-snapshot", apiRoot, "npm", ["run", "release:snapshot"]))).stdout,
        ) as { implementationSha256?: unknown; snapshotId?: unknown };
        if (snapshot.implementationSha256 !== finalHash || typeof snapshot.snapshotId !== "string") {
            throw new Error("O snapshot final não corresponde ao manifesto validado.");
        }
        console.log(JSON.stringify({
            ok: true,
            status: "PASS",
            target: "PAP_LOCAL_ENDURECIDA",
            implementationSha256: finalHash,
            snapshotId: snapshot.snapshotId,
            steps,
            blockers: [],
        }));
    } catch (error) {
        const failure = sanitiseReleaseFailure(error);
        console.error(JSON.stringify({
            ok: false,
            status: failure.blockers.some((blocker) => blocker.startsWith("OP-"))
                ? "BLOQUEADO_OPERADOR"
                : "FALHOU",
            target: "PAP_LOCAL_ENDURECIDA",
            ...(implementationSha256 ? { implementationSha256 } : {}),
            steps,
            blockers: failure.blockers,
            error: failure.message,
        }));
        throw error;
    }
}

/**
 * Converts a release failure to a stable summary without URIs, credentials,
 * cookies, bodies or other operator-provided values.
 */
export function sanitiseReleaseFailure(error: unknown): {
    message: string;
    blockers: string[];
} {
    const raw = error instanceof Error ? error.message : "Falha no gate local.";
    const message = raw
        .replace(/\b(?:mongodb(?:\+srv)?|redis|https?):\/\/\S+/gi, "<redacted-uri>")
        .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, "<redacted-key>")
        .replace(/\bsf_sid=[^\s;,]+/gi, "sf_sid=<redacted>")
        .replace(/\b(password|secret|token|cookie)\s*[=:]\s*\S+/gi, "$1=<redacted>");
    const blockers = new Set<string>();
    if (
        /scope local-pap|HOST loopback|trust proxy|MONGODB_URI|MongoDB|REDIS_URL|Redis|MATERIALS_STORAGE_DIR|smoke autenticado|readiness/i.test(
            message,
        )
    ) {
        blockers.add("OP-001");
    }
    if (/Gates manuais|RESTORE_DRILL/i.test(message)) blockers.add("OP-005");
    if (blockers.size === 0) blockers.add("AUTOMATED_GATE_FAILURE");
    return { message, blockers: [...blockers] };
}

async function readImplementationHash(apiRoot: string): Promise<string> {
    const result = await runCommand(command("implementation-manifest", apiRoot, "npm", ["run", "manifest:hash"]));
    const parsed = parseJsonOutput(result.stdout) as { sha256?: unknown };
    if (typeof parsed.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(parsed.sha256)) {
        throw new Error("O gerador de manifesto não devolveu SHA-256 válido.");
    }
    return parsed.sha256;
}

function command(id: string, cwd: string, executable: string, args: string[]): ReleaseCommand {
    return { id, cwd, command: executable, args };
}

const runCommand: CommandRunner = async (step) => {
    console.log(JSON.stringify({ gate: step.id, status: "START" }));
    const child = spawn(step.command, step.args, {
        cwd: step.cwd,
        env: { ...process.env, ...step.env },
        stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
        process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => process.stderr.write(chunk));
    const exitCode = await new Promise<number>((resolveExit, reject) => {
        child.once("error", reject);
        child.once("close", (code) => resolveExit(code ?? 1));
    });
    if (exitCode !== 0) throw new ReleaseCommandError(step.id, exitCode);
    console.log(JSON.stringify({ gate: step.id, status: "PASS", exitCode }));
    return { stdout };
};

function parseJsonOutput(output: string): unknown {
    const candidates = output.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("{")).reverse();
    for (const candidate of candidates) {
        try { return JSON.parse(candidate); } catch { /* procura a linha JSON anterior */ }
    }
    throw new Error("Um comando operacional não devolveu JSON válido.");
}

function assertMongoConfiguration(rawUri: string | undefined): void {
    if (!rawUri) throw new Error("MONGODB_URI é obrigatória.");
    const uri = new URL(rawUri);
    if (
        uri.protocol !== "mongodb:" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname.toLowerCase()) ||
        uri.username || uri.password || uri.searchParams.get("replicaSet") !== "studyflow-rs"
    ) throw new Error("MongoDB deve ser loopback, sem userinfo e replicaSet=studyflow-rs.");
}

function assertRedisConfiguration(rawUri: string | undefined): void {
    if (!rawUri) throw new Error("REDIS_URL é obrigatória.");
    const uri = new URL(rawUri);
    const database = Number(uri.pathname.slice(1));
    if (
        uri.protocol !== "redis:" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname.toLowerCase()) ||
        uri.username || uri.password || !Number.isInteger(database) || database < 1 || database > 15
    ) throw new Error("Redis deve ser loopback, sem userinfo e usar uma DB dedicada 1..15.");
}

if (process.argv[1]?.endsWith("verify-local-release.js")) {
    verifyLocalRelease().catch(() => {
        process.exitCode = 1;
    });
}
