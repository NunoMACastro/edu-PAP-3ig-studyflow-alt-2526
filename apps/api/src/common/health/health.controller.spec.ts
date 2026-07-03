/**
 * Testa o contrato publico do endpoint de health-check.
 */
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
    const previousReleaseVersion = process.env.STUDYFLOW_RELEASE_VERSION;
    const previousDowntimeMinutes =
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES;

    afterEach(() => {
        restoreEnv("STUDYFLOW_RELEASE_VERSION", previousReleaseVersion);
        restoreEnv(
            "STUDYFLOW_MONTHLY_DOWNTIME_MINUTES",
            previousDowntimeMinutes,
        );
    });

    it("devolve o estado publico da API com disponibilidade agregada", () => {
        process.env.STUDYFLOW_RELEASE_VERSION = "2026.06.30";
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES = "48";
        const controller = createController();

        const result = controller.describe();

        // O caminho principal prova release, uptime e handoff operacional de BK-MF7-02.
        expect(result).toMatchObject({
            status: "ok",
            version: "2026.06.30",
            availability: {
                downtimeMinutes: 48,
                limitMinutes: 60,
                status: "WARNING",
            },
        });
        expect(result.uptimeSeconds).toEqual(expect.any(Number));
    });

    it("nao expoe identidade, sessao ou dados pessoais", () => {
        const controller = createController();

        const result = controller.describe();

        // O negativo P1 impede transformar uma rota publica em fuga de dados pessoais.
        expect(result).not.toHaveProperty("userId");
        expect(result).not.toHaveProperty("email");
        expect(result).not.toHaveProperty("cookie");
        expect(result).not.toHaveProperty("token");
    });

    it("nao expoe configuracao interna nem stack traces", () => {
        delete process.env.STUDYFLOW_RELEASE_VERSION;
        process.env.STUDYFLOW_MONTHLY_DOWNTIME_MINUTES = "valor-interno";
        const controller = createController();

        const result = controller.describe();

        // O negativo P1 mantem detalhes internos fora da resposta publica.
        expect(result).not.toHaveProperty("mongoUri");
        expect(result).not.toHaveProperty("redisUrl");
        expect(result).not.toHaveProperty("stack");
        expect(result.version).toBe("dev");
        expect(result.availability.downtimeMinutes).toBe(0);
    });
});

/**
 * Cria o controller com dependencias reais e pequenas para manter o teste claro.
 *
 * @returns Controller pronto para chamar o metodo publico do health-check.
 */
function createController(): HealthController {
    return new HealthController(new HealthService());
}

/**
 * Repos uma variavel de ambiente no valor anterior ao teste.
 *
 * @param key Nome da variavel.
 * @param value Valor anterior, se existia.
 */
function restoreEnv(key: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[key];
        return;
    }

    process.env[key] = value;
}
