/**
 * Automatiza tarefas operacionais usadas em desenvolvimento e validação.
 */
import { spawn } from "child_process";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { assertStudyFlowDirectory } from "../common/storage/dedicated-local-directory.js";
import { stopE2eMongoSafely } from "./e2e-mongo-cleanup.js";

/**
 * Contrato de scripts operacionais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type E2eEnvironment = NodeJS.ProcessEnv & {
    MONGODB_URI: string;
    PORT: string;
    WEB_ORIGIN: string;
    STUDYFLOW_E2E_FAKE_AI: string;
    STUDYFLOW_E2E_IN_MEMORY_REDIS: string;
    STUDYFLOW_E2E_MODE: string;
    STUDYFLOW_E2E_SEED_AI_GOVERNANCE: string;
    STUDYFLOW_ALLOW_DEV_SEED: string;
    STUDYFLOW_DEPLOYMENT_SCOPE: string;
    MATERIALS_STORAGE_DIR: string;
    HOST: string;
    NODE_ENV: string;
};

let mongoServer: MongoMemoryReplSet | undefined;
let apiProcess: ReturnType<typeof spawn> | undefined;
let isShuttingDown = false;
let storageDirectory: string | undefined;

/**
 * Arranca a API em modo E2E com MongoDB embebido quando não existe MONGODB_URI.
 * O processo faz seed dos utilizadores de desenvolvimento e mantém o servidor
 * NestJS vivo até o Playwright terminar. Redis é substituído por memória apenas
 * neste modo para evitar dependência de serviços locais durante a suite E2E.
 *
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function main(): Promise<void> {
    const mongoUri = await resolveMongoUri();
    const environment = buildEnvironment(mongoUri);

    await runNodeScript("dist/scripts/seed-development-users.js", environment);

    apiProcess = spawn(process.execPath, ["dist/main.js"], {
        env: environment,
        stdio: "inherit",
    });

    apiProcess.once("exit", (code, signal) => {
        void cleanup().finally(() => {
            if (typeof code === "number") {
                process.exit(code);
            }
            process.exit(signal ? 0 : 1);
        });
    });
}

/**
 * Executa a operação resolve mongo uri no domínio de scripts operacionais com contrato explícito.
 *
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
async function resolveMongoUri(): Promise<string> {
    mongoServer = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            // A política comum aceita este nome também para bases E2E isoladas.
            name: "studyflow-rs",
            storageEngine: "wiredTiger",
            dbName: "studyflow_e2e",
        },
    });
    return mongoServer.getUri("studyflow_e2e");
}

/**
 * Cria fixture ou estrutura auxiliar de scripts operacionais para manter testes e prompts legíveis.
 *
 * @param mongoUri Valor de mongoUri usado pela função para executar build environment com dados explícitos.
 * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
 */
function buildEnvironment(mongoUri: string): E2eEnvironment {
    const runId = readRunId(
        process.env.STUDYFLOW_E2E_RUN_ID ?? `${Date.now()}-${process.pid}`,
    );
    storageDirectory = resolve(
        tmpdir(),
        `studyflow-e2e-storage-${runId}-${process.pid}-${randomUUID()}`,
    );
    return {
        ...process.env,
        MONGODB_URI: mongoUri,
        PORT: process.env.PORT ?? "3000",
        WEB_ORIGIN: process.env.WEB_ORIGIN ?? "http://127.0.0.1:4175",
        HOST: "127.0.0.1",
        NODE_ENV: "test",
        STUDYFLOW_ALLOW_DEV_SEED: "true",
        STUDYFLOW_DEPLOYMENT_SCOPE: "local-pap",
        STUDYFLOW_E2E_MODE: "true",
        STUDYFLOW_E2E_FAKE_AI: "true",
        STUDYFLOW_E2E_SEED_AI_GOVERNANCE: "true",
        STUDYFLOW_RELEASE_VERSION: `e2e-${runId}`,
        MATERIALS_STORAGE_DIR: storageDirectory,
        REDIS_URL: undefined,
        STUDYFLOW_E2E_IN_MEMORY_REDIS: "true",
    };
}

/** Evita path traversal no diretório temporário dedicado à execução. */
function readRunId(value: string): string {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(value)) {
        throw new Error("STUDYFLOW_E2E_RUN_ID contém caracteres inválidos.");
    }
    return value;
}

/**
 * Executa a operação run node script no domínio de scripts operacionais com contrato explícito.
 *
 * @param scriptPath Caminho de ficheiro ou rota usado para localizar a origem ou destino da operação.
 * @param environment Valor de environment usado pela função para executar run node script com dados explícitos.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function runNodeScript(
    scriptPath: string,
    environment: E2eEnvironment,
): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const child = spawn(process.execPath, [scriptPath], {
            env: environment,
            stdio: "inherit",
        });
        child.once("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${scriptPath} terminou com codigo ${code ?? 1}.`));
        });
    });
}

/**
 * Remove ruído ou conteúdo perigoso antes de usar o valor no fluxo de scripts operacionais.
 *
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function cleanup(): Promise<void> {
    const stoppedHere = await stopE2eMongoSafely(mongoServer);
    if (!stoppedHere) {
        console.warn(
            "[studyflow-e2e] Mongo efémero já estava parado durante o cleanup.",
        );
    }
    if (storageDirectory) {
        await assertStudyFlowDirectory(
            storageDirectory,
            "material-storage",
        )
            .then(() => rm(storageDirectory!, { recursive: true, force: true }))
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code !== "ENOENT") throw error;
            });
    }
}

/**
 * Executa a operação shutdown no domínio de scripts operacionais com contrato explícito.
 *
 * @param signal Sinal usado para encerrar processos de forma previsível.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
function shutdown(signal: NodeJS.Signals): void {
    if (isShuttingDown) return;
    isShuttingDown = true;

    if (apiProcess && !apiProcess.killed) {
        apiProcess.kill(signal);
        return;
    }

    void cleanup().finally(() => process.exit(0));
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[studyflow-e2e] ${message}`);
    void cleanup().finally(() => process.exit(1));
});
