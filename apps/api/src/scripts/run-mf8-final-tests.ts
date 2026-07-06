// apps/api/src/scripts/run-mf8-final-tests.ts
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Estados possíveis do gate final de testes.
 *
 * `PASS` permite avançar, `FAIL` identifica falha técnica obrigatória e `BLOQUEADO` regista falta de evidence ou limitação de ambiente.
 */
export type FinalGateStatus = "PASS" | "FAIL" | "BLOQUEADO";

/**
 * Comando individual da bateria final.
 *
 * Este contrato separa comandos obrigatórios de comandos opcionais para o relatório final não esconder riscos de ambiente.
 */
export type FinalTestCommand = {
    id: string;
    name: string;
    cwd: string;
    command: string;
    args: string[];
    required: boolean;
    timeoutMs: number;
    expected: string;
};

/**
 * Resultado observado de um comando executado.
 *
 * A evidence usa este tipo para guardar exit code, estado normalizado e outputs já sanitizados.
 */
export type FinalTestResult = {
    id: string;
    name: string;
    commandLine: string;
    required: boolean;
    status: FinalGateStatus;
    exitCode: number | null;
    expected: string;
    observed: string;
    stdout: string;
    stderr: string;
};

/**
 * Resultado da verificação da evidence criada em BK-MF8-15.
 *
 * Este tipo impede a execução final de avançar quando ainda há lacunas P0 por tratar.
 */
export type InventoryEvidenceCheck = {
    path: string;
    status: FinalGateStatus;
    observed: string;
};

/**
 * Evidence final produzida por BK-MF8-16.
 *
 * Junta a evidence de entrada, os comandos executados e o caminho Markdown entregue a BK-MF8-17.
 */
export type FinalGateEvidence = {
    generatedAt: string;
    evidencePath: string;
    inventory: InventoryEvidenceCheck;
    commands: FinalTestResult[];
};

/**
 * Função substituível para executar comandos.
 *
 * Em produção chama `spawnSync`; nos testes permite simular falhas sem correr npm, Playwright ou bash reais.
 */
export type CommandRunner = (
    command: string,
    args: string[],
    options: { cwd: string; encoding: "utf8"; timeout: number },
) => Pick<SpawnSyncReturns<string>, "status" | "stdout" | "stderr" | "error">;

/**
 * Runner real usado pela CLI para executar processos locais.
 */
export const nodeCommandRunner: CommandRunner = (command, args, options) => {
    return spawnSync(command, args, options);
};

/**
 * Resolve a raiz pública do projeto a partir da pasta `apps/api`.
 *
 * @param cwd Pasta atual usada pelo comando npm.
 * @returns Caminho absoluto para a raiz do repositório.
 */
export function resolveRepoRoot(cwd = process.cwd()): string {
    const currentDirIsApi = existsSync(resolve(cwd, "src")) && existsSync(resolve(cwd, "package.json"));

    // O script é executado a partir de apps/api; subir duas pastas chega à raiz pública do projeto.
    return currentDirIsApi ? resolve(cwd, "../..") : cwd;
}

/**
 * Cria a bateria final de comandos com comandos reais do projeto.
 *
 * @param repoRoot Raiz pública do projeto StudyFlow.
 * @returns Lista ordenada de comandos a executar.
 */
export function buildMf8FinalTestPlan(repoRoot: string): FinalTestCommand[] {
    return [
        {
            id: "planificacao",
            name: "Validação da planificação",
            cwd: repoRoot,
            command: "bash",
            args: ["scripts/validate-planificacao.sh"],
            required: true,
            timeoutMs: 60_000,
            expected: "O validador termina com overall_pass true.",
        },
        {
            id: "api-unit",
            name: "Testes unitários da API",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "apps/api", "run", "test:unit"],
            required: true,
            timeoutMs: 180_000,
            expected: "A suite Jest da API termina com exit code 0.",
        },
        {
            id: "api-build",
            name: "Build da API",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "apps/api", "run", "build"],
            required: true,
            timeoutMs: 120_000,
            expected: "O build NestJS compila sem erros TypeScript.",
        },
        {
            id: "web-build",
            name: "Build da web",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "apps/web", "run", "build"],
            required: true,
            timeoutMs: 120_000,
            expected: "O build Vite/TypeScript compila sem erros.",
        },
        {
            id: "web-e2e",
            name: "E2E Playwright da web",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "apps/web", "run", "test:e2e"],
            required: false,
            timeoutMs: 180_000,
            expected: "As suites Playwright passam quando o ambiente E2E está preparado.",
        },
    ];
}

