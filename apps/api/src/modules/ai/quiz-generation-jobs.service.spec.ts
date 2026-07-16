/**
 * Testa claim/lease/retry da fila Mongo de quizzes.
 */
import { Types } from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import {
    QuizGenerationJobsService,
    QuizGenerationStudyToolsPort,
} from "./quiz-generation-jobs.service.js";
import { QuizGenerationJobSchema } from "./schemas/quiz-generation-job.schema.js";

const userId = "507f1f77bcf86cd799439014";
const studyAreaId = "507f1f77bcf86cd799439013";
const jobId = new Types.ObjectId("507f1f77bcf86cd799439011");
const artifactId = "507f1f77bcf86cd799439099";

describe("QuizGenerationJobsService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("isola o job de workers legacy e só gera depois de claim atómico", async () => {
        const { jobModel, service, studyToolsService } = makeService([
            claimedJob({ attempts: 1 }),
            null,
        ]);

        const queued = await service.createQuizJob(userId, studyAreaId, {
            topic: "fotossíntese",
        });
        expect(queued.status).toBe("QUEUED");
        expect(studyToolsService.generateStudyTool).not.toHaveBeenCalled();
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ status: "ARTIFACT_QUEUED" }),
        );

        await expect(service.runUntilIdle()).resolves.toBe(1);

        expect(studyToolsService.generateStudyTool).toHaveBeenCalledWith(
            userId,
            studyAreaId,
            { type: "QUIZ", topic: "fotossíntese" },
            `quiz-job:${jobId.toHexString()}`,
            undefined,
            "BACKGROUND",
        );
        expect(jobModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                $or: expect.arrayContaining([
                    expect.objectContaining({
                        status: { $in: ["PROCESSING", "ARTIFACT_PROCESSING"] },
                    }),
                ]),
            }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "ARTIFACT_PROCESSING" }),
                $inc: { attempts: 1, leaseToken: 1 },
            }),
            expect.objectContaining({ new: true }),
        );
        expect(jobModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                $expr: { $gte: ["$attempts", "$maxAttempts"] },
            }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "FAILED" }),
            }),
        );
        expect(jobModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: jobId,
                status: "ARTIFACT_PROCESSING",
                leaseToken: 7,
                leaseExpiresAt: { $gt: expect.any(Date) },
            }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "DONE",
                    artifactId: new Types.ObjectId(artifactId),
                }),
            }),
        );
    });

    it("reutiliza o job ativo equivalente sem criar trabalho duplicado", async () => {
        const { jobModel, service } = makeService([]);
        jobModel.findOne.mockReturnValueOnce(
            queryResult(
                claimedJob({ attempts: 0, maxAttempts: 3, status: "QUEUED" }),
            ),
        );

        await expect(
            service.createQuizJob(userId, studyAreaId, {
                topic: "  fotossíntese  ",
            }),
        ).resolves.toMatchObject({
            _id: jobId.toHexString(),
            status: "QUEUED",
        });
        expect(jobModel.create).not.toHaveBeenCalled();
    });

    it("o schema impõe uma única activeKey através de índice parcial", () => {
        expect(QuizGenerationJobSchema.indexes()).toContainEqual([
            { activeKey: 1 },
            expect.objectContaining({
                unique: true,
                partialFilterExpression: { activeKey: { $type: "string" } },
            }),
        ]);
        expect(QuizGenerationJobSchema.indexes()).toContainEqual([
            { assistantRequestKey: 1 },
            expect.objectContaining({
                unique: true,
                partialFilterExpression: {
                    assistantRequestKey: { $type: "string" },
                },
            }),
        ]);
    });

    it("reagenda falha recuperável e liberta o lease", async () => {
        const { jobModel, service, studyToolsService } = makeService([
            claimedJob({ attempts: 1, maxAttempts: 3 }),
            null,
        ]);
        studyToolsService.generateStudyTool.mockRejectedValueOnce(
            new Error("provider indisponível"),
        );

        await service.runUntilIdle();

        expect(jobModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ status: "ARTIFACT_PROCESSING" }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "ARTIFACT_QUEUED",
                    availableAt: expect.any(Date),
                }),
                $unset: expect.objectContaining({ leaseOwner: "" }),
            }),
        );
    });

    it.each([
        [1, 1_000],
        [2, 5_000],
        [3, 30_000],
    ])("aplica backoff exato após a tentativa %i", async (attempts, delayMs) => {
        const { jobModel, service, studyToolsService } = makeService([
            claimedJob({ attempts, maxAttempts: attempts === 3 ? 4 : 3 }),
            null,
        ]);
        studyToolsService.generateStudyTool.mockRejectedValueOnce(
            new Error("provider indisponível"),
        );
        const now = 1_800_000_000_000;
        jest.spyOn(Date, "now").mockReturnValue(now);

        await service.runUntilIdle();

        const retryUpdate = jobModel.updateOne.mock.calls.find(
            ([, update]) =>
                (update as { $set?: { status?: string } }).$set?.status ===
                "ARTIFACT_QUEUED",
        )?.[1] as { $set: { availableAt: Date } };
        expect(retryUpdate.$set.availableAt.getTime()).toBe(now + delayMs);
    });

    it("não fecha DONE quando o heartbeat perde o fencing token", async () => {
        const { jobModel, service } = makeService([
            claimedJob({ attempts: 1 }),
            null,
        ]);
        jobModel.updateOne.mockResolvedValueOnce({ modifiedCount: 0 });

        await expect(service.runUntilIdle()).resolves.toBe(1);

        expect(
            jobModel.updateOne.mock.calls.some(
                ([, update]) =>
                    (update as { $set?: { status?: string } }).$set?.status ===
                    "DONE",
            ),
        ).toBe(false);
    });

    it("fecha FAILED quando esgota tentativas", async () => {
        const { jobModel, service, studyToolsService } = makeService([
            claimedJob({ attempts: 3, maxAttempts: 3 }),
            null,
        ]);
        studyToolsService.generateStudyTool.mockRejectedValueOnce(new Error("falha"));

        await service.runUntilIdle();

        expect(jobModel.updateOne).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "FAILED" }),
            }),
        );
    });

    it("não cria job quando faltam fontes processáveis", async () => {
        const { jobModel, service, studyToolsService } = makeService([]);
        studyToolsService.assertGenerationReady.mockRejectedValueOnce(
            new Error("Sem fontes processáveis."),
        );

        await expect(
            service.createQuizJob(userId, studyAreaId, {}),
        ).rejects.toThrow("Sem fontes processáveis.");
        expect(jobModel.create).not.toHaveBeenCalled();
    });

    it.each(["EXPLANATION", "FLASHCARDS", "QUIZ"] as const)(
        "processa %s em background através do pipeline de ferramentas",
        async (artifactType) => {
            const { service, studyToolsService } = makeService([
                claimedJob({ artifactType }),
                null,
            ]);

            await service.runUntilIdle();

            expect(studyToolsService.generateStudyTool).toHaveBeenCalledWith(
                userId,
                studyAreaId,
                { type: artifactType, topic: "fotossíntese" },
                `artifact-job:${jobId.toHexString()}`,
                undefined,
                "BACKGROUND",
            );
        },
    );

    it("processa SUMMARY em background através do pipeline de resumos", async () => {
        const { service, studyToolsService, summariesService } = makeService([
            claimedJob({ artifactType: "SUMMARY" }),
            null,
        ]);

        await service.runUntilIdle();

        expect(summariesService.generateSummary).toHaveBeenCalledWith(
            userId,
            studyAreaId,
            `artifact-job:${jobId.toHexString()}`,
            undefined,
            "BACKGROUND",
        );
        expect(studyToolsService.generateStudyTool).not.toHaveBeenCalled();
    });

    it("não chama o provider quando a conta do job já não está ativa", async () => {
        const { jobModel, service, studyToolsService, usersService } = makeService([
            claimedJob({ attempts: 1, maxAttempts: 3 }),
            null,
        ]);
        usersService.findSessionUser.mockResolvedValueOnce(null);

        await expect(service.runUntilIdle()).resolves.toBe(1);

        expect(studyToolsService.generateStudyTool).not.toHaveBeenCalled();
        expect(jobModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ status: "ARTIFACT_PROCESSING" }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "ARTIFACT_QUEUED" }),
            }),
        );
    });

    it("reporta readiness apenas entre bootstrap e shutdown", async () => {
        const { service } = makeService([null]);

        expect(() => service.checkReady()).toThrow("not ready");
        service.onApplicationBootstrap();
        expect(() => service.checkReady()).not.toThrow();
        await service.onApplicationShutdown();
        expect(() => service.checkReady()).toThrow("not ready");
    });
});

