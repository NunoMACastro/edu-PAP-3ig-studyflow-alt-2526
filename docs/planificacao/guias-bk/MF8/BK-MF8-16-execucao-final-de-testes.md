# BK-MF8-16 - Execução final de testes.

## Header

- `doc_id`: `GUIA-BK-MF8-16`
- `bk_id`: `BK-MF8-16`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-15`
- `rf_rnf`: `RNF42`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-17`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais transformar `RNF42` num gate final executável. O resultado observável é um runner em `apps/api/src/scripts/run-mf8-final-tests.ts` que valida a evidence do BK anterior, executa comandos reais de planificação, API e web, recolhe estados observados e escreve `docs/evidence/MF8/TESTES-FINAIS.md`.

Este BK não cria endpoint, página React, controller, DTO ou service de domínio. A execução final de testes é uma tarefa técnica de fecho de produto: corre localmente, produz evidence segura e prepara o `BK-MF8-17` para corrigir apenas erros confirmados.

#### Importância

`RNF42` é CANONICO e exige execução final da bateria de testes com recolha de evidence. Sem este BK, a equipa pode dizer que testou a aplicação, mas não consegue provar que comandos foram corridos, que falhas apareceram, que limitações foram bloqueadas e que informação foi entregue ao BK seguinte.

Este BK também protege a defesa PAP. O aluno passa a conseguir mostrar uma tabela final com `PASS`, `FAIL` e `BLOQUEADO`, explicar por que um comando obrigatório bloqueia a entrega e demonstrar que a evidence não inclui dados pessoais, prompts privados, respostas IA completas, cookies, tokens ou materiais integrais.

#### Scope-in

- Confirmar os metadados canónicos de `BK-MF8-16`: `RNF42`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, sprint `S12`, dependência `BK-MF8-15` e próximo BK `BK-MF8-17`.
- Rever a evidence criada por `BK-MF8-15` em `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Criar `apps/api/src/scripts/run-mf8-final-tests.ts` com runner CLI, recolha de estados e geração de Markdown.
- Criar `apps/api/src/scripts/run-mf8-final-tests.spec.ts` com testes unitários do gate final.
- Editar `apps/api/package.json` para expor `mf8:final-tests`.
- Gerar `docs/evidence/MF8/TESTES-FINAIS.md`.
- Usar comandos reais existentes: `bash scripts/validate-planificacao.sh`, `npm --prefix apps/api run test:unit`, `npm --prefix apps/api run build`, `npm --prefix apps/web run build` e `npm --prefix apps/web run test:e2e`.

#### Scope-out

- Criar endpoint HTTP, controller, DTO, service, schema, cliente API ou página React.
- Alterar IDs, owners, prioridades, esforço, sprint, dependências, RF/RNF ou ordem dos BKs.
- Corrigir testes ou bugs encontrados na execução final; isso pertence ao `BK-MF8-17`.
- Executar Playwright como obrigatório se o ambiente local não tiver browser ou servidores configurados; nesse caso o runner deve registar `BLOQUEADO` para o comando opcional.
- Guardar tokens, cookies, prompts privados, respostas IA completas, dados pessoais, materiais privados ou outputs extensos em evidence.
- Adicionar dependências novas ao projeto.

#### Estado antes e depois

- Estado antes: `BK-MF8-15` deixa um inventário de testes e uma decisão para avanço, mas `BK-MF8-16` ainda não tinha runner executável, teste do runner, script real no `package.json` nem artefacto final `TESTES-FINAIS.md`.
- Estado depois: `BK-MF8-16` deixa um runner final com comandos reais, verificação da evidence anterior, output Markdown, teste unitário, comando `mf8:final-tests` e handoff objetivo para `BK-MF8-17`.

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
- `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `apps/api/package.json`
- `apps/api/jest.config.cjs`
- `apps/web/package.json`
- `apps/web/tests/e2e/README.md`

#### Glossário

- **Gate final:** ponto de decisão técnico que executa validações antes de fechar a MF8.
- **Comando obrigatório:** comando que tem de passar para a entrega avançar sem bloqueio.
- **Comando opcional:** comando importante, mas dependente de ambiente local; se falhar por ambiente, fica registado sem esconder o risco.
- **Evidence:** ficheiro Markdown com comandos, resultados observados, falhas e decisão final.
- **Exit code:** número devolvido por um processo; `0` significa sucesso e valores diferentes de `0` indicam falha.
- **Stdout:** texto normal escrito pelo comando.
- **Stderr:** texto de erro escrito pelo comando.
- **Output sanitizado:** output reduzido e sem segredos, para poder entrar na evidence.

