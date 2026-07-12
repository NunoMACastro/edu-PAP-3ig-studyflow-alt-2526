# Relatório de implementação — paridade Professor → Aluno

**Data:** 11 de julho de 2026

**Raiz implementada:** `real_dev/api` e `real_dev/web`

**Baseline:** `docs/AUDITORIA-PARIDADE-PROFESSOR-ALUNO-2026-07-11.md`

**Estado:** implementação concluída; gates finais registados na secção 10

## 1. Resultado

Foi implementada a cadeia end-to-end entre as ações docentes e a experiência do aluno para
turmas, disciplinas, salas guiadas, Centro de Acompanhamento, voz da IA, projetos, testes,
conteúdo IA aprovado, materiais oficiais e notificações.

A alteração não transforma estudo autónomo em atividade supervisionada. O aluno continua a
poder usar o StudyFlow sem turma; quando pertence a uma ou mais turmas, o conteúdo oficial é
derivado de memberships próprios e nunca de texto livre no perfil.

As salas colaborativas mantêm-se deliberadamente independentes do domínio académico oficial:
`disciplineName` é uma etiqueta textual. Apenas salas guiadas criadas pelo professor podem ter
`subjectId`, materiais/teste oficiais e voz docente herdada.

## 2. Decisões de domínio aplicadas

| Decisão | Contrato implementado |
| --- | --- |
| Fonte da inscrição | `ClassMembership`, com `ACTIVE`/`REMOVED`, `joinedAt`, `joinedBy`, `removedAt` e `removedBy` |
| Número de turmas | O aluno pode estar em várias turmas oficiais |
| Estudo sem turma | Continua disponível; `profile.className` foi retirado dos contratos |
| Lifecycle académico | Turmas/disciplinas suportam edição, arquivo e restauro |
| Histórico arquivado | Visível ao aluno em modo read-only |
| Cascata de arquivo | Fecha salas guiadas `OPEN` e testes `PUBLISHED`; restauro não reabre |
| Inatividade | Só atividade oficial da turma; baseline no `joinedAt` do membership |
| Teste usado por sala | Fecho bloqueado enquanto uma sala aberta depender do teste |
| Projeto | Rascunho editável, publicação explícita, disciplina opcional e prazo |
| Voz da IA | Herança disciplina → turma → default; aluno recebe apenas `teacherVoiceApplied` |
| Notificações | Apenas in-app; estado lido/arquivado, outbox e retry |
| Salas colaborativas | Etiqueta textual, sem associação automática a disciplina oficial |

## 3. Backend e persistência

### 3.1 Turmas, memberships e disciplinas

- Foi criado o modelo `ClassMembership` como fonte normalizada da relação aluno/turma.
- Durante a transição, leitura e escrita mantêm compatibilidade com `SchoolClass.studentIds`;
  novos fluxos usam o membership como contrato canónico.
- A adição/remoção de aluno mantém estado e auditoria sem apagar o histórico.
- `PATCH /api/teacher/classes/:classId` edita uma turma ativa.
- `PATCH /api/teacher/classes/:classId/status` arquiva/restaura a turma.
- `PATCH /api/teacher/classes/:classId/subjects/:subjectId` edita uma disciplina ativa.
- `PATCH /api/teacher/classes/:classId/subjects/:subjectId/status` arquiva/restaura a disciplina.
- `GET /api/student/classes?status=ACTIVE|ARCHIVED` devolve uma projeção minimizada, sem IDs de
  colegas.
- `GET /api/student/classes/:classId/subjects?status=ACTIVE|ARCHIVED` inclui descrição, estado e
  indicação read-only derivada também do estado da turma.

Arquivo de turma/disciplina e alterações de membership emitem eventos de notificação. As
operações académicas críticas usam transação MongoDB, incluindo a cascata de fecho dependente.
A remoção confirma `ClassMembership`, o array de compatibilidade e o evento
`CLASS_MEMBERSHIP_REMOVED` na mesma transação; se a outbox falhar, toda a remoção reverte.
`SchoolClass` e `Subject` mantêm ainda um fence monotónico: cada mutação descendente toca o pai
na mesma transação. Se um archive ganhar a corrida, a criação/publicação falha como read-only;
se a mutação filha ganhar, o archive seguinte vê-a e aplica a cascata.

### 3.2 Atividade oficial e Centro de Acompanhamento

Foram introduzidos:

- `ClassLearningActivity`, log factual append-only por turma/aluno/tipo;
- `StudentClassActivityState`, projeção da primeira/última atividade e contagens;
- `GET /api/follow-up-centre/classes/:classId/students/:studentId`, detalhe individual
  consolidado e autorizado.

O centro agrega:

