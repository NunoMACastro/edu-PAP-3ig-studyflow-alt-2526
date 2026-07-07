import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export type TestArea = "api" | "web-e2e";
export type TestPriority = "P0" | "P1";
export type InventoryStatus = "covered" | "missing-spec" | "missing-source";

/**
 * Alvo critico que deve ter ficheiro base e teste automatizado antes do fecho da MF8.
 */
export type CriticalTestTarget = {
    area: TestArea;
    module: string;
    sourcePath: string;
    expectedSpecPath: string;
    priority: TestPriority;
    reason: string;
};

/**
 * Resultado observado para um alvo critico do inventario.
 */
export type TestInventoryItem = CriticalTestTarget & {
    sourceExists: boolean;
    specExists: boolean;
    status: InventoryStatus;
};

/**
 * Resumo estruturado usado pelo CLI e pela evidence do BK-MF8-15.
 */
export type TestInventorySummary = {
    generatedAt: string;
    checkedRoot: string;
    totalTargets: number;
    coveredTargets: number;
    missingSpecs: number;
    missingSources: number;
    items: TestInventoryItem[];
};

export const mf8CriticalTestTargets: CriticalTestTarget[] = [
    {
        area: "api",
        module: "Ferramentas de estudo privadas",
        sourcePath: "real_dev/api/src/modules/ai/study-tools.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/ai/study-tools.service.spec.ts",
        priority: "P0",
        reason: "Garante artefactos de resumo, explicacao, flashcards e quizzes usados por RF12.",
    },
    {
        area: "api",
        module: "Validacao de artefactos IA",
        sourcePath: "real_dev/api/src/modules/ai/validators/ai-artifact.validator.ts",
        expectedSpecPath: "real_dev/api/src/modules/ai/validators/ai-artifact.validator.spec.ts",
        priority: "P0",
        reason: "Impede artefactos IA com conteudo invalido ou fontes desalinhadas.",
    },
    {
        area: "api",
        module: "Mini-testes oficiais",
        sourcePath: "real_dev/api/src/modules/official-tests/official-tests.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/official-tests/official-tests.service.spec.ts",
        priority: "P0",
        reason: "Suporta os fluxos oficiais de professor e aluno usados em MF8.",
    },
    {
        area: "api",
        module: "IA da sala",
        sourcePath: "real_dev/api/src/modules/study-rooms/room-ai.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts",
        priority: "P0",
        reason: "Protege contexto de sala, membership e respostas IA partilhadas.",
    },
    {
        area: "api",
        module: "Partilhas da sala",
        sourcePath: "real_dev/api/src/modules/study-rooms/room-shares.service.ts",
        expectedSpecPath: "real_dev/api/src/modules/study-rooms/room-shares.service.spec.ts",
        priority: "P0",
        reason: "Protege partilha read-only e fork privado preparados na MF8.",
    },
    {
        area: "api",
        module: "Inventario MF8",
        sourcePath: "real_dev/api/src/scripts/mf8-test-inventory.ts",
        expectedSpecPath: "real_dev/api/src/scripts/mf8-test-inventory.spec.ts",
        priority: "P0",
        reason: "Garante que o proprio inventario de RNF41 e testado.",
    },
    {
        area: "web-e2e",
        module: "Flashcards em exercicio",
        sourcePath: "real_dev/web/src/components/ai/FlashcardsPanel.tsx",
        expectedSpecPath: "real_dev/web/tests/e2e/mf8-flashcards.spec.ts",
        priority: "P0",
        reason: "Consome o handoff do BK-MF8-14 e valida o fluxo visual de flashcards.",
    },
    {
        area: "web-e2e",
        module: "Background jobs de estudo",
        sourcePath: "real_dev/web/tests/e2e/mf6-background-jobs.spec.ts",
        expectedSpecPath: "real_dev/web/tests/e2e/mf6-background-jobs.spec.ts",
        priority: "P1",
        reason: "Confirma que fluxos assincronos continuam cobertos antes dos testes finais.",
    },
];

/**
 * Converte caminhos para uma forma estavel em relatorios e testes.
 *
 * @param path Caminho devolvido pelo sistema operativo.
 * @returns Caminho com separador `/`, igual em macOS, Linux e Windows.
 */
export function toReportPath(path: string): string {
    return path.replaceAll("\\", "/");
}

/**
 * Le ficheiros de forma recursiva dentro de uma raiz controlada.
 *
 * @param rootDir Diretoria a ler.
 * @param repoRoot Raiz do repositorio usada para gerar caminhos relativos.
 * @returns Conjunto de caminhos relativos ao repositorio.
 */
export function collectProjectFiles(
    rootDir: string,
    repoRoot = resolve(process.cwd(), "../.."),
): Set<string> {
    const files = new Set<string>();

    if (!existsSync(rootDir)) {
        return files;
    }

    /**
     * Executa visit no script operacional de scripts operacionais, mantendo a evidência reproduzível e sem expor dados sensíveis.
     *
     * @param currentDir Valor de currentDir usado pela função para executar visit com dados explícitos.
     * @returns Resultado estruturado usado pelo script ou pela evidência técnica gerada.
     */
    const visit = (currentDir: string) => {
        for (const entry of readdirSync(currentDir)) {
            const absolutePath = join(currentDir, entry);
            const stats = statSync(absolutePath);

            if (stats.isDirectory()) {
                // Pastas geradas nao representam cobertura escrita ou mantida pela equipa.
                if (["dist", "node_modules", "coverage", "test-results", "playwright-report"].includes(entry)) {
                    continue;
                }

                visit(absolutePath);
                continue;
            }

            files.add(toReportPath(relative(repoRoot, absolutePath)));
        }
    };

    visit(rootDir);
    return files;
}

