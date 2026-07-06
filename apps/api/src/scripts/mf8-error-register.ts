// apps/api/src/scripts/mf8-error-register.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

export const MF8_FINAL_EVIDENCE_PATH = "docs/evidence/MF8/TESTES-FINAIS.md";
export const MF8_CORRECTION_EVIDENCE_PATH = "docs/evidence/MF8/CORRECAO-ERROS.md";

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
        "# CORRECAO-ERROS - MF8",
        "",
        "## Origem",
        `- Evidence de entrada: \`${register.sourceEvidencePath}\``,
        `- Gerado em: \`${register.generatedAt}\``,
        "",
        "## Decisão final",
        register.decision === "PASS"
            ? "- PASS: todos os erros registados estão revalidados."
            : "- BLOQUEADO: existem erros abertos, bloqueados ou sem revalidação.",
        "",
        "## Registos",
    ];

    if (register.records.length === 0) {
        lines.push("", "- Nenhum comando obrigatório ficou em `FAIL` ou `BLOQUEADO`.");
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

function splitMarkdownTableRow(line: string): string[] {
    return line
        .split("|")
        .slice(1, -1)
        .map((cell) => stripMarkdown(cell));
}

function stripMarkdown(value: string): string {
    return value.replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function toFinalTestRow(cells: string[]): Mf8FinalTestRow | null {
    const statusIndex = cells.findIndex((cell) => isEvidenceStatus(cell));
    if (statusIndex === -1) {
        return null;
    }

    const command = cells[0]?.trim();
    if (!command) {
        return null;
    }

    return {
        command,
        status: cells[statusIndex].toUpperCase() as Mf8EvidenceStatus,
        observed: cells.slice(statusIndex + 1).join(" | ") || "Sem observed result.",
    };
}

function isEvidenceStatus(value: string): boolean {
    return ["PASS", "FAIL", "BLOQUEADO"].includes(value.toUpperCase());
}

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

function classifySource(command: string): Mf8ErrorSource {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes("apps/web") || lowerCommand.includes("web")) {
        return "web";
    }
    if (lowerCommand.includes("apps/api") || lowerCommand.includes("api")) {
        return "api";
    }
    if (lowerCommand.includes("planificacao") || lowerCommand.includes("docs")) {
        return "docs";
    }
    return "manual";
}

function escapeMarkdownCell(value: string): string {
    return value.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

if (process.argv[1]?.endsWith("mf8-error-register.js")) {
    runMf8ErrorRegister()
        .then((register) => {
            console.log(
                `BK-MF8-17: ${register.records.length} erro(s) registado(s); decisão ${register.decision}.`,
            );
            process.exitCode = register.decision === "PASS" ? 0 : 1;
        })
        .catch((error: Error) => {
            console.error(`BK-MF8-17 bloqueado: ${error.message}`);
            process.exitCode = 1;
        });
}