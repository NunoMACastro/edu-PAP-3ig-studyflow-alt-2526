/**
 * Testa o dashboard docente agregado e documenta os cenários de aceitação automatizados.
 */
import { ForbiddenException } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SchoolClassView } from "../classes/classes.service.js";
import { TeacherDashboardService } from "./teacher-dashboard.service.js";

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

const admin: AuthenticatedUser = {
    id: "507f1f77bcf86cd799439018",
    email: "admin@example.test",
    role: "ADMIN",
};

const classAId = "507f1f77bcf86cd799439014";
const classBId = "507f1f77bcf86cd799439015";
const subjectAId = "507f1f77bcf86cd799439016";
const subjectBId = "507f1f77bcf86cd799439017";
const inactiveStudentId = "507f1f77bcf86cd799439030";

describe("TeacherDashboardService", () => {
    it("devolve dashboard vazio para professor sem turmas", async () => {
        const { classesService, followUpAlertsService, progressService, service } = makeService({
            classes: [],
        });

        await expect(service.getDashboard(teacher)).resolves.toEqual({
            totals: {
                classes: 0,
                students: 0,
                subjects: 0,
                officialMaterials: 0,
                publishedTests: 0,
                pendingAiReviews: 0,
                approvedAiReviews: 0,
                posts: 0,
                progressNotes: 0,
                followUpRules: 0,
                inactiveStudents: 0,
            },
            attention: {
                classesWithoutSubjects: 0,
                classesWithoutMaterials: 0,
                classesWithLowActivity: 0,
                classesWithoutFollowUpRules: 0,
                pendingAiReviews: 0,
                inactiveStudents: 0,
            },
            followUp: {
                rulesCount: 0,
                classesWithRules: 0,
                classesWithoutRules: 0,
                inactiveStudentsCount: 0,
            },
            classes: [],
            gaps: [
                "O progresso de aprendizagem por submissoes/resultados ainda nao tem contrato de dados nesta macrofase; o dashboard agrega sinais de acompanhamento docente.",
            ],
        });
        expect(classesService.listTeacherClasses).toHaveBeenCalledWith(teacher);
        expect(followUpAlertsService.summaryForClasses).toHaveBeenCalledWith(
            teacher,
            [],
        );
        expect(progressService.getClassProgress).not.toHaveBeenCalled();
    });

    it("agrega várias turmas sem expor alunos individuais", async () => {
        const { materialsService, reviewsService, service } = makeService({
            classes: [
                makeClass(classAId, "12.º A", 3),
                makeClass(classBId, "12.º B", 0),
            ],
            subjectsByClass: {
                [classAId]: [
                    makeSubject(subjectAId, classAId, "Matemática", "MAT"),
                    makeSubject(subjectBId, classAId, "Português", "POR"),
                ],
                [classBId]: [],
            },
            progressByClass: {
                [classAId]: makeProgress({
                    classId: classAId,
                    className: "12.º A",
                    studentsCount: 3,
                    subjectsCount: 2,
                    publishedTestsCount: 3,
                    approvedAiContentCount: 4,
                    postCount: 5,
                    noteCount: 1,
                    activitySignalTotal: 13,
                    activityCoveragePercent: 100,
                    difficultyTags: ["derivadas"],
                }),
                [classBId]: makeProgress({
                    classId: classBId,
                    className: "12.º B",
                    studentsCount: 0,
                    subjectsCount: 0,
                    publishedTestsCount: 0,
                    approvedAiContentCount: 0,
                    postCount: 0,
                    noteCount: 0,
                    activitySignalTotal: 0,
                    activityCoveragePercent: 0,
                    difficultyTags: [],
                }),
            },
            materialsBySubject: {
                [subjectAId]: 4,
                [subjectBId]: 2,
            },
            testsBySubject: {
                [subjectAId]: 1,
                [subjectBId]: 2,
            },
            pendingReviewsBySubject: {
                [subjectAId]: 2,
            },
            guidedRoomsByClass: {
                [classAId]: {
                    open: 2,
                    closed: 1,
                    bySubjectId: {
                        [subjectAId]: { open: 1, closed: 1 },
                        [subjectBId]: { open: 1, closed: 0 },
                    },
                },
            },
            followUpSummary: {
                rules: [
                    makeFollowUpRule("507f1f77bcf86cd799439040", classAId, [
                        inactiveStudentId,
                    ]),
                    makeFollowUpRule("507f1f77bcf86cd799439041", classAId, [
                        inactiveStudentId,
                    ]),
                ],
            },
        });

        const dashboard = await service.getDashboard(teacher);

        expect(dashboard.totals).toEqual({
            classes: 2,
            students: 3,
            subjects: 2,
            officialMaterials: 6,
            publishedTests: 3,
            pendingAiReviews: 2,
            approvedAiReviews: 4,
            posts: 5,
            progressNotes: 1,
            followUpRules: 2,
            inactiveStudents: 1,
        });
        expect(dashboard.attention).toEqual({
            classesWithoutSubjects: 1,
            classesWithoutMaterials: 1,
            classesWithLowActivity: 1,
            classesWithoutFollowUpRules: 1,
            pendingAiReviews: 2,
            inactiveStudents: 1,
        });
        expect(dashboard.followUp).toEqual({
            rulesCount: 2,
            classesWithRules: 1,
            classesWithoutRules: 1,
            inactiveStudentsCount: 1,
        });
        expect(dashboard.classes[0]).toMatchObject({
            classId: classAId,
            className: "12.º A",
            officialMaterialsCount: 6,
            pendingAiReviewsCount: 2,
            followUpRulesCount: 2,
            inactiveStudentsCount: 1,
            activityScorePercent: 100,
            activityStatus: "ALTA",
            activityBasis: [
                "DISCIPLINES",
                "OFFICIAL_MATERIALS",
                "PUBLISHED_TESTS",
                "POSTS",
                "PROGRESS_NOTES",
                "APPROVED_AI_CONTENT",
                "FOLLOW_UP_RULES",
            ],
            difficultyTags: ["derivadas"],
            openGuidedRoomsCount: 2,
            closedGuidedRoomsCount: 1,
            subjects: [
                {
                    subjectId: subjectAId,
                    subjectName: "Matemática",
                    subjectCode: "MAT",
                    officialMaterialsCount: 4,
                    publishedTestsCount: 1,
                    pendingAiReviewsCount: 2,
                    openGuidedRoomsCount: 1,
                    closedGuidedRoomsCount: 1,
                },
                {
                    subjectId: subjectBId,
                    subjectName: "Português",
                    subjectCode: "POR",
                    officialMaterialsCount: 2,
                    publishedTestsCount: 2,
                    pendingAiReviewsCount: 0,
                    openGuidedRoomsCount: 1,
                    closedGuidedRoomsCount: 0,
                },
            ],
        });
        expect(dashboard.classes[1]).toMatchObject({
            classId: classBId,
            followUpRulesCount: 0,
            inactiveStudentsCount: 0,
            openGuidedRoomsCount: 0,
            closedGuidedRoomsCount: 0,
            activityScorePercent: 0,
            activityStatus: "SEM_BASE",
            activityBasis: [],
            subjects: [],
        });
        expect(dashboard.classes[0]).not.toHaveProperty("studentIds");
        expect(materialsService.countBySubjectIdsGrouped).toHaveBeenCalledWith([]);
        expect(reviewsService.countPendingBySubjectIdsGrouped).toHaveBeenCalledWith(
            [],
        );
    });

    it("bloqueia alunos antes de consultar turmas", async () => {
        const { classesService, service } = makeService({
            classes: [makeClass(classAId, "12.º A", 1)],
        });

        await expect(service.getDashboard(student)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(classesService.listTeacherClasses).not.toHaveBeenCalled();
    });

    it("bloqueia admins antes de consultar turmas", async () => {
        const { classesService, service } = makeService({
            classes: [makeClass(classAId, "12.º A", 1)],
        });

        await expect(service.getDashboard(admin)).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        expect(classesService.listTeacherClasses).not.toHaveBeenCalled();
    });
});

type MakeServiceOptions = {
    classes: SchoolClassView[];
    progressByClass?: Record<string, ProgressFixture>;
    subjectsByClass?: Record<string, SubjectFixture[]>;
    materialsBySubject?: Record<string, number>;
    testsBySubject?: Record<string, number>;
    pendingReviewsBySubject?: Record<string, number>;
    guidedRoomsByClass?: Record<string, GuidedRoomsFixture>;
    followUpSummary?: FollowUpSummaryFixture;
};

type SubjectFixture = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
};

