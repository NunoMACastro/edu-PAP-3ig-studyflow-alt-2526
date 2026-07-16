# Migração do Assistente de estudo conversacional — relatório de implementação

Data: 13/07/2026

Âmbito: `STUDENT`

Estado: **implementado e validado em `real_dev`**

Deploy/migração de dados reais: **não executados**

## 1. Resultado global

Foi implementada uma camada conversacional global e contextual sobre os cinco
domínios de IA existentes, sem substituir os respetivos serviços, finalidades de
consentimento, scopes de quota, fontes, voz docente ou validações de output.

O aluno dispõe agora de:

- launcher global apenas dentro de `StudentShell`;
- drawer desktop não modal e bottom sheet/fullscreen mobile;
- seleção segura de contexto em páginas neutras;
- retoma automática da conversa mais recente em páginas contextuais;
- página completa com histórico agrupado por contexto;
- criação, renomeação, arquivo, restauro e eliminação de conversas;
- histórico read-only e citações sem links quando o acesso terminou;
- memória limitada aos seis turnos completos mais recentes da mesma conversa.

Professor e administrador não receberam launcher, novas rotas de navegação ou
alterações de shell. Os endpoints e serviços especializados legacy foram mantidos.

## 2. Arquitetura implementada

### 2.1 Fronteira governada

`GovernedAiExecutionService` continua a ser a única fronteira de acesso ao provider.
Foi estendido de forma retrocompatível com `conversationTurns` opcionais. Os call
sites que não enviam histórico preservam o comportamento anterior.

A composição conversacional aplica:

- máximo de seis pares completos pergunta/resposta;
- budget `min(3000, floor(maxPromptChars * 0.30))`;
- seleção dos turnos mais recentes e reordenação cronológica;
- exclusão de um par completo quando não cabe, sem truncar semanticamente respostas;
- prioridade das fontes, instruções do domínio, pergunta atual e contexto pedagógico;
- delimitação explícita do diálogo anterior como conteúdo não confiável;
- guardrails sobre a pergunta atual e perguntas históricas incluídas;
- validação final de `maxPromptChars` e do output pelo domínio original.

Não foi introduzida injeção de provider, SDK direto, streaming, memória paralela ou
resumo oculto de conversa.

### 2.2 Módulo unificador

O módulo `student-ai-assistant` contém:

- controller público exclusivo de aluno;
- fachada de conversas e mensagens;
- resolvedor backend dos cinco contextos;
- despacho interno para `class-ai`, `private-area-ai`, `study-group-ai`,
  `study-rooms` e `guided-study-rooms`;
- normalização de conversas, turnos e citações;
- lifecycle de drafts, lease de resposta e política de eliminação.

Os adaptadores delegam nos serviços de domínio existentes. Perguntas e respostas
continuam guardadas nos cinco modelos especializados; a conversa apenas as organiza
através de `conversationId`.

### 2.3 Contextos e finalidades preservados

| Contexto | Finalidade | Serviço especializado |
|---|---|---|
| `SUBJECT` | `CLASS_AI` | `ClassAiService` |
| `STUDY_AREA` | `PRIVATE_AREA_AI` | `PrivateAreaAiService` |
| `STUDY_GROUP` | `GROUP_AI` | `StudyGroupAiService` |
| `STUDY_ROOM` | `ROOM_AI` | `RoomAiService` |
| `GUIDED_ROOM` | `CLASS_AI` | `GuidedStudyRoomAiService` |

O scope de quota continua a ser escolhido no serviço especializado. A nova camada
não aceita finalidade, modelo, fontes, jobs, labels ou paths fornecidos pelo cliente.

## 3. Persistência e integridade

Foi adicionada a coleção `student_ai_conversations` com:

- ownership por aluno e contexto imutável;
- estados `DRAFT`, `ACTIVE`, `ARCHIVED` e `DELETED_RETAINED`;
- origens `NATIVE`, `LEGACY_MIGRATION` e `LEGACY_API`;
- snapshots seguros de labels do contexto;
- título inicial `Nova conversa` e derivação determinística da primeira pergunta;
- TTL de 24 horas apenas para drafts vazios;
- índices de listagem por aluno, contexto, estado e atividade;
- índice parcial único para `legacyGroupKey`;
- lease atómico de resposta com recuperação após expiração.

Os cinco modelos de interação receberam campos opcionais retrocompatíveis:

