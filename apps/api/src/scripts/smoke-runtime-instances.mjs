import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const DEFAULT_TIMEOUT_MS = 30000;
const LOCAL_PORTS = [
    Number.parseInt(process.env.STUDYFLOW_RUNTIME_PORT_A ?? "3301", 10),
    Number.parseInt(process.env.STUDYFLOW_RUNTIME_PORT_B ?? "3302", 10),
];
const localMode = process.argv.includes("--local");

let mongoServer;
const childProcesses = [];

/**
 * Reads a positive integer environment knob without accepting bad evidence.
 *
 * @param {string} name Environment variable name.
 * @param {number} fallback Default value.
 * @returns {number} Parsed positive integer.
 * @throws {Error} When the configured value is invalid.
 */
function readPositiveInteger(name, fallback) {
    const rawValue = process.env[name];
    const value = rawValue === undefined ? fallback : Number.parseInt(rawValue, 10);

    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${name} deve ser um numero inteiro positivo.`);
    }

    return value;
}

/**
 * Fetches one runtime endpoint and keeps only technical metadata.
 *
 * @param {string} url Runtime endpoint URL.
 * @returns {Promise<{ url: string, instanceId: string, sessionStore: string, persistentStore: string }>} Safe response metadata.
 */
async function fetchRuntimeInstance(url) {
    const response = await fetch(url, {
        headers: { "user-agent": "studyflow-mf6-runtime-smoke" },
    });

    if (!response.ok) {
        if (response.body) await response.body.cancel();
        throw new Error(`${url} devolveu status ${response.status}.`);
    }

    const body = await response.json();
    const serialized = JSON.stringify(body);
    if (/cookie|email|password|sessionId|userId/i.test(serialized)) {
        throw new Error(`${url} expos dados privados no endpoint tecnico.`);
    }

    if (
        typeof body.instanceId !== "string" ||
        body.sessionStore !== "redis" ||
        body.persistentStore !== "mongodb"
    ) {
        throw new Error(`${url} devolveu contrato runtime inesperado.`);
    }

    return {
        url,
        instanceId: body.instanceId,
        sessionStore: body.sessionStore,
        persistentStore: body.persistentStore,
    };
}

/**
 * Repeatedly polls a URL until the API instance is ready.
 *
 * @param {string} url Runtime endpoint URL.
 * @returns {Promise<void>} Resolves when the endpoint responds with valid JSON.
 */
async function waitForRuntimeEndpoint(url) {
    const deadline = Date.now() + readPositiveInteger(
        "STUDYFLOW_RUNTIME_TIMEOUT_MS",
        DEFAULT_TIMEOUT_MS,
    );
    let lastError;

    while (Date.now() < deadline) {
        try {
            await fetchRuntimeInstance(url);
            return;
        } catch (error) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    throw lastError ?? new Error(`${url} nao ficou pronto dentro do timeout.`);
}

/**
 * Starts one real compiled API process with an isolated instance identifier.
 *
 * @param {string} mongoUri MongoDB URI shared by both local smoke instances.
 * @param {number} port HTTP port for this API process.
 * @param {string} instanceId Stable instance identifier expected in the response.
 * @returns {import("node:child_process").ChildProcess} Spawned API process.
 */
function startLocalApi(mongoUri, port, instanceId) {
    const child = spawn(process.execPath, ["dist/main.js"], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            NODE_ENV: "test",
            MONGODB_URI: mongoUri,
            PORT: String(port),
            WEB_ORIGIN: "http://127.0.0.1:4175",
            STUDYFLOW_E2E_FAKE_AI: "true",
            STUDYFLOW_E2E_IN_MEMORY_REDIS: "true",
            STUDYFLOW_INSTANCE_ID: instanceId,
        },
        stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout?.on("data", () => undefined);
    child.stderr?.on("data", () => undefined);
    childProcesses.push(child);
    return child;
}

/**
 * Runs the smoke against two local full API processes.
 *
 * @returns {Promise<string[]>} Runtime endpoint URLs to validate.
 */
async function startLocalInstances() {
    if (!existsSync("dist/main.js")) {
        throw new Error(
            "dist/main.js nao existe. Executa npm run build antes do smoke local.",
        );
    }

    mongoServer = await MongoMemoryServer.create({
        instance: { dbName: "studyflow_runtime_smoke" },
    });
    const mongoUri = mongoServer.getUri();

    startLocalApi(mongoUri, LOCAL_PORTS[0], "studyflow-runtime-a");
    startLocalApi(mongoUri, LOCAL_PORTS[1], "studyflow-runtime-b");

    const urls = LOCAL_PORTS.map(
        (port) => `http://127.0.0.1:${port}/api/runtime/instance`,
    );
    await Promise.all(urls.map((url) => waitForRuntimeEndpoint(url)));
    return urls;
}

/**
 * Resolves target URLs for either local or external smoke mode.
 *
 * @returns {Promise<string[]>} URLs to request.
 */
async function resolveUrls() {
    if (localMode) {
        return startLocalInstances();
    }

    const rawUrls = process.env.STUDYFLOW_RUNTIME_INSTANCE_URLS;
    if (!rawUrls) {
        throw new Error(
            "Define STUDYFLOW_RUNTIME_INSTANCE_URLS ou usa npm run smoke:runtime-instances:local.",
        );
    }

    const urls = rawUrls
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    if (urls.length === 0) {
        throw new Error("STUDYFLOW_RUNTIME_INSTANCE_URLS nao contem URLs validos.");
    }
    return urls;
}

/**
 * Builds the request list. A single proxy URL is requested several times so a
 * load balancer can prove that at least two instance identifiers appear.
 *
 * @param {string[]} urls Runtime endpoint URLs.
 * @returns {string[]} URLs expanded into concrete requests.
 */
function buildRequestUrls(urls) {
    if (urls.length > 1) {
        return urls;
    }

    const requestCount = readPositiveInteger("STUDYFLOW_RUNTIME_REQUESTS", 4);
    return Array.from({ length: requestCount }, () => urls[0]);
}

/**
 * Stops child processes and the embedded MongoDB server.
 *
 * @returns {Promise<void>} Resolves after best-effort cleanup.
 */
async function cleanup() {
    for (const child of childProcesses) {
        if (!child.killed) {
            child.kill("SIGTERM");
        }
    }
    await mongoServer?.stop();
}

try {
    const urls = await resolveUrls();
    const results = await Promise.all(buildRequestUrls(urls).map(fetchRuntimeInstance));
    const instanceIds = [...new Set(results.map((result) => result.instanceId))];

    const summary = {
        mode: localMode ? "local-two-instances" : "external-urls",
        requestCount: results.length,
        distinctInstanceCount: instanceIds.length,
        instanceIds,
        sessionStores: [...new Set(results.map((result) => result.sessionStore))],
        persistentStores: [...new Set(results.map((result) => result.persistentStore))],
        privateDataDetected: false,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (instanceIds.length < 2) {
        throw new Error("O smoke nao observou pelo menos duas instancias distintas.");
    }
} finally {
    await cleanup();
}
