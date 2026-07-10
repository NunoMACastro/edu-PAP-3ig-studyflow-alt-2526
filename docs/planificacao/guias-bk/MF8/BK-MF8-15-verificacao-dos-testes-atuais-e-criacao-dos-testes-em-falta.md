# BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta.

## Header

- `doc_id`: `GUIA-BK-MF8-15`
- `bk_id`: `BK-MF8-15`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `real_dev_status`: `IMPLEMENTADO_NAO_VALIDADO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-14`
- `rf_rnf`: `RNF41`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-16`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais transformar `RNF41` numa ferramenta concreta de qualidade: um inventário automático que verifica testes já existentes, identifica testes em falta e gera evidence curta antes da execução final.

O resultado observável fica em três pontos: um script em `apps/api/src/scripts/mf8-test-inventory.ts`, um teste unitário para esse script e um relatório de evidence em `docs/evidence/MF8/TESTES-EM-FALTA.md`. O próximo BK, `BK-MF8-16`, passa a saber exatamente que comandos deve executar e que lacunas ainda precisam de atenção.

#### Importância

`RNF41` é CANONICO e pertence à qualidade final do StudyFlow. Nesta fase, a aplicação já tem muitos módulos de aluno, professor, materiais, IA, salas, turmas e testes oficiais. Sem um inventário claro, a equipa pode chegar à defesa com funcionalidades implementadas, mas sem saber que partes estão realmente protegidas por testes.

Este BK também evita uma armadilha comum: confundir "existem alguns testes" com "as áreas críticas estão cobertas". O script não substitui a leitura do código nem a execução final; ele cria uma lista objetiva que separa testes presentes, testes em falta e ficheiros base que ainda não existem.

#### Scope-in

- Confirmar os metadados canónicos de `BK-MF8-15`: `RNF41`, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, sprint `S12`, dependência `BK-MF8-14` e próximo BK `BK-MF8-16`.
- Criar `apps/api/src/scripts/mf8-test-inventory.ts` com alvos críticos de API e web.
- Criar `apps/api/src/scripts/mf8-test-inventory.spec.ts` com testes de caso coberto, teste em falta e saída determinística.
- Editar a secção `scripts` de `apps/api/package.json` para expor `mf8:test-inventory`.
- Criar `docs/evidence/MF8/TESTES-EM-FALTA.md` com resultado observado, testes em falta e decisão de avanço.
- Preservar caminhos públicos `apps/api` e `apps/web` em todo o guia.
- Preparar `BK-MF8-16` para executar a bateria final com base numa lista verificável.

#### Scope-out

- Criar endpoint HTTP, controller, página React ou cliente API para este inventário.
- Alterar IDs, owners, prioridades, esforço, sprint, dependências, RF/RNF ou ordem dos BKs.
- Reescrever testes de módulos fora do inventário sem a evidência indicar falta concreta.
- Executar a bateria final completa; isso pertence ao `BK-MF8-16`.
- Corrigir erros encontrados na execução final; isso pertence ao `BK-MF8-17`.
- Guardar dados pessoais, conteúdo privado, respostas completas de IA, segredos de sessão ou materiais integrais em evidence.
- Adicionar dependências novas ao projeto.

#### Estado antes e depois

- Estado antes: `BK-MF8-14` deixa uma experiência de flashcards testável e indica que `BK-MF8-15` deve verificar testes atuais e criar testes em falta, mas ainda não existe um contrato executável para inventariar essa cobertura.
- Estado depois: `BK-MF8-15` deixa um script local com output determinístico, teste unitário próprio, comando no `package.json`, evidence de lacunas e handoff operacional para `BK-MF8-16`.

#### Pre-requisitos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `apps/api/package.json`
- `apps/api/jest.config.cjs`
- `apps/web/package.json`
- `apps/web/tests/e2e/README.md`

#### Glossário

- **Inventário de testes:** lista técnica que cruza ficheiros críticos com os testes que deveriam existir.
- **Alvo crítico:** módulo, script, componente ou fluxo que precisa de prova antes da defesa.
- **Spec:** ficheiro de teste automatizado, normalmente terminado em `.spec.ts` ou `.spec.tsx`.
- **Teste em falta:** alvo crítico cujo ficheiro base existe, mas cujo teste esperado ainda não existe.
- **Ficheiro base em falta:** alvo que o inventário esperava encontrar, mas que ainda não existe na árvore pública.
- **Evidence:** registo curto com comando, resultado observado, lacunas e decisão de avanço, sem dados pessoais ou privados.
- **Saída determinística:** resultado ordenado e estável, para que duas execuções equivalentes não produzam listas baralhadas.
- **Gate final:** conjunto de comandos que `BK-MF8-16` executa para provar que a aplicação está pronta para defesa.

#### Conceitos teóricos essenciais

- **Qualidade como contrato.** `RNF41` não pede uma funcionalidade visível ao aluno; pede uma garantia operacional. O inventário existe para transformar qualidade em prova observável.
- **Teste unitário.** Valida uma unidade pequena sem rede nem base de dados real. Aqui, testa se a função deteta corretamente specs presentes e em falta.
- **Teste E2E.** Valida comportamento no browser. O inventário não corre Playwright; apenas verifica se suites E2E esperadas existem para serem executadas no BK seguinte.
- **Manifesto de alvos críticos.** É uma lista explícita de módulos que a equipa considera obrigatórios para a defesa. Evita depender apenas de pesquisa automática, que pode ignorar fluxos importantes.
- **Discovery de ficheiros.** É a leitura controlada de `apps/api/src` e `apps/web/tests/e2e` para confirmar presença de ficheiros. Evita inventar cobertura.
- **Evidence segura.** A evidence deve mostrar comandos e estados, não dados privados. Isto protege alunos, professores, turmas, salas, materiais e respostas IA.
- **Handoff técnico.** O BK seguinte não deve adivinhar. Deve receber nome do comando, localização do relatório e significado dos estados.

#### Arquitetura do BK

- Requisito canónico: `RNF41`.
- Endpoint: nenhum.
- Backend/API: script local em `apps/api/src/scripts/mf8-test-inventory.ts`.
- Frontend/web: sem UI nova; o inventário verifica suites web em `apps/web/tests/e2e`.
- Comando: `cd apps/api && npm run mf8:test-inventory`.
- Evidence: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Testes: `apps/api/src/scripts/mf8-test-inventory.spec.ts`.
- Segurança: não lê base de dados, não chama provider externo, não acede a sessões reais e não imprime dados pessoais.
- Decisão CANONICO: `BK-MF8-15` entrega `RNF41` e prepara `BK-MF8-16`.
- Decisões DERIVADO:
  - usar script local sem dependência nova;
  - manter manifesto explícito de alvos críticos;
  - gerar relatório Markdown porque é fácil de anexar à defesa e ler em PR;
  - tratar UI apenas como suites E2E existentes, sem criar página nova.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/scripts/mf8-test-inventory.ts`
