/**
 * Migra, de forma idempotente e transacional, os dados históricos necessários
 * para a paridade entre os contratos do professor e do aluno.
 *
 * O runner usa apenas coleções oficiais. Em particular, nunca consulta
 * `study_events`, porque atividade de estudo privado não pode alimentar o
 * centro de acompanhamento de uma turma.
 */
import mongoose, { mongo, Types } from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";

export const STUDENT_TEACHER_PARITY_MIGRATION_ID =
    "2026-07-11-student-teacher-parity-v2";
export const MIGRATION_ROOM_CLOSED_REASON =
    "MIGRATION_INCONSISTENT_TEST" as const;

const COLLECTIONS = {
    migrations: "schema_migrations",
    schoolClasses: "school_classes",
    classMemberships: "class_memberships",
    subjects: "subjects",
    studentProfiles: "student_profiles",
    officialMaterials: "official_materials",
    materialContexts: "materialcontexts",
    materialVersions: "material_versions",
    classProjects: "class_projects",
    contextNotifications: "context_notifications",
    contextNotificationRecipients: "context_notification_recipients",
    guidedStudyRooms: "guided_study_rooms",
    officialTests: "official_tests",
    officialTestAttempts: "official_test_attempts",
    classAiInteractions: "class_ai_interactions",
    projectAiPlans: "project_ai_plans",
    guidedRoomAiInteractions: "guided_study_room_ai_interactions",
    guidedRoomParticipations: "guided_study_room_participations",
    teacherStudentChatMessages: "teacher_student_chat_messages",
    approvedAiQuizAttempts: "approved_ai_quiz_attempts",
    classLearningActivities: "class_learning_activities",
    studentClassActivityStates: "student_class_activity_states",
} as const;

type DataCollectionName = Exclude<
    (typeof COLLECTIONS)[keyof typeof COLLECTIONS],
    "schema_migrations"
>;

type RawDocument = mongo.Document;
type BulkOperation = mongo.AnyBulkWriteOperation<RawDocument>;

export type ParityMigrationSnapshot = {
    schoolClasses: RawDocument[];
    classMemberships: RawDocument[];
    subjects: RawDocument[];
    studentProfiles: RawDocument[];
    officialMaterials: RawDocument[];
    materialContexts: RawDocument[];
    materialVersions: RawDocument[];
    classProjects: RawDocument[];
    contextNotifications: RawDocument[];
    contextNotificationRecipients: RawDocument[];
    guidedStudyRooms: RawDocument[];
    officialTests: RawDocument[];
    officialTestAttempts: RawDocument[];
    classAiInteractions: RawDocument[];
    projectAiPlans: RawDocument[];
    guidedRoomAiInteractions: RawDocument[];
    guidedRoomParticipations: RawDocument[];
    teacherStudentChatMessages: RawDocument[];
    approvedAiQuizAttempts: RawDocument[];
    classLearningActivities: RawDocument[];
};

export type ParityMigrationCounts = {
    schoolClassesNormalised: number;
    subjectsNormalised: number;
    membershipsCreated: number;
    profileClassNamesRemoved: number;
    materialsProjected: number;
    materialsWithoutVersion: number;
    officialMaterialContextsNormalised: number;
    projectsLinkedToSubject: number;
    projectsWithoutSafeSubjectMatch: number;
    notificationRecipientsCreatedAsRead: number;
    inconsistentGuidedRoomsClosed: number;
    learningActivitiesCreated: number;
    activityStatesProjected: number;
};

export type ParityMigrationPlan = {
    operations: Record<DataCollectionName, BulkOperation[]>;
    counts: ParityMigrationCounts;
};

export type ParityMigrationResult = {
    ok: true;
    migrationId: typeof STUDENT_TEACHER_PARITY_MIGRATION_ID;
    status: "DRY_RUN" | "APPLIED" | "ALREADY_APPLIED";
    dryRun: boolean;
    counts: ParityMigrationCounts;
};

type MigrationMarker = {
    _id: string;
    appliedAt: Date;
    counts: ParityMigrationCounts;
};

type LearningActivityInput = {
    classId: Types.ObjectId;
    studentId: Types.ObjectId;
    subjectId?: Types.ObjectId | null;
    type:
        | "OFFICIAL_TEST_ATTEMPT"
        | "CLASS_AI_INTERACTION"
        | "PROJECT_AI_PLAN"
        | "APPROVED_AI_QUIZ_ATTEMPT"
        | "GUIDED_ROOM_VIEWED"
        | "GUIDED_ROOM_COMPLETED"
        | "GUIDED_ROOM_AI_INTERACTION"
        | "OFFICIAL_CHAT_MESSAGE";
    occurredAt: Date;
    sourceEventKey: string;
    createdAt: Date;
};

