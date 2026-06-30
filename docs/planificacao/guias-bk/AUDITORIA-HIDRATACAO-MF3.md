# Auditoria de guias BK - MF3

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF3`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- `project`: `StudyFlow`
- `macro_funcionalidade`: `MF3`
- `modo`: `auditar_apenas`
- `implementation_root`: `real_dev`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-06-29`

## Escopo desta execução
Esta execução auditou os 12 BKs da `MF3` sem editar guias de aluno, código real, mockups, documentos canónicos ou BKs fora da macrofase alvo.

O relatório anterior registava a MF3 como `12 OK / 0 PARCIAL / 0 CRITICO` depois de uma correção. A auditoria atual reavaliou esse estado contra os BKs MF3, a documentação canónica, a MF anterior, o handoff para MF4 e a implementação real em `real_dev`.

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
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- Todos os BKs em `docs/planificacao/guias-bk/MF0/`, `MF1/`, `MF2/` e `MF3/`
- `docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md`
- `real_dev/api` e `real_dev/web` como implementação estrutural a validar

Não foram encontrados documentos obrigatórios em falta.

## Resultado global
| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado registado antes desta execução | 12 | 0 | 0 |
| Estado auditado nesta execução | 10 | 2 | 0 |
| Estado depois desta execução | 10 | 2 | 0 |

## BKs analisados
| BK | RF principal | Prioridade | Estado | Fundamentação |
| --- | --- | --- | --- | --- |
| `BK-MF3-01` | `RF37` | `P0` | `OK` | Estrutura completa, 8 passos, endpoint `POST /api/ai/guardrails/check`, `SessionGuard`, ownership/membership por contexto e helper frontend `requestMf3Json`. |
| `BK-MF3-02` | `RF38` | `P0` | `OK` | Guia bloqueia geração sem fontes citáveis, usa `MaterialIndexService.findReadableDoneJob`, citações obrigatórias e endpoint real `POST /api/ai/source-grounded-answers`. |
| `BK-MF3-03` | `RF39` | `P1` | `OK` | Conhecimento externo fica limitado, opcional, separado das fontes internas e bloqueado sem fontes privadas processáveis. |
| `BK-MF3-04` | `RF40` | `P1` | `OK` | Reutiliza a persistência/contrato de aprendizagem adaptativa herdado de MF1, sem duplicar schema, e mantém role `STUDENT`. |
| `BK-MF3-05` | `RF41` | `P1` | `OK` | Cria grupos sobre `StudyRoomsService`, preserva membership e prepara chat, sessões e IA coletiva. |
| `BK-MF3-06` | `RF42` | `P1` | `OK` | Chat/notas validam membership no backend e usam endpoints reais `GET/POST /api/study-groups/:groupId/messages`. |
| `BK-MF3-07` | `RF43` | `P2` | `OK` | Sessões futuras validam membership e datas inválidas/passadas, com endpoints reais `GET/POST /api/study-groups/:groupId/sessions`. |
| `BK-MF3-08` | `RF44` | `P2` | `OK` | IA coletiva valida membership, usa fontes partilhadas autorizadas e bloqueia grupo sem fontes processáveis. |
| `BK-MF3-09` | `RF45` | `P0` | `PARCIAL` | Guia está completo, mas o expected result documenta `200 OK` para `POST /api/search`; o contrato HTTP real em Nest devolve `201 Created`. |
| `BK-MF3-10` | `RF46` | `P1` | `PARCIAL` | Guia está completo, mas o expected result documenta `200 OK` para `POST /api/curriculum/navigation`; o contrato HTTP real em Nest devolve `201 Created`. |
| `BK-MF3-11` | `RF47` | `P1` | `OK` | Preferências usam `GET/PUT /api/notification-preferences`, sessão autenticada, `userId` do backend e defaults por contexto. |
| `BK-MF3-12` | `RF48` | `P1` | `OK` | Alertas são in-app, derivados de rotinas, objetivos, sessões e preferências, sem prometer envio real de email/push. |

