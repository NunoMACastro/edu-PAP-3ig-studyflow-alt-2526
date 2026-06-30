# Relatorio de auditoria da MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `macro`: `MF2`
- `modo`: `auditar_apenas`
- `status`: `auditado_validado_sem_edicao_bks`
- `last_updated`: `2026-06-08`
- `scope`: `docs/planificacao/guias-bk/MF2/*.md`
- `bk_analisados`: `12`
- `bk_editados`: `0`
- `fonte_canonica`: `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md`, `docs/planificacao/guias-bk/_TEMPLATE-BK.md`, BKs MF0/MF1/MF2 e BKs posteriores dependentes de MF2.
- `regra_apps`: `apps/` nao foi usado como fonte de verdade; foi tratado apenas como codigo inicial nao validado, conforme regra critica da prompt.

## Resumo executivo

Esta execucao aplicou a prompt em modo `auditar_apenas` a `MF2`. Nenhum BK foi editado nesta execucao.

O estado actual dos 12 BKs da MF2 foi auditado contra os documentos canonicos, contra os BKs MF0/MF1, contra BKs posteriores que dependem de MF2 e contra as regras de formato pedidas para guias de aluno. Resultado: `12 OK / 0 PARCIAL / 0 CRITICO`.

Os BKs actuais ja apresentam guias lineares com passos numerados, blocos de codigo completos em fences `~~~ts`, conceitos teoricos, decisoes `CANONICO`/`DERIVADO`, validacao final, cenarios negativos, evidence e handoff. A macrofase esta documentalmente coerente para entrega pedagogica, com a nota de escopo de que esta auditoria nao compilou nem executou a app real.

## Contagem da auditoria

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado actual auditado | 12 | 0 | 0 |
| Depois desta execucao | 12 | 0 | 0 |

## BKs analisados

- `BK-MF2-01` - Professores podem criar salas de estudo guiado com disciplina opcional.
- `BK-MF2-02` - Professores podem criar projetos para a turma.
- `BK-MF2-03` - A IA deve ajudar o aluno a elaborar projetos de forma gradual.
- `BK-MF2-04` - Criar testes/mini-testes oficiais.
- `BK-MF2-05` - Rever e aprovar conteudo gerado pela IA.
- `BK-MF2-06` - Painel com progresso, dificuldades e metricas da turma.
- `BK-MF2-07` - Indexacao automatica de PDFs, DOCX e URLs.
- `BK-MF2-08` - Extrair topicos, seccoes, estrutura e referencias.
- `BK-MF2-09` - Manter versoes dos materiais.
- `BK-MF2-10` - Separar materiais entre aluno, professor e turma.
- `BK-MF2-11` - Assistente IA privado por area de estudo.
- `BK-MF2-12` - Assistente IA da disciplina/turma com voz docente herdada.

## Classificacao por BK

| BK | Estado | Passos | Minimo esperado | Codigo em fences `~~~ts` | Observacao principal |
| --- | --- | ---: | ---: | ---: | --- |
| `BK-MF2-01` | `OK` | 7 | 6 | 7 | Usa `ClassesService.findOwnedClass`, `SubjectsService` quando existe `subjectId` e `ensureStudentEnrollment`; endpoints professor/aluno separados para salas guiadas. |
| `BK-MF2-02` | `OK` | 7 | 6 | 7 | Usa turma validada por `ClassesService`; separa criacao docente e leitura discente de projetos. |
| `BK-MF2-03` | `OK` | 7 | 6 | 7 | Reutiliza `ClassProjectsService` e `AI_PROVIDER`; produz plano gradual para projeto publicado. |
| `BK-MF2-04` | `OK` | 8 | 8 | 8 | Testes oficiais associados a disciplina validada por `SubjectsService.findOwnedSubject`. |
| `BK-MF2-05` | `OK` | 7 | 6 | 7 | Curadoria docente ligada a materiais oficiais e disciplina validada. |
| `BK-MF2-06` | `OK` | 7 | 6 | 7 | Painel usa turma validada e agrega notas/metricas sem expor dados de outras turmas. |
| `BK-MF2-07` | `OK` | 8 | 8 | 8 | Indexacao cria jobs, chunks tipados, `findDoneJob`, validacao DNS e redirects manuais. |
| `BK-MF2-08` | `OK` | 8 | 8 | 8 | Estrutura deriva de `MaterialIndexService.findDoneJob`, sem inventar referencias. |
| `BK-MF2-09` | `OK` | 7 | 6 | 7 | Versionamento cria snapshots a partir de jobs concluidos e permite reposicao. |
| `BK-MF2-10` | `OK` | 8 | 8 | 8 | Separa contextos privado, disciplina do aluno e material oficial docente. |
| `BK-MF2-11` | `OK` | 8 | 8 | 8 | IA privada valida area do aluno, recolhe fontes privadas e bloqueia sem fontes. |
| `BK-MF2-12` | `OK` | 8 | 8 | 8 | IA de disciplina valida inscricao, usa materiais oficiais e voz docente efetiva resolvida. |

