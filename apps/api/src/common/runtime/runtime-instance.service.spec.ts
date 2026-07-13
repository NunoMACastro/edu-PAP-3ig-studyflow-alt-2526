/**
 * Testa o diagnóstico de instância sem expor dados privados.
 */
import { RuntimeInstanceService } from "./runtime-instance.service.js";

describe("RuntimeInstanceService", () => {
    const previousInstanceId = process.env.STUDYFLOW_INSTANCE_ID;

    afterEach(() => {
        if (previousInstanceId === undefined) {
            delete process.env.STUDYFLOW_INSTANCE_ID;
        } else {
            process.env.STUDYFLOW_INSTANCE_ID = previousInstanceId;
        }
    });

    it("devolve stores partilhados e identificador configurado", () => {
        process.env.STUDYFLOW_INSTANCE_ID = "studyflow-api-01";

        const service = new RuntimeInstanceService();

        expect(service.describe()).toEqual({
            instanceId: "studyflow-api-01",
            deploymentScope: "local-pap",
            connectivity: "configured-only",
            readinessPath: "/api/health/ready",
            sessionStore: "redis",
            persistentStore: "mongodb",
        });
    });

    it("não expõe dados pessoais nem cookies", () => {
        const service = new RuntimeInstanceService();
        const output = JSON.stringify(service.describe());

        // O endpoint é operacional; evidence pode mostrar stores, mas nunca sessão ou identidade.
        expect(output).not.toMatch(/cookie|email|userId|password/i);
    });
});
