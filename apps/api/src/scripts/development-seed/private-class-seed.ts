/**
 * Povoa a base local com a coorte TIG descrita nos inputs privados.
 *
 * O módulo não contém nomes, emails ou conteúdos pedagógicos privados: tudo é
 * lido e validado antes de qualquer reset através de `private-seed-input`.
 */
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import bcrypt from "bcrypt";
import mongoose, { Types, type Model, type Schema } from "mongoose";
import type { Collection } from "mongodb";
import { CURRENT_AI_POLICY_VERSIONS } from "../../modules/ai-consents/ai-consents.service.js";
import { AiConsent, AiConsentSchema, type AiConsentPurpose } from "../../modules/ai-consents/schemas/ai-consent.schema.js";
import { AiModelPolicy, AiModelPolicySchema } from "../../modules/ai-model-policies/schemas/ai-model-policy.schema.js";
import { AiQuotaDefaultPolicy, AiQuotaDefaultPolicySchema, type AiQuotaDefaultPolicySource } from "../../modules/ai-quotas/schemas/ai-quota-default-policy.schema.js";
import { AiQuotaPolicy, AiQuotaPolicySchema } from "../../modules/ai-quotas/schemas/ai-quota-policy.schema.js";
import { AiArtifact, AiArtifactSchema } from "../../modules/ai/schemas/ai-artifact.schema.js";
import { AiQuizAttempt, AiQuizAttemptSchema } from "../../modules/ai/schemas/ai-quiz-attempt.schema.js";
import { LearningProfile, LearningProfileSchema } from "../../modules/ai/schemas/learning-profile.schema.js";
import { QuizGenerationJob, QuizGenerationJobSchema } from "../../modules/ai/schemas/quiz-generation-job.schema.js";
import { AiContentReview, AiContentReviewSchema } from "../../modules/ai-content-reviews/schemas/ai-content-review.schema.js";
import { ApprovedAiQuizAttempt, ApprovedAiQuizAttemptSchema } from "../../modules/ai-content-reviews/schemas/approved-ai-quiz-attempt.schema.js";
import { User, UserSchema } from "../../modules/auth/schemas/user.schema.js";
import { ClassLearningActivity, ClassLearningActivitySchema, type ClassLearningActivityType } from "../../modules/class-learning-activity/schemas/class-learning-activity.schema.js";
import { StudentClassActivityState, StudentClassActivityStateSchema } from "../../modules/class-learning-activity/schemas/student-class-activity-state.schema.js";
import { ClassPost, ClassPostSchema } from "../../modules/class-posts/schemas/class-post.schema.js";
import { ClassProgressNote, ClassProgressNoteSchema } from "../../modules/class-progress/schemas/class-progress-note.schema.js";
import { ClassProject, ClassProjectSchema } from "../../modules/class-projects/schemas/class-project.schema.js";
import { StudentClassProjectState, StudentClassProjectStateSchema } from "../../modules/class-projects/schemas/student-class-project-state.schema.js";
import { ClassMembership, ClassMembershipSchema } from "../../modules/classes/schemas/class-membership.schema.js";
import { SchoolClass, SchoolClassSchema } from "../../modules/classes/schemas/school-class.schema.js";
import { FollowUpAlertRule, FollowUpAlertRuleSchema } from "../../modules/follow-up-alerts/schemas/follow-up-alert-rule.schema.js";
import { GuidedStudyRoomParticipation, GuidedStudyRoomParticipationSchema } from "../../modules/guided-study-rooms/schemas/guided-study-room-participation.schema.js";
import { GuidedStudyRoom, GuidedStudyRoomSchema } from "../../modules/guided-study-rooms/schemas/guided-study-room.schema.js";
import { MaterialContext, MaterialContextSchema } from "../../modules/material-contexts/schemas/material-context.schema.js";
import { MaterialIndexJob, MaterialIndexJobSchema } from "../../modules/material-index/schemas/material-index-job.schema.js";
import { MaterialVersion, MaterialVersionSchema } from "../../modules/material-versions/schemas/material-version.schema.js";
import { MaterialStorageService } from "../../modules/materials/material-storage.service.js";
import { Material, MaterialSchema } from "../../modules/materials/schemas/material.schema.js";
import { OfficialMaterial, OfficialMaterialSchema } from "../../modules/official-materials/schemas/official-material.schema.js";
import { OfficialTestAttempt, OfficialTestAttemptSchema } from "../../modules/official-tests/schemas/official-test-attempt.schema.js";
import { OfficialTest, OfficialTestSchema } from "../../modules/official-tests/schemas/official-test.schema.js";
import { StudentProfile, StudentProfileSchema } from "../../modules/students/schemas/student-profile.schema.js";
import { StudentAiConversation, StudentAiConversationSchema } from "../../modules/student-ai-assistant/schemas/student-ai-conversation.schema.js";
import { StudyArea, StudyAreaSchema } from "../../modules/study-areas/schemas/study-area.schema.js";
import { StudyEvent, StudyEventSchema } from "../../modules/study/schemas/study-event.schema.js";
import { StudyGoal, StudyGoalSchema } from "../../modules/study/schemas/study-goal.schema.js";
import { StudyRoutine, StudyRoutineSchema } from "../../modules/study/schemas/study-routine.schema.js";
import { StudyGroupAiAnswer, StudyGroupAiAnswerSchema } from "../../modules/study-group-ai/schemas/study-group-ai-answer.schema.js";
import { StudyGroupMessage, StudyGroupMessageSchema } from "../../modules/study-group-messages/schemas/study-group-message.schema.js";
import { StudyGroupSession, StudyGroupSessionSchema } from "../../modules/study-group-sessions/schemas/study-group-session.schema.js";
import { RoomAiInteraction, RoomAiInteractionSchema } from "../../modules/study-rooms/schemas/room-ai-interaction.schema.js";
import { RoomShare, RoomShareSchema } from "../../modules/study-rooms/schemas/room-share.schema.js";
import { StudyRoom, StudyRoomSchema, type CollaborationKind } from "../../modules/study-rooms/schemas/study-room.schema.js";
import { Subject, SubjectSchema } from "../../modules/subjects/schemas/subject.schema.js";
import { TeacherStudentChatMessage, TeacherStudentChatMessageSchema } from "../../modules/teacher-student-chat/schemas/teacher-student-chat-message.schema.js";
import { TeacherStudentChatThread, TeacherStudentChatThreadSchema } from "../../modules/teacher-student-chat/schemas/teacher-student-chat-thread.schema.js";
import {
    preflightPrivateSeedInput,
    type PrivateSeedMaterial,
    type PrivateSeedPreflight,
    type PrivateSeedQuestion,
    type PrivateSeedQuiz,
    type PrivateSeedSubjectCode,
} from "./private-seed-input.js";

const SCENARIO_ID = "tig-2023-2026-private-v1";
const SCENARIO_VERSION = 1;
const BCRYPT_COST = 12;
const TEACHER_PASSWORD = "professor-dev-12345";
const STUDENT_PASSWORD = "aluno-dev-12345";
const DAY_MS = 86_400_000;
const HISTORICAL_ANCHOR = new Date("2025-06-20T09:00:00.000Z");
const USER_AI_PURPOSES: AiConsentPurpose[] = [
    "PRIVATE_AREA_AI", "PROJECT_AI", "SOURCE_GROUNDED_AI", "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION", "SUMMARY", "STUDY_TOOL",
];
const ALL_AI_PURPOSES: AiConsentPurpose[] = [
    ...USER_AI_PURPOSES, "GROUP_AI", "CLASS_AI", "ROOM_AI",
];

