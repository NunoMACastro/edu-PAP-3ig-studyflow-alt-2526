# BK-MF8-17 - Correção de erros.

## Header

- `doc_id`: `GUIA-BK-MF8-17`
- `bk_id`: `BK-MF8-17`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-16`
- `rf_rnf`: `RNF45`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais transformar `RNF45` num fluxo final de correção e revalidação. Vais consumir a evidence criada no `BK-MF8-16`, identificar comandos em `FAIL` ou `BLOQUEADO`, registar cada erro com causa, correção, validação e nota de privacidade, e gerar `docs/evidence/MF8/CORRECAO-ERROS.md`.

Este BK não cria funcionalidades novas para a aplicação. O objetivo é fechar a MF8 com rastreabilidade: cada erro encontrado nos testes finais fica ligado a uma correção concreta e a uma revalidação observável.

#### Importância

`RNF45` é CANONICO na planificação StudyFlow. Sem este BK, a equipa pode executar testes finais, mas continua sem prova de que os erros foram corrigidos e revalidados antes da defesa.

Este BK também protege a privacidade: a evidence deve mostrar comandos, estados e decisões, mas não deve guardar tokens, cookies, prompts privados, respostas completas da IA, materiais privados ou dados pessoais de alunos e professores.

#### Scope-in

- Confirmar metadados canónicos de `BK-MF8-17` em matriz, backlog e contrato de campos.
- Consumir `docs/evidence/MF8/TESTES-FINAIS.md`, entregue por `BK-MF8-16`.
- Criar um registo técnico em `apps/api/src/scripts/mf8-error-register.ts`.
- Criar testes Jest em `apps/api/src/scripts/mf8-error-register.spec.ts`.
- Editar `apps/api/package.json` para expor `mf8:error-register`.
- Gerar `docs/evidence/MF8/CORRECAO-ERROS.md`.
- Revalidar cada erro corrigido com comando, expected result, observed result e negativo relevante.

#### Scope-out

- Alterar IDs, owners, prioridades, esforço, sprint, RF/RNF, dependências ou ordem dos BKs.
- Criar endpoint, controller, DTO, schema, service de domínio ou página React nova sem erro confirmado em `TESTES-FINAIS.md`.
- Criar requisitos novos fora de `RNF45`.
- Prometer RAG, embeddings, OCR, tradução completa, automação externa ou integrações não previstas nesta fase.
- Guardar tokens, cookies, prompts privados, respostas IA privadas completas, materiais privados ou dados pessoais em logs ou evidence.
- Marcar a MF8 como fechada com comandos obrigatórios em `FAIL` ou `BLOQUEADO`.

#### Estado antes e depois

- Estado antes: `BK-MF8-16` entrega `docs/evidence/MF8/TESTES-FINAIS.md`, mas ainda falta um fluxo fechado para transformar falhas finais em correções rastreáveis e revalidadas.
- Estado depois: `BK-MF8-17` deixa script local, teste unitário, comando de execução, evidence de correção e critérios objetivos para fechar a MF8.

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
- `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `docs/evidence/MF8/TESTES-FINAIS.md`, gerado pelo `BK-MF8-16`

#### Glossário

- **Correção final:** alteração feita depois dos testes finais, com causa, ficheiros afetados e revalidação registados.
- **Erro aberto:** falha confirmada que ainda não tem correção nem revalidação.
- **Erro revalidado:** falha corrigida e comprovada por comando executado novamente.
- **Bloqueio:** falha que não pode ser fechada por falta de ambiente, dependência ou evidence necessária.
- **Evidence:** prova objetiva de execução, com comando, expected result, observed result e decisão, sem dados sensíveis.
- **Output sanitizado:** resultado reduzido ao necessário para defesa, sem cookies, tokens, prompts privados, respostas completas da IA ou materiais integrais.
- **Gate S12:** ponto final da planificação que exige testes finais executados, erros corrigidos e auditoria automática em PASS.

#### Conceitos teóricos essenciais