```ts
conversationId?: ObjectId;
citationSnapshots?: StudentAiCitationSnapshot[];
migrationRunId?: string;
```

A promoção da primeira resposta usa uma transição atómica validada
`DRAFT -> ACTIVE`. A API falha de forma controlada se a conversa desaparecer em vez
de devolver uma resposta ligada a um draft inconsistente.

As leituras autenticadas do Assistente usam `Cache-Control: private, no-store` e
`fetch(..., { cache: "no-store" })`, evitando histórico ou estado de draft obsoleto
no browser.

## 4. Contratos HTTP adicionados

Base: `/api/student/assistant`

- `GET /contexts`
- `GET /contexts/:kind/:contextId`
- `GET /conversations`
- `POST /conversations`
- `GET /conversations/:conversationId`
- `PATCH /conversations/:conversationId`
- `DELETE /conversations/:conversationId`
- `GET /conversations/:conversationId/messages`
- `POST /conversations/:conversationId/messages`
- `GET /conversations/:conversationId/artifact-setup`
- `GET /conversations/:conversationId/artifact-targets`
- `GET /conversations/:conversationId/artifacts`
- `POST /conversations/:conversationId/artifacts`
- `GET /conversations/:conversationId/artifact-jobs`
- `GET /conversations/:conversationId/artifact-jobs/:jobId`

Arquivo privado: `/api/student/study-materials`

- `GET /`
- `GET /:artifactId`
- `DELETE /:artifactId`
- `GET /:artifactId/export`
- `POST /:artifactId/quiz-attempts`

Foram implementados cursores opacos, limites 20/50, histórico inicial de 30 turnos,
ordenação estável, filtro de arquivo e revalidação de acesso. A listagem resolve os
contextos autorizados numa passagem bulk e evita uma resolução N+1 por conversa.

Os códigos públicos adicionados incluem:

- `ASSISTANT_CONTEXT_INVALID`
- `ASSISTANT_CONTEXT_FORBIDDEN`
- `ASSISTANT_CONVERSATION_NOT_FOUND`
- `ASSISTANT_CONVERSATION_READ_ONLY`
- `ASSISTANT_CONVERSATION_ARCHIVED`
- `ASSISTANT_REPLY_IN_PROGRESS`

Os erros existentes de consentimento, política, quota, guardrails, fontes, provider
e estado da sala continuam a atravessar a fachada sem perder o respetivo contrato.

## 5. Autorização, privacidade e auditoria

- Ownership/membership é revalidado em cada operação e execução.
- Uma conversa de outro aluno devolve `404`.
- `contextKind`, `contextId` e `studentId` não são editáveis.
- O DTO de update aceita apenas `title` e `status`; propriedades adicionais são
  rejeitadas pelo `ValidationPipe` global.
- Conversa própria não concede acesso renovado às fontes.
- Com acesso revogado, são devolvidas apenas perguntas, respostas próprias e labels
  históricos; citações deixam de ter `targetPath`.
- Conversas, snapshots de citações e auditoria não guardam jobs, filesystem paths,
  metadata de indexação, respostas corretas ou paths de navegação.
- O snapshot dos quizzes assíncronos guarda transitoriamente os últimos seis turnos
  e as fontes autorizadas exatas do pedido. Tem TTL de sete dias enquanto o job pode
  estar pendente e é reduzido para 24 horas depois de um estado terminal.
- Logs do Assistente contêm IDs, contexto, finalidade implícita, resultado e
  contagens minimizadas; não contêm perguntas, respostas, títulos livres ou prompts.
- Criação, alteração, envio, falha, eliminação, retenção e acesso negado são auditados.
- `StudentAiConversation`, convites de fork e snapshots transitórios de geração foram
  registados no inventário de dados pessoais, exportação, eliminação e teste de
  cobertura do registry.
- A versão do registry foi atualizada para `2026-07-13.2`.

O ano escolar continua a ser lido apenas pelo executor quando
`pedagogicalContext: "STUDENT_PROFILE"` está ativo. Não é persistido nas interações,
conversas ou logs de IA.

## 6. Eliminação e retenção

- Disciplina, área pessoal e grupo: turnos exclusivamente privados são eliminados.
- Sala partilhada: respostas `SHARED` e interações referenciadas por forks são
  preservadas; a conversa torna-se `DELETED_RETAINED` e sai das listagens.