#### Conceitos teóricos essenciais

- **Qualidade como prova.** `RNF42` não é uma funcionalidade visual; é uma garantia operacional. Vem depois do inventário de `BK-MF8-15` e segue para `BK-MF8-17` como lista objetiva do que passou, falhou ou ficou bloqueado.
- **Runner CLI.** É um programa executado por terminal. Neste BK, o runner corre comandos reais, guarda resultados e decide se a bateria final passou.
- **Processo filho.** Quando o Node executa `npm` ou `bash`, cria um processo filho. O runner lê o exit code e os outputs desse processo para saber se houve sucesso.
- **Evidence segura.** A evidence deve provar execução sem copiar dados sensíveis. Por isso o runner corta outputs longos e substitui padrões como `token=...`, `cookie=...` ou `password=...`.
- **Comando obrigatório vs opcional.** Planificação, API tests e builds são obrigatórios. E2E Playwright é registado, mas pode ficar `BLOQUEADO` se o ambiente não tiver browser ou servidor preparado.
- **Handoff.** O próximo BK não deve procurar erros manualmente. Deve receber `TESTES-FINAIS.md` e corrigir apenas o que ficou `FAIL` ou `BLOQUEADO` com impacto real.
- **Privacidade.** Este BK toca outputs técnicos, não dados de alunos. Mesmo assim, a regra é minimizar evidence para evitar expor prompts, cookies, tokens, materiais ou respostas privadas.

#### Arquitetura do BK

- Requisito canónico: `RNF42`.
- Endpoint: nenhum.
- Backend/API: script local em `apps/api/src/scripts/run-mf8-final-tests.ts`.
- Frontend/web: sem UI nova; a web é validada por comandos existentes em `apps/web/package.json`.
- Ambiente local: confirmar `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md` antes de correr a bateria final.
- Comando: `cd apps/api && npm run mf8:final-tests`.
- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`, entregue por `BK-MF8-15`.
- Evidence de saída: `docs/evidence/MF8/TESTES-FINAIS.md`.
- Testes: `apps/api/src/scripts/run-mf8-final-tests.spec.ts`.
- Segurança: não lê base de dados, não chama provider externo, não acede a sessões reais e sanitiza outputs antes de escrever evidence.
- Decisão CANONICO: `BK-MF8-16` entrega `RNF42` e prepara `BK-MF8-17`.
- Decisões DERIVADO:
  - usar script local sem dependência nova;
  - usar Markdown para evidence final;
  - bloquear execução se a evidence de `BK-MF8-15` não existir ou indicar lacunas `P0`;
  - tratar Playwright E2E como comando opcional registado, porque depende de ambiente.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/scripts/run-mf8-final-tests.ts`
- CRIAR: `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
- EDITAR: `apps/api/package.json`
- CRIAR: `docs/evidence/MF8/TESTES-FINAIS.md`
- REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- REVER: `apps/web/package.json`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e evidence de entrada

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK só executa a bateria final depois de receber a evidence do `BK-MF8-15`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - LOCALIZAÇÃO: linhas de `RNF42`, `BK-MF8-16`, `S12`, dependência `BK-MF8-15` e próximo BK `BK-MF8-17`.

3. Instruções do que fazer.

Confirma estes factos antes de criares ficheiros:

- `CANONICO`: `RNF42` é "Execução final da bateria de testes e recolha de evidence".
- `CANONICO`: `BK-MF8-16` depende de `BK-MF8-15` e prepara `BK-MF8-17`.
- `DERIVADO`: a evidence de entrada fica em `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- `DERIVADO`: se essa evidence não existir ou disser "Não avances", o gate final fica bloqueado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e impede que a equipa execute a bateria final sem validar a lista de testes em falta.

5. Explicação do código.

Não há código porque este passo fixa a fronteira entre BKs. O erro que evita é saltar de `BK-MF8-15` para `BK-MF8-16` sem saber se ainda existem lacunas `P0`.

6. Validação do passo.

