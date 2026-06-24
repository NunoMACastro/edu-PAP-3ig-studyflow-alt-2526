// apps/api/src/common/runtime/runtime-instance.service.ts
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

export type RuntimeInstanceView = {
    instanceId: string;
    sessionStore: "redis";
    persistentStore: "mongodb";
};

/**
 * Identifica a instância sem expor dados de alunos, professores ou sessões.
 */
@Injectable()
export class RuntimeInstanceService {
    private readonly instanceId = process.env.STUDYFLOW_INSTANCE_ID ?? randomUUID();

    /**
     * Devolve metadados mínimos para validar balanceamento horizontal.
     *
     * @returns Dados técnicos seguros para smoke tests e evidence.
     */
    describe(): RuntimeInstanceView {
        // A resposta nunca inclui cookie, userId, email ou conteúdo privado do aluno.
        return { instanceId: this.instanceId, sessionStore: "redis", persistentStore: "mongodb" };
    }
}