/**
 * Junta comando e argumentos numa linha legível para evidence.
 *
 * @param command Comando base.
 * @param args Argumentos do comando.
 * @returns Linha textual do comando.
 */
export function formatCommandLine(command: string, args: string[]): string {
    return [command, ...args].join(" ");
}

/**
 * Remove informação sensível e limita o tamanho do output guardado.
 *
 * @param output Texto original escrito pelo comando.
 * @param maxLength Número máximo de caracteres a guardar.
 * @returns Output seguro para evidence.
 */
export function sanitizeOutput(output: string, maxLength = 4_000): string {
    const redacted = output
        .replace(/(authorization|cookie|token|password|secret)=\S+/gi, "$1=[removido]")
        .replace(/(Bearer)\s+\S+/gi, "$1 [removido]");

    // A evidence deve provar o resultado sem copiar logs enormes ou dados potencialmente sensíveis.
    return redacted.length > maxLength ? `${redacted.slice(0, maxLength)}\n...[output truncado]` : redacted;
}

/**
 * Confirma se a evidence criada no BK anterior permite avançar.
 *
 * @param repoRoot Raiz pública do projeto.
 * @returns Estado da evidence de entrada.
 */
export function validateInventoryEvidence(repoRoot: string): InventoryEvidenceCheck {
    const evidencePath = resolve(repoRoot, "docs/evidence/MF8/TESTES-EM-FALTA.md");

    if (!existsSync(evidencePath)) {
        return {
            path: evidencePath,
            status: "BLOQUEADO",
            observed: "A evidence do BK-MF8-15 ainda não existe.",
        };
    }

    const content = readFileSync(evidencePath, "utf8");
    const hasBlockingDecision = content.includes("Não avances para a execução final");

    return {
        path: evidencePath,
        status: hasBlockingDecision ? "BLOQUEADO" : "PASS",
        observed: hasBlockingDecision
            ? "A evidence do BK-MF8-15 indica lacunas P0 antes da execução final."
            : "A evidence do BK-MF8-15 permite iniciar a execução final.",
    };
}

/**
 * Executa um comando da bateria final.
 *
 * @param testCommand Comando declarado no plano final.
 * @param runner Função usada para executar comandos, substituível nos testes.
 * @returns Resultado normalizado para evidence.
 */
export function runFinalTestCommand(
    testCommand: FinalTestCommand,
    runner: CommandRunner = nodeCommandRunner,
): FinalTestResult {
    const result = runner(testCommand.command, testCommand.args, {
        cwd: testCommand.cwd,
        encoding: "utf8",
        timeout: testCommand.timeoutMs,
    });

    const exitCode = result.status ?? null;
    const hasPassed = exitCode === 0;
    const status: FinalGateStatus = hasPassed ? "PASS" : testCommand.required ? "FAIL" : "BLOQUEADO";
    const rawError = result.error?.message ? `\n${result.error.message}` : "";

    return {
        id: testCommand.id,
        name: testCommand.name,
        commandLine: formatCommandLine(testCommand.command, testCommand.args),
        required: testCommand.required,
        status,
        exitCode,
        expected: testCommand.expected,
        observed: hasPassed
            ? "Comando terminou com exit code 0."
            : `Comando terminou sem sucesso ou foi bloqueado pelo ambiente.${rawError}`,
        stdout: sanitizeOutput(result.stdout ?? ""),
        stderr: sanitizeOutput(result.stderr ?? ""),
    };
}

/**
 * Executa a bateria final completa.
 *
 * @param plan Lista de comandos finais.
 * @param runner Função de execução usada em produção ou nos testes.
 * @returns Resultados de todos os comandos.
 */
export function runFinalTestPlan(
    plan: FinalTestCommand[],
    runner: CommandRunner = nodeCommandRunner,
): FinalTestResult[] {
    return plan.map((testCommand) => runFinalTestCommand(testCommand, runner));
}