- CRIAR: `apps/api/src/scripts/mf8-test-inventory.spec.ts`
- EDITAR: `apps/api/package.json`
- CRIAR: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- REVER: `apps/api/src/modules/**/*.spec.ts`
- REVER: `apps/web/tests/e2e/*.spec.ts`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que `BK-MF8-15` entrega qualidade e cobertura de testes, sem criar UI, endpoint ou regra funcional nova.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: linhas de `RNF41`, `BK-MF8-15`, `S12`, dependência `BK-MF8-14` e próximo BK `BK-MF8-16`.

3. Instruções do que fazer.

Confirma estes factos antes de criares ficheiros:

- `CANONICO`: `RNF41` é "Verificação dos testes atuais e criação dos testes em falta".
- `CANONICO`: `BK-MF8-15` depende de `BK-MF8-14` e prepara `BK-MF8-16`.
- `DERIVADO`: o inventário é um script local porque não há requisito para uma página ou endpoint de qualidade.
- `DERIVADO`: a evidence fica em Markdown para ser legível na defesa.

Se algum metadado canónico estiver diferente, pára a correção e regista o conflito no relatório da MF8.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e evita que a equipa transforme um requisito de qualidade num módulo funcional novo.

5. Explicação do código.

Não há código porque o objetivo é fixar fronteiras. O ganho técnico está em impedir dois erros: criar UI sem contrato ou saltar diretamente para `BK-MF8-16` sem saber que testes faltam.

6. Validação do passo.

Resultado esperado: matriz, backlog, contrato de campos e guia mantêm `BK-MF8-15`, `RNF41`, `S12`, `BK-MF8-14` e `BK-MF8-16` alinhados.

