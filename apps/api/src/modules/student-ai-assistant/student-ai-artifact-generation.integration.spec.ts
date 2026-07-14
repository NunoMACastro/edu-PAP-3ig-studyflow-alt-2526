/** Prova atómica do snapshot transitório e do job de quiz do Assistente. */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createConnection, Types, type Connection, type Model } from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import type { AssistantArtifactGenerationSnapshot } from "../ai/ai-artifact-generation.types.js";
import { QuizGenerationJobsService } from "../ai/quiz-generation-jobs.service.js";
import {
    QuizGenerationJob,
    QuizGenerationJobSchema,
} from "../ai/schemas/quiz-generation-job.schema.js";
import {
    StudentAiArtifactGenerationSnapshot,
    StudentAiArtifactGenerationSnapshotSchema,
} from "./schemas/student-ai-artifact-generation-snapshot.schema.js";

jest.setTimeout(120_000);

describe("Student assistant artifact quiz snapshot — transação", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let jobModel: Model<QuizGenerationJob>;
    let snapshotModel: Model<StudentAiArtifactGenerationSnapshot>;
    let service: QuizGenerationJobsService;

    beforeAll(async () => {
        replicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        connection = await createConnection(
            replicaSet.getUri("assistant_artifact_snapshots"),
        ).asPromise();
        jobModel = connection.model(QuizGenerationJob.name, QuizGenerationJobSchema);
        snapshotModel = connection.model(
            StudentAiArtifactGenerationSnapshot.name,
            StudentAiArtifactGenerationSnapshotSchema,
        );
        await Promise.all([jobModel.createIndexes(), snapshotModel.createIndexes()]);
        service = new QuizGenerationJobsService(
            jobModel as never,
            {
                assertQuizGenerationReady: jest.fn(),
                generateStudyTool: jest.fn(),
                generateStudyToolFromAssistantSnapshot: jest.fn(),
            } as never,
            new AccountLifecycleBarrierService(),
            {} as never,
            undefined,
            undefined,
            snapshotModel as never,
        );
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Promise.all([jobModel.deleteMany({}), snapshotModel.deleteMany({})]);
    });

    it("persiste uma única cópia e devolve o mesmo job num retry", async () => {
        const snapshot = makeSnapshot();
        const first = await service.createQuizJobForAssistantSnapshot(
            snapshot,
            { topic: "SQL" },
            { conversationId: snapshot.conversationId, requestKey: "request-one" },
        );
        const retry = await service.createQuizJobForAssistantSnapshot(
            snapshot,
            { topic: "SQL" },
            { conversationId: snapshot.conversationId, requestKey: "request-one" },
        );
        expect(retry._id).toBe(first._id);
        await expect(jobModel.countDocuments()).resolves.toBe(1);
        await expect(snapshotModel.countDocuments()).resolves.toBe(1);
    });

    it("faz rollback do snapshot quando a criação do job falha", async () => {
        jest.spyOn(jobModel, "create").mockRejectedValueOnce(
            new Error("forced job failure"),
        );
        const snapshot = makeSnapshot();
        await expect(
            service.createQuizJobForAssistantSnapshot(
                snapshot,
                {},
                { conversationId: snapshot.conversationId, requestKey: "request-failure" },
            ),
        ).rejects.toThrow("forced job failure");
        await expect(jobModel.countDocuments()).resolves.toBe(0);
        await expect(snapshotModel.countDocuments()).resolves.toBe(0);
    });
});

function makeSnapshot(): AssistantArtifactGenerationSnapshot {
    const userId = new Types.ObjectId();
    const conversationId = new Types.ObjectId();
    const contextId = new Types.ObjectId();
    const targetId = new Types.ObjectId();
    return Object.freeze({
        userId: String(userId),
        conversationId: String(conversationId),
        sourceContextKind: "STUDY_ROOM",
        sourceContextId: String(contextId),
        contextLabel: "Sala de estudo",
        target: Object.freeze({
            kind: "SUBJECT",
            id: String(targetId),
            label: "Bases de Dados",
        }),
        sources: Object.freeze([
            Object.freeze({
                materialId: "source-1",
                title: "Manual",
                contentText: "Conteúdo autorizado",
            }),
        ]),
        candidateSourceCount: 1,
        conversationTurns: Object.freeze([
            Object.freeze({ question: "O que é SQL?", answer: "Uma linguagem." }),
        ]),
        snapshotAt: new Date(),
        snapshotTurnCount: 1,
        groundingMode: "CHAT_AND_SOURCES",
        snapshotDigest: "a".repeat(64),
    });
}
