# Plano de execucao real_dev - MF4

## Header

- `project`: `StudyFlow`
- `modo`: `planear_apenas`
- `mf_alvo`: `MF4`
- `bk_ids`: `todos`
- `implementation_root`: `real_dev`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `profundidade_coerencia`: `vizinhas`
- `permitir_alterar_docs`: `nao`, excepto este relatorio operacional permitido pela prompt
- `permitir_commits`: `nao`
- `estado`: `PLANO_PRONTO`

## Resumo executivo

Este plano cobre a implementacao futura dos 10 BKs da `MF4` em `real_dev/api` e `real_dev/web`, sem editar codigo nesta execucao.

A MF4 deve acrescentar governanca operacional, privacidade/RGPD, administracao, auditoria e controlo de IA sobre contratos ja existentes de MF0-MF3. A implementacao real deve usar `real_dev` como raiz, apesar de alguns guias MF4 ainda referirem caminhos `apps/...`; esses caminhos devem ser tratados como drift de caminho e mapeados para `real_dev/...`.

Validacoes executadas nesta execucao:

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `git status --short` | `PASS` | Sem alteracoes locais reportadas. |
| `git diff --check` | `PASS` | Sem whitespace errors. |
| `bash scripts/validate-planificacao.sh` | `FAIL_DOCUMENTAL` | Drift critico em estados MF3: guias MF3 `DONE` vs matriz/backlog `TODO`; score `80`, `overall_pass=false`. |
| `npm run test:unit` em `real_dev/api` | `PASS` | 54 suites, 198 testes. |
| `npm run build` em `real_dev/api` | `PASS` | `nest build` concluiu. |
| `npm run build` em `real_dev/web` | `PASS` | `tsc --noEmit && vite build`; 104 modulos transformados. |

## Fontes consultadas

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
- guias MF3/MF5 relevantes para coerencia de fronteira
- relatorios de hidratacao, implementacao, auditoria e correcao existentes ate MF3
- codigo real em `real_dev/api` e `real_dev/web`

## Raiz auditada e pastas ignoradas

| Pasta | Decisao | Motivo |
| --- | --- | --- |
| `real_dev/api` | raiz backend real | Tem NestJS, TypeScript, Mongoose, modulos MF0-MF3 e testes reais. |
| `real_dev/web` | raiz frontend real | Tem React/Vite/TypeScript, rotas e paineis MF0-MF3. |
| `apps/api` / `apps/web` | referencia auxiliar | Existem como referencia validada dos alunos, mas a prompt fixa `IMPLEMENTATION_ROOT=real_dev`. |
| `mockup` | referencia visual apenas | Nao cumpre BKs executaveis. |

## BKs alvo

| BK | RF | Prioridade | Dependencias documentais | Estado de planeamento |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `P1` | `BK-MF1-12` | Planeavel; depende de publicacoes/turmas e preferencias MF3. |
| `BK-MF4-02` | `RF50` | `P1` | `BK-MF2-11`, `BK-MF4-01` funcional | Planeavel; precisa de leitura de `StudyEvent` e envio via notificacoes. |
| `BK-MF4-03` | `RF51` | `P1` | `BK-MF4-02` | Planeavel; deve integrar quotas nos fluxos de `BK-MF4-01/02`. |
| `BK-MF4-04` | `RF52` | `P0` | contratos MF0/MF3 | Planeavel; export JSON minimizado, sem segredos. |
| `BK-MF4-05` | `RF53` | `P0` | contratos MF0/MF4-07 recomendados | Planeavel com cuidado; protege ultimo admin e revoga sessao. |
| `BK-MF4-06` | `RF54` | `P0` | services IA existentes | Planeavel; exige enforcement antes de chamadas ao provider. |
| `BK-MF4-07` | `RF55` | `P0` | `BK-MF0-04` | Planeavel; deve criar base admin para MF4. |
| `BK-MF4-08` | `RF56` | `P0` | `BK-MF4-07` | Planeavel; deve redigir metadados sensiveis. |
| `BK-MF4-09` | `RF57` | `P1` | `BK-MF2-11`, recomendado `BK-MF4-06/08` | Planeavel; resolve politicas de modelos antes de provider. |
| `BK-MF4-10` | `RF58` | `P1` | `BK-MF4-09` | Planeavel; reserva de quota deve ocorrer antes da chamada IA. |