Resultado esperado: matriz, backlog, contrato de campos e guia mantêm `BK-MF8-16`, `RNF42`, `S12`, `BK-MF8-15` e `BK-MF8-17` alinhados.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/TESTES-EM-FALTA.md` não existir, não avances. Regista bloqueio na evidence final depois de criares o runner.

### Passo 2 - Criar o runner final de testes

1. Objetivo funcional do passo no contexto da app.

Criar a unidade técnica que valida a evidence anterior, executa comandos reais, sanitiza outputs e escreve a evidence final.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/run-mf8-final-tests.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro completo abaixo. Mantém comandos sem dependências novas, usa paths públicos e não cries endpoint HTTP.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

Este ficheiro é o centro de `RNF42`. `buildMf8FinalTestPlan(...)` define a bateria com comandos reais do projeto. Usa `npm --prefix apps/api run test:unit`, `npm --prefix apps/api run build`, `npm --prefix apps/web run build` e `npm --prefix apps/web run test:e2e`, evitando o comando inexistente `smoke:e2e`.

Os tipos exportados têm JSDoc próprio porque representam contratos de evidence que o aluno vai ler, testar e entregar em PR/defesa. Isto torna claro o significado de `PASS`, `FAIL`, `BLOQUEADO`, comandos obrigatórios, outputs sanitizados e runner substituível.

`validateInventoryEvidence(...)` liga este BK ao BK anterior. Se `TESTES-EM-FALTA.md` não existir ou disser que não se deve avançar, o runner não finge sucesso: cria `TESTES-FINAIS.md` com estado `BLOQUEADO`.

`runFinalTestCommand(...)` executa cada comando como processo filho, recolhe exit code, stdout e stderr, e converte o resultado para `PASS`, `FAIL` ou `BLOQUEADO`. Comandos obrigatórios falham como `FAIL`; comandos opcionais, como Playwright E2E, podem ficar `BLOQUEADO` por ambiente.

`sanitizeOutput(...)` evita guardar valores sensíveis na evidence. Esta função não substitui revisão humana, mas reduz o risco de copiar tokens, cookies, passwords ou secrets para um ficheiro de defesa.

`renderFinalEvidenceMarkdown(...)` cria um Markdown que o `BK-MF8-17` consegue ler: decisão final, evidence de entrada, tabela de comandos e outputs sanitizados.

6. Validação do passo.

Depois de criares o ficheiro, executa `cd apps/api && npm run build`. Expected result: o TypeScript compila e cria `dist/scripts/run-mf8-final-tests.js`.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/TESTES-EM-FALTA.md` não existir, `cd apps/api && npm run mf8:final-tests` deve terminar com exit code `1` e criar `TESTES-FINAIS.md` com decisão `BLOQUEADO`.

### Passo 3 - Expor o comando final no package.json

1. Objetivo funcional do passo no contexto da app.

Criar um comando oficial para executar a bateria final sem adivinhar o ficheiro compilado.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona `mf8:final-tests` ao objeto `scripts`, mantendo os scripts existentes.

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
    "mf8:final-tests": "nest build && node dist/scripts/run-mf8-final-tests.js",
    "test": "jest --config ./jest.config.cjs --passWithNoTests",
    "test:unit": "npm test"
  }
}
```

5. Explicação do código.

O comando compila a API antes de executar o runner. Isto mantém o mesmo padrão de `backup:daily`, que compila com `nest build` e só depois executa um ficheiro em `dist/scripts`.

O comando fica em `apps/api/package.json` porque o runner é um script Node de qualidade técnica. A web continua validada pelos comandos que já existem em `apps/web/package.json`; não é criado script web novo.

6. Validação do passo.

Executa `cd apps/api && npm run mf8:final-tests`. Expected result: o comando escreve `docs/evidence/MF8/TESTES-FINAIS.md` e termina com `0` se todos os comandos obrigatórios passarem.

7. Cenário negativo/erro esperado.

Se o script for chamado antes de existir `TESTES-EM-FALTA.md`, deve terminar com exit code `1` e escrever evidence bloqueada.

### Passo 4 - Criar testes unitários do runner final

1. Objetivo funcional do passo no contexto da app.

Provar que o runner bloqueia sem evidence de entrada, classifica falhas obrigatórias e sanitiza outputs.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele usa pastas temporárias e uma função de execução controlada, sem correr comandos reais.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

O primeiro teste prova o negativo mais importante: sem `TESTES-EM-FALTA.md`, a execução final fica bloqueada. Isto garante que `BK-MF8-16` respeita o handoff de `BK-MF8-15`.

O segundo teste usa um `runnerDeTeste` para simular um comando obrigatório a falhar. Não corre `npm` real; testa a regra do runner. Se um comando obrigatório falha, o estado tem de ser `FAIL`.

O terceiro teste prova que a evidence final remove segredos e ainda renderiza uma decisão legível. O valor pedagógico é mostrar que evidence não é despejar logs completos; é guardar prova suficiente e segura.

6. Validação do passo.

Executa `cd apps/api && npm run test -- run-mf8-final-tests.spec.ts --runInBand`. Expected result: três testes passam.

7. Cenário negativo/erro esperado.

Se removeres a sanitização de `token=abc123`, o terceiro teste deve falhar. Isto evita guardar segredos em `TESTES-FINAIS.md`.

### Passo 5 - Gerar a evidence final

1. Objetivo funcional do passo no contexto da app.

Executar o runner e criar `docs/evidence/MF8/TESTES-FINAIS.md`.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/TESTES-FINAIS.md`
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `apps/api/src/scripts/run-mf8-final-tests.ts`
    - LOCALIZAÇÃO: ficheiro completo de evidence.