## Decisoes tecnicas confirmadas

- `CANONICO`: a MF2 cobre `RF25` a `RF36`, com 12 BKs, sequencia `BK-MF2-01` a `BK-MF2-12`, e handoff para `BK-MF3-01`.
- `CANONICO`: prioridades, owners, apoios, dependencias, sprints e `core_or_reforco` permanecem alinhados com `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md`.
- `CANONICO`: a linha temporal coloca a MF2 na janela `S04-S05`/foco `S05`, com continuidade para MF3.
- `CANONICO`: IA privada, IA da disciplina/turma, materiais oficiais, materiais privados, turma e sala de estudo continuam separados por contexto.
- `CANONICO`: a voz docente herda por `SUBJECT_OVERRIDE -> CLASS_BASE -> DEFAULT`; salas guiadas podem apontar para disciplina, mas nao têm override proprio.
- `DERIVADO`: os nomes de modulos/services/DTOs/schemas/paginas documentados nos BKs sao decisoes tecnicas de implementacao para concretizar RFs canonicos sem contrariar a matriz.
- `DERIVADO`: `pdf-parse` e `mammoth` em `BK-MF2-07` sao dependencias tecnicas justificadas para extracao textual minima de PDF/DOCX, sem prometer OCR, embeddings ou RAG.
- `DERIVADO`: validacao DNS e redirect manual em `BK-MF2-07` sao medida minima de seguranca para reduzir SSRF nesta fase, sem substituir o sandbox completo de RNFs posteriores.

## Mapa de integracao da MF

| BK | Exports produzidos | Imports/contratos consumidos de BKs anteriores | Endpoints documentados | BKs seguintes dependentes |
| --- | --- | --- | --- | --- |
| `BK-MF2-01` | `GuidedStudyRoomsModule`, `GuidedStudyRoomsService`, `GuidedStudyRoom.subjectId?` | `ClassesService.findOwnedClass`, `SubjectsService.findOwnedSubject`, `ensureStudentEnrollment`, sessao MF0 | `/api/teacher/classes/:classId/guided-study-rooms`, `/api/student/classes/:classId/guided-study-rooms` | `BK-MF2-02`, `BK-MF2-12` |
| `BK-MF2-02` | `ClassProjectsModule`, projetos publicados | `ClassesService`, ownership docente e membership discente | `/api/teacher/classes/:classId/projects`, `/api/student/classes/:classId/projects` | `BK-MF2-03` |
| `BK-MF2-03` | `ProjectAiModule`, plano gradual IA | `ClassProjectsService`, `AiModule`, `AI_PROVIDER` | `/api/student/classes/:classId/projects/:projectId/ai-plan` | `BK-MF2-04`, MF3 guardrails |
| `BK-MF2-04` | `OfficialTestsModule`, testes oficiais | `SubjectsService.findOwnedSubject` | `/api/teacher/subjects/:subjectId/tests` | `BK-MF2-05` |
| `BK-MF2-05` | `AiContentReviewsModule`, revisoes docentes | `OfficialMaterialsService`, `SubjectsService` | `/api/teacher/subjects/:subjectId/ai-content-reviews` | `BK-MF2-06` |
| `BK-MF2-06` | `ClassProgressModule`, metricas agregadas | `ClassesService`, posts/publicacoes MF1 | `/api/teacher/classes/:classId/progress-dashboard` | `BK-MF2-07` |
| `BK-MF2-07` | `MaterialIndexModule`, `MaterialIndexService.findDoneJob`, chunks tipados | materiais privados de MF0, materiais oficiais de MF1, `SubjectsService`, `OfficialMaterialsService` | `/api/study-areas/:studyAreaId/materials/:materialId/index`, `/api/teacher/subjects/:subjectId/materials/:materialId/index`, `/api/material-index/jobs/:jobId` | `BK-MF2-08`, `BK-MF2-09`, `BK-MF2-10`, `BK-MF3-02`, `BK-MF3-09`, `BK-MF3-10` |
| `BK-MF2-08` | `MaterialStructureModule`, topicos, seccoes e referencias | `MaterialIndexService.findDoneJob` | `/api/material-index/jobs/:jobId/structure` | `BK-MF2-09`, `BK-MF3-09`, `BK-MF3-10` |
| `BK-MF2-09` | `MaterialVersionsModule`, historico de versoes | jobs concluidos do `MaterialIndexService` | `/api/material-index/jobs/:jobId/versions` | `BK-MF2-10` |
| `BK-MF2-10` | `MaterialContextsModule`, separacao de contextos | `MaterialsService`, `SubjectsService`, `OfficialMaterialsService` | `/api/material-contexts/student/:studyAreaId`, `/api/material-contexts/subjects/:subjectId`, `/api/teacher/material-contexts/subjects/:subjectId` | `BK-MF2-11`, `BK-MF2-12` |
| `BK-MF2-11` | `PrivateAreaAiModule`, respostas privadas com fontes | `StudyAreasService`, `MaterialsService`, `AiModule`, `AI_PROVIDER` | `/api/study-areas/:studyAreaId/private-ai/answers` | `BK-MF2-12`, `BK-MF3-01`, `BK-MF3-03`, `BK-MF4-02`, `BK-MF4-09` |
| `BK-MF2-12` | `ClassAiModule`, respostas de disciplina com voz docente herdada | `SubjectsService.findSubjectForStudent`, `OfficialMaterialsService.findProcessedBySubject`, `TeacherAiVoiceService.resolveTeacherVoice`, `AI_PROVIDER` | `/api/student/subjects/:subjectId/ai/answers` | `BK-MF3-01` |

