# BK-MF7-07 - Deploy com rollback

## Header

- `doc_id`: `GUIA-BK-MF7-07`
- `bk_id`: `BK-MF7-07`
- `macro`: `MF7`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF29`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-08`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- `last_updated`: `2026-06-27`

#### Objetivo

Neste BK vais preparar o contrato mínimo de deploy com rollback do StudyFlow. O resultado final é um procedimento que só permite avançar com uma release quando existe versão identificada, plano de rollback documentado, comando `deploy:check` e testes que provam o caminho principal e dois negativos P1.

#### Importância

`RNF29` existe para reduzir o risco operacional. Uma release sem versão ou sem plano de rollback deixa a equipa sem saber exatamente o que foi publicado e sem caminho claro para recuperar se algo falhar. Este BK transforma a ideia de "deploy com rollback" em passos verificáveis, adequados a PAP: não cria infraestrutura cloud real, mas cria o contrato técnico que uma pipeline ou execução manual deve respeitar.

#### Scope-in

- Criar o documento operacional `docs/ops/DEPLOY-ROLLBACK.md`.
- Criar o script `apps/api/src/scripts/validate-deploy-readiness.ts`.
- Criar testes unitários em `apps/api/src/scripts/validate-deploy-readiness.spec.ts`.
- Adicionar o comando `deploy:check` a `apps/api/package.json`.
- Provar um caminho principal com versão e documento de rollback.
- Provar dois negativos P1: versão ausente e documento de rollback ausente.
- Preparar handoff para `BK-MF7-08`, que entrega o health check.

#### Scope-out

- Configurar CI/CD real, runners, secrets, ambientes cloud, DNS, containers ou infraestrutura externa.
- Implementar o endpoint de health check, que pertence ao `BK-MF7-08`.
- Alterar autenticação, autorização, IA, materiais, turmas, salas ou módulos funcionais.
- Guardar passwords, tokens, cookies, chaves privadas, prompts privados, materiais privados ou respostas IA completas em evidence.
- Prometer RAG, embeddings, OCR, chunking semântico ou indexação automática.

#### Estado antes e depois

- Estado antes: `BK-MF7-06` deixa testes automatizados para módulos críticos. Ainda falta um gate operacional que impeça deploy sem versão e sem plano de rollback.
- Estado depois: `apps/api` passa a ter um comando `deploy:check`, um script de readiness, testes para caminho principal e negativos, e um documento operacional de rollback em `docs/ops`.

#### Pre-requisitos

- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `apps/api/package.json`

#### Glossário

- **Deploy:** publicação de uma versão da aplicação num ambiente de execução.
- **Rollback:** retorno controlado para uma versão anterior quando a release atual falha.
- **Release:** versão candidata a ser publicada.
- **Readiness:** conjunto mínimo de condições que permite avançar com segurança.
- **Falhar fechado:** bloquear a operação quando falta uma condição obrigatória.
- **Evidence:** prova curta e objetiva com comando, resultado esperado, resultado observado e negativos.
- **Health check:** endpoint que confirma se a API responde; será tratado no `BK-MF7-08`.

#### Conceitos teóricos essenciais

- **Deploy com rollback:** prática operacional que junta publicação e recuperação. Não basta enviar código; a equipa deve conseguir voltar atrás se a versão nova falhar.
- **Versão de release:** identificador que permite saber exatamente que pacote foi publicado. Sem versão, a equipa não consegue comparar expected/observed nem explicar a defesa PAP.
- **Plano de rollback:** documento com critérios de decisão e passos de recuperação. Evita improviso quando há falha em produção.
- **Readiness check:** validação executada antes do deploy. Neste BK, confirma versão e documento de rollback.
- **Script operacional:** ficheiro executável fora do fluxo HTTP normal. Ele não cria endpoints nem altera dados; apenas bloqueia ou aprova a preparação da release.
- **Teste unitário de operação:** teste pequeno que prova regras de readiness sem depender de infraestrutura cloud. É adequado para o contexto PAP porque dá evidence repetível.
- **Cenário negativo P1:** falha controlada que deve ser provada antes do handoff. Aqui existem dois negativos: sem versão e sem documento.
- **Segurança de evidence:** outputs de deploy não devem expor segredos. O aluno deve mostrar comandos e estado, não variáveis sensíveis, cookies ou chaves.

