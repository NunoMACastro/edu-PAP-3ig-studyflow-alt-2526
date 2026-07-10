/**
 * Agrega a visão inicial do professor sem criar métricas pedagógicas fora dos contratos atuais.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "../ai-content-reviews/ai-content-reviews.service.js";
import { ClassProgressService } from "../class-progress/class-progress.service.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import {
    FollowUpAlertsService,
    FollowUpAlertsSummary,
} from "../follow-up-alerts/follow-up-alerts.service.js";
import {
    GuidedStudyRoomCountSummary,
    GuidedStudyRoomsService,
} from "../guided-study-rooms/guided-study-rooms.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { OfficialTestsService } from "../official-tests/official-tests.service.js";
import { SubjectsService, SubjectView } from "../subjects/subjects.service.js";

type ClassProgressView = Awaited<ReturnType<ClassProgressService["getClassProgress"]>>;
type ClassFollowUpAggregate = {
    followUpRulesCount: number;
    inactiveStudentsCount: number;
};

const ACTIVITY_BASIS_TOTAL = 7;

/**
 * Estado operacional calculado a partir de atividade ampla de acompanhamento.
 */
export type TeacherDashboardActivityStatus = "SEM_BASE" | "BAIXA" | "REGULAR" | "ALTA";

/**
 * Totais globais apresentados no dashboard docente.
 */
export type TeacherDashboardTotals = {
    classes: number;
    students: number;
    subjects: number;
    officialMaterials: number;
    publishedTests: number;
    pendingAiReviews: number;
    approvedAiReviews: number;
    posts: number;
    progressNotes: number;
    followUpRules: number;
    inactiveStudents: number;
};

/**
 * Sinais que merecem atenção do professor.
 */
export type TeacherDashboardAttention = {
    classesWithoutSubjects: number;
    classesWithoutMaterials: number;
    classesWithLowActivity: number;
    classesWithoutFollowUpRules: number;
    pendingAiReviews: number;
    inactiveStudents: number;
};

/**
 * Resumo agregado de regras de acompanhamento.
 */
export type TeacherDashboardFollowUp = {
    rulesCount: number;
    classesWithRules: number;
    classesWithoutRules: number;
    inactiveStudentsCount: number;
};

/**
 * Detalhe compacto por disciplina, sem conteúdos, mensagens ou alunos individuais.
 */
export type TeacherDashboardSubjectRow = {
    subjectId: string;
    subjectName: string;
    subjectCode?: string;
    officialMaterialsCount: number;
    publishedTestsCount: number;
    pendingAiReviewsCount: number;
    openGuidedRoomsCount: number;
    closedGuidedRoomsCount: number;
};

/**
 * Linha agregada por turma, sem dados pessoais de alunos.
 */
export type TeacherDashboardClassRow = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    officialMaterialsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    pendingAiReviewsCount: number;
    postCount: number;
    noteCount: number;
    followUpRulesCount: number;
    inactiveStudentsCount: number;
    openGuidedRoomsCount: number;
    closedGuidedRoomsCount: number;
    activitySignalTotal: number;
    activityCoveragePercent: number;
    activityScorePercent: number;
    activityStatus: TeacherDashboardActivityStatus;
    activityBasis: string[];
    difficultyTags: string[];
    subjects: TeacherDashboardSubjectRow[];
};

/**
 * Contrato público do dashboard docente.
 */
export type TeacherDashboardSummary = {
    totals: TeacherDashboardTotals;
    attention: TeacherDashboardAttention;
    followUp: TeacherDashboardFollowUp;
    classes: TeacherDashboardClassRow[];
    gaps: string[];
};

/**
 * Service de dashboard docente, construído sobre services de domínio já existentes.
 */
@Injectable()
export class TeacherDashboardService {
    /**
     * Recebe dependências por injeção para reutilizar autorização, ownership e contagens existentes.
     *
     * @param classesService Service de turmas do professor.
     * @param subjectsService Service de disciplinas oficiais.
     * @param progressService Service de sinais de acompanhamento por turma.
     * @param materialsService Service de materiais oficiais.
     * @param testsService Service de mini-testes oficiais.
     * @param reviewsService Service de curadoria IA.
     * @param followUpAlertsService Service de regras e previews de acompanhamento.
     * @param guidedStudyRoomsService Service de salas guiadas.
     */
    constructor(
        private readonly classesService: ClassesService,
        private readonly subjectsService: SubjectsService,
        private readonly progressService: ClassProgressService,
        private readonly materialsService: OfficialMaterialsService,
        private readonly testsService: OfficialTestsService,
        private readonly reviewsService: AiContentReviewsService,
        private readonly followUpAlertsService: FollowUpAlertsService,
        private readonly guidedStudyRoomsService: GuidedStudyRoomsService,
    ) {}

