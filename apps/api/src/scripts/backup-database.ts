// apps/api/src/scripts/backup-database.ts
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import { createGzip } from "node:zlib";
import mongoose from "mongoose";

const DEFAULT_BACKUP_ROOT = "./backups";
const DEFAULT_RETENTION_DAYS = 7;
const MAX_RETENTION_DAYS = 90;

type BackupDocument = Record<string, unknown>;

export type BackupCollectionReader = {
    collectionName: string;
    countDocuments(filter?: object): Promise<number>;
    find(filter?: object): AsyncIterable<BackupDocument>;
};

export type BackupConnection = {
    db?: {
        collections(): Promise<BackupCollectionReader[]>;
    };
    close(): Promise<void>;
};

export type BackupSummary = {
    ok: true;
    dryRun: boolean;
    backupId: string;
    outputDir: string;
    collections: number;
    documents: number;
    retentionDays: number;
};

type DailyBackupOptions = {
    mongoUri?: string;
    backupRoot?: string;
    retentionDays?: string | number;
    now?: Date;
    dryRun?: boolean;
    createConnection?: (mongoUri: string) => Promise<BackupConnection>;
};

type NormalisedBackupOptions = {
    mongoUri: string;
    backupRoot: string;
    retentionDays: number;
    now: Date;
    dryRun: boolean;
    createConnection: (mongoUri: string) => Promise<BackupConnection>;
};

/**
 * Normaliza a configuração do backup antes de abrir ligação à base de dados.
 *
 * @param options Valores vindos do ambiente, CLI ou teste unitário.
 * @returns Configuração segura para executar ou ensaiar o backup diário.
 */
export function normaliseBackupOptions(
    options: DailyBackupOptions,
): NormalisedBackupOptions {
    const dryRun = options.dryRun ?? false;
    const mongoUri = options.mongoUri?.trim();
    if (!dryRun && !mongoUri) {
        throw new Error("MONGODB_URI é obrigatória para executar backup diário.");
    }
    if (mongoUri && !mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
        throw new Error("MONGODB_URI deve usar protocolo MongoDB válido.");
    }

    const retentionDays = Number(options.retentionDays ?? DEFAULT_RETENTION_DAYS);
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > MAX_RETENTION_DAYS) {
        throw new Error(`STUDYFLOW_BACKUP_RETENTION_DAYS deve ficar entre 1 e ${MAX_RETENTION_DAYS}.`);
    }

    const backupRoot = resolve(options.backupRoot ?? DEFAULT_BACKUP_ROOT);
    if (backupRoot === "/" || backupRoot === resolve(tmpdir())) {
        throw new Error("STUDYFLOW_BACKUP_DIR deve apontar para uma pasta dedicada.");
    }

    return {
        mongoUri: mongoUri ?? "mongodb://dry-run.invalid/studyflow",
        backupRoot,
        retentionDays,
        now: options.now ?? new Date(),
        dryRun,
        createConnection: options.createConnection ?? createMongooseConnection,
    };
}

/**
 * Executa o backup diário e devolve apenas metadados seguros para evidence.
 *
 * @param options Configuração recebida do CLI, ambiente ou teste.
 * @returns Resumo sem URI, credenciais nem documentos exportados.
 */
export async function createDailyBackup(options: DailyBackupOptions): Promise<BackupSummary> {
    const config = normaliseBackupOptions(options);
    const backupId = buildBackupId(config.now);
    const outputDir = join(config.backupRoot, backupId);
    await mkdir(outputDir, { recursive: true, mode: 0o700 });

    if (config.dryRun) {
        const summary = {
            ok: true,
            dryRun: true,
            backupId,
            outputDir,
            collections: 0,
            documents: 0,
            retentionDays: config.retentionDays,
        } satisfies BackupSummary;
        await writeManifest(outputDir, summary);
        return summary;
    }

    const connection = await config.createConnection(config.mongoUri);
    try {
        const collections = await connection.db?.collections();
        if (!collections) {
            throw new Error("Ligação MongoDB sem acesso a coleções.");
        }

        let documentCount = 0;
        for (const collection of collections) {
            const count = await collection.countDocuments({});
            documentCount += count;
            await writeCollectionBackup(collection, join(outputDir, `${collection.collectionName}.jsonl.gz`));
        }

        const summary = {
            ok: true,
            dryRun: false,
            backupId,
            outputDir,
            collections: collections.length,
            documents: documentCount,
            retentionDays: config.retentionDays,
        } satisfies BackupSummary;
        await writeManifest(outputDir, summary);
        await removeExpiredBackups(config.backupRoot, config.now, config.retentionDays);
        return summary;
    } finally {
        await connection.close();
    }
}

/**
 * Abre a ligação Mongoose usada pelo script real.
 *
 * @param mongoUri URI lida do ambiente e nunca impressa no output.
 * @returns Ligação compatível com as funções de backup.
 */
async function createMongooseConnection(mongoUri: string): Promise<BackupConnection> {
    return mongoose.createConnection(mongoUri).asPromise() as Promise<BackupConnection>;
}

/**
 * Escreve uma coleção como JSON por linha e comprime o ficheiro no próprio fluxo.
 *
 * @param collection Coleção MongoDB a exportar.
 * @param filePath Caminho final do ficheiro comprimido.
 */
async function writeCollectionBackup(collection: BackupCollectionReader, filePath: string): Promise<void> {
    async function* documentsAsLines() {
        for await (const document of collection.find({})) {
            yield `${JSON.stringify(document)}\n`;
        }
    }

    await pipeline(
        Readable.from(documentsAsLines()),
        createGzip(),
        createWriteStream(filePath, { mode: 0o600 }),
    );
}

/**
 * Escreve manifest sem incluir URI, documentos ou dados pessoais.
 *
 * @param outputDir Diretório do backup atual.
 * @param summary Resumo seguro da execução.
 */
async function writeManifest(outputDir: string, summary: BackupSummary): Promise<void> {
    await writeFile(
        join(outputDir, "manifest.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
        { mode: 0o600 },
    );
}

/**
 * Remove pastas antigas dentro da raiz de backup para cumprir a retenção.
 *
 * @param backupRoot Pasta dedicada aos backups.
 * @param now Data de referência da execução.
 * @param retentionDays Número de dias a manter.
 */
async function removeExpiredBackups(backupRoot: string, now: Date, retentionDays: number): Promise<void> {
    const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
    const entries = await readdir(backupRoot, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const target = join(backupRoot, entry.name);
        const info = await stat(target);
        if (info.mtime.getTime() < cutoff) {
            await rm(target, { recursive: true, force: true });
        }
    }
}

/**
 * Cria um identificador ordenável e seguro para o diretório diário.
 *
 * @param now Data da execução.
 * @returns Identificador sem caracteres problemáticos para sistemas de ficheiros.
 */
function buildBackupId(now: Date): string {
    return `daily-${now.toISOString().replace(/[:.]/g, "-")}`;
}

/**
 * Executa o script por CLI e só imprime resumo seguro.
 */
async function runFromCli(): Promise<void> {
    try {
        const summary = await createDailyBackup({
            mongoUri: process.env.MONGODB_URI,
            backupRoot: process.env.STUDYFLOW_BACKUP_DIR,
            retentionDays: process.env.STUDYFLOW_BACKUP_RETENTION_DAYS,
            dryRun: process.argv.includes("--dry-run"),
        });
        console.log(JSON.stringify(summary));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida no backup diário.";
        console.error(JSON.stringify({ ok: false, error: message }));
        process.exitCode = 1;
    }
}

const executedFileUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === executedFileUrl) {
    void runFromCli();
}