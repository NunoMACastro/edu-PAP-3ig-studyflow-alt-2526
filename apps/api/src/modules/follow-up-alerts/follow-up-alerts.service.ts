/**
 * Implementa alertas docentes de acompanhamento.
 */
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { OfficialTestRankingService } from "../official-tests/official-test-ranking.service.js";
import {
    ApprovedAiQuizAttempt,
    ApprovedAiQuizAttemptDocument,
} from "../ai-content-reviews/schemas/approved-ai-quiz-attempt.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationDocument,
} from "../guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { NotifyFollowUpStudentDto } from "./dto/notify-follow-up-student.dto.js";
import { FollowUpAlertRule, FollowUpAlertRuleDocument } from "./schemas/follow-up-alert-rule.schema.js";

/**
 * Vista pública de uma regra de acompanhamento.
 */
export type FollowUpAlertRuleView = {
    id: string;
    teacherId: string;
    classId: string;
    inactiveDays: number;
    title: string;
    message: string;
    createdAt?: Date;
};

/**
 * Aluno inativo apresentado apenas na área própria de acompanhamento.
 */
export type FollowUpAlertSummaryStudent = {
    studentId: string;
    displayName: string;
    email?: string;
};

/**
 * Regra enriquecida com preview seguro de inatividade.
 */
export type FollowUpAlertSummaryRule = {
    id: string;
    classId: string;
    className: string;
    inactiveDays: number;
    title: string;
    message: string;
    inactiveStudentsCount: number;
    inactiveStudents: FollowUpAlertSummaryStudent[];
};

/**
 * Resumo docente de regras de acompanhamento, sem efeitos secundários.
 */
export type FollowUpAlertsSummary = {
    rules: FollowUpAlertSummaryRule[];
};

/**
 * Service de regras e execução manual de alertas.
 */
@Injectable()
export class FollowUpAlertsService {
    /**
     * Recebe as dependências injetadas de FollowUpAlertsService para manter alertas de acompanhamento testável e separado de detalhes externos.
     *
     * @param ruleModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param classLearningActivityService Fonte canónica de atividade pedagógica por turma.
     * @param classesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param notificationsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param officialTestRankingService Service que reutiliza a política BEST_ATTEMPT existente.
     */
    constructor(
        @InjectModel(FollowUpAlertRule.name)
        private readonly ruleModel: Model<FollowUpAlertRuleDocument>,
        private readonly classesService: ClassesService,
        private readonly notificationsService: ContextNotificationsService,
        private readonly officialTestRankingService: OfficialTestRankingService,
        private readonly classLearningActivityService: ClassLearningActivityService,
        @Optional()
        @InjectModel(ApprovedAiQuizAttempt.name)
        private readonly approvedAttemptModel?: Model<ApprovedAiQuizAttemptDocument>,
        @Optional()
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel?: Model<GuidedStudyRoomDocument>,
        @Optional()
        @InjectModel(GuidedStudyRoomParticipation.name)
        private readonly guidedParticipationModel?: Model<GuidedStudyRoomParticipationDocument>,
    ) {}

