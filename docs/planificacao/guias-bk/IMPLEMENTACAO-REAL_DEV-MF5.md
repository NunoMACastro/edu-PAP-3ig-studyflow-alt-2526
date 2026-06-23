# IMPLEMENTACAO-REAL_DEV-MF5

## Header

- `doc_id`: `IMPLEMENTACAO-REAL_DEV-MF5`
- `project`: `StudyFlow`
- `macro`: `MF5`
- `implementation_root`: `real_dev`
- `modo`: `implementar`
- `bk_ids_alvo_desta_execucao`: `BK-MF5-12`
- `bk_ids_contexto_preservado`: `BK-MF5-01`, `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06`, `BK-MF5-07`, `BK-MF5-08`, `BK-MF5-09`, `BK-MF5-10`, `BK-MF5-11`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `status`: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`
- `created_at`: `2026-06-22`
- `updated_at`: `2026-06-22`

## Resultado geral

Estado final desta execucao: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`.

Esta execucao implementou `BK-MF5-12` dentro de `real_dev/api`, sem alterar BKs canonicos, matriz, backlog, prompts ou commits. O BK entrega um smoke operacional para `RNF10`: 200 pedidos autenticados concorrentes a `GET /api/auth/me`, com cookie de teste obrigatorio, contagem por status HTTP, erros de rede, `averageMs`, `p95Ms` e `maxMs`.

O smoke principal com 200 pedidos autenticados nao foi executado porque requer uma API StudyFlow em execucao e um cookie `sf_sid` valido de ambiente local/staging isolado. Foram executados os negativos possiveis nesta sandbox, build da API, build do web, suite unitaria da API, syntax check do script e higiene de diff.

## Escopo implementado

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-10` | `RNF08` | `IMPLEMENTADO` | Execucao anterior preservada: `performance-budget.ts`, integracao em `SoloStudyDashboard` e `TeacherClassesPage`, e smoke E2E `mf5-performance-budget.spec.ts`. |
| `BK-MF5-11` | `RNF09` | `IMPLEMENTADO` | Execucao anterior preservada: `with-ai-response-budget.ts`, integracao em IA privada e IA com fontes, e testes unitarios de budget. |
| `BK-MF5-12` | `RNF10` | `IMPLEMENTADO_SEM_VALIDACAO_TOTAL` | `smoke-200-users.mjs` criado; `smoke:200-users` adicionado ao package da API; negativos sem cookie e API indisponivel validados. |

## Mapa de rastreabilidade

| BK | Contrato | Ficheiros principais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF5-12` | Provar smoke inicial de `>= 200` pedidos autenticados simultaneos por escola de teste isolada, sem aceitar `401`, `403`, `5xx`, erros de rede ou status inesperado como sucesso. | `real_dev/api/src/scripts/smoke-200-users.mjs`; `real_dev/api/package.json`. | `npm --prefix real_dev/api run smoke:200-users` sem cookie; `STUDYFLOW_SMOKE_COOKIE=sf_sid=fake STUDYFLOW_BASE_URL=http://127.0.0.1:3999 STUDYFLOW_SMOKE_USERS=3 npm --prefix real_dev/api run smoke:200-users`; `node --check`; API build; API unit; web build; `git diff --check`. |

## Inventario BK-MF5-12

- ID: `BK-MF5-12`
- Titulo: `Suportar >= 200 utilizadores simultaneos por escola`
- RF/RNF: `RNF10`
- Prioridade: `P1`
- Dependencias declaradas: `-`
- Scope-in: script de smoke autenticado, comando npm, `fetch` nativo, endpoint `/api/auth/me`, cookie obrigatorio, metricas e falhas por status/rede.
- Scope-out: tenancy/escola nova, endpoint novo, load testing profissional, alteracoes de auth/sessao/ownership/membership/IA, dependencias novas e uso de dados reais.
- Estado antes esperado: sem comando real que simule 200 pedidos autenticados concorrentes.
- Estado depois entregue: comando operacional repetivel, configuravel por variaveis de ambiente e sem output de cookie/body/dados pessoais.
- Endpoint previsto: `GET /api/auth/me`.
- Regras de seguranca: `STUDYFLOW_SMOKE_COOKIE` obrigatorio; `401`/`403` e qualquer status diferente do esperado falham; body da resposta e cancelado e nunca impresso.
- Handoff: `BK-MF6-01` pode consumir a evidence de concorrencia como base para qualidade/performance, sem receber tenancy institucional, filas ou escalabilidade horizontal antecipadas.

