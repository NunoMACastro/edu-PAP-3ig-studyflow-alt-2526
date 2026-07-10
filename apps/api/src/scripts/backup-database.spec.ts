/** Testes sintéticos do backup completo sem MongoDB real. */
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureStudyFlowDirectory } from "../common/storage/dedicated-local-directory.js";
import {
    createDailyBackup,
    normaliseBackupOptions,
    type BackupConnection,
} from "./backup-database.js";

const backupKey = Buffer.alloc(32, 7).toString("base64");

describe("backup offline completo da StudyFlow", () => {
    let backupRoot: string;
    let storageRoot: string;

    beforeEach(async () => {
        backupRoot = await mkdtemp(join(tmpdir(), "studyflow-backups-"));
        storageRoot = await mkdtemp(join(tmpdir(), "studyflow-materials-"));
        await ensureStudyFlowDirectory(storageRoot, "material-storage");
        await mkdir(join(storageRoot, "users", "owner-1"), {
            recursive: true,
            mode: 0o700,
        });
        await writeFile(
            join(storageRoot, "users", "owner-1", "material.pdf"),
            Buffer.from("conteúdo binário sintético"),
            { mode: 0o600 },
        );
    });

    afterEach(async () => {
        await Promise.all([
            rm(backupRoot, { recursive: true, force: true }),
            rm(storageRoot, { recursive: true, force: true }),
        ]);
    });

    it("cifra MongoDB e storage sem expor paths pessoais no manifesto", async () => {
        const close = jest.fn(async () => undefined);
        const connection: BackupConnection = {
            db: {
                collections: async () => [
                    {
                        collectionName: "users",
                        countDocuments: async () => 1,
                        find: () => ({
                            async *[Symbol.asyncIterator]() {
                                yield { email: "aluno@example.test" };
                            },
                        }),
                    },
                ],
            },
            close,
        };

        const summary = await createDailyBackup({
            mongoUri: "mongodb://127.0.0.1:27017/studyflow",
            backupRoot,
            materialsStorageDir: storageRoot,
            encryptionKey: backupKey,
            offlineConfirmed: true,
            now: new Date("2026-07-10T02:15:00.000Z"),
            createConnection: async () => connection,
        });
        const manifest = await readFile(join(summary.outputDir, "manifest.json"), "utf8");

        expect(summary).toMatchObject({
            formatVersion: 2,
            collections: 1,
            documents: 1,
            storage: { files: 1 },
        });
        expect(manifest).not.toContain("mongodb://");
        expect(manifest).not.toContain("aluno@example.test");
        expect(manifest).not.toContain("owner-1");
        expect((await stat(summary.outputDir)).mode & 0o777).toBe(0o700);
        expect(
            (await stat(join(summary.outputDir, summary.storage.payloads[0].file))).mode &
                0o777,
        ).toBe(0o600);
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("recusa execução real sem storage dedicado e confirmação offline", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot,
                encryptionKey: backupKey,
                offlineConfirmed: true,
            }),
        ).toThrow("MATERIALS_STORAGE_DIR");
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot,
                materialsStorageDir: storageRoot,
                encryptionKey: backupKey,
            }),
        ).toThrow("OFFLINE_CONFIRMED");
    });

    it("recusa Mongo remoto, credenciais e diretórios sobrepostos", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://cluster.example/studyflow",
                backupRoot,
                materialsStorageDir: storageRoot,
                encryptionKey: backupKey,
                offlineConfirmed: true,
            }),
        ).toThrow("loopback");
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://user:secret@127.0.0.1/studyflow",
                backupRoot,
                materialsStorageDir: storageRoot,
                encryptionKey: backupKey,
                offlineConfirmed: true,
            }),
        ).toThrow("credenciais");
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1/studyflow",
                backupRoot,
                materialsStorageDir: join(backupRoot, "studyflow-materials"),
                encryptionKey: backupKey,
                offlineConfirmed: true,
            }),
        ).toThrow("distintos");
    });

    it("permite dry-run sem MongoDB, storage ou chave real", async () => {
        const createConnection = jest.fn(async () => {
            throw new Error("não deveria abrir MongoDB");
        });
        const summary = await createDailyBackup({
            backupRoot,
            dryRun: true,
            createConnection,
        });
        expect(summary.dryRun).toBe(true);
        expect(summary.storage.files).toBe(0);
        expect(createConnection).not.toHaveBeenCalled();
    });

    it("remove o diretório parcial quando o snapshot offline muda", async () => {
        await expect(
            createDailyBackup({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot,
                materialsStorageDir: storageRoot,
                encryptionKey: backupKey,
                offlineConfirmed: true,
                now: new Date("2026-07-10T03:00:00.000Z"),
                createConnection: async () => ({
                    db: {
                        collections: async () => [
                            {
                                collectionName: "users",
                                countDocuments: async () => 2,
                                find: () => ({
                                    async *[Symbol.asyncIterator]() {
                                        yield { _id: 1 };
                                    },
                                }),
                            },
                        ],
                    },
                    close: async () => undefined,
                }),
            }),
        ).rejects.toThrow("mudou durante o backup");
        await expect(
            stat(join(backupRoot, "daily-2026-07-10T03-00-00-000Z")),
        ).rejects.toMatchObject({ code: "ENOENT" });
    });
});
