---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# AUDITORIA-IMPLEMENTACAO-real_dev-MF6

## Header

- `doc_id`: `AUDITORIA-IMPLEMENTACAO-real_dev-MF6`
- `project`: `StudyFlow`
- `macro`: `MF6`
- `implementation_root`: `real_dev`
- `modo`: `auditar_implementacao`
- `audit_report_source`: `auto`
- `audit_report_path`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `bk_ids_pedidos`: `[]`
- `bk_ids_auditados`: `BK-MF6-01`, `BK-MF6-02`, `BK-MF6-03`, `BK-MF6-04`, `BK-MF6-05`, `BK-MF6-06`, `BK-MF6-07`, `BK-MF6-08`, `BK-MF6-09`, `BK-MF6-10`, `BK-MF6-11`, `BK-MF6-12`
- `finding_ids`: `[]`
- `fix_severities`: `P0`, `P1`, `P2`, `P3`
- `incluir_p3`: `sim`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `permitir_alterar_docs`: `nao`, exceto este relatorio tecnico de auditoria
- `permitir_commits`: `nao`
- `status`: `PASS_COM_RISCOS`
- `created_at`: `2026-06-25`
- `updated_at`: `2026-06-25`

## Resultado geral

Resultado final da auditoria: `PASS_COM_RISCOS`.

A implementacao real em `real_dev/api` e `real_dev/web` cobre os 12 BKs da `MF6` com evidencias objetivas em codigo, testes unitarios, builds, smoke runtime e E2E autenticado. Nao foram encontrados findings ativos `P0`, `P1`, `P2` ou `P3` ligados a violacao de BK/RF/RNF.

O estado nao e `PASS` estrito porque uma validacao operacional depende de ambiente de deploy e nao ficou demonstrada neste checkout local:

- `BK-MF6-04`: o middleware HTTPS e os testes passam, mas `verify:tls` precisa de `API_PUBLIC_HOST` publico para provar TLS 1.2+ real.

O risco anterior de `BK-MF6-11` continua fechado nesta reauditagem: `backup:daily` correu com `dryRun:false` contra um MongoDB efemero e escreveu manifest seguro fora do checkout.

## Escopo auditado

| Item | Valor |
| --- | --- |
| MF alvo | `MF6` |
| BKs alvo | `BK-MF6-01` a `BK-MF6-12` |
| Requisitos auditados | `RNF11` a `RNF22` |
| Pasta auditada | `real_dev` |
| Backend/API | `real_dev/api` |
| Frontend/web | `real_dev/web` |
| Motivo da escolha | `IMPLEMENTATION_ROOT=real_dev` na prompt e existencia de `real_dev/api` + `real_dev/web` com package/config/src/testes reais. |
| Pastas ignoradas como implementacao real | `apps/` e `mockup/`, usadas apenas como referencia documental quando aplicavel. |

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
- todos os guias em `docs/planificacao/guias-bk/MF6/`
- `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- relatorios `IMPLEMENTACAO-*`, `AUDITORIA-IMPLEMENTACAO-*`, `CORRECAO-*` e `AUDITORIA-HIDRATACAO-*` relevantes para MF5/MF6

## Estado por BK

| BK | RNF | Estado | Justificacao |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF11` | `PASS` | Indexacao privada devolve job `QUEUED`, processa em background, persiste estado terminal e UI/E2E autenticado validam polling. |
| `BK-MF6-02` | `RNF12` | `PASS` | Quiz em background cria job persistido apos pre-validacao de fontes, polling autorizado e E2E cobre positivo e negativo sem fontes. |
| `BK-MF6-03` | `RNF13` | `PASS` | Runtime expõe instancia segura, usa Redis/MongoDB como stores e smoke local provou duas instancias distintas. |
| `BK-MF6-04` | `RNF14` | `PASS_COM_RISCOS` | Middleware bloqueia HTTP em producao e testes passam; falta evidence publica TLS 1.2+ por ausencia de `API_PUBLIC_HOST`. |
| `BK-MF6-05` | `RNF15` | `PASS` | `PasswordHashingService` centraliza bcrypt, `AuthService` nao importa bcrypt diretamente e testes cobrem hash e password errada. |
| `BK-MF6-06` | `RNF16` | `PASS` | Politica unica de cookie define `HttpOnly`, `SameSite=Lax`, `Secure` em producao e TTL alinhado com sessao; cliente usa `credentials: "include"`. |
| `BK-MF6-07` | `RNF17` | `PASS` | Headers defensivos, CSRF, `ValidationPipe` restritivo e brute-force por Redis continuam ativos e cobertos por unit tests. |
| `BK-MF6-08` | `RNF18` | `PASS` | `DocumentProcessingSafetyService` valida tipo/MIME/tamanho/timeout antes de parsers; URLs mantem bloqueios SSRF, redirects e conteudo nao textual. |
| `BK-MF6-09` | `RNF19` | `PASS` | `AiGuardrailsService` centraliza decisoes por contexto, usa services de dominio e persiste decisoes sem prompt/resposta privada. |
| `BK-MF6-10` | `RNF20` | `PASS` | `SourceGroundedAiService` autoriza cada `sourceJobId` com `findReadableDoneJob` antes do provider e DTO nao aceita permissoes vindas do cliente. |
| `BK-MF6-11` | `RNF21` | `PASS` | Script de backup, cron, manifest seguro, retencao, dry-run e execucao real local contra MongoDB efemero passam. |
| `BK-MF6-12` | `RNF22` | `PASS` | `retryWithRecovery` limita tentativas/delays e esta integrado apenas na leitura URL idempotente com negativos de erro permanente e URL privada. |

