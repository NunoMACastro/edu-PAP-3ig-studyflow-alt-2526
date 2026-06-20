# BK-MF5-12 - Suportar ≥ 200 utilizadores simultâneos por escola.

## Header

- `doc_id`: `GUIA-BK-MF5-12`
- `bk_id`: `BK-MF5-12`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF10`
- `fase_documental`: `Fase 2`
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais criar um smoke test de concorrência para provar que a API do StudyFlow consegue responder a 200 pedidos autenticados em simultâneo num ambiente de teste que representa uma escola.

#### Importância

`RNF10` é CANONICO e define que o StudyFlow deve suportar `≥ 200` utilizadores simultâneos por escola. Este BK não substitui um teste de carga profissional, mas dá uma prova inicial, repetível e segura: se 200 pedidos autenticados falharem, devolverem `401` por falta de sessão, tiverem erros de rede ou gerarem respostas `5xx`, a equipa sabe que a escala mínima ainda não está demonstrada.

#### Scope-in

- Criar `real_dev/api/src/scripts/smoke-200-users.mjs`.
- Editar `real_dev/api/package.json` para expor `npm run smoke:200-users`.
- Usar `fetch` nativo do Node.js, sem dependências novas.
- Usar `/api/auth/me` como endpoint barato e real, protegido por sessão.
- Exigir cookie de teste em `STUDYFLOW_SMOKE_COOKIE`.
- Medir `averageMs`, `p95Ms`, `maxMs`, contagem por status HTTP, erros de rede e respostas inesperadas.
- Falhar quando o endpoint autenticado devolver `401`, `403`, outro status inesperado, erro de rede ou `5xx`.
- Não imprimir body da resposta, cookie, dados pessoais, nomes, emails, materiais, prompts ou respostas IA.

#### Scope-out

- Criar um sistema profissional de load testing.
- Criar tenancy, entidade `Escola` ou contrato institucional novo.
- Alterar autenticação, sessões, roles, ownership, membership, materiais, turmas, salas ou IA.
- Criar endpoint novo só para o smoke.
- Usar produção ou cookies pessoais reais.
- Guardar métricas remotas, logs persistentes ou dados pessoais.
- Adicionar dependências npm novas.
- Corrigir `BK-MF6-01`; esse BK fica fora deste escopo.

#### Estado antes e depois

- **Antes:** não há comando documentado que simule 200 pedidos autenticados em simultâneo; o guia antigo podia aceitar sucesso falso com respostas `401` e misturava passos de UI que não pertenciam ao requisito.
- **Depois:** existe um script configurável, um comando npm, regras claras de status esperado, cenário negativo sem cookie, evidence com métricas e handoff para MF6 sem alterar o código real nesta fase documental.

#### Pre-requisitos

- Ler `RNF10` em `docs/RNF.md`.
- Rever `BK-MF5-12` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever `BK-MF5-12` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `BK-MF5-12` em `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever a sequência MF5 em `docs/planificacao/backlogs/MF-VIEWS.md`.
- Rever `BK-MF5-11`, porque este BK vem depois do budget de respostas IA.
- Rever `BK-MF6-01`, porque o handoff vai para qualidade, segurança e performance.
- Rever `real_dev/api/src/modules/auth/auth.controller.ts`.
- Rever `real_dev/api/src/common/guards/session.guard.ts`.
- Rever `real_dev/api/src/modules/auth/session.service.ts`.
- Rever `real_dev/api/package.json`.
- Preparar ambiente local ou staging isolado com dados de teste.
- Obter um cookie de sessão de teste criado por login de utilizador de desenvolvimento, nunca por conta real.

#### Glossário

