// apps/api/src/scripts/mf8-test-inventory.ts
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export type TestArea = "api" | "web-e2e";
export type TestPriority = "P0" | "P1";
export type InventoryStatus = "covered" | "missing-spec" | "missing-source";

export type CriticalTestTarget = {
    area: TestArea;
    module: string;
    sourcePath: string;
    expectedSpecPath: string;
    priority: TestPriority;
    reason: string;
};

export type TestInventoryItem = CriticalTestTarget & {
    sourceExists: boolean;
    specExists: boolean;
    status: InventoryStatus;
};

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
        sourcePath: "apps/api/src/modules/ai/study-tools.service.ts",
        expectedSpecPath: "apps/api/src/modules/ai/study-tools.service.spec.ts",
        priority: "P0",
        reason: "Garante artefactos de resumo, explicação, flashcards e quizzes usados por RF12.",
    },
    {
        area: "api",
        module: "Validação de artefactos IA",
        sourcePath: "apps/api/src/modules/ai/validators/ai-artifact.validator.ts",
        expectedSpecPath: "apps/api/src/modules/ai/validators/ai-artifact.validator.spec.ts",
        priority: "P0",
        reason: "Impede artefactos IA com conteúdo inválido ou fontes desalinhadas.",
    },
    {
        area: "api",
        module: "Mini-testes oficiais",
        sourcePath: "apps/api/src/modules/official-tests/official-tests.service.ts",
        expectedSpecPath: "apps/api/src/modules/official-tests/official-tests.service.spec.ts",
        priority: "P0",
        reason: "Suporta os fluxos oficiais de professor e aluno usados em MF8.",
    },
    {
        area: "api",
        module: "IA da sala",
        sourcePath: "apps/api/src/modules/study-rooms/room-ai.service.ts",
        expectedSpecPath: "apps/api/src/modules/study-rooms/room-ai.service.spec.ts",
        priority: "P0",
        reason: "Protege contexto de sala, membership e respostas IA partilhadas.",
    },
    {
        area: "api",
        module: "Partilhas da sala",
        sourcePath: "apps/api/src/modules/study-rooms/room-shares.service.ts",
        expectedSpecPath: "apps/api/src/modules/study-rooms/room-shares.service.spec.ts",
        priority: "P0",
        reason: "Protege partilha read-only e fork privado preparados na MF8.",
    },
    {
        area: "api",
        module: "Inventário MF8",
        sourcePath: "apps/api/src/scripts/mf8-test-inventory.ts",
        expectedSpecPath: "apps/api/src/scripts/mf8-test-inventory.spec.ts",
        priority: "P0",
        reason: "Garante que o próprio inventário de RNF41 é testado.",
    },
    {
        area: "web-e2e",
        module: "Flashcards em exercício",
        sourcePath: "apps/web/src/components/ai/FlashcardsPanel.tsx",
        expectedSpecPath: "apps/web/tests/e2e/mf8-flashcards.spec.ts",
        priority: "P0",
        reason: "Consome o handoff do BK-MF8-14 e valida o fluxo visual de flashcards.",
    },
    {
        area: "web-e2e",
        module: "Background jobs de estudo",
        sourcePath: "apps/web/tests/e2e/mf6-background-jobs.spec.ts",
        expectedSpecPath: "apps/web/tests/e2e/mf6-background-jobs.spec.ts",
        priority: "P1",
        reason: "Confirma que fluxos assíncronos continuam cobertos antes dos testes finais.",
    },
];

/**
 * Converte caminhos para uma forma estável em relatórios e testes.
 *
 * @param path Caminho devolvido pelo sistema operativo.
 * @returns Caminho com separador `/`, igual em macOS, Linux e Windows.
 */
export function toReportPath(path: string): string {
    return path.replaceAll("\\", "/");
}

/**
 * Lê ficheiros de forma recursiva dentro de uma raiz controlada.
 *
 * @param rootDir Diretoria a ler.
 * @param repoRoot Raiz do repositório usada para gerar caminhos públicos `apps/...`.
 * @returns Conjunto de caminhos relativos ao repositório.
 */
