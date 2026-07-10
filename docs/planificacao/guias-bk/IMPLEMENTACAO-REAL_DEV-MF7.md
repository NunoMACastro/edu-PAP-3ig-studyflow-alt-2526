---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# IMPLEMENTACAO-REAL_DEV-MF7

## Resultado geral

- Projeto: StudyFlow
- Modo executado: `implementar`
- Implementation root: `real_dev`
- MF alvo: `MF7`
- BKs abrangidos nesta execucao: `BK-MF7-10`, `BK-MF7-11`
- BKs acumulados neste relatorio: `BK-MF7-01`, `BK-MF7-02`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF7-05`, `BK-MF7-06`, `BK-MF7-07`, `BK-MF7-08`, `BK-MF7-09`, `BK-MF7-10`, `BK-MF7-11`
- Estado geral: `IMPLEMENTADO`
- Data: `2026-06-30`
- Relatorio: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

## Escopo implementado

### BK-MF7-01 - RNF23

Estado: `IMPLEMENTADO`

- `StructuredEventService` normaliza eventos operacionais antes de persistir audit log.
- Prompts, respostas IA, cookies, passwords, tokens, secrets, `apiKey` e authorization ficam redigidos como `[REDACTED]`.
- `AuditLogService.record(...)` reutiliza o contrato de auditoria existente e mantem uma segunda barreira de redacao antes da BD.
- Testes cobrem privacidade, metadata operacional e recusa de evento sem correlacao.

### BK-MF7-02 - RNF24

Estado: `IMPLEMENTADO`

- `evaluateAvailabilityBudget(...)` em `real_dev/api/src/common/operations/availability-budget.ts` calcula disponibilidade mensal agregada.
- Estados entregues: `HEALTHY`, `WARNING`, `BREACHED`.
- O limite mensal fica em `60` minutos; `WARNING` surge aos 80% do limite.
- Valores negativos, `NaN` e infinitos sao recusados para evitar evidence enganadora.

### BK-MF7-03 - RNF25

Estado: `IMPLEMENTADO`

- `domain-boundary.ts` define fronteiras backend entre dominios como `AI`, `MATERIALS`, `TEACHER`, `STUDENT`, `GROUP`, `AUTH` e `OPERATIONS`.
- `domain-boundary.spec.ts` valida imports declarados em `AppModule`, cobertura dos dominios principais e ausencia de violacoes de fronteira em modulos reais.
- A verificacao usa `process.cwd()` para funcionar com `ts-jest` neste repo e evitar drift de `import.meta.url`.

### BK-MF7-04 - RNF26

Estado: `IMPLEMENTADO`

- `AsyncStateBlock` centraliza estados frontend de loading, erro, vazio e conteudo.
- `StudyToolsPage` e `TeacherOfficialMaterialsPage` reutilizam o componente sem mover regras de ownership, role ou permissao para o frontend.
- `mf7-async-state-block.spec.ts` cobre vazio, erro de carregamento, erro de geracao e erro docente sem bloquear acoes principais.

### BK-MF7-05 - RNF27

Estado: `IMPLEMENTADO`

- `real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md` documenta modulos, rotas, endpoints, modelos, fluxos e regras de seguranca dentro do `IMPLEMENTATION_ROOT`.
- `exportTechnicalMap(...)` valida estaticamente o `AppModule` e falha fechado quando falta um modulo critico.
- A exportacao evita segredos, cookies, prompts privados, respostas IA completas e dados pessoais.

### BK-MF7-06 - RNF28

Estado: `IMPLEMENTADO`

- `source-grounded-ai.contract.spec.ts` cobre o modulo critico de IA com fontes.
- A suite prova caminho principal, bloqueio sem fontes autorizadas e falha controlada quando o provider devolve artefacto invalido.
- O teste reutiliza `SourceGroundedAiService`, `MaterialIndexService.findReadableDoneJob`, `AI_PROVIDER` e `SourceGroundedAiAnswer`.

### BK-MF7-07 - RNF29

Estado: `IMPLEMENTADO`

- Criado `real_dev/docs/ops/DEPLOY-ROLLBACK.md` como documento operacional de rollback dentro de `IMPLEMENTATION_ROOT`, porque `PERMITIR_ALTERAR_DOCS=nao` impede criar `docs/ops` na raiz canonica.
- Criado `validateDeployReadiness(...)` e `assertDeployReadiness(...)` em `real_dev/api/src/scripts/validate-deploy-readiness.ts`.
- Adicionado `deploy:check` a `real_dev/api/package.json`.
- O comando compila a API e executa `dist/scripts/validate-deploy-readiness.js`.
- A versao vem de `STUDYFLOW_RELEASE_VERSION`; o plano de rollback por defeito e `../docs/ops/DEPLOY-ROLLBACK.md` relativo a `real_dev/api`.
- `STUDYFLOW_ROLLBACK_DOC_PATH` permite validar um caminho alternativo sem hardcode de ambiente.
- Testes cobrem caminho principal, negativo sem versao e negativo sem documento de rollback.
- O script falha fechado com mensagem operacional em portugues quando falta qualquer condicao minima.

### BK-MF7-08 - RNF30

Estado: `IMPLEMENTADO`

- Criado `HealthService` em `real_dev/api/src/common/health/health.service.ts`.
- Criado `HealthController` em `real_dev/api/src/common/health/health.controller.ts` com `GET /api/health` publico.
- Criado `HealthModule` em `real_dev/api/src/common/health/health.module.ts` e integrado em `AppModule`.
- O health-check devolve apenas `status`, `uptimeSeconds`, `version` e `availability`.
- `HealthService` consome `evaluateAvailabilityBudget(...)` de `BK-MF7-02`, sem duplicar a regra de disponibilidade.
- A versao publica usa `STUDYFLOW_RELEASE_VERSION` quando definida e cai para `dev` quando ausente.
- `STUDYFLOW_MONTHLY_DOWNTIME_MINUTES` invalido volta a `0` sem expor o valor bruto na resposta publica.
- Testes cobrem caminho principal, ausencia de identidade/sessao e ausencia de configuracao interna ou stack traces.
- Smoke HTTP confirmou `HTTP/1.1 200 OK` em `GET /api/health`.
- Nesta execucao, o contrato continuou verde em `health.controller.spec.ts` e no build backend.

### BK-MF7-09 - RNF31

Estado: `IMPLEMENTADO`

- Criado `normalizePublicCitation(...)` em `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`.
- Criado `citation-policy.spec.ts` com caminho principal e negativos P0 para fonte sem nome, sem localizacao e sem excerto verificavel.
- `SourceGroundedAiService.toCitation(...)` passou a usar a policy depois de `MaterialIndexService.findReadableDoneJob(...)`, mantendo ownership/membership no backend antes de qualquer prompt/provider.
- O excerto publico continua limitado a `420` caracteres, agora num contrato isolado e reutilizavel.
- `SourceGroundedAiPanel` passou a apresentar `sourceLabel`, `locator` e `excerpt` em cada citacao.
- O frontend continua a enviar apenas `sourceJobIds` e `question`; decisoes de sessao, ownership, membership, role, quota e fonte autorizada permanecem no backend.
- Testes source-grounded confirmam que fonte proibida bloqueia antes de chamar `AI_PROVIDER` e antes de persistir a resposta.

### BK-MF7-10 - RNF32

Estado: `IMPLEMENTADO`

- Criado `assertAiContextProfile(...)` em `real_dev/api/src/modules/ai/context/ai-context-policy.ts`.
- A policy define os pares permitidos `PRIVATE_AREA/STUDENT_PRIVATE`, `STUDY_ROOM/ROOM_SHARED` e `CLASS_SUBJECT/TEACHER_CLASS`.
- `ClassAiService.askClassAi(...)` valida `CLASS_SUBJECT` com perfil `TEACHER_CLASS` logo depois de `subjectsService.findSubjectForStudent(...)` e antes de listar materiais oficiais.
- A falha usa `ForbiddenException` com codigo estavel `AI_CONTEXT_PROFILE_MISMATCH`, sem guardar prompt, materiais, cookies, tokens ou dados pessoais.
- Testes cobrem caminho principal dos tres perfis e tres negativos P0 de mistura entre area privada, sala e disciplina.
- Teste de service confirma estaticamente a ordem membership -> policy de perfil -> materiais oficiais.

### BK-MF7-11 - RNF33

Estado: `IMPLEMENTADO`

- `assertPromptWithinLimit(...)` em `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts` bloqueia prompts acima de `maxPromptChars`.
- `ClassAiService.askClassAi(...)` mantem a sequencia `resolveForUse("CLASS_AI")`, `assertPromptWithinLimit(...)`, `reserveUsage(...)` e `generateClassAnswer(...)`.
- O limite e resolvido a partir da policy efetiva, com fallback seguro `DEFAULT_AI_MAX_PROMPT_CHARS = 12000` quando o valor administrativo e invalido.
- Testes de policy cobrem prompt acima do limite, prompt exatamente no limite e fallback invalido.
- Teste de service prova que prompt demasiado grande bloqueia antes de reservar quota, chamar provider, persistir interacao ou auditar resultado.
- O endpoint `POST /api/student/subjects/:subjectId/ai/answers` continua autenticado por `SessionGuard`; ownership/membership fica no backend via `SubjectsService`.

## Documentos consultados

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
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-03-backend-modular-por-dominios-aluno-professor-ia-materiais.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-04-frontend-componentizado-e-reutilizavel.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-05-documentacao-tecnica-minima-modelos-fluxos-endpoints.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-06-testes-automatizados-para-modulos-criticos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-07-deploy-com-rollback.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

## Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Testes |
| --- | --- | --- | --- |
| `BK-MF7-01` | `RNF23` | `real_dev/api/src/common/observability/structured-event.service.ts`, `real_dev/api/src/modules/audit-log/audit-log.service.ts` | `structured-event.service.spec.ts`, `audit-log.service.spec.ts` |
| `BK-MF7-02` | `RNF24` | `real_dev/api/src/common/operations/availability-budget.ts` | `availability-budget.spec.ts` |
| `BK-MF7-03` | `RNF25` | `real_dev/api/src/common/architecture/domain-boundary.ts`, `real_dev/api/src/app.module.ts` | `domain-boundary.spec.ts` |
| `BK-MF7-04` | `RNF26` | `real_dev/web/src/components/ui/AsyncStateBlock.tsx`, `real_dev/web/src/pages/student/StudyToolsPage.tsx`, `real_dev/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx` | `mf7-async-state-block.spec.ts` |
| `BK-MF7-05` | `RNF27` | `real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md`, `real_dev/api/src/scripts/export-technical-map.ts` | `export-technical-map.spec.ts` |
| `BK-MF7-06` | `RNF28` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts` | `source-grounded-ai.contract.spec.ts` |
| `BK-MF7-07` | `RNF29` | `real_dev/docs/ops/DEPLOY-ROLLBACK.md`, `real_dev/api/src/scripts/validate-deploy-readiness.ts`, `real_dev/api/package.json` | `validate-deploy-readiness.spec.ts` |
| `BK-MF7-08` | `RNF30` | `real_dev/api/src/common/health/health.service.ts`, `real_dev/api/src/common/health/health.controller.ts`, `real_dev/api/src/common/health/health.module.ts`, `real_dev/api/src/app.module.ts` | `health.controller.spec.ts`, smoke HTTP `GET /api/health` |
| `BK-MF7-09` | `RNF31` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx` | `citation-policy.spec.ts`, `source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts` |
| `BK-MF7-10` | `RNF32` | `real_dev/api/src/modules/ai/context/ai-context-policy.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts` | `ai-context-policy.spec.ts`, `class-ai.service.spec.ts` |
| `BK-MF7-11` | `RNF33` | `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts` | `ai-model-policies.service.spec.ts`, `class-ai.service.spec.ts` |

## Contratos consumidos

- `MF6` entrega seguranca, cookies HttpOnly, CSRF, guardrails, isolamento IA, recovery e suites criticas; esta execucao nao alterou esses contratos.
- `BK-MF7-02` entrega `evaluateAvailabilityBudget(...)`, agora consumido por `HealthService.getStatus(...)`.
- `BK-MF7-06` entrega suites automatizadas criticas que servem como pre-condicao operacional para `deploy:check`.
- `BK-MF7-07` entrega plano de rollback e readiness antes do health-check.
- `BK-MF7-08` entrega `GET /api/health` como pre-condicao operacional antes de validar fluxos de IA com fontes.
- `MF6` entrega `MaterialIndexService.findReadableDoneJob(...)`, guardrails e bloqueio sem fontes processaveis; `BK-MF7-09` reutiliza esses contratos sem criar endpoint paralelo.
- `BK-MF7-09` entrega citacoes normalizadas e disciplina de fonte autorizada antes do provider; `BK-MF7-10` preserva essa fronteira ao validar perfil antes de aceder a materiais da disciplina.
- `MF4` entrega consentimentos, policies e quotas de IA; `BK-MF7-11` reutiliza `AiModelPoliciesService.resolveForUse(...)` e `AiQuotasService.reserveUsage(...)` em vez de criar limites paralelos.
- `MF6` entrega guardrails e isolamento entre alunos/turmas; `BK-MF7-10` e `BK-MF7-11` acrescentam checks especificos da IA da disciplina sem alterar os services de ownership/membership.
- `AppModule` continua a ser o ponto unico de composicao NestJS; `HealthModule` foi acrescentado sem duplicar controllers existentes.
- O arranque E2E existente com `MongoMemoryServer` foi reutilizado para smoke HTTP, sem nova dependencia.

## Contratos entregues

- `real_dev/docs/ops/DEPLOY-ROLLBACK.md`: plano operacional de deploy/rollback sem segredos.
- `validateDeployReadiness(...)`: regra pura para validar versao e documento de rollback.
- `assertDeployReadiness(...)`: bloqueio operacional para comando CLI.
- `deploy:check`: comando repetivel em `real_dev/api/package.json`.
- `HealthView`: resposta publica minima com `status`, `uptimeSeconds`, `version` e `availability`.
- `GET /api/health`: endpoint publico de operacao para deploy, rollback e smoke.
- `HealthModule`: modulo tecnico comum, sem dependencias de dominio, sessao ou dados privados.
- `normalizePublicCitation(...)`: policy backend para validar `sourceLabel`, `locator` e `excerpt` antes de persistir/devolver citacoes.
- `SourceGroundedAiService.toCitation(...)`: integracao da policy apos autorizacao da fonte e antes do provider.
- `SourceGroundedAiPanel`: UI com `sourceLabel`, `locator` e `excerpt` limitado pelo backend.
- `assertAiContextProfile(...)`: policy backend reutilizavel para bloquear mistura entre `PRIVATE_AREA`, `STUDY_ROOM` e `CLASS_SUBJECT`.
- `ClassAiService.askClassAi(...)`: sequencia protegida membership -> perfil IA -> materiais oficiais -> voz/consentimento/policy -> prompt -> limite -> quota -> provider.
- `assertPromptWithinLimit(...)`: limite efetivo de prompt aplicado antes de quota/provider para respeitar limites docentes.
- Handoff para `BK-MF8-01`: a IA da disciplina chega a MF8 com fontes autorizadas, perfil `TEACHER_CLASS` separado e limites administrativos aplicados antes do provider.

## Coerencia entre MFs

Resultado: `COERENTE`.

### MF6 -> MF7

`MF6` deixa base de seguranca, recuperacao, guardrails, bloqueio sem fontes e autorizacao de jobs de indexacao. `BK-MF7-08` expoe apenas um sinal operacional minimo e nao contorna ownership, membership ou auth de endpoints de dominio. `BK-MF7-09` consome `findReadableDoneJob(...)` antes de criar citacoes, mantendo a fronteira de fontes autorizadas antes do prompt e do provider.

### Dentro da MF7

`BK-MF7-02` entrega a regra de disponibilidade que `BK-MF7-08` consome diretamente. `BK-MF7-03` valida fronteiras backend antes de a MF reforcar contratos operacionais e de IA. `BK-MF7-04` reduz duplicacao frontend com um componente reutilizavel que preserva as regras de permissao no backend. `BK-MF7-06` reforca a evidence automatizada para IA com fontes. `BK-MF7-07` cria readiness e rollback; `BK-MF7-08` valida que a API responde depois desse deploy/rollback; `BK-MF7-09` reforca a explicabilidade das respostas com fontes sem criar outro endpoint nem outro schema. `BK-MF7-10` acrescenta separacao explicita de perfis IA antes de listar materiais oficiais. `BK-MF7-11` aplica limites docentes antes de quota/provider, reutilizando policies e quotas existentes. Nao foram criados contratos paralelos para disponibilidade, runtime, fronteiras backend, componentes async, autorizacao de fontes, citacoes, perfis IA, policies ou quotas.

### MF7 -> MF8

`BK-MF7-10` entrega separacao explicita de perfis de IA e `BK-MF7-11` entrega limite administrativo antes do provider. `BK-MF8-01` pode trabalhar enviesamentos e respostas inseguras sobre uma IA da disciplina ja limitada por fontes, perfil e tamanho de prompt. `MF8` permanece fora do scope desta execucao: nao foram introduzidos RAG, embeddings, OCR, chunking semantico, provider externo novo ou politicas futuras de IA.

## Findings por severidade

| Severidade | Quantidade ativa |
| --- | ---: |
| `P0` | 0 |
| `P1` | 0 |
| `P2` | 0 |
| `P3` | 0 |

Nao foram encontrados findings ativos dentro do escopo implementado.

## Pesquisa estatica

Pesquisa executada sobre ficheiros novos/alterados:

```bash
rg -n "console\\.log|logger\\." real_dev/api/src/modules/source-grounded-ai real_dev/web/src/features/source-grounded-ai
rg -n "cookie|password|authorization|bearer|sessionStorage|localStorage|as any|payload: unknown|TODO|FIXME|test\\.skip|describe\\.skip|it\\.skip|\\.only\\(" real_dev/api/src/modules/source-grounded-ai real_dev/web/src/features/source-grounded-ai
rg -n "prompt|resposta IA privada|prompt privado|RAG|embedding|embeddings|OCR|chunking semantico|chunking semântico" real_dev/api/src/modules/source-grounded-ai real_dev/web/src/features/source-grounded-ai
rg -n "console\\.log|logger\\.|cookie|password|secret|token|authorization|bearer|sessionStorage|localStorage|as any|payload: unknown|TODO|FIXME|test\\.skip|describe\\.skip|it\\.skip|\\.only\\(|RAG|embedding|embeddings|OCR|chunking semantico|chunking semântico" real_dev/api/src/modules/ai/context real_dev/api/src/modules/class-ai real_dev/api/src/modules/ai-model-policies
rg -n "[ \t]$" real_dev/api/src/modules/source-grounded-ai/citation-policy.ts real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md
```

Classificacao:

- Nao ha `console.log`, `logger`, `cookie`, `password`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, TODO/FIXME, skips ou `.only` no fluxo source-grounded afetado.
- `prompt` aparece apenas no service source-grounded e em testes que confirmam o contrato `Fontes autorizadas`; nao ha logs de prompts privados.
- `RAG` aparece apenas no comentario que explica que a selecao lexical simples nao introduz RAG externo.
- No fluxo BK-MF7-10/BK-MF7-11 nao ha `console.log`, `logger`, `cookie`, `password`, `secret`, `token`, `authorization`, `bearer`, `sessionStorage`, `localStorage`, `as any`, `payload: unknown`, TODO/FIXME, skips, `.only`, RAG, embeddings, OCR ou chunking semantico.
- Nao ha trailing whitespace nos ficheiros alterados nem neste relatorio.

## Ficheiros alterados/criados

- `real_dev/docs/ops/DEPLOY-ROLLBACK.md`
- `real_dev/api/src/common/architecture/domain-boundary.ts`
- `real_dev/api/src/common/architecture/domain-boundary.spec.ts`
- `real_dev/api/src/scripts/validate-deploy-readiness.ts`
- `real_dev/api/src/scripts/validate-deploy-readiness.spec.ts`
- `real_dev/api/src/common/health/health.service.ts`
- `real_dev/api/src/common/health/health.controller.ts`
- `real_dev/api/src/common/health/health.module.ts`
- `real_dev/api/src/common/health/health.controller.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`
- `real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/api/src/modules/ai/context/ai-context-policy.ts`
- `real_dev/api/src/modules/ai/context/ai-context-policy.spec.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`
- `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.spec.ts`
- `real_dev/web/src/components/ui/AsyncStateBlock.tsx`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`
- `real_dev/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`
- `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts`
- `real_dev/api/package.json`
- `real_dev/api/src/app.module.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF7.md`

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_INFORMATIVO` - havia alteracoes documentais pre-existentes em `docs/planificacao`/MF8 e relatorios MF7 untracked; foram preservadas. |
| `git check-ignore -v real_dev` | `PASS_INFORMATIVO` - confirmou `.gitignore:2:real_dev/`; por isso a implementacao real pode nao aparecer no diff normal. |
| `npm --prefix real_dev/api test -- validate-deploy-readiness --runInBand` | `FAIL_INICIAL` - `ts-jest` recusou `import.meta.url`; corrigido para o padrao local `process.argv[1]?.endsWith(...)`. |
| `npm --prefix real_dev/api test -- validate-deploy-readiness --runInBand` | `PASS` - 1 suite, 3 testes. |
| `npm --prefix real_dev/api test -- health.controller --runInBand` | `PASS` - 1 suite, 3 testes. |
| `npm --prefix real_dev/api run test:unit -- citation-policy source-grounded-ai --runInBand` | `PASS` - 3 suites, 10 testes; `npm` emitiu aviso sobre `--runInBand` como config desconhecida, mas o Jest executou as suites filtradas. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `STUDYFLOW_RELEASE_VERSION=2026.06.30 npm --prefix real_dev/api run deploy:check` | `PASS` - `ready: true`, `versao:definida`, `rollback:documento-encontrado`. |
| `npm --prefix real_dev/api run deploy:check` | `EXPECTED_FAIL` - bloqueou sem `STUDYFLOW_RELEASE_VERSION` com `Deploy bloqueado`. |
| `STUDYFLOW_RELEASE_VERSION=2026.06.30 STUDYFLOW_ROLLBACK_DOC_PATH=../docs/ops/ROLLBACK-INEXISTENTE.md npm --prefix real_dev/api run deploy:check` | `EXPECTED_FAIL` - bloqueou sem documento de rollback. |
| `PORT=3137 WEB_ORIGIN=http://127.0.0.1:4175 npm --prefix real_dev/api run start:e2e` | `FAIL_SANDBOX` - dentro da sandbox, `MongoMemoryServer` falhou com `listen EPERM: operation not permitted 0.0.0.0`. |
| `PORT=3137 WEB_ORIGIN=http://127.0.0.1:4175 npm --prefix real_dev/api run start:e2e` fora da sandbox | `PASS` - API arrancou, `HealthModule` inicializou e Nest mapeou `{/api/health, GET}`. |
| `curl -i http://127.0.0.1:3137/api/health` dentro da sandbox | `FAIL_SANDBOX` - o contexto sandbox nao conseguiu ligar ao servidor fora da sandbox. |
| `curl -i http://127.0.0.1:3137/api/health` fora da sandbox | `PASS` - `HTTP/1.1 200 OK`; JSON: `{"status":"ok","uptimeSeconds":53,"version":"dev","availability":{"downtimeMinutes":0,"limitMinutes":60,"status":"HEALTHY"}}`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 85 suites, 308 testes. |
| `npm --prefix real_dev/api test -- ai-context-policy ai-model-policies class-ai --runInBand` | `PASS` - 3 suites, 19 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - build NestJS concluido depois de integrar `assertAiContextProfile(...)`. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 86 suites, 319 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - Vite build completo, 122 modulos transformados. |
| `rg -n "[ \t]$" ...` nos ficheiros afetados | `PASS` - sem trailing whitespace. |
| `git diff --check` | `PASS`. |
| pesquisa estatica final incluindo este relatorio | `PASS_CLASSIFICADO` - ocorrencias sensiveis aparecem apenas em imports/config existentes, testes negativos ou texto de relatorio/evidence. |

## Blockers e TODOs

- `SEM_BLOCKERS_ATIVOS`: `BK-MF7-10` e `BK-MF7-11` ficaram implementados e validados com testes focados, build backend, suite unit completa e build frontend.
- `NOTA_AMBIENTE`: os comandos de servidor/curl precisaram de execucao fora da sandbox por causa de `listen EPERM` e isolamento de localhost.
- `NOTA_SCOPE`: o documento de rollback foi criado em `real_dev/docs/ops/DEPLOY-ROLLBACK.md`, nao em `docs/ops`, para respeitar `PERMITIR_ALTERAR_DOCS=nao`.
- `NOTA_WORKTREE`: existem alteracoes locais pre-existentes em `docs/planificacao` e MF8; esta execucao nao as alterou nem reverteu.

## Proxima acao recomendada

Executar `auditar_implementacao` cumulativo de `MF7` para confirmar a macrofase completa depois de `BK-MF7-10` e `BK-MF7-11`, com foco no handoff para `BK-MF8-01`.
