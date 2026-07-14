/** Remove sempre os artefactos browser efémeros, que podem conter dados de sessão. */
import type { FullConfig } from "@playwright/test";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, sep } from "node:path";

/** Limpa apenas o subdiretório temporário criado pela configuração StudyFlow. */
export default async function globalTeardown(config: FullConfig): Promise<void> {
    const rawRoot = config.metadata.studyflowArtifactRoot;
    if (typeof rawRoot !== "string" || rawRoot.length === 0) {
        throw new Error("Metadata Playwright do diretório de artefactos em falta.");
    }
    const root = resolve(rawRoot);
    const allowedRoot = resolve(tmpdir(), "studyflow-e2e");
    if (root === allowedRoot || !root.startsWith(`${allowedRoot}${sep}`)) {
        throw new Error("Recusada limpeza de artefactos fora do diretório E2E.");
    }
    await rm(root, { recursive: true, force: true });
}
