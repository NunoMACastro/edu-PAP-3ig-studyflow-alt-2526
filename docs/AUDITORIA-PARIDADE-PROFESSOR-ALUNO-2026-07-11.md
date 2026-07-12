# Auditoria de paridade Professor → Aluno

> **Nota pós-remediação:** este documento preserva a fotografia inicial que fundamentou o
> plano. Os findings foram tratados na implementação de 11/07/2026; o estado atualizado, os
> contratos resultantes, a migração e a evidência de validação estão em
> `docs/RELATORIO-IMPLEMENTACAO-PARIDADE-PROFESSOR-ALUNO-2026-07-11.md`.

**Data:** 11 de julho de 2026

**Âmbito auditado:** `real_dev/api`, `real_dev/web`, testes automáticos e documentação de suporte

**Objeto:** verificar se as ações e alterações do lado do professor que influenciam o aluno estão refletidas na UI, contratos, endpoints, persistência, autorização e testes do lado do aluno

**Resultado global:** **PARCIAL — a paridade funcional base existe, mas ainda não é integral nem suficientemente provada para fecho**

## 1. Resumo executivo

O produto já possui uma cadeia professor → aluno funcional para os principais domínios:

- inscrição e remoção de alunos em turmas;
- criação de disciplinas;
- publicações de turma;
- salas de estudo guiado, participação, mini-teste associado e IA supervisionada;
- voz da IA por turma e por disciplina;
- projetos publicados e plano de projeto com IA;
- mini-testes oficiais, três tentativas, soluções e ranking do professor;
- revisão docente de conteúdos gerados por IA;
- chat coletivo da disciplina;
- notificações de acompanhamento e de abertura/reabertura de salas guiadas.

As verificações de autorização são, em geral, sólidas: sessão, role, ownership e membership são revalidados no backend. Não foi encontrado um bypass crítico de autorização nem exposição da pauta/ranking global aos alunos.

Contudo, a auditoria encontrou defeitos cross-role relevantes:

1. a turma apresentada no dashboard do aluno não usa a inscrição oficial gerida pelo professor;
2. consentimentos `CLASS_AI` antigos aparecem ativos na Privacidade, mas são recusados pela API e a IA normal da disciplina não permite renová-los;
3. o Centro de Acompanhamento classifica atividade através de um conjunto incompleto de eventos e pode gerar falsos positivos de inatividade;
4. fechar um mini-teste associado pode tornar uma sala guiada impossível de concluir;
5. projetos criados em rascunho não têm transição para publicação;
6. restaurar uma versão de material oficial não altera o conteúdo efetivamente consumido pelo aluno ou pela IA;
7. notificações não são atualizadas em tempo real, não têm estado lido e misturam acompanhamento docente com a preferência “Objetivos”;
8. os testes browser e a documentação estão desatualizados em relação à implementação de 11/07.

Por estes motivos, a conclusão é **paridade parcial**. Os fluxos-base podem ser demonstrados, mas ainda existem situações em que uma ação docente não chega ao aluno, chega com estado incoerente ou não tem prova end-to-end positiva.

## 2. Método e critérios

A auditoria foi feita sobre o código operativo em `real_dev/`, que está ignorado por Git neste checkout. Foram analisados:

- rotas protegidas de professor e aluno;
- controllers, DTOs, schemas e services NestJS;
- cliente HTTP, páginas e componentes React;
- persistência e transições de estado;
- autorização por role, ownership e membership;
- minimização de dados e consentimento;
- unit tests, component tests, builds, coverage e E2E Chromium;
- mapa técnico, inventário de funções, guias BK e manifesto de implementação.

Estados usados nas matrizes:

- **OK:** o fluxo docente chega ao aluno com contrato e autorização coerentes;
- **PARCIAL:** existe, mas tem lacunas funcionais, de estado, UX ou prova;
- **AUSENTE:** a transição necessária não existe;
- **INTENCIONAL:** informação exclusivamente docente que não deve chegar ao aluno.

## 3. Matriz de paridade professor → aluno

