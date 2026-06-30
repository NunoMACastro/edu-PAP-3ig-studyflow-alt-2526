# AUDITORIA-IMPLEMENTACAO-real_dev-MF7

## Header

- `doc_id`: `AUDITORIA-IMPLEMENTACAO-real_dev-MF7`
- `project`: `StudyFlow`
- `macro`: `MF7`
- `implementation_root`: `real_dev`
- `modo`: `auditar_implementacao`
- `bk_ids`: [`BK-MF7-09`, `BK-MF7-10`, `BK-MF7-11`]
- `audit_report_source`: `auto`
- `audit_report_path`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `profundidade_coerencia`: `vizinhas`
- `permitir_alterar_docs`: `nao`, exceto este relatorio tecnico de auditoria
- `permitir_commits`: `nao`
- `data_execucao`: `2026-06-30`
- `resultado_geral`: `PASS`
- `nota_atualizacao`: relatorio cumulativo; secoes historicas de `BK-MF7-09` e `BK-MF7-10` foram preservadas, o relatorio de correcao separado ja marca esses findings como corrigidos, e a secao final cobre a execucao atual de `BK-MF7-11`.

## Resumo executivo atual - BK-MF7-11

Auditoria focada ao `BK-MF7-11 - IA segue limites definidos pelo professor` em `real_dev/api`, com leitura de `BK-MF7-10`, `BK-MF8-01`, relatorios MF7 e contratos canonicos para preservar coerencia cumulativa.

Resultado da execucao atual:

- `BK-MF7-11`: `PASS`.
- Findings novos desta execucao: `P0=0`, `P1=0`, `P2=0`, `P3=0`.
- Coerencia MF6/MF7/MF8 para o BK: `COERENTE`.
- Commits: nao criados.

O contrato principal esta implementado: `assertPromptWithinLimit(...)` bloqueia prompts acima de `maxPromptChars`, `ClassAiService.askClassAi(...)` valida membership e perfil `CLASS_SUBJECT/TEACHER_CLASS`, resolve `CLASS_AI`, limita fontes por `policy.maxSourceCount`, aplica o limite de prompt, reserva quota e so depois chama o provider. Os negativos P0 pedidos pelo guia estao cobertos por testes: policy desativada, prompt acima do limite e quota falhada bloqueiam antes de provider/persistencia.

As secoes historicas abaixo ficam preservadas como trilho de auditoria. O estado atual de `BK-MF7-09` e `BK-MF7-10` deve ser lido em conjunto com `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`, que marca os findings anteriores como `CORRIGIDO`.

## Resumo executivo historico - BK-MF7-09

Auditoria focada ao `BK-MF7-09` em `real_dev/api` e `real_dev/web`, com leitura da MF7 e das MFs vizinhas apenas para preservar coerencia cumulativa.

Resultado:

- `BK-MF7-09`: `FAIL`.
- Findings abertos: `P0=0`, `P1=1`, `P2=0`, `P3=0`.
- Coerencia entre MFs: `INCOERENTE`.
- Commits: nao criados.

O contrato principal de citacoes esta quase todo implementado: existe `normalizePublicCitation(...)`, a policy e usada em `SourceGroundedAiService.toCitation(...)`, o endpoint privado usa `SessionGuard`, cada `sourceJobId` e validado por `MaterialIndexService.findReadableDoneJob(...)`, o frontend mostra `sourceLabel`, `locator` e `excerpt`, e os testes focados passaram.

O BK nao pode ficar `PASS` porque o fluxo source-grounded chama o provider IA sem passar pelos gates cumulativos ja existentes de consentimento, model policy e quota. Isto contradiz o scope-in do proprio BK, que manda preservar quotas e guardrails ja definidos quando o fluxo toca dados privados ou IA, e diverge dos fluxos `PrivateAreaAiService`, `StudyGroupAiService` e `ClassAiService`, que aplicam essa cadeia antes do provider.

## Escopo aplicado

- `IMPLEMENTATION_ROOT=real_dev`: backend em `real_dev/api`; frontend em `real_dev/web`; documentos canonicos apenas lidos.
- `BK_IDS=[BK-MF7-09]`: a auditoria validou diretamente o BK alvo e usou `BK-MF7-08`, `BK-MF7-10`, `MF6` e `MF8` apenas como contexto de coerencia.
- `PERMITIR_ALTERAR_DOCS=nao`: nao foram alterados guias BK, matriz, backlog, prompts, docs canonicos ou relatorios de implementacao/correcao; apenas este relatorio de auditoria foi atualizado.
- `PERMITIR_COMMITS=nao`: nenhum commit foi criado.
- `RUN_COMMANDS=true`: foram executados testes focados, build backend, suite API completa, build frontend, pesquisas estaticas e verificacoes de whitespace/diff.
- `STRICT_SCOPE=true`: nao foram corrigidos findings, porque o modo e `auditar_implementacao`.

`git check-ignore -v real_dev` confirmou `.gitignore:2:real_dev/`; o facto de `real_dev/` estar ignorado e esperado neste checkout nao foi tratado como finding.

## Estado inicial do worktree

`git status --short --untracked-files=all` mostrou alteracoes pre-existentes em `docs/planificacao`, guias `MF8`, scripts de planificacao e relatorios `MF7` nao versionados. Estas alteracoes foram preservadas.

Nota: campos `TODO` na matriz/backlog/guias foram tratados como estado documental de planeamento, nao como prova de ausencia de implementacao, porque a auditoria encontrou codigo, testes, builds e evidence reais em `real_dev`.

## Inventario canonico

| BK | RNF | Prioridade | Sprint | Proximo BK | Estado |
| --- | --- | --- | --- | --- | --- |
| `BK-MF7-08` | `RNF30` | `P1` | `S12` | `BK-MF7-09` | Contexto anterior |
| `BK-MF7-09` | `RNF31` | `P0` | `S12` | `BK-MF7-10` | `FAIL` |
| `BK-MF7-10` | `RNF32` | `P0` | `S12` | `BK-MF7-11` | Contexto seguinte |
| `BK-MF8-01` | `RNF34` | `P0` | `S12` | `BK-MF8-02` | Contexto futuro documental |

Evidencia canonica:

