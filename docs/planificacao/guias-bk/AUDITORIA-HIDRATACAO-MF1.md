---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# Auditoria de guias BK - MF1

## Metadados

- MF processada: `MF1`
- Modo: `auditar_apenas`
- Estado: `auditado`
- Data: `2026-05-31`
- Escopo: auditoria documental e técnica dos BKs da `MF1`, sem edição de BKs dos alunos.
- BKs analisados: `10`
- BKs editados nesta execução: `0`
- Código em `apps/`: tratado como código inicial não validado; não foi usado como contrato técnico final.

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os BKs em `docs/planificacao/guias-bk/MF0/`
- Todos os BKs em `docs/planificacao/guias-bk/MF1/`
- BKs posteriores dependentes em `MF2`, `MF3` e `MF4`

## Resultado da auditoria

| Momento | `OK` | `PARCIAL` | `CRÍTICO` |
| --- | ---: | ---: | ---: |
| Antes de qualquer correção nesta execução | 10 | 0 | 0 |
| Depois desta execução | 10 | 0 | 0 |

Como o modo desta execução é `auditar_apenas`, nenhum BK foi reescrito. A classificação reflete o estado atual dos guias no repositório.

## Classificação por BK

| BK | Estado | Fundamentação |
| --- | --- | --- |
| `BK-MF1-01` | `OK` | Estende a IA individual depois de `BK-MF0-12`, preserva `StudyToolsService`, `SummariesService`, `AiAreaProfileService` e `AI_PROVIDER`, valida ownership da área e bloqueia geração sem fontes `READY`. |
| `BK-MF1-02` | `OK` | Cria salas com `StudyRoomsService`, membership explícito, endpoints reais e cliente frontend com `credentials: 'include'`; não mistura disciplinas oficiais antes de `BK-MF1-08`. |
| `BK-MF1-03` | `OK` | Partilha materiais e notas na sala com membership, ownership de materiais da MF0 e `RoomSharesService` exportado para `BK-MF1-04`. |
| `BK-MF1-04` | `OK` | IA da sala usa `RoomSharesService.findUsableSharesForRoom`, `StudyRoomsService.ensureMember`, `AiModule` e bloqueio sem fontes autorizadas. |
| `BK-MF1-07` | `OK` | Cria a base docente de turmas, documenta `MONGODB_URI` local, seed bloqueada em produção, professor/aluno de validação e `ClassesService` exportado. |
| `BK-MF1-08` | `OK` | Cria disciplinas dentro de turmas, valida ownership com `ClassesService.findOwnedClass` e prepara `findOwnedSubject`/`findSubjectForStudent`. |
| `BK-MF1-09` | `OK` | Materiais oficiais ficam ligados à disciplina do professor, distinguem `PROCESSED` de `REFERENCE_ONLY` e exportam `OfficialMaterialsService`. |
| `BK-MF1-10` | `OK` | Voz docente é estilo pedagógico textual, com voz base por turma, override opcional por disciplina e export de `TeacherAiVoiceService`. |
| `BK-MF1-11` | `OK` | IA limitada valida inscrição, usa materiais oficiais `PROCESSED`, voz docente efetiva resolvida e `AI_PROVIDER` herdado via `AiModule`, sem duplicar provider. |
| `BK-MF1-12` | `OK` | Publicações oficiais validam professor dono ou aluno inscrito, usam `ClassPostsService` e preparam dependentes de notificações/painel. |

## BKs PARCIAL ou CRÍTICO

Não foram encontrados BKs `PARCIAL` ou `CRÍTICO` na MF1 nesta auditoria.

## Decisões técnicas confirmadas

- `M0` é tratado como `MF0`.
- `BK-MF0-12` fecha a fundação técnica de IA: `AiModule` preserva perfil IA, resumos e study tools, e exporta `AI_PROVIDER`.
- `BK-MF1-01` acrescenta adaptação sem substituir os contratos de IA da MF0.
- A cadeia de sala é acumulada: `BK-MF1-02` cria salas, `BK-MF1-03` acrescenta partilhas e `BK-MF1-04` acrescenta IA da sala.
- A cadeia docente é acumulada: `BK-MF1-07` turmas, `BK-MF1-08` disciplinas, `BK-MF1-09` materiais oficiais, `BK-MF1-10` voz docente, `BK-MF1-11` IA limitada e `BK-MF1-12` publicações.
- `teacherId`, `studentId`, ownership e membership vêm da sessão/base de dados, não de IDs livres enviados pelo frontend.
- Voz docente continua a ser estilo pedagógico textual, não áudio.
- A voz docente segue herança `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`: a turma tem voz base e a disciplina mantém override opcional.
- Materiais oficiais `URL` ficam como `REFERENCE_ONLY`; só materiais `PROCESSED` alimentam IA factual.
- IA privada, IA da sala e IA da turma/disciplina mantêm contextos separados.
- Qualquer geração IA da MF1 bloqueia quando não existem fontes processáveis e autorizadas.