/**
 * Indica se a evidence final deve bloquear o avanço para BK-MF8-17.
 *
 * @param evidence Evidence final já calculada.
 * @returns Verdadeiro se houver falha obrigatória ou evidence anterior bloqueada.
 */
export function hasBlockingFailure(evidence: FinalGateEvidence): boolean {
    return (
        evidence.inventory.status !== "PASS" ||
        evidence.commands.some((result) => result.required && result.status !== "PASS")
    );
}

/**
 * Renderiza a evidence final em Markdown.
 *
 * @param evidence Resultados recolhidos pelo runner.
 * @returns Markdown pronto a guardar em `docs/evidence/MF8/TESTES-FINAIS.md`.
 */
export function renderFinalEvidenceMarkdown(evidence: FinalGateEvidence): string {
    const commandRows = evidence.commands.map((result) => {
        return `| ${result.required ? "Sim" : "Não"} | ${result.name} | ${result.status} | ${result.exitCode ?? "-"} | \`${result.commandLine}\` |`;
    });

    const outputBlocks = evidence.commands.flatMap((result) => [
        `### ${result.name}`,
        "",
        `- Expected: ${result.expected}`,
        `- Observed: ${result.observed}`,
        "",
        "```txt",
        result.stdout || result.stderr || "Sem output relevante.",
        "```",
        "",
    ]);

    return [
        "# TESTES-FINAIS - MF8",
        "",
        "## Decisão final",
        "",
        hasBlockingFailure(evidence)
            ? "- BLOQUEADO: corrige as falhas obrigatórias ou a evidence de entrada antes de fechar a MF8."
            : "- PASS: a bateria obrigatória passou e a evidence está pronta para BK-MF8-17.",
        "",
        "## Evidence de entrada",
        "",
        `- Ficheiro: ${evidence.inventory.path}`,
        `- Estado: ${evidence.inventory.status}`,
        `- Observed: ${evidence.inventory.observed}`,
        "",
        "## Comandos executados",
        "",
        "| Obrigatório | Comando | Estado | Exit code | Linha executada |",
        "| --- | --- | --- | --- | --- |",
        ...commandRows,
        "",
        "## Outputs sanitizados",
        "",
        ...outputBlocks,
        `- Gerado em: ${evidence.generatedAt}`,
        "",
    ].join("\n");
}

/**
 * Cria a evidence final e grava o ficheiro Markdown.
 *
 * @param repoRoot Raiz pública do projeto.
 * @param generatedAt Data textual usada na evidence.
 * @param runner Função de execução substituível em testes.
 * @returns Evidence final.
 */
export function createMf8FinalEvidence(
    repoRoot = resolveRepoRoot(),
    generatedAt = new Date().toISOString(),
    runner: CommandRunner = nodeCommandRunner,
): FinalGateEvidence {
    const evidencePath = resolve(repoRoot, "docs/evidence/MF8/TESTES-FINAIS.md");
    const inventory = validateInventoryEvidence(repoRoot);
    const commands = inventory.status === "PASS" ? runFinalTestPlan(buildMf8FinalTestPlan(repoRoot), runner) : [];
    const evidence: FinalGateEvidence = { generatedAt, evidencePath, inventory, commands };
    const markdown = renderFinalEvidenceMarkdown(evidence);

    // O runner cria a pasta de evidence para que o aluno não tenha de preparar a árvore manualmente.
    mkdirSync(dirname(evidencePath), { recursive: true });
    writeFileSync(evidencePath, markdown, "utf8");

    return evidence;
}

/**
 * Executa o gate final pela linha de comandos.
 */
export function runMf8FinalTestsCli(): void {
    const evidence = createMf8FinalEvidence();
    process.stdout.write(`Evidence final escrita em ${evidence.evidencePath}\n`);

    if (hasBlockingFailure(evidence)) {
        process.exitCode = 1;
    }
}

const entrypoint = process.argv[1] ?? "";

if (entrypoint.endsWith("run-mf8-final-tests.js") || entrypoint.endsWith("run-mf8-final-tests.ts")) {
    runMf8FinalTestsCli();
}