## Rastreabilidade BK -> contrato -> evidence

| BK | Contrato esperado | Estado | Evidence |
| --- | --- | --- | --- |
| `BK-MF6-01` | `POST` devolve job inicial e `GET` consulta estado autorizado. | `CUMPRE` | `material-index.controller.ts:35`, `material-index.controller.ts:71`, `material-index-queue.service.ts:51`, `material-index.service.ts:373`. |
| `BK-MF6-01` | UI chama endpoints reais com cookies HttpOnly e polling. | `CUMPRE` | `apiClient.ts:500`, `apiClient.ts:1647`, `apiClient.ts:1663`; `mf6-background-jobs.spec.ts:133`. |
| `BK-MF6-02` | Job de quiz so nasce depois de fontes processaveis e ownership. | `CUMPRE` | `study-tools.controller.ts:85`, `quiz-generation-jobs.service.ts:74`, `quiz-generation-jobs.service.ts:79`, `quiz-generation-jobs.service.ts:127`. |
| `BK-MF6-03` | Runtime tecnico sem dados privados e stores partilhados. | `CUMPRE` | `runtime.controller.ts:27`, `runtime-instance.service.ts:26`, `auth.module.ts:35`, `auth.module.ts:50`; smoke runtime passou com 2 instancias. |
| `BK-MF6-04` | HTTP inseguro e recusado em producao antes dos controllers. | `CUMPRE_COM_RISCO` | `main.ts:26`, `require-https.middleware.ts:20`; `verify:tls` bloqueado por falta de `API_PUBLIC_HOST`. |
| `BK-MF6-05` | Passwords usam hashing seguro e erro de login generico. | `CUMPRE` | `password-hashing.service.ts:20`, `password-hashing.service.ts:32`, `auth.service.ts:55`, `auth.service.ts:86`. |
| `BK-MF6-06` | Sessao usa cookie opaco HttpOnly/SameSite/Secure e cliente envia credenciais. | `CUMPRE` | `session-cookie.options.ts:12`, `auth.controller.ts:144`, `apiClient.ts:500`, `apiClient.ts:512`. |
| `BK-MF6-07` | CSRF, headers defensivos, validation whitelist e brute force no backend. | `CUMPRE` | `main.ts:27`, `main.ts:29`, `main.ts:30`, `security-headers.middleware.ts:14`, `csrf.middleware.ts:21`, `login-attempts.service.ts`. |
| `BK-MF6-08` | Ficheiros e URLs sao validados antes de parser/IA. | `CUMPRE` | `document-processing-safety.service.ts:47`, `document-processing-safety.service.ts:88`, `material-index.service.ts:594`, `material-index.service.ts:681`, `material-index.service.ts:778`. |
| `BK-MF6-09` | Guardrails de IA validam contexto no backend e nao guardam prompt. | `CUMPRE` | `ai-guardrails.controller.ts:13`, `ai-guardrails.service.ts:64`, `ai-guardrails.service.ts:109`. |
| `BK-MF6-10` | IA com fontes so recebe jobs autorizados e concluídos. | `CUMPRE` | `ask-source-grounded-ai.dto.ts:17`, `source-grounded-ai.controller.ts:30`, `source-grounded-ai.service.ts:80`, `source-grounded-ai.service.ts:184`. |
| `BK-MF6-11` | Backup diario tem script, cron, manifest seguro e retencao limitada. | `CUMPRE` | `package.json:16`, `backup-daily.cron:3`, `backup-database.ts:65`, `backup-database.ts:129`, `backup-database.ts:232`, `backup-database.ts:251`; `backup:daily` real local passou com `dryRun:false`. |
| `BK-MF6-12` | Recovery repete apenas falhas transitorias/idempotentes. | `CUMPRE` | `retry-with-recovery.ts:28`, `retry-with-recovery.ts:77`, `retry-with-recovery.ts:117`, `material-index.service.ts:687`. |