## Drift documental encontrado

Não foi encontrado drift documental ativo entre headers dos BKs da MF1, `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md`.

Itens históricos já aparecem resolvidos no estado atual:

- `BK-MF1-02` está alinhado em `S03`.
- `BK-MF1-04` declara dependência em `BK-MF1-02, BK-MF1-03`.
- `BK-MF1-09` está alinhado com owner `Kaua`.

## Mapa de integração da MF

| BK | Ficheiros criados/editados no guia | Exports/elementos produzidos | Imports/consumos principais | Endpoints | Dependentes |
| --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | Schemas de perfil/explicação, DTOs, prompt, provider, service, controller, `AiModule`, cliente API e página | `AdaptiveLearningService`, perfil de aprendizagem, explicação adaptativa | `StudyAreasService`, `Material`, `AI_PROVIDER`, `StudyToolsService`, `SessionGuard` | `GET/PUT /api/study-areas/:studyAreaId/learning-profile`, `POST /api/study-areas/:studyAreaId/adaptive-explanations` | `BK-MF3-04` |
| `BK-MF1-02` | `StudyRoom`, DTOs, service, controller, module, cliente API e página | `StudyRoomsService`, `StudyRoomsModule` | `SessionGuard`, `User`, utilizador autenticado | `POST/GET /api/study-rooms`, `POST /api/study-rooms/:roomId/members` | `BK-MF1-03`, `BK-MF1-04`, `BK-MF3-05` |
| `BK-MF1-03` | `RoomShare`, DTO, service, controller, update de module, cliente API e página | `RoomSharesService`, `findUsableSharesForRoom` | `StudyRoomsService.ensureMember`, `Material` da MF0 | `POST/GET /api/study-rooms/:roomId/shares` | `BK-MF1-04` |
| `BK-MF1-04` | `RoomAiInteraction`, DTO, prompt, service, controller, update de module, cliente API e página | `RoomAiService`, IA da sala com fontes partilhadas | `StudyRoomsService`, `RoomSharesService`, `AI_PROVIDER`, `AiModule` | `POST /api/study-rooms/:roomId/ai/answers` | Fecho da cadeia `RF14-RF16` |
| `BK-MF1-07` | `.env` local documentado, seed local, `SchoolClass`, DTOs, service, controller, module, cliente API e páginas | `MONGODB_URI` local, contas de validação, `ClassesService`, `SchoolClass.studentIds` | `User`, `UserSchema`, `bcrypt`, `SessionGuard`, MongoDB Atlas | `POST/GET /api/teacher/classes`, `POST /api/teacher/classes/:classId/students`, `GET /api/student/classes` | `BK-MF1-08`, `BK-MF1-12`, `BK-MF2-01`, `BK-MF2-02` |
| `BK-MF1-08` | `Subject`, DTO, service, controller, module, cliente API e página | `SubjectsService`, `findOwnedSubject`, `findSubjectForStudent` | `ClassesService.findOwnedClass`, `ClassesService.ensureStudentEnrollment` | `POST/GET /api/teacher/classes/:classId/subjects` | `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-04` |
| `BK-MF1-09` | `OfficialMaterial`, DTO, service, controller, module, cliente API e página | `OfficialMaterialsService`, materiais `PROCESSED`/`REFERENCE_ONLY` | `SubjectsService.findOwnedSubject` | `POST/GET /api/teacher/subjects/:subjectId/materials` | `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-05`, `BK-MF2-07` |
| `BK-MF1-10` | `TeacherClassAiVoice`, `TeacherAiVoice`, DTO, service, controller, module, cliente API e páginas | `TeacherAiVoiceService`, resolvedor de voz efetiva | `ClassesService.findOwnedClass`, `SubjectsService.findOwnedSubject` | `GET/PUT /api/teacher/classes/:classId/ai-voice`, `GET/PUT/DELETE /api/teacher/subjects/:subjectId/ai-voice` | `BK-MF1-11`, `BK-MF2-12` |
| `BK-MF1-11` | `ClassAiInteraction`, DTO, prompt, service, controller, module, cliente API e página | `ClassAiService`, IA limitada por disciplina/turma | `SubjectsService`, `OfficialMaterialsService`, `TeacherAiVoiceService.resolveTeacherVoice`, `AI_PROVIDER`, `AiModule` | `POST /api/student/subjects/:subjectId/ai/answers` | Fluxos de IA docente posteriores |
| `BK-MF1-12` | `ClassPost`, DTO, service, controller, module, cliente API e páginas teacher/student | `ClassPostsService`, publicações oficiais da turma | `ClassesService.findOwnedClass`, `ClassesService.ensureStudentEnrollment` | `POST/GET /api/teacher/classes/:classId/posts`, `GET /api/student/classes/:classId/posts` | `BK-MF2-06`, `BK-MF4-01` |

