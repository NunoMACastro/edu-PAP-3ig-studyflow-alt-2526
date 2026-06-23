/**
 * Implementa alertas docentes de acompanhamento.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertRule, FollowUpAlertRuleDocument } from "./schemas/follow-up-alert-rule.schema.js";

/**
 * Service de regras e execução manual de alertas.
 */
@Injectable()
export class FollowUpAlertsService {
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

    private async findOwnedRule(teacherId: string, ruleId: string) {
        if (!Types.ObjectId.isValid(ruleId)) throw this.notFound();
        const rule = await this.ruleModel
            .findOne({ _id: ruleId, teacherId: new Types.ObjectId(teacherId) })
            .lean();
        if (!rule) throw this.notFound();
        return rule;
    }

    private async findInactiveStudentIds(studentIds: string[], inactiveDays: number): Promise<string[]> {
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

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "FOLLOW_UP_ALERT_NOT_FOUND",
            message: "Regra de acompanhamento não encontrada.",
        });
    }

    private toRuleView(rule: {
        _id?: unknown;
        teacherId: unknown;
        classId: unknown;
        inactiveDays: number;
        title: string;
        message: string;
        createdAt?: Date;
    }) {
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
