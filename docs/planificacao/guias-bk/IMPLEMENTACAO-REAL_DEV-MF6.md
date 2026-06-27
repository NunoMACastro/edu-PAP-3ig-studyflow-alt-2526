# IMPLEMENTACAO-REAL_DEV-MF6

## Resultado geral

- Projeto: StudyFlow
- Modo executado: `implementar`
- Implementation root: `real_dev`
- MF alvo: `MF6`
- BKs abrangidos: `BK-MF6-01`, `BK-MF6-02`, `BK-MF6-03`, `BK-MF6-04`, `BK-MF6-05`, `BK-MF6-06`, `BK-MF6-07`, `BK-MF6-08`, `BK-MF6-09`, `BK-MF6-10`, `BK-MF6-11`, `BK-MF6-12`
- Estado geral: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`
- Data: `2026-06-25`

## Escopo implementado

### BK-MF6-01 - RNF11

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs` devolve job `QUEUED` antes da extracao pesada.
- `GET /api/material-index-jobs/:jobId` permite polling autorizado.
- `MaterialIndexQueueService` separa resposta HTTP e processamento em background.
- A UI de materiais privados faz polling e mostra estados de fila/processamento/falha/sucesso.

### BK-MF6-02 - RNF12

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- `QuizGenerationJob` persiste estados `QUEUED`, `PROCESSING`, `DONE` e `FAILED`.
- `POST /api/study-areas/:id/study-tools/quiz-jobs` cria jobs de quiz apos ownership e fontes processaveis.
- `GET /api/study-areas/:id/study-tools/quiz-jobs/:jobId` permite polling autorizado.
- `StudyToolsPage` usa jobs em background para quizzes e preserva explicacoes/flashcards no fluxo existente.

### BK-MF6-03 - RNF13

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `RuntimeModule` com `GET /api/runtime/instance`.
- `RuntimeInstanceService` devolve `instanceId`, `sessionStore: redis` e `persistentStore: mongodb` sem expor userId, email, cookie ou dados privados.
- O endpoint prepara evidence de balanceamento horizontal sem criar estado local como fonte de verdade.

### BK-MF6-04 - RNF14

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `RequireHttpsMiddleware`.
- O bootstrap recusa trafego sem `x-forwarded-proto: https` em producao e permite HTTP em desenvolvimento local.
- O bloqueio acontece antes de controllers, pipes e regras de dominio.

### BK-MF6-05 - RNF15

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `PasswordHashingService`.
- `AuthService` deixou de chamar `bcrypt` diretamente e delega hash/comparacao no service.
- `AuthModule` regista e exporta o provider.
- Testes validam hash bcrypt, password errada e que validacoes rejeitam inputs antes de hashing.

### BK-MF6-06 - RNF16

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `session-cookie.options.ts`.
- `AuthController` usa politica unica para criar e limpar cookie `sf_sid`.
- Flags mantidas: `HttpOnly`, `SameSite=Lax`, `Secure` em producao, `path=/` e TTL alinhado com `SessionService`.

### BK-MF6-07 - RNF17

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `securityHeadersMiddleware`.
- `main.ts` aplica headers defensivos antes de CSRF/controllers.
- CSRF, `ValidationPipe` com `whitelist/forbidNonWhitelisted` e `LoginAttemptsService` permanecem ativos.
- Testes cobrem headers de seguranca, CSRF existente e brute force existente.

### BK-MF6-08 - RNF18

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `DocumentProcessingSafetyService`.
- `MaterialIndexService` valida MIME, tamanho real e tamanho declarado antes de chamar parsers PDF/DOCX.
- Parsers correm com timeout controlado.
- URLs continuam protegidas por protocolo, host publico, DNS fixado, redirects, timeout e limite de bytes.

### BK-MF6-09 - RNF19

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- `AiGuardrailsService` foi revalidado como fronteira unica de guardrails.
- Testes adicionais cobrem `CLASS_SUBJECT`, utilizador nao aluno e ausencia de prompt persistido.
- `POST /api/ai/guardrails/check` continua protegido por `SessionGuard`.

