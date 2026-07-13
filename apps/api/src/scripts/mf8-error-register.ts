import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import {
    assertLegacyMf8EvidenceOptIn,
    legacyMf8EvidencePath,
    legacyMf8FrontMatter,
} from "./legacy-mf8-evidence.js";

export const MF8_FINAL_EVIDENCE_PATH = legacyMf8EvidencePath(
    "TESTES-FINAIS.md",
);
export const MF8_CORRECTION_EVIDENCE_PATH = legacyMf8EvidencePath(
    "CORRECAO-ERROS.md",
);

export type Mf8EvidenceStatus = "PASS" | "FAIL" | "BLOQUEADO";
export type Mf8ErrorStatus = "OPEN" | "FIXED" | "RETESTED" | "BLOCKED";
export type Mf8ErrorSource = "api" | "web" | "docs" | "manual";

export type Mf8FinalTestRow = {
    command: string;
    status: Mf8EvidenceStatus;
    observed: string;
};

export type Mf8ErrorRecord = {
    id: string;
    source: Mf8ErrorSource;
    command: string;
    observed: string;
    cause: string;
    fix: string;
    validation: string;
    status: Mf8ErrorStatus;
    privacyNote: string;
};

export type Mf8CorrectionRegister = {
    generatedAt: string;
    sourceEvidencePath: string;
    outputPath: string;
    records: Mf8ErrorRecord[];
    decision: "PASS" | "BLOCKED";
};

export type RunMf8ErrorRegisterOptions = {
    repoRoot?: string;
    now?: Date;
};

/**
 * Confirma se um erro pode ser fechado na evidence final.
 *
 * @param record Registo de erro preenchido depois da correção.
 * @returns Verdadeiro apenas quando a correção foi revalidada com dados mínimos.
 */
export function canCloseMf8Error(record: Mf8ErrorRecord): boolean {
    if (record.status !== "RETESTED") {
        return false;
    }

    const requiredValues = [
        record.id,
        record.command,
        record.cause,
        record.fix,
        record.validation,
        record.privacyNote,
    ];

    // Um erro só fecha quando há causa, correção e validação, não apenas uma tentativa.
    return requiredValues.every((value) => value.trim().length > 0);
}

/**
 * Extrai linhas de comandos observados a partir de uma tabela Markdown.
 *
 * @param markdown Conteúdo de `TESTES-FINAIS.md`.
 * @returns Linhas com comando, estado e observação sanitizada.
 */
export function extractFinalTestRows(markdown: string): Mf8FinalTestRow[] {
    return markdown
        .split("\n")
        .filter((line) => line.trim().startsWith("|"))
        .map(splitMarkdownTableRow)
        .filter((cells) => cells.length >= 3)
        .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)))
        .map(toFinalTestRow)
        .filter((row): row is Mf8FinalTestRow => row !== null);
}

/**
 * Constrói o registo inicial de correções a partir dos testes finais.
 *
 * @param rows Linhas extraídas da evidence final.
 * @param now Data usada para tornar a saída previsível em testes.
 * @returns Registo com erros abertos ou bloqueados.
 */
export function buildCorrectionRegister(
    rows: Mf8FinalTestRow[],
    now: Date,
): Mf8CorrectionRegister {
    const records = rows
        .filter((row) => row.status !== "PASS")
        .map((row, index) => buildErrorRecord(row, index));

    return {
        generatedAt: now.toISOString(),
        sourceEvidencePath: MF8_FINAL_EVIDENCE_PATH,
        outputPath: MF8_CORRECTION_EVIDENCE_PATH,
        records,
        decision: records.every(canCloseMf8Error) ? "PASS" : "BLOCKED",
    };
}

/**
 * Renderiza a evidence de correção sem expor dados privados.
 *
 * @param register Registo de erros e decisão final.
 * @returns Markdown pronto para `CORRECAO-ERROS.md`.
 */