## Contratos consumidos

- `RNF10` em `docs/RNF.md`: o StudyFlow deve suportar `>= 200` utilizadores simultaneos por escola.
- `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: `BK-MF5-12` e `P1`, `Core`, `S10`, proximo BK `BK-MF6-01`.
- `MF-VIEWS.md`: sequencia oficial MF5 sem `BK-MF5-02`, terminando em `BK-MF5-12`.
- `BK-MF5-11`: budget IA de `<= 4s` fica separado deste smoke de concorrencia.
- `AuthController.me`: `GET /api/auth/me` e protegido por `SessionGuard`.
- `SessionGuard`: le `sf_sid` do cookie HttpOnly e anexa `request.user`.
- `SessionService`: usa sessoes opacas `sf_sid` com dados do utilizador guardados no servidor.
- `requestJson` no frontend: confirma o padrao `credentials: "include"` e `x-studyflow-csrf`, espelhado pelo script sem guardar tokens no browser.

## Contratos entregues

- `real_dev/api/src/scripts/smoke-200-users.mjs`.
- `npm --prefix real_dev/api run smoke:200-users`.
- Variaveis suportadas:
  - `STUDYFLOW_BASE_URL`, por defeito `http://127.0.0.1:3000`.
  - `STUDYFLOW_SMOKE_PATH`, por defeito `/api/auth/me`.
  - `STUDYFLOW_SMOKE_USERS`, por defeito `200`.
  - `STUDYFLOW_SMOKE_EXPECTED_STATUS`, por defeito `200`.
  - `STUDYFLOW_SMOKE_SCHOOL_CONTEXT`, por defeito `escola-teste-isolada`.
  - `STUDYFLOW_SMOKE_COOKIE`, obrigatorio.
- Summary JSON sem cookie e sem body:
  - `schoolContext`
  - `path`
  - `concurrency`
  - `expectedStatus`
  - `completedRequests`
  - `networkErrorCount`
  - `unexpectedStatusCount`
  - `serverErrorCount`
  - `statusCounts`
  - `averageMs`
  - `p95Ms`
  - `maxMs`
- Exit code diferente de zero quando ha erro de rede, status inesperado ou `5xx`.

## Coerencia entre MFs

Resultado: `COERENTE_COM_RISCOS`.

### MF4 -> MF5

MF4 entrega sessoes, governanca, auditoria e limites que a MF5 deve preservar. `BK-MF5-12` nao altera autenticacao, Redis, cookies, ownership, membership, quotas, politicas, materiais ou IA. O smoke consome apenas o contrato ja existente de sessao e endpoint autenticado.

### MF5 interna

`BK-MF5-12` vem depois de `BK-MF5-11` e nao mede latencia de IA nem altera o budget IA. O endpoint escolhido e barato, autenticado e sem mutacao, por isso nao interfere com os fluxos de importacao, feedback, formularios, notificacoes, performance visual ou IA.

### MF5 -> MF6

O handoff para `BK-MF6-01` ficou limitado a evidence operacional de concorrencia autenticada. Nao foram antecipados RAG, embeddings, OCR, chunking semantico, indexacao automatica, filas, tenancy institucional, escalabilidade horizontal ou sandbox de documentos.

### Risco residual

A coerencia fica `COERENTE_COM_RISCOS` apenas porque o caminho principal de 200 pedidos autenticados ainda precisa de uma API real em execucao e um cookie de teste valido para ser demonstrado em ambiente local/staging.

## Findings por severidade

Nao foram abertos findings nesta execucao de implementacao.

| Severidade | Quantidade |
| --- | ---: |
| `P0` | 0 |
| `P1` | 0 |
| `P2` | 0 |
| `P3` | 0 |

## Pesquisa estatica

Pesquisa executada:

