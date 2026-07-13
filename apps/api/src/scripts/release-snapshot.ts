/**
 * Snapshot autenticado e rollback executável da implementação `real_dev/`.
 *
 * O artefacto vive obrigatoriamente fora do checkout e exclui secrets, builds,
 * dependências e dados runtime. O rollback prepara uma árvore completa num
 * sibling, preserva os `.env` locais e troca diretórios por `rename`.
 */
import "../common/config/load-env.js";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
    chmod,
    copyFile,
    lstat,
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import { createReadStream } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { assertCanonicalDirectoryBoundaries } from "../common/storage/dedicated-local-directory.js";

const SNAPSHOT_MARKER = ".studyflow-release-snapshots.json";
const MAX_MANIFEST_BYTES = 50 * 1024 * 1024;
const excludedDirectoryPaths = new Set([
    ".git",
    "api/coverage",
    "api/dist",
    "api/node_modules",
    "api/storage",
    "web/coverage",
    "web/dist",
    "web/node_modules",
    "web/playwright-report",
    "web/storage",
    "web/test-results",
    "web/real_dev",
]);
const REQUIRED_SNAPSHOT_PATHS = [
    "api/src/common/storage/dedicated-local-directory.ts",
    "api/src/scripts/release-snapshot.ts",
    "api/package.json",
    "web/package.json",
];
const MAX_SOURCE_FILE_BYTES = 10 * 1024 * 1024;
const preservedEnvironmentPaths = [".env", "api/.env", "web/.env"];

export type ReleaseSnapshotEntry = {
    path: string;
    bytes: number;
    sha256: string;
    mode: 0o644 | 0o755;
};

export type ReleaseSnapshotManifest = {
    version: 1;
    snapshotId: string;
    createdAt: string;
    implementationSha256: string;
    files: ReleaseSnapshotEntry[];
    manifestHmacSha256: string;
};

type UnsignedReleaseSnapshotManifest = Omit<
    ReleaseSnapshotManifest,
    "manifestHmacSha256"
>;

export type CreateReleaseSnapshotOptions = {
    implementationRoot?: string;
    snapshotRoot?: string;
    authenticationKey?: string;
    now?: Date;
};

export type ReleaseSnapshotResult = {
    ok: true;
    snapshotId: string;
    snapshotDir: string;
    implementationSha256: string;
    files: number;
};

export type RestoreReleaseSnapshotOptions = {
    implementationRoot?: string;
    snapshotDir?: string;
    authenticationKey?: string;
    allowRollback?: boolean;
    confirmation?: string;
    now?: Date;
};

export type ReleaseRollbackResult = {
    ok: true;
    snapshotId: string;
    implementationSha256: string;
    previousDir: string;
    preservedEnvironmentFiles: number;
    cleanInstallRequired: true;
};

/** Cria uma cópia privada e autenticada de todos os ficheiros operativos. */
export async function createReleaseSnapshot(
    options: CreateReleaseSnapshotOptions,
): Promise<ReleaseSnapshotResult> {
    const implementationRoot = normaliseImplementationRoot(
        options.implementationRoot ?? defaultImplementationRoot(),
    );
    const snapshotRoot = normaliseSnapshotRoot(
        options.snapshotRoot,
        implementationRoot,
    );
    const key = parseAuthenticationKey(options.authenticationKey);
    const now = options.now ?? new Date();
    const snapshotId = `release-${now.toISOString().replace(/[:.]/g, "-")}`;
    const snapshotDir = join(snapshotRoot, snapshotId);
    const payloadRoot = join(snapshotDir, "payload");

    await ensureSnapshotRoot(snapshotRoot, implementationRoot);
    await mkdir(snapshotDir, { recursive: false, mode: 0o700 });
    try {
        await mkdir(payloadRoot, { recursive: false, mode: 0o700 });
        const sourceFiles = await collectImplementationFiles(implementationRoot);
        assertRequiredSnapshotPaths(sourceFiles.map(({ relativePath }) => relativePath));
        const entries: ReleaseSnapshotEntry[] = [];
        for (const source of sourceFiles) {
            const destination = resolve(payloadRoot, ...source.relativePath.split("/"));
            assertContained(destination, payloadRoot);
            await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
            await copyFile(source.absolutePath, destination);
            await chmod(destination, 0o600);
            const metadata = await stat(destination);
            entries.push({
                path: source.relativePath,
                bytes: metadata.size,
                sha256: await hashFile(destination),
                mode: source.executable ? 0o755 : 0o644,
            });
        }
        entries.sort((left, right) => left.path.localeCompare(right.path));
        const unsigned: UnsignedReleaseSnapshotManifest = {
            version: 1,
            snapshotId,
            createdAt: now.toISOString(),
            implementationSha256: aggregateImplementationHash(entries),
            files: entries,
        };
        const manifest = signManifest(unsigned, key);
        await writeFile(
            join(snapshotDir, "manifest.json"),
            `${JSON.stringify(manifest, null, 2)}\n`,
            { flag: "wx", mode: 0o600 },
        );
        await chmod(snapshotDir, 0o700);
        return {
            ok: true,
            snapshotId,
            snapshotDir,
            implementationSha256: manifest.implementationSha256,
            files: entries.length,
        };
    } catch (error) {
        await rm(snapshotDir, { recursive: true, force: true });
        throw error;
    }
}

