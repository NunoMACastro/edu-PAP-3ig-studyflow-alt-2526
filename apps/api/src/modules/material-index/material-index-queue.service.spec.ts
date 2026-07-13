/**
 * Testa a orquestração Mongo recuperável da indexação privada.
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
const teacher = {
    id: "507f1f77bcf86cd799439019",
    role: "TEACHER" as const,
    email: "professor@studyflow.test",
};
const studyAreaId = "507f1f77bcf86cd799439013";
const materialId = "507f1f77bcf86cd799439012";
const jobId = "507f1f77bcf86cd799439011";

describe("MaterialIndexQueueService", () => {
    it("devolve QUEUED sem depender de closures em memória", async () => {
        const port = makePort();
        const service = new MaterialIndexQueueService(port);

        const queued = await service.enqueuePrivateMaterial({
            actor,
            studyAreaId,
            materialId,
        });

        expect(queued.status).toBe("QUEUED");
        expect(port.processClaimedPrivateJob).not.toHaveBeenCalled();
    });

    it("reclama e processa jobs persistidos até a fila ficar vazia", async () => {
        const port = makePort();
        port.claimNextPrivateJob
            .mockResolvedValueOnce({
                _id: jobId,
                materialId,
                studyAreaId,
                userId: actor.id,
                attempts: 1,
                maxAttempts: 3,
                leaseOwner: "worker",
                leaseToken: 1,
                leaseMs: 30_000,
            })
            .mockResolvedValueOnce(null);
        const service = new MaterialIndexQueueService(port);

        await expect(service.runUntilIdle()).resolves.toBe(1);

        expect(port.claimNextPrivateJob).toHaveBeenCalledWith(
            expect.stringMatching(/^material-index-/),
            expect.any(Date),
            30_000,
        );
        expect(port.processClaimedPrivateJob).toHaveBeenCalledWith(
            expect.objectContaining({ _id: jobId, attempts: 1 }),
        );
    });

    it("não reclama trabalho quando a criação do job falha", async () => {
        const port = makePort();
        port.createQueuedPrivateJob.mockRejectedValueOnce(
            new Error("Material sem ownership."),
        );
        const service = new MaterialIndexQueueService(port);

        await expect(
            service.enqueuePrivateMaterial({ actor, studyAreaId, materialId }),
        ).rejects.toThrow("Material sem ownership.");
        expect(port.claimNextPrivateJob).not.toHaveBeenCalled();
    });

    it("encaminha indexação oficial para a mesma fila recuperável", async () => {
        const port = makePort();
        const service = new MaterialIndexQueueService(port);

        const job = await service.enqueueOfficialMaterial({
            actor: teacher,
            materialId,
        });

        expect(job).toMatchObject({
            scope: "OFFICIAL_SUBJECT",
            status: "QUEUED",
        });
        expect(port.createQueuedOfficialJob).toHaveBeenCalledWith(
            teacher,
            materialId,
        );
    });

    it("reporta readiness apenas entre bootstrap e shutdown", async () => {
        const service = new MaterialIndexQueueService(makePort());

        expect(() => service.checkReady()).toThrow("not ready");
        service.onApplicationBootstrap();
        expect(() => service.checkReady()).not.toThrow();
        await service.onApplicationShutdown();
        expect(() => service.checkReady()).toThrow("not ready");
    });
});

function makePort(): jest.Mocked<MaterialIndexQueuePort> {
    return {
        createQueuedPrivateJob: jest.fn().mockResolvedValue({
            _id: jobId,
            scope: "PRIVATE_AREA",
            materialId,
            studyAreaId,
            userId: actor.id,
            status: "QUEUED",
            extractedTextChunks: [],
        }),
        claimNextPrivateJob: jest.fn().mockResolvedValue(null),
        processClaimedPrivateJob: jest.fn().mockResolvedValue(undefined),
        createQueuedOfficialJob: jest.fn().mockResolvedValue({
            _id: jobId,
            scope: "OFFICIAL_SUBJECT",
            materialId,
            subjectId: studyAreaId,
            teacherId: teacher.id,
            status: "QUEUED",
            extractedTextChunks: [],
        }),
        claimNextOfficialJob: jest.fn().mockResolvedValue(null),
        processClaimedOfficialJob: jest.fn().mockResolvedValue(undefined),
    };
}
