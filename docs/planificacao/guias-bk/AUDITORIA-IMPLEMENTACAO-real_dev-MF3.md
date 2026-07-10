---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# AUDITORIA-IMPLEMENTACAO-real_dev-MF3

## Resultado geral

- Projeto: `StudyFlow`
- Raiz auditada: `real_dev`
- Backend/API: `real_dev/api`
- Frontend/web: `real_dev/web`
- MF alvo: `MF3`
- BKs abrangidos: `BK-MF3-01` a `BK-MF3-12`
- Modo executado: `auditar_implementacao`
- Data: `2026-06-16`
- Resultado: `PASS`
- Estado do relatório: `AUDITADO_OK`
- Correções aplicadas nesta execução: nenhuma; modo `auditar_implementacao`.
- Commits: nenhum.

A implementação MF3 está presente em `real_dev/api` e `real_dev/web`, está integrada no `AppModule`, usa sessão por cookie via `SessionGuard`, valida ownership/membership no backend quando aplicável, compila e passa as validações executadas. A reauditoria não encontrou findings ativos P0, P1, P2 ou P3.

Os dois findings que estavam ativos no relatório anterior foram reavaliados contra o código atual e já não se reproduzem:

- `AUD-MF3-008`: os BKs de IA MF3 já injetam `AI_PROVIDER`, chamam `generateStudyTool` e mapeiam falhas do provider para `ServiceUnavailableException`.
- `AUD-MF3-009`: os payloads reais agora usam `sourceJobIds`, `text` e `sourceShareIds`, alinhados com os guias MF3 e com os clientes frontend.

## Âmbito e fontes

### Pastas auditadas

- `real_dev/api`: implementação backend NestJS/TypeScript.
- `real_dev/web`: implementação frontend React/Vite/TypeScript.
- `real_dev/web/tests/e2e`: smoke E2E disponível para MF3.

### Pastas ignoradas como implementação

- `apps/`: tratada apenas como referência validada do trabalho dos alunos.
- `mockup/`: tratada apenas como referência visual/de fluxo.

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
- `docs/planificacao/guias-bk/MF3/*.md`
- BKs anteriores MF0, MF1 e MF2 relevantes para contratos consumidos.
- `docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF3.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`
- relatórios `real_dev/IMPLEMENTACAO-MF1.md`, `real_dev/IMPLEMENTACAO-MF2.md`, `real_dev/AUDITORIA-IMPLEMENTACAO-MF1.md`, `real_dev/AUDITORIA-IMPLEMENTACAO-MF2.md`, `real_dev/CORRECAO-AUDITORIA-MF1.md`, `real_dev/CORRECAO-AUDITORIA-MF2.md`
- código em `real_dev/api/src` e `real_dev/web/src`

### Alterações locais pré-existentes

