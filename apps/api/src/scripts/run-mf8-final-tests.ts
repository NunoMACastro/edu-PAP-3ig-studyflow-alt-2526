import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Estados possíveis do gate final de testes da MF8.
 *
 * `PASS` permite avançar para o registo de correção, `FAIL` representa falha
 * obrigatória e `BLOQUEADO` representa falta de evidence ou limitação ambiental.
 */
export type FinalGateStatus = "PASS" | "FAIL" | "BLOQUEADO";

/**
 * Comando individual da bateria final de RNF42.
 *
 * A separação entre comandos obrigatórios e opcionais evita que um bloqueio
 * ambiental de Playwright seja confundido com uma falha de build ou testes unitários.
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
 * Resultado observado depois de executar um comando da bateria final.
 *
 * Os outputs já entram sanitizados para poderem ser escritos em evidence técnica
 * sem expor cookies, tokens, passwords, secrets ou logs extensos.
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
 * O gate final só pode executar a bateria completa quando o inventário anterior
 * existe e não indica lacunas P0 antes da execução final.
 */
export type InventoryEvidenceCheck = {
    path: string;
    status: FinalGateStatus;
    observed: string;
};

/**
 * Evidence estruturada produzida pelo BK-MF8-16.
 *
 * Este contrato é consumido pelo renderer Markdown e pelo exit code do CLI.
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
 * Em produção usa `spawnSync`; nos testes permite simular falhas sem correr npm,
 * bash, Vite, NestJS ou Playwright.
 */
export type CommandRunner = (
    command: string,
    args: string[],
    options: { cwd: string; encoding: "utf8"; timeout: number },
) => Pick<SpawnSyncReturns<string>, "status" | "stdout" | "stderr" | "error">;

const MF8_INVENTORY_EVIDENCE_PATH = "docs/evidence/MF8/TESTES-EM-FALTA.md";

/**
 * Runner real usado pela CLI para executar processos locais.
 *
 * @param command Comando base a executar.
 * @param args Argumentos do comando.
 * @param options Diretoria, encoding e timeout do processo filho.
 * @returns Resultado bruto devolvido por `spawnSync`.
 */
export const nodeCommandRunner: CommandRunner = (command, args, options) => {
    return spawnSync(command, args, options);
};

/**
 * Resolve a raiz do repositório a partir da pasta `real_dev/api`.
 *
 * @param cwd Diretoria atual usada pelo comando npm.
 * @returns Caminho absoluto para a raiz do repositório StudyFlow.
 */
export function resolveRepoRoot(cwd = process.cwd()): string {
    const currentDirIsRealApi = existsSync(resolve(cwd, "src")) && existsSync(resolve(cwd, "package.json"));

    // O script é executado a partir de real_dev/api; subir duas pastas chega à raiz do repositório.
    return currentDirIsRealApi ? resolve(cwd, "../..") : cwd;
}

/**
 * Cria a bateria final de comandos reais do `real_dev`.
 *
 * @param repoRoot Raiz do repositório StudyFlow.
 * @returns Lista ordenada de comandos a executar para RNF42.
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
            args: ["--prefix", "real_dev/api", "run", "test:unit"],
            required: true,
            timeoutMs: 180_000,
            expected: "A suite Jest da API termina com exit code 0.",
        },
        {
            id: "api-build",
            name: "Build da API",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "real_dev/api", "run", "build"],
            required: true,
            timeoutMs: 120_000,
            expected: "O build NestJS compila sem erros TypeScript.",
        },
        {
            id: "web-build",
            name: "Build da web",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "real_dev/web", "run", "build"],
            required: true,
            timeoutMs: 120_000,
            expected: "O build Vite/TypeScript compila sem erros.",
        },
        {
            id: "web-e2e",
            name: "E2E Playwright da web",
            cwd: repoRoot,
            command: "npm",
            args: ["--prefix", "real_dev/web", "run", "test:e2e"],
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
 * @returns Linha textual do comando executado.
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
        .replace(/\u001b\[[0-9;]*m/g, "")
        .replace(/(authorization|cookie|token|password|secret)=\S+/gi, "$1=[removido]")
        .replace(/(Bearer)\s+\S+/gi, "$1 [removido]")
        .replace(/[ \t]+$/gm, "");

    // A evidence deve provar o resultado sem copiar logs enormes ou dados potencialmente sensíveis.
    if (redacted.length <= maxLength) {
        return redacted;
    }

    const halfLength = Math.floor(maxLength / 2);
    return [
        redacted.slice(0, halfLength),
        "\n...[output truncado: inicio e fim preservados]...\n",
        redacted.slice(-halfLength),
    ].join("");
}

/**
 * Converte paths absolutos locais para paths partilháveis dentro do repositório.
 *
 * @param value Path observado durante a execução local.
 * @returns Path relativo seguro para evidence quando possível.
 */
