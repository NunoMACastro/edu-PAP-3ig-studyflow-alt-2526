/**
 * Valida a configuração transversal do runtime local endurecido.
 */
import "./load-env.js";
import { assertE2eRuntimeDoublesAllowed } from "./e2e-runtime-boundary.js";
import { validateMongoConnectionUri } from "./mongo-connection-policy.js";

export type StudyFlowRuntimeConfig = {
    deploymentScope: "local-pap";
    host: "127.0.0.1";
    port: number;
    webOrigin: string;
    trustProxy: false;
    mongoUri: string;
    redisUrl: string;
};

/**
 * Constrói a configuração da API e recusa combinações que poderiam expor
 * acidentalmente a instância local da PAP.
 *
 * @param environment Ambiente a validar; pode ser substituído em testes.
 * @returns Configuração normalizada e segura para o bootstrap.
 */
export function loadRuntimeConfig(
    environment: NodeJS.ProcessEnv = process.env,
): StudyFlowRuntimeConfig {
    assertE2eRuntimeDoublesAllowed(environment);

    const deploymentScope =
        environment.STUDYFLOW_DEPLOYMENT_SCOPE?.trim() || "local-pap";
    if (deploymentScope !== "local-pap") {
        throw new Error(
            "Este artefacto suporta apenas STUDYFLOW_DEPLOYMENT_SCOPE=local-pap.",
        );
    }

    const host = environment.HOST?.trim() || "127.0.0.1";
    if (host !== "127.0.0.1") {
        throw new Error(
            "A instância PAP local só pode escutar em HOST=127.0.0.1.",
        );
    }

    const trustProxy = (environment.STUDYFLOW_TRUST_PROXY ?? "false")
        .trim()
        .toLowerCase();
    if (!["", "0", "false"].includes(trustProxy)) {
        throw new Error(
            "STUDYFLOW_TRUST_PROXY tem de estar desligado no âmbito local-pap.",
        );
    }

    const port = Number(environment.PORT ?? 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error("PORT deve ser um inteiro entre 1 e 65535.");
    }

    return {
        deploymentScope: "local-pap",
        host: "127.0.0.1",
        port,
        webOrigin: normaliseLoopbackOrigin(
            environment.WEB_ORIGIN ?? "http://127.0.0.1:5173",
        ),
        trustProxy: false,
        mongoUri: validateMongoConnectionUri(
            environment.MONGODB_URI ??
                "mongodb://127.0.0.1:27017/studyflow?replicaSet=studyflow-rs",
        ).uri,
        redisUrl: normaliseLocalRedisUrl(
            environment.REDIS_URL ?? "redis://127.0.0.1:6379/1",
        ),
    };
}

/** Reserva uma base Redis não-zero dedicada à instância local. */
function normaliseLocalRedisUrl(rawUrl: string): string {
    const url = new URL(rawUrl);
    if (
        url.protocol !== "redis:" ||
        !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname.toLowerCase())
    ) {
        throw new Error("REDIS_URL tem de usar Redis em loopback no âmbito local-pap.");
    }
    if (url.username || url.password) {
        throw new Error("REDIS_URL local não pode incluir credenciais.");
    }
    const database = Number(url.pathname.replace(/^\//, ""));
    if (!Number.isInteger(database) || database < 1 || database > 15) {
        throw new Error("REDIS_URL tem de selecionar uma base dedicada entre 1 e 15.");
    }
    return url.toString();
}

/**
 * Garante que a origem com credenciais pertence ao próprio equipamento.
 *
 * @param rawOrigin Origem configurada para o frontend.
 * @returns Origem canónica sem slash final.
 */
function normaliseLoopbackOrigin(rawOrigin: string): string {
    const origin = new URL(rawOrigin);
    if (!["http:", "https:"].includes(origin.protocol)) {
        throw new Error("WEB_ORIGIN deve usar http ou https.");
    }
    if (
        !["127.0.0.1", "localhost", "[::1]"].includes(
            origin.hostname.toLowerCase(),
        )
    ) {
        throw new Error("WEB_ORIGIN tem de apontar para loopback no âmbito local-pap.");
    }
    if (origin.username || origin.password || origin.pathname !== "/") {
        throw new Error("WEB_ORIGIN deve conter apenas protocolo, host e porta.");
    }
    return origin.origin;
}
