/**
 * Regista providers, controllers e schemas necessários ao módulo de ai.
 */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountLifecycleModule } from "../../common/account-lifecycle/account-lifecycle.module.js";
import { AiConsentsModule } from "../ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "../ai-quotas/ai-quotas.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { HistoryModule } from "../study/history.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudentsModule } from "../students/students.module.js";
import { AdaptiveLearningController } from "./adaptive-learning.controller.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";
import { AiAreaProfileController } from "./ai-area-profile.controller.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import { ArtifactExportService } from "./artifact-export.service.js";
import { GovernedAiExecutionService } from "./governed-ai-execution.service.js";
import { StudentAiLegacyConversationService } from "./student-ai-legacy-conversation.service.js";
import {
    StudentAiConversation,
    StudentAiConversationSchema,
} from "../student-ai-assistant/schemas/student-ai-conversation.schema.js";
import { AI_PROVIDER, createAiProvider } from "./providers/ai-provider.js";
import { QuizGenerationJobsService } from "./quiz-generation-jobs.service.js";
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
import {
    QuizGenerationJob,
    QuizGenerationJobSchema,
} from "./schemas/quiz-generation-job.schema.js";
import { StudyToolsController } from "./study-tools.controller.js";
import { StudyToolsService } from "./study-tools.service.js";
import { SummariesController } from "./summaries.controller.js";
import { SummariesService } from "./summaries.service.js";
import {
    StudentAiArtifactGenerationSnapshot,
    StudentAiArtifactGenerationSnapshotSchema,
} from "../student-ai-assistant/schemas/student-ai-artifact-generation-snapshot.schema.js";

/**
 * Módulo de IA da MF0.
 *
 * Este é o contrato herdável para MF1: preserva `AiAreaProfileService`,
 * `SummariesService`, `StudyToolsService` e exporta apenas a fachada governada;
 * o token do provider permanece privado ao módulo.
 */
@Module({
    imports: [
        AccountLifecycleModule,
        AuthModule,
        AuditLogModule,
        StudyAreasModule,
        StudentsModule,
        MaterialsModule,
        HistoryModule,
        AiConsentsModule,
        AiModelPoliciesModule,
        AiQuotasModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: AiQuizAttempt.name, schema: AiQuizAttemptSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: StudentAiConversation.name, schema: StudentAiConversationSchema },
            {
                name: StudentAiArtifactGenerationSnapshot.name,
                schema: StudentAiArtifactGenerationSnapshotSchema,
            },
            {
                name: AdaptiveExplanation.name,
                schema: AdaptiveExplanationSchema,
            },
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
        ArtifactExportService,
        QuizGenerationJobsService,
        AdaptiveLearningService,
        GovernedAiExecutionService,
        StudentAiLegacyConversationService,
        { provide: AI_PROVIDER, useFactory: createAiProvider },
    ],
    exports: [
        GovernedAiExecutionService,
        StudentAiLegacyConversationService,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        ArtifactExportService,
        QuizGenerationJobsService,
        AdaptiveLearningService,
    ],
})
export class AiModule {}
