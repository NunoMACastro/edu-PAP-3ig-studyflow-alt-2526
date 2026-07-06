// apps/api/src/modules/official-tests/official-tests.service.spec.ts
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { OfficialTestsService } from "./official-tests.service.js";

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
const subjectId = "507f1f77bcf86cd799439014";
const classId = "507f1f77bcf86cd799439015";
const testId = "507f1f77bcf86cd799439016";
const attemptId = "507f1f77bcf86cd799439017";

describe("OfficialTestsService", () => {
    it("cria teste oficial depois de validar ownership da disciplina", async () => {
        const { subjectsService, testModel, service } = makeService();

        await expect(
            service.create(teacher, subjectId, validInput()),
        ).resolves.toMatchObject({
            _id: testId,
            subjectId,
            classId,
            teacherId: teacher.id,
            status: "DRAFT",
        });
        expect(subjectsService.findOwnedSubject).toHaveBeenCalledWith(
            teacher.id,
            subjectId,
        );
        expect(testModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ title: "Mini-teste" }),
        );
    });

    it("bloqueia aluno antes de consultar disciplina docente", async () => {
        const { subjectsService, service } = makeService();

        await expect(
            service.create(student, subjectId, validInput()),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
    });

    it("lista para o aluno apenas testes publicados sem respostas corretas", async () => {
        const { service } = makeService();

        await expect(
            service.listPublishedForStudent(student, subjectId),
        ).resolves.toEqual([
            expect.objectContaining({
                _id: testId,
                questions: [
                    expect.not.objectContaining({ correctOptionIndex: expect.any(Number) }),
                ],
            }),
        ]);
    });

    it("submete tentativa de aluno inscrito e calcula pontuação no backend", async () => {
        const { attemptModel, subjectsService, service } = makeService();

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).resolves.toMatchObject({
            _id: attemptId,
            testId,
            studentId: student.id,
            correctAnswers: 1,
            totalQuestions: 2,
            percentage: 50,
        });
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
        expect(attemptModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                correctAnswers: 1,
                percentage: 50,
            }),
        );
    });

    it("bloqueia aluno não inscrito antes de procurar teste", async () => {
        const { subjectsService, testModel, service } = makeService();
        subjectsService.findSubjectForStudent.mockRejectedValueOnce(
            new ForbiddenException({
                code: "CLASS_MEMBERSHIP_REQUIRED",
                message: "Aluno não inscrito na turma.",
            }),
        );

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(testModel.findOne).not.toHaveBeenCalled();
    });

    it("bloqueia teste não publicado", async () => {
        const { testModel, attemptModel, service } = makeService();
        testModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 2],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });

    it("rejeita tentativa incompleta", async () => {
        const { attemptModel, service } = makeService();

        await expect(
            service.submitStudentAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Cria input docente válido para teste oficial.
 *
 * @returns Payload de criação docente.
 */
function validInput() {
    return {
        title: " Mini-teste ",
        questions: [
            {
                statement: "Pergunta?",
                options: [" A ", " B ", " C ", " D "],
                correctOptionIndex: 1,
            },
        ],
    };
}

/**
 * Cria service com duplos de teste controlados.
 *
 * @returns Service e dependências observáveis.
 */
function makeService() {
    const test = {
        _id: testId,
        subjectId,
        classId,
        teacherId: teacher.id,
        title: "Mini-teste",
        status: "PUBLISHED",
        questions: [
            {
                statement: "Primeira pergunta?",
                options: ["A", "B", "C", "D"],
                correctOptionIndex: 1,
            },
            {
                statement: "Segunda pergunta?",
                options: ["A", "B", "C", "D"],
                correctOptionIndex: 3,
            },
        ],
    };
    const attempt = {
        _id: attemptId,
        testId,
        subjectId,
        classId,
        studentId: student.id,
        correctAnswers: 1,
        totalQuestions: 2,
        percentage: 50,
        results: [
            { questionIndex: 0, selectedOptionIndex: 1, correctOptionIndex: 1, isCorrect: true },
            { questionIndex: 1, selectedOptionIndex: 2, correctOptionIndex: 3, isCorrect: false },
        ],
        answeredAt: new Date("2026-07-02T10:00:00.000Z"),
    };
    const testModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => test }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([test]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(test),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const attemptModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => attempt }),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: { _id: subjectId, classId },
            schoolClass: { _id: classId },
        }),
    };
    const service = new OfficialTestsService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}