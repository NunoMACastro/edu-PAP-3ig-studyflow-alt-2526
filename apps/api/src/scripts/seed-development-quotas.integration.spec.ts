/**
 * Valida a seed completa de desenvolvimento numa base e storage isolados.
 */
import { createHash } from "node:crypto";
import { copyFile, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { seedDevelopmentEnvironment } from "./seed-development-users.js";
import { MaterialStorageService } from "../modules/materials/material-storage.service.js";

describe("seed completa — defaults de quotas IA", () => {
    let replicaSet: MongoMemoryReplSet;
    let storageRoot: string;
    const temporaryRoots: string[] = [];
    const originalEnvironment = { ...process.env };

    beforeAll(async () => {
        storageRoot = await mkdtemp(join(tmpdir(), "studyflow-quota-seed-"));
        temporaryRoots.push(storageRoot);
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
        await Promise.all(temporaryRoots.map((root) =>
            rm(root, { recursive: true, force: true }),
        ));
        process.env = originalEnvironment;
    }, 30_000);

    it("cria a matriz correta e mantém contagens idempotentes", async () => {
        await seedDevelopmentEnvironment();
        const first = await readSeedCounts();

        await seedDevelopmentEnvironment();
        const second = await readSeedCounts();

        expect(first).toEqual({
            students: 4,
            teachers: 1,
            classes: 2,
            collaborations: 4,
            studyGroups: 2,
            studyRooms: 2,
            quotaDefaults: 10,
            exactQuotaPolicies: 0,
            wrongUserQuotaPolicies: 0,
            aiConsents: 0,
            modelPolicies: 10,
            configuredModels: ["gpt-5.4-mini"],
            guidedRoomsWithProcessableSources: 5,
        });
        expect(second).toEqual(first);
    }, 120_000);

    it("rejeita um digest alterado e só recupera com reset confirmado", async () => {
        const uri = process.env.MONGODB_URI!;
        await mongoose.connect(uri);
        await mongoose.connection.db!.collection("development_seed_runs").updateOne(
            { scenarioId: "tig-2023-2026-private-v1" },
            { $set: { inputDigest: "digest-alterado" } },
        );
        await mongoose.disconnect();

        await expect(seedDevelopmentEnvironment()).rejects.toThrow(
            "inputs privados mudaram",
        );
        process.env.STUDYFLOW_REPLACE_EXISTING_DATA = "true";
        process.env.STUDYFLOW_RESET_CONFIRMATION = "studyflow_dev";
        try {
            await seedDevelopmentEnvironment();
            expect(await readSeedCounts()).toEqual(expect.objectContaining({
                students: 4,
                teachers: 1,
                classes: 2,
                collaborations: 4,
            }));
        } finally {
            process.env.STUDYFLOW_REPLACE_EXISTING_DATA = "false";
            process.env.STUDYFLOW_RESET_CONFIRMATION = "";
        }
    }, 120_000);

    it("recusa uma base povoada que não pertence ao cenário privado", async () => {
        const originalUri = process.env.MONGODB_URI;
        process.env.MONGODB_URI = replicaSet.getUri("studyflow_e2e");
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            await mongoose.connection.db!.collection("users").insertOne({
                email: "cenario-anterior@example.test",
            });
            await mongoose.disconnect();
            await expect(seedDevelopmentEnvironment()).rejects.toThrow(
                "base contém outro cenário",
            );
        } finally {
            await mongoose.disconnect().catch(() => undefined);
            restoreEnvironment("MONGODB_URI", originalUri);
        }
    }, 30_000);

    it("valida, extrai e persiste um PDF isolado com hash, versão e contexto", async () => {
        const fixtureWorkspace = await mkdtemp(join(tmpdir(), "studyflow-private-input-"));
        const pdfStorageRoot = await mkdtemp(join(tmpdir(), "studyflow-pdf-storage-"));
        temporaryRoots.push(fixtureWorkspace, pdfStorageRoot);
        const privateInput = join(fixtureWorkspace, "real_dev", "seed-input-private");
        await cp(resolve(process.cwd(), "../seed-input-private"), privateInput, {
            recursive: true,
        });
        await copyFile(
            resolve(process.cwd(), "seed-assets/materials/web-semantica-acessivel.pdf"),
            join(privateInput, "materiais/12 ano/LP/Documentacao/fixture-validacao.pdf"),
        );
        const originalUri = process.env.MONGODB_URI;
        const originalStorage = process.env.MATERIALS_STORAGE_DIR;
        Object.assign(process.env, {
            MONGODB_URI: replicaSet.getUri("studyflow_test"),
            MATERIALS_STORAGE_DIR: pdfStorageRoot,
            STUDYFLOW_PRIVATE_SEED_INPUT_ROOT: privateInput,
            STUDYFLOW_PRIVATE_SEED_WORKSPACE_ROOT: fixtureWorkspace,
            STUDYFLOW_REPLACE_EXISTING_DATA: "false",
            STUDYFLOW_RESET_CONFIRMATION: "",
        });
        try {
            await seedDevelopmentEnvironment();
            await mongoose.connect(process.env.MONGODB_URI!);
            const database = mongoose.connection.db!;
            const pdf = await database.collection("official_materials").findOne({
                type: "PDF",
                originalName: "fixture-validacao.pdf",
            });
            expect(pdf).toEqual(expect.objectContaining({
                status: "PROCESSED",
                storageKey: expect.any(String),
                storageSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
                textContent: expect.any(String),
            }));
            expect(String(pdf?.textContent).length).toBeGreaterThan(100);
            expect(await database.collection("material_versions").countDocuments({
                materialId: pdf!._id,
                scope: "OFFICIAL_SUBJECT",
                versionNumber: 1,
            })).toBe(1);
            expect(await database.collection("materialcontexts").countDocuments({
                materialId: pdf!._id,
                scope: "OFFICIAL_SUBJECT",
            })).toBe(1);
            const bytes = await new MaterialStorageService().read(String(pdf!.storageKey));
            expect(createHash("sha256").update(bytes).digest("hex")).toBe(pdf!.storageSha256);
            await mongoose.disconnect();
        } finally {
            await mongoose.disconnect().catch(() => undefined);
            restoreEnvironment("MONGODB_URI", originalUri);
            restoreEnvironment("MATERIALS_STORAGE_DIR", originalStorage);
            delete process.env.STUDYFLOW_PRIVATE_SEED_INPUT_ROOT;
            delete process.env.STUDYFLOW_PRIVATE_SEED_WORKSPACE_ROOT;
        }
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
            ).toBe(50);
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

function restoreEnvironment(name: string, value: string | undefined): void {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}

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
