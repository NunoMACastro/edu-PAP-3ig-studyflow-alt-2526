/**
 * Regista providers, controllers e schemas necessários ao módulo de turma ai.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ClassLearningActivityModule } from "../class-learning-activity/class-learning-activity.module.js";
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
        ClassLearningActivityModule,
        AiModule,
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
