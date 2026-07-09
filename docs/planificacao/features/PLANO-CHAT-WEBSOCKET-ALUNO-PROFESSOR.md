# Plano Técnico — Chat WebSocket Aluno-Professor por Disciplina

## Resumo executivo

Este plano define o MVP de chat em tempo real entre alunos e professor no contexto de uma disciplina, preservando o chat aluno-aluno existente em grupos de estudo.

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
  - `subject-chat:join`
  - `subject-chat:send`
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
- timestamps

Índices:

- `{ subjectId: 1 }` único em threads
- `{ threadId: 1, createdAt: -1 }`
- `{ threadId: 1, authorUserId: 1, createdAt: -1 }`

## Segurança e privacidade

- WebSocket valida `Origin` contra `WEB_ORIGIN`.
- Handshake WebSocket lê `sf_sid` do header `Cookie` e chama `SessionService.requireSession`.
- `join` e `send` repetem autorização por disciplina.
- Mensagem vazia ou acima de 4000 caracteres é rejeitada no backend.
- Rate limit básico: 10 mensagens por minuto por utilizador/thread.
- Eventos de erro expõem apenas `code` e `message`.
- Logs e respostas não expõem password hash, sessão, emails de participantes ou conteúdo fora da mensagem autorizada.

## Impacto no frontend

O frontend adiciona:

- cliente `subject-chat-client.ts` com histórico REST e Socket.IO `withCredentials: true`;
- `SubjectChatPanel` reutilizável;
- página de aluno `/app/disciplinas/:subjectId/chat`;
- página docente `/app/professor/disciplinas/:subjectId/chat`;
- links de chat nas listagens de disciplinas, com ícone `message` junto ao texto `Chat`;
- proxy Vite `/socket.io` com `ws: true`.

O envio é conservador: a UI só mostra mensagens recebidas do servidor por `subject-chat:message`.

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
- proxy Vite `/socket.io` com `ws: true`.

Validação local registada:

- `npm --prefix real_dev/api test -- teacher-student-chat.service` passou;
- `npm --prefix real_dev/web run build` passou;
- `npm --prefix real_dev/api run build` ainda depende da instalação efetiva em `real_dev/api/node_modules` de `@nestjs/websockets`, `@nestjs/platform-socket.io` e `socket.io`.

## Plano de testes

Backend:

- aluno inscrito lê e envia;
- professor responsável lê e envia;
- aluno não inscrito e professor não dono falham;
- admin fica fora do MVP;
- texto vazio e texto demasiado longo são rejeitados;
- rate limit bloqueia excesso;
- handshake sem cookie falha;
- `join` sem autorização emite `subject-chat:error`;
- `send` persiste e emite para a room correcta.

Frontend/build:

- `npm --prefix real_dev/api run test:unit`
- `npm --prefix real_dev/api run build`
- `npm --prefix real_dev/web run build`

## Riscos e decisões em aberto

- As dependências WebSocket têm de estar instaladas em `real_dev/api` e `real_dev/web` para build/test passarem.
- Não há co-docência no modelo actual; professor responsável significa `Subject.teacherId`.
- `ARCHIVED` existe no modelo, mas sem endpoint no MVP.
- O MVP não inclui anexos, mensagens privadas, edição/apagamento, unread counts, presença online, moderação avançada ou migração do chat aluno-aluno.
