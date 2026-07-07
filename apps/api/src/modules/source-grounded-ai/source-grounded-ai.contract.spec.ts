import {
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import { AiConsentsService } from "../ai-consents/ai-consents.service.js";
import { AiModelPoliciesService } from "../ai-model-policies/ai-model-policies.service.js";
import { AiQuotasService } from "../ai-quotas/ai-quotas.service.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
    MaterialTextChunk,
} from "../material-index/material-index.service.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedCitation,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

type PersistInput = {
    actorId: Types.ObjectId;
    sourceJobIds: Types.ObjectId[];
    question: string;
    answer: string;
    citations: SourceGroundedCitation[];
};

type PersistedAnswer = PersistInput & {
    _id: Types.ObjectId;
    toObject(): { createdAt: Date };
};

type SourceGroundedContractContext = {
    moduleRef: TestingModule;
    service: SourceGroundedAiService;
    answerModel: {
        create: jest.Mock<Promise<PersistedAnswer>, [PersistInput]>;
    };
    materialIndexService: {
        findReadableDoneJob: jest.Mock<
            Promise<MaterialIndexJobView>,
            [AuthenticatedUser, string]
        >;
    };
    aiProvider: {
        generateStudyTool: jest.Mock<
            Promise<Record<string, unknown>>,
            [Parameters<AiProvider["generateStudyTool"]>[0]]
        >;
    };
    aiConsentsService: {
        assertGranted: jest.Mock;
    };
    aiModelPoliciesService: {
        resolveForUse: jest.Mock;
    };
    aiQuotasService: {
        reserveUsage: jest.Mock;
    };
};

describe("SourceGroundedAiService contrato critico", () => {
    const student: AuthenticatedUser = {
        id: "64f000000000000000000003",
        role: "STUDENT",
        email: "aluno@escola.pt",
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("persiste resposta com citacoes quando existem fontes autorizadas", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variacao instantanea.",
                    sourceLabel: "Manual de Matematica",
                    locator: "p. 12",
                },
            ],
            providerAnswer: "As derivadas medem a taxa de variacao instantanea.",
        });

        try {
            const result = await context.service.ask(student, {
                question: "Explica o que sao derivadas.",
                sourceJobIds: ["64f000000000000000000001"],
            });

            expect(result).toMatchObject({
                question: "Explica o que sao derivadas.",
                answer: "As derivadas medem a taxa de variacao instantanea.",
                citations: [
                    {
                        sourceJobId: "64f000000000000000000001",
                        materialId: "64f000000000000000000002",
                        sourceLabel: "Manual de Matematica",
                        locator: "p. 12",
                    },
                ],
            });
            expect(context.materialIndexService.findReadableDoneJob).toHaveBeenCalledWith(
                student,
                "64f000000000000000000001",
            );
            expect(context.aiProvider.generateStudyTool).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "EXPLANATION",
                    prompt: expect.stringContaining("Fontes autorizadas"),
                    options: { model: "gpt-contract-source", timeoutMs: 3200 },
                }),
            );
            expect(context.aiConsentsService.assertGranted).toHaveBeenCalledWith(
                student.id,
                "SOURCE_GROUNDED_AI",
            );
            expect(context.aiModelPoliciesService.resolveForUse).toHaveBeenCalledWith(
                "SOURCE_GROUNDED_AI",
            );
            expect(context.aiQuotasService.reserveUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: "USER",
                    targetId: student.id,
                    purpose: "SOURCE_GROUNDED_AI",
                    units: expect.any(Number),
                }),
            );
            expect(context.answerModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    question: "Explica o que sao derivadas.",
                    citations: expect.arrayContaining([
                        expect.objectContaining({
                            sourceLabel: "Manual de Matematica",
                        }),
                    ]),
                }),
            );
        } finally {
            await context.moduleRef.close();
        }
    });

    it("bloqueia resposta quando nao ha fontes citaveis", async () => {
        const context = await makeContractContext({ chunks: [] });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Explica a materia.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(UnprocessableEntityException);

            // Sem fontes, a IA nao pode inventar uma resposta factual para o aluno.
            expect(context.aiConsentsService.assertGranted).not.toHaveBeenCalled();
            expect(context.aiProvider.generateStudyTool).not.toHaveBeenCalled();
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });

    it("rejeita resposta invalida do provider e nao persiste conteudo inseguro", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "A fotossintese transforma luz em energia quimica.",
                    sourceLabel: "Manual de Biologia",
                    locator: "seccao 3",
                },
            ],
            providerAnswer: "",
        });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Resume a fotossintese.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(ServiceUnavailableException);

            // Respostas vazias ou malformadas nao devem entrar no historico do aluno.
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });
});

