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

        await expect(
            service.addStudent(teacher, classId, {
                email: " Aluno@Example.Test ",
            }),
        ).resolves.toMatchObject({
            studentIds: [studentId],
        });
        expect(userModel.findOne).toHaveBeenCalledWith({
            email: "aluno@example.test",
            role: "STUDENT",
        });
        expect(classModel.findOneAndUpdate).toHaveBeenCalledWith(
            {
                _id: classId,
                teacherId: expect.any(Types.ObjectId),
            },
            { $addToSet: { studentIds: studentId } },
            { new: true, runValidators: true },
        );
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
 * @returns Valor de turmas no contrato esperado pelo chamador.
 */
function makeService() {
    const classModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };
    const userModel = {
        findOne: jest.fn(),
    };
    const service = new ClassesService(classModel as never, userModel as never);

    return {
        classModel,
        userModel,
        service,
    };
}