- `docs/planificacao/backlogs/BACKLOG-MVP.md` estava modificado antes desta auditoria.
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF3.md` estava não versionado antes desta auditoria.
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md` estava não versionado antes desta auditoria.
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md` já existia como ficheiro não versionado e foi atualizado por esta execução.

`real_dev/` estar fora do git ou ignorado não foi classificado como problema, conforme regra da prompt.

## Estado por BK

| BK | RF/RNF | Estado | Evidência principal | Risco ativo |
| --- | --- | --- | --- | --- |
| `BK-MF3-01` | `RF37` | `PASS` | `AiGuardrailsModule`; `POST /api/ai/guardrails/check`; `AiGuardrailsService` valida `SOLO`, `STUDY_ROOM` e `CLASS_SUBJECT`; spec cobre decisão permitida e bloqueio por membership. | Nenhum. |
| `BK-MF3-02` | `RF38` | `PASS` | `SourceGroundedAiService` usa `findReadableDoneJob`, bloqueia sem citações, injeta `AI_PROVIDER`, chama `generateStudyTool` e persiste citações; DTO usa `sourceJobIds`. | Nenhum. |
| `BK-MF3-03` | `RF39` | `PASS` | `ExternalKnowledgeAiService` valida aluno/área, separa fontes internas de nota externa limitada, injeta `AI_PROVIDER` e chama `generateStudyTool`. | Nenhum. |
| `BK-MF3-04` | `RF40` | `PASS` | `AdaptiveExplanationsService` reutiliza `AdaptiveLearningService` e exige role `STUDENT`; controller protegido por `SessionGuard`. | Nenhum. |
| `BK-MF3-05` | `RF41` | `PASS` | `StudyGroupsService` reutiliza `StudyRoomsService` em vez de criar membership paralelo; smoke E2E cria grupo real em `/app/comunidade`. | Nenhum. |
| `BK-MF3-06` | `RF42` | `PASS` | `StudyGroupMessagesService` valida membership antes de criar/listar mensagens; DTO e frontend usam `text`; spec HTTP cobre `POST/GET`. | Nenhum. |
| `BK-MF3-07` | `RF43` | `PASS` | `StudyGroupSessionsService` valida membership, rejeita datas passadas e lista sessões futuras por grupos do aluno. | Nenhum. |
| `BK-MF3-08` | `RF44` | `PASS` | `StudyGroupAiService` valida membership, usa `findUsableSharesForRoom`, bloqueia sem fontes, injeta `AI_PROVIDER` e usa `sourceShareIds`. | Nenhum. |
| `BK-MF3-09` | `RF45` | `PASS` | `UnifiedSearchService` pesquisa apenas em jobs autorizados via `findReadableDoneJob` e regista query. | Nenhum. |
| `BK-MF3-10` | `RF46` | `PASS` | `CurriculumNavigationService` constrói navegação a partir de chunks autorizados e regista consulta. | Nenhum. |
| `BK-MF3-11` | `RF47` | `PASS` | `NotificationPreferencesService` expõe `GET/PUT`, defaults efetivos e persistência por contexto. | Nenhum. |
| `BK-MF3-12` | `RF48` | `PASS` | `StudyAlertsService` agrega rotinas/objetivos/sessões e respeita preferências `inApp`; DTO rejeita `onlyUpcoming` inválido. | Nenhum. |

## Mapa de rastreabilidade

| BK | RF/RNF | Ficheiros backend principais | Ficheiros frontend principais | Testes/evidência |
| --- | --- | --- | --- | --- |
| `BK-MF3-01` | `RF37` | `real_dev/api/src/modules/ai-guardrails/*` | `real_dev/web/src/features/ai-guardrails/*` | `ai-guardrails.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-02` | `RF38` | `real_dev/api/src/modules/source-grounded-ai/*`, `material-index.service.ts` | `real_dev/web/src/features/source-grounded-ai/*` | `source-grounded-ai.service.spec.ts`, `material-index.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-03` | `RF39` | `real_dev/api/src/modules/external-knowledge-ai/*` | `real_dev/web/src/features/external-knowledge-ai/*` | `external-knowledge-ai.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-04` | `RF40` | `real_dev/api/src/modules/adaptive-explanations/*`, `real_dev/api/src/modules/ai/adaptive-learning.service.ts` | `real_dev/web/src/features/adaptive-explanations/*` | `adaptive-explanations.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-05` | `RF41` | `real_dev/api/src/modules/study-groups/*`, `study-rooms.service.ts` | `real_dev/web/src/features/study-groups/*` | `study-groups.service.spec.ts`, `mf3-smoke.spec.ts` |
| `BK-MF3-06` | `RF42` | `real_dev/api/src/modules/study-group-messages/*` | `real_dev/web/src/features/study-group-messages/*` | `study-group-messages.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-07` | `RF43` | `real_dev/api/src/modules/study-group-sessions/*` | `real_dev/web/src/features/study-group-sessions/*` | `study-group-sessions.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-08` | `RF44` | `real_dev/api/src/modules/study-group-ai/*`, `room-shares.service.ts` | `real_dev/web/src/features/study-group-ai/*` | `study-group-ai.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-09` | `RF45` | `real_dev/api/src/modules/unified-search/*`, `material-index.service.ts` | `real_dev/web/src/features/unified-search/*` | `unified-search.service.spec.ts`, `material-index.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-10` | `RF46` | `real_dev/api/src/modules/curriculum-navigation/*`, `material-index.service.ts` | `real_dev/web/src/features/curriculum-navigation/*` | `curriculum-navigation.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-11` | `RF47` | `real_dev/api/src/modules/notification-preferences/*` | `real_dev/web/src/features/notification-preferences/*` | `notification-preferences.service.spec.ts`, `mf3-http-contracts.spec.ts` |
| `BK-MF3-12` | `RF48` | `real_dev/api/src/modules/study-alerts/*` | `real_dev/web/src/features/study-alerts/*` | `study-alerts.service.spec.ts`, `study-alerts-query.dto.spec.ts`, `mf3-http-contracts.spec.ts` |

## Mapa de integração da MF

- Backend MF3 integrado em `real_dev/api/src/app.module.ts` com `AiGuardrailsModule`, `SourceGroundedAiModule`, `ExternalKnowledgeAiModule`, `AdaptiveExplanationsModule`, `StudyGroupsModule`, `StudyGroupMessagesModule`, `StudyGroupSessionsModule`, `StudyGroupAiModule`, `UnifiedSearchModule`, `CurriculumNavigationModule`, `NotificationPreferencesModule` e `StudyAlertsModule`.
- Todos os controllers MF3 auditados usam `@UseGuards(SessionGuard)` e obtêm o utilizador a partir de `request.user`, não de `body` ou query string.
- Frontend MF3 usa clientes tipados em `real_dev/web/src/features/*` e helper comum `requestMf3Json`, que preserva cookies HttpOnly com `credentials: "include"`.
- Página agregadora `/app/comunidade` expõe grupos, mensagens, sessões, IA coletiva, pesquisa, navegação, guardrails, respostas com fontes, conhecimento externo, preferências e alertas.

## Contratos consumidos

- `SessionGuard`, `AuthenticatedRequest` e sessão por cookie HttpOnly de MF0.
- `StudyAreasService.getMyStudyArea` para ownership de áreas privadas.
- `MaterialsService.listReadyTextSources` para fontes internas processáveis de áreas privadas.
- `MaterialIndexService.findReadableDoneJob` para fontes indexadas privadas e oficiais acessíveis ao actor autenticado.
- `StudyRoomsService.ensureMember` e `RoomSharesService.findUsableSharesForRoom` para membership e fontes partilhadas em salas/grupos.
- `SubjectsService.findSubjectForStudent` usado pela cadeia de material oficial acessível a aluno inscrito.
- `AdaptiveLearningService.askAdaptiveExplanation` para explicações adaptadas ao perfil.
- `RoutinesService.listMine` para rotinas/objetivos usados em alertas.

## Contratos entregues

- `AiGuardrailsModule`, `AiGuardrailsService` e `POST /api/ai/guardrails/check`.
- `SourceGroundedAiModule` e `POST /api/ai/source-grounded-answers` com payload `{ sourceJobIds, question }`.
- `ExternalKnowledgeAiModule` e `POST /api/ai/external-knowledge-answers`.
- `AdaptiveExplanationsModule` e `POST /api/ai/adaptive-explanations`.
- `StudyGroupsModule` e `POST/GET /api/study-groups`.
- `StudyGroupMessagesModule` e `POST/GET /api/study-groups/:groupId/messages` com payload `{ kind, text }`.
- `StudyGroupSessionsModule` e `POST/GET /api/study-groups/:groupId/sessions`.
- `StudyGroupAiModule` e `POST /api/study-groups/:groupId/group-ai/questions` com payload `{ question, sourceShareIds? }`.
- `UnifiedSearchModule` e `POST /api/search`.
- `CurriculumNavigationModule` e `POST /api/curriculum/navigation`.
- `NotificationPreferencesModule` e `GET/PUT /api/notification-preferences`.
- `StudyAlertsModule` e `GET /api/study-alerts`.
- Página agregadora `/app/comunidade` e navegação de aluno para `Comunidade`.

## Coerência entre MFs

- MFs implementadas consideradas por evidência real: `MF0`, `MF1`, `MF2`, `MF3`.
- Profundidade: `vizinhas`.
- Resultado `MF2 -> MF3`: `COERENTE`.
- Resultado `MF3 -> MF4`: `COERENTE` quanto ao handoff documental; MF4 não tem implementação real validada em `real_dev`, por isso não há validação runtime de consumidor seguinte.
- Resultado global: `COERENTE`.

### MF2 -> MF3

`MaterialIndexService.findReadableDoneJob` preserva ownership de materiais privados e permite leitura pedagógica de materiais oficiais a professores donos ou alunos inscritos. `SourceGroundedAiService`, `UnifiedSearchService` e `CurriculumNavigationService` usam esse contrato. A cadeia de grupos reutiliza `StudyRoomsService.ensureMember` e `RoomSharesService.findUsableSharesForRoom`, evitando membership paralelo.

### MF3 -> MF4

MF3 entrega preferências por contexto (`NotificationPreferencesService`) e alertas internos (`StudyAlertsService`) que `BK-MF4-01` pode consumir para notificações de novos materiais, feedback e tarefas. Como MF4 ainda não tem implementação real nesta raiz, o handoff foi validado apenas por contrato documental.

## Findings ativos

Não foram encontrados findings ativos P0, P1, P2 ou P3 nesta auditoria.

## Findings históricos reavaliados

| Finding anterior | Estado atual | Evidência |
| --- | --- | --- |
| `AUD-MF3-001` materiais oficiais indexados inacessíveis a alunos inscritos | `JA_CORRIGIDO` | `MaterialIndexService.findReadableDoneJob` permite leitura de job oficial por aluno inscrito via `SubjectsService.findSubjectForStudent`; specs cobrem este contrato. |
| `AUD-MF3-002` segredo real em `real_dev/api/.env` | `JA_CORRIGIDO` | Pesquisa estática encontrou `OPENAI_API_KEY=` vazio em `real_dev/api/.env` e `.env.example`; não há valor real no repositório. Rotação externa continua não verificável localmente. |
| `AUD-MF3-003` `onlyUpcoming` aceitava valores inválidos | `JA_CORRIGIDO` | `StudyAlertsQueryDto` transforma apenas `true`/`false`; `study-alerts-query.dto.spec.ts` e `mf3-http-contracts.spec.ts` cobrem `onlyUpcoming=talvez` com `400`. |
| `AUD-MF3-004` cobertura automática MF3 incompleta | `JA_CORRIGIDO` | Suite atual tem 54 suites/198 testes, `mf3-http-contracts.spec.ts` e smoke E2E MF3. |
| `AUD-MF3-005` guardrails persistiam `promptPreview` | `JA_CORRIGIDO` | Pesquisa estática não encontrou `promptPreview` em código runtime; schema/service de guardrails persistem decisão sem prompt privado. |
| `AUD-MF3-006` cobertura HTTP MF3 ainda parcial | `JA_CORRIGIDO` | `mf3-http-contracts.spec.ts` cobre endpoints MF3 sem sessão, DTOs inválidos e happy paths principais com services mockados. |
| `AUD-MF3-007` cartões de grupo apontavam para rota inexistente | `JA_CORRIGIDO` | Smoke E2E MF3 confirma navegação para `/app/comunidade` e criação de grupo com sessão real. |
| `AUD-MF3-008` BKs de IA MF3 não chamavam provider IA previsto | `JA_CORRIGIDO` | `SourceGroundedAiService`, `ExternalKnowledgeAiService` e `StudyGroupAiService` injetam `AI_PROVIDER`, chamam `generateStudyTool` e validam resposta não vazia. Specs dedicadas verificam chamada ao provider. |
| `AUD-MF3-009` payloads reais divergiam dos contratos documentados | `JA_CORRIGIDO` | DTOs e clientes frontend usam `sourceJobIds`, `text` e `sourceShareIds`; `mf3-http-contracts.spec.ts` cobre esses payloads. |

## Pesquisa estática obrigatória

Pesquisa executada em `real_dev/api/src`, `real_dev/web/src`, `real_dev/web/tests/e2e`, `real_dev/api/.env` e `real_dev/api/.env.example` para:

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
- `process.env`
- `promptPreview`
- `password`
- `token`
- `cookie`
- `secret`
- `api key`

Resultados:

- Sem usos de `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `embeddings`, `OCR`, `chunking` ou `promptPreview` nos alvos pesquisados.
- `OPENAI_API_KEY` existe como variável vazia em `.env` e `.env.example`; não foi encontrado valor real.
- `process.env` aparece em configuração, provider IA, scripts E2E e testes, com usos esperados.
- Os testes E2E têm fallbacks de credenciais de desenvolvimento para contas seed locais; classificados como dados de teste e não como segredo de produção.
- `console.log` aparece apenas no script de seed de desenvolvimento, fora do runtime MF3.
- `RAG` apareceu apenas como falso positivo textual em `SOCRATIC`.
- Termos de `password`, `cookie`, `token` e `secret` apareceram em auth, sessão HttpOnly, documentação de `.env.example`, testes e comentários esperados; não foi encontrada exposição de segredo real.

## Validações executadas

| Comando | Resultado | Observações |
| --- | --- | --- |
| `git status --short` | `PASS_COM_RISCOS` | Alterações pré-existentes em `BACKLOG-MVP.md` e relatórios MF3 não versionados. |
| `npm --prefix real_dev/api test` | `PASS` | 54 suites, 198 testes. |
| `npm --prefix real_dev/api run build` | `PASS` | `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` | `tsc --noEmit && vite build`; 104 módulos transformados. |
| `npm --prefix real_dev/web run test:e2e -- --grep "MF3 smoke"` | `BLOQUEADO` dentro do sandbox | `MongoMemoryServer`: `listen EPERM: operation not permitted 0.0.0.0`. |
| `npm --prefix real_dev/web run test:e2e -- --grep "MF3 smoke"` | `PASS` fora do sandbox | 1 teste Chromium passou. |
| `git diff --check` | `PASS` | Sem output. |
| Pesquisa estática obrigatória | `PASS` | Sem segredos reais, storage inseguro de tokens ou placeholders finais nos alvos pesquisados. |

## Ficheiros alterados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`

## Blockers e TODOs

- `TODO (EXTERNO)`: confirmar fora do repositório se alguma chave OpenAI real exposta em execuções anteriores foi rodada/revogada. Localmente, o valor já não existe.

## Próximos passos

- Se o objetivo seguinte for fechar a cadeia, avançar para `corrigir_auditoria` apenas se surgir novo relatório com findings ativos; neste estado, não há findings a corrigir.
- Quando MF4 tiver implementação real em `real_dev`, revalidar o consumo de `NotificationPreferencesService` e `StudyAlertsService` por `BK-MF4-01`.

## Conclusão

- Findings P0 ativos: `0`
- Findings P1 ativos: `0`
- Findings P2 ativos: `0`
- Findings P3 ativos: `0`
- Findings P3 incluídos na auditoria: `sim`
- Resultado final: `PASS`
