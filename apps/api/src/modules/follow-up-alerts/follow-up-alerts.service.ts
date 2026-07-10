/**
 * Implementa alertas docentes de acompanhamento.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
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
     * @param eventModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param classesService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     * @param notificationsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(FollowUpAlertRule.name)
        private readonly ruleModel: Model<FollowUpAlertRuleDocument>,
        @InjectModel(StudyEvent.name)
        private readonly eventModel: Model<StudyEventDocument>,
        private readonly classesService: ClassesService,
        private readonly notificationsService: ContextNotificationsService,
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
        await this.classesService.findOwnedClass(actor.id, input.classId);
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
            classes.map((schoolClass) => [schoolClass._id, schoolClass]),
        );
        const ownedRules = rules.filter((rule) => classesById.has(String(rule.classId)));
        const summaryRules = await Promise.all(
            ownedRules.map(async (rule) => {
                const schoolClass = classesById.get(String(rule.classId))!;
                const inactiveStudentIds = await this.findInactiveStudentIds(
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
        const schoolClass = await this.classesService.findOwnedClass(actor.id, String(rule.classId));
        const inactiveStudentIds = await this.findInactiveStudentIds(
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
     * @param studentIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param inactiveDays Valor temporal que controla expiração, retenção ou referência da operação.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private async findInactiveStudentIds(studentIds: string[], inactiveDays: number): Promise<string[]> {
        if (studentIds.length === 0) return [];
        const since = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
        const activeEvents = await this.eventModel
            .find({
                userId: { $in: studentIds.map((id) => new Types.ObjectId(id)) },
                occurredAt: { $gte: since },
            })
            .select("userId")
            .lean();
        const active = new Set(activeEvents.map((event) => String(event.userId)));
        return studentIds.filter((id) => !active.has(id));
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
