# CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5

## Header

- `doc_id`: `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5`
- `project`: `StudyFlow`
- `macro`: `MF5`
- `implementation_root`: `real_dev`
- `modo`: `corrigir_auditoria`
- `audit_report_source`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`
- `bk_ids`: `BK-MF5-01`, `BK-MF5-03`, `BK-MF5-12`
- `finding_ids`: `MF5-AUD-003`, `MF5-AUD-004`
- `fix_severities`: `P0`, `P1`, `P2`, `P3`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `status`: `CORRIGIDO`
- `created_at`: `2026-06-22`
- `updated_at`: `2026-06-22`

## Resultado geral

Resultado final: `CORRIGIDO`.

A execucao resolveu os dois findings `P2` abertos no relatorio de auditoria `AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`:

- `MF5-AUD-003`: o smoke `mf5-interface-smoke.spec.ts` ja nao fica `skipped` quando nao existem variaveis `STUDYFLOW_E2E_*`; agora usa as contas seedadas do ambiente E2E local como fallback, mantendo overrides por ambiente.
- `MF5-AUD-004`: o smoke `smoke:200-users` ja consegue obter sessao de teste por login real opcional, sem imprimir cookie, e foi executado com `200` pedidos autenticados a `GET /api/auth/me` com `200/200` respostas `200`.

O historico anterior de `MF5-AUD-002` fica preservado como finding ja corrigido em execucao anterior. Esta execucao atual incidiu apenas nos findings presentes no relatorio de auditoria fonte.

Nao foram alterados BKs canonicos, matriz, backlog, prompts ou commits. As alteracoes ficaram dentro de `real_dev/` e deste relatorio de correcao permitido pela prompt.

## Escopo corrigido

| Item | Valor |
| --- | --- |
| Findings corrigidos | `MF5-AUD-003`, `MF5-AUD-004` |
| Severidade | `P2` |
| BK/RF/RNF | `BK-MF5-01`/`RF61`; `BK-MF5-03`/`RNF01`; `BK-MF5-12`/`RNF10` |
| Ficheiros corrigidos | `real_dev/web/tests/e2e/mf5-interface-smoke.spec.ts`; `real_dev/api/src/scripts/smoke-200-users.mjs` |
| Relatorio atualizado | `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md` |

## Classificacao inicial

| Finding | Estado inicial | Causa raiz confirmada | Decisao |
| --- | --- | --- | --- |
| `MF5-AUD-003` | `CONFIRMADO` | O smoke de interface/importacao dependia apenas de credenciais externas e fazia `test.skip`, ao contrario dos restantes smokes MF5 que usam seed local como fallback. | Corrigir o spec E2E, remover skip silencioso e validar em browser real. |
| `MF5-AUD-004` | `CONFIRMADO` | O script operacional exigia cookie manual; a ferramenta existia, mas a evidence principal de `200` pedidos autenticados ainda nao tinha sido executada. | Manter `STUDYFLOW_SMOKE_COOKIE` e adicionar login opcional por credenciais de teste para obter `sf_sid` sem o imprimir. |

## Estado por finding

### P2 - Smoke de interface/importacao MF5 fica skipped sem credenciais externas

- ID: `MF5-AUD-003`
- BK/RF/RNF: `BK-MF5-01`/`RF61`; `BK-MF5-03`/`RNF01`
- Estado final: `CORRIGIDO`
- Ficheiro corrigido: `real_dev/web/tests/e2e/mf5-interface-smoke.spec.ts`
- Correcao aplicada:
  - removido o `test.skip` condicionado por `STUDYFLOW_E2E_*`;
  - adicionados fallbacks para as contas seedadas pelo ambiente E2E local;
  - preservados `STUDYFLOW_E2E_STUDENT_*` e `STUDYFLOW_E2E_TEACHER_*` como overrides;
  - corrigido seletor ambiguo de `Materiais` para validar o `heading` de nivel `1`.
- Evidencia apos correcao:
  - o teste deixou de ficar skipped;
  - primeira execucao real encontrou seletor ambiguo, corrigido dentro da causa raiz de evidence;
  - `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf5-interface-smoke.spec.ts`, fora da sandbox, terminou com `1 passed`;
  - a suite MF5 completa terminou com `12 passed`.
- Bloqueia a MF?: Nao.

### P2 - Caminho principal RNF10 ainda nao foi demonstrado com 200 pedidos autenticados

- ID: `MF5-AUD-004`
- BK/RF/RNF: `BK-MF5-12`/`RNF10`
- Estado final: `CORRIGIDO`
- Ficheiro corrigido: `real_dev/api/src/scripts/smoke-200-users.mjs`
- Correcao aplicada:
  - `STUDYFLOW_SMOKE_COOKIE` continua suportado para ambientes que ja tenham cookie de teste;
  - adicionada alternativa `STUDYFLOW_SMOKE_EMAIL` + `STUDYFLOW_SMOKE_PASSWORD`;
  - o script faz login real em `POST /api/auth/login`, extrai apenas o par opaco `sf_sid` e nunca imprime cookie nem body;
  - se nao houver cookie nem credenciais de smoke, o script falha explicitamente e explica que `401` nao prova `RNF10`.
- Evidencia apos correcao:
  - API E2E arrancada fora da sandbox com MongoDB embebido, Redis em memoria e seed de aluno/professor;
  - `STUDYFLOW_SMOKE_USERS=200` com credenciais seedadas de aluno terminou com:
    - `completedRequests`: `200`
    - `networkErrorCount`: `0`
    - `unexpectedStatusCount`: `0`
    - `serverErrorCount`: `0`
    - `statusCounts`: `{ "200": 200 }`
    - `averageMs`: `28`
    - `p95Ms`: `30`
    - `maxMs`: `30`
- Bloqueia a MF?: Nao.

## Mapa de rastreabilidade

| BK | Contrato | Evidencia apos correcao |
| --- | --- | --- |
| `BK-MF5-01` | `RF61`: importacao unidirecional Drive/OneDrive com fluxo real aluno/professor. | `mf5-interface-smoke.spec.ts` executou em browser real, criou area privada, importou link Google Drive, criou turma/disciplina e importou link OneDrive oficial. |
| `BK-MF5-03` | `RNF01`: interface clara, um `h1` principal e acoes essenciais visiveis. | O mesmo smoke validou dashboard aluno, areas, materiais, turmas e disciplinas sem skip. |
| `BK-MF5-12` | `RNF10`: prova operacional de `>= 200` pedidos autenticados simultaneos por escola/ambiente isolado. | `smoke:200-users` executou `200` pedidos autenticados a `/api/auth/me`, todos com status `200`. |

## Coerencia entre MFs

Resultado: `COERENTE`.

### MF4 -> MF5

A correcao nao altera contratos de sessao, ownership, membership, consentimentos, quotas, politicas de IA ou notificacoes vindos da `MF4`. O smoke de interface continua a entrar pela UI com cookies HttpOnly; o smoke de 200 pedidos autentica pelo endpoint real de login e mede `GET /api/auth/me`.

### MF5 interna

`BK-MF5-01` e `BK-MF5-03` passam a ter evidence E2E executada por defeito no ambiente seedado. `BK-MF5-12` deixa de depender exclusivamente de cookie manual para produzir evidence repetivel. A correcao reforca validacao e nao altera comportamento funcional da app.

### MF5 -> MF6

A `MF5` entrega smokes mais estaveis para a fase seguinte. Nao foram antecipados RAG, OCR, embeddings, chunking, indexacao automatica, filas ou tenancy institucional fora do escopo.

## Pesquisa estatica

Pesquisas executadas sobre os ficheiros corrigidos:

```bash
rg -n "test.skip|student!|teacher!|payload: unknown|as any|TODO|FIXME|localStorage|sessionStorage" real_dev/web/tests/e2e/mf5-interface-smoke.spec.ts real_dev/api/src/scripts/smoke-200-users.mjs
rg -n "[[:blank:]]$" real_dev/web/tests/e2e/mf5-interface-smoke.spec.ts real_dev/api/src/scripts/smoke-200-users.mjs
```

Resultado:

- Sem `test.skip`, non-null assertions, `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME` ou trailing whitespace nos ficheiros corrigidos.
- O script de smoke nao imprime cookie, body de login, body de `/api/auth/me`, email ou dados de utilizador.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_INFORMATIVO` - existiam relatorios MF5 untracked; `real_dev/` continua ignorado como esperado. |
| `node --check real_dev/api/src/scripts/smoke-200-users.mjs` | `PASS`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 66 suites, 230 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit` e `vite build`, 121 modulos transformados. |
| `npm --prefix real_dev/api run smoke:200-users` | `PASS_NEGATIVO` - exit code `1`; falha explicitamente sem cookie nem credenciais de smoke. |
| `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf5-interface-smoke.spec.ts` na sandbox | `FAIL_AMBIENTE` - `listen EPERM: operation not permitted 0.0.0.0` no MongoMemoryServer. |
| Mesmo E2E fora da sandbox, apos remover skip | `FAIL` - encontrou seletor ambiguo entre `Materiais` e `Materiais submetidos`; corrigido no spec. |
| Mesmo E2E fora da sandbox, apos corrigir seletor | `PASS` - 1 teste executado, 1 passed. |
| `npm --prefix real_dev/api run start:e2e` fora da sandbox | `PASS_OPERACIONAL` - API E2E arrancou com seed local e endpoint `/api/auth/me` mapeado. |
| `STUDYFLOW_SMOKE_USERS=200 ... npm --prefix real_dev/api run smoke:200-users` na sandbox | `FAIL_AMBIENTE` - `connect EPERM 127.0.0.1:3000`. |
| Mesmo smoke fora da sandbox | `PASS` - 200 pedidos completos, 200 status `200`, zero erros. |
| `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf5-*.spec.ts` a partir da raiz | `FALHA_INVOCACAO` - `zsh` tentou expandir o glob fora de `real_dev/web`; comando corrigido. |
| `npm --prefix real_dev/web run test:e2e -- 'tests/e2e/mf5-*.spec.ts'` | `FALHA_INVOCACAO` - Playwright nao expandiu o glob quoted como ficheiro de teste. |
| `npm run test:e2e -- tests/e2e/mf5-*.spec.ts` em `real_dev/web` fora da sandbox | `PASS` - 12 testes executados, 12 passed. |

## Ficheiros alterados

- `real_dev/web/tests/e2e/mf5-interface-smoke.spec.ts`
- `real_dev/api/src/scripts/smoke-200-users.mjs`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`

