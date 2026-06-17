// apps/api/src/modules/context-notifications/context-notifications.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { ContextNotificationsController } from "./context-notifications.controller.js";
import { ContextNotificationsService } from "./context-notifications.service.js";
import { ContextNotification, ContextNotificationSchema } from "./schemas/context-notification.schema.js";

/**
 * Módulo MF4 que liga eventos pedagógicos a notificações internas.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        StudyGroupsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([{ name: ContextNotification.name, schema: ContextNotificationSchema }]),
    ],
    controllers: [ContextNotificationsController],
    providers: [ContextNotificationsService],
    exports: [ContextNotificationsService],
})
export class ContextNotificationsModule {}