- `docs/RNF.md:99`: `RNF31` exige IA que explica fontes dos conteudos com paginas/seccoes.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:104`: `BK-MF7-09` esta ligado a `RNF31`, prioridade `P0`, sprint `S12`, proximo BK `BK-MF7-10`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md:123`: repete o mesmo contrato de BK, owner, apoio, prioridade, sprint e guia.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:122`: confirma owner `Kaua`, prioridade `P0`, `RNF31`, sprint `S12` e handoff para `BK-MF7-10`.
- `docs/planificacao/backlogs/MF-VIEWS.md:227`: sequencia interna da MF7 inclui `BK-MF7-08 -> BK-MF7-09 -> BK-MF7-10`.
- `docs/planificacao/backlogs/MF-VIEWS.md:238`: liga `BK-MF7-09` ao guia de IA que explica fontes.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:24`: objetivo exige resposta com `sourceLabel`, `locator` e `excerpt`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:26`: aceite exige policy backend, integracao em `SourceGroundedAiService.toCitation(...)`, frontend e testes P0.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:39`: scope-in exige preservar autenticacao, autorizacao, ownership, membership, quotas e guardrails definidos quando o fluxo toca dados privados ou IA.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:40`: scope-in exige negativos P0 para sem fonte localizavel, sem excerto e fonte proibida antes do provider.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:106`: endpoint esperado e `POST /api/ai/source-grounded-answers`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:111`: endpoint deve preservar `SessionGuard`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:112`: cliente API deve usar cookies com `credentials: "include"`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:645`: criterios de aceite exigem `RNF31` demonstravel por codigo/teste/evidence.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:649`: `normalizePublicCitation(...)` deve validar `sourceLabel`, `locator` e `excerpt`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:650`: `SourceGroundedAiService.toCitation(...)` deve usar a policy.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:651`: frontend deve apresentar `sourceLabel`, `locator` e `excerpt`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:652`: nao deve haver decisao de sessao, ownership, membership, role, quota, fonte IA ou privacidade feita apenas no frontend.

## Estado por requisito do BK

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Policy `normalizePublicCitation(...)` | `CUMPRE` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts:18` normaliza; linhas `23-33` rejeitam nome, localizacao e excerto vazios; linha `40` limita excerto a 420 caracteres. |
| Integracao em `SourceGroundedAiService.toCitation(...)` | `CUMPRE` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:30` importa a policy; linhas `161-172` chamam `normalizePublicCitation(...)` com `sourceLabel`, `locator` e `excerpt`. |
| Endpoint privado com sessao | `CUMPRE` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts:13` define `api/ai/source-grounded-answers`; linha `14` aplica `SessionGuard`; linha `35` usa `request.user`. |
| DTO e validacao de input | `CUMPRE` | `AskSourceGroundedAiDto` exige array de `sourceJobIds`, `MongoId`, tamanho 1..8 e pergunta de 5..800 chars em `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts:21-33`; `ValidationPipe` global usa `whitelist`, `forbidNonWhitelisted` e `transform` em `real_dev/api/src/main.ts:30-37`. |
| Autorizacao de fontes antes do provider | `CUMPRE` | `SourceGroundedAiService.ask(...)` chama `findReadableDoneJob(actor, jobId)` em `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:81-85`; o provider so e chamado depois em `100` e `203-209`. |
| Ownership/membership da fonte | `CUMPRE` | `MaterialIndexService.findReadableDoneJob(...)` carrega job, chama `assertReadableJob(...)` e exige `DONE` em `real_dev/api/src/modules/material-index/material-index.service.ts:447-454`; privados validam `userId` e oficiais validam professor ou aluno inscrito em `494-513`. |
| Sem fontes citaveis | `CUMPRE` | `SourceGroundedAiService.ask(...)` rejeita sem citacoes em `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:93-98`; teste `source-grounded-ai.service.spec.ts:57-70`. |
| Fonte proibida antes do provider | `CUMPRE` | Teste `source-grounded-ai.service.spec.ts:73-90` prova que erro de `findReadableDoneJob(...)` impede provider e persistencia. |
| Frontend mostra fonte, localizacao e excerto | `CUMPRE` | `ask-source-grounded-ai.ts:14-20` tipa `sourceLabel`, `locator` e `excerpt`; `source-grounded-ai-panel.tsx:74-78` apresenta `sourceLabel`, `locator` e `excerpt`. |
| Cliente frontend autenticado por cookies | `CUMPRE` | `ask-source-grounded-ai.ts:34-40` reutiliza `requestMf3Json(...)`; `request-mf3-json.ts:17-21` usa `credentials: "include"`. |
| Preservar quotas/policy/consentimento antes do provider | `NAO_CUMPRE` | Ver finding `P1-BK-MF7-09-AI-GOVERNANCE-001`. |

## Finding

### P1 - Source-grounded AI chama provider sem consentimento, policy e quota

- ID: `P1-BK-MF7-09-AI-GOVERNANCE-001`
- BK/RF/RNF: `BK-MF7-09` / `RNF31`
- Ficheiro(s):
  - `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
  - `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
  - `real_dev/api/src/modules/ai/providers/ai-provider.ts`
- Linha(s):
  - `source-grounded-ai.service.ts:77-100`
  - `source-grounded-ai.service.ts:182-210`
  - `source-grounded-ai.module.ts:20-33`
  - `ai-provider.ts:95-107`
- Evidencia observada:
  - `SourceGroundedAiService.ask(...)` autoriza jobs e constroi citacoes em `77-100`, mas nao chama `AiConsentsService.assertGranted(...)`, `AiModelPoliciesService.resolveForUse(...)` nem `AiQuotasService.reserveUsage(...)`.
  - `SourceGroundedAiService.generateAnswer(...)` chama `this.aiProvider.generateStudyTool(...)` em `203-209` com timeout fixo, sem model/policy resolvida por governanca.
  - `SourceGroundedAiModule` importa `AuthModule`, `AiModule`, `MaterialIndexModule` e schema Mongoose, mas nao importa/injeta `AiConsentsModule`, `AiModelPoliciesModule` ou `AiQuotasModule`.
  - `rg -n "AiConsentsService|AiModelPoliciesService|AiQuotasService|AiGuardrailsService|assertGranted|resolveForUse|reserveUsage" real_dev/api/src/modules/source-grounded-ai` nao encontrou ocorrencias.
  - O provider em `ai-provider.ts:95-107` e apenas contrato externo; nao aplica por si consentimento, policy ou quota.
  - Fluxos comparaveis aplicam a governanca antes do provider: `PrivateAreaAiService` chama consentimento, policy e quota em `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts:106-120`; `StudyGroupAiService` em `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts:105-115`; `ClassAiService` em `real_dev/api/src/modules/class-ai/class-ai.service.ts:89-117`.
- Contrato violado:
  - `BK-MF7-09` exige preservar quotas e guardrails definidos quando o fluxo toca dados privados ou IA (`docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md:39`).
  - O principio cumulativo da prompt exige que MF alvo consuma contratos anteriores e nao os contorne.
  - `MF4` ja entregou consentimentos, policies e quotas de IA; `MF6` entregou guardrails/isolamento/fonte autorizada. O fluxo source-grounded preserva fonte autorizada, mas contorna consentimento/policy/quota antes do provider.
