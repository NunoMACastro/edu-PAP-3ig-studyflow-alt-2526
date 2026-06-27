/**
 * Testa o script de backup diário sem depender de MongoDB real.
 */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    createDailyBackup,
    normaliseBackupOptions,
    type BackupCollectionReader,
    type BackupConnection,
} from "./backup-database.js";

function collectionWithDocuments(
    collectionName: string,
    documents: Array<Record<string, unknown>>,
): BackupCollectionReader {
    return {
        collectionName,
        countDocuments: async () => documents.length,
        find: () => ({
            // O iterador em memória substitui o cursor MongoDB no teste unitário.
            async *[Symbol.asyncIterator]() {
                for (const document of documents) {
                    yield document;
                }
            },
        }),
    };
}

describe("backup diário da StudyFlow", () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "studyflow-backup-"));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("cria manifest seguro com contagem de coleções e documentos", async () => {
        const close = jest.fn(async () => undefined);
        const connection: BackupConnection = {
            db: {
                collections: async () => [
                    collectionWithDocuments("materials", [{ title: "Resumo" }]),
                    collectionWithDocuments("users", [{ email: "aluno@example.test" }]),
                ],
            },
            close,
        };

        const summary = await createDailyBackup({
            mongoUri: "mongodb://127.0.0.1:27017/studyflow",
            backupRoot: tempDir,
            now: new Date("2026-06-23T02:15:00.000Z"),
            createConnection: async () => connection,
        });

        const manifest = await readFile(
            join(summary.outputDir, "manifest.json"),
            "utf8",
        );

        expect(summary.collections).toBe(2);
        expect(summary.documents).toBe(2);
        expect(manifest).not.toContain("mongodb://");
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("falha sem URI no modo real", () => {
        expect(() => normaliseBackupOptions({ backupRoot: tempDir })).toThrow(
            "MONGODB_URI",
        );
    });

    it("falha sem pasta dedicada de backup", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
            }),
        ).toThrow("STUDYFLOW_BACKUP_DIR");
    });

    it("falha quando a pasta de backup fica dentro do checkout da API", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot: process.cwd(),
            }),
        ).toThrow("fora do checkout");
    });

    it("falha quando a pasta de backup fica dentro do repositório", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot: join(process.cwd(), "../..", "backups"),
            }),
        ).toThrow("fora do checkout");
    });

    it("falha com retenção inválida", () => {
        expect(() =>
            normaliseBackupOptions({
                mongoUri: "mongodb://127.0.0.1:27017/studyflow",
                backupRoot: tempDir,
                retentionDays: 0,
            }),
        ).toThrow("STUDYFLOW_BACKUP_RETENTION_DAYS");
    });

    it("permite dry run sem abrir ligação MongoDB", async () => {
        const createConnection = jest.fn(async () => {
            throw new Error("não deveria abrir MongoDB em dry run");
        });

        const summary = await createDailyBackup({
            backupRoot: tempDir,
            dryRun: true,
            createConnection,
        });

        expect(summary.dryRun).toBe(true);
        expect(createConnection).not.toHaveBeenCalled();
    });
});