type SeedModel = Model<Record<string, unknown>>;
type SeedModels = ReturnType<typeof createModels>;
type SeedTarget = { databaseName: string; replaceExistingData: boolean };
type SeedMarker = {
    scenarioId: string;
    version: number;
    inputDigest: string;
    anchorDate: Date;
    status: "RUNNING" | "COMPLETE" | "FAILED";
    createdAt?: Date;
    updatedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    summary?: PrivateClassSeedSummary;
};
type AcademicResult = {
    teacherId: Types.ObjectId;
    studentIds: Types.ObjectId[];
    classIds: Map<string, Types.ObjectId>;
    subjectIds: Map<PrivateSeedSubjectCode, Types.ObjectId>;
};

export type PrivateClassSeedSummary = {
    users: number;
    teachers: number;
    students: number;
    classes: number;
    memberships: number;
    subjects: number;
    sourceMarkdownFiles: number;
    sourcePdfFiles: number;
    officialMaterials: number;
    officialTests: number;
    officialAttempts: number;
    contentReviews: number;
    guidedRooms: number;
    studyAreas: number;
    privateMaterials: number;
    aiArtifacts: number;
    aiQuizAttempts: number;
    approvedQuizAttempts: number;
    guidedParticipations: number;
    learningProfiles: number;
    quizJobs: number;
    studyGoals: number;
    studyRoutines: number;
    studyEvents: number;
    roomShares: number;
    roomAiInteractions: number;
    groupAiInteractions: number;
    collaborationMessages: number;
    collaborationSessions: number;
    personalConversations: number;
    teacherStudentThreads: number;
    teacherStudentMessages: number;
    alertRules: number;
    activityStates: number;
    materialIndexJobs: number;
    materialVersions: number;
    materialContexts: number;
    collaborations: number;
    projects: number;
    posts: number;
    progressNotes: number;
    orphanFiles: number;
};

/**
 * Orquestra preflight, proteção do alvo, seed idempotente e verificação final.
 */
