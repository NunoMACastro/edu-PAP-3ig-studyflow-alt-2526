/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import {
    BadGatewayException,
    BadRequestException,
    GatewayTimeoutException,
    NotFoundException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { StudyToolsService } from "./study-tools.service.js";
import { createGovernedAiExecutionFixture } from "./governed-ai-execution.test-fixture.js";

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";
const artifactId = "507f1f77bcf86cd799439016";

describe("StudyToolsService", () => {
    /**
     * Confirma a regra crítica da MF0: sem fontes processáveis não há IA.
     */
    it("bloqueia geração quando não há fontes processáveis", async () => {
        const { artifactModel, aiProvider, materialsService, service } =
            makeService();
        materialsService.listReadyTextSources.mockResolvedValue([]);

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "NO_PROCESSABLE_SOURCES",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(artifactModel.create).not.toHaveBeenCalled();
    });

    /**
     * Confirma que tipo inválido no body usa o erro canónico do BK-MF0-12.
     */
    it("rejeita tipo inválido na geração", async () => {
        const { aiProvider, areasService, service } = makeService();

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "NOT_A_TOOL" as never,
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_STUDY_TOOL_TYPE",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "NOT_A_TOOL" as never,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
    });

    /**
     * Confirma que tipo inválido em query não devolve lista vazia silenciosa.
     */
    it("rejeita tipo inválido na listagem", async () => {
        const { artifactModel, areasService, service } = makeService();

        await expect(
            service.listTools(userId, studyAreaId, "NOT_A_TOOL"),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_STUDY_TOOL_TYPE",
            },
        });
        await expect(
            service.listTools(userId, studyAreaId, "NOT_A_TOOL"),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(areasService.getMyStudyArea).not.toHaveBeenCalled();
        expect(artifactModel.find).not.toHaveBeenCalled();
    });

    /**
     * Confirma que a listagem usa DTO público e não expõe ownership interno.
     */
    it("lista ferramentas sem expor userId", async () => {
        const { artifactModel, service } = makeService();
        const lean = jest.fn().mockResolvedValue([
            {
                _id: artifactId,
                userId,
                studyAreaId,
                type: "QUIZ",
                contentJson: { questions: [] },
                sourcesJson: [],
                generationKey: `quiz-job:${artifactId}`,
            },
        ]);
        artifactModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({ lean }),
        });

        await expect(service.listTools(userId, studyAreaId)).resolves.toEqual([
            {
                _id: artifactId,
                studyAreaId,
                type: "QUIZ",
                contentJson: { questions: [] },
                sourcesJson: [],
            },
        ]);
    });

    /**
     * Confirma que quizzes inválidos vindos do provider ficam em 502.
     */
    it("rejeita quiz inválido devolvido pelo provider", async () => {
        const { artifactModel, aiProvider, historyService, service } =
            makeService();
        aiProvider.generateStudyTool.mockResolvedValue({
            questions: [
                {
                    question: "Qual é a resposta?",
                    options: ["A", "B"],
                    correctOptionIndex: 0,
                    explanation: "Fonte insuficiente.",
                    sourceMaterialIds: ["507f1f77bcf86cd799439010"],
                },
            ],
        });

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "QUIZ",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_QUIZ_OPTIONS",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "QUIZ",
            }),
        ).rejects.toBeInstanceOf(BadGatewayException);
        expect(artifactModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });

    /**
     * Confirma que timeout do provider não é convertido para erro genérico.
     */
    it("preserva GatewayTimeoutException do provider IA", async () => {
        const { artifactModel, aiProvider, service } = makeService();
        aiProvider.generateStudyTool.mockRejectedValue(
            new GatewayTimeoutException({
                code: "AI_PROVIDER_TIMEOUT",
                message: "A IA demorou demasiado tempo a responder.",
            }),
        );

        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "AI_PROVIDER_TIMEOUT",
            },
        });
        await expect(
            service.generateStudyTool(userId, studyAreaId, {
                type: "EXPLANATION",
            }),
        ).rejects.toBeInstanceOf(GatewayTimeoutException);
        expect(artifactModel.create).not.toHaveBeenCalled();
    });

    it("reutiliza o artefacto do job após restart sem voltar a chamar o provider", async () => {
        const { artifactModel, aiProvider, historyService, service } = makeService();
        artifactModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(makeQuizArtifact()),
        });

        await expect(
            service.generateStudyTool(
                userId,
                studyAreaId,
                { type: "QUIZ" },
                `quiz-job:${artifactId}`,
            ),
        ).resolves.toMatchObject({ _id: artifactId, type: "QUIZ" });

        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(artifactModel.create).not.toHaveBeenCalled();
        expect(historyService.recordEvent).not.toHaveBeenCalled();
    });

    /**
     * Confirma que a tentativa de quiz calcula resultado e regista histórico.
     */
    it("regista tentativa de quiz com score e resultados por pergunta", async () => {
        const { artifactModel, historyService, quizAttemptModel, service } =
            makeService();
        artifactModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(makeQuizArtifact()),
        });
        quizAttemptModel.create.mockImplementation(async (payload) => ({
            _id: "507f1f77bcf86cd799439017",
            ...payload,
        }));

        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [1, 0],
            }),
        ).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439017",
            artifactId,
            studyAreaId,
            correctCount: 1,
            totalQuestions: 2,
            scorePercent: 50,
            results: [
                {
                    questionIndex: 0,
                    selectedOptionIndex: 1,
                    correctOptionIndex: 1,
                    isCorrect: true,
                },
                {
                    questionIndex: 1,
                    selectedOptionIndex: 0,
                    correctOptionIndex: 2,
                    isCorrect: false,
                },
            ],
        });
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "QUIZ_ATTEMPT_RECORDED",
            "Quiz realizado",
            "1/2",
        );
    });

    /**
     * Confirma que artefactos inacessíveis ou de outro aluno não são usados.
     */
    it("rejeita tentativa em artefacto de outro aluno ou área", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [0],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    /**
     * Confirma que só artefactos QUIZ aceitam tentativa.
     */
    it("rejeita tentativa em artefacto que não é quiz", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                ...makeQuizArtifact(),
                type: "SUMMARY",
            }),
        });

        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [0],
            }),
        ).rejects.toMatchObject({
            response: { code: "ARTIFACT_IS_NOT_QUIZ" },
        });
        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [0],
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });

    /**
     * Confirma que respostas incompletas ou fora do contrato são rejeitadas.
     */
    it("rejeita tentativa com respostas inválidas", async () => {
        const { artifactModel, service } = makeService();
        artifactModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(makeQuizArtifact()),
        });

        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [4],
            }),
        ).rejects.toMatchObject({
            response: { code: "INVALID_QUIZ_ATTEMPT" },
        });
        await expect(
            service.submitQuizAttempt(userId, studyAreaId, artifactId, {
                answers: [4],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});

/**
 * Cria o service com mocks isolados para testar regras MF0 sem Mongo/OpenAI.
 *
 * @returns Service e dependências mockadas.
 */
function makeService() {
    const artifactModel = {
        create: jest.fn(),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
            }),
        }),
    };
    const quizAttemptModel = {
        create: jest.fn(),
    };
    const aiProvider = {
        generateStudyTool: jest.fn(),
    };
    const materialsService = {
        listReadyTextSources: jest.fn().mockResolvedValue([
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                title: "Fonte",
                contentText: "Conteúdo factual processável para a ferramenta.",
            },
        ]),
    };
    const areasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({
            _id: studyAreaId,
            name: "Matemática",
        }),
    };
    const profileService = {
        prepareProfile: jest.fn().mockResolvedValue({
            status: "READY_FOR_GENERATION",
            voiceTone: "step_by_step",
        }),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };

    return {
        artifactModel,
        quizAttemptModel,
        aiProvider,
        materialsService,
        areasService,
        profileService,
        historyService,
        service: new StudyToolsService(
            artifactModel as never,
            quizAttemptModel as never,
            createGovernedAiExecutionFixture(aiProvider),
            materialsService as never,
            areasService as never,
            profileService as never,
            historyService as never,
        ),
    };
}

/**
 * Cria artefacto QUIZ válido para testes de tentativa.
 *
 * @returns Artefacto persistido simulado.
 */
function makeQuizArtifact() {
    return {
        _id: artifactId,
        userId,
        studyAreaId,
        type: "QUIZ",
        contentJson: {
            questions: [
                {
                    question: "Pergunta 1",
                    options: ["A", "B", "C", "D"],
                    correctOptionIndex: 1,
                    explanation: "Explicação 1.",
                    sourceMaterialIds: ["507f1f77bcf86cd799439010"],
                },
                {
                    question: "Pergunta 2",
                    options: ["A", "B", "C", "D"],
                    correctOptionIndex: 2,
                    explanation: "Explicação 2.",
                    sourceMaterialIds: ["507f1f77bcf86cd799439010"],
                },
            ],
        },
        sourcesJson: [{ materialId: "507f1f77bcf86cd799439010", title: "Fonte" }],
    };
}
