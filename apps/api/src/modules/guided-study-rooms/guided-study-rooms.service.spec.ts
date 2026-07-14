/**
 * Testa o comportamento de salas de estudo guiado e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";

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
const classId = "507f1f77bcf86cd799439014";
const roomId = "507f1f77bcf86cd799439015";
const subjectId = "507f1f77bcf86cd799439016";

describe("GuidedStudyRoomsService", () => {
    it("cria sala apenas depois de validar ownership da turma", async () => {
        const { classesService, roomModel, service } = makeService();

        await expect(
            service.create(teacher, classId, {
                title: " Sala guiada ",
                description: " Preparação para teste ",
                materialIds: ["mat-1"],
            }),
        ).resolves.toMatchObject({
            _id: roomId,
            classId,
            teacherId: teacher.id,
            title: "Sala guiada",
            status: "OPEN",
        });
        expect(classesService.findOwnedActiveClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(roomModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Sala guiada",
                description: "Preparação para teste",
                materialIds: ["mat-1"],
            }),
        );
    });

    it("cria sala com disciplina opcional da mesma turma", async () => {
        const { roomModel, service, subjectsService } = makeService();

        await expect(
            service.create(teacher, classId, {
                title: "Sala guiada",
                description: "Preparação para teste",
                subjectId,
            }),
        ).resolves.toMatchObject({
            _id: roomId,
            classId,
            subjectId,
            title: "Sala guiada",
        });
        expect(subjectsService.findOwnedSubject).toHaveBeenCalledWith(
            teacher.id,
            subjectId,
        );
        expect(roomModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                subjectId: expect.any(Object),
            }),
        );
    });

    it("aceita Markdown oficial publicado como referência viva da sala", async () => {
        const { materialsService, roomModel, service } = makeService();
        materialsService.findOwnedMaterial.mockResolvedValueOnce({
            _id: "507f1f77bcf86cd799439017",
            classId,
            subjectId,
            teacherId: teacher.id,
            title: "Integrais",
            type: "MARKDOWN",
            status: "PROCESSED",
            markdownSource: "# Integrais\n\nConteúdo publicado.\n",
            textContent: "# Integrais\n\nConteúdo publicado.\n",
            contentRevision: 2,
        } as never);

        await expect(
            service.create(teacher, classId, {
                title: "Sala com Markdown",
                description: "Usa a revisão oficial mais recente.",
                subjectId,
                materialIds: ["507f1f77bcf86cd799439017"],
                aiEnabled: true,
            }),
        ).resolves.toMatchObject({ status: "OPEN" });
        expect(roomModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                materialIds: ["507f1f77bcf86cd799439017"],
                aiEnabled: true,
            }),
        );
    });

    it("rejeita disciplina opcional que não pertence à turma da sala", async () => {
        const { roomModel, service, subjectsService } = makeService();
        subjectsService.findOwnedSubject.mockResolvedValueOnce({
            _id: subjectId,
            classId: "507f1f77bcf86cd799439099",
            teacherId: teacher.id,
            name: "Física",
            code: "FIS",
        });

        await expect(
            service.create(teacher, classId, {
                title: "Sala guiada",
                description: "Preparação para teste",
                subjectId,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(roomModel.create).not.toHaveBeenCalled();
    });

    it("bloqueia aluno a criar salas guiadas", async () => {
        const { classesService, service } = makeService();

        await expect(
            service.create(student, classId, {
                title: "Sala",
                description: "Descrição",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
    });

    it("pagina as salas da turma depois de validar inscrição e minimiza o contrato do aluno", async () => {
        const { classesService, roomModel, service } = makeService();

        const page = await service.listForStudent(student, classId);

        expect(page).toEqual({
            items: [
                expect.objectContaining({
                    _id: roomId,
                    classId,
                    className: "12A",
                    subjectName: "Matemática",
                    myParticipation: null,
                }),
            ],
            nextCursor: null,
        });
        expect(page.items[0]).not.toHaveProperty("teacherId");
        expect(classesService.ensureStudentEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
        expect(roomModel.find).toHaveBeenCalledWith({
            classId: expect.any(Object),
            status: "OPEN",
        });
    });

    it("aplica turma e estado antes do cursor e devolve um cursor estável", async () => {
        const { roomModel, service } = makeService();
        const cursor = "507f1f77bcf86cd799439099";
        const firstId = "507f1f77bcf86cd799439090";
        const extraId = "507f1f77bcf86cd799439080";
        roomModel.find.mockReturnValueOnce({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        { ...roomModel.__room, _id: firstId },
                        { ...roomModel.__room, _id: extraId },
                    ]),
                }),
            }),
        });

        await expect(
            service.listForStudent(student, classId, "OPEN", cursor, 1),
        ).resolves.toMatchObject({
            items: [{ _id: firstId }],
            nextCursor: firstId,
        });
        expect(roomModel.exists).toHaveBeenCalledWith({
            _id: expect.any(Types.ObjectId),
            classId: expect.any(Types.ObjectId),
            status: "OPEN",
        });
        expect(roomModel.find).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
            status: "OPEN",
            _id: { $lt: expect.any(Types.ObjectId) },
        });
    });

    it("rejeita cursor que não pertence à turma e estado pedidos", async () => {
        const { roomModel, service } = makeService();
        roomModel.exists.mockResolvedValueOnce(false);

        await expect(
            service.listForStudent(
                student,
                classId,
                "OPEN",
                "507f1f77bcf86cd799439099",
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(roomModel.find).not.toHaveBeenCalled();
    });

    it("conta salas guiadas abertas e fechadas por turma e disciplina", async () => {
        const { roomModel, service } = makeService();
        roomModel.aggregate
            .mockResolvedValueOnce([
                { _id: "OPEN", count: 2 },
                { _id: "CLOSED", count: 1 },
            ])
            .mockResolvedValueOnce([
                {
                    _id: {
                        subjectId: new Types.ObjectId(subjectId),
                        status: "OPEN",
                    },
                    count: 1,
                },
                {
                    _id: {
                        subjectId: new Types.ObjectId(subjectId),
                        status: "CLOSED",
                    },
                    count: 1,
                },
            ]);

        await expect(
            service.countByClassAndSubjectIds(classId, [subjectId]),
        ).resolves.toEqual({
            open: 2,
            closed: 1,
            bySubjectId: {
                [subjectId]: { open: 1, closed: 1 },
            },
        });
        expect(roomModel.aggregate).toHaveBeenNthCalledWith(1, [
            { $match: { classId: expect.any(Types.ObjectId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        expect(roomModel.aggregate).toHaveBeenNthCalledWith(2, [
            {
                $match: {
                    classId: expect.any(Types.ObjectId),
                    subjectId: { $in: [expect.any(Types.ObjectId)] },
                },
            },
            {
                $group: {
                    _id: { subjectId: "$subjectId", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ]);
    });

    it("não consulta por disciplinas quando a turma não tem disciplinas", async () => {
        const { roomModel, service } = makeService();
        roomModel.aggregate.mockResolvedValueOnce([{ _id: "OPEN", count: 1 }]);

        await expect(service.countByClassAndSubjectIds(classId, [])).resolves.toEqual({
            open: 1,
            closed: 0,
            bySubjectId: {},
        });
        expect(roomModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it("aplica PATCH parcial sem remover a disciplina quando o campo é omitido", async () => {
        const { roomModel, service } = makeService();

        await service.update(teacher, classId, roomId, { title: "Novo título" });

        expect(roomModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: expect.any(Types.ObjectId), status: "OPEN" },
            expect.objectContaining({
                $set: expect.objectContaining({
                    title: "Novo título",
                    description: "Preparação para teste",
                    subjectId: expect.any(Types.ObjectId),
                }),
            }),
            { new: true, runValidators: true },
        );
    });

    it("bloqueia remoção do mini-teste depois da primeira participação", async () => {
        const { participationModel, roomModel, service } = makeService({
            officialTestId: "507f1f77bcf86cd799439099",
        });
        participationModel.exists.mockResolvedValueOnce(true);

        await expect(
            service.update(teacher, classId, roomId, { officialTestId: null }),
        ).rejects.toMatchObject({
            response: { code: "GUIDED_ROOM_CONTENT_LOCKED" },
        });
        expect(roomModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("permite editar outros campos quando o mini-teste associado entretanto encerrou", async () => {
        const existingTestId = "507f1f77bcf86cd799439099";
        const { service, testsService } = makeService({
            officialTestId: existingTestId,
        });
        testsService.findOwnedTest.mockResolvedValueOnce({
            _id: existingTestId,
            classId,
            subjectId,
            teacherId: teacher.id,
            title: "Teste já encerrado",
            status: "CLOSED",
            questions: [],
        });

        await expect(
            service.update(teacher, classId, roomId, { title: "Título revisto" }),
        ).resolves.toMatchObject({ status: "OPEN" });
        expect(testsService.findOwnedPublishedTest).not.toHaveBeenCalled();
        expect(testsService.findOwnedTest).toHaveBeenCalledWith(
            teacher.id,
            existingTestId,
        );
    });

    it("exige tentativa submetida antes de concluir uma sala com mini-teste", async () => {
        const { service, testsService } = makeService({
            officialTestId: "507f1f77bcf86cd799439099",
        });
        testsService.hasStudentAttempt.mockResolvedValueOnce(false);

        await expect(
            service.markCompleted(student, classId, roomId),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(testsService.hasStudentAttempt).toHaveBeenCalledWith(
            "507f1f77bcf86cd799439099",
            student.id,
        );
    });

    it("regista visualização e conclusão como atividade pedagógica da turma", async () => {
        const {
            classLearningActivityService,
            participationModel,
            service,
        } = makeService();
        const participationId = "507f1f77bcf86cd799439097";
        const firstViewedAt = new Date("2026-07-01T09:00:00.000Z");
        participationModel.findOne
            .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) })
            .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) });
        participationModel.create.mockResolvedValueOnce({
            _id: participationId,
            toObject: () => ({
                _id: participationId,
                roomId,
                classId,
                studentId: student.id,
                status: "VIEWED",
                firstViewedAt,
                lastViewedAt: firstViewedAt,
            }),
        });
        participationModel.findOneAndUpdate.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: participationId,
                roomId,
                classId,
                studentId: student.id,
                status: "COMPLETED",
                firstViewedAt,
                lastViewedAt: firstViewedAt,
                completedAt: firstViewedAt,
            }),
        });

        await service.markViewed(student, classId, roomId);
        await service.markCompleted(student, classId, roomId);

        expect(classLearningActivityService.recordBestEffort).toHaveBeenCalledWith(
            expect.objectContaining({
                classId,
                studentId: student.id,
                subjectId,
                type: "GUIDED_ROOM_VIEWED",
                sourceEventKey: `guided-room-view:${participationId}:first`,
            }),
        );
        expect(classLearningActivityService.recordBestEffort).toHaveBeenCalledWith(
            expect.objectContaining({
                classId,
                studentId: student.id,
                subjectId,
                type: "GUIDED_ROOM_COMPLETED",
                sourceEventKey: `guided-room-completed:${participationId}`,
            }),
        );
    });

    it("trata a repetição da mesma transição de estado como idempotente", async () => {
        const { roomModel, service } = makeService();

        await expect(
            service.changeStatus(teacher, classId, roomId, { status: "OPEN" }),
        ).resolves.toMatchObject({ status: "OPEN" });
        expect(roomModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("mantém uma sala fechada estritamente read-only para o aluno", async () => {
        const { participationModel, service } = makeService({ status: "CLOSED" });

        await expect(
            service.markViewed(student, classId, roomId),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(participationModel.findOne).not.toHaveBeenCalled();
    });

    it("devolve a participação própria no detalhe de uma sala fechada", async () => {
        const { participationModel, service } = makeService({ status: "CLOSED" });
        participationModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({
                _id: "507f1f77bcf86cd799439098",
                roomId,
                classId,
                studentId: student.id,
                status: "COMPLETED",
                firstViewedAt: new Date("2026-07-10T10:00:00.000Z"),
                lastViewedAt: new Date("2026-07-10T10:30:00.000Z"),
                completedAt: new Date("2026-07-10T10:30:00.000Z"),
            }),
        });

        await expect(
            service.getForStudent(student, classId, roomId),
        ).resolves.toMatchObject({
            status: "CLOSED",
            myParticipation: { status: "COMPLETED" },
        });
    });

    it("agrega salas de todas as turmas do aluno com participação e cursor", async () => {
        const { classesService, participationModel, service } = makeService();
        classesService.listStudentClasses.mockResolvedValueOnce([
            { _id: classId, name: "12.º A" },
        ]);
        participationModel.find.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue([]),
        });

        await expect(
            service.listAllForStudent(student, "OPEN", undefined, 20),
        ).resolves.toEqual({
            items: [
                expect.objectContaining({
                    _id: roomId,
                    className: "12.º A",
                    myParticipation: null,
                }),
            ],
            nextCursor: null,
        });
    });

    it("aplica classId autorizado no servidor antes do cursor da listagem global", async () => {
        const { classesService, roomModel, service } = makeService();
        const otherClassId = "507f1f77bcf86cd799439099";
        const cursor = "507f1f77bcf86cd799439098";
        classesService.listStudentClasses.mockResolvedValueOnce([
            { _id: classId, name: "12.º A" },
            { _id: otherClassId, name: "12.º B" },
        ]);

        await service.listAllForStudent(student, "OPEN", cursor, 20, classId);

        expect(roomModel.find).toHaveBeenCalledWith({
            classId: { $in: [new Types.ObjectId(classId)] },
            status: "OPEN",
            _id: { $lt: new Types.ObjectId(cursor) },
        });
    });

    it("não consulta salas quando o filtro classId não pertence ao aluno", async () => {
        const { roomModel, service } = makeService();

        await expect(
            service.listAllForStudent(
                student,
                "OPEN",
                undefined,
                20,
                "507f1f77bcf86cd799439099",
            ),
        ).resolves.toEqual({ items: [], nextCursor: null });
        expect(roomModel.find).not.toHaveBeenCalled();
    });

    it("exclui materiais legados que apontem para outra turma antes de usar a IA", async () => {
        const { materialsService, service } = makeService();
        materialsService.listByIds.mockResolvedValueOnce([
            {
                _id: "material-valid",
                classId,
                subjectId,
                teacherId: teacher.id,
                title: "Material válido",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Conteúdo autorizado",
            },
            {
                _id: "material-cross-class",
                classId: "507f1f77bcf86cd799439099",
                subjectId,
                teacherId: teacher.id,
                title: "Material externo",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Não pode entrar no prompt",
            },
        ]);

        await expect(
            service.listProcessedSelectedMaterials({
                _id: roomId,
                classId,
                subjectId,
                teacherId: teacher.id,
                title: "Sala",
                description: "Descrição",
                materialIds: ["material-valid", "material-cross-class"],
                status: "OPEN",
            }),
        ).resolves.toEqual([
            expect.objectContaining({ _id: "material-valid" }),
        ]);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de salas de estudo guiado para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(overrides: Record<string, unknown> = {}) {
    const room = {
        _id: roomId,
        classId,
        teacherId: teacher.id,
        title: "Sala guiada",
        description: "Preparação para teste",
        materialIds: ["mat-1"],
        subjectId,
        status: "OPEN",
        ...overrides,
    };
    const roomModel = {
        __room: room,
        aggregate: jest.fn(),
        exists: jest.fn().mockResolvedValue(true),
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve a sala criada no formato simples esperado pelo service em teste.
             *
             * @returns Sala de estudo guiado sem métodos Mongoose reais.
             */
            toObject: () => room,
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([room]),
                limit: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([room]),
                }),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(room),
        }),
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(room),
        }),
    };
    const participationModel = {
        exists: jest.fn().mockResolvedValue(false),
        find: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
        }),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        create: jest.fn(),
    };
    const classesService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedClass: jest.fn().mockResolvedValue({ _id: classId, name: "12A" }),
        findOwnedActiveClass: jest.fn().mockResolvedValue({ _id: classId, name: "12A" }),
        ensureStudentEnrollment: jest
            .fn()
            .mockResolvedValue({ _id: classId, name: "12A" }),
        ensureStudentHistoricalEnrollment: jest
            .fn()
            .mockResolvedValue({ _id: classId, name: "12A" }),
        listStudentClasses: jest.fn().mockResolvedValue([
            { _id: classId, name: "12.º A" },
        ]),
    };
    const subjectsService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
        }),
        findSubjectForStudentHistory: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId, name: "Matemática" },
            schoolClass: { _id: classId },
        }),
    };
    const materialsService = {
        findOwnedMaterial: jest.fn((_: string, id: string) =>
            Promise.resolve({
                _id: id,
                classId,
                subjectId,
                teacherId: teacher.id,
                title: "Material",
                type: "TEXT",
                status: "PROCESSED",
                textContent: "Conteúdo processado",
            }),
        ),
        listByIds: jest.fn().mockResolvedValue([]),
    };
    const testsService = {
        findOwnedPublishedTest: jest.fn(),
        findOwnedTest: jest.fn(),
        hasStudentAttempt: jest.fn(),
    };
    const historyService = { recordEvent: jest.fn() };
    const notificationsService = {
        createForGuidedRoom: jest.fn().mockResolvedValue({}),
        enqueueClassEvent: jest.fn().mockResolvedValue({ state: "PENDING" }),
    };
    const classLearningActivityService = {
        recordBestEffort: jest.fn().mockResolvedValue(true),
    };
    const service = new GuidedStudyRoomsService(
        roomModel as never,
        participationModel as never,
        classesService as never,
        subjectsService as never,
        materialsService as never,
        testsService as never,
        historyService as never,
        notificationsService as never,
        classLearningActivityService as never,
    );
    return {
        classLearningActivityService,
        classesService,
        materialsService,
        participationModel,
        roomModel,
        service,
        subjectsService,
        testsService,
    };
}
