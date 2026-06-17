/**
 * Regista providers, controllers e schemas necessários ao módulo de private área ai.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { PrivateAreaAiController } from "./private-area-ai.controller.js";
import { PrivateAreaAiService } from "./private-area-ai.service.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerSchema,
} from "./schemas/private-area-ai-answer.schema.js";

/**
 * Módulo de IA privada por área de estudo.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        StudyAreasModule,
        MaterialsModule,
        MongooseModule.forFeature([
            { name: PrivateAreaAiAnswer.name, schema: PrivateAreaAiAnswerSchema },
        ]),
    ],
    controllers: [PrivateAreaAiController],
    providers: [PrivateAreaAiService],
})
export class PrivateAreaAiModule {}
