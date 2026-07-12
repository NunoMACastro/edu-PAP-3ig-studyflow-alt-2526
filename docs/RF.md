# Study Flow - Requisitos Funcionais (RF)

> Estrutura centrada no utilizador e nos principais intervenientes do ecossistema escolar.

## Índice

1. [Aluno - Estudo Individual](#1-aluno-estudo-individual)
2. [Aluno - Áreas de Estudo e IA Privada](#2-aluno-áreas-de-estudo-e-ia-privada)
3. [Aluno - Estudo em Grupo e Salas Partilhadas](#3-aluno-estudo-em-grupo-e-salas-partilhadas)
4. [Professor - Turmas, Disciplinas e IA Docente](#4-professor-turmas-disciplinas-e-ia-docente)
5. [Professor - Projetos, Testes e Curadoria](#5-professor-projetos-testes-e-curadoria)
6. [Sistema - Ingestão de Materiais e Base de Conhecimento](#6-sistema-ingestão-de-materiais-e-base-de-conhecimento)
7. [Sistema - IA (Assistentes, Guardrails, Perfis)](#7-sistema-ia-assistentes-guardrails-perfis)
8. [Comunidade - Grupos, Salas e Co-Estudo](#8-comunidade-grupos-salas-e-co-estudo)
9. [Pesquisa e Navegação](#9-pesquisa-e-navegação)
10. [Notificações e Acompanhamento](#10-notificações-e-acompanhamento)
11. [Privacidade e RGPD](#11-privacidade-e-rgpd)
12. [Administração e Operação](#12-administração-e-operação)
13. [Integrações](#13-integrações)
14. [Critérios de Aceitação](#critérios-de-aceitação-agrupados-por-funcionalidade)
15. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
16. [Créditos](#créditos)
17. [Licença](#licença)
18. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## Requisitos Funcionais

### 1. Aluno - Estudo Individual

| Código | Requisito                                         | Atores | Prioridade | Dependências |
| ------ | ------------------------------------------------- | ------ | ---------- | ------------ |
| RF01   | Registo do aluno (email/password ou SSO escolar). | Aluno  | Must       | -            |
| RF02   | Login seguro com cookies HttpOnly.                | Aluno  | Must       | -            |
| RF03   | Perfil editável (nome, ano e curso).              | Aluno  | Should     | RF02         |
| RF04   | O aluno pode estudar sem turma.                   | Aluno  | Must       | RF03         |
| RF05   | O aluno pode criar rotinas e objetivos de estudo. | Aluno  | Should     | RF03         |
| RF06   | O aluno pode consultar histórico de estudo.       | Aluno  | Should     | RF03         |

---

### 2. Aluno - Áreas de Estudo e IA Privada

| Código | Requisito                                                     | Atores         | Prioridade | Dependências |
| ------ | ------------------------------------------------------------- | -------------- | ---------- | ------------ |
| RF07   | Criar “Áreas de Estudo” (auto-disciplina independente).       | Aluno          | Must       | RF03         |
| RF08   | Submeter materiais (PDF, DOCX, URLs, tópicos).                | Aluno          | Must       | RF07         |
| RF09   | Associar estilo/tom das aulas → “voz” da IA.                  | Aluno          | Should     | RF07         |
| RF10   | Criar perfil IA da Área de Estudo.                            | Sistema, Aluno | Must       | RF08         |
| RF11   | Obter resumos IA baseados nos materiais enviados.             | Aluno          | Must       | RF08, RF10   |
| RF12   | Obter explicações, cards e quizzes personalizados.            | Aluno          | Must       | RF11         |
| RF13   | A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | Sistema        | Should     | RF11         |

---

### 3. Aluno - Estudo em Grupo e Salas Partilhadas

| Código | Requisito                                                           | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------------------- | ------- | ---------- | ------------ |
| RF14   | Criar salas de estudo com outros alunos, com etiqueta temática livre. | Aluno   | Should     | RF03         |
| RF15   | Partilhar materiais e apontamentos na sala.                         | Aluno   | Should     | RF14         |
| RF16   | IA partilhada da sala (mistura das áreas dos membros).              | Sistema | Could      | RF14         |

---

### 4. Professor - Turmas, Disciplinas e IA Docente

| Código | Requisito                                                 | Atores    | Prioridade | Dependências |
| ------ | --------------------------------------------------------- | --------- | ---------- | ------------ |
| RF19   | Criar, editar, arquivar e restaurar turmas.                | Professor | Must       | -            |
| RF20   | Criar, editar, arquivar e restaurar disciplinas associadas às turmas. | Professor | Must       | RF19         |
| RF21   | Submeter materiais oficiais TEXT, URL, PDF ou DOCX numa disciplina, com ficheiros protegidos e processamento explícito. | Professor | Must       | RF20         |
| RF22   | Configurar voz da IA docente por turma, com override opcional por disciplina. | Professor | Should     | RF21         |
| RF23   | O aluno inscrito numa turma recebe IA oficial limitada e sabe apenas se a voz docente foi aplicada. | Sistema   | Must       | RF22         |
| RF24   | Professores podem enviar avisos e publicações.            | Professor | Should     | RF19         |
| RF25   | Professores podem criar salas de estudo guiado, opcionalmente associadas a uma disciplina. | Professor | Could      | RF19         |

---

### 5. Professor - Projetos, Testes e Curadoria

| Código | Requisito                                                      | Atores    | Prioridade | Dep. |
| ------ | -------------------------------------------------------------- | --------- | ---------- | ---- |
| RF26   | Professores podem criar, editar e publicar projetos para a turma, com disciplina oficial opcional. | Professor | Should     | RF19 |
| RF27   | A IA deve ajudar o aluno a elaborar projetos de forma gradual. | IA, Aluno | Should     | RF26 |
| RF28   | Criar testes/mini-testes oficiais.                             | Professor | Must       | RF20 |
| RF29   | Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).     | Professor | Should     | RF21 |
| RF30   | Centro de Acompanhamento com atividade oficial, progresso e resultados por aluno e turma. | Professor | Should     | RF24 |

---

### 6. Sistema - Ingestão de Materiais e Base de Conhecimento

| Código | Requisito                                               | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------- | ------- | ---------- | ------------ |
| RF31   | Processar assincronamente PDFs, DOCX e URLs após pedido explícito do utilizador autorizado. | Sistema | Must       | RF08, RF21   |
| RF32   | Extrair tópicos, secções, estrutura e referências.      | Sistema | Must       | RF31         |
| RF33   | Manter versões dos materiais.                           | Sistema | Should     | RF31         |
| RF34   | Separar materiais entre “aluno”, “professor” e “turma”. | Sistema | Must       | RF31         |

---

### 7. Sistema - IA (Assistentes, Guardrails, Perfis)

| Código | Requisito                                                            | Atores  | Prioridade | Dep. |
| ------ | -------------------------------------------------------------------- | ------- | ---------- | ---- |
| RF35   | Assistente IA privado por Área de Estudo.                            | Sistema | Must       | RF10 |
| RF36   | Assistente IA da disciplina/turma com voz docente herdada.           | Sistema | Must       | RF22 |
| RF37   | Guardrails distintos para aluno solo, grupo e turma.                 | Sistema | Must       | RF35 |
| RF38   | IA não pode inventar conteúdo (citações obrigatórias).               | Sistema | Must       | RF31 |
| RF39   | IA pode recorrer a conhecimento externo (limitado) quando permitido. | Sistema | Should     | RF35 |
| RF40   | IA deve ajustar explicações ao perfil do aluno.                      | Sistema | Should     | RF13 |

---

Nota RF14: as salas colaborativas criadas pelo aluno mantêm uma etiqueta textual e são
independentes das disciplinas oficiais. Só as salas guiadas criadas pelo professor podem
referenciar uma disciplina oficial e herdar o respetivo contexto.

Nota RF19/RF20: o arquivo é reversível e preserva o histórico em modo de leitura. Arquivar uma
turma ou disciplina fecha salas guiadas abertas e testes publicados dependentes; restaurar a
entidade não reabre automaticamente esses recursos.

Nota RF22/RF36: a voz docente é resolvida por herança: override da disciplina -> voz base da turma -> predefinição. Salas guiadas docentes podem referenciar uma disciplina para herdar esse contexto, mas não têm override próprio nesta fase. O DTO do aluno expõe apenas `teacherVoiceApplied`, nunca as regras docentes internas.

### 8. Comunidade - Grupos, Salas e Co-Estudo

| Código | Requisito                           | Atores           | Prioridade | Dep. |
| ------ | ----------------------------------- | ---------------- | ---------- | ---- |
| RF41   | Criar grupos de estudo.             | Aluno            | Should     | RF14 |
| RF42   | Chat, partilha e notas coletivas.   | Aluno            | Should     | RF41 |
| RF43   | Agendar sessões de estudo coletivo. | Aluno, Professor | Could      | RF41 |
| RF44   | IA coletiva para sessões de grupo.  | Sistema          | Could      | RF41 |

Nota RF42: este requisito corresponde exclusivamente às mensagens e notas coletivas assíncronas
dos grupos de estudo, através de `GET/POST /api/study-groups/:groupId/messages`. Não inclui o
canal WebSocket da disciplina nem conversas privadas.

---

### 9. Pesquisa e Navegação

| Código | Requisito                                        | Atores | Prioridade | Dep. |
| ------ | ------------------------------------------------ | ------ | ---------- | ---- |
| RF45   | Pesquisa unificada por tópico/conceito/material. | Todos  | Must       | RF31 |
| RF46   | Navegação por programa/currículo.                | Todos  | Should     | RF31 |

---

### 10. Notificações e Acompanhamento

| Código | Requisito                                                                  | Atores    | Prioridade | Dep. |
| ------ | -------------------------------------------------------------------------- | --------- | ---------- | ---- |
| RF47   | Configurar preferências de notificações in-app por contexto.               | Todos     | Should     | RF02 |
| RF48   | Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.     | Sistema   | Should     | RF05 |
| RF49   | Notificar in-app grupos/turmas sobre mudanças de disponibilidade e estado. | Sistema   | Should     | RF24 |
| RF50   | Professores definem alertas de acompanhamento (ex.: aluno inativo X dias). | Professor | Should     | RF35 |
| RF51   | Administradores configuram políticas e quotas máximas de notificações in-app. | Admin     | Should     | RF50 |

---

### 11. Privacidade e RGPD

| Código | Requisito                         | Atores | Prioridade | Dep. |
| ------ | --------------------------------- | ------ | ---------- | ---- |
| RF52   | Exportar dados pessoais.          | Todos  | Must       | -    |
| RF53   | Eliminar conta e dados.           | Todos  | Must       | -    |
| RF54   | Gestão de consentimentos para IA. | Todos  | Must       | -    |

---

### 12. Administração e Operação

| Código | Requisito                                                             | Atores | Prioridade | Dep  |
| ------ | --------------------------------------------------------------------- | ------ | ---------- | ---- |
| RF55   | Gestão de utilizadores e papéis.                                      | Admin  | Must       | RF04 |
| RF56   | Auditoria completa (materiais, IA, papéis).                           | Admin  | Must       | RF55 |
| RF57   | Configurar modelos de IA e limites de uso.                            | Admin  | Should     | RF35 |
| RF58   | Definir **quotas de IA** por aluno/turma/grupo e monitorizar consumo. | Admin  | Should     | RF57 |

---

### 13. Integrações

| Código | Requisito                                                              | Atores           | Prioridade |
| ------ | ---------------------------------------------------------------------- | ---------------- | ---------- |
| RF61   | Integração com Drives (Google/OneDrive) para importação unidirecional de materiais de estudo. | Professor, Aluno | Should     |

---

## Critérios de Aceitação (Agrupados por Funcionalidade)

### A) Resumos com IA (RF11, RF35, RF36, RF38)

-   Resumo deve indicar página/secção de origem.
-   Não pode incluir conteúdo não existente nos ficheiros fornecidos.
-   Quando a voz do professor está ativa, o resumo deve refletir o tom docente.

### B) Quizzes e Testes (RF12, RF28, RF29)

-   Perguntas MCQ devem ter 1 resposta correta e 3 distratores.
-   Explicações precisam de referência ao material.
-   O sistema guarda desempenho por tópico e disciplina.

### C) Estudo em Grupo e Salas (RF14–RF16, RF41–RF44)

-   Apenas membros podem ver materiais da sala.
-   IA da sala deve respeitar guardrails de grupo.
-   Sessões coletivas devem registar participação e histórico.

### D) Projetos e Acompanhamento (RF26–RF27)

-   IA deve dividir projetos em passos sequenciais.
-   Professores podem validar entregas e verificar evolução.

### E) Turmas e Disciplinas (RF19–RF25)

-   Apenas alunos inscritos têm acesso ao conteúdo oficial.
-   O aluno pode pertencer a várias turmas oficiais; o dashboard deriva as turmas do membership e não de texto livre no perfil.
-   Entidades arquivadas preservam histórico em modo de leitura e deixam de aceitar novas ações de aprendizagem.
-   Mutações descendentes e archive escrevem fences monotónicos na mesma transaction; uma corrida nunca deixa confirmar um novo recurso sob turma/disciplina arquivada.
-   GETs próprios de IA, conteúdo aprovado, chat, materiais, testes e ranking podem consultar histórico; POST/PATCH/send continuam limitados a entidades ativas.
-   A IA docente usa exclusivamente materiais aprovados.

### F) Materiais e Indexação (RF08, RF21, RF31–RF34)

-   O upload oficial aceita `TEXT`, `URL`, `PDF` e `DOCX`; os ficheiros ficam `PENDING_PROCESSING` e só entram na IA após um pedido explícito de indexação autorizado terminar com sucesso.
-   Sistemas devem extrair texto, estrutura e tópicos do documento em worker recuperável, sem devolver texto extraído, `storageKey`, hashes ou paths ao browser.
-   Versionamento deve permitir reversão.
-   Estruturas e versões derivadas revalidam role atual, ownership e lifecycle; um job antigo não conserva permissões após mudança de papel.
-   Uploads ficam limitados a 10 MiB por ficheiro e 250 MiB partilhados entre ficheiros privados e oficiais do utilizador; o título oficial tem 2–160 caracteres e é validado antes de qualquer escrita.
-   O storage local usa staging, SHA-256, promoção atómica, outbox de eliminação e reconciliação de órfãos nas duas coleções.
-   PDF/DOCX podem ser abertos ou descarregados apenas pelo professor proprietário ou por aluno com inscrição atual/histórica compatível; respostas binárias usam MIME canónico, nome seguro e `Cache-Control: private, no-store`.
-   URLs são validados por hop contra SSRF, incluindo IPv4-mapped IPv6, DNS rebinding, redes reservadas/link-local e endpoints de metadata.

### G) Autenticação, sessões e papéis (RF02, RF53, RF55)

-   Redis guarda apenas `{ userId, sessionVersion }`; cada pedido relê `role`, `accountStatus` e `sessionVersion` em MongoDB.
-   Mudança de papel e eliminação incrementam `sessionVersion`; uma divergência devolve `401 SESSION_REVOKED` e revoga igualmente WebSockets.
-   Mudança de papel e eliminação são transacionais. Um sentinel atómico impede que duas operações concorrentes removam o último administrador.

### H) IA governada (RF11–RF13, RF16, RF27, RF35–RF40, RF44, RF54, RF57–RF58)

-   `GovernedAiExecutionService` é a única fronteira autorizada a contactar o provider. A ordem é autorização, consentimento, policy, limites, guardrails, reserva atómica de quota, provider, validação de output e audit seguro.
-   `ROOM_AI` é uma finalidade separada, começa desativada e não recebe consentimento automático.
-   Consentimento, finalidade desativada, quota e timeout têm erros estáveis; quando um gate falha, o provider não é chamado.

### I) Testes oficiais e ranking (RF28)

-   O ciclo é `DRAFT → PUBLISHED → CLOSED`; apenas `DRAFT` é editável.
-   Cada teste contém 1–60 perguntas, exatamente quatro opções distintas e índice da correta explicitamente escolhido.
-   Cada aluno dispõe de no máximo três tentativas numeradas atomicamente. As soluções completas aparecem apenas após a terceira tentativa ou o fecho.
-   O ranking usa `BEST_ATTEMPT`: uma linha por aluno, maior percentagem; empate pela melhor tentativa mais antiga e depois ID estável. A resposta inclui `attemptCount`, `bestPercentage` e `bestAnsweredAt`.

### J) Notificações (RF47–RF51)

-   DTOs destinados ao utilizador nunca incluem `recipientIds` nem `suppressedRecipientIds`; vistas administrativas devolvem apenas contagens agregadas.
-   A entrega suportada nesta fase é exclusivamente in-app. Email e push são rejeitados pelo contrato e não aparecem na UI.
-   A inbox tem estado lido/arquivado, cursor e contador de não lidas; a entrega usa outbox persistente, lease, retry e backoff.
-   Eventos automáticos limitam-se a alterações de disponibilidade/estado, como membership, arquivo/restauro, publicação, abertura/fecho e aprovação/retirada.
-   O POST manual aceita apenas material, feedback e tarefa; tipos automáticos/lifecycle pertencem exclusivamente aos services de domínio e à outbox.
-   Quotas anti-spam aplicam-se a envios manuais; eventos automáticos respeitam canal/preferência mas não são descartados pela quota.
-   As memberships são revalidadas no delivery; a remoção só chega se o aluno continuar fora da turma e é descartada se entretanto ocorreu reinscrição.

### J.1) Centro de Acompanhamento (RF30, RF50)

-   A inatividade é calculada por turma a partir de atividade oficial nessa turma e da data de entrada do membership.
-   Estudo privado e atividade autónoma fora da turma não contam para sinais docentes.
-   O detalhe individual agrega factos, progresso de salas guiadas, melhor tentativa em testes e quizzes IA aprovados; não calcula score de risco nem expõe resultados de colegas.

### K) Privacidade e eliminação (RF52–RF56)

-   Um `PersonalDataRegistry` classifica todos os models como `DELETE`, `PULL_MEMBERSHIP`, `ANONYMIZE_90D` ou `RETAIN_NONPERSONAL`; models sem política bloqueiam o release.
-   A exportação cobre todas as categorias do titular, exclui hashes/secrets/dados de terceiros e é descarregada como attachment JSON.
-   Regras, origem, tom e detalhe da voz docente são omitidos também do export do aluno; o contrato público conserva apenas o booleano factual de aplicação da voz.
-   A eliminação revoga sessões, aplica políticas numa transaction e cria outbox para ficheiros. A referência retida é aleatória, não contém `userId` e expira em 90 dias; auditoria relacionada é anonimizada e sujeita ao mesmo TTL.

### L) Navegação e comunicação em tempo real

-   Rotas protegidas e por papel bloqueiam antes de montar componentes ou lançar pedidos; existem estados 403, 404 e error boundary.
-   RF42 usa REST assíncrono protegido por membership; não usa acknowledgements WebSocket.
-   Como extensão transversal implementada fora da numeração canónica de RF/BK, o chat coletivo da disciplina usa acknowledgements tipados em `join`/`send`, revalidação de sessão, deduplicação por `_id` e só limpa o rascunho após confirmação positiva. O contrato pertence ao [plano técnico do chat aluno-professor](planificacao/features/PLANO-CHAT-WEBSOCKET-ALUNO-PROFESSOR.md).

## Sugestão de MVP organizado por fases e RF

A fronteira entre requisitos futuros e o perfil implementado de PAP local está registada na
[matriz normativa da planificação](planificacao/README.md#matriz-de-requisitos-futuros-e-fronteira-pap-local).
Ela é uma regra derivada e não altera os 57 IDs RF.

-   **Fase 1 - Estudo Individual:** RF01–RF13, focando áreas privadas, ingestão de materiais e assistente IA pessoal.
-   **Fase 2 - Professores e Turmas:** RF14–RF16 e RF19–RF39, adicionando gestão docente, projetos/testes e painéis de progresso.
-   **Fase 3 - Comunidade e Notificações:** RF40–RF51, cobrindo grupos, salas colaborativas e alertas inteligentes.
-   **Fase 4 - Operação e Integrações:** RF52–RF58 e RF61, com privacidade, administração avançada, quotas de IA e integrações externas.

## Créditos

-   Projeto: StudyFlow
-   Equipa: Natália, Daniel, Guilherme, Kaua
-   Orientador: Nuno Castro e Cláudia Marques

---

## Licença

Projeto académico destinado exclusivamente a fins educativos.

---

## Changelog

-   **2024-04-27** - Reorganização do RF.md para o formato padrão com secções de MVP, créditos, licença e changelog.
-   **2026-04-17** - Ajuste de escopo MVP StudyFlow com remoção de funcionalidades cortadas e simplificação da integração Drive.
-   **2026-07-10** - Contratos de aceitação alinhados com a remediação integral para PAP local endurecida (sessões, IA, storage, testes, notificações, RGPD e frontend).
-   **2026-07-11** - Paridade professor-aluno alinhada end-to-end: memberships oficiais múltiplos, lifecycle académico, centro por atividade oficial, IA transparente, projetos, materiais, testes e notificações in-app fiáveis.
-   **2026-07-11** - RF21/RF31 clarificados para upload oficial PDF/DOCX, indexação assíncrona iniciada explicitamente, storage partilhado e leitura binária protegida.