/**
 * Valida o artefacto, prepara a árvore completa e efetua uma troca atómica.
 * A árvore anterior é mantida como rollback do rollback, sem ser eliminada.
 */
export async function restoreReleaseSnapshot(
    options: RestoreReleaseSnapshotOptions,
): Promise<ReleaseRollbackResult> {
    if (options.allowRollback !== true) {
        throw new Error("Define STUDYFLOW_ALLOW_RELEASE_ROLLBACK=true para confirmar.");
    }
    const implementationRoot = normaliseImplementationRoot(
        options.implementationRoot ?? defaultImplementationRoot(),
    );
    const snapshotDir = resolveRequiredPath(
        options.snapshotDir,
        "STUDYFLOW_RELEASE_ROLLBACK_SNAPSHOT",
    );
    if (
        isSameOrInside(snapshotDir, implementationRoot) ||
        isSameOrInside(implementationRoot, snapshotDir)
    ) {
        throw new Error("O snapshot de rollback tem de ficar fora da implementação.");
    }
    const key = parseAuthenticationKey(options.authenticationKey);
    const manifest = await readAndVerifyManifest(snapshotDir, key);
    if (options.confirmation !== manifest.snapshotId) {
        throw new Error(
            "STUDYFLOW_RELEASE_ROLLBACK_CONFIRMATION deve coincidir com o snapshotId.",
        );
    }
    await verifyPayload(snapshotDir, manifest);

    const parent = dirname(implementationRoot);
    const token = randomUUID();
    const stagingRoot = join(parent, `.studyflow-rollback-stage-${token}`);
    const previousDir = join(
        parent,
        `.studyflow-rollback-previous-${(options.now ?? new Date())
            .toISOString()
            .replace(/[:.]/g, "-")}-${token}`,
    );
    await mkdir(stagingRoot, { recursive: false, mode: 0o700 });
    let preservedEnvironmentFiles = 0;

    try {
        for (const entry of manifest.files) {
            const source = resolve(snapshotDir, "payload", ...entry.path.split("/"));
            const destination = resolve(stagingRoot, ...entry.path.split("/"));
            assertContained(destination, stagingRoot);
            await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
            await copyFile(source, destination);
            await chmod(destination, entry.mode);
        }
        for (const relativePath of preservedEnvironmentPaths) {
            const source = resolve(implementationRoot, ...relativePath.split("/"));
            try {
                const metadata = await lstat(source);
                if (!metadata.isFile() || metadata.isSymbolicLink()) {
                    throw new Error("Um ficheiro de ambiente local não é regular.");
                }
                const destination = resolve(stagingRoot, ...relativePath.split("/"));
                await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
                await copyFile(source, destination);
                await chmod(destination, 0o600);
                preservedEnvironmentFiles += 1;
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
            }
        }

        await rename(implementationRoot, previousDir);
        try {
            await chmod(previousDir, 0o700);
            await rename(stagingRoot, implementationRoot);
        } catch (error) {
            await rename(previousDir, implementationRoot);
            throw error;
        }
        return {
            ok: true,
            snapshotId: manifest.snapshotId,
            implementationSha256: manifest.implementationSha256,
            previousDir,
            preservedEnvironmentFiles,
            cleanInstallRequired: true,
        };
    } catch (error) {
        await rm(stagingRoot, { recursive: true, force: true });
        throw error;
    }
}

