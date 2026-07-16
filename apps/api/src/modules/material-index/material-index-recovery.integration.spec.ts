/**
 * Prova recuperação de um lease deixado por um processo interrompido usando o
 * schema e as operações atómicas reais sobre MongoDB.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
    createConnection,
    Types,
    type Connection,
    type Model,
} from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { QuizGenerationJobsService } from "../ai/quiz-generation-jobs.service.js";
import {
    QuizGenerationJob,
    QuizGenerationJobDocument,
    QuizGenerationJobSchema,
} from "../ai/schemas/quiz-generation-job.schema.js";
import { MaterialIndexQueueService } from "./material-index-queue.service.js";
import { MaterialIndexService } from "./material-index.service.js";
import {
    MaterialIndexJob,
    MaterialIndexJobDocument,
    MaterialIndexJobSchema,
} from "./schemas/material-index-job.schema.js";

jest.setTimeout(120_000);

describe("MaterialIndexQueueService — recuperação Mongo após restart", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let jobModel: Model<MaterialIndexJobDocument>;
    let quizJobModel: Model<QuizGenerationJobDocument>;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-material-recovery-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_material_recovery"),
        ).asPromise();
        jobModel = connection.model(
            MaterialIndexJob.name,
            MaterialIndexJobSchema,
        ) as unknown as Model<MaterialIndexJobDocument>;
        quizJobModel = connection.model(
            QuizGenerationJob.name,
            QuizGenerationJobSchema,
        ) as unknown as Model<QuizGenerationJobDocument>;
        await Promise.all([
            jobModel.createIndexes(),
            quizJobModel.createIndexes(),
        ]);
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await Promise.all([
            jobModel.createIndexes(),
            quizJobModel.createIndexes(),
        ]);
    });

    it("reclama e conclui um PROCESSING cujo worker caiu e lease expirou", async () => {
        const userId = new Types.ObjectId();
        const studyAreaId = new Types.ObjectId();
        const materialId = new Types.ObjectId();
        const crashedJob = await jobModel.create({
            scope: "PRIVATE_AREA",
            materialId,
            studyAreaId,
            userId,
            status: "PROCESSING",
            extractedTextChunks: [],
            attempts: 1,
            maxAttempts: 3,
            availableAt: new Date(Date.now() - 120_000),
            leaseOwner: "worker-interrompido",
            leaseToken: 7,
            leaseExpiresAt: new Date(Date.now() - 60_000),
            activeKey: `PRIVATE_AREA:${userId}:${studyAreaId}:${materialId}`,
        });
        const materialsService = {
            findOwnedTextMaterial: jest.fn().mockResolvedValue({
                _id: materialId,
                type: "TOPIC",
                title: "Energia",
                status: "READY",
                contentText:
                    "A energia conserva-se e pode transformar-se entre formas diferentes.",
            }),
            markIndexedText: jest.fn().mockResolvedValue(undefined),
        };
        const indexService = new MaterialIndexService(
            jobModel,
            materialsService as never,
            {} as never,
            {} as never,
            {} as never,
        );

        // Uma nova instância representa o runner arrancado depois da queda; não
        // recebe closures nem estado do worker anterior.
        const restartedRunner = new MaterialIndexQueueService(indexService);
        await expect(restartedRunner.runUntilIdle()).resolves.toBe(1);

        const recovered = await jobModel.findById(crashedJob._id).lean();
        expect(recovered).toMatchObject({
            status: "DONE",
            attempts: 2,
            leaseToken: 8,
            extractedTextChunks: [
                expect.objectContaining({
                    order: 1,
                    sourceLabel: "Energia",
                }),
            ],
        });
        expect(recovered).not.toHaveProperty("leaseOwner");
        expect(recovered).not.toHaveProperty("leaseExpiresAt");
        expect(recovered).not.toHaveProperty("activeKey");
        expect(materialsService.findOwnedTextMaterial).toHaveBeenCalledWith(
            userId.toHexString(),
            studyAreaId.toHexString(),
            materialId.toHexString(),
        );
    });

    it("recupera também um quiz PROCESSING depois de expirar o lease", async () => {
        const userId = new Types.ObjectId();
        const studyAreaId = new Types.ObjectId();
        const artifactId = new Types.ObjectId();
        const crashedJob = await quizJobModel.create({
            userId,
            studyAreaId,
            status: "PROCESSING",
            topic: "Energia",
            attempts: 1,
            maxAttempts: 3,
            availableAt: new Date(Date.now() - 120_000),
            leaseOwner: "quiz-worker-interrompido",
            leaseToken: 4,
            leaseExpiresAt: new Date(Date.now() - 60_000),
            activeKey: `quiz:${userId}:${studyAreaId}:energia`,
        });
        const studyToolsService = {
            assertGenerationReady: jest.fn().mockResolvedValue(undefined),
            generateStudyTool: jest.fn().mockResolvedValue({
                _id: artifactId.toHexString(),
            }),
        };

        const restartedRunner = new QuizGenerationJobsService(
            quizJobModel,
            studyToolsService,
            new AccountLifecycleBarrierService(),
            {
                findSessionUser: jest.fn().mockResolvedValue({
                    user: {
                        id: userId.toHexString(),
                        email: "quiz-recovery@example.test",
                        role: "STUDENT",
                    },
                    sessionVersion: 0,
                }),
            } as never,
        );
        await expect(restartedRunner.runUntilIdle()).resolves.toBe(1);

        const recovered = await quizJobModel.findById(crashedJob._id).lean();
        expect(recovered).toMatchObject({
            status: "DONE",
            attempts: 2,
            leaseToken: 5,
            artifactId,
        });
        expect(recovered).not.toHaveProperty("leaseOwner");
        expect(recovered).not.toHaveProperty("leaseExpiresAt");
        expect(recovered).not.toHaveProperty("activeKey");
        expect(studyToolsService.generateStudyTool).toHaveBeenCalledWith(
            userId.toHexString(),
            studyAreaId.toHexString(),
            { type: "QUIZ", topic: "Energia" },
            `artifact-job:${crashedJob._id.toString()}`,
            undefined,
            "BACKGROUND",
        );
    });
});