## BKs PARCIAL ou CRITICO
### `BK-MF3-09` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md`
- Problema principal: expected result HTTP desalinhado.
- Exemplo concreto: linha auditada `Pedido válido para POST /api/search devolve 200 OK`; `real_dev/api/src/modules/mf3-http-contracts.spec.ts` espera `201` para o mesmo `POST`.
- O que falta completar: alterar o BK para documentar `201 Created` ou alterar o controller real com `@HttpCode(200)` se a decisão técnica for devolver `200`.
- Risco pedagógico: o aluno pode validar correctamente a implementação real e pensar que falhou porque o guia pede `200`.
- Risco técnico: baixo a médio; o endpoint, DTO, service, cliente e autorização existem, mas a evidência esperada não bate com o comportamento real.
- Risco de segurança/privacidade: não identificado neste finding; a pesquisa continua a usar sessão e jobs autorizados.
- Dependências a reler: `BK-MF2-07`, `MATRIZ-CANONICA-BK.md`, `real_dev/api/src/modules/unified-search/unified-search.controller.ts`, `real_dev/api/src/modules/mf3-http-contracts.spec.ts`.
- Prioridade de correção: alta, por ser `P0` e RF45.

### `BK-MF3-10` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md`
- Problema principal: expected result HTTP desalinhado.
- Exemplo concreto: linha auditada `Pedido válido para POST /api/curriculum/navigation devolve 200 OK`; `real_dev/api/src/modules/mf3-http-contracts.spec.ts` espera `201` para o mesmo `POST`.
- O que falta completar: alterar o BK para documentar `201 Created` ou alterar o controller real com `@HttpCode(200)` se a decisão técnica for devolver `200`.
- Risco pedagógico: o aluno fica com evidence contraditória entre guia e teste de contrato.
- Risco técnico: baixo a médio; o fluxo está implementável, mas o guia não é totalmente autoconsistente na validação final.
- Risco de segurança/privacidade: não identificado neste finding; a navegação continua a usar jobs autorizados.
- Dependências a reler: `BK-MF2-07`, `MATRIZ-CANONICA-BK.md`, `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts`, `real_dev/api/src/modules/mf3-http-contracts.spec.ts`.
- Prioridade de correção: média, por ser `P1`.

## Findings e decisões
### F-2026-06-16-01 - Expected results HTTP em `BK-MF3-09` e `BK-MF3-10`
Estado: `BLOQUEADO_POR_SCOPE`.

O problema foi confirmado, mas esta execução está em `MODO=auditar_apenas`, por isso não foram editados os BKs. A correção recomendada mais pequena é alinhar os expected results dos dois guias para `201 Created`, porque os controllers Nest não usam `@HttpCode(200)` e o teste de contratos real confirma `201`.

Evidência:
- `docs/planificacao/guias-bk/MF3/BK-MF3-09-pesquisa-unificada-por-topico-conceito-material.md`: expected result `200 OK`.
- `docs/planificacao/guias-bk/MF3/BK-MF3-10-navegacao-por-programa-curriculo.md`: expected result `200 OK`.
- `real_dev/api/src/modules/mf3-http-contracts.spec.ts`: asserts `expect(response.status).toBe(201)` para `/api/search` e `/api/curriculum/navigation`.
- `real_dev/api/src/modules/unified-search/unified-search.controller.ts` e `real_dev/api/src/modules/curriculum-navigation/curriculum-navigation.controller.ts`: controllers com `@Post()` sem `@HttpCode(200)`.

### F-2026-06-16-02 - Ocorrências de `localStorage` na pesquisa obrigatória
Estado: `FINDING_DESCARTADO`.

A pesquisa obrigatória encontrou ocorrências de `localStorage` nos 12 BKs da MF3. São falsos positivos aceitáveis porque aparecem em explicações e cenários negativos a dizer explicitamente para não guardar tokens no browser. Não há instrução para usar `localStorage` como sessão, token ou segredo.

### F-2026-06-16-03 - Coerência MF3 para MF4
Estado: `PARCIAL`.

