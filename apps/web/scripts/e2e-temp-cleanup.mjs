/**
 * Remove apenas artefactos temporários pertencentes a uma execução E2E
 * identificada. O filtro estrito impede que um runId controle paths arbitrários.
 */
import { readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, sep } from "node:path";

const RUN_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const STORAGE_SUFFIX_PATTERN = /^\d+-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Limpa o output Playwright e todos os storages sintéticos do mesmo runId.
 *
 * @param {{ runId: string, temporaryRoot?: string }} input Identidade e raiz temporária.
 * @returns {Promise<{ artifactRootsDeleted: number, storageRootsDeleted: number }>} Contagens seguras.
 */
export async function cleanupE2eRunArtifacts({
    runId,
    temporaryRoot = tmpdir(),
}) {
    if (!RUN_ID_PATTERN.test(runId)) {
        throw new Error("STUDYFLOW_E2E_RUN_ID contém caracteres inválidos.");
    }

    const resolvedTemporaryRoot = resolve(temporaryRoot);
    const artifactBase = resolve(resolvedTemporaryRoot, "studyflow-e2e");
    const artifactRoot = resolve(artifactBase, runId);
    assertChildPath(artifactRoot, artifactBase);

    await rm(artifactRoot, { recursive: true, force: true });

    const storagePrefix = `studyflow-e2e-storage-${runId}-`;
    const entries = await readdir(resolvedTemporaryRoot, { withFileTypes: true });
    const storageRoots = entries
        .filter((entry) => {
            if (!entry.isDirectory() || !entry.name.startsWith(storagePrefix)) {
                return false;
            }
            return STORAGE_SUFFIX_PATTERN.test(entry.name.slice(storagePrefix.length));
        })
        .map((entry) => {
            const path = resolve(resolvedTemporaryRoot, entry.name);
            assertChildPath(path, resolvedTemporaryRoot);
            return path;
        });

    for (const path of storageRoots) {
        await rm(path, { recursive: true, force: true });
    }

    return {
        artifactRootsDeleted: 1,
        storageRootsDeleted: storageRoots.length,
    };
}

/** Confirma que o alvo resolvido está estritamente abaixo da raiz autorizada. */
function assertChildPath(path, root) {
    if (!path.startsWith(`${root}${sep}`)) {
        throw new Error("Diretório temporário E2E fora da raiz autorizada.");
    }
}
