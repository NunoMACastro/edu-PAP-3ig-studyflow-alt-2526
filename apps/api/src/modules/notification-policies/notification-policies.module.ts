/**
 * Regista políticas de canais de notificação.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ContextNotification, ContextNotificationSchema } from "../context-notifications/schemas/context-notification.schema.js";
import { NotificationPoliciesController } from "./notification-policies.controller.js";
import { NotificationPoliciesService } from "./notification-policies.service.js";
import {
    NotificationChannelPolicy,
    NotificationChannelPolicySchema,
} from "./schemas/notification-channel-policy.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        MongooseModule.forFeature([
            { name: NotificationChannelPolicy.name, schema: NotificationChannelPolicySchema },
            { name: ContextNotification.name, schema: ContextNotificationSchema },
        ]),
    ],
    controllers: [NotificationPoliciesController],
    providers: [NotificationPoliciesService],
    exports: [NotificationPoliciesService],
})
export class NotificationPoliciesModule {}
