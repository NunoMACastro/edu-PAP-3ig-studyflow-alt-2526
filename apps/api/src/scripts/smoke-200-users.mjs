import { performance } from "node:perf_hooks";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_PATH = "/api/auth/me";
const DEFAULT_USERS = 200;
const DEFAULT_EXPECTED_STATUS = 200;

const baseUrl = process.env.STUDYFLOW_BASE_URL ?? DEFAULT_BASE_URL;
const path = process.env.STUDYFLOW_SMOKE_PATH ?? DEFAULT_PATH;
const concurrency = readPositiveInteger("STUDYFLOW_SMOKE_USERS", DEFAULT_USERS);
const expectedStatus = readPositiveInteger(
    "STUDYFLOW_SMOKE_EXPECTED_STATUS",
    DEFAULT_EXPECTED_STATUS,
);
const schoolContext =
    process.env.STUDYFLOW_SMOKE_SCHOOL_CONTEXT ?? "escola-teste-isolada";
const url = new URL(path, baseUrl).toString();
const cookie = await resolveSmokeCookie();

/**
 * Reads a positive integer from the environment without silently accepting bad evidence.
 *
 * @param {string} name Environment variable name.
 * @param {number} fallback Value used when the variable is not defined.
 * @returns {number} Positive integer used by the smoke run.
 * @throws {Error} When the configured value is missing semantic validity.
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
 * Resolves an authenticated smoke cookie without exposing it in process output.
 *
 * `STUDYFLOW_SMOKE_COOKIE` remains the most explicit option. Test/staging
 * environments can instead provide seed credentials through
 * `STUDYFLOW_SMOKE_EMAIL` and `STUDYFLOW_SMOKE_PASSWORD`; the script then logs
 * in against the real auth endpoint and keeps only the opaque `sf_sid` pair.
 *
 * @returns {Promise<string>} Cookie header value safe to send to the smoke target.
 * @throws {Error} When neither an explicit cookie nor valid smoke credentials exist.
 */
async function resolveSmokeCookie() {
    if (process.env.STUDYFLOW_SMOKE_COOKIE) {
        return process.env.STUDYFLOW_SMOKE_COOKIE;
    }

    const email = process.env.STUDYFLOW_SMOKE_EMAIL;
    const password = process.env.STUDYFLOW_SMOKE_PASSWORD;
    if (!email || !password) {
        throw new Error(
            "Define STUDYFLOW_SMOKE_COOKIE ou STUDYFLOW_SMOKE_EMAIL/STUDYFLOW_SMOKE_PASSWORD " +
                "para provar pedidos autenticados. Sem sessao valida, /api/auth/me devolve 401 " +
                "e isso nao demonstra RNF10.",
        );
    }

    const loginUrl = new URL("/api/auth/login", baseUrl).toString();
    const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-studyflow-csrf": "1",
        },
        body: JSON.stringify({ email, password }),
    });

    const setCookieHeaders = readSetCookieHeaders(response.headers);
    if (response.body) {
        await response.body.cancel();
    }

    if (!response.ok) {
        throw new Error(
            `Login de smoke falhou com status ${response.status}; verifica as credenciais de teste.`,
        );
    }

    const sessionCookie = setCookieHeaders.find((header) =>
        header.startsWith("sf_sid="),
    );
    if (!sessionCookie) {
        throw new Error("Login de smoke nao devolveu cookie sf_sid.");
    }

    return sessionCookie.split(";")[0];
}

/**
 * Reads `Set-Cookie` values across Node versions without printing them.
 *
 * @param {Headers} headers Response headers returned by `fetch`.
 * @returns {string[]} Cookie header values.
 */
function readSetCookieHeaders(headers) {
    if (typeof headers.getSetCookie === "function") {
        return headers.getSetCookie();
    }

    const rawHeader = headers.get("set-cookie");
    return rawHeader ? [rawHeader] : [];
}

/**
 * Calculates a percentile from an already sorted list of durations.
 *
 * @param {number[]} sortedValues Durations sorted from fastest to slowest.
 * @param {number} percentileRank Percentile between 0 and 100.
 * @returns {number} Observed value for the requested percentile.
 */
function percentile(sortedValues, percentileRank) {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentileRank / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

/**
 * Sends one authenticated request and keeps only technical evidence.
 *
 * @param {number} index Concurrent request index for local debugging.
 * @returns {Promise<{ index: number, status: number, durationMs: number }>} Safe request metadata.
 */
async function runRequest(index) {
    const startedAt = performance.now();
    const response = await fetch(url, {
        headers: {
            Cookie: cookie,
            // The marker mirrors the UI contract while keeping the HttpOnly session opaque.
            "x-studyflow-csrf": "1",
        },
    });

    // The body may include public session data, so the smoke never prints or stores it.
    if (response.body) {
        await response.body.cancel();
    }

    return {
        index,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
    };
}

const settledResults = await Promise.allSettled(
    Array.from({ length: concurrency }, (_, index) => runRequest(index)),
);

const networkErrors = settledResults.filter((result) => result.status === "rejected");
const responses = settledResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

const durations = responses.map((result) => result.durationMs).sort((a, b) => a - b);
const statusCounts = responses.reduce((counts, result) => {
    counts[result.status] = (counts[result.status] ?? 0) + 1;
    return counts;
}, {});
const unexpectedStatuses = responses.filter(
    (result) => result.status !== expectedStatus,
);
const serverErrors = responses.filter((result) => result.status >= 500);
const averageMs = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : 0;

const summary = {
    schoolContext,
    path,
    concurrency,
    expectedStatus,
    completedRequests: responses.length,
    networkErrorCount: networkErrors.length,
    unexpectedStatusCount: unexpectedStatuses.length,
    serverErrorCount: serverErrors.length,
    statusCounts,
    averageMs,
    p95Ms: percentile(durations, 95),
    maxMs: durations.at(-1) ?? 0,
};

console.log(JSON.stringify(summary, null, 2));

if (networkErrors.length > 0 || unexpectedStatuses.length > 0 || serverErrors.length > 0) {
    process.exitCode = 1;
}