const EMPTY_COUNTS: ParityMigrationCounts = {
    schoolClassesNormalised: 0,
    subjectsNormalised: 0,
    membershipsCreated: 0,
    profileClassNamesRemoved: 0,
    materialsProjected: 0,
    materialsWithoutVersion: 0,
    officialMaterialContextsNormalised: 0,
    projectsLinkedToSubject: 0,
    projectsWithoutSafeSubjectMatch: 0,
    notificationRecipientsCreatedAsRead: 0,
    inconsistentGuidedRoomsClosed: 0,
    learningActivitiesCreated: 0,
    activityStatesProjected: 0,
};

/** Valida as únicas flags aceites pelo runner para evitar execuções ambíguas. */
export function parseParityMigrationCliArgs(args: string[]): { dryRun: boolean } {
    let dryRun = false;
    for (const argument of args) {
        if (argument === "--dry-run") {
            dryRun = true;
            continue;
        }
        throw new Error(`Argumento desconhecido: ${argument}`);
    }
    return { dryRun };
}

/**
 * Constrói um plano puro e inspecionável antes de executar qualquer escrita.
 * Esta separação permite testar a cobertura do backfill sem MongoDB nem rede.
 */
export function buildStudentTeacherParityPlan(
    snapshot: ParityMigrationSnapshot,
    now = new Date(),
): ParityMigrationPlan {
    const operations = createEmptyOperations();
    const counts = { ...EMPTY_COUNTS };

    planAcademicLifecycle(snapshot, operations, counts, now);
    planMemberships(snapshot, operations, counts, now);
    planProfileCleanup(snapshot, operations, counts);
    planOfficialMaterialProjection(snapshot, operations, counts);
    planOfficialMaterialContexts(snapshot, operations, counts);
    planProjectSubjects(snapshot, operations, counts);
    planLegacyNotificationInbox(snapshot, operations, counts, now);
    planGuidedRoomRepairs(snapshot, operations, counts, now);
    planOfficialLearningActivity(snapshot, operations, counts);

    return { operations, counts };
}

/**
 * Executa a migração. Escritas e marker são confirmados na mesma transação;
 * `dryRun` limita-se a produzir o resumo do plano.
 */
export async function migrateStudentTeacherParity(
    database: mongo.Db,
    client: mongo.MongoClient,
    options: { dryRun?: boolean; now?: Date } = {},
): Promise<ParityMigrationResult> {
    const dryRun = options.dryRun === true;
    const now = options.now ?? new Date();

    if (dryRun) {
        return executeMigration(database, undefined, { dryRun: true, now });
    }

    const session = client.startSession();
    try {
        let result: ParityMigrationResult | undefined;
        await session.withTransaction(
            async () => {
                result = await executeMigration(database, session, {
                    dryRun: false,
                    now,
                });
            },
            {
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" },
            },
        );
        if (!result) {
            throw new Error("A transação da migração terminou sem resultado.");
        }
        return result;
    } finally {
        await session.endSession();
    }
}

async function executeMigration(
    database: mongo.Db,
    session: mongo.ClientSession | undefined,
    options: { dryRun: boolean; now: Date },
): Promise<ParityMigrationResult> {
    const markerCollection = database.collection<MigrationMarker>(
        COLLECTIONS.migrations,
    );
    const marker = await markerCollection.findOne(
        { _id: STUDENT_TEACHER_PARITY_MIGRATION_ID },
        session ? { session } : undefined,
    );
    if (marker) {
        return {
            ok: true,
            migrationId: STUDENT_TEACHER_PARITY_MIGRATION_ID,
            status: "ALREADY_APPLIED",
            dryRun: options.dryRun,
            counts: { ...EMPTY_COUNTS },
        };
    }

    const snapshot = await readSnapshot(database, session);
    const plan = buildStudentTeacherParityPlan(snapshot, options.now);
    if (options.dryRun) {
        return {
            ok: true,
            migrationId: STUDENT_TEACHER_PARITY_MIGRATION_ID,
            status: "DRY_RUN",
            dryRun: true,
            counts: plan.counts,
        };
    }

    for (const [collectionName, collectionOperations] of Object.entries(
        plan.operations,
    ) as Array<[DataCollectionName, BulkOperation[]]>) {
        if (collectionOperations.length === 0) continue;
        await database.collection(collectionName).bulkWrite(collectionOperations, {
            ordered: true,
            session,
        });
    }

    await markerCollection.insertOne(
        {
            _id: STUDENT_TEACHER_PARITY_MIGRATION_ID,
            appliedAt: options.now,
            counts: plan.counts,
        },
        { session },
    );

    return {
        ok: true,
        migrationId: STUDENT_TEACHER_PARITY_MIGRATION_ID,
        status: "APPLIED",
        dryRun: false,
        counts: plan.counts,
    };
}

