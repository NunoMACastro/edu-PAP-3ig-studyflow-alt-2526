/**
 * Testa alertas docentes de acompanhamento, incluindo previews sem efeitos secundários.
 */
import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SchoolClassView } from "../classes/classes.service.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";

const teacher: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439010",
    email: "professor@example.test",
    role: "TEACHER",
};
const student: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439099",
    email: "aluno@example.test",
    role: "STUDENT",
};
const classId = "507f1f77bcf86cd799439011";
const foreignClassId = "507f1f77bcf86cd799439015";
const ruleId = "507f1f77bcf86cd799439012";
const activeStudentId = "507f1f77bcf86cd799439013";
const inactiveStudentId = "507f1f77bcf86cd799439014";

describe("FollowUpAlertsService", () => {
    it("envia alertas apenas para alunos inativos calculados no backend", async () => {
        const { notificationsService, service } = makeService();

        await expect(service.run(teacher, ruleId)).resolves.toMatchObject({
            inactiveStudentIds: [inactiveStudentId],
            notification: { id: "notification-1" },
        });

        expect(notificationsService.createForRecipients).toHaveBeenCalledWith(
            teacher,
            expect.objectContaining({
                contextType: "CLASS",
                contextId: classId,
                type: "FOLLOW_UP",
            }),
            [inactiveStudentId],
        );
    });

    it("bloqueia summary para utilizadores que não são professores", async () => {
        const { ruleModel, service } = makeService();

        await expect(service.summary(student)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(ruleModel.find).not.toHaveBeenCalled();
    });

    it("resume apenas regras das turmas do professor e não envia notificações", async () => {
        const { classesService, notificationsService, ruleModel, service } = makeService({
            classes: [makeClass()],
            rules: [makeRule(ruleId, classId), makeRule("507f1f77bcf86cd799439016", foreignClassId)],
        });

        await expect(service.summary(teacher)).resolves.toEqual({
            rules: [
                {
                    id: ruleId,
                    classId,
                    className: "12.º A",
                    inactiveDays: 7,
                    title: "Acompanhamento",
                    message: "Volta ao estudo.",
                    inactiveStudentsCount: 1,
                    inactiveStudents: [
                        {
                            studentId: inactiveStudentId,
                            displayName: "inativo@example.test",
                            email: "inativo@example.test",
                        },
                    ],
                },
            ],
        });
        expect(classesService.listTeacherClasses).toHaveBeenCalledWith(teacher);
        expect(ruleModel.find).toHaveBeenCalledWith({
            teacherId: new Types.ObjectId(teacher.id),
        });
        expect(notificationsService.createForRecipients).not.toHaveBeenCalled();
    });

    it("calcula preview para turmas já autorizadas sem voltar a listar turmas", async () => {
        const { classesService, service } = makeService({
            classes: [makeClass()],
            rules: [makeRule(ruleId, classId)],
        });

        const summary = await service.summaryForClasses(teacher, [makeClass()]);

        expect(summary.rules[0]).toMatchObject({
            id: ruleId,
            inactiveStudentsCount: 1,
        });
        expect(classesService.listTeacherClasses).not.toHaveBeenCalled();
    });

    it("não faz queries de eventos quando a turma não tem alunos", async () => {
        const { eventModel, service } = makeService({
            classes: [makeClass({ studentIds: [], students: [] })],
            rules: [makeRule(ruleId, classId)],
        });

        await expect(service.summary(teacher)).resolves.toMatchObject({
            rules: [{ inactiveStudentsCount: 0, inactiveStudents: [] }],
        });
        expect(eventModel.find).not.toHaveBeenCalled();
    });
});

type MakeServiceOptions = {
    classes?: SchoolClassView[];
    rules?: RuleFixture[];
    ownedClass?: Pick<SchoolClassView, "_id" | "studentIds">;
    activeStudentIds?: string[];
};

type RuleFixture = {
    _id: string;
    teacherId: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
};

/**
 * Executa o apoio de teste para alertas de acompanhamento, mantendo o cenário legível e próximo do comportamento real validado.
 *
 * @param options Dados opcionais para moldar cada cenário.
 * @returns Service e mocks relevantes.
 */
function makeService(options: MakeServiceOptions = {}) {
    const rules = options.rules ?? [makeRule(ruleId, classId)];
    const ruleModel = {
        findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(rules[0]),
        }),
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(rules),
            }),
        }),
    };
    const activeStudentIds = options.activeStudentIds ?? [activeStudentId];
    const eventModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(
                    activeStudentIds.map((studentId) => ({
                        userId: new Types.ObjectId(studentId),
                    })),
                ),
            }),
        }),
    };
    const classesService = {
        findOwnedClass: jest.fn().mockResolvedValue(
            options.ownedClass ?? {
                _id: classId,
                studentIds: [activeStudentId, inactiveStudentId],
            },
        ),
        listTeacherClasses: jest.fn().mockResolvedValue(options.classes ?? [makeClass()]),
    };
    const notificationsService = {
        createForRecipients: jest.fn().mockResolvedValue({ id: "notification-1" }),
    };
    return {
        classesService,
        eventModel,
        notificationsService,
        ruleModel,
        service: new FollowUpAlertsService(
            ruleModel as never,
            eventModel as never,
            classesService as never,
            notificationsService as never,
        ),
    };
}

/**
 * Cria uma regra persistida simplificada.
 *
 * @param targetRuleId Identificador da regra.
 * @param targetClassId Turma associada.
 * @returns Regra de fixture.
 */
function makeRule(targetRuleId: string, targetClassId: string): RuleFixture {
    return {
        _id: targetRuleId,
        teacherId: teacher.id,
        classId: targetClassId,
        inactiveDays: 7,
        title: "Acompanhamento",
        message: "Volta ao estudo.",
    };
}

/**
 * Cria turma pública com alunos suficientes para validar o cálculo de inatividade.
 *
 * @param input Campos a sobrepor na fixture.
 * @returns Turma pública.
 */
function makeClass(input: Partial<SchoolClassView> = {}): SchoolClassView {
    return {
        _id: classId,
        teacherId: teacher.id,
        name: "12.º A",
        code: "12A",
        schoolYear: "2025/2026",
        studentIds: [activeStudentId, inactiveStudentId],
        students: [
            { id: activeStudentId, email: "ativo@example.test" },
            { id: inactiveStudentId, email: "inativo@example.test" },
        ],
        ...input,
    };
}