`real_dev/` esta ignorado por `.gitignore`, conforme regra desta PAP. Isto nao foi tratado como finding nem como falha de entrega.

## Blockers e TODOs

- Sem blockers funcionais apos a correcao.
- Sem TODOs ligados a `MF5-AUD-003` ou `MF5-AUD-004`.
- A sandbox continua a bloquear listeners/conexoes locais usados por Playwright, MongoMemoryServer e smoke HTTP; os comandos afetados foram reexecutados fora da sandbox.
- Nao foram feitos commits, conforme `PERMITIR_COMMITS=nao`.

## Proximos passos

1. Usar a suite MF5 completa (`npm run test:e2e -- tests/e2e/mf5-*.spec.ts` a partir de `real_dev/web`) como gate de regressao da MF.
2. Em staging, manter `STUDYFLOW_SMOKE_COOKIE` quando ja houver sessao de teste pronta, ou usar `STUDYFLOW_SMOKE_EMAIL/PASSWORD` com conta seedada/isolada.
3. Reauditar `AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md` se for necessario atualizar o estado global de `PASS_COM_RISCOS` para `PASS`.

## Conclusao

`MF5-AUD-003` e `MF5-AUD-004` ficam `CORRIGIDO`. A `MF5` passa a ter evidence E2E completa sem skips (`12 passed`) e evidence operacional de `RNF10` com `200` pedidos autenticados bem-sucedidos. A coerencia `MF4 -> MF5 -> MF6` fica `COERENTE`.
