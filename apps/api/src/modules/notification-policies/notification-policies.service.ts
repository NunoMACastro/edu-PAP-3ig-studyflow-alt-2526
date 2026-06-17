// apps/api/src/modules/notification-policies/notification-policies.service.ts
import { ForbiddenException, Injectable, TooManyRequestsException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ContextNotification, ContextNotificationDocument } from "../context-notifications/schemas/context-notification.schema.js";
import { NotificationChannel, UpsertNotificationPolicyDto } from "./dto/upsert-notification-policy.dto.js";
import { NotificationChannelPolicy, NotificationChannelPolicyDocument } from "./schemas/notification-channel-policy.schema.js";

export type NotificationPolicyView = UpsertNotificationPolicyDto & { updatedAt?: Date };

/**
 * Serviço administrativo para limites de notificação.
 */
@Injectable()
export class NotificationPoliciesService {
    constructor(
        @InjectModel(NotificationChannelPolicy.name)
        private readonly policyModel: Model<NotificationChannelPolicyDocument>,
        @InjectModel(ContextNotification.name)
        private readonly notificationModel: Model<ContextNotificationDocument>,
    ) {}

    async list(actor: AuthenticatedUser): Promise<NotificationPolicyView[]> {
        this.assertAdmin(actor);
        const rows = await this.policyModel.find().sort({ channel: 1 }).lean();
        return rows.map((row) => this.toView(row));
    }

    async upsert(actor: AuthenticatedUser, input: UpsertNotificationPolicyDto): Promise<NotificationPolicyView> {
        this.assertAdmin(actor);
        const policy = await this.policyModel
            .findOneAndUpdate(
                { channel: input.channel },
                { $set: input },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toView(policy);
    }

    /**
     * Deve ser chamado antes de criar notificações em massa.
     */
    async assertWithinQuota(channel: NotificationChannel, targetType: string, targetId: string, recipientIds: string[]): Promise<void> {
        const policy = await this.policyModel.findOne({ channel }).lean();
        if (!policy?.enabled) {
            throw new ForbiddenException({ code: "NOTIFICATION_CHANNEL_DISABLED", message: "Canal de notificação desativado." });
        }

        const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sinceHour = new Date(Date.now() - 60 * 60 * 1000);
        const [perTargetHour, perUserDay] = await Promise.all([
            this.notificationModel.countDocuments({ targetType, targetId: new Types.ObjectId(targetId), createdAt: { $gte: sinceHour } }),
            this.notificationModel.countDocuments({ recipientIds: { $in: recipientIds.map((id) => new Types.ObjectId(id)) }, createdAt: { $gte: sinceDay } }),
        ]);

        // A verificação centralizada evita que BK-MF4-01 e BK-MF4-02 dupliquem regras.
        if (perTargetHour >= policy.maxPerTargetPerHour || perUserDay >= policy.maxPerUserPerDay) {
            throw new TooManyRequestsException({ code: "NOTIFICATION_QUOTA_EXCEEDED", message: "Quota de notificações excedida." });
        }
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem gerir políticas." });
        }
    }

    private toView(row: {
        channel: NotificationChannel;
        enabled: boolean;
        maxPerUserPerDay: number;
        maxPerTargetPerHour: number;
        updatedAt?: Date;
    }): NotificationPolicyView {
        return {
            channel: row.channel,
            enabled: row.enabled,
            maxPerUserPerDay: row.maxPerUserPerDay,
            maxPerTargetPerHour: row.maxPerTargetPerHour,
            updatedAt: row.updatedAt,
        };
    }
}