export function renderCorrectionRegisterMarkdown(
    register: Mf8CorrectionRegister,
): string {
    const lines = [
        "# CORRECAO-ERROS - MF8 (historico)",
        "",
        ...legacyMf8FrontMatter(),
        "",
        "Este registo reproduz apenas a correcao MF8 anterior ao manifesto final.",
        "Nao declara PASS, aptidao local ou prontidao para producao.",
        "",
        "## Origem",
        `- Evidence de entrada: \`${register.sourceEvidencePath}\``,
        `- Gerado em: \`${register.generatedAt}\``,
        "",
        "## Decisão final",
        register.decision === "PASS"
            ? "- PASS_HISTORICO: os erros daquele snapshot foram revalidados ou nao existiam linhas em falha."
            : "- BLOQUEADO_HISTORICO: existem erros abertos, bloqueados ou sem revalidacao naquele snapshot.",
        "",
        "## Registos",
    ];

    if (register.records.length === 0) {
        lines.push(
            "",
            "- Nenhum comando do snapshot historico ficou em `FAIL` ou `BLOQUEADO`; consultar o ledger para o estado atual.",
        );
        return `${lines.join("\n")}\n`;
    }

    lines.push(
        "",
        "| id | origem | estado | comando | causa | correção | validação | privacidade |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    );

    for (const record of register.records) {
        // A tabela evita guardar outputs completos e mantém a defesa focada em decisões verificáveis.
        lines.push(
            [
                record.id,
                record.source,
                record.status,
                record.command,
                record.cause,
                record.fix || "Registar a correção aplicada antes da revalidação.",
                record.validation || "Reexecutar o comando afetado e registar o observed result.",
                record.privacyNote,
            ]
                .map(escapeMarkdownCell)
                .join(" | ")
                .replace(/^/, "| ")
                .replace(/$/, " |"),
        );
    }

    return `${lines.join("\n")}\n`;
}

/**
 * Executa o fluxo local do BK-MF8-17.
 *
 * @param options Raiz do repositório e data controlável para testes.
 * @returns Registo criado a partir da evidence final.
 */
export async function runMf8ErrorRegister(
    options: RunMf8ErrorRegisterOptions = {},
): Promise<Mf8CorrectionRegister> {
    assertLegacyMf8EvidenceOptIn();
    const repoRoot = options.repoRoot ?? resolve(process.cwd(), "../..");
    const finalEvidencePath = resolve(repoRoot, MF8_FINAL_EVIDENCE_PATH);
    const outputPath = resolve(repoRoot, MF8_CORRECTION_EVIDENCE_PATH);
    const markdown = await readFile(finalEvidencePath, "utf8");
    const rows = extractFinalTestRows(markdown);
    const register = buildCorrectionRegister(rows, options.now ?? new Date());

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderCorrectionRegisterMarkdown(register), "utf8");

    return register;
}

/**
 * Divide split markdown table row no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param line Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function splitMarkdownTableRow(line: string): string[] {
    return line
        .split("|")
        .slice(1, -1)
        .map((cell) => stripMarkdown(cell));
}

/**
 * Limpa strip markdown no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function stripMarkdown(value: string): string {
    return value.replace(/`/g, "").replace(/\*\*/g, "").trim();
}

/**
 * Transforma to final test row no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param cells Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.
 * @returns Contrato público pronto para a UI, sem campos internos de persistência.
 */
function toFinalTestRow(cells: string[]): Mf8FinalTestRow | null {
    const statusIndex = cells.findIndex((cell) => isEvidenceStatus(cell));
    if (statusIndex === -1) {
        return null;
    }

    const command = resolveCommandCell(cells, statusIndex);
    if (!command) {
        return null;
    }

    return {
        command,
        status: cells[statusIndex].toUpperCase() as Mf8EvidenceStatus,
        observed: sanitizeEvidenceText(resolveObservedCell(cells, statusIndex)),
    };
}