type GuidedRoomsFixture = {
    open: number;
    closed: number;
    bySubjectId: Record<string, { open: number; closed: number }>;
};

type FollowUpSummaryFixture = {
    rules: Array<{
        id: string;
        classId: string;
        className: string;
        inactiveDays: number;
        title: string;
        message: string;
        inactiveStudentsCount: number;
        inactiveStudents: Array<{ studentId: string; displayName: string; email?: string }>;
    }>;
};

type ProgressFixture = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    postCount: number;
    noteCount: number;
    learningProgressPercent: null;
    learningProgressStatus: "PENDING_RESULTS_CONTRACT";
    activitySignalTotal: number;
    activityCoveragePercent: number;
    metricsBasis: "ACTIVITY_SIGNALS";
    difficultyTags: string[];
    notes: unknown[];
    gaps: string[];
};

/**
 * Cria o service com doubles explícitos para manter os cenários de dashboard legíveis.
 *
 * @param options Dados de fixture para as dependências do dashboard.
 * @returns Service e mocks relevantes.
 */
function makeService(options: MakeServiceOptions) {
    const classesService = {
        listTeacherClasses: jest.fn().mockResolvedValue(options.classes),
    };
    const subjectsService = {
        listTeacherClassSubjects: jest.fn(
            (_actor: AuthenticatedUser, classId: string) =>
                Promise.resolve(options.subjectsByClass?.[classId] ?? []),
        ),
    };
    const progressService = {
        getClassProgress: jest.fn(
            (_actor: AuthenticatedUser, classId: string) =>
                Promise.resolve(
                    options.progressByClass?.[classId] ??
                        makeProgress({
                            classId,
                            className: "Turma",
                        }),
                ),
        ),
    };
    const materialsService = {
        countBySubjectIdsGrouped: jest.fn((subjectIds: string[]) =>
            Promise.resolve(pickSubjectCounts(subjectIds, options.materialsBySubject)),
        ),
    };
    const testsService = {
        countPublishedBySubjectIdsGrouped: jest.fn((subjectIds: string[]) =>
            Promise.resolve(pickSubjectCounts(subjectIds, options.testsBySubject)),
        ),
    };
    const reviewsService = {
        countPendingBySubjectIdsGrouped: jest.fn((subjectIds: string[]) =>
            Promise.resolve(
                pickSubjectCounts(subjectIds, options.pendingReviewsBySubject),
            ),
        ),
    };
    const followUpAlertsService = {
        summaryForClasses: jest.fn().mockResolvedValue(
            options.followUpSummary ?? {
                rules: [],
            },
        ),
    };
    const guidedStudyRoomsService = {
        countByClassAndSubjectIds: jest.fn(
            (_classId: string, subjectIds: string[]) =>
                Promise.resolve(
                    options.guidedRoomsByClass?.[_classId] ??
                        makeEmptyGuidedRooms(subjectIds),
                ),
        ),
    };
    const service = new TeacherDashboardService(
        classesService as never,
        subjectsService as never,
        progressService as never,
        materialsService as never,
        testsService as never,
        reviewsService as never,
        followUpAlertsService as never,
        guidedStudyRoomsService as never,
    );
    return {
        classesService,
        followUpAlertsService,
        materialsService,
        progressService,
        reviewsService,
        service,
        subjectsService,
        testsService,
        guidedStudyRoomsService,
    };
}