- **RNF45 como contrato de qualidade.** `RNF45` não pede uma funcionalidade visual nova. Pede que os erros encontrados nos testes finais sejam corrigidos e revalidados. Vem depois de `RNF42` e fecha a cadeia `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17`.
- **Registo de erro.** Um erro de fecho precisa de `id`, origem, comando, causa, correção, validação e estado. Sem estes campos, a equipa sabe que algo falhou, mas não consegue defender que ficou resolvido.
- **Estado `OPEN`.** Significa que a falha foi encontrada e ainda precisa de correção. Evita esconder trabalho por fazer.
- **Estado `FIXED`.** Significa que existe uma correção aplicada, mas ainda falta reexecutar a validação. Evita confundir alteração de código com prova de qualidade.
- **Estado `RETESTED`.** Significa que a correção já foi revalidada. Só este estado pode fechar um erro.
- **Estado `BLOCKED`.** Significa que a equipa sabe o que falta, mas não consegue concluir por ambiente, dependência ou contrato em falta. Evita marcar sucesso falso.
- **Teste unitário.** Confirma a regra central sem depender de rede, browser ou base de dados. Neste BK, prova que um erro só fecha com causa, correção e validação.
- **Privacidade da evidence.** A evidence serve a defesa, não serve para guardar conteúdos privados. Deve mostrar o suficiente para provar qualidade sem expor dados de aluno, professor, sala, turma, prompts ou materiais.

#### Arquitetura do BK

- Requisito canónico: `RNF45`.
- Entrada: `docs/evidence/MF8/TESTES-FINAIS.md`, criado no `BK-MF8-16`.
- Script local: `apps/api/src/scripts/mf8-error-register.ts`.
- Teste do script: `apps/api/src/scripts/mf8-error-register.spec.ts`.
- Comando: `cd apps/api && npm run mf8:error-register`.
- Saída: `docs/evidence/MF8/CORRECAO-ERROS.md`.
- Endpoint criado: nenhum.
- UI criada: nenhuma.
- Decisão CANONICO: `BK-MF8-17` fecha a MF8 com correção e revalidação final.
- Decisões DERIVADO:
  - usar estados `OPEN`, `FIXED`, `RETESTED` e `BLOCKED`;
  - usar um script local para ler a evidence final e gerar o registo de correção;
  - bloquear fecho quando faltar `TESTES-FINAIS.md`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/scripts/mf8-error-register.ts`
- CRIAR: `apps/api/src/scripts/mf8-error-register.spec.ts`
- CRIAR: `docs/evidence/MF8/CORRECAO-ERROS.md`
- EDITAR: `apps/api/package.json`
- REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
- REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- REVER: `docs/planificacao/sprints/GATES-S4-S8-S12.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e entrada do BK

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK só fecha erros encontrados depois da execução final de testes.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - LOCALIZAÇÃO: linhas de `RNF45`, `BK-MF8-17`, gate `S12` e evidence final da MF8.

3. Instruções do que fazer.

Confirma estes factos antes de escrever código:

- `CANONICO`: `BK-MF8-17` depende de `BK-MF8-16`.
- `CANONICO`: `RNF45` exige correção dos erros encontrados nos testes e revalidação final.
- `CANONICO`: o gate S12 exige testes finais executados, erros corrigidos e auditoria automática em PASS.
- `DERIVADO`: a fonte operacional deste BK é `docs/evidence/MF8/TESTES-FINAIS.md`.

Se `TESTES-FINAIS.md` não existir, não inventes erros. O script criado no passo 2 deve falhar com mensagem clara.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental e fixa a fronteira do BK antes de criares o script.

5. Explicação do código.

Não há código porque o objetivo é impedir uma correção sem fonte. A regra principal é simples: só corriges erros que tenham sido encontrados no `BK-MF8-16` ou registados como bloqueio na evidence final.

6. Validação do passo.

Resultado esperado: `BK-MF8-17`, `RNF45`, `S12`, dependência `BK-MF8-16` e próximo BK `-` estão alinhados em matriz, backlog e contrato de campos.

7. Cenário negativo/erro esperado.

Se a matriz disser `RNF45` mas o guia apontar para outro requisito, pára e regista `BLOQUEADO_POR_CONTRATO` no relatório da MF8.