`BK-MF3-12` tem handoff para `BK-MF4-01`, e a MF3 entrega preferências/alertas internos que a MF4 deve consumir. Contudo, `BK-MF4-01` ainda está no formato antigo e declara apenas dependência canónica `BK-MF1-12`. Por `STRICT_SCOPE=true`, MF4 não foi editada. A próxima auditoria de MF4 deve considerar explicitamente `BK-MF3-11` e `BK-MF3-12`.

## Mapa de integração da MF
| BK | Ficheiros criados/editados/revistos | Exports produzidos | Imports consumidos | Endpoints | Segurança/autorização | Testes/evidence | Dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | `ai-guardrails/*`, `features/mf3/request-mf3-json.ts`, `features/ai-guardrails/*` | `AiGuardrailsModule`, `AiGuardrailsService`, `requestMf3Json` | `SessionGuard`, `AuthenticatedRequest`, `StudyAreasService`, `StudyRoomsService`, `SubjectsService` | `POST /api/ai/guardrails/check` | Sessão, ownership, membership e contexto IA | Unit e contrato MF3 | `BK-MF3-02` e clientes frontend MF3 |
| `BK-MF3-02` | `source-grounded-ai/*`, `features/source-grounded-ai/*` | `SourceGroundedAiModule`, resposta com citações | `AiModule`, `MaterialIndexModule`, `requestMf3Json` | `POST /api/ai/source-grounded-answers` | Sessão, leitura autorizada, bloqueio sem citações | Unit e contrato MF3 | `BK-MF3-03` |
| `BK-MF3-03` | `external-knowledge-ai/*`, `features/external-knowledge-ai/*` | `ExternalKnowledgeAiModule`, nota externa controlada | `AiModule`, `StudyAreasModule`, `MaterialsModule` | `POST /api/ai/external-knowledge-answers` | Sessão, role aluno, ownership e fontes internas | Unit e contrato MF3 | `BK-MF3-04` |
| `BK-MF3-04` | `adaptive-explanations/*`, revisão de `ai/schemas/adaptive-explanation.schema.ts` | `AdaptiveExplanationsModule`, fachada MF3 | `AiModule`, `AdaptiveLearningService` | `POST /api/ai/adaptive-explanations` | Sessão e role `STUDENT` | Unit e contrato MF3 | `BK-MF3-05` |
| `BK-MF3-05` | `study-groups/*`, `features/study-groups/*` | `StudyGroupsModule`, `StudyGroupsService` | `StudyRoomsModule`, `requestMf3Json` | `GET/POST /api/study-groups` | Sessão e membership herdado | Unit | `BK-MF3-06`, `BK-MF3-07`, `BK-MF3-08` |
| `BK-MF3-06` | `study-group-messages/*`, `features/study-group-messages/*` | `StudyGroupMessagesModule` | `StudyGroupsModule`, `requestMf3Json` | `GET/POST /api/study-groups/:groupId/messages` | Membership no backend | Unit e contrato MF3 | `BK-MF3-07` |
| `BK-MF3-07` | `study-group-sessions/*`, `features/study-group-sessions/*` | `StudyGroupSessionsModule` | `StudyGroupsModule`, `requestMf3Json` | `GET/POST /api/study-groups/:groupId/sessions` | Membership e validação temporal | Unit e contrato MF3 | `BK-MF3-08`, `BK-MF3-12` |
| `BK-MF3-08` | `study-group-ai/*`, `features/study-group-ai/*` | `StudyGroupAiModule` | `AiModule`, `StudyGroupsModule`, `StudyRoomsModule` | `POST /api/study-groups/:groupId/group-ai/questions` | Membership, fontes partilhadas e bloqueio sem fontes | Unit e contrato MF3 | `BK-MF3-09` |
| `BK-MF3-09` | `unified-search/*`, `features/unified-search/*` | `UnifiedSearchModule` | `MaterialIndexModule`, `requestMf3Json` | `POST /api/search` | Sessão e filtro por jobs autorizados | Unit e contrato MF3 | `BK-MF3-10` |
| `BK-MF3-10` | `curriculum-navigation/*`, `features/curriculum-navigation/*` | `CurriculumNavigationModule` | `MaterialIndexModule`, `requestMf3Json` | `POST /api/curriculum/navigation` | Sessão e visibilidade autorizada de jobs | Unit e contrato MF3 | `BK-MF3-11` |
| `BK-MF3-11` | `notification-preferences/*`, `features/notification-preferences/*` | `NotificationPreferencesModule`, `NotificationPreferencesService` | `SessionGuard`, `requestMf3Json` | `GET/PUT /api/notification-preferences` | Sessão, `userId` do backend e preferência por contexto | Unit e contrato MF3 | `BK-MF3-12`, `BK-MF4-01` |
| `BK-MF3-12` | `study-alerts/*`, `features/study-alerts/*` | `StudyAlertsModule` | `StudyModule`, `StudyGroupSessionsModule`, `NotificationPreferencesModule` | `GET /api/study-alerts` | Sessão, role aluno, preferências in-app | Unit e contrato MF3 | `BK-MF4-01` |