    /**
     * Constrói o painel inicial do professor autenticado.
     *
     * @param actor Utilizador autenticado vindo da sessão.
     * @returns Dashboard agregado apenas com métricas autorizadas e não sensíveis.
     */
    async getDashboard(
        actor: AuthenticatedUser,
    ): Promise<TeacherDashboardSummary> {
        this.assertTeacher(actor);
        const classes = await this.classesService.listTeacherClasses(actor);
        const followUpSummary = await this.followUpAlertsService.summaryForClasses(
            actor,
            classes,
        );
        const followUpByClass = this.buildFollowUpByClass(followUpSummary);
        const classRows = await Promise.all(
            classes.map((schoolClass) =>
                this.buildClassRow(
                    actor,
                    schoolClass,
                    followUpByClass.get(schoolClass._id),
                ),
            ),
        );
        const totals = this.buildTotals(classRows);
        const followUp = this.buildFollowUpSummary(classRows);

        return {
            totals,
            attention: {
                classesWithoutSubjects: classRows.filter(
                    (row) => row.subjectsCount === 0,
                ).length,
                classesWithoutMaterials: classRows.filter(
                    (row) => row.officialMaterialsCount === 0,
                ).length,
                classesWithLowActivity: classRows.filter(
                    (row) =>
                        row.activityStatus === "SEM_BASE" || row.activityStatus === "BAIXA",
                ).length,
                classesWithoutFollowUpRules: classRows.filter(
                    (row) => row.followUpRulesCount === 0,
                ).length,
                pendingAiReviews: totals.pendingAiReviews,
                inactiveStudents: totals.inactiveStudents,
            },
            followUp,
            classes: classRows,
            gaps: [
                "O progresso de aprendizagem por submissoes/resultados ainda nao tem contrato de dados nesta macrofase; o dashboard agrega sinais de acompanhamento docente.",
            ],
        };
    }

    /**
     * Cria a linha agregada de uma turma sem expor alunos individuais.
     *
     * @param actor Professor autenticado.
     * @param schoolClass Turma já filtrada pelo professor.
     * @returns Linha agregada para a UI.
     */
    private async buildClassRow(
        actor: AuthenticatedUser,
        schoolClass: SchoolClassView,
        followUp?: ClassFollowUpAggregate,
    ): Promise<TeacherDashboardClassRow> {
        const [progress, subjects] = await Promise.all([
            this.progressService.getClassProgress(actor, schoolClass._id),
            this.subjectsService.listTeacherClassSubjects(actor, schoolClass._id),
        ]);
        const subjectIds = subjects.map((subject) => subject._id);
        const [
            materialsBySubject,
            testsBySubject,
            pendingReviewsBySubject,
            guidedRooms,
        ] = await Promise.all([
            this.materialsService.countBySubjectIdsGrouped(subjectIds),
            this.testsService.countPublishedBySubjectIdsGrouped(subjectIds),
            this.reviewsService.countPendingBySubjectIdsGrouped(subjectIds),
            this.guidedStudyRoomsService.countByClassAndSubjectIds(
                schoolClass._id,
                subjectIds,
            ),
        ]);

        return this.toClassRow(
            progress,
            this.sumRecordValues(materialsBySubject),
            this.sumRecordValues(pendingReviewsBySubject),
            followUp ?? { followUpRulesCount: 0, inactiveStudentsCount: 0 },
            guidedRooms,
            this.buildSubjectRows(
                subjects,
                materialsBySubject,
                testsBySubject,
                pendingReviewsBySubject,
                guidedRooms,
            ),
        );
    }

