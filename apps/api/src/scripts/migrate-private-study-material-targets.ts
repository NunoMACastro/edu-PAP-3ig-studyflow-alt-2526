/**
 * Preenche o destino organizacional dos materiais privados legacy.
 * A migração é aditiva, idempotente, não lê conteúdo IA para logs e exige
 * `--apply` para escrever.
 */
import mongoose, { mongo, Types } from "mongoose";
import { loadRuntimeConfig } from "../common/config/runtime-config.js";

type MigrationMode = "DRY_RUN" | "APPLY";

export type PrivateStudyMaterialTargetMigrationResult = {
    ok: true;
    status: MigrationMode;
    candidates: {
        artifacts: number;
        jobs: number;
        attempts: number;
    };
    modified: {
        artifacts: number;
        jobs: number;
        attempts: number;
    };
};

export function parsePrivateStudyMaterialTargetArgs(args: string[]): MigrationMode {
    if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) {
        return "DRY_RUN";
    }
    if (args.length === 1 && args[0] === "--apply") return "APPLY";
    throw new Error("Usa --dry-run ou --apply.");
}

/** Backfill de `STUDY_AREA` para os três modelos que já usavam studyAreaId. */
export async function migratePrivateStudyMaterialTargets(
    database: mongo.Db,
    mode: MigrationMode,
): Promise<PrivateStudyMaterialTargetMigrationResult> {
    const artifactFilter = {
        targetKind: { $exists: false },
        studyAreaId: { $type: "objectId" },
    };
    const dependentFilter = {
        targetKind: { $exists: false },
        studyAreaId: { $type: "objectId" },
    };
    const candidates = {
        artifacts: await database.collection("ai_artifacts").countDocuments(artifactFilter),
        jobs: await database.collection("quiz_generation_jobs").countDocuments(dependentFilter),
        attempts: await database.collection("ai_quiz_attempts").countDocuments(dependentFilter),
    };
    const modified = { artifacts: 0, jobs: 0, attempts: 0 };
    if (mode === "DRY_RUN") {
        return { ok: true, status: mode, candidates, modified };
    }

    const labelCache = new Map<string, string>();
    const artifacts = database.collection("ai_artifacts").find(
        artifactFilter,
        { projection: { _id: 1, studyAreaId: 1 }, batchSize: 100 },
    );
    for await (const artifact of artifacts) {
        const studyAreaId = artifact.studyAreaId;
        if (!(studyAreaId instanceof Types.ObjectId)) continue;
        const key = String(studyAreaId);
        let label = labelCache.get(key);
        if (!label) {
            const area = await database.collection("study_areas").findOne(
                { _id: studyAreaId },
                { projection: { name: 1 } },
            );
            label = safeLabel(area?.name) ?? "Área pessoal";
            labelCache.set(key, label);
        }
        const result = await database.collection("ai_artifacts").updateOne(
            { _id: artifact._id, targetKind: { $exists: false } },
            {
                $set: {
                    targetKind: "STUDY_AREA",
                    targetId: studyAreaId,
                    targetLabelSnapshot: label,
                    visibility: "PRIVATE",
                },
            },
        );
        modified.artifacts += result.modifiedCount;
    }

    const jobs = await database.collection("quiz_generation_jobs").updateMany(
        dependentFilter,
        [
            {
                $set: {
                    targetKind: "STUDY_AREA",
                    targetId: "$studyAreaId",
                },
            },
        ],
    );
    modified.jobs = jobs.modifiedCount;
    const attempts = await database.collection("ai_quiz_attempts").updateMany(
        dependentFilter,
        [
            {
                $set: {
                    targetKind: "STUDY_AREA",
                    targetId: "$studyAreaId",
                },
            },
        ],
    );
    modified.attempts = attempts.modifiedCount;
    return { ok: true, status: mode, candidates, modified };
}

function safeLabel(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const normalized = value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    return normalized || null;
}

async function runFromCli(): Promise<void> {
    try {
        const mode = parsePrivateStudyMaterialTargetArgs(process.argv.slice(2));
        const { mongoUri } = loadRuntimeConfig();
        await mongoose.connect(mongoUri, { autoIndex: false });
        const database = mongoose.connection.db;
        if (!database) throw new Error("Ligação MongoDB indisponível.");
        console.log(
            JSON.stringify(await migratePrivateStudyMaterialTargets(database, mode)),
        );
    } catch (error) {
        console.error(JSON.stringify({
            ok: false,
            error: "Falha na migração de destinos de materiais privados.",
            errorType: error instanceof Error ? error.name : "UnknownError",
        }));
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => undefined);
    }
}

if (process.argv[1]?.endsWith("migrate-private-study-material-targets.js")) {
    void runFromCli();
}
