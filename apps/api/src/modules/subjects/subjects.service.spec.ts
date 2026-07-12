/**
 * Testa o comportamento de subjects e documenta os cenários de aceitação automatizados.
 */
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "./subjects.service.js";

const classId = "507f1f77bcf86cd799439014";
const subjectId = "507f1f77bcf86cd799439015";

describe("SubjectsService", () => {
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

    it("impede disciplinas com o mesmo nome dentro da mesma turma", async () => {
        const { subjectModel, service } = makeService();
        subjectModel.findOne.mockReturnValue(leanResult({ _id: subjectId }));

        await expect(
            service.createSubject(teacher, classId, {
                name: " Matemática A ",
                code: "MAT-A",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "SUBJECT_NAME_DUPLICATED",
            },
        });
        await expect(
            service.createSubject(teacher, classId, {
                name: " Matemática A ",
                code: "MAT-A",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(subjectModel.create).not.toHaveBeenCalled();
    });

    it("normaliza dados e associa a disciplina ao professor autenticado", async () => {
        const { subjectModel, service } = makeService();
        subjectModel.findOne.mockReturnValue(leanResult(null));
        subjectModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para disciplinas, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: subjectId,
                classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                description: "Derivadas",
            }),
        });

        await expect(
            service.createSubject(teacher, classId, {
                name: " Matemática A ",
                code: " mat-a ",
                description: " Derivadas ",
            }),
        ).resolves.toMatchObject({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática A",
            code: "MAT-A",
        });
        expect(subjectModel.create).toHaveBeenCalledWith({
            classId: expect.anything(),
            teacherId: expect.anything(),
            name: "Matemática A",
            code: "MAT-A",
            description: "Derivadas",
            status: "ACTIVE",
        });
        const createInput = subjectModel.create.mock.calls[0][0];
        expect(String(createInput.classId)).toBe(classId);
        expect(String(createInput.teacherId)).toBe(teacher.id);
    });

    it("bloqueia criação de disciplinas por alunos", async () => {
        const { classesService, subjectModel, service } = makeService();

        await expect(
            service.createSubject(student, classId, {
                name: "Matemática A",
                code: "MAT-A",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.findOwnedClass).not.toHaveBeenCalled();
        expect(subjectModel.create).not.toHaveBeenCalled();
    });

    it("lista disciplinas para aluno apenas depois de confirmar inscrição", async () => {
        const { classesService, subjectModel, service } = makeService();
        subjectModel.find.mockReturnValue(
            sortLeanResult([
                {
                    _id: subjectId,
                    classId,
                    teacherId: teacher.id,
                    name: "Matemática A",
                    code: "MAT-A",
                },
            ]),
        );

        await expect(
            service.listStudentClassSubjects(student, classId),
        ).resolves.toMatchObject([
            {
                _id: subjectId,
                classId,
                name: "Matemática A",
                readOnly: false,
            },
        ]);
        expect(classesService.ensureStudentHistoricalEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
        expect(subjectModel.find).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
            status: { $ne: "ARCHIVED" },
        });
        const result = await service.listStudentClassSubjects(student, classId);
        expect(JSON.stringify(result)).not.toContain("teacherId");
    });

    it("atualiza uma disciplina ativa com dados normalizados", async () => {
        const { subjectModel, service } = makeService();
        subjectModel.findOne
            .mockReturnValueOnce(leanResult({
                _id: subjectId,
                classId,
                teacherId: teacher.id,
                name: "Matemática",
                code: "MAT",
                status: "ACTIVE",
            }))
            .mockReturnValueOnce(leanResult(null));
        subjectModel.findOneAndUpdate = jest.fn().mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática A",
            code: "MAT-A",
            description: "Derivadas",
            status: "ACTIVE",
        }));

        await expect(
            service.updateSubject(teacher, classId, subjectId, {
                name: " Matemática A ",
                code: " mat-a ",
                description: " Derivadas ",
            }),
        ).resolves.toMatchObject({
            name: "Matemática A",
            code: "MAT-A",
            description: "Derivadas",
            status: "ACTIVE",
        });
    });

    it("restaura disciplina apenas quando a turma está ativa", async () => {
        const { classesService, subjectModel, service } = makeService();
        subjectModel.findOne.mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
            status: "ARCHIVED",
        }));
        subjectModel.findOneAndUpdate = jest.fn().mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
            status: "ACTIVE",
        }));

        await service.updateSubjectStatus(teacher, classId, subjectId, {
            status: "ACTIVE",
        });

        expect(classesService.findOwnedActiveClass).toHaveBeenCalledWith(
            teacher.id,
            classId,
        );
        expect(subjectModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: subjectId }),
            {
                $set: expect.objectContaining({
                    status: "ACTIVE",
                    statusChangedAt: expect.any(Date),
                }),
                $unset: { archivedAt: "", archivedBy: "" },
                $inc: { lifecycleFenceVersion: 1 },
            },
            { new: true, runValidators: true, session: undefined },
        );
    });

    it("arquiva disciplina, encerra recursos ativos e publica um único evento", async () => {
        const {
            guidedRoomModel,
            officialTestModel,
            outboxPublisher,
            service,
            subjectModel,
        } = makeService();
        let releaseGuidedRoomCascade!: () => void;
        let signalGuidedRoomCascade!: () => void;
        const guidedRoomCascadeStarted = new Promise<void>((resolve) => {
            signalGuidedRoomCascade = resolve;
        });
        const guidedRoomCascadeCanFinish = new Promise<{ modifiedCount: number }>(
            (resolve) => {
                releaseGuidedRoomCascade = () => resolve({ modifiedCount: 1 });
            },
        );
        guidedRoomModel.updateMany.mockImplementationOnce(() => {
            signalGuidedRoomCascade();
            return guidedRoomCascadeCanFinish;
        });
        subjectModel.findOne.mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
            status: "ACTIVE",
        }));
        subjectModel.findOneAndUpdate.mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
            status: "ARCHIVED",
        }));

        const archiving = service.updateSubjectStatus(teacher, classId, subjectId, {
            status: "ARCHIVED",
        });
        await guidedRoomCascadeStarted;
        expect(officialTestModel.updateMany).not.toHaveBeenCalled();
        releaseGuidedRoomCascade();
        await archiving;

        expect(guidedRoomModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ status: "OPEN" }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "CLOSED",
                    closedReason: "SUBJECT_ARCHIVED",
                }),
            }),
            { session: undefined },
        );
        expect(officialTestModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ status: "PUBLISHED" }),
            expect.any(Object),
            { session: undefined },
        );
        expect(outboxPublisher.publishClassEvent).toHaveBeenCalledWith(
            expect.objectContaining({ type: "SUBJECT_ARCHIVED" }),
            undefined,
        );
    });

    it("permite leitura histórica de disciplina arquivada a membro autorizado", async () => {
        const { classesService, subjectModel, service } = makeService();
        subjectModel.findById.mockReturnValue(leanResult({
            _id: subjectId,
            classId,
            teacherId: teacher.id,
            name: "Matemática",
            code: "MAT",
            status: "ARCHIVED",
        }));
        classesService.ensureStudentHistoricalEnrollment.mockResolvedValue({
            _id: classId,
            status: "ARCHIVED",
        });

        await expect(
            service.findSubjectForStudentHistory(student.id, subjectId),
        ).resolves.toMatchObject({
            subject: { _id: subjectId, status: "ARCHIVED" },
            schoolClass: { _id: classId, status: "ARCHIVED" },
        });
        expect(
            classesService.ensureStudentHistoricalEnrollment,
        ).toHaveBeenCalledWith(student.id, classId);
    });

    it("reserva fences por ordem turma e disciplina na mesma sessão", async () => {
        const { classesService, service, subjectModel } = makeService();
        const session = { id: "session-subject-fence" };
        subjectModel.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

        await service.reserveActiveChildMutation(
            teacher.id,
            classId,
            subjectId,
            session as never,
        );

        expect(classesService.reserveActiveChildMutation).toHaveBeenCalledWith(
            teacher.id,
            classId,
            session,
        );
        expect(subjectModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: expect.any(Types.ObjectId),
                classId: expect.any(Types.ObjectId),
                status: { $ne: "ARCHIVED" },
            }),
            { $inc: { lifecycleFenceVersion: 1 } },
            { session },
        );
        expect(
            classesService.reserveActiveChildMutation.mock.invocationCallOrder[0],
        ).toBeLessThan(subjectModel.updateOne.mock.invocationCallOrder[0]);
    });
});