    /**
     * Cria regra pertencente a uma turma do professor.
     *
     * @param actor Professor autenticado.
     * @param input Dados da regra.
     * @returns Regra criada.
     */
    async create(actor: AuthenticatedUser, input: CreateFollowUpAlertRuleDto) {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, input.classId);
        const rule = await this.ruleModel.create({
            teacherId: new Types.ObjectId(actor.id),
            classId: new Types.ObjectId(input.classId),
            inactiveDays: input.inactiveDays,
            title: input.title.trim(),
            message: input.message.trim(),
        });
        return this.toRuleView(rule.toObject());
    }

    /**
     * Lista regras do professor.
     *
     * @param actor Professor autenticado.
     * @returns Regras.
     */
    async list(actor: AuthenticatedUser) {
        this.assertTeacher(actor);
        const rules = await this.ruleModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return rules.map((rule) => this.toRuleView(rule));
    }

    /**
     * Prepara uma leitura segura de regras e alunos inativos, sem enviar notificações.
     *
     * @param actor Professor autenticado.
     * @returns Regras do professor com preview de inatividade limitado às suas turmas.
     */
    async summary(actor: AuthenticatedUser): Promise<FollowUpAlertsSummary> {
        this.assertTeacher(actor);
        const classes = await this.classesService.listTeacherClasses(actor);
        return this.summaryForClasses(actor, classes);
    }

    /**
     * Calcula o mesmo preview para um conjunto de turmas já autorizado pelo chamador.
     *
     * @param actor Professor autenticado.
     * @param classes Turmas já filtradas pelo professor.
     * @returns Resumo de regras sem voltar a carregar turmas.
     */
    async summaryForClasses(
        actor: AuthenticatedUser,
        classes: SchoolClassView[],
    ): Promise<FollowUpAlertsSummary> {
        this.assertTeacher(actor);
        const rules = await this.ruleModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        const classesById = new Map(
            classes
                .filter((schoolClass) => schoolClass.status !== "ARCHIVED")
                .map((schoolClass) => [schoolClass._id, schoolClass]),
        );
        const ownedRules = rules.filter((rule) => classesById.has(String(rule.classId)));
        const summaryRules = await Promise.all(
            ownedRules.map(async (rule) => {
                const schoolClass = classesById.get(String(rule.classId))!;
                const inactiveStudentIds = await this.findInactiveStudentIds(
                    schoolClass._id,
                    schoolClass.studentIds,
                    rule.inactiveDays,
                );
                const studentsById = new Map(
                    (schoolClass.students ?? []).map((student) => [student.id, student]),
                );
                const inactiveStudents = inactiveStudentIds.map((studentId) => {
                    const student = studentsById.get(studentId);
                    return {
                        studentId,
                        displayName: student?.email ?? `Aluno ${studentId.slice(-4)}`,
                        ...(student?.email ? { email: student.email } : {}),
                    };
                });

                return {
                    id: String(rule._id),
                    classId: String(rule.classId),
                    className: schoolClass.name,
                    inactiveDays: rule.inactiveDays,
                    title: rule.title,
                    message: rule.message,
                    inactiveStudentsCount: inactiveStudents.length,
                    inactiveStudents,
                };
            }),
        );

        return { rules: summaryRules };
    }

    /**
     * Executa regra manualmente e envia notificação se houver alunos inativos.
     *
     * @param actor Professor autenticado.
     * @param ruleId Regra alvo.
     * @returns Preview e notificação criada.
     */
    async run(actor: AuthenticatedUser, ruleId: string) {
        this.assertTeacher(actor);
        const rule = await this.findOwnedRule(actor.id, ruleId);
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            String(rule.classId),
        );
        const inactiveStudentIds = await this.findInactiveStudentIds(
            schoolClass._id,
            schoolClass.studentIds,
            rule.inactiveDays,
        );

        if (inactiveStudentIds.length === 0) {
            return {
                rule: this.toRuleView(rule),
                inactiveStudentIds,
                notification: null,
            };
        }

        const notification = await this.notificationsService.createForRecipients(
            actor,
            {
                contextType: "CLASS",
                contextId: String(rule.classId),
                type: "FOLLOW_UP",
                title: rule.title,
                body: rule.message,
            },
            inactiveStudentIds,
        );

        return {
            rule: this.toRuleView(rule),
            inactiveStudentIds,
            notification,
        };
    }

    /**
     * Obtém os mini-testes oficiais de um aluno depois de validar turma e inscrição.
     *
     * @param actor Professor autenticado.
     * @param classId Turma pertencente ao professor.
     * @param studentId Aluno inscrito na turma.
     * @returns Resultados factuais minimizados segundo BEST_ATTEMPT.
     */
    async listStudentOfficialTests(
        actor: AuthenticatedUser,
        classId: string,
        studentId: string,
    ) {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, classId);
        await this.classesService.ensureOwnedClassStudent(
            actor.id,
            classId,
            studentId,
        );
        return this.officialTestRankingService.listStudentResultsForTeacher(
            actor,
            classId,
            studentId,
        );
    }

    /**
     * Consolida factos já persistidos para o detalhe docente de um aluno. Não
     * calcula score de risco nem infere diagnósticos a partir dos resultados.
     */
    async getStudentOverview(
        actor: AuthenticatedUser,
        classId: string,
        studentId: string,
    ) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedActiveClass(
            actor.id,
            classId,
        );
        await this.classesService.ensureOwnedClassStudent(
            actor.id,
            classId,
            studentId,
        );
        const students = await this.classesService.listOwnedClassStudentsIncluding(
            actor.id,
            classId,
            [studentId],
        );
        const student = students.find((item) => item.id === studentId);
        const [activity, officialTests, approvedAiQuizzes] = await Promise.all([
            this.classLearningActivityService.getStudentSummary(
                classId,
                studentId,
            ),
            this.officialTestRankingService.listStudentResultsForTeacher(
                actor,
                classId,
                studentId,
            ),
            this.getApprovedQuizOverview(classId, studentId),
        ]);
        const guidedRooms = await this.getGuidedRoomOverview(
            classId,
            studentId,
            activity.joinedAt,
        );
        const attemptedTests = officialTests.filter((test) => test.bestAttempt);
        const averageBestPercentage = attemptedTests.length
            ? Math.round(
                  attemptedTests.reduce(
                      (total, test) => total + (test.bestAttempt?.percentage ?? 0),
                      0,
                  ) / attemptedTests.length,
              )
            : null;
        const factualSignals: Array<{
            code: string;
            label: string;
            evidence: string;
        }> = [];
        if (!activity.lastActivityAt) {
            factualSignals.push({
                code: "NO_RECORDED_CLASS_ACTIVITY",
                label: "Sem atividade pedagógica registada",
                evidence: "Ainda não existem ações oficiais desta turma no histórico.",
            });
        } else if (activity.trend === "LESS") {
            factualSignals.push({
                code: "LOWER_ACTIVITY_LAST_30_DAYS",
                label: "Menos atividade nos últimos 30 dias",
                evidence: `${activity.current30DaysCount} ações recentes face a ${activity.previous30DaysCount} no período anterior.`,
            });
        }
        const lowerTestResults = attemptedTests.filter(
            (test) => (test.bestAttempt?.percentage ?? 100) < 50,
        );
        if (lowerTestResults.length > 0) {
            factualSignals.push({
                code: "OFFICIAL_TESTS_BELOW_HALF",
                label: "Mini-testes abaixo de 50%",
                evidence: `${lowerTestResults.length} ${lowerTestResults.length === 1 ? "mini-teste" : "mini-testes"} com melhor tentativa abaixo de metade.`,
            });
        }
        if (
            guidedRooms.totalRooms > 0 &&
            guidedRooms.completedRooms < guidedRooms.totalRooms
        ) {
            factualSignals.push({
                code: "GUIDED_ROOMS_NOT_COMPLETED",
                label: "Salas guiadas por concluir",
                evidence: `${guidedRooms.completedRooms} de ${guidedRooms.totalRooms} salas concluídas.`,
            });
        }

        return {
            class: {
                id: schoolClass._id,
                name: schoolClass.name,
                schoolYear: schoolClass.schoolYear,
            },
            student: {
                id: studentId,
                displayName: student?.email ?? `Aluno ${studentId.slice(-4)}`,
                ...(student?.email ? { email: student.email } : {}),
            },
            activity,
            guidedRooms,
            officialTests: {
                items: officialTests,
                totalTests: officialTests.length,
                attemptedTests: attemptedTests.length,
                averageBestPercentage,
            },
            approvedAiQuizzes,
            factualSignals,
        };
    }

    /** Agrega participação factual nas salas da turma. */
    private async getGuidedRoomOverview(
        classId: string,
        studentId: string,
        joinedAt: Date | null,
    ) {
        if (!this.guidedRoomModel || !this.guidedParticipationModel) {
            return {
                totalRooms: 0,
                viewedRooms: 0,
                completedRooms: 0,
                completionPercent: 0,
                lastViewedAt: null as Date | null,
            };
        }
        const roomFilter = {
            classId: new Types.ObjectId(classId),
            ...(joinedAt
                ? {
                      $or: [
                          { status: "OPEN" },
                          { createdAt: { $gte: joinedAt } },
                          { closedAt: { $gte: joinedAt } },
                      ],
                  }
                : {}),
        };
        const [totalRooms, participations] = await Promise.all([
            this.guidedRoomModel.countDocuments(roomFilter),
            this.guidedParticipationModel
                .find({
                    classId: new Types.ObjectId(classId),
                    studentId: new Types.ObjectId(studentId),
                    ...(joinedAt ? { lastViewedAt: { $gte: joinedAt } } : {}),
                })
                .select("status lastViewedAt")
                .lean(),
        ]);
        const completedRooms = participations.filter(
            (participation) => participation.status === "COMPLETED",
        ).length;
        const timestamps = participations
            .map((participation) => participation.lastViewedAt)
            .filter((value): value is Date => value instanceof Date);
        return {
            totalRooms,
            viewedRooms: participations.length,
            completedRooms,
            completionPercent: totalRooms
                ? Math.round((completedRooms / totalRooms) * 100)
                : 0,
            lastViewedAt: timestamps.length
                ? new Date(Math.max(...timestamps.map((value) => value.getTime())))
                : null,
        };
    }

    /** Agrega tentativas de quizzes IA aprovados sem respostas nem soluções. */
    private async getApprovedQuizOverview(classId: string, studentId: string) {
        if (!this.approvedAttemptModel) {
            return {
                attemptCount: 0,
                quizCount: 0,
                averageScorePercent: null as number | null,
                bestScorePercent: null as number | null,
                lastAnsweredAt: null as Date | null,
            };
        }
        const attempts = await this.approvedAttemptModel
            .find({
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(studentId),
            })
            .select("reviewId scorePercent answeredAt")
            .lean();
        if (!attempts.length) {
            return {
                attemptCount: 0,
                quizCount: 0,
                averageScorePercent: null,
                bestScorePercent: null,
                lastAnsweredAt: null,
            };
        }
        return {
            attemptCount: attempts.length,
            quizCount: new Set(attempts.map((attempt) => String(attempt.reviewId))).size,
            averageScorePercent: Math.round(
                attempts.reduce((total, attempt) => total + attempt.scorePercent, 0) /
                    attempts.length,
            ),
            bestScorePercent: Math.max(
                ...attempts.map((attempt) => attempt.scorePercent),
            ),
            lastAnsweredAt: new Date(
                Math.max(
                    ...attempts.map((attempt) =>
                        new Date(attempt.answeredAt).getTime(),
                    ),
                ),
            ),
        };
    }

    /**
     * Envia acompanhamento interno apenas ao aluno selecionado e autorizado.
     *
     * @param actor Professor autenticado.
     * @param classId Turma pertencente ao professor.
     * @param studentId Aluno inscrito na turma.
     * @param input Título e mensagem validados.
     * @returns Notificação criada com contagens de entrega e supressão.
     */
    async notifyStudent(
        actor: AuthenticatedUser,
        classId: string,
        studentId: string,
        input: NotifyFollowUpStudentDto,
    ) {
        this.assertTeacher(actor);
        await this.classesService.findOwnedActiveClass(actor.id, classId);
        await this.classesService.ensureOwnedClassStudent(
            actor.id,
            classId,
            studentId,
        );
        return this.notificationsService.createForRecipients(
            actor,
            {
                contextType: "CLASS",
                contextId: classId,
                type: "FOLLOW_UP",
                title: input.title.trim(),
                body: input.message.trim(),
            },
            [studentId],
        );
    }

    /**
     * Obtém find owned rule no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param teacherId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param ruleId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    private async findOwnedRule(teacherId: string, ruleId: string) {
        if (!Types.ObjectId.isValid(ruleId)) throw this.notFound();
        const rule = await this.ruleModel
            .findOne({ _id: ruleId, teacherId: new Types.ObjectId(teacherId) })
            .lean();
        if (!rule) throw this.notFound();
        return rule;
    }

    /**
     * Obtém find inactive student ids no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param classId Turma oficial que delimita a atividade considerada.
     * @param studentIds Alunos atualmente inscritos nessa turma.
     * @param inactiveDays Valor temporal que controla expiração, retenção ou referência da operação.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async findInactiveStudentIds(
        classId: string,
        studentIds: string[],
        inactiveDays: number,
    ): Promise<string[]> {
        return this.classLearningActivityService.findInactiveStudentIds({
            classId,
            studentIds,
            inactiveDays,
        });
    }

    /**
     * Valida a regra de alertas de acompanhamento e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Executa not found no domínio de alertas de acompanhamento, aplicando validações, autorização e persistência de forma coesa.
     *
     * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
     */
    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "FOLLOW_UP_ALERT_NOT_FOUND",
            message: "Regra de acompanhamento não encontrada.",
        });
    }

    /**
     * Transforma o documento interno de alertas de acompanhamento num contrato público, removendo detalhes de persistência antes de responder à UI.
     *
     * @param rule Valor de rule usado pela função para executar to rule view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toRuleView(rule: {
        _id?: unknown;
        teacherId: unknown;
        classId: unknown;
        inactiveDays: number;
        title: string;
        message: string;
        createdAt?: Date;
    }): FollowUpAlertRuleView {
        return {
            id: String(rule._id),
            teacherId: String(rule.teacherId),
            classId: String(rule.classId),
            inactiveDays: rule.inactiveDays,
            title: rule.title,
            message: rule.message,
            createdAt: rule.createdAt,
        };
    }
}