async function readSnapshot(
    database: mongo.Db,
    session?: mongo.ClientSession,
): Promise<ParityMigrationSnapshot> {
    const read = (collectionName: DataCollectionName, projection: RawDocument) =>
        database
            .collection(collectionName)
            .find({}, { ...(session ? { session } : {}), projection })
            .toArray();

    // O driver não suporta operações paralelas dentro da mesma transação.
    // As projeções também evitam carregar perguntas, respostas ou mensagens.
    const schoolClasses = await read(COLLECTIONS.schoolClasses, {
        teacherId: 1,
        studentIds: 1,
        status: 1,
        archivedAt: 1,
        archivedBy: 1,
        statusChangedAt: 1,
        lifecycleFenceVersion: 1,
        createdAt: 1,
        updatedAt: 1,
    });
    const classMemberships = await read(COLLECTIONS.classMemberships, {
        classId: 1,
        studentId: 1,
    });
    const subjects = await read(COLLECTIONS.subjects, {
        classId: 1,
        teacherId: 1,
        name: 1,
        status: 1,
        archivedAt: 1,
        archivedBy: 1,
        statusChangedAt: 1,
        lifecycleFenceVersion: 1,
        createdAt: 1,
        updatedAt: 1,
    });
    const studentProfiles = await read(COLLECTIONS.studentProfiles, {
        className: 1,
    });
    const officialMaterials = await read(COLLECTIONS.officialMaterials, {
        activeVersionId: 1,
        contentRevision: 1,
        status: 1,
    });
    const materialContexts = await read(COLLECTIONS.materialContexts, {
        scope: 1,
        source: 1,
        studentId: 1,
    });
    // textSnapshot é o único conteúdo carregado: é necessário para reparar a
    // projeção pública da versão oficial ativa e nunca é escrito em logs.
    const materialVersions = await read(COLLECTIONS.materialVersions, {
        scope: 1,
        materialId: 1,
        versionNumber: 1,
        active: 1,
        textSnapshot: 1,
    });
    const classProjects = await read(COLLECTIONS.classProjects, {
        classId: 1,
        subjectId: 1,
        subjectNameSnapshot: 1,
        subject: 1,
    });
    const contextNotifications = await read(COLLECTIONS.contextNotifications, {
        recipientIds: 1,
        suppressedRecipientIds: 1,
        createdAt: 1,
    });
    const contextNotificationRecipients = await read(
        COLLECTIONS.contextNotificationRecipients,
        { notificationId: 1, recipientId: 1 },
    );
    const guidedStudyRooms = await read(COLLECTIONS.guidedStudyRooms, {
        classId: 1,
        subjectId: 1,
        officialTestId: 1,
        status: 1,
    });
    const officialTests = await read(COLLECTIONS.officialTests, {
        status: 1,
        closedAt: 1,
    });
    const officialSourceProjection = {
        classId: 1,
        studentId: 1,
        subjectId: 1,
        answeredAt: 1,
        createdAt: 1,
    };
    const officialTestAttempts = await read(
        COLLECTIONS.officialTestAttempts,
        officialSourceProjection,
    );
    const classAiInteractions = await read(
        COLLECTIONS.classAiInteractions,
        officialSourceProjection,
    );
    const projectAiPlans = await read(
        COLLECTIONS.projectAiPlans,
        { ...officialSourceProjection, projectId: 1 },
    );
    const guidedRoomAiInteractions = await read(
        COLLECTIONS.guidedRoomAiInteractions,
        { ...officialSourceProjection, roomId: 1 },
    );
    const guidedRoomParticipations = await read(
        COLLECTIONS.guidedRoomParticipations,
        { classId: 1, studentId: 1, lastViewedAt: 1, completedAt: 1 },
    );
    const teacherStudentChatMessages = await read(
        COLLECTIONS.teacherStudentChatMessages,
        {
            classId: 1,
            subjectId: 1,
            authorUserId: 1,
            authorRole: 1,
            createdAt: 1,
        },
    );
    const approvedAiQuizAttempts = await read(
        COLLECTIONS.approvedAiQuizAttempts,
        officialSourceProjection,
    );
    const classLearningActivities = await read(
        COLLECTIONS.classLearningActivities,
        {
            classId: 1,
            studentId: 1,
            subjectId: 1,
            type: 1,
            occurredAt: 1,
            sourceEventKey: 1,
            createdAt: 1,
        },
    );

    return {
        schoolClasses,
        classMemberships,
        subjects,
        studentProfiles,
        officialMaterials,
        materialContexts,
        materialVersions,
        classProjects,
        contextNotifications,
        contextNotificationRecipients,
        guidedStudyRooms,
        officialTests,
        officialTestAttempts,
        classAiInteractions,
        projectAiPlans,
        guidedRoomAiInteractions,
        guidedRoomParticipations,
        teacherStudentChatMessages,
        approvedAiQuizAttempts,
        classLearningActivities,
    };
}