#### Arquitetura do BK

O BK entrega três peças ligadas:

1. `docs/ops/DEPLOY-ROLLBACK.md` descreve preparação, deploy, rollback e evidence.
2. `apps/api/src/scripts/validate-deploy-readiness.ts` valida as condições mínimas antes do deploy.
3. `apps/api/package.json` expõe `deploy:check`, que compila a API e executa a validação.

O fluxo esperado é:

1. A equipa cria o plano de rollback.
2. A equipa define `STUDYFLOW_RELEASE_VERSION`.
3. A equipa executa `npm --prefix apps/api run deploy:check`.
4. O script falha se a versão ou o documento de rollback estiverem em falta.
5. O `BK-MF7-08` continua o trabalho com o endpoint de health check.

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/ops/DEPLOY-ROLLBACK.md`
- CRIAR: `apps/api/src/scripts/validate-deploy-readiness.ts`
- CRIAR: `apps/api/src/scripts/validate-deploy-readiness.spec.ts`
- EDITAR: `apps/api/package.json`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK entrega apenas `RNF29`, sem alterar campos canónicos e sem antecipar o health check do próximo BK.

2. Ficheiros envolvidos:
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
- LOCALIZAÇÃO: linhas de `BK-MF7-07`, `RNF29` e sequência `BK-MF7-06 -> BK-MF7-07 -> BK-MF7-08`.

3. Instruções do que fazer.

Confirma as decisões seguintes antes de criares ficheiros:

- `CANONICO`: `RNF29` é "Deploy com rollback".
- `CANONICO`: `BK-MF7-07` é `P1`, `S12`, `Core`, owner `Daniel`, apoio `Kaua`.
- `CANONICO`: o próximo BK é `BK-MF7-08`.
- `DERIVADO`: este BK pode criar um script local `deploy:check`, porque o repositório tem API Node/NestJS e scripts npm.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é documental porque fixa o contrato antes da implementação e evita que o aluno confunda rollback com health check, CI/CD real ou infraestrutura cloud.

5. Explicação do código.

Não existe código neste passo. A validação documental evita alterar IDs, owners, sprint, prioridade ou scope, que são decisões canónicas da planificação.

6. Validação do passo.

Resultado esperado: `BK-MF7-07` continua ligado a `RNF29`, mantém `P1`, `S12`, `Core` e entrega handoff para `BK-MF7-08`.

7. Cenário negativo/erro esperado.

Se encontrares health check, autenticação, IA ou CI/CD real como obrigação deste BK, regista como fora de scope e mantém essas responsabilidades nos BKs próprios.

### Passo 2 - Criar o plano operacional de rollback

1. Objetivo funcional do passo no contexto da app.

Criar um documento de operação que explique como preparar uma release, quando fazer rollback e que evidence guardar.

2. Ficheiros envolvidos:
- CRIAR: `docs/ops/DEPLOY-ROLLBACK.md`
- LOCALIZAÇÃO: ficheiro completo `docs/ops/DEPLOY-ROLLBACK.md`.

3. Instruções do que fazer.

Cria a pasta `docs/ops` se ainda não existir. Depois cria o ficheiro `DEPLOY-ROLLBACK.md` com conteúdo operacional, sem segredos, sem tokens, sem URLs privadas e sem credenciais.

4. Código completo, correto e integrado com a app final.

```md
<!-- docs/ops/DEPLOY-ROLLBACK.md -->

# StudyFlow - deploy e rollback

## Release candidata

- Versão: preencher antes do deploy.
- Responsável técnico: preencher antes do deploy.
- Data prevista: preencher antes do deploy.
- Ambiente: staging ou produção.

## Checklist antes do deploy

<!-- Esta checklist impede publicar uma release sem condições mínimas de recuperação. -->
- Build da API executado com sucesso.
- Testes unitários críticos executados com sucesso.
- Versão definida em STUDYFLOW_RELEASE_VERSION.
- Plano de rollback revisto pela equipa.

## Deploy

1. Confirmar que a versão candidata está identificada.
2. Executar a validação de readiness.
3. Publicar a release apenas se a validação passar.
4. Guardar evidence dos comandos executados.

## Critérios para rollback