| Domínio | Ação/superfície docente | Consumidor aluno | Estado | Conclusão |
|---|---|---|---|---|
| Turmas | Criar turma, adicionar e remover aluno | `/app/turmas`, disciplinas e recursos derivados | **PARCIAL** | A inscrição oficial propaga-se aos recursos da turma, mas o dashboard principal usa o campo livre `profile.className`, não as turmas oficiais. |
| Disciplinas | Criar disciplina com nome, código e descrição | Lista de disciplinas e recursos da disciplina | **PARCIAL** | O aluno recebe a disciplina correta, mas a descrição é ignorada pela UI e não há ciclo de edição/arquivo/remoção. |
| Salas guiadas | Criar, editar, fechar, reabrir, associar material/teste, supervisionar IA | Lista, detalhe, participação, conclusão, IA e histórico | **PARCIAL** | O fluxo é amplo e protegido; existem incoerências de ciclo de vida, reidratação da participação e paginação do histórico. |
| Salas colaborativas | Disciplinas oficiais e voz docente | Salas criadas pelo aluno | **PARCIAL/INDEPENDENTE** | Usam `disciplineName` livre, sem `subjectId`; alterações oficiais de disciplina não se propagam a estas salas. |
| Centro de Acompanhamento | Resumo, regras de inatividade, detalhe do aluno e notificação individual | Tray de notificações e próprios resultados | **PARCIAL** | A notificação existe, mas pode ser baseada numa inatividade incorreta e só aparece após refresh/remount. |
| Voz da IA | Voz base da turma e override da disciplina | IA da disciplina e IA da sala guiada | **PARCIAL** | A resolução backend está correta, mas o consentimento da IA da disciplina pode bloquear o aluno e não há prova E2E positiva da voz na resposta. |
| Publicações | Criar publicação/aviso | Publicações da turma | **OK funcional** | A publicação chega ao aluno inscrito. Não existe notificação automática da nova publicação. |
| Projetos | Criar projeto `DRAFT` ou `PUBLISHED` | Projetos publicados e plano IA | **PARCIAL** | Projetos publicados chegam ao aluno; um rascunho nunca pode ser publicado pelo contrato atual. |
| Mini-testes oficiais | Criar, editar, publicar, fechar e consultar ranking | Listar, responder até três vezes, ver resultado/solução | **OK com incoerência** | O fluxo principal está correto; o fecho pode bloquear a conclusão de uma sala e os contratos de tentativas restantes divergem. |
| Conteúdo IA revisto | Criar revisão, aprovar ou retirar | Resumo/quiz aprovado | **OK funcional** | Apenas conteúdo aprovado chega ao aluno e a retirada deixa de o disponibilizar. As tentativas do quiz aprovado são transitórias. |
| Materiais oficiais | Criar, indexar, versionar e restaurar | IA, contextos e materiais selecionados em salas | **PARCIAL** | Materiais processados alimentam o aluno, mas “restaurar versão” não muda o conteúdo consumido. |
| Chat da disciplina | Participar no chat oficial | Chat REST/WebSocket da disciplina | **OK técnico** | Sessão e membership são revalidados; falta prova browser real professor ↔ aluno. |
| Ranking global | Consultar ranking `BEST_ATTEMPT` | — | **INTENCIONAL** | Mantém-se exclusivo do professor, evitando exposição indevida dos resultados dos colegas. |
| Notas pedagógicas | Criar notas privadas de progresso | — | **INTENCIONAL** | Mantêm-se exclusivas do professor, o que está correto. |

## 4. Contratos e endpoints cross-role

### 4.1 Turmas e disciplinas

| Professor | Aluno | Avaliação |
|---|---|---|
| `POST /api/teacher/classes` | `GET /api/student/classes` | Criação/listagem coerente. |
| `POST /api/teacher/classes/:classId/students` | acesso aos recursos da turma | A inscrição passa a ser revalidada nos services. |
| `DELETE /api/teacher/classes/:classId/students/:studentId` | perda de acesso aos recursos | Implementação coerente; falta um E2E que prove a revogação em todos os consumidores. |
| `POST/GET /api/teacher/classes/:classId/subjects` | `GET /api/student/classes/:classId/subjects` | Contrato existe; descrição não é apresentada na UI do aluno. |