3. Instruções do que fazer.

Executa:

```bash
cd apps/api
npm run mf8:final-tests
```

Abre `../../docs/evidence/MF8/TESTES-FINAIS.md` e confirma a decisão final, a tabela de comandos e os outputs sanitizados.

4. Código completo, correto e integrado com a app final.

```md
# TESTES-FINAIS - MF8

## Decisão final

- PASS: a bateria obrigatória passou e a evidence está pronta para BK-MF8-17.

## Evidence de entrada

- Ficheiro: /caminho/do/projeto/docs/evidence/MF8/TESTES-EM-FALTA.md
- Estado: PASS
- Observed: A evidence do BK-MF8-15 permite iniciar a execução final.

## Comandos executados

| Obrigatório | Comando | Estado | Exit code | Linha executada |
| --- | --- | --- | --- | --- |
| Sim | Validação da planificação | PASS | 0 | `bash scripts/validate-planificacao.sh` |
| Sim | Testes unitários da API | PASS | 0 | `npm --prefix apps/api run test:unit` |
| Sim | Build da API | PASS | 0 | `npm --prefix apps/api run build` |
| Sim | Build da web | PASS | 0 | `npm --prefix apps/web run build` |
| Não | E2E Playwright da web | BLOQUEADO | - | `npm --prefix apps/web run test:e2e` |
```

5. Explicação do código.

Este bloco mostra a forma final da evidence. O conteúdo real é criado pelo runner e pode mudar conforme o estado local. A decisão final fica no topo para o professor e a equipa perceberem rapidamente se a entrega pode avançar.

A tabela separa comandos obrigatórios de opcionais. Se a web E2E ficar `BLOQUEADO` por ambiente, isso não esconde o risco; apenas distingue bloqueio ambiental de falha de build ou de testes unitários.

6. Validação do passo.

Resultado esperado: `docs/evidence/MF8/TESTES-FINAIS.md` existe, abre em Markdown e contém `## Decisão final`.

7. Cenário negativo/erro esperado.

Se um comando obrigatório falhar, o ficheiro deve começar por `BLOQUEADO` e o comando `npm run mf8:final-tests` deve devolver exit code `1`.

### Passo 6 - Interpretar falhas e bloqueios

1. Objetivo funcional do passo no contexto da app.