/**
 * Seleciona contagens por disciplina, devolvendo mapa vazio quando não há ids.
 *
 * @param subjectIds Disciplinas pedidas pelo dashboard.
 * @param source Mapa de fixture com contagens conhecidas.
 * @returns Mapa filtrado por disciplina.
 */
function pickSubjectCounts(
    subjectIds: string[],
    source: Record<string, number> = {},
): Record<string, number> {
    return Object.fromEntries(
        subjectIds
            .filter((subjectId) => source[subjectId] !== undefined)
            .map((subjectId) => [subjectId, source[subjectId]]),
    );
}

/**
 * Cria contagens vazias de salas guiadas por disciplina.
 *
 * @param subjectIds Disciplinas da turma.
 * @returns Contagens vazias para turma sem salas.
 */
function makeEmptyGuidedRooms(subjectIds: string[]): GuidedRoomsFixture {
    return {
        open: 0,
        closed: 0,
        bySubjectId: Object.fromEntries(
            subjectIds.map((subjectId) => [subjectId, { open: 0, closed: 0 }]),
        ),
    };
}

/**
 * Cria uma regra de acompanhamento para validar agregações sem expor alunos no dashboard.
 *
 * @param ruleId Identificador da regra.
 * @param targetClassId Turma associada.
 * @param inactiveStudentIds Alunos detetados como inativos pela regra.
 * @returns Regra de fixture semelhante ao summary real.
 */
