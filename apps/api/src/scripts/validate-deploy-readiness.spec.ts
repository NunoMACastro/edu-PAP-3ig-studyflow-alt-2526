/**
 * Testa o gate operacional de deploy com rollback.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
    assertDeployReadiness,
    validateDeployReadiness,
} from "./validate-deploy-readiness.js";

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

    it("aprova uma release com versao e documento de rollback", () => {
        const result = assertDeployReadiness({
            version: "2026.06.30",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(true);
        expect(result.checks).toContain("versao:definida");
        expect(result.checks).toContain("rollback:documento-encontrado");
    });

    it("bloqueia uma release sem versao", () => {
        // O negativo sem versao impede publicar algo que a equipa nao consegue identificar depois.
        const result = validateDeployReadiness({
            version: "   ",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("versao:em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "   ",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });

    it("bloqueia uma release sem documento de rollback", () => {
        // Remover o documento simula o erro operacional que deixaria a equipa sem recuperacao definida.
        rmSync(fixture.rollbackDocumentPath, { force: true });

        const result = validateDeployReadiness({
            version: "2026.06.30",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("rollback:documento-em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "2026.06.30",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });
});

/**
 * Cria um documento de rollback temporario para os testes nao dependerem do estado real de `real_dev/docs`.
 *
 * @returns Caminho temporario do documento e funcao de limpeza.
 */
function createRollbackFixture(): RollbackFixture {
    const tempDir = mkdtempSync(join(tmpdir(), "studyflow-deploy-"));
    const rollbackDocumentPath = join(tempDir, "DEPLOY-ROLLBACK.md");

    writeFileSync(rollbackDocumentPath, "# Plano de rollback\n", "utf8");

    return {
        tempDir,
        rollbackDocumentPath,
        /**
         * Executa o apoio de teste para scripts operacionais, mantendo o cenário legível e próximo do comportamento real validado.
         *
         * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
         */
        cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
    };
}
