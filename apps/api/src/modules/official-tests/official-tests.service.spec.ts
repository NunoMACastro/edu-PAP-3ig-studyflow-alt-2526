/**
 * Testa o comportamento de testes oficiais e documenta os cenários de aceitação automatizados.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
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

    it("conta testes publicados agrupados por disciplina", async () => {
        const { testModel, service } = makeService();

        await expect(service.countPublishedBySubjectIdsGrouped([])).resolves.toEqual(
            {},
        );
        expect(testModel.aggregate).not.toHaveBeenCalled();

        await expect(
            service.countPublishedBySubjectIdsGrouped([subjectId]),
        ).resolves.toEqual({ [subjectId]: 1 });
        expect(testModel.aggregate).toHaveBeenCalledWith([
            {
                $match: {
                    subjectId: { $in: [expect.any(Types.ObjectId)] },
                    status: "PUBLISHED",
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
    });

    it("lista testes publicados para aluno inscrito sem respostas corretas", async () => {
        const { subjectsService, service } = makeService();

        await expect(service.listPublishedForStudent(student, subjectId)).resolves.toEqual([
            expect.objectContaining({
                _id: testId,
                status: "PUBLISHED",
                attemptsUsed: 0,
                attemptsRemaining: 3,
                maxAttempts: 3,
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
                attemptKey: "11111111-1111-4111-8111-111111111111",
                selectedOptionIndexes: [1],
            }),
        ).resolves.toMatchObject({
            _id: "507f1f77bcf86cd799439017",
            testId,
            subjectId,
            classId,
            studentId: student.id,
            attemptNumber: 1,
            attemptsRemaining: 2,
            correctAnswers: 1,
            totalQuestions: 1,
            percentage: 100,
            solutionUnlocked: false,
            results: [
                {
                    questionIndex: 0,
                    selectedOptionIndex: 1,
                },
            ],
        });
        expect(attemptModel.create).toHaveBeenCalledWith(
            [
                expect.objectContaining({
                    selectedOptionIndexes: [1],
                    attemptNumber: 1,
                    correctAnswers: 1,
                    totalQuestions: 1,
                    percentage: 100,
                }),
            ],
            expect.objectContaining({ session: expect.anything() }),
        );
    });

    it("bloqueia tentativa para teste em rascunho ou fora do âmbito publicado", async () => {
        const { service } = makeService({ findOneTest: null });

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                attemptKey: "22222222-2222-4222-8222-222222222222",
                selectedOptionIndexes: [1],
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejeita tentativa com número de respostas diferente das perguntas", async () => {
        const { attemptModel, service } = makeService();

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                attemptKey: "33333333-3333-4333-8333-333333333333",
                selectedOptionIndexes: [1, 0],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });

    it("avança apenas de DRAFT para PUBLISHED e mantém retry idempotente", async () => {
        const { service, testModel } = makeService({
            changedTest: {
                _id: testId,
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Mini-teste",
                status: "PUBLISHED",
                questions: [
                    {
                        statement: "Pergunta?",
                        options: ["A", "B", "C", "D"],
                        correctOptionIndex: 1,
                    },
                ],
            },
        });

        await expect(
            service.changeStatus(teacher, subjectId, testId, {
                status: "PUBLISHED",
            }),
        ).resolves.toMatchObject({ status: "PUBLISHED" });
        expect(testModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ status: "DRAFT" }),
            { $set: { status: "PUBLISHED" } },
            { new: true },
        );
    });

    it("edita conteúdo enquanto o teste permanece DRAFT", async () => {
        const { service, testModel } = makeService({
            changedTest: {
                _id: testId,
                subjectId,
                classId,
                teacherId: teacher.id,
                title: "Mini-teste revisto",
                status: "DRAFT",
                questions: validInput().questions,
            },
        });

        await expect(
            service.updateDraft(teacher, subjectId, testId, {
                ...validInput(),
                title: " Mini-teste revisto ",
            }),
        ).resolves.toMatchObject({
            title: "Mini-teste revisto",
            status: "DRAFT",
        });
        expect(testModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ status: "DRAFT" }),
            expect.objectContaining({
                $set: expect.objectContaining({ title: "Mini-teste revisto" }),
            }),
            { new: true },
        );
    });

    it("rejeita edição depois da publicação", async () => {
        const { service } = makeService();

        await expect(
            service.updateDraft(teacher, subjectId, testId, validInput()),
        ).rejects.toMatchObject({
            response: expect.objectContaining({
                code: "OFFICIAL_TEST_NOT_EDITABLE",
            }),
        });
    });

    it("bloqueia a quarta tentativa antes de persistir", async () => {
        const { attemptModel, service } = makeService({ attemptCount: 3 });

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                attemptKey: "44444444-4444-4444-8444-444444444444",
                selectedOptionIndexes: [1],
            }),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(attemptModel.create).not.toHaveBeenCalled();
    });

    it("revela soluções na terceira tentativa", async () => {
        const { service } = makeService({ attemptCount: 2, attemptNumber: 3 });

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                attemptKey: "55555555-5555-4555-8555-555555555555",
                selectedOptionIndexes: [1],
            }),
        ).resolves.toMatchObject({
            attemptNumber: 3,
            attemptsRemaining: 0,
            solutionUnlocked: true,
            results: [
                expect.objectContaining({
                    correctOptionIndex: 1,
                    isCorrect: true,
                }),
            ],
        });
    });

    it("devolve um retry idempotente depois do fecho e usa o total atual", async () => {
        const { attemptModel, service } = makeService({
            attemptCount: 3,
            findOneTest: {
                _id: testId,
                subjectId,
                classId,
                status: "CLOSED",
                questions: validInput().questions,
            },
            existingRetry: true,
        });

        await expect(
            service.submitAttempt(student, subjectId, testId, {
                attemptKey: "11111111-1111-4111-8111-111111111111",
                selectedOptionIndexes: [0],
            }),
        ).resolves.toMatchObject({
            attemptNumber: 1,
            solutionUnlocked: true,
            selectedOptionIndexes: [1],
            results: [
                expect.objectContaining({
                    correctOptionIndex: 1,
                    isCorrect: true,
                }),
            ],
        });
        expect(attemptModel.create).not.toHaveBeenCalled();
    });

    it("revela tentativas anteriores apenas depois de encerrar o teste", async () => {
        const { service } = makeService({
            findOneTest: {
                _id: testId,
                subjectId,
                classId,
                status: "CLOSED",
                questions: [],
            },
        });

        await expect(
            service.listMyAttempts(student, subjectId, testId),
        ).resolves.toEqual([
            expect.objectContaining({
                solutionUnlocked: true,
                results: [
                    expect.objectContaining({
                        correctOptionIndex: 1,
                        isCorrect: true,
                    }),
                ],
            }),
        ]);
    });

    it("trata opções iguais sem distinguir maiúsculas", async () => {
        const { service, testModel } = makeService();
        const input = validInput();
        input.questions[0].options = ["Resposta", " resposta ", "C", "D"];

        await expect(
            service.create(teacher, subjectId, input),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(testModel.create).not.toHaveBeenCalled();
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
function makeService(
    options: {
        attemptCount?: number;
        attemptNumber?: number;
        changedTest?: unknown;
        existingRetry?: boolean;
        findOneTest?: unknown;
    } = {},
) {
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
        attemptNumber: options.attemptNumber ?? 1,
        attemptKey: "11111111-1111-4111-8111-111111111111",
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
        aggregate: jest.fn().mockResolvedValue([
            { _id: new Types.ObjectId(subjectId), count: 1 },
        ]),
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
        findOneAndUpdate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(options.changedTest ?? null),
        }),
        updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const attemptModel = {
        countDocuments: jest.fn().mockResolvedValue(options.attemptCount ?? 0),
        create: jest.fn().mockResolvedValue([
            {
                /**
                 * Devolve a tentativa criada no formato simples esperado pelo service em teste.
                 *
                 * @returns Tentativa de mini-teste sem métodos Mongoose reais.
                 */
                toObject: () => attempt,
            },
        ]),
        findOne: jest.fn().mockReturnValue({
            lean: jest
                .fn()
                .mockResolvedValue(options.existingRetry ? attempt : null),
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([attempt]),
            }),
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
        {
            transaction: jest.fn(async (operation) => operation({ id: "session" })),
        } as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