- data de entrada, primeira/última atividade e cronologia recente;
- contagens por tipo e comparação factual dos últimos 30 dias com os 30 anteriores;
- participação e conclusão em salas guiadas;
- melhor tentativa em cada teste oficial, segundo `BEST_ATTEMPT`;
- tentativas persistidas de quizzes IA aprovados;
- sinais factuais explicáveis, sem score de risco inferido.

Eventos de áreas privadas, rotinas privadas, estudo autónomo e salas colaborativas não contam
para inatividade docente.

Evento factual e projeção do Centro confirmam ou abortam na mesma transação. No detalhe, salas
fechadas antes da adesão não entram no denominador do novo aluno; salas ainda abertas ou
encerradas durante a sua membership continuam contabilizadas.

### 3.3 Salas guiadas e mini-testes

- `GET /api/student/guided-study-rooms` agrega salas de todas as turmas, com filtro de estado e
  paginação.
- O detalhe discente inclui `myParticipation` mesmo quando a sala está fechada.
- O histórico IA próprio suporta cursor e paginação completa.
- A duração prevista não é inferida do estado da participação.
- Fechar um teste verifica dependências de salas abertas.
- Criar/reabrir uma sala grava, na mesma transação, a reserva da dependência do teste. Este
  fence impede a corrida em que o teste fecha entre a validação e a abertura da sala.
- Listagens discentes de testes devolvem `latestAttempt`, `attemptsRemaining`, `canSubmit` e
  `blockedReason`, evitando um pedido N+1 por teste e divergências após fecho.
- O filtro opcional de turma no agregador é aplicado no backend antes do cursor; uma página com
  salas de outras turmas já não produz falsos vazios na rota de uma turma concreta.
- Contratos de lista/detalhe do aluno omitem `teacherId`; o histórico Guided AI omite também
  `studentId` e email na vista do próprio aluno, mantendo-os apenas na supervisão docente.

### 3.4 Projetos, materiais e conteúdo IA aprovado

- Projetos suportam criação `DRAFT`, edição do rascunho e publicação idempotente por
  `POST /api/teacher/classes/:classId/projects/:projectId/publish`.
- `subjectId` é opcional mas, quando presente, tem de pertencer à turma. `dueDate` é validado.
- O aluno recebe apenas projetos publicados e uma projeção sem identificador interno do
  professor; entidades arquivadas ficam read-only.
- Class AI, Guided AI e Project AI expõem históricos próprios paginados.
- A transparência da voz foi uniformizada para `teacherVoiceApplied: boolean` no contrato do
  aluno.
- O catálogo de materiais oficiais do aluno é paginado e minimizado.
- Restaurar uma versão atualiza atomicamente a versão ativa e a projeção efetivamente usada
  pelo catálogo, contextos oficiais e IA.
- Estrutura e versões derivadas de jobs revalidam o papel atual e o lifecycle; um ID que antes
  pertenceu a professor/aluno não conserva permissões depois de uma mudança de role.
- `ApprovedAiQuizAttempt` persiste as tentativas do aluno, disponibiliza histórico próprio e
  não duplica a chave de correção no documento de tentativa.
- Leituras de Class AI, Guided AI, Project AI, conteúdo aprovado e chat usam autorização
  histórica; as mutações correspondentes continuam a exigir turma/disciplina ativa.

### 3.5 Notificações in-app

O subsistema passou a separar evento, entrega e estado do destinatário:

- `NotificationOutboxEvent`: evento durável e idempotente;
- `ContextNotification`: mensagem pública minimizada;
- `ContextNotificationRecipient`: `readAt`, `archivedAt` e estado por destinatário.

Endpoints principais:

- `GET /api/context-notifications/inbox?cursor=&limit=&unreadOnly=`;
- `GET /api/context-notifications/sent`;
- `PATCH /api/context-notifications/:id/read`;
- `PATCH /api/context-notifications/:id/archive`;
- `POST /api/context-notifications/read-all`;
- `GET/PUT /api/notification-preferences`.

O worker usa lease, retries e backoff. Uma falha esgotada continua persistida e gera auditoria;
não é engolida como sucesso. Antes da entrega, o snapshot é intersectado com as memberships
ativas atuais, impedindo que uma remoção concorrente deixe chegar eventos académicos ao
ex-aluno. `CLASS_MEMBERSHIP_REMOVED` só é entregue enquanto o aluno continuar ausente; se for
readicionado antes de o worker processar o evento antigo, esse evento é descartado. Os contextos
distinguem acompanhamento, atualizações de turma,
conteúdo de aprendizagem e avaliação. Email e push não aparecem na UI e são rejeitados com
erro de validação pelo backend.

As mutações que originam eventos automáticos — disciplina, publicação, material, projeto,
decisão de conteúdo IA, lifecycle académico, teste e sala guiada — propagam a mesma sessão
MongoDB até à outbox. Os testes de replica set forçam falhas depois da escrita do evento e
provam rollback do domínio e da outbox.

