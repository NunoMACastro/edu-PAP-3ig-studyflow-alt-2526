/**
 * Prova integral do registry RGPD sobre os schemas reais e um Mongo replica set.
 *
 * Ao contrário dos testes unitários do service, este ficheiro não fabrica
 * models a partir do próprio registry. A lista de schemas é explícita e é
 * cruzada com todos os `MongooseModule.forFeature` existentes na aplicação.
 */
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
    createConnection,
    Types,
    type Connection,
    type Model,
    type Schema,
} from "mongoose";
import { AccountLifecycleBarrierService } from "../../common/account-lifecycle/account-lifecycle-barrier.service.js";
import { StructuredEventService } from "../../common/observability/structured-event.service.js";
import { AccountDeletionService } from "../account-deletion/account-deletion.service.js";
import {
    AccountDeletionRequest,
    AccountDeletionRequestSchema,
} from "../account-deletion/schemas/account-deletion-request.schema.js";
import {
    UserRoleChange,
    UserRoleChangeSchema,
} from "../admin-users/schemas/user-role-change.schema.js";
import { AiConsent, AiConsentSchema } from "../ai-consents/schemas/ai-consent.schema.js";
import {
    AiContentReview,
    AiContentReviewSchema,
} from "../ai-content-reviews/schemas/ai-content-review.schema.js";
import {
    ApprovedAiQuizAttempt,
    ApprovedAiQuizAttemptSchema,
} from "../ai-content-reviews/schemas/approved-ai-quiz-attempt.schema.js";
import {
    AiGuardrailCheck,
    AiGuardrailCheckSchema,
} from "../ai-guardrails/schemas/ai-guardrail-check.schema.js";
import {
    AiModelPolicy,
    AiModelPolicySchema,
} from "../ai-model-policies/schemas/ai-model-policy.schema.js";
import {
    AiQuotaDefaultPolicy,
    AiQuotaDefaultPolicySchema,
} from "../ai-quotas/schemas/ai-quota-default-policy.schema.js";
import {
    AiQuotaPolicy,
    AiQuotaPolicySchema,
} from "../ai-quotas/schemas/ai-quota-policy.schema.js";
import {
    AiQuotaUsage,
    AiQuotaUsageSchema,
} from "../ai-quotas/schemas/ai-quota-usage.schema.js";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "../ai/schemas/adaptive-explanation.schema.js";
import { AiAreaProfile, AiAreaProfileSchema } from "../ai/schemas/ai-area-profile.schema.js";
import { AiArtifact, AiArtifactSchema } from "../ai/schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    AiQuizAttemptSchema,
} from "../ai/schemas/ai-quiz-attempt.schema.js";
import {
    LearningProfile,
    LearningProfileSchema,
} from "../ai/schemas/learning-profile.schema.js";
import {
    QuizGenerationJob,
    QuizGenerationJobSchema,
} from "../ai/schemas/quiz-generation-job.schema.js";
import {
    QuizGenerationJobsService,
    type QuizGenerationStudyToolsPort,
} from "../ai/quiz-generation-jobs.service.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditEvent, AuditEventSchema } from "../audit-log/schemas/audit-event.schema.js";
import { createInMemorySessionStore } from "../auth/session-store.js";
import { SessionService } from "../auth/session.service.js";
import { User, UserSchema } from "../auth/schemas/user.schema.js";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "../class-ai/schemas/class-ai-interaction.schema.js";
import { ClassPost, ClassPostSchema } from "../class-posts/schemas/class-post.schema.js";
import {
    ClassLearningActivity,
    ClassLearningActivitySchema,
} from "../class-learning-activity/schemas/class-learning-activity.schema.js";
import {
    StudentClassActivityState,
    StudentClassActivityStateSchema,
} from "../class-learning-activity/schemas/student-class-activity-state.schema.js";
import {
    ClassProgressNote,
    ClassProgressNoteSchema,
} from "../class-progress/schemas/class-progress-note.schema.js";
import {
    ClassProject,
    ClassProjectSchema,
} from "../class-projects/schemas/class-project.schema.js";
import { StudentClassProjectState, StudentClassProjectStateSchema } from "../class-projects/schemas/student-class-project-state.schema.js";
import { SchoolClass, SchoolClassSchema } from "../classes/schemas/school-class.schema.js";
import {
    ClassMembership,
    ClassMembershipSchema,
} from "../classes/schemas/class-membership.schema.js";
import {
    ContextNotification,
    ContextNotificationSchema,
} from "../context-notifications/schemas/context-notification.schema.js";
import {
    ContextNotificationRecipient,
    ContextNotificationRecipientSchema,
} from "../context-notifications/schemas/context-notification-recipient.schema.js";
import {
    NotificationOutboxEvent,
    NotificationOutboxEventSchema,
} from "../context-notifications/schemas/notification-outbox-event.schema.js";
import {
    CurriculumNavigationLog,
    CurriculumNavigationLogSchema,
} from "../curriculum-navigation/schemas/curriculum-navigation-log.schema.js";
import {
    ExternalKnowledgeAiAnswer,
    ExternalKnowledgeAiAnswerSchema,
} from "../external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.js";
import {
    FollowUpAlertRule,
    FollowUpAlertRuleSchema,
} from "../follow-up-alerts/schemas/follow-up-alert-rule.schema.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomSchema,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
import {
    GuidedStudyRoomAiInteraction,
    GuidedStudyRoomAiInteractionSchema,
} from "../guided-study-rooms/schemas/guided-study-room-ai-interaction.schema.js";
import {
    GuidedStudyRoomParticipation,
    GuidedStudyRoomParticipationSchema,
} from "../guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import {
    MaterialContext,
    MaterialContextSchema,
} from "../material-contexts/schemas/material-context.schema.js";
import {
    MaterialIndexJob,
    MaterialIndexJobSchema,
} from "../material-index/schemas/material-index-job.schema.js";
import {
    MaterialStructure,
    MaterialStructureSchema,
} from "../material-structure/schemas/material-structure.schema.js";
import {
    MaterialVersion,
    MaterialVersionSchema,
} from "../material-versions/schemas/material-version.schema.js";
import { MaterialStorageService } from "../materials/material-storage.service.js";
import { Material, MaterialSchema } from "../materials/schemas/material.schema.js";
import {
    NotificationChannelPolicy,
    NotificationChannelPolicySchema,
} from "../notification-policies/schemas/notification-channel-policy.schema.js";
import {
    NotificationPreference,
    NotificationPreferenceSchema,
} from "../notification-preferences/schemas/notification-preference.schema.js";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "../official-materials/schemas/official-material.schema.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptSchema,
} from "../official-tests/schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestSchema,
} from "../official-tests/schemas/official-test.schema.js";
import {
    DataExportRequest,
    DataExportRequestSchema,
} from "../privacy-data-exports/schemas/data-export-request.schema.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerSchema,
} from "../private-area-ai/schemas/private-area-ai-answer.schema.js";
import {
    ProjectAiPlan,
    ProjectAiPlanSchema,
} from "../project-ai/schemas/project-ai-plan.schema.js";
import {
    SourceGroundedAiAnswer,
    SourceGroundedAiAnswerSchema,
} from "../source-grounded-ai/schemas/source-grounded-ai-answer.schema.js";
import {
    StudentProfile,
    StudentProfileSchema,
} from "../students/schemas/student-profile.schema.js";
import {
    StudentRecentContext,
    StudentRecentContextSchema,
} from "../student-experience/schemas/student-recent-context.schema.js";
import {
    StudentAiConversation,
    StudentAiConversationSchema,
} from "../student-ai-assistant/schemas/student-ai-conversation.schema.js";
import {
    StudentAiConversationForkInvitation,
    StudentAiConversationForkInvitationSchema,
} from "../student-ai-assistant/schemas/student-ai-conversation-fork-invitation.schema.js";
import {
    StudentAiArtifactGenerationSnapshot,
    StudentAiArtifactGenerationSnapshotSchema,
} from "../student-ai-assistant/schemas/student-ai-artifact-generation-snapshot.schema.js";
import {
    StudyAlertRead,
    StudyAlertReadSchema,
} from "../study-alerts/schemas/study-alert-read.schema.js";
import { StudyArea, StudyAreaSchema } from "../study-areas/schemas/study-area.schema.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerSchema,
} from "../study-group-ai/schemas/study-group-ai-answer.schema.js";
import {
    StudyGroupMessage,
    StudyGroupMessageSchema,
} from "../study-group-messages/schemas/study-group-message.schema.js";
import {
    StudentStudyGroupChatReadState,
    StudentStudyGroupChatReadStateSchema,
} from "../study-group-messages/schemas/student-study-group-chat-read-state.schema.js";
import {
    StudyGroupSession,
    StudyGroupSessionSchema,
} from "../study-group-sessions/schemas/study-group-session.schema.js";
import {
    RoomAiInteraction,
    RoomAiInteractionSchema,
} from "../study-rooms/schemas/room-ai-interaction.schema.js";
import { RoomShare, RoomShareSchema } from "../study-rooms/schemas/room-share.schema.js";
import { StudyRoom, StudyRoomSchema } from "../study-rooms/schemas/study-room.schema.js";
import { StudyEvent, StudyEventSchema } from "../study/schemas/study-event.schema.js";
import { StudyGoal, StudyGoalSchema } from "../study/schemas/study-goal.schema.js";
import {
    StudyRoutine,
    StudyRoutineSchema,
} from "../study/schemas/study-routine.schema.js";
import { Subject, SubjectSchema } from "../subjects/schemas/subject.schema.js";
import {
    TeacherAiVoice,
    TeacherAiVoiceSchema,
} from "../teacher-ai/schemas/teacher-ai-voice.schema.js";
import {
    TeacherClassAiVoice,
    TeacherClassAiVoiceSchema,
} from "../teacher-ai/schemas/teacher-class-ai-voice.schema.js";
import {
    TeacherStudentChatMessage,
    TeacherStudentChatMessageSchema,
} from "../teacher-student-chat/schemas/teacher-student-chat-message.schema.js";
import {
    TeacherStudentChatThread,
    TeacherStudentChatThreadSchema,
} from "../teacher-student-chat/schemas/teacher-student-chat-thread.schema.js";
import { StudentSubjectChatReadState, StudentSubjectChatReadStateSchema } from "../teacher-student-chat/schemas/student-subject-chat-read-state.schema.js";
import {
    UnifiedSearchLog,
    UnifiedSearchLogSchema,
} from "../unified-search/schemas/unified-search-log.schema.js";
import { UsersService } from "../users/users.service.js";
import {
    PERSONAL_DATA_RETENTION_DAYS,
    PersonalDataRegistryService,
} from "./personal-data-registry.service.js";
import {
    PersonalDataRetention,
    PersonalDataRetentionSchema,
} from "./schemas/personal-data-retention.schema.js";

