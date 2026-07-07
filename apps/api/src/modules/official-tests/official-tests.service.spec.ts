/**
 * Testa o comportamento de testes oficiais e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
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
            expect.objectContaining({
                title: "Mini-teste",
                questions: [
                    expect.objectContaining({
                        options: ["A", "B", "C", "D"],
                    }),
                ],
            }),
        );
    });

    it("bloqueia aluno antes de consultar disciplina", async () => {
        const { subjectsService, service } = makeService();

        await expect(
            service.create(student, subjectId, validInput()),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
    });

    it("rejeita opções duplicadas", async () => {
        const { testModel, service } = makeService();
        const input = validInput();
        input.questions[0].options = ["A", "A", "C", "D"];

        await expect(
            service.create(teacher, subjectId, input),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(testModel.create).not.toHaveBeenCalled();
    });

    it("não consulta a base de dados quando não há disciplinas para contar", async () => {
        const { testModel, service } = makeService();

        await expect(service.countPublishedBySubjectIds([])).resolves.toBe(0);
        expect(testModel.countDocuments).not.toHaveBeenCalled();
    });

    it("lista testes publicados para aluno inscrito sem respostas corretas", async () => {
        const { subjectsService, service } = makeService();

        await expect(service.listPublishedForStudent(student, subjectId)).resolves.toEqual([
            expect.objectContaining({
                _id: testId,
                status: "PUBLISHED",
                questions: [
                    {
                        statement: "Pergunta?",
                        options: ["A", "B", "C", "D"],
                    },
                ],
            }),
        ]);
        expect(subjectsService.findSubjectForStudent).toHaveBeenCalledWith(
            student.id,
            subjectId,
        );
    });

    it("bloqueia docente antes de listar testes publicados como aluno", async () => {
        const { subjectsService, service } = makeService();

        await expect(
            service.listPublishedForStudent(teacher, subjectId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findSubjectForStudent).not.toHaveBeenCalled();
    });

    it("submete tentativa, calcula pontuação e persiste studentId da sessão", async () => {
        const { attemptModel, service } = makeService();

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1],
            }),
        ).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439017",
            testId,
            subjectId,
            classId,
            studentId: student.id,
            correctAnswers: 1,
            totalQuestions: 1,
            percentage: 100,
            results: [
                {
                    questionIndex: 0,
                    selectedOptionIndex: 1,
                    correctOptionIndex: 1,
                    isCorrect: true,
                },
            ],
        });
        expect(attemptModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                selectedOptionIndexes: [1],
                correctAnswers: 1,
                totalQuestions: 1,
                percentage: 100,
            }),
        );
    });

    it("bloqueia tentativa para teste em rascunho ou fora do âmbito publicado", async () => {
        const { service } = makeService({ findOneTest: null });

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejeita tentativa com número de respostas diferente das perguntas", async () => {
        const { attemptModel, service } = makeService();

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                selectedOptionIndexes: [1, 0],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });
});

/**
 * Executa a operação valid input no domínio de testes oficiais com contrato explícito.
 *
 * @returns Resultado da operação no formato esperado pelo chamador.
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
 * Cria fixture ou estrutura auxiliar de testes oficiais para manter testes e prompts legíveis.
 *
 * @param options Opções de execução que permitem configurar a operação sem depender de estado global.
 * @returns Resultado da operação no formato esperado pelo chamador.
 */
function makeService(options: { findOneTest?: unknown } = {}) {
    const createdTest = {
        _id: testId,
        subjectId,
        classId,
        teacherId: teacher.id,
        title: "Mini-teste",
        status: "DRAFT",
        questions: [{ statement: "Pergunta?", options: ["A", "B", "C", "D"], correctOptionIndex: 1 }],
    };
    const publishedTest = {
        ...createdTest,
        status: "PUBLISHED",
    };
    const attempt = {
        _id: "507f1f77bcf86cd799439017",
        testId,
        subjectId,
        classId,
        studentId: student.id,
        selectedOptionIndexes: [1],
        correctAnswers: 1,
        totalQuestions: 1,
        percentage: 100,
        results: [
            {
                questionIndex: 0,
                selectedOptionIndex: 1,
                correctOptionIndex: 1,
                isCorrect: true,
            },
        ],
        answeredAt: new Date("2026-07-06T09:00:00.000Z"),
    };
    const testModel = {
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve o mini-teste criado no formato simples esperado pelo service em teste.
             *
             * @returns Mini-teste oficial sem métodos Mongoose reais.
             */
            toObject: () => createdTest,
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([publishedTest]),
            }),
        }),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(
                Object.prototype.hasOwnProperty.call(options, "findOneTest")
                    ? options.findOneTest
                    : publishedTest,
            ),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const attemptModel = {
        create: jest.fn().mockResolvedValue({
            /**
             * Devolve a tentativa criada no formato simples esperado pelo service em teste.
             *
             * @returns Tentativa de mini-teste sem métodos Mongoose reais.
             */
            toObject: () => attempt,
        }),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        findSubjectForStudent: jest.fn().mockResolvedValue({
            subject: {
                _id: subjectId,
                classId,
            },
            schoolClass: {
                _id: classId,
            },
        }),
    };
    const service = new OfficialTestsService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
