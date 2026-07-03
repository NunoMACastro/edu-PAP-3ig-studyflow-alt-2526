/**
 * Regista providers, controllers e schemas necessários ao módulo de IA com conhecimento externo limitado.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { ExternalKnowledgeAiController } from "./external-knowledge-ai.controller.js";
import { ExternalKnowledgeAiService } from "./external-knowledge-ai.service.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerSchema,
} from "./schemas/external-knowledge-ai-answer.schema.js";

/**
 * Módulo MF3 para conhecimento externo limitado e separado de citações internas.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        StudyAreasModule,
        MaterialsModule,
        MongooseModule.forFeature([
            {
                name: ExternalKnowledgeAiAnswer.name,
                schema: ExternalKnowledgeAiAnswerSchema,
            },
        ]),
    ],
    controllers: [ExternalKnowledgeAiController],
    providers: [ExternalKnowledgeAiService],
})
export class ExternalKnowledgeAiModule {}