7. Cenário negativo/erro esperado.

Se alguém propuser um endpoint como `/api/mf8/tests`, rejeita neste BK. Sem contrato canónico para endpoint, a decisão correta é manter o inventário como script local.

### Passo 2 - Criar o inventário automático

1. Objetivo funcional do passo no contexto da app.

Criar a unidade técnica que cruza alvos críticos com ficheiros existentes e devolve cobertura, testes em falta e ficheiros base em falta.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/mf8-test-inventory.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro completo abaixo. Mantém os caminhos públicos, não adiciona dependências e não faças leituras fora de `apps/api` e `apps/web`.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

Este ficheiro cria o contrato técnico central do BK. `mf8CriticalTestTargets` é o manifesto de alvos críticos: cada entrada diz que módulo precisa de teste, que spec deve existir e por que razão esse alvo entra no fecho da MF8.

`collectProjectFiles(...)` lê apenas a árvore pública de trabalho e ignora pastas geradas como `dist` e `node_modules`. Isto evita que o inventário conte ficheiros compilados como se fossem trabalho real do aluno.

`checkTestCoverage(...)` transforma o manifesto em estados observáveis: `covered`, `missing-spec` ou `missing-source`. Esta função é determinística porque ordena por `expectedSpecPath`, o que torna a evidence estável entre execuções.

`renderInventoryMarkdown(...)` gera o texto que vai para `docs/evidence/MF8/TESTES-EM-FALTA.md`. A saída mostra caminhos, estados e razões, mas não mostra dados pessoais, conteúdos privados ou resultados de alunos.

6. Validação do passo.

Resultado esperado depois de criares o ficheiro: o TypeScript compila quando executares `cd apps/api && npm run build`.

7. Cenário negativo/erro esperado.

Se removeres `apps/api/src/scripts/mf8-test-inventory.spec.ts`, o inventário deve marcar o alvo "Inventário MF8" como `missing-spec` e devolver exit code `1` quando o comando for executado.

### Passo 3 - Expor o comando no package.json

1. Objetivo funcional do passo no contexto da app.

