/**
 * Implementa notificações internas para turmas e grupos.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassesService } from "../classes/classes.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { NotificationPoliciesService } from "../notification-policies/notification-policies.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { CreateContextNotificationDto } from "./dto/create-context-notification.dto.js";
import { ContextNotification, ContextNotificationDocument } from "./schemas/context-notification.schema.js";

/**
 * Service de notificações contextuais.
 */
@Injectable()
export class ContextNotificationsService {
    constructor(
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
        private readonly classesService: ClassesService,
        private readonly groupsService: StudyGroupsService,
        private readonly preferencesService: NotificationPreferencesService,
        private readonly policiesService: NotificationPoliciesService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Cria uma notificação e calcula destinatários no backend.
     *
     * @param actor Utilizador autenticado.
     * @param input Dados da notificação.
     * @returns Notificação persistida.
     */
    async create(actor: AuthenticatedUser, input: CreateContextNotificationDto) {
        const recipientIds = await this.resolveRecipients(actor, input);
        return this.createForResolvedRecipients(actor, input, recipientIds);
    }

    /**
     * Cria uma notificação para destinatários já filtrados por um fluxo backend.
     *
     * @param actor Utilizador autenticado.
     * @param input Dados da notificação.
     * @param recipientIds Destinatários calculados por outro service, nunca vindos do cliente HTTP.
     * @returns Notificação persistida.
     */
    async createForRecipients(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto,
        recipientIds: string[],
    ) {
        const allowedRecipientIds = await this.resolveRecipients(actor, input);
        const allowed = new Set(allowedRecipientIds);
        const uniqueRecipientIds = Array.from(new Set(recipientIds));
        const hasOutOfContextRecipient = uniqueRecipientIds.some((id) => !allowed.has(id));
        if (hasOutOfContextRecipient) {
            throw new ForbiddenException({
                code: "RECIPIENT_OUT_OF_CONTEXT",
                message: "A notificação só pode ser enviada a membros do contexto validado.",
            });
        }

        return this.createForResolvedRecipients(actor, input, uniqueRecipientIds);
    }

    private async createForResolvedRecipients(
        actor: AuthenticatedUser,
        input: CreateContextNotificationDto,
        recipientIds: string[],
    ) {
        const context = input.contextType === "CLASS" ? NotificationContext.STUDY_GOAL : NotificationContext.GROUP_SESSION;
        const enabledPairs = await Promise.all(
            recipientIds.map(async (id) => ({
                id,
                enabled: await this.preferencesService.isInAppEnabled(id, context),
            })),
        );
        const finalRecipients = enabledPairs.filter((pair) => pair.enabled).map((pair) => pair.id);
        const suppressed = enabledPairs.filter((pair) => !pair.enabled).map((pair) => pair.id);
        await this.policiesService.assertWithinQuota(finalRecipients, input.contextId);

        const notification = await this.notificationModel.create({
            contextType: input.contextType,
            contextId: new Types.ObjectId(input.contextId),
            actorId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
            body: input.body.trim(),
            recipientIds: finalRecipients.map((id) => new Types.ObjectId(id)),
            suppressedRecipientIds: suppressed.map((id) => new Types.ObjectId(id)),
        });

        await this.auditLogService.record({
            actorId: actor.id,
            domain: "NOTIFICATIONS",
            action: "CONTEXT_NOTIFICATION_CREATED",
            resourceType: "ContextNotification",
            resourceId: String(notification._id),
            result: "SUCCESS",
            metadata: {
                contextType: input.contextType,
                type: input.type,
                recipientCount: finalRecipients.length,
                suppressedCount: suppressed.length,
            },
        });
        return this.toView(notification.toObject());
    }

    /**
     * Lista notificações visíveis ao utilizador autenticado.
     *
     * @param actor Utilizador autenticado.
     * @returns Notificações recebidas ou criadas.
     */
    async list(actor: AuthenticatedUser) {
        const actorId = new Types.ObjectId(actor.id);
        const notifications = await this.notificationModel
            .find({ $or: [{ actorId }, { recipientIds: actorId }] })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return notifications.map((notification) => this.toView(notification));
    }

    private async resolveRecipients(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<string[]> {
        if (input.contextType === "CLASS") {
            if (actor.role !== "TEACHER" && actor.role !== "ADMIN") {
                throw new ForbiddenException({
                    code: "TEACHER_ROLE_REQUIRED",
                    message: "Só professores podem notificar uma turma.",
                });
            }
            const schoolClass = await this.classesService.findOwnedClass(actor.id, input.contextId);
            return schoolClass.studentIds;
        }

        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Só alunos membros podem notificar um grupo.",
            });
        }
        const group = await this.groupsService.ensureMember(actor.id, input.contextId);
        return group.memberIds.filter((id) => id !== actor.id);
    }

    private toView(notification: {
        _id?: unknown;
        contextType: string;
        contextId: unknown;
        actorId: unknown;
        type: string;
        title: string;
        body: string;
        recipientIds?: unknown[];
        suppressedRecipientIds?: unknown[];
        createdAt?: Date;
    }) {
        return {
            id: String(notification._id),
            contextType: notification.contextType,
            contextId: String(notification.contextId),
            actorId: String(notification.actorId),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            recipientIds: (notification.recipientIds ?? []).map(String),
            suppressedRecipientIds: (notification.suppressedRecipientIds ?? []).map(String),
            createdAt: notification.createdAt,
        };
    }
}