O endpoint manual aceita apenas `NEW_MATERIAL`, `FEEDBACK` e `TASK`; `FOLLOW_UP` é dirigido
apenas pelo Centro. Tipos de lifecycle/publicação não podem ser fabricados pelo cliente. Quotas
anti-spam aplicam-se a criação manual, não descartam eventos automáticos; estes continuam a
respeitar canal e preferência. O `FOLLOW_UP` dirigido reserva o fence da turma e confirma
envelope, destinatários e auditoria na mesma transação; um arquivo concorrente ganha antes da
entrega ou espera pelo commit. Uma remoção atrasada só é entregue se o aluno continuar removido.

Eventos automáticos foram limitados a alterações de disponibilidade/estado: membership,
arquivo/restauro, publicação de post/projeto/teste, material disponibilizado, decisão de
conteúdo IA e abertura/reabertura/fecho de sala guiada.

## 4. Frontend do aluno

Foram atualizadas as seguintes superfícies:

- dashboard autónomo com zero, uma ou várias turmas oficiais;
- turmas e disciplinas com separação Ativas/Arquivo, descrição e read-only;
- agregador global de salas guiadas e descoberta distinta de “Salas colaborativas”;
- participação reidratada, duração explícita e “Carregar mais” no histórico IA;
- catálogo/detalhe de materiais oficiais seguros;
- projetos publicados, disciplina/prazo e consent gate da IA;
- mini-testes sem N+1 e mensagens explícitas para estados bloqueados;
- conteúdos IA aprovados e histórico de tentativas próprias;
- um único `NotificationProvider`, polling apenas com página visível, refresh no focus,
  contador de não lidas, leitura e arquivo;
- estados `loading`, `error`, `empty` e retry separados nas páginas cross-role;
- nomenclatura consistente “Centro de Acompanhamento”.

Todos os payloads novos passam por validação runtime. Respostas estruturalmente inválidas
falham com `API_RESPONSE_INVALID` em vez de serem apresentadas como listas vazias.

## 5. Frontend do professor

- gestão de turmas e disciplinas com edição, arquivo, restauro e confirmação;
- histórico arquivado separado do trabalho ativo;
- projetos com editor de rascunho, disciplina opcional, prazo e publicação explícita;
- salas guiadas com dependências coerentes e estados fechados explicados;
- Centro de Acompanhamento com filtro por turma/aluno, regras de inatividade e painel factual
  individual;
- preferências e criação de notificações apenas para o canal suportado in-app;
- voz docente continua editável apenas pelo professor e nunca é serializada integralmente para
  o aluno.

## 6. Segurança, privacidade e autorização

- Todos os endpoints mantêm `SessionGuard`, role e validação de ownership/membership no service.
- Projeções do aluno removem `studentIds`, `teacherId`, regras internas da voz e dados de outros
  alunos.
- Ranking global e notas pedagógicas continuam exclusivos do professor.
- A atividade do Centro é class-scoped e não reutiliza telemetria de estudo privado.
- O `PersonalDataRegistry` inclui memberships, atividade, tentativas IA e notificações.
- O export RGPD omite defensivamente `voiceSource`, `voiceTone`, `voiceDetailLevel` e
  `voiceRulesApplied` em Class AI, Guided AI e Project AI, incluindo documentos legados;
  mantém-se apenas a transparência pública `teacherVoiceApplied` nos DTOs do produto.
- Contextos oficiais de materiais são projeções puras de leitura: um GET do aluno não grava nem
  sobrescreve identidade num documento partilhado e a vista discente omite IDs de aluno/professor.
- Eliminação aplica `DELETE`, `PULL_MEMBERSHIP` ou anonimização conforme o modelo; destinatários
  de notificações não ficam órfãos.
- Logs da migração e do worker não incluem conteúdo, email, prompt, resposta IA ou IDs pessoais.

## 7. Migração de dados

Scripts disponíveis em `real_dev/api`:

```bash
npm run migrate:student-teacher-parity:dry-run
npm run migrate:student-teacher-parity
```

O marker é `2026-07-11-student-teacher-parity-v2`. O runner é idempotente e transacional e:

1. inicializa lifecycle de turmas e disciplinas;
2. cria memberships a partir das inscrições legadas;
3. remove `profile.className`;
4. inicializa versão ativa/projeção de materiais;
5. associa projetos a disciplina apenas por match exato inequívoco;
6. migra estado de leitura das notificações legadas;
7. fecha combinações legadas sala aberta/teste fechado;
8. deriva atividade oficial a partir de históricos oficiais existentes, nunca de
   `StudyEvent` privado;
9. inicializa os fences de lifecycle e remove `studentId` de contextos oficiais legados.

O procedimento operacional e rollback estão documentados em
`real_dev/docs/ops/LOCAL-PAP-RUNBOOK.md`.