- Sala guiada: interações supervisionadas são preservadas e a conversa desaparece
  da interface do aluno.
- A resposta de eliminação indica contagem retida e razões `SHARED`,
  `FORK_REFERENCE` ou `SUPERVISED`.

Não foram alteradas as regras docentes existentes nem exposto ao professor o título
privado da conversa.

## 7. Migração legacy

Foram adicionados os comandos:

```bash
npm run migrate:student-ai-conversations:dry-run
npm run migrate:student-ai-conversations
npm run migrate:student-ai-conversations:rollback -- <runId>
```

Características implementadas:

- dry-run por defeito no CLI;
- `--apply` obrigatório para escrita;
- rollback limitado a `migrationRunId`;
- cursores com batches de 100;
- agrupamento determinístico por aluno, contexto e ID;
- upsert idempotente por `legacyGroupKey`;
- retoma segura depois de execução parcial;
- associação aditiva sem apagar campos ou coleções legacy;
- reconstrução de labels de citações quando a fonte existe;
- fallback genérico sem inventar nomes quando a fonte já não é resolúvel;
- logs apenas com contagens de alunos, contextos, conversas, interações e
  inconsistências.

### 7.1 Prova em base isolada

| Operação | Alunos | Conversas | Interações | Resultado |
|---|---:|---:|---:|---|
| Dry-run | 1 | 1 | 2 | sem escrita |
| Apply | 1 | 1 | 2 | associação criada |
| Segundo apply | 0 | 0 | 0 | idempotente |
| Rollback do `runId` | 1 | 1 | 2 | estado legacy restaurado |

Foi também verificada a recuperação do label `Guia de normalização` a partir de
material oficial. Nenhuma migração foi aplicada à base de desenvolvimento corrente
ou a dados reais.

## 8. Compatibilidade preservada

Os endpoints legacy continuam disponíveis e com DTOs públicos inalterados. Escritas
legacy criam/reutilizam internamente conversas `LEGACY_API` e persistem o
`conversationId` apenas no backend.

As tabs visíveis de IA foram removidas dos workspaces do aluno. Os bookmarks antigos
encaminham para a página completa contextual:

- `/app/disciplinas/:subjectId/ia`
- `/app/areas/:studyAreaId/ia-privada`
- `/app/grupos/:groupId/assistente`
- `/app/salas/:roomId/ia`

Parâmetros e hash relevantes são preservados. Não foi criada uma quinta entrada na
navegação principal.

## 9. Frontend e acessibilidade

Foram criados componentes partilhados para resolução de contexto, seleção, conversa,
launcher e página completa. Drawer e página usam os mesmos contratos e componentes.

Validações efetuadas:

- launcher existe apenas para `STUDENT`;
- launcher não aparece na página dedicada nem quando o drawer está aberto;
- contexto inferido das cinco famílias de rotas;
- launcher contextual oferece `Nova conversa` sem mudar o contexto da conversa;
- desktop: `role="dialog"` não modal, `Escape` e restituição de foco;
- mobile: modal, scroll lock, focus trap, safe area, bottom navigation e fullscreen
  nos viewports pequenos;
- pergunta preservada após erro, submissão única, região de status e retry manual;
- sem streaming ou animação artificial de escrita;
- grupos de histórico usam `contextKind + contextId`, evitando fusão por labels iguais;
- touch targets mínimos e `prefers-reduced-motion` preservados pelas primitives.
- ação de materiais nos cinco contextos quando a capability backend o permite, com
  painel lazy, consentimento por tipo e destino derivado ou validado no servidor;
- arquivo privado transversal em `Estudar`, com vistas filtradas por disciplina e
  turma, sem conceder acesso a professores ou colegas;
- cards persistentes combinados cronologicamente com os turnos;
- recuperação de jobs de quiz, retry explícito e deep link autorizado para `Praticar`.

## 10. Seeds

Os seeds determinísticos incluem:

- conversas nativas nos cinco contextos;
- duas conversas na mesma disciplina;
- conversa arquivada;
- contexto com acesso terminado;
- resposta de sala ligada a conversa e fixture legacy sem `conversationId`;
- sala guiada e conteúdo longo para QA responsivo.
- artefactos associados a conversa, artefacto legacy sem associação e jobs de quiz
  concluído, falhado e em processamento.

O E2E do Assistente usa uma conta seed dedicada para não partilhar quota USER com
os testes de outros módulos. A quota real continua a ser aplicada.