Não existem endpoints para editar, arquivar ou eliminar turmas e disciplinas. Portanto, “gestão” significa atualmente criação, listagem e membership, não um CRUD completo.

### 4.2 Salas de estudo guiado

O controller atual expõe 13 operações:

- professor: criar, listar, obter detalhe, editar, alterar estado, consultar progresso e consultar interações IA;
- aluno: listar, obter detalhe, marcar visualização, concluir, perguntar à IA e consultar histórico IA.

Os pares de rotas são coerentes:

- `/api/teacher/classes/:classId/guided-study-rooms[...]`;
- `/api/student/classes/:classId/guided-study-rooms[...]`.

O backend valida turma, aluno inscrito, ownership do professor, materiais processados, disciplina da turma e finalidade de consentimento. A UI informa ainda que o professor pode consultar o histórico identificado da IA da sala.

### 4.3 Voz e IA oficial

Configuração docente:

- `PUT/GET /api/teacher/classes/:classId/ai-voice`;
- `PUT/GET/DELETE /api/teacher/subjects/:subjectId/ai-voice`.

Consumo pelo aluno:

- `POST /api/student/subjects/:subjectId/ai/answers`;
- `POST/GET /api/student/classes/:classId/guided-study-rooms/:roomId/ai/answers`.

A precedência `SUBJECT_OVERRIDE → CLASS_BASE → DEFAULT` está implementada e é aplicada no prompt. A falha está no contrato/UX de consentimento e na ausência de uma prova browser positiva da resposta.

### 4.4 Mini-testes e conteúdos IA aprovados

Mini-testes:

- professor: criar, listar, editar, publicar, fechar e consultar ranking;
- aluno: listar, submeter tentativa e consultar as próprias tentativas.

Conteúdo IA revisto:

- professor: criar/listar revisão e alterar decisão;
- aluno: listar conteúdo aprovado e submeter quiz associado.

Nestes domínios, os filtros de visibilidade e a separação professor/aluno estão implementados. O ranking completo não é exposto ao aluno.

### 4.5 Centro de Acompanhamento e notificações

O Centro usa:

- `GET /api/follow-up-alerts/summary`;
- `GET/POST /api/follow-up-alerts`;
- `POST /api/follow-up-alerts/:id/run`;
- `GET /api/follow-up-alerts/classes/:classId/students/:studentId/official-tests`;
- `POST /api/follow-up-alerts/classes/:classId/students/:studentId/notify`;
- `GET/POST /api/context-notifications`.

O professor consegue notificar apenas um aluno validamente inscrito. Porém, o consumidor aluno não tem polling/socket, `readAt`, `isRead`, marcação de leitura ou dismiss.

## 5. Achados detalhados

### PA-001 — Alta — O dashboard do aluno não usa a turma oficial

**Evidência**

- `real_dev/api/src/modules/study/solo-study.service.ts:39-55` calcula `hasClass` e `className` a partir do perfil do aluno.
- `real_dev/web/src/pages/student/ProfilePage.tsx:93-114` permite ao próprio aluno editar livremente `className`.
- `real_dev/web/src/pages/student/SoloStudyDashboard.tsx:69-77` apresenta esse valor.
- A fonte oficial está separada em `GET /api/student/classes`, consumida por `StudentClassesPage`.

**Impacto**

Adicionar ou remover o aluno numa turma atualiza `/app/turmas` e as autorizações, mas pode deixar o dashboard a mostrar uma turma antiga, arbitrária ou “sem turma”. O modelo também não representa várias turmas oficiais.

**Recomendação**

Derivar o resumo do dashboard de `ClassesService.listForStudent`, usar um DTO minimizado e tratar `profile.className` como campo legado ou removê-lo após migração explícita.

### PA-002 — Alta — Renovação `CLASS_AI` inconsistente

**Evidência**