## 8. Fecho dos findings PA-001 a PA-019

| Finding | Estado | Evidência de correção |
| --- | --- | --- |
| PA-001 | Corrigido | Dashboard usa memberships oficiais múltiplos; `profile.className` removido |
| PA-002 | Corrigido | `/api/ai-consents/capabilities` e gate reutilizável para CURRENT/OUTDATED/MISSING |
| PA-003 | Corrigido | Atividade oficial class-scoped e baseline `joinedAt` |
| PA-004 | Corrigido | Invariante e fence transacional teste ↔ sala guiada |
| PA-005 | Corrigido | Editar rascunho e publicar projeto explicitamente |
| PA-006 | Corrigido | Restore atualiza versão ativa e projeção consumida |
| PA-007 | Corrigido | Provider único, polling/focus, lido/arquivo e unread count |
| PA-008 | Corrigido | Taxonomia própria, apenas in-app, outbox/retry e matriz de eventos |
| PA-009 | Corrigido | Detalhe factual consolidado no Centro, incluindo quizzes persistidos |
| PA-010 | Corrigido | PATCH de edição e status para turmas/disciplinas, com histórico |
| PA-011 | Corrigido | `myParticipation` no detalhe aberto/fechado |
| PA-012 | Corrigido | DTO discente minimizado, sem IDs dos colegas |
| PA-013 | Resolvido por decisão | UI/docs deixam explícita a independência das salas colaborativas |
| PA-014 | Corrigido | Históricos próprios paginados e booleano uniforme da voz |
| PA-015 | Corrigido | Estados assíncronos explícitos, retry e validação runtime |
| PA-016 | Corrigido | Estado de submissão calculado num único resumo do teste |
| PA-017 | Corrigido | Cursor e “Carregar mais” no histórico IA guiado |
| PA-018 | Corrigido | Descrição apresentada na disciplina do aluno |
| PA-019 | Corrigido | Nome uniforme e agregador global de salas guiadas |

## 9. Alterações documentais

Foram alinhados os requisitos funcionais, os guias BK relevantes de MF1/MF2/MF3/MF4, os
relatórios privados de implementação, este relatório e o runbook. O mapa técnico e o inventário
de funções são regenerados a partir do código e validados pelos respetivos gates.

## 10. Validação final

Esta secção é preenchida apenas com comandos efetivamente executados no checkout final.

| Gate | Resultado |
| --- | --- |
| API — unit/integration | PASS — 138 suites, 751 testes, em 4 shards sequenciais |
| API — regressão final notificações/fences | PASS — 8 suites, 59 testes |
| API — build | PASS |
| Migração — testes | PASS — 2 suites, 6 testes |
| Web — componentes/contratos | PASS — 42 ficheiros, 197 testes |
| Web — build | PASS |
| Web — bundle budgets | PASS — entry 82,74 KiB; primeira rota 96,37 KiB; percurso aluno 162,34 KiB; professor 156,95 KiB; admin 96,46 KiB |
| Playwright E2E cross-browser | PASS — 40/40: Chromium 30, Firefox crítico 5, WebKit crítico 5 |
| Mapa técnico/inventário/docs | PASS — 107 BK sincronizados, score canónico 100, geradores byte-for-byte |
| Manifesto `real_dev` | PASS — 785 ficheiros, SHA-256 `2cbe995d898da311dfd9626c2d624574abc082c2b3f078fedc5a3c628453ab05` |
| Secrets/trailing whitespace | PASS |
| Inspeção visual autenticada | PASS — professor/aluno, dados vazios e populados, 375×812 e 1440×900, sem overflow nem erros de consola |

A suite responsiva cobriu também `320×720`, `360×780`, `390×844` e `768×1024`. Os smokes
de acessibilidade não encontraram violações Axe `serious`/`critical`. A inspeção manual criou
turma e disciplina, associou o aluno e confirmou Centro de Acompanhamento, voz IA, inbox,
projeções discentes e a separação entre salas guiadas e salas de estudo autónomas.

```text
UI_GUIDELINES_READ: sim
UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md
UI_COMPLIANCE: PASS
UI_DEVIATIONS: nenhuma
UI_VALIDATION: 42 ficheiros/197 testes web; build e bundle PASS; Playwright 40/40 Chromium/Firefox/WebKit; Axe sem serious/critical; browser autenticado professor/aluno em 375x812 e 1440x900, sem overflow nem erros de consola
```

## 11. Limites intencionais

- Não existem email nem push nesta fase.
- Salas colaborativas não são convertidas em salas oficiais.
- O aluno não vê regras, tom ou texto da voz docente.
- O Centro não infere diagnóstico, risco ou intenção; apresenta factos verificáveis.
- Restaurar turma/disciplina não reabre automaticamente recursos fechados.
- Histórico arquivado é consultável, mas não reativa ações de aprendizagem.