## Coerencia global da macrofase

- Estrutura: todos os BKs seguem `Guia linear de implementacao` com `### Passo N - ...` e os pontos obrigatorios 1 a 7.
- Pedagogia: todos incluem conceitos teoricos, explicacao de codigo, validacao por passo, erros comuns/cenarios negativos e evidence.
- Codigo: todos os blocos tecnicos estao em fences `~~~ts`, com imports, DTOs, services, controllers, modules e frontend tipado onde aplicavel.
- Endpoints: nao foi encontrado drift funcional entre controller, cliente frontend e validacao documentada para os fluxos centrais.
- Ownership/membership: os services documentados usam sessao autenticada e services herdados de MF0/MF1 antes de consultar ou gravar dados.
- IA: `BK-MF2-03`, `BK-MF2-11` e `BK-MF2-12` reutilizam `AiModule`/`AI_PROVIDER`; `BK-MF2-11` e `BK-MF2-12` bloqueiam sem fontes.
- Materiais: `BK-MF2-07` alimenta `BK-MF2-08`, `BK-MF2-09`, `BK-MF2-10` e BKs posteriores de guardrails/pesquisa/navegacao.
- Frontend: os clientes usam `credentials: "include"` e a documentacao explicita que nao se guardam tokens em `localStorage`.

## BKs posteriores consultados

- `BK-MF3-01`: depende de `BK-MF2-11` para guardrails distintos entre aluno solo, grupo e turma.
- `BK-MF3-02`: depende de `BK-MF2-07` para citacoes obrigatorias e anti-alucinacao.
- `BK-MF3-03`: depende de `BK-MF2-11` para conhecimento externo limitado quando permitido.
- `BK-MF3-09`: depende de `BK-MF2-07` para pesquisa unificada por topico/conceito/material.
- `BK-MF3-10`: depende de `BK-MF2-07` para navegacao por programa/curriculo.
- `BK-MF4-02`: depende de `BK-MF2-11` para alertas docentes de acompanhamento.
- `BK-MF4-09`: depende de `BK-MF2-11` para configuracao de modelos de IA e limites de uso.

## Verificacoes executadas

- Pesquisa de termos proibidos nos BKs da MF2:
  - Padrao pesquisado: `hidrata|pos-auditoria|scaffold|roteiro generico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substituir mocks|pseudo-codigo|solucao parcial|payload: unknown|as any|ContextAction|contextApi|corrigir_apenas|auditar_apenas|extractedTextChunks: string[]|redirect: "follow"`.
  - Resultado: sem ocorrencias; `rg` terminou com exit code `1`, que significa zero matches.
- Verificacao estrutural local dos 12 BKs:
  - Resultado: todos cumprem minimo de passos por prioridade e pontos 1 a 7 por passo.
- `git diff --check`:
  - Resultado: OK; sem saida.
- `bash scripts/validate-planificacao.sh`:
  - Resultado: OK; `overall_pass: true`, `drift_critical_count: 0`, score `100`.

## Bloqueios e TODOs restantes

- Blockers restantes: nenhum identificado.
- TODOs documentais restantes para a MF2: nenhum identificado nesta execucao.
- Nota de escopo: esta auditoria nao compilou nem executou a app real; validou coerencia documental, pedagogica, estrutural e tecnica dos guias.
- Nota de worktree: havia alteracoes locais previas nos BKs da MF2 e no relatorio; esta execucao nao reverteu nem editou os BKs.

## Changelog

- `2026-06-08`: execucao em modo `auditar_apenas`; 12 BKs analisados, 0 BKs editados, classificacao final `12 OK / 0 PARCIAL / 0 CRITICO`.
