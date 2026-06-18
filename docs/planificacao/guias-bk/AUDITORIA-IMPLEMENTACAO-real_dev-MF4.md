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
- Resultado: `FAIL`
- Estado do relatório: `AUDITADO_COM_FINDINGS`
- Correções aplicadas nesta execução: nenhuma; modo `auditar_implementacao`.
- Commits: nenhum.

A implementação MF4 existe em `real_dev/api` e `real_dev/web`, está registada no `AppModule`, compila e passa os testes unitários disponíveis. Contudo, a auditoria encontrou incumprimentos funcionais em BKs essenciais: alertas docentes notificam toda a turma em vez de apenas alunos inativos, auditoria transversal não cobre materiais nem chamadas IA runtime, políticas de modelos IA não são efetivamente aplicadas ao provider e a reserva de quotas IA não é atómica.

## Âmbito e fontes

### Pastas auditadas

- `real_dev/api`: implementação backend NestJS/TypeScript/Mongoose.
- `real_dev/web`: implementação frontend React/Vite/TypeScript.
- `real_dev/web/tests/e2e`: inventariada para verificar existência de smoke MF4.

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
- guias MF3/MF5 e relatórios MF3 relevantes para coerência de fronteira
- `docs/planificacao/guias-bk/PLANO-EXECUCAO-real_dev-MF4.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- código em `real_dev/api/src` e `real_dev/web/src`

### Alterações locais pré-existentes

`git status --short` indicou ficheiros não versionados já existentes antes deste relatório:

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- `docs/planificacao/guias-bk/PLANO-EXECUCAO-real_dev-MF4.md`

`real_dev/` estar fora do git ou ignorado não foi classificado como problema, conforme regra da prompt.

## Estado por BK

| BK | RF/RNF | Estado | Evidência principal | Risco ativo |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `PASS_COM_RISCOS` | `ContextNotificationsModule`, `POST/GET /api/context-notifications`, cálculo backend de destinatários e preferências. | Quota de notificação por utilizador tem fragilidade em `AUD-MF4-005`; sem spec dedicada. |
| `BK-MF4-02` | `RF50` | `FAIL` | `FollowUpAlertsService` cria regras e calcula inativos. | `AUD-MF4-001`: notificação final é enviada à turma inteira. |
| `BK-MF4-03` | `RF51` | `PASS_COM_RISCOS` | `NotificationPoliciesModule`, endpoints `GET/PUT /api/admin/notification-policies/:channel`. | `AUD-MF4-005` e `AUD-MF4-006`. |
| `BK-MF4-04` | `RF52` | `PASS_COM_RISCOS` | `PrivacyDataExportsService` cria/lista/download JSON próprio e exclui `passwordHash`. | Sem spec dedicada; build e análise estática passaram. |
| `BK-MF4-05` | `RF53` | `PASS_COM_RISCOS` | `AccountDeletionService` exige sessão, protege último admin, anonimiza conta e destrói sessão. | Sem spec dedicada para último admin/confirmacao forte. |
| `BK-MF4-06` | `RF54` | `PASS` | `AiConsentsService.assertGranted` e specs; integração nos services `PrivateAreaAi`, `StudyGroupAi`, `ClassAi` e `ProjectAi`. | Nenhum P0/P1 ativo no escopo do guia. |
| `BK-MF4-07` | `RF55` | `PASS_COM_RISCOS` | `AdminUsersService` lista utilizadores públicos, altera `User.role` real e protege último admin. | Sem spec dedicada. |
| `BK-MF4-08` | `RF56` | `FAIL` | `AuditLogModule` existe e redige metadados; roles/admin/privacidade/notificações registam eventos. | `AUD-MF4-002`: materiais e chamadas IA runtime não são auditados. |
| `BK-MF4-09` | `RF57` | `FAIL` | `AiModelPoliciesModule` existe e bloqueia finalidade desativada. | `AUD-MF4-003`: modelo/timeout/limites configurados não são aplicados ao provider. |
| `BK-MF4-10` | `RF58` | `FAIL` | `AiQuotasModule` expõe políticas e reserva consumo antes do provider. | `AUD-MF4-004`: reserva não é atómica; `AUD-MF4-006`: UI não permite configurar quotas. |

## Mapa de rastreabilidade

| BK | RF/RNF | Ficheiros backend principais | Ficheiros frontend principais | Testes/evidência |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `real_dev/api/src/modules/context-notifications/*` | `real_dev/web/src/features/mf4/follow-up-alerts-panel.tsx`, `mf4-client.ts` | Build API/web; sem spec dedicada. |
| `BK-MF4-02` | `RF50` | `real_dev/api/src/modules/follow-up-alerts/*` | `real_dev/web/src/features/mf4/follow-up-alerts-panel.tsx` | Build API/web; sem spec dedicada. |
| `BK-MF4-03` | `RF51` | `real_dev/api/src/modules/notification-policies/*` | `real_dev/web/src/features/mf4/admin-governance-panel.tsx`, `mf4-client.ts` | Build API/web; sem spec dedicada. |
| `BK-MF4-04` | `RF52` | `real_dev/api/src/modules/privacy-data-exports/*` | `real_dev/web/src/features/mf4/privacy-panel.tsx`, `mf4-client.ts` | Build API/web; sem spec dedicada. |
| `BK-MF4-05` | `RF53` | `real_dev/api/src/modules/account-deletion/*` | `real_dev/web/src/features/mf4/privacy-panel.tsx`, `mf4-client.ts` | Build API/web; sem spec dedicada. |
| `BK-MF4-06` | `RF54` | `real_dev/api/src/modules/ai-consents/*`, services IA integrados | `real_dev/web/src/features/mf4/privacy-panel.tsx` | `ai-consents.service.spec.ts`; specs dos 4 services IA principais. |
| `BK-MF4-07` | `RF55` | `real_dev/api/src/modules/admin-users/*` | `real_dev/web/src/features/mf4/admin-governance-panel.tsx` | Build API/web; sem spec dedicada. |
| `BK-MF4-08` | `RF56` | `real_dev/api/src/modules/audit-log/*`, integrações parciais | `real_dev/web/src/features/mf4/admin-governance-panel.tsx` | `audit-log.service.spec.ts`; integração incompleta. |
| `BK-MF4-09` | `RF57` | `real_dev/api/src/modules/ai-model-policies/*`, services IA integrados parcialmente | `real_dev/web/src/features/mf4/admin-governance-panel.tsx` | Specs confirmam chamada a `resolveForUse`, mas não aplicação da política. |
| `BK-MF4-10` | `RF58` | `real_dev/api/src/modules/ai-quotas/*`, services IA integrados | `real_dev/web/src/features/mf4/admin-governance-panel.tsx` | `ai-quotas.service.spec.ts`; falta teste de concorrência/atomicidade. |

## Contratos consumidos

- `SessionGuard`, `AuthenticatedRequest`, cookie `sf_sid` e `ValidationPipe` global de MF0.
- `User`, `UserRole` e sessão autenticada de MF0/MF1.
- `ClassesService.findOwnedClass` para turmas geridas por professor.
- `StudyGroupsService.ensureMember` e `StudyRoomsService` para grupos.
- `NotificationPreferencesService.isInAppEnabled` vindo de MF3.
- `StudyEvent` para cálculo de inatividade.
- `MaterialsService`, `OfficialMaterialsService` e services IA existentes como domínios sensíveis a auditar.
- `AI_PROVIDER` e services IA de MF2/MF3.

## Contratos entregues

- `AdminUsersModule` e endpoints `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`.
- `AuditLogModule` e endpoint `GET /api/admin/audit-events`.
- `PrivacyDataExportsModule` e endpoints `POST/GET /api/privacy/data-exports`, `GET /api/privacy/data-exports/:id/download`.
- `AccountDeletionModule` e endpoint `POST /api/privacy/account-deletion`.
- `AiConsentsModule` e endpoints `GET/PUT/DELETE /api/ai-consents`.
- `ContextNotificationsModule` e endpoints `POST/GET /api/context-notifications`.
- `FollowUpAlertsModule` e endpoints `GET/POST /api/follow-up-alerts`, `POST /api/follow-up-alerts/:id/run`.
- `NotificationPoliciesModule` e endpoints `GET/PUT /api/admin/notification-policies/:channel`.
- `AiModelPoliciesModule` e endpoints `GET/PUT /api/admin/ai-model-policies/:purpose`.
- `AiQuotasModule` e endpoints `GET/PUT /api/admin/ai-quotas`, `GET /api/admin/ai-usage`.
- Rotas web `/app/admin/governanca`, `/app/privacidade`, `/app/professor/acompanhamento`.

## Coerência entre MFs

- MFs implementadas consideradas por evidência real: `MF0`, `MF1`, `MF2`, `MF3`, `MF4`.
- Profundidade: `vizinhas`.
- Resultado `MF3 -> MF4`: `INCOERENTE`.
- Resultado `MF4 -> MF5`: `INCOERENTE`.
- Resultado global: `INCOERENTE`.

### MF3 -> MF4

MF4 consome corretamente vários contratos de MF3, como preferências in-app, grupos e alertas de estudo. A incoerência surge dentro da própria MF4 ao usar esses contratos: `FollowUpAlertsService` calcula alunos inativos, mas delega a criação da notificação para um fluxo que recalcula todos os destinatários da turma, anulando a elegibilidade calculada.

### MF4 -> MF5

MF5 recebe uma aplicação compilável e com navegação para governança/privacidade/acompanhamento. No entanto, a governança de IA e quotas entregue por MF4 não é suficientemente efetiva para servir como base operacional: as políticas de modelo não alteram chamadas reais ao provider e as quotas podem ser ultrapassadas em concorrência.

## Findings ativos

### P1 - Alertas de acompanhamento notificam alunos não inativos

- ID: `AUD-MF4-001`
- BK/RF/RNF: `BK-MF4-02`, `RF50`
- Ficheiro(s): `real_dev/api/src/modules/follow-up-alerts/follow-up-alerts.service.ts`, `real_dev/api/src/modules/context-notifications/context-notifications.service.ts`
- Linha(s): `follow-up-alerts.service.ts:74`, `follow-up-alerts.service.ts:87`, `context-notifications.service.ts:104`
- Evidência observada: `FollowUpAlertsService.run` calcula `inactiveStudentIds`, mas depois chama `ContextNotificationsService.create` apenas com `contextType: "CLASS"` e `contextId`; esse service volta a obter todos os `schoolClass.studentIds` como destinatários.
- Contrato violado: RF50 e guia BK-MF4-02 exigem preview/alunos elegíveis e notificação interna dirigida aos alunos inativos.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: alunos ativos podem receber alerta de inatividade, criando ruído pedagógico e perda de confiança no acompanhamento docente.
- Como reproduzir/verificar: criar turma com pelo menos dois alunos, gerar `StudyEvent` recente para apenas um deles, executar `POST /api/follow-up-alerts/:id/run` e observar `notification.recipientIds` com todos os alunos da turma, não só `inactiveStudentIds`.
- Correção recomendada: permitir criação de notificação contextual com destinatários calculados pelo fluxo de acompanhamento ou adicionar método interno em `ContextNotificationsService` que valide a turma mas receba uma lista já filtrada de alunos elegíveis.
- Fora de scope?: Nao

### P1 - Auditoria transversal não cobre materiais nem chamadas IA runtime

- ID: `AUD-MF4-002`
- BK/RF/RNF: `BK-MF4-08`, `RF56`, `RNF23`
- Ficheiro(s): `real_dev/api/src/modules/materials/materials.service.ts`, `real_dev/api/src/modules/official-materials/official-materials.service.ts`, `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts`, `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`, `real_dev/api/src/modules/project-ai/project-ai.service.ts`
- Linha(s): `materials.service.ts:181`, `materials.service.ts:221`, `official-materials.service.ts:58`, `private-area-ai.service.ts:105`, `class-ai.service.ts:102`, `study-group-ai.service.ts:156`, `project-ai.service.ts:85`
- Evidência observada: pesquisa por `AuditLogService|record(` nos módulos de materiais e services IA runtime não encontrou integração; os métodos de submissão de materiais e chamadas ao provider não registam eventos de auditoria.
- Contrato violado: BK-MF4-08 exige auditoria completa de materiais, IA e papéis, com actor, ação, recurso, resultado e metadados minimizados.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: a aplicação não consegue responder “quem fez o quê” para operações sensíveis de materiais e IA, deixando RF56 incompleto.
- Como reproduzir/verificar: executar `rg -n "AuditLogService|record\\(" real_dev/api/src/modules/materials real_dev/api/src/modules/official-materials real_dev/api/src/modules/private-area-ai real_dev/api/src/modules/class-ai real_dev/api/src/modules/study-group-ai real_dev/api/src/modules/project-ai`; o comando não devolve integrações.
- Correção recomendada: injetar `AuditLogService` em materiais privados/oficiais e nos services IA que chamam `AI_PROVIDER`, registando sucesso/falha/negação com metadata minimizada e sem prompts, respostas completas, cookies, hashes ou chaves.
- Fora de scope?: Nao

### P1 - Políticas de modelos IA não são aplicadas às chamadas reais

- ID: `AUD-MF4-003`
- BK/RF/RNF: `BK-MF4-09`, `RF57`
- Ficheiro(s): `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`, `real_dev/api/src/modules/private-area-ai/private-area-ai.service.ts`, `real_dev/api/src/modules/class-ai/class-ai.service.ts`, `real_dev/api/src/modules/study-group-ai/study-group-ai.service.ts`, `real_dev/api/src/modules/project-ai/project-ai.service.ts`, `real_dev/api/src/modules/ai/providers/ai-provider.ts`
- Linha(s): `ai-model-policies.service.ts:53`, `private-area-ai.service.ts:97`, `class-ai.service.ts:94`, `study-group-ai.service.ts:101`, `project-ai.service.ts:77`, `ai-provider.ts:190`, `ai-provider.ts:205`, `ai-provider.ts:251`
- Evidência observada: os services chamam `resolveForUse(...)`, mas ignoram o retorno; o provider continua a usar `process.env.OPENAI_MODEL` e `process.env.OPENAI_TIMEOUT_MS`, sem receber modelo/timeout/limites vindos da política.
- Contrato violado: BK-MF4-09 exige que o administrador configure modelo e limites de uso e que os services IA resolvam a política antes de chamar o provider.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: a UI/API administrativa sugere governança de modelos, mas apenas `enabled=false` tem efeito real; modelo, provider e timeout configurados não controlam o consumo IA.
- Como reproduzir/verificar: criar política para `PRIVATE_AREA_AI` com `model` diferente do `OPENAI_MODEL`; executar fluxo de IA privada e observar que `OpenAiProvider.createJsonResponse` usa sempre variáveis de ambiente.
- Correção recomendada: alterar o contrato do provider para aceitar opções efetivas (`model`, `timeoutMs`, limites de prompt/fontes), devolver a política de `resolveForUse` e aplicá-la nos services antes da chamada externa.
- Fora de scope?: Nao

### P1 - Reserva de quotas IA não é atómica

- ID: `AUD-MF4-004`
- BK/RF/RNF: `BK-MF4-10`, `RF58`
- Ficheiro(s): `real_dev/api/src/modules/ai-quotas/ai-quotas.service.ts`
- Linha(s): `ai-quotas.service.ts:84`, `ai-quotas.service.ts:88`, `ai-quotas.service.ts:92`, `ai-quotas.service.ts:98`
- Evidência observada: `reserveUsage` lê a política, lê o uso atual, valida em memória e só depois faz `$inc`; o filtro do `findOneAndUpdate` não inclui condição de limite restante.
- Contrato violado: BK-MF4-10 exige reserva atómica antes da chamada ao provider para evitar excesso em pedidos simultâneos.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: duas chamadas concorrentes podem ler o mesmo `usedUnits` e ambas incrementar, ultrapassando a quota mensal.
- Como reproduzir/verificar: com limite mensal `1`, disparar duas reservas concorrentes para o mesmo `{ scope, targetId, purpose, period }`; ambas podem passar a validação antes de qualquer uma escrever.
- Correção recomendada: usar atualização atómica com condição no próprio filtro (`usedUnits <= limit - units`), pipeline update, transação ou coleção auxiliar com chave única e retry controlado; adicionar teste de concorrência/limite.
- Fora de scope?: Nao

### P2 - Quota de notificações por utilizador é calculada como total agregado

- ID: `AUD-MF4-005`
- BK/RF/RNF: `BK-MF4-03`, `RF51`
- Ficheiro(s): `real_dev/api/src/modules/notification-policies/notification-policies.service.ts`
- Linha(s): `notification-policies.service.ts:93`, `notification-policies.service.ts:100`, `notification-policies.service.ts:106`
- Evidência observada: `perUserDay` usa um único `countDocuments` com `recipientIds: { $in: [...] }`, contando documentos que contenham qualquer destinatário da lista, não o consumo de cada destinatário individual.
- Contrato violado: RF51 e BK-MF4-03 especificam quota máxima por utilizador/dia.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: a política pode bloquear notificações legítimas quando vários destinatários diferentes receberam poucas notificações, ou não demonstrar corretamente qual utilizador excedeu a quota.
- Como reproduzir/verificar: configurar `maxPerUserPerDay=20`, enviar 20 notificações para 20 utilizadores distintos e tentar enviar nova notificação para qualquer um deles; o contador agregado já atinge 20.
- Correção recomendada: calcular a contagem por destinatário individual, por agregação MongoDB ou consultas por utilizador, e bloquear apenas se algum destinatário exceder o limite depois da nova notificação.
- Fora de scope?: Nao

### P2 - Painel admin MF4 não permite configurar políticas e quotas

- ID: `AUD-MF4-006`
- BK/RF/RNF: `BK-MF4-03`, `BK-MF4-09`, `BK-MF4-10`, `RF51`, `RF57`, `RF58`
- Ficheiro(s): `real_dev/web/src/features/mf4/mf4-client.ts`, `real_dev/web/src/features/mf4/admin-governance-panel.tsx`
- Linha(s): `mf4-client.ts:88`, `mf4-client.ts:95`, `mf4-client.ts:102`, `admin-governance-panel.tsx:29`, `admin-governance-panel.tsx:113`
- Evidência observada: o cliente/frontend lista políticas de notificações, modelos e quotas, mas não tem funções ou formulários para `PUT /api/admin/notification-policies/:channel`, `PUT /api/admin/ai-model-policies/:purpose` ou `PUT /api/admin/ai-quotas`; o painel mostra JSON em `<pre>`.
- Contrato violado: os BKs indicam criação de cliente e painel de administração para configurar canais, modelos e quotas.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: a app real não oferece workflow de configuração a administradores; a configuração só é possível por chamada manual à API.
- Como reproduzir/verificar: abrir `/app/admin/governanca` e confirmar que apenas roles têm controlo editável; limites/políticas são apresentados como JSON sem formulário de alteração.
- Correção recomendada: adicionar clientes `upsertNotificationPolicy`, `upsertAiModelPolicy`, `upsertAiQuotaPolicy` e formulários acessíveis com estados loading/error/success.
- Fora de scope?: Nao

### P2 - Cobertura automática MF4 é parcial

- ID: `AUD-MF4-007`
- BK/RF/RNF: `BK-MF4-01` a `BK-MF4-10`, `RNF28`
- Ficheiro(s): `real_dev/api/src/modules/*`
- Linha(s): N/A
- Evidência observada: existem specs MF4 apenas para `ai-consents`, `ai-quotas` e `audit-log`; não há specs dedicadas para `admin-users`, `account-deletion`, `privacy-data-exports`, `context-notifications`, `follow-up-alerts`, `notification-policies` ou `ai-model-policies`.
- Contrato violado: guias MF4 pedem testes de service para ownership, membership, último admin, minimização, quotas e negativos principais; RNF28 pede testes automatizados para módulos críticos.
- Origem entre MFs: `FALHA_DA_MF_ALVO`
- Impacto: regressões críticas como `AUD-MF4-001`, `AUD-MF4-003` e `AUD-MF4-004` não são apanhadas pela suite atual.
- Como reproduzir/verificar: `find real_dev/api/src/modules/{admin-users,audit-log,privacy-data-exports,account-deletion,ai-consents,context-notifications,follow-up-alerts,notification-policies,ai-model-policies,ai-quotas} -name '*.spec.ts'`.
- Correção recomendada: adicionar specs de service/HTTP focadas nos negativos principais de cada BK antes de considerar a MF4 pronta.
- Fora de scope?: Nao

## Pesquisa estática obrigatória

Pesquisa executada em `real_dev/api/src`, `real_dev/web/src`, `real_dev/api/.env` e `real_dev/api/.env.example` para:

- `localStorage`
- `sessionStorage`
- `as any`
- `payload: unknown`
- `TODO`
- `FIXME`
- `RAG`
- `embeddings`
- `OCR`
- `chunking`
- `OPENAI_API_KEY`
- `console.log`
- `promptPreview`
- `password`
- `token`
- `cookie`
- `secret`
- `apiKey`

Resultados relevantes:

- Não foram encontrados usos de `localStorage` ou `sessionStorage` para sessão/token.
- `OPENAI_API_KEY=` está vazio em `.env` e `.env.example`; não foi encontrado valor real.
- `apiKey` aparece no provider OpenAI e em teste de redacção de auditoria, sem segredo real.
- `password`, `cookie`, `token` e `secret` aparecem em auth, sessão, CSRF, DTOs e testes esperados.
- `RAG` e `embeddings` aparecem apenas em comentários que explicitam que essas capacidades não foram introduzidas nesta fase.
- Não foram encontrados `TODO`/`FIXME` em `real_dev/api/src` ou `real_dev/web/src`.

## Validações executadas

| Comando | Resultado | Observações |
| --- | --- | --- |
| `git status --short` | `PASS_COM_RISCOS` | Relatórios MF4 de plano/implementação já estavam não versionados. |
| `git diff --check` | `PASS` | Sem output. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 57 suites, 204 testes. |
| `npm run build` em `real_dev/api` | `PASS` | `nest build`. |
| `npm run build` em `real_dev/web` | `PASS` | `tsc --noEmit && vite build`; 111 módulos transformados. |
| E2E MF4 | `NAO_DISPONIVEL` | Existem smokes MF1-MF3, mas não há `mf4-smoke.spec.ts`. |
| `npm run test:contracts` / `test:integration` | `NAO_DISPONIVEL` | Scripts inexistentes no `package.json` da API. |

## Ficheiros alterados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`

## Blockers e TODOs

- `TODO (CORRECAO)`: corrigir findings P1 antes de considerar MF4 pronta.
- `TODO (COBERTURA)`: adicionar testes automáticos MF4 para módulos sem specs dedicadas.
- `TODO (E2E)`: criar smoke MF4 para `/app/admin/governanca`, `/app/privacidade` e `/app/professor/acompanhamento`.

## Próximos passos

1. Executar `corrigir_auditoria` para `AUD-MF4-001` a `AUD-MF4-004`.
2. Depois corrigir P2 pequenos: quota de notificações, UI admin de configuração e cobertura.
3. Reexecutar `npm run test:unit`, `npm run build` em API/web e criar smoke MF4 se o ambiente permitir.

## Conclusão

- Findings P0 ativos: `0`
- Findings P1 ativos: `4`
- Findings P2 ativos: `3`
- Findings P3 ativos: `0`
- Findings P3 incluídos na auditoria: `sim`
- Resultado final: `FAIL`
