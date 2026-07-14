/**
 * Agrupa históricos IA legacy em conversas read-only. O runner é aditivo,
 * idempotente e não carrega perguntas ou respostas para os logs.
 */
import { createHash, randomUUID } from "node:crypto";
import mongoose, { mongo, Types } from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";

const CONVERSATIONS = "student_ai_conversations";
const SOURCES = [
    {
        collection: "class_ai_interactions",
        kind: "SUBJECT",
        contextField: "subjectId",
        labelCollection: "subjects",
        labelField: "name",
        citationCollection: "official_materials",
        citationIdsField: "sourceMaterialIds",
        citationKind: "OFFICIAL_MATERIAL",
    },
    {
        collection: "private_area_ai_answers",
        kind: "STUDY_AREA",
        contextField: "studyAreaId",
        labelCollection: "study_areas",
        labelField: "name",
        citationCollection: "materials",
        citationIdsField: "sourceMaterialIds",
        citationKind: "PRIVATE_MATERIAL",
    },
    {
        collection: "studygroupaianswers",
        kind: "STUDY_GROUP",
        contextField: "groupId",
        labelCollection: "study_rooms",
        labelField: "name",
        citationCollection: null,
        citationIdsField: null,
        citationKind: "GROUP_RESOURCE",
    },
    {
        collection: "room_ai_interactions",
        kind: "STUDY_ROOM",
        contextField: "roomId",
        labelCollection: "study_rooms",
        labelField: "name",
        citationCollection: "room_shares",
        citationIdsField: "sourceShareIds",
        citationKind: "ROOM_SHARE",
    },
    {
        collection: "guided_study_room_ai_interactions",
        kind: "GUIDED_ROOM",
        contextField: "roomId",
        labelCollection: "guided_study_rooms",
        labelField: "title",
        citationCollection: "official_materials",
        citationIdsField: "sourceMaterialIds",
        citationKind: "OFFICIAL_MATERIAL",
    },
] as const;

type MigrationMode =
    | { mode: "DRY_RUN" }
    | { mode: "APPLY"; runId: string }
    | { mode: "ROLLBACK"; runId: string };

export type StudentAiConversationMigrationCounts = {
    students: number;
    conversations: number;
    interactions: number;
    inconsistencies: number;
    byContext: Record<string, number>;
};

export function parseStudentAiConversationMigrationArgs(args: string[]): MigrationMode {
    if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) {
        return { mode: "DRY_RUN" };
    }
    if (args.length === 1 && args[0] === "--apply") {
        return {
            mode: "APPLY",
            runId: `student-ai-${new Date().toISOString().replaceAll(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`,
        };
    }
    const rollbackIndex = args.indexOf("--rollback");
    if (rollbackIndex >= 0 && args.length === 2 && args[rollbackIndex + 1]) {
        return { mode: "ROLLBACK", runId: args[rollbackIndex + 1] };
    }
    throw new Error("Usa --dry-run, --apply ou --rollback <runId>.");
}

/** Executa a migração sem transação global, usando upserts e updates retomáveis. */
export async function migrateStudentAiConversations(
    database: mongo.Db,
    options: MigrationMode,
): Promise<{
    ok: true;
    status: MigrationMode["mode"];
    runId?: string;
    counts: StudentAiConversationMigrationCounts;
}> {
    if (options.mode === "ROLLBACK") {
        return rollback(database, options.runId);
    }
    const counts: StudentAiConversationMigrationCounts = {
        students: 0,
        conversations: 0,
        interactions: 0,
        inconsistencies: 0,
        byContext: {},
    };
    const studentIds = new Set<string>();
    for (const source of SOURCES) {
        const collection = database.collection(source.collection);
        const groups = collection
            .aggregate<{
                _id: { studentId: Types.ObjectId; contextId: Types.ObjectId };
                count: number;
                lastMessageAt: Date;
            }>([
                {
                    $match: {
                        conversationId: { $exists: false },
                        studentId: { $type: "objectId" },
                        [source.contextField]: { $type: "objectId" },
                    },
                },
                {
                    $group: {
                        _id: {
                            studentId: "$studentId",
                            contextId: `$${source.contextField}`,
                        },
                        count: { $sum: 1 },
                        lastMessageAt: { $max: "$createdAt" },
                    },
                },
            ], { batchSize: 100 });
        let contextGroupCount = 0;
        for await (const group of groups) {
            contextGroupCount += 1;
            counts.conversations += 1;
            counts.interactions += group.count;
            studentIds.add(String(group._id.studentId));
            if (options.mode === "DRY_RUN") continue;
            const legacyGroupKey = [
                "legacy-migration",
                source.kind,
                String(group._id.studentId),
                String(group._id.contextId),
            ].join(":");
            const labelDocument = await database
                .collection(source.labelCollection)
                .findOne(
                    { _id: group._id.contextId },
                    { projection: { [source.labelField]: 1 } },
                );
            const label =
                typeof labelDocument?.[source.labelField] === "string"
                    ? String(labelDocument[source.labelField]).slice(0, 160)
                    : "Contexto anterior";
            const deterministicId = new Types.ObjectId(
                createHash("sha256").update(legacyGroupKey).digest("hex").slice(0, 24),
            );
            const now = new Date();
            await database.collection(CONVERSATIONS).updateOne(
                { legacyGroupKey },
                {
                    $setOnInsert: {
                        _id: deterministicId,
                        studentId: group._id.studentId,
                        contextKind: source.kind,
                        contextId: group._id.contextId,
                        contextLabelSnapshot: label,
                        title: "Histórico anterior",
                        status: "ACTIVE",
                        origin: "LEGACY_MIGRATION",
                        readOnly: true,
                        readOnlyReason: "LEGACY_MIGRATION",
                        migrationRunId: options.runId,
                        legacyGroupKey,
                        createdAt: now,
                    },
                    $max: { lastMessageAt: group.lastMessageAt ?? now },
                    $set: { updatedAt: now },
                },
                { upsert: true },
            );
            const conversation = await database
                .collection(CONVERSATIONS)
                .findOne({ legacyGroupKey }, { projection: { _id: 1 } });
            if (!conversation?._id) throw new Error("Conversa legacy não foi criada.");
            const interactions = collection.find(
                {
                    conversationId: { $exists: false },
                    studentId: group._id.studentId,
                    [source.contextField]: group._id.contextId,
                },
                {
                    projection: {
                        _id: 1,
                        sourceMaterialIds: 1,
                        sourceShareIds: 1,
                        sources: 1,
                    },
                    batchSize: 100,
                },
            );
            for await (const interaction of interactions) {
                const citationSnapshots = await resolveCitationSnapshots(
                    database,
                    source,
                    interaction,
                );
                await collection.updateOne(
                    { _id: interaction._id, conversationId: { $exists: false } },
                    {
                        $set: {
                            conversationId: conversation._id,
                            migrationRunId: options.runId,
                            citationSnapshots,
                        },
                    },
                );
            }
        }
        counts.byContext[source.kind] = contextGroupCount;
    }
    counts.students = studentIds.size;
    return {
        ok: true,
        status: options.mode,
        ...(options.mode === "APPLY" ? { runId: options.runId } : {}),
        counts,
    };
}

