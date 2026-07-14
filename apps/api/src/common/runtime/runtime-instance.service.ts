/**
 * Expõe metadados mínimos de runtime para validar preparação horizontal.
 */
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

export type RuntimeInstanceView = {
    instanceId: string;
    deploymentScope: "local-pap";
    connectivity: "configured-only";
    readinessPath: "/api/health/ready";
    sessionStore: "redis";
    persistentStore: "mongodb";
};

/**
 * Identifica a instância atual sem expor sessões, utilizadores ou dados privados.
 */
@Injectable()
export class RuntimeInstanceService {
    private readonly instanceId =
        process.env.STUDYFLOW_INSTANCE_ID ?? randomUUID();

    /**
     * Devolve metadados seguros para smoke tests e evidence de escala horizontal.
     *
     * @returns Identificador da instância e stores partilhados usados pela API.
     */
    describe(): RuntimeInstanceView {
        // A resposta nunca inclui cookie, email, userId ou conteúdo privado.
        return {
            instanceId: this.instanceId,
            deploymentScope: "local-pap",
            connectivity: "configured-only",
            readinessPath: "/api/health/ready",
            sessionStore: "redis",
            persistentStore: "mongodb",
        };
    }
}
