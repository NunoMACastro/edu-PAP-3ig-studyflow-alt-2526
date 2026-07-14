/**
 * Testa o comportamento de classes e documenta os cenários de aceitação automatizados.
 */
import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { ClassesService } from "./classes.service.js";

describe("ClassesService", () => {
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
    const otherTeacher: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439016",
        email: "outro-professor@example.test",
        role: "TEACHER",
    };
    const admin: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439017",
        email: "admin@example.test",
        role: "ADMIN",
    };
    const classId = "507f1f77bcf86cd799439014";

    it("bloqueia criação de turmas por alunos", async () => {
        const { classModel, service } = makeService();

        await expect(
            service.createClass(student, {
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "TEACHER_ROLE_REQUIRED",
            },
        });
        await expect(
            service.createClass(student, {
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classModel.create).not.toHaveBeenCalled();
    });

    it("normaliza código e associa a turma ao professor autenticado", async () => {
        const { classModel, service } = makeService();
        classModel.create.mockResolvedValue({
            /**
             * Transforma o apoio de teste para turmas, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Contrato público pronto para a UI, sem campos internos de persistência.
             */
            toObject: () => ({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [],
            }),
        });

        await expect(
            service.createClass(teacher, {
                name: " Matemática A ",
                code: " mat-a ",
                schoolYear: " 2025/2026 ",
            }),
        ).resolves.toMatchObject({
            _id: classId,
            teacherId: teacher.id,
            name: "Matemática A",
            code: "MAT-A",
        });
        expect(classModel.create).toHaveBeenCalledWith({
            teacherId: expect.anything(),
            name: "Matemática A",
            code: "MAT-A",
            schoolYear: "2025/2026",
            studentIds: [],
            status: "ACTIVE",
        });
        expect(String(classModel.create.mock.calls[0][0].teacherId)).toBe(teacher.id);
    });

    it("reserva a mutação filha no documento ativo usando a mesma sessão", async () => {
        const { classModel, service } = makeService();
        const session = { id: "session-class-fence" };
        classModel.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

        await expect(
            service.reserveActiveChildMutation(teacher.id, classId, session as never),
        ).resolves.toBeUndefined();
        expect(classModel.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: expect.any(Types.ObjectId),
                teacherId: expect.any(Types.ObjectId),
                status: { $ne: "ARCHIVED" },
            }),
            { $inc: { lifecycleFenceVersion: 1 } },
            { session },
        );
    });

    it("rejeita a reserva quando o archive já venceu", async () => {
        const { classModel, service } = makeService();
        classModel.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

        await expect(
            service.reserveActiveChildMutation(teacher.id, classId),
        ).rejects.toMatchObject({
            response: expect.objectContaining({ code: "CLASS_NOT_ACTIVE" }),
        });
    });

    it("mapeia código duplicado para 409 controlado", async () => {
        const { classModel, service } = makeService();
        classModel.create.mockRejectedValue({ code: 11000 });

        await expect(
            service.createClass(teacher, {
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "CLASS_CODE_DUPLICATED",
            },
        });
        await expect(
            service.createClass(teacher, {
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it("lista turmas do professor com emails públicos dos alunos", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, userModel, service } = makeService();
        const classLean = jest.fn().mockResolvedValue([
            {
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
            },
        ]);
        const sort = jest.fn().mockReturnValue({ lean: classLean });
        const studentLean = jest.fn().mockResolvedValue([
            {
                _id: studentId,
                email: "aluno@example.test",
                passwordHash: "nao-deve-sair",
                authProvider: "local",
            },
        ]);
        const select = jest.fn().mockReturnValue({ lean: studentLean });
        classModel.find.mockReturnValue({ sort });
        userModel.find.mockReturnValue({ select });

        const result = await service.listTeacherClasses(teacher);

        expect(result).toEqual([
            expect.objectContaining({
                _id: classId,
                studentIds: [studentId],
                students: [{ id: studentId, email: "aluno@example.test" }],
            }),
        ]);
        expect(JSON.stringify(result)).not.toContain("passwordHash");
        expect(select).toHaveBeenCalledWith({ email: 1 });
        expect(classModel.find).toHaveBeenCalledWith({
            teacherId: expect.any(Types.ObjectId),
        });
        const [studentQuery] = userModel.find.mock.calls[0];
        expect(studentQuery.role).toBe("STUDENT");
        expect(studentQuery._id.$in.map(String)).toEqual([studentId]);
    });

    it("adiciona apenas utilizadores com role STUDENT à turma", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, membershipModel, userModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [],
            }),
        });
        userModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: studentId,
                email: "aluno@example.test",
                role: "STUDENT",
            }),
        });
        classModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
            }),
        });
        const studentLean = jest.fn().mockResolvedValue([
            {
                _id: studentId,
                email: "aluno@example.test",
                passwordHash: "nao-deve-sair",
            },
        ]);
        const select = jest.fn().mockReturnValue({ lean: studentLean });
        userModel.find.mockReturnValue({ select });

        const result = await service.addStudent(teacher, classId, {
            email: " Aluno@Example.Test ",
        });

        expect(result).toMatchObject({
            studentIds: [studentId],
            students: [{ id: studentId, email: "aluno@example.test" }],
        });
        expect(JSON.stringify(result)).not.toContain("passwordHash");
        expect(userModel.findOne).toHaveBeenCalledWith({
            email: "aluno@example.test",
            role: "STUDENT",
        });
        expect(select).toHaveBeenCalledWith({ email: 1 });
        expect(classModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: classId,
                teacherId: expect.anything(),
                status: { $ne: "ARCHIVED" },
            },
            { $addToSet: { studentIds: studentId } },
            { new: true, runValidators: true, session: undefined },
        );
        expect(membershipModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                classId: expect.anything(),
                studentId,
            },
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "ACTIVE",
                    joinedAtEstimated: false,
                }),
                $unset: { removedAt: "", removedBy: "" },
            }),
            { upsert: true, new: true, runValidators: true, session: undefined },
        );
    });

    it("remove aluno de turma própria sem expor dados internos", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const {
            classModel,
            membershipModel,
            outboxPublisher,
            userModel,
            service,
        } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
            }),
        });
        classModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [],
            }),
        });

        const result = await service.removeStudent(teacher, classId, studentId);

        expect(result).toMatchObject({
            _id: classId,
            studentIds: [],
            students: [],
        });
        expect(userModel.find).not.toHaveBeenCalled();
        expect(classModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: classId,
                teacherId: expect.anything(),
                status: { $ne: "ARCHIVED" },
            },
            { $pull: { studentIds: expect.any(Types.ObjectId) } },
            { new: true, runValidators: true, session: undefined },
        );
        const [query, update] = classModel.findOneAndUpdate.mock.calls[0];
        expect(String(query.teacherId)).toBe(teacher.id);
        expect(String(update.$pull.studentIds)).toBe(studentId);
        expect(membershipModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                classId: expect.anything(),
                studentId: expect.anything(),
            },
            expect.objectContaining({
                $set: expect.objectContaining({ status: "REMOVED" }),
            }),
            { upsert: true, new: true, runValidators: true, session: undefined },
        );
        expect(outboxPublisher.publishClassEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                classId,
                recipientIds: [studentId],
                type: "CLASS_MEMBERSHIP_REMOVED",
                preferenceContext: NotificationContext.CLASS_UPDATES,
            }),
            undefined,
        );
    });

    it("não reinicia joinedAt ao adicionar novamente uma membership já ativa", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, membershipModel, userModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
                status: "ACTIVE",
            }),
        });
        membershipModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                classId,
                studentId,
                status: "ACTIVE",
                joinedAt: new Date("2026-07-01T10:00:00.000Z"),
            }),
        });
        userModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: studentId,
                email: "aluno@example.test",
                role: "STUDENT",
            }),
        });
        classModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
                status: "ACTIVE",
            }),
        });
        userModel.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    { _id: studentId, email: "aluno@example.test" },
                ]),
            }),
        });

        await service.addStudent(teacher, classId, {
            email: "aluno@example.test",
        });

        expect(membershipModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("não remove aluno de turma de outro professor", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.removeStudent(otherTeacher, classId, studentId),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(classModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("bloqueia remoção de aluno por contas que não são professor", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, service } = makeService();

        await expect(
            service.removeStudent(student, classId, studentId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        await expect(
            service.removeStudent(admin, classId, studentId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classModel.findOne).not.toHaveBeenCalled();
        expect(classModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("devolve erro controlado quando o aluno não pertence à turma", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [],
            }),
        });
        classModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.removeStudent(teacher, classId, studentId),
        ).rejects.toMatchObject({
            response: {
                code: "CLASS_STUDENT_NOT_FOUND",
            },
        });
        await expect(
            service.removeStudent(teacher, classId, "not-an-object-id"),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("bloqueia acesso de alunos não inscritos", async () => {
        const { classModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.ensureStudentEnrollment(student.id, classId),
        ).rejects.toMatchObject({
            response: {
                code: "CLASS_ENROLLMENT_REQUIRED",
            },
        });
        await expect(
            service.ensureStudentEnrollment(student.id, classId),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("não expõe turmas quando o identificador é inválido", async () => {
        const { classModel, service } = makeService();

        await expect(
            service.findOwnedClass(teacher.id, "not-an-object-id"),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(classModel.findOne).not.toHaveBeenCalled();
    });

    it("confirma apenas alunos inscritos numa turma do professor", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, service } = makeService();
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "Matemática A",
                code: "MAT-A",
                schoolYear: "2025/2026",
                studentIds: [studentId],
            }),
        });

        await expect(
            service.ensureOwnedClassStudent(teacher.id, classId, studentId),
        ).resolves.toMatchObject({ _id: classId, studentIds: [studentId] });
        await expect(
            service.ensureOwnedClassStudent(
                teacher.id,
                classId,
                "507f1f77bcf86cd799439099",
            ),
        ).rejects.toMatchObject({
            response: { code: "CLASS_STUDENT_NOT_FOUND" },
        });
    });

    it("lista resumos discentes pela membership sem expor professor ou colegas", async () => {
        const joinedAt = new Date("2026-07-11T09:00:00.000Z");
        const { classModel, membershipModel, service } = makeService();
        membershipModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                {
                    classId,
                    studentId: student.id,
                    status: "ACTIVE",
                    joinedAt,
                },
            ]),
        });
        classModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        _id: classId,
                        teacherId: teacher.id,
                        name: "12.º A",
                        code: "12A",
                        schoolYear: "2025/2026",
                        studentIds: [student.id, "507f1f77bcf86cd799439099"],
                        status: "ACTIVE",
                    },
                ]),
            }),
        });

        const result = await service.listStudentClasses(student);

        expect(result).toEqual([
            {
                _id: classId,
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                status: "ACTIVE",
                joinedAt,
            },
        ]);
        expect(JSON.stringify(result)).not.toContain("teacherId");
        expect(JSON.stringify(result)).not.toContain("studentIds");
    });

    it("uma membership removida prevalece sobre o array legacy", async () => {
        const { classModel, membershipModel, service } = makeService();
        membershipModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                classId,
                studentId: student.id,
                status: "REMOVED",
            }),
        });

        await expect(
            service.ensureStudentEnrollment(student.id, classId),
        ).rejects.toMatchObject({
            response: { code: "CLASS_ENROLLMENT_REQUIRED" },
        });
        expect(classModel.findOne).not.toHaveBeenCalled();
    });

    it("arquiva turma de forma reversível e auditável", async () => {
        const {
            classModel,
            guidedRoomModel,
            officialTestModel,
            outboxPublisher,
            service,
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
        classModel.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                studentIds: [],
                status: "ACTIVE",
            }),
        });
        classModel.findOneAndUpdate.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: classId,
                teacherId: teacher.id,
                name: "12.º A",
                code: "12A",
                schoolYear: "2025/2026",
                studentIds: [],
                status: "ARCHIVED",
                archivedAt: new Date(),
            }),
        });

        const archiving = service.updateClassStatus(teacher, classId, {
            status: "ARCHIVED",
        });
        await guidedRoomCascadeStarted;
        expect(officialTestModel.updateMany).not.toHaveBeenCalled();
        releaseGuidedRoomCascade();
        await expect(archiving).resolves.toMatchObject({ status: "ARCHIVED" });
        expect(classModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ _id: classId, teacherId: expect.anything() }),
            expect.objectContaining({
                $set: expect.objectContaining({ status: "ARCHIVED" }),
            }),
            { new: true, runValidators: true, session: undefined },
        );
        expect(guidedRoomModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ status: "OPEN" }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "CLOSED",
                    closedReason: "CLASS_ARCHIVED",
                }),
            }),
            { session: undefined },
        );
        expect(officialTestModel.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({ status: "PUBLISHED" }),
            expect.objectContaining({
                $set: expect.objectContaining({
                    status: "CLOSED",
                    closedReason: "CLASS_ARCHIVED",
                }),
            }),
            { session: undefined },
        );
        expect(outboxPublisher.publishClassEvent).toHaveBeenCalledWith(
            expect.objectContaining({ type: "CLASS_ARCHIVED" }),
            undefined,
        );
    });
});

/**
 * Cria fixture ou estrutura auxiliar de turmas para manter testes e prompts legíveis.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService() {
    const classModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn(),
    };
    const userModel = {
        find: jest.fn(),
        findOne: jest.fn(),
    };
    const membershipModel = {
        find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
        findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
        findOneAndUpdate: jest.fn().mockResolvedValue(null),
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
    const service = new ClassesService(
        classModel as never,
        userModel as never,
        membershipModel as never,
        outboxPublisher as never,
        guidedRoomModel as never,
        officialTestModel as never,
    );

    return {
        classModel,
        userModel,
        membershipModel,
        outboxPublisher,
        guidedRoomModel,
        officialTestModel,
        service,
    };
}
