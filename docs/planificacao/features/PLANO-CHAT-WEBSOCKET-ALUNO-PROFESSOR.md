# Plano Técnico — Chat WebSocket Aluno-Professor por Disciplina

## Resumo executivo

Este plano define o MVP de chat em tempo real entre alunos e professor no contexto de uma disciplina, preservando o chat aluno-aluno existente em grupos de estudo.

Esta feature é uma extensão transversal da implementação de referência. Não cria nem renumera
RFs ou BKs canónicos e não altera RF42, que continua limitado às mensagens e notas assíncronas
dos grupos. Os dois sistemas são coletivos e não oferecem conversas privadas.

A raiz operacional escolhida é `real_dev/`:

- backend: `real_dev/api`
- frontend: `real_dev/web`

O chat guarda histórico em MongoDB e usa WebSocket apenas para entrega em tempo real. A autorização continua sempre no backend.

## Contexto encontrado no código

Factos auditados:

- A autenticação usa sessão opaca em cookie HttpOnly `sf_sid`, validada por `SessionGuard` e `SessionService`.
- `Subject` tem `classId` e `teacherId`.
- `SubjectsService.findSubjectForStudent(studentId, subjectId)` valida aluno inscrito na turma da disciplina.
- `SubjectsService.findOwnedSubject(teacherId, subjectId)` valida professor responsável pela disciplina.
- O chat aluno-aluno actual usa `StudyGroupMessages` e `StudyGroupsService.ensureMember`, é assíncrono e não deve ser alterado.
- O projecto não tinha suporte WebSocket declarado antes desta feature.

## Decisão recomendada

Criar um módulo isolado `teacher-student-chat`, separado do chat aluno-aluno.

O MVP usa:

- REST para histórico inicial:
  - `GET /api/student/subjects/:subjectId/chat/messages`
  - `GET /api/teacher/subjects/:subjectId/chat/messages`
- Socket.IO no namespace `/subject-chat` para:
  - `subject-chat:join`, com acknowledgement tipado;
  - `subject-chat:send`, com acknowledgement tipado e chave de idempotência;
  - `subject-chat:message`
  - `subject-chat:error`

O cliente nunca envia `authorUserId`, `authorRole`, `classId` ou `teacherId`; esses valores são sempre derivados da sessão e da disciplina autorizada.

## Modelo de dados

`TeacherStudentChatThread`:

- `subjectId`
- `classId`
- `teacherId`
- `status: "OPEN" | "ARCHIVED"`
- timestamps

`TeacherStudentChatMessage`:

- `threadId`
- `subjectId`
- `classId`
- `authorUserId`
- `authorRole: "STUDENT" | "TEACHER"`
- `text`
- `clientMessageId` opcional para idempotência compatível
- `tombstonedAt` opcional após eliminação da conta
- timestamps

Índices:

- `{ subjectId: 1 }` único em threads
- `{ threadId: 1, createdAt: -1 }`
- `{ threadId: 1, authorUserId: 1, createdAt: -1 }`
- `{ threadId: 1, authorUserId: 1, clientMessageId: 1 }` único apenas quando a chave existe

## Segurança e privacidade

- WebSocket valida `Origin` contra `WEB_ORIGIN`.
- Handshake WebSocket lê `sf_sid` do header `Cookie` e chama `SessionService.requireSession`. A sessão v2 contém apenas `{ userId, sessionVersion }`; papel, `accountStatus` e versão são relidos do MongoDB.
- `join` e `send` revalidam sessão e autorização por disciplina em cada evento. Uma conta que deixou de estar `ACTIVE`, uma mudança de papel ou uma versão divergente devolve acknowledgement `SESSION_REVOKED`, remove o socket das rooms e termina a ligação.
- Antes de qualquer broadcast passivo, o gateway volta a confirmar que cada socket continua autorizado. Pertencer à room não é autorização permanente.
- Mensagem vazia ou acima de 4000 caracteres é rejeitada no backend.
- Rate limit básico: 10 mensagens por minuto por utilizador/thread.
- Eventos de erro expõem apenas `code` e `message`.
- Logs e respostas não expõem password hash, sessão, emails de participantes ou conteúdo fora da mensagem autorizada.

Contrato de acknowledgement:

- sucesso de `join`: `{ ok: true, subjectId }`;
- sucesso de `send`: `{ ok: true, message }`;
- erro de `join` ou `send`: `{ ok: false, error: { code, message } }`;
- o frontend atual envia sempre um `clientMessageId` UUID, enquanto gateway e service o aceitam como opcional para compatibilidade com clientes anteriores;
- quando existe, `clientMessageId` é único por autor/thread e um retry devolve a mesma mensagem persistida, sem criar um segundo documento;
- o gateway volta a emitir a mensagem devolvida pelo retry; o cliente atual evita duplicação visual ao fundir mensagens por `_id`.

## Impacto no frontend

O frontend adiciona:

