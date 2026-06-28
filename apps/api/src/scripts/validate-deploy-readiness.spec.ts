// apps/api/src/scripts/validate-deploy-readiness.spec.ts
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { assertDeployReadiness, validateDeployReadiness } from "./validate-deploy-readiness.js";

type RollbackFixture = {
    tempDir: string;
    rollbackDocumentPath: string;
    cleanup(): void;
};

describe("validateDeployReadiness", () => {
    let fixture: RollbackFixture;

    beforeEach(() => {
        fixture = createRollbackFixture();
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("aprova uma release com versão e documento de rollback", () => {
        const result = assertDeployReadiness({
            version: "2026.06.27",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(true);
        expect(result.checks).toContain("versão:definida");
        expect(result.checks).toContain("rollback:documento-encontrado");
    });

    it("bloqueia uma release sem versão", () => {
        // O negativo sem versão impede publicar algo que a equipa não consegue identificar depois.
        const result = validateDeployReadiness({
            version: "   ",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("versão:em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "   ",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });

    it("bloqueia uma release sem documento de rollback", () => {
        // Remover o documento simula o erro operacional que deixaria a equipa sem recuperação definida.
        rmSync(fixture.rollbackDocumentPath, { force: true });

        const result = validateDeployReadiness({
            version: "2026.06.27",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("rollback:documento-em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "2026.06.27",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });
});

/**
 * Cria um documento de rollback temporário para os testes não dependerem do estado real de docs/ops.
 *
 * @returns Caminho temporário do documento e função de limpeza.
 */
function createRollbackFixture(): RollbackFixture {
    const tempDir = mkdtempSync(join(tmpdir(), "studyflow-deploy-"));
    const rollbackDocumentPath = join(tempDir, "DEPLOY-ROLLBACK.md");

    writeFileSync(rollbackDocumentPath, "# Plano de rollback\n", "utf8");

    return {
        tempDir,
        rollbackDocumentPath,
        cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
    };
}