Criar um comando oficial para o aluno e para o BK seguinte executarem o inventário sem adivinhar paths.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona `mf8:test-inventory` ao objeto `scripts`, mantendo os scripts existentes. Não removas `test`, `test:unit`, `build` nem scripts de smoke.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:e2e": "nest build && node dist/scripts/start-e2e-api.js",
    "seed:dev-users": "nest build && node dist/scripts/seed-development-users.js",
    "smoke:200-users": "node src/scripts/smoke-200-users.mjs",
    "smoke:runtime-instances": "node src/scripts/smoke-runtime-instances.mjs",
    "smoke:runtime-instances:local": "npm run build && node src/scripts/smoke-runtime-instances.mjs --local",
    "verify:tls": "node src/scripts/verify-tls-evidence.mjs",
    "backup:daily": "nest build && node dist/scripts/backup-database.js",
    "backup:daily:dry-run": "nest build && node dist/scripts/backup-database.js --dry-run",
    "mf8:test-inventory": "nest build && node dist/scripts/mf8-test-inventory.js",
    "test": "jest --config ./jest.config.cjs --passWithNoTests",
    "test:unit": "npm test"
  }
}
```

5. Explicação do código.

O comando compila primeiro a API com `nest build` e só depois executa `dist/scripts/mf8-test-inventory.js`. Isto evita correr TypeScript diretamente sem runtime configurado e mantém o padrão já usado pelos scripts de backup e arranque E2E.

O script fica no package da API porque o inventário é um artefacto de qualidade técnica e já precisa de Jest, Nest build e acesso aos paths de API. A web continua a ser analisada como ficheiros, sem criar comando novo em `apps/web/package.json`.

6. Validação do passo.

Executa `cd apps/api && npm run mf8:test-inventory`. Expected result: o comando imprime Markdown com tabela de cobertura. Se existir lacuna P0, o comando termina com exit code `1` para impedir avanço automático.

7. Cenário negativo/erro esperado.

Se o script for adicionado com nome diferente, `BK-MF8-16` não terá comando estável para consumir. O nome deve ser exatamente `mf8:test-inventory`.

### Passo 4 - Criar testes unitários do inventário

1. Objetivo funcional do passo no contexto da app.

Provar que o inventário distingue caso coberto, teste em falta e ficheiro base em falta.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/mf8-test-inventory.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele não precisa de rede, base de dados nem servidor. Usa conjuntos em memória para simular a árvore de ficheiros.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/mf8-test-inventory.spec.ts
import {
    checkTestCoverage,
    findMissingCriticalTests,
    renderInventoryMarkdown,
    type CriticalTestTarget,
    type TestInventorySummary,
} from "./mf8-test-inventory";

const targets: CriticalTestTarget[] = [
    {
        area: "api",
        module: "Módulo coberto",
        sourcePath: "apps/api/src/modules/covered/covered.service.ts",
        expectedSpecPath: "apps/api/src/modules/covered/covered.service.spec.ts",
        priority: "P0",
        reason: "Prova o estado coberto.",
    },
    {
        area: "api",
        module: "Módulo sem teste",
        sourcePath: "apps/api/src/modules/missing/missing.service.ts",
        expectedSpecPath: "apps/api/src/modules/missing/missing.service.spec.ts",
        priority: "P0",
        reason: "Prova a deteção de teste em falta.",
    },
    {
        area: "web-e2e",
        module: "Fluxo sem ficheiro base",
        sourcePath: "apps/web/src/pages/missing/MissingPage.tsx",
        expectedSpecPath: "apps/web/tests/e2e/missing-page.spec.ts",
        priority: "P1",
        reason: "Prova a deteção de ficheiro base em falta.",
    },
];

describe("mf8-test-inventory", () => {
    it("classifica alvos cobertos, sem teste e sem ficheiro base", () => {
        const existingFiles = new Set([
            "apps/api/src/modules/covered/covered.service.ts",
            "apps/api/src/modules/covered/covered.service.spec.ts",
            "apps/api/src/modules/missing/missing.service.ts",
        ]);

        const result = checkTestCoverage(targets, existingFiles);

        // O teste usa os três estados para garantir que a evidence não mistura causas diferentes.
        expect(result).toEqual([
            expect.objectContaining({
                module: "Módulo coberto",
                status: "covered",
            }),
            expect.objectContaining({
                module: "Módulo sem teste",
                status: "missing-spec",
            }),
            expect.objectContaining({
                module: "Fluxo sem ficheiro base",
                status: "missing-source",
            }),
        ]);
    });

    it("devolve apenas alvos com ficheiro base e teste em falta", () => {
        const existingFiles = new Set([
            "apps/api/src/modules/covered/covered.service.ts",
            "apps/api/src/modules/covered/covered.service.spec.ts",
            "apps/api/src/modules/missing/missing.service.ts",
        ]);

        const missing = findMissingCriticalTests(targets, existingFiles);

        expect(missing).toEqual([
            expect.objectContaining({
                module: "Módulo sem teste",
                expectedSpecPath: "apps/api/src/modules/missing/missing.service.spec.ts",
            }),
        ]);
    });

    it("gera Markdown determinístico para evidence", () => {
        const summary: TestInventorySummary = {
            generatedAt: "2026-07-02T00:00:00.000Z",
            checkedRoot: "/repo",
            totalTargets: 1,
            coveredTargets: 0,
            missingSpecs: 1,
            missingSources: 0,
            items: [
                {
                    ...targets[1],
                    sourceExists: true,
                    specExists: false,
                    status: "missing-spec",
                },
            ],
        };

        const markdown = renderInventoryMarkdown(summary);

        // A evidence precisa de campos estáveis para ser comparável entre PR, defesa e BK-MF8-16.
        expect(markdown).toContain("# TESTES-EM-FALTA - MF8");
        expect(markdown).toContain("| P0 | api | Módulo sem teste | missing-spec |");
        expect(markdown).toContain("Não avances para a execução final");
    });
});
```

5. Explicação do código.

O primeiro teste cria três alvos controlados: um coberto, um sem spec e um sem ficheiro base. Isto protege a distinção mais importante do BK: falta de teste e falta de funcionalidade base não são o mesmo problema.

O segundo teste valida `findMissingCriticalTests(...)`, que deve devolver apenas alvos onde há ficheiro base e falta spec. Se o ficheiro base não existe, a equipa precisa de reler o BK responsável por esse ficheiro, não criar uma spec vazia.

O terceiro teste prova que o Markdown tem campos estáveis. Isto é essencial porque `BK-MF8-16` depende desse output para decidir se pode avançar para a execução final.

