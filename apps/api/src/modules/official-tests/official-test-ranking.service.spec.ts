/**
 * Testa o ranking de mini-testes oficiais sem tocar em base de dados real.
 */
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    buildOfficialTestRanking,
    OfficialTestRankingService,
} from "./official-test-ranking.service.js";

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
const secondTestId = "507f1f77bcf86cd799439017";

describe("buildOfficialTestRanking", () => {
    it("ordena por percentagem desc e por data asc em empate", () => {
        const rows = buildOfficialTestRanking([
            attempt("507f1f77bcf86cd799439021", 80, "2026-07-02T10:05:00.000Z"),
            attempt("507f1f77bcf86cd799439022", 90, "2026-07-02T10:10:00.000Z"),
            attempt("507f1f77bcf86cd799439023", 90, "2026-07-02T10:00:00.000Z"),
        ]);

        expect(rows.map((row) => row.studentRef)).toEqual([
            "507f1f77bcf86cd799439023",
            "507f1f77bcf86cd799439022",
            "507f1f77bcf86cd799439021",
        ]);
        expect(rows.map((row) => row.position)).toEqual([1, 2, 3]);
        expect(rows[0]).not.toHaveProperty("results");
        expect(rows[0]).not.toHaveProperty("email");
    });

    it("mantém apenas a melhor tentativa de cada aluno", () => {
        const repeatedStudentId = "507f1f77bcf86cd799439021";
        const rows = buildOfficialTestRanking([
            attempt(repeatedStudentId, 60, "2026-07-02T09:00:00.000Z"),
            attempt(repeatedStudentId, 90, "2026-07-02T10:00:00.000Z"),
            attempt("507f1f77bcf86cd799439022", 80, "2026-07-02T11:00:00.000Z"),
        ]);

        expect(rows).toHaveLength(2);
        expect(rows[0]).toMatchObject({
            studentRef: repeatedStudentId,
            bestPercentage: 90,
            attemptCount: 2,
        });
    });
});

describe("OfficialTestRankingService", () => {
    it("bloqueia aluno antes de consultar disciplina", async () => {
        const { attemptModel, subjectsService, testModel, service } = makeService();

        await expect(
            service.listForTeacher(student, subjectId, testId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubjectForHistory).not.toHaveBeenCalled();
        expect(testModel.findOne).not.toHaveBeenCalled();
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("bloqueia professor sem ownership antes de consultar teste", async () => {
        const { attemptModel, subjectsService, testModel, service } = makeService();
        subjectsService.findOwnedSubjectForHistory.mockRejectedValueOnce(
            new NotFoundException({
                code: "SUBJECT_NOT_FOUND",
                message: "Disciplina não encontrada.",
            }),
        );

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(testModel.findOne).not.toHaveBeenCalled();
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("devolve ranking minimizado para professor autorizado", async () => {
        const { service } = makeService();

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).resolves.toEqual({
            testId,
            subjectId,
            classId,
            policy: "BEST_ATTEMPT",
            rows: [
                expect.objectContaining({
                    position: 1,
                    displayName: "Aluno 9023",
                    bestPercentage: 90,
                }),
                expect.objectContaining({
                    position: 2,
                    displayName: "Aluno 9022",
                    bestPercentage: 80,
                }),
            ],
        });
    });

    it("bloqueia teste inexistente antes de listar tentativas", async () => {
        const { attemptModel, testModel, service } = makeService();
        testModel.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue(null),
        });

        await expect(
            service.listForTeacher(teacher, subjectId, testId),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("agrega mini-testes do aluno com BEST_ATTEMPT e sem respostas", async () => {
        const targetStudentId = "507f1f77bcf86cd799439021";
        const { attemptModel, service, testModel } = makeService();
        testModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        _id: testId,
                        subjectId,
                        classId,
                        teacherId: teacher.id,
                        title: "Funções",
                        status: "PUBLISHED",
                    },
                    {
                        _id: secondTestId,
                        subjectId,
                        classId,
                        teacherId: teacher.id,
                        title: "Equações",
                        status: "CLOSED",
                    },
                ]),
            }),
        });
        attemptModel.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        ...attempt(targetStudentId, 60, "2026-07-02T09:00:00.000Z"),
                        _id: "507f1f77bcf86cd799439031",
                        testId,
                    },
                    {
                        ...attempt(targetStudentId, 90, "2026-07-02T10:00:00.000Z"),
                        _id: "507f1f77bcf86cd799439032",
                        testId,
                    },
                ]),
            }),
        });

        const result = await service.listStudentResultsForTeacher(
            teacher,
            classId,
            targetStudentId,
        );

        expect(result).toEqual([
            {
                testId,
                subjectId,
                subjectName: "Matemática",
                title: "Funções",
                status: "PUBLISHED",
                bestAttempt: {
                    correctAnswers: 9,
                    totalQuestions: 10,
                    percentage: 90,
                    attemptCount: 2,
                    answeredAt: "2026-07-02T10:00:00.000Z",
                },
            },
            {
                testId: secondTestId,
                subjectId,
                subjectName: "Matemática",
                title: "Equações",
                status: "CLOSED",
                bestAttempt: null,
            },
        ]);
        expect(JSON.stringify(result)).not.toMatch(
            /selectedOptionIndexes|correctOptionIndex|results/,
        );
    });
});

/**
 * Cria tentativa para testar ordenação sem base de dados real.
 *
 * @param studentId Aluno da tentativa.
 * @param percentage Percentagem obtida.
 * @param answeredAt Data ISO da submissão.
 * @returns Tentativa compatível com o helper de ranking.
 */
function attempt(studentId: string, percentage: number, answeredAt: string) {
    return {
        studentId,
        correctAnswers: percentage / 10,
        totalQuestions: 10,
        percentage,
        answeredAt: new Date(answeredAt),
    };
}

/**
 * Cria service com dependências observáveis para testar autorização e queries.
 *
 * @returns Service e duplos de modelos.
 */
function makeService() {
    const testModel = {
        find: jest.fn(),
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: testId,
                subjectId,
                classId,
            }),
        }),
    };
    const attemptModel = {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    attempt("507f1f77bcf86cd799439022", 80, "2026-07-02T10:05:00.000Z"),
                    attempt("507f1f77bcf86cd799439023", 90, "2026-07-02T10:00:00.000Z"),
                ]),
            }),
        }),
    };
    const subjectsService = {
        findOwnedSubjectForHistory: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
        listTeacherClassSubjects: jest.fn().mockResolvedValue([
            {
                _id: subjectId,
                classId,
                teacherId: teacher.id,
                name: "Matemática",
                code: "MAT",
            },
        ]),
    };
    const service = new OfficialTestRankingService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
