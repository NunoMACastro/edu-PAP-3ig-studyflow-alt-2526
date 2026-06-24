// apps/api/src/modules/ai/quiz-generation-jobs.service.spec.ts
import { Model, Types } from "mongoose";
import {
    QuizGenerationJobsService,
    QuizGenerationStudyToolsPort,
} from "./quiz-generation-jobs.service.js";
import { QuizGenerationJobDocument } from "./schemas/quiz-generation-job.schema.js";

describe("QuizGenerationJobsService", () => {
    it("valida fontes, devolve QUEUED e delega geração real de quiz", async () => {
        const userId = "507f1f77bcf86cd799439014";
        const studyAreaId = "507f1f77bcf86cd799439013";
        const jobId = new Types.ObjectId("507f1f77bcf86cd799439011");
        const artifactId = "507f1f77bcf86cd799439099";

        const jobModel = {
            create: jest.fn().mockResolvedValue({
                toObject: () => ({
                    _id: jobId,
                    userId: new Types.ObjectId(userId),
                    studyAreaId: new Types.ObjectId(studyAreaId),
                    status: "QUEUED",
                }),
            }),
            findOneAndUpdate: jest.fn().mockResolvedValue(null),
        } as Model<QuizGenerationJobDocument>;
        const studyToolsService: jest.Mocked<QuizGenerationStudyToolsPort> = {
            assertQuizGenerationReady: jest.fn().mockResolvedValue(undefined),
            generateStudyTool: jest.fn().mockResolvedValue({ _id: artifactId }),
        };
        const service = new QuizGenerationJobsService(jobModel, studyToolsService);

        const queuedJob = await service.createQuizJob(userId, studyAreaId, {
            topic: "fotossíntese",
        });
        await Promise.resolve();
        await Promise.resolve();

        // O job inicial prova que a UI pode responder antes de a IA terminar.
        expect(studyToolsService.assertQuizGenerationReady).toHaveBeenCalledWith(
            userId,
            studyAreaId,
        );
        expect(queuedJob.status).toBe("QUEUED");
        expect(studyToolsService.generateStudyTool).toHaveBeenCalledWith(
            userId,
            studyAreaId,
            { type: "QUIZ", topic: "fotossíntese" },
        );
    });

    it("não cria job quando a área não tem fontes processáveis", async () => {
        const userId = "507f1f77bcf86cd799439014";
        const studyAreaId = "507f1f77bcf86cd799439013";
        const jobModel = {
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
        } as Model<QuizGenerationJobDocument>;
        const studyToolsService: jest.Mocked<QuizGenerationStudyToolsPort> = {
            assertQuizGenerationReady: jest
                .fn()
                .mockRejectedValue(new Error("Sem fontes processáveis.")),
            generateStudyTool: jest.fn(),
        };
        const service = new QuizGenerationJobsService(jobModel, studyToolsService);

        // A validação de ownership/fontes acontece antes de a UI receber um job QUEUED.
        await expect(
            service.createQuizJob(userId, studyAreaId, {}),
        ).rejects.toThrow("Sem fontes processáveis.");
        expect(jobModel.create).not.toHaveBeenCalled();
        expect(studyToolsService.generateStudyTool).not.toHaveBeenCalled();
    });
});