function createEmptyOperations(): Record<DataCollectionName, BulkOperation[]> {
    return Object.fromEntries(
        Object.values(COLLECTIONS)
            .filter((name) => name !== COLLECTIONS.migrations)
            .map((name) => [name, []]),
    ) as unknown as Record<DataCollectionName, BulkOperation[]>;
}

function planAcademicLifecycle(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
    now: Date,
): void {
    for (const schoolClass of snapshot.schoolClasses) {
        const id = asObjectId(schoolClass._id);
        if (!id) continue;
        const set = lifecycleSet(schoolClass, schoolClass.teacherId, now);
        if (Object.keys(set).length === 0) continue;
        operations[COLLECTIONS.schoolClasses].push(updateOne(id, { $set: set }));
        counts.schoolClassesNormalised += 1;
    }

    for (const subject of snapshot.subjects) {
        const id = asObjectId(subject._id);
        if (!id) continue;
        const set = lifecycleSet(subject, subject.teacherId, now);
        if (Object.keys(set).length === 0) continue;
        operations[COLLECTIONS.subjects].push(updateOne(id, { $set: set }));
        counts.subjectsNormalised += 1;
    }
}

function lifecycleSet(
    document: RawDocument,
    ownerIdValue: unknown,
    now: Date,
): RawDocument {
    const status = document.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
    const set: RawDocument = {};
    if (document.status !== status) set.status = status;
    if (
        !Number.isSafeInteger(document.lifecycleFenceVersion) ||
        Number(document.lifecycleFenceVersion) < 0
    ) {
        set.lifecycleFenceVersion = 0;
    }

    if (status === "ACTIVE") {
        if (document.archivedAt !== null) set.archivedAt = null;
        if (document.archivedBy !== null) set.archivedBy = null;
    } else {
        if (!asDate(document.archivedAt)) {
            set.archivedAt =
                asDate(document.updatedAt) ?? asDate(document.createdAt) ?? now;
        }
        if (!asObjectId(document.archivedBy)) {
            const ownerId = asObjectId(ownerIdValue);
            if (ownerId) set.archivedBy = ownerId;
        }
    }

    if (!asDate(document.statusChangedAt)) {
        set.statusChangedAt =
            asDate(set.archivedAt) ??
            asDate(document.archivedAt) ??
            asDate(document.updatedAt) ??
            asDate(document.createdAt) ??
            now;
    }
    return set;
}

