/**
 * Testa o comportamento de materiais oficiais e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialMaterialsService } from "./official-materials.service.js";

const subjectId = "507f1f77bcf86cd799439015";
const classId = "507f1f77bcf86cd799439014";

describe("OfficialMaterialsService", () => {
    const teacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439012",
        email: "professor@example.test",
        role: "TEACHER",
    };
    const student: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439013",
        email: "aluno@example.test",
        role: "STUDENT",
    };

    it("guarda material TEXT como PROCESSED e fonte usável para IA", async () => {
        const { auditLogService, materialModel, service } = makeService();
        materialModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para materiais de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439016",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Derivadas",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Derivadas medem taxas de variação.",
            }),
        });

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: " Derivadas ",
                type: "TEXT",
                textContent: " Derivadas medem taxas de variação. ",
            }),
        ).resolves.toMatchObject({
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Derivadas medem taxas de variação.",
        });
        expect(materialModel.create).toHaveBeenCalledWith({
            subjectId: expect.any(Types.ObjectId),
            classId: expect.any(Types.ObjectId),
            teacherId: expect.any(Types.ObjectId),
            title: "Derivadas",
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Derivadas medem taxas de variação.",
            sourceUrl: undefined,
        });
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                actorId: teacher.id,
                domain: "MATERIALS",
                action: "OFFICIAL_MATERIAL_CREATED",
                resourceType: "OfficialMaterial",
                result: "SUCCESS",
            }),
        );
    });

    it("guarda material URL como REFERENCE_ONLY", async () => {
        const { materialModel, service } = makeService();
        materialModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para materiais de estudo, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: "507f1f77bcf86cd799439017",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Artigo",
                type: "URL",
                status: "REFERENCE_ONLY",
                sourceUrl: "https://example.test/artigo",
            }),
        });

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Artigo",
                type: "URL",
                sourceUrl: "https://example.test/artigo",
            }),
        ).resolves.toMatchObject({
            type: "URL",
            status: "REFERENCE_ONLY",
            sourceUrl: "https://example.test/artigo",
        });
    });

    it("usa a mesma sessão para material, audit log e outbox", async () => {
        const session = { id: "session-official-material" };
        const connection = {
            transaction: jest.fn(
                async (operation: (value: unknown) => Promise<unknown>) =>
                    operation(session),
            ),
        };
        const {
            auditLogService,
            materialModel,
            notificationsService,
            service,
        } = makeService(connection);
        const document = {
            _id: "507f1f77bcf86cd799439016",
            subjectId,
            classId,
            teacherId: teacher.id,
            title: "Derivadas",
            type: "TEXT",
            status: "PROCESSED",
            textContent: "Derivadas medem taxas de variação.",
        };
        materialModel.create.mockResolvedValueOnce([
            { ...document, toObject: () => document },
        ]);

        await service.createOfficialMaterial(teacher, subjectId, {
            title: "Derivadas",
            type: "TEXT",
            textContent: "Derivadas medem taxas de variação.",
        });

        expect(materialModel.create).toHaveBeenCalledWith(
            [expect.objectContaining({ title: "Derivadas" })],
            { session },
        );
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({ action: "OFFICIAL_MATERIAL_CREATED" }),
            session,
        );
        expect(notificationsService.enqueueClassEvent).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                idempotencyKey: `official-material:${document._id}:available`,
            }),
            session,
        );
    });

    it("bloqueia criação por alunos", async () => {
        const { materialModel, subjectsService, service } = makeService();

        await expect(
            service.createOfficialMaterial(student, subjectId, {
                title: "Derivadas",
                type: "TEXT",
                textContent: "Derivadas medem taxas de variação.",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("expõe catálogo de aluno sem teacherId e com disponibilidade para IA", async () => {
        const { materialModel, service } = makeService();
        materialModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        {
                            _id: "507f1f77bcf86cd799439016",
                            subjectId,
                            classId,
                            teacherId: teacher.id,
                            title: "Derivadas",
                            type: "TEXT",
                            status: "PROCESSED",
                            textContent: "Derivadas medem taxas de variação.",
                            contentRevision: 2,
                        },
                    ]),
                }),
            }),
        });

        const page = await service.listStudentSubjectMaterials(
            student,
            subjectId,
        );

        expect(page).toMatchObject({
            nextCursor: null,
            items: [
            expect.objectContaining({
                title: "Derivadas",
                contentRevision: 2,
                availableToAi: true,
            }),
            ],
        });
        expect(page.items[0]).not.toHaveProperty("teacherId");
    });

    it("rejeita URLs oficiais sem protocolo http/https", async () => {
        const { materialModel, service } = makeService();

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Artigo",
                type: "URL",
                sourceUrl: "javascript:alert(1)",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("rejeita material TEXT sem conteúdo útil depois de trim", async () => {
        const { materialModel, service } = makeService();

        await expect(
            service.createOfficialMaterial(teacher, subjectId, {
                title: "Derivadas",
                type: "TEXT",
                textContent: "                        ",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(materialModel.create).not.toHaveBeenCalled();
    });

    it("conta materiais por disciplinas e evita query sem ids", async () => {
        const { materialModel, service } = makeService();

        await expect(service.countBySubjectIds([])).resolves.toBe(0);
        expect(materialModel.countDocuments).not.toHaveBeenCalled();

        await expect(service.countBySubjectIds([subjectId])).resolves.toBe(2);
        expect(materialModel.countDocuments).toHaveBeenCalledWith({
            subjectId: { $in: [expect.any(Types.ObjectId)] },
        });
    });

    it("conta materiais agrupados por disciplina e evita aggregate sem ids", async () => {
        const { materialModel, service } = makeService();

        await expect(service.countBySubjectIdsGrouped([])).resolves.toEqual({});
        expect(materialModel.aggregate).not.toHaveBeenCalled();

        await expect(
            service.countBySubjectIdsGrouped([subjectId]),
        ).resolves.toEqual({ [subjectId]: 2 });
        expect(materialModel.aggregate).toHaveBeenCalledWith([
            {
                $match: {
                    subjectId: { $in: [expect.any(Types.ObjectId)] },
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
    });

    it("submete PDF oficial por staging e só responde depois do commit", async () => {
        const storage = {
            stage: jest.fn().mockResolvedValue({
                operationId: "operation-1",
                ownerId: teacher.id,
                storageKey: `users/${teacher.id}/operation-1.pdf`,
                stagingKey: `.staging/${teacher.id}/operation-1.part`,
                sizeBytes: 16,
                sha256: "a".repeat(64),
            }),
            prepareCommit: jest.fn().mockResolvedValue(undefined),
            commit: jest.fn().mockResolvedValue(undefined),
            abort: jest.fn().mockResolvedValue(undefined),
            read: jest.fn(),
        };
        const { auditLogService, materialModel, service } = makeService(
            undefined,
            storage,
        );
        materialModel.create.mockResolvedValue({
            _id: new Types.ObjectId(),
            toObject: () => ({
                _id: "507f1f77bcf86cd799439018",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Manual oficial",
                type: "PDF",
                status: "PENDING_PROCESSING",
                originalName: "manual.pdf",
                mimeType: "application/pdf",
                sizeBytes: 16,
            }),
        });
        const buffer = Buffer.from("%PDF-conteudo-ok");
        const file = {
            buffer,
            size: buffer.byteLength,
            mimetype: "application/pdf",
            originalname: "manual.pdf",
        } as Express.Multer.File;

        await expect(
            service.submitOfficialFile(
                teacher,
                subjectId,
                file,
                "Manual oficial",
            ),
        ).resolves.toMatchObject({
            type: "PDF",
            status: "PENDING_PROCESSING",
            availableToAi: false,
        });
        expect(storage.stage).toHaveBeenCalledWith(
            teacher.id,
            expect.objectContaining({ originalname: "manual.pdf" }),
        );
        expect(storage.commit).toHaveBeenCalled();
        expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "OFFICIAL_MATERIAL_FILE_SUBMITTED",
            }),
        );
    });

    it("lê PDF apenas depois de validar a inscrição e a integridade", async () => {
        const buffer = Buffer.from("%PDF-conteudo-oficial");
        const storage = { read: jest.fn().mockResolvedValue(buffer) };
        const { materialModel, service, subjectsService } = makeService(
            undefined,
            storage,
        );
        materialModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439018",
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Manual oficial",
                type: "PDF",
                status: "PENDING_PROCESSING",
                originalName: "manual.pdf",
                mimeType: "application/pdf",
                sizeBytes: buffer.byteLength,
                storageKey: `users/${teacher.id}/manual.pdf`,
            }),
        });

        await expect(
            service.readAuthorizedOfficialFile(student, "507f1f77bcf86cd799439018"),
        ).resolves.toMatchObject({
            type: "PDF",
            originalName: "manual.pdf",
            buffer,
        });
        expect(subjectsService.findSubjectForStudentHistory).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de materiais oficiais para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(connection?: unknown, storage?: unknown) {
    const materialModel = {
        aggregate: jest.fn().mockResolvedValue([
            { _id: new Types.ObjectId(subjectId), count: 2 },
        ]),
        countDocuments: jest.fn().mockResolvedValue(2),
        create: jest.fn(),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        find: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const subjectsService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "Matemática A",
            code: "MAT-A",
        }),
        findOwnedSubjectForHistory: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "Matemática A",
            code: "MAT-A",
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
        findSubjectForStudentHistory: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
    };
    const auditLogService = {
        record: jest.fn().mockResolvedValue(undefined),
    };
    const notificationsService = {
        enqueueClassEvent: jest.fn().mockResolvedValue({ state: "PENDING" }),
    };
    const service = new OfficialMaterialsService(
        materialModel as never,
        subjectsService as never,
        auditLogService as never,
        notificationsService as never,
        connection as never,
        storage as never,
    );
    return {
        auditLogService,
        materialModel,
        notificationsService,
        service,
        subjectsService,
    };
}