## 11. Validação executada

### API

| Comando/gate | Resultado |
|---|---|
| `npm test` | PASS — 158 suites, 828 testes |
| `npm run build` | PASS |
| `npm run technical-map:check` | PASS |
| `npm run function-inventory:check` | PASS |
| `npm run secrets:scan` | PASS |
| migração isolada dry-run/apply/idempotência/rollback | PASS |

### Web

| Comando/gate | Resultado |
|---|---|
| `npm test` | PASS — 51 ficheiros, 244 testes |
| `npm run build:budget` | PASS |
| bundle `entry` gzip | 86.86 KiB |
| jornada `STUDENT` gzip | 183.72 KiB |
| `npm run test:e2e` | PASS — 70/70 |

A execução E2E final usou uma stack isolada com Mongo replica set efémero, Redis
in-memory, provider determinístico governado e `runId=private-materials-full-2`. Foram
validados Chromium, Firefox e WebKit.

### Viewports e acessibilidade

Foram exercitados:

- 320 × 720
- 375 × 812
- 768 × 1024
- 1440 × 900

Os percursos Axe não encontraram violações `serious` ou `critical` nas superfícies
representativas. A validação manual no browser confirmou dashboard desktop, drawer
desktop, página completa, layout mobile, bottom sheet/fullscreen, quatro destinos e
ausência de erros de consola.

### Notas ambientais

A primeira tentativa automática de E2E dentro da sandbox falhou com `listen EPERM`.
Uma tentativa seguinte perdeu os processos isolados e devolveu `ERR_CONNECTION_REFUSED`.
Estas falhas foram classificadas como infraestrutura. A suite foi repetida fora da
sandbox contra uma stack loopback isolada e terminou 67/67 verde.

Durante o fecho foram detetados e corrigidos dois defeitos de produto:

1. promoção não materializada de `DRAFT` para `ACTIVE` depois da primeira resposta;
2. leituras autenticadas stale do histórico no cache do browser.

Durante a extensão de artefactos foram ainda detetados e corrigidos:

1. validação interna que aceitava apenas chaves de jobs legacy e rejeitava o hash
   idempotente do Assistente;
2. carregamento prematuro dos endpoints de artefactos em disciplinas e salas, que
   impedia o composer normal nesses contextos.

Durante a generalização dos materiais privados foram detetados e corrigidos:

1. título global do arquivo que podia herdar a disciplina do primeiro cartão;
2. estado vazio transitório antes da pesquisa debounced de destinos;
3. restituição de foco inconsistente no WebKit devido ao carregamento lazy do painel;
4. contratos E2E legacy que ainda exigiam o deep link da área em vez do detalhe
   privado canónico e reutilizavam uma conversa eliminada pelo cenário de forks.

## 12. Rollout e rollback recomendados

O rollout real não foi executado. Ordem segura:

1. criar e verificar backup/snapshot;
2. publicar backend aditivo;
3. executar `npm run migrate:student-ai-conversations:dry-run`;
4. rever contagens e anomalias;
5. executar `npm run migrate:student-ai-conversations` e guardar o `runId`;
6. confirmar contagens e amostras autorizadas;
7. publicar frontend;
8. executar smoke com aluno novo e aluno povoado.

Rollback:

- repor o frontend anterior sem remover endpoints legacy;
- não remover coleção nem campos aditivos;
- quando estritamente necessário, executar
  `npm run migrate:student-ai-conversations:rollback -- <runId>`;
- nunca executar rollback destrutivo automático.

## 13. Riscos residuais

- A migração foi provada em Mongo isolado, não numa cópia volumétrica de dados reais;
  batch time, contagens e anomalias devem ser revistos no dry-run de rollout.
- A compatibilidade legacy é deliberadamente temporária e aumenta a superfície de
  manutenção até existir uma fase de descontinuação aprovada.
- A retenção partilhada/supervisionada depende das relações legacy existentes; uma
  auditoria amostral pós-migração continua recomendada.
- Não foi feito deploy, backup real, dry-run real ou aplicação real nesta execução.

Não existem bloqueios conhecidos no código ou nos gates executados.

## 14. Funcionalidades deliberadamente adiadas

Permanecem fora desta migração:

- streaming e WebSockets de resposta;
- memória resumida contínua;
- conversas multi-contexto;
- pesquisa web ou conhecimento externo automático;
- alterações de provider/modelo;
- nova finalidade genérica de consentimento;
- alterações de staff ou quinta entrada de navegação.