async function collectImplementationFiles(
    implementationRoot: string,
): Promise<Array<{ absolutePath: string; relativePath: string; executable: boolean }>> {
    const files: Array<{ absolutePath: string; relativePath: string; executable: boolean }> = [];

    async function visit(current: string): Promise<void> {
        const metadata = await lstat(current);
        if (metadata.isSymbolicLink()) {
            throw new Error("A implementação contém um symlink não suportado no snapshot.");
        }
        const relativePath = relative(implementationRoot, current).split(sep).join("/");
        if (metadata.isDirectory()) {
            if (
                current !== implementationRoot &&
                excludedDirectoryPaths.has(relativePath)
            ) {
                return;
            }
            for (const entry of await readdir(current)) await visit(join(current, entry));
            return;
        }
        if (!metadata.isFile()) return;
        if (
            isSensitiveFile(relativePath) ||
            basename(current).endsWith(".log") ||
            relativePath.startsWith("web/real_dev/")
        ) {
            return;
        }
        if (metadata.size > MAX_SOURCE_FILE_BYTES) {
            throw new Error(`Ficheiro operativo demasiado grande para validar: ${relativePath}`);
        }
        validateRelativePath(relativePath);
        files.push({
            absolutePath: current,
            relativePath,
            executable: (metadata.mode & 0o111) !== 0,
        });
    }

    await visit(implementationRoot);
    return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function assertRequiredSnapshotPaths(paths: string[]): void {
    for (const requiredPath of REQUIRED_SNAPSHOT_PATHS) {
        if (!paths.includes(requiredPath)) {
            throw new Error(`Ficheiro operativo ausente do snapshot: ${requiredPath}`);
        }
    }
}

/** Nunca inclui configurações locais, package credentials ou material criptográfico. */
function isSensitiveFile(relativePath: string): boolean {
    const name = basename(relativePath);
    if (name === ".DS_Store" || name === ".npmrc" || name === ".netrc") return true;
    if (name === ".env.example") return false;
    if (name === ".env" || name.startsWith(".env.")) return true;
    return /(?:^|[._-])(?:credentials?|secrets?)(?:[._-]|$)/i.test(name) ||
        /\.(?:key|pem|p12|pfx)$/i.test(name) ||
        /^id_(?:rsa|ed25519)(?:\.pub)?$/i.test(name);
}

async function verifyPayload(
    snapshotDir: string,
    manifest: ReleaseSnapshotManifest,
): Promise<void> {
    const payloadRoot = join(snapshotDir, "payload");
    const actual = await collectPayloadFiles(payloadRoot);
    if (actual.length !== manifest.files.length) {
        throw new Error("O payload do snapshot não coincide com o manifesto.");
    }
    for (const [index, entry] of manifest.files.entries()) {
        if (actual[index] !== entry.path) {
            throw new Error("O payload do snapshot contém paths inesperados.");
        }
        const path = resolve(payloadRoot, ...entry.path.split("/"));
        const metadata = await stat(path);
        if (metadata.size !== entry.bytes || (await hashFile(path)) !== entry.sha256) {
            throw new Error("Integridade de um ficheiro do snapshot inválida.");
        }
    }
}

async function collectPayloadFiles(root: string): Promise<string[]> {
    const paths: string[] = [];
    async function visit(current: string): Promise<void> {
        const metadata = await lstat(current);
        if (metadata.isSymbolicLink()) throw new Error("O payload contém um symlink.");
        if (metadata.isDirectory()) {
            for (const entry of await readdir(current)) await visit(join(current, entry));
            return;
        }
        if (!metadata.isFile()) throw new Error("O payload contém uma entrada não regular.");
        const path = relative(root, current).split(sep).join("/");
        validateRelativePath(path);
        paths.push(path);
    }
    await visit(root);
    return paths.sort((left, right) => left.localeCompare(right));
}

async function readAndVerifyManifest(
    snapshotDir: string,
    key: Buffer,
): Promise<ReleaseSnapshotManifest> {
    const snapshotInfo = await lstat(snapshotDir);
    if (!snapshotInfo.isDirectory() || snapshotInfo.isSymbolicLink()) {
        throw new Error("Diretório de snapshot inválido.");
    }
    const manifestPath = join(snapshotDir, "manifest.json");
    const manifestInfo = await lstat(manifestPath);
    if (
        !manifestInfo.isFile() ||
        manifestInfo.isSymbolicLink() ||
        manifestInfo.size > MAX_MANIFEST_BYTES
    ) {
        throw new Error("Manifesto de snapshot inválido.");
    }
    const value = JSON.parse(await readFile(manifestPath, "utf8")) as Partial<ReleaseSnapshotManifest>;
    if (
        value.version !== 1 ||
        typeof value.snapshotId !== "string" ||
        basename(snapshotDir) !== value.snapshotId ||
        !Array.isArray(value.files) ||
        !/^[a-f0-9]{64}$/.test(value.implementationSha256 ?? "") ||
        !/^[a-f0-9]{64}$/.test(value.manifestHmacSha256 ?? "")
    ) {
        throw new Error("Manifesto de snapshot inválido.");
    }
    const manifest = value as ReleaseSnapshotManifest;
    const { manifestHmacSha256, ...unsigned } = manifest;
    const expected = createHmac("sha256", key).update(JSON.stringify(unsigned)).digest();
    const provided = Buffer.from(manifestHmacSha256, "hex");
    if (provided.byteLength !== expected.byteLength || !timingSafeEqual(provided, expected)) {
        throw new Error("Autenticidade do snapshot inválida.");
    }
    const seen = new Set<string>();
    for (const entry of manifest.files) {
        validateRelativePath(entry.path);
        if (
            seen.has(entry.path) ||
            !Number.isSafeInteger(entry.bytes) ||
            entry.bytes < 0 ||
            !/^[a-f0-9]{64}$/.test(entry.sha256) ||
            ![0o644, 0o755].includes(entry.mode)
        ) {
            throw new Error("Entrada inválida no manifesto de snapshot.");
        }
        seen.add(entry.path);
    }
    if (aggregateImplementationHash(manifest.files) !== manifest.implementationSha256) {
        throw new Error("Hash agregado do snapshot inválido.");
    }
    return manifest;
}

async function ensureSnapshotRoot(
    snapshotRoot: string,
    implementationRoot: string,
): Promise<void> {
    await assertCanonicalDirectoryBoundaries(snapshotRoot, [implementationRoot]);
    await mkdir(snapshotRoot, { recursive: true, mode: 0o700 });
    await assertCanonicalDirectoryBoundaries(snapshotRoot, [implementationRoot]);
    const info = await lstat(snapshotRoot);
    if (!info.isDirectory() || info.isSymbolicLink()) {
        throw new Error("A raiz de snapshots não é um diretório físico.");
    }
    const markerPath = join(snapshotRoot, SNAPSHOT_MARKER);
    try {
        const marker = JSON.parse(await readFile(markerPath, "utf8")) as Record<string, unknown>;
        if (marker.version !== 1 || marker.owner !== "studyflow") {
            throw new Error("Marker da raiz de snapshots inválido.");
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        const unexpected = (await readdir(snapshotRoot)).filter(
            (entry) => entry !== SNAPSHOT_MARKER && !/^release-\d{4}-/.test(entry),
        );
        if (unexpected.length > 0) {
            throw new Error("A raiz de snapshots contém elementos não geridos.");
        }
        await writeFile(
            markerPath,
            `${JSON.stringify({ version: 1, owner: "studyflow" })}\n`,
            { flag: "wx", mode: 0o600 },
        );
    }
    await chmod(snapshotRoot, 0o700);
    await chmod(markerPath, 0o600);
}

function normaliseImplementationRoot(rawPath: string): string {
    const root = resolve(rawPath);
    if (!isAbsolute(rawPath) || basename(root) !== "real_dev") {
        throw new Error("A raiz de implementação deve ser um path absoluto terminado em real_dev.");
    }
    return root;
}

function normaliseSnapshotRoot(rawPath: string | undefined, implementationRoot: string): string {
    const root = resolveRequiredPath(rawPath, "STUDYFLOW_RELEASE_SNAPSHOT_ROOT");
    if (
        !/^studyflow-release-snapshots(?:-[A-Za-z0-9._-]+)?$/.test(basename(root)) ||
        isSameOrInside(root, implementationRoot) ||
        isSameOrInside(implementationRoot, root)
    ) {
        throw new Error("A raiz de snapshots deve ser dedicada e ficar fora de real_dev.");
    }
    const generic = new Set([
        resolve("/"),
        resolve(tmpdir()),
        resolve("/tmp"),
        resolve("/private/tmp"),
        resolve(homedir()),
    ]);
    if (generic.has(root)) throw new Error("A raiz de snapshots não pode ser genérica.");
    return root;
}

function resolveRequiredPath(rawPath: string | undefined, envName: string): string {
    const value = rawPath?.trim();
    if (!value || !isAbsolute(value)) throw new Error(`${envName} deve ser um path absoluto.`);
    return resolve(value);
}

function parseAuthenticationKey(rawValue: string | undefined): Buffer {
    const value = rawValue?.trim();
    if (!value) throw new Error("STUDYFLOW_RELEASE_SNAPSHOT_KEY é obrigatória.");
    const key = /^[a-f0-9]{64}$/i.test(value)
        ? Buffer.from(value, "hex")
        : Buffer.from(value, "base64");
    if (key.byteLength !== 32) {
        throw new Error("STUDYFLOW_RELEASE_SNAPSHOT_KEY deve representar 32 bytes.");
    }
    return key;
}

function signManifest(
    unsigned: UnsignedReleaseSnapshotManifest,
    key: Buffer,
): ReleaseSnapshotManifest {
    return {
        ...unsigned,
        manifestHmacSha256: createHmac("sha256", key)
            .update(JSON.stringify(unsigned))
            .digest("hex"),
    };
}

function aggregateImplementationHash(entries: ReleaseSnapshotEntry[]): string {
    const aggregate = createHash("sha256");
    for (const entry of [...entries].sort((left, right) => left.path.localeCompare(right.path))) {
        aggregate.update(entry.path);
        aggregate.update("\0");
        aggregate.update(entry.sha256);
        aggregate.update("\n");
    }
    return aggregate.digest("hex");
}

async function hashFile(path: string): Promise<string> {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
    return hash.digest("hex");
}

function validateRelativePath(path: string): void {
    if (
        !path ||
        path.startsWith("/") ||
        path.includes("\\") ||
        path.split("/").some((part) => !part || part === "." || part === "..")
    ) {
        throw new Error("Path relativo inválido no snapshot.");
    }
}

function assertContained(target: string, root: string): void {
    if (!isSameOrInside(target, root)) throw new Error("Path escapou da raiz autorizada.");
}

function isSameOrInside(target: string, root: string): boolean {
    const resolvedTarget = resolve(target);
    const resolvedRoot = resolve(root);
    return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}${sep}`);
}

function defaultImplementationRoot(): string {
    return resolve(process.cwd(), "..");
}

async function runFromCli(): Promise<void> {
    try {
        if (process.argv.includes("--rollback")) {
            const result = await restoreReleaseSnapshot({
                snapshotDir: process.env.STUDYFLOW_RELEASE_ROLLBACK_SNAPSHOT,
                authenticationKey: process.env.STUDYFLOW_RELEASE_SNAPSHOT_KEY,
                allowRollback: process.env.STUDYFLOW_ALLOW_RELEASE_ROLLBACK === "true",
                confirmation: process.env.STUDYFLOW_RELEASE_ROLLBACK_CONFIRMATION,
            });
            console.log(JSON.stringify(result));
            return;
        }
        const result = await createReleaseSnapshot({
            snapshotRoot: process.env.STUDYFLOW_RELEASE_SNAPSHOT_ROOT,
            authenticationKey: process.env.STUDYFLOW_RELEASE_SNAPSHOT_KEY,
        });
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error(
            JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : "Falha no snapshot local.",
            }),
        );
        process.exitCode = 1;
    }
}

if (process.argv[1]?.endsWith("release-snapshot.js")) void runFromCli();