- **Concorrência:** vários pedidos enviados ao mesmo tempo, sem esperar que o pedido anterior termine.
- **Utilizador simultâneo:** neste BK, é representado por um pedido autenticado concorrente. DERIVADO: enquanto não houver contrato canónico de tenant/escola, o ambiente de teste isolado representa uma escola.
- **Smoke test:** teste rápido que detecta falhas grandes antes de testes de carga mais completos.
- **`p95`:** percentil em que 95% das durações ficam abaixo desse valor. Ajuda a perceber a cauda lenta, não só a média.
- **Status esperado:** código HTTP que prova o caminho correto. Para `/api/auth/me`, o esperado é `200` quando o cookie de sessão é válido.
- **Status inesperado:** qualquer código diferente do esperado. Num smoke autenticado, `401` e `403` são falhas, não sucesso.
- **Erro de rede:** falha de ligação, timeout local, DNS, porta fechada ou interrupção antes de receber resposta HTTP.
- **Evidence técnica:** output JSON, comando executado, ambiente usado e interpretação do resultado.
- **Cookie de teste:** identificador de sessão de ambiente local ou staging, sem dados reais de aluno ou professor.

#### Conceitos teóricos essenciais

- **Escalabilidade mínima:** `RNF10` não pede só que a aplicação arranque; pede que aguente atividade simultânea. O smoke envia 200 pedidos ao mesmo tempo para descobrir falhas óbvias de sessão, API, ligações e estabilidade.
- **Ambiente que representa uma escola:** a documentação atual não define uma entidade `Escola` ou tenant institucional. DERIVADO: este BK usa um ambiente isolado de teste como representação de uma escola. Se a equipa vier a criar tenancy real, este smoke deve receber o identificador canónico dessa escola.
- **Endpoint barato:** `/api/auth/me` valida sessão e devolve utilizador público. É útil porque existe no `AuthController`, não altera dados e não força IA, uploads ou queries pesadas.
- **Sessão HttpOnly:** a sessão real é guardada em cookie opaco. O script recebe esse cookie por variável de ambiente e não o imprime, para não transformar evidence em fuga de sessão.
- **`401` não prova escala:** se todos os pedidos devolverem `401`, a API apenas recusou pedidos sem sessão. Isso não demonstra 200 utilizadores autenticados.
- **Contagem por status:** contar `2xx`, `4xx` e `5xx` evita esconder falhas. O smoke falha quando qualquer resposta não corresponde ao status esperado.
- **Média, p95 e máximo:** a média pode parecer boa mesmo com alguns pedidos muito lentos. O `p95` e o máximo ajudam a defender o comportamento observado.
- **Privacidade na evidence:** o body de `/api/auth/me` pode conter dados públicos do utilizador. O script cancela o body e guarda apenas status e duração.
- **Sem dependência nova:** Node.js LTS já inclui `fetch`. Usar o runtime existente mantém o BK pequeno e adequado ao 12.º ano.
- **Handoff para MF6:** este BK entrega uma base de evidence de concorrência; MF6 aprofunda tarefas assíncronas, segurança e performance estrutural.

#### Arquitetura do BK

O script `smoke-200-users.mjs` fica em `real_dev/api/src/scripts` porque é uma validação operacional da API. O comando `smoke:200-users` fica em `real_dev/api/package.json`, junto dos scripts de build, seed e testes já existentes. O endpoint padrão é `GET /api/auth/me`, criado em MF0 e protegido por `SessionGuard`. O script envia 200 pedidos concorrentes com o mesmo cookie de teste, conta os status, calcula métricas e termina com exit code `1` quando a evidence não prova o cenário esperado.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/scripts/smoke-200-users.mjs`
- EDITAR: `real_dev/api/package.json`
- REVER: `real_dev/api/src/modules/auth/auth.controller.ts`
- REVER: `real_dev/api/src/common/guards/session.guard.ts`
- REVER: `real_dev/api/src/modules/auth/session.service.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- REVER: `docs/planificacao/backlogs/MF-VIEWS.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato RNF10 e limite por escola

1. Objetivo funcional do passo no contexto da app.

Confirmar que este BK mede concorrência autenticada e não altera contratos funcionais da aplicação.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - LOCALIZAÇÃO: requisito `RNF10` e linha canónica de `BK-MF5-12`.

3. Instruções do que fazer.

Confirma que `RNF10` fala em `≥ 200` utilizadores simultâneos por escola. Como a documentação atual não define entidade `Escola` nem tenant institucional, regista a decisão DERIVADO: o smoke corre num ambiente isolado de teste que representa uma escola. Não cries campo, endpoint ou modelo novo para escola neste BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita inventar uma entidade institucional que ainda não existe nos contratos canónicos.

5. Explicação do código.

Não há código porque a decisão importante é de escopo. O BK mede capacidade concorrente sobre um endpoint real e autenticado, mas não cria domínio novo. Isto evita confundir `escola` com `turma`, `schoolYear` ou `classId`.

6. Validação do passo.

Confirma que o header mantém `RNF10`, `P1`, `S10`, `Core` e `proximo_bk: BK-MF6-01`.

7. Cenário negativo/erro esperado.

Se alguém propuser criar `schoolId` só para o smoke, rejeita a alteração neste BK e regista como decisão futura fora de escopo.

### Passo 2 - Confirmar endpoint autenticado de baixo custo

1. Objetivo funcional do passo no contexto da app.

Escolher um endpoint real que valide sessão sem alterar dados, sem executar IA e sem expor conteúdo sensível.

2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/modules/auth/auth.controller.ts`
    - REVER: `real_dev/api/src/common/guards/session.guard.ts`
    - REVER: `real_dev/api/src/modules/auth/session.service.ts`
    - LOCALIZAÇÃO: método `AuthController.me`, `@Get("me")` e `@UseGuards(SessionGuard)`.