```bash
rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|mock|stub|placeholder|OPENAI_API_KEY|secret|password|Cookie|console\\.log|response\\.json|response\\.text|RAG|embeddings|OCR|chunking|indexa(c|ç)ão automática|FaithFlix|Orelle|OPSA|stripe|fatura|stock|produto|cliente|biometr" real_dev/api/src/scripts/smoke-200-users.mjs real_dev/api/package.json
```

Resultado:

- Sem `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, mocks finais, stubs finais, placeholders finais ou drift de outras PAPs.
- `Cookie: cookie` e necessario para enviar a sessao opaca de teste ao endpoint autenticado; o valor nao e impresso.
- `console.log(JSON.stringify(summary, null, 2))` imprime apenas summary tecnico sem cookie e sem body.
- O script nao chama `response.json()` nem `response.text()`; cancela o body para evitar evidence com dados pessoais.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run smoke:200-users` | `PASS_NEGATIVO` - falhou antes de enviar pedidos porque `STUDYFLOW_SMOKE_COOKIE` e obrigatorio. |
| `STUDYFLOW_SMOKE_COOKIE=sf_sid=fake STUDYFLOW_BASE_URL=http://127.0.0.1:3999 STUDYFLOW_SMOKE_USERS=3 npm --prefix real_dev/api run smoke:200-users` | `PASS_NEGATIVO` - exit code `1`, `networkErrorCount: 3`, sem cookie/body no output. |
| `node --check real_dev/api/src/scripts/smoke-200-users.mjs` | `PASS`. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 66 suites, 230 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit` e `vite build`, 121 modulos transformados. |
| `node -e ... mini-servidor local para status esperado errado` | `BLOQUEADO_AMBIENTE` - `listen EPERM: operation not permitted 127.0.0.1:31876` na sandbox. |
| `git diff --check` | `PASS`. |

## Validacao nao executada

- Caminho principal `STUDYFLOW_SMOKE_USERS=200` com `STUDYFLOW_SMOKE_COOKIE` real: nao executado porque requer API StudyFlow ativa e cookie `sf_sid` valido de ambiente isolado.
- Negativo de status esperado errado contra servidor controlado: bloqueado pela sandbox ao abrir listener local (`listen EPERM`).

## Ficheiros alterados

- `real_dev/api/src/scripts/smoke-200-users.mjs`
- `real_dev/api/package.json`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF5.md`

## Pastas e ficheiros auditados

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
- `docs/planificacao/guias-bk/MF1/`
- `docs/planificacao/guias-bk/MF2/`
- `docs/planificacao/guias-bk/MF3/`
- `docs/planificacao/guias-bk/MF4/`
- `docs/planificacao/guias-bk/MF5/`
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/auth/auth.controller.ts`
- `real_dev/api/src/common/guards/session.guard.ts`
- `real_dev/api/src/modules/auth/session.service.ts`
- `real_dev/api/src/scripts/`
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`

## Blockers e TODOs

- Sem blockers de implementacao.
- `TODO_VALIDACAO`: correr o caminho principal com API ativa e cookie de teste valido:

```bash
STUDYFLOW_BASE_URL="http://127.0.0.1:3000" \
STUDYFLOW_SMOKE_PATH="/api/auth/me" \
STUDYFLOW_SMOKE_USERS="200" \
STUDYFLOW_SMOKE_EXPECTED_STATUS="200" \
STUDYFLOW_SMOKE_SCHOOL_CONTEXT="escola-teste-isolada" \
STUDYFLOW_SMOKE_COOKIE="[cookie-sf_sid-de-teste]" \
npm --prefix real_dev/api run smoke:200-users
```

- `TODO_VALIDACAO`: repetir o negativo de status esperado errado fora da sandbox, com API ou servidor controlado que devolva `200` enquanto `STUDYFLOW_SMOKE_EXPECTED_STATUS=204`.
- Nao foram feitos commits, conforme `PERMITIR_COMMITS=nao`.

## Conclusao

`BK-MF5-12` ficou implementado em `real_dev`: existe script operacional sem dependencias novas, comando npm, cookie obrigatorio, metricas de concorrencia e falha em qualquer evidence que nao prove pedidos autenticados com status esperado. O estado fica `IMPLEMENTADO_SEM_VALIDACAO_TOTAL` ate ser executado o smoke principal com 200 pedidos autenticados num ambiente local/staging isolado com sessao de teste valida.