## 15. Extensão — materiais privados criados pelo Assistente

A fachada inicialmente limitada a `STUDY_AREA` foi generalizada de forma aditiva aos
cinco contextos do Assistente. Continua a reutilizar `SummariesService`,
`StudyToolsService` e `QuizGenerationJobsService`; não foram criados prompts,
validators, providers, finalidades de consentimento ou coleções de conteúdo
paralelas.

O contrato implementado garante:

- ação explícita “Criar material de estudo” no drawer e página completa;
- consentimento `SUMMARY` ou `STUDY_TOOL` separado de `PRIVATE_AREA_AI`;
- destino fixo para área e disciplina, disciplina/turma derivada na sala guiada e
  seleção explícita de um destino ativo em grupos e salas;
- ownership sempre pelo aluno, mesmo quando o destino organizacional é uma
  disciplina ou turma;
- snapshot servidor dos últimos seis turnos, em ordem cronológica, e das fontes ainda
  autorizadas no momento do pedido;
- modo `CHAT_ONLY` explícito quando não existem fontes processáveis atuais;
- `Idempotency-Key` UUID convertido num hash interno sem persistir a chave em claro;
- lease de geração por conversa e associação opcional em `AiArtifact`;
- quizzes recuperáveis pela fila Mongo e polling depois de refresh;
- cards mínimos na conversa, sem conteúdo, soluções, prompts ou metadata interna;
- arquivo global privado com detalhe, exportação, eliminação e tentativa de quiz;
- contextos terminados mantêm a cópia legível/exportável, mas bloqueiam nova prática;
- preservação dos artefactos e tentativas quando a conversa é apagada;
- campos aditivos e migração idempotente para metadata de destino legacy, sem
  alteração dos endpoints legacy;
- lazy loading do painel para preservar o bundle budget.

Os seeds incluem artefactos associados, quiz concluído, falhado e em processamento,
além de artefactos legacy sem associação obrigatória. Estes últimos são apresentados
com fallback seguro e podem ser normalizados pelo comando de migração próprio.

## 16. Extensão — forks completos em salas e grupos

Foi acrescentado um serviço isolado de forks completos apenas para `STUDY_ROOM` e
`STUDY_GROUP`. O executor conversacional, provider, prompts, guardrails,
consentimentos, quotas e memória de seis turnos não foram alterados.

O contrato implementado garante:

- convite individual dirigido a um aluno ativo do mesmo contexto;
- snapshot imutável no último turno existente no momento do convite;
- aceitação, recusa e cancelamento explícitos na página completa do Assistente;
- criação transacional de uma conversa privada e independente com novo ownership;
- cópia cronológica de perguntas, respostas, fontes e snapshots de citações;
- turnos copiados marcados como herdados e privados, sem reutilizar a referência
  legacy `forkedFromInteractionId` das salas;
- retry idempotente e proteção contra duas aceitações concorrentes;
- rollback total quando qualquer escrita da conversa, turnos ou auditoria falha;
- expiração lógica em sete dias e TTL 30 dias depois do estado terminal;
- limites de 200 turnos, 500 000 caracteres, 10 convites por conversa e 20 por
  remetente, sem truncagem silenciosa;
- repartilha mediante novo convite e consentimento do novo destinatário;
- eliminação independente da origem, do fork e das contas intervenientes;
- auditoria minimizada de sucesso, negação, falha e expiração, sem conteúdo, títulos
  ou emails nos metadados.

Foram adicionados os endpoints:

- `GET /api/student/assistant/conversations/:id/fork-recipients`;
- `POST /api/student/assistant/conversations/:id/fork-invitations`;
- `GET /api/student/assistant/fork-invitations`;
- `POST /api/student/assistant/fork-invitations/:id/accept`;
- `POST /api/student/assistant/fork-invitations/:id/decline`;
- `DELETE /api/student/assistant/fork-invitations/:id`.

`StudentAiConversationForkInvitation` foi registado no registry de dados pessoais
por `sourceStudentId` e `recipientStudentId`. A exportação, eliminação RGPD, índice
único parcial de convites pendentes e índice TTL foram validados numa réplica Mongo
efémera.