3. Instruções do que fazer.

Confirma que `GET /api/auth/me` existe, usa `SessionGuard` e devolve apenas o utilizador público da sessão. Este endpoint é adequado para smoke porque confirma que a sessão funciona e não cria, altera ou apaga dados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O endpoint já existe em MF0; este BK apenas o reutiliza como alvo de medição.

5. Explicação do código.

Não há código novo porque reutilizar `/api/auth/me` preserva a arquitetura existente. Se o smoke criasse um endpoint novo, estaria a medir um caminho artificial e não a API real que os alunos já usam.

6. Validação do passo.

Confirma que uma chamada autenticada a `/api/auth/me` deve devolver `200` e que uma chamada sem cookie deve devolver `401`.

7. Cenário negativo/erro esperado.

Se `/api/auth/me` devolver `401` com cookie válido, corrige a sessão ou o ambiente de teste antes de executar o smoke de 200 pedidos.

### Passo 3 - Criar script de smoke autenticado

1. Objetivo funcional do passo no contexto da app.

Criar um script Node que envie 200 pedidos concorrentes, falhe em status inesperado e nunca imprima dados sensíveis.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/scripts/smoke-200-users.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém o endpoint padrão `/api/auth/me`, exige `STUDYFLOW_SMOKE_COOKIE` e deixa `STUDYFLOW_SMOKE_EXPECTED_STATUS` com valor padrão `200`. Não leias o body da resposta para a consola.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/scripts/smoke-200-users.mjs
import { performance } from "node:perf_hooks";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const DEFAULT_PATH = "/api/auth/me";
const DEFAULT_USERS = 200;
const DEFAULT_EXPECTED_STATUS = 200;

const baseUrl = process.env.STUDYFLOW_BASE_URL ?? DEFAULT_BASE_URL;
const path = process.env.STUDYFLOW_SMOKE_PATH ?? DEFAULT_PATH;
const concurrency = readPositiveInteger("STUDYFLOW_SMOKE_USERS", DEFAULT_USERS);
const expectedStatus = readPositiveInteger(
  "STUDYFLOW_SMOKE_EXPECTED_STATUS",
  DEFAULT_EXPECTED_STATUS,
);
const schoolContext = process.env.STUDYFLOW_SMOKE_SCHOOL_CONTEXT ?? "escola-teste-isolada";
const cookie = process.env.STUDYFLOW_SMOKE_COOKIE;

if (!cookie) {
  throw new Error(
    "STUDYFLOW_SMOKE_COOKIE é obrigatório para provar 200 pedidos autenticados. " +
      "Sem cookie, /api/auth/me devolve 401 e isso não demonstra RNF10.",
  );
}

const url = new URL(path, baseUrl).toString();

/**
 * Lê uma variável numérica positiva sem aceitar valores silenciosamente inválidos.
 *
 * @param {string} name Nome da variável de ambiente.
 * @param {number} fallback Valor usado quando a variável não existe.
 * @returns {number} Número inteiro positivo.
 */
