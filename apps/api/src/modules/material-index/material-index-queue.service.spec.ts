/**
 * Testa a orquestração assíncrona de indexação privada introduzida por RNF11.
 */
import {
    MaterialIndexQueuePort,
    MaterialIndexQueueService,
} from "./material-index-queue.service.js";

const actor = {
    id: "507f1f77bcf86cd799439014",
    role: "STUDENT" as const,
    email: "aluno@studyflow.test",
};
const studyAreaId = "507f1f77bcf86cd799439013";
const materialId = "507f1f77bcf86cd799439012";
const jobId = "507f1f77bcf86cd799439011";

describe("MaterialIndexQueueService", () => {
    it("devolve job QUEUED antes da extração terminar", async () => {
        // O duplo tipado simula persistência sem ler ficheiros reais nem expor materiais privados.
        const port: jest.Mocked<MaterialIndexQueuePort> = {
            createQueuedPrivateJob: jest.fn().mockResolvedValue({
                _id: jobId,
                scope: "PRIVATE_AREA",
                materialId,
                studyAreaId,
                userId: actor.id,
                status: "QUEUED",
                extractedTextChunks: [],
            }),
            processQueuedPrivateJob: jest.fn().mockResolvedValue({
                _id: jobId,
                scope: "PRIVATE_AREA",
                materialId,
                studyAreaId,
                userId: actor.id,
                status: "DONE",
                extractedTextChunks: [],
            }),
        };
        const service = new MaterialIndexQueueService(port);

        const queuedJob = await service.enqueuePrivateMaterial({
            actor,
            studyAreaId,
            materialId,
        });

        // A asserção principal protege RNF11: a resposta inicial é observável antes do trabalho pesado.
        expect(queuedJob.status).toBe("QUEUED");
        // A chamada em background preserva o mesmo aluno e material para não trocar ownership.
        expect(port.processQueuedPrivateJob).toHaveBeenCalledWith(
            actor,
            studyAreaId,
            materialId,
            jobId,
        );
    });

    it("não inicia background quando a criação do job falha", async () => {
        const port: jest.Mocked<MaterialIndexQueuePort> = {
            createQueuedPrivateJob: jest
                .fn()
                .mockRejectedValue(new Error("Material sem ownership.")),
            processQueuedPrivateJob: jest.fn(),
        };
        const service = new MaterialIndexQueueService(port);

        await expect(
            service.enqueuePrivateMaterial({ actor, studyAreaId, materialId }),
        ).rejects.toThrow("Material sem ownership.");
        expect(port.processQueuedPrivateJob).not.toHaveBeenCalled();
    });
});
