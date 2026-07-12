import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DemoPdfStorage } from "./demo-pdf-storage.js";

describe("DemoPdfStorage", () => {
    let temporaryRoot: string;
    let previousStorageRoot: string | undefined;

    beforeEach(async () => {
        previousStorageRoot = process.env.MATERIALS_STORAGE_DIR;
        temporaryRoot = await mkdtemp(join(tmpdir(), "studyflow-seed-test-"));
        process.env.MATERIALS_STORAGE_DIR = join(
            temporaryRoot,
            "studyflow-materials",
        );
    });

    afterEach(async () => {
        if (previousStorageRoot === undefined) {
            delete process.env.MATERIALS_STORAGE_DIR;
        } else {
            process.env.MATERIALS_STORAGE_DIR = previousStorageRoot;
        }
        await rm(temporaryRoot, { recursive: true, force: true });
    });

    it("valida, guarda, relê e limpa as seis fixtures", async () => {
        const storage = new DemoPdfStorage();
        const fixtures = await storage.preflight();
        expect(fixtures.size).toBe(6);

        const fixture = fixtures.get("apis-seguras");
        expect(fixture).toBeDefined();
        const stored = await storage.store("507f1f77bcf86cd799439011", fixture!);
        await expect(
            storage.assertStored(stored.storageKey, stored.storageSha256),
        ).resolves.toBeUndefined();
        await expect(storage.listCommittedKeys()).resolves.toEqual([
            stored.storageKey,
        ]);
        await expect(storage.clearCommitted()).resolves.toBe(1);
        await expect(storage.listCommittedKeys()).resolves.toEqual([]);
    });
});