export function sanitizeEvidencePath(value: string): string {
    const normalizedPath = value.replace(/\\/g, "/");
    const repoPathStart = normalizedPath.indexOf("docs/evidence/");

    // A evidence de defesa não deve expor username, diretoria local ou estrutura privada da máquina.
    return repoPathStart === -1 ? normalizedPath : normalizedPath.slice(repoPathStart);
}

/**
 * Confirma se a evidence criada no BK-MF8-15 permite avançar.
 *
 * @param repoRoot Raiz do repositório StudyFlow.
 * @returns Estado da evidence de entrada do gate final.
 */
export function validateInventoryEvidence(repoRoot: string): InventoryEvidenceCheck {
    const evidencePath = resolve(repoRoot, MF8_INVENTORY_EVIDENCE_PATH);

    if (!existsSync(evidencePath)) {
        return {
            path: evidencePath,
            status: "BLOQUEADO",
            observed: "A evidence do BK-MF8-15 ainda não existe.",
        };
    }

    const content = readFileSync(evidencePath, "utf8");
    const hasBlockingDecision = /N[aã]o avances para a execu[cç][aã]o final/i.test(content);

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
    const observed = hasPassed
        ? "Comando terminou com exit code 0."
        : testCommand.required
          ? `Comando obrigatório terminou sem sucesso.${rawError}`
          : `Comando opcional terminou sem sucesso; fica registado para BK-MF8-17 sem bloquear a bateria obrigatória.${rawError}`;

    return {
        id: testCommand.id,
        name: testCommand.name,
        commandLine: formatCommandLine(testCommand.command, testCommand.args),
        required: testCommand.required,
        status,
        exitCode,
        expected: testCommand.expected,
        observed,
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
    const optionalIssues = evidence.commands.filter((result) => !result.required && result.status !== "PASS");
    const commandRows = evidence.commands.map((result) => {
        return `| ${result.required ? "Sim" : "Não"} | ${result.name} | ${result.status} | ${result.exitCode ?? "-"} | \`${result.commandLine}\` |`;
    });

    const outputBlocks = evidence.commands.flatMap((result) => [
        `### ${result.name}`,
        "",
        `- Expected: ${result.expected}`,
        `- Observed: ${result.observed}`,
        "",
        "#### Stdout",
        "",
        "```txt",
        result.stdout || "Sem stdout relevante.",
        "```",
        "",
        "#### Stderr",
        "",
        "```txt",
        result.stderr || "Sem stderr relevante.",
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
        optionalIssues.length > 0
            ? "- RISCO: há comando(s) opcional(is) sem PASS; encaminhar para BK-MF8-17 como erro ou bloqueio a revalidar."
            : "- RISCO: nenhum comando opcional ficou sem PASS.",
        "",
        "## Evidence de entrada",
        "",
        `- Ficheiro: ${sanitizeEvidencePath(evidence.inventory.path)}`,
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
 * @param repoRoot Raiz do repositório StudyFlow.
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

    // O runner cria a pasta de evidence para que a equipa não tenha de preparar a árvore manualmente.
    mkdirSync(dirname(evidencePath), { recursive: true });
    writeFileSync(evidencePath, markdown, "utf8");

    return evidence;
}

/**
 * Executa o gate final pela linha de comandos.
 *
 * @returns Nada; escreve o caminho da evidence e sinaliza falhas obrigatórias via `process.exitCode`.
 */
export function runMf8FinalTestsCli(): void {
    const evidence = createMf8FinalEvidence();
    process.stdout.write(`Evidence final escrita em ${evidence.evidencePath}\n`);

    if (hasBlockingFailure(evidence)) {
        process.exitCode = 1;
    }
}

const executedScriptPath = process.argv[1] ?? "";
const isDirectExecution =
    executedScriptPath.endsWith("run-mf8-final-tests.js") ||
    executedScriptPath.endsWith("run-mf8-final-tests.ts");

if (isDirectExecution) {
    runMf8FinalTestsCli();
}
