/**
 * Automatiza tarefas operacionais usadas em desenvolvimento e validação.
 */
import { spawn } from "child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Contrato de scripts operacionais que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type E2eEnvironment = NodeJS.ProcessEnv & {
    MONGODB_URI: string;
    PORT: string;
    WEB_ORIGIN: string;
    STUDYFLOW_E2E_FAKE_AI: string;
    STUDYFLOW_E2E_IN_MEMORY_REDIS: string;
};

let mongoServer: MongoMemoryServer | undefined;
let apiProcess: ReturnType<typeof spawn> | undefined;
let isShuttingDown = false;

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
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    mongoServer = await MongoMemoryServer.create({
        instance: { dbName: "studyflow_e2e" },
    });
    return mongoServer.getUri();
}

/**
 * Cria fixture ou estrutura auxiliar de scripts operacionais para manter testes e prompts legíveis.
 *
 * @param mongoUri Valor de mongoUri usado pela função para executar build environment com dados explícitos.
 * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
 */
function buildEnvironment(mongoUri: string): E2eEnvironment {
    return {
        ...process.env,
        MONGODB_URI: mongoUri,
        PORT: process.env.PORT ?? "3000",
        WEB_ORIGIN: process.env.WEB_ORIGIN ?? "http://127.0.0.1:4175",
        STUDYFLOW_E2E_FAKE_AI: "true",
        STUDYFLOW_E2E_IN_MEMORY_REDIS:
            process.env.STUDYFLOW_E2E_IN_MEMORY_REDIS ??
            (process.env.REDIS_URL ? "false" : "true"),
    };
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
    await mongoServer?.stop();
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
