/**
 * Restore local, autenticado e compensável de MongoDB + storage de materiais.
 *
 * O destino tem de ser uma base vazia e um path de storage ainda inexistente.
 * Todos os payloads são validados antes da primeira escrita em MongoDB; os
 * ficheiros são preparados numa pasta de staging e promovidos por rename.
 */
import "../common/config/load-env.js";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createWriteStream } from "node:fs";
import { lstat, mkdir, readFile, rename, rm } from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { StringDecoder } from "node:string_decoder";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import mongoose from "mongoose";
import {
    ensureStudyFlowDirectory,
    normaliseDedicatedLocalDirectory,
} from "../common/storage/dedicated-local-directory.js";
import type {
    BackupFileManifest,
    BackupStoragePayloadManifest,
    BackupSummary,
    StorageIndexEntry,
} from "./backup-database.js";
import { validateStorageRelativePath } from "./backup-database.js";
import { assertEncryptedFile, openDecryptedStream } from "./backup-stream.js";

const INSERT_BATCH_SIZE = 500;
const MAX_JSONL_LINE_BYTES = 20 * 1024 * 1024;

export type RestoreCollection = {
    countDocuments(filter?: object): Promise<number>;
    insertMany(
        documents: Record<string, unknown>[],
        options?: { ordered?: boolean },
    ): Promise<unknown>;
    deleteMany(filter?: object): Promise<unknown>;
};

export type RestoreConnection = {
    db?: {
        collections(): Promise<Array<{ countDocuments(filter?: object): Promise<number> }>>;
        collection(name: string): RestoreCollection;
    };
    close(): Promise<void>;
};

type RestoreOptions = {
    backupDir?: string;
    mongoUri?: string;
    materialsStorageDir?: string;
    encryptionKey?: string;
    allowRestore?: boolean;
    offlineConfirmed?: boolean;
    confirmation?: string;
    storageConfirmation?: string;
    createConnection?: (mongoUri: string) => Promise<RestoreConnection>;
};

type NormalisedRestoreOptions = {
    backupDir: string;
    mongoUri: string;
    materialsStorageDir: string;
    encryptionKey: Buffer;
    createConnection: (mongoUri: string) => Promise<RestoreConnection>;
};

export type RestoreSummary = {
    ok: true;
    backupId: string;
    collections: number;
    documents: number;
    storageFiles: number;
    storageBytes: number;
};

/** Valida integralmente, restaura por batches e compensa escritas em erro. */
export async function restoreDatabase(options: RestoreOptions): Promise<RestoreSummary> {
    const config = normaliseRestoreOptions(options);
    const manifest = await readManifest(config.backupDir, config.encryptionKey);
    const storageIndex = await preflightBackup(
        config.backupDir,
        manifest,
        config.encryptionKey,
    );
    const stagingRoot = await stageMaterialsStorage(
        config,
        manifest,
        storageIndex,
    );

    let connection: RestoreConnection | undefined;
    const insertedIdsByCollection = new Map<string, unknown[]>();
    try {
        connection = await config.createConnection(config.mongoUri);
        const database = connection.db;
        if (!database) throw new Error("Ligação MongoDB sem acesso à base de dados.");
        for (const collection of await database.collections()) {
            if ((await collection.countDocuments({})) > 0) {
                throw new Error("O restore só pode ser executado numa base vazia.");
            }
        }

        let restoredDocuments = 0;
        for (const file of manifest.files) {
            const targetCollection = database.collection(file.collection);
            insertedIdsByCollection.set(file.collection, []);
            const count = await consumeCollectionRows(
                join(config.backupDir, file.file),
                config.encryptionKey,
                async (rows) => {
                    const insertedIds = rows.map((row) => {
                        if (!("_id" in row) || row._id === undefined) {
                            throw new Error("Documento de backup sem _id; restore recusado.");
                        }
                        return row._id;
                    });
                    insertedIdsByCollection.get(file.collection)!.push(...insertedIds);
                    await targetCollection.insertMany(rows, { ordered: true });
                },
            );
            if (count !== file.documents) {
                throw new Error(`Contagem inválida no ficheiro ${file.file}.`);
            }
            restoredDocuments += count;
        }
        if (restoredDocuments !== manifest.documents) {
            throw new Error("A contagem total restaurada não coincide com o manifesto.");
        }
        for (const file of manifest.files) {
            const observed = await database
                .collection(file.collection)
                .countDocuments({});
            if (observed !== file.documents) {
                throw new Error(
                    "O destino recebeu writes concorrentes durante o restore; promoção recusada.",
                );
            }
        }

        await rename(stagingRoot, config.materialsStorageDir);
        await connection.close().catch(() => undefined);
        connection = undefined;
        return {
            ok: true,
            backupId: manifest.backupId,
            collections: manifest.files.length,
            documents: restoredDocuments,
            storageFiles: manifest.storage.files,
            storageBytes: manifest.storage.bytes,
        };
    } catch (error) {
        const compensationErrors: unknown[] = [];
        if (connection?.db) {
            for (const [collectionName, insertedIds] of [
                ...insertedIdsByCollection.entries(),
            ].reverse()) {
                if (insertedIds.length === 0) continue;
                try {
                    await connection.db
                        .collection(collectionName)
                        .deleteMany({ _id: { $in: insertedIds } });
                } catch (compensationError) {
                    compensationErrors.push(compensationError);
                }
            }
        }
        try {
            await rm(stagingRoot, { recursive: true, force: true });
        } catch (compensationError) {
            compensationErrors.push(compensationError);
        }
        await connection?.close().catch((compensationError) => {
            compensationErrors.push(compensationError);
        });
        if (compensationErrors.length > 0) {
            throw new AggregateError(
                [error, ...compensationErrors],
                "Restore falhou e a compensação ficou incompleta; descarta os destinos dedicados.",
            );
        }
        throw error;
    }
}

