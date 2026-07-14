/** Testes do contrato fail-closed sem executar processos externos. */
import {
    assertLocalReleaseConfiguration,
    buildReleaseCommands,
    assertManualGates,
    sanitiseReleaseFailure,
} from "./verify-local-release.js";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("gate da release local", () => {
    it("inclui todas as classes de prova e três E2E isolados", () => {
        const ids = buildReleaseCommands("/tmp/api", "/tmp/web").map(({ id }) => id);
        expect(ids).toEqual(expect.arrayContaining([
            "secrets", "documentation", "api-clean-install", "api-build", "api-unit-integration-contracts",
            "technical-map-canonical", "api-dependency-audit", "restore-synthetic", "readiness-negative-unit",
            "jobs-crash-recovery", "web-clean-install", "web-coverage", "web-build",
            "web-bundle-budget", "web-dependency-audit", "readiness-negative-live",
            "smoke-200-authenticated", "e2e-critical-cross-browser",
        ]));
        expect(ids.filter((id) => id.startsWith("e2e-isolated-"))).toHaveLength(3);
        const e2e = buildReleaseCommands("/tmp/api", "/tmp/web").filter(({ id }) => id.startsWith("e2e-"));
        expect(new Set(e2e.map(({ env }) => env?.STUDYFLOW_E2E_RUN_ID)).size).toBe(4);
        expect(new Set(e2e.map(({ env }) => env?.STUDYFLOW_E2E_API_PORT)).size).toBe(4);
    });

    it("liga todos os gates manuais ao mesmo manifesto", () => {
        const sha256 = "a".repeat(64);
        expect(() => assertManualGates({
            STUDYFLOW_RELEASE_RESTORE_DRILL_SHA256: sha256,
            STUDYFLOW_RELEASE_CRASH_RECOVERY_SHA256: sha256,
            STUDYFLOW_RELEASE_CROSS_BROWSER_SHA256: sha256,
        }, sha256)).not.toThrow();
        expect(() => assertManualGates({}, sha256)).toThrow("Gates manuais");
    });

    it("sanitiza o resumo bloqueado e devolve apenas IDs de blocker", () => {
        const failure = sanitiseReleaseFailure(
            new Error("MONGODB_URI mongodb://user:password@remote.test/db e cookie=valor"),
        );
        expect(failure).toEqual({
            message: "MONGODB_URI <redacted-uri> e cookie=<redacted>",
            blockers: ["OP-001"],
        });
        expect(JSON.stringify(failure)).not.toContain("password@remote");
    });

    it("recusa enviar credenciais do smoke para uma origem remota", async () => {
        const { apiRoot, webRoot } = await makePackageRoots();
        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({ STUDYFLOW_BASE_URL: "https://example.test" }),
                apiRoot,
                webRoot,
            ),
        ).rejects.toThrow("smoke autenticado");
    });

    it("recusa paths arbitrários no smoke autenticado", async () => {
        const { apiRoot, webRoot } = await makePackageRoots();
        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({ STUDYFLOW_SMOKE_PATH: "/api/admin/users" }),
                apiRoot,
                webRoot,
            ),
        ).rejects.toThrow("smoke autenticado");
    });

    it.each([
        ["STUDYFLOW_E2E_MODE", "true"],
        ["STUDYFLOW_E2E_FAKE_AI", "true"],
        ["STUDYFLOW_E2E_IN_MEMORY_REDIS", "true"],
        ["STUDYFLOW_E2E_SEED_AI_GOVERNANCE", "true"],
        ["STUDYFLOW_E2E_RUN_ID", "release-contaminada"],
    ])("recusa a variável E2E ativa %s", async (name, value) => {
        const { apiRoot, webRoot } = await makePackageRoots();
        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({ [name]: value }),
                apiRoot,
                webRoot,
            ),
        ).rejects.toThrow(name);
    });

    it("ignora flags E2E explicitamente desativadas", async () => {
        const { apiRoot, webRoot } = await makePackageRoots();
        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({
                    STUDYFLOW_E2E_MODE: "false",
                    STUDYFLOW_E2E_FAKE_AI: "0",
                    STUDYFLOW_E2E_IN_MEMORY_REDIS: "",
                }),
                apiRoot,
                webRoot,
            ),
        ).resolves.toBeUndefined();
    });

    it("aceita Atlas autenticado sem expor a API fora de loopback", async () => {
        const { apiRoot, webRoot } = await makePackageRoots();

        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({
                    MONGODB_URI:
                        "mongodb+srv://pap-user:secret@paps.example.mongodb.net/studyflow?appName=StudyFlow",
                }),
                apiRoot,
                webRoot,
            ),
        ).resolves.toBeUndefined();
    });

    it("recusa um MongoDB remoto que não seja Atlas", async () => {
        const { apiRoot, webRoot } = await makePackageRoots();

        await expect(
            assertLocalReleaseConfiguration(
                makeEnvironment({
                    MONGODB_URI:
                        "mongodb://db.example.test:27017/studyflow?replicaSet=studyflow-rs",
                }),
                apiRoot,
                webRoot,
            ),
        ).rejects.toThrow("loopback");
    });
});

function makeEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    return {
        STUDYFLOW_DEPLOYMENT_SCOPE: "local-pap",
        HOST: "127.0.0.1",
        STUDYFLOW_TRUST_PROXY: "false",
        MONGODB_URI:
            "mongodb://127.0.0.1:27017/studyflow_test?replicaSet=studyflow-rs",
        REDIS_URL: "redis://127.0.0.1:6379/2",
        MATERIALS_STORAGE_DIR: "/tmp/studyflow-test-materials",
        STUDYFLOW_RELEASE_SNAPSHOT_ROOT: "/tmp/studyflow-test-snapshots",
        STUDYFLOW_RELEASE_SNAPSHOT_KEY: "test-only-key",
        STUDYFLOW_NEGATIVE_READINESS_URL:
            "http://127.0.0.1:3999/api/health/ready",
        STUDYFLOW_SMOKE_COOKIE: `sf_sid=${"a".repeat(32)}`,
        ...overrides,
    };
}

async function makePackageRoots(): Promise<{ apiRoot: string; webRoot: string }> {
    const root = await mkdtemp(join(tmpdir(), "studyflow-release-config-"));
    const apiRoot = join(root, "api");
    const webRoot = join(root, "web");
    const { mkdir } = await import("node:fs/promises");
    await Promise.all([
        mkdir(apiRoot, { recursive: true }),
        mkdir(webRoot, { recursive: true }),
    ]);
    const packageJson = JSON.stringify({
        packageManager: "npm@11.6.2",
        engines: { node: "24.11.1", npm: "11.6.2" },
    });
    await Promise.all([
        writeFile(join(apiRoot, "package.json"), packageJson),
        writeFile(join(apiRoot, "package-lock.json"), "{}"),
        writeFile(join(webRoot, "package.json"), packageJson),
        writeFile(join(webRoot, "package-lock.json"), "{}"),
    ]);
    return { apiRoot, webRoot };
}
