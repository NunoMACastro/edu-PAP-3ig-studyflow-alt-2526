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

    it("mantém regras de turmas arquivadas fora do acompanhamento acionável", async () => {
        const { classLearningActivityService, service } = makeService({
            classes: [makeClass({ status: "ARCHIVED" })],
            rules: [makeRule(ruleId, classId)],
        });

        await expect(service.summary(teacher)).resolves.toEqual({ rules: [] });
        expect(
            classLearningActivityService.findInactiveStudentIds,
        ).not.toHaveBeenCalled();
    });

    it("não pede atividade quando a turma não tem alunos", async () => {
        const { classLearningActivityService, service } = makeService({
            classes: [makeClass({ studentIds: [], students: [] })],
            rules: [makeRule(ruleId, classId)],
        });

        await expect(service.summary(teacher)).resolves.toMatchObject({
            rules: [{ inactiveStudentsCount: 0, inactiveStudents: [] }],
        });
        expect(
            classLearningActivityService.findInactiveStudentIds,
        ).toHaveBeenCalledWith({
            classId,
            studentIds: [],
            inactiveDays: 7,
        });
    });

    it("lista resultados oficiais apenas depois de validar turma e aluno", async () => {
        const { classesService, officialTestRankingService, service } = makeService();

        await expect(
            service.listStudentOfficialTests(teacher, classId, inactiveStudentId),
        ).resolves.toEqual([{ testId: "official-test" }]);
        expect(classesService.ensureOwnedClassStudent).toHaveBeenCalledWith(
            teacher.id,
            classId,
            inactiveStudentId,
        );
        expect(
            officialTestRankingService.listStudentResultsForTeacher,
        ).toHaveBeenCalledWith(teacher, classId, inactiveStudentId);
    });

    it("notifica apenas o aluno escolhido e preserva contagens de supressão", async () => {
        const { classesService, notificationsService, service } = makeService();
        notificationsService.createForRecipients.mockResolvedValueOnce({
            id: "notification-suppressed",
            recipientCount: 0,
            suppressedRecipientCount: 1,
        });

        await expect(
            service.notifyStudent(teacher, classId, inactiveStudentId, {
                title: " Acompanhamento ",
                message: " Precisas de ajuda com o estudo? ",
            }),
        ).resolves.toMatchObject({
            recipientCount: 0,
            suppressedRecipientCount: 1,
        });
        expect(classesService.ensureOwnedClassStudent).toHaveBeenCalledWith(
            teacher.id,
            classId,
            inactiveStudentId,
        );
        expect(notificationsService.createForRecipients).toHaveBeenCalledWith(
            teacher,
            {
                contextType: "CLASS",
                contextId: classId,
                type: "FOLLOW_UP",
                title: "Acompanhamento",
                body: "Precisas de ajuda com o estudo?",
            },
            [inactiveStudentId],
        );
    });

    it("bloqueia detalhe individual antes de consultar dados para não professores", async () => {
        const { classesService, officialTestRankingService, service } = makeService();

        await expect(
            service.listStudentOfficialTests(student, classId, inactiveStudentId),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(classesService.ensureOwnedClassStudent).not.toHaveBeenCalled();
        expect(
            officialTestRankingService.listStudentResultsForTeacher,
        ).not.toHaveBeenCalled();
    });

    it("consolida atividade, salas, testes e quizzes sem criar score de risco", async () => {
        const {
            approvedAttemptModel,
            classLearningActivityService,
            guidedParticipationModel,
            guidedRoomModel,
            officialTestRankingService,
            service,
        } = makeService();
        classLearningActivityService.getStudentSummary.mockResolvedValueOnce({
            joinedAt: new Date("2026-06-01T10:00:00.000Z"),
            firstActivityAt: new Date("2026-06-02T10:00:00.000Z"),
            lastActivityAt: new Date("2026-07-10T10:00:00.000Z"),
            lastActivityType: "OFFICIAL_TEST_ATTEMPT",
            activityCount: 5,
            current30DaysCount: 1,
            previous30DaysCount: 3,
            trend: "LESS",
            byType: { OFFICIAL_TEST_ATTEMPT: 2 },
            recent: [],
        });
        officialTestRankingService.listStudentResultsForTeacher.mockResolvedValueOnce([
            {
                testId: "test-1",
                subjectId: "subject-1",
                subjectName: "Matemática",
                title: "Teste",
                status: "PUBLISHED",
                bestAttempt: {
                    correctAnswers: 4,
                    totalQuestions: 10,
                    percentage: 40,
                    attemptCount: 1,
                    answeredAt: "2026-07-10T10:00:00.000Z",
                },
            },
        ]);
        guidedRoomModel.countDocuments.mockResolvedValueOnce(2);
        guidedParticipationModel.find.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    { status: "COMPLETED", lastViewedAt: new Date("2026-07-09T10:00:00.000Z") },
                ]),
            }),
        });
        approvedAttemptModel.find.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        reviewId: "review-1",
                        scorePercent: 80,
                        answeredAt: new Date("2026-07-08T10:00:00.000Z"),
                    },
                ]),
            }),
        });

        const overview = await service.getStudentOverview(
            teacher,
            classId,
            inactiveStudentId,
        );

        expect(overview).toMatchObject({
            activity: { activityCount: 5, trend: "LESS" },
            guidedRooms: { totalRooms: 2, completedRooms: 1 },
            officialTests: { totalTests: 1, averageBestPercentage: 40 },
            approvedAiQuizzes: { attemptCount: 1, bestScorePercent: 80 },
        });
        expect(overview).not.toHaveProperty("riskScore");
        expect(guidedRoomModel.countDocuments).toHaveBeenCalledWith({
            classId: new Types.ObjectId(classId),
            $or: [
                { status: "OPEN" },
                { createdAt: { $gte: new Date("2026-06-01T10:00:00.000Z") } },
                { closedAt: { $gte: new Date("2026-06-01T10:00:00.000Z") } },
            ],
        });
        expect(guidedParticipationModel.find).toHaveBeenCalledWith({
            classId: new Types.ObjectId(classId),
            studentId: new Types.ObjectId(inactiveStudentId),
            lastViewedAt: { $gte: new Date("2026-06-01T10:00:00.000Z") },
        });
        expect(overview.factualSignals.map((signal) => signal.code)).toEqual(
            expect.arrayContaining([
                "LOWER_ACTIVITY_LAST_30_DAYS",
                "OFFICIAL_TESTS_BELOW_HALF",
                "GUIDED_ROOMS_NOT_COMPLETED",
            ]),
        );
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
    const classLearningActivityService = {
        findInactiveStudentIds: jest.fn().mockImplementation(
            ({ studentIds }: { studentIds: string[] }) =>
                Promise.resolve(
                    studentIds.filter((studentId) =>
                        !activeStudentIds.includes(studentId),
                    ),
                ),
        ),
        getStudentSummary: jest.fn(),
    };
    const ownedClass = options.ownedClass
        ? { ...makeClass(), ...options.ownedClass }
        : makeClass();
    const classesService = {
        ensureOwnedClassStudent: jest.fn().mockResolvedValue(
            ownedClass,
        ),
        findOwnedClass: jest.fn().mockResolvedValue(ownedClass),
        findOwnedActiveClass: jest.fn().mockResolvedValue(ownedClass),
        listOwnedClassStudentsIncluding: jest.fn().mockResolvedValue(
            ownedClass.students ?? [],
        ),
        listTeacherClasses: jest.fn().mockResolvedValue(options.classes ?? [makeClass()]),
    };
    const notificationsService = {
        createForRecipients: jest.fn().mockResolvedValue({ id: "notification-1" }),
    };
    const officialTestRankingService = {
        listStudentResultsForTeacher: jest
            .fn()
            .mockResolvedValue([{ testId: "official-test" }]),
    };
    const approvedAttemptModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
        }),
    };
    const guidedRoomModel = { countDocuments: jest.fn().mockResolvedValue(0) };
    const guidedParticipationModel = {
        find: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
        }),
    };
    return {
        classesService,
        classLearningActivityService,
        notificationsService,
        officialTestRankingService,
        ruleModel,
        service: new FollowUpAlertsService(
            ruleModel as never,
            classesService as never,
            notificationsService as never,
            officialTestRankingService as never,
            classLearningActivityService as never,
            approvedAttemptModel as never,
            guidedRoomModel as never,
            guidedParticipationModel as never,
        ),
        approvedAttemptModel,
        guidedRoomModel,
        guidedParticipationModel,
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
