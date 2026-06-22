// apps/api/src/scripts/smoke-200-users.mjs
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
const schoolContext = process.env.STUDYFLOW_SMOKE_SCHOOL_CONTEXT ?? "escola-teste-isolada";
const cookie = process.env.STUDYFLOW_SMOKE_COOKIE;

if (!cookie) {
  throw new Error(
    "STUDYFLOW_SMOKE_COOKIE é obrigatório para provar 200 pedidos autenticados. " +
      "Sem cookie, /api/auth/me devolve 401 e isso não demonstra RNF10.",
  );
}

const url = new URL(path, baseUrl).toString();

/**
 * Lê uma variável numérica positiva sem aceitar valores silenciosamente inválidos.
 *
 * @param {string} name Nome da variável de ambiente.
 * @param {number} fallback Valor usado quando a variável não existe.
 * @returns {number} Número inteiro positivo.
 */
function readPositiveInteger(name, fallback) {
  const rawValue = process.env[name];
  const value = rawValue === undefined ? fallback : Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo.`);
  }

  return value;
}

/**
 * Calcula percentil numa lista de durações ordenada.
 *
 * @param {number[]} sortedValues Durações ordenadas de forma crescente.
 * @param {number} percentileRank Percentil entre 0 e 100.
 * @returns {number} Valor observado no percentil pedido.
 */
function percentile(sortedValues, percentileRank) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentileRank / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

/**
 * Executa um pedido autenticado e devolve apenas metadados técnicos.
 *
 * @param {number} index Número do pedido concorrente.
 * @returns {Promise<{ index: number, status: number, durationMs: number }>} Resultado seguro para evidence.
 */
async function runRequest(index) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: {
      Cookie: cookie,
      // O cabeçalho mantém compatibilidade com a proteção CSRF já usada pela UI, sem ler o cookie HttpOnly.
      "x-studyflow-csrf": "1",
    },
  });

  // O body pode conter dados públicos da sessão; cancelamos a stream e nunca o imprimimos.
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
const unexpectedStatuses = responses.filter((result) => result.status !== expectedStatus);
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