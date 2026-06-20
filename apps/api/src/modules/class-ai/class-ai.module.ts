/**
 * Regista providers, controllers e schemas necessários ao módulo de turma ai.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module.js";
import { ClassAiController } from "./class-ai.controller.js";
import { ClassAiService } from "./class-ai.service.js";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "./schemas/class-ai-interaction.schema.js";

/**
 * Módulo da IA limitada por disciplina/turma.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        AuditLogModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
        ]),
    ],
    controllers: [ClassAiController],
    providers: [ClassAiService],
})
export class ClassAiModule {}
