/**
 * Regista providers, controllers e schemas necessários ao módulo de alertas de estudo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationPreferencesModule } from "../notification-preferences/notification-preferences.module.js";
import { StudyModule } from "../study/study.module.js";
import { StudyGroupSessionsModule } from "../study-group-sessions/study-group-sessions.module.js";
import {
    StudyAlertRead,
    StudyAlertReadSchema,
} from "./schemas/study-alert-read.schema.js";
import { StudyAlertsController } from "./study-alerts.controller.js";
import { StudyAlertsService } from "./study-alerts.service.js";

/**
 * Módulo MF3 de alertas internos de estudo.
 */
@Module({
    imports: [
        AuthModule,
        StudyModule,
        StudyGroupSessionsModule,
        NotificationPreferencesModule,
        MongooseModule.forFeature([
            { name: StudyAlertRead.name, schema: StudyAlertReadSchema },
        ]),
    ],
    controllers: [StudyAlertsController],
    providers: [StudyAlertsService],
})
export class StudyAlertsModule {}