### Passo 2 - Criar o registo técnico de correção

1. Objetivo funcional do passo no contexto da app.

Criar o script local que lê a evidence final e transforma comandos falhados em registos de correção.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/mf8-error-register.ts`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém o script em `apps/api/src/scripts` porque este BK é uma operação técnica de fecho e não um módulo de domínio HTTP.

4. Código completo, correto e integrado com a app final.

```ts
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
```

5. Explicação do código.

Este ficheiro cria o núcleo técnico do BK. `extractFinalTestRows(...)` lê tabelas Markdown em `TESTES-FINAIS.md` e encontra comandos com estado `PASS`, `FAIL` ou `BLOQUEADO`. `buildCorrectionRegister(...)` transforma apenas `FAIL` e `BLOQUEADO` em registos de erro, porque comandos em `PASS` não precisam de correção.

`canCloseMf8Error(...)` é a regra de fecho: um erro só fecha quando está em `RETESTED` e tem causa, correção, validação e nota de privacidade. Isto evita um erro comum em fecho de produto: dizer que algo foi corrigido sem prova observável. O script escreve `CORRECAO-ERROS.md` e devolve exit code `1` enquanto existirem erros abertos ou bloqueados, para impedir um falso PASS no gate S12.

6. Validação do passo.

Resultado esperado: `apps/api/src/scripts/mf8-error-register.ts` compila, exporta as funções indicadas e consegue ler `docs/evidence/MF8/TESTES-FINAIS.md`.

7. Cenário negativo/erro esperado.

Se `docs/evidence/MF8/TESTES-FINAIS.md` não existir, `cd apps/api && npm run mf8:error-register` deve falhar com mensagem clara e não deve criar um PASS artificial.


### Passo 3 - Adicionar o comando de execução

1. Objetivo funcional do passo no contexto da app.

Permitir que o aluno execute o registo de erros com um comando estável.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona `mf8:error-register` ao `package.json` da API. Não adiciones dependências novas: o comando usa `nest build` e executa o JavaScript gerado em `dist`.

4. Código completo, correto e integrado com a app final.

```json
{
  "name": "@studyflow/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
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
    "mf8:error-register": "nest build && node dist/scripts/mf8-error-register.js",
    "test": "jest --config ./jest.config.cjs --passWithNoTests",
    "test:unit": "npm test"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/mongoose": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "ioredis": "^5.4.1",
    "mammoth": "^1.12.0",
    "mongoose": "^8.0.0",
    "multer": "^2.0.0",
    "openai": "^5.0.0",
    "pdf-parse": "^2.4.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.12",
    "@types/multer": "^1.4.12",
    "@types/node": "^24.0.0",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^11.2.0",
    "ts-jest": "^29.2.5",
    "typescript": "^5.8.0"
  }
}
```

5. Explicação do código.

O novo script dá um nome previsível à tarefa final de correção. O comando começa por `nest build` para garantir que `mf8-error-register.ts` compila antes de ser executado. Depois corre `node dist/scripts/mf8-error-register.js`, que lê a evidence final e escreve `CORRECAO-ERROS.md`.

Este passo evita dois problemas: executar ficheiros TypeScript diretamente sem ferramenta configurada, e fechar a MF8 com comandos manuais difíceis de repetir na defesa.

6. Validação do passo.

Resultado esperado: `cd apps/api && npm run mf8:error-register` executa o build e tenta gerar `docs/evidence/MF8/CORRECAO-ERROS.md`.

7. Cenário negativo/erro esperado.

Se o ficheiro `TESTES-FINAIS.md` ainda não existir, o comando deve terminar com exit code `1` e mensagem `BK-MF8-17 bloqueado`, porque não há fonte de erros para corrigir.


### Passo 4 - Criar testes de regressão do registo

1. Objetivo funcional do passo no contexto da app.

Provar que a regra de fecho de erro funciona antes de usar o registo na defesa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/scripts/mf8-error-register.spec.ts`
    - REVER: `apps/api/src/scripts/mf8-error-register.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a spec abaixo. Ela cobre o caminho feliz, ausência de causa, erro reaberto e extração de falhas a partir de `TESTES-FINAIS.md`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/mf8-error-register.spec.ts
import {
    buildCorrectionRegister,
    canCloseMf8Error,
    extractFinalTestRows,
    renderCorrectionRegisterMarkdown,
    type Mf8ErrorRecord,
} from "./mf8-error-register.js";

const validRetestedRecord: Mf8ErrorRecord = {
    id: "MF8-ERR-01",
    source: "api",
    command: "cd apps/api && npm run test:unit",
    observed: "A suite falhou antes da correção.",
    cause: "O teste final encontrou uma falha de validação.",
    fix: "A regra de validação foi corrigida no ficheiro responsável.",
    validation: "O comando voltou a executar com estado PASS.",
    status: "RETESTED",
    privacyNote: "A evidence não inclui tokens, cookies nem dados pessoais.",
};

describe("registo de correção de erros da MF8", () => {
    it("fecha erro revalidado com causa, correção e validação", () => {
        expect(canCloseMf8Error(validRetestedRecord)).toBe(true);
    });

    it("não fecha erro sem causa", () => {
        const recordWithoutCause: Mf8ErrorRecord = {
            ...validRetestedRecord,
            cause: "",
        };

        // Sem causa, a equipa não consegue explicar o que corrigiu na defesa.
        expect(canCloseMf8Error(recordWithoutCause)).toBe(false);
    });

    it("não fecha erro reaberto", () => {
        const reopenedRecord: Mf8ErrorRecord = {
            ...validRetestedRecord,
            status: "OPEN",
        };

        // OPEN significa que ainda falta correção ou revalidação, mesmo que exista descrição.
        expect(canCloseMf8Error(reopenedRecord)).toBe(false);
    });

    it("cria registo bloqueado a partir de comandos finais em FAIL ou BLOQUEADO", () => {
        const markdown = [
            "# TESTES-FINAIS - MF8",
            "",
            "| comando | estado | observed |",
            "| --- | --- | --- |",
            "| cd apps/api && npm run test:unit | PASS | 64 suites passaram. |",
            "| cd apps/web && npm run build | FAIL | TypeScript encontrou erro em componente. |",
            "| bash scripts/validate-planificacao.sh | BLOQUEADO | Faltou ficheiro de evidence. |",
        ].join("\n");

        const rows = extractFinalTestRows(markdown);
        const register = buildCorrectionRegister(
            rows,
            new Date("2026-07-02T10:00:00.000Z"),
        );
        const output = renderCorrectionRegisterMarkdown(register);

        expect(register.records).toHaveLength(2);
        expect(register.decision).toBe("BLOCKED");
        expect(output).toContain("MF8-ERR-01");
        expect(output).toContain("MF8-ERR-02");
        expect(output).not.toContain("64 suites passaram");
    });
});
```

