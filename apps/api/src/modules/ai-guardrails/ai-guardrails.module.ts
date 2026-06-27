/**
 * Regista providers, controllers e schemas necessários ao módulo de ai guardrails.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { AiGuardrailsController } from "./ai-guardrails.controller.js";
import { AiGuardrailsService } from "./ai-guardrails.service.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckSchema,
} from "./schemas/ai-guardrail-check.schema.js";

/**
 * Módulo MF3 para separar guardrails de IA por contexto.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        StudyRoomsModule,
        SubjectsModule,
        MongooseModule.forFeature([
            { name: AiGuardrailCheck.name, schema: AiGuardrailCheckSchema },
        ]),
    ],
    controllers: [AiGuardrailsController],
    providers: [AiGuardrailsService],
    exports: [AiGuardrailsService],
})
export class AiGuardrailsModule {}