/** Requer confirmação independente para a base e para o novo storage. */
export function normaliseRestoreOptions(
    options: RestoreOptions,
): NormalisedRestoreOptions {
    if (options.allowRestore !== true) {
        throw new Error("Define STUDYFLOW_ALLOW_RESTORE=true para confirmar o restore.");
    }
    if (options.offlineConfirmed !== true) {
        throw new Error(
            "Confirma STUDYFLOW_RESTORE_OFFLINE_CONFIRMED=true com API, web e runners parados.",
        );
    }
    const backupDir = options.backupDir?.trim();
    if (!backupDir) throw new Error("STUDYFLOW_RESTORE_DIR é obrigatória.");
    const mongoUri = options.mongoUri?.trim();
    if (!mongoUri) throw new Error("MONGODB_URI é obrigatória para restore.");

    const target = new URL(mongoUri);
    if (target.protocol !== "mongodb:" || !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname.toLowerCase())) {
        throw new Error("O restore só aceita MongoDB em loopback.");
    }
    if (target.username || target.password) {
        throw new Error("A URI MongoDB de restore não pode incluir credenciais.");
    }
    const databaseName = decodeURIComponent(target.pathname.replace(/^\//, ""));
    if (!/^studyflow[_-](?:restore|test|e2e)$/i.test(databaseName)) {
        throw new Error("A base de restore deve terminar em _restore, _test ou _e2e.");
    }
    if (options.confirmation !== databaseName) {
        throw new Error("STUDYFLOW_RESTORE_CONFIRMATION deve coincidir com o nome da base.");
    }

    const rawStorageRoot = options.materialsStorageDir?.trim();
    if (!rawStorageRoot) {
        throw new Error("MATERIALS_STORAGE_DIR é obrigatória para restore.");
    }
    const currentDirectory = resolve(process.cwd());
    const materialsStorageDir = normaliseDedicatedLocalDirectory(rawStorageRoot, {
        envName: "MATERIALS_STORAGE_DIR",
        blockedRoots: [
            currentDirectory,
            resolve(currentDirectory, ".."),
            resolve(currentDirectory, "../.."),
        ],
    });
    if (options.storageConfirmation !== basename(materialsStorageDir)) {
        throw new Error(
            "STUDYFLOW_RESTORE_STORAGE_CONFIRMATION deve coincidir com o nome do storage.",
        );
    }

    return {
        backupDir: resolve(backupDir),
        mongoUri,
        materialsStorageDir,
        encryptionKey: parseEncryptionKey(options.encryptionKey),
        createConnection:
            options.createConnection ??
            (async (uri: string) =>
                mongoose.createConnection(uri).asPromise() as Promise<RestoreConnection>),
    };
}

/** Autentica o manifesto e valida o contrato fechado do formato v2. */
async function readManifest(backupDir: string, key: Buffer): Promise<BackupSummary> {
    const backupInfo = await lstat(backupDir);
    if (!backupInfo.isDirectory() || backupInfo.isSymbolicLink()) {
        throw new Error("A origem de restore não é um diretório físico válido.");
    }
    const manifestPath = join(backupDir, "manifest.json");
    const manifestInfo = await lstat(manifestPath);
    if (!manifestInfo.isFile() || manifestInfo.isSymbolicLink()) {
        throw new Error("Manifesto de backup inválido.");
    }
    const value = JSON.parse(await readFile(manifestPath, "utf8")) as Partial<BackupSummary>;
    if (
        value.ok !== true ||
        value.formatVersion !== 2 ||
        value.encrypted !== true ||
        value.dryRun !== false ||
        typeof value.backupId !== "string" ||
        basename(backupDir) !== value.backupId ||
        !Number.isSafeInteger(value.documents) ||
        !Array.isArray(value.files) ||
        !value.storage ||
        !Array.isArray(value.storage.payloads) ||
        !/^[a-f0-9]{64}$/.test(value.manifestHmacSha256 ?? "")
    ) {
        throw new Error("Manifesto de backup inválido.");
    }
    const { manifestHmacSha256, ...unsigned } = value as BackupSummary;
    const expected = createHmac("sha256", key).update(JSON.stringify(unsigned)).digest();
    const provided = Buffer.from(manifestHmacSha256, "hex");
    if (provided.byteLength !== expected.byteLength || !timingSafeEqual(provided, expected)) {
        throw new Error("Autenticidade do manifesto de backup inválida.");
    }
    validateManifestEntries(value as BackupSummary);
    return value as BackupSummary;
}

async function preflightBackup(
    backupDir: string,
    manifest: BackupSummary,
    key: Buffer,
): Promise<StorageIndexEntry[]> {
    let documents = 0;
    for (const file of manifest.files) {
        const path = join(backupDir, file.file);
        await assertEncryptedFile(path, file.sha256);
        const count = await consumeCollectionRows(path, key);
        if (count !== file.documents) {
            throw new Error(`Contagem inválida no ficheiro ${file.file}.`);
        }
        documents += count;
    }
    if (documents !== manifest.documents) {
        throw new Error("A contagem total do backup não coincide com o manifesto.");
    }

    await assertEncryptedFile(
        join(backupDir, manifest.storage.indexFile),
        manifest.storage.indexSha256,
    );
    for (const payload of manifest.storage.payloads) {
        await assertEncryptedFile(join(backupDir, payload.file), payload.sha256);
    }
    const index = await readStorageIndex(
        join(backupDir, manifest.storage.indexFile),
        key,
    );
    validateStorageIndex(index, manifest.storage.payloads, manifest.storage.files);
    return index;
}

/** Decifra o storage para um sibling temporário e só depois permite MongoDB. */
async function stageMaterialsStorage(
    config: NormalisedRestoreOptions,
    manifest: BackupSummary,
    index: StorageIndexEntry[],
): Promise<string> {
    await assertPathDoesNotExist(config.materialsStorageDir);
    const parentInfo = await lstat(dirname(config.materialsStorageDir));
    if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink()) {
        throw new Error("O parent do storage de restore não é um diretório físico.");
    }
    const stagingRoot = `${config.materialsStorageDir}.restore-${randomUUID()}`;
    await mkdir(stagingRoot, { recursive: false, mode: 0o700 });
    await ensureStudyFlowDirectory(stagingRoot, "material-storage", {
        blockedRoots: blockedCheckoutRoots(),
    });

    try {
        for (const entry of index) {
            const destination = resolve(stagingRoot, ...entry.path.split("/"));
            if (!isSameOrInside(destination, stagingRoot)) {
                throw new Error("Path de material escapou da pasta de staging.");
            }
            await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
            const input = await openDecryptedStream(
                join(config.backupDir, entry.payloadFile),
                config.encryptionKey,
            );
            const hash = createHash("sha256");
            let bytes = 0;
            const monitor = new Transform({
                transform(chunk: Buffer, _encoding, callback) {
                    bytes += chunk.byteLength;
                    hash.update(chunk);
                    callback(null, chunk);
                },
            });
            await pipeline(
                input,
                monitor,
                createWriteStream(destination, { flags: "wx", mode: 0o600 }),
            );
            if (bytes !== entry.bytes || hash.digest("hex") !== entry.sha256) {
                throw new Error("Conteúdo de material não coincide com o índice cifrado.");
            }
        }
        if (
            index.reduce((total, entry) => total + entry.bytes, 0) !==
            manifest.storage.bytes
        ) {
            throw new Error("A dimensão total do storage não coincide com o manifesto.");
        }
        return stagingRoot;
    } catch (error) {
        await rm(stagingRoot, { recursive: true, force: true });
        throw error;
    }
}

