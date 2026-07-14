/**
 * Testa o comportamento de materials e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { MaterialsService } from "./materials.service.js";

jest.mock("../../common/validators/markdown-material.validator.js", () => ({
    MARKDOWN_MIME_TYPE: "text/markdown",
    MARKDOWN_UPLOAD_MIME_TYPES: [
        "text/markdown",
        "text/x-markdown",
        "text/plain",
        "application/octet-stream",
    ],
    MAX_MARKDOWN_UPLOAD_BYTES: 128 * 1024,
    validateMarkdownSource: jest.fn(async (value: string) => {
        const markdownSource = `${value.trim()}\n`;
        return { markdownSource, sizeBytes: Buffer.byteLength(markdownSource) };
    }),
    validateMarkdownUpload: jest.fn(async (file: Express.Multer.File) => {
        const markdownSource = `${file.buffer.toString("utf8").trim()}\n`;
        return { markdownSource, sizeBytes: Buffer.byteLength(markdownSource) };
    }),
}));

const userId = "507f1f77bcf86cd799439012";
const studyAreaId = "507f1f77bcf86cd799439011";

describe("MaterialsService", () => {
    it("lista materiais sem expor campos internos", async () => {
        const createdAt = new Date("2026-06-01T10:00:00.000Z");
        const lean = jest.fn().mockResolvedValue([
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                userId,
                studyAreaId,
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                contentText: "Texto interno para IA.",
                storageKey: "private-key",
                originalName: "fonte.pdf",
                mimeType: "application/pdf",
                createdAt,
            },
        ]);
        const sort = jest.fn().mockReturnValue({ lean });
        const select = jest.fn().mockReturnValue({ sort });
        const materialModel = {
            find: jest.fn().mockReturnValue({ select }),
        };
        const { service } = makeService(materialModel);

        const materials = await service.listByArea(userId, studyAreaId);

        expect(select).toHaveBeenCalledWith(
            "_id title type status url originalName sizeBytes contentRevision createdAt updatedAt",
        );
        expect(materials).toEqual([
            {
                _id: "507f1f77bcf86cd799439010",
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                originalName: "fonte.pdf",
                contentRevision: 0,
                createdAt,
            },
        ]);
        expect(materials[0]).not.toHaveProperty("contentText");
        expect(materials[0]).not.toHaveProperty("storageKey");
        expect(materials[0]).not.toHaveProperty("userId");
    });

    it("submete tópico sem devolver contentText no contrato público", async () => {
        const materialModel = {
            create: jest.fn().mockResolvedValue({
                /**
                 * Transforma o apoio de teste para materiais de estudo, mantendo o cenário legível e próximo do comportamento real validado.
                 *
                 * @returns Contrato público pronto para a UI, sem campos internos de persistência.
                 */
                toObject: () => ({
                    _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                    userId,
                    studyAreaId,
                    title: "Equações",
                    type: "TOPIC",
                    status: "READY",
                    contentText: "Texto de estudo suficientemente longo.",
                }),
            }),
        };
        const { auditLogService, historyService, service } = makeService(materialModel);

        const material = await service.submitTextMaterial(userId, studyAreaId, {
            type: "TOPIC",
            title: "Equações",
            topicText: "Texto de estudo suficientemente longo.",
        });

        expect(material).toEqual({
            _id: "507f1f77bcf86cd799439010",
            title: "Equações",
            type: "TOPIC",
            status: "READY",
            contentRevision: 0,
        });
        expect(material).not.toHaveProperty("contentText");
        expect(historyService.recordEvent).toHaveBeenCalledWith(
            userId,
            "MATERIAL_SUBMITTED",
            "Tópico submetido",
            "Equações",
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: userId,
                domain: "MATERIALS",
                action: "PRIVATE_MATERIAL_TOPIC_SUBMITTED",
                resourceType: "Material",
                result: "SUCCESS",
            }),
        );
    });

    it("normaliza tópico PT-PT antes de persistir material privado", async () => {
        const materialModel = {
            create: jest.fn().mockResolvedValue({
                /**
                 * Transforma o apoio de teste para materiais de estudo, mantendo o cenário legível e próximo do comportamento real validado.
                 *
                 * @returns Contrato público pronto para a UI, sem campos internos de persistência.
                 */
                toObject: () => ({
                    _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                    userId,
                    studyAreaId,
                    title: "Funções",
                    type: "TOPIC",
                    status: "READY",
                    contentText: "função quadrática",
                }),
            }),
        };
        const { service } = makeService(materialModel);

        await service.submitTextMaterial(userId, studyAreaId, {
            type: "TOPIC",
            title: "Funções",
            topicText: "  func\u0327a\u0303o quadrática  ",
        });

        // O service guarda texto já normalizado; o frontend nunca decide ownership.
        expect(materialModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                contentText: "função quadrática",
                status: "READY",
            }),
        );
    });

    it("rejeita tópico sem texto legível", async () => {
        const materialModel = { create: jest.fn() };
        const { service } = makeService(materialModel);
        let caught: unknown;

        try {
            await service.submitTextMaterial(userId, studyAreaId, {
                type: "TOPIC",
                title: "Ficheiro vazio",
                topicText: "���",
            });
        } catch (error) {
            caught = error;
        }

        expect(caught).toBeInstanceOf(BadRequestException);
        expect((caught as BadRequestException).getResponse()).toEqual({
            code: "MATERIAL_TEXT_NOT_READABLE",
            message: "O material não tem texto legível para estudar.",
        });
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("mantém fontes internas com contentText para IA", async () => {
        const sources = [
            {
                _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
                title: "Fonte",
                type: "TOPIC",
                status: "READY",
                contentText: "Texto interno para IA.",
            },
        ];
        const lean = jest.fn().mockResolvedValue(sources);
        const sort = jest.fn().mockReturnValue({ lean });
        const materialModel = {
            find: jest.fn().mockReturnValue({ sort }),
        };
        const { service } = makeService(materialModel);

        await expect(
            service.listReadyTextSources(userId, studyAreaId),
        ).resolves.toEqual(sources);
    });

    it("projeta Markdown READY como fonte da IA apenas na área autorizada", async () => {
        const source = {
            _id: new Types.ObjectId("507f1f77bcf86cd799439010"),
            title: "Funções",
            type: "MARKDOWN",
            status: "READY",
            markdownSource: "# Funções\n\nConteúdo autorizado.\n",
        };
        const lean = jest.fn().mockResolvedValue([source]);
        const sort = jest.fn().mockReturnValue({ lean });
        const materialModel = { find: jest.fn().mockReturnValue({ sort }) };
        const { service } = makeService(materialModel);

        await expect(
            service.listReadyTextSources(userId, studyAreaId),
        ).resolves.toEqual([
            expect.objectContaining({
                _id: source._id,
                type: "MARKDOWN",
                contentText: source.markdownSource,
            }),
        ]);
        expect(materialModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: expect.any(Types.ObjectId),
                studyAreaId: expect.any(Types.ObjectId),
                status: "READY",
            }),
        );
    });

    it("cria Markdown privado READY na revisão 1 sem auditar a fonte", async () => {
        const materialId = new Types.ObjectId("507f1f77bcf86cd799439010");
        const materialModel = {
            create: jest.fn(async (input) => ({
                ...input,
                _id: materialId,
                toObject() {
                    return this;
                },
            })),
        };
        const { auditLogService, service } = makeService(materialModel);

        await expect(
            service.submitTextMaterial(userId, studyAreaId, {
                type: "MARKDOWN",
                title: "Derivadas",
                markdownSource: "# Derivadas\n\nConteúdo suficiente.",
            }),
        ).resolves.toMatchObject({
            type: "MARKDOWN",
            status: "READY",
            contentRevision: 1,
        });
        expect(materialModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "MARKDOWN",
                status: "READY",
                contentRevision: 1,
                markdownSource: "# Derivadas\n\nConteúdo suficiente.\n",
            }),
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "PRIVATE_MARKDOWN_CREATED",
                metadata: expect.not.objectContaining({
                    markdownSource: expect.anything(),
                }),
            }),
        );
    });

    it("devolve conflito 409 sem sobrescrever uma revisão Markdown desatualizada", async () => {
        const currentLean = jest.fn().mockResolvedValue({
            type: "MARKDOWN",
            contentRevision: 3,
        });
        const materialModel = {
            findOneAndUpdate: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            }),
            findOne: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({ lean: currentLean }),
            }),
        };
        const { service } = makeService(materialModel);

        await expect(
            service.updatePrivateMarkdown(userId, studyAreaId, materialIdForTest(), {
                markdownSource: "# Revisão local\n\nTexto que não deve ser perdido.",
                expectedRevision: 2,
            }),
        ).rejects.toMatchObject({
            response: {
                code: "MATERIAL_REVISION_CONFLICT",
                currentRevision: 3,
            },
        });
        expect(materialModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ contentRevision: 2 }),
            expect.anything(),
            { new: true },
        );
    });

    it("mantém sucesso depois do commit mesmo que history e audit falhem", async () => {
        const materialId = new Types.ObjectId("507f1f77bcf86cd799439010");
        const persisted = {
            _id: materialId,
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            title: "Apontamentos",
            type: "PDF" as const,
            status: "PENDING_PROCESSING" as const,
            sizeBytes: 12,
            toObject() {
                return this;
            },
        };
        const materialModel = {
            create: jest.fn().mockResolvedValue(persisted),
            deleteOne: jest.fn(),
        };
        const { auditLogService, historyService, service, storage } =
            makeService(materialModel);
        historyService.recordEvent.mockRejectedValueOnce(
            new Error("history indisponível"),
        );
        auditLogService.record.mockRejectedValueOnce(
            new Error("audit indisponível"),
        );
        const buffer = Buffer.from("%PDF-seguro");
        const file = {
            buffer,
            size: buffer.byteLength,
            mimetype: "application/pdf",
            originalname: "apontamentos.pdf",
        } as Express.Multer.File;

        await expect(
            service.submitFile(userId, studyAreaId, file, "Apontamentos"),
        ).resolves.toMatchObject({
            _id: materialId.toHexString(),
            title: "Apontamentos",
            type: "PDF",
        });

        expect(storage.commit).toHaveBeenCalledTimes(1);
        expect(materialModel.deleteOne).not.toHaveBeenCalled();
        expect(storage.abort).not.toHaveBeenCalled();
        expect(historyService.recordEvent).toHaveBeenCalledTimes(1);
        expect(auditLogService.record).toHaveBeenCalledTimes(1);
    });

    it("normaliza o nome original antes de escrever em staging e Mongo", async () => {
        const materialId = new Types.ObjectId("507f1f77bcf86cd799439010");
        const materialModel = {
            create: jest.fn(async (input) => ({
                ...input,
                _id: materialId,
                toObject() {
                    return this;
                },
            })),
            deleteOne: jest.fn(),
        };
        const { service, storage } = makeService(materialModel);
        const buffer = Buffer.from("%PDF-seguro");
        const file = {
            buffer,
            size: buffer.byteLength,
            mimetype: "application/pdf",
            originalname: "  func\u0327a\u0303o   final.pdf  ",
        } as Express.Multer.File;

        await service.submitFile(userId, studyAreaId, file);

        expect(storage.stage).toHaveBeenCalledWith(
            userId,
            expect.objectContaining({ originalname: "função final.pdf" }),
        );
        expect(materialModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "função final.pdf",
                originalName: "função final.pdf",
            }),
        );
    });

    it("rejeita um originalName perigoso antes de escrever em staging", async () => {
        const materialModel = {
            create: jest.fn(),
            deleteOne: jest.fn(),
        };
        const { service, storage } = makeService(materialModel);
        const buffer = Buffer.from("%PDF-seguro");
        const file = {
            buffer,
            size: buffer.byteLength,
            mimetype: "application/pdf",
            originalname: "../apontamentos.pdf",
        } as Express.Multer.File;

        await expect(
            service.submitFile(userId, studyAreaId, file, "Apontamentos"),
        ).rejects.toMatchObject({
            response: expect.objectContaining({ code: "FILE_NAME_INVALID" }),
        });
        expect(storage.stage).not.toHaveBeenCalled();
        expect(materialModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria fixture ou estrutura auxiliar de materiais privados para manter testes e prompts legíveis.
 *
 * @param materialModel Modelo de persistência usado para ler e gravar documentos deste domínio.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(materialModel: Record<string, unknown>) {
    const studyAreasService = {
        getMyStudyArea: jest.fn().mockResolvedValue({ _id: studyAreaId }),
    };
    const staged = {
        operationId: "operation-1",
        ownerId: userId,
        storageKey: `users/${userId}/operation-1.pdf`,
        stagingKey: `.staging/${userId}/operation-1.part`,
        sizeBytes: 12,
        sha256: "a".repeat(64),
    };
    const storage = {
        stage: jest.fn().mockResolvedValue(staged),
        prepareCommit: jest.fn().mockResolvedValue(undefined),
        commit: jest.fn().mockResolvedValue(undefined),
        abort: jest.fn().mockResolvedValue(undefined),
        read: jest.fn(),
    };
    const historyService = {
        recordEvent: jest.fn(),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };

    return {
        auditLogService,
        historyService,
        storage,
        service: new MaterialsService(
            materialModel as never,
            studyAreasService as never,
            storage as never,
            historyService as never,
            auditLogService as never,
        ),
    };
}

/** Identificador estável usado nos cenários de edição concorrente. */
function materialIdForTest(): string {
    return "507f1f77bcf86cd799439010";
}
