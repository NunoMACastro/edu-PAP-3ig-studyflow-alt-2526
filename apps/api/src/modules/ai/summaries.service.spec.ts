/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import {
    BadGatewayException,
    GatewayTimeoutException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { createGovernedAiExecutionFixture } from "./governed-ai-execution.test-fixture.js";
import { SummariesService } from "./summaries.service.js";

describe("SummariesService", () => {
    const userId = "507f1f77bcf86cd799439012";
    const studyAreaId = "507f1f77bcf86cd799439011";

    /**
     * Confirma que a geração não chama a IA sem fontes processáveis.
     */
    it("bloqueia geração de resumo sem fontes processáveis", async () => {
        const artifactModel = { create: jest.fn() };
        const aiProvider = { generateSummary: jest.fn() };
        const materialsService = {
            listReadyTextSources: jest.fn().mockResolvedValue([]),
        };
        const areasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                name: "Matemática",
            }),
        };
        const profileService = {
            prepareProfile: jest.fn().mockResolvedValue({
                status: "READY_FOR_GENERATION",
                voiceTone: "directo",
            }),
        };
        const historyService = { recordEvent: jest.fn() };

        const service = new SummariesService(
            artifactModel as never,
            createGovernedAiExecutionFixture(aiProvider),
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        );

        await expect(
            service.generateSummary(
                "507f1f77bcf86cd799439012",
                "507f1f77bcf86cd799439011",
            ),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateSummary).not.toHaveBeenCalled();
        expect(artifactModel.create).not.toHaveBeenCalled();
    });

    /**
     * Confirma que erros de contrato IA inválido não são mascarados como indisponibilidade.
     */
    it("preserva BadGatewayException quando o resumo viola o contrato", async () => {
        const artifactModel = { create: jest.fn() };
        const aiProvider = {
            generateSummary: jest.fn().mockResolvedValue({ title: "Resumo" }),
        };
        const materialsService = {
            listReadyTextSources: jest.fn().mockResolvedValue([
                {
                    _id: "507f1f77bcf86cd799439015",
                    title: "Fonte",
                    contentText: "Texto processável.",
                },
            ]),
        };
        const areasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                name: "Matemática",
            }),
        };
        const profileService = {
            prepareProfile: jest.fn().mockResolvedValue({
                status: "READY_FOR_GENERATION",
                voiceTone: "directo",
            }),
        };
        const historyService = { recordEvent: jest.fn() };

        const service = new SummariesService(
            artifactModel as never,
            createGovernedAiExecutionFixture(aiProvider),
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        );

        await expect(
            service.generateSummary(
                "507f1f77bcf86cd799439012",
                "507f1f77bcf86cd799439011",
            ),
        ).rejects.toBeInstanceOf(BadGatewayException);
        expect(artifactModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });

    /**
     * Confirma que timeout do provider mantém o código público específico.
     */
    it("preserva GatewayTimeoutException do provider IA", async () => {
        const artifactModel = { create: jest.fn() };
        const aiProvider = {
            generateSummary: jest.fn().mockRejectedValue(
                new GatewayTimeoutException({
                    code: "AI_PROVIDER_TIMEOUT",
                    message: "A IA demorou demasiado tempo a responder.",
                }),
            ),
        };
        const materialsService = {
            listReadyTextSources: jest.fn().mockResolvedValue([
                {
                    _id: "507f1f77bcf86cd799439015",
                    title: "Fonte",
                    contentText: "Texto processável.",
                },
            ]),
        };
        const areasService = {
            getMyStudyArea: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439011",
                name: "Matemática",
            }),
        };
        const profileService = {
            prepareProfile: jest.fn().mockResolvedValue({
                status: "READY_FOR_GENERATION",
                voiceTone: "directo",
            }),
        };
        const historyService = { recordEvent: jest.fn() };

        const service = new SummariesService(
            artifactModel as never,
            createGovernedAiExecutionFixture(aiProvider),
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        );

        await expect(
            service.generateSummary(
                "507f1f77bcf86cd799439012",
                "507f1f77bcf86cd799439011",
            ),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_TIMEOUT",
            },
        });
        await expect(
            service.generateSummary(
                "507f1f77bcf86cd799439012",
                "507f1f77bcf86cd799439011",
            ),
        ).rejects.toBeInstanceOf(GatewayTimeoutException);
        expect(artifactModel.create).not.toHaveBeenCalled();
    });

    /**
     * Confirma que a listagem de resumos usa ownership e DTO público.
     */
    it("lista apenas resumos da área sem expor userId", async () => {
        const lean = jest.fn().mockResolvedValue([
            {
                _id: "507f1f77bcf86cd799439016",
                userId,
                studyAreaId,
                type: "SUMMARY",
                contentJson: {
                    title: "Resumo",
                    bullets: ["Ponto"],
                    sourceMaterialIds: ["507f1f77bcf86cd799439015"],
                },
                sourcesJson: [
                    {
                        materialId: "507f1f77bcf86cd799439015",
                        title: "Fonte",
                    },
                ],
            },
        ]);
        const artifactModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({ lean }),
            }),
        };
        const service = new SummariesService(
            artifactModel as never,
            createGovernedAiExecutionFixture({ generateSummary: jest.fn() }),
            { listReadyTextSources: jest.fn() } as never,
            { getMyStudyArea: jest.fn().mockResolvedValue({ _id: studyAreaId }) } as never,
            { prepareProfile: jest.fn() } as never,
            { recordEvent: jest.fn() } as never,
        );

        await expect(service.listSummaries(userId, studyAreaId)).resolves.toEqual([
            {
                _id: "507f1f77bcf86cd799439016",
                studyAreaId,
                type: "SUMMARY",
                contentJson: {
                    title: "Resumo",
                    bullets: ["Ponto"],
                    sourceMaterialIds: ["507f1f77bcf86cd799439015"],
                },
                sourcesJson: [
                    {
                        materialId: "507f1f77bcf86cd799439015",
                        title: "Fonte",
                    },
                ],
            },
        ]);
        expect(artifactModel.find).toHaveBeenCalledWith({
            userId: expect.any(Object),
            studyAreaId: expect.any(Object),
            type: "SUMMARY",
        });
    });
});