## Contratos existentes a preservar

- Autenticacao: `SessionGuard`, `AuthenticatedRequest`, `AuthenticatedUser`, cookie `sf_sid` e `SessionService.destroySession`.
- Roles: `UserRole = STUDENT | TEACHER | ADMIN` em `real_dev/api/src/modules/auth/schemas/user.schema.ts`.
- Utilizadores: `UsersService.findById`, `findByEmail`, `toPublicUser`.
- Turmas: `ClassesService.findOwnedClass` e `ensureStudentEnrollment`.
- Grupos: `StudyGroupsService.ensureMember`, sobre `StudyRoomsService`.
- Preferencias: `NotificationPreferencesService.listEffective`, `upsert`, `isInAppEnabled`.
- Materiais privados: `MaterialsService.countMine`, `listByArea`, `findOwnedTextMaterial`.
- Historico: `HistoryModule` exporta `HistoryService`; `StudyEvent` existe em `study_events`.
- IA: `AI_PROVIDER` exportado por `AiModule`; services atuais chamam provider em `PrivateAreaAiService`, `StudyGroupAiService`, `ClassAiService`, `ProjectAiService`, `SourceGroundedAiService`, `ExternalKnowledgeAiService`, `AdaptiveLearningService`, `SummariesService` e `StudyToolsService`.
- Frontend: chamadas devem usar clientes existentes com `credentials: "include"`; para novas features MF4 pode reutilizar o padrao de `real_dev/web/src/features/mf3/request-mf3-json.ts`.

## Ordem recomendada

1. `BK-MF4-07` - Gestao de utilizadores e papeis.
   - Motivo: cria administracao real, protecao do ultimo admin e historico de roles que `BK-MF4-08` deve auditar.

2. `BK-MF4-08` - Auditoria completa.
   - Motivo: deve ficar cedo para que alteracoes de roles, consentimentos, politicas e quotas possam registar eventos auditaveis sem duplicar logs.

3. `BK-MF4-04` - Exportar dados pessoais.
   - Motivo: P0 RGPD independente; reutiliza contratos de utilizador, areas, materiais e preferencias.

4. `BK-MF4-05` - Eliminar conta e dados.
   - Motivo: P0 RGPD; deve vir depois de exportacao e depois de roles para proteger ultimo admin.

5. `BK-MF4-06` - Gestao de consentimentos para IA.
   - Motivo: P0; desbloqueia enforcement transversal antes das politicas de modelo/quotas.

6. `BK-MF4-01` - Notificacoes de grupos/turmas.
   - Motivo: base funcional de notificacoes internas e historico consumido por alertas.

7. `BK-MF4-02` - Alertas docentes de acompanhamento.
   - Motivo: consome `BK-MF4-01` e contratos de turmas/historico.

8. `BK-MF4-03` - Politicas de canais e quotas de notificacao.
   - Motivo: depende da cadeia de notificacoes; ao implementar, voltar a integrar `assertWithinQuota` em `BK-MF4-01/02`.

9. `BK-MF4-09` - Modelos de IA e limites de uso.
   - Motivo: deve respeitar consentimentos e auditar alteracoes; integra nos services IA antes do provider.

10. `BK-MF4-10` - Quotas de IA e consumo.
    - Motivo: depende de finalidade/model policy; reserva deve acontecer antes do provider e antes de consumo real.

## Plano por area tecnica

### Backend

- Criar modulos NestJS pequenos por dominio: `admin-users`, `audit-log`, `privacy-data-exports`, `account-deletion`, `ai-consents`, `context-notifications`, `follow-up-alerts`, `notification-policies`, `ai-model-policies`, `ai-quotas`.
- Adicionar schemas Mongoose por modulo e importar apenas os modelos necessarios via `MongooseModule.forFeature`.
- Manter autorizacao no backend; o frontend nao deve enviar `userId`, `targetUserId`, `recipientIds` ou roles como fonte de verdade.
- Criar helpers privados para `assertAdmin`, `assertTeacher`, ownership, membership e redaccao de metadados.
- Integrar `AuditLogService.record` de forma gradual em roles, materiais e services IA, sem guardar prompts completos, respostas IA completas, cookies, hashes ou chaves.
- Integrar `AiConsentsService.assertGranted`, `AiModelPoliciesService.resolveForUse` e `AiQuotasService.reserveUsage` antes de cada chamada a `AI_PROVIDER`.