6. Validação do passo.

Executa `cd apps/api && npm run test -- mf8-test-inventory.spec.ts --runInBand`. Expected result: três testes passam.

7. Cenário negativo/erro esperado.

Se trocares a ordem dos estados ou removeres a linha de decisão final, o terceiro teste deve falhar. Isso evita evidence ambígua.

### Passo 5 - Gerar evidence de testes em falta

1. Objetivo funcional do passo no contexto da app.

Criar o artefacto que `BK-MF8-16` vai consultar antes de executar a bateria final.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `apps/api/src/scripts/mf8-test-inventory.ts`
    - LOCALIZAÇÃO: ficheiro completo de evidence.

3. Instruções do que fazer.

Depois de o script compilar, executa:

```bash
cd apps/api
npm run mf8:test-inventory > ../../docs/evidence/MF8/TESTES-EM-FALTA.md
```

Abre o ficheiro gerado e confirma que tem contadores, tabela e decisão final. Se o comando terminar com exit code `1`, isso não significa que o script falhou: significa que existem lacunas P0 a resolver antes do `BK-MF8-16`.

4. Código completo, correto e integrado com a app final.

```md
# TESTES-EM-FALTA - MF8

## Resultado automático

- Gerado em: 2026-07-02T00:00:00.000Z
- Raiz analisada: /caminho/do/projeto
- Alvos críticos: 8
- Alvos cobertos: 6
- Testes em falta: 2
- Ficheiros base em falta: 0

## Tabela de cobertura

| Prioridade | Área | Módulo | Estado | Teste esperado | Razão |
| --- | --- | --- | --- | --- | --- |
| P0 | web-e2e | Flashcards em exercício | missing-spec | apps/web/tests/e2e/mf8-flashcards.spec.ts | Consome o handoff do BK-MF8-14 e valida o fluxo visual de flashcards. |

## Decisão para BK-MF8-16

- Não avances para a execução final sem corrigir ou justificar as lacunas P0.
```

5. Explicação do código.

O bloco mostra a forma esperada do ficheiro de evidence. Na execução real, o conteúdo é gerado pelo script, por isso os números podem mudar. A tabela tem o essencial para a defesa: prioridade, área, módulo, estado, teste esperado e razão.

O campo "Decisão para BK-MF8-16" impede que a equipa trate um relatório com lacunas P0 como se fosse aprovação. Se o inventário ainda tiver testes críticos em falta, o próximo BK deve registar bloqueio ou executar primeiro a correção indicada.

6. Validação do passo.

Resultado esperado: `docs/evidence/MF8/TESTES-EM-FALTA.md` existe, abre em Markdown e contém `## Decisão para BK-MF8-16`.

7. Cenário negativo/erro esperado.

Se o ficheiro ficar vazio, confirma se a diretoria `docs/evidence/MF8` existe e se o comando foi executado a partir de `apps/api`.

### Passo 6 - Fechar lacunas P0 identificadas

1. Objetivo funcional do passo no contexto da app.

Usar o relatório gerado para criar ou recuperar testes críticos antes da execução final.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
    - REVER: `apps/web/tests/e2e/*.spec.ts`
    - REVER: `apps/api/src/scripts/mf8-test-inventory.spec.ts`
    - LOCALIZAÇÃO: linhas da tabela com estado `missing-spec` e prioridade `P0`.

3. Instruções do que fazer.

Lê cada linha `P0` com estado `missing-spec`:

- se o teste em falta for `apps/api/src/scripts/mf8-test-inventory.spec.ts`, cria-o com o código do Passo 4;
- se o teste em falta for `apps/web/tests/e2e/mf8-flashcards.spec.ts`, aplica o teste definido no `BK-MF8-14`;
- se o teste em falta apontar para outro módulo crítico, abre o BK que criou esse módulo e cria uma spec com caminho feliz e cenário negativo;
- volta a executar `cd apps/api && npm run mf8:test-inventory` depois de cada correção.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é operacional: usa o relatório gerado para decidir que teste criar. O código novo obrigatório deste BK já ficou definido nos Passos 2, 3 e 4.

5. Explicação do código.

Não há código novo porque a correção depende das lacunas observadas na árvore do aluno. A regra, porém, é fechada: nenhuma lacuna `P0` pode ficar sem ação antes de `BK-MF8-16`.

