/**
 * Valida a seed completa de desenvolvimento numa base e storage isolados.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { seedDevelopmentEnvironment } from "./seed-development-users.js";

describe("seed completa — defaults de quotas IA", () => {
    let replicaSet: MongoMemoryReplSet;
    let storageRoot: string;
    const originalEnvironment = { ...process.env };

    beforeAll(async () => {
        storageRoot = await mkdtemp(join(tmpdir(), "studyflow-quota-seed-"));
        replicaSet = await MongoMemoryReplSet.create({
            replSet: { count: 1, name: "studyflow-rs" },
        });
        const uri = replicaSet.getUri("studyflow_dev");
        Object.assign(process.env, {
            NODE_ENV: "development",
            STUDYFLOW_ALLOW_DEV_SEED: "true",
            STUDYFLOW_REPLACE_EXISTING_DATA: "false",
            STUDYFLOW_RESET_CONFIRMATION: "",
            STUDYFLOW_E2E_SEED_AI_GOVERNANCE: "false",
            STUDYFLOW_DEMO_MODE: "false",
            STUDYFLOW_DEMO_FAKE_AI: "false",
            MONGODB_URI: uri,
            MATERIALS_STORAGE_DIR: storageRoot,
            OPENAI_MODEL: "gpt-5.4-mini",
            REDIS_URL: "redis://127.0.0.1:6379/15",
        });
    }, 60_000);

    afterAll(async () => {
        await mongoose.disconnect().catch(() => undefined);
        await replicaSet?.stop();
        await rm(storageRoot, { recursive: true, force: true });
        process.env = originalEnvironment;
    }, 30_000);

    it("cria a matriz correta e mantém contagens idempotentes", async () => {
        await seedDevelopmentEnvironment();
        const first = await readSeedCounts();

        await seedDevelopmentEnvironment();
        const second = await readSeedCounts();

        expect(first).toEqual({
            students: 18,
            teachers: 2,
            classes: 3,
            collaborations: 7,
            studyGroups: 5,
            studyRooms: 2,
            quotaDefaults: 10,
            exactQuotaPolicies: 0,
            wrongUserQuotaPolicies: 0,
            aiConsents: 0,
            modelPolicies: 10,
            configuredModels: ["gpt-5.4-mini"],
            guidedRoomsWithProcessableSources: 3,
        });
        expect(second).toEqual(first);
    }, 120_000);

    it("aplica limite 100 e grants sintéticos apenas no modo E2E", async () => {
        process.env.NODE_ENV = "test";
        process.env.STUDYFLOW_E2E_MODE = "true";
        process.env.STUDYFLOW_E2E_SEED_AI_GOVERNANCE = "true";
        try {
            await seedDevelopmentEnvironment();
            const uri = process.env.MONGODB_URI;
            if (!uri) throw new Error("MONGODB_URI isolado em falta.");
            await mongoose.connect(uri);
            const database = mongoose.connection.db;
            if (!database) throw new Error("Base isolada indisponível.");

            const defaults = await database
                .collection("ai_quota_default_policies")
                .find({}, { projection: { _id: 0, monthlyLimitUnits: 1, source: 1 } })
                .toArray();
            expect(defaults).toHaveLength(10);
            expect(
                defaults.every(
                    ({ monthlyLimitUnits, source }) =>
                        monthlyLimitUnits === 100 && source === "E2E_SEED",
                ),
            ).toBe(true);
            expect(
                await database.collection("ai_consents").countDocuments({}),
            ).toBe(180);
            expect(
                await database.collection("ai_quota_policies").countDocuments({}),
            ).toBe(0);
            await mongoose.disconnect();
        } finally {
            process.env.NODE_ENV = "development";
            process.env.STUDYFLOW_E2E_MODE = "false";
            process.env.STUDYFLOW_E2E_SEED_AI_GOVERNANCE = "false";
        }
    }, 120_000);
});

/** Lê apenas contagens e configurações técnicas, nunca conteúdo da demo. */
async function readSeedCounts(): Promise<Record<string, unknown>> {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI isolado em falta.");
    await mongoose.connect(uri);
    const database = mongoose.connection.db;
    if (!database) throw new Error("Base isolada indisponível.");

    const [
        students,
        teachers,
        classes,
        collaborations,
        studyGroups,
        studyRooms,
        quotaDefaults,
        exactQuotaPolicies,
        wrongUserQuotaPolicies,
        aiConsents,
        modelPolicies,
        configuredModels,
        guidedRoomsWithProcessableSources,
    ] = await Promise.all([
        database.collection("users").countDocuments({ role: "STUDENT" }),
        database.collection("users").countDocuments({ role: "TEACHER" }),
        database.collection("school_classes").countDocuments({}),
        database.collection("study_rooms").countDocuments({}),
        database.collection("study_rooms").countDocuments({
            collaborationKind: "STUDY_GROUP",
        }),
        database.collection("study_rooms").countDocuments({
            collaborationKind: "STUDY_ROOM",
        }),
        database.collection("ai_quota_default_policies").countDocuments({}),
        database.collection("ai_quota_policies").countDocuments({}),
        database.collection("ai_quota_policies").countDocuments({
            scope: "USER",
            purpose: { $in: ["CLASS_AI", "GROUP_AI", "ROOM_AI"] },
        }),
        database.collection("ai_consents").countDocuments({}),
        database.collection("ai_model_policies").countDocuments({}),
        database.collection("ai_model_policies").distinct("model"),
        countGuidedRoomsWithProcessableSources(database),
    ]);
    await mongoose.disconnect();
    return {
        students,
        teachers,
        classes,
        collaborations,
        studyGroups,
        studyRooms,
        quotaDefaults,
        exactQuotaPolicies,
        wrongUserQuotaPolicies,
        aiConsents,
        modelPolicies,
        configuredModels: configuredModels.sort(),
        guidedRoomsWithProcessableSources,
    };
}

/** Confirma que a seed liga salas guiadas a materiais oficiais com texto. */
async function countGuidedRoomsWithProcessableSources(
    database: NonNullable<typeof mongoose.connection.db>,
): Promise<number> {
    const rooms = await database
        .collection("guided_study_rooms")
        .find({ materialIds: { $exists: true, $ne: [] } })
        .toArray();
    let count = 0;
    for (const room of rooms) {
        const materialIds = (room.materialIds as string[])
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));
        const hasSource = await database.collection("official_materials").findOne({
            _id: { $in: materialIds },
            classId: room.classId,
            teacherId: room.teacherId,
            ...(room.subjectId ? { subjectId: room.subjectId } : {}),
            status: "PROCESSED",
            textContent: { $exists: true, $ne: "" },
        });
        if (hasSource) count += 1;
    }
    return count;
}
