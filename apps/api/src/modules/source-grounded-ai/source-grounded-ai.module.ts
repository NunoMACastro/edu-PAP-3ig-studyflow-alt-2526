/**
 * Regista providers, controllers e schemas necessários ao módulo de IA com fontes obrigatórias.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerSchema,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { SourceGroundedAiController } from "./source-grounded-ai.controller.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

/**
 * Módulo MF3 para respostas IA com citações internas obrigatórias.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        MaterialIndexModule,
        MongooseModule.forFeature([
            {
                name: SourceGroundedAiAnswer.name,
                schema: SourceGroundedAiAnswerSchema,
            },
        ]),
    ],
    controllers: [SourceGroundedAiController],
    providers: [SourceGroundedAiService],
    exports: [SourceGroundedAiService],
})
export class SourceGroundedAiModule {}