function planMemberships(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
    now: Date,
): void {
    const existing = new Set(
        snapshot.classMemberships.flatMap((membership) => {
            const classId = asObjectId(membership.classId);
            const studentId = asObjectId(membership.studentId);
            return classId && studentId
                ? [pairKey(classId, studentId)]
                : [];
        }),
    );

    for (const schoolClass of snapshot.schoolClasses) {
        const classId = asObjectId(schoolClass._id);
        const joinedBy = asObjectId(schoolClass.teacherId);
        if (!classId || !joinedBy || !Array.isArray(schoolClass.studentIds)) continue;
        const joinedAt =
            asDate(schoolClass.createdAt) ??
            asDate(schoolClass.statusChangedAt) ??
            now;
        const uniqueStudentIds = new Map<string, Types.ObjectId>();
        for (const candidate of schoolClass.studentIds) {
            const studentId = asObjectId(candidate);
            if (studentId) uniqueStudentIds.set(String(studentId), studentId);
        }
        for (const studentId of uniqueStudentIds.values()) {
            const key = pairKey(classId, studentId);
            if (existing.has(key)) continue;
            existing.add(key);
            operations[COLLECTIONS.classMemberships].push({
                insertOne: {
                    document: {
                        classId,
                        studentId,
                        status: "ACTIVE",
                        joinedAt,
                        removedAt: null,
                        joinedBy,
                        removedBy: null,
                        joinedAtEstimated: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                },
            });
            counts.membershipsCreated += 1;
        }
    }
}

function planProfileCleanup(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
): void {
    for (const profile of snapshot.studentProfiles) {
        const id = asObjectId(profile._id);
        if (!id || !Object.prototype.hasOwnProperty.call(profile, "className")) continue;
        operations[COLLECTIONS.studentProfiles].push(
            updateOne(id, { $unset: { className: "" } }),
        );
        counts.profileClassNamesRemoved += 1;
    }
}

function planOfficialMaterialProjection(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
): void {
    const versionsByMaterial = new Map<string, RawDocument[]>();
    for (const version of snapshot.materialVersions) {
        if (version.scope !== "OFFICIAL_SUBJECT") continue;
        const materialId = asObjectId(version.materialId);
        if (!materialId) continue;
        const versions = versionsByMaterial.get(String(materialId)) ?? [];
        versions.push(version);
        versionsByMaterial.set(String(materialId), versions);
    }

    for (const material of snapshot.officialMaterials) {
        const materialId = asObjectId(material._id);
        if (!materialId) continue;
        const versions = versionsByMaterial.get(String(materialId)) ?? [];
        if (versions.length === 0) {
            const update: RawDocument = {};
            if (!isNonNegativeNumber(material.contentRevision)) {
                update.$set = { contentRevision: 0 };
            }
            if (asObjectId(material.activeVersionId)) {
                update.$unset = { activeVersionId: "" };
            }
            if (Object.keys(update).length > 0) {
                operations[COLLECTIONS.officialMaterials].push(
                    updateOne(materialId, update),
                );
            }
            counts.materialsWithoutVersion += 1;
            continue;
        }

        const activeVersionId = asObjectId(material.activeVersionId);
        const chosen =
            [...versions]
                .filter((version) => version.active === true)
                .sort((left, right) => numericVersion(right) - numericVersion(left))[0] ??
            (activeVersionId
                ? versions.find((version) => sameId(version._id, activeVersionId))
                : undefined) ??
            [...versions].sort(
                (left, right) => numericVersion(right) - numericVersion(left),
            )[0];
        const chosenId = asObjectId(chosen?._id);
        if (!chosen || !chosenId) {
            counts.materialsWithoutVersion += 1;
            continue;
        }

        operations[COLLECTIONS.materialVersions].push({
            updateMany: {
                filter: {
                    materialId,
                    scope: "OFFICIAL_SUBJECT",
                    _id: { $ne: chosenId },
                    active: { $ne: false },
                },
                update: { $set: { active: false } },
            },
        });
        operations[COLLECTIONS.materialVersions].push(
            updateOne(chosenId, { $set: { active: true } }),
        );

        const contentRevision = Math.max(
            isNonNegativeNumber(material.contentRevision)
                ? material.contentRevision
                : 0,
            numericVersion(chosen),
        );
        const set: RawDocument = {
            activeVersionId: chosenId,
            contentRevision,
            textContent:
                typeof chosen.textSnapshot === "string"
                    ? chosen.textSnapshot
                    : "",
            status: "PROCESSED",
        };
        operations[COLLECTIONS.officialMaterials].push(
            updateOne(materialId, { $set: set }),
        );
        counts.materialsProjected += 1;
    }
}

/**
 * Remove a identidade discente que era indevidamente partilhada por contexto
 * oficial e normaliza a origem como recurso da turma. O `teacherId` legado
 * pode permanecer interno para retenção/auditoria e nunca integra a projeção
 * pública do aluno.
 */
function planOfficialMaterialContexts(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
): void {
    for (const context of snapshot.materialContexts) {
        if (context.scope !== "OFFICIAL_SUBJECT") continue;
        const contextId = asObjectId(context._id);
        if (!contextId) continue;
        const hasStudentId = Object.prototype.hasOwnProperty.call(
            context,
            "studentId",
        );
        if (!hasStudentId && context.source === "class") continue;

        const update: RawDocument = { $set: { source: "class" } };
        if (hasStudentId) update.$unset = { studentId: "" };
        operations[COLLECTIONS.materialContexts].push(
            updateOne(contextId, update),
        );
        counts.officialMaterialContextsNormalised += 1;
    }
}

function planProjectSubjects(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
): void {
    const subjectsByClassAndName = new Map<string, RawDocument[]>();
    const subjectsById = new Map<string, RawDocument>();
    for (const subject of snapshot.subjects) {
        const subjectId = asObjectId(subject._id);
        const classId = asObjectId(subject.classId);
        if (!subjectId || !classId || typeof subject.name !== "string") continue;
        subjectsById.set(String(subjectId), subject);
        const key = `${String(classId)}\u0000${subject.name.trim()}`;
        const matches = subjectsByClassAndName.get(key) ?? [];
        matches.push(subject);
        subjectsByClassAndName.set(key, matches);
    }

    for (const project of snapshot.classProjects) {
        const projectId = asObjectId(project._id);
        const classId = asObjectId(project.classId);
        if (!projectId || !classId) continue;

        const existingSubjectId = asObjectId(project.subjectId);
        if (existingSubjectId) {
            const subject = subjectsById.get(String(existingSubjectId));
            if (
                subject &&
                sameId(subject.classId, classId) &&
                typeof subject.name === "string" &&
                project.subjectNameSnapshot !== subject.name
            ) {
                operations[COLLECTIONS.classProjects].push(
                    updateOne(projectId, {
                        $set: { subjectNameSnapshot: subject.name },
                    }),
                );
                counts.projectsLinkedToSubject += 1;
            }
            continue;
        }

        if (typeof project.subject !== "string" || !project.subject.trim()) continue;
        const matches =
            subjectsByClassAndName.get(
                `${String(classId)}\u0000${project.subject.trim()}`,
            ) ?? [];
        if (matches.length !== 1) {
            counts.projectsWithoutSafeSubjectMatch += 1;
            continue;
        }
        const matchId = asObjectId(matches[0]._id);
        if (!matchId) continue;
        operations[COLLECTIONS.classProjects].push(
            updateOne(projectId, {
                $set: {
                    subjectId: matchId,
                    subjectNameSnapshot: matches[0].name,
                },
            }),
        );
        counts.projectsLinkedToSubject += 1;
    }
}

function planLegacyNotificationInbox(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
    now: Date,
): void {
    const existing = new Set(
        snapshot.contextNotificationRecipients.flatMap((recipient) => {
            const notificationId = asObjectId(recipient.notificationId);
            const recipientId = asObjectId(recipient.recipientId);
            return notificationId && recipientId
                ? [pairKey(notificationId, recipientId)]
                : [];
        }),
    );

    for (const notification of snapshot.contextNotifications) {
        const notificationId = asObjectId(notification._id);
        if (!notificationId) continue;
        const deliveredAt = asDate(notification.createdAt) ?? now;
        const recipients = new Map<
            string,
            { recipientId: Types.ObjectId; status: "DELIVERED" | "SUPPRESSED" }
        >();
        if (Array.isArray(notification.recipientIds)) {
            for (const value of notification.recipientIds) {
                const recipientId = asObjectId(value);
                if (recipientId) {
                    recipients.set(String(recipientId), {
                        recipientId,
                        status: "DELIVERED",
                    });
                }
            }
        }
        if (Array.isArray(notification.suppressedRecipientIds)) {
            for (const value of notification.suppressedRecipientIds) {
                const recipientId = asObjectId(value);
                if (recipientId) {
                    recipients.set(String(recipientId), {
                        recipientId,
                        status: "SUPPRESSED",
                    });
                }
            }
        }

        for (const recipient of recipients.values()) {
            const key = pairKey(notificationId, recipient.recipientId);
            if (existing.has(key)) continue;
            existing.add(key);
            operations[COLLECTIONS.contextNotificationRecipients].push({
                insertOne: {
                    document: {
                        notificationId,
                        recipientId: recipient.recipientId,
                        status: recipient.status,
                        deliveredAt,
                        readAt: deliveredAt,
                        migratedAsRead: true,
                        createdAt: now,
                        updatedAt: now,
                    },
                },
            });
            counts.notificationRecipientsCreatedAsRead += 1;
        }
    }
}

function planGuidedRoomRepairs(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
    now: Date,
): void {
    const tests = new Map(
        snapshot.officialTests.flatMap((test) => {
            const testId = asObjectId(test._id);
            return testId ? [[String(testId), test] as const] : [];
        }),
    );
    for (const room of snapshot.guidedStudyRooms) {
        const roomId = asObjectId(room._id);
        const testId = asObjectId(room.officialTestId);
        if (!roomId || !testId || room.status !== "OPEN") continue;
        const test = tests.get(String(testId));
        if (!test || test.status !== "CLOSED") continue;
        operations[COLLECTIONS.guidedStudyRooms].push(
            updateOne(roomId, {
                $set: {
                    status: "CLOSED",
                    closedAt: asDate(test.closedAt) ?? now,
                    closedReason: MIGRATION_ROOM_CLOSED_REASON,
                    updatedAt: now,
                },
            }),
        );
        counts.inconsistentGuidedRoomsClosed += 1;
    }
}

function planOfficialLearningActivity(
    snapshot: ParityMigrationSnapshot,
    operations: Record<DataCollectionName, BulkOperation[]>,
    counts: ParityMigrationCounts,
): void {
    const existingKeys = new Set(
        snapshot.classLearningActivities.flatMap((activity) =>
            typeof activity.sourceEventKey === "string"
                ? [activity.sourceEventKey]
                : [],
        ),
    );
    const newActivities: LearningActivityInput[] = [];

    const add = (
        source: RawDocument,
        input: Omit<LearningActivityInput, "sourceEventKey" | "createdAt">,
        sourceName: string,
        suffix?: string,
    ) => {
        const sourceId = asObjectId(source._id);
        if (!sourceId) return;
        const sourceEventKey = `${sourceName}:${String(sourceId)}${
            suffix ? `:${suffix}` : ""
        }`;
        if (existingKeys.has(sourceEventKey)) return;
        existingKeys.add(sourceEventKey);
        newActivities.push({
            ...input,
            sourceEventKey,
            createdAt: input.occurredAt,
        });
    };

    for (const attempt of snapshot.officialTestAttempts) {
        addOfficialSource(add, attempt, "OFFICIAL_TEST_ATTEMPT", "official-test-attempt", attempt.answeredAt);
    }
    for (const interaction of snapshot.classAiInteractions) {
        addOfficialSource(add, interaction, "CLASS_AI_INTERACTION", "class-ai-interaction", interaction.createdAt);
    }
    const projectsById = new Map(
        snapshot.classProjects.flatMap((project) => {
            const projectId = asObjectId(project._id);
            return projectId ? [[String(projectId), project] as const] : [];
        }),
    );
    for (const plan of snapshot.projectAiPlans) {
        const projectId = asObjectId(plan.projectId);
        const project = projectId ? projectsById.get(String(projectId)) : undefined;
        addOfficialSource(
            add,
            {
                ...plan,
                classId: plan.classId ?? project?.classId,
                subjectId: plan.subjectId ?? project?.subjectId,
            },
            "PROJECT_AI_PLAN",
            "project-ai-plan",
            plan.createdAt,
        );
    }
    const roomsById = new Map(
        snapshot.guidedStudyRooms.flatMap((room) => {
            const roomId = asObjectId(room._id);
            return roomId ? [[String(roomId), room] as const] : [];
        }),
    );
    for (const interaction of snapshot.guidedRoomAiInteractions) {
        const roomId = asObjectId(interaction.roomId);
        const room = roomId ? roomsById.get(String(roomId)) : undefined;
        addOfficialSource(
            add,
            {
                ...interaction,
                classId: interaction.classId ?? room?.classId,
                subjectId: interaction.subjectId ?? room?.subjectId,
            },
            "GUIDED_ROOM_AI_INTERACTION",
            "guided-room-ai-interaction",
            interaction.createdAt,
        );
    }
    for (const attempt of snapshot.approvedAiQuizAttempts) {
        addOfficialSource(add, attempt, "APPROVED_AI_QUIZ_ATTEMPT", "approved-ai-quiz-attempt", attempt.answeredAt);
    }

    for (const message of snapshot.teacherStudentChatMessages) {
        if (message.authorRole !== "STUDENT") continue;
        const classId = asObjectId(message.classId);
        const studentId = asObjectId(message.authorUserId);
        const subjectId = asObjectId(message.subjectId);
        const occurredAt = asDate(message.createdAt);
        if (!classId || !studentId || !occurredAt) continue;
        add(
            message,
            {
                classId,
                studentId,
                subjectId,
                type: "OFFICIAL_CHAT_MESSAGE",
                occurredAt,
            },
            "official-chat-message",
        );
    }

    for (const participation of snapshot.guidedRoomParticipations) {
        const classId = asObjectId(participation.classId);
        const studentId = asObjectId(participation.studentId);
        const lastViewedAt = asDate(participation.lastViewedAt);
        if (!classId || !studentId || !lastViewedAt) continue;
        add(
            participation,
            {
                classId,
                studentId,
                subjectId: null,
                type: "GUIDED_ROOM_VIEWED",
                occurredAt: lastViewedAt,
            },
            "guided-room-view",
            "migration-last",
        );
        const completedAt = asDate(participation.completedAt);
        if (completedAt) {
            add(
                participation,
                {
                    classId,
                    studentId,
                    subjectId: null,
                    type: "GUIDED_ROOM_COMPLETED",
                    occurredAt: completedAt,
                },
                "guided-room-completed",
            );
        }
    }

    for (const activity of newActivities) {
        operations[COLLECTIONS.classLearningActivities].push({
            updateOne: {
                filter: { sourceEventKey: activity.sourceEventKey },
                update: { $setOnInsert: activity },
                upsert: true,
            },
        });
    }
    counts.learningActivitiesCreated = newActivities.length;

    const allActivities = [
        ...snapshot.classLearningActivities.flatMap(normaliseExistingActivity),
        ...newActivities,
    ].sort(compareActivity);
    const states = new Map<
        string,
        {
            classId: Types.ObjectId;
            studentId: Types.ObjectId;
            firstActivityAt: Date;
            lastActivityAt: Date;
            lastActivityType: LearningActivityInput["type"];
            activityCount: number;
        }
    >();
    for (const activity of allActivities) {
        const key = pairKey(activity.classId, activity.studentId);
        const state = states.get(key);
        if (!state) {
            states.set(key, {
                classId: activity.classId,
                studentId: activity.studentId,
                firstActivityAt: activity.occurredAt,
                lastActivityAt: activity.occurredAt,
                lastActivityType: activity.type,
                activityCount: 1,
            });
            continue;
        }
        state.lastActivityAt = activity.occurredAt;
        state.lastActivityType = activity.type;
        state.activityCount += 1;
    }

    for (const state of states.values()) {
        operations[COLLECTIONS.studentClassActivityStates].push({
            updateOne: {
                filter: { classId: state.classId, studentId: state.studentId },
                update: {
                    $set: { ...state, updatedAt: state.lastActivityAt },
                    $setOnInsert: { createdAt: state.firstActivityAt },
                },
                upsert: true,
            },
        });
    }
    counts.activityStatesProjected = states.size;
}

function addOfficialSource(
    add: (
        source: RawDocument,
        input: Omit<LearningActivityInput, "sourceEventKey" | "createdAt">,
        sourceName: string,
        suffix?: string,
    ) => void,
    source: RawDocument,
    type: LearningActivityInput["type"],
    sourceName: string,
    occurredAtValue: unknown,
): void {
    const classId = asObjectId(source.classId);
    const studentId = asObjectId(source.studentId);
    const subjectId = asObjectId(source.subjectId);
    const occurredAt = asDate(occurredAtValue);
    if (!classId || !studentId || !occurredAt) return;
    add(
        source,
        { classId, studentId, subjectId, type, occurredAt },
        sourceName,
    );
}

function normaliseExistingActivity(
    activity: RawDocument,
): LearningActivityInput[] {
    const classId = asObjectId(activity.classId);
    const studentId = asObjectId(activity.studentId);
    const occurredAt = asDate(activity.occurredAt);
    if (
        !classId ||
        !studentId ||
        !occurredAt ||
        !isLearningActivityType(activity.type) ||
        typeof activity.sourceEventKey !== "string"
    ) {
        return [];
    }
    return [
        {
            classId,
            studentId,
            subjectId: asObjectId(activity.subjectId),
            type: activity.type,
            occurredAt,
            sourceEventKey: activity.sourceEventKey,
            createdAt: asDate(activity.createdAt) ?? occurredAt,
        },
    ];
}

function compareActivity(left: LearningActivityInput, right: LearningActivityInput): number {
    const dateDifference = left.occurredAt.getTime() - right.occurredAt.getTime();
    if (dateDifference !== 0) return dateDifference;
    return left.sourceEventKey.localeCompare(right.sourceEventKey);
}

function isLearningActivityType(value: unknown): value is LearningActivityInput["type"] {
    return [
        "OFFICIAL_TEST_ATTEMPT",
        "CLASS_AI_INTERACTION",
        "PROJECT_AI_PLAN",
        "APPROVED_AI_QUIZ_ATTEMPT",
        "GUIDED_ROOM_VIEWED",
        "GUIDED_ROOM_COMPLETED",
        "GUIDED_ROOM_AI_INTERACTION",
        "OFFICIAL_CHAT_MESSAGE",
    ].includes(String(value));
}

function updateOne(id: Types.ObjectId, update: RawDocument): BulkOperation {
    return { updateOne: { filter: { _id: id }, update } };
}

function pairKey(left: Types.ObjectId, right: Types.ObjectId): string {
    return `${String(left)}:${String(right)}`;
}

function sameId(left: unknown, right: unknown): boolean {
    const leftId = asObjectId(left);
    const rightId = asObjectId(right);
    return Boolean(leftId && rightId && leftId.equals(rightId));
}

function asObjectId(value: unknown): Types.ObjectId | null {
    if (value instanceof Types.ObjectId) return value;
    if (typeof value !== "string" || !Types.ObjectId.isValid(value)) return null;
    return new Types.ObjectId(value);
}

function asDate(value: unknown): Date | null {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
    return value;
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function numericVersion(version: RawDocument): number {
    return typeof version.versionNumber === "number" &&
        Number.isFinite(version.versionNumber) &&
        version.versionNumber >= 1
        ? version.versionNumber
        : 0;
}

async function runFromCli(): Promise<void> {
    try {
        const options = parseParityMigrationCliArgs(process.argv.slice(2));
        const { mongoUri } = loadRuntimeConfig();
        await mongoose.connect(mongoUri, { autoIndex: false });
        const database = mongoose.connection.db;
        if (!database) throw new Error("Ligação MongoDB indisponível.");
        const result = await migrateStudentTeacherParity(
            database,
            mongoose.connection.getClient(),
            options,
        );
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                migrationId: STUDENT_TEACHER_PARITY_MIGRATION_ID,
                error: "Falha na migração de paridade.",
                errorType: error instanceof Error ? error.name : "UnknownError",
            }),
        );
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => undefined);
    }
}

if (process.argv[1]?.endsWith("migrate-student-teacher-parity.js")) {
    void runFromCli();
}