- `real_dev/api/src/modules/ai-consents/ai-consents.service.ts:12-23` exige versão `2026-07-11` para `CLASS_AI`.
- `real_dev/web/src/features/mf4/privacy-panel.tsx:152-166` considera qualquer consentimento `GRANTED` ativo, sem validar `policyVersion`.
- `real_dev/web/src/pages/student/StudentClassAiPage.tsx:21-63` não faz preflight nem apresenta renovação inline.
- `StudentGuidedStudyRoomDetailPage.tsx:35-53,81-99` trata corretamente a versão atual, mostrando que os dois consumidores divergem.

**Impacto**

Um consentimento antigo aparece assinalado na Privacidade, mas o backend recusa a pergunta. Na prática, o aluno tem de descobrir que deve revogar e voltar a conceder.

**Recomendação**

Centralizar capacidades/versões de consentimento num endpoint do backend e num único componente reutilizável de preflight/renovação para todos os consumidores de IA.

### PA-003 — Alta — Inatividade do Centro de Acompanhamento pode estar errada

**Evidência**

- `follow-up-alerts.service.ts:311-322` considera apenas documentos `StudyEvent` dentro da janela temporal.
- Tentativas oficiais, Class AI, Project AI, quizzes aprovados e chat não registam esse evento.
- `guided-study-rooms.service.ts:402-409` apenas atualiza `lastViewedAt` quando a sala já foi vista; o `StudyEvent` é criado apenas na primeira visualização, em `:411-440`.
- `school-class.schema.ts:29-30` guarda `studentIds`, mas não a data de entrada na turma.

**Impacto**

Um aluno recém-inscrito ou ativamente a usar testes, chat ou IA pode ser classificado como inativo e receber acompanhamento indevido.

**Recomendação**

Criar uma fonte transversal de `lastMeaningfulActivityAt` ou um agregador explícito por domínio, registar `joinedAt` por membership e definir quais as ações que contam pedagogicamente como atividade.

### PA-004 — Alta — Fecho de mini-teste pode bloquear a conclusão da sala

**Evidência**

- `guided-study-rooms.service.ts:444-465` exige pelo menos uma tentativa no teste associado.
- `official-tests.service.ts:455-458` recusa novas tentativas quando o teste está fechado.
- O ciclo em `official-tests.service.ts:275-333` não permite reabrir o teste.
- A remoção do teste da sala após existirem participações é permitida e coberta por `guided-study-rooms.service.spec.ts:212-228`.

**Impacto**

Alunos que ainda não tentaram o teste ficam impossibilitados de concluir a sala. Remover o teste desbloqueia-os, mas deixa alunos da mesma sala sujeitos a critérios diferentes.

**Recomendação**

Impedir o fecho do teste enquanto uma sala aberta o exigir, fechar ambos de forma coordenada, ou definir uma transição de exceção explícita e auditável. Não permitir alteração retroativa do gate sem versionar a sala.

### PA-005 — Alta — Projeto em rascunho não pode ser publicado

**Evidência**

- `class-projects.service.ts:56-75` aceita `DRAFT` e `PUBLISHED`.
- `class-projects.service.ts:108-125` mostra ao aluno apenas `PUBLISHED`.
- `class-projects.controller.ts:31-67` apenas cria e lista; não existe `PATCH`, publicar, editar ou eliminar.

**Impacto**

Um projeto criado como `DRAFT` fica permanentemente invisível ao aluno.

**Recomendação**

Adicionar uma transição de publicação autenticada e idempotente, com validação de ownership e testes professor cria rascunho → publica → aluno vê.

### PA-006 — Alta — Restaurar material não altera o conteúdo consumido

**Evidência**

- `material-versions.service.ts:104-139` muda apenas o indicador `active` entre versões.
- Não atualiza `OfficialMaterial.textContent`.
- `official-materials.service.ts:175-184` continua a fornecer diretamente o material oficial processado à IA.
- Não foi encontrado um consumidor que resolva o conteúdo pela versão ativa.

**Impacto**

