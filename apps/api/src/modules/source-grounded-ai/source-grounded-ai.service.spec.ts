/**
 * Testa o comportamento de IA com fontes obrigatórias e documenta os cenários de aceitação automatizados.
 */
import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
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

    it("cria resposta com citações de chunks autorizados depois de aplicar governança IA", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            answerModel,
            materialIndexService,
            service,
        } = makeService();

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
        expect(aiConsentsService.assertGranted).toHaveBeenCalledWith(
            student.id,
            "SOURCE_GROUNDED_AI",
        );
        expect(aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith(
            "SOURCE_GROUNDED_AI",
        );
        expect(aiQuotasService.reserveUsage).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: "USER",
                targetId: student.id,
                purpose: "SOURCE_GROUNDED_AI",
                units: expect.any(Number),
            }),
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
                options: { model: "gpt-test-source", timeoutMs: 3500 },
            }),
        );
    });

    it("limita as citações persistidas e enviadas ao provider por maxSourceCount", async () => {
        const { aiProvider, answerModel, service } = makeService({
            policy: { maxSourceCount: 1 },
            chunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
                {
                    order: 2,
                    text: "Os integrais acumulam quantidades ao longo de um intervalo.",
                    sourceLabel: "Integrais",
                    locator: "secção 2",
                },
            ],
        });

        await service.ask(student, {
            sourceJobIds: [jobId],
            question: "Compara derivadas e integrais.",
        });

        expect(answerModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                citations: [
                    expect.objectContaining({
                        sourceLabel: "Derivadas",
                    }),
                ],
            }),
        );
        expect(aiProvider.generateStudyTool).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.not.stringContaining("Integrais"),
            }),
        );
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

    it("bloqueia chunks sem citação pública antes de chamar governança IA", async () => {
        const {
            aiConsentsService,
            aiProvider,
            answerModel,
            materialIndexService,
            service,
        } = makeService();
        materialIndexService.findReadableDoneJob.mockResolvedValueOnce({
            _id: jobId,
            materialId,
            extractedTextChunks: [
                {
                    order: 1,
                    text: "A fotossíntese transforma luz em energia química.",
                    sourceLabel: " ",
                    locator: "secção 3",
                },
            ],
        });

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Resume a fotossíntese.",
            }),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);

        // Um chunk sem fonte pública verificável não deve chegar a consentimento, quota ou provider.
        expect(aiConsentsService.assertGranted).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia fonte proibida antes de chamar o provider", async () => {
        const { aiProvider, answerModel, materialIndexService, service } =
            makeService();
        materialIndexService.findReadableDoneJob.mockRejectedValueOnce(
            new Error("MATERIAL_INDEX_ACCESS_DENIED"),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toThrow("MATERIAL_INDEX_ACCESS_DENIED");

        // A validação de leitura acontece antes do prompt; se falha, o provider não recebe dados.
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia consentimento recusado antes de política, quota e provider", async () => {
        const {
            aiConsentsService,
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            answerModel,
            service,
        } = makeService();
        aiConsentsService.assertGranted.mockRejectedValueOnce(
            new ForbiddenException({
                code: "AI_CONSENT_REQUIRED",
                message: "O consentimento para IA não está ativo.",
            }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(aiModelPoliciesService.resolveForUse).not.toHaveBeenCalled();
        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia política desativada antes de quota e provider", async () => {
        const {
            aiModelPoliciesService,
            aiProvider,
            aiQuotasService,
            answerModel,
            service,
        } = makeService();
        aiModelPoliciesService.resolveForUse.mockRejectedValueOnce(
            new ServiceUnavailableException({
                code: "AI_MODEL_POLICY_DISABLED",
                message: "Esta funcionalidade de IA está temporariamente desativada.",
            }),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        expect(aiQuotasService.reserveUsage).not.toHaveBeenCalled();
        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("não persiste quando o provider devolve resposta inválida", async () => {
        const { aiProvider, answerModel, service } = makeService();
        aiProvider.generateStudyTool.mockResolvedValueOnce({ answer: "" });

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Resume a fotossíntese.",
            }),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);

        // Respostas vazias não entram no histórico porque poderiam parecer factos válidos.
        expect(answerModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia quota excedida antes de chamar o provider", async () => {
        const { aiProvider, aiQuotasService, answerModel, service } =
            makeService();
        aiQuotasService.reserveUsage.mockRejectedValueOnce(
            new HttpException(
                {
                    code: "AI_QUOTA_EXCEEDED",
                    message: "A quota mensal de IA foi excedida.",
                },
                HttpStatus.TOO_MANY_REQUESTS,
            ),
        );

        await expect(
            service.ask(student, {
                sourceJobIds: [jobId],
                question: "Explica esta fonte.",
            }),
        ).rejects.toBeInstanceOf(HttpException);

        expect(aiProvider.generateStudyTool).not.toHaveBeenCalled();
        expect(answerModel.create).not.toHaveBeenCalled();
    });
});

type TestSourceChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

/**
 * Cria fixture ou estrutura auxiliar de IA com fontes obrigatórias para manter testes e prompts legíveis.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @param options Opções de execução que permitem configurar a operação sem depender de estado global.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(options: {
    chunks?: TestSourceChunk[];
    policy?: Partial<{
        model: string;
        timeoutMs: number;
        maxSourceCount: number;
        maxPromptChars: number;
    }>;
} = {}) {
    const answerModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            _id: "507f1f77bcf86cd799439099",
            ...input,
            /**
             * Transforma o apoio de teste para IA apoiada em fontes autorizadas, mantendo o cenário legível e próximo do comportamento real validado.
             * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({ createdAt: new Date("2026-06-15T10:00:00Z") }),
        })),
    };
    const materialIndexService = {
        findReadableDoneJob: jest.fn().mockResolvedValue({
            _id: "507f1f77bcf86cd799439013",
            materialId: "507f1f77bcf86cd799439014",
            extractedTextChunks: options.chunks ?? [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Derivadas",
                    locator: "secção 1",
                },
            ],
        }),
    };
    const aiConsentsService = {
        assertGranted: jest.fn().mockResolvedValue(undefined),
    };
    const aiModelPoliciesService = {
        resolveForUse: jest.fn().mockResolvedValue({
            purpose: "SOURCE_GROUNDED_AI",
            enabled: true,
            provider: "openai",
            model: "gpt-test-source",
            timeoutMs: 3500,
            maxSourceCount: 10,
            maxPromptChars: 12000,
            ...options.policy,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({
            scope: "USER",
            targetId: "507f1f77bcf86cd799439012",
            usedUnits: 1,
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
        aiConsentsService as never,
        aiModelPoliciesService as never,
        aiQuotasService as never,
        aiProvider as never,
    );
    return {
        aiConsentsService,
        aiModelPoliciesService,
        aiProvider,
        aiQuotasService,
        answerModel,
        materialIndexService,
        service,
    };
}
