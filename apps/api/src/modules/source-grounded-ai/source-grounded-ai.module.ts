// apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialIndexModule } from "../material-index/material-index.module.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerSchema,
} from "./schemas/source-grounded-ai-answer.schema.js";
import { SourceGroundedAiController } from "./source-grounded-ai.controller.js";
import { SourceGroundedAiService } from "./source-grounded-ai.service.js";

/**
 * Módulo de respostas IA com citações internas obrigatórias.
 */
@Module({
    imports: [
        AuthModule,
        AiModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        MaterialIndexModule,
        // O schema fica registado no módulo para persistir respostas com rastreabilidade.
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