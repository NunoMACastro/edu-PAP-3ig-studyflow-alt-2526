/**
 * Storage local endurecido para materiais privados.
 *
 * O volume continua deliberadamente limitado a uma instância local da PAP, mas
 * cada upload passa por staging, quota, promoção atómica e uma outbox no mesmo
 * filesystem. A reconciliação consegue assim concluir ou compensar operações
 * interrompidas sem confiar em paths recebidos do exterior.
 */
import {
    Injectable,
    PayloadTooLargeException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
    chmod,
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import {
    ensureStudyFlowDirectory,
    normaliseDedicatedLocalDirectory,
} from "../../common/storage/dedicated-local-directory.js";
import {
    defaultMaterialStorageDirectory,
} from "../../common/storage/material-storage-directory.js";

const DEFAULT_USER_QUOTA_BYTES = 250 * 1024 * 1024;
const DEFAULT_GLOBAL_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;
const DEFAULT_STAGING_RETENTION_MS = 60 * 60 * 1000;
const DEFAULT_ORPHAN_RETENTION_MS = 24 * 60 * 60 * 1000;

type StorageOperationType = "COMMIT" | "DELETE";

type StorageOutboxEntry = {
    version: 1;
    operationId: string;
    type: StorageOperationType;
    ownerId: string;
    storageKey: string;
    stagingKey?: string;
    createdAt: string;
};

export type StagedMaterialFile = {
    operationId: string;
    ownerId: string;
    storageKey: string;
    stagingKey: string;
    sizeBytes: number;
    sha256: string;
};

export type StorageDeleteOperation = {
    operationId: string;
    ownerId: string;
    storageKey: string;
};

export type MaterialStorageReconcileSummary = {
    committed: number;
    deleted: number;
    aborted: number;
    pending: number;
    invalidOutboxEntries: number;
    orphanFilesDeleted: number;
    staleStagingFilesDeleted: number;
};

/**
 * Implementação local com paths opacos e permissões privadas.
 */
@Injectable()
export class MaterialStorageService {
    private readonly ownerLocks = new Map<string, Promise<void>>();
    private globalLock: Promise<void> = Promise.resolve();

    /**
     * Confirma que o volume está acessível e preserva permissões privadas. A
     * probe usa staging e remove sempre o artefacto, sem consumir quota nem criar
     * uma operação de outbox.
     */
    async checkReady(): Promise<void> {
        await this.ensureLayout();
        const probePath = this.resolveStorageKey(
            `.staging/.readiness-${randomUUID()}.tmp`,
            ".staging",
        );
        try {
            await writeFile(probePath, Buffer.from("ready"), {
                flag: "wx",
                mode: 0o600,
            });
            await chmod(probePath, 0o600);
            const metadata = await stat(probePath);
            if (!metadata.isFile() || (metadata.mode & 0o777) !== 0o600) {
                throw new Error("Material storage readiness probe is not private.");
            }
        } finally {
            await rm(probePath, { force: true });
        }
    }

    /**
     * Reserva quota e grava bytes numa área que ainda não é visível como ficheiro
     * comprometido. O chamador deve preparar a outbox antes de persistir o
     * documento Mongo e chamar `commit` apenas depois desse create ter sucesso.
     */
    async stage(
        ownerId: string,
        file: Express.Multer.File,
    ): Promise<StagedMaterialFile> {
        this.assertSafeSegment(ownerId, "ownerId");

        return this.withGlobalLock(() =>
            this.withOwnerLock(ownerId, async () => {
                await this.ensureLayout();
                const quotaBytes = this.readPositiveInteger(
                    "MATERIALS_STORAGE_USER_QUOTA_BYTES",
                    DEFAULT_USER_QUOTA_BYTES,
                );
                const globalQuotaBytes = this.readPositiveInteger(
                    "MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES",
                    DEFAULT_GLOBAL_QUOTA_BYTES,
                );
                const [currentUsage, globalUsage] = await Promise.all([
                    this.calculateOwnerUsage(ownerId),
                    this.calculateGlobalUsage(),
                ]);
                if (currentUsage + file.buffer.byteLength > quotaBytes) {
                    throw new PayloadTooLargeException({
                        code: "MATERIAL_STORAGE_QUOTA_EXCEEDED",
                        message:
                            "A quota de armazenamento de materiais foi atingida.",
                    });
                }
                if (globalUsage + file.buffer.byteLength > globalQuotaBytes) {
                    throw new PayloadTooLargeException({
                        code: "MATERIAL_STORAGE_GLOBAL_QUOTA_EXCEEDED",
                        message:
                            "O armazenamento local não tem quota disponível para o upload.",
                    });
                }

                const operationId = randomUUID();
                const extension =
                    file.mimetype === "application/pdf" ? "pdf" : "docx";
                const storageKey = `users/${ownerId}/${operationId}.${extension}`;
                const stagingKey = `.staging/${ownerId}/${operationId}.part`;
                const stagingPath = this.resolveStorageKey(
                    stagingKey,
                    ".staging",
                );
                await mkdir(dirname(stagingPath), {
                    recursive: true,
                    mode: 0o700,
                });
                await writeFile(stagingPath, file.buffer, {
                    flag: "wx",
                    mode: 0o600,
                });
                await chmod(stagingPath, 0o600);

                return {
                    operationId,
                    ownerId,
                    storageKey,
                    stagingKey,
                    sizeBytes: file.buffer.byteLength,
                    sha256: createHash("sha256")
                        .update(file.buffer)
                        .digest("hex"),
                };
            }),
        );
    }

    /**
     * Regista intenção de commit antes do create Mongo. Se o processo cair, a
     * reconciliação só promove o ficheiro quando a storageKey estiver referenciada.
     */
    async prepareCommit(staged: StagedMaterialFile): Promise<void> {
        await this.writeOutboxEntry({
            version: 1,
            operationId: staged.operationId,
            type: "COMMIT",
            ownerId: staged.ownerId,
            storageKey: staged.storageKey,
            stagingKey: staged.stagingKey,
            createdAt: new Date().toISOString(),
        });
    }

    /**
     * Promove o ficheiro por rename no mesmo volume e fecha a entrada de outbox.
     */
    async commit(staged: StagedMaterialFile): Promise<void> {
        await this.withGlobalLock(() =>
            this.withOwnerLock(staged.ownerId, async () => {
                await this.prepareCommit(staged);
                const source = this.resolveStorageKey(
                    staged.stagingKey,
                    ".staging",
                );
                const destination = this.resolveStorageKey(
                    staged.storageKey,
                    "users",
                );
                await mkdir(dirname(destination), {
                    recursive: true,
                    mode: 0o700,
                });

                try {
                    await rename(source, destination);
                    await chmod(destination, 0o600);
                } catch (error) {
                    if (!(await this.pathExists(destination))) throw error;
                }

                await this.removeOutboxEntry(staged.operationId);
            }),
        );
    }

    /**
     * Compensa um upload que falhou antes de ficar comprometido.
     */
    async abort(staged: StagedMaterialFile): Promise<void> {
        await this.withGlobalLock(() =>
            this.withOwnerLock(staged.ownerId, async () => {
                await rm(this.resolveStorageKey(staged.stagingKey, ".staging"), {
                    force: true,
                });
                await this.removeOutboxEntry(staged.operationId);
            }),
        );
    }

    /**
     * Cria intenção durável de delete. A operação só é executada quando a chave já
     * não existir nos documentos Mongo observados pela reconciliação.
     */
    async prepareDelete(
        ownerId: string,
        storageKey: string,
    ): Promise<StorageDeleteOperation> {
        this.assertSafeSegment(ownerId, "ownerId");
        this.resolveStorageKey(storageKey, "users");
        const operationId = randomUUID();
        await this.writeOutboxEntry({
            version: 1,
            operationId,
            type: "DELETE",
            ownerId,
            storageKey,
            createdAt: new Date().toISOString(),
        });
        return { operationId, ownerId, storageKey };
    }

    /**
     * Remove um ficheiro já libertado pela persistência e fecha a outbox.
     */
    async commitDelete(operation: StorageDeleteOperation): Promise<void> {
        await this.withGlobalLock(() =>
            this.withOwnerLock(operation.ownerId, async () => {
                await rm(this.resolveStorageKey(operation.storageKey, "users"), {
                    force: true,
                });
                await this.removeOutboxEntry(operation.operationId);
            }),
        );
    }

    /**
     * Cancela apenas a intenção de delete quando a transação Mongo falha. O
     * ficheiro comprometido permanece intacto e volta a poder ser reconciliado.
     */
    async cancelDelete(operation: StorageDeleteOperation): Promise<void> {
        await this.withOwnerLock(operation.ownerId, () =>
            this.removeOutboxEntry(operation.operationId),
        );
    }

    /**
     * Lê apenas chaves comprometidas dentro de `users/`.
     */
    async read(storageKey: string): Promise<Buffer> {
        return readFile(this.resolveStorageKey(storageKey, "users"));
    }

    /**
     * Repara commits/deletes interrompidos e remove staging/órfãos expirados.
     */
    async reconcile(
        referencedStorageKeys: Iterable<string>,
        now = new Date(),
    ): Promise<MaterialStorageReconcileSummary> {
        await this.ensureLayout();
        const references = new Set(referencedStorageKeys);
        const stagingRetentionMs = this.readPositiveInteger(
            "MATERIALS_STORAGE_STAGING_RETENTION_MS",
            DEFAULT_STAGING_RETENTION_MS,
        );
        const orphanRetentionMs = this.readPositiveInteger(
            "MATERIALS_STORAGE_ORPHAN_RETENTION_MS",
            DEFAULT_ORPHAN_RETENTION_MS,
        );
        const summary: MaterialStorageReconcileSummary = {
            committed: 0,
            deleted: 0,
            aborted: 0,
            pending: 0,
            invalidOutboxEntries: 0,
            orphanFilesDeleted: 0,
            staleStagingFilesDeleted: 0,
        };
        const activeStagingKeys = new Set<string>();

        for (const filename of await readdir(this.outboxRoot())) {
            if (!filename.endsWith(".json")) continue;
            const entry = await this.readOutboxEntry(filename);
            if (!entry) {
                summary.invalidOutboxEntries += 1;
                continue;
            }
            if (entry.stagingKey) activeStagingKeys.add(entry.stagingKey);
            const ageMs = now.getTime() - new Date(entry.createdAt).getTime();

            if (entry.type === "COMMIT") {
                if (references.has(entry.storageKey)) {
                    await this.commit({
                        operationId: entry.operationId,
                        ownerId: entry.ownerId,
                        storageKey: entry.storageKey,
                        stagingKey: entry.stagingKey!,
                        sizeBytes: 0,
                        sha256: "",
                    });
                    summary.committed += 1;
                } else if (ageMs >= stagingRetentionMs) {
                    await this.abort({
                        operationId: entry.operationId,
                        ownerId: entry.ownerId,
                        storageKey: entry.storageKey,
                        stagingKey: entry.stagingKey!,
                        sizeBytes: 0,
                        sha256: "",
                    });
                    summary.aborted += 1;
                } else {
                    summary.pending += 1;
                }
                continue;
            }

            if (!references.has(entry.storageKey)) {
                await this.commitDelete(entry);
                summary.deleted += 1;
            } else {
                summary.pending += 1;
            }
        }

        const stagingFiles = await this.collectFiles(this.stagingRoot());
        for (const filePath of stagingFiles) {
            const key = this.toStorageKey(filePath);
            if (activeStagingKeys.has(key)) continue;
            const info = await stat(filePath);
            if (now.getTime() - info.mtime.getTime() < stagingRetentionMs) continue;
            await rm(filePath, { force: true });
            summary.staleStagingFilesDeleted += 1;
        }

        const committedFiles = await this.collectFiles(this.usersRoot());
        for (const filePath of committedFiles) {
            const key = this.toStorageKey(filePath);
            if (references.has(key)) continue;
            const info = await stat(filePath);
            if (now.getTime() - info.mtime.getTime() < orphanRetentionMs) continue;
            await rm(filePath, { force: true });
            summary.orphanFilesDeleted += 1;
        }

        return summary;
    }

    /**
     * Devolve todas as chaves comprometidas, útil para auditoria e testes.
     */
    async listCommittedKeys(): Promise<string[]> {
        await this.ensureLayout();
        return Promise.all(
            (await this.collectFiles(this.usersRoot())).map((filePath) =>
                Promise.resolve(this.toStorageKey(filePath)),
            ),
        );
    }

    private async ensureLayout(): Promise<void> {
        await ensureStudyFlowDirectory(this.storageRoot(), "material-storage", {
            blockedRoots: this.blockedRoots(),
        });
        await Promise.all(
            [this.usersRoot(), this.stagingRoot(), this.outboxRoot()].map(
                async (directory) => {
                    await mkdir(directory, { recursive: true, mode: 0o700 });
                    await chmod(directory, 0o700);
                },
            ),
        );
    }

    private async calculateOwnerUsage(ownerId: string): Promise<number> {
        const roots = [
            resolve(this.usersRoot(), ownerId),
            resolve(this.stagingRoot(), ownerId),
        ];
        let total = 0;
        for (const root of roots) {
            for (const filePath of await this.collectFiles(root)) {
                total += (await stat(filePath)).size;
            }
        }
        return total;
    }

    /** Soma ficheiros comprometidos e em staging para impor o teto do volume. */
    private async calculateGlobalUsage(): Promise<number> {
        let total = 0;
        for (const root of [this.usersRoot(), this.stagingRoot()]) {
            for (const filePath of await this.collectFiles(root)) {
                total += (await stat(filePath)).size;
            }
        }
        return total;
    }

    private async writeOutboxEntry(entry: StorageOutboxEntry): Promise<void> {
        await this.ensureLayout();
        this.assertOutboxEntry(entry);
        const target = this.outboxPath(entry.operationId);
        const temporary = `${target}.${randomUUID()}.tmp`;
        await writeFile(temporary, `${JSON.stringify(entry)}\n`, {
            flag: "wx",
            mode: 0o600,
        });
        await rename(temporary, target);
        await chmod(target, 0o600);
    }

    private async readOutboxEntry(
        filename: string,
    ): Promise<StorageOutboxEntry | undefined> {
        try {
            const candidate = JSON.parse(
                await readFile(resolve(this.outboxRoot(), filename), "utf8"),
            ) as StorageOutboxEntry;
            this.assertOutboxEntry(candidate);
            return candidate;
        } catch {
            return undefined;
        }
    }

    private assertOutboxEntry(entry: StorageOutboxEntry): void {
        if (
            entry.version !== 1 ||
            !["COMMIT", "DELETE"].includes(entry.type) ||
            !entry.operationId ||
            !entry.ownerId ||
            !entry.storageKey ||
            !Number.isFinite(new Date(entry.createdAt).getTime())
        ) {
            throw new Error("Entrada de outbox de storage inválida.");
        }
        this.assertSafeSegment(entry.operationId, "operationId");
        this.assertSafeSegment(entry.ownerId, "ownerId");
        this.resolveStorageKey(entry.storageKey, "users");
        if (entry.type === "COMMIT") {
            if (!entry.stagingKey) {
                throw new Error("Commit de storage sem stagingKey.");
            }
            this.resolveStorageKey(entry.stagingKey, ".staging");
        }
    }

    private async removeOutboxEntry(operationId: string): Promise<void> {
        await rm(this.outboxPath(operationId), { force: true });
    }

    private outboxPath(operationId: string): string {
        this.assertSafeSegment(operationId, "operationId");
        return resolve(this.outboxRoot(), `${operationId}.json`);
    }

    private resolveStorageKey(storageKey: string, requiredRoot: string): string {
        if (
            !storageKey ||
            storageKey.includes("\\") ||
            storageKey.startsWith("/") ||
            storageKey.split("/").some((segment) => !segment || segment === "..")
        ) {
            throw new Error("Chave de storage inválida.");
        }
        if (storageKey.split("/")[0] !== requiredRoot) {
            throw new Error("Chave fora da área de storage permitida.");
        }
        const absolute = resolve(this.storageRoot(), storageKey);
        if (!absolute.startsWith(`${this.storageRoot()}${sep}`)) {
            throw new Error("Chave de storage inválida.");
        }
        return absolute;
    }

    private assertSafeSegment(value: string, label: string): void {
        if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) {
            throw new Error(`${label} inválido para storage.`);
        }
    }

    private readPositiveInteger(name: string, fallback: number): number {
        const raw = process.env[name];
        const value = raw === undefined ? fallback : Number(raw);
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error(`${name} deve ser um inteiro positivo.`);
        }
        return value;
    }

    private async collectFiles(root: string): Promise<string[]> {
        if (!(await this.pathExists(root))) return [];
        const files: string[] = [];
        for (const entry of await readdir(root, { withFileTypes: true })) {
            const child = resolve(root, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await this.collectFiles(child)));
            } else if (entry.isFile()) {
                files.push(child);
            }
        }
        return files;
    }

    private async pathExists(path: string): Promise<boolean> {
        try {
            await stat(path);
            return true;
        } catch {
            return false;
        }
    }

    private toStorageKey(filePath: string): string {
        return relative(this.storageRoot(), filePath).split(sep).join("/");
    }

    private storageRoot(): string {
        return normaliseDedicatedLocalDirectory(
            process.env.MATERIALS_STORAGE_DIR ?? defaultMaterialStorageDirectory(),
            {
                envName: "MATERIALS_STORAGE_DIR",
                blockedRoots: this.blockedRoots(),
            },
        );
    }

    private blockedRoots(): string[] {
        return [
            process.cwd(),
            resolve(process.cwd(), ".."),
            resolve(process.cwd(), "../.."),
        ];
    }

    private usersRoot(): string {
        return resolve(this.storageRoot(), "users");
    }

    private stagingRoot(): string {
        return resolve(this.storageRoot(), ".staging");
    }

    private outboxRoot(): string {
        return resolve(this.storageRoot(), ".outbox");
    }

    private async withOwnerLock<T>(
        ownerId: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        const previous = this.ownerLocks.get(ownerId) ?? Promise.resolve();
        let release!: () => void;
        const current = new Promise<void>((resolveLock) => {
            release = resolveLock;
        });
        const chain = previous.then(() => current);
        this.ownerLocks.set(ownerId, chain);
        await previous;
        try {
            return await operation();
        } finally {
            release();
            if (this.ownerLocks.get(ownerId) === chain) {
                this.ownerLocks.delete(ownerId);
            }
        }
    }

    /**
     * Serializa alterações ao volume nesta instância para que a verificação da
     * quota global e a escrita seguinte formem uma secção crítica única.
     */
    private async withGlobalLock<T>(operation: () => Promise<T>): Promise<T> {
        const previous = this.globalLock;
        let release!: () => void;
        this.globalLock = new Promise<void>((resolveLock) => {
            release = resolveLock;
        });
        await previous;
        try {
            return await operation();
        } finally {
            release();
        }
    }
}