/**
 * Cria fixture ou estrutura auxiliar de disciplinas para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const subjectModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
    };
    const classesService = {
        reserveActiveChildMutation: jest.fn().mockResolvedValue(undefined),
        ensureStudentEnrollment: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: ["507f1f77bcf86cd799439013"],
        }),
        findOwnedClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
        }),
        findOwnedActiveClass: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: [],
            status: "ACTIVE",
        }),
        ensureStudentHistoricalEnrollment: jest.fn().mockResolvedValue({
            _id: classId,
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º A",
            code: "12A",
            schoolYear: "2025/2026",
            studentIds: ["507f1f77bcf86cd799439013"],
            status: "ACTIVE",
        }),
    };
    const outboxPublisher = {
        publishClassEvent: jest.fn().mockResolvedValue({ status: "PENDING" }),
    };
    const guidedRoomModel = {
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    const officialTestModel = {
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    const service = new SubjectsService(
        subjectModel as never,
        classesService as never,
        outboxPublisher as never,
        guidedRoomModel as never,
        officialTestModel as never,
    );
    return {
        classesService,
        guidedRoomModel,
        officialTestModel,
        outboxPublisher,
        subjectModel,
        service,
    };
}

/**
 * Executa a operação lean result no domínio de disciplinas com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Executa a operação sort lean result no domínio de disciplinas com contrato explícito.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function sortLeanResult(value: unknown) {
    return { sort: jest.fn().mockReturnValue(leanResult(value)) };
}
