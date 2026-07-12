import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    buildMf8FinalTestPlan,
    createMf8FinalEvidence,
    renderFinalEvidenceMarkdown,
    runFinalTestPlan,
    sanitizeEvidencePath,
    sanitizeOutput,
    validateInventoryEvidence,
    type CommandRunner,
    type FinalGateEvidence,
    type FinalTestCommand,
} from "./run-mf8-final-tests.js";

/**
 * Cria uma raiz temporária com a estrutura mínima de evidence da MF8.
 *
 * @returns Caminho absoluto da raiz temporária criada para o teste.
 */
function createTempRepo(): string {
    const repoRoot = mkdtempSync(join(tmpdir(), "studyflow-mf8-"));
    mkdirSync(join(repoRoot, "docs/evidence/MF8/historico/gerado"), {
        recursive: true,
    });
    return repoRoot;
}

describe("run-mf8-final-tests", () => {
    it("bloqueia quando a evidence do BK-MF8-15 não existe", () => {
        const repoRoot = createTempRepo();

        try {
            rmSync(join(repoRoot, "docs/evidence/MF8/historico"), {
                recursive: true,
                force: true,
            });

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
                args: ["--prefix", "real_dev/api", "run", "test:unit"],
                required: true,
                timeoutMs: 1_000,
                expected: "A suite Jest da API termina com exit code 0.",
            },
        ];
        /**
         * Executa o apoio de teste para scripts operacionais, mantendo o cenário legível e próximo do comportamento real validado.
         *
         * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
         */
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

    it("mantém o plano final apontado para real_dev", () => {
        const repoRoot = createTempRepo();

        try {
            const commandLines = buildMf8FinalTestPlan(repoRoot).map((command) => [
                command.command,
                ...command.args,
            ].join(" "));

            // A prompt ativa usa IMPLEMENTATION_ROOT=real_dev; apps/* fica apenas como referência documental.
            expect(commandLines).toContain("npm --prefix real_dev/api run test:unit");
            expect(commandLines).toContain("npm --prefix real_dev/web run build");
            expect(commandLines).not.toContain("npm --prefix apps/api run test:unit");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });

    it("sanitiza segredos e renderiza a decisão final", () => {
        const evidence: FinalGateEvidence = {
            generatedAt: "2026-07-06T00:00:00.000Z",
            evidencePath:
                "/repo/docs/evidence/MF8/historico/gerado/TESTES-FINAIS.md",
            inventory: {
                path: "/repo/docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
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
        expect(markdown).toContain("PASS_HISTORICO");
        expect(markdown).toContain("authoritative_for_release: false");
        expect(markdown).toContain("token=[removido]");
        expect(markdown).not.toContain("abc123");
        expect(markdown).toContain(
            "- Ficheiro: docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
        );
        expect(markdown).not.toContain("/repo/docs/evidence");
    });

    it("remove diretoria local dos paths de evidence", () => {
        const path = sanitizeEvidencePath(
            "/Users/nuno/projeto/studyflow_alt/docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
        );

        expect(path).toBe(
            "docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
        );
    });

    it("permite avançar quando a evidence anterior não tem decisão bloqueante", async () => {
        const repoRoot = createTempRepo();

        try {
            await writeFile(
                join(
                    repoRoot,
                    "docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
                ),
                "- Snapshot historico coberto; consultar o ledger para qualquer decisao atual.\n",
                "utf8",
            );

            const result = validateInventoryEvidence(repoRoot);

            expect(result.status).toBe("PASS");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });

    it("bloqueia evidence anterior com frase acentuada", async () => {
        const repoRoot = createTempRepo();

        try {
            await writeFile(
                join(
                    repoRoot,
                    "docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
                ),
                "- Snapshot historico com lacunas; este resultado nao deve ser promovido.\n",
                "utf8",
            );

            const result = validateInventoryEvidence(repoRoot);

            // A evidence humana pode ter acentos; o gate não deve depender de uma só grafia ASCII.
            expect(result.status).toBe("BLOQUEADO");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });

    it("escreve apenas na arvore historica e preserva o banner atual", async () => {
        const repoRoot = createTempRepo();
        const currentBanner = join(
            repoRoot,
            "docs/evidence/MF8/TESTES-FINAIS.md",
        );
        const historicalInventory = join(
            repoRoot,
            "docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md",
        );
        const successfulRunner: CommandRunner = () => ({
            status: 0,
            stdout: "PASS",
            stderr: "",
            error: undefined,
        });

        try {
            await writeFile(currentBanner, "SUPERSEDED\n", "utf8");
            await writeFile(
                historicalInventory,
                "- Snapshot historico coberto; consultar o ledger.\n",
                "utf8",
            );

            const evidence = createMf8FinalEvidence(
                repoRoot,
                "2026-07-10T00:00:00.000Z",
                successfulRunner,
                { STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE: "true" },
            );

            expect(evidence.evidencePath).toContain(
                "docs/evidence/MF8/historico/gerado/TESTES-FINAIS.md",
            );
            expect(existsSync(evidence.evidencePath)).toBe(true);
            expect(readFileSync(currentBanner, "utf8")).toBe("SUPERSEDED\n");
        } finally {
            rmSync(repoRoot, { recursive: true, force: true });
        }
    });
});