- Build publicado não inicia corretamente.
- Erro crítico impede login ou uso principal da aplicação.
- Falha operacional afeta alunos ou professores.
- Evidence mostra regressão bloqueante após deploy.

## Rollback

<!-- Os passos de rollback ficam explícitos para evitar improviso durante uma falha. -->
1. Parar a release atual.
2. Restaurar a última versão estável conhecida.
3. Confirmar que a aplicação volta a responder.
4. Registar causa, hora de início, hora de recuperação e responsável.

## Evidence obrigatória

- Comando de readiness executado.
- Resultado dos testes unitários críticos.
- Versão publicada ou restaurada.
- Decisão final: deploy mantido ou rollback executado.
```

5. Explicação do código.

Este ficheiro é Markdown, mas faz parte do contrato técnico. A primeira secção identifica a release, a checklist confirma readiness antes do deploy e a secção de rollback explica como recuperar. As mensagens não incluem passwords, cookies, tokens ou chaves privadas, porque evidence operacional deve ser partilhável em PR/defesa sem expor dados sensíveis.

6. Validação do passo.

Executa:

```bash
test -f docs/ops/DEPLOY-ROLLBACK.md
rg -n "Versão|Checklist antes do deploy|Critérios para rollback|Evidence obrigatória" docs/ops/DEPLOY-ROLLBACK.md
```

7. Cenário negativo/erro esperado.

Se o documento incluir credenciais, chaves, cookies, tokens, URLs privadas ou dados pessoais, remove essa informação antes de abrir PR.

### Passo 3 - Criar o script de readiness de deploy

1. Objetivo funcional do passo no contexto da app.

Criar uma validação executável que bloqueia deploy sem versão e sem documento de rollback.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/validate-deploy-readiness.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/scripts/validate-deploy-readiness.ts`.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/scripts` se ainda não existir. Depois cria o script abaixo. O script deve validar `STUDYFLOW_RELEASE_VERSION`, procurar o documento de rollback e lançar erro em português quando a release não estiver pronta.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/validate-deploy-readiness.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Caminho por defeito do plano de rollback quando o comando corre a partir de apps/api.
 */
export const DEFAULT_ROLLBACK_DOCUMENT_PATH = "../../docs/ops/DEPLOY-ROLLBACK.md";

/**
 * Dados mínimos que o script precisa para decidir se uma release pode avançar.
 */
export type DeployReadinessInput = {
    version: string;
    rollbackDocumentPath?: string;
};

/**
 * Resultado estruturado usado como evidence curta do gate de deploy.
 */
export type DeployReadinessResult = {
    version: string;
    rollbackDocumentPath: string;
    rollbackDocumentExists: boolean;
    ready: boolean;
    checks: string[];
};

/**
 * Valida as condições operacionais mínimas antes de fazer deploy do StudyFlow.
 *
 * @param input - Versão da release e caminho opcional do documento de rollback.
 * @returns Informação estruturada de readiness para evidence de deploy.
 */
export function validateDeployReadiness(input: DeployReadinessInput): DeployReadinessResult {
    const version = input.version.trim();
    const rollbackDocumentPath = input.rollbackDocumentPath ?? DEFAULT_ROLLBACK_DOCUMENT_PATH;
    const absoluteRollbackPath = resolve(process.cwd(), rollbackDocumentPath);
    const rollbackDocumentExists = existsSync(absoluteRollbackPath);

    // A versão é obrigatória para a equipa saber exatamente que release foi publicada.
    const versionCheck = version.length > 0 ? "versão:definida" : "versão:em-falta";

    // O documento de rollback é obrigatório porque define como recuperar se o deploy falhar.
    const rollbackCheck = rollbackDocumentExists
        ? "rollback:documento-encontrado"
        : "rollback:documento-em-falta";

    return {
        version,
        rollbackDocumentPath,
        rollbackDocumentExists,
        ready: version.length > 0 && rollbackDocumentExists,
        checks: [versionCheck, rollbackCheck],
    };
}

/**
 * Bloqueia o processo de deploy quando falta uma condição obrigatória de readiness.
 *
 * @param input - Versão da release e caminho opcional do documento de rollback.
 * @returns Informação de readiness quando todas as validações passam.
 * @throws Error quando falta a versão da release ou o documento de rollback.
 */
export function assertDeployReadiness(input: DeployReadinessInput): DeployReadinessResult {
    const result = validateDeployReadiness(input);

    if (!result.ready) {
        throw new Error("Deploy bloqueado: define STUDYFLOW_RELEASE_VERSION e cria docs/ops/DEPLOY-ROLLBACK.md.");
    }

    return result;
}

const isDirectExecution =
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
    const result = assertDeployReadiness({
        version: process.env.STUDYFLOW_RELEASE_VERSION ?? "",
        rollbackDocumentPath: process.env.STUDYFLOW_ROLLBACK_DOC_PATH,
    });

    console.log(JSON.stringify(result, null, 2));
}
```