export function collectProjectFiles(
    rootDir: string,
    repoRoot = resolve(process.cwd(), "../.."),
): Set<string> {
    const files = new Set<string>();

    if (!existsSync(rootDir)) {
        return files;
    }

    const visit = (currentDir: string) => {
        for (const entry of readdirSync(currentDir)) {
            const absolutePath = join(currentDir, entry);
            const stats = statSync(absolutePath);

            if (stats.isDirectory()) {
                // Estas pastas são output de ferramentas e não representam cobertura escrita pelos alunos.
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
 * @returns Conjunto único de ficheiros do projeto.
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
 * Classifica cada alvo crítico como coberto, sem teste ou sem ficheiro base.
 *
 * @param targets Alvos críticos definidos para RNF41.
 * @param existingFiles Ficheiros existentes na árvore pública.
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

            // A falta do ficheiro base é mais grave do que a falta do teste, porque quebra o contrato anterior.
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
 * Devolve apenas alvos que ainda precisam de teste.
 *
 * @param targets Alvos críticos de qualidade.
 * @param existingFiles Ficheiros existentes na árvore pública.
 * @returns Alvos cujo ficheiro base existe, mas cuja spec ainda falta.
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
 * Cria um resumo completo para evidence e para o BK-MF8-16.
 *
 * @param repoRoot Raiz pública do projeto.
 * @param generatedAt Data textual da execução.
 * @returns Resumo com contadores e lista de alvos.
 */
export function createMf8TestInventory(
    repoRoot = resolve(process.cwd(), "../.."),
    generatedAt = new Date().toISOString(),
): TestInventorySummary {
    const apiFiles = collectProjectFiles(resolve(repoRoot, "apps/api/src"), repoRoot);
    const webFiles = collectProjectFiles(resolve(repoRoot, "apps/web"), repoRoot);
    const existingFiles = mergeFileSets(apiFiles, webFiles);
    const items = checkTestCoverage(mf8CriticalTestTargets, existingFiles);

    return {
        generatedAt,
        checkedRoot: toReportPath(repoRoot),
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
 * @param summary Resumo produzido pelo inventário.
 * @returns Markdown pronto a colar no ficheiro de evidence.
 */
export function renderInventoryMarkdown(summary: TestInventorySummary): string {
    const rows = summary.items.map((item) => {
        return `| ${item.priority} | ${item.area} | ${item.module} | ${item.status} | ${item.expectedSpecPath} | ${item.reason} |`;
    });

    return [
        "# TESTES-EM-FALTA - MF8",
        "",
        "## Resultado automático",
        "",
        `- Gerado em: ${summary.generatedAt}`,
        `- Raiz analisada: ${summary.checkedRoot}`,
        `- Alvos críticos: ${summary.totalTargets}`,
        `- Alvos cobertos: ${summary.coveredTargets}`,
        `- Testes em falta: ${summary.missingSpecs}`,
        `- Ficheiros base em falta: ${summary.missingSources}`,
        "",
        "## Tabela de cobertura",
        "",
        "| Prioridade | Área | Módulo | Estado | Teste esperado | Razão |",
        "| --- | --- | --- | --- | --- | --- |",
        ...rows,
        "",
        "## Decisão para BK-MF8-16",
        "",
        summary.missingSpecs === 0 && summary.missingSources === 0
            ? "- Pode avançar para a execução final, mantendo esta evidence no PR."
            : "- Não avances para a execução final sem corrigir ou justificar as lacunas P0.",
        "",
    ].join("\n");
}

/**
 * Executa o inventário pela linha de comandos.
 */
export function runMf8TestInventoryCli(): void {
    const summary = createMf8TestInventory();
    const markdown = renderInventoryMarkdown(summary);

    // A saída vai para stdout para o aluno conseguir redirecionar para docs/evidence sem dependências novas.
    process.stdout.write(markdown);

    if (summary.items.some((item) => item.priority === "P0" && item.status !== "covered")) {
        process.exitCode = 1;
    }
}

const entrypoint = process.argv[1] ?? "";

if (entrypoint.endsWith("mf8-test-inventory.js") || entrypoint.endsWith("mf8-test-inventory.ts")) {
    runMf8TestInventoryCli();
}