function readPositiveInteger(name, fallback) {
  const rawValue = process.env[name];
  const value = rawValue === undefined ? fallback : Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo.`);
  }

  return value;
}

/**
 * Calcula percentil numa lista de durações ordenada.
 *
 * @param {number[]} sortedValues Durações ordenadas de forma crescente.
 * @param {number} percentileRank Percentil entre 0 e 100.
 * @returns {number} Valor observado no percentil pedido.
 */
function percentile(sortedValues, percentileRank) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentileRank / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

/**
 * Executa um pedido autenticado e devolve apenas metadados técnicos.
 *
 * @param {number} index Número do pedido concorrente.
 * @returns {Promise<{ index: number, status: number, durationMs: number }>} Resultado seguro para evidence.
 */
async function runRequest(index) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: {
      Cookie: cookie,
      // O cabeçalho mantém compatibilidade com a proteção CSRF já usada pela UI, sem ler o cookie HttpOnly.
      "x-studyflow-csrf": "1",
    },
  });

  // O body pode conter dados públicos da sessão; cancelamos a stream e nunca o imprimimos.
  if (response.body) {
    await response.body.cancel();
  }

  return {
    index,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt),
  };
}

const settledResults = await Promise.allSettled(
  Array.from({ length: concurrency }, (_, index) => runRequest(index)),
);

const networkErrors = settledResults.filter((result) => result.status === "rejected");
const responses = settledResults
  .filter((result) => result.status === "fulfilled")
  .map((result) => result.value);

const durations = responses.map((result) => result.durationMs).sort((a, b) => a - b);
const statusCounts = responses.reduce((counts, result) => {
  counts[result.status] = (counts[result.status] ?? 0) + 1;
  return counts;
}, {});
const unexpectedStatuses = responses.filter((result) => result.status !== expectedStatus);
const serverErrors = responses.filter((result) => result.status >= 500);
const averageMs = durations.length
  ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
  : 0;

const summary = {
  schoolContext,
  path,
  concurrency,
  expectedStatus,
  completedRequests: responses.length,
  networkErrorCount: networkErrors.length,
  unexpectedStatusCount: unexpectedStatuses.length,
  serverErrorCount: serverErrors.length,
  statusCounts,
  averageMs,
  p95Ms: percentile(durations, 95),
  maxMs: durations.at(-1) ?? 0,
};

console.log(JSON.stringify(summary, null, 2));

if (networkErrors.length > 0 || unexpectedStatuses.length > 0 || serverErrors.length > 0) {
  process.exitCode = 1;
}
```

5. Explicação do código.

Este script começa por ler `STUDYFLOW_BASE_URL`, `STUDYFLOW_SMOKE_PATH`, `STUDYFLOW_SMOKE_USERS`, `STUDYFLOW_SMOKE_EXPECTED_STATUS`, `STUDYFLOW_SMOKE_SCHOOL_CONTEXT` e `STUDYFLOW_SMOKE_COOKIE`. A validação de `readPositiveInteger` evita que um valor como `0`, `-1` ou texto inválido seja aceite e produza uma evidence enganadora.

O cookie é obrigatório porque `/api/auth/me` é protegido por `SessionGuard`. Sem esta validação, 200 pedidos sem sessão poderiam devolver `401` e o smoke antigo podia parecer bem-sucedido. O script envia sempre o cookie no cabeçalho `Cookie`, mas nunca o imprime. O cabeçalho `x-studyflow-csrf` mantém compatibilidade com a proteção CSRF já usada pelo frontend, sem ler o cookie HttpOnly no browser.

`runRequest` mede a duração de cada pedido com `performance.now()`, guarda apenas `status` e `durationMs`, e cancela o body. Esta decisão protege privacidade: mesmo que `/api/auth/me` devolva dados públicos da sessão, a evidence não fica com nomes, emails ou identificadores do utilizador.

`Promise.allSettled` permite contar erros de rede sem esconder falhas. Se um pedido falhar antes de receber resposta HTTP, o summary aumenta `networkErrorCount`. Se a API responder com status diferente de `expectedStatus`, o summary aumenta `unexpectedStatusCount`. Se houver `5xx`, `serverErrorCount` também fica acima de zero. Qualquer uma destas situações termina o processo com exit code `1`.

As métricas `averageMs`, `p95Ms` e `maxMs` ajudam a defender o comportamento observado. O BK não inventa um orçamento de latência para `RNF10`; mede os valores e deixa a equipa comparar com o ambiente de teste. O que é obrigatório para este smoke é completar 200 pedidos autenticados com o status esperado e sem erros de rede ou servidor.

6. Validação do passo.

Executa o script com um cookie de teste válido e confirma que o JSON mostra `completedRequests: 200`, `unexpectedStatusCount: 0`, `serverErrorCount: 0`, `networkErrorCount: 0` e `statusCounts` com `200: 200`.

7. Cenário negativo/erro esperado.

Executa sem `STUDYFLOW_SMOKE_COOKIE`. O script deve falhar antes de enviar pedidos e mostrar erro a explicar que o cookie é obrigatório para provar 200 pedidos autenticados.

### Passo 4 - Adicionar comando npm sem dependências novas

1. Objetivo funcional do passo no contexto da app.

Tornar o smoke repetível por comando npm, preservando scripts já existentes.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/api/package.json`
    - LOCALIZAÇÃO: propriedade `scripts`.

3. Instruções do que fazer.

Adiciona apenas o script `smoke:200-users`. Não alteres versões, dependências, `type`, nome do pacote ou scripts existentes.

4. Código completo, correto e integrado com a app final.

```json
"scripts": {
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:e2e": "nest build && node dist/scripts/start-e2e-api.js",
  "seed:dev-users": "nest build && node dist/scripts/seed-development-users.js",
  "smoke:200-users": "node src/scripts/smoke-200-users.mjs",
  "test": "jest --config ./jest.config.cjs --passWithNoTests",
  "test:unit": "npm test"
}
```

5. Explicação do código.

Este bloco adiciona um comando operacional sem dependências novas. O script aponta para `src/scripts/smoke-200-users.mjs` porque o smoke é executado diretamente por Node.js, não pelo build Nest. JSON não permite comentários dentro do bloco; por isso a explicação fica fora do código.

O comando fica junto dos scripts de build, seed e testes para que qualquer aluno consiga repetir a evidence com `npm run smoke:200-users`. Preservar os scripts existentes evita quebrar validações anteriores da API.

6. Validação do passo.

Dentro de `real_dev/api`, executa `npm run smoke:200-users` com as variáveis de ambiente necessárias. O comando deve chamar o ficheiro criado no passo anterior.

7. Cenário negativo/erro esperado.

Se o comando falhar com `Cannot find module`, confirma o caminho `real_dev/api/src/scripts/smoke-200-users.mjs` e o nome exato `smoke:200-users`.

### Passo 5 - Preparar ambiente e executar caminho principal

1. Objetivo funcional do passo no contexto da app.

Executar o smoke em ambiente isolado com sessão de teste e recolher evidence sem dados pessoais.

2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/scripts/seed-development-users.ts`
    - REVER: terminal do ambiente local ou staging.
    - LOCALIZAÇÃO: comando de execução e output JSON.

3. Instruções do que fazer.

Arranca a API num ambiente de teste. Faz login com uma conta de desenvolvimento e copia apenas o valor do cookie de sessão para uma variável local do terminal. Não coloques o cookie no repositório, em prints públicos, em relatórios partilhados ou em commits.

4. Código completo, correto e integrado com a app final.

```bash
cd real_dev/api

STUDYFLOW_BASE_URL="http://127.0.0.1:3000" \
STUDYFLOW_SMOKE_PATH="/api/auth/me" \
STUDYFLOW_SMOKE_USERS="200" \
STUDYFLOW_SMOKE_EXPECTED_STATUS="200" \
STUDYFLOW_SMOKE_SCHOOL_CONTEXT="escola-teste-isolada" \
STUDYFLOW_SMOKE_COOKIE="sf_sid=valor_de_teste_local" \
npm run smoke:200-users
```

5. Explicação do código.

O comando define o cenário completo: base URL local, endpoint autenticado, 200 pedidos, status esperado `200`, contexto escolar de teste e cookie de sessão. O valor `sf_sid=valor_de_teste_local` é um marcador; no terminal real deve ser substituído por um cookie de desenvolvimento válido.

`STUDYFLOW_SMOKE_SCHOOL_CONTEXT` não cria uma escola no domínio. É apenas uma etiqueta de evidence para mostrar que o teste representa um ambiente isolado de uma escola. Esta decisão é DERIVADO porque ainda não existe contrato canónico de tenant/escola.

6. Validação do passo.

O output esperado deve ter esta forma:

```json
{
  "schoolContext": "escola-teste-isolada",
  "path": "/api/auth/me",
  "concurrency": 200,
  "expectedStatus": 200,
  "completedRequests": 200,
  "networkErrorCount": 0,
  "unexpectedStatusCount": 0,
  "serverErrorCount": 0,
  "statusCounts": {
    "200": 200
  },
  "averageMs": 35,
  "p95Ms": 80,
  "maxMs": 140
}
```

Os valores de duração são exemplos de formato de output, não metas canónicas. A validação obrigatória deste BK é `completedRequests: 200`, zero erros e todos os status iguais a `200`.

7. Cenário negativo/erro esperado.

Se o output mostrar `statusCounts` com `401`, `unexpectedStatusCount` maior que zero ou exit code `1`, a sessão de teste não está válida ou o endpoint não está a aceitar os pedidos autenticados. Não marques o BK como concluído.

### Passo 6 - Executar negativos de sessão, status e privacidade

1. Objetivo funcional do passo no contexto da app.

Provar que o smoke falha quando a evidence não demonstra utilizadores autenticados e que não expõe dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/scripts/smoke-200-users.mjs`
    - REVER: terminal de execução.
    - LOCALIZAÇÃO: cenários negativos e output observado.

3. Instruções do que fazer.

Executa três negativos: sem cookie, com status esperado errado e com API desligada. Regista apenas outputs sem cookie real.

4. Código completo, correto e integrado com a app final.

```bash
cd real_dev/api

STUDYFLOW_SMOKE_USERS="200" npm run smoke:200-users

STUDYFLOW_SMOKE_COOKIE="sf_sid=valor_de_teste_local" \
STUDYFLOW_SMOKE_EXPECTED_STATUS="204" \
npm run smoke:200-users

STUDYFLOW_BASE_URL="http://127.0.0.1:3999" \
STUDYFLOW_SMOKE_COOKIE="sf_sid=valor_de_teste_local" \
npm run smoke:200-users
```

5. Explicação do código.

O primeiro comando confirma que o cookie é obrigatório. O segundo confirma que o script não aceita qualquer status como sucesso: se `/api/auth/me` devolver `200` mas o esperado for `204`, o smoke deve falhar. O terceiro confirma que erros de rede contam como falha e não desaparecem da evidence.

Estes negativos evitam o erro antigo do guia: considerar `401` ou falhas de ligação como uma prova válida de escala. Também confirmam que o output não inclui cookie, body, nomes, emails ou dados pessoais.

6. Validação do passo.

Todos os negativos devem terminar com exit code diferente de zero. O output pode mostrar contagens e mensagem técnica, mas não pode revelar o cookie nem o body de `/api/auth/me`.

7. Cenário negativo/erro esperado.

Se algum negativo terminar com exit code `0`, volta ao script e confirma as condições finais: `networkErrors.length > 0`, `unexpectedStatuses.length > 0` ou `serverErrors.length > 0` devem definir `process.exitCode = 1`.

### Passo 7 - Preparar evidence e handoff para MF6

1. Objetivo funcional do passo no contexto da app.

Registar uma evidence curta e reutilizável para PR, defesa e continuação da MF6.

2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/scripts/smoke-200-users.mjs`
    - REVER: `real_dev/api/package.json`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
    - LOCALIZAÇÃO: secções `Evidence para PR/defesa` e `Handoff`.

3. Instruções do que fazer.

Guarda no PR ou defesa apenas o comando, o contexto do ambiente, o summary JSON sem cookie e a interpretação. Não incluas prints com cookies, dados reais, body da sessão ou informação privada.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo organiza evidence e handoff depois de o script e o comando npm já estarem definidos.

5. Explicação do código.

Não há código novo porque a entrega técnica já ficou nos passos anteriores. O valor deste passo é impedir que a próxima macrofase tenha de adivinhar que métrica foi medida, que endpoint foi usado e que limitações ficaram assumidas.

6. Validação do passo.

Confirma que a evidence contém `schoolContext`, `concurrency`, `completedRequests`, `statusCounts`, `averageMs`, `p95Ms`, `maxMs` e resultado dos negativos.

7. Cenário negativo/erro esperado.

Se a evidence mostrar cookie, body de sessão, email, nome real ou outro dado pessoal, remove esse conteúdo antes de partilhar.

#### Critérios de aceite

- `real_dev/api/src/scripts/smoke-200-users.mjs` existe e usa apenas APIs nativas do Node.js.
- `real_dev/api/package.json` tem `smoke:200-users` sem remover scripts existentes.
- O smoke exige `STUDYFLOW_SMOKE_COOKIE` para o cenário autenticado.
- 200 pedidos concorrentes a `/api/auth/me` devolvem todos o status esperado `200`.
- `unexpectedStatusCount`, `serverErrorCount` e `networkErrorCount` ficam em `0` no caminho principal.
- O cenário sem cookie falha antes de enviar pedidos.
- O cenário com status esperado errado termina com exit code `1`.
- O cenário com API indisponível termina com exit code `1`.
- O output não imprime cookie, body da sessão, nomes, emails, materiais, prompts ou respostas IA.
- A decisão "escola de teste isolada" fica marcada como DERIVADO enquanto não existir contrato canónico de tenant/escola.
- A evidence inclui média, p95, máximo, contagem por status e interpretação do resultado.

#### Validação final

- Executa `npm run smoke:200-users` com cookie de teste válido.
- Confirma `completedRequests: 200`.
- Confirma `statusCounts` com `200: 200`.
- Confirma `unexpectedStatusCount: 0`.
- Confirma `serverErrorCount: 0`.
- Confirma `networkErrorCount: 0`.
- Executa o negativo sem `STUDYFLOW_SMOKE_COOKIE`.
- Executa o negativo com `STUDYFLOW_SMOKE_EXPECTED_STATUS="204"`.
- Executa o negativo com API desligada ou porta errada.
- Confirma que nenhum output contém cookie real ou body de sessão.
- Erros comuns a evitar:
  - aceitar `401` como sucesso;
  - testar sem cookie e chamar isso utilizador simultâneo;
  - imprimir body de `/api/auth/me`;
  - criar entidade `Escola` sem contrato canónico;
  - alterar autenticação ou sessão para facilitar o smoke.

#### Evidence para PR/defesa

- Comando usado, com cookie ocultado: `STUDYFLOW_SMOKE_COOKIE="[oculto]" npm run smoke:200-users`.
- Ambiente: local ou staging isolado, representando uma escola de teste.
- Output JSON do caminho principal sem dados sensíveis.
- Output dos três negativos sem cookie real.
- Interpretação curta:
  - `200` pedidos autenticados completaram;
  - todos devolveram o status esperado;
  - zero erros de rede;
  - zero respostas `5xx`;
  - p95 e máximo registados para comparação futura.

#### Handoff

O próximo BK, `BK-MF6-01`, deve consumir esta evidence como ponto de partida para qualidade, segurança e performance. Este BK entrega um smoke operacional de concorrência autenticada, mas não entrega filas, processamento assíncrono, sandbox de documentos, tenancy institucional ou escalabilidade horizontal. Se MF6 precisar de contrato real por escola/tenant, deve criar esse contrato em escopo próprio e atualizar este smoke para receber o identificador canónico.

#### Changelog

- 2026-06-20: Corrigido o guia para impedir sucesso falso com `401`, remover passos genéricos de UI, acrescentar comando npm, explicar a decisão DERIVADO sobre escola de teste isolada e tornar a evidence de `RNF10` mensurável e segura.
