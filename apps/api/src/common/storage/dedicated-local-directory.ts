/**
 * Barreiras comuns para diretórios locais sobre os quais a aplicação pode
 * alterar permissões ou remover conteúdo. Um nome dedicado e um marker válido
 * impedem que uma variável de ambiente mal configurada transforme operações
 * de manutenção em remoções recursivas de diretórios genéricos.
 */
import { homedir, tmpdir } from "node:os";
import {
    chmod,
    lstat,
    mkdir,
    readFile,
    readdir,
    realpath,
    writeFile,
} from "node:fs/promises";
import { basename, isAbsolute, join, resolve, sep } from "node:path";

export const STUDYFLOW_DIRECTORY_MARKER = ".studyflow-directory.json";

export type StudyFlowDirectoryKind = "material-storage" | "database-backups";

type DirectoryMarker = {
    version: 1;
    owner: "studyflow";
    kind: StudyFlowDirectoryKind;
};

type DirectoryOptions = {
    envName: string;
    blockedRoots: string[];
};

type CanonicalBoundaryOptions = {
    blockedRoots?: string[];
};

/**
 * Normaliza um path dedicado e recusa raízes genéricas, o checkout e qualquer
 * antepassado do checkout. O último segmento tem de declarar explicitamente
 * que pertence à StudyFlow.
 */
export function normaliseDedicatedLocalDirectory(
    rawPath: string,
    options: DirectoryOptions,
): string {
    if (!isAbsolute(rawPath)) {
        throw new Error(`${options.envName} deve ser um path absoluto.`);
    }
    const target = resolve(rawPath);
    for (const rawRoot of options.blockedRoots) {
        const blockedRoot = resolve(rawRoot);
        if (isSameOrInside(target, blockedRoot) || isSameOrInside(blockedRoot, target)) {
            throw new Error(`${options.envName} deve ficar fora do checkout.`);
        }
    }

    const dedicatedName = basename(target);
    if (!/^studyflow-[a-z0-9][a-z0-9._-]{0,80}$/i.test(dedicatedName)) {
        throw new Error(
            `${options.envName} deve terminar num diretório dedicado studyflow-*.`
        );
    }

    const genericRoots = new Set([
        resolve("/"),
        resolve(homedir()),
        resolve(tmpdir()),
        resolve("/tmp"),
        resolve("/private/tmp"),
        resolve("/var"),
        resolve("/private/var"),
        resolve("/Users"),
    ]);
    if (genericRoots.has(target)) {
        throw new Error(`${options.envName} deve apontar para uma pasta dedicada.`);
    }
    return target;
}

/**
 * Cria ou valida o marker de propriedade. Um diretório existente sem marker só
 * pode ser adotado quando todos os seus elementos de topo são conhecidos para
 * o respetivo tipo de volume.
 */
export async function ensureStudyFlowDirectory(
    directory: string,
    kind: StudyFlowDirectoryKind,
    options: CanonicalBoundaryOptions = {},
): Promise<void> {
    await assertCanonicalDirectoryBoundaries(directory, options.blockedRoots ?? []);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await assertCanonicalDirectoryBoundaries(directory, options.blockedRoots ?? []);
    const targetInfo = await lstat(directory);
    if (targetInfo.isSymbolicLink() || !targetInfo.isDirectory()) {
        throw new Error("O diretório dedicado não pode ser um symlink.");
    }
    const canonicalDirectory = await realpath(directory);
    if (basename(canonicalDirectory) !== basename(directory)) {
        throw new Error("O diretório dedicado resolveu para um alvo inesperado.");
    }

    const markerPath = join(directory, STUDYFLOW_DIRECTORY_MARKER);
    try {
        await assertStudyFlowDirectory(directory, kind);
    } catch (error) {
        const entries = await readdir(directory);
        const allowedEntries = allowedUnmarkedEntries(kind);
        const unexpected = entries.filter(
            (entry) => entry !== STUDYFLOW_DIRECTORY_MARKER && !allowedEntries(entry),
        );
        if (unexpected.length > 0) throw error;
        const marker: DirectoryMarker = { version: 1, owner: "studyflow", kind };
        await writeFile(markerPath, `${JSON.stringify(marker)}\n`, {
            flag: "wx",
            mode: 0o600,
        }).catch(async (writeError: NodeJS.ErrnoException) => {
            if (writeError.code !== "EEXIST") throw writeError;
            await assertStudyFlowDirectory(directory, kind);
        });
    }
    await chmod(directory, 0o700);
    await chmod(markerPath, 0o600);
}

/** Confirma que um diretório já foi explicitamente reclamado pela aplicação. */
export async function assertStudyFlowDirectory(
    directory: string,
    kind: StudyFlowDirectoryKind,
    options: CanonicalBoundaryOptions = {},
): Promise<void> {
    await assertCanonicalDirectoryBoundaries(directory, options.blockedRoots ?? []);
    const info = await lstat(directory);
    if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error("O diretório dedicado não é uma pasta física válida.");
    }
    const marker = JSON.parse(
        await readFile(join(directory, STUDYFLOW_DIRECTORY_MARKER), "utf8"),
    ) as Partial<DirectoryMarker>;
    if (marker.version !== 1 || marker.owner !== "studyflow" || marker.kind !== kind) {
        throw new Error("O marker do diretório dedicado é inválido.");
    }
}

/**
 * Resolve symlinks em qualquer antepassado existente antes de permitir writes
 * ou remoções. Isto impede que um path lexical fora do checkout aponte, na
 * realidade, para dentro dele.
 */
export async function assertCanonicalDirectoryBoundaries(
    directory: string,
    blockedRoots: string[],
): Promise<void> {
    const canonicalTarget = await canonicalProspectivePath(directory);
    for (const rawRoot of blockedRoots) {
        const canonicalRoot = await canonicalProspectivePath(rawRoot);
        if (
            isSameOrInside(canonicalTarget, canonicalRoot) ||
            isSameOrInside(canonicalRoot, canonicalTarget)
        ) {
            throw new Error("O diretório dedicado resolveu para uma raiz bloqueada.");
        }
    }
}

/** Resolve o antepassado existente mais próximo sem criar o alvo. */
async function canonicalProspectivePath(rawPath: string): Promise<string> {
    let current = resolve(rawPath);
    const missingSegments: string[] = [];
    while (true) {
        try {
            const info = await lstat(current);
            if (info.isSymbolicLink()) {
                current = await realpath(current);
            } else {
                current = await realpath(current);
            }
            return resolve(current, ...missingSegments.reverse());
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
            const parent = resolve(current, "..");
            if (parent === current) throw error;
            missingSegments.push(basename(current));
            current = parent;
        }
    }
}

function allowedUnmarkedEntries(kind: StudyFlowDirectoryKind): (name: string) => boolean {
    if (kind === "material-storage") {
        return (name) => ["users", ".staging", ".outbox"].includes(name);
    }
    return (name) => /^daily-\d{4}-\d{2}-\d{2}T/.test(name);
}

function isSameOrInside(target: string, root: string): boolean {
    return target === root || target.startsWith(`${root}${sep}`);
}