function blockedCheckoutRoots(): string[] {
    const currentDirectory = resolve(process.cwd());
    return [
        currentDirectory,
        resolve(currentDirectory, ".."),
        resolve(currentDirectory, "../.."),
    ];
}

/** Percorre JSONL incrementalmente e opcionalmente entrega batches ao MongoDB. */
async function consumeCollectionRows(
    filePath: string,
    key: Buffer,
    insertBatch?: (rows: Record<string, unknown>[]) => Promise<void>,
): Promise<number> {
    const stream = await openDecryptedStream(filePath, key);
    let count = 0;
    let batch: Record<string, unknown>[] = [];
    for await (const line of readLines(stream)) {
        const document = mongoose.mongo.BSON.EJSON.parse(line, {
            relaxed: false,
        }) as Record<string, unknown>;
        count += 1;
        if (insertBatch) {
            batch.push(document);
            if (batch.length >= INSERT_BATCH_SIZE) {
                await insertBatch(batch);
                batch = [];
            }
        }
    }
    if (insertBatch && batch.length > 0) await insertBatch(batch);
    return count;
}

async function readStorageIndex(filePath: string, key: Buffer): Promise<StorageIndexEntry[]> {
    const entries: StorageIndexEntry[] = [];
    for await (const line of readLines(await openDecryptedStream(filePath, key))) {
        entries.push(JSON.parse(line) as StorageIndexEntry);
    }
    return entries;
}