No frontend, a ação “Partilhar conversa” usa o `SidePanel` existente. O painel
mantém focus trap, scroll lock, `Escape`, restituição de foco e bloqueio do launcher.
A página completa apresenta convites recebidos antes do histórico, navega para a
nova conversa após aceitação e distingue “Fork recebido” e “Pergunta herdada”. Não
foi criada navegação, sistema visual, dependência ou notificação global.

O E2E dedicado validou sala e grupo, aceitação pela interface, histórico herdado,
repartilha B→C e sobrevivência depois de apagar a origem em Chromium, Firefox e
WebKit. Convite e aceitação decorreram sem consentimento IA e sem provider. A stack
E2E mantém `ROOM_AI` deliberadamente desativado; por isso, a continuação via provider
não foi forçada nesse cenário. A continuidade da memória de seis turnos permanece
coberta pelo serviço unificado existente, e o cutoff com turno posterior foi provado
no teste transacional específico.

Validação específica executada:

- 9 testes de integração com `MongoMemoryReplSet` para snapshot, datas, cópia
  privada, idempotência concorrente e terminal, rollback, membership, renovação
  após expiração e índices;
- 16 testes frontend focados para capacidade, inbox, pesquisa, seleção,
  consentimento, envio, cancelamento, marcação herdada e foco;
- E2E do fork nos três browsers;
- quatro viewports (`320×720`, `375×812`, `768×1024`, `1440×900`), teclado e Axe sem
  findings `serious` ou `critical`;
- registry RGPD, builds API/web, bundle budget, mapa técnico e inventário de funções.

## 17. Extensão — organização privada transversal dos materiais

Os materiais criados a partir de uma conversa pertencem sempre ao aluno. O destino
`STUDY_AREA`, `SUBJECT` ou `CLASS` é metadata organizacional e nunca altera ownership,
visibilidade ou autorização. A API não aceita do browser o owner, as fontes, o
histórico, a contagem de turnos, a data do snapshot nem labels de contexto.

Regras por contexto:

| Conversa | Destino organizacional |
|---|---|
| `STUDY_AREA` | a própria área, fixada no backend |
| `SUBJECT` | a própria disciplina, fixada no backend |
| `GUIDED_ROOM` | disciplina associada ou, na sua ausência, turma |
| `STUDY_GROUP` | disciplina, turma ou área ativa escolhida pelo aluno |
| `STUDY_ROOM` | disciplina, turma ou área ativa escolhida pelo aluno |

O snapshot inclui no máximo os seis turnos completos mais recentes e as fontes
autorizadas atuais resolvidas pelos serviços de cada domínio. O limite combinado é
500 000 caracteres e nunca existe truncagem silenciosa. Resumos, explicações e
flashcards são persistidos diretamente; quizzes usam snapshot transitório e criação
transacional do job, sem fallback não transacional.

O arquivo privado está disponível em `/app/estudar/materiais`, com detalhe canónico
em `/app/estudar/materiais/:artifactId` e vistas de organização em
`/app/disciplinas/:subjectId/meus-materiais` e
`/app/turmas/:classId/meus-materiais`. O contexto organizacional é revalidado em cada
leitura: quando termina, a cópia privada permanece legível e exportável, mas deixa de
aceitar novas tentativas de quiz.

Migração aditiva disponível:

```bash
npm run migrate:private-study-material-targets:dry-run
npm run migrate:private-study-material-targets
```

A migração preenche de forma idempotente `targetKind`, `targetId`, label e
visibilidade privada dos artefactos legacy de áreas pessoais. Não foi aplicada a
dados reais nesta execução.

Validação específica desta extensão:

- testes de contexto, autorização, snapshot, cópia privada, arquivo, exportação,
  tentativas, eliminação e migração;
- integração Mongo replica set para criação transacional, rollback e idempotência do
  snapshot/job de quiz;
- testes frontend do painel, capability, pesquisa/seleção, estados, arquivo, detalhe
  e restituição de foco;
- browser em `320×720`, `375×812`, `768×1024` e `1440×900`, sem scroll horizontal ou
  erros de consola;
- E2E dedicado em Chromium, Firefox e WebKit, com teclado e Axe sem findings
  `serious` ou `critical`.

UI_GUIDELINES_READ: sim
UI_GUIDELINES_PATH: real_dev/docs/FRONTEND-UI-GUIDELINES.md
UI_COMPLIANCE: PASS
UI_DEVIATIONS: nenhuma
UI_VALIDATION: testes, build, browser, quatro viewports, teclado, três browsers e Axe executados