## Decisões técnicas confirmadas
- `CANONICO`: a MF3 cobre `RF37` a `RF48`, com 12 BKs e sequência `BK-MF3-01` a `BK-MF3-12`.
- `CANONICO`: a MF3 pertence à janela `S06-S07` e ao foco operacional `MF3/MF4` no gate `S08`.
- `CANONICO`: ownership, membership, role e permissões são validados no backend; o frontend não decide acesso.
- `CANONICO`: IA privada, IA de grupo/sala e IA de turma/disciplina mantêm contextos separados.
- `DERIVADO`: `requestMf3Json` é um helper frontend comum para reduzir duplicação e garantir `credentials: "include"` sem guardar tokens no browser.
- `DERIVADO`: endpoints MF3 usam prefixo `/api` para alinhar com a implementação real.
- `DERIVADO`: se a equipa quiser `200 OK` em `POST /api/search` e `POST /api/curriculum/navigation`, deve introduzir `@HttpCode(200)` no backend; sem essa decisão, o comportamento Nest validado é `201 Created`.

## Decisões de domínio confirmadas
- A IA não deve responder sem fontes processáveis suficientes quando o BK exige grounding.
- Conhecimento externo em `BK-MF3-03` é limitado, opcional e separado das citações internas; não promete navegação web, RAG novo, OCR ou indexação automática adicional.
- Grupos de estudo são derivados das salas/membership herdadas de MF1 e não substituem turmas oficiais.
- Preferências de email/push/app da MF3 representam configuração e alertas in-app; não comprovam entrega real por email ou push.
- Alertas da MF3 derivam de rotinas, objetivos e sessões, sem inventar canal externo.

## Coerência global da MF
A MF3 está coerente com a MF anterior porque reutiliza `AiModule`, `AI_PROVIDER`, `StudyAreasService`, `MaterialsService`, `MaterialIndexService`, `StudyRoomsService`, `SubjectsService`, `ClassAiModule` e contratos de sessão/cookies da MF0-MF2.

A MF3 fica parcialmente coerente internamente: 10 BKs estão prontos para aluno seguir sem adivinhar peças em falta; `BK-MF3-09` e `BK-MF3-10` precisam de alinhar o expected result HTTP com o contrato real.

A MF3 prepara a MF4 com preferências e alertas internos. O risco está no lado de MF4: `BK-MF4-01` ainda não consome explicitamente esse handoff e mantém formato antigo.

## Drift documental encontrado
- `BK-MF3-09` e `BK-MF3-10` documentam `200 OK` para endpoints `POST`, mas a implementação e os testes de contrato validam `201 Created`.
- `BK-MF4-01` declara dependência canónica `BK-MF1-12`, mas o handoff real de notificações também deve considerar `BK-MF3-11` e `BK-MF3-12`.

## Verificações executadas
### Pesquisa obrigatória nos BKs MF3
Comando executado:

`rg -n 'hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token' docs/planificacao/guias-bk/MF3/*.md`