## Gate de app funcional

| Pergunta | Resultado |
| --- | --- |
| Este código compila no contexto da app final prevista? | `OK` documental: imports e módulos estão descritos de forma acumulada. Não foi executada compilação da app. |
| Os imports apontam para ficheiros existentes ou criados em BKs anteriores? | `OK` na sequência documental MF0 -> MF1. |
| O controller chama um service existente? | `OK`; cada controller da MF1 tem service correspondente. |
| O service usa schemas/models existentes? | `OK`; schemas próprios ou herdados dos BKs anteriores são declarados. |
| O frontend chama endpoints reais definidos no backend? | `OK`; endpoints dos clientes batem com controllers/expected results. |
| Os tipos do frontend correspondem ao payload e resposta do backend? | `OK` documental; não foram encontrados `payload: unknown` nem `as any`. |
| O fluxo funciona com autenticação real? | `OK` documental; os BKs usam `SessionGuard`, sessão HttpOnly e seed local para professor/aluno quando necessário. |
| O fluxo falha de forma controlada nos negativos? | `OK`; há `400/401/403/404/409/422/503` conforme domínio. |
| Este BK deixa a app num estado mais funcional do que antes? | `OK`; cada BK entrega endpoints, services e UI incrementais. |
| O próximo BK consegue construir sobre este sem reescrever tudo? | `OK`; handoffs e exports estão explícitos. |

## Verificações textuais executadas

### Estrutura dos BKs

Resultado:

- Todos os `10` BKs da MF1 têm as secções obrigatórias de objetivo, importância, scope, pré-requisitos, conceitos, arquitetura, guia linear, expected results, critérios, validação, evidence, handoff e changelog.
- Todos os passos auditados seguem os pontos `1` a `7` exigidos.
- Mínimo de passos por prioridade cumprido: `P0 >= 8`, `P1/P2 >= 6`.
- Blocos `ts`/`tsx` auditados incluem comentário inicial com caminho de ficheiro.

### Pesquisa obrigatória

Comando:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|conversa interna|este guia deixa de ser|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-código|solução parcial|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/MF1/*.md
```

Resultado: sem ocorrências nos BKs MF1. O `rg` terminou com exit code `1`, que neste caso significa zero matches.

### Alinhamento documental

Resultado: headers da MF1 alinhados com `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md`.

## Verificações de comandos

### `git diff --check`

Resultado: passou sem output.

### `bash scripts/validate-planificacao.sh`

Resultado: falhou antes de executar a validação canónica por bloqueio de infraestrutura.

Output observado:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Causa observada: `scripts/validate-planificacao.sh` chama `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro não existe neste workspace.

## Ordem recomendada de correção

Não há correções recomendadas para a MF1 nesta execução. Se a MF1 voltar a ser alterada, a ordem segura de revisão deve seguir a sequência canónica:

1. `BK-MF1-01`
2. `BK-MF1-02`
3. `BK-MF1-03`
4. `BK-MF1-04`
5. `BK-MF1-07`
6. `BK-MF1-08`
7. `BK-MF1-09`
8. `BK-MF1-10`
9. `BK-MF1-11`
10. `BK-MF1-12`

## Bloqueios e TODOs restantes

- `TODO`: confirmar infraestrutura do validador canónico se `scripts/validate-planificacao.sh` continuar a apontar para ficheiro Python inexistente fora deste workspace.
- `TODO`: hidratar/auditar BKs posteriores dependentes em `MF2`, `MF3` e `MF4` quando essas macrofases entrarem em escopo.