/** Splitter UTF-8 limitado a uma linha BSON máxima, sem `readFile`/`gunzipSync`. */
async function* readLines(stream: NodeJS.ReadableStream): AsyncGenerator<string> {
    const decoder = new StringDecoder("utf8");
    let pending = "";
    for await (const rawChunk of stream as AsyncIterable<Buffer | string>) {
        const chunk = typeof rawChunk === "string" ? rawChunk : decoder.write(rawChunk);
        pending += chunk;
        if (Buffer.byteLength(pending) > MAX_JSONL_LINE_BYTES && !pending.includes("\n")) {
            throw new Error("Linha JSONL excede o limite seguro de 20 MiB.");
        }
        let newline = pending.indexOf("\n");
        while (newline >= 0) {
            const line = pending.slice(0, newline);
            pending = pending.slice(newline + 1);
            if (Buffer.byteLength(line) > MAX_JSONL_LINE_BYTES) {
                throw new Error("Linha JSONL excede o limite seguro de 20 MiB.");
            }
            if (line) yield line;
            newline = pending.indexOf("\n");
        }
    }
    pending += decoder.end();
    if (pending) yield pending;
}

function validateManifestEntries(manifest: BackupSummary): void {
    if (
        manifest.collections !== manifest.files.length ||
        manifest.storage.files !== manifest.storage.payloads.length ||
        !Number.isSafeInteger(manifest.storage.bytes) ||
        manifest.storage.bytes < 0
    ) {
        throw new Error("Contagens inválidas no manifesto de backup.");
    }
    const fileNames = new Set<string>();
    for (const file of manifest.files) {
        validateOpaqueFile(file.file, /^collection-\d{6}\.jsonl\.gz\.enc$/);
        if (!/^[A-Za-z0-9._-]+$/.test(file.collection) || file.collection.includes("..")) {
            throw new Error("Nome de coleção inválido no manifesto.");
        }
        if (!Number.isSafeInteger(file.documents) || file.documents < 0) {
            throw new Error("Contagem de coleção inválida no manifesto.");
        }
        if (!/^[a-f0-9]{64}$/.test(file.sha256) || fileNames.has(file.file)) {
            throw new Error("Entrada de coleção inválida no manifesto.");
        }
        fileNames.add(file.file);
    }
    validateOpaqueFile(manifest.storage.indexFile, /^materials-index\.jsonl\.gz\.enc$/);
    if (!/^[a-f0-9]{64}$/.test(manifest.storage.indexSha256)) {
        throw new Error("Checksum do índice de storage inválido.");
    }
    fileNames.add(manifest.storage.indexFile);
    for (const payload of manifest.storage.payloads) {
        validateOpaqueFile(payload.file, /^material-\d{8}\.bin\.gz\.enc$/);
        if (
            fileNames.has(payload.file) ||
            !Number.isSafeInteger(payload.bytes) ||
            payload.bytes < 0 ||
            !/^[a-f0-9]{64}$/.test(payload.sha256)
        ) {
            throw new Error("Payload de storage inválido no manifesto.");
        }
        fileNames.add(payload.file);
    }
}

