# AUDITORIA-HIDRATACAO-MF6

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF6`
- `project`: `StudyFlow`
- `macro`: `MF6`
- `mode`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `bk_ids`: `[]`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `output_mode`: `relatorio_e_resumo`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`
- `last_updated`: `2026-06-23`

## Sumario executivo

Esta execucao aplicou a prompt ativa para `MF_ALVO: MF6`, `BK_IDS: []` e `MODO: auditar_apenas`.

Por contrato de modo, nenhum guia BK foi editado nesta execucao. O trabalho permitido foi atualizar este relatorio com a auditoria documental, estrutural, tecnica e pedagogica dos 12 BKs atuais da MF6.

O relatorio pre-existente declarava `12 OK / 0 PARCIAL / 0 CRITICO` depois de uma execucao anterior em `corrigir_apenas`, mas o proprio artefacto estava desalinhado com a prompt atual porque continuava a declarar esse modo e BKs editados. Esta auditoria revalidou o estado atual dos guias e corrigiu apenas o contrato do relatorio.

| Momento | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado declarado no relatorio pre-existente | 12 | 0 | 0 |
| Estado auditado antes desta execucao | 12 | 0 | 0 |
| Estado depois desta execucao `auditar_apenas` | 12 | 0 | 0 |

Conclusao: a MF6 fica `OK` nesta auditoria documental. Nao existem findings abertos nos BKs MF6. O bloqueio conhecido para validacao global continua a estar em drift documental de MF3, fora do escopo editavel desta prompt.

## Escopo executado

