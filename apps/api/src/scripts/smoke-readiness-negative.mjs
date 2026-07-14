/**
 * Prova fail-closed de readiness contra uma instância local deliberadamente
 * degradada. Não lê nem imprime o corpo da resposta.
 */
const rawUrl = process.env.STUDYFLOW_NEGATIVE_READINESS_URL;
if (!rawUrl) {
    throw new Error(
        "Define STUDYFLOW_NEGATIVE_READINESS_URL para uma API local com uma dependência indisponível.",
    );
}

const target = new URL(rawUrl);
if (
    target.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname.toLowerCase()) ||
    !["/api/health", "/api/health/ready"].includes(target.pathname) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash
) {
    throw new Error(
        "STUDYFLOW_NEGATIVE_READINESS_URL deve ser um endpoint health HTTP em loopback e sem credenciais.",
    );
}

const timeoutMs = Number.parseInt(
    process.env.STUDYFLOW_NEGATIVE_READINESS_TIMEOUT_MS ?? "5000",
    10,
);
if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 30_000) {
    throw new Error("STUDYFLOW_NEGATIVE_READINESS_TIMEOUT_MS deve ficar entre 500 e 30000.");
}

const response = await fetch(target, {
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "error",
});
if (response.body) await response.body.cancel();

console.log(
    JSON.stringify({
        ok: response.status === 503,
        endpoint: target.pathname,
        status: response.status,
        expectedStatus: 503,
    }),
);
if (response.status !== 503) process.exitCode = 1;
