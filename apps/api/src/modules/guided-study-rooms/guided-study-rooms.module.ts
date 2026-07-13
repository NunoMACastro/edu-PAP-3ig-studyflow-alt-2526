/**
 * Regista providers, controllers e schemas necessários ao módulo de salas de estudo guiado.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { AiModule } from "../ai/ai.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { ClassesModule } from "../classes/classes.module.js";
import { ClassLearningActivityModule } from "../class-learning-activity/class-learning-activity.module.js";
import { ContextNotificationsModule } from "../context-notifications/context-notifications.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { OfficialTestsModule } from "../official-tests/official-tests.module.js";
import { HistoryModule } from "../study/history.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module.js";
import { GuidedStudyRoomsController } from "./guided-study-rooms.controller.js";
import { GuidedStudyRoomAiService } from "./guided-study-room-ai.service.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";
import {
    GuidedStudyRoomAiInteraction,
    GuidedStudyRoomAiInteractionSchema,
} from "./schemas/guided-study-room-ai-interaction.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "./schemas/guided-study-room-participation.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "./schemas/guided-study-room.schema.js";

/**
 * Módulo das salas de estudo guiado da MF2.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AuditLogModule,
        ClassesModule,
        ClassLearningActivityModule,
        ContextNotificationsModule,
        HistoryModule,
        OfficialMaterialsModule,
        OfficialTestsModule,
        SubjectsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
            {
                name: GuidedStudyRoomParticipation.name,
                schema: GuidedStudyRoomParticipationSchema,
            },
            {
                name: GuidedStudyRoomAiInteraction.name,
                schema: GuidedStudyRoomAiInteractionSchema,
            },
        ]),
    ],
    controllers: [GuidedStudyRoomsController],
    providers: [GuidedStudyRoomsService, GuidedStudyRoomAiService],
    exports: [GuidedStudyRoomsService, GuidedStudyRoomAiService],
})
export class GuidedStudyRoomsModule {}
