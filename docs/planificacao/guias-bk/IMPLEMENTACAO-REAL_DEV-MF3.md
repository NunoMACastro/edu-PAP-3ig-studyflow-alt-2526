# IMPLEMENTACAO-REAL_DEV-MF3

## Resultado geral

- Projeto: `StudyFlow`
- Implementacao auditada/editada: `real_dev/api` e `real_dev/web`
- MF alvo: `MF3`
- Modo: `implementar`
- Resultado: `IMPLEMENTADO_SEM_VALIDACAO_TOTAL`
- Data: `2026-06-15`

MF3 foi implementada em `real_dev` com módulos backend reais, clientes/painéis frontend e testes unitários focados. A validação automática passou, mas fica `IMPLEMENTADO_SEM_VALIDACAO_TOTAL` porque não foi executado smoke manual com Mongo/API em runtime nem screenshots browser.

## BKs abrangidos

| BK | RF/RNF | Estado | Entrega principal |
| --- | --- | --- | --- |
| BK-MF3-01 | RF37 | `IMPLEMENTADO` | `POST /api/ai/guardrails/check` com validação de `SOLO`, `STUDY_ROOM` e `CLASS_SUBJECT` por sessão, ownership/membership e persistência da decisão. |
| BK-MF3-02 | RF38 | `IMPLEMENTADO` | `POST /api/ai/source-grounded-answers` bloqueia sem chunks indexados e devolve resposta com citações internas obrigatórias. |
| BK-MF3-03 | RF39 | `IMPLEMENTADO` | `POST /api/ai/external-knowledge-answers` permite/bloqueia nota externa limitada, mantendo fontes internas separadas. |
| BK-MF3-04 | RF40 | `IMPLEMENTADO` | `POST /api/ai/adaptive-explanations` como fachada segura sobre `AdaptiveLearningService`. |
| BK-MF3-05 | RF41 | `IMPLEMENTADO` | `POST/GET /api/study-groups` reutiliza `StudyRoom` para evitar entidade paralela. |
| BK-MF3-06 | RF42 | `IMPLEMENTADO` | `POST/GET /api/study-groups/:groupId/messages` com mensagens/notas e membership obrigatória. |
| BK-MF3-07 | RF43 | `IMPLEMENTADO` | `POST/GET /api/study-groups/:groupId/sessions` com sessões futuras e membership obrigatória. |
| BK-MF3-08 | RF44 | `IMPLEMENTADO` | `POST /api/study-groups/:groupId/group-ai/questions` com fontes partilhadas autorizadas e bloqueio sem fontes. |
| BK-MF3-09 | RF45 | `IMPLEMENTADO` | `POST /api/search` pesquisa em jobs de indexação autorizados e regista query. |
| BK-MF3-10 | RF46 | `IMPLEMENTADO` | `POST /api/curriculum/navigation` constrói tópicos/secções a partir de chunks autorizados. |
| BK-MF3-11 | RF47 | `IMPLEMENTADO` | `GET/PUT /api/notification-preferences` com preferências efetivas por contexto. |
| BK-MF3-12 | RF48 | `IMPLEMENTADO` | `GET /api/study-alerts` agrega rotinas, objetivos e sessões respeitando `inApp`. |

## Mapa BK -> ficheiros principais

- BK-MF3-01: `real_dev/api/src/modules/ai-guardrails/*`, `real_dev/web/src/features/ai-guardrails/*`
- BK-MF3-02: `real_dev/api/src/modules/source-grounded-ai/*`, `real_dev/web/src/features/source-grounded-ai/*`
- BK-MF3-03: `real_dev/api/src/modules/external-knowledge-ai/*`, `real_dev/web/src/features/external-knowledge-ai/*`
- BK-MF3-04: `real_dev/api/src/modules/adaptive-explanations/*`, `real_dev/web/src/features/adaptive-explanations/*`
- BK-MF3-05: `real_dev/api/src/modules/study-groups/*`, `real_dev/web/src/features/study-groups/*`
- BK-MF3-06: `real_dev/api/src/modules/study-group-messages/*`, `real_dev/web/src/features/study-group-messages/*`
- BK-MF3-07: `real_dev/api/src/modules/study-group-sessions/*`, `real_dev/web/src/features/study-group-sessions/*`
- BK-MF3-08: `real_dev/api/src/modules/study-group-ai/*`, `real_dev/web/src/features/study-group-ai/*`
- BK-MF3-09: `real_dev/api/src/modules/unified-search/*`, `real_dev/web/src/features/unified-search/*`
- BK-MF3-10: `real_dev/api/src/modules/curriculum-navigation/*`, `real_dev/web/src/features/curriculum-navigation/*`
- BK-MF3-11: `real_dev/api/src/modules/notification-preferences/*`, `real_dev/web/src/features/notification-preferences/*`
- BK-MF3-12: `real_dev/api/src/modules/study-alerts/*`, `real_dev/web/src/features/study-alerts/*`
- Integração: `real_dev/api/src/app.module.ts`, `real_dev/web/src/pages/student/Mf3CommunityPage.tsx`, `real_dev/web/src/routes/protectedRoutes.tsx`, `real_dev/web/src/components/layout/AppShell.tsx`