O professor recebe sucesso ao restaurar uma versão, mas o aluno, a IA e a sala guiada podem continuar a usar o conteúdo anterior.

**Recomendação**

Definir uma única fonte de verdade: material aponta para `activeVersionId`, ou o restore atualiza atomicamente o conteúdo projetado. Adicionar teste de integração restore → leitura/IA do aluno.

### PA-007 — Média — Notificações do aluno ficam stale e não têm lifecycle

**Evidência**

- `notification-tray.tsx:42-61` lê as notificações uma vez no mount.
- O badge usa o tamanho total do array; não representa notificações novas.
- O controller só expõe `POST/GET` e o schema não tem estado de leitura por destinatário.
- `AppShell.tsx:164,218` monta simultaneamente um tray desktop e outro mobile; CSS só os esconde visualmente, provocando dois pedidos e dois estados independentes.

**Impacto**

Uma notificação enviada pelo professor durante a sessão pode não aparecer até ao reload. O contador nunca é verdadeiramente limpo e as duas instâncias podem divergir.

**Recomendação**

Montar uma única store/instância, atualizar ao abrir ou por polling/socket e adicionar `readAt`/ack por destinatário.

### PA-008 — Média — Preferências e entrega de notificações não representam os eventos docentes

**Evidência**

- Os contextos configuráveis são apenas `STUDY_ROUTINE`, `STUDY_GOAL`, `GROUP_SESSION` e `GUIDED_ROOM`.
- `context-notifications.service.ts:141-160` mapeia notificações genéricas de turma, incluindo `FOLLOW_UP`, para `STUDY_GOAL`.
- A UI chama a esta preferência “Objetivos”.
- A UI expõe canais email e push, embora o DTO indique que estas integrações ainda não existem.
- Criação/reabertura de sala engole falhas de notificação em `guided-study-rooms.service.ts:139-164,374-385`, sem outbox ou retry.
- Publicar teste, post, projeto, material ou conteúdo IA aprovado não cria notificação automática.

**Impacto**

Desativar “Objetivos” pode silenciar acompanhamento docente. O professor não sabe se a notificação de sala falhou e os restantes conteúdos dependem de descoberta manual pelo aluno.

**Recomendação**

Criar contextos próprios para acompanhamento/turma, esconder canais não implementados, usar outbox transacional e definir uma matriz explícita de eventos que notificam.

### PA-009 — Média — O Centro ainda não é uma visão pedagógica consolidada

**Evidência**

- `class-progress.service.ts:64-105` devolve sobretudo contagens de recursos.
- `teacher-dashboard.service.ts:468-480` calcula atividade pela existência de configuração/conteúdo, não pelas ações dos alunos.
- `teacher-dashboard.service.ts:180-204` explicita a ausência de progresso baseado em submissões/resultados.
- Os melhores resultados oficiais e o progresso de salas existem em endpoints separados.
- Tentativas dos quizzes IA aprovados não são persistidas (`ai-content-reviews.service.ts:293-350`).

**Impacto**

O “Centro de Acompanhamento” é hoje um centro operacional com sinais parciais, não uma visão consolidada de progresso pedagógico individual.

**Recomendação**

Definir métricas canónicas e agregá-las por aluno: atividade, conclusão de salas, melhores tentativas, evolução temporal e dificuldades, sem expor dados de colegas.

### PA-010 — Média — Gestão de turmas e disciplinas tem ciclo incompleto

**Evidência**

- `classes.controller.ts:40-98` oferece criar/listar e adicionar/remover aluno.
- `subjects.controller.ts:31-64` oferece apenas criar/listar.
- Não existem `PATCH`, arquivo ou eliminação para estas entidades.

**Impacto**

Alterações docentes de nome, código, ano, descrição, arquivo ou remoção não podem persistir nem, por consequência, refletir-se no aluno.

**Recomendação**

Clarificar se o produto pretende apenas setup imutável. Caso contrário, acrescentar lifecycle com regras para recursos dependentes, soft delete/arquivo e histórico de auditoria.