## Findings por severidade

| Severidade | Quantidade ativa |
| --- | ---: |
| `P0` | 0 |
| `P1` | 0 |
| `P2` | 0 |
| `P3` | 0 |

Nao ha findings ativos de implementacao. O unico risco restante e uma lacuna de evidence TLS em ambiente externo, listada em `Blockers e TODOs`, e nao bloqueia a MF6 local porque codigo, unit tests, builds, E2E autenticado, backup real local e smoke runtime passaram.

## Coerencia entre MFs

Resultado: `COERENTE_COM_RISCOS`.

### MF5 -> MF6

`MF5` entregou cliente central com `credentials: "include"`, feedback visual, responsividade, performance budget e smoke de 200 utilizadores. A `MF6` consome esse contrato sem o quebrar: os endpoints novos usam `SessionGuard`, `request.user`, cliente central `apiClient.ts` e fluxos reais de UI. O E2E MF6 confirma que login real, cookie HttpOnly, indexacao e quiz em background encaixam com o shell da MF5.

### MF6 interna

A sequencia `BK-MF6-01` a `BK-MF6-12` esta tecnicamente coerente: jobs persistidos suportam quiz/background, runtime evidencia escalabilidade horizontal, HTTPS/cookies/CSRF/headers protegem a superficie, sandbox documental alimenta guardrails/IA source-grounded, e backups/recovery ficam preparados para operacao.

### MF6 -> MF7

`BK-MF6-12` entrega eventos `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED` para `BK-MF7-01`. `MF7` ainda nao foi auditada como implementacao real nesta execucao, portanto a coerencia futura fica limitada a handoff documental e contratos exportados.

## Pesquisa estatica

Pesquisas executadas em `real_dev/api/src`, `real_dev/web/src`, manifests e configs relevantes:

```bash
rg -n "as any|payload: unknown|TODO|FIXME|PREENCHER|IMPLEMENTAR_DEPOIS|test\\.skip|describe\\.skip|it\\.skip|\\.only\\(" real_dev/api/src real_dev/web/src
rg -n "localStorage|sessionStorage|OPENAI_API_KEY|JWT_SECRET|secret-key|password\\s*=|token\\s*=|cookie\\s*=|prompt privado|resposta IA privada|RAG|embedding|embeddings|OCR|chunking semantico|chunking semântico|placeholder" real_dev/api/src real_dev/web/src real_dev/api/.env.example real_dev/api/package.json real_dev/web/package.json
```

Classificacao:

