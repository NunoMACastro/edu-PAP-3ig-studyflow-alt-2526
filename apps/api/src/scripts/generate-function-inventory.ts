/**
 * Generates a deterministic AST inventory for production TypeScript sources.
 *
 * The generated document deliberately does not embed the implementation hash:
 * it is itself part of `real_dev` and doing so would create a circular hash.
 * The external remediation ledger binds the checked artefact to the manifest.
 */
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import ts from "typescript";

export type FunctionInventoryEntry = {
    area: "API" | "WEB";
    file: string;
    line: number;
    name: string;
    kind: "function" | "method" | "arrow" | "function-expression";
    async: boolean;
    exported: boolean;
    parameters: number;
};

// npm scripts execute with `real_dev/api` as cwd, including when called with
// `npm --prefix`; this avoids import.meta incompatibilities in the Jest runner.
const implementationRoot = resolve(process.cwd(), "..");
const outputPath = resolve(implementationRoot, "docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md");
const ignoredNamePattern = /(?:\.spec|\.test|\.d)\.tsx?$/;

/** Converts an OS-specific path to the stable POSIX form used in evidence. */
function portablePath(path: string): string {
    return path.split(sep).join("/");
}

/** Returns whether a declaration has an explicit `export` modifier. */
function isExported(node: ts.Node): boolean {
    return Boolean(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export);
}

/** Returns whether a declaration has an explicit `async` modifier. */
function isAsync(node: ts.Node): boolean {
    return Boolean(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Async);
}

/** Resolves a readable property/method name without evaluating computed code. */
function declarationName(name: ts.PropertyName | ts.BindingName | undefined): string {
    if (!name) return "<anonymous>";
    if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
    if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
    return name.getText();
}

/** Finds the nearest class name so method names remain unambiguous. */
function enclosingClassName(node: ts.Node): string | undefined {
    let parent = node.parent;
    while (parent) {
        if (ts.isClassDeclaration(parent) || ts.isClassExpression(parent)) {
            return parent.name?.text ?? "<anonymous-class>";
        }
        parent = parent.parent;
    }
    return undefined;
}

/**
 * Extracts function-like declarations from one TypeScript source using the
 * compiler AST. Comments and string examples therefore cannot inflate counts.
 */
