// apps/api/src/scripts/run-mf8-final-tests.spec.ts
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
    renderFinalEvidenceMarkdown,
    runFinalTestPlan,
    sanitizeOutput,
    validateInventoryEvidence,
    type CommandRunner,
    type FinalGateEvidence,
    type FinalTestCommand,
} from "./run-mf8-final-tests.js";

function createTempRepo(): string {
    const repoRoot = mkdtempSync(join(tmpdir(), "studyflow-mf8-"));
    mkdirSync(join(repoRoot, "docs/evidence/MF8"), { recursive: true });
    return repoRoot;
}

describe("run-mf8-final-tests", () => {
    it("bloqueia quando a evidence do BK-MF8-15 não existe", () => {
        const repoRoot = createTempRepo();

        try {
            rmSync(join(repoRoot, "docs/evidence/MF8"), { recursive: true, force: true });

            const result = validateInventoryEvidence(repoRoot);

            // Sem a evidence anterior, o gate final não pode fingir que a bateria está pronta.
            expect(result.status).toBe("BLOQUEADO");
            expect(result.observed).toContain("ainda não existe");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });

    it("classifica falha obrigatória como FAIL", () => {
        const repoRoot = createTempRepo();
        const plan: FinalTestCommand[] = [
            {
                id: "api-unit",
                name: "Testes unitários da API",
                cwd: repoRoot,
                command: "npm",
                args: ["--prefix", "apps/api", "run", "test:unit"],
                required: true,
                timeoutMs: 1_000,
                expected: "A suite Jest da API termina com exit code 0.",
            },
        ];
        const runnerDeTeste: CommandRunner = () => ({
            status: 1,
            stdout: "",
            stderr: "1 teste falhou",
            error: undefined,
        });

        try {
            const [result] = runFinalTestPlan(plan, runnerDeTeste);

            // Comando obrigatório sem sucesso bloqueia a entrega e alimenta o BK-MF8-17.
            expect(result.status).toBe("FAIL");
            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain("1 teste falhou");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });

    it("sanitiza segredos e renderiza a decisão final", () => {
        const evidence: FinalGateEvidence = {
            generatedAt: "2026-07-02T00:00:00.000Z",
            evidencePath: "/repo/docs/evidence/MF8/TESTES-FINAIS.md",
            inventory: {
                path: "/repo/docs/evidence/MF8/TESTES-EM-FALTA.md",
                status: "PASS",
                observed: "A evidence do BK-MF8-15 permite iniciar a execução final.",
            },
            commands: [
                {
                    id: "planificacao",
                    name: "Validação da planificação",
                    commandLine: "bash scripts/validate-planificacao.sh",
                    required: true,
                    status: "PASS",
                    exitCode: 0,
                    expected: "O validador termina com overall_pass true.",
                    observed: "Comando terminou com exit code 0.",
                    stdout: sanitizeOutput("token=abc123\nPASS"),
                    stderr: "",
                },
            ],
        };

        const markdown = renderFinalEvidenceMarkdown(evidence);

        // A evidence pode ser anexada à defesa porque remove valores sensíveis antes de guardar output.
        expect(markdown).toContain("PASS: a bateria obrigatória passou");
        expect(markdown).toContain("token=[removido]");
        expect(markdown).not.toContain("abc123");
    });
});