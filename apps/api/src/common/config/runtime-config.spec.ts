/**
 * Testa o boundary fail-closed da configuração local da PAP.
 */
import { loadRuntimeConfig } from "./runtime-config.js";

describe("loadRuntimeConfig", () => {
    it("aplica defaults exclusivamente locais", () => {
        expect(loadRuntimeConfig({})).toEqual({
            deploymentScope: "local-pap",
            host: "127.0.0.1",
            port: 3000,
            trustProxy: false,
            webOrigin: "http://127.0.0.1:5173",
            mongoUri:
                "mongodb://127.0.0.1:27017/studyflow?replicaSet=studyflow-rs",
            redisUrl: "redis://127.0.0.1:6379/1",
        });
    });

    it("aceita MongoDB Atlas mantendo a API limitada a loopback", () => {
        const mongoUri =
            "mongodb+srv://pap-user:secret@paps.example.mongodb.net/studyflow?appName=StudyFlow";

        expect(loadRuntimeConfig({ MONGODB_URI: mongoUri })).toMatchObject({
            deploymentScope: "local-pap",
            host: "127.0.0.1",
            mongoUri,
            trustProxy: false,
        });
    });

    it("aceita doubles apenas num processo E2E explicitamente marcado", () => {
        expect(
            loadRuntimeConfig({
                NODE_ENV: "test",
                STUDYFLOW_E2E_MODE: "true",
                STUDYFLOW_E2E_FAKE_AI: "true",
                STUDYFLOW_E2E_IN_MEMORY_REDIS: "true",
                STUDYFLOW_E2E_SEED_AI_GOVERNANCE: "true",
            }),
        ).toMatchObject({
            deploymentScope: "local-pap",
            host: "127.0.0.1",
            trustProxy: false,
        });
    });

    it.each([
        [{ HOST: "0.0.0.0" }, "HOST=127.0.0.1"],
        [{ STUDYFLOW_TRUST_PROXY: "true" }, "tem de estar desligado"],
        [{ STUDYFLOW_DEPLOYMENT_SCOPE: "production" }, "apenas"],
        [{ WEB_ORIGIN: "https://example.com" }, "loopback"],
        [{ PORT: "70000" }, "entre 1 e 65535"],
        [
            { MONGODB_URI: "mongodb://127.0.0.1:27017/studyflow" },
            "replicaSet",
        ],
        [
            {
                MONGODB_URI:
                    "mongodb://db.example:27017/studyflow?replicaSet=studyflow-rs",
            },
            "loopback",
        ],
        [
            {
                MONGODB_URI:
                    "mongodb://127.0.0.1:27017/productionstudyflow?replicaSet=studyflow-rs",
            },
            "base StudyFlow",
        ],
        [{ REDIS_URL: "redis://127.0.0.1:6379/0" }, "base dedicada"],
        [
            { NODE_ENV: "test", STUDYFLOW_E2E_FAKE_AI: "true" },
            "STUDYFLOW_E2E_MODE=true",
        ],
        [
            {
                NODE_ENV: "development",
                STUDYFLOW_E2E_MODE: "true",
                STUDYFLOW_E2E_IN_MEMORY_REDIS: "true",
            },
            "NODE_ENV=test",
        ],
        [
            {
                NODE_ENV: "production",
                STUDYFLOW_E2E_MODE: "true",
                STUDYFLOW_E2E_SEED_AI_GOVERNANCE: "true",
            },
            "NODE_ENV=test",
        ],
    ])("recusa configuração insegura %j", (environment, expectedMessage) => {
        expect(() => loadRuntimeConfig(environment)).toThrow(expectedMessage);
    });
});
