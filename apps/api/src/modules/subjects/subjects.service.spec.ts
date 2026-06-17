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
            classId: expect.any(Types.ObjectId),
            teacherId: expect.any(Types.ObjectId),
            name: "Matemática A",
            code: "MAT-A",
            description: "Derivadas",
        });
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
                teacherId: teacher.id,
                name: "Matemática A",
            },
        ]);
        expect(classesService.ensureStudentEnrollment).toHaveBeenCalledWith(
            student.id,
            classId,
        );
        expect(subjectModel.find).toHaveBeenCalledWith({
            classId: expect.any(Types.ObjectId),
        });
    });
});

/**
 * Cria fixture ou estrutura auxiliar de disciplinas para manter testes e prompts legíveis.
 * @returns Valor de disciplinas no contrato esperado pelo chamador.
 */
function makeService() {
    const subjectModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };
    const classesService = {
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
    };
    const service = new SubjectsService(subjectModel as never, classesService as never);
    return { classesService, subjectModel, service };
}

/**
 * Executa a operação lean result no domínio de disciplinas com contrato explícito.
 *
 * @param value Valor bruto recebido antes de normalização, parsing ou validação.
 * @returns Valor de disciplinas no contrato esperado pelo chamador.
 */
function leanResult(value: unknown) {
    return { lean: jest.fn().mockResolvedValue(value) };
}

/**
 * Executa a operação sort lean result no domínio de disciplinas com contrato explícito.
 *
 * @param value Valor bruto recebido antes de normalização, parsing ou validação.
 * @returns Valor de disciplinas no contrato esperado pelo chamador.
 */
function sortLeanResult(value: unknown) {
    return { sort: jest.fn().mockReturnValue(leanResult(value)) };
}