    /**
     * Soma os totais globais a partir das linhas por turma.
     *
     * @param classRows Linhas já calculadas para a resposta.
     * @returns Totais globais do professor.
     */
    private buildTotals(classRows: TeacherDashboardClassRow[]): TeacherDashboardTotals {
        return classRows.reduce<TeacherDashboardTotals>(
            (totals, row) => ({
                classes: totals.classes + 1,
                students: totals.students + row.studentsCount,
                subjects: totals.subjects + row.subjectsCount,
                officialMaterials:
                    totals.officialMaterials + row.officialMaterialsCount,
                publishedTests: totals.publishedTests + row.publishedTestsCount,
                pendingAiReviews:
                    totals.pendingAiReviews + row.pendingAiReviewsCount,
                approvedAiReviews:
                    totals.approvedAiReviews + row.approvedAiContentCount,
                posts: totals.posts + row.postCount,
                progressNotes: totals.progressNotes + row.noteCount,
                followUpRules: totals.followUpRules + row.followUpRulesCount,
                inactiveStudents:
                    totals.inactiveStudents + row.inactiveStudentsCount,
            }),
            {
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
        );
    }

    /**
     * Soma regras e alunos inativos por turma a partir do preview seguro.
     *
     * @param summary Preview de acompanhamento já autorizado.
     * @returns Índice por turma com alunos inativos deduplicados.
     */
    private buildFollowUpByClass(
        summary: FollowUpAlertsSummary,
    ): Map<string, ClassFollowUpAggregate> {
        const draft = new Map<
            string,
            { followUpRulesCount: number; inactiveStudentIds: Set<string> }
        >();

        for (const rule of summary.rules) {
            const current =
                draft.get(rule.classId) ??
                { followUpRulesCount: 0, inactiveStudentIds: new Set<string>() };
            current.followUpRulesCount += 1;
            for (const student of rule.inactiveStudents) {
                current.inactiveStudentIds.add(student.studentId);
            }
            draft.set(rule.classId, current);
        }

        return new Map(
            [...draft.entries()].map(([classId, aggregate]) => [
                classId,
                {
                    followUpRulesCount: aggregate.followUpRulesCount,
                    inactiveStudentsCount: aggregate.inactiveStudentIds.size,
                },
            ]),
        );
    }

    /**
     * Constrói o agregado global de acompanhamento a partir das linhas públicas.
     *
     * @param classRows Linhas já calculadas para a resposta.
     * @returns Resumo de regras de acompanhamento.
     */
    private buildFollowUpSummary(
        classRows: TeacherDashboardClassRow[],
    ): TeacherDashboardFollowUp {
        const classesWithRules = classRows.filter(
            (row) => row.followUpRulesCount > 0,
        ).length;

        return {
            rulesCount: classRows.reduce(
                (total, row) => total + row.followUpRulesCount,
                0,
            ),
            classesWithRules,
            classesWithoutRules: classRows.length - classesWithRules,
            inactiveStudentsCount: classRows.reduce(
                (total, row) => total + row.inactiveStudentsCount,
                0,
            ),
        };
    }

    /**
     * Converte o progresso por turma na forma compacta consumida pelo dashboard.
     *
     * @param progress Métricas já autorizadas pelo ClassProgressService.
     * @param officialMaterialsCount Materiais oficiais associados às disciplinas da turma.
     * @param pendingAiReviewsCount Revisões IA pendentes nas disciplinas da turma.
     * @param followUp Contagens agregadas de regras e alunos inativos.
     * @param guidedRooms Contagens agregadas de salas guiadas.
     * @param subjects Detalhe compacto por disciplina.
     * @returns Linha pública do dashboard.
     */
    private toClassRow(
        progress: ClassProgressView,
        officialMaterialsCount: number,
        pendingAiReviewsCount: number,
        followUp: ClassFollowUpAggregate,
        guidedRooms: GuidedStudyRoomCountSummary,
        subjects: TeacherDashboardSubjectRow[],
    ): TeacherDashboardClassRow {
        const activityBasis = this.buildActivityBasis(
            progress,
            officialMaterialsCount,
            followUp.followUpRulesCount,
        );
        const activityScorePercent = Math.round(
            (activityBasis.length / ACTIVITY_BASIS_TOTAL) * 100,
        );

        return {
            classId: progress.classId,
            className: progress.className,
            studentsCount: progress.studentsCount,
            subjectsCount: progress.subjectsCount,
            officialMaterialsCount,
            publishedTestsCount: progress.publishedTestsCount,
            approvedAiContentCount: progress.approvedAiContentCount,
            pendingAiReviewsCount,
            postCount: progress.postCount,
            noteCount: progress.noteCount,
            followUpRulesCount: followUp.followUpRulesCount,
            inactiveStudentsCount: followUp.inactiveStudentsCount,
            openGuidedRoomsCount: guidedRooms.open,
            closedGuidedRoomsCount: guidedRooms.closed,
            activitySignalTotal: progress.activitySignalTotal,
            activityCoveragePercent: progress.activityCoveragePercent,
            activityScorePercent,
            activityStatus: this.toActivityStatus(activityScorePercent),
            activityBasis,
            difficultyTags: progress.difficultyTags,
            subjects,
        };
    }

    /**
     * Cria linhas por disciplina para a secção colapsável do dashboard.
     *
     * @param subjects Disciplinas já autorizadas para a turma.
     * @param materialsBySubject Contagens de materiais por disciplina.
     * @param testsBySubject Contagens de mini-testes por disciplina.
     * @param pendingReviewsBySubject Contagens de revisões IA pendentes por disciplina.
     * @param guidedRooms Contagens de salas guiadas por turma e disciplina.
     * @returns Linhas compactas, sem conteúdo de materiais, mensagens ou alunos.
     */
    private buildSubjectRows(
        subjects: SubjectView[],
        materialsBySubject: Record<string, number>,
        testsBySubject: Record<string, number>,
        pendingReviewsBySubject: Record<string, number>,
        guidedRooms: GuidedStudyRoomCountSummary,
    ): TeacherDashboardSubjectRow[] {
        return subjects.map((subject) => {
            const subjectRooms = guidedRooms.bySubjectId[subject._id] ?? {
                open: 0,
                closed: 0,
            };
            return {
                subjectId: subject._id,
                subjectName: subject.name,
                subjectCode: subject.code,
                officialMaterialsCount: materialsBySubject[subject._id] ?? 0,
                publishedTestsCount: testsBySubject[subject._id] ?? 0,
                pendingAiReviewsCount: pendingReviewsBySubject[subject._id] ?? 0,
                openGuidedRoomsCount: subjectRooms.open,
                closedGuidedRoomsCount: subjectRooms.closed,
            };
        });
    }

    /**
     * Soma mapas simples de contagens, preservando zero quando não há dados.
     *
     * @param counts Mapa subjectId -> contagem.
     * @returns Soma das contagens do mapa.
     */
    private sumRecordValues(counts: Record<string, number>): number {
        return Object.values(counts).reduce((total, count) => total + count, 0);
    }

    /**
     * Identifica os pilares de atividade ampla que têm dados registados na turma.
     *
     * @param progress Métricas autorizadas pelo ClassProgressService.
     * @param officialMaterialsCount Materiais oficiais associados à turma.
     * @param followUpRulesCount Regras de acompanhamento configuradas.
     * @returns Lista de bases usadas no score operacional.
     */
    private buildActivityBasis(
        progress: ClassProgressView,
        officialMaterialsCount: number,
        followUpRulesCount: number,
    ): string[] {
        const basis: string[] = [];
        if (progress.subjectsCount > 0) basis.push("DISCIPLINES");
        if (officialMaterialsCount > 0) basis.push("OFFICIAL_MATERIALS");
        if (progress.publishedTestsCount > 0) basis.push("PUBLISHED_TESTS");
        if (progress.postCount > 0) basis.push("POSTS");
        if (progress.noteCount > 0) basis.push("PROGRESS_NOTES");
        if (progress.approvedAiContentCount > 0) basis.push("APPROVED_AI_CONTENT");
        if (followUpRulesCount > 0) basis.push("FOLLOW_UP_RULES");
        return basis;
    }

    /**
     * Converte o score de atividade em estado textual simples para a UI.
     *
     * @param activityScorePercent Percentagem calculada por bases de atividade ampla.
     * @returns Estado operacional curto.
     */
    private toActivityStatus(
        activityScorePercent: number,
    ): TeacherDashboardActivityStatus {
        if (activityScorePercent === 0) return "SEM_BASE";
        if (activityScorePercent <= 35) return "BAIXA";
        if (activityScorePercent <= 70) return "REGULAR";
        return "ALTA";
    }

    /**
     * Garante que só professores conseguem consultar o dashboard.
     *
     * @param actor Utilizador autenticado.
     * @returns Nada quando o role é válido.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }
}
