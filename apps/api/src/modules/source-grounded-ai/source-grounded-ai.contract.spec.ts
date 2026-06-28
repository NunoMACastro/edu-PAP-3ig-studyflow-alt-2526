// apps/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts
import {
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { MaterialTextChunk } from "../material-index/schemas/material-index-job.schema.js";
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
};

describe("SourceGroundedAiService contrato crítico", () => {
    const student: AuthenticatedUser = {
        id: "64f000000000000000000003",
        role: "STUDENT",
        email: "aluno@escola.pt",
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("persiste resposta com citações quando existem fontes autorizadas", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "As derivadas medem a taxa de variação instantânea.",
                    sourceLabel: "Manual de Matemática",
                    locator: "p. 12",
                },
            ],
            providerAnswer: "As derivadas medem a taxa de variação instantânea.",
        });

        try {
            const result = await context.service.ask(student, {
                question: "Explica o que são derivadas.",
                sourceJobIds: ["64f000000000000000000001"],
            });

            expect(result).toMatchObject({
                question: "Explica o que são derivadas.",
                answer: "As derivadas medem a taxa de variação instantânea.",
                citations: [
                    {
                        sourceJobId: "64f000000000000000000001",
                        materialId: "64f000000000000000000002",
                        sourceLabel: "Manual de Matemática",
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
                }),
            );
            expect(context.answerModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    question: "Explica o que são derivadas.",
                    citations: expect.arrayContaining([
                        expect.objectContaining({
                            sourceLabel: "Manual de Matemática",
                        }),
                    ]),
                }),
            );
        } finally {
            await context.moduleRef.close();
        }
    });

    it("bloqueia resposta quando não há fontes citáveis", async () => {
        const context = await makeContractContext({ chunks: [] });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Explica a matéria.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(UnprocessableEntityException);

            // Sem fontes, a IA não pode inventar uma resposta factual para o aluno.
            expect(context.aiProvider.generateStudyTool).not.toHaveBeenCalled();
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });

    it("rejeita resposta inválida do provider e não persiste conteúdo inseguro", async () => {
        const context = await makeContractContext({
            chunks: [
                {
                    order: 1,
                    text: "A fotossíntese transforma luz em energia química.",
                    sourceLabel: "Manual de Biologia",
                    locator: "secção 3",
                },
            ],
            providerAnswer: "",
        });

        try {
            await expect(
                context.service.ask(student, {
                    question: "Resume a fotossíntese.",
                    sourceJobIds: ["64f000000000000000000001"],
                }),
            ).rejects.toBeInstanceOf(ServiceUnavailableException);

            // Respostas vazias ou malformadas não devem entrar no histórico do aluno.
            expect(context.answerModel.create).not.toHaveBeenCalled();
        } finally {
            await context.moduleRef.close();
        }
    });
});

/**
 * Cria o contexto de teste com dependências injetadas pelo NestJS.
 *
 * @param options.chunks Chunks textuais já autorizados pelo MaterialIndexService.
 * @param options.providerAnswer Resposta devolvida pelo provider IA isolado.
 * @returns Service e mocks tipados para validar caminho principal e negativos.
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
            .mockResolvedValue({ answer: options.providerAnswer ?? "Resposta citada." }),
    };

    const moduleRef = await Test.createTestingModule({
        providers: [
            SourceGroundedAiService,
            {
                provide: getModelToken(SourceGroundedAiAnswer.name),
                useValue: answerModel,
            },
            { provide: MaterialIndexService, useValue: materialIndexService },
            { provide: AI_PROVIDER, useValue: aiProvider },
        ],
    }).compile();

    return {
        moduleRef,
        service: moduleRef.get(SourceGroundedAiService),
        answerModel,
        materialIndexService,
        aiProvider,
    };
}

/**
 * Cria um job de indexação autorizado para testar a fronteira entre fontes existentes e ausência de fontes.
 *
 * @param chunks Chunks textuais processáveis que o service pode citar.
 * @returns Job público no formato devolvido por MaterialIndexService.findReadableDoneJob.
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
 * @returns Documento mínimo com campos usados por SourceGroundedAiService.ask.
 */
function makePersistedAnswer(input: PersistInput): PersistedAnswer {
    return {
        _id: new Types.ObjectId("64f000000000000000000099"),
        ...input,
        toObject: () => ({ createdAt: new Date("2026-06-26T09:00:00.000Z") }),
    };
}