5. Explicação do código.

Esta spec prova o contrato que faltava na auditoria. O primeiro teste mostra o caminho feliz: um erro com `RETESTED`, causa, correção, validação e nota de privacidade pode fechar. O segundo teste cobre ausência de causa, porque uma correção sem causa não é defendível. O terceiro cobre erro reaberto, porque `OPEN` nunca deve contar como sucesso.

O quarto teste usa uma mini evidence Markdown para confirmar que o script ignora comandos em `PASS`, cria registos para `FAIL` e `BLOQUEADO`, mantém a decisão em `BLOCKED` e não transporta outputs longos desnecessários para a evidence de correção.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test -- mf8-error-register.spec.ts --runInBand
```

Resultado esperado: a suite passa e confirma sucesso, ausência de causa, erro reaberto e parsing da evidence final.

7. Cenário negativo/erro esperado.

Se mudares `canCloseMf8Error(...)` para aceitar `OPEN`, o teste "não fecha erro reaberto" deve falhar. Essa falha protege o gate S12 contra sucesso falso.


### Passo 5 - Gerar evidence inicial de correção

1. Objetivo funcional do passo no contexto da app.

Executar o comando que transforma `TESTES-FINAIS.md` em `CORRECAO-ERROS.md`.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/CORRECAO-ERROS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: comando `mf8:error-register` e ficheiro Markdown gerado.

3. Instruções do que fazer.

Executa o comando a partir da API:

```bash
cd apps/api
npm run mf8:error-register
```

Se o comando devolver `1`, abre `../../docs/evidence/MF8/CORRECAO-ERROS.md`. Exit code `1` é esperado enquanto houver erros `OPEN` ou `BLOCKED`; não significa que o script esteja partido.

4. Código completo, correto e integrado com a app final.

```md
# CORRECAO-ERROS - MF8

