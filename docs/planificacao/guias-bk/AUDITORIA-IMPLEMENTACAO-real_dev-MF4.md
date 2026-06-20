# AUDITORIA-IMPLEMENTACAO-real_dev-MF4

## Resultado geral

- Projeto: `StudyFlow`
- Raiz auditada: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF4`
- BKs abrangidos: `BK-MF4-01` a `BK-MF4-10`
- Modo executado: `auditar_implementacao`
- Data local: `2026-06-18`
- Resultado: `PASS_COM_RISCOS`
- Estado do relatório: `AUDITADO_OK`
- Correções aplicadas nesta execução: nenhuma; modo `auditar_implementacao`.
- Commits: nenhum, conforme `PERMITIR_COMMITS=nao`.

A implementação MF4 existe em `real_dev/api` e `real_dev/web`, está registada no `AppModule`, compila e passa a suite unitária disponível. A reauditoria confirmou que os findings P1/P2 registados na auditoria anterior foram corrigidos na implementação atual: alertas docentes usam destinatários filtrados, auditoria cobre materiais e chamadas IA runtime, políticas IA são aplicadas ao provider com modelo, timeout e limite global de prompt, quotas IA usam reserva condicionada, quotas de notificação são calculadas por destinatário, o painel admin permite configurar políticas/quotas e há specs dedicadas para os módulos críticos.

O risco `AUD-MF4-008` foi corrigido nesta execução: `maxPromptChars` passou a fazer parte do DTO/schema/UI de políticas IA e é aplicado antes da reserva de quota e da chamada ao provider nos fluxos IA principais.

## Âmbito e fontes

### Pastas auditadas

- `real_dev/api`: implementação backend NestJS/TypeScript/Mongoose.
- `real_dev/web`: implementação frontend React/Vite/TypeScript.

### Pastas ignoradas como implementação

- `apps/`: referência auxiliar validada dos alunos; não é a raiz desta execução.
- `mockup/`: referência visual/de fluxo; não cumpre BKs executáveis.

### Documentos e relatórios consultados

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
- todos os guias `docs/planificacao/guias-bk/MF4/*.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- código em `real_dev/api/src` e `real_dev/web/src`

### Alterações locais pré-existentes

`git status --short` indicou antes e depois da auditoria:

- `D docs/planificacao/guias-bk/MF4/.BK-MF4-06-gestao-de-consentimentos-para-ia.md.swp`

Este ficheiro swap não foi alterado nesta execução. `real_dev/` estar fora do git ou ignorado não foi classificado como problema, conforme regra da prompt.

## Estado por BK

| BK | RF/RNF | Estado | Evidência principal | Risco ativo |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `PASS` | `ContextNotificationsModule`, `POST/GET /api/context-notifications`, cálculo backend de destinatários, preferências in-app e quota antes de persistir. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-02` | `RF50` | `PASS` | `FollowUpAlertsService.run` calcula `inactiveStudentIds` e usa `createForRecipients`, que valida os destinatários contra a turma. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-03` | `RF51` | `PASS` | `NotificationPoliciesService` lista/upsert políticas, bloqueia canal desativado e calcula quota por destinatário com agregação. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-04` | `RF52` | `PASS` | `PrivacyDataExportsService` cria/lista/download JSON próprio e seleciona campos públicos sem `passwordHash`. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-05` | `RF53` | `PASS` | `DeleteAccountDto` exige frase forte; `AccountDeletionService` protege último admin, anonimiza conta, remove dados próprios e destrói sessão. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-06` | `RF54` | `PASS` | `AiConsentsService.assertGranted` e integração nos services `PrivateAreaAi`, `StudyGroupAi`, `ClassAi` e `ProjectAi`. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-07` | `RF55` | `PASS` | `AdminUsersService` lista utilizadores públicos, altera `User.role` real, protege último admin e audita alterações. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-08` | `RF56` | `PASS` | `AuditLogService` redige metadata; materiais privados/oficiais, papéis, privacidade, notificações e IA runtime registam eventos minimizados. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-09` | `RF57` | `PASS` | `AiModelPoliciesService.resolveForUse` bloqueia finalidade desativada e fornece `model`, `timeoutMs`, `maxSourceCount` e `maxPromptChars`; `assertPromptWithinLimit` bloqueia prompts acima do limite antes do provider. | Nenhum P0/P1/P2 ativo. |
| `BK-MF4-10` | `RF58` | `PASS` | `AiQuotasService.reserveUsage` reserva consumo antes do provider com filtro atómico de limite mensal; painel admin mostra quotas e uso. | Nenhum P0/P1/P2 ativo. |

## Mapa de rastreabilidade

| BK | RF/RNF | Ficheiros backend principais | Ficheiros frontend principais | Testes/evidência |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `real_dev/api/src/modules/context-notifications/*` | `real_dev/web/src/features/mf4/follow-up-alerts-panel.tsx`, `mf4-client.ts` | `context-notifications.service.spec.ts`; build API/web. |
| `BK-MF4-02` | `RF50` | `real_dev/api/src/modules/follow-up-alerts/*` | `real_dev/web/src/features/mf4/follow-up-alerts-panel.tsx` | `follow-up-alerts.service.spec.ts`; build API/web. |
| `BK-MF4-03` | `RF51` | `real_dev/api/src/modules/notification-policies/*` | `admin-governance-panel.tsx`, `mf4-client.ts` | `notification-policies.service.spec.ts`; build API/web. |
| `BK-MF4-04` | `RF52` | `real_dev/api/src/modules/privacy-data-exports/*` | `privacy-panel.tsx`, `mf4-client.ts` | `privacy-data-exports.service.spec.ts`; build API/web. |
| `BK-MF4-05` | `RF53` | `real_dev/api/src/modules/account-deletion/*` | `privacy-panel.tsx`, `mf4-client.ts` | `account-deletion.service.spec.ts`; build API/web. |
| `BK-MF4-06` | `RF54` | `real_dev/api/src/modules/ai-consents/*`, services IA integrados | `privacy-panel.tsx` | `ai-consents.service.spec.ts`; specs dos services IA principais. |
| `BK-MF4-07` | `RF55` | `real_dev/api/src/modules/admin-users/*` | `admin-governance-panel.tsx` | `admin-users.service.spec.ts`; build API/web. |
| `BK-MF4-08` | `RF56` | `real_dev/api/src/modules/audit-log/*`, integrações em materiais/IA/papéis | `admin-governance-panel.tsx` | `audit-log.service.spec.ts`; specs de materiais/IA. |
| `BK-MF4-09` | `RF57` | `real_dev/api/src/modules/ai-model-policies/*`, services IA integrados | `admin-governance-panel.tsx` | `ai-model-policies.service.spec.ts`; specs dos services IA principais. |
| `BK-MF4-10` | `RF58` | `real_dev/api/src/modules/ai-quotas/*`, services IA integrados | `admin-governance-panel.tsx` | `ai-quotas.service.spec.ts`; build API/web. |

## Contratos consumidos

- `SessionGuard`, `AuthenticatedRequest`, cookie `sf_sid` e `ValidationPipe` global de MF0.
- `User`, `UserRole` e sessão autenticada de MF0/MF1.
- `ClassesService.findOwnedClass` para turmas geridas por professor.
- `StudyGroupsService.ensureMember` e `RoomSharesService` para grupos.
- `NotificationPreferencesService.isInAppEnabled` vindo de MF3.
- `StudyEvent` para cálculo de inatividade.
- `MaterialsService`, `OfficialMaterialsService` e services IA existentes.
- `AI_PROVIDER` com contrato isolado para modelo e timeout.

## Contratos entregues

- `AdminUsersModule` e endpoints `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`.
- `AuditLogModule` e endpoint `GET /api/admin/audit-events`.
- `PrivacyDataExportsModule` e endpoints `POST/GET /api/privacy/data-exports`, `GET /api/privacy/data-exports/:id/download`.
- `AccountDeletionModule` e endpoint `POST /api/privacy/account-deletion`.
- `AiConsentsModule` e endpoints `GET/PUT/DELETE /api/ai-consents/:purpose`.
- `ContextNotificationsModule` e endpoints `POST/GET /api/context-notifications`.
- `FollowUpAlertsModule` e endpoints `GET/POST /api/follow-up-alerts`, `POST /api/follow-up-alerts/:id/run`.
- `NotificationPoliciesModule` e endpoints `GET/PUT /api/admin/notification-policies/:channel`.
- `AiModelPoliciesModule` e endpoints `GET/PUT /api/admin/ai-model-policies/:purpose`.
- `AiQuotasModule` e endpoints `GET/PUT /api/admin/ai-quotas`, `GET /api/admin/ai-usage`.
- Rotas web `/app/admin/governanca`, `/app/privacidade`, `/app/professor/acompanhamento`.

## Coerência entre MFs

- MFs implementadas consideradas por evidência real: `MF0`, `MF1`, `MF2`, `MF3`, `MF4`.
- Profundidade: `vizinhas`.
- Resultado `MF3 -> MF4`: `COERENTE_COM_RISCOS`.
- Resultado `MF4 -> MF5`: `COERENTE_COM_RISCOS`.
- Resultado global: `COERENTE_COM_RISCOS`.

### MF3 -> MF4

MF4 consome contratos MF3 sem duplicar módulos equivalentes: preferências de notificação, grupos, sessões, fontes partilhadas e eventos de estudo são usados pelos services MF4. O risco residual não é uma quebra entre MF3 e MF4; é operacional: falta smoke/E2E MF4 dedicado para validar os fluxos completos no browser.

### MF4 -> MF5

MF4 entrega governança, privacidade, auditoria, consentimentos, políticas e quotas suficientes para MF5 continuar sem contornar contratos centrais. A governança de IA passa a entregar modelo, timeout, limite de fontes, limite global de prompt e reserva de quota antes do provider.

## Findings ativos

Nenhum finding ativo.

## Findings reavaliados e já não ativos

| Finding anterior | Estado atual | Evidência atual |
| --- | --- | --- |
| `AUD-MF4-001` alertas notificavam toda a turma | `JA_CORRIGIDO` | `FollowUpAlertsService.run` passa `inactiveStudentIds` para `ContextNotificationsService.createForRecipients`; spec dedicada passa. |
| `AUD-MF4-002` auditoria não cobria materiais/IA | `JA_CORRIGIDO` | `AuditLogService.record` está integrado em materiais privados/oficiais e nos services IA runtime; specs passam. |
| `AUD-MF4-003` políticas IA não eram aplicadas | `JA_CORRIGIDO` | services IA passam `model` e `timeoutMs` ao provider, e `resolveForUse` bloqueia finalidade desativada. |
| `AUD-MF4-004` reserva de quotas não era atómica | `JA_CORRIGIDO` | `AiQuotasService.reserveUsage` usa `findOneAndUpdate` com `usedUnits: { $lte: limit - input.units }`. |
| `AUD-MF4-005` quota de notificações era agregada | `JA_CORRIGIDO` | `NotificationPoliciesService.assertWithinQuota` agrega por `recipientIds` e bloqueia destinatário acima do limite. |
| `AUD-MF4-006` painel admin só mostrava JSON | `JA_CORRIGIDO` | `AdminGovernancePanel` tem formulários para canais, modelos IA e quotas. |
| `AUD-MF4-007` cobertura MF4 parcial | `JA_CORRIGIDO` | existem specs dedicadas para módulos MF4 críticos; `npm run test:unit` passou com 64 suites e 223 testes. |
| `AUD-MF4-008` política IA não limitava tamanho global do prompt | `CORRIGIDO` | `maxPromptChars` foi adicionado ao contrato de política IA, exposto na UI e aplicado por `assertPromptWithinLimit` antes da reserva de quota/provider; spec dedicada passa. |

## Findings por severidade

| Severidade | Ativos |
| --- | ---: |
| `P0` | 0 |
| `P1` | 0 |
| `P2` | 0 |
| `P3` | 0 |

## Pesquisa estática obrigatória

Pesquisa executada em `real_dev/api/src`, `real_dev/web/src`, `real_dev/api/.env` e `real_dev/api/.env.example` para:

- `localStorage`
- `sessionStorage`
- `as any`
- `payload: unknown`
- `TODO`
- `FIXME`
- `OPENAI_API_KEY`
- `console.log`
- `promptPreview`
- `password`
- `token`
- `cookie`
- `secret`
- `apiKey`
- `RAG`
- `embeddings`
- `OCR`
- `chunking`

Resultados relevantes:

- Não foram encontrados usos de `localStorage` ou `sessionStorage` para sessão/token; as ocorrências são comentários que negam esse uso.
- `OPENAI_API_KEY` aparece em testes do provider com valores de teste e como variável de ambiente, sem segredo real observado.
- `console.log` aparece no script de seed de utilizadores de desenvolvimento.
- As ocorrências de `password`, `token`, `cookie`, `secret`, `prompt` e `answer` correspondem a autenticação, cookies HttpOnly/CSRF, testes de redacção ou domínios IA em que prompts/respostas são tratados e auditados com metadata minimizada.
- Comentários sobre `RAG`, `embeddings`, `OCR` e `chunking` mantêm a decisão existente de não prometer essas capacidades nesta MF.

## Comandos executados

| Comando | Diretoria | Resultado | Observações |
| --- | --- | --- | --- |
| `git status --short` | repo | `PASS` | Apenas swap MF4 pré-existente aparece como removido. |
| `npm run test:unit -- ai-model-policies private-area-ai class-ai study-group-ai project-ai` | `real_dev/api` | `PASS` | 5 suites, 17 testes focados. |
| `npm run test:unit` | `real_dev/api` | `PASS` | 64 suites, 223 testes. |
| `npm run build` | `real_dev/api` | `PASS` | `nest build` concluiu. |
| `npm run build` | `real_dev/web` | `PASS` | `tsc --noEmit && vite build` concluiu; 111 módulos transformados. |
| `git diff --check` | repo | `PASS` | Sem erros de whitespace depois da atualização deste relatório. |

## Bloqueadores e TODOs

- `FOLLOW-UP`: criar smoke/E2E MF4 dedicado para validar no browser governança, privacidade, consentimentos e acompanhamento docente com dados realistas.
- `BLOQUEADO`: nenhum blocker técnico impediu a auditoria.

## Conclusão

Estado final da auditoria: `PASS_COM_RISCOS`.

A MF4 está implementada, compilável e validada por testes unitários e builds. Não existem findings P0/P1/P2/P3 ativos. Mantém-se apenas o follow-up operacional de criar smoke/E2E MF4 dedicado.
