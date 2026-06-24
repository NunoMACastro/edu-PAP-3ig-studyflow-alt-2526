/**
 * Regista providers, controllers e schemas necessários ao módulo de ai.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { HistoryModule } from "../study/history.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { AdaptiveLearningController } from "./adaptive-learning.controller.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";
import { AiAreaProfileController } from "./ai-area-profile.controller.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import { AI_PROVIDER, createAiProvider } from "./providers/ai-provider.js";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "./schemas/adaptive-explanation.schema.js";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema.js";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    AiQuizAttemptSchema,
} from "./schemas/ai-quiz-attempt.schema.js";
import {
    LearningProfile,
    LearningProfileSchema,
} from "./schemas/learning-profile.schema.js";
import { StudyToolsController } from "./study-tools.controller.js";
import { StudyToolsService } from "./study-tools.service.js";
import { SummariesController } from "./summaries.controller.js";
import { SummariesService } from "./summaries.service.js";

/**
 * Módulo de IA da MF0.
 *
 * Este é o contrato herdável para MF1: preserva `AiAreaProfileService`,
 * `SummariesService`, `StudyToolsService` e exporta `AI_PROVIDER`.
 */
@Module({
    imports: [
        AuthModule,
        StudyAreasModule,
        MaterialsModule,
        HistoryModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: AiQuizAttempt.name, schema: AiQuizAttemptSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
            // O job de quiz fica persistido para sobreviver a refresh da UI e a múltiplas instâncias da API.
            { name: QuizGenerationJob.name, schema: QuizGenerationJobSchema },
        ]),
    ],
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
        AdaptiveLearningController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        // O service de jobs coordena a fila sem guardar estado em memória local do processo.
        QuizGenerationJobsService,
        AdaptiveLearningService,
        { provide: AI_PROVIDER, useFactory: createAiProvider },
    ],
    exports: [
        AI_PROVIDER,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        // Exportar este service prepara MF7 para observar jobs sem duplicar a lógica de geração.
        QuizGenerationJobsService,
        AdaptiveLearningService,
    ],
})
export class AiModule {}