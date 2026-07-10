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
            teacherId: expect.any(Types.ObjectId),
            name: "Matemática A",
            code: "MAT-A",
            schoolYear: "2025/2026",
            studentIds: [],
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
        const { classModel, userModel, service } = makeService();
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
                teacherId: expect.any(Types.ObjectId),
            },
            { $addToSet: { studentIds: studentId } },
            { new: true, runValidators: true },
        );
    });

    it("remove aluno de turma própria sem expor dados internos", async () => {
        const studentId = "507f1f77bcf86cd799439015";
        const { classModel, userModel, service } = makeService();
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
                teacherId: expect.any(Types.ObjectId),
                studentIds: expect.any(Types.ObjectId),
            },
            { $pull: { studentIds: expect.any(Types.ObjectId) } },
            { new: true, runValidators: true },
        );
        const [query, update] = classModel.findOneAndUpdate.mock.calls[0];
        expect(String(query.studentIds)).toBe(studentId);
        expect(String(update.$pull.studentIds)).toBe(studentId);
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
    };
    const userModel = {
        find: jest.fn(),
        findOne: jest.fn(),
    };
    const service = new ClassesService(classModel as never, userModel as never);

    return {
        classModel,
        userModel,
        service,
    };
}