## Origem
- Evidence de entrada: `docs/evidence/MF8/TESTES-FINAIS.md`
- Gerado em: `2026-07-02T10:00:00.000Z`

## Decisão final
- BLOQUEADO: existem erros abertos, bloqueados ou sem revalidação.

## Registos

| id | origem | estado | comando | causa | correção | validação | privacidade |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MF8-ERR-01 | web | OPEN | cd apps/web && npm run build | Falha observada no comando: TypeScript encontrou erro em componente. | Registar a correção aplicada antes da revalidação. | Reexecutar o comando afetado e registar o observed result. | A evidence guarda apenas comando, estado e resumo sanitizado, sem dados sensíveis. |
```

5. Explicação do código.

Este Markdown é a evidence inicial de correção. O exemplo mostra uma falha web aberta, mas no projeto real os registos nascem do `TESTES-FINAIS.md` gerado pelo `BK-MF8-16`. A tabela evita guardar outputs completos e obriga a equipa a separar causa, correção e validação.

O estado `BLOQUEADO` na decisão final é correto enquanto existir pelo menos um registo sem `RETESTED`. Isto evita fechar a MF8 antes da revalidação.

6. Validação do passo.

Resultado esperado: `docs/evidence/MF8/CORRECAO-ERROS.md` existe, contém `## Decisão final`, contém tabela `## Registos` e não contém cookies, tokens, prompts privados, respostas completas da IA ou materiais privados.

7. Cenário negativo/erro esperado.

Se o output tiver dados sensíveis ou conteúdo privado, remove esses detalhes e mantém apenas comando, estado, causa técnica resumida e resultado observado.


### Passo 6 - Corrigir erros reais e revalidar

1. Objetivo funcional do passo no contexto da app.

Fechar cada registo aberto com uma correção concreta e uma revalidação observável.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/CORRECAO-ERROS.md`
    - REVER: ficheiro indicado pelo comando falhado em `TESTES-FINAIS.md`
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - LOCALIZAÇÃO: linha do registo `MF8-ERR-*` e ficheiro real associado à falha.

3. Instruções do que fazer.

Para cada linha com `OPEN` ou `BLOCKED`:

1. abre o comando e o observed result;
2. identifica a causa técnica;
3. corrige o ficheiro real responsável;
4. reexecuta o comando falhado;
5. atualiza `CORRECAO-ERROS.md` com `status` equivalente a `RETESTED`, causa, correção, validação e nota de privacidade.

Se a falha for backend, corrige e reexecuta a suite backend. Se for frontend, corrige e reexecuta build ou E2E indicado. Se for documental, corrige o documento dentro do escopo permitido e reexecuta `bash scripts/validate-planificacao.sh`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo depende dos erros reais encontrados em `TESTES-FINAIS.md`. O código reutilizável já foi criado nos passos 2 e 4; aqui o trabalho é aplicar a correção concreta ao ficheiro indicado pela evidence.

5. Explicação do código.

Não há bloco de código fixo porque `RNF45` corrige erros observados, e esses erros variam conforme a bateria final. A regra técnica é fechada: nenhum registo pode passar para fechado sem causa, correção, comando reexecutado e observed result.

6. Validação do passo.

Resultado esperado: cada erro corrigido tem uma linha atualizada em `CORRECAO-ERROS.md` e o comando associado volta a correr com `PASS` ou com bloqueio justificado.

7. Cenário negativo/erro esperado.

Se alguém alterar o código mas não reexecutar o comando falhado, mantém o erro como `FIXED` ou `OPEN`; não uses `RETESTED`.


### Passo 7 - Fechar a MF8 e preparar defesa

1. Objetivo funcional do passo no contexto da app.

Confirmar que a MF8 pode ser defendida com testes finais, correções e auditoria automática.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-FINAIS.md`
    - REVER: `docs/evidence/MF8/CORRECAO-ERROS.md`
    - REVER: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
    - REVER: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
    - LOCALIZAÇÃO: decisão final, evidence, validação final e handoff.