### Alterado

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`

### Nao alterado

- `docs/planificacao/guias-bk/MF6/*.md`
- Codigo aplicacional em `apps/api` e `apps/web`
- Raizes privadas em `real_dev`
- `mockup/`
- Backlogs, matriz, RF, RNF, sprints, template e restantes documentos canonicos
- Commits ou staging git

### Estado do workspace observado

Antes desta execucao, o worktree ja tinha alteracoes locais nos 12 BKs de `docs/planificacao/guias-bk/MF6/` e relatorios nao seguidos em `docs/planificacao/guias-bk/`. Esta execucao preservou esse estado e atualizou apenas o relatorio MF6.

## Fontes consultadas

- Prompt anexa: `StudyFlow - Prompt final para auditoria, hidratacao e correcao de guias BK`
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os BKs de `docs/planificacao/guias-bk/MF6/`
- BK anterior direto: `docs/planificacao/guias-bk/MF5/BK-MF5-12-suportar-200-utilizadores-simultaneos-por-escola.md`
- BK seguinte direto: `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- Relatorios `AUDITORIA-HIDRATACAO-MF0.md` a `AUDITORIA-HIDRATACAO-MF5.md`
- `real_dev/api/src`, `real_dev/web/src`, `apps/api/src` e `apps/web/src`, apenas como referencia tecnica/estrutural

## Inventario documental

| Macrofase | BKs | Estado observado nos headers | Handoff final |
| --- | ---: | --- | --- |
| `MF0` | 12 | 12 `DONE` | `BK-MF0-12 -> BK-MF1-01` |
| `MF1` | 10 | 3 `DONE`, 7 `TODO` | `BK-MF1-12 -> BK-MF2-01` |
| `MF2` | 12 | 12 `DONE` | `BK-MF2-12 -> BK-MF3-01` |
| `MF3` | 12 | 5 `DONE`, 7 `TODO` | `BK-MF3-12 -> BK-MF4-01` |
| `MF4` | 10 | 10 `TODO` | `BK-MF4-10 -> BK-MF5-01` |
| `MF5` | 11 | 11 `TODO` | `BK-MF5-12 -> BK-MF6-01` |
| `MF6` | 12 | 12 `TODO` | `BK-MF6-12 -> BK-MF7-01` |
| `MF7` | 11 | 11 `TODO` | `BK-MF7-11 -> BK-MF8-01` |

Nota: os headers `TODO` sao estados canonicos/documentais da matriz/backlog e nao equivalem a classificacao de qualidade desta auditoria.

## Resultado por BK

| BK | RNF | Prioridade | Passos | Estado atual | Nota |
| --- | --- | --- | ---: | --- | --- |
| `BK-MF6-01` | `RNF11` | `P0` | 7 | `OK` | Indexacao assincrona, jobs persistidos, ownership, polling e handoff para quizzes estao claros. |
| `BK-MF6-02` | `RNF12` | `P1` | 7 | `OK` | Geracao de quizzes em background tem schema, DTO, service, controller, cliente/UI e negativo sem fontes. |
| `BK-MF6-03` | `RNF13` | `P2` | 7 | `OK` | Guia prepara escala horizontal sem prometer fila distribuida completa fora de fase. |
| `BK-MF6-04` | `RNF14` | `P0` | 7 | `OK` | HTTPS/TLS tratado com middleware, proxy headers, validacao e evidence sem segredos. |
| `BK-MF6-05` | `RNF15` | `P0` | 7 | `OK` | Hashing seguro isola bcrypt num service, mantem erro publico generico e cobre negativos de password. |
| `BK-MF6-06` | `RNF16` | `P0` | 7 | `OK` | Cookies HttpOnly/Secure/SameSite e frontend com `credentials: "include"` estao coerentes. |
| `BK-MF6-07` | `RNF17` | `P0` | 7 | `OK` | XSS, CSRF, injection e brute force ficam no backend, com negativos e sem expor cookies/sessoes. |
| `BK-MF6-08` | `RNF18` | `P0` | 7 | `OK` | Sandbox aplicacional de documentos cobre MIME, tamanho, timeout, URLs e erros seguros. |
| `BK-MF6-09` | `RNF19` | `P0` | 7 | `OK` | Guardrails IA validam contexto no backend e nao guardam prompts privados. |
| `BK-MF6-10` | `RNF20` | `P0` | 7 | `OK` | Fonte IA e autorizada antes do provider; fontes proibidas bloqueiam antes de prompt/resposta. |
| `BK-MF6-11` | `RNF21` | `P1` | 7 | `OK` | Backup diario usa ambiente seguro, manifest sem URI/documentos e dry-run validavel. |
| `BK-MF6-12` | `RNF22` | `P1` | 7 | `OK` | Retry/recovery limita operacoes a falhas transitorias/idempotentes e prepara logs MF7. |

## Findings abertos

Nenhum finding `PARCIAL` ou `CRITICO` permanece aberto nos BKs MF6 nesta auditoria.

Os cinco findings de comentarios didaticos registados no relatorio anterior foram revalidados como `JA_CORRIGIDO` no estado atual dos BKs:

- `BK-MF6-01`: blocos longos de modulo/teste ja incluem comentarios didaticos suficientes.
- `BK-MF6-02`: bloco de modulo IA ja explica persistencia de job e injecao NestJS.
- `BK-MF6-08`: fluxo de seguranca documental ja explica metadados, timeouts e negativos.
- `BK-MF6-11`: teste de backup ja explica manifest, URI, dry-run e retencao.
- `BK-MF6-12`: teste de recovery ja explica transitorio vs permanente, limite de tentativas e eventos.

## Mapa de integracao da MF

| BK | Entrega prevista | Contratos consumidos | Entregas/servicos/chaves | Testes/evidence | Dependentes | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF6-01` | Jobs de indexacao assincrona | Materiais MF0/MF2, sessao, `MaterialIndexService` | Jobs persistidos, controller de indexacao, painel de estado | Build, unit, negativo sem bloqueio UI | `BK-MF6-02`, `BK-MF6-08`, `BK-MF6-09` | `OK` |
| `BK-MF6-02` | Geracao de quizzes em background | `BK-MF6-01`, `StudyToolsService`, fontes processaveis | `QuizGenerationJob`, `QuizGenerationJobsService`, endpoints e cliente/painel | Unit, negativo sem fontes | `BK-MF6-03`, MF7 observabilidade | `OK` |
| `BK-MF6-03` | Preparacao para escala horizontal | Jobs persistidos, scripts e services MF6 | Configuracao/health tecnico sem dependencia nova pesada | Revisao, build, negativo de estado local | `BK-MF6-04`, MF7 deploy/logs | `OK` |
| `BK-MF6-04` | HTTPS/TLS | API Nest, ambiente de deploy | Validacao de proto/headers de proxy | curl/openssl/evidence sem segredos | `BK-MF6-05`, `BK-MF6-06` | `OK` |
| `BK-MF6-05` | Hashing isolado de passwords | `AuthService`, `User.passwordHash`, bcrypt existente | `PasswordHashingService` e testes | Unit, negativo password errada | `BK-MF6-06`, `BK-MF6-07` | `OK` |
| `BK-MF6-06` | Politica unica de cookies de sessao | `SessionGuard`, `AuthController`, `apiClient` | Cookie HttpOnly/Secure/SameSite e `credentials: "include"` | Unit, headers ocultos | `BK-MF6-07` | `OK` |
| `BK-MF6-07` | Protecoes XSS/CSRF/injection/brute force | Sessao/cookies, `ValidationPipe`, login attempts | Headers, CSRF middleware, validacao global | Unit/smoke, negativos CSRF/campos extra/brute force | `BK-MF6-08` | `OK` |
| `BK-MF6-08` | Sandbox aplicacional de documentos | `MaterialIndexService`, upload validator, URL safety | `DocumentProcessingSafetyService`, MIME/tamanho/timeout | Unit e negativos de ficheiro grande/MIME/timeout | `BK-MF6-09` | `OK` |
| `BK-MF6-09` | Guardrails obrigatorios de IA | `StudyAreasService`, `StudyRoomsService`, `SubjectsService` | `AiGuardrailsService`, controller/module, checks por contexto | Unit, negativos role/membership/contexto | `BK-MF6-10`, MF8 IA | `OK` |
| `BK-MF6-10` | Isolamento de fontes por aluno/turma/contexto | `BK-MF6-09`, `MaterialIndexService.findReadableDoneJob`, source-grounded AI | `SourceGroundedAiService`, DTO source-grounded, provider IA | Teste negativo de fonte proibida antes do provider | `BK-MF6-11`, MF7 logs, MF8 IA | `OK` |
| `BK-MF6-11` | Backup diario automatico | API Mongoose, env seguro, build Nest | `backup:daily`, `backup:daily:dry-run`, cron | Unit, dry-run, negativo sem `MONGODB_URI` | `BK-MF6-12`, MF7 operacao | `OK` |
| `BK-MF6-12` | Retry/recovery controlado | `BK-MF6-11`, leitura URL idempotente, URL safety | `retryWithRecovery`, eventos de recovery | Unit, negativos attempts/delay/erro permanente | `BK-MF7-01`, `BK-MF7-02`, `BK-MF7-08` | `OK` |

## Decisoes confirmadas

- `CANONICO`: `RNF11` a `RNF13` pertencem a performance e escalabilidade.
- `CANONICO`: `RNF14` a `RNF20` pertencem a seguranca, seguranca IA e privacidade.
- `CANONICO`: `RNF21` e `RNF22` pertencem a fiabilidade, backups e continuidade.
- `CANONICO`: a sequencia e `BK-MF5-12 -> BK-MF6-01 -> ... -> BK-MF6-12 -> BK-MF7-01`.
- `CANONICO`: `BK-MF6-10` deve garantir que IA nao acede a dados de outras turmas ou alunos.
- `CONFIRMADO POR CODIGO`: `real_dev/web/src/lib/apiClient.ts` usa `credentials: "include"` e marcador CSRF centralizado.
- `CONFIRMADO POR CODIGO`: `real_dev/api/src/common/guards/session.guard.ts` valida cookie de sessao e anexa `request.user`.
- `CONFIRMADO POR CODIGO`: `real_dev/api/src/modules/material-index/material-index.service.ts` tem `findReadableDoneJob(actor, jobId)` com ownership/membership antes de devolver fontes.
- `CONFIRMADO POR CODIGO`: `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts` chama `findReadableDoneJob` antes de montar o prompt e chamar `AI_PROVIDER`.
- `CONFIRMADO POR CODIGO`: o provider real e injetado via `AI_PROVIDER` e contrato `AiProvider`.
- `DERIVADO`: `BK-MF6-05` isola bcrypt em `PasswordHashingService` em vez de introduzir argon2 sem dependencia aprovada.
- `DERIVADO`: `BK-MF6-08` trata sandbox seguro como sandbox aplicacional com tipo, MIME, tamanho, timeout e URL safety.
- `DERIVADO`: `BK-MF6-12` limita retry a operacoes idempotentes, evitando duplicar escritas ou contornar autorizacao.

## Pesquisa estatica ampla

### Termos internos, pseudo-codigo e caminhos privados nos BKs MF6

Comandos:

```bash
rg -n 'hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token' docs/planificacao/guias-bk/MF6/*.md
rg -n 'real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT' docs/planificacao/guias-bk/MF6/*.md
```

Resultado: `PASS`, sem ocorrencias nos BKs MF6.

### Termos sensiveis e contratos tecnicos

Comando executado:

```bash
rg -n 'secret|token|password|cookie|localStorage|sessionStorage|as any|payload: unknown|TODO|mock|stub|fake|placeholder|RAG|embedding|embeddings|OCR|chunking|prompt privado|resposta IA privada|MONGODB_URI|mongodump|backup:daily|retryWithRecovery|contextType|resourceId|auth\.types|roles' docs/planificacao/guias-bk/MF6/*.md
```

Classificacao:

- `TODO` aparece nos headers canonicos dos BKs, nao como instrucao vaga.
- `mock` aparece em testes Jest de guias tecnicos; aceitavel como test double.
- `RAG`, `embeddings`, `OCR` e termos semelhantes aparecem em `Scope-out` para impedir promessa fora de fase.
- `contextType` e `resourceId` aparecem em `BK-MF6-09` como contrato de guardrails e em `BK-MF6-10` como risco que o cliente nao pode usar para decidir autorizacao.
- `MONGODB_URI`, `backup:daily` e `retryWithRecovery` pertencem a `BK-MF6-11` e `BK-MF6-12`.
- `password`, `cookie`, `token`, `prompt privado` e `resposta IA privada` aparecem como termos de seguranca/evidence, sem valores reais.
- `auth.types`, `payload: unknown`, `as any`, `localStorage.*token` e `token.*localStorage` nao aparecem como violacao em BKs MF6.

## Verificacao estrutural programatica

Verificacao sobre os 12 BKs de `docs/planificacao/guias-bk/MF6/`:

- Todas as 16 secoes obrigatorias existem e aparecem pela ordem esperada.
- Todos os BKs tem `7` passos.
- Todos os passos tem os pontos `1` a `7`.
- Todos os BKs tem `7` ocorrencias de `5. Explicação do código.`.
- Todos os BKs tem `7` ocorrencias de `7. Cenário negativo/erro esperado.`.
- Blocos `ts`, `tsx`, `js`, `jsx` e `mjs` relevantes foram verificados para comentarios didaticos: `PASS`, `issueCount: 0`.
- Blocos curtos de import, JSON e comandos bash foram classificados como aceitaveis quando acompanhados por explicacao textual no passo.

## Coerencia MF anterior -> MF alvo -> MF seguinte

- MF5 -> MF6: `BK-MF5-12` entrega smoke de concorrencia para `BK-MF6-01`; a MF6 consome esse handoff ao tratar indexacao assincrona, jobs, seguranca e fiabilidade.
- Dentro da MF6: a cadeia `BK-MF6-01` a `BK-MF6-12` esta sequencial, sem quebras criticas de RNF e sem findings abertos nesta auditoria.
- MF6 -> MF7: `BK-MF6-12` prepara eventos/recovery para logs e operacao em `BK-MF7-01`; a revalidacao de MF7 deve acontecer numa execucao propria.

## Drift documental encontrado

- O relatorio MF6 pre-existente declarava `mode: corrigir_apenas` e BKs editados; esta execucao corrigiu o artefacto para `auditar_apenas`.
- `bash scripts/validate-planificacao.sh` continua a falhar por drift em `MF3`, fora do escopo editavel desta prompt.
- O validador nao reporta problemas de cobertura nem qualidade geral dos guias MF6; o bloqueio global vem de consistencia documental MF3.
- Nao foi encontrado `real_dev` em BKs de aluno da MF6.

## Riscos restantes

- Nenhum finding MF6 permanece aberto nesta auditoria.
- Resolver drift MF3 numa execucao propria para permitir `bash scripts/validate-planificacao.sh` verde globalmente.
- Revalidar MF7 quando essa macrofase entrar em escopo, porque o handoff MF6 -> MF7 depende de guias posteriores consistentes.

## Validacao executada

### Pesquisa de termos proibidos em BKs de aluno

Comando:

```bash
rg -n 'hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token' docs/planificacao/guias-bk/MF6/*.md
```

Resultado: `PASS`, sem ocorrencias.

### Pesquisa de caminhos privados em BKs de aluno

Comando:

```bash
rg -n 'real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT' docs/planificacao/guias-bk/MF6/*.md
```

Resultado: `PASS`, sem ocorrencias.

### Whitespace e diff

Comando:

```bash
git diff --check
```

Resultado: `PASS`, sem output.

Nota operacional: como este relatorio esta `untracked`, foi feita verificacao direta adicional com `rg -n '[ \t]+$' docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md`. Resultado: `PASS`, sem whitespace terminal.

### Validador de planificacao

Comando:

```bash
bash scripts/validate-planificacao.sh
```

Resultado: `FAIL_PRE_EXISTENTE`.

Resumo objetivo do output:

- `coverage_pass`: `true`
- `consistency_pass`: `false`
- `guides_pass`: `true`
- `governance_pass`: `true`
- `adequacao_12o_pass`: `true`
- `score_ge_97`: `false`
- `drift_critical_zero`: `false`
- `overall_pass`: `false`
- `score.total`: `80`
- `drift_critical_count`: `6`

Drift reportado pelo validador:

- `BK-MF3-07: estado matrix=TODO backlog=DONE`
- `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md: estado=DONE matrix=TODO`
- `docs/planificacao/guias-bk/MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md: estado=DONE matrix=TODO`
- `docs/planificacao/guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md: estado=DONE matrix=TODO`
- `docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md: estado=DONE matrix=TODO`
- `docs/planificacao/guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md: estado=DONE matrix=TODO`

Interpretacao: a falha global nao foi causada por esta execucao. O drift esta em `MF3`, fora do escopo editavel de `MF6` com `STRICT_SCOPE=true`.
