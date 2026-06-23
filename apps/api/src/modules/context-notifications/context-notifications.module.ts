/**
 * Regista notificações contextuais.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { NotificationPoliciesModule } from "../notification-policies/notification-policies.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { ContextNotificationsController } from "./context-notifications.controller.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { ContextNotification, ContextNotificationSchema } from "./schemas/context-notification.schema.js";

@Module({
    imports: [
        AuthModule,
        ClassesModule,
        StudyGroupsModule,
        NotificationPreferencesModule,
        NotificationPoliciesModule,
        AuditLogModule,
        MongooseModule.forFeature([{ name: ContextNotification.name, schema: ContextNotificationSchema }]),
    ],
    controllers: [ContextNotificationsController],
    providers: [ContextNotificationsService],
    exports: [ContextNotificationsService],
})
export class ContextNotificationsModule {}