Resultado: encontrou ocorrências de `localStorage` em todos os BKs MF3, classificadas como `FINDING_DESCARTADO`, porque são avisos negativos explícitos para não guardar tokens no browser.

### Pesquisa estática em `real_dev`
- Endpoints MF3 reais confirmados em controllers Nest.
- Módulos MF3 confirmados em `real_dev/api/src/app.module.ts`.
- Clientes frontend MF3 usam `requestMf3Json` e `credentials: "include"`.
- Não foram encontradas ocorrências relevantes de `payload: unknown`, `as any`, `CurrentUser`, `current-user`, `supertest`, token em `localStorage` ou sessão em `sessionStorage` nos módulos MF3 auditados.

### `git diff --check`
Resultado: OK, sem saída.

### `bash scripts/validate-planificacao.sh`
Resultado: OK.

Resumo do validador, revalidado na atualização documental de `2026-06-29`:
- `overall_pass`: `true`
- `score.total`: `100`
- `drift_critical_count`: `0`
- `rf_docs`: `57`
- `rnf_docs`: `45`
- `guide_bk`: `102`

## Bloqueios e TODOs restantes
- `TODO`: corrigir `BK-MF3-09` e `BK-MF3-10` para alinhar expected results com `201 Created`, ou decidir tecnicamente introduzir `@HttpCode(200)` nos controllers reais.
- `TODO`: quando MF4 entrar em auditoria/correção, actualizar `BK-MF4-01` para consumir explicitamente o handoff de `BK-MF3-11` e `BK-MF3-12`.
- Sem `TODO (BLOCKER)` documental: os documentos obrigatórios existem e foram consultados.

## Resumo executivo
- MF processada: `MF3`.
- BKs analisados: `12`.
- Contagem antes registada no relatório anterior: `12 OK`, `0 PARCIAL`, `0 CRITICO`.
- Contagem depois desta auditoria: `10 OK`, `2 PARCIAL`, `0 CRITICO`.
- BKs editados: `0`, por `MODO=auditar_apenas`.
- Relatório editado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`.
- Principais lacunas corrigidas: nenhuma, porque a execução foi apenas auditoria.
- Principais lacunas encontradas: expected results HTTP desalinhados em `BK-MF3-09` e `BK-MF3-10`; handoff MF3 -> MF4 ainda incompleto no guia seguinte.
- Decisões técnicas confirmadas: módulos MF3, endpoints `/api`, `SessionGuard`, helper `requestMf3Json`, membership/ownership no backend, bloqueio sem fontes quando aplicável.
- Decisões de domínio confirmadas: separação de IA privada/grupo/turma, citações obrigatórias quando há grounding, conhecimento externo limitado, alertas in-app sem prometer entrega real email/push.
- Decisões marcadas como `DERIVADO`: helper `requestMf3Json`, endpoints técnicos MF3 e escolha entre `201 Created` real versus eventual `@HttpCode(200)`.
- Drift documental encontrado: statuses HTTP de `BK-MF3-09`/`BK-MF3-10` e dependências MF4 não reflectidas em `BK-MF4-01`.
- Riscos restantes: evidência de validação errada para dois BKs; MF4 pode não consumir preferências/alertas MF3 se não for corrigida depois.
- Coerência MF anterior -> MF3 -> MF seguinte: coerente de MF2 para MF3; parcialmente coerente dentro da MF3 por dois expected results; handoff para MF4 exige revisão futura.
- Verificações textuais executadas: pesquisa obrigatória, pesquisa estática em `real_dev`, `git diff --check`, `bash scripts/validate-planificacao.sh`.
- Resultado de `git diff --check`: OK, sem saída.
- Resultado de `bash scripts/validate-planificacao.sh`: OK, `overall_pass=true`, score `100`.
- Bloqueios ou TODOs restantes: nenhum blocker documental; 2 TODOs de correção futura.

## Changelog
- `2026-06-16`: execução em modo `auditar_apenas`; 12 BKs analisados, 0 BKs editados, relatório actualizado para `10 OK / 2 PARCIAL / 0 CRITICO`.
