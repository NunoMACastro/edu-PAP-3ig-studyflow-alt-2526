/**
 * Agrupa os módulos principais da API para expor a aplicação StudyFlow.
 */
import "./common/config/load-env.js";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./modules/auth/auth.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";
import { AdaptiveExplanationsModule } from "./modules/adaptive-explanations/adaptive-explanations.module.js";
import { AiGuardrailsModule } from "./modules/ai-guardrails/ai-guardrails.module.js";
import { CurriculumNavigationModule } from "./modules/curriculum-navigation/curriculum-navigation.module.js";
import { ExternalKnowledgeAiModule } from "./modules/external-knowledge-ai/external-knowledge-ai.module.js";
import { NotificationPreferencesModule } from "./modules/notification-preferences/notification-preferences.module.js";
import { SourceGroundedAiModule } from "./modules/source-grounded-ai/source-grounded-ai.module.js";
import { StudyAlertsModule } from "./modules/study-alerts/study-alerts.module.js";
import { StudyGroupAiModule } from "./modules/study-group-ai/study-group-ai.module.js";
import { StudyGroupMessagesModule } from "./modules/study-group-messages/study-group-messages.module.js";
import { StudyGroupSessionsModule } from "./modules/study-group-sessions/study-group-sessions.module.js";
import { StudyGroupsModule } from "./modules/study-groups/study-groups.module.js";
import { UnifiedSearchModule } from "./modules/unified-search/unified-search.module.js";
import { AccountDeletionModule } from "./modules/account-deletion/account-deletion.module.js";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module.js";
import { AiConsentsModule } from "./modules/ai-consents/ai-consents.module.js";
import { AiModelPoliciesModule } from "./modules/ai-model-policies/ai-model-policies.module.js";
import { AiQuotasModule } from "./modules/ai-quotas/ai-quotas.module.js";
import { AuditLogModule } from "./modules/audit-log/audit-log.module.js";
import { ContextNotificationsModule } from "./modules/context-notifications/context-notifications.module.js";
import { FollowUpAlertsModule } from "./modules/follow-up-alerts/follow-up-alerts.module.js";
import { NotificationPoliciesModule } from "./modules/notification-policies/notification-policies.module.js";
import { PrivacyDataExportsModule } from "./modules/privacy-data-exports/privacy-data-exports.module.js";

/**
 * Módulo raiz da API.
 *
 * A MF0 fica organizada por domínios, conforme RNF25: autenticação, alunos,
 * estudo individual, áreas de estudo, materiais e IA. A ligação MongoDB usa
 * `MONGODB_URI`, mantendo o endpoint local como valor de desenvolvimento.
 */
@Module({
    imports: [
        MongooseModule.forRoot(
            process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow",
        ),
        AuthModule,
        StudentsModule,
        StudyModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        ClassAiModule,
        ClassPostsModule,
        Mf2Module,
        AiGuardrailsModule,
        SourceGroundedAiModule,
        ExternalKnowledgeAiModule,
        AdaptiveExplanationsModule,
        StudyGroupsModule,
        StudyGroupMessagesModule,
        StudyGroupSessionsModule,
        StudyGroupAiModule,
        UnifiedSearchModule,
        CurriculumNavigationModule,
        NotificationPreferencesModule,
        StudyAlertsModule,
        AdminUsersModule,
        AuditLogModule,
        PrivacyDataExportsModule,
        AccountDeletionModule,
        AiConsentsModule,
        ContextNotificationsModule,
        FollowUpAlertsModule,
        NotificationPoliciesModule,
        AiModelPoliciesModule,
        AiQuotasModule,
    ],
})
export class AppModule {}
