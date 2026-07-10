/**
 * Testa o comportamento de indexação textual de materiais e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexService,
    materialIndexUrlSafety,
} from "./material-index.service.js";

const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439012",
    email: "aluno@example.test",
    role: "STUDENT",
};
const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439013",
    email: "professor@example.test",
    role: "TEACHER",
};
const studyAreaId = "507f1f77bcf86cd799439014";
const materialId = "507f1f77bcf86cd799439015";
const jobId = "507f1f77bcf86cd799439016";
const subjectId = "507f1f77bcf86cd799439017";

describe("MaterialIndexService", () => {
    it("reutiliza o job ativo do mesmo material em vez de duplicar trabalho", async () => {
        const { jobModel, service } = makeService();
        jobModel.findOne.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: jobId,
                    scope: "PRIVATE_AREA",
                    materialId,
                    studyAreaId,
                    userId: student.id,
                    status: "PROCESSING",
                    extractedTextChunks: [],
                    attempts: 1,
                    maxAttempts: 3,
                }),
            }),
        });

        await expect(
            service.createQueuedPrivateJob(student, studyAreaId, materialId),
        ).resolves.toMatchObject({ _id: jobId, status: "PROCESSING" });
        expect(jobModel.create).not.toHaveBeenCalled();
    });

    it("rehidrata o job mais recente de cada material num único pedido", async () => {
        const { jobModel, materialsService, service } = makeService();
        materialsService.listByArea.mockResolvedValueOnce([
            { _id: materialId },
            { _id: "507f1f77bcf86cd799439019" },
        ]);
        jobModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        _id: jobId,
                        scope: "PRIVATE_AREA",
                        materialId,
                        studyAreaId,
                        userId: student.id,
                        status: "DONE",
                        extractedTextChunks: [],
                    },
                    {
                        _id: "507f1f77bcf86cd799439020",
                        scope: "PRIVATE_AREA",
                        materialId,
                        studyAreaId,
                        userId: student.id,
                        status: "FAILED",
                        extractedTextChunks: [],
                    },
                ]),
            }),
        });

        await expect(
            service.listLatestOwnedJobsForArea(student, studyAreaId),
        ).resolves.toEqual([
            expect.objectContaining({ _id: jobId, materialId }),
        ]);
        expect(materialsService.listByArea).toHaveBeenCalledWith(
            student.id,
            studyAreaId,
        );
    });

    it("fecha leases expirados que já esgotaram tentativas antes do claim", async () => {
        const { jobModel, service } = makeService();

        await expect(
            service.claimNextPrivateJob("worker-test", new Date(), 30_000),
        ).resolves.toBeNull();

        expect(jobModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                $expr: { $gte: ["$attempts", "$maxAttempts"] },
            }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "FAILED" }),
                $unset: expect.objectContaining({ activeKey: "" }),
            }),
        );
    });

    it("atribui token de fencing monotónico em cada claim", async () => {
        const { jobModel, service } = makeService();
        jobModel.findOneAndUpdate.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: jobId,
                materialId,
                studyAreaId,
                userId: student.id,
                attempts: 1,
                maxAttempts: 3,
                leaseToken: 4,
            }),
        });

        await expect(
            service.claimNextPrivateJob("worker-test", new Date(), 30_000),
        ).resolves.toMatchObject({
            _id: jobId,
            leaseOwner: "worker-test",
            leaseToken: 4,
            leaseMs: 30_000,
        });
        expect(jobModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                $inc: { attempts: 1, leaseToken: 1 },
            }),
            expect.objectContaining({ new: true }),
        );
    });

    it("renova o lease e fecha com CAS sobre owner, token e expiração", async () => {
        const { documentSafety, jobModel, materialsService, service } = makeService({
            type: "PDF",
            status: "READY",
            storageKey: "users/aluno/fonte.pdf",
            contentText: "Texto já extraído antes de um restart controlado.",
        });

        await service.processClaimedPrivateJob(claimedMaterialJob(8));

        expect(materialsService.readStoredFile).not.toHaveBeenCalled();
        expect(documentSafety.parseDocument).not.toHaveBeenCalled();
        expect(jobModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "PROCESSING",
                leaseOwner: "worker-test",
                leaseToken: 8,
                leaseExpiresAt: { $gt: expect.any(Date) },
            }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "DONE" }),
            }),
        );
    });

    it("não persiste estado terminal depois de perder o fencing token", async () => {
        const { jobModel, service } = makeService();
        jobModel.updateOne.mockResolvedValueOnce({ modifiedCount: 0 });

        await service.processClaimedPrivateJob(claimedMaterialJob(2));

        expect(
            jobModel.updateOne.mock.calls.some(
                ([, update]) =>
                    (update as { $set?: { status?: string } }).$set?.status ===
                    "DONE",
            ),
        ).toBe(false);
    });

    it.each([
        [1, 1_000],
        [2, 5_000],
        [3, 30_000],
    ])(
        "reagenda a falha %i com o backoff exato",
        async (attempts, delayMs) => {
            const { jobModel, materialsService, service } = makeService();
            materialsService.findOwnedTextMaterial.mockRejectedValueOnce(
                new Error("Mongo temporariamente indisponível"),
            );
            const now = 1_800_000_000_000;
            jest.spyOn(Date, "now").mockReturnValue(now);

            await service.processClaimedPrivateJob({
                ...claimedMaterialJob(attempts),
                maxAttempts: attempts === 3 ? 4 : 3,
            });

            const retryUpdate = jobModel.updateOne.mock.calls.find(
                ([, update]) =>
                    (update as { $set?: { status?: string } }).$set?.status ===
                    "QUEUED",
            )?.[1] as { $set: { availableAt: Date } };
            expect(retryUpdate.$set.availableAt.getTime()).toBe(now + delayMs);
        },
    );

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("indexa um tópico privado e persiste texto indexado", async () => {
        const { jobModel, materialsService, service } = makeService();

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            scope: "PRIVATE_AREA",
            status: "DONE",
            extractedTextChunks: [{ order: 1, sourceLabel: "Limites" }],
        });
        expect(materialsService.markIndexedText).toHaveBeenCalledWith(
            student.id,
            materialId,
            expect.stringContaining("conteúdo suficientemente longo"),
        );
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "DONE",
                extractedTextChunks: expect.any(Array),
            }),
        );
    });

    it("falha a indexação quando não há texto extraído", async () => {
        const { jobModel, materialsService, service } = makeService();
        materialsService.findOwnedTextMaterial.mockResolvedValueOnce({
            _id: materialId,
            title: "Ficheiro",
            type: "PDF",
        });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "O ficheiro do material não está disponível.",
        });
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "FAILED",
                errorMessage: "O ficheiro do material não está disponível.",
            }),
        );
    });

    it("falha job quando PDF não tem texto legível", async () => {
        const { documentSafety, jobModel, materialsService, service } =
            makeService({
                title: "PDF vazio",
                type: "PDF",
                mimeType: "application/pdf",
                sizeBytes: 1024,
                storageKey: "private/pdf-vazio.pdf",
            });
        materialsService.readStoredFile.mockResolvedValueOnce(Buffer.from("%PDF"));
        documentSafety.parseDocument.mockResolvedValueOnce("   ");

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "O material não tem texto legível para estudar.",
        });

        expect(materialsService.markIndexedText).not.toHaveBeenCalled();
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "FAILED",
                errorMessage: "O material não tem texto legível para estudar.",
            }),
        );
    });

    it("normaliza material oficial textual antes de criar chunks", async () => {
        const { officialMaterialsService, service } = makeService();
        officialMaterialsService.findOwnedMaterial.mockResolvedValueOnce({
            _id: materialId,
            subjectId,
            title: "Material oficial",
            type: "TEXT",
            textContent: "  func\u0327a\u0303o oficial com acentos  ",
        });

        await expect(
            service.indexOfficialMaterial(teacher, materialId),
        ).resolves.toMatchObject({
            status: "DONE",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "função oficial com acentos",
                    sourceLabel: "Material oficial",
                },
            ],
        });

        expect(officialMaterialsService.markIndexedText).toHaveBeenCalledWith(
            teacher.id,
            materialId,
            "função oficial com acentos",
        );
    });

    it("valida PDF armazenado antes de executar o parser", async () => {
        const { documentSafety, materialsService, service } = makeService({
            title: "PDF seguro",
            type: "PDF",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            storageKey: "private/pdf-seguro.pdf",
        });
        const buffer = Buffer.from("%PDF-conteudo");
        materialsService.readStoredFile.mockResolvedValueOnce(buffer);
        documentSafety.parseDocument.mockResolvedValueOnce(
            "Texto extraído de PDF com conteúdo processável.",
        );

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            scope: "PRIVATE_AREA",
            status: "DONE",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "Texto extraído de PDF com conteúdo processável.",
                },
            ],
        });

        expect(materialsService.readStoredFile).toHaveBeenCalledWith(
            "private/pdf-seguro.pdf",
        );
        expect(documentSafety.assertSafeStoredDocument).toHaveBeenCalledWith({
            type: "PDF",
            mimeType: "application/pdf",
            byteLength: buffer.byteLength,
            declaredSizeBytes: 1024,
            title: "PDF seguro",
        });
        expect(documentSafety.parseDocument).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "PDF",
                buffer,
                label: "PDF seguro",
            }),
        );
        expect(
            documentSafety.assertSafeStoredDocument.mock.invocationCallOrder[0],
        ).toBeLessThan(
            documentSafety.parseDocument.mock.invocationCallOrder[0],
        );
    });

    it("envolve DOCX armazenado no timeout da sandbox antes de persistir texto", async () => {
        const { documentSafety, materialsService, service } = makeService({
            title: "DOCX seguro",
            type: "DOCX",
            mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            sizeBytes: 2048,
            storageKey: "private/docx-seguro.docx",
        });
        const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
        materialsService.readStoredFile.mockResolvedValueOnce(buffer);
        documentSafety.parseDocument.mockResolvedValueOnce(
            "Texto extraído de DOCX com conteúdo processável.",
        );

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "DONE",
            extractedTextChunks: [
                {
                    order: 1,
                    text: "Texto extraído de DOCX com conteúdo processável.",
                },
            ],
        });

        expect(documentSafety.assertSafeStoredDocument).toHaveBeenCalledWith({
            type: "DOCX",
            mimeType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            byteLength: buffer.byteLength,
            declaredSizeBytes: 2048,
            title: "DOCX seguro",
        });
        expect(documentSafety.parseDocument).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "DOCX",
                buffer,
                label: "DOCX seguro",
            }),
        );
    });

    it("persiste FAILED quando a sandbox rejeita o documento antes do parser", async () => {
        const { documentSafety, jobModel, materialsService, service } = makeService({
            title: "DOCX inseguro",
            type: "DOCX",
            mimeType: "application/pdf",
            sizeBytes: 2048,
            storageKey: "private/docx-inseguro.docx",
        });
        materialsService.readStoredFile.mockResolvedValueOnce(
            Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        );
        documentSafety.assertSafeStoredDocument.mockImplementationOnce(() => {
            throw new Error("O documento não corresponde ao tipo esperado.");
        });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "O documento não corresponde ao tipo esperado.",
        });

        expect(documentSafety.parseDocument).not.toHaveBeenCalled();
        expect(materialsService.markIndexedText).not.toHaveBeenCalled();
        expect(jobModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "FAILED",
                errorMessage: "O documento não corresponde ao tipo esperado.",
            }),
        );
    });

    it("só devolve jobs DONE pertencentes ao actor", async () => {
        const { jobModel, service } = makeService();
        jobModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: jobId,
                scope: "PRIVATE_AREA",
                materialId,
                studyAreaId,
                userId: "507f1f77bcf86cd799439099",
                status: "DONE",
                extractedTextChunks: [],
            }),
        });

        await expect(service.findDoneJob(student, jobId)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it("permite leitura MF3 de job oficial por aluno inscrito", async () => {
        const { jobModel, service, subjectsService } = makeService();
        jobModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: jobId,
                scope: "OFFICIAL_SUBJECT",
                materialId,
                subjectId,
                teacherId: teacher.id,
                status: "DONE",
                extractedTextChunks: [{ order: 1, text: "texto", sourceLabel: "Aula", locator: "chunk-1" }],
            }),
        });

        await expect(service.findReadableDoneJob(student, jobId)).resolves.toMatchObject({
            _id: jobId,
            subjectId,
        });
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
    });

    it("mantém findDoneJob restrito ao professor dono em jobs oficiais", async () => {
        const { jobModel, service } = makeService();
        jobModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: jobId,
                scope: "OFFICIAL_SUBJECT",
                materialId,
                subjectId,
                teacherId: teacher.id,
                status: "DONE",
                extractedTextChunks: [],
            }),
        });

        await expect(service.findDoneJob(student, jobId)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it("indexa URL pública com redirect público validado", async () => {
        const { materialsService, service } = makeService({
            type: "URL",
            url: "http://93.184.216.34/inicial",
            title: "Pagina publica",
        });
        const requestMock = jest
            .spyOn(materialIndexUrlSafety, "requestText")
            .mockResolvedValueOnce({
                status: 302,
                headers: { location: "http://93.184.216.34/final" },
                body: "",
                remoteAddress: "93.184.216.34",
            })
            .mockResolvedValueOnce({
                status: 200,
                headers: { "content-type": "text/html" },
                body: "<main>Texto publico indexavel</main>",
                remoteAddress: "93.184.216.34",
            });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            scope: "PRIVATE_AREA",
            status: "DONE",
            extractedTextChunks: [
                { order: 1, text: "Texto publico indexavel" },
            ],
        });
        expect(requestMock).toHaveBeenCalledTimes(2);
        expect(requestMock).toHaveBeenCalledWith(
            "http://93.184.216.34/inicial",
            { hostname: "93.184.216.34", address: "93.184.216.34", family: 4 },
        );
        expect(materialsService.markIndexedText).toHaveBeenCalledWith(
            student.id,
            materialId,
            "Texto publico indexavel",
        );
    });

    it("repete leitura URL quando a falha HTTP é transitória", async () => {
        const { materialsService, service } = makeService({
            type: "URL",
            url: "http://93.184.216.34/transitorio",
            title: "Pagina com falha temporaria",
        });
        const requestMock = jest
            .spyOn(materialIndexUrlSafety, "requestText")
            .mockResolvedValueOnce({
                status: 503,
                headers: { "content-type": "text/plain" },
                body: "Serviço temporariamente indisponível",
                remoteAddress: "93.184.216.34",
            })
            .mockResolvedValueOnce({
                status: 200,
                headers: { "content-type": "text/plain" },
                body: "Texto recuperado depois da falha temporária",
                remoteAddress: "93.184.216.34",
            });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            scope: "PRIVATE_AREA",
            status: "DONE",
            extractedTextChunks: [
                { order: 1, text: "Texto recuperado depois da falha temporária" },
            ],
        });
        expect(requestMock).toHaveBeenCalledTimes(2);
        expect(materialsService.markIndexedText).toHaveBeenCalledWith(
            student.id,
            materialId,
            "Texto recuperado depois da falha temporária",
        );
    });

    it("bloqueia URL que redireciona para rede privada", async () => {
        const { service } = makeService({
            type: "URL",
            url: "http://93.184.216.34/inicial",
        });
        const requestMock = jest
            .spyOn(materialIndexUrlSafety, "requestText")
            .mockResolvedValueOnce({
                status: 302,
                headers: { location: "http://127.0.0.1/admin" },
                body: "",
                remoteAddress: "93.184.216.34",
            });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "URL local ou privada não pode ser indexada.",
        });
        expect(requestMock).toHaveBeenCalledTimes(1);
    });

    it.each([
        "http://[::ffff:127.0.0.1]/admin",
        "http://[::ffff:169.254.169.254]/metadata",
    ])("bloqueia IPv4 mapeado em IPv6 antes da ligação: %s", async (url) => {
        const { service } = makeService({ type: "URL", url });
        const requestMock = jest.spyOn(materialIndexUrlSafety, "requestText");

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "URL local ou privada não pode ser indexada.",
        });
        expect(requestMock).not.toHaveBeenCalled();
    });

    it("recusa portas externas não permitidas antes de resolver DNS", async () => {
        const { service } = makeService({
            type: "URL",
            url: "https://materiais.example.test:8443/documento",
        });
        const lookupMock = jest.spyOn(materialIndexUrlSafety, "resolveHost");

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "URL só pode usar as portas 80 ou 443.",
        });
        expect(lookupMock).not.toHaveBeenCalled();
    });

    it("bloqueia URL cujo DNS resolve para rede privada", async () => {
        const { service } = makeService({
            type: "URL",
            url: "https://materiais.example.test/documento",
        });
        const lookupMock = jest
            .spyOn(materialIndexUrlSafety, "resolveHost")
            .mockResolvedValue([{ address: "10.0.0.5", family: 4 }]);
        const requestMock = jest.spyOn(materialIndexUrlSafety, "requestText");

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "URL resolve para rede local ou privada.",
        });
        expect(lookupMock).toHaveBeenCalledWith("materiais.example.test");
        expect(requestMock).not.toHaveBeenCalled();
    });

    it("bloqueia resposta cuja ligação efetiva termina em IP privado", async () => {
        const { service } = makeService({
            type: "URL",
            url: "https://materiais.example.test/documento",
        });
        jest.spyOn(materialIndexUrlSafety, "resolveHost").mockResolvedValue([
            { address: "93.184.216.34", family: 4 },
        ]);
        const requestMock = jest
            .spyOn(materialIndexUrlSafety, "requestText")
            .mockResolvedValueOnce({
                status: 200,
                headers: { "content-type": "text/plain" },
                body: "texto",
                remoteAddress: "10.0.0.5",
            });

        await expect(
            service.indexPrivateMaterial(student, studyAreaId, materialId),
        ).resolves.toMatchObject({
            status: "FAILED",
            errorMessage: "URL ligou a rede local ou privada.",
        });
        expect(requestMock).toHaveBeenCalledWith(
            "https://materiais.example.test/documento",
            {
                hostname: "materiais.example.test",
                address: "93.184.216.34",
                family: 4,
            },
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de indexação textual de materiais para manter testes e prompts legíveis.
 * Este fluxo valida ficheiros, URLs ou fontes externas para reduzir riscos de entrada não confiável, SSRF ou DNS rebinding.
 *
 * @param materialOverrides Valor de materialOverrides usado pela função para executar make service com dados explícitos.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(
    materialOverrides: Partial<{
        title: string;
        type: "PDF" | "DOCX" | "URL" | "TOPIC";
        url: string;
        contentText: string;
        status: "PENDING_PROCESSING" | "READY" | "FAILED";
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
    }> = {},
) {
    const jobModel = {
        create: jest.fn().mockImplementation(async (input) => ({
            /**
             * Transforma o apoio de teste para indexação segura de materiais, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: jobId,
                extractedTextChunks: [],
                ...input,
            }),
        })),
        findById: jest.fn(),
        findOne: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            }),
        }),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        }),
        find: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const privateMaterial: {
        _id: string;
        title: string;
        type: "PDF" | "DOCX" | "URL" | "TOPIC";
        status: "PENDING_PROCESSING" | "READY" | "FAILED";
        contentText?: string;
        url?: string;
        mimeType?: string;
        sizeBytes?: number;
        storageKey?: string;
    } = {
        _id: materialId,
        title: "Limites",
        type: "TOPIC",
        status: "READY",
        contentText: "Este conteúdo suficientemente longo explica limites.",
        ...materialOverrides,
    };
    if (
        privateMaterial.type !== "TOPIC" &&
        materialOverrides.contentText === undefined
    ) {
        delete privateMaterial.contentText;
        privateMaterial.status = materialOverrides.status ?? "PENDING_PROCESSING";
    }
    const materialsService = {
        listByArea: jest.fn().mockResolvedValue([]),
        findOwnedTextMaterial: jest.fn().mockResolvedValue(privateMaterial),
        markIndexedText: jest.fn(),
        readStoredFile: jest.fn(),
    };
    const officialMaterialsService = {
        findOwnedMaterial: jest.fn(),
        markIndexedText: jest.fn(),
    };
    const subjectsService = {
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId },
            schoolClass: { _id: "507f1f77bcf86cd799439018" },
        }),
    };
    const documentSafety = {
        assertSafeStoredDocument: jest.fn(),
        parseDocument: jest.fn(),
    };
    const service = new MaterialIndexService(
        jobModel as never,
        materialsService as never,
        officialMaterialsService as never,
        subjectsService as never,
        documentSafety as never,
    );
    return {
        jobModel,
        materialsService,
        officialMaterialsService,
        service,
        subjectsService,
        documentSafety,
    };
}

function claimedMaterialJob(attempts: number) {
    return {
        _id: jobId,
        materialId,
        studyAreaId,
        userId: student.id,
        attempts,
        maxAttempts: 3,
        leaseOwner: "worker-test",
        leaseToken: attempts,
        leaseMs: 30_000,
    };
}