/**
 * Resolve resolve command cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param cells Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.
 * @param statusIndex Posição usada para relacionar itens derivados com a sua origem.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function resolveCommandCell(cells: string[], statusIndex: number): string {
    const commandLine = cells[statusIndex + 2]?.trim();
    if (commandLine && commandLine !== "-") {
        return commandLine;
    }

    return cells[0]?.trim() ?? "";
}

/**
 * Resolve resolve observed cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param cells Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.
 * @param statusIndex Posição usada para relacionar itens derivados com a sua origem.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function resolveObservedCell(cells: string[], statusIndex: number): string {
    const commandName = cells[statusIndex - 1]?.trim();
    const exitCode = cells[statusIndex + 1]?.trim();
    const commandLine = cells[statusIndex + 2]?.trim();

    if (commandName && exitCode && commandLine) {
        return `${commandName}; exit code ${exitCode}; linha executada ${commandLine}.`;
    }

    return cells.slice(statusIndex + 1).join(" | ") || "Sem observed result.";
}

/**
 * Avalia is evidence status no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Valor booleano que indica se a regra avaliada é verdadeira.
 */
function isEvidenceStatus(value: string): boolean {
    return ["PASS", "FAIL", "BLOQUEADO"].includes(value.toUpperCase());
}

/**
 * Constrói build error record no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param row Dados de tabela ou célula usados para reconstruir a evidência de forma determinística.
 * @param index Posição usada para relacionar itens derivados com a sua origem.
 * @returns Exceção estruturada pronta a ser lançada pelo service ou controller.
 */
function buildErrorRecord(row: Mf8FinalTestRow, index: number): Mf8ErrorRecord {
    const id = `MF8-ERR-${String(index + 1).padStart(2, "0")}`;
    const source = classifySource(row.command);
    const blocked = row.status === "BLOQUEADO";

    return {
        id,
        source,
        command: row.command,
        observed: row.observed,
        cause: blocked
            ? `Bloqueio observado no comando: ${row.observed}`
            : `Falha observada no comando: ${row.observed}`,
        fix: "",
        validation: "",
        status: blocked ? "BLOCKED" : "OPEN",
        privacyNote:
            "A evidence guarda apenas comando, estado e resumo sanitizado, sem dados sensíveis.",
    };
}

/**
 * Classifica classify source no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param command Valor de command usado pela função para executar classify source com dados explícitos.
 * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
 */
function classifySource(command: string): Mf8ErrorSource {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes("real_dev/web") || lowerCommand.includes("apps/web")) {
        return "web";
    }
    if (lowerCommand.includes("real_dev/api") || lowerCommand.includes("apps/api")) {
        return "api";
    }
    if (lowerCommand.includes("planificacao") || lowerCommand.includes("docs")) {
        return "docs";
    }
    return "manual";
}

/**
 * Sanitiza sanitize evidence text no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function sanitizeEvidenceText(value: string): string {
    return value
        .replace(/(authorization|cookie|token|password|secret)=\S+/gi, "$1=[removido]")
        .replace(/(Bearer)\s+\S+/gi, "$1 [removido]")
        .replace(/\/Users\/[^\s|)]+/g, "[path-local-removido]")
        .trim();
}

/**
 * Escapa escape markdown cell no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
 *
 * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
function escapeMarkdownCell(value: string): string {
    return value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

if (process.argv[1]?.endsWith("mf8-error-register.js")) {
    runMf8ErrorRegister()
        .then((register) => {
            console.log(
                JSON.stringify({
                    ok: register.decision === "PASS",
                    scope: "MF8_HISTORICO",
                    records: register.records.length,
                    decision: register.decision,
                    output: MF8_CORRECTION_EVIDENCE_PATH,
                }),
            );
            process.exitCode = register.decision === "PASS" ? 0 : 1;
        })
        .catch((error: Error) => {
            console.error(
                JSON.stringify({
                    ok: false,
                    scope: "MF8_HISTORICO",
                    error: error.message,
                }),
            );
            process.exitCode = 1;
        });
}
