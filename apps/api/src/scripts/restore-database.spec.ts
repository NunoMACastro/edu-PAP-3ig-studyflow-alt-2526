/** Testa round-trip e compensação sem tocar em MongoDB real. */
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureStudyFlowDirectory } from "../common/storage/dedicated-local-directory.js";
import { createDailyBackup, type BackupConnection } from "./backup-database.js";
import { restoreDatabase, type RestoreConnection } from "./restore-database.js";

const encryptionKey = Buffer.alloc(32, 11).toString("base64");

describe("restore completo e compensável da StudyFlow", () => {
    let backupRoot: string;
    let sourceStorage: string;
    let restoreParent: string;
    let restoreStorage: string;

    beforeEach(async () => {
        backupRoot = await mkdtemp(join(tmpdir(), "studyflow-backups-"));
        sourceStorage = await mkdtemp(join(tmpdir(), "studyflow-materials-"));
        restoreParent = await mkdtemp(join(tmpdir(), "studyflow-restore-parent-"));
        restoreStorage = join(restoreParent, "studyflow-materials-restored");
        await ensureStudyFlowDirectory(sourceStorage, "material-storage");
        await mkdir(join(sourceStorage, "users", "owner-1"), { recursive: true });
        await writeFile(
            join(sourceStorage, "users", "owner-1", "material.pdf"),
            "ficheiro sintético",
            { mode: 0o600 },
        );
    });

    afterEach(async () => {
        await Promise.all([
            rm(backupRoot, { recursive: true, force: true }),
            rm(sourceStorage, { recursive: true, force: true }),
            rm(restoreParent, { recursive: true, force: true }),
        ]);
    });

    async function createBackup() {
        const source: BackupConnection = {
            db: {
                collections: async () => [
                    {
                        collectionName: "materials",
                        countDocuments: async () => 2,
                        find: () => ({
                            async *[Symbol.asyncIterator]() {
                                yield { _id: "doc-a", title: "A", score: 7 };
                                yield { _id: "doc-b", title: "B", score: 8 };
                            },
                        }),
                    },
                ],
            },
            close: async () => undefined,
        };
        return createDailyBackup({
            mongoUri: "mongodb://127.0.0.1:27017/studyflow",
            backupRoot,
            materialsStorageDir: sourceStorage,
            encryptionKey,
            offlineConfirmed: true,
            createConnection: async () => source,
        });
    }

    it("restaura por batches e promove o storage dedicado", async () => {
        const backup = await createBackup();
        const insertMany = jest.fn(async () => undefined);
        const deleteMany = jest.fn(async () => undefined);
        const destination: RestoreConnection = {
            db: {
                collections: async () => [],
                collection: () => ({
                    countDocuments: async () => 2,
                    insertMany,
                    deleteMany,
                }),
            },
            close: async () => undefined,
        };
        const summary = await restoreDatabase({
            backupDir: backup.outputDir,
            mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
            materialsStorageDir: restoreStorage,
            encryptionKey,
            allowRestore: true,
            offlineConfirmed: true,
            confirmation: "studyflow_restore",
            storageConfirmation: "studyflow-materials-restored",
            createConnection: async () => destination,
        });

        expect(summary).toMatchObject({
            collections: 1,
            documents: 2,
            storageFiles: 1,
            ok: true,
        });
        expect(insertMany).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ title: "A" }),
                expect.objectContaining({ title: "B" }),
            ]),
            { ordered: true },
        );
        expect(deleteMany).not.toHaveBeenCalled();
        expect(
            await readFile(join(restoreStorage, "users", "owner-1", "material.pdf"), "utf8"),
        ).toBe("ficheiro sintético");
        expect((await stat(restoreStorage)).mode & 0o777).toBe(0o700);
    });

    it("compensa documentos e remove staging quando uma inserção falha", async () => {
        const backup = await createBackup();
        const deleteMany = jest.fn(async () => undefined);
        await expect(
            restoreDatabase({
                backupDir: backup.outputDir,
                mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
                materialsStorageDir: restoreStorage,
                encryptionKey,
                allowRestore: true,
                offlineConfirmed: true,
                confirmation: "studyflow_restore",
                storageConfirmation: "studyflow-materials-restored",
                createConnection: async () => ({
                    db: {
                        collections: async () => [],
                        collection: () => ({
                            countDocuments: async () => 0,
                            insertMany: async () => {
                                throw new Error("falha sintética");
                            },
                            deleteMany,
                        }),
                    },
                    close: async () => undefined,
                }),
            }),
        ).rejects.toThrow("falha sintética");
        expect(deleteMany).toHaveBeenCalledWith({
            _id: { $in: ["doc-a", "doc-b"] },
        });
        await expect(stat(restoreStorage)).rejects.toMatchObject({ code: "ENOENT" });
    });

    it("recusa base/storage não vazios ou sem confirmações independentes", async () => {
        const backup = await createBackup();
        await expect(
            restoreDatabase({
                backupDir: backup.outputDir,
                mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
                materialsStorageDir: restoreStorage,
                encryptionKey,
                allowRestore: true,
                offlineConfirmed: true,
                confirmation: "studyflow_restore",
                storageConfirmation: "errado",
            }),
        ).rejects.toThrow("STUDYFLOW_RESTORE_STORAGE_CONFIRMATION");

        await mkdir(restoreStorage);
        await expect(
            restoreDatabase({
                backupDir: backup.outputDir,
                mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
                materialsStorageDir: restoreStorage,
                encryptionKey,
                allowRestore: true,
                offlineConfirmed: true,
                confirmation: "studyflow_restore",
                storageConfirmation: "studyflow-materials-restored",
                createConnection: async () => ({
                    db: {
                        collections: async () => [],
                        collection: () => ({
                            countDocuments: async () => 0,
                            insertMany: async () => undefined,
                            deleteMany: async () => undefined,
                        }),
                    },
                    close: async () => undefined,
                }),
            }),
        ).rejects.toThrow("ainda inexistente");
    });

    it("recusa manifesto alterado antes de criar o storage de destino", async () => {
        const backup = await createBackup();
        const manifestPath = join(backup.outputDir, "manifest.json");
        const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
        manifest.documents = 99;
        await writeFile(manifestPath, JSON.stringify(manifest));

        await expect(
            restoreDatabase({
                backupDir: backup.outputDir,
                mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
                materialsStorageDir: restoreStorage,
                encryptionKey,
                allowRestore: true,
                offlineConfirmed: true,
                confirmation: "studyflow_restore",
                storageConfirmation: "studyflow-materials-restored",
            }),
        ).rejects.toThrow("Autenticidade");
        await expect(stat(restoreStorage)).rejects.toMatchObject({ code: "ENOENT" });
    });

    it("não apaga writes alheios quando deteta concorrência", async () => {
        const backup = await createBackup();
        const deleteMany = jest.fn(async () => undefined);
        let countCalls = 0;
        await expect(
            restoreDatabase({
                backupDir: backup.outputDir,
                mongoUri: "mongodb://127.0.0.1:27017/studyflow_restore",
                materialsStorageDir: restoreStorage,
                encryptionKey,
                allowRestore: true,
                offlineConfirmed: true,
                confirmation: "studyflow_restore",
                storageConfirmation: "studyflow-materials-restored",
                createConnection: async () => ({
                    db: {
                        collections: async () => [],
                        collection: () => ({
                            countDocuments: async () => (++countCalls > 1 ? 3 : 0),
                            insertMany: async () => undefined,
                            deleteMany,
                        }),
                    },
                    close: async () => undefined,
                }),
            }),
        ).rejects.toThrow("writes concorrentes");
        expect(deleteMany).toHaveBeenCalledWith({
            _id: { $in: ["doc-a", "doc-b"] },
        });
        expect(deleteMany).not.toHaveBeenCalledWith({});
    });
});