## Contratos consumidos

- Sessão/autenticação: `SessionGuard`, `AuthenticatedRequest`, cookies HttpOnly.
- Ownership privado: `StudyAreasService.getMyStudyArea`, `MaterialsService.listReadyTextSources`.
- Membership: `StudyRoomsService.ensureMember`, `RoomSharesService.findUsableSharesForRoom`.
- Turma/disciplina: `SubjectsService.findSubjectForStudent`.
- Indexação: `MaterialIndexService.findDoneJob`.
- Aprendizagem adaptativa: `AdaptiveLearningService.askAdaptiveExplanation`.
- Rotinas/objetivos: `RoutinesService.listMine`.

## Contratos entregues para MF4

- Preferências efetivas por contexto através de `NotificationPreferencesService`.
- Alertas internos agregados em `StudyAlertsService`.
- Logs técnicos de guardrails, respostas fundamentadas, pesquisa e navegação curricular.
- Grupos, mensagens, sessões e IA coletiva com membership backend obrigatória.

## Coerência entre MFs

- MF2 -> MF3: `COERENTE_COM_RISCOS`. MF3 reutiliza serviços reais de áreas, materiais, indexação, salas e disciplinas sem criar modelos paralelos para grupos. Risco residual: jobs oficiais continuam limitados ao contrato atual de `MaterialIndexService.findDoneJob`, que valida ownership de professor para `OFFICIAL_SUBJECT`.
- MF3 -> MF4: `COERENTE_COM_RISCOS`. MF3 entrega preferências e alertas que `BK-MF4-01` pode consumir. MF4 ainda não tem implementação real em `real_dev`, por isso o handoff não foi validado em runtime.

## Decisões técnicas

- Grupos de estudo são uma fachada sobre `StudyRoom`, não um schema novo, para preservar membership.
- As respostas de `source-grounded-ai`, `external-knowledge-ai` e `study-group-ai` são fundamentadas e determinísticas quando não há provider específico. Não prometem navegação web, embeddings, OCR avançado ou pesquisa semântica.
- `BK-MF3-04` foi implementado como fachada sobre o service existente para evitar duplicar lógica de perfil, fontes e IA.
- O frontend expõe `/app/comunidade` com painéis reais para testar todos os contratos MF3.

## Testes e validações

- `npm test` em `real_dev/api`: `PASS`, 43 suites, 164 testes.
- `npm run build` em `real_dev/api`: `PASS`.
- `npm run build` em `real_dev/web`: `PASS`.
- `git diff --check`: `PASS`.
- Pesquisa estática em `real_dev/api/src` e `real_dev/web/src`: sem `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embeddings`, `OCR` ou `chunking` no código MF3 criado. Hits restantes são falsos positivos/esperados em auth, cookies HttpOnly, password DTOs/tests, seeds de desenvolvimento e `OPENAI_API_KEY` do provider existente.

## Testes adicionados

- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/study-group-sessions/study-group-sessions.service.spec.ts`

## Blockers e TODOs

- `TODO (FOLLOW-UP)`: executar smoke runtime com MongoDB/API e validar `/app/comunidade` em browser com dados reais.
- `TODO (FOLLOW-UP)`: quando MF4 avançar, ligar alertas de novos materiais/feedback/tarefas aos contratos de preferências entregues por MF3.
- `TODO (FOLLOW-UP)`: se a PAP exigir IA generativa real para respostas MF3, adicionar métodos específicos ao `AiProvider` com validação runtime de citações, mantendo fallback honesto.
