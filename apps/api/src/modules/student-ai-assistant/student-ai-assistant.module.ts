/** Liga a organização transversal de conversas aos serviços de domínio existentes. */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import { AuditLogModule } from "../audit-log/audit-log.module.js";
import { AiModule } from "../ai/ai.module.js";
import { AiModelPoliciesModule } from "../ai-model-policies/ai-model-policies.module.js";
import { AiArtifact, AiArtifactSchema } from "../ai/schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    AiQuizAttemptSchema,
} from "../ai/schemas/ai-quiz-attempt.schema.js";
import {
    QuizGenerationJob,
    QuizGenerationJobSchema,
} from "../ai/schemas/quiz-generation-job.schema.js";
import { ClassAiModule } from "../class-ai/class-ai.module.js";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "../class-ai/schemas/class-ai-interaction.schema.js";
import { ClassesModule } from "../classes/classes.module.js";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module.js";
import {
    GuidedStudyRoomAiInteraction,
    GuidedStudyRoomAiInteractionSchema,
} from "../guided-study-rooms/schemas/guided-study-room-ai-interaction.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import { PrivateAreaAiModule } from "../private-area-ai/private-area-ai.module.js";
import { MaterialsModule } from "../materials/materials.module.js";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerSchema,
} from "../private-area-ai/schemas/private-area-ai-answer.schema.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { StudyGroupAiModule } from "../study-group-ai/study-group-ai.module.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerSchema,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import { StudyGroupsModule } from "../study-groups/study-groups.module.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import { StudyRoomsModule } from "../study-rooms/study-rooms.module.js";
import { SubjectsModule } from "../subjects/subjects.module.js";
import { StudentAiAssistantController } from "./student-ai-assistant.controller.js";
import { StudentStudyMaterialsController } from "./student-study-materials.controller.js";
import { StudentAiAssistantArtifactsService } from "./student-ai-assistant-artifacts.service.js";
import { StudentAiConversationForksService } from "./student-ai-conversation-forks.service.js";
import { StudentAiAssistantService } from "./student-ai-assistant.service.js";
import { StudentAiContextResolverService } from "./student-ai-context-resolver.service.js";
import { StudentAiArtifactContextService } from "./student-ai-artifact-context.service.js";
import { StudentStudyMaterialsService } from "./student-study-materials.service.js";
import {
    StudentAiConversation,
    StudentAiConversationSchema,
} from "./schemas/student-ai-conversation.schema.js";
import {
    StudentAiConversationForkInvitation,
    StudentAiConversationForkInvitationSchema,
} from "./schemas/student-ai-conversation-fork-invitation.schema.js";
import {
    StudentAiArtifactGenerationSnapshot,
    StudentAiArtifactGenerationSnapshotSchema,
} from "./schemas/student-ai-artifact-generation-snapshot.schema.js";

@Module({
    imports: [
        AuthModule,
        AuditLogModule,
        AiModule,
        AiModelPoliciesModule,
        ClassesModule,
        SubjectsModule,
        StudyAreasModule,
        StudyGroupsModule,
        StudyRoomsModule,
        GuidedStudyRoomsModule,
        ClassAiModule,
        PrivateAreaAiModule,
        StudyGroupAiModule,
        MaterialsModule,
        OfficialMaterialsModule,
        MongooseModule.forFeature([
            { name: StudentAiConversation.name, schema: StudentAiConversationSchema },
            {
                name: StudentAiConversationForkInvitation.name,
                schema: StudentAiConversationForkInvitationSchema,
            },
            {
                name: StudentAiArtifactGenerationSnapshot.name,
                schema: StudentAiArtifactGenerationSnapshotSchema,
            },
            { name: User.name, schema: UserSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: AiQuizAttempt.name, schema: AiQuizAttemptSchema },
            { name: QuizGenerationJob.name, schema: QuizGenerationJobSchema },
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
            { name: PrivateAreaAiAnswer.name, schema: PrivateAreaAiAnswerSchema },
            { name: StudyGroupAiAnswer.name, schema: StudyGroupAiAnswerSchema },
            { name: RoomAiInteraction.name, schema: RoomAiInteractionSchema },
            {
                name: GuidedStudyRoomAiInteraction.name,
                schema: GuidedStudyRoomAiInteractionSchema,
            },
            { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
        ]),
    ],
    controllers: [StudentAiAssistantController, StudentStudyMaterialsController],
    providers: [
        StudentAiAssistantService,
        StudentAiAssistantArtifactsService,
        StudentAiArtifactContextService,
        StudentStudyMaterialsService,
        StudentAiConversationForksService,
        StudentAiContextResolverService,
    ],
    exports: [StudentAiAssistantService],
})
export class StudentAiAssistantModule {}