- cliente `subject-chat-client.ts` com histórico REST e Socket.IO `withCredentials: true`;
- `SubjectChatPanel` reutilizável;
- página de aluno `/app/disciplinas/:subjectId/chat`;
- página docente `/app/professor/disciplinas/:subjectId/chat`;
- links de chat nas listagens de disciplinas, com ícone `message` junto ao texto `Chat`;
- proxy Vite `/socket.io` com `ws: true`.

O cliente regista handlers antes de ligar, espera acknowledgement positivo de `join` antes de ativar o envio e mantém um único listener por evento. O envio cria um `clientMessageId`, mantém o draft até acknowledgement positivo e reconcilia a resposta com o broadcast recebido. A lista funde histórico, acknowledgement e broadcast por `_id` e ordena por `createdAt`; não existe optimistic UI antes da confirmação do servidor.

Falha de ligação, timeout ou acknowledgement negativo preservam o draft e apresentam a mensagem pública recebida ou um erro genérico controlado. A UI distingue Online/Offline, mas não implementa atualmente uma máquina de estados própria para `403`, `5xx` e `SESSION_REVOKED`; a socket é desligada pelo backend nas falhas de sessão aplicáveis.

## Estado de implementação em `real_dev`

Implementado em `real_dev/api`:

- módulo `TeacherStudentChatModule` importado por `AppModule`;
- schemas `TeacherStudentChatThread` e `TeacherStudentChatMessage`;
- REST de histórico para aluno e professor;
- service com autorização por `SubjectsService`, validação de texto e rate limit básico;
- gateway Socket.IO no namespace `/subject-chat`;
- testes unitários do service e testes do gateway.

Implementado em `real_dev/web`:

- cliente `subject-chat-client.ts` para histórico REST e socket;
- painel `SubjectChatPanel` com loading, vazio, erro, estado online/offline, contador e envio;
- páginas `/app/disciplinas/:subjectId/chat` e `/app/professor/disciplinas/:subjectId/chat`;
- links `Chat` com ícone `message` nas páginas de disciplinas do aluno e do professor;
- proxy Vite `/socket.io` com `ws: true`;
- transporte Socket.IO limitado a `websocket`, sem fallback para long-polling.

O hardening atual inclui `sessionVersion`/`accountStatus`, revalidação por evento e antes de broadcast, acknowledgements tipados, idempotência persistente, reconciliação pós-join e deduplicação visual. Continuam fora do MVP paginação, estados de leitura, nomes dos participantes, conversas privadas, moderação e suporte multi-instância.

Validação local registada:

- `npm --prefix real_dev/api test -- teacher-student-chat.service` passou;
- `npm --prefix real_dev/web run build` passou;
- `npm --prefix real_dev/api run build` passou depois da instalação efetiva em `real_dev/api/node_modules` de `@nestjs/websockets`, `@nestjs/platform-socket.io` e `socket.io`.

## Plano de testes

Backend:

- aluno inscrito lê e envia;
- professor responsável lê e envia;
- aluno não inscrito e professor não dono falham;
- admin fica fora do MVP;
- texto vazio e texto demasiado longo são rejeitados;
- rate limit bloqueia excesso;
- handshake sem cookie falha;
- `join` sem autorização responde com acknowledgement de erro e não entra na room;
- `send` persiste uma vez, responde com acknowledgement e só depois emite para a room correta;
- sessão revogada após o handshake falha no próximo `join`/`send` e antes de um broadcast passivo;
- retry com o mesmo `clientMessageId` devolve a mesma mensagem sem duplicar o documento e a UI funde novo evento por `_id`;
- dois sockets da mesma sessão são ambos revogados depois de `sessionVersion` mudar.

Frontend/build:

- `npm --prefix real_dev/api run test:unit`
- `npm --prefix real_dev/api run build`
- `npm --prefix real_dev/web run build`

Frontend/component/E2E:

- handlers são instalados antes de `connect()` e removidos no cleanup;
- o draft só é limpo após acknowledgement positivo;
- timeout, falha de ligação e acknowledgements negativos preservam o rascunho e mostram erro controlado;
- reconnect/retry/broadcast fora de ordem são reconciliados e deduplicados;
- a rota do chat é lazy e `socket.io-client` não aparece no chunk público nem na primeira rota não-chat;
- axe não reporta violações `serious` ou `critical` e o fluxo funciona apenas por teclado.

## Riscos e decisões em aberto

- As dependências WebSocket têm de continuar sincronizadas entre `package.json`, `package-lock.json` e `node_modules`.
- A arquitetura é single-instance local. Uma futura passagem a multi-instância reabre a decisão de adapter/pub-sub e exige reauditoria da autorização de broadcasts.
- Não há co-docência no modelo actual; professor responsável significa `Subject.teacherId`.
- `ARCHIVED` existe no modelo, mas sem endpoint no MVP.
- O MVP não inclui anexos, mensagens privadas, edição/apagamento, unread counts, presença online, moderação avançada ou migração do chat aluno-aluno.