function makeFollowUpRule(
    ruleId: string,
    targetClassId: string,
    inactiveStudentIds: string[],
): FollowUpSummaryFixture["rules"][number] {
    return {
        id: ruleId,
        classId: targetClassId,
        className: "12.º A",
        inactiveDays: 7,
        title: "Acompanhamento",
        message: "Há alunos sem atividade recente.",
        inactiveStudentsCount: inactiveStudentIds.length,
        inactiveStudents: inactiveStudentIds.map((studentId) => ({
            studentId,
            displayName: `Aluno ${studentId.slice(-4)}`,
        })),
    };
}

/**
 * Cria uma turma pública sem depender de Mongoose.
 *
 * @param classId Identificador da turma.
 * @param name Nome da turma.
 * @param studentsCount Número de alunos simulados.
 * @returns Turma pública para o teste.
 */
function makeClass(
    classId: string,
    name: string,
    studentsCount: number,
): SchoolClassView {
    return {
        _id: classId,
        teacherId: teacher.id,
        name,
        code: name.replace(/\W/g, "").toUpperCase(),
        schoolYear: "2025/2026",
        studentIds: Array.from({ length: studentsCount }, (_value, index) =>
            `507f1f77bcf86cd7994390${20 + index}`,
        ),
    };
}

/**
 * Cria uma disciplina pública para o detalhe colapsável da turma.
 *
 * @param id Identificador da disciplina.
 * @param targetClassId Turma associada.
 * @param name Nome legível.
 * @param code Código curto.
 * @returns Disciplina pública de fixture.
 */
function makeSubject(
    id: string,
    targetClassId: string,
    name: string,
    code: string,
): SubjectFixture {
    return {
        _id: id,
        classId: targetClassId,
        teacherId: teacher.id,
        name,
        code,
    };
}

/**
 * Cria progresso de turma usando o contrato atual de sinais de acompanhamento.
 *
 * @param input Campos a sobrepor na fixture.
 * @returns Progresso público semelhante ao service real.
 */
function makeProgress(input: Partial<ProgressFixture>): ProgressFixture {
    return {
        classId: classAId,
        className: "12.º A",
        studentsCount: 0,
        subjectsCount: 0,
        publishedTestsCount: 0,
        approvedAiContentCount: 0,
        postCount: 0,
        noteCount: 0,
        learningProgressPercent: null,
        learningProgressStatus: "PENDING_RESULTS_CONTRACT" as const,
        activitySignalTotal: 0,
        activityCoveragePercent: 0,
        metricsBasis: "ACTIVITY_SIGNALS" as const,
        difficultyTags: [],
        notes: [],
        gaps: [],
        ...input,
    };
}
