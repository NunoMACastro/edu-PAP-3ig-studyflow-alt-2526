/**
 * Backup offline e cifrado da base MongoDB e do storage local da StudyFlow.
 *
 * Coleções e ficheiros são processados em streaming. O manifesto expõe apenas
 * contagens, checksums e nomes opacos dos payloads; os paths de materiais ficam
 * dentro de um índice também cifrado.
 */
import "../common/config/load-env.js";
import { createHash, createHmac } from "node:crypto";
import { createReadStream } from "node:fs";
import {
    lstat,
    mkdir,
    readFile,
    readdir,
    realpath,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import mongoose from "mongoose";
import {
    assertStudyFlowDirectory,
    ensureStudyFlowDirectory,
    normaliseDedicatedLocalDirectory,
    STUDYFLOW_DIRECTORY_MARKER,
} from "../common/storage/dedicated-local-directory.js";
import { encryptStreamToFile } from "./backup-stream.js";

const DEFAULT_RETENTION_DAYS = 7;
const MAX_RETENTION_DAYS = 90;

type BackupDocument = Record<string, unknown>;

export type BackupCollectionReader = {
    collectionName: string;
    countDocuments(filter?: object): Promise<number>;
    find(filter?: object): AsyncIterable<BackupDocument>;
};

export type BackupConnection = {
    db?: { collections(): Promise<BackupCollectionReader[]> };
    close(): Promise<void>;
};

export type BackupFileManifest = {
    collection: string;
    file: string;
    documents: number;
    sha256: string;
};

export type BackupStoragePayloadManifest = {
    file: string;
    bytes: number;
    sha256: string;
};

export type BackupStorageSummary = {
    files: number;
    bytes: number;
    indexFile: string;
    indexSha256: string;
    payloads: BackupStoragePayloadManifest[];
};

export type BackupSummary = {
    ok: true;
    formatVersion: 2;
    dryRun: boolean;
    backupId: string;
    outputDir: string;
    collections: number;
    documents: number;
    retentionDays: number;
    encrypted: true;
    files: BackupFileManifest[];
    storage: BackupStorageSummary;
    manifestHmacSha256: string;
};

type UnsignedBackupSummary = Omit<BackupSummary, "manifestHmacSha256">;

export type StorageIndexEntry = {
    version: 1;
    path: string;
    payloadFile: string;
    bytes: number;
    sha256: string;
};

type DailyBackupOptions = {
    mongoUri?: string;
    backupRoot?: string;
    materialsStorageDir?: string;
    retentionDays?: string | number;
    now?: Date;
    dryRun?: boolean;
    encryptionKey?: string;
    offlineConfirmed?: boolean;
    createConnection?: (mongoUri: string) => Promise<BackupConnection>;
};

type NormalisedBackupOptions = {
    mongoUri: string;
    backupRoot: string;
    materialsStorageDir?: string;
    retentionDays: number;
    now: Date;
    dryRun: boolean;
    encryptionKey: Buffer;
    createConnection: (mongoUri: string) => Promise<BackupConnection>;
};

/** Valida todos os alvos antes de criar ficheiros ou abrir MongoDB. */
export function normaliseBackupOptions(
    options: DailyBackupOptions,
): NormalisedBackupOptions {
    const dryRun = options.dryRun ?? false;
    const mongoUri = options.mongoUri?.trim();
    if (!dryRun && !mongoUri) {
        throw new Error("MONGODB_URI é obrigatória para executar backup.");
    }
    if (!dryRun && options.offlineConfirmed !== true) {
        throw new Error(
            "Confirma STUDYFLOW_BACKUP_OFFLINE_CONFIRMED=true com a API parada.",
        );
    }
    if (mongoUri) validateLocalMongoUri(mongoUri, dryRun);

    const retentionDays = Number(options.retentionDays ?? DEFAULT_RETENTION_DAYS);
    if (
        !Number.isInteger(retentionDays) ||
        retentionDays < 1 ||
        retentionDays > MAX_RETENTION_DAYS
    ) {
        throw new Error(
            `STUDYFLOW_BACKUP_RETENTION_DAYS deve ficar entre 1 e ${MAX_RETENTION_DAYS}.`,
        );
    }

    const rawBackupRoot = options.backupRoot?.trim();
    if (!rawBackupRoot) {
        throw new Error("STUDYFLOW_BACKUP_DIR é obrigatória para executar backup.");
    }
    const checkoutRoots = blockedCheckoutRoots();
    const backupRoot = normaliseDedicatedLocalDirectory(rawBackupRoot, {
        envName: "STUDYFLOW_BACKUP_DIR",
        blockedRoots: checkoutRoots,
    });

    const rawStorageRoot = options.materialsStorageDir?.trim();
    if (!dryRun && !rawStorageRoot) {
        throw new Error("MATERIALS_STORAGE_DIR é obrigatória para backup real.");
    }
    const materialsStorageDir = rawStorageRoot
        ? normaliseDedicatedLocalDirectory(rawStorageRoot, {
              envName: "MATERIALS_STORAGE_DIR",
              blockedRoots: checkoutRoots,
          })
        : undefined;
    if (
        materialsStorageDir &&
        (isSameOrInside(materialsStorageDir, backupRoot) ||
            isSameOrInside(backupRoot, materialsStorageDir))
    ) {
        throw new Error("Storage de materiais e backups têm de ser diretórios distintos.");
    }

    return {
        mongoUri: mongoUri ?? "mongodb://dry-run.invalid/studyflow",
        backupRoot,
        materialsStorageDir,
        retentionDays,
        now: options.now ?? new Date(),
        dryRun,
        encryptionKey: dryRun
            ? Buffer.alloc(32)
            : parseEncryptionKey(options.encryptionKey),
        createConnection: options.createConnection ?? createMongooseConnection,
    };
}

/** Executa o backup completo e remove qualquer diretório parcial em erro. */
export async function createDailyBackup(
    options: DailyBackupOptions,
): Promise<BackupSummary> {
    const config = normaliseBackupOptions(options);
    const backupId = buildBackupId(config.now);
    const outputDir = join(config.backupRoot, backupId);
    await ensureStudyFlowDirectory(config.backupRoot, "database-backups", {
        blockedRoots: blockedCheckoutRoots(),
    });
    await mkdir(outputDir, { recursive: false, mode: 0o700 });

    try {
        if (config.dryRun) {
            const summary = signBackupSummary(
                buildUnsignedSummary(config, backupId, outputDir, [], 0, emptyStorage()),
                config.encryptionKey,
            );
            await writeManifest(outputDir, summary);
            return summary;
        }

        const connection = await config.createConnection(config.mongoUri);
        let collectionFiles: BackupFileManifest[];
        let documents = 0;
        try {
            const collections = await connection.db?.collections();
            if (!collections) throw new Error("Ligação MongoDB sem acesso a coleções.");
            collectionFiles = [];
            for (const [index, collection] of collections.entries()) {
                validateCollectionName(collection.collectionName);
                const expectedDocuments = await collection.countDocuments({});
                const file = `collection-${String(index + 1).padStart(6, "0")}.jsonl.gz.enc`;
                const written = await writeCollectionBackup(
                    collection,
                    join(outputDir, file),
                    config.encryptionKey,
                );
                if (written.documents !== expectedDocuments) {
                    throw new Error(
                        `A coleção ${collection.collectionName} mudou durante o backup offline.`,
                    );
                }
                documents += written.documents;
                collectionFiles.push({
                    collection: collection.collectionName,
                    file,
                    documents: written.documents,
                    sha256: written.sha256,
                });
            }
        } finally {
            await connection.close();
        }

        const storage = await backupMaterialsStorage(
            config.materialsStorageDir!,
            outputDir,
            config.encryptionKey,
        );
        const summary = signBackupSummary(
            buildUnsignedSummary(
                config,
                backupId,
                outputDir,
                collectionFiles,
                documents,
                storage,
            ),
            config.encryptionKey,
        );
        await writeManifest(outputDir, summary);
        await removeExpiredBackups(config.backupRoot, config.now, config.retentionDays);
        return summary;
    } catch (error) {
        await rm(outputDir, { recursive: true, force: true });
        throw error;
    }
}

function buildUnsignedSummary(
    config: NormalisedBackupOptions,
    backupId: string,
    outputDir: string,
    files: BackupFileManifest[],
    documents: number,
    storage: BackupStorageSummary,
): UnsignedBackupSummary {
    return {
        ok: true,
        formatVersion: 2,
        dryRun: config.dryRun,
        backupId,
        outputDir,
        collections: files.length,
        documents,
        retentionDays: config.retentionDays,
        encrypted: true,
        files,
        storage,
    };
}

function emptyStorage(): BackupStorageSummary {
    return {
        files: 0,
        bytes: 0,
        indexFile: "materials-index.jsonl.gz.enc",
        indexSha256: createHash("sha256").update("").digest("hex"),
        payloads: [],
    };
}

async function createMongooseConnection(mongoUri: string): Promise<BackupConnection> {
    return mongoose.createConnection(mongoUri).asPromise() as Promise<BackupConnection>;
}

/** Serializa uma coleção em Extended JSON sem acumular documentos. */
async function writeCollectionBackup(
    collection: BackupCollectionReader,
    filePath: string,
    encryptionKey: Buffer,
): Promise<{ documents: number; sha256: string }> {
    let documents = 0;
    async function* documentsAsLines() {
        for await (const document of collection.find({})) {
            documents += 1;
            yield `${mongoose.mongo.BSON.EJSON.stringify(document, { relaxed: false })}\n`;
        }
    }
    const result = await encryptStreamToFile(
        Readable.from(documentsAsLines()),
        filePath,
        encryptionKey,
    );
    return { documents, sha256: result.encryptedSha256 };
}

/** Cifra cada ficheiro com nome opaco e cifra separadamente o índice de paths. */
async function backupMaterialsStorage(
    storageRoot: string,
    outputDir: string,
    encryptionKey: Buffer,
): Promise<BackupStorageSummary> {
    await assertStudyFlowDirectory(storageRoot, "material-storage", {
        blockedRoots: blockedCheckoutRoots(),
    });
    const sourceFiles = await collectStorageFiles(storageRoot);
    const payloads: BackupStoragePayloadManifest[] = [];
    const indexEntries: StorageIndexEntry[] = [];
    let bytes = 0;

    for (const [index, source] of sourceFiles.entries()) {
        const file = `material-${String(index + 1).padStart(8, "0")}.bin.gz.enc`;
        const result = await encryptStreamToFile(
            createReadStream(source.absolutePath),
            join(outputDir, file),
            encryptionKey,
        );
        bytes += result.plaintextBytes;
        payloads.push({
            file,
            bytes: result.plaintextBytes,
            sha256: result.encryptedSha256,
        });
        indexEntries.push({
            version: 1,
            path: source.relativePath,
            payloadFile: file,
            bytes: result.plaintextBytes,
            sha256: result.plaintextSha256,
        });
    }

    const indexFile = "materials-index.jsonl.gz.enc";
    const indexResult = await encryptStreamToFile(
        Readable.from(indexEntries.map((entry) => `${JSON.stringify(entry)}\n`)),
        join(outputDir, indexFile),
        encryptionKey,
    );
    return {
        files: indexEntries.length,
        bytes,
        indexFile,
        indexSha256: indexResult.encryptedSha256,
        payloads,
    };
}

async function collectStorageFiles(
    storageRoot: string,
): Promise<Array<{ absolutePath: string; relativePath: string }>> {
    const canonicalRoot = await realpath(storageRoot);
    const files: Array<{ absolutePath: string; relativePath: string }> = [];

    async function visit(current: string): Promise<void> {
        const metadata = await lstat(current);
        if (metadata.isSymbolicLink()) {
            throw new Error("O storage de materiais não pode conter symlinks.");
        }
        if (metadata.isDirectory()) {
            for (const entry of await readdir(current)) await visit(join(current, entry));
            return;
        }
        if (!metadata.isFile()) {
            throw new Error("O storage de materiais contém uma entrada não regular.");
        }
        const canonicalFile = await realpath(current);
        if (!isSameOrInside(canonicalFile, canonicalRoot)) {
            throw new Error("Um ficheiro do storage resolveu para fora da raiz dedicada.");
        }
        const relativePath = relative(canonicalRoot, canonicalFile).split(sep).join("/");
        if (relativePath === STUDYFLOW_DIRECTORY_MARKER) return;
        validateStorageRelativePath(relativePath);
        files.push({ absolutePath: canonicalFile, relativePath });
    }

    await visit(canonicalRoot);
    return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

/** Rejeita paths que não pertencem às três áreas controladas pelo storage. */
export function validateStorageRelativePath(relativePath: string): void {
    if (
        !relativePath ||
        relativePath.startsWith("/") ||
        relativePath.includes("\\") ||
        relativePath.split("/").some((part) => !part || part === "." || part === "..") ||
        !["users", ".staging", ".outbox"].includes(relativePath.split("/")[0])
    ) {
        throw new Error("Path relativo inválido no storage de materiais.");
    }
}

async function writeManifest(outputDir: string, summary: BackupSummary): Promise<void> {
    await writeFile(
        join(outputDir, "manifest.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
        { mode: 0o600 },
    );
}

function signBackupSummary(summary: UnsignedBackupSummary, key: Buffer): BackupSummary {
    return {
        ...summary,
        manifestHmacSha256: createHmac("sha256", key)
            .update(JSON.stringify(summary))
            .digest("hex"),
    };
}

async function removeExpiredBackups(
    backupRoot: string,
    now: Date,
    retentionDays: number,
): Promise<void> {
    const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
    for (const entry of await readdir(backupRoot, { withFileTypes: true })) {
        if (!entry.isDirectory() || !isBackupId(entry.name)) continue;
        const target = join(backupRoot, entry.name);
        try {
            const manifest = JSON.parse(
                await readFile(join(target, "manifest.json"), "utf8"),
            ) as { backupId?: unknown };
            if (manifest.backupId !== entry.name) continue;
        } catch {
            continue;
        }
        if ((await stat(target)).mtime.getTime() < cutoff) {
            await rm(target, { recursive: true, force: true });
        }
    }
}

function parseEncryptionKey(rawValue: string | undefined): Buffer {
    const value = rawValue?.trim();
    if (!value) throw new Error("STUDYFLOW_BACKUP_KEY é obrigatória para backup real.");
    const key = /^[a-f0-9]{64}$/i.test(value)
        ? Buffer.from(value, "hex")
        : Buffer.from(value, "base64");
    if (key.byteLength !== 32) {
        throw new Error("STUDYFLOW_BACKUP_KEY deve representar exatamente 32 bytes.");
    }
    return key;
}

function validateLocalMongoUri(mongoUri: string, dryRun: boolean): void {
    if (!mongoUri.startsWith("mongodb://")) {
        throw new Error("MONGODB_URI deve usar protocolo MongoDB válido.");
    }
    if (dryRun) return;
    const parsed = new URL(mongoUri);
    if (!["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname.toLowerCase())) {
        throw new Error("O backup local só aceita MongoDB em loopback.");
    }
    if (parsed.username || parsed.password) {
        throw new Error("O backup local não aceita credenciais na URI MongoDB.");
    }
}

function validateCollectionName(value: string): void {
    if (!/^[A-Za-z0-9._-]+$/.test(value) || value.includes("..")) {
        throw new Error("Nome de coleção incompatível com o formato de backup.");
    }
}

function blockedCheckoutRoots(): string[] {
    const currentDirectory = resolve(process.cwd());
    return [currentDirectory, resolve(currentDirectory, ".."), resolve(currentDirectory, "../..")];
}

function isSameOrInside(target: string, root: string): boolean {
    return target === root || target.startsWith(`${root}${sep}`);
}

function buildBackupId(now: Date): string {
    return `daily-${now.toISOString().replace(/[:.]/g, "-")}`;
}

function isBackupId(value: string): boolean {
    return /^daily-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/.test(value);
}

async function runFromCli(): Promise<void> {
    try {
        const summary = await createDailyBackup({
            mongoUri: process.env.MONGODB_URI,
            backupRoot: process.env.STUDYFLOW_BACKUP_DIR,
            materialsStorageDir: process.env.MATERIALS_STORAGE_DIR,
            retentionDays: process.env.STUDYFLOW_BACKUP_RETENTION_DAYS,
            dryRun: process.argv.includes("--dry-run"),
            encryptionKey: process.env.STUDYFLOW_BACKUP_KEY,
            offlineConfirmed: process.env.STUDYFLOW_BACKUP_OFFLINE_CONFIRMED === "true",
        });
        console.log(JSON.stringify(summary));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : "Falha no backup.",
            }),
        );
        process.exitCode = 1;
    }
}

if (process.argv[1]?.endsWith("backup-database.js")) void runFromCli();
