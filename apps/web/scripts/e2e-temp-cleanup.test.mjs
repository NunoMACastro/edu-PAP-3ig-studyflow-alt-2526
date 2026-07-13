/**
 * Valida que o cleanup E2E remove apenas paths pertencentes ao runId indicado.
 */
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cleanupE2eRunArtifacts } from "./e2e-temp-cleanup.mjs";

describe("cleanupE2eRunArtifacts", () => {
    it("remove o report e apenas storages com runId e sufixo válidos", async () => {
        const root = await mkdtemp(resolve(tmpdir(), "studyflow-cleanup-test-"));
        const runId = "run_final_1";
        const matchingStorage = resolve(
            root,
            `studyflow-e2e-storage-${runId}-123-123e4567-e89b-12d3-a456-426614174000`,
        );
        const otherStorage = resolve(
            root,
            "studyflow-e2e-storage-other-123-123e4567-e89b-12d3-a456-426614174000",
        );
        const malformedStorage = resolve(
            root,
            `studyflow-e2e-storage-${runId}-sem-sufixo-seguro`,
        );
        const artifactRoot = resolve(root, "studyflow-e2e", runId);

        try {
            await Promise.all([
                mkdir(matchingStorage, { recursive: true }),
                mkdir(otherStorage, { recursive: true }),
                mkdir(malformedStorage, { recursive: true }),
                mkdir(artifactRoot, { recursive: true }),
            ]);
            await writeFile(resolve(matchingStorage, "synthetic.bin"), "teste");

            await expect(
                cleanupE2eRunArtifacts({ runId, temporaryRoot: root }),
            ).resolves.toEqual({
                artifactRootsDeleted: 1,
                storageRootsDeleted: 1,
            });

            await expect(stat(matchingStorage)).rejects.toMatchObject({
                code: "ENOENT",
            });
            await expect(stat(artifactRoot)).rejects.toMatchObject({
                code: "ENOENT",
            });
            await expect(stat(otherStorage)).resolves.toBeDefined();
            await expect(stat(malformedStorage)).resolves.toBeDefined();
        } finally {
            await rm(root, { recursive: true, force: true });
        }
    });

    it("recusa runIds ambíguos antes de tocar no filesystem", async () => {
        await expect(
            cleanupE2eRunArtifacts({ runId: "../fora" }),
        ).rejects.toThrow("caracteres inválidos");
    });
});
