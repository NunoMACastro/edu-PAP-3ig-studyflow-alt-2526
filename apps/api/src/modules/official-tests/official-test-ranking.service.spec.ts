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
});

describe("OfficialTestRankingService", () => {
    it("bloqueia aluno antes de consultar disciplina", async () => {
        const { attemptModel, subjectsService, testModel, service } = makeService();

        await expect(
            service.listForTeacher(student, subjectId, testId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(subjectsService.findOwnedSubject).not.toHaveBeenCalled();
        expect(testModel.findOne).not.toHaveBeenCalled();
        expect(attemptModel.find).not.toHaveBeenCalled();
    });

    it("bloqueia professor sem ownership antes de consultar teste", async () => {
        const { attemptModel, subjectsService, testModel, service } = makeService();
        subjectsService.findOwnedSubject.mockRejectedValueOnce(
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
            rows: [
                expect.objectContaining({
                    position: 1,
                    displayName: "Aluno 9023",
                    percentage: 90,
                }),
                expect.objectContaining({
                    position: 2,
                    displayName: "Aluno 9022",
                    percentage: 80,
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
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
    };
    const service = new OfficialTestRankingService(
        testModel as never,
        attemptModel as never,
        subjectsService as never,
    );
    return { attemptModel, subjectsService, testModel, service };
}