### BK-MF6-10 - RNF20

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- `AskSourceGroundedAiDto` ficou limitado a 8 fontes e pergunta de 800 caracteres.
- `SourceGroundedAiService` valida cada `sourceJobId` via `findReadableDoneJob(actor, jobId)` antes do provider.
- Teste negativo confirma que fonte proibida bloqueia antes de prompt, provider ou persistencia.

### BK-MF6-11 - RNF21

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `src/scripts/backup-database.ts`.
- Adicionados scripts `backup:daily` e `backup:daily:dry-run`.
- Criado contrato cron `ops/backup-daily.cron`.
- O script exporta colecoes para `.jsonl.gz`, escreve manifest sem URI/documentos e aplica retencao.
- Dry-run validado sem abrir MongoDB.

### BK-MF6-12 - RNF22

Estado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`

- Criado `retryWithRecovery`.
- `MaterialIndexService.fetchTextFromUrl` usa retry apenas na leitura externa idempotente.
- URL privada, DNS privado, redirects inseguros, HTTP permanente e conteudo nao textual continuam a falhar sem retry.
- Eventos `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED` ficam prontos para MF7.

## Rastreabilidade

| BK | RF/RNF | Ficheiros principais | Testes |
| --- | --- | --- | --- |
| `BK-MF6-01` | `RNF11` | `real_dev/api/src/modules/material-index/material-index.service.ts`, `real_dev/api/src/modules/material-index/material-index-queue.service.ts`, `real_dev/api/src/modules/material-index/material-index.controller.ts`, `real_dev/web/src/components/materials/MaterialList.tsx`, `real_dev/web/src/lib/apiClient.ts` | `real_dev/api/src/modules/material-index/material-index-queue.service.spec.ts` |
| `BK-MF6-02` | `RNF12` | `real_dev/api/src/modules/ai/quiz-generation-jobs.service.ts`, `real_dev/api/src/modules/ai/schemas/quiz-generation-job.schema.ts`, `real_dev/api/src/modules/ai/study-tools.controller.ts`, `real_dev/web/src/pages/student/StudyToolsPage.tsx` | `real_dev/api/src/modules/ai/quiz-generation-jobs.service.spec.ts` |
| `BK-MF6-03` | `RNF13` | `real_dev/api/src/common/runtime/runtime-instance.service.ts`, `real_dev/api/src/common/runtime/runtime.controller.ts`, `real_dev/api/src/common/runtime/runtime.module.ts`, `real_dev/api/src/app.module.ts` | `real_dev/api/src/common/runtime/runtime-instance.service.spec.ts` |
| `BK-MF6-04` | `RNF14` | `real_dev/api/src/common/middleware/require-https.middleware.ts`, `real_dev/api/src/main.ts` | `real_dev/api/src/common/middleware/require-https.middleware.spec.ts` |
| `BK-MF6-05` | `RNF15` | `real_dev/api/src/modules/auth/password-hashing.service.ts`, `real_dev/api/src/modules/auth/auth.service.ts`, `real_dev/api/src/modules/auth/auth.module.ts` | `real_dev/api/src/modules/auth/password-hashing.service.spec.ts`, `real_dev/api/src/modules/auth/auth.service.spec.ts` |
| `BK-MF6-06` | `RNF16` | `real_dev/api/src/modules/auth/session-cookie.options.ts`, `real_dev/api/src/modules/auth/auth.controller.ts`, `real_dev/web/src/lib/apiClient.ts` | `real_dev/api/src/modules/auth/session-cookie.options.spec.ts` |
| `BK-MF6-07` | `RNF17` | `real_dev/api/src/common/middleware/security-headers.middleware.ts`, `real_dev/api/src/main.ts`, `real_dev/api/src/common/middleware/csrf.middleware.ts`, `real_dev/api/src/modules/auth/login-attempts.service.ts` | `real_dev/api/src/common/middleware/security-headers.middleware.spec.ts`, `real_dev/api/src/common/middleware/csrf.middleware.spec.ts`, `real_dev/api/src/modules/auth/login-attempts.service.spec.ts` |
| `BK-MF6-08` | `RNF18` | `real_dev/api/src/modules/material-index/document-processing-safety.service.ts`, `real_dev/api/src/modules/material-index/material-index.service.ts`, `real_dev/api/src/modules/material-index/material-index.module.ts` | `real_dev/api/src/modules/material-index/document-processing-safety.service.spec.ts`, `real_dev/api/src/modules/material-index/material-index.service.spec.ts` |
| `BK-MF6-09` | `RNF19` | `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts` | `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts` |
| `BK-MF6-10` | `RNF20` | `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`, `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `real_dev/api/src/modules/material-index/material-index.service.ts` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts` |
| `BK-MF6-11` | `RNF21` | `real_dev/api/src/scripts/backup-database.ts`, `real_dev/api/package.json`, `real_dev/api/ops/backup-daily.cron` | `real_dev/api/src/scripts/backup-database.spec.ts`, `backup:daily:dry-run` |
| `BK-MF6-12` | `RNF22` | `real_dev/api/src/common/reliability/retry-with-recovery.ts`, `real_dev/api/src/modules/material-index/material-index.service.ts` | `real_dev/api/src/common/reliability/retry-with-recovery.spec.ts`, `real_dev/api/src/modules/material-index/material-index.service.spec.ts` |

## Contratos consumidos

- MF5 entregou `apiClient.ts` com `credentials: "include"`, feedback visual, responsividade e smoke de concorrencia.
- MF0-MF5 ja forneciam `SessionGuard`, `AuthenticatedRequest`, `SessionService`, `LoginAttemptsService`, `MaterialsService`, `StudyAreasService`, `SubjectsService`, `AiGuardrailsService`, `SourceGroundedAiService` e `MaterialIndexService`.
- `userId` continua vindo de `request.user!.id` no backend, nunca do body/query.
- Jobs de indexacao e quiz continuam persistidos em MongoDB, nao em `Map` local.

## Contratos entregues

- Diagnostico seguro de instancia para validar comportamento horizontal.
- Middleware HTTPS em producao e headers defensivos transversais.
- Service unico para hashing bcrypt de passwords.
- Politica unica de cookie de sessao.
- Sandbox aplicacional para PDF/DOCX antes dos parsers.
- Retry controlado para leituras URL idempotentes.
- Backup diario compilavel, testavel e agendavel.
- Guardrails e IA com fontes obrigatorias cobertos por negativos de contexto/fonte proibida.
- Handoff para `BK-MF7-01`: eventos de recovery e comandos operacionais prontos para logs estruturados.

## Coerencia entre MFs

- `MF5 -> MF6`: `COERENTE_COM_RISCOS`. A MF6 consome cliente central, cookies, UX/performance e smoke de concorrencia da MF5. Risco residual: sem smoke HTTP autenticado end-to-end neste turno.
- `Dentro da MF6`: `COERENTE_COM_RISCOS`. A sequencia jobs -> escala -> canal seguro -> credenciais/sessoes -> headers/CSRF -> sandbox -> guardrails -> privacidade IA -> backup -> recovery esta implementada e validada por unit/build.
- `MF6 -> MF7`: `COERENTE_COM_RISCOS`. `BK-MF6-12` entrega eventos tecnicos para logs estruturados, mas MF7 ainda deve revalidar observabilidade propria.

## Findings por severidade

- `P0`: nenhum finding novo.
- `P1`: nenhum finding novo.
- `P2`: nenhum finding novo.
- `P3`: nenhum finding novo.

## Drift e follow-up

- `DRIFT_DOCUMENTAL`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` lista `BK-MF6-07` com owner diferente da matriz/backlog/guia. Nao foi alterado porque `PERMITIR_ALTERAR_DOCS=nao` e nao bloqueia a implementacao real.
- `FOLLOW-UP`: executar smoke HTTP autenticado com API/web ligados e cookie de aluno de desenvolvimento.
- `FOLLOW-UP`: revalidar MF7 quando entrar em escopo para consumir eventos de recovery e comandos operacionais em logs estruturados.