### PA-011 — Média — Estado de participação da sala fechada não é reidratado

**Evidência**

- O detalhe da sala em `guided-study-rooms.service.ts:61-66,204-211` não inclui a participação do aluno.
- Não existe `GET` próprio de participação.
- `markViewed` recusa salas fechadas em `guided-study-rooms.service.ts:394-400`.

**Impacto**

Depois de recarregar uma sala encerrada, o aluno consegue consultar o conteúdo, mas a UI não consegue recuperar se já a concluiu.

**Recomendação**

Incluir `myParticipation` no detalhe discente, como projeção read-only válida em estados `OPEN` e `CLOSED`.

### PA-012 — Média — O endpoint de turmas do aluno expõe IDs dos colegas

**Evidência**

- `classes.service.ts:198-204` usa a projeção geral na listagem do aluno.
- `classes.service.ts:441-452` inclui todos os `studentIds`.
- A UI do aluno não usa estes identificadores.

**Impacto**

É uma violação do princípio de minimização de dados, embora não exponha emails nem perfis.

**Recomendação**

Criar `StudentClassSummaryDto` sem `studentIds`/`students`, mantendo uma projeção diferente para o professor.

### PA-013 — Média — Salas colaborativas não estão ligadas às disciplinas oficiais

**Evidência**

- A sala do aluno guarda `disciplineName` livre, sem `subjectId`.
- A UI de criação em `StudyRoomsPage.tsx:118-127` também pede texto livre.

**Impacto**

Criar ou futuramente renomear uma disciplina oficial não atualiza estas salas; também não existe uma associação segura para herdar metadados oficiais.

**Recomendação**

Se a ligação for desejada, aceitar `officialSubjectId` opcional e manter texto livre apenas para estudo fora de turma. Não misturar automaticamente salas colaborativas com salas guiadas.

### PA-014 — Média — História e transparência da IA oficial são incompletas

**Evidência**

- Class AI e Project AI persistem resultados, mas os respetivos controllers expõem apenas `POST`.
- Após refresh, o aluno não consegue recuperar estas interações.
- O backend devolve `voiceRulesApplied` em Class AI, mas `ClassAiAnswer` no frontend omite o campo.
- Class AI persiste as regras, mas não tom, detalhe e origem da voz; a sala guiada tem um contrato mais completo.

**Impacto**

Resultados oficiais desaparecem da UI após reload e o aluno não consegue verificar qual voz pedagógica foi aplicada.

**Recomendação**

Adicionar listagem paginada do histórico próprio e unificar o contrato `effectiveVoice` entre Class AI, Project AI e Guided AI.

### PA-015 — Média — Estados de loading e erro podem simular listas vazias

**Evidência**

`StudentClassesPage`, `StudentClassSubjectsPage`, `StudentClassPostsPage`, `StudentClassProjectsPage`, `RoomSharesPage` e `MaterialContextsPage` começam com arrays vazios e não distinguem sempre loading, erro e vazio.

O caso mais claro é `StudentClassesPage.tsx:12-31`: “Ainda não estás inscrito em turmas” pode surgir enquanto o pedido está pendente ou juntamente com o erro.

**Impacto**

O aluno pode interpretar latência/falha como ausência de conteúdo criado pelo professor.

**Recomendação**

Adotar estados explícitos `idle/loading/success/error`, apresentar empty state apenas após sucesso e usar `role="status"`/`role="alert"` quando apropriado.

### PA-016 — Baixa/Média — Contrato de tentativas restantes diverge após fecho

**Evidência**

- A listagem de testes devolve `attemptsRemaining: 0` em `CLOSED` (`official-tests.service.ts:784-815`).
- A listagem das tentativas calcula sempre `3 - attemptNumber` (`:825-864`).

**Impacto**

O mesmo ecrã pode receber “0 restantes” no teste e um valor positivo no histórico, embora a API recuse novas submissões.

**Recomendação**

Calcular o campo numa única função, incluindo o estado do teste, ou removê-lo do payload de cada tentativa.

### PA-017 — Baixa — A UI não usa a paginação do histórico IA da sala