5. Explicação do código.

`validateDeployReadiness` devolve um objeto com `ready`, checks e caminho do documento de rollback. A função não escreve ficheiros nem chama serviços externos; apenas verifica condições locais. `assertDeployReadiness` transforma esse resultado em bloqueio real, lançando erro quando falta versão ou rollback. O bloco `isDirectExecution` evita executar o script quando ele é importado pelos testes, mas permite execução direta por Node depois do build.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run build
```

Resultado esperado: a API compila e o ficheiro é emitido para `dist/scripts/validate-deploy-readiness.js`.

7. Cenário negativo/erro esperado.

Se `STUDYFLOW_RELEASE_VERSION` estiver vazio ou o documento de rollback não existir, `assertDeployReadiness` deve lançar `Deploy bloqueado: define STUDYFLOW_RELEASE_VERSION e cria docs/ops/DEPLOY-ROLLBACK.md.`

### Passo 4 - Ligar o script ao package.json da API

1. Objetivo funcional do passo no contexto da app.

Criar um comando repetível para a equipa executar a validação antes de publicar uma release.

2. Ficheiros envolvidos:
- EDITAR: `apps/api/package.json`
- LOCALIZAÇÃO: objeto `scripts` existente.

3. Instruções do que fazer.

Abre `apps/api/package.json`, mantém os scripts existentes e adiciona a entrada `deploy:check` dentro de `scripts`. Não removas `build`, `test`, `test:unit`, `start` ou outros comandos já usados pela equipa.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "deploy:check": "npm run build && node dist/scripts/validate-deploy-readiness.js"
  }
}
```

5. Explicação do código.

Esta entrada deve ser adicionada ao objeto `scripts` existente, não substitui o ficheiro inteiro. O comando compila a API primeiro e só depois executa o JavaScript gerado. Isto evita executar TypeScript por fora do fluxo normal de build e torna a evidence fácil de repetir.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run deploy:check
```

Resultado esperado: se a versão ou o documento estiverem em falta, o comando falha com a mensagem portuguesa de bloqueio.

7. Cenário negativo/erro esperado.

Se `deploy:check` for adicionado fora de `scripts`, o npm deve responder que o script não existe. Corrige a localização antes de avançar.

### Passo 5 - Criar testes unitários para readiness

1. Objetivo funcional do passo no contexto da app.

Provar o caminho principal e os dois negativos P1 sem depender de cloud, servidor HTTP ou ficheiros reais de produção.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/scripts/validate-deploy-readiness.spec.ts`
- LOCALIZAÇÃO: ficheiro completo `apps/api/src/scripts/validate-deploy-readiness.spec.ts`.

3. Instruções do que fazer.

Cria o teste abaixo. Ele usa uma pasta temporária para simular o documento de rollback e apaga tudo no fim de cada teste.

4. Código completo, correto e integrado com a app final.