3. Instruções do que fazer.

Antes de fechar a MF8, confirma:

- `TESTES-FINAIS.md` existe;
- `CORRECAO-ERROS.md` existe;
- todos os erros estão `RETESTED` ou têm bloqueio explícito;
- `git diff --check` passa;
- `bash scripts/validate-planificacao.sh` passa;
- a pesquisa textual não encontra termos proibidos nem caminhos privados nos guias MF8.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é de validação e defesa. O código necessário já ficou nos passos anteriores.

5. Explicação do código.

Sem código neste passo. A entrega final é a prova cruzada: testes finais mostram o que falhou, correção de erros mostra o que foi corrigido e o validador de planificação mostra que a documentação continua coerente.

6. Validação do passo.

Resultado esperado: a equipa consegue apresentar `TESTES-FINAIS.md`, `CORRECAO-ERROS.md`, outputs dos comandos reexecutados e auditoria automática em PASS.

7. Cenário negativo/erro esperado.

Se a auditoria automática falhar, não declares a MF8 fechada. Regista o erro observado e volta ao BK ou ficheiro responsável.


#### Critérios de aceite

- Header e metadados iguais à matriz, backlog, contrato de campos e MF views.
- O BK entrega `RNF45` sem criar endpoint, controller, DTO, service de domínio ou UI sem erro confirmado.
- `apps/api/src/scripts/mf8-error-register.ts` existe e exporta tipos, parser, builder, renderer, CLI e `canCloseMf8Error(...)`.
- `apps/api/src/scripts/mf8-error-register.spec.ts` testa sucesso, ausência de causa, erro reaberto e parsing de `TESTES-FINAIS.md`.
- `apps/api/package.json` expõe `mf8:error-register`.
- `docs/evidence/MF8/CORRECAO-ERROS.md` é gerado a partir de `TESTES-FINAIS.md`.
- Nenhum erro é fechado sem causa, correção e revalidação.
- Evidence não expõe tokens, cookies, prompts privados, respostas completas da IA, materiais privados ou dados pessoais.

#### Validação final

- `cd apps/api && npm run test -- mf8-error-register.spec.ts --runInBand`
- `cd apps/api && npm run mf8:error-register`
- `git diff --check`
- `bash scripts/validate-planificacao.sh`
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`

#### Evidence para PR/defesa

- `pr`: `BK-MF8-17` implementa correção e revalidação final para `RNF45`.
- `input`: `docs/evidence/MF8/TESTES-FINAIS.md`.
- `correction`: `docs/evidence/MF8/CORRECAO-ERROS.md`.
- `tests`: output de `cd apps/api && npm run test -- mf8-error-register.spec.ts --runInBand`.
- `proof`: comandos reexecutados depois de cada correção.
- `privacy`: confirmação de que a evidence está sanitizada.
- `decision`: decisão final `PASS` ou bloqueio justificado.

#### Handoff

Este é o último BK da MF8. Depois dele, a equipa deve reunir:

- inventário de testes do `BK-MF8-15`;
- execução final do `BK-MF8-16`;
- correção e revalidação deste BK;
- auditoria automática em PASS;
- lista curta de riscos residuais justificados para a defesa.

#### Changelog

- `2026-07-02`: guia reforçado com script local completo, comando `mf8:error-register`, spec Jest completa, lista de ficheiros reconciliada e fluxo de evidence `TESTES-FINAIS.md -> CORRECAO-ERROS.md`.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com estrutura completa, caminhos públicos, decisões CANONICO/DERIVADO, código integrado, validação por passo, negativos e handoff.