export async function seedPrivateClassEnvironment(input: {
    mongoUri: string;
    target: SeedTarget;
}): Promise<PrivateClassSeedSummary> {
    const preflight = await preflightPrivateSeedInput({
        inputRoot: process.env.STUDYFLOW_PRIVATE_SEED_INPUT_ROOT,
        workspaceRoot: process.env.STUDYFLOW_PRIVATE_SEED_WORKSPACE_ROOT,
    });
    const storage = new MaterialStorageService();
    await storage.checkReady();
    await mongoose.connect(input.mongoUri);
    const database = mongoose.connection.db;
    if (!database) throw new Error("Base MongoDB indisponível para a seed privada.");
    const markerCollection = database.collection<SeedMarker>("development_seed_runs");

    try {
        if (input.target.replaceExistingData) {
            await mongoose.connection.dropDatabase();
            await clearMaterialStorage(storage);
        } else {
            await assertReusableDatabase(markerCollection, preflight.inputDigest);
        }

        const existingMarker = await markerCollection.findOne({ scenarioId: SCENARIO_ID });
        const anchorDate = existingMarker?.anchorDate ?? new Date();
        await markerCollection.updateOne(
            { scenarioId: SCENARIO_ID },
            {
                $set: {
                    version: SCENARIO_VERSION,
                    inputDigest: preflight.inputDigest,
                    anchorDate,
                    status: "RUNNING",
                    updatedAt: new Date(),
                },
                $setOnInsert: { scenarioId: SCENARIO_ID, createdAt: new Date() },
            },
            { upsert: true },
        );

        const models = createModels();
        const academic = await seedAccountsAndAcademic(models, preflight, anchorDate);
        const materialIds = await seedOfficialMaterials(models, storage, preflight, academic, anchorDate);
        const quizIds = await seedOfficialAssessments(models, preflight, academic, anchorDate);
        await seedReviews(models, preflight, academic, materialIds, anchorDate);
        await seedGuidedRooms(models, academic, materialIds, quizIds, anchorDate);
        const personal = await seedPersonalStudy(models, preflight, academic, anchorDate);
        await seedCollaboration(models, academic.studentIds, personal.privateMaterialIds, anchorDate);
        await seedClassContentAndChat(models, preflight, academic, anchorDate);
        const e2eGovernance = process.env.STUDYFLOW_E2E_SEED_AI_GOVERNANCE === "true";
        await seedAiGovernance(models, academic, {
            e2eGovernance,
            grantSyntheticConsents: e2eGovernance || (
                process.env.STUDYFLOW_DEMO_MODE === "true" &&
                process.env.STUDYFLOW_DEMO_FAKE_AI === "true"
            ),
        });
        const summary = await validateScenario(models, storage, preflight);
        await markerCollection.updateOne(
            { scenarioId: SCENARIO_ID },
            { $set: { status: "COMPLETE", completedAt: new Date(), summary } },
        );
        console.log(JSON.stringify({ ok: true, scenario: SCENARIO_ID, inputDigest: preflight.inputDigest.slice(0, 12), ...summary }));
        return summary;
    } catch (error) {
        await markerCollection.updateOne(
            { scenarioId: SCENARIO_ID },
            { $set: { status: "FAILED", failedAt: new Date() } },
        ).catch(() => undefined);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

async function assertReusableDatabase(
    markers: Collection<SeedMarker>,
    inputDigest: string,
): Promise<void> {
    const database = mongoose.connection.db!;
    const marker = await markers.findOne({ scenarioId: SCENARIO_ID }) as SeedMarker | null;
    const userCount = await database.collection("users").countDocuments({});
    if (!marker && userCount > 0) {
        throw new Error("A base contém outro cenário. Executa a seed com reset explícito.");
    }
    if (!marker) return;
    if (marker.status !== "COMPLETE") {
        throw new Error("A execução anterior da seed não terminou. É obrigatório um reset explícito.");
    }
    if (marker.version !== SCENARIO_VERSION || marker.inputDigest !== inputDigest) {
        throw new Error("Os inputs privados mudaram. Executa a seed com reset explícito.");
    }
}

function createModels() {
    return {
        user: model(User.name, UserSchema),
        studentProfile: model(StudentProfile.name, StudentProfileSchema),
        schoolClass: model(SchoolClass.name, SchoolClassSchema),
        membership: model(ClassMembership.name, ClassMembershipSchema),
        subject: model(Subject.name, SubjectSchema),
        officialMaterial: model(OfficialMaterial.name, OfficialMaterialSchema),
        indexJob: model(MaterialIndexJob.name, MaterialIndexJobSchema),
        version: model(MaterialVersion.name, MaterialVersionSchema),
        context: model(MaterialContext.name, MaterialContextSchema),
        officialTest: model(OfficialTest.name, OfficialTestSchema),
        officialAttempt: model(OfficialTestAttempt.name, OfficialTestAttemptSchema),
        review: model(AiContentReview.name, AiContentReviewSchema),
        approvedAttempt: model(ApprovedAiQuizAttempt.name, ApprovedAiQuizAttemptSchema),
        guidedRoom: model(GuidedStudyRoom.name, GuidedStudyRoomSchema),
        guidedParticipation: model(GuidedStudyRoomParticipation.name, GuidedStudyRoomParticipationSchema),
        studyArea: model(StudyArea.name, StudyAreaSchema),
        privateMaterial: model(Material.name, MaterialSchema),
        learningProfile: model(LearningProfile.name, LearningProfileSchema),
        aiArtifact: model(AiArtifact.name, AiArtifactSchema),
        aiQuizAttempt: model(AiQuizAttempt.name, AiQuizAttemptSchema),
        quizJob: model(QuizGenerationJob.name, QuizGenerationJobSchema),
        studyGoal: model(StudyGoal.name, StudyGoalSchema),
        studyRoutine: model(StudyRoutine.name, StudyRoutineSchema),
        studyEvent: model(StudyEvent.name, StudyEventSchema),
        studyRoom: model(StudyRoom.name, StudyRoomSchema),
        roomShare: model(RoomShare.name, RoomShareSchema),
        roomAi: model(RoomAiInteraction.name, RoomAiInteractionSchema),
        groupAi: model(StudyGroupAiAnswer.name, StudyGroupAiAnswerSchema),
        groupMessage: model(StudyGroupMessage.name, StudyGroupMessageSchema),
        groupSession: model(StudyGroupSession.name, StudyGroupSessionSchema),
        studentConversation: model(StudentAiConversation.name, StudentAiConversationSchema),
        classPost: model(ClassPost.name, ClassPostSchema),
        project: model(ClassProject.name, ClassProjectSchema),
        projectState: model(StudentClassProjectState.name, StudentClassProjectStateSchema),
        progressNote: model(ClassProgressNote.name, ClassProgressNoteSchema),
        activity: model(ClassLearningActivity.name, ClassLearningActivitySchema),
        activityState: model(StudentClassActivityState.name, StudentClassActivityStateSchema),
        alertRule: model(FollowUpAlertRule.name, FollowUpAlertRuleSchema),
        chatThread: model(TeacherStudentChatThread.name, TeacherStudentChatThreadSchema),
        chatMessage: model(TeacherStudentChatMessage.name, TeacherStudentChatMessageSchema),
        consent: model(AiConsent.name, AiConsentSchema),
        modelPolicy: model(AiModelPolicy.name, AiModelPolicySchema),
        quotaPolicy: model(AiQuotaPolicy.name, AiQuotaPolicySchema),
        quotaDefault: model(AiQuotaDefaultPolicy.name, AiQuotaDefaultPolicySchema),
    };
}

function model(name: string, schema: Schema): SeedModel {
    return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as SeedModel;
}

async function upsert(
    target: SeedModel,
    filter: Record<string, unknown>,
    values: Record<string, unknown>,
): Promise<Types.ObjectId> {
    const document = await target.findOneAndUpdate(
        filter,
        { $set: { ...filter, ...values } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).select("_id").exec();
    if (!document) throw new Error(`Falha ao sincronizar ${target.modelName}.`);
    return document._id as Types.ObjectId;
}

async function seedAccountsAndAcademic(
    models: SeedModels,
    input: PrivateSeedPreflight,
    anchorDate: Date,
): Promise<AcademicResult> {
    const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, BCRYPT_COST);
    const studentHash = await bcrypt.hash(STUDENT_PASSWORD, BCRYPT_COST);
    const people = [
        { ...input.data.teacher, role: "TEACHER", passwordHash: teacherHash },
        ...input.data.students.map((student) => ({ ...student, role: "STUDENT", passwordHash: studentHash })),
    ] as const;
    const userIds = new Map<string, Types.ObjectId>();
    for (const person of people) {
        const existing = await models.user.findOne({ email: person.email }).lean().exec() as Record<string, unknown> | null;
        if (existing && existing.role !== person.role) throw new Error("Uma conta da seed existe com um papel incompatível.");
        const userId = await upsert(models.user, { email: person.email }, {
            passwordHash: existing?.passwordHash ?? person.passwordHash,
            role: person.role,
            authProvider: "local",
            accountStatus: "ACTIVE",
            sessionVersion: 0,
            ...(person.role === "TEACHER" ? { displayName: person.name } : {}),
        });
        userIds.set(person.email, userId);
    }
    const teacherId = requiredId(userIds, input.data.teacher.email);
    const studentIds = input.data.students.map(({ email }) => requiredId(userIds, email));
    for (const [index, student] of input.data.students.entries()) {
        await upsert(models.studentProfile, { userId: studentIds[index] }, {
            name: student.name,
            year: "12.º ano",
            course: input.data.cohort.course,
        });
    }

    const classIds = new Map<string, Types.ObjectId>();
    const subjectIds = new Map<PrivateSeedSubjectCode, Types.ObjectId>();
    for (const schoolClass of input.data.classes) {
        const archived = schoolClass.status === "ARCHIVED";
        const classId = await upsert(models.schoolClass, { teacherId, code: schoolClass.code }, {
            name: schoolClass.name,
            schoolYear: schoolClass.schoolYear,
            studentIds,
            status: schoolClass.status,
            archivedAt: archived ? HISTORICAL_ANCHOR : null,
            archivedBy: archived ? teacherId : null,
            statusChangedAt: archived ? HISTORICAL_ANCHOR : anchorDate,
            lifecycleFenceVersion: 0,
        });
        classIds.set(schoolClass.code, classId);
        for (const studentId of studentIds) {
            await upsert(models.membership, { classId, studentId }, {
                status: "ACTIVE",
                joinedAt: archived ? new Date("2024-09-16T08:30:00.000Z") : new Date("2025-09-15T08:30:00.000Z"),
                joinedBy: teacherId,
                removedAt: null,
                removedBy: null,
                joinedAtEstimated: false,
            });
        }
        for (const subject of schoolClass.subjects) {
            const subjectId = await upsert(models.subject, { classId, name: subject.name }, {
                teacherId,
                code: subject.code,
                description: subject.description,
                status: "ACTIVE",
                archivedAt: null,
                archivedBy: null,
                statusChangedAt: archived ? new Date("2024-09-16T08:30:00.000Z") : anchorDate,
                lifecycleFenceVersion: 0,
            });
            subjectIds.set(subject.code, subjectId);
        }
    }
    return { teacherId, studentIds, classIds, subjectIds };
}

async function seedOfficialMaterials(
    models: SeedModels,
    storage: MaterialStorageService,
    preflight: PrivateSeedPreflight,
    academic: AcademicResult,
    anchorDate: Date,
): Promise<Map<PrivateSeedSubjectCode, Types.ObjectId[]>> {
    const ids = new Map<PrivateSeedSubjectCode, Types.ObjectId[]>();
    for (const material of preflight.materials) {
        const subjectId = requiredSubjectId(academic.subjectIds, material.subjectCode);
        const classId = classIdForSubject(preflight, academic, material.subjectCode);
        const persisted = await persistOfficialMaterial(models, storage, material, {
            subjectId,
            classId,
            teacherId: academic.teacherId,
            anchorDate,
        });
        ids.set(material.subjectCode, [...(ids.get(material.subjectCode) ?? []), persisted]);
    }
    return ids;
}

async function persistOfficialMaterial(
    models: SeedModels,
    storage: MaterialStorageService,
    material: PrivateSeedMaterial,
    context: { subjectId: Types.ObjectId; classId: Types.ObjectId; teacherId: Types.ObjectId; anchorDate: Date },
): Promise<Types.ObjectId> {
    const existing = await models.officialMaterial.findOne({ subjectId: context.subjectId, title: material.title }).lean().exec() as Record<string, unknown> | null;
    let stored: Record<string, unknown> = {};
    if (material.type === "PDF") {
        if (!material.buffer || !material.sha256 || !material.originalName || !material.mimeType) throw new Error("PDF preparado sem metadados obrigatórios.");
        if (typeof existing?.storageKey === "string" && existing.storageSha256 === material.sha256) {
            const bytes = await storage.read(existing.storageKey);
            if (createHash("sha256").update(bytes).digest("hex") !== material.sha256) throw new Error("Hash divergente num PDF já persistido.");
            stored = {
                storageKey: existing.storageKey,
                storageSha256: material.sha256,
                originalName: material.originalName,
                mimeType: material.mimeType,
                sizeBytes: material.buffer.byteLength,
            };
        } else {
            const file: Express.Multer.File = {
                fieldname: "file", originalname: material.originalName, encoding: "7bit",
                mimetype: material.mimeType, size: material.buffer.byteLength, buffer: material.buffer,
                stream: Readable.from(material.buffer), destination: "", filename: material.originalName, path: material.sourcePath,
            };
            const staged = await storage.stage(String(context.teacherId), file);
            await storage.prepareCommit(staged);
            await storage.commit(staged);
            stored = {
                storageKey: staged.storageKey, storageSha256: staged.sha256,
                originalName: material.originalName, mimeType: material.mimeType, sizeBytes: staged.sizeBytes,
            };
        }
    }
    const materialId = await upsert(models.officialMaterial, { subjectId: context.subjectId, title: material.title }, {
        classId: context.classId,
        teacherId: context.teacherId,
        type: material.type,
        status: "PROCESSED",
        textContent: material.textContent,
        markdownSource: material.markdownSource,
        contentRevision: 1,
        publishedAt: material.subjectCode === "LP-11" ? HISTORICAL_ANCHOR : context.anchorDate,
        ...stored,
    });
    const jobId = await upsert(models.indexJob, { materialId, scope: "OFFICIAL_SUBJECT", status: "DONE" }, {
        subjectId: context.subjectId,
        teacherId: context.teacherId,
        extractedTextChunks: material.chunks,
        attempts: 1,
        maxAttempts: 3,
        availableAt: context.anchorDate,
        leaseToken: 1,
        completedAt: context.anchorDate,
    });
    const versionId = await upsert(models.version, { materialId, scope: "OFFICIAL_SUBJECT", versionNumber: 1 }, {
        jobId,
        subjectId: context.subjectId,
        teacherId: context.teacherId,
        title: material.title,
        textSnapshot: material.textContent,
        chunksSnapshot: material.chunks,
        changeSummary: "Versão inicial importada pela seed privada TIG.",
        active: true,
    });
    await upsert(models.context, { scope: "OFFICIAL_SUBJECT", contextId: context.subjectId, materialId }, {
        title: material.title,
        source: "teacher",
        teacherId: context.teacherId,
    });
    await models.officialMaterial.updateOne({ _id: materialId }, {
        $set: { activeVersionId: versionId, activeVersionUpdatedAt: context.anchorDate, activeVersionChangeSummary: "Importação inicial TIG." },
    });
    return materialId;
}

async function seedOfficialAssessments(
    models: SeedModels,
    preflight: PrivateSeedPreflight,
    academic: AcademicResult,
    anchorDate: Date,
): Promise<Map<string, Types.ObjectId>> {
    const quizIds = new Map<string, Types.ObjectId>();
    let attemptCount = 0;
    for (const quiz of preflight.quizzes) {
        const subjectId = requiredSubjectId(academic.subjectIds, quiz.subjectCode);
        const classId = classIdForSubject(preflight, academic, quiz.subjectCode);
        const isHistorical = quiz.subjectCode === "LP-11";
        const testId = await upsert(models.officialTest, { subjectId, title: quiz.title }, {
            classId,
            teacherId: academic.teacherId,
            description: quiz.description,
            status: quiz.status,
            questions: quiz.questions,
            submissionFenceVersion: quiz.status === "CLOSED" ? 4 : 0,
            closedAt: quiz.status === "CLOSED" ? (isHistorical ? HISTORICAL_ANCHOR : days(anchorDate, -10)) : null,
            closedReason: quiz.status === "CLOSED" ? (isHistorical ? "CLASS_ARCHIVED" : "TEACHER") : null,
        });
        quizIds.set(quiz.key, testId);
        if (quiz.status !== "CLOSED") continue;
        for (const [studentIndex, studentId] of academic.studentIds.entries()) {
            await seedOfficialAttempt(models, quiz, testId, subjectId, classId, studentId, 1, studentIndex, isHistorical ? HISTORICAL_ANCHOR : days(anchorDate, -12 + studentIndex));
            attemptCount += 1;
        }
        if (!isHistorical) {
            for (const [studentIndex, studentId] of academic.studentIds.slice(0, 2).entries()) {
                await seedOfficialAttempt(models, quiz, testId, subjectId, classId, studentId, 2, Math.max(0, studentIndex - 1), days(anchorDate, -7 + studentIndex));
                attemptCount += 1;
            }
        }
    }
    if (attemptCount !== 24) throw new Error(`A matriz oficial deveria produzir 24 tentativas; produziu ${attemptCount}.`);
    return quizIds;
}

async function seedOfficialAttempt(
    models: SeedModels,
    quiz: PrivateSeedQuiz,
    testId: Types.ObjectId,
    subjectId: Types.ObjectId,
    classId: Types.ObjectId,
    studentId: Types.ObjectId,
    attemptNumber: number,
    wrongAnswers: number,
    answeredAt: Date,
): Promise<void> {
    const selectedOptionIndexes = quiz.questions.map((question, index) =>
        index < wrongAnswers ? (question.correctOptionIndex + 1) % 4 : question.correctOptionIndex,
    );
    const results = quiz.questions.map((question, index) => ({
        questionIndex: index,
        selectedOptionIndex: selectedOptionIndexes[index],
        correctOptionIndex: question.correctOptionIndex,
        isCorrect: selectedOptionIndexes[index] === question.correctOptionIndex,
    }));
    const correctAnswers = results.filter(({ isCorrect }) => isCorrect).length;
    await upsert(models.officialAttempt, { studentId, testId, attemptNumber }, {
        subjectId,
        classId,
        attemptKey: `private-seed:${quiz.key}:${studentId}:${attemptNumber}`,
        selectedOptionIndexes,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((correctAnswers / quiz.questions.length) * 100),
        results,
        answeredAt,
    });
    await recordActivity(models, {
        classId, studentId, subjectId, type: "OFFICIAL_TEST_ATTEMPT", answeredAt,
        key: `private-seed:official-attempt:${quiz.key}:${studentId}:${attemptNumber}`,
    });
}

async function seedReviews(
    models: SeedModels,
    preflight: PrivateSeedPreflight,
    academic: AcademicResult,
    materialIds: Map<PrivateSeedSubjectCode, Types.ObjectId[]>,
    anchorDate: Date,
): Promise<void> {
    for (const code of ["LP-11", "LP-12", "SI-12"] as const) {
        const subjectId = requiredSubjectId(academic.subjectIds, code);
        const classId = classIdForSubject(preflight, academic, code);
        const sources = materialIds.get(code) ?? [];
        const quiz = preflight.quizzes.find((candidate) => candidate.subjectCode === code && candidate.status === "CLOSED")
            ?? preflight.quizzes.find((candidate) => candidate.subjectCode === code)!;
        if (sources.length < 3) throw new Error(`${code} não tem materiais suficientes para as revisões.`);
        await upsert(models.review, { subjectId, materialId: sources[0], contentType: "SUMMARY" }, {
            teacherId: academic.teacherId,
            contentJson: { title: `Demonstração — Resumo ${code}`, bullets: ["Conteúdo sintético para validar o fluxo de revisão.", "Conceitos organizados a partir dos materiais oficiais.", "Confirmar sempre as fontes antes da avaliação real."] },
            status: "APPROVED",
            teacherComment: "Conteúdo sintético aprovado apenas para demonstração local.",
            origin: "TEACHER_AUTHORED",
        });
        const reviewId = await upsert(models.review, { subjectId, materialId: sources[1], contentType: "QUIZ" }, {
            teacherId: academic.teacherId,
            contentJson: { title: `Demonstração — Quiz aprovado ${code}`, questions: quiz.questions.slice(0, 3) },
            status: "APPROVED",
            teacherComment: "Quiz sintético aprovado apenas para demonstração local.",
            origin: "TEACHER_AUTHORED",
        });
        for (const [index, studentId] of academic.studentIds.entries()) {
            const questions = quiz.questions.slice(0, 3);
            const answers = questions.map((question, questionIndex) => questionIndex < index % 3 ? (question.correctOptionIndex + 1) % 4 : question.correctOptionIndex);
            const correctCount = answers.filter((answer, questionIndex) => answer === questions[questionIndex].correctOptionIndex).length;
            await upsert(models.approvedAttempt, { reviewId, studentId, attemptNumber: 1 }, {
                subjectId, classId, selectedOptionIndexes: answers, correctCount,
                totalQuestions: 3, scorePercent: Math.round((correctCount / 3) * 100),
                answeredAt: code === "LP-11" ? HISTORICAL_ANCHOR : days(anchorDate, -5 + index),
            });
        }
    }
    const lp12 = requiredSubjectId(academic.subjectIds, "LP-12");
    const si12 = requiredSubjectId(academic.subjectIds, "SI-12");
    await upsert(models.review, { subjectId: lp12, materialId: materialIds.get("LP-12")![2], contentType: "SUMMARY" }, {
        teacherId: academic.teacherId,
        contentJson: { title: "Demonstração — Resumo pendente", bullets: ["Conteúdo sintético ainda por rever."] },
        status: "PENDING",
        teacherComment: "Exemplo local de revisão pendente.",
        origin: "TEACHER_AUTHORED",
    });
    await upsert(models.review, { subjectId: si12, materialId: materialIds.get("SI-12")![2], contentType: "QUIZ" }, {
        teacherId: academic.teacherId,
        contentJson: { title: "Demonstração — Quiz rejeitado", questions: preflight.quizzes.find(({ subjectCode }) => subjectCode === "SI-12")!.questions.slice(0, 3) },
        status: "REJECTED",
        teacherComment: "Exemplo sintético rejeitado por precisar de melhor fundamentação.",
        origin: "TEACHER_AUTHORED",
    });
}

async function seedGuidedRooms(
    models: SeedModels,
    academic: AcademicResult,
    materialIds: Map<PrivateSeedSubjectCode, Types.ObjectId[]>,
    quizIds: Map<string, Types.ObjectId>,
    anchorDate: Date,
): Promise<void> {
    const definitions: Array<{ code: PrivateSeedSubjectCode; title: string; status: "OPEN" | "CLOSED"; ai: boolean; offset: number }> = [
        { code: "LP-11", title: "Demonstração — Revisão histórica de programação", status: "CLOSED", ai: false, offset: -360 },
        { code: "LP-12", title: "Demonstração — Clínica de Node.js", status: "OPEN", ai: true, offset: 3 },
        { code: "LP-12", title: "Demonstração — Revisão de JavaScript", status: "CLOSED", ai: true, offset: -8 },
        { code: "SI-12", title: "Demonstração — Laboratório MongoDB", status: "OPEN", ai: true, offset: 5 },
        { code: "SI-12", title: "Demonstração — Integração React e API", status: "CLOSED", ai: false, offset: -6 },
    ];
    for (const definition of definitions) {
        const subjectId = requiredSubjectId(academic.subjectIds, definition.code);
        const classId = [...academic.classIds.entries()].find(([code]) => code.endsWith(definition.code === "LP-11" ? "-11" : "-12"))?.[1];
        if (!classId) throw new Error(`Turma em falta para ${definition.code}.`);
        const relatedQuiz = [...quizIds.entries()].find(([key]) => key.startsWith(definition.code.toLowerCase().replace("-", "")))?.[1];
        const startsAt = definition.code === "LP-11" ? HISTORICAL_ANCHOR : days(anchorDate, definition.offset);
        const roomId = await upsert(models.guidedRoom, { classId, title: definition.title }, {
            subjectId,
            teacherId: academic.teacherId,
            description: "Atividade sintética local com instruções progressivas, fontes oficiais e um objetivo verificável.",
            materialIds: (materialIds.get(definition.code) ?? []).slice(0, 2).map(String),
            goal: "Rever conceitos, resolver um exercício e registar uma dúvida concreta.",
            officialTestId: relatedQuiz,
            startsAt,
            durationMinutes: 60,
            aiEnabled: definition.ai,
            status: definition.status,
            closedAt: definition.status === "CLOSED" ? startsAt : null,
            closedReason: definition.status === "CLOSED" ? (definition.code === "LP-11" ? "CLASS_ARCHIVED" : "TEACHER") : null,
        });
        const audience = definition.status === "OPEN" ? academic.studentIds.slice(0, 3) : academic.studentIds;
        for (const [index, studentId] of audience.entries()) {
            const viewedAt = days(startsAt, -1 + index / 10);
            const completed = index % 3 !== 2;
            await upsert(models.guidedParticipation, { roomId, studentId }, {
                classId,
                status: completed ? "COMPLETED" : "VIEWED",
                firstViewedAt: viewedAt,
                lastViewedAt: startsAt,
                completedAt: completed ? startsAt : null,
            });
            await recordActivity(models, {
                classId, studentId, subjectId,
                type: completed ? "GUIDED_ROOM_COMPLETED" : "GUIDED_ROOM_VIEWED",
                answeredAt: startsAt,
                key: `private-seed:guided:${roomId}:${studentId}:${completed ? "complete" : "view"}`,
            });
        }
    }
}

async function seedPersonalStudy(
    models: SeedModels,
    preflight: PrivateSeedPreflight,
    academic: AcademicResult,
    anchorDate: Date,
): Promise<{ privateMaterialIds: Types.ObjectId[] }> {
    const privateMaterialIds: Types.ObjectId[] = [];
    const quizzesBySubject = new Map<PrivateSeedSubjectCode, PrivateSeedQuiz>(
        (["LP-11", "LP-12", "SI-12"] as const).map((code) => [code, preflight.quizzes.find((quiz) => quiz.subjectCode === code && quiz.status === "CLOSED") ?? preflight.quizzes.find((quiz) => quiz.subjectCode === code)!]),
    );
    for (const [studentIndex, studentId] of academic.studentIds.entries()) {
        for (const code of ["LP-11", "LP-12", "SI-12"] as const) {
            const archived = code === "LP-11";
            const areaId = await upsert(models.studyArea, { userId: studentId, name: `Demonstração — ${code}` }, {
                description: `Área sintética local para organizar revisão de ${code}.`,
                color: archived ? "#193138" : "#1473E6",
                archived,
                voiceTone: studentIndex % 2 === 0 ? "step_by_step" : "examples_first",
                voiceDetailLevel: "normal",
                voiceNotes: "Usar exemplos dos materiais e terminar com uma tarefa verificável.",
            });
            const markdownSource = `# Plano de revisão ${code}\n\n> Conteúdo sintético de demonstração local.\n\n1. Rever um material oficial.\n2. Resolver um exercício sem consultar a solução.\n3. Registar a principal dúvida.\n`;
            const privateMaterialId = await upsert(models.privateMaterial, { userId: studentId, studyAreaId: areaId, title: `Demonstração — Plano ${code}` }, {
                type: "MARKDOWN", status: "READY", markdownSource,
                contentText: markdownSource.replace(/[#>`]/g, "").trim(), contentRevision: 1,
            });
            privateMaterialIds.push(privateMaterialId);
            await upsert(models.learningProfile, { userId: studentId, studyAreaId: areaId }, {
                pace: studentIndex % 3 === 0 ? "SLOW" : studentIndex % 3 === 1 ? "BALANCED" : "FAST",
                level: archived ? "INTERMEDIATE" : "ADVANCED",
                difficulties: ["transformar teoria em prática", "validar casos limite"],
                preferredExplanationStyle: studentIndex % 2 === 0 ? "Passos curtos com exemplos" : "Exemplo primeiro e explicação depois",
            });
            const artifactTypes = archived ? ["SUMMARY"] as const : ["SUMMARY", "FLASHCARDS", "QUIZ"] as const;
            for (const type of artifactTypes) {
                const quiz = quizzesBySubject.get(code)!;
                const contentJson = type === "SUMMARY"
                    ? { title: `Demonstração — Resumo ${code}`, bullets: ["Rever conceitos essenciais.", "Praticar com um caso pequeno.", "Confirmar dúvidas nas fontes oficiais."] }
                    : type === "FLASHCARDS"
                        ? { title: `Demonstração — Flashcards ${code}`, cards: quiz.questions.slice(0, 3).map((question) => ({ front: question.statement, back: question.options[question.correctOptionIndex] })) }
                        : { title: `Demonstração — Quiz privado ${code}`, questions: quiz.questions.slice(0, 3) };
                const artifactId = await upsert(models.aiArtifact, { generationKey: `private-seed:${studentId}:${code}:${type}` }, {
                    userId: studentId, studyAreaId: areaId, targetKind: "STUDY_AREA", targetId: areaId,
                    targetLabelSnapshot: `Demonstração — ${code}`, visibility: "PRIVATE", type, contentJson,
                    sourcesJson: [{ materialId: String(privateMaterialId), title: `Demonstração — Plano ${code}` }],
                    sourceContextKind: "STUDY_AREA", sourceContextId: areaId,
                });
                if (type === "QUIZ") {
                    const questions = quiz.questions.slice(0, 3);
                    const answers = questions.map((question, index) => index < studentIndex % 2 ? (question.correctOptionIndex + 1) % 4 : question.correctOptionIndex);
                    const results = questions.map((question, index) => ({
                        questionIndex: index, selectedOptionIndex: answers[index], correctOptionIndex: question.correctOptionIndex,
                        isCorrect: answers[index] === question.correctOptionIndex,
                    }));
                    const correctCount = results.filter(({ isCorrect }) => isCorrect).length;
                    await upsert(models.aiQuizAttempt, { userId: studentId, artifactId }, {
                        studyAreaId: areaId, targetKind: "STUDY_AREA", targetId: areaId, answers,
                        correctCount, totalQuestions: 3, scorePercent: Math.round((correctCount / 3) * 100),
                        answeredAt: days(anchorDate, -4 + studentIndex), results,
                    });
                    await upsert(models.quizJob, { userId: studentId, studyAreaId: areaId, status: "DONE" }, {
                        targetKind: "STUDY_AREA", targetId: areaId, targetLabelSnapshot: `Demonstração — ${code}`,
                        sourceContextKind: "STUDY_AREA", artifactId, topic: code, attempts: 1, maxAttempts: 3,
                        availableAt: days(anchorDate, -5), leaseToken: 1, completedAt: days(anchorDate, -5),
                    });
                }
            }
            if (!archived) {
                await upsert(models.studentConversation, { studentId, contextKind: "STUDY_AREA", contextId: areaId, title: `Revisão ${code}` }, {
                    contextLabelSnapshot: `Demonstração — ${code}`, contextSecondaryLabelSnapshot: "Área pessoal",
                    status: "ACTIVE", origin: "NATIVE", readOnly: false, lastMessageAt: days(anchorDate, -1 - studentIndex),
                });
            }
        }
        for (const [goalIndex, title] of ["Demonstração — Consolidar um tema", "Demonstração — Preparar a próxima sessão"].entries()) {
            await upsert(models.studyGoal, { userId: studentId, title }, {
                description: "Objetivo sintético local para validar o plano de estudo.", targetDate: days(anchorDate, 7 + goalIndex * 7),
                completed: goalIndex === 0 && studentIndex % 2 === 0, archived: false,
            });
        }
        await upsert(models.studyRoutine, { userId: studentId, title: "Demonstração — Revisão semanal" }, {
            weekdays: studentIndex % 2 === 0 ? ["MONDAY", "WEDNESDAY"] : ["TUESDAY", "THURSDAY"],
            startTime: "18:00", durationMinutes: 45, archived: false,
        });
        await upsert(models.studyEvent, { userId: studentId, title: "Demonstração — Resumo gerado" }, {
            type: "SUMMARY_GENERATED", description: "Evento sintético local.", occurredAt: days(anchorDate, -6 + studentIndex),
        });
        await upsert(models.studyEvent, { userId: studentId, title: "Demonstração — Quiz concluído" }, {
            type: "QUIZ_ATTEMPT_RECORDED", description: "Resultado sintético local.", occurredAt: days(anchorDate, -3 + studentIndex),
        });
    }
    return { privateMaterialIds };
}

async function seedCollaboration(
    models: SeedModels,
    students: Types.ObjectId[],
    privateMaterialIds: Types.ObjectId[],
    anchorDate: Date,
): Promise<void> {
    const definitions: Array<{ name: string; kind: CollaborationKind; type: "FREE" | "SUBJECT"; discipline?: string; members: number[] }> = [
        { name: "Demonstração — Laboratório LP 12", kind: "STUDY_ROOM", type: "SUBJECT", discipline: "LP-12", members: [0, 1, 2, 3] },
        { name: "Demonstração — Revisão SI 12", kind: "STUDY_ROOM", type: "SUBJECT", discipline: "SI-12", members: [0, 1, 2, 3] },
        { name: "Demonstração — Acompanhamento PAP", kind: "STUDY_GROUP", type: "FREE", members: [0, 1, 2, 3] },
        { name: "Demonstração — Frontend e integração", kind: "STUDY_GROUP", type: "SUBJECT", discipline: "React", members: [0, 1] },
    ];
    for (const [definitionIndex, definition] of definitions.entries()) {
        const memberIds = definition.members.map((index) => students[index]);
        const ownerStudentId = memberIds[0];
        const roomId = await upsert(models.studyRoom, { ownerStudentId, name: definition.name }, {
            type: definition.type, disciplineName: definition.discipline,
            description: "Espaço sintético local para validar colaboração, mensagens e sessões.",
            memberIds, collaborationKind: definition.kind, collaborationKindSource: "NATIVE",
        });
        const shareIds: Types.ObjectId[] = [];
        if (definition.kind === "STUDY_ROOM") {
            for (const [shareIndex, title] of ["Demonstração — Checklist", "Demonstração — Material pessoal"].entries()) {
                shareIds.push(await upsert(models.roomShare, { roomId, title }, {
                    authorStudentId: memberIds[shareIndex % memberIds.length],
                    type: shareIndex === 0 ? "NOTE" : "MATERIAL_REF",
                    textContent: shareIndex === 0 ? "Conteúdo sintético: rever fontes, praticar e registar dúvidas." : null,
                    contentFormat: "PLAIN_TEXT",
                    materialId: shareIndex === 1 ? privateMaterialIds[definitionIndex * 3] : null,
                    materialTitle: shareIndex === 1 ? "Demonstração — Plano pessoal" : null,
                    materialContentRevision: shareIndex === 1 ? 1 : null,
                    usableByAi: true,
                    tombstonedAt: null,
                }));
            }
            await upsert(models.roomAi, { roomId, studentId: memberIds[0], question: "Qual é a prioridade desta sessão de demonstração?" }, {
                answer: "Rever uma fonte, resolver um exercício em conjunto e registar o próximo passo.",
                sourceShareIds: shareIds, visibility: "SHARED", sharedAt: days(anchorDate, -2),
                citationSnapshots: [], inheritedFromFork: false,
            });
        } else {
            await upsert(models.groupAi, { groupId: roomId, studentId: memberIds[0], question: "Como organizamos esta sessão de demonstração?" }, {
                answer: "Comecem por uma dúvida comum, pratiquem e terminem com responsabilidades explícitas.",
                sources: [], citationSnapshots: [], inheritedFromFork: false,
            });
        }
        for (let messageIndex = 0; messageIndex < 3; messageIndex += 1) {
            await upsert(models.groupMessage, { groupId: roomId, collaborationKind: definition.kind, clientMessageId: `private-seed-${definitionIndex}-${messageIndex}` }, {
                authorStudentId: memberIds[messageIndex % memberIds.length],
                kind: messageIndex === 1 ? "NOTE" : "MESSAGE",
                text: ["Conteúdo sintético: já preparei uma dúvida.", "Nota sintética: confirmar as fontes usadas.", "Combinado, no final registamos os próximos passos."][messageIndex],
                tombstonedAt: null,
            });
        }
        await upsert(models.groupSession, { groupId: roomId, collaborationKind: definition.kind, title: "Demonstração — Sessão colaborativa" }, {
            createdByStudentId: ownerStudentId, startsAt: days(anchorDate, 2 + definitionIndex), durationMinutes: 60,
            goal: "Validar colaboração com dados totalmente sintéticos.",
        });
    }
}

async function seedClassContentAndChat(
    models: SeedModels,
    preflight: PrivateSeedPreflight,
    academic: AcademicResult,
    anchorDate: Date,
): Promise<void> {
    for (const schoolClass of preflight.data.classes) {
        const classId = academic.classIds.get(schoolClass.code)!;
        const isHistorical = schoolClass.status === "ARCHIVED";
        await upsert(models.classPost, { classId, title: "Sobre estes dados de demonstração" }, {
            teacherId: academic.teacherId, type: "NOTICE",
            body: "Pontuações, progresso, mensagens e alertas deste ambiente são dados sintéticos locais e não representam avaliação real.",
            tombstonedAt: null,
        });
        await upsert(models.classPost, { classId, title: "Demonstração — Próximos passos" }, {
            teacherId: academic.teacherId, type: "POST",
            body: isHistorical ? "Consultar o arquivo e usar os materiais como revisão histórica." : "Rever os materiais indicados e preparar uma dúvida concreta para a próxima sessão.",
            tombstonedAt: null,
        });
        for (const [noteIndex, note] of [
            ["Demonstração — Evolução da turma", "Nota sintética: a turma apresenta evolução positiva na organização do trabalho."],
            ["Demonstração — Tema a consolidar", "Nota sintética: reforçar validação, testes e explicação das decisões técnicas."],
        ].entries()) {
            const [title, text] = note as [string, string];
            await upsert(models.progressNote, { classId, title }, {
                teacherId: academic.teacherId, note: text, difficultyTags: noteIndex === 0 ? ["organização"] : ["validação", "testes"],
            });
        }
        await upsert(models.alertRule, { teacherId: academic.teacherId, classId, title: "Demonstração — Sem atividade recente" }, {
            inactiveDays: isHistorical ? 30 : 7,
            message: "Regra sintética local: consultar progresso e combinar um objetivo pequeno.",
        });
    }

    for (const [code, subjectId] of academic.subjectIds) {
        const schoolClass = preflight.data.classes.find(({ subjects }) => subjects.some((subject) => subject.code === code))!;
        const classId = academic.classIds.get(schoolClass.code)!;
        const projectId = await upsert(models.project, { classId, title: `Demonstração — Projeto ${code}` }, {
            teacherId: academic.teacherId,
            brief: "Projeto sintético local: planear, implementar, testar e apresentar uma solução pequena com evidências verificáveis.",
            subjectId, subjectNameSnapshot: schoolClass.subjects.find((subject) => subject.code === code)!.name,
            status: code === "SI-12" ? "DRAFT" : "PUBLISHED",
            publishedAt: code === "SI-12" ? null : (code === "LP-11" ? HISTORICAL_ANCHOR : anchorDate),
            dueDate: code === "LP-11" ? HISTORICAL_ANCHOR : days(anchorDate, 21),
        });
        if (code !== "SI-12") {
            for (const [index, studentId] of academic.studentIds.entries()) {
                await upsert(models.projectState, { studentId, projectId }, {
                    classId, status: code === "LP-11" ? "COMPLETED" : index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
                    completedAt: code === "LP-11" ? HISTORICAL_ANCHOR : null,
                });
            }
        }
        const threadId = await upsert(models.chatThread, { subjectId }, {
            classId, teacherId: academic.teacherId, status: code === "LP-11" ? "ARCHIVED" : "OPEN",
        });
        for (const [studentIndex, studentId] of academic.studentIds.entries()) {
            const pair = [
                { authorUserId: studentId, authorRole: "STUDENT", text: `Mensagem sintética: qual é a prioridade de revisão em ${code}?` },
                { authorUserId: academic.teacherId, authorRole: "TEACHER", text: "Resposta sintética: começa pelos objetivos do material, pratica e regista uma dúvida concreta." },
            ] as const;
            for (const [messageIndex, message] of pair.entries()) {
                await upsert(models.chatMessage, { threadId, authorUserId: message.authorUserId, clientMessageId: `private-seed-${code}-${studentIndex}-${messageIndex}` }, {
                    subjectId, classId, authorRole: message.authorRole, text: message.text, tombstonedAt: null,
                });
            }
        }
    }
    await rebuildActivityStates(models, preflight, academic);
}

async function recordActivity(models: SeedModels, input: {
    classId: Types.ObjectId;
    studentId: Types.ObjectId;
    subjectId: Types.ObjectId;
    type: ClassLearningActivityType;
    answeredAt: Date;
    key: string;
}): Promise<void> {
    await upsert(models.activity, { sourceEventKey: input.key }, {
        classId: input.classId, studentId: input.studentId, subjectId: input.subjectId,
        type: input.type, occurredAt: input.answeredAt,
    });
}

async function rebuildActivityStates(models: SeedModels, preflight: PrivateSeedPreflight, academic: AcademicResult): Promise<void> {
    for (const schoolClass of preflight.data.classes) {
        const classId = academic.classIds.get(schoolClass.code)!;
        for (const studentId of academic.studentIds) {
            const activities = await models.activity.find({ classId, studentId }).sort({ occurredAt: 1 }).lean().exec() as Array<Record<string, unknown>>;
            if (activities.length === 0) continue;
            const first = activities[0];
            const last = activities.at(-1)!;
            await upsert(models.activityState, { classId, studentId }, {
                firstActivityAt: first.occurredAt,
                lastActivityAt: last.occurredAt,
                lastActivityType: last.type,
                activityCount: activities.length,
            });
        }
    }
}

async function seedAiGovernance(
    models: SeedModels,
    academic: AcademicResult,
    options: { e2eGovernance: boolean; grantSyntheticConsents: boolean },
): Promise<void> {
    const configuredModel = process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
    if (configuredModel.length < 2 || configuredModel.length > 80) throw new Error("OPENAI_MODEL inválido para a seed.");
    for (const purpose of ALL_AI_PURPOSES) {
        await upsert(models.modelPolicy, { purpose }, {
            enabled: true, provider: "openai", model: configuredModel, timeoutMs: 8_000,
            maxSourceCount: 10, maxPromptChars: 12_000,
        });
    }
    const matrix: Array<{ scope: "USER" | "CLASS" | "GROUP"; purpose: AiConsentPurpose }> = [
        ...USER_AI_PURPOSES.map((purpose) => ({ scope: "USER" as const, purpose })),
        { scope: "CLASS", purpose: "CLASS_AI" },
        { scope: "GROUP", purpose: "GROUP_AI" },
        { scope: "GROUP", purpose: "ROOM_AI" },
    ];
    const source: AiQuotaDefaultPolicySource = options.e2eGovernance ? "E2E_SEED" : "DEMO_SEED";
    const monthlyLimitUnits = options.e2eGovernance ? 100 : 5_000;
    for (const entry of matrix) await upsert(models.quotaDefault, entry, { monthlyLimitUnits, source });
    await models.quotaPolicy.deleteMany({ targetId: { $in: [academic.teacherId, ...academic.studentIds] } });
    if (!options.grantSyntheticConsents) return;
    for (const userId of [academic.teacherId, ...academic.studentIds]) {
        for (const purpose of ALL_AI_PURPOSES) {
            await upsert(models.consent, { userId, purpose }, {
                actorId: userId, status: "GRANTED", policyVersion: CURRENT_AI_POLICY_VERSIONS[purpose],
            });
        }
    }
}

async function validateScenario(
    models: SeedModels,
    storage: MaterialStorageService,
    preflight: PrivateSeedPreflight,
): Promise<PrivateClassSeedSummary> {
    const [users, teachers, students, classes, memberships, subjects, officialMaterials, officialTests, officialAttempts, contentReviews, guidedRooms, studyAreas, privateMaterials, aiArtifacts, aiQuizAttempts, collaborations, projects, posts, progressNotes] = await Promise.all([
        models.user.countDocuments({}), models.user.countDocuments({ role: "TEACHER" }), models.user.countDocuments({ role: "STUDENT" }),
        models.schoolClass.countDocuments({}), models.membership.countDocuments({ status: "ACTIVE" }), models.subject.countDocuments({}),
        models.officialMaterial.countDocuments({}), models.officialTest.countDocuments({}), models.officialAttempt.countDocuments({}),
        models.review.countDocuments({}), models.guidedRoom.countDocuments({}), models.studyArea.countDocuments({}),
        models.privateMaterial.countDocuments({}), models.aiArtifact.countDocuments({}), models.aiQuizAttempt.countDocuments({}),
        models.studyRoom.countDocuments({}), models.project.countDocuments({}), models.classPost.countDocuments({}), models.progressNote.countDocuments({}),
    ]);
    const expected = {
        users: 5, teachers: 1, students: 4, classes: 2, memberships: 8, subjects: 3,
        officialMaterials: preflight.materials.length, officialTests: 9, officialAttempts: 24,
        contentReviews: 8, guidedRooms: 5, studyAreas: 12, privateMaterials: 12,
        aiArtifacts: 28, aiQuizAttempts: 8, collaborations: 4, projects: 3, posts: 4, progressNotes: 4,
    };
    const actual = { users, teachers, students, classes, memberships, subjects, officialMaterials, officialTests, officialAttempts, contentReviews, guidedRooms, studyAreas, privateMaterials, aiArtifacts, aiQuizAttempts, collaborations, projects, posts, progressNotes };
    const [approvedQuizAttempts, guidedParticipations, learningProfiles, quizJobs, studyGoals, studyRoutines, studyEvents, roomShares, roomAiInteractions, groupAiInteractions, collaborationMessages, collaborationSessions, personalConversations, teacherStudentThreads, teacherStudentMessages, alertRules, activityStates, materialIndexJobs, materialVersions, materialContexts] = await Promise.all([
        models.approvedAttempt.countDocuments({}), models.guidedParticipation.countDocuments({}),
        models.learningProfile.countDocuments({}), models.quizJob.countDocuments({}),
        models.studyGoal.countDocuments({}), models.studyRoutine.countDocuments({}), models.studyEvent.countDocuments({}),
        models.roomShare.countDocuments({}), models.roomAi.countDocuments({}), models.groupAi.countDocuments({}),
        models.groupMessage.countDocuments({}), models.groupSession.countDocuments({}), models.studentConversation.countDocuments({}),
        models.chatThread.countDocuments({}), models.chatMessage.countDocuments({}), models.alertRule.countDocuments({}),
        models.activityState.countDocuments({}), models.indexJob.countDocuments({}), models.version.countDocuments({}), models.context.countDocuments({}),
    ]);
    const supportingExpected = {
        approvedQuizAttempts: 12, guidedParticipations: 18, learningProfiles: 12,
        quizJobs: 8, studyGoals: 8, studyRoutines: 4, studyEvents: 8,
        roomShares: 4, roomAiInteractions: 2, groupAiInteractions: 2,
        collaborationMessages: 12, collaborationSessions: 4, personalConversations: 8,
        teacherStudentThreads: 3, teacherStudentMessages: 24, alertRules: 2,
        activityStates: 8, materialIndexJobs: officialMaterials,
        materialVersions: officialMaterials, materialContexts: officialMaterials,
    };
    const supportingActual = {
        approvedQuizAttempts, guidedParticipations, learningProfiles, quizJobs,
        studyGoals, studyRoutines, studyEvents, roomShares, roomAiInteractions,
        groupAiInteractions, collaborationMessages, collaborationSessions,
        personalConversations, teacherStudentThreads, teacherStudentMessages,
        alertRules, activityStates, materialIndexJobs, materialVersions,
        materialContexts,
    };
    if (
        JSON.stringify(actual) !== JSON.stringify(expected) ||
        JSON.stringify(supportingActual) !== JSON.stringify(supportingExpected)
    ) {
        throw new Error(`Contagens inesperadas na seed privada: ${JSON.stringify({ expected, actual, supportingExpected, supportingActual })}`);
    }
    const storageKeys = await storage.listCommittedKeys();
    const referencedKeys = new Set((await models.officialMaterial.find({ storageKey: { $exists: true } }).select("storageKey").lean().exec() as Array<Record<string, unknown>>).map(({ storageKey }) => String(storageKey)));
    const orphanFiles = storageKeys.filter((key) => !referencedKeys.has(key)).length;
    if (orphanFiles > 0) throw new Error(`A seed deixou ${orphanFiles} ficheiros órfãos.`);
    return {
        ...actual,
        ...supportingActual,
        sourceMarkdownFiles: preflight.sourceMarkdownCount,
        sourcePdfFiles: preflight.sourcePdfCount,
        orphanFiles,
    };
}

async function clearMaterialStorage(storage: MaterialStorageService): Promise<void> {
    for (const storageKey of await storage.listCommittedKeys()) {
        const ownerId = storageKey.split("/")[1];
        if (!ownerId) throw new Error("Storage key inválida durante reset.");
        const operation = await storage.prepareDelete(ownerId, storageKey);
        await storage.commitDelete(operation);
    }
}

function classIdForSubject(preflight: PrivateSeedPreflight, academic: AcademicResult, code: PrivateSeedSubjectCode): Types.ObjectId {
    const schoolClass = preflight.data.classes.find(({ subjects }) => subjects.some((subject) => subject.code === code));
    const classId = schoolClass ? academic.classIds.get(schoolClass.code) : undefined;
    if (!classId) throw new Error(`Turma não encontrada para ${code}.`);
    return classId;
}

function requiredSubjectId(map: Map<PrivateSeedSubjectCode, Types.ObjectId>, code: PrivateSeedSubjectCode): Types.ObjectId {
    const id = map.get(code);
    if (!id) throw new Error(`Disciplina em falta: ${code}.`);
    return id;
}

function requiredId(map: Map<string, Types.ObjectId>, key: string): Types.ObjectId {
    const id = map.get(key);
    if (!id) throw new Error("Conta obrigatória em falta na seed privada.");
    return id;
}

function days(anchor: Date, offset: number): Date {
    return new Date(anchor.getTime() + offset * DAY_MS);
}
