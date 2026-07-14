/**
 * Reset explícito e restrito aos dados locais/sintéticos da PAP.
 */
import "../common/config/load-env.js";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Redis } from "ioredis";
import mongoose from "mongoose";
import {
    assertStudyFlowDirectory,
    ensureStudyFlowDirectory,
    normaliseDedicatedLocalDirectory,
} from "../common/storage/dedicated-local-directory.js";
import {
    defaultMaterialStorageDirectory,
} from "../common/storage/material-storage-directory.js";

type ResetOptions = {
    allowReset?: boolean;
    confirmation?: string;
    mongoUri?: string;
    redisUrl?: string;
    storageDir?: string;
};

export type LocalResetConfig = {
    mongoUri: string;
    redisUrl: string;
    storageDir: string;
    databaseName: string;
};

/**
 * Valida todos os alvos antes de executar a primeira operação destrutiva.
 *
 * @param options Flags e alvos vindos do ambiente.
 * @returns Configuração local normalizada.
 */
export function normaliseLocalResetOptions(options: ResetOptions): LocalResetConfig {
    if (options.allowReset !== true) {
        throw new Error("Define STUDYFLOW_ALLOW_DATA_RESET=true para confirmar o reset.");
    }
    const mongoUri = options.mongoUri?.trim();
    if (!mongoUri) throw new Error("MONGODB_URI é obrigatória para reset.");
    const mongo = new URL(mongoUri);
    assertLoopback(mongo, "MongoDB");
    const databaseName = mongo.pathname.replace(/^\//, "");
    if (!/^studyflow(?:[_-](?:dev|test|e2e))?$/i.test(databaseName)) {
        throw new Error("A base de reset deve ser local e de desenvolvimento/teste.");
    }
    if (options.confirmation !== databaseName) {
        throw new Error("STUDYFLOW_RESET_CONFIRMATION deve coincidir com o nome da base.");
    }

    const redisUrl = options.redisUrl?.trim() || "redis://127.0.0.1:6379/1";
    const redis = new URL(redisUrl);
    assertLoopback(redis, "Redis");
    const redisDatabase = Number(redis.pathname.replace(/^\//, ""));
    if (!Number.isInteger(redisDatabase) || redisDatabase < 1 || redisDatabase > 15) {
        throw new Error("REDIS_URL de reset deve selecionar uma base dedicada entre 1 e 15.");
    }

    const storageDir = normaliseDedicatedLocalDirectory(
        options.storageDir?.trim() || defaultMaterialStorageDirectory(),
        {
            envName: "MATERIALS_STORAGE_DIR",
            blockedRoots: [
                process.cwd(),
                resolve(process.cwd(), ".."),
                resolve(process.cwd(), "../.."),
            ],
        },
    );
    return { mongoUri, redisUrl, storageDir, databaseName };
}

/** Executa reset Mongo, namespace Redis e storage apenas após validação total. */
export async function resetLocalData(options: ResetOptions): Promise<{
    ok: true;
    database: string;
    redisKeysDeleted: number;
    storageReset: true;
}> {
    const config = normaliseLocalResetOptions(options);
    const redis = new Redis(config.redisUrl, { lazyConnect: true });
    try {
        await assertExistingStorageTarget(config.storageDir);
        await mongoose.connect(config.mongoUri);
        await redis.connect();
        await mongoose.connection.dropDatabase();
        const redisKeysDeleted = await redis.dbsize();
        await redis.flushdb();
        await rm(config.storageDir, { recursive: true, force: true });
        await ensureStudyFlowDirectory(config.storageDir, "material-storage", {
            blockedRoots: blockedCheckoutRoots(),
        });
        return {
            ok: true,
            database: config.databaseName,
            redisKeysDeleted,
            storageReset: true,
        };
    } finally {
        await redis.quit().catch(() => undefined);
        await mongoose.disconnect().catch(() => undefined);
    }
}

async function assertExistingStorageTarget(storageDir: string): Promise<void> {
    try {
        await assertStudyFlowDirectory(storageDir, "material-storage", {
            blockedRoots: blockedCheckoutRoots(),
        });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
        throw new Error(
            "O storage existente não tem um marker StudyFlow válido; reset recusado.",
            { cause: error },
        );
    }
}

function blockedCheckoutRoots(): string[] {
    return [
        process.cwd(),
        resolve(process.cwd(), ".."),
        resolve(process.cwd(), "../.."),
    ];
}

function assertLoopback(url: URL, label: string): void {
    if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
        throw new Error(`${label} de reset tem de usar loopback.`);
    }
    if (url.username || url.password) {
        throw new Error(`${label} de reset não pode incluir credenciais na URI local.`);
    }
}

async function runFromCli(): Promise<void> {
    try {
        const summary = await resetLocalData({
            allowReset: process.env.STUDYFLOW_ALLOW_DATA_RESET === "true",
            confirmation: process.env.STUDYFLOW_RESET_CONFIRMATION,
            mongoUri: process.env.MONGODB_URI,
            redisUrl: process.env.REDIS_URL,
            storageDir: process.env.MATERIALS_STORAGE_DIR,
        });
        console.log(JSON.stringify(summary));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : "Falha no reset local.",
            }),
        );
        process.exitCode = 1;
    }
}

if (process.argv[1]?.endsWith("reset-local-data.js")) {
    void runFromCli();
}