```ts
// apps/api/src/scripts/validate-deploy-readiness.spec.ts
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { assertDeployReadiness, validateDeployReadiness } from "./validate-deploy-readiness.js";

type RollbackFixture = {
    tempDir: string;
    rollbackDocumentPath: string;
    cleanup(): void;
};

describe("validateDeployReadiness", () => {
    let fixture: RollbackFixture;

    beforeEach(() => {
        fixture = createRollbackFixture();
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("aprova uma release com versão e documento de rollback", () => {
        const result = assertDeployReadiness({
            version: "2026.06.27",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(true);
        expect(result.checks).toContain("versão:definida");
        expect(result.checks).toContain("rollback:documento-encontrado");
    });

    it("bloqueia uma release sem versão", () => {
        // O negativo sem versão impede publicar algo que a equipa não consegue identificar depois.
        const result = validateDeployReadiness({
            version: "   ",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("versão:em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "   ",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });

    it("bloqueia uma release sem documento de rollback", () => {
        // Remover o documento simula o erro operacional que deixaria a equipa sem recuperação definida.
        rmSync(fixture.rollbackDocumentPath, { force: true });

        const result = validateDeployReadiness({
            version: "2026.06.27",
            rollbackDocumentPath: fixture.rollbackDocumentPath,
        });

        expect(result.ready).toBe(false);
        expect(result.checks).toContain("rollback:documento-em-falta");
        expect(() =>
            assertDeployReadiness({
                version: "2026.06.27",
                rollbackDocumentPath: fixture.rollbackDocumentPath,
            }),
        ).toThrow("Deploy bloqueado");
    });
});

/**
 * Cria um documento de rollback temporário para os testes não dependerem do estado real de docs/ops.
 *
 * @returns Caminho temporário do documento e função de limpeza.
 */
function createRollbackFixture(): RollbackFixture {
    const tempDir = mkdtempSync(join(tmpdir(), "studyflow-deploy-"));
    const rollbackDocumentPath = join(tempDir, "DEPLOY-ROLLBACK.md");

    writeFileSync(rollbackDocumentPath, "# Plano de rollback\n", "utf8");

    return {
        tempDir,
        rollbackDocumentPath,
        cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
    };
}
```

5. Explicação do código.

O primeiro teste prova o caminho principal: versão definida e documento existente devolvem `ready: true`. O segundo teste prova o negativo sem versão e confirma que `assertDeployReadiness` bloqueia a release. O terceiro teste remove o ficheiro temporário para provar o negativo sem plano de rollback. A fixture temporária evita depender de ficheiros reais do professor ou de estado local de outro aluno.

6. Validação do passo.

Executa:

```bash
npm --prefix apps/api run test:unit -- validate-deploy-readiness
```

Resultado esperado: a suite passa com três testes.

7. Cenário negativo/erro esperado.

Se removeres o teste sem versão ou o teste sem documento, o BK deixa de cumprir a exigência P1 de dois negativos.

### Passo 6 - Executar a validação de readiness

1. Objetivo funcional do passo no contexto da app.

Confirmar que o comando final aprova a release correta e bloqueia a release incompleta.

2. Ficheiros envolvidos:
- REVER: `apps/api/package.json`
- REVER: `apps/api/src/scripts/validate-deploy-readiness.ts`
- REVER: `docs/ops/DEPLOY-ROLLBACK.md`
- LOCALIZAÇÃO: script `deploy:check` e output terminal.

3. Instruções do que fazer.

Executa primeiro o caminho principal com versão definida e documento existente. Depois executa os dois negativos: sem versão e com caminho de rollback inexistente.

4. Código completo, correto e integrado com a app final.

```bash
STUDYFLOW_RELEASE_VERSION=2026.06.27 npm --prefix apps/api run deploy:check
npm --prefix apps/api run deploy:check
STUDYFLOW_RELEASE_VERSION=2026.06.27 STUDYFLOW_ROLLBACK_DOC_PATH=../../docs/ops/ROLLBACK-INEXISTENTE.md npm --prefix apps/api run deploy:check
```

5. Explicação do código.

O primeiro comando é o caminho principal. O segundo deve falhar porque não define `STUDYFLOW_RELEASE_VERSION`. O terceiro deve falhar porque aponta para um documento de rollback inexistente. Esta sequência prova que o deploy só avança quando as condições mínimas estão presentes.

6. Validação do passo.

Resultado esperado:

- Com versão e documento: `ready` fica `true`.
- Sem versão: erro `Deploy bloqueado`.
- Sem documento: erro `Deploy bloqueado`.

7. Cenário negativo/erro esperado.

Se algum negativo permitir deploy, considera o BK incompleto e corrige o script antes de abrir PR.

### Passo 7 - Preparar evidence e handoff para health check

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com evidence defendível e deixar claro o que o `BK-MF7-08` deve reutilizar.