function claimedJob(
    overrides: Partial<{
        attempts: number;
        maxAttempts: number;
        status:
            | "QUEUED"
            | "PROCESSING"
            | "ARTIFACT_QUEUED"
            | "ARTIFACT_PROCESSING";
        artifactType: "SUMMARY" | "EXPLANATION" | "FLASHCARDS" | "QUIZ";
    }> = {},
) {
    return {
        _id: jobId,
        userId: new Types.ObjectId(userId),
        studyAreaId: new Types.ObjectId(studyAreaId),
        status: "ARTIFACT_PROCESSING",
        topic: "fotossíntese",
        attempts: 1,
        maxAttempts: 3,
        leaseToken: 7,
        leaseOwner: "worker",
        leaseExpiresAt: new Date(Date.now() + 30_000),
        ...overrides,
    };
}

function makeService(claims: Array<ReturnType<typeof claimedJob> | null>) {
    const claimLean = jest.fn();
    for (const claim of claims) claimLean.mockResolvedValueOnce(claim);
    claimLean.mockResolvedValue(null);
    const jobModel = {
        create: jest.fn().mockResolvedValue({
            toObject: () => ({
                _id: jobId,
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "ARTIFACT_QUEUED",
                topic: "fotossíntese",
                attempts: 0,
                maxAttempts: 3,
            }),
        }),
        findOneAndUpdate: jest.fn().mockReturnValue({ lean: claimLean }),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        findOne: jest.fn().mockReturnValue(queryResult(null)),
    };
    const studyToolsService: jest.Mocked<QuizGenerationStudyToolsPort> = {
        assertGenerationReady: jest.fn().mockResolvedValue(undefined),
        generateStudyTool: jest.fn().mockResolvedValue({ _id: artifactId }),
    };
    const summariesService = {
        assertGenerationReady: jest.fn().mockResolvedValue(undefined),
        generateSummary: jest.fn().mockResolvedValue({ _id: artifactId }),
    };
    const usersService = {
        findSessionUser: jest.fn().mockResolvedValue({
            user: {
                id: userId,
                email: "quiz-runner@example.test",
                role: "STUDENT",
            },
            sessionVersion: 0,
        }),
    };
    return {
        jobModel,
        studyToolsService,
        summariesService,
        usersService,
        service: new QuizGenerationJobsService(
            jobModel as never,
            studyToolsService,
            new AccountLifecycleBarrierService(),
            usersService as never,
            undefined,
            undefined,
            undefined,
            summariesService as never,
        ),
    };
}

function queryResult(value: ReturnType<typeof claimedJob> | null) {
    const query = {
        lean: jest.fn().mockResolvedValue(value),
        sort: jest.fn(),
    };
    query.sort.mockReturnValue(query);
    return query;
}