Se a lacuna vem de um BK anterior, não inventes um teste superficial. Reabre o guia desse BK, confirma o contrato e cria uma spec que prove comportamento observável e falha controlada.

6. Validação do passo.

Resultado esperado: a nova execução do inventário reduz as lacunas P0 ou justifica formalmente as que dependem de ambiente.

7. Cenário negativo/erro esperado.

Se alguém criar uma spec vazia só para o inventário passar, isso não cumpre `RNF41`. A spec precisa de asserts reais sobre comportamento, output ou erro esperado.

### Passo 7 - Validar e preparar handoff para BK-MF8-16

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-15` com comandos, output e decisão de avanço para a execução final.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/src/scripts/mf8-test-inventory.ts`
    - REVER: `apps/api/src/scripts/mf8-test-inventory.spec.ts`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
    - LOCALIZAÇÃO: secções `Validação final`, `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Executa e regista:

- `cd apps/api && npm run test -- mf8-test-inventory.spec.ts --runInBand`
- `cd apps/api && npm run mf8:test-inventory`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`

No PR ou defesa, indica se o inventário ficou sem lacunas P0. Se houver lacunas P0, `BK-MF8-16` não deve ser marcado como pronto sem justificação explícita.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e handoff.

5. Explicação do código.

Não há código novo porque os contratos já foram criados. O valor deste passo está em ligar o que foi feito ao próximo BK: `BK-MF8-16` passa a ter comando, evidence e critério de decisão.

6. Validação do passo.

Resultado esperado: teste unitário passa, inventário gera evidence, `git diff --check` não apresenta problemas e a validação documental continua em PASS.

7. Cenário negativo/erro esperado.

Se `npm run mf8:test-inventory` devolver exit code `1`, abre `docs/evidence/MF8/TESTES-EM-FALTA.md` e trata as lacunas P0 antes da execução final.

#### Critérios de aceite

- Header e metadados continuam alinhados com matriz, backlog, contrato de campos e MF views.
- `apps/api/src/scripts/mf8-test-inventory.ts` existe e exporta manifesto, funções de inventário, renderer Markdown e CLI.
- `apps/api/package.json` expõe `mf8:test-inventory`.
- `apps/api/src/scripts/mf8-test-inventory.spec.ts` testa cobertura, teste em falta e saída determinística.
- `docs/evidence/MF8/TESTES-EM-FALTA.md` é gerado pelo comando do inventário.
- Nenhuma lacuna `P0` fica escondida antes de `BK-MF8-16`.
- O BK não cria endpoint, página ou cliente API sem contrato.
- O inventário não imprime dados pessoais, conteúdos privados ou materiais completos.
- `BK-MF8-16` recebe comando, ficheiro de evidence e critério de avanço.

#### Validação final

- `cd apps/api && npm run test -- mf8-test-inventory.spec.ts --runInBand`
- `cd apps/api && npm run mf8:test-inventory`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`

#### Evidence para PR/defesa

- `pr`: `BK-MF8-15` implementa inventário de testes para `RNF41`.
- `proof`: output de `cd apps/api && npm run mf8:test-inventory`.
- `tests`: output de `cd apps/api && npm run test -- mf8-test-inventory.spec.ts --runInBand`.
- `coverage`: tabela de `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- `decision`: indicação explícita de `sem lacunas P0` ou `lacunas P0 justificadas`.
- `privacy`: confirmação de que a evidence só contém paths técnicos, estados e razões.
- `handoff`: `BK-MF8-16` deve executar a bateria final depois de rever a evidence.

#### Handoff

O próximo BK é `BK-MF8-16`. Ele pode assumir que este BK entrega:

- comando `cd apps/api && npm run mf8:test-inventory`;
- script `apps/api/src/scripts/mf8-test-inventory.ts`;
- teste `apps/api/src/scripts/mf8-test-inventory.spec.ts`;
- evidence `docs/evidence/MF8/TESTES-EM-FALTA.md`;
- critério de avanço: sem lacunas `P0` por resolver ou com justificação explícita.

Se a evidence tiver lacunas `P0`, `BK-MF8-16` deve começar por bloquear a execução final ou registar a justificação antes de correr a bateria completa.

#### Changelog

- `2026-07-02`: guia reforçado com contrato de script local, comando executável, teste Jest, evidence Markdown e handoff operacional para `BK-MF8-16`, removendo passos genéricos de controller/UI.
