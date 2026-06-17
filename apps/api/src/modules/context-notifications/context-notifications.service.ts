// apps/api/src/modules/context-notifications/context-notifications.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { NotificationContext } from "../notification-preferences/dto/update-notification-preferences.dto.js";
import { NotificationPreferencesService } from "../notification-preferences/notification-preferences.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import {
    ContextNotificationTargetType,
    CreateContextNotificationDto,
} from "./dto/create-context-notification.dto.js";
import { ContextNotification, ContextNotificationDocument } from "./schemas/context-notification.schema.js";

export type ContextNotificationView = {
    id: string;
    targetType: ContextNotificationTargetType;
    targetId: string;
    eventType: string;
    title: string;
    body: string;
    recipientIds: string[];
    suppressedRecipientIds: string[];
    createdAt?: Date;
};

/**
 * Orquestra notificações sem permitir que o cliente escolha destinatários.
 */
@Injectable()
export class ContextNotificationsService {
    constructor(
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
        private readonly classesService: ClassesService,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly preferencesService: NotificationPreferencesService,
    ) {}

    /**
     * Cria uma notificação e persiste destinatários aceites e suprimidos.
     */
    async create(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<ContextNotificationView> {
        const candidateIds = await this.resolveCandidateIds(actor, input);
        const preferenceContext = this.toPreferenceContext(input.targetType);
        const acceptedIds: string[] = [];
        const suppressedIds: string[] = [];

        for (const userId of candidateIds) {
            // A preferência é avaliada por destinatário para evitar fugas entre turmas/grupos.
            const enabled = await this.preferencesService.isInAppEnabled(userId, preferenceContext);
            if (enabled) acceptedIds.push(userId);
            else suppressedIds.push(userId);
        }

        const notification = await this.notificationModel.create({
            actorId: new Types.ObjectId(actor.id),
            targetType: input.targetType,
            targetId: new Types.ObjectId(input.targetId),
            eventType: input.eventType,
            title: input.title.trim(),
            body: input.body.trim(),
            sourceId: input.sourceId ? new Types.ObjectId(input.sourceId) : undefined,
            recipientIds: acceptedIds.map((userId) => new Types.ObjectId(userId)),
            suppressedRecipientIds: suppressedIds.map((userId) => new Types.ObjectId(userId)),
        });

        return this.toView(notification.toObject());
    }

    /**
     * Lista apenas notificações onde o utilizador foi destinatário aceite.
     */
    async listMine(actor: AuthenticatedUser): Promise<ContextNotificationView[]> {
        const rows = await this.notificationModel
            .find({ recipientIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        return rows.map((row) => this.toView(row));
    }

    private async resolveCandidateIds(actor: AuthenticatedUser, input: CreateContextNotificationDto): Promise<string[]> {
        if (input.targetType === ContextNotificationTargetType.CLASS) {
            const schoolClass = await this.classesService.findOwnedClass(actor.id, input.targetId);
            return schoolClass.studentIds;
        }

        const group = await this.studyGroupsService.ensureMember(actor.id, input.targetId);
        // O autor não precisa de receber a própria notificação de grupo.
        return group.memberIds.filter((memberId) => memberId !== actor.id);
    }

    private toPreferenceContext(targetType: ContextNotificationTargetType): NotificationContext {
        return targetType === ContextNotificationTargetType.GROUP
            ? NotificationContext.GROUP_SESSION
            : NotificationContext.STUDY_GOAL;
    }

    private toView(row: {
        _id: unknown;
        targetType: ContextNotificationTargetType;
        targetId: unknown;
        eventType: string;
        title: string;
        body: string;
        recipientIds: unknown[];
        suppressedRecipientIds: unknown[];
        createdAt?: Date;
    }): ContextNotificationView {
        return {
            id: String(row._id),
            targetType: row.targetType,
            targetId: String(row.targetId),
            eventType: row.eventType,
            title: row.title,
            body: row.body,
            recipientIds: row.recipientIds.map(String),
            suppressedRecipientIds: row.suppressedRecipientIds.map(String),
            createdAt: row.createdAt,
        };
    }
}