function validateStorageIndex(
    entries: StorageIndexEntry[],
    payloads: BackupStoragePayloadManifest[],
    expectedFiles: number,
): void {
    if (entries.length !== expectedFiles) {
        throw new Error("Índice de storage não coincide com o manifesto.");
    }
    const payloadMap = new Map(payloads.map((payload) => [payload.file, payload]));
    const paths = new Set<string>();
    const referenced = new Set<string>();
    for (const entry of entries) {
        validateStorageRelativePath(entry.path);
        const payload = payloadMap.get(entry.payloadFile);
        if (
            entry.version !== 1 ||
            !payload ||
            paths.has(entry.path) ||
            referenced.has(entry.payloadFile) ||
            !Number.isSafeInteger(entry.bytes) ||
            entry.bytes < 0 ||
            entry.bytes !== payload.bytes ||
            !/^[a-f0-9]{64}$/.test(entry.sha256)
        ) {
            throw new Error("Entrada inválida no índice cifrado de storage.");
        }
        paths.add(entry.path);
        referenced.add(entry.payloadFile);
    }
    if (referenced.size !== payloads.length) {
        throw new Error("Existem payloads de storage não referenciados.");
    }
}

function validateOpaqueFile(file: string, pattern: RegExp): void {
    if (basename(file) !== file || !pattern.test(file)) {
        throw new Error("Nome de payload inválido no manifesto.");
    }
}

async function assertPathDoesNotExist(path: string): Promise<void> {
    try {
        await lstat(path);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
        throw error;
    }
    throw new Error("O storage de restore tem de ser um path dedicado ainda inexistente.");
}

function parseEncryptionKey(rawValue: string | undefined): Buffer {
    const value = rawValue?.trim();
    if (!value) throw new Error("STUDYFLOW_BACKUP_KEY é obrigatória.");
    const key = /^[a-f0-9]{64}$/i.test(value)
        ? Buffer.from(value, "hex")
        : Buffer.from(value, "base64");
    if (key.byteLength !== 32) {
        throw new Error("STUDYFLOW_BACKUP_KEY deve representar exatamente 32 bytes.");
    }
    return key;
}

function isSameOrInside(target: string, root: string): boolean {
    const resolvedTarget = resolve(target);
    const resolvedRoot = resolve(root);
    return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}${sep}`);
}

async function runFromCli(): Promise<void> {
    try {
        const summary = await restoreDatabase({
            backupDir: process.env.STUDYFLOW_RESTORE_DIR,
            mongoUri: process.env.MONGODB_URI,
            materialsStorageDir: process.env.MATERIALS_STORAGE_DIR,
            encryptionKey: process.env.STUDYFLOW_BACKUP_KEY,
            allowRestore: process.env.STUDYFLOW_ALLOW_RESTORE === "true",
            offlineConfirmed:
                process.env.STUDYFLOW_RESTORE_OFFLINE_CONFIRMED === "true",
            confirmation: process.env.STUDYFLOW_RESTORE_CONFIRMATION,
            storageConfirmation: process.env.STUDYFLOW_RESTORE_STORAGE_CONFIRMATION,
        });
        console.log(JSON.stringify(summary));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : "Falha no restore.",
            }),
        );
        process.exitCode = 1;
    }
}

if (process.argv[1]?.endsWith("restore-database.js")) void runFromCli();
