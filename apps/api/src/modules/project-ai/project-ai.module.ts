/**
 * Regista providers, controllers e schemas necessários ao módulo de planeamento de projetos com IA.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassProjectsModule } from "../class-projects/class-projects.module.js";
import { ProjectAiController } from "./project-ai.controller.js";
import { ProjectAiService } from "./project-ai.service.js";
import { ProjectAiPlan, ProjectAiPlanSchema } from "./schemas/project-ai-plan.schema.js";

/**
 * Módulo de assistência IA gradual a projectos.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        AuditLogModule,
        ClassProjectsModule,
        MongooseModule.forFeature([
            { name: ProjectAiPlan.name, schema: ProjectAiPlanSchema },
        ]),
    ],
    controllers: [ProjectAiController],
    providers: [ProjectAiService],
})
export class ProjectAiModule {}