/**
 * Junta conjuntos de ficheiros sem perder entradas duplicadas.
 *
 * @param groups Conjuntos recolhidos de API e web.
 * @returns Conjunto unico de ficheiros do projeto.
 */
export function mergeFileSets(...groups: Set<string>[]): Set<string> {
    const merged = new Set<string>();

    for (const group of groups) {
        for (const file of group) {
            merged.add(file);
        }
    }

    return merged;
}

/**
 * Classifica cada alvo critico como coberto, sem teste ou sem ficheiro base.
 *
 * @param targets Alvos criticos definidos para RNF41.
 * @param existingFiles Ficheiros existentes na arvore de implementacao.
 * @returns Lista ordenada de resultados por alvo.
 */
export function checkTestCoverage(
    targets: CriticalTestTarget[],
    existingFiles: Set<string>,
): TestInventoryItem[] {
    return [...targets]
        .sort((a, b) => a.expectedSpecPath.localeCompare(b.expectedSpecPath))
        .map((target) => {
            const sourceExists = existingFiles.has(target.sourcePath);
            const specExists = existingFiles.has(target.expectedSpecPath);

            // A falta do ficheiro base e mais grave do que a falta da spec.
            const status: InventoryStatus = !sourceExists
                ? "missing-source"
                : specExists
                  ? "covered"
                  : "missing-spec";

            return {
                ...target,
                sourceExists,
                specExists,
                status,
            };
        });
}

/**
 * Devolve apenas alvos cujo ficheiro base existe, mas cuja spec esta em falta.
 *
 * @param targets Alvos criticos de qualidade.
 * @param existingFiles Ficheiros existentes na arvore de implementacao.
 * @returns Alvos com teste em falta e fonte existente.
 */
export function findMissingCriticalTests(
    targets: CriticalTestTarget[],
    existingFiles: Set<string>,
): CriticalTestTarget[] {
    return checkTestCoverage(targets, existingFiles)
        .filter((item) => item.status === "missing-spec")
        .map(({ sourceExists, specExists, status, ...target }) => target);
}

/**
 * Cria um resumo completo para evidence e para o handoff do BK-MF8-16.
 *
 * @param repoRoot Raiz do repositorio StudyFlow.
 * @param generatedAt Data textual da execucao.
 * @returns Resumo com contadores e lista de alvos.
 */
export function createMf8TestInventory(
    repoRoot = resolve(process.cwd(), "../.."),
    generatedAt = new Date().toISOString(),
): TestInventorySummary {
    const apiFiles = collectProjectFiles(resolve(repoRoot, "real_dev/api/src"), repoRoot);
    const webFiles = collectProjectFiles(resolve(repoRoot, "real_dev/web"), repoRoot);
    const existingFiles = mergeFileSets(apiFiles, webFiles);
    const items = checkTestCoverage(mf8CriticalTestTargets, existingFiles);

    return {
        generatedAt,
        checkedRoot: "real_dev",
        totalTargets: items.length,
        coveredTargets: items.filter((item) => item.status === "covered").length,
        missingSpecs: items.filter((item) => item.status === "missing-spec").length,
        missingSources: items.filter((item) => item.status === "missing-source").length,
        items,
    };
}

/**
 * Renderiza evidence em Markdown para leitura humana.
 *
 * @param summary Resumo produzido pelo inventario.
 * @returns Markdown pronto para gravar em `docs/evidence/MF8/TESTES-EM-FALTA.md`.
 */
export function renderInventoryMarkdown(summary: TestInventorySummary): string {
    const rows = summary.items.map((item) => {
        return `| ${item.priority} | ${item.area} | ${item.module} | ${item.status} | ${item.expectedSpecPath} | ${item.reason} |`;
    });

    return [
        "# TESTES-EM-FALTA - MF8",
        "",
        "## Resultado automatico",
        "",
        `- Gerado em: ${summary.generatedAt}`,
        `- Raiz analisada: ${summary.checkedRoot}`,
        `- Alvos criticos: ${summary.totalTargets}`,
        `- Alvos cobertos: ${summary.coveredTargets}`,
        `- Testes em falta: ${summary.missingSpecs}`,
        `- Ficheiros base em falta: ${summary.missingSources}`,
        "",
        "## Tabela de cobertura",
        "",
        "| Prioridade | Area | Modulo | Estado | Teste esperado | Razao |",
        "| --- | --- | --- | --- | --- | --- |",
        ...rows,
        "",
        "## Decisao para BK-MF8-16",
        "",
        summary.missingSpecs === 0 && summary.missingSources === 0
            ? "- Pode avancar para a execucao final, mantendo esta evidence no PR."
            : "- Nao avances para a execucao final sem corrigir ou justificar as lacunas P0.",
        "",
    ].join("\n");
}

/**
 * Executa o inventario pela linha de comandos.
 *
 * @returns Nada; escreve Markdown em stdout e assinala exit code 1 quando ha lacunas P0.
 */
export function runMf8TestInventoryCli(): void {
    const summary = createMf8TestInventory();
    const markdown = renderInventoryMarkdown(summary);

    process.stdout.write(markdown);

    if (summary.items.some((item) => item.priority === "P0" && item.status !== "covered")) {
        process.exitCode = 1;
    }
}

const executedScriptPath = process.argv[1] ?? "";
const isDirectExecution =
    executedScriptPath.endsWith("mf8-test-inventory.js") ||
    executedScriptPath.endsWith("mf8-test-inventory.ts");

if (isDirectExecution) {
    runMf8TestInventoryCli();
}
