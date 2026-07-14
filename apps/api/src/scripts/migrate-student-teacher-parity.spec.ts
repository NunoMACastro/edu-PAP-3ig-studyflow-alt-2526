/** Testes puros do plano de migração; não abrem sockets nem requerem MongoDB. */
import { Types } from "mongoose";
import {
    buildStudentTeacherParityPlan,
    MIGRATION_ROOM_CLOSED_REASON,
    ParityMigrationSnapshot,
    parseParityMigrationCliArgs,
} from "./migrate-student-teacher-parity.js";

const emptySnapshot = (): ParityMigrationSnapshot => ({
    schoolClasses: [],
    classMemberships: [],
    subjects: [],
    studentProfiles: [],
    officialMaterials: [],
    materialContexts: [],
    materialVersions: [],
    classProjects: [],
    contextNotifications: [],
    contextNotificationRecipients: [],
    guidedStudyRooms: [],
    officialTests: [],
    officialTestAttempts: [],
    classAiInteractions: [],
    projectAiPlans: [],
    guidedRoomAiInteractions: [],
    guidedRoomParticipations: [],
    teacherStudentChatMessages: [],
    approvedAiQuizAttempts: [],
    classLearningActivities: [],
});

describe("student-teacher parity migration", () => {
    it("aceita apenas a flag dry-run", () => {
        expect(parseParityMigrationCliArgs([])).toEqual({ dryRun: false });
        expect(parseParityMigrationCliArgs(["--dry-run"])).toEqual({ dryRun: true });
        expect(() => parseParityMigrationCliArgs(["--force"])).toThrow(
            "Argumento desconhecido",
        );
    });

    it("planeia todos os backfills sem usar atividade privada", () => {
        const now = new Date("2026-07-11T12:00:00.000Z");
        const createdAt = new Date("2026-06-01T09:00:00.000Z");
        const activityAt = new Date("2026-07-10T10:00:00.000Z");
        const teacherId = new Types.ObjectId();
        const studentId = new Types.ObjectId();
        const classId = new Types.ObjectId();
        const subjectId = new Types.ObjectId();
        const profileId = new Types.ObjectId();
        const materialId = new Types.ObjectId();
        const materialWithoutVersionId = new Types.ObjectId();
        const materialContextId = new Types.ObjectId();
        const versionId = new Types.ObjectId();
        const projectId = new Types.ObjectId();
        const notificationId = new Types.ObjectId();
        const testId = new Types.ObjectId();
        const roomId = new Types.ObjectId();

        const snapshot: ParityMigrationSnapshot = {
            ...emptySnapshot(),
            schoolClasses: [
                {
                    _id: classId,
                    teacherId,
                    studentIds: [studentId, studentId],
                    createdAt,
                },
            ],
            subjects: [
                {
                    _id: subjectId,
                    classId,
                    teacherId,
                    name: "Matemática",
                    createdAt,
                },
            ],
            studentProfiles: [
                { _id: profileId, userId: studentId, className: "12.º A" },
            ],
            officialMaterials: [
                {
                    _id: materialId,
                    subjectId,
                    classId,
                    teacherId,
                    status: "REFERENCE_ONLY",
                },
                {
                    _id: materialWithoutVersionId,
                    subjectId,
                    classId,
                    teacherId,
                },
            ],
            materialContexts: [
                {
                    _id: materialContextId,
                    scope: "OFFICIAL_SUBJECT",
                    source: "teacher",
                    studentId,
                    teacherId,
                },
            ],
            materialVersions: [
                {
                    _id: versionId,
                    scope: "OFFICIAL_SUBJECT",
                    materialId,
                    versionNumber: 3,
                    active: false,
                    textSnapshot: "Conteúdo oficial versionado",
                },
            ],
            classProjects: [
                {
                    _id: projectId,
                    classId,
                    teacherId,
                    subject: "Matemática",
                },
            ],
            contextNotifications: [
                {
                    _id: notificationId,
                    recipientIds: [studentId],
                    createdAt,
                },
            ],
            officialTests: [
                { _id: testId, status: "CLOSED", closedAt: activityAt },
            ],
            guidedStudyRooms: [
                {
                    _id: roomId,
                    classId,
                    teacherId,
                    officialTestId: testId,
                    status: "OPEN",
                },
            ],
            officialTestAttempts: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    subjectId,
                    studentId,
                    answeredAt: activityAt,
                },
            ],
            classAiInteractions: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    subjectId,
                    studentId,
                    createdAt: activityAt,
                },
            ],
            projectAiPlans: [
                {
                    _id: new Types.ObjectId(),
                    projectId,
                    studentId,
                    createdAt: activityAt,
                },
            ],
            guidedRoomAiInteractions: [
                {
                    _id: new Types.ObjectId(),
                    roomId,
                    studentId,
                    createdAt: activityAt,
                },
            ],
            approvedAiQuizAttempts: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    subjectId,
                    studentId,
                    answeredAt: activityAt,
                },
            ],
            teacherStudentChatMessages: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    subjectId,
                    authorUserId: studentId,
                    authorRole: "STUDENT",
                    createdAt: activityAt,
                    text: "conteúdo que nunca deve ser copiado",
                },
                {
                    _id: new Types.ObjectId(),
                    classId,
                    subjectId,
                    authorUserId: teacherId,
                    authorRole: "TEACHER",
                    createdAt: activityAt,
                },
            ],
            guidedRoomParticipations: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    studentId,
                    lastViewedAt: activityAt,
                    completedAt: activityAt,
                },
            ],
        };

        const plan = buildStudentTeacherParityPlan(snapshot, now);

        expect(plan.counts).toEqual({
            schoolClassesNormalised: 1,
            subjectsNormalised: 1,
            membershipsCreated: 1,
            profileClassNamesRemoved: 1,
            materialsProjected: 1,
            materialsWithoutVersion: 1,
            officialMaterialContextsNormalised: 1,
            projectsLinkedToSubject: 1,
            projectsWithoutSafeSubjectMatch: 0,
            notificationRecipientsCreatedAsRead: 1,
            inconsistentGuidedRoomsClosed: 1,
            learningActivitiesCreated: 8,
            activityStatesProjected: 1,
        });
        expect(plan.operations.school_classes[0]).toMatchObject({
            updateOne: {
                update: {
                    $set: { lifecycleFenceVersion: 0 },
                },
            },
        });
        expect(plan.operations.subjects[0]).toMatchObject({
            updateOne: {
                update: {
                    $set: { lifecycleFenceVersion: 0 },
                },
            },
        });

        const recipientOperation = plan.operations.context_notification_recipients[0];
        expect(recipientOperation).toMatchObject({
            insertOne: {
                document: {
                    notificationId,
                    recipientId: studentId,
                    readAt: createdAt,
                    migratedAsRead: true,
                },
            },
        });
        expect(JSON.stringify(plan.operations.guided_study_rooms)).toContain(
            MIGRATION_ROOM_CLOSED_REASON,
        );
        expect(plan.operations.materialcontexts).toContainEqual({
            updateOne: {
                filter: { _id: materialContextId },
                update: {
                    $set: { source: "class" },
                    $unset: { studentId: "" },
                },
            },
        });
        const activityPlan = JSON.stringify(plan.operations.class_learning_activities);
        expect(activityPlan).not.toContain("conteúdo que nunca deve ser copiado");
        expect(activityPlan).not.toContain("study-event");
    });

    it("não duplica relações nem eventos canónicos já migrados", () => {
        const classId = new Types.ObjectId();
        const studentId = new Types.ObjectId();
        const teacherId = new Types.ObjectId();
        const notificationId = new Types.ObjectId();
        const attemptId = new Types.ObjectId();
        const occurredAt = new Date("2026-07-10T10:00:00.000Z");
        const snapshot: ParityMigrationSnapshot = {
            ...emptySnapshot(),
            schoolClasses: [
                {
                    _id: classId,
                    teacherId,
                    studentIds: [studentId],
                    status: "ACTIVE",
                    archivedAt: null,
                    archivedBy: null,
                    statusChangedAt: occurredAt,
                    lifecycleFenceVersion: 7,
                },
            ],
            subjects: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    teacherId,
                    name: "Matemática",
                    status: "ACTIVE",
                    archivedAt: null,
                    archivedBy: null,
                    statusChangedAt: occurredAt,
                    lifecycleFenceVersion: 9,
                },
            ],
            classMemberships: [{ _id: new Types.ObjectId(), classId, studentId }],
            contextNotifications: [
                { _id: notificationId, recipientIds: [studentId], createdAt: occurredAt },
            ],
            contextNotificationRecipients: [
                { _id: new Types.ObjectId(), notificationId, recipientId: studentId },
            ],
            officialTestAttempts: [
                {
                    _id: attemptId,
                    classId,
                    studentId,
                    answeredAt: occurredAt,
                },
            ],
            classLearningActivities: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    studentId,
                    type: "OFFICIAL_TEST_ATTEMPT",
                    occurredAt,
                    sourceEventKey: `official-test-attempt:${String(attemptId)}`,
                },
            ],
        };

        const plan = buildStudentTeacherParityPlan(snapshot, occurredAt);

        expect(plan.counts.membershipsCreated).toBe(0);
        expect(plan.counts.notificationRecipientsCreatedAsRead).toBe(0);
        expect(plan.counts.learningActivitiesCreated).toBe(0);
        expect(plan.counts.activityStatesProjected).toBe(1);
        expect(plan.operations.school_classes).toEqual([]);
        expect(plan.operations.subjects).toEqual([]);
    });

    it("só liga um projeto quando existe um único match exato na turma", () => {
        const classId = new Types.ObjectId();
        const teacherId = new Types.ObjectId();
        const snapshot: ParityMigrationSnapshot = {
            ...emptySnapshot(),
            subjects: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    teacherId,
                    name: "História",
                    status: "ACTIVE",
                    archivedAt: null,
                    archivedBy: null,
                    statusChangedAt: new Date(),
                },
                {
                    _id: new Types.ObjectId(),
                    classId,
                    teacherId,
                    name: "História",
                    status: "ACTIVE",
                    archivedAt: null,
                    archivedBy: null,
                    statusChangedAt: new Date(),
                },
            ],
            classProjects: [
                {
                    _id: new Types.ObjectId(),
                    classId,
                    teacherId,
                    subject: "História",
                },
            ],
        };

        const plan = buildStudentTeacherParityPlan(snapshot);

        expect(plan.counts.projectsLinkedToSubject).toBe(0);
        expect(plan.counts.projectsWithoutSafeSubjectMatch).toBe(1);
        expect(plan.operations.class_projects).toHaveLength(0);
    });
});
