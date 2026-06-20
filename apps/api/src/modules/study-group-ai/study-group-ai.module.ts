/**
 * Regista providers, controllers e schemas necessários ao módulo de IA coletiva do grupo.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerSchema,
} from "./schemas/study-group-ai-answer.schema.js";
import { StudyGroupAiController } from "./study-group-ai.controller.js";
import { StudyGroupAiService } from "./study-group-ai.service.js";

/**
 * Módulo MF3 para IA coletiva de grupos.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        AuditLogModule,
        StudyGroupsModule,
        StudyRoomsModule,
        MongooseModule.forFeature([
            { name: StudyGroupAiAnswer.name, schema: StudyGroupAiAnswerSchema },
        ]),
    ],
    controllers: [StudyGroupAiController],
    providers: [StudyGroupAiService],
})
export class StudyGroupAiModule {}