export function collectFileEntries(
    file: string,
    content: string,
    area: "API" | "WEB",
): FunctionInventoryEntry[] {
    const source = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const entries: FunctionInventoryEntry[] = [];

    const add = (
        node: ts.FunctionLikeDeclaration,
        name: string,
        kind: FunctionInventoryEntry["kind"],
        exported = isExported(node),
    ): void => {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        entries.push({
            area,
            file,
            line: line + 1,
            name,
            kind,
            async: isAsync(node),
            exported,
            parameters: node.parameters.length,
        });
    };

    const visit = (node: ts.Node): void => {
        if (ts.isFunctionDeclaration(node) && node.body) {
            add(node, node.name?.text ?? "<anonymous>", "function");
        } else if (ts.isMethodDeclaration(node) && node.body) {
            const owner = enclosingClassName(node);
            const name = declarationName(node.name);
            add(node, owner ? `${owner}.${name}` : name, "method");
        } else if (ts.isVariableDeclaration(node) && node.initializer) {
            if (ts.isArrowFunction(node.initializer)) {
                add(
                    node.initializer,
                    declarationName(node.name),
                    "arrow",
                    isExported(node.parent.parent),
                );
            } else if (ts.isFunctionExpression(node.initializer)) {
                add(
                    node.initializer,
                    declarationName(node.name),
                    "function-expression",
                    isExported(node.parent.parent),
                );
            }
        } else if (ts.isPropertyDeclaration(node) && node.initializer) {
            if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
                const owner = enclosingClassName(node);
                const name = declarationName(node.name);
                add(
                    node.initializer,
                    owner ? `${owner}.${name}` : name,
                    ts.isArrowFunction(node.initializer) ? "arrow" : "function-expression",
                    isExported(node),
                );
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return entries;
}

/** Recursively lists production TS/TSX files in deterministic order. */
async function sourceFiles(root: string): Promise<string[]> {
    const found: string[] = [];
    const visit = async (path: string): Promise<void> => {
        for (const entry of await readdir(path, { withFileTypes: true })) {
            const child = resolve(path, entry.name);
            if (entry.isDirectory()) {
                await visit(child);
            } else if (
                entry.isFile() &&
                /\.tsx?$/.test(entry.name) &&
                !ignoredNamePattern.test(entry.name)
            ) {
                found.push(child);
            }
        }
    };
    await visit(root);
    return found.sort((left, right) => left.localeCompare(right));
}

/** Builds the complete API/web inventory from production sources. */
export async function buildFunctionInventory(): Promise<FunctionInventoryEntry[]> {
    const roots = [
        { area: "API" as const, root: resolve(implementationRoot, "api/src") },
        { area: "WEB" as const, root: resolve(implementationRoot, "web/src") },
    ];
    const inventory: FunctionInventoryEntry[] = [];
    for (const sourceRoot of roots) {
        for (const path of await sourceFiles(sourceRoot.root)) {
            const file = portablePath(relative(implementationRoot, path));
            inventory.push(...collectFileEntries(file, await readFile(path, "utf8"), sourceRoot.area));
        }
    }
    return inventory.sort((left, right) =>
        left.file.localeCompare(right.file) || left.line - right.line || left.name.localeCompare(right.name),
    );
}

/** Escapes Markdown table delimiters in source-derived names. */
function markdownCell(value: string): string {
    return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

/** Renders the inventory and its reproducible statistical summary. */
export function renderFunctionInventory(entries: FunctionInventoryEntry[]): string {
    const api = entries.filter((entry) => entry.area === "API").length;
    const web = entries.length - api;
    const exported = entries.filter((entry) => entry.exported).length;
    const asyncCount = entries.filter((entry) => entry.async).length;
    const rows = entries.map(
        (entry) =>
            `| ${entry.area} | \`${markdownCell(entry.file)}:${entry.line}\` | \`${markdownCell(entry.name)}\` | ${entry.kind} | ${entry.async ? "sim" : "não"} | ${entry.exported ? "sim" : "não"} | ${entry.parameters} |`,
    );
    return `# StudyFlow — inventário AST de funções

\`\`\`yaml
generator: real_dev/api/src/scripts/generate-function-inventory.ts
manifest_binding: external_ledger
source_scope: real_dev/api/src + real_dev/web/src
tests_excluded: true
\`\`\`

Este artefacto é gerado pelo AST TypeScript. Não inclui funções encontradas apenas em
comentários, snippets Markdown, testes, builds ou dependências. O SHA-256 que valida esta versão
fica no ledger externo, porque incluir o hash dentro de \`real_dev\` criaria uma referência
circular.

## Resumo

| Métrica | Total |
| --- | ---: |
| Funções/métodos de produção | ${entries.length} |
| API | ${api} |
| Web | ${web} |
| Exportadas | ${exported} |
| Assíncronas | ${asyncCount} |

## Inventário

| Área | Ficheiro:linha | Nome qualificado | Tipo AST | Async | Exportada | Parâmetros |
| --- | --- | --- | --- | --- | --- | ---: |
${rows.join("\n")}
`;
}

/** CLI fail-closed: `--write` updates, while `--check` compares byte-for-byte. */
async function main(): Promise<void> {
    const mode = process.argv[2];
    if (mode !== "--write" && mode !== "--check") {
        throw new Error("Uso: generate-function-inventory --write|--check");
    }
    const expected = renderFunctionInventory(await buildFunctionInventory());
    if (mode === "--write") {
        await writeFile(outputPath, expected, { encoding: "utf8", mode: 0o600 });
        console.log("function-inventory: WRITE");
        return;
    }
    try {
        await access(outputPath);
    } catch {
        throw new Error("Inventário AST ausente; executa function-inventory:write.");
    }
    const actual = await readFile(outputPath, "utf8");
    if (actual !== expected) {
        throw new Error("Inventário AST desatualizado; executa function-inventory:write.");
    }
    console.log("function-inventory: PASS");
}

if (/generate-function-inventory\.(?:js|ts)$/.test(process.argv[1] ?? "")) {
    void main();
}