O contrato devolve `nextCursor` e o cliente aceita cursor, mas `StudentGuidedStudyRoomDetailPage` carrega apenas a primeira página. O professor já possui “Carregar mais”.

### PA-018 — Baixa — Descrição da disciplina é descartada na UI do aluno

O professor cria `description` e o contrato devolve-a, mas `StudentClassSubjectsPage.tsx:40-54` apresenta apenas nome e código.

### PA-019 — Baixa — Descoberta e nomenclatura ainda têm drift

- O heading diz “Centro de Acompanhamento”, mas navegação e botão do dashboard continuam a dizer “Acompanhamento”.
- O menu “Salas” abre as salas colaborativas; as salas guiadas só são descobertas dentro de cada cartão de turma.
- Não há agregador de salas guiadas de todas as turmas.

## 6. Segurança e privacidade

### Controlos confirmados

- Controllers protegidos por sessão e validações de role nos services.
- Ownership do professor e membership do aluno revalidados no backend.
- Remover o aluno da turma revoga o acesso derivado na próxima chamada.
- Mini-testes não enviam a resposta correta antes da submissão e limitam tentativas.
- Ranking global e notas pedagógicas não são enviados ao aluno.
- Chat REST/WebSocket revalida sessão e inscrição.
- IA da sala usa materiais selecionados e processados.
- Supervisão identificada da IA da sala é comunicada ao aluno.

### Riscos residuais

- exposição desnecessária dos IDs dos colegas em `/api/student/classes`;
- `requestJson<T>` faz cast TypeScript sem validação runtime dos response shapes;
- falhas de notificação são invisíveis ao professor;
- alterações retroativas numa sala já participada podem mudar o contrato pedagógico sem versionamento completo;
- não existe prova HTTP/E2E sistemática de mutação docente → leitura discente para todos os domínios.

## 7. Testes e validação executados

| Validação | Resultado |
|---|---|
| API — suite completa | **PASS:** 128 suites, 669 testes |
| Web — unit/component | **PASS:** 39 ficheiros, 177 testes |
| API build | **PASS** |
| Web build | **PASS** |
| Web coverage | **PASS:** 71,79% statements; 63,96% branches; 64,84% functions; 73,63% lines |
| Student pages coverage | **65,43% lines; 54,98% functions** |
| Chromium E2E | **FAIL parcial:** 27 passaram, 3 falharam |
| `technical-map:check` | **PASS** |
| `function-inventory:check` | **FAIL:** inventário AST desatualizado |
| `docs:verify` | **FAIL:** estado/guia desincronizados e data fixa no gerador |

### 7.1 Falhas E2E atuais

1. `mf1-smoke.spec.ts:110-113` concede `CLASS_AI` com `policyVersion: "2026-07-09"`; o backend exige `2026-07-11`.
2. `mf5-interface-smoke.spec.ts:150-152` procura o link “Disciplinas”, mas a UI atual usa “Gerir disciplinas”.
3. `mf5-navigation.spec.ts:168` espera “Abrir sinais a rever”, texto que já não existe no dashboard atual.

As duas últimas falhas são drift dos testes após alterações de UI. A primeira expõe o mesmo risco real de renovação de consentimento encontrado na aplicação.

### 7.2 Limites da cobertura existente

- O E2E de voz guarda a voz docente, mas a pergunta do aluno termina deliberadamente em erro de quota; não prova uma resposta positiva com a voz aplicada.
- O E2E do Centro usa mocks e não autentica depois o aluno para verificar a notificação real no tray.
- Não existe E2E professor remove aluno → todos os recursos derivados passam a negar acesso.
- Não existe E2E browser do chat professor ↔ aluno.
- Não existe teste positivo da IA da sala guiada através da UI.
- Várias páginas cross-role do aluno não têm teste comportamental dedicado: turmas, disciplinas, IA da disciplina, publicações, projetos e lista de salas guiadas.
- Firefox/WebKit executam apenas um subconjunto; MF2, salas guiadas e Centro ficam essencialmente cobertos em Chromium.

