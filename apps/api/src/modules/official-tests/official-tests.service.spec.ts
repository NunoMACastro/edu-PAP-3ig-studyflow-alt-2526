/**
 * Testa o comportamento de testes oficiais e documenta os cenários de aceitação automatizados.
 */
import { BadRequestException, ForbiddenException } from "@nestjs/common";
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
});

/**
 * Executa a operação valid input no domínio de testes oficiais com contrato explícito.
 * @returns Valor de testes oficiais no contrato esperado pelo chamador.
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
 * @returns Valor de testes oficiais no contrato esperado pelo chamador.
 */
function makeService() {
    const test = {
        _id: testId,
        subjectId,
        classId,
        teacherId: teacher.id,
        title: "Mini-teste",
        status: "DRAFT",
        questions: [{ statement: "Pergunta?", options: ["A", "B", "C", "D"], correctOptionIndex: 1 }],
    };
    const testModel = {
        create: jest.fn().mockResolvedValue({ toObject: () => test }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([test]),
            }),
        }),
        countDocuments: jest.fn().mockResolvedValue(1),
    };
    const subjectsService = {
        findOwnedSubject: jest.fn().mockResolvedValue({
            _id: subjectId,
            classId,
        }),
    };
    const service = new OfficialTestsService(
        testModel as never,
        subjectsService as never,
    );
    return { subjectsService, testModel, service };
}
