# Relatório Técnico — Implementação dos Chats

**Atualizado em:** 14 de julho de 2026
**Âmbito:** `real_dev/api` e `real_dev/web`

## 1. Estado atual

O StudyFlow dispõe de dois canais coletivos em tempo real, isolados por domínio:

| Canal | Participantes | Namespace | Room | Histórico |
|---|---|---|---|---|
| Disciplina | professor responsável e alunos inscritos | `/subject-chat` | `subject:<subjectId>` | REST, 100 mensagens |
| Grupo de estudo | apenas alunos membros do grupo | `/study-group-chat` | `study-group:<groupId>` | REST, 100 mensagens |

Não existem conversas privadas um-para-um. O chat da disciplina mantém as rotas, eventos e permissões anteriores. O chat do grupo reutiliza a mesma experiência frontend, mas tem gateway, eventos, persistência e autorização próprios.

As notas do grupo continuam deliberadamente separadas: usam REST, aparecem na tab `Notas`, não abrem WebSocket e não entram nos contadores unread.

## 2. Chat dos grupos de estudo

### Contratos públicos

- `GET /api/study-groups/:groupId/messages` — histórico combinado compatível;
- `GET /api/study-groups/:groupId/messages?kind=MESSAGE|NOTE` — histórico filtrado;
- `POST /api/study-groups/:groupId/messages` — compatibilidade e criação de notas;
- `GET /api/student/study-group-chat/unread` — contadores bulk;
- `PUT /api/study-groups/:groupId/messages/read` — avança o cursor pessoal;
- `POST /api/study-groups/:groupId/members` — adiciona aluno, apenas pelo proprietário.

Eventos Socket.IO:

- cliente → servidor: `study-group-chat:join`, `study-group-chat:send`;
- servidor → cliente: `study-group-chat:message`, `study-group-chat:error`;
- ambos os comandos devolvem acknowledgement tipado.

O envio aceita apenas `MESSAGE`, texto até 4000 caracteres e um `clientMessageId` UUID v4. A mensagem é persistida antes do broadcast. O índice único parcial `groupId + authorStudentId + clientMessageId` torna retries e colisões concorrentes idempotentes.

### Segurança

- o handshake valida `Origin` e lê exclusivamente o cookie HttpOnly `sf_sid`;
- apenas uma sessão ativa com role `STUDENT` é aceite;
- membership é verificada no `join`, novamente no `send` e em todas as sockets passivas antes do broadcast;
- autor e grupo efetivo são derivados da sessão e do recurso autorizado;
- um grupo inacessível não é enumerado;
- o rate limit é 10 mensagens por minuto, por aluno e grupo;
- a consulta idempotente ocorre antes do rate limit;
- mutações WebSocket são coordenadas com `AccountLifecycleBarrierService`;
- não existe adapter Redis Socket.IO: este release suporta uma única instância.

### Persistência e privacidade

`StudyGroupMessage` mantém os documentos antigos e ganhou apenas `clientMessageId` opcional. Mensagens e notas continuam com política `TOMBSTONE` na eliminação de conta.

`StudentStudyGroupChatReadState` guarda `studentId`, `groupId`, `lastReadAt` e `lastReadMessageId` opcional, com índice único por aluno/grupo e política RGPD `DELETE`.

Os nomes dos alunos são resolvidos dinamicamente em batch através de `StudentProfileService`. O contrato público inclui `authorDisplayName`; na ausência de perfil usa `Aluno XXXX`, derivado do ID. Emails nunca são devolvidos. Tombstones devolvem identidade e conteúdo como `null`. No chat da disciplina, autores docentes continuam identificados como `Professor`.

## 3. Experiência frontend comum

`RealtimeChatPanel` concentra os comportamentos partilhados pelos adapters de disciplina e grupo:

- carregamento e reconciliação do histórico;
- deduplicação por `_id` e ordenação cronológica;
- estados Online/Offline e timeout de 10 segundos;
- rascunho preservado em erro;
- retry com o mesmo UUID;
- limpeza de handlers e disconnect;
- loading, erro, vazio, read-only e tombstones;
- nome do autor, data, formulário e contador `0/4000`.

O workspace do grupo preserva bookmarks:

- `/app/grupos/:groupId` e `/mensagens` abrem `Conversar`;
- `/app/grupos/:groupId/notas` abre `Notas`;
- `/app/grupos/:groupId/sessoes` mantém `Sessões`.

O proprietário vê `Adicionar membro` no `PageHeader` e usa um `SidePanel` com email; o painel permanece aberto em erro e fecha após sucesso. Os cartões do hub e a tab `Conversar` mostram unread, que é limpo quando o histórico fica visível e atualizado por cada mensagem recebida enquanto o chat está aberto.

## 4. Compatibilidade e limites deliberados

- sem migração destrutiva ou backfill;
- mensagens e notas antigas continuam legíveis;
- o POST REST antigo continua funcional;
- rotas e eventos da disciplina não mudaram;
- sem novas dependências;
- sem typing indicators, presença, recibos individuais, paginação, anexos, moderação, edição, remoção ou push;
- sem suporte multi-instância nesta alteração.

## 5. Validação automatizada

A implementação inclui:

- testes unitários de perfil público, membership owner-only, mensagens, idempotência, rate limit, unread e gateways;
- regressões do service/gateway e frontend do chat da disciplina;
- integração real com Mongo replica set, store de sessão E2E e sockets Socket.IO reais;
- testes frontend do núcleo/adapters, reconciliação, retry, notas REST e cliente unread;
- cobertura RGPD do novo modelo e cascata de grupos exclusivos;
- builds da API e do frontend;
- E2E multi-contexto e validação de browser/acessibilidade registados no fecho da implementação.

Resultados finais desta implementação:

| Gate | Resultado |
|---|---|
| API, excluindo apenas o gate de versão exata do runtime | 160 suites, 840 testes, PASS |
| Frontend Vitest | 56 ficheiros, 257 testes, PASS |
| Build API | PASS |
| Build frontend | PASS |
| Integração real do chat de grupo | 2 testes com Mongo replica set, sessão E2E e sockets reais, PASS |
| E2E crítico do chat | Chromium, Firefox e WebKit, PASS |
| Viewports e teclado | `320×720`, `375×812`, `768×1024`, `1440×900`, PASS |
| Axe | sem findings `serious` ou `critical`, PASS |
| Regressão MF3 | PASS |

Limitações ambientais/residuais observadas:

- `verify-local-release.spec.ts` exige Node exatamente `24.11.1`; o ambiente de execução disponibilizou `24.17.0` e o runtime bundled `24.14.0`;
- a regressão E2E MF2 falhou duas vezes no passo antigo da resposta determinística da IA privada. A MF3 e todos os gates de chat passaram; não houve alteração no fluxo MF2/IA privada nesta implementação.

Os artefactos técnicos são gerados por `technical-map:write` e `function-inventory:write`; não são editados manualmente. O manifesto é recalculado apenas depois dos gates finais.