2. Ficheiros envolvidos:
- REVER: `docs/ops/DEPLOY-ROLLBACK.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- LOCALIZAÇÃO: secções finais deste guia e descrição da PR.

3. Instruções do que fazer.

No PR ou relatório técnico, regista comandos executados, resultado esperado, resultado observado, dois negativos P1 e risco restante. Não declares produção pronta antes do health check do próximo BK.

4. Código completo, correto e integrado com a app final.

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- validate-deploy-readiness
STUDYFLOW_RELEASE_VERSION=2026.06.27 npm --prefix apps/api run deploy:check
```

5. Explicação do código.

Estes comandos representam a evidence mínima positiva: build, testes e deploy check com versão. Os negativos do passo anterior complementam esta prova. O handoff para `BK-MF7-08` deve dizer que o deploy check existe, mas que ainda falta validar a saúde da API por endpoint.

6. Validação do passo.

Resultado esperado: evidence positiva e negativa completa, sem passwords, tokens, cookies, chaves privadas, materiais privados ou respostas IA.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona", sem comandos, outputs e negativos, o BK não cumpre a defesa técnica de `RNF29`.

#### Critérios de aceite

- `RNF29` fica demonstrável por documento, script, comando npm, testes e evidence.
- O guia mantém `bk_id`, `macro`, owner, apoio, prioridade, sprint, esforço, `rf_rnf` e `proximo_bk` alinhados com matriz e backlog.
- O comando `deploy:check` existe em `apps/api/package.json`.
- O script `validate-deploy-readiness.ts` compila sem erros.
- Os testes cobrem caminho principal, negativo sem versão e negativo sem documento.
- O documento `docs/ops/DEPLOY-ROLLBACK.md` existe e não contém segredos.
- O health check continua reservado para `BK-MF7-08`.
- Nenhuma evidence expõe passwords, tokens, cookies, chaves privadas, prompts privados, materiais privados ou respostas IA completas.

#### Validação final

Executa:

```bash
npm --prefix apps/api run build
npm --prefix apps/api run test:unit -- validate-deploy-readiness
STUDYFLOW_RELEASE_VERSION=2026.06.27 npm --prefix apps/api run deploy:check
npm --prefix apps/api run deploy:check
STUDYFLOW_RELEASE_VERSION=2026.06.27 STUDYFLOW_ROLLBACK_DOC_PATH=../../docs/ops/ROLLBACK-INEXISTENTE.md npm --prefix apps/api run deploy:check
```

Resultado esperado:

- `build`: passa.
- `test:unit`: passa.
- `deploy:check` com versão e documento: passa com `ready: true`.
- `deploy:check` sem versão: falha com `Deploy bloqueado`.
- `deploy:check` sem documento: falha com `Deploy bloqueado`.

#### Evidence para PR/defesa

- `proof_build`: output de `npm --prefix apps/api run build`.
- `proof_unit`: output de `npm --prefix apps/api run test:unit -- validate-deploy-readiness`.
- `proof_deploy_check_ok`: output de `STUDYFLOW_RELEASE_VERSION=2026.06.27 npm --prefix apps/api run deploy:check`.
- `proof_negativo_sem_versao`: erro esperado de `npm --prefix apps/api run deploy:check`.
- `proof_negativo_sem_documento`: erro esperado de `STUDYFLOW_RELEASE_VERSION=2026.06.27 STUDYFLOW_ROLLBACK_DOC_PATH=../../docs/ops/ROLLBACK-INEXISTENTE.md npm --prefix apps/api run deploy:check`.
- `proof_rollback_doc`: confirmação de `docs/ops/DEPLOY-ROLLBACK.md`.
- `proof_privacidade`: confirmação de que a evidence não contém passwords, tokens, cookies, chaves privadas, prompts privados, materiais privados ou respostas IA completas.

#### Handoff

Depois deste BK, o `BK-MF7-08` recebe:

- comando `deploy:check` validado;
- plano de rollback documentado;
- evidence positiva e negativa;
- limite explícito de que produção só fica completa depois do endpoint de health check.

O próximo BK não deve recriar o rollback. Deve apenas acrescentar a prova de que a API responde de forma observável.

#### Changelog

- 2026-06-27: Guia corrigido para cumprir o contrato final de passos, evidence, português de Portugal com acentuação, JSDoc, comentários didáticos, comando `deploy:check` e dois negativos P1.