### Frontend

- Criar features MF4 com clientes tipados e paineis pequenos, seguindo o padrao `requestMf3Json`.
- Adicionar rotas em `ProtectedRoutes` e entradas na shell/navigation apenas onde forem necessarias para aluno, professor ou admin.
- Cada painel deve ter estados `loading`, `error`, `empty` e `success`.
- Nao usar `localStorage` ou `sessionStorage` para sessao, token, export bundles ou segredos.

### Testes

- Para `P0`: unit tests focados + build +, quando viavel, smoke/integration HTTP para negativos principais.
- Para `P1`: unit tests de service e teste de integracao leve quando houver endpoint transversal.
- Cobrir negativos de sessao ausente, role incorreta, acesso cruzado, ultimo admin, consentimento ausente, politica desativada, quota excedida e metadata sensivel.

## Riscos e blockers

| Tipo | Item | Impacto | Plano de mitigacao |
| --- | --- | --- | --- |
| `DRIFT` | Guias MF4 referem `apps/...` em varios ficheiros. | Risco de editar raiz errada. | Mapear sempre para `real_dev/...` nesta execucao. |
| `DRIFT` | Validacao documental falha por estados MF3 divergentes. | Bloqueia PASS documental global, nao bloqueia planeamento MF4. | Registar como drift documental; nao corrigir porque `PERMITIR_ALTERAR_DOCS=nao`. |
| `RISCO` | `BK-MF4-02` precisa de consultas a `StudyEvent`; `HistoryModule` exporta `HistoryService`, nao o model. | Implementacao pode tentar importar `StudyModule` e criar ciclo desnecessario. | O modulo de alertas deve importar `MongooseModule.forFeature([{ name: StudyEvent.name, schema: StudyEventSchema }])` ou expor metodo dedicado no dominio de historico, mantendo scope minimo. |
| `RISCO` | `BK-MF4-03` chega depois de `BK-MF4-01/02`. | Pode exigir editar notificacoes/alertas para aplicar quotas. | Planear um passo explicito de integracao final de `NotificationPoliciesService.assertWithinQuota`. |
| `RISCO` | `BK-MF4-06/09/10` tocam muitos services IA. | Blast radius elevado. | Criar services pequenos e testes focais; integrar um padrao comum sem alterar prompts ou respostas publicas desnecessariamente. |
| `SEGURANCA` | Exportacao e auditoria podem persistir dados sensiveis. | Exposicao de dados pessoais. | Minimizar payloads, redigir chaves proibidas e testar ausencia de `passwordHash`, cookies, prompts completos e respostas completas. |
| `SCOPE` | Email, push, billing, SIEM, backups e workflows legais nao pertencem a MF4. | Scope creep. | Registar como follow-up quando aparecerem, sem implementar nesta MF. |

## Validacoes previstas para a implementacao futura

1. `git status --short`
2. `npm run test:unit` em `real_dev/api`
3. `npm run build` em `real_dev/api`
4. `npm run build` em `real_dev/web`
5. Testes focais por modulo novo, por exemplo `npm test -- --runTestsByPath src/modules/admin-users/admin-users.service.spec.ts`
6. E2E/smoke apenas quando a app e Mongo/Redis estiverem disponiveis no ambiente apropriado
7. Pesquisa estatica final por `localStorage`, `sessionStorage`, `passwordHash`, `OPENAI_API_KEY`, prompts completos, `as any`, `payload: unknown`, TODOs vagos e claims indevidos de RAG/embeddings/OCR

## Conclusao

A MF4 esta planeavel em `real_dev` sem blockers tecnicos absolutos. O maior risco e o alcance transversal dos BKs de consentimentos/modelos/quotas de IA e de auditoria. A execucao deve ser incremental, com `BK-MF4-07` e `BK-MF4-08` primeiro, para que administracao e auditoria fiquem disponiveis antes de privacidade, notificacoes e governanca de IA.

Estado final desta execucao: `PLANO_PRONTO_SEM_EDICOES_DE_CODIGO`.