jest.setTimeout(180_000);

type RealModelDefinition = {
    name: string;
    schema: Schema;
};

const REAL_MODEL_DEFINITIONS: readonly RealModelDefinition[] = [
    { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
    { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
    { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
    { name: AiArtifact.name, schema: AiArtifactSchema },
    { name: AiConsent.name, schema: AiConsentSchema },
    { name: AiContentReview.name, schema: AiContentReviewSchema },
    { name: ApprovedAiQuizAttempt.name, schema: ApprovedAiQuizAttemptSchema },
    { name: AiGuardrailCheck.name, schema: AiGuardrailCheckSchema },
    { name: AiModelPolicy.name, schema: AiModelPolicySchema },
    { name: AiQuizAttempt.name, schema: AiQuizAttemptSchema },
    {
        name: AiQuotaDefaultPolicy.name,
        schema: AiQuotaDefaultPolicySchema,
    },
    { name: AiQuotaPolicy.name, schema: AiQuotaPolicySchema },
    { name: AiQuotaUsage.name, schema: AiQuotaUsageSchema },
    { name: AuditEvent.name, schema: AuditEventSchema },
    { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
    { name: ClassLearningActivity.name, schema: ClassLearningActivitySchema },
    { name: ClassPost.name, schema: ClassPostSchema },
    { name: ClassProgressNote.name, schema: ClassProgressNoteSchema },
    { name: ClassProject.name, schema: ClassProjectSchema },
    { name: StudentClassProjectState.name, schema: StudentClassProjectStateSchema },
    { name: ClassMembership.name, schema: ClassMembershipSchema },
    { name: ContextNotification.name, schema: ContextNotificationSchema },
    {
        name: ContextNotificationRecipient.name,
        schema: ContextNotificationRecipientSchema,
    },
    { name: CurriculumNavigationLog.name, schema: CurriculumNavigationLogSchema },
    { name: DataExportRequest.name, schema: DataExportRequestSchema },
    { name: ExternalKnowledgeAiAnswer.name, schema: ExternalKnowledgeAiAnswerSchema },
    { name: FollowUpAlertRule.name, schema: FollowUpAlertRuleSchema },
    { name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema },
    {
        name: GuidedStudyRoomAiInteraction.name,
        schema: GuidedStudyRoomAiInteractionSchema,
    },
    {
        name: GuidedStudyRoomParticipation.name,
        schema: GuidedStudyRoomParticipationSchema,
    },
    { name: LearningProfile.name, schema: LearningProfileSchema },
    { name: Material.name, schema: MaterialSchema },
    { name: MaterialContext.name, schema: MaterialContextSchema },
    { name: MaterialIndexJob.name, schema: MaterialIndexJobSchema },
    { name: MaterialStructure.name, schema: MaterialStructureSchema },
    { name: MaterialVersion.name, schema: MaterialVersionSchema },
    { name: NotificationChannelPolicy.name, schema: NotificationChannelPolicySchema },
    { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
    { name: NotificationOutboxEvent.name, schema: NotificationOutboxEventSchema },
    { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
    { name: OfficialTest.name, schema: OfficialTestSchema },
    { name: OfficialTestAttempt.name, schema: OfficialTestAttemptSchema },
    { name: PersonalDataRetention.name, schema: PersonalDataRetentionSchema },
    { name: PrivateAreaAiAnswer.name, schema: PrivateAreaAiAnswerSchema },
    { name: ProjectAiPlan.name, schema: ProjectAiPlanSchema },
    { name: QuizGenerationJob.name, schema: QuizGenerationJobSchema },
    { name: RoomAiInteraction.name, schema: RoomAiInteractionSchema },
    { name: RoomShare.name, schema: RoomShareSchema },
    { name: SchoolClass.name, schema: SchoolClassSchema },
    { name: SourceGroundedAiAnswer.name, schema: SourceGroundedAiAnswerSchema },
    { name: StudentProfile.name, schema: StudentProfileSchema },
    { name: StudentRecentContext.name, schema: StudentRecentContextSchema },
    { name: StudentAiConversation.name, schema: StudentAiConversationSchema },
    {
        name: StudentAiArtifactGenerationSnapshot.name,
        schema: StudentAiArtifactGenerationSnapshotSchema,
    },
    {
        name: StudentAiConversationForkInvitation.name,
        schema: StudentAiConversationForkInvitationSchema,
    },
    {
        name: StudentClassActivityState.name,
        schema: StudentClassActivityStateSchema,
    },
    { name: StudyAlertRead.name, schema: StudyAlertReadSchema },
    { name: StudyArea.name, schema: StudyAreaSchema },
    { name: StudyEvent.name, schema: StudyEventSchema },
    { name: StudyGoal.name, schema: StudyGoalSchema },
    { name: StudyGroupAiAnswer.name, schema: StudyGroupAiAnswerSchema },
    { name: StudyGroupMessage.name, schema: StudyGroupMessageSchema },
    { name: StudentStudyGroupChatReadState.name, schema: StudentStudyGroupChatReadStateSchema },
    { name: StudyGroupSession.name, schema: StudyGroupSessionSchema },
    { name: StudyRoom.name, schema: StudyRoomSchema },
    { name: StudyRoutine.name, schema: StudyRoutineSchema },
    { name: Subject.name, schema: SubjectSchema },
    { name: TeacherAiVoice.name, schema: TeacherAiVoiceSchema },
    { name: TeacherClassAiVoice.name, schema: TeacherClassAiVoiceSchema },
    { name: TeacherStudentChatMessage.name, schema: TeacherStudentChatMessageSchema },
    { name: StudentSubjectChatReadState.name, schema: StudentSubjectChatReadStateSchema },
    { name: TeacherStudentChatThread.name, schema: TeacherStudentChatThreadSchema },
    { name: UnifiedSearchLog.name, schema: UnifiedSearchLogSchema },
    { name: User.name, schema: UserSchema },
    { name: UserRoleChange.name, schema: UserRoleChangeSchema },
] as const;

/** Campos independentes usados para ligar uma fixture real ao titular. */
const SUBJECT_SCALAR_FIELDS: Readonly<Record<string, readonly string[]>> = {
    User: ["_id"],
    StudentProfile: ["userId"],
    StudentRecentContext: ["userId"],
    StudentAiConversation: ["studentId"],
    StudentAiArtifactGenerationSnapshot: ["userId"],
    StudentAiConversationForkInvitation: [
        "sourceStudentId",
        "recipientStudentId",
    ],
    StudyArea: ["userId"],
    Material: ["userId"],
    StudyEvent: ["userId"],
    StudyGoal: ["userId"],
    StudyRoutine: ["userId"],
    StudyAlertRead: ["userId"],
    NotificationPreference: ["userId"],
    AdaptiveExplanation: ["userId"],
    AiAreaProfile: ["userId"],
    AiArtifact: ["userId"],
    AiQuizAttempt: ["userId"],
    LearningProfile: ["userId"],
    QuizGenerationJob: ["userId"],
    PrivateAreaAiAnswer: ["studentId"],
    ExternalKnowledgeAiAnswer: ["studentId"],
    SourceGroundedAiAnswer: ["actorId"],
    ClassAiInteraction: ["studentId"],
    ProjectAiPlan: ["studentId"],
    StudyGroupAiAnswer: ["studentId"],
    StudyGroupMessage: ["authorStudentId"],
    StudentStudyGroupChatReadState: ["studentId"],
    StudyGroupSession: ["createdByStudentId"],
    RoomAiInteraction: ["studentId"],
    RoomShare: ["authorStudentId"],
    TeacherStudentChatMessage: ["authorUserId"],
    StudentSubjectChatReadState: ["studentId"],
    MaterialContext: ["studentId", "teacherId"],
    MaterialIndexJob: ["userId", "teacherId"],
    MaterialVersion: ["userId", "teacherId"],
    MaterialStructure: [],
    AiConsent: ["userId", "actorId"],
    AiGuardrailCheck: ["actorId"],
    AiQuotaPolicy: ["targetId"],
    AiQuotaUsage: ["targetId"],
    DataExportRequest: ["userId"],
    AuditEvent: ["actorId", "resourceId"],
    UserRoleChange: ["actorId", "targetUserId"],
    SchoolClass: ["teacherId"],
    ClassMembership: ["studentId", "joinedBy", "removedBy"],
    StudyRoom: ["ownerStudentId"],
    ContextNotification: ["actorId"],
    ContextNotificationRecipient: ["recipientId"],
    NotificationOutboxEvent: ["actorId"],
    Subject: ["teacherId"],
    ClassPost: ["teacherId"],
    ClassProgressNote: ["teacherId"],
    ClassProject: ["teacherId"],
    StudentClassProjectState: ["studentId"],
    AiContentReview: ["teacherId"],
    ApprovedAiQuizAttempt: ["studentId"],
    ClassLearningActivity: ["studentId"],
    StudentClassActivityState: ["studentId"],
    FollowUpAlertRule: ["teacherId"],
    GuidedStudyRoom: ["teacherId"],
    GuidedStudyRoomAiInteraction: ["studentId"],
    GuidedStudyRoomParticipation: ["studentId"],
    OfficialMaterial: ["teacherId"],
    OfficialTest: ["teacherId"],
    OfficialTestAttempt: ["studentId"],
    TeacherAiVoice: ["teacherId"],
    TeacherClassAiVoice: ["teacherId"],
    TeacherStudentChatThread: ["teacherId"],
    CurriculumNavigationLog: ["actorId"],
    UnifiedSearchLog: ["actorId"],
};

const SUBJECT_MEMBERSHIP_FIELDS: Readonly<Record<string, readonly string[]>> = {
    SchoolClass: ["studentIds"],
    StudyRoom: ["memberIds"],
    ContextNotification: ["recipientIds", "suppressedRecipientIds"],
    NotificationOutboxEvent: ["recipientIdsSnapshot"],
};

const NON_SUBJECT_MODELS = new Set([
    "AccountDeletionRequest",
    "AiModelPolicy",
    "AiQuotaDefaultPolicy",
    "NotificationChannelPolicy",
    "PersonalDataRetention",
]);

const MATERIAL_RELATED_MODELS = new Set([
    "MaterialContext",
    "MaterialIndexJob",
    "MaterialStructure",
    "MaterialVersion",
    "RoomShare",
]);

/** Models removidos por `groupId`/`roomId` quando a sala deixa de existir. */
const EXCLUSIVE_ROOM_CASCADE_MODELS = new Set([
    RoomAiInteraction.name,
    RoomShare.name,
    StudyGroupAiAnswer.name,
    StudyGroupMessage.name,
    StudentStudyGroupChatReadState.name,
    StudyGroupSession.name,
]);

describe("PersonalDataRegistryService — integração all-model real", () => {
    let replicaSet: MongoMemoryReplSet;
    let connection: Connection;
    let storageRoot: string;
    let previousStorageRoot: string | undefined;

    beforeAll(async () => {
        previousStorageRoot = process.env.MATERIALS_STORAGE_DIR;
        storageRoot = await mkdtemp(
            join(tmpdir(), "studyflow-g4-integration-"),
        );
        process.env.MATERIALS_STORAGE_DIR = storageRoot;
        replicaSet = await MongoMemoryReplSet.create({
            replSet: {
                count: 1,
                name: "studyflow-g4-registry-rs",
                storageEngine: "wiredTiger",
            },
        });
        connection = await createConnection(
            replicaSet.getUri("studyflow_g4_registry"),
        ).asPromise();
        for (const definition of REAL_MODEL_DEFINITIONS) {
            connection.model(definition.name, definition.schema);
        }
        for (const model of Object.values(connection.models)) {
            await model.createIndexes();
        }
    });

    afterAll(async () => {
        await connection?.close();
        await replicaSet?.stop();
        await rm(storageRoot, { recursive: true, force: true });
        if (previousStorageRoot === undefined) {
            delete process.env.MATERIALS_STORAGE_DIR;
        } else {
            process.env.MATERIALS_STORAGE_DIR = previousStorageRoot;
        }
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        for (const model of Object.values(connection.models)) {
            await model.createIndexes();
        }
        await rm(storageRoot, { recursive: true, force: true });
    });

    it("cobre os schemas ligados e executa export/delete/storage/sessões/TTL", async () => {
        const modelNames = Object.keys(connection.models).sort();
        expect(modelNames).toEqual(
            REAL_MODEL_DEFINITIONS.map(({ name }) => name).sort(),
        );
        await expect(readRegisteredModelNamesFromModules()).resolves.toEqual(
            modelNames,
        );

        const storage = new MaterialStorageService();
        const retentionModel = model<PersonalDataRetention>(
            connection,
            PersonalDataRetention.name,
        );
        const registry = new PersonalDataRegistryService(
            connection,
            retentionModel as never,
            storage,
        );
        expect(() => registry.validateCoverage()).not.toThrow();
        expect(
            registry.registryManifest().map(({ model: name }) => name).sort(),
        ).toEqual(modelNames);

        const subjectId = new Types.ObjectId();
        const exclusiveRoomId = new Types.ObjectId();
        const sharedRoomId = new Types.ObjectId();
        const remainingMemberId = new Types.ObjectId();
        const actor = {
            id: subjectId.toHexString(),
            email: "g4.integration@example.test",
            role: "STUDENT" as const,
        };
        const userModel = model<User>(connection, User.name);
        await userModel.create({
            _id: subjectId,
            email: actor.email,
            passwordHash: "integration-only-not-a-real-hash",
            role: actor.role,
            authProvider: "local",
            accountStatus: "ACTIVE",
            sessionVersion: 0,
            roleInvariantVersion: 0,
        });

        const materialBytes = Buffer.from("%PDF-prova RGPD integral");
        const staged = await storage.stage(actor.id, {
            buffer: materialBytes,
            mimetype: "application/pdf",
            originalname: "prova-rgpd.pdf",
            size: materialBytes.byteLength,
        } as Express.Multer.File);
        const materialId = new Types.ObjectId();
        const indexJobId = new Types.ObjectId();
        await model<Material>(connection, Material.name).collection.insertOne({
            _id: materialId,
            userId: subjectId,
            studyAreaId: new Types.ObjectId(),
            type: "PDF",
            title: "Prova RGPD",
            status: "READY",
            storageKey: staged.storageKey,
            storageSha256: createHash("sha256").update(materialBytes).digest("hex"),
            originalName: "prova-rgpd.pdf",
            mimeType: "application/pdf",
            sizeBytes: materialBytes.byteLength,
        });
        await storage.commit(staged);

        const seededIds = await seedEveryRemainingModel(
            connection,
            subjectId,
            materialId,
            indexJobId,
            exclusiveRoomId,
        );
        seededIds.set(User.name, subjectId);
        seededIds.set(Material.name, materialId);
        expect(seededIds.size).toBe(modelNames.length);

        const sharedContextIds = await seedSharedRoomContext({
            connection,
            subjectId,
            sharedRoomId,
            remainingMemberId,
        });

        const exportDownload = await registry.createExportDownload(actor.id);
        const exported = await readExport(exportDownload);
        expect(Object.keys(exported.collections)).toHaveLength(modelNames.length);
        expect(exported.storedFiles).toEqual([
            expect.objectContaining({
                materialReference: materialId.toHexString(),
                sizeBytes: materialBytes.byteLength,
                contentBase64: materialBytes.toString("base64"),
            }),
        ]);
        expect(JSON.stringify(exported)).not.toMatch(
            /passwordHash|storageKey|storageSha256|sessionVersion/,
        );
        for (const name of Object.keys(SUBJECT_SCALAR_FIELDS)) {
            expect(exported.collections[name]).not.toHaveLength(0);
        }
        for (const name of NON_SUBJECT_MODELS) {
            expect(exported.collections[name]).toEqual([]);
        }
        const exportedAttempt = exported.collections[
            OfficialTestAttempt.name
        ][0] as { results?: Array<Record<string, unknown>> };
        expect(exportedAttempt.results).toEqual([
            {
                questionIndex: 0,
                selectedOptionIndex: 1,
            },
        ]);
        expect(JSON.stringify(exportedAttempt)).not.toMatch(
            /correctOptionIndex|isCorrect/,
        );
        for (const name of [
            ClassAiInteraction.name,
            GuidedStudyRoomAiInteraction.name,
            ProjectAiPlan.name,
        ]) {
            const exportedInteraction = exported.collections[name][0] as Record<
                string,
                unknown
            >;
            expect(exportedInteraction).not.toHaveProperty("voiceSource");
            expect(exportedInteraction).not.toHaveProperty("voiceTone");
            expect(exportedInteraction).not.toHaveProperty("voiceDetailLevel");
            expect(exportedInteraction).not.toHaveProperty("voiceRulesApplied");
            expect(JSON.stringify(exportedInteraction)).not.toContain(
                `teacher-voice-rule-${name}-never-export`,
            );
        }

        const usersService = new UsersService(userModel as never);
        const sessionStore = createInMemorySessionStore();
        const sessionService = new SessionService(sessionStore, usersService);
        const firstSession = await sessionService.createSession(actor);
        const secondSession = await sessionService.createSession(actor);
        const auditLog = new AuditLogService(
            model<AuditEvent>(connection, AuditEvent.name) as never,
            new StructuredEventService(),
        );
        const deletion = new AccountDeletionService(
            model<AccountDeletionRequest>(
                connection,
                AccountDeletionRequest.name,
            ) as never,
            userModel as never,
            sessionService,
            auditLog,
            connection,
            registry,
            new AccountLifecycleBarrierService(),
        );

        const result = await deletion.deleteMine(actor, firstSession);
        expect(result).toMatchObject({
            sessionRevoked: true,
            physicalFilesDeleted: 1,
            physicalFilesPending: 0,
            registryVersion: expect.any(String),
        });
        await expect(sessionService.requireSession(firstSession)).rejects.toMatchObject({
            response: { code: "UNAUTHENTICATED" },
        });
        await expect(sessionService.requireSession(secondSession)).rejects.toMatchObject({
            response: { code: "SESSION_REVOKED" },
        });
        await expect(storage.read(staged.storageKey)).rejects.toMatchObject({
            code: "ENOENT",
        });

        const manifestByModel = new Map(
            registry.registryManifest().map((entry) => [entry.model, entry.policy]),
        );
        for (const [name, id] of seededIds) {
            const document = await model(connection, name).collection.findOne({
                _id: id,
            });
            const policy = manifestByModel.get(name);
            if (
                policy === "DELETE" ||
                name === StudyRoom.name ||
                EXCLUSIVE_ROOM_CASCADE_MODELS.has(name)
            ) {
                expect(document).toBeNull();
            } else {
                expect(document).not.toBeNull();
            }
            if (
                policy === "TOMBSTONE" &&
                !EXCLUSIVE_ROOM_CASCADE_MODELS.has(name)
            ) {
                expect(document).toMatchObject({ tombstonedAt: expect.any(Date) });
            }
            if (policy === "RETAIN_RECEIPT_90_DAYS") {
                expect(document).toMatchObject({
                    anonymizedAt: expect.any(Date),
                    expiresAt: expect.any(Date),
                });
            }
        }

        const sharedRoom = await model(connection, StudyRoom.name).collection.findOne({
            _id: sharedRoomId,
        });
        expect(sharedRoom).toMatchObject({
            ownerStudentId: remainingMemberId,
            memberIds: [remainingMemberId],
        });

        const sharedMessage = await model(
            connection,
            StudyGroupMessage.name,
        ).collection.findOne({ _id: sharedContextIds.messageId });
        expect(sharedMessage).toMatchObject({
            groupId: sharedRoomId,
            tombstonedAt: expect.any(Date),
        });
        expect(sharedMessage).not.toHaveProperty("authorStudentId");
        expect(sharedMessage).not.toHaveProperty("text");

        const sharedShare = await model(
            connection,
            RoomShare.name,
        ).collection.findOne({ _id: sharedContextIds.shareId });
        expect(sharedShare).toMatchObject({
            roomId: sharedRoomId,
            tombstonedAt: expect.any(Date),
            usableByAi: false,
        });
        expect(sharedShare).not.toHaveProperty("authorStudentId");
        expect(sharedShare).not.toHaveProperty("textContent");

        const sharedSession = await model(
            connection,
            StudyGroupSession.name,
        ).collection.findOne({ _id: sharedContextIds.sessionId });
        expect(sharedSession).toMatchObject({
            groupId: sharedRoomId,
            createdByStudentId: expect.any(Types.ObjectId),
        });
        expect(String(sharedSession?.createdByStudentId)).not.toBe(actor.id);

        await expect(
            model(connection, StudyGroupAiAnswer.name).collection.findOne({
                _id: sharedContextIds.aiAnswerId,
            }),
        ).resolves.toBeNull();
        await expect(
            model(connection, RoomAiInteraction.name).collection.findOne({
                _id: sharedContextIds.interactionId,
            }),
        ).resolves.toBeNull();

        const deletedUser = await userModel.findById(subjectId).lean();
        expect(deletedUser).toMatchObject({
            accountStatus: "DELETED",
            role: "STUDENT",
            email: expect.stringMatching(/^deleted-/),
        });
        const serializedRemaining = JSON.stringify(
            await readAllDocumentsExceptUser(connection),
        );
        expect(serializedRemaining).not.toContain(actor.id);

        const retention = await retentionModel
            .findOne({ registryVersion: result.registryVersion })
            .lean();
        expect(retention?.receiptReference).not.toBe(actor.id);
        expect(retention?.receiptReference).not.toBe(result.deletionReference);
        expect(retention?.expiresAt.getTime()).toBeGreaterThanOrEqual(
            Date.now() +
                (PERSONAL_DATA_RETENTION_DAYS - 1) * 24 * 60 * 60 * 1000,
        );
        const deletionReceipt = await model<AccountDeletionRequest>(
            connection,
            AccountDeletionRequest.name,
        )
            .findOne({ reference: result.deletionReference })
            .lean();
        expect(deletionReceipt).not.toHaveProperty("userId");
        await expectTtlIndex(connection, AuditEvent.name);
        await expectTtlIndex(connection, AccountDeletionRequest.name);
        await expectTtlIndex(connection, PersonalDataRetention.name);
    });

    it("espera por quiz com provider atrasado e apaga todos os efeitos antes de revogar", async () => {
        const storage = new MaterialStorageService();
        const retentionModel = model<PersonalDataRetention>(
            connection,
            PersonalDataRetention.name,
        );
        const registry = new PersonalDataRegistryService(
            connection,
            retentionModel as never,
            storage,
        );
        registry.validateCoverage();

        const subjectId = new Types.ObjectId();
        const studyAreaId = new Types.ObjectId();
        const actor = {
            id: subjectId.toHexString(),
            email: "quiz-delete-race@example.test",
            role: "STUDENT" as const,
        };
        const userModel = model<User>(connection, User.name);
        await userModel.create({
            _id: subjectId,
            email: actor.email,
            passwordHash: "integration-only-not-a-real-hash",
            role: actor.role,
            authProvider: "local",
            accountStatus: "ACTIVE",
            sessionVersion: 0,
            roleInvariantVersion: 0,
        });

        const usersService = new UsersService(userModel as never);
        const sessionService = new SessionService(
            createInMemorySessionStore(),
            usersService,
        );
        const firstSession = await sessionService.createSession(actor);
        const secondSession = await sessionService.createSession(actor);
        const auditLog = new AuditLogService(
            model<AuditEvent>(connection, AuditEvent.name) as never,
            new StructuredEventService(),
        );
        const accountLifecycleBarrier = new AccountLifecycleBarrierService();
        const deletion = new AccountDeletionService(
            model<AccountDeletionRequest>(
                connection,
                AccountDeletionRequest.name,
            ) as never,
            userModel as never,
            sessionService,
            auditLog,
            connection,
            registry,
            accountLifecycleBarrier,
        );

        const jobModel = model<QuizGenerationJob>(
            connection,
            QuizGenerationJob.name,
        );
        await jobModel.create({
            userId: subjectId,
            studyAreaId,
            status: "QUEUED",
            topic: "concorrência RGPD",
            attempts: 0,
            maxAttempts: 3,
            availableAt: new Date(),
            activeKey: `quiz:${actor.id}:${studyAreaId.toHexString()}:integration`,
            leaseToken: 0,
        });

        const providerStarted = deferred<void>();
        const providerRelease = deferred<void>();
        const artifactModel = model<AiArtifact>(connection, AiArtifact.name);
        const studyEventModel = model<StudyEvent>(connection, StudyEvent.name);
        const studyToolsPort: QuizGenerationStudyToolsPort = {
            assertGenerationReady: jest.fn().mockResolvedValue(undefined),
            generateStudyTool: jest.fn(async (_userId, _areaId, _input, generationKey) => {
                providerStarted.resolve();
                await providerRelease.promise;
                const artifact = await artifactModel.create({
                    userId: subjectId,
                    studyAreaId,
                    type: "QUIZ",
                    contentJson: { questions: [] },
                    sourcesJson: [],
                    generationKey,
                });
                await studyEventModel.create({
                    userId: subjectId,
                    type: "STUDY_TOOL_GENERATED",
                    title: "Quiz gerado durante a corrida",
                    occurredAt: new Date(),
                });
                return {
                    _id: String(artifact._id),
                    studyAreaId: studyAreaId.toHexString(),
                    type: "QUIZ" as const,
                    contentJson: { questions: [] },
                    sourcesJson: [],
                };
            }),
        };
        const quizRunner = new QuizGenerationJobsService(
            jobModel as never,
            studyToolsPort,
            accountLifecycleBarrier,
            usersService,
        );

        const quizRun = quizRunner.runUntilIdle(1);
        await providerStarted.promise;
        const deletionRun = deletion.deleteMine(actor, firstSession);

        expect(() => accountLifecycleBarrier.enterMutation(actor.id)).toThrow(
            "eliminação da conta já está em curso",
        );
        providerRelease.resolve();

        const [processed, deletionResult] = await Promise.all([
            quizRun,
            deletionRun,
        ]);
        expect(processed).toBe(1);
        expect(deletionResult).toMatchObject({ sessionRevoked: true });
        await expect(sessionService.requireSession(firstSession)).rejects.toMatchObject({
            response: { code: "UNAUTHENTICATED" },
        });
        await expect(sessionService.requireSession(secondSession)).rejects.toMatchObject({
            response: { code: "SESSION_REVOKED" },
        });
        await expect(
            artifactModel.countDocuments({ userId: subjectId }),
        ).resolves.toBe(0);
        await expect(
            studyEventModel.countDocuments({ userId: subjectId }),
        ).resolves.toBe(0);
        await expect(
            jobModel.countDocuments({ userId: subjectId }),
        ).resolves.toBe(0);
        await expect(userModel.findById(subjectId).lean()).resolves.toMatchObject({
            accountStatus: "DELETED",
        });
    });
});

/** Obtém um model real já registado na ligação do teste. */
function model<T>(connection: Connection, name: string): Model<T> {
    return connection.model<T>(name);
}

/** Cria um gate assíncrono explícito para coordenar corridas de integração. */
function deferred<T>() {
    let resolve!: (value?: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise as (value?: T | PromiseLike<T>) => void;
    });
    return { promise, resolve };
}

/**
 * Semeia um documento real por model restante. A inserção usa a collection
 * nativa para permitir fixtures mínimas, mas todas as leituras e mutações RGPD
 * passam pelos models/schemas Mongoose reais.
 */
async function seedEveryRemainingModel(
    connection: Connection,
    subjectId: Types.ObjectId,
    materialId: Types.ObjectId,
    indexJobId: Types.ObjectId,
    exclusiveRoomId: Types.ObjectId,
): Promise<Map<string, Types.ObjectId>> {
    const seeded = new Map<string, Types.ObjectId>();
    for (const name of Object.keys(connection.models).sort()) {
        if (name === User.name || name === Material.name) continue;
        const currentModel = model(connection, name);
        const id =
            name === MaterialIndexJob.name
                ? indexJobId
                : name === StudyRoom.name
                  ? exclusiveRoomId
                  : new Types.ObjectId();
        const document: Record<string, unknown> = {
            _id: id,
            fixtureMarker: `g4-${name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        for (const field of SUBJECT_SCALAR_FIELDS[name] ?? []) {
            if (field === "_id") continue;
            const path = currentModel.schema.path(field);
            if (!path) {
                throw new Error(`${name}.${field} não existe no schema real.`);
            }
            document[field] = path?.instance === "String" ? subjectId.toHexString() : subjectId;
        }
        for (const field of SUBJECT_MEMBERSHIP_FIELDS[name] ?? []) {
            if (!currentModel.schema.path(field)) {
                throw new Error(`${name}.${field} não existe no schema real.`);
            }
            document[field] = [subjectId];
        }
        if (MATERIAL_RELATED_MODELS.has(name) && currentModel.schema.path("materialId")) {
            document.materialId = materialId;
        }
        if (name === MaterialVersion.name && currentModel.schema.path("jobId")) {
            document.jobId = indexJobId;
        }
        if (name === RoomShare.name || name === RoomAiInteraction.name) {
            document.roomId = exclusiveRoomId;
        }
        if (
            name === StudyGroupAiAnswer.name ||
            name === StudyGroupMessage.name ||
            name === StudyGroupSession.name
        ) {
            document.groupId = exclusiveRoomId;
        }
        if (name === AiQuotaPolicy.name || name === AiQuotaUsage.name) {
            document.scope = "USER";
        }
        if (name === AiQuotaDefaultPolicy.name) {
            Object.assign(document, {
                scope: "USER",
                purpose: "SUMMARY",
                monthlyLimitUnits: 5000,
                source: "E2E_SEED",
            });
        }
        if (name === AccountDeletionRequest.name) {
            Object.assign(document, {
                reference: "pre-existing-nonpersonal-receipt",
                deletedCounts: {},
                expiresAt: new Date(Date.now() + 86_400_000),
            });
        }
        if (name === PersonalDataRetention.name) {
            Object.assign(document, {
                receiptReference: "pre-existing-retention-receipt",
                registryVersion: "integration-fixture",
                affectedCounts: {},
                expiresAt: new Date(Date.now() + 86_400_000),
            });
        }
        if (name === OfficialTestAttempt.name) {
            Object.assign(document, {
                testId: new Types.ObjectId(),
                subjectId: new Types.ObjectId(),
                classId: new Types.ObjectId(),
                attemptNumber: 1,
                attemptKey: "g4-export-answer-key",
                selectedOptionIndexes: [1],
                correctAnswers: 0,
                totalQuestions: 1,
                percentage: 0,
                results: [
                    {
                        questionIndex: 0,
                        selectedOptionIndex: 1,
                        correctOptionIndex: 2,
                        isCorrect: false,
                    },
                ],
                answeredAt: new Date(),
            });
        }
        if (
            name === ClassAiInteraction.name ||
            name === GuidedStudyRoomAiInteraction.name ||
            name === ProjectAiPlan.name
        ) {
            Object.assign(document, {
                voiceSource: "SUBJECT_OVERRIDE",
                voiceTone: "DIRECT",
                voiceDetailLevel: "DETAILED",
                voiceRulesApplied: [
                    `teacher-voice-rule-${name}-never-export`,
                ],
            });
        }

        await currentModel.collection.insertOne(document);
        seeded.set(name, id);
    }

    const expectedSubjectModels = Object.keys(connection.models)
        .filter((name) => !NON_SUBJECT_MODELS.has(name))
        .sort();
    expect(Object.keys(SUBJECT_SCALAR_FIELDS).sort()).toEqual(
        expectedSubjectModels,
    );
    return seeded;
}

/**
 * Semeia um segundo contexto realmente partilhado para provar que a eliminação
 * transfere ownership e minimiza apenas os artefactos do titular, sem apagar o
 * trabalho coletivo dos membros remanescentes.
 */
async function seedSharedRoomContext(input: {
    connection: Connection;
    subjectId: Types.ObjectId;
    sharedRoomId: Types.ObjectId;
    remainingMemberId: Types.ObjectId;
}): Promise<{
    shareId: Types.ObjectId;
    interactionId: Types.ObjectId;
    messageId: Types.ObjectId;
    sessionId: Types.ObjectId;
    aiAnswerId: Types.ObjectId;
}> {
    const { connection, subjectId, sharedRoomId, remainingMemberId } = input;
    const shareId = new Types.ObjectId();
    const interactionId = new Types.ObjectId();
    const messageId = new Types.ObjectId();
    const sessionId = new Types.ObjectId();
    const aiAnswerId = new Types.ObjectId();

    await model(connection, StudyRoom.name).collection.insertOne({
        _id: sharedRoomId,
        ownerStudentId: subjectId,
        memberIds: [subjectId, remainingMemberId],
        name: "Sala partilhada RGPD",
        type: "FREE",
    });
    await Promise.all([
        model(connection, RoomShare.name).collection.insertOne({
            _id: shareId,
            roomId: sharedRoomId,
            authorStudentId: subjectId,
            type: "NOTE",
            title: "Nota do titular",
            textContent: "Conteúdo que deve ser removido do contexto partilhado.",
            usableByAi: true,
        }),
        model(connection, RoomAiInteraction.name).collection.insertOne({
            _id: interactionId,
            roomId: sharedRoomId,
            studentId: subjectId,
            question: "Pergunta privada do titular",
            answer: "Resposta privada do titular",
            sourceShareIds: [shareId],
            visibility: "PRIVATE",
        }),
        model(connection, StudyGroupMessage.name).collection.insertOne({
            _id: messageId,
            groupId: sharedRoomId,
            authorStudentId: subjectId,
            kind: "MESSAGE",
            text: "Mensagem partilhada do titular",
        }),
        model(connection, StudyGroupSession.name).collection.insertOne({
            _id: sessionId,
            groupId: sharedRoomId,
            createdByStudentId: subjectId,
            title: "Sessão coletiva",
            startsAt: new Date(Date.now() + 86_400_000),
            durationMinutes: 45,
        }),
        model(connection, StudyGroupAiAnswer.name).collection.insertOne({
            _id: aiAnswerId,
            groupId: sharedRoomId,
            studentId: subjectId,
            question: "Pergunta coletiva do titular",
            answer: "Resposta coletiva do titular",
            sources: [],
        }),
    ]);

    return { shareId, interactionId, messageId, sessionId, aiAnswerId };
}

/** Lê e limpa o attachment temporário gerado pelo registry. */
async function readExport(download: {
    stream: NodeJS.ReadableStream;
    cleanup(): Promise<void>;
}): Promise<{
    collections: Record<string, unknown[]>;
    storedFiles: Array<Record<string, unknown>>;
}> {
    const chunks: Buffer[] = [];
    for await (const chunk of download.stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    await download.cleanup();
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

/** Confirma que a retenção é aplicada por um índice TTL real do MongoDB. */
async function expectTtlIndex(connection: Connection, name: string): Promise<void> {
    const indexes = await model(connection, name).collection.indexes();
    expect(indexes).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                key: { expiresAt: 1 },
                expireAfterSeconds: 0,
            }),
        ]),
    );
}

/** Lê documentos persistidos sem expor conteúdo para output de teste. */
async function readAllDocumentsExceptUser(
    connection: Connection,
): Promise<Record<string, unknown[]>> {
    const result: Record<string, unknown[]> = {};
    for (const name of Object.keys(connection.models)) {
        if (name === User.name) continue;
        result[name] = await model(connection, name).collection.find({}).toArray();
    }
    return result;
}

/**
 * Extrai os models realmente ligados nos módulos. Um novo `forFeature` obriga
 * este teste, a lista de schemas e o registry a evoluírem em conjunto.
 */
async function readRegisteredModelNamesFromModules(): Promise<string[]> {
    const modulesRoot = resolve(process.cwd(), "src/modules");
    const files = await collectModuleFiles(modulesRoot);
    const names = new Set<string>();
    for (const file of files) {
        const source = await readFile(file, "utf8");
        for (const block of source.matchAll(
            /MongooseModule\.forFeature\(\[([\s\S]*?)\]\)/g,
        )) {
            for (const match of block[1].matchAll(
                /name:\s*([A-Z][A-Za-z0-9_]*)\.name/g,
            )) {
                names.add(match[1]);
            }
        }
    }
    return [...names].sort();
}

/** Percorre apenas ficheiros `*.module.ts` da implementação. */
async function collectModuleFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectModuleFiles(path)));
        } else if (entry.isFile() && entry.name.endsWith(".module.ts")) {
            files.push(path);
        }
    }
    return files;
}