/**
 * Cria o contexto de teste com dependencias injetadas pelo NestJS.
 * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
 *
 * @param options Opções de execução que permitem configurar a operação sem depender de estado global.
 * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
 */
async function makeContractContext(options: {
    chunks: MaterialTextChunk[];
    providerAnswer?: string;
}): Promise<SourceGroundedContractContext> {
    const answerModel = {
        create: jest
            .fn<Promise<PersistedAnswer>, [PersistInput]>()
            .mockImplementation(async (input) => makePersistedAnswer(input)),
    };
    const materialIndexService = {
        findReadableDoneJob: jest
            .fn<Promise<MaterialIndexJobView>, [AuthenticatedUser, string]>()
            .mockResolvedValue(makeIndexedJob(options.chunks)),
    };
    const aiProvider = {
        generateStudyTool: jest
            .fn<
                Promise<Record<string, unknown>>,
                [Parameters<AiProvider["generateStudyTool"]>[0]]
            >()
            .mockResolvedValue({
                answer: options.providerAnswer ?? "Resposta citada.",
            }),
    };
    const aiConsentsService = {
        assertGranted: jest
            .fn<Promise<void>, [string, string]>()
            .mockResolvedValue(undefined),
    };
    const aiModelPoliciesService = {
        resolveForUse: jest.fn().mockResolvedValue({
            purpose: "SOURCE_GROUNDED_AI",
            enabled: true,
            provider: "openai",
            model: "gpt-contract-source",
            timeoutMs: 3200,
            maxSourceCount: 10,
            maxPromptChars: 12000,
        }),
    };
    const aiQuotasService = {
        reserveUsage: jest.fn().mockResolvedValue({
            scope: "USER",
            targetId: "64f000000000000000000003",
            usedUnits: 1,
        }),
    };

    const moduleRef = await Test.createTestingModule({
        providers: [
            SourceGroundedAiService,
            {
                provide: getModelToken(SourceGroundedAiAnswer.name),
                useValue: answerModel,
            },
            { provide: MaterialIndexService, useValue: materialIndexService },
            { provide: AiConsentsService, useValue: aiConsentsService },
            { provide: AiModelPoliciesService, useValue: aiModelPoliciesService },
            { provide: AiQuotasService, useValue: aiQuotasService },
            { provide: AI_PROVIDER, useValue: aiProvider },
        ],
    }).compile();

    return {
        moduleRef,
        service: moduleRef.get(SourceGroundedAiService),
        answerModel,
        materialIndexService,
        aiProvider,
        aiConsentsService,
        aiModelPoliciesService,
        aiQuotasService,
    };
}

/**
 * Cria um job de indexacao autorizado para testar a fronteira entre fontes existentes e ausencia de fontes.
 *
 * @param chunks Chunks textuais processaveis que o service pode citar.
 * @returns Job publico no formato devolvido por MaterialIndexService.findReadableDoneJob.
 */
function makeIndexedJob(chunks: MaterialTextChunk[]): MaterialIndexJobView {
    return {
        _id: "64f000000000000000000001",
        scope: "PRIVATE_AREA",
        materialId: "64f000000000000000000002",
        userId: "64f000000000000000000003",
        status: "DONE",
        extractedTextChunks: chunks,
    };
}

/**
 * Simula o documento persistido pelo Mongoose sem abrir uma base de dados real.
 *
 * @param input Dados que o service tentou persistir depois de validar fontes e provider.
 * @returns Documento minimo com campos usados por SourceGroundedAiService.ask.
 */
function makePersistedAnswer(input: PersistInput): PersistedAnswer {
    return {
        _id: new Types.ObjectId("64f000000000000000000099"),
        ...input,
        /**
         * Transforma o apoio de teste para IA apoiada em fontes autorizadas, mantendo o cenário legível e próximo do comportamento real validado.
         * Este fluxo mantém a governação de IA explícita quando depende de consentimento, política, quota ou fontes autorizadas.
         *
         * @returns Contrato público pronto para a UI, sem campos internos de persistência.
         */
        toObject: () => ({ createdAt: new Date("2026-06-26T09:00:00.000Z") }),
    };
}