## 8. Drift documental e reprodutibilidade

O manifesto atual calculado sobre `real_dev/` é:

```text
files: 749
sha256: f1a8afe85c02d00e8a9af5722c2a7fc50da7a9a10fbe434db06f3f2cbe94c940
```

Os documentos existentes ainda referem manifests anteriores, incluindo 734 ficheiros. As alterações das salas guiadas e respetivos testes são posteriores à última evidence documental.

Outras divergências:

- o mapa técnico está internamente sincronizado com a sua fonte estática, mas não enumera todo o controller de salas guiadas;
- o guia de salas guiadas ainda limita o âmbito a criar/listar e considera a IA fora de scope;
- o guia do Centro omite summary, resultados individuais e notificação individual;
- o guia de disciplinas não documenta o consumidor aluno;
- `sync_real_dev_status.py` fixa a data em `2026-07-10`, fazendo `docs:verify` pedir uma regressão de data para documentos atualizados em 11/07;
- alguns guias pedem `test:integration`/`test:contracts`, scripts que não existem no `package.json` da API.

Como `real_dev/` é ignorado por Git, `git status` e o histórico não permitem reconstruir estas alterações. O manifesto deve ser tratado como âncora mínima até existir um processo de versionamento/release explícito.

## 9. Plano de correção recomendado

### P0 — Corrigir antes de declarar paridade integral

1. Unificar a fonte de verdade das turmas no dashboard do aluno.
2. Unificar renovação e versionamento de consentimentos `CLASS_AI`.
3. Redefinir a fonte de atividade do Centro e guardar a data de entrada na turma.
4. Impor invariantes entre sala guiada aberta e mini-teste associado.
5. Implementar publicação de projetos em rascunho.
6. Fazer o restore de material alterar atomicamente o conteúdo efetivo.

### P1 — Completar entrega, contratos e privacidade

1. Implementar lifecycle read/unread e atualização do tray.
2. Introduzir outbox/retry e feedback de entrega de notificações.
3. Separar preferências de acompanhamento, turma e objetivos.
4. Criar DTO discente minimizado para turmas.
5. Incluir `myParticipation` no detalhe da sala.
6. Persistir e expor os históricos próprios de Class/Project AI.
7. Definir lifecycle de edição/arquivo de turmas e disciplinas.

### P2 — Consolidar UX, testes e documentação

1. Corrigir loading/error/empty nas páginas do aluno.
2. Mostrar descrição da disciplina e usar paginação do histórico IA.
3. Decidir se salas colaborativas podem ligar opcionalmente a disciplinas oficiais.
4. Criar um agregador de salas guiadas ou melhorar a descoberta.
5. Atualizar nomenclatura do Centro em navegação e testes.
6. Atualizar mapa técnico, inventário, guias e gerador de estado.

## 10. Critérios de aceitação para fecho

A paridade pode ser declarada integral quando, no mínimo:

- uma alteração docente é lida pelo aluno a partir da mesma fonte de verdade;
- remoção de membership revoga todos os recursos derivados;
- consentimentos antigos são identificados e renovados sem fluxo oculto;
- atividade/inatividade é calculada sobre eventos definidos e completos;
- nenhum ciclo sala/teste produz estados impossíveis;
- rascunhos e versões têm transições funcionais observáveis pelo aluno;
- notificações têm entrega observável e estado por destinatário;
- os response DTOs do aluno são minimizados;
- há E2E positivo professor → aluno para turmas, voz, salas, notificações, materiais, projetos e chat;
- unit tests, builds, E2E, inventário e `docs:verify` passam sobre o mesmo manifesto.

## 11. Veredito

**Não aprovar ainda como “paridade professor → aluno integral”.**

O sistema tem uma base forte e os fluxos mais importantes já existem, mas os achados `PA-001` a `PA-006` representam divergências funcionais concretas entre o que o professor faz e o que o aluno vê ou consegue concluir. Depois dessas correções, o segundo bloco prioritário deve ser notificações, contratos minimizados e prova end-to-end.
