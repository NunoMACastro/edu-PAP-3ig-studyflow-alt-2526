// apps/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import {
    ContextNotificationEventType,
    ContextNotificationTargetType,
} from "../context-notifications/dto/create-context-notification.dto.js";
import { StudyEvent, StudyEventDocument } from "../study/schemas/study-event.schema.js";
import { CreateFollowUpAlertRuleDto } from "./dto/create-follow-up-alert-rule.dto.js";
import { FollowUpAlertRule, FollowUpAlertRuleDocument } from "./schemas/follow-up-alert-rule.schema.js";

export type InactiveStudentView = { studentId: string; lastActivityAt: Date | null };
export type FollowUpAlertRuleView = {
    id: string;
    classId: string;
    inactivityDays: number;
    title: string;
    message: string;
    enabled: boolean;
};

/**
 * Regras de acompanhamento calculadas a partir do histórico de estudo.
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

    async createRule(actor: AuthenticatedUser, input: CreateFollowUpAlertRuleDto): Promise<FollowUpAlertRuleView> {
        this.assertTeacher(actor);
        await this.classesService.findOwnedClass(actor.id, input.classId);
        const rule = await this.ruleModel.create({
            teacherId: new Types.ObjectId(actor.id),
            classId: new Types.ObjectId(input.classId),
            inactivityDays: input.inactivityDays,
            title: input.title.trim(),
            message: input.message.trim(),
            enabled: input.enabled ?? true,
        });
        return this.toRuleView(rule.toObject());
    }

    async listMine(actor: AuthenticatedUser): Promise<FollowUpAlertRuleView[]> {
        this.assertTeacher(actor);
        const rules = await this.ruleModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return rules.map((rule) => this.toRuleView(rule));
    }

    async previewInactiveStudents(actor: AuthenticatedUser, ruleId: string): Promise<InactiveStudentView[]> {
        const rule = await this.getOwnedRule(actor, ruleId);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, String(rule.classId));
        const since = new Date(Date.now() - rule.inactivityDays * 24 * 60 * 60 * 1000);
        const activeRows = await this.eventModel
            .find({
                userId: { $in: schoolClass.studentIds.map((id) => new Types.ObjectId(id)) },
                occurredAt: { $gte: since },
            })
            .select("userId occurredAt")
            .sort({ occurredAt: -1 })
            .lean();

        const activeIds = new Set(activeRows.map((row) => String(row.userId)));
        // A resposta é limitada à turma validada para evitar exposição de outros alunos.
        return schoolClass.studentIds
            .filter((studentId) => !activeIds.has(studentId))
            .map((studentId) => ({ studentId, lastActivityAt: null }));
    }

    async runRule(actor: AuthenticatedUser, ruleId: string) {
        const rule = await this.getOwnedRule(actor, ruleId);
        return this.notificationsService.create(actor, {
            targetType: ContextNotificationTargetType.CLASS,
            targetId: String(rule.classId),
            eventType: ContextNotificationEventType.TASK_ASSIGNED,
            title: rule.title,
            body: rule.message,
        });
    }

    private async getOwnedRule(actor: AuthenticatedUser, ruleId: string) {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(ruleId)) throw this.notFound();
        const rule = await this.ruleModel
            .findOne({ _id: ruleId, teacherId: new Types.ObjectId(actor.id), enabled: true })
            .lean();
        if (!rule) throw this.notFound();
        return rule;
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({ code: "TEACHER_ROLE_REQUIRED", message: "Apenas professores podem criar alertas." });
        }
    }

    private notFound(): NotFoundException {
        return new NotFoundException({ code: "FOLLOW_UP_RULE_NOT_FOUND", message: "Regra de acompanhamento não encontrada." });
    }

    private toRuleView(rule: {
        _id: unknown;
        classId: unknown;
        inactivityDays: number;
        title: string;
        message: string;
        enabled: boolean;
    }): FollowUpAlertRuleView {
        return {
            id: String(rule._id),
            classId: String(rule.classId),
            inactivityDays: rule.inactivityDays,
            title: rule.title,
            message: rule.message,
            enabled: rule.enabled,
        };
    }
}