// apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts
/**
 * Regista controllers, providers e schemas do fluxo de conhecimento externo limitado.
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
 * Módulo que junta autenticação, materiais, áreas de estudo, IA e persistência.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        StudyAreasModule,
        MaterialsModule,
        // O model fica registado no módulo para o service persistir sem criar ligação manual à BD.
        MongooseModule.forFeature([
            {
                name: ExternalKnowledgeAiAnswer.name,
                schema: ExternalKnowledgeAiAnswerSchema,
            },
        ]),
    ],
    controllers: [ExternalKnowledgeAiController],
    // O service é o único ponto de domínio deste endpoint dentro do módulo.
    providers: [ExternalKnowledgeAiService],
})
export class ExternalKnowledgeAiModule {}