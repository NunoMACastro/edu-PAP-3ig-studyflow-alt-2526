/**
 * Regista o dashboard principal do professor sobre os domínios existentes.
 */
import { Module } from "@nestjs/common";
import { AiContentReviewsModule } from "../ai-content-reviews/ai-content-reviews.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassProgressModule } from "../class-progress/class-progress.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { FollowUpAlertsModule } from "../follow-up-alerts/follow-up-alerts.module.js";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { TeacherDashboardController } from "./teacher-dashboard.controller.js";
import { TeacherDashboardService } from "./teacher-dashboard.service.js";

/**
 * Módulo do dashboard docente.
 */
@Module({
    imports: [
        AuthModule,
        ClassesModule,
        SubjectsModule,
        ClassProgressModule,
        FollowUpAlertsModule,
        OfficialMaterialsModule,
        OfficialTestsModule,
        AiContentReviewsModule,
        GuidedStudyRoomsModule,
    ],
    controllers: [TeacherDashboardController],
    providers: [TeacherDashboardService],
})
export class TeacherDashboardModule {}
