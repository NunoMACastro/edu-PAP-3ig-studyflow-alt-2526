/**
 * Testa o comportamento de IA com fontes obrigatórias e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException, UnprocessableEntityException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

describe("SourceGroundedAiService", () => {
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "aluno@example.test",
        role: "STUDENT",
    };
    const jobId = "507f1f77bcf86cd799439013";
    const materialId = "507f1f77bcf86cd799439014";

    it("cria resposta com citações de chunks autorizados", async () => {
        const { aiProvider, answerModel, materialIndexService, service } =
            makeService();

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "O que são derivadas?",
            }),
        ).resolves.toMatchObject({
            sourceJobIds: [jobId],
            citations: [
                {
                    sourceJobId: jobId,
                    materialId,
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        });
        expect(materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
            student,
            jobId,
        );
        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                question: "O que são derivadas?",
                answer: "Resposta gerada pelo provider.",
                citations: expect.any(Array),
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "EXPLANATION",
                prompt: expect.stringContaining("Fontes autorizadas"),
            }),
        );
    });

    it("bloqueia fonte sem autorização antes de chamar o provider", async () => {
        const { aiProvider, answerModel, materialIndexService, service } =
            makeService();
        materialIndexService.findReadableDoneJob.mockRejectedValueOnce(
            new ForbiddenException({
                code: "MATERIAL_INDEX_FORBIDDEN",
                message: "O utilizador não pode ler esta fonte.",
            }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Resume este documento.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia quando o job não tem chunks citáveis", async () => {
        const { materialIndexService, service } = makeService();
        materialIndexService.findReadableDoneJob.mockResolvedValueOnce({
            _id: jobId,
            materialId,
            extractedTextChunks: [],
        });

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica o tema.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
});

type PersistedAnswerInput = {
    sourceJobIds: unknown[];
    question: string;
    answer: string;
    citations: unknown[];
};

/**
 * Cria estrutura auxiliar de IA com fontes obrigatórias para manter testes e prompts legíveis.
 *
 * @returns Dependências simuladas e service pronto a testar.
 */
function makeService() {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input: PersistedAnswerInput) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const materialIndexService = {
        findReadableDoneJob: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439014",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        }),
    };
    const aiProvider = {
        generateStudyTool: jest
            .fn()
            .mockResolvedValue({ answer: "Resposta gerada pelo provider." }),
    };
    const service = new SourceGroundedAiService(
        answerModel as never,
        materialIndexService as never,
        aiProvider as never,
    );
    return { aiProvider, answerModel, materialIndexService, service };
}