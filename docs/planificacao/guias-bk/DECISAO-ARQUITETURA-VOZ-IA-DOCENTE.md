# Decisao de arquitetura - Heranca da voz IA docente

## Header

- `doc_id`: `DECISAO-ARQUITETURA-VOZ-IA-DOCENTE`
- `path`: `docs/planificacao/guias-bk/DECISAO-ARQUITETURA-VOZ-IA-DOCENTE.md`
- `area`: `teacher-ai`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-30`

## Objetivo

Documentar a alteracao extra-planificacao que passa a voz docente para uma configuracao base da turma, mantendo a voz da disciplina como override opcional.

Esta decisao complementa os BKs existentes e prevalece sobre exemplos legacy que descrevam apenas configuracao direta por `subjectId`.

## RFs e RNFs afetados

- `RF22`: o professor configura a voz base da IA ao nivel da turma e pode definir override opcional por disciplina.
- `RF25`: salas de estudo guiado continuam a pertencer a uma turma e podem, opcionalmente, ficar associadas a uma disciplina para herdar a voz efetiva dessa disciplina.
- `RF36`: a IA da disciplina/turma usa a voz efetiva resolvida por heranca.
- `RNF20`: ownership e boundaries por professor/turma/disciplina continuam a ser validados no backend.
- `RNF27`: a arquitetura modular deve manter `TeacherAiModule`, `ClassAiModule` e `GuidedStudyRoomsModule` separados.
- `RNF28`: o mapa tecnico deve listar modelos, endpoints e fluxos criticos desta heranca.
- `RNF32`: IA privada, IA de sala livre, IA de sala colaborativa e IA de turma/disciplina continuam em perfis distintos.
- `RNF33`: os limites definidos pelo professor incluem voz base de turma e override de disciplina.

## Contrato backend/API

### Modelos

- `TeacherClassAiVoice`: nova configuracao base por turma, em colecao separada `teacher_class_ai_voices`.
- `TeacherAiVoice`: configuracao existente por disciplina, agora tratada como override opcional.
- `GuidedStudyRoom.subjectId?`: associacao opcional a disciplina da mesma turma.

### Resolucao da voz efetiva

O `TeacherAiVoiceService` deve expor um resolvedor unico para uso runtime:

1. `SUBJECT_OVERRIDE`, se existir voz especifica da disciplina.
2. `CLASS_BASE`, se existir voz base da turma.
3. `DEFAULT`, se nao existir configuracao docente.

O contrato publico de voz deve incluir:

- `scope`: `"CLASS"` ou `"SUBJECT"`.
- `source`: `"SUBJECT_OVERRIDE"`, `"CLASS_BASE"` ou `"DEFAULT"`.
- `hasOverride`: boolean.
- `classId`, `subjectId?`, `teacherId?`, `tone`, `detailLevel`, `rules`.

### Endpoints

- `GET /api/teacher/classes/:classId/ai-voice`: ler voz base efetiva da turma.
- `PUT /api/teacher/classes/:classId/ai-voice`: criar/atualizar voz base da turma.
- `GET /api/teacher/subjects/:subjectId/ai-voice`: ler voz efetiva da disciplina, incluindo metadata de heranca.
- `PUT /api/teacher/subjects/:subjectId/ai-voice`: criar/atualizar override da disciplina.
- `DELETE /api/teacher/subjects/:subjectId/ai-voice`: remover override e voltar a herdar da turma.
- `POST /api/teacher/classes/:classId/guided-study-rooms`: criar sala guiada com `subjectId` opcional.
- `GET /api/teacher/classes/:classId/guided-study-rooms`: listar salas guiadas da turma para professor.
- `GET /api/student/classes/:classId/guided-study-rooms`: listar salas guiadas abertas para aluno inscrito.

## Contrato de UI

- A area docente de turmas deve expor link `Voz IA` para `/app/professor/turmas/:classId/voz`.
- A pagina `/app/professor/turmas/:classId/voz` configura a voz base da turma.
- A rota existente `/app/professor/disciplinas/:subjectId/voz` continua ativa, mas representa override da disciplina.
- A pagina de override deve mostrar a voz efetiva herdada quando nao existir override e permitir remover override.
- A pagina docente de salas guiadas deve permitir selecionar `Disciplina` opcional, com default `Sem disciplina especifica`.
- A listagem de salas guiadas deve mostrar se a sala herda diretamente da turma ou pela disciplina associada.
- A pagina discente de salas guiadas pode mostrar a disciplina associada, mas nao pode expor controlos de voz docente ao aluno.

## Regras para agentes

- Nao criar override proprio de voz em `GuidedStudyRoom` nesta fase.
- Nao migrar destrutivamente nem apagar vozes por disciplina existentes; passam a ser overrides.
- Nao aplicar voz docente a areas privadas do aluno, salas livres criadas por alunos ou IA colaborativa de sala.
- Nao mover regras de ownership/membership para o frontend.
- Validar sempre que `subjectId`, quando enviado numa sala guiada, pertence a mesma turma e ao professor autenticado.
- Tratar chamadas a `findForSubject`/`findVoiceForSubject` em snippets antigos como legado. O runtime novo deve usar `resolveTeacherVoice({ classId, subjectId })`.

## Validacao esperada

- Professor cria/atualiza voz base da turma.
- Aluno nao configura voz docente.
- Disciplina sem override herda voz da turma.
- Disciplina com override prevalece sobre turma.
- Remover override volta a voz da turma.
- Professor nao acede a turma/disciplina de outro professor.
- `ClassAiService` grava `voiceRulesApplied` com as regras efetivamente usadas.
- Sala guiada sem disciplina continua valida.
- Sala guiada com disciplina da mesma turma funciona.
- Disciplina de outra turma/professor e rejeitada.
- Aluno inscrito lista apenas salas abertas da turma.