- Origem entre MFs: `FALHA_DA_MF_ALVO` / `INCOMPATIBILIDADE_ENTRE_MFS`.
- Impacto:
  - Um utilizador autenticado com acesso a um job citavel pode acionar provider IA com excertos de materiais sem prova de consentimento ativo, sem policy efetiva, sem modelo administrativo, sem `maxSourceCount` e sem consumo de quota.
  - O comportamento fica incoerente com os fluxos de IA privada, sala/grupo e turma/disciplina ja governados no backend.
  - Como o BK e `P0`, esta lacuna bloqueia `PASS` mesmo com testes/builds verdes.
- Como reproduzir/verificar:
  - Ler `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:77-100` e `182-210`.
  - Executar `rg -n "AiConsentsService|AiModelPoliciesService|AiQuotasService|AiGuardrailsService|assertGranted|resolveForUse|reserveUsage" real_dev/api/src/modules/source-grounded-ai`.
  - Comparar com `real_dev/api/src/modules/class-ai/class-ai.service.ts:89-117`, `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts:106-120` e `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts:105-115`.
- Correcao recomendada:
  - Numa execucao `corrigir_auditoria`, integrar o fluxo source-grounded na governanca IA ja existente antes de `generateAnswer(...)`.
  - Resolver a finalidade de IA de forma canonica antes de codificar: reutilizar finalidade existente conforme o contexto da fonte, ou documentar/criar finalidade propria apenas se o contrato permitir.
  - Aplicar consentimento, policy, limite de fontes/prompt, quota e testes negativos antes do provider.
  - Garantir que o negativo cobre pelo menos policy/consentimento/quota recusados sem chamar provider nem persistir resposta.
- Fora de scope?: Nao. O finding esta dentro de `BK-MF7-09`, mas esta execucao e `auditar_implementacao`, portanto nao foi corrigido.

## Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| Contexto `BK-MF7-08` | `RNF30` | `real_dev/api/src/common/health/*`, `real_dev/api/src/app.module.ts` | `health.controller.spec.ts`, smoke HTTP anterior |
| `BK-MF7-09` | `RNF31` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`, `real_dev/web/src/features/source-grounded-ai/*` | `citation-policy.spec.ts`, `source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts`, build API, suite API, build web |
| Contexto `BK-MF7-10` | `RNF32` | `real_dev/api/src/modules/ai/context/ai-context-policy.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts` | `ai-context-policy.spec.ts`, `class-ai.service.spec.ts` |

## Contratos consumidos

- `BK-MF7-08`: entrega `GET /api/health` como pre-condicao operacional; nao foi revalidado por smoke nesta auditoria porque o alvo e IA/fontes e o health-check foi auditado no BK anterior.
- `MF6`: entrega fontes autorizadas por `MaterialIndexService.findReadableDoneJob(...)`; o BK consome corretamente esta parte.
- `MF4`: entrega consentimentos, policies e quotas de IA; o BK nao consome esta parte no fluxo source-grounded, originando o finding P1.
- `AppModule`: regista `SourceGroundedAiModule` em `real_dev/api/src/app.module.ts:26` e `76`.
- `requestMf3Json(...)`: preserva cookies HttpOnly com `credentials: "include"` em `real_dev/web/src/features/mf3/request-mf3-json.ts:17-21`.

## Contratos entregues

- `normalizePublicCitation(...)`: valida `sourceLabel`, `locator`, `excerpt` e limita excerto a 420 caracteres.
- `SourceGroundedAiService.toCitation(...)`: converte chunks internos de jobs autorizados em citacoes publicas.
- `POST /api/ai/source-grounded-answers`: endpoint autenticado por `SessionGuard`.
- `SourceGroundedCitation`: schema com `sourceJobId`, `materialId`, `sourceLabel`, `locator` e `excerpt`.
- `SourceGroundedAiPanel`: UI que apresenta resposta e citacoes.
- Testes negativos: sem fonte citavel, sem nome de fonte, sem localizacao, sem excerto e fonte proibida antes do provider.

Contrato nao entregue:

- Gate de governanca IA antes do provider no fluxo source-grounded: consentimento/model policy/quota.

## Coerencia entre MFs

Resultado: `INCOERENTE`.

### MF6 -> MF7

Parte coerente: `BK-MF7-09` consome `MaterialIndexService.findReadableDoneJob(...)` antes de construir citacoes e chamar o provider. Isto preserva ownership/membership de fontes privadas e oficiais.

Parte incoerente: `BK-MF7-09` nao preserva todos os gates de IA ja existentes. A prompt e o guia mandam preservar guardrails/quotas quando o fluxo toca dados privados ou IA. O service source-grounded chama o provider sem consentimento, policy e quota, ao contrario dos services de IA privada, grupo e turma.

### Dentro da MF7

`BK-MF7-08` entrega health-check operacional. `BK-MF7-09` entrega citacoes explicaveis e UI, mas deixa a governanca IA incompleta. `BK-MF7-10` e `BK-MF7-11` ja reforcam perfil, consentimento, policy e quota noutros fluxos, aumentando a incoerencia do source-grounded como excecao.

### MF7 -> MF8

`MF8` depende de IA mais segura e menos propensa a respostas inseguras. O finding P1 deve ser corrigido antes de usar `BK-MF7-09` como base para qualidade final de IA, porque a explicabilidade de fontes nao basta se o provider puder ser chamado fora da governanca cumulativa.

## Findings por severidade

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | - |
| `P1` | 1 | `P1-BK-MF7-09-AI-GOVERNANCE-001` |
| `P2` | 0 | - |
| `P3` | 0 | - |

## Pesquisa estatica

| Pesquisa | Resultado | Classificacao |
| --- | --- | --- |
| `rg` para `console.log`, `logger`, `prompt`, `answer` no fluxo source-grounded | `PASS_COM_NOTA` | Ocorrencias de `prompt`/`answer` existem no service, tipos e testes esperados; nao ha logs de prompts ou respostas privadas. |
| `rg` para `cookie`, `password`, `secret`, `token`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, TODO/FIXME, skips e `.only` | `PASS` | Sem ocorrencias no fluxo source-grounded auditado. |
| `rg` para RAG, embeddings, OCR, chunking, indexacao automatica, Drive, LMS e monitorizacao | `PASS_COM_NOTA` | Ocorrencias apenas em scope-out do guia e comentario explicativo de selecao lexical simples; a implementacao nao promete essas capacidades. |
| `rg` para `AiConsentsService`, `AiModelPoliciesService`, `AiQuotasService`, `AiGuardrailsService`, `assertGranted`, `resolveForUse`, `reserveUsage` no modulo source-grounded | `FAIL` | Sem ocorrencias; confirma o finding P1. |
| `rg -n "[ \t]+$"` em `real_dev/api/src/modules/source-grounded-ai` e `real_dev/web/src/features/source-grounded-ai` | `PASS` | Sem trailing whitespace. |

## Validacoes executadas

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_INFORMATIVO` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao versionados; preservadas. |
| `git check-ignore -v real_dev` | `PASS` | `.gitignore:2:real_dev/` confirmou raiz ignorada esperada. |
| `npm --prefix real_dev/api test -- citation-policy source-grounded-ai --runInBand` | `PASS` | 3 suites passadas; 10 testes passados. |
| `npm --prefix real_dev/api run build` | `PASS` | Build NestJS concluido. |
| `npm --prefix real_dev/web run build` | `PASS` | `tsc --noEmit` e `vite build` concluidos; 122 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` | 86 suites passadas; 321 testes passados. |
| Pesquisas estaticas de seguranca/scope/whitespace | `PASS_COM_FINDING` | Sem fugas obvias de segredo/storage/logs; finding P1 confirmado por ausencia de governanca IA no modulo source-grounded. |
| `git diff --check` | `PASS` | Sem whitespace errors nos diffs. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio. |

## Validacoes nao executadas

| Comando | Motivo |
| --- | --- |
| Smoke HTTP real `POST /api/ai/source-grounded-answers` | Nao executado por proporcionalidade e por exigir sessao autenticada, dados indexados e provider/fake provider runtime; a lacuna P1 e demonstravel por codigo e testes estaticos. |
| Suite Playwright completa | Nao executada por proporcionalidade: o alvo e contrato backend/frontend tipado; foram executados teste focado, suite API completa, build API e build web. |
| `bash scripts/validate-planificacao.sh` | Nao executado porque `PERMITIR_ALTERAR_DOCS=nao` e a execucao nao alterou docs canonicos, guias, matriz ou backlog; apenas este relatorio tecnico permitido. |

## Ficheiros auditados

- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`
- `real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
- `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- `real_dev/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/ai/providers/ai-provider.ts`
- `real_dev/api/src/modules/ai/ai.module.ts`
- `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts`
- `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts`
- `real_dev/api/src/app.module.ts`
- `real_dev/api/src/main.ts`
- `real_dev/api/package.json`
- `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/web/src/pages/student/Mf3CommunityPage.tsx`
- `real_dev/web/package.json`

## Ficheiros alterados

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`: atualizado para refletir a auditoria real de `BK-MF7-09`.

Nao foram alterados ficheiros de codigo, guias BK, matriz, backlog, prompts, docs canonicos, scripts de planificacao ou relatorios de implementacao/correcao.

## Blockers, TODOs e riscos residuais

- `SEM_BLOCKERS_AMBIENTE`: os comandos principais passaram; nao houve bloqueio por sandbox nesta auditoria.
- `TODO_P1`: corrigir `P1-BK-MF7-09-AI-GOVERNANCE-001` em modo `corrigir_auditoria`.
- `NOTA_WORKTREE`: havia alteracoes pre-existentes fora do escopo; foram preservadas e nao foram revertidas.
- `NOTA_VALIDACAO`: testes/builds verdes nao fecham o BK porque a lacuna e de contrato cumulativo antes do provider.

## Decisao final

`BK-MF7-09` fica classificado como `FAIL`.

O endpoint, a policy de citacoes, a autorizacao de fontes, a UI e os testes estao implementados e validados. A falha bloqueante e a ausencia de consentimento, model policy e quota antes da chamada ao provider IA no fluxo source-grounded. Enquanto esse gate nao existir, `RNF31` nao deve ser aceite como fechado na cadeia cumulativa da app.

---

## Auditoria adicional 2026-06-30 - BK-MF7-10

### Header da execucao atual

- `project`: `StudyFlow`
- `macro`: `MF7`
- `bk_ids`: [`BK-MF7-10`]
- `modo`: `auditar_implementacao`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `profundidade_coerencia`: `vizinhas`
- `permitir_alterar_docs`: `nao`, exceto este relatorio tecnico de auditoria
- `permitir_commits`: `nao`
- `resultado_execucao_bk_mf7_10`: `FAIL`

### Resumo executivo da execucao atual

Auditoria focada ao `BK-MF7-10 - IA respeita perfis distintos (aluno, sala, turma, disciplina, professor)` em `real_dev/api`, com leitura de `BK-MF7-09`, `BK-MF7-11`, MF6 e MF8 apenas para coerencia cumulativa.

Resultado:

- `BK-MF7-10`: `FAIL`.
- Findings novos desta execucao: `P0=0`, `P1=1`, `P2=0`, `P3=0`.
- Coerencia MF6 -> MF7 -> MF8 para o BK: `COERENTE_COM_RISCOS`.
- Commits: nao criados.

O comportamento principal esta implementado: `assertAiContextProfile(...)` existe, mapeia `PRIVATE_AREA`, `STUDY_ROOM` e `CLASS_SUBJECT` para perfis separados, falha com `ForbiddenException`, e e chamado em `ClassAiService.askClassAi(...)` depois de validar membership da disciplina e antes de consentimento, policy, materiais, prompt, quota e provider. Os testes focados e a suite API completa passaram.

O BK nao pode ficar `PASS` porque falta o negativo de service exigido pelo proprio guia: a spec atual prova a ordem por leitura estatica do ficheiro, mas nao força uma falha controlada de `assertAiContextProfile(...)` dentro de `ClassAiService` para confirmar que materiais, quota, provider e persistencia nao sao chamados nesse caminho.

### Inventario canonico BK-MF7-10

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md:100` | `RNF32` exige IA com perfis distintos de aluno, turma e professor. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:105` | `BK-MF7-10` esta ligado a `RNF32`, prioridade `P0`, sprint `S12`, proximo BK `BK-MF7-11`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:124` | Repete o contrato canonico do BK. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:123` | Confirma owner `Natalia`, prioridade `P0`, `RNF32`, sprint `S12` e handoff para `BK-MF7-11`. |
| `docs/planificacao/backlogs/MF-VIEWS.md:239` | A view MF7 inclui o guia `BK-MF7-10`. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md:24` | Objetivo exige `assertAiContextProfile(...)` no backend antes de fontes, prompt, quota e provider. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md:39` | Scope-in exige teste de service que prove falha de perfil antes de materiais, quota, provider e persistencia. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md:649` | Criterios de aceite exigem caminho principal, tres negativos de policy e teste de service antes de materiais, quota, provider e persistencia. |

### Estado por requisito do BK-MF7-10

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Policy `assertAiContextProfile(...)` | `CUMPRE` | `real_dev/api/src/modules/ai/context/ai-context-policy.ts:9-20` define contextos e perfis; `29-45` valida e lança `AI_CONTEXT_PROFILE_MISMATCH` sem expor prompt ou materiais. |
| Tres negativos de policy | `CUMPRE` | `real_dev/api/src/modules/ai/context/ai-context-policy.spec.ts:23-34` cobre `PRIVATE_AREA/TEACHER_CLASS`, `STUDY_ROOM/STUDENT_PRIVATE` e `CLASS_SUBJECT/ROOM_SHARED`; `36-49` confirma codigo tecnico estavel. |
| Integracao em `ClassAiService.askClassAi(...)` | `CUMPRE` | `real_dev/api/src/modules/class-ai/class-ai.service.ts:85-90` valida membership e chama `assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")` antes de consentimento, policy e materiais. |
| Ordem antes de prompt, quota e provider | `CUMPRE` | `class-ai.service.ts:92-124` so lista materiais, cria prompt, valida limite, reserva quota e chama provider depois da policy. |
| Autenticacao e sessao no backend | `CUMPRE` | `real_dev/api/src/modules/class-ai/class-ai.controller.ts:13-15` usa rota autenticada com `SessionGuard`; `31-37` passa `request.user` ao service. |
| DTO e validacao global | `CUMPRE` | `AskClassAiDto` valida `question` em `real_dev/api/src/modules/class-ai/dto/ask-class-ai.dto.ts:9-13`; `ValidationPipe` global esta em `real_dev/api/src/main.ts:30-37`. |
| Membership aluno/disciplina | `CUMPRE` | `SubjectsService.findSubjectForStudent(...)` valida `ObjectId`, disciplina e inscricao do aluno via `ensureStudentEnrollment(...)` em `real_dev/api/src/modules/subjects/subjects.service.ts:167-179`. |
| Preservar consentimento, policy, quota e audit | `CUMPRE` | `class-ai.service.ts:89-117` chama consentimento, policy, limite de prompt e quota antes do provider; `141-154` e `169-181` auditam sucesso/falha sem prompt/resposta. |
| Teste de service com falha controlada da policy | `NAO_CUMPRE` | `class-ai.service.spec.ts:278-317` prova ordem por leitura estatica; `rg` nao encontrou `jest.spyOn(aiContextPolicy...)`, `mockImplementationOnce` ou teste que force `AI_CONTEXT_PROFILE_MISMATCH` no service e confirme que materiais/quota/provider/persistencia nao foram chamados. |
| Sem decisao de seguranca no frontend | `CUMPRE` | Nao ha implementacao frontend para decidir perfil; a policy e chamada apenas no backend. |
| Sem logs/segredos/storage indevido no alvo | `CUMPRE` | Pesquisa estatica em `real_dev/api/src/modules/ai/context` e `real_dev/api/src/modules/class-ai` nao encontrou `console.log`, `logger`, `cookie`, `password`, `secret`, `token`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `.only` ou `.skip`. |

### Finding novo

### P1 - Falta negativo de service para falha de perfil IA antes de materiais e provider

- ID: `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001`
- BK/RF/RNF: `BK-MF7-10` / `RNF32`
- Ficheiro(s):
  - `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`
  - `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- Linha(s):
  - `class-ai.service.spec.ts:278-317`
  - `BK-MF7-10...md:39`
  - `BK-MF7-10...md:511-548`
  - `BK-MF7-10...md:649`
- Evidencia observada:
  - A spec de service existente le `class-ai.service.ts` e compara indices de strings para confirmar a ordem `membership -> profile -> consent -> policy -> materials -> prompt limit -> quota -> provider`.
  - A mesma spec nao importa nem espia a policy, nao força `assertAiContextProfile(...)` a lançar `ForbiddenException` e nao prova por execucao que `materialsService.listProcessedForSubject`, `aiQuotasService.reserveUsage`, `aiProvider.generateClassAnswer` e `interactionModel.create` ficam sem chamadas quando a policy falha.
  - `rg -n "jest\\.spyOn\\(aiContextPolicy|mockImplementationOnce|AI_CONTEXT_PROFILE_MISMATCH|bloqueia perfil incompatível|assertAiContextProfile" real_dev/api/src/modules/class-ai real_dev/api/src/modules/ai/context` encontrou `AI_CONTEXT_PROFILE_MISMATCH` apenas na policy/spec da policy e a chamada real no service, mas nao encontrou o negativo de service descrito no guia.
- Contrato violado:
  - O scope-in do guia exige editar `class-ai.service.spec.ts` para provar que a falha de perfil acontece antes de materiais, quota, provider e persistencia.
  - Os criterios de aceite exigem caminho principal, tres negativos de policy e teste de service antes de materiais, quota, provider e persistencia.
- Origem entre MFs: `FALHA_DA_MF_ALVO`.
- Impacto:
  - O runtime observado esta na ordem correta, mas a evidence P0 nao cobre o caminho negativo de integracao que o guia pede.
  - Uma regressao futura poderia enfraquecer o bloqueio efetivo sem haver um teste executavel que force a falha da policy no service e confirme a ausencia de side effects.
  - Por ser negativo obrigatorio de um BK `P0`, bloqueia `PASS` do `BK-MF7-10` nesta auditoria.
- Como reproduzir/verificar:
  - Ler `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:278-317`.
  - Executar `rg -n "jest\\.spyOn\\(aiContextPolicy|mockImplementationOnce|AI_CONTEXT_PROFILE_MISMATCH" real_dev/api/src/modules/class-ai`.
  - Comparar com o teste esperado no guia em `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md:511-548`.
- Correcao recomendada:
  - Em modo `corrigir_auditoria`, alterar apenas a spec do service para importar a policy como namespace espiavel, forcar `assertAiContextProfile(...)` a lançar `ForbiddenException` uma vez, chamar `askClassAi(...)` e confirmar que materiais, quota, provider e persistencia nao foram chamados.
  - Manter os testes de policy existentes e preservar a chamada real no service.
- Fora de scope?: Nao. O finding esta dentro de `BK-MF7-10`, mas esta execucao e `auditar_implementacao`, portanto nao foi corrigido.

### Rastreabilidade BK-MF7-10 -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF7-10` | `RNF32` | `real_dev/api/src/modules/ai/context/ai-context-policy.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.controller.ts`, `real_dev/api/src/modules/class-ai/class-ai.module.ts`, `real_dev/api/src/modules/subjects/subjects.service.ts` | `ai-context-policy.spec.ts`, `class-ai.service.spec.ts`, build API, suite API, build web, pesquisas estaticas |
| Contexto anterior `BK-MF7-09` | `RNF31` | `real_dev/api/src/modules/source-grounded-ai/*` | Auditoria anterior preservada neste relatorio, com finding P1 ainda aberto |
| Contexto seguinte `BK-MF7-11` | `RNF33` | `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts` | O fluxo `ClassAiService` ja aplica policy, prompt limit e quota antes do provider |

### Contratos consumidos

- `MF6/BK-MF6-09` e `MF6/BK-MF6-10`: a separacao de contexto preserva o principio de guardrails e isolamento antes de provider.
- `BK-MF7-09`: deixa a cadeia de IA com fontes como contexto anterior, mas a auditoria anterior manteve um P1 aberto no fluxo source-grounded.
- `SubjectsService.findSubjectForStudent(...)`: confirma membership da disciplina antes da policy.
- `AiConsentsService`, `AiModelPoliciesService` e `AiQuotasService`: continuam a ser usados antes do provider no fluxo de IA da disciplina.
- `SessionGuard`: mantem a decisao de autenticacao no backend.

### Contratos entregues

- `AiContextType`: `PRIVATE_AREA`, `STUDY_ROOM`, `CLASS_SUBJECT`.
- `AiProfileType`: `STUDENT_PRIVATE`, `ROOM_SHARED`, `TEACHER_CLASS`.
- `assertAiContextProfile(...)`: policy reutilizavel por `BK-MF7-11`.
- `ClassAiService.askClassAi(...)`: chama a policy depois da membership e antes de materiais/prompt/quota/provider.
- Evidence parcial: testes da policy e testes de service/builds verdes.

Contrato nao entregue:

- Negativo executavel de service que force falha de perfil e prove ausencia de side effects antes de materiais, quota, provider e persistencia.

### Coerencia entre MFs para BK-MF7-10

Resultado: `COERENTE_COM_RISCOS`.

#### MF6 -> MF7

`BK-MF7-10` encaixa nos contratos de seguranca e isolamento ja existentes: membership da disciplina vem do backend, consentimento/policy/quota continuam antes do provider, e a policy de perfil falha com erro controlado sem expor prompts ou materiais.

Risco: o teste negativo de integracao pedido pelo guia ainda falta, por isso a prova P0 nao esta completa.

#### Dentro da MF7

`BK-MF7-10` deixa uma pre-condicao reutilizavel para `BK-MF7-11`: `assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")`. A cadeia MF7 ainda conserva o finding P1 anterior de `BK-MF7-09`, mas esse finding pertence ao fluxo source-grounded e nao foi reclassificado nesta execucao.

#### MF7 -> MF8

`MF8` pode consumir a separacao de perfis como base de seguranca IA, mas o BK alvo so deve ser aceite depois de fechar o negativo de service em falta.

### Findings por severidade da execucao BK-MF7-10

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | - |
| `P1` | 1 | `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001` |
| `P2` | 0 | - |
| `P3` | 0 | - |

### Pesquisa estatica da execucao BK-MF7-10

| Pesquisa | Resultado | Classificacao |
| --- | --- | --- |
| `rg` para `assertAiContextProfile`, `CLASS_SUBJECT`, `TEACHER_CLASS`, `STUDENT_PRIVATE`, `ROOM_SHARED` | `PASS_COM_FINDING` | Implementacao encontrada em policy/service/specs; ausencia do spy negativo de service confirma o finding P1. |
| `rg` para `console.log`, `logger`, `cookie`, `password`, `secret`, `token`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `.only`, `.skip` nos modulos alvo | `PASS` | Sem ocorrencias em `real_dev/api/src/modules/ai/context` e `real_dev/api/src/modules/class-ai`. |
| `rg` para RAG, embeddings, OCR, chunking, indexacao automatica, Drive, LMS e monitorizacao | `PASS_COM_NOTA` | Ocorrencia apenas no scope-out do guia; a implementacao auditada nao promete estas capacidades. |

### Validacoes executadas na execucao BK-MF7-10

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `git status --short` | `PASS_INFORMATIVO` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao versionados; preservadas. |
| `git check-ignore -v real_dev` | `PASS` | `.gitignore:2:real_dev/` confirmou raiz ignorada esperada. |
| `npm --prefix real_dev/api test -- ai-context-policy class-ai --runInBand` | `PASS` | 2 suites passadas; 15 testes passados. |
| `npm --prefix real_dev/api run build` | `PASS` | Build NestJS concluido. |
| `npm --prefix real_dev/web run build` | `PASS` | `tsc --noEmit` e `vite build` concluidos; 122 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` | 86 suites passadas; 325 testes passados. |
| Pesquisas estaticas de seguranca/scope | `PASS_COM_FINDING` | Sem segredos/storage/logs no alvo; finding P1 confirmado por ausencia do negativo de service. |
| `git diff --check` | `PASS` | Sem whitespace errors antes da atualizacao final do relatorio. |

### Validacoes nao executadas

| Comando | Motivo |
| --- | --- |
| Smoke HTTP real `POST /api/student/subjects/:subjectId/ai/answers` | Nao executado por proporcionalidade e por exigir sessao autenticada, dados de turma/disciplina, materiais oficiais processados e provider/fake provider runtime; o finding e demonstravel por spec e pesquisa estatica. |
| Suite Playwright completa | Nao executada porque o BK e backend/policy e nao altera frontend. |
| `bash scripts/validate-planificacao.sh` | Nao executado porque `PERMITIR_ALTERAR_DOCS=nao` e nao houve alteracao a docs canonicos/guias/matriz/backlog; apenas este relatorio tecnico permitido. |

### Ficheiros auditados na execucao BK-MF7-10

- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `real_dev/api/src/modules/ai/context/ai-context-policy.ts`
- `real_dev/api/src/modules/ai/context/ai-context-policy.spec.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`
- `real_dev/api/src/modules/class-ai/class-ai.controller.ts`
- `real_dev/api/src/modules/class-ai/class-ai.module.ts`
- `real_dev/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/api/src/app.module.ts`
- `real_dev/api/src/main.ts`
- `real_dev/api/package.json`
- `real_dev/web/package.json`

### Ficheiros alterados na execucao BK-MF7-10

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`: atualizado para acrescentar a auditoria de `BK-MF7-10`.

Nao foram alterados ficheiros de codigo, guias BK, matriz, backlog, prompts, docs canonicos, scripts de planificacao ou relatorios de implementacao/correcao.

### Blockers, TODOs e riscos residuais

- `SEM_BLOCKERS_AMBIENTE`: builds e testes principais passaram.
- `TODO_P1`: corrigir `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001` em modo `corrigir_auditoria`.
- `RISCO_CADEIA_MF7`: o P1 anterior de `BK-MF7-09` permanece preservado neste relatorio e deve ser tratado separadamente.
- `NOTA_WORKTREE`: alteracoes pre-existentes fora do escopo foram preservadas.

### Decisao final da execucao BK-MF7-10

`BK-MF7-10` fica classificado como `FAIL`.

A implementacao principal de separacao de perfis IA esta presente, integrada e validada por builds/testes. O bloqueador e de evidence/teste negativo obrigatorio: falta provar por execucao de service que uma falha de perfil para antes de materiais, quota, provider e persistencia. Enquanto esse negativo nao existir, `RNF32` nao deve ser aceite como fechado.

---

## Auditoria adicional 2026-06-30 - BK-MF7-11

### Header da execucao atual

- `project`: `StudyFlow`
- `macro`: `MF7`
- `bk_ids`: [`BK-MF7-11`]
- `modo`: `auditar_implementacao`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `profundidade_coerencia`: `vizinhas`
- `permitir_alterar_docs`: `nao`, exceto este relatorio tecnico de auditoria
- `permitir_commits`: `nao`
- `resultado_execucao_bk_mf7_11`: `PASS`

### Inventario canonico BK-MF7-11

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md:101` | `RNF33` exige que a IA siga limites definidos pelo professor. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:106` | `BK-MF7-11` esta ligado a `RNF33`, prioridade `P0`, sprint `S12`, proximo BK `BK-MF8-01`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:125` | Repete o contrato canonico do BK e o handoff para `BK-MF8-01`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:124` | Confirma owner `Guilherme`, apoio `Natalia`, prioridade `P0`, `RNF33`, sprint `S12` e guia publico. |
| `docs/planificacao/backlogs/MF-VIEWS.md:227` | A sequencia da MF7 inclui `BK-MF7-11` como ultimo BK da macrofase. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md:24` | Objetivo exige aplicar limites antes de chamar a IA da disciplina. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md:53` | Estado depois esperado: `resolveForUse("CLASS_AI")`, `assertPromptWithinLimit(...)`, `reserveUsage(...)`, `generateClassAnswer(...)`. |
| `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md:438` | Criterio operacional exige que policy desativada, prompt acima do limite e quota falhada bloqueiem antes do provider. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md:1` | Handoff documental para MF8, que passa a trabalhar seguranca de IA sobre a base limitada por BK-MF7-11. |

### Estado por requisito do BK-MF7-11

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Contrato de limite de prompt no backend | `CUMPRE` | `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts:18-48` define defaults, `ResolvedAiModelPolicy` e `assertPromptWithinLimit(...)`, que usa `maxPromptChars` valido ou fallback seguro e lança `AI_PROMPT_TOO_LARGE` antes de provider. |
| Policy efetiva com estado ativo | `CUMPRE` | `resolveForUse(...)` em `ai-model-policies.service.ts:95-113` resolve defaults e bloqueia policy desativada com `AI_MODEL_POLICY_DISABLED`. |
| Limites configuraveis e validados | `CUMPRE` | Schema e DTO expõem `maxSourceCount` e `maxPromptChars` com limites em `ai-model-policy.schema.ts:31-34` e `upsert-ai-model-policy.dto.ts:31-36`. |
| Endpoint da IA de disciplina | `CUMPRE` | `real_dev/api/src/modules/class-ai/class-ai.controller.ts:13` define `POST /api/student/subjects/:subjectId/ai/answers`; o fluxo recebe `request.user` via controller e delega no service. |
| Membership e perfil antes dos limites docentes | `CUMPRE` | `ClassAiService.askClassAi(...)` valida aluno/disciplina em `class-ai.service.ts:87` e chama `assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")` em `88`, antes de consentimento, policy, materiais, prompt, quota e provider. |
| Sequencia `resolveForUse -> limite -> quota -> provider` | `CUMPRE` | `class-ai.service.ts:89-122` chama `assertGranted`, `resolveForUse("CLASS_AI")`, lista materiais oficiais, aplica `materials.slice(0, policy.maxSourceCount)`, constrói prompt, chama `assertPromptWithinLimit(prompt, policy)`, reserva quota e so depois chama `generateClassAnswer(...)`. |
| Sem fontes oficiais processadas | `CUMPRE` | `class-ai.service.ts:92-101` lança `NO_OFFICIAL_AI_SOURCES` antes de voz, prompt, quota e provider. |
| Logs/evidence sem prompts privados ou respostas completas | `CUMPRE` | Auditoria de sucesso/falha em `class-ai.service.ts:141-181` grava apenas metadados tecnicos (`purpose`, `classId`, `model`, `sourceCount`), sem prompt, answer, cookies, tokens ou materiais privados. |
| Teste unitario do limite | `CUMPRE` | `ai-model-policies.service.spec.ts:79-100` cobre prompt acima do limite, prompt no limite e fallback invalido. |
| Teste de service e negativos P0 | `CUMPRE` | `class-ai.service.spec.ts:101-126` cobre policy desativada antes de materiais/quota/provider; `219-244` cobre prompt acima do limite antes de quota/provider/persistencia/audit; `249-281` cobre quota falhada antes de provider/persistencia. |
| Handoff para MF8 | `CUMPRE` | `IMPLEMENTACAO-REAL_DEV-MF7.md:223` regista que `BK-MF8-01` pode trabalhar enviesamentos e respostas inseguras sobre IA ja limitada por fontes, perfil e tamanho de prompt. |

### Rastreabilidade BK-MF7-11 -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF7-11` | `RNF33` | `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`, `real_dev/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts`, `real_dev/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.controller.ts` | `ai-model-policies.service.spec.ts`, `class-ai.service.spec.ts`, build API, suite API, build web, pesquisa estatica |
| Contexto anterior `BK-MF7-10` | `RNF32` | `real_dev/api/src/modules/ai/context/ai-context-policy.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts` | `class-ai.service.spec.ts` confirma falha de perfil antes de consentimento, materiais, quota, provider e persistencia. |
| Contexto seguinte `BK-MF8-01` | `RNF34` | `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md` | Handoff documental; nao foi implementado scope MF8 nesta auditoria. |

### Contratos consumidos

- `MF4`: consentimentos, policies de modelo e quotas de IA; `BK-MF7-11` reutiliza `AiModelPoliciesService.resolveForUse(...)` e `AiQuotasService.reserveUsage(...)` em vez de criar limites paralelos.
- `MF6`: guardrails, isolamento e bloqueio sem fontes processaveis; o fluxo da IA da disciplina falha sem materiais oficiais antes de provider.
- `BK-MF7-10`: separacao `CLASS_SUBJECT`/`TEACHER_CLASS` e teste negativo de perfil; `BK-MF7-11` aplica limites apenas depois dessa fronteira.
- `SubjectsService.findSubjectForStudent(...)`: membership de aluno/disciplina continua no backend.
- `SessionGuard`: autenticacao continua no controller, sem depender do frontend.

### Contratos entregues

- `DEFAULT_AI_MAX_PROMPT_CHARS = 12000` e fallback seguro para policies invalidas.
- `assertPromptWithinLimit(prompt, policy)`: bloqueio P0 de prompt demasiado grande antes de quota/provider.
- `ResolvedAiModelPolicy.maxSourceCount` e `maxPromptChars`: contrato efetivo para limitar fontes e prompt.
- `ClassAiService.askClassAi(...)`: sequencia segura `membership -> perfil -> consentimento -> policy -> materiais oficiais -> voz -> prompt -> limite -> quota -> provider`.
- Evidence P0: caminho principal, teste unitario de policy e negativos de policy desativada, prompt excessivo e quota falhada.

### Coerencia entre MFs para BK-MF7-11

Resultado: `COERENTE`.

#### MF6 -> MF7

`BK-MF7-11` encaixa nos contratos de seguranca e isolamento: o service valida membership no backend, usa contexto `CLASS_SUBJECT/TEACHER_CLASS`, bloqueia sem materiais oficiais processados, e nao chama o provider antes de consentimento, policy, limite de prompt e quota.

#### Dentro da MF7

`BK-MF7-09` e `BK-MF7-10` ja têm relatorio de correcao separado com findings corrigidos. A execucao atual confirma que `BK-MF7-11` consome a policy de perfil entregue por `BK-MF7-10` e acrescenta limites docentes sem criar endpoint, schema ou finalidade paralela.

#### MF7 -> MF8

`BK-MF7-11` entrega a pre-condicao tecnica para `BK-MF8-01`: a IA da disciplina esta limitada por fontes oficiais, perfil, policy, prompt e quota antes de qualquer chamada externa. Esta auditoria nao implementou anti-enviesamento, filtros de seguranca futuros, RAG, embeddings, OCR, chunking semantico ou integracoes externas.

### Findings por severidade da execucao BK-MF7-11

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | - |
| `P1` | 0 | - |
| `P2` | 0 | - |
| `P3` | 0 | - |

### Pesquisa estatica da execucao BK-MF7-11

| Pesquisa | Resultado | Classificacao |
| --- | --- | --- |
| `rg` para `assertPromptWithinLimit`, `maxPromptChars`, `maxSourceCount`, `resolveForUse("CLASS_AI")`, `reserveUsage` e `generateClassAnswer` | `PASS` | Contratos encontrados nos services, DTOs, schemas e testes. |
| `rg` para `console.log`, `logger`, `cookie`, `password`, `secret`, `token`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `.only`, `.skip` nos modulos alvo | `PASS_COM_NOTA` | Sem logs/segredos/storage indevido; ocorrencias de `prompt`/`answer` sao variaveis tecnicas, fixtures de teste e contrato do provider. |
| `rg` para RAG, embeddings, OCR, chunking, indexacao automatica, Drive e LMS | `PASS` | Sem promessa de scope futuro nos modulos auditados. |

### Validacoes executadas na execucao BK-MF7-11

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `git status --short` | `PASS_INFORMATIVO` | Worktree ja tinha alteracoes documentais/MF8 e relatorios MF7 nao versionados; preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` | `.gitignore:2:real_dev/` confirmou raiz ignorada esperada. |
| `npm --prefix real_dev/api test -- ai-model-policies class-ai --runInBand` | `PASS` | 2 suites passadas; 15 testes passados. |
| `npm --prefix real_dev/api run build` | `PASS` | Build NestJS concluido. |
| `npm --prefix real_dev/web run build` | `PASS` | `tsc --noEmit` e `vite build` concluidos; 122 modulos transformados. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` | 86 suites passadas; 326 testes passados. |
| Pesquisas estaticas de seguranca/scope | `PASS_COM_NOTA` | Sem segredos/storage/logs indevidos no alvo; `prompt`/`answer` aparecem apenas em variaveis, fixtures e contrato. |
| `git diff --check` | `PASS` | Sem whitespace errors nos diffs. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md` | `PASS` | Sem trailing whitespace no relatorio. |
| `bash scripts/validate-planificacao.sh` | `PASS` | Validador devolveu `overall_pass: true`, `score.total: 100`, 107 BKs na matriz/backlog/guias e zero drift critico. |

### Validacoes nao executadas

| Comando | Motivo |
| --- | --- |
| Smoke HTTP real `POST /api/student/subjects/:subjectId/ai/answers` | Nao executado por proporcionalidade e por exigir sessao autenticada, dados de turma/disciplina, materiais oficiais processados e provider/fake provider runtime; a cadeia P0 foi validada por service tests, suite API, build e pesquisa estatica. |
| Suite Playwright completa | Nao executada porque o BK e backend/policy e nao altera frontend. |

### Ficheiros auditados na execucao BK-MF7-11

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
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- `real_dev/api/src/modules/ai-model-policies/schemas/ai-model-policy.schema.ts`
- `real_dev/api/src/modules/ai-model-policies/dto/upsert-ai-model-policy.dto.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`
- `real_dev/api/src/modules/class-ai/class-ai.controller.ts`
- `real_dev/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/api/src/modules/ai-quotas/ai-quotas.service.ts`
- `real_dev/api/package.json`
- `real_dev/web/package.json`

### Ficheiros alterados na execucao BK-MF7-11

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`: atualizado para acrescentar a auditoria de `BK-MF7-11` e normalizar o resumo atual.

Nao foram alterados ficheiros de codigo, guias BK, matriz, backlog, prompts, docs canonicos, scripts de planificacao ou relatorios de implementacao/correcao.

### Blockers, TODOs e riscos residuais

- `SEM_BLOCKERS_ATIVOS`: builds e testes principais passaram.
- `SEM_FINDINGS_BK_MF7_11`: nao ha P0/P1/P2/P3 novos para o BK auditado.
- `NOTA_HISTORICO`: secoes anteriores deste relatorio preservam findings ja tratados no relatorio de correcao MF7.
- `NOTA_WORKTREE`: alteracoes pre-existentes fora do escopo foram preservadas.

### Decisao final da execucao BK-MF7-11

`BK-MF7-11` fica classificado como `PASS`.

`RNF33` esta demonstrado por codigo, testes focados, suite API completa, builds backend/frontend e pesquisa estatica. A IA da disciplina segue limites administrativos antes de quota/provider e entrega handoff coerente para `BK-MF8-01`.