## Ficheiros alterados/criados

- `real_dev/api/package.json`
- `real_dev/api/ops/backup-daily.cron`
- `real_dev/api/src/app.module.ts`
- `real_dev/api/src/main.ts`
- `real_dev/api/src/common/middleware/require-https.middleware.ts`
- `real_dev/api/src/common/middleware/require-https.middleware.spec.ts`
- `real_dev/api/src/common/middleware/security-headers.middleware.ts`
- `real_dev/api/src/common/middleware/security-headers.middleware.spec.ts`
- `real_dev/api/src/common/reliability/retry-with-recovery.ts`
- `real_dev/api/src/common/reliability/retry-with-recovery.spec.ts`
- `real_dev/api/src/common/runtime/runtime-instance.service.ts`
- `real_dev/api/src/common/runtime/runtime-instance.service.spec.ts`
- `real_dev/api/src/common/runtime/runtime.controller.ts`
- `real_dev/api/src/common/runtime/runtime.module.ts`
- `real_dev/api/src/modules/auth/auth.controller.ts`
- `real_dev/api/src/modules/auth/auth.module.ts`
- `real_dev/api/src/modules/auth/auth.service.ts`
- `real_dev/api/src/modules/auth/auth.service.spec.ts`
- `real_dev/api/src/modules/auth/password-hashing.service.ts`
- `real_dev/api/src/modules/auth/password-hashing.service.spec.ts`
- `real_dev/api/src/modules/auth/session-cookie.options.ts`
- `real_dev/api/src/modules/auth/session-cookie.options.spec.ts`
- `real_dev/api/src/modules/material-index/document-processing-safety.service.ts`
- `real_dev/api/src/modules/material-index/document-processing-safety.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.module.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.spec.ts`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/scripts/backup-database.ts`
- `real_dev/api/src/scripts/backup-database.spec.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF6.md`

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:unit` | PASS - 76 suites, 259 testes |
| `npm --prefix real_dev/api run build` | PASS |
| `npm --prefix real_dev/web run build` | PASS - Vite build completo |
| `STUDYFLOW_BACKUP_DIR=/private/tmp/studyflow-backup-dry-run npm --prefix real_dev/api run backup:daily:dry-run` | PASS - JSON `ok:true`, `dryRun:true`, sem URI/documentos |
| `rg -n "localStorage|sessionStorage|as any|payload: unknown|TODO|FIXME|password|secret|token|cookie|prompt privado|resposta IA privada|RAG|embedding|OCR|chunking semantico|chunking semântico|mock|stub|fake|placeholder" ...` | PASS com falsos positivos esperados em testes, comentarios de seguranca, campos de auth e contratos existentes |
| Pesquisa focada de storage para token/session/secret/cookie | PASS - ocorrencias apenas em comentarios que dizem para nao usar storage |
| Pesquisa focada de segredos hardcoded | PASS - apenas `OPENAI_API_KEY="test-key"` em testes do provider |
| Pesquisa focada de `as any`, `payload: unknown`, `TODO`, `FIXME` fora de specs | PASS - sem ocorrencias |
| Pesquisa de trailing whitespace em ficheiros TS/TSX/MJS/JSON/cron | PASS - sem ocorrencias |
| `git diff --check` | PASS; nota: `real_dev/` esta ignorado e este comando nao cobre ficheiros ignorados |
| `git check-ignore -v real_dev ...` | Confirmou `.gitignore:2:real_dev/` |

## Blockers e TODOs

- `real_dev/` esta ignorado por `.gitignore`, por isso `git status` e `git diff --check` nao mostram estas alteracoes.
- Smoke HTTP autenticado nao foi executado por falta de servidor local/cookie de teste nesta execucao.

## Proxima acao recomendada

Executar uma validacao runtime com API e web ligados, usando um aluno de desenvolvimento com material processavel, para confirmar:

1. runtime instance devolve metadados seguros;
2. indexacao privada devolve `QUEUED` rapidamente e polling chega a `DONE` ou `FAILED` controlado;
3. quiz em background bloqueia sem fontes e conclui com fontes processaveis;
4. headers/CSRF/cookie aparecem no fluxo real;
5. backup dry-run fica agendavel no ambiente de deploy.
