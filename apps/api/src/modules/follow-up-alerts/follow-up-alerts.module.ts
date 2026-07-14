/**
 * Regista alertas docentes de acompanhamento.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { ClassLearningActivityModule } from "../class-learning-activity/class-learning-activity.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import {
    ApprovedAiQuizAttempt,
    ApprovedAiQuizAttemptSchema,
} from "../ai-content-reviews/schemas/approved-ai-quiz-attempt.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "../guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import { FollowUpAlertsController } from "./follow-up-alerts.controller.js";
import { FollowUpCentreController } from "./follow-up-centre.controller.js";
import { FollowUpAlertsService } from "./follow-up-alerts.service.js";
import { FollowUpAlertRule, FollowUpAlertRuleSchema } from "./schemas/follow-up-alert-rule.schema.js";

@Module({
    imports: [
        AuthModule,
        ClassLearningActivityModule,
        ClassesModule,
        ContextNotificationsModule,
        OfficialTestsModule,
        MongooseModule.forFeature([
            { name: FollowUpAlertRule.name, schema: FollowUpAlertRuleSchema },
            {
                name: ApprovedAiQuizAttempt.name,
                schema: ApprovedAiQuizAttemptSchema,
            },
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
            {
                name: GuidedStudyRoomParticipation.name,
                schema: GuidedStudyRoomParticipationSchema,
            },
        ]),
    ],
    controllers: [FollowUpAlertsController, FollowUpCentreController],
    providers: [FollowUpAlertsService],
    exports: [FollowUpAlertsService],
})
export class FollowUpAlertsModule {}
