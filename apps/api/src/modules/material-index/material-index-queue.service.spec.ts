// apps/api/src/modules/material-index/material-index-queue.service.spec.ts
import {
    MaterialIndexQueuePort,
    MaterialIndexQueueService,
} from "./material-index-queue.service.js";

describe("MaterialIndexQueueService", () => {
    it("devolve job QUEUED antes da extração terminar", async () => {
        // O duplo tipado simula a persistência sem ler ficheiros reais nem expor materiais privados.
        const port: jest.Mocked<MaterialIndexQueuePort> = {
            createQueuedPrivateJob: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                scope: "PRIVATE_AREA",
                materialId: "507f1f77bcf86cd799439012",
                studyAreaId: "507f1f77bcf86cd799439013",
                userId: "507f1f77bcf86cd799439014",
                status: "QUEUED",
                extractedTextChunks: [],
            }),
            processQueuedPrivateJob: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                scope: "PRIVATE_AREA",
                materialId: "507f1f77bcf86cd799439012",
                studyAreaId: "507f1f77bcf86cd799439013",
                userId: "507f1f77bcf86cd799439014",
                status: "DONE",
                extractedTextChunks: [],
            }),
        };
        const service = new MaterialIndexQueueService(port);

        const queuedJob = await service.enqueuePrivateMaterial({
            actor: {
                id: "507f1f77bcf86cd799439014",
                role: "STUDENT",
                email: "aluno@studyflow.test",
            },
            studyAreaId: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439012",
        });

        // A asserção principal protege RNF11: a resposta inicial é observável antes do trabalho pesado.
        expect(queuedJob.status).toBe("QUEUED");
        // A chamada em background deve preservar o mesmo aluno e material para não trocar ownership.
        expect(port.processQueuedPrivateJob).toHaveBeenCalledWith(
            {
                id: "507f1f77bcf86cd799439014",
                role: "STUDENT",
                email: "aluno@studyflow.test",
            },
            "507f1f77bcf86cd799439013",
            "507f1f77bcf86cd799439012",
            "507f1f77bcf86cd799439011",
        );
    });
});