/** Resolve apenas labels históricas seguras, preservando a ordem das fontes. */
async function resolveCitationSnapshots(
    database: mongo.Db,
    source: (typeof SOURCES)[number],
    interaction: mongo.WithId<mongo.Document>,
): Promise<Array<{ label: string; kind: (typeof SOURCES)[number]["citationKind"] }>> {
    if (source.kind === "STUDY_GROUP" && Array.isArray(interaction.sources)) {
        const embedded = interaction.sources
            .map((item: unknown) => {
                if (!item || typeof item !== "object") return null;
                const title = (item as { title?: unknown }).title;
                return typeof title === "string" ? safeCitationLabel(title) : null;
            })
            .filter((label): label is string => Boolean(label));
        if (embedded.length > 0) {
            return embedded.map((label) => ({ label, kind: source.citationKind }));
        }
    }
    const ids = source.citationIdsField
        ? interaction[source.citationIdsField]
        : undefined;
    if (source.citationCollection && Array.isArray(ids) && ids.length > 0) {
        const rows = await database
            .collection(source.citationCollection)
            .find(
                { _id: { $in: ids } },
                { projection: { title: 1 } },
            )
            .toArray();
        const labelById = new Map(
            rows.flatMap((row) => {
                const label = typeof row.title === "string"
                    ? safeCitationLabel(row.title)
                    : null;
                return label ? [[String(row._id), label] as const] : [];
            }),
        );
        const resolved = ids.flatMap((id: unknown) => {
            const label = labelById.get(String(id));
            return label ? [{ label, kind: source.citationKind }] : [];
        });
        if (resolved.length > 0) return resolved;
    }
    return [{
        label: "Fonte utilizada na resposta original",
        kind: source.citationKind,
    }];
}

/** Remove control characters e limita a fotografia ao label estritamente necessário. */
function safeCitationLabel(value: string): string | null {
    const normalized = value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    return normalized || null;
}

async function rollback(database: mongo.Db, runId: string) {
    const counts: StudentAiConversationMigrationCounts = {
        students: 0,
        conversations: 0,
        interactions: 0,
        inconsistencies: 0,
        byContext: {},
    };
    const studentIds = new Set<string>();
    for (const source of SOURCES) {
        const affectedStudents = await database
            .collection(source.collection)
            .distinct("studentId", { migrationRunId: runId });
        for (const studentId of affectedStudents) studentIds.add(String(studentId));
        const result = await database.collection(source.collection).updateMany(
            { migrationRunId: runId },
            {
                $unset: {
                    conversationId: "",
                    citationSnapshots: "",
                    migrationRunId: "",
                },
            },
        );
        counts.interactions += result.modifiedCount;
        counts.byContext[source.kind] = result.modifiedCount;
    }
    const candidates = await database
        .collection(CONVERSATIONS)
        .find({ migrationRunId: runId, origin: "LEGACY_MIGRATION" })
        .project({ _id: 1 })
        .toArray();
    for (const candidate of candidates) {
        let references = 0;
        for (const source of SOURCES) {
            references += await database
                .collection(source.collection)
                .countDocuments({ conversationId: candidate._id }, { limit: 1 });
        }
        if (references === 0) {
            const removed = await database
                .collection(CONVERSATIONS)
                .deleteOne({ _id: candidate._id, migrationRunId: runId });
            counts.conversations += removed.deletedCount;
        } else {
            counts.inconsistencies += 1;
        }
    }
    counts.students = studentIds.size;
    return { ok: true as const, status: "ROLLBACK" as const, runId, counts };
}

async function runFromCli(): Promise<void> {
    try {
        const options = parseStudentAiConversationMigrationArgs(process.argv.slice(2));
        const { mongoUri } = loadRuntimeConfig();
        await mongoose.connect(mongoUri, { autoIndex: false });
        const database = mongoose.connection.db;
        if (!database) throw new Error("Ligação MongoDB indisponível.");
        const result = await migrateStudentAiConversations(database, options);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(JSON.stringify({
            ok: false,
            error: "Falha na migração de conversas IA.",
            errorType: error instanceof Error ? error.name : "UnknownError",
        }));
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => undefined);
    }
}

if (process.argv[1]?.endsWith("migrate-student-ai-conversations.js")) {
    void runFromCli();
}
