/**
 * Classifica entidades colaborativas legacy sem mover nem apagar documentos.
 * O runner é dry-run por defeito, idempotente, processa por batches e permite
 * rollback apenas dos documentos marcados pelo runId indicado.
 */
import { randomUUID } from "node:crypto";
import mongoose, { mongo } from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";

type Mode =
    | { mode: "DRY_RUN" }
    | { mode: "APPLY"; runId: string }
    | { mode: "ROLLBACK"; runId: string };

export type CollaborationKindPlanItem = {
    roomId: string;
    kind: "STUDY_GROUP" | "STUDY_ROOM";
    ambiguous: boolean;
};

export function parseCollaborationMigrationArgs(args: string[]): Mode {
    if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) {
        return { mode: "DRY_RUN" };
    }
    if (args.length === 1 && args[0] === "--apply") {
        return {
            mode: "APPLY",
            runId: `collaboration-kind-${new Date().toISOString().replaceAll(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`,
        };
    }
    if (args.length === 2 && args[0] === "--rollback" && args[1]) {
        return { mode: "ROLLBACK", runId: args[1] };
    }
    throw new Error("Usa --dry-run, --apply ou --rollback <runId>.");
}

/** Aplica a ordem de evidência fechada no plano, sem consultar conteúdo livre. */
export function buildCollaborationKindPlan(input: {
    rooms: Array<{ _id: unknown; disciplineName?: string; collaborationKind?: string }>;
    groupEvidenceIds: Set<string>;
    roomEvidenceIds: Set<string>;
}): CollaborationKindPlanItem[] {
    return input.rooms
        .filter((room) => !room.collaborationKind)
        .map((room) => {
            const roomId = String(room._id);
            const groupEvidence = input.groupEvidenceIds.has(roomId);
            const roomEvidence = input.roomEvidenceIds.has(roomId);
            return {
                roomId,
                kind: groupEvidence
                    ? "STUDY_GROUP" as const
                    : roomEvidence
                        ? "STUDY_ROOM" as const
                        : room.disciplineName?.trim()
                            ? "STUDY_GROUP" as const
                            : "STUDY_ROOM" as const,
                ambiguous: groupEvidence && roomEvidence,
            };
        });
}

export async function migrateCollaborationKinds(database: mongo.Db, options: Mode) {
    const rooms = database.collection<{
        _id: mongoose.Types.ObjectId;
        disciplineName?: string;
        collaborationKind?: string;
        collaborationKindSource?: string;
        collaborationMigrationRunId?: string;
    }>("study_rooms");
    if (options.mode === "ROLLBACK") {
        const result = await rooms.updateMany(
            { collaborationMigrationRunId: options.runId, collaborationKindSource: "LEGACY_INFERRED" },
            { $unset: { collaborationKind: "", collaborationKindSource: "", collaborationMigrationRunId: "" } },
        );
        return { ok: true as const, status: "ROLLBACK" as const, runId: options.runId, reverted: result.modifiedCount };
    }

    const [rawLegacyRooms, groupIds, sessionIds, groupAiIds, roomAiIds] = await Promise.all([
        rooms.find({ collaborationKind: { $exists: false } }).project({ _id: 1, disciplineName: 1 }).toArray(),
        database.collection("studygroupmessages").distinct("groupId"),
        database.collection("studygroupsessions").distinct("groupId"),
        database.collection("studygroupaianswers").distinct("groupId"),
        database.collection("room_ai_interactions").distinct("roomId"),
    ]);
    const legacyRooms = rawLegacyRooms as unknown as Array<{
        _id: mongoose.Types.ObjectId;
        disciplineName?: string;
        collaborationKind?: string;
    }>;
    const plan = buildCollaborationKindPlan({
        rooms: legacyRooms,
        groupEvidenceIds: new Set([...groupIds, ...sessionIds, ...groupAiIds].map(String)),
        roomEvidenceIds: new Set(roomAiIds.map(String)),
    });
    const counts = {
        total: plan.length,
        studyGroups: plan.filter((item) => item.kind === "STUDY_GROUP").length,
        studyRooms: plan.filter((item) => item.kind === "STUDY_ROOM").length,
        ambiguous: plan.filter((item) => item.ambiguous).length,
    };
    if (options.mode === "DRY_RUN") {
        return { ok: true as const, status: "DRY_RUN" as const, counts, ambiguousEntityIds: plan.filter((item) => item.ambiguous).map((item) => item.roomId) };
    }

    for (let offset = 0; offset < plan.length; offset += 500) {
        const batch = plan.slice(offset, offset + 500);
        if (batch.length === 0) continue;
        await rooms.bulkWrite(batch.map((item) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(item.roomId), collaborationKind: { $exists: false } },
                update: { $set: {
                    collaborationKind: item.kind,
                    collaborationKindSource: "LEGACY_INFERRED",
                    collaborationMigrationRunId: options.runId,
                } },
            },
        })), { ordered: false });
    }
    return { ok: true as const, status: "APPLY" as const, runId: options.runId, counts, ambiguousEntityIds: plan.filter((item) => item.ambiguous).map((item) => item.roomId) };
}

async function runFromCli(): Promise<void> {
    try {
        const mode = parseCollaborationMigrationArgs(process.argv.slice(2));
        const { mongoUri } = loadRuntimeConfig();
        await mongoose.connect(mongoUri, { autoIndex: false });
        if (!mongoose.connection.db) throw new Error("Ligação MongoDB indisponível.");
        console.log(JSON.stringify(await migrateCollaborationKinds(mongoose.connection.db, mode)));
    } catch (error) {
        console.error(JSON.stringify({ ok: false, error: "Falha na migração de contextos colaborativos.", errorType: error instanceof Error ? error.name : "UnknownError" }));
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => undefined);
    }
}

if (process.argv[1]?.endsWith("migrate-collaboration-kinds.js")) {
    void runFromCli();
}
