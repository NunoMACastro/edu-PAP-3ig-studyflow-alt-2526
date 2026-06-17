// apps/api/src/modules/follow-up-alerts/follow-up-alerts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { StudyEvent, StudyEventSchema } from "../study/schemas/study-event.schema.js";
import { FollowUpAlertsController } from "./follow-up-alerts.controller.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";
import { FollowUpAlertRule, FollowUpAlertRuleSchema } from "./schemas/follow-up-alert-rule.schema.js";

/**
 * Módulo de regras docentes para alunos inativos.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        ContextNotificationsModule,
        MongooseModule.forFeature([
            { name: FollowUpAlertRule.name, schema: FollowUpAlertRuleSchema },
            { name: StudyEvent.name, schema: StudyEventSchema },
        ]),
    ],
    controllers: [FollowUpAlertsController],
    providers: [FollowUpAlertsService],
})
export class FollowUpAlertsModule {}