/**
 * Configura a ferramenta associada a playwright.config.ts para o ambiente real_dev da StudyFlow.
 */
import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const generatedPortBase = 43_000 + (process.pid % 500) * 2;
const apiPort = readPort("STUDYFLOW_E2E_API_PORT", generatedPortBase);
const webPort = readPort("STUDYFLOW_E2E_WEB_PORT", generatedPortBase + 1);
const apiUrl = `http://127.0.0.1:${apiPort}`;
const webUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${webPort}`;
const startServers = process.env.STUDYFLOW_E2E_START_SERVERS !== "false";
const reuseExistingServer =
    process.env.STUDYFLOW_E2E_REUSE_SERVERS === "true";
const runId = readRunId(
    process.env.STUDYFLOW_E2E_RUN_ID ?? `${Date.now()}-${process.pid}`,
);
const captureArtifacts =
    process.env.STUDYFLOW_E2E_CAPTURE_ARTIFACTS === "true";
const artifactRoot = resolve(tmpdir(), "studyflow-e2e", runId);

assertLoopbackUrl(webUrl, "PLAYWRIGHT_BASE_URL");

const apiCommand = [
    `PORT=${shellQuote(String(apiPort))}`,
    `WEB_ORIGIN=${shellQuote(webUrl)}`,
    `STUDYFLOW_E2E_RUN_ID=${shellQuote(runId)}`,
    "npm --prefix ../api run start:e2e",
].join(" ");

export default defineConfig({
    testDir: "./tests/e2e",
    globalSetup: "./tests/e2e/global-setup.ts",
    globalTeardown: "./tests/e2e/global-teardown.ts",
    outputDir: resolve(artifactRoot, "test-results"),
    metadata: {
        studyflowApiUrl: apiUrl,
        studyflowWebUrl: webUrl,
        studyflowArtifactRoot: artifactRoot,
        runId,
    },
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    // A suite usa duas contas seedadas e valida percursos mutáveis sobre a
    // mesma base efémera. Um worker preserva determinismo entre ficheiros;
    // o isolamento relevante continua a ser um Mongo/storage por execução.
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: captureArtifacts
        ? [
              ["list"],
              [
                  "html",
                  {
                      open: "never",
                      outputFolder: resolve(artifactRoot, "playwright-report"),
                  },
              ],
          ]
        : [["list"]],
    use: {
        baseURL: webUrl,
        trace: captureArtifacts ? "retain-on-failure" : "off",
        screenshot: captureArtifacts ? "only-on-failure" : "off",
        video: captureArtifacts ? "retain-on-failure" : "off",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox-critical",
            testMatch:
                /(?:mf1-smoke|mf5-accessibility|mf5-responsive-layout)\.spec\.ts/,
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit-critical",
            testMatch:
                /(?:mf1-smoke|mf5-accessibility|mf5-responsive-layout)\.spec\.ts/,
            use: { ...devices["Desktop Safari"] },
        },
    ],
    webServer: startServers
        ? [
              {
                  command: apiCommand,
                  url: `${apiUrl}/api/health`,
                  reuseExistingServer,
                  timeout: 120_000,
              },
              {
                  // O cross-browser valida os chunks de release; o servidor
                  // HMR pode reescrever imports durante a própria execução e
                  // produzir falhas espúrias de module script no WebKit.
                  command:
                      `VITE_API_PROXY_TARGET=${shellQuote(apiUrl)} ` +
                      `STUDYFLOW_E2E_API_PORT=${shellQuote(String(apiPort))} ` +
                      "npm run build && " +
                      `VITE_API_PROXY_TARGET=${shellQuote(apiUrl)} ` +
                      `STUDYFLOW_E2E_API_PORT=${shellQuote(String(apiPort))} ` +
                      `npm run preview -- --host 127.0.0.1 --port ${webPort}`,
                  url: webUrl,
                  reuseExistingServer,
                  timeout: 90_000,
              },
          ]
        : undefined,
});

/** Aceita apenas portas TCP não privilegiadas e evita comandos ambíguos. */
function readPort(name: string, fallback: number): number {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isInteger(value) || value < 1_024 || value > 65_535) {
        throw new Error(`${name} tem de ser uma porta entre 1024 e 65535.`);
    }
    return value;
}

/** Limita o identificador usado em paths temporários e variáveis shell. */
function readRunId(value: string): string {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(value)) {
        throw new Error("STUDYFLOW_E2E_RUN_ID contém caracteres inválidos.");
    }
    return value;
}

/** O browser E2E só pode apontar para a própria máquina. */
function assertLoopbackUrl(value: string, name: string): void {
    const url = new URL(value);
    if (
        !["http:", "https:"].includes(url.protocol) ||
        !["127.0.0.1", "localhost", "[::1]"].includes(
            url.hostname.toLowerCase(),
        ) ||
        url.username ||
        url.password
    ) {
        throw new Error(`${name} tem de ser uma URL loopback sem credenciais.`);
    }
}

/** Protege valores interpolados no comando shell exigido pelo Playwright. */
function shellQuote(value: string): string {
    return `'${value.replaceAll("'", `'"'"'`)}'`;
}