- Sem ocorrencias para `as any`, `payload: unknown`, TODO/FIXME perigosos, skips ou `.only`.
- `OPENAI_API_KEY` aparece em `.env.example`, provider e specs como contrato/configuracao, sem valor real.
- `secret-key` aparece apenas em spec de audit log.
- `localStorage` aparece em comentarios que explicam que a sessao nao deve ser guardada em storage.
- `RAG`/`embeddings` aparecem como comentarios de exclusao de scope ou selecao lexical simples sem prometer RAG.
- `placeholder` aparece em inputs de UI e nao representa mock/stub de implementacao.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_INFORMATIVO` - relatorios MF6 ja estavam untracked; `real_dev/` ignorado por regra do repositorio. |
| `git check-ignore -v real_dev ...` | `PASS_INFORMATIVO` - confirmou `.gitignore:2:real_dev/`; relatorios nao surgiram como ignorados. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 77 suites, 270 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit` e `vite build`, 121 modulos transformados. |
| `STUDYFLOW_BACKUP_DIR=/private/tmp/studyflow-mf6-audit-20260625 npm --prefix real_dev/api run backup:daily:dry-run` | `PASS` - JSON `ok:true`, `dryRun:true`, sem URI/documentos, `retentionDays:7`, output em `/private/tmp/studyflow-mf6-audit-20260625/daily-2026-06-25T19-24-08-098Z`. |
| `npm --prefix real_dev/api run backup:daily:dry-run` | `PASS_NEGATIVO` - falhou de forma esperada com `STUDYFLOW_BACKUP_DIR é obrigatória para executar backup diário.` |
| `backup:daily` com `MongoMemoryServer` efemero e `STUDYFLOW_BACKUP_DIR` temporario fora do checkout | `PASS` - JSON `ok:true`, `dryRun:false`, `collections:1`, `documents:1`, sem URI/documentos, `retentionDays:7`; manifest seguro escrito em `/var/folders/y2/1m9lsnyd6f78l_w3gg11cfhm0000gn/T/studyflow-mf6-real-backup-SW6Lc4/daily-2026-06-25T19-26-03-694Z/manifest.json`. |
| `npm --prefix real_dev/web run test:e2e -- mf6-background-jobs.spec.ts` | `BLOQUEADO_NO_SANDBOX` - `listen EPERM: operation not permitted 0.0.0.0` ao arrancar MongoMemoryServer. |
| `npm --prefix real_dev/web run test:e2e -- mf6-background-jobs.spec.ts` fora do sandbox | `PASS` - 1 teste Chromium passou; validou login real, cookie, indexacao e quiz em background. |
| `npm --prefix real_dev/api run smoke:runtime-instances:local` | `BLOQUEADO_NO_SANDBOX` - `listen EPERM: operation not permitted 0.0.0.0` ao arrancar MongoMemoryServer. |
| `npm --prefix real_dev/api run smoke:runtime-instances:local` fora do sandbox | `PASS` - 2 instancias distintas, `sessionStores:["redis"]`, `persistentStores:["mongodb"]`, `privateDataDetected:false`. |
| `npm --prefix real_dev/api run verify:tls` | `BLOQUEADO_POR_AMBIENTE` - falta `API_PUBLIC_HOST` publico para evidence TLS 1.2+. |

`bash scripts/validate-planificacao.sh` nao foi executado porque a prompt tem `PERMITIR_ALTERAR_DOCS=nao`, nao houve alteracao de docs canonicos/BKs, e a alteracao permitida foi apenas este relatorio tecnico.

## Ficheiros auditados

- `real_dev/api/package.json`
- `real_dev/api/ops/backup-daily.cron`
- `real_dev/api/src/app.module.ts`
- `real_dev/api/src/main.ts`
- `real_dev/api/src/common/middleware/require-https.middleware.ts`
- `real_dev/api/src/common/middleware/security-headers.middleware.ts`
- `real_dev/api/src/common/middleware/csrf.middleware.ts`
- `real_dev/api/src/common/reliability/retry-with-recovery.ts`
- `real_dev/api/src/common/runtime/runtime.controller.ts`
- `real_dev/api/src/common/runtime/runtime-instance.service.ts`
- `real_dev/api/src/modules/auth/auth.module.ts`
- `real_dev/api/src/modules/auth/auth.service.ts`
- `real_dev/api/src/modules/auth/password-hashing.service.ts`
- `real_dev/api/src/modules/auth/session-cookie.options.ts`
- `real_dev/api/src/modules/auth/session.service.ts`
- `real_dev/api/src/modules/material-index/document-processing-safety.service.ts`
- `real_dev/api/src/modules/material-index/material-index.controller.ts`
- `real_dev/api/src/modules/material-index/material-index-queue.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/ai/quiz-generation-jobs.service.ts`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/scripts/backup-database.ts`
- `real_dev/api/src/scripts/smoke-runtime-instances.mjs`
- `real_dev/api/src/scripts/verify-tls-evidence.mjs`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/tests/e2e/mf6-background-jobs.spec.ts`
- Documentacao e relatorios listados em `Documentos consultados`.

## Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

Codigo em `real_dev/`, BKs, backlogs e docs canonicos nao foram alterados nesta auditoria.

## Blockers e TODOs

- `TODO_OPERACIONAL`: executar `npm --prefix real_dev/api run verify:tls` com `API_PUBLIC_HOST` publico de staging/deploy para fechar evidence TLS 1.2+ real de `BK-MF6-04`.
- `NOTA_AMBIENTE`: os smokes que arrancam servidores falharam no sandbox com `listen EPERM`, mas passaram fora do sandbox.

## Proxima acao recomendada

Fornecer `API_PUBLIC_HOST` de staging/deploy e executar `npm --prefix real_dev/api run verify:tls`. Depois disso, a MF6 pode ser reclassificada de `PASS_COM_RISCOS` para `PASS`, mantendo o mesmo codigo auditado.