Separar falhas reais de produto, bloqueios de ambiente e riscos que seguem para `BK-MF8-17`.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/tests/e2e/README.md`
    - LOCALIZAÇÃO: secções `Decisão final`, `Comandos executados` e `Outputs sanitizados`.

3. Instruções do que fazer.

Lê a tabela final:

- se `planificacao`, `api-unit`, `api-build` ou `web-build` estiverem `FAIL`, envia essa falha para `BK-MF8-17`;
- se `web-e2e` estiver `BLOQUEADO`, confirma se falta browser, servidor local ou configuração E2E;
- se a evidence de entrada estiver `BLOQUEADO`, volta ao `BK-MF8-15`;
- se todos os obrigatórios estiverem `PASS`, podes avançar para a correção de erros com risco residual documentado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de interpretação e decisão, porque o runner já gerou o artefacto técnico.

5. Explicação do código.

Não há código novo neste passo. O raciocínio importante é que nem todos os estados têm o mesmo significado. `FAIL` num build ou teste unitário aponta para erro técnico. `BLOQUEADO` em Playwright pode indicar ambiente incompleto, mas continua a ser risco a explicar.

6. Validação do passo.

Resultado esperado: cada linha `FAIL` ou `BLOQUEADO` tem uma ação clara: corrigir no `BK-MF8-17`, preparar ambiente, ou voltar ao `BK-MF8-15`.

7. Cenário negativo/erro esperado.

Se alguém marcar a MF8 como fechada com comandos obrigatórios em `FAIL`, a evidence contradiz a decisão. O estado correto é bloquear o fecho até corrigir ou justificar formalmente.

### Passo 7 - Preparar handoff para BK-MF8-17

1. Objetivo funcional do passo no contexto da app.

Fechar `BK-MF8-16` com uma lista objetiva de resultados para a correção de erros.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: secções de evidence, validação final e handoff.

3. Instruções do que fazer.

No PR ou defesa, regista:

- comando final usado: `cd apps/api && npm run mf8:final-tests`;
- decisão final da evidence;
- comandos em `FAIL`;
- comandos em `BLOQUEADO`;
- confirmação de que outputs foram sanitizados;
- ação prevista no `BK-MF8-17`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de handoff para o BK seguinte.

5. Explicação do código.

Não há código novo porque o artefacto principal já existe. O objetivo é garantir que `BK-MF8-17` não começa por uma conversa vaga sobre "há erros"; começa por uma lista de comandos e estados observados.

6. Validação do passo.

Resultado esperado: `BK-MF8-17` consegue usar `TESTES-FINAIS.md` como fonte para corrigir erros e revalidar.

7. Cenário negativo/erro esperado.

Se `TESTES-FINAIS.md` não tiver decisão final, tabela de comandos e outputs sanitizados, volta ao Passo 2 e corrige o renderer do runner.

#### Critérios de aceite

- Header e metadados continuam alinhados com matriz, backlog, contrato de campos e MF views.
- O BK entrega `RNF42` sem criar endpoint, controller, DTO, service ou UI sem contrato.
- `apps/api/src/scripts/run-mf8-final-tests.ts` existe e exporta plano, validação da evidence anterior, execução de comandos, sanitização, renderer Markdown e CLI.
- `apps/api/package.json` expõe `mf8:final-tests`.
- `apps/api/src/scripts/run-mf8-final-tests.spec.ts` testa bloqueio sem evidence, falha obrigatória e sanitização.
- `docs/evidence/MF8/TESTES-FINAIS.md` é gerado pelo runner.
- O runner usa o script real `npm --prefix apps/web run test:e2e`, não `smoke:e2e`.
- A evidence distingue `PASS`, `FAIL` e `BLOQUEADO`.
- Outputs extensos e valores sensíveis são removidos ou truncados.
- `BK-MF8-17` recebe uma lista objetiva de falhas e bloqueios.

#### Validação final

- `cd apps/api && npm run test -- run-mf8-final-tests.spec.ts --runInBand`
- `cd apps/api && npm run mf8:final-tests`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`

#### Evidence para PR/defesa

- `pr`: `BK-MF8-16` implementa execução final de testes para `RNF42`.
- `proof`: output de `cd apps/api && npm run mf8:final-tests`.
- `tests`: output de `cd apps/api && npm run test -- run-mf8-final-tests.spec.ts --runInBand`.
- `input`: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- `final`: `docs/evidence/MF8/TESTES-FINAIS.md`.
- `decision`: decisão final `PASS` ou `BLOQUEADO`.
- `privacy`: confirmação de que outputs foram sanitizados e não expõem dados sensíveis.
- `handoff`: lista de falhas e bloqueios para `BK-MF8-17`.

#### Handoff

O próximo BK é `BK-MF8-17`. Ele pode assumir que este BK entrega:

- comando `cd apps/api && npm run mf8:final-tests`;
- runner `apps/api/src/scripts/run-mf8-final-tests.ts`;
- teste `apps/api/src/scripts/run-mf8-final-tests.spec.ts`;
- evidence final `docs/evidence/MF8/TESTES-FINAIS.md`;
- critério de avanço: todos os comandos obrigatórios em `PASS`.

Se a evidence final tiver comandos obrigatórios em `FAIL` ou evidence de entrada em `BLOQUEADO`, `BK-MF8-17` deve começar por essas linhas.

#### Changelog

- `2026-07-02`: ajustado o import ESM do teste para `.js` e acrescentado JSDoc aos tipos exportados centrais do runner.
- `2026-07-02`: guia reforçado com runner CLI completo, teste Jest, script `mf8:final-tests`, evidence final e handoff operacional para `BK-MF8-17`; o comando E2E ficou alinhado com `test:e2e`.
