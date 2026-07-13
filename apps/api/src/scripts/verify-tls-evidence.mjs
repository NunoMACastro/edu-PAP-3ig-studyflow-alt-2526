import http from "node:http";
import tls from "node:tls";

const DEFAULT_HTTPS_PORT = 443;
const DEFAULT_HTTP_PORT = 80;
const DEFAULT_TIMEOUT_MS = 7000;

const target = parseTarget(process.env.API_PUBLIC_HOST);
const timeoutMs = readPositiveInteger(
    "STUDYFLOW_TLS_TIMEOUT_MS",
    DEFAULT_TIMEOUT_MS,
);

/**
 * Parses the public API host used for RNF14 evidence.
 *
 * @param {string | undefined} rawHost Public host without protocol.
 * @returns {{ hostname: string, httpsPort: number, httpPort: number }} Sanitized target.
 * @throws {Error} When the host is missing or includes unsafe URL parts.
 */
function parseTarget(rawHost) {
    if (!rawHost) {
        throw new Error(
            "Define API_PUBLIC_HOST sem protocolo, por exemplo api.studyflow.example.",
        );
    }

    if (/^https?:\/\//i.test(rawHost)) {
        throw new Error(
            "API_PUBLIC_HOST deve conter apenas host[:porta], sem http:// ou https://.",
        );
    }

    const parsed = new URL(`https://${rawHost}`);
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
        throw new Error("API_PUBLIC_HOST nao deve conter path, query ou fragmento.");
    }

    return {
        hostname: parsed.hostname,
        httpsPort: parsed.port ? Number.parseInt(parsed.port, 10) : DEFAULT_HTTPS_PORT,
        httpPort: process.env.API_PUBLIC_HTTP_PORT
            ? readPositiveInteger("API_PUBLIC_HTTP_PORT", DEFAULT_HTTP_PORT)
            : DEFAULT_HTTP_PORT,
    };
}

/**
 * Reads a positive integer environment knob without accepting silent bad evidence.
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
 * Opens a TLS 1.2+ connection and records only protocol/cipher evidence.
 *
 * @returns {Promise<{ protocol: string | null, cipher: string | null, authorized: boolean, authorizationError: string | null }>} TLS metadata safe for reports.
 */
async function verifyTls() {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({
            host: target.hostname,
            port: target.httpsPort,
            servername: target.hostname,
            minVersion: "TLSv1.2",
            rejectUnauthorized:
                process.env.STUDYFLOW_TLS_ALLOW_SELF_SIGNED !== "true",
        });

        socket.setTimeout(timeoutMs);
        socket.once("secureConnect", () => {
            const cipher = socket.getCipher();
            const result = {
                protocol: socket.getProtocol(),
                cipher: cipher?.name ?? null,
                authorized: socket.authorized,
                authorizationError: socket.authorizationError ?? null,
            };
            socket.end();
            resolve(result);
        });
        socket.once("timeout", () => {
            socket.destroy(new Error("Timeout ao validar TLS publico."));
        });
        socket.once("error", reject);
    });
}

/**
 * Checks whether plain HTTP is still served as a normal successful channel.
 *
 * A closed port, redirect, 403 or 426 is acceptable evidence that HTTP is not
 * the normal application channel. A 2xx response is treated as failure.
 *
 * @returns {Promise<{ reachable: boolean, statusCode: number | null, location: string | null, errorCode: string | null }>} HTTP metadata safe for reports.
 */
async function checkPlainHttp() {
    return new Promise((resolve, reject) => {
        const request = http.request(
            {
                host: target.hostname,
                port: target.httpPort,
                method: "HEAD",
                path: "/",
                timeout: timeoutMs,
                headers: {
                    "user-agent": "studyflow-mf6-tls-evidence",
                },
            },
            (response) => {
                response.resume();
                response.once("end", () => {
                    resolve({
                        reachable: true,
                        statusCode: response.statusCode ?? null,
                        location: response.headers.location ?? null,
                        errorCode: null,
                    });
                });
            },
        );

        request.once("timeout", () => {
            request.destroy(Object.assign(new Error("HTTP timeout"), { code: "ETIMEDOUT" }));
        });
        request.once("error", (error) => {
            if (["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(error.code)) {
                resolve({
                    reachable: false,
                    statusCode: null,
                    location: null,
                    errorCode: error.code,
                });
                return;
            }
            reject(error);
        });
        request.end();
    });
}

const tlsResult = await verifyTls();
const httpResult = await checkPlainHttp();
const plainHttpServed =
    httpResult.statusCode !== null &&
    httpResult.statusCode >= 200 &&
    httpResult.statusCode < 300;

const summary = {
    host: target.hostname,
    httpsPort: target.httpsPort,
    tlsProtocol: tlsResult.protocol,
    tlsCipher: tlsResult.cipher,
    certificateAuthorized: tlsResult.authorized,
    httpReachable: httpResult.reachable,
    httpStatusCode: httpResult.statusCode,
    httpLocationIsHttps:
        typeof httpResult.location === "string"
            ? httpResult.location.startsWith("https://")
            : null,
    httpErrorCode: httpResult.errorCode,
    plainHttpServed,
};

console.log(JSON.stringify(summary, null, 2));

if (!["TLSv1.2", "TLSv1.3"].includes(tlsResult.protocol ?? "")) {
    throw new Error("O host publico nao demonstrou TLS 1.2+.");
}

if (!tlsResult.authorized && process.env.STUDYFLOW_TLS_ALLOW_SELF_SIGNED !== "true") {
    throw new Error("O certificado TLS publico nao foi validado.");
}

if (plainHttpServed) {
    throw new Error("HTTP simples devolveu 2xx; RNF14 ainda nao esta demonstrado.");
}
