---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# Auditoria e hidratação MF8 - StudyFlow

## Execução 2026-07-02 - auditoria final MF8 pós-correção textual

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma nova auditoria completa e fresca aos 17 guias de `MF8`, porque `BK_IDS: []` com `STRICT_SCOPE: true` torna toda a macrofase alvo. A execução atual é `auditar_apenas`: nenhum guia BK foi editado; este relatório foi atualizado como artefacto durável da auditoria.

Resultado atual: `17 OK`, `0 PARCIAL`, `0 CRITICO`. A correção histórica de linguagem interna nos changelogs mantém-se válida: as pesquisas obrigatórias já não encontram `findings`, `auditoria focada`, `reauditoria`, `PARCIAL`, `CRITICO`, `real_dev`, `REFERENCE_ROOT`, `payload: unknown` ou `as any` nos guias MF8. Todos os guias mantêm a estrutura esperada de 16 secções `####`, 7 passos `### Passo`, caminhos públicos `apps/api` e `apps/web`, validação por passo, cenários negativos, evidence e handoff.

### Estado antes e depois desta execução

Como esta execução não editou BKs, o estado observado antes e depois mantém-se igual.

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado observado no início da auditoria | 17 | 0 | 0 |
| Depois desta execução `auditar_apenas` | 17 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-01 | OK | Guia completo para segurança ética da IA, com policy/backend/frontend/testes e sem linguagem interna remanescente. | P0 |
| BK-MF8-02 | OK | Guia completo para factualidade, citações, fallback honesto e negativos contra alucinação. | P0 |
| BK-MF8-03 | OK | Guia completo para adaptação ao nível do aluno, preservando fontes, perfil pedagógico e `credentials: "include"`. | P1 |
| BK-MF8-04 | OK | Guia completo para IA externa limitada por políticas, provider isolado, fontes e UI própria. | P0 |
| BK-MF8-05 | OK | Guia frontend-only coerente com `RNF38`, mockup usado apenas como referência visual e evidence sem dados sensíveis. | P0 |
| BK-MF8-06 | OK | Guia completo para UTF-8/PT-PT, normalização e estados de importação, sem prometer OCR/embeddings/tradução fora de escopo. | P0 |
| BK-MF8-07 | OK | Guia completo para exportação MD/PDF ancorada no domínio de artefactos de estudo. | P1 |
| BK-MF8-08 | OK | Guia completo para datas `dd/mm/aaaa` na UI, mantendo contratos ISO quando necessário. | P0 |
| BK-MF8-09 | OK | Guia completo para preparação i18n sem dependência nova e sem inventar tradução completa. | P2 |
| BK-MF8-10 | OK | Guia completo para histórico privado dos chats IA da sala, com membership e privacidade no backend. | P1 |
| BK-MF8-11 | OK | Guia completo para partilha read-only e fork privado, mantendo isolamento entre resposta própria e resposta partilhada. | P1 |
| BK-MF8-12 | OK | Guia completo para realização de mini-testes oficiais por aluno, com submissão, pontuação e proteção de respostas corretas. | P0 |
| BK-MF8-13 | OK | Guia completo para rankings minimizados de mini-testes oficiais, com autorização docente e dados reduzidos. | P1 |
| BK-MF8-14 | OK | Guia completo para flashcards em exercício/revisão, com estado React, teste Playwright e privacidade. | P1 |
| BK-MF8-15 | OK | Guia completo para inventário de testes em falta, script local, evidence e handoff para execução final. | P0 |
| BK-MF8-16 | OK | Guia completo para runner final de testes, evidence sanitizada e handoff para correção. | P0 |
| BK-MF8-17 | OK | Guia completo para registo de correções, revalidação final e fecho da MF8 sem expor dados sensíveis. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite apenas relatório.

### Evidência documental e técnica consultada

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
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md`.
- Inventário dos guias MF0-MF7 e relatórios `AUDITORIA-HIDRATACAO-*.md` para continuidade estrutural e handoff.
- `real_dev/api` e `real_dev/web` apenas como referência privada de contratos já consolidados; nenhum caminho privado foi usado em BKs de aluno.
- `mockup/` apenas como referência visual/fluxo para o domínio do `BK-MF8-05`.

### Findings da auditoria atual

#### F01 - Linguagem interna anteriormente presente nos changelogs

- Estado: `JA_CORRIGIDO`
- Evidência: `rg -n "findings?|auditoria focada|reauditoria|CRITICO|PARCIAL|hidratacao|hidratação|scaffold|snippet solto|pseudo-código|pseudo-codigo|quando aplicável|quando aplicavel" docs/planificacao/guias-bk/MF8/*.md` não devolveu ocorrências.
- Impacto: os guias dos alunos já não expõem estados ou linguagem de bastidor da auditoria.
- Validação: pesquisa obrigatória e pesquisa adicional de linguagem interna passaram sem ocorrências.

#### F02 - Caminhos privados em guias de aluno

- Estado: `JA_CORRIGIDO`
- Evidência: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md` não devolveu ocorrências.
- Impacto: os guias continuam a apontar para `apps/api` e `apps/web`, preservando a separação entre referência privada e entrega pública.

#### F03 - Ocorrências de TODO, mock, token, cookie, password, RAG, embeddings, OCR e termos semelhantes

- Estado: `FINDING_DESCARTADO`
- Evidência: a pesquisa extra devolveu falsos positivos aceitáveis:
  - `estado: TODO` aparece no header canónico dos BKs e na matriz/backlog como estado de planeamento, não como instrução vaga para o aluno.
  - `mockup` é o domínio próprio de `BK-MF8-05`.
  - `token`, `cookie`, `password` e `secret` aparecem sobretudo como proibições, sanitização de evidence, `credentials: "include"` ou credenciais seed/dev substituíveis por variáveis de ambiente em testes E2E.
  - `mock` aparece em suites Jest/Playwright como duplos de teste, não como substituto da implementação final.
  - `RAG`, `embeddings`, `OCR`, tradução completa e automações externas aparecem como exclusões explícitas de escopo.
- Impacto: sem finding aberto.

### Mapa de integração da MF

| Cadeia | BKs | Contrato entregue |
| --- | --- | --- |
| Segurança e qualidade da IA | BK-MF8-01 a BK-MF8-04 | Guardrails, factualidade, adaptação ao aluno e provider externo limitado por política própria. |
| UX final e compatibilidade | BK-MF8-05 a BK-MF8-09 | Checklist visual, UTF-8/PT-PT, exportação MD/PDF, datas PT-PT e preparação i18n sem dependências novas. |
| Salas, mini-testes e estudo | BK-MF8-10 a BK-MF8-14 | Histórico privado, partilha/fork, realização de mini-testes, rankings minimizados e flashcards. |
| Qualidade final | BK-MF8-15 a BK-MF8-17 | Inventário de testes, execução final, registo de erros, correção e evidence final sanitizada. |

Nenhum BK foi editado nesta execução; portanto não foram criados exports, imports, endpoints, DTOs, schemas, services, componentes, providers ou testes novos. A auditoria confirma que a integração documental atual preserva ownership, membership, sessão por cookies HttpOnly, separação de contextos IA e evidence sem dados sensíveis.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF7-11` entrega limites de IA definidos pelo professor e handoff para `BK-MF8-01`.
- MF alvo: MF8 fecha qualidade da IA, UX final, compatibilidade/localização, sala/mini-testes/flashcards e evidence final.
- MF seguinte: não existe `MF9` documentada nesta árvore; `BK-MF8-17` fecha a macrofase e prepara defesa/freeze final da PAP.
- Estado: coerente.

### Decisões técnicas confirmadas

- `real_dev/` está ignorado e foi tratado como referência privada, não como caminho de entrega.
- Os BKs MF8 usam caminhos públicos `apps/api` e `apps/web`.
- A MF8 tem 17 guias canónicos e a planificação total mantém `107` BKs/guias.
- Todos os BKs MF8 têm 16 secções `####`, 7 passos `### Passo`, `Evidence para PR/defesa`, `Handoff` e `Changelog`.
- O validador canónico passou com `overall_pass: true` e score `100`.

### Decisões de domínio confirmadas

- IA privada, IA da sala e IA da turma/disciplina continuam separadas por contexto.
- Mini-testes oficiais e rankings mantêm autorização docente/aluno e dados minimizados.
- Flashcards pertencem ao domínio de ferramentas de estudo e não substituem resumos/quizzes.
- Evidence final deve provar comandos e decisões sem expor materiais, prompts, cookies, tokens ou dados pessoais.

### Decisões marcadas como DERIVADO

- Usar scripts locais e ficheiros `docs/evidence/MF8/*.md` para BKs de fecho final quando o requisito pede validação/evidence e não uma nova funcionalidade de UI.
- Tratar credenciais E2E seed/dev como aceitáveis apenas quando forem substituíveis por variáveis de ambiente e não forem expostas em logs.

### Drift documental encontrado

- Drift crítico entre matriz, backlog, contrato de campos, MF views e guias MF8: nenhum.
- O estado `TODO` em headers/matriz/backlog é campo de planeamento canónico e não foi tratado como lacuna pedagógica do guia.
- Não há pasta `docs/planificacao/guias-bk/MF9`; a coerência futura foi validada pelo fecho interno da MF8.

### Validações finais desta execução

- Pesquisa obrigatória de termos proibidos nos guias MF8: `PASS` - sem ocorrências.
- Pesquisa obrigatória de caminhos privados nos guias MF8: `PASS` - sem ocorrências.
- Pesquisa adicional de linguagem interna: `PASS` - sem ocorrências.
- Estrutura dos guias MF8: `PASS` - 17 ficheiros, 16 secções `####` e 7 passos `### Passo` por guia.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo MF8: nenhum identificado.
- TODOs bloqueantes: nenhum.
- Bloqueios: nenhum.
- Nota de execução: não foram executados builds nem suites de produto nesta auditoria, porque a prompt final exige as verificações textuais e o validador de planificação indicados no gate.

## Execução 2026-07-02 - correção de linguagem interna nos changelogs MF8

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executado `corrigir_apenas` usando como fonte a auditoria completa imediatamente anterior, que tinha classificado cinco guias como `PARCIAL` por linguagem interna localizada apenas no `Changelog`.

Resultado: os cinco guias ficaram `OK`. A correção foi deliberadamente estreita: substituiu referências internas a auditoria, reauditoria, findings e estados do relatório por linguagem pública de entrega, sem alterar contratos técnicos, código apresentado, RF/RNF, endpoints, scripts, imports, testes, owners, dependências, sprints ou sequência da MF.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção | 12 | 5 | 0 |
| Depois da correção | 17 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado antes | Estado depois | Correção aplicada | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-01 | PARCIAL | OK | Changelog passou a dizer que o guia foi reforçado com integração backend, contrato frontend, testes de policy/service e validação do fluxo de segurança da IA, sem mencionar auditoria interna ou findings. | P1 |
| BK-MF8-13 | PARCIAL | OK | Changelog passou a descrever o reforço técnico do ranking com service, módulo, controller, cliente API, página React e suite Jest, sem mencionar reauditoria ou estado `CRITICO`. | P1 |
| BK-MF8-15 | PARCIAL | OK | Changelog passou a descrever o contrato de script local, comando executável, teste Jest, evidence Markdown e handoff para `BK-MF8-16`, sem mencionar findings. | P1 |
| BK-MF8-16 | PARCIAL | OK | Changelog passou a descrever runner CLI, teste Jest, script `mf8:final-tests`, evidence final, handoff para `BK-MF8-17` e alinhamento com `test:e2e`, sem linguagem interna. | P1 |
| BK-MF8-17 | PARCIAL | OK | Changelog passou a descrever script local, comando `mf8:error-register`, spec Jest, lista de ficheiros reconciliada e fluxo `TESTES-FINAIS.md -> CORRECAO-ERROS.md`, sem mencionar findings. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. A correção foi documental e limitada aos guias BK alvo e ao relatório.

### Findings corrigidas

#### F01 - Linguagem interna em changelog de guias destinados aos alunos

- Estado após correção: `CORRIGIDO`
- Evidência: pesquisa em `docs/planificacao/guias-bk/MF8/*.md` deixou de encontrar `findings`, `finding`, `auditoria focada`, `reauditoria`, `CRITICO` ou `PARCIAL`.
- Impacto: os guias deixam de expor ruído interno de auditoria/correção ao aluno, preservando o conteúdo técnico e pedagógico existente.
- Validação: ver pesquisas textuais e validações finais desta execução.

### Mapa de integração da MF

- Ficheiros criados: nenhum.
- Ficheiros editados: apenas os cinco guias `PARCIAL` e este relatório.
- Exports, imports, endpoints, DTOs, validators, schemas, services, componentes, providers de IA e testes criados: nenhum.
- Regras de segurança/autorização aplicadas: sem alteração técnica; os guias mantêm as regras já auditadas de ownership, membership, sessão por cookies HttpOnly e evidence sem dados sensíveis.
- BKs seguintes impactados: nenhum impacto técnico; a sequência `BK-MF8-01 -> BK-MF8-17` mantém-se intacta.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 continua a entregar documentação técnica, testes, deploy/readiness, health check, explicabilidade de fontes, perfis separados e limites de IA.
- MF alvo: MF8 mantém os 17 guias canónicos, agora sem linguagem interna nos changelogs analisados.
- MF seguinte: não existe próxima macrofase; o handoff continua a ser defesa/freeze final da PAP.
- Estado: coerente.

### Decisões técnicas confirmadas

- A correção não alterou código apresentado, comandos, imports, endpoints, DTOs, schemas, scripts ou testes.
- Os caminhos dos guias continuam públicos (`apps/api` e `apps/web`) e sem referências a `real_dev`.
- Os guias mantêm 16 secções `####` e 7 passos `### Passo`.

### Decisões de domínio confirmadas

- Nenhuma regra de domínio foi alterada.
- A distinção entre IA privada, IA da sala, mini-testes oficiais, rankings, flashcards e evidence final mantém-se como na auditoria anterior.

### Decisões marcadas como DERIVADO

- Não foram introduzidas novas decisões derivadas nesta correção.

### Drift documental encontrado

- Drift crítico entre matriz/backlog/contrato/MF views/guias: nenhum.
- Drift textual anterior: corrigido nos cinco changelogs alvo.

### Validações finais desta execução

- Pesquisa adicional de linguagem interna (`findings|finding|auditoria focada|reauditoria|CRITICO|PARCIAL`): `PASS` - sem ocorrências nos guias MF8.
- Estrutura dos guias MF8: `PASS` - 17 ficheiros, 16 secções `####` por guia, 7 passos `### Passo` por guia.
- Pesquisa obrigatória de termos proibidos: `PASS` - sem ocorrências para a expressão fornecida na prompt.
- Pesquisa obrigatória de caminhos privados: `PASS` - sem `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT` nos guias MF8.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo MF8 corrigido: nenhum identificado.
- TODOs restantes desta execução: nenhum.
- Bloqueios: nenhum.

## Execução 2026-07-02 - auditoria completa MF8

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma auditoria completa e fresca aos 17 guias de `MF8`, porque `BK_IDS: []` com `STRICT_SCOPE: true` torna toda a macrofase alvo. A execução consultou a documentação canónica, os guias MF0-MF7 como contexto de continuidade, todos os guias MF8, o relatório histórico desta MF e a implementação privada `real_dev/api` / `real_dev/web` apenas como referência de contratos já consolidados.

Resultado: `12 OK`, `5 PARCIAL`, `0 CRITICO`. A estrutura técnica geral da MF8 está coerente: todos os guias mantêm 16 secções `####`, 7 passos `### Passo`, passos numerados de 1 a 7, caminhos públicos `apps/api` / `apps/web`, validação por passo, critérios de aceite, evidence e handoff. O validador canónico também passou com `overall_pass: true`.

As cinco classificações `PARCIAL` são todas textuais e localizadas no `Changelog`: os guias ainda expõem linguagem interna de auditoria/correção (`findings`, `auditoria focada`, `reauditoria CRITICO`) em texto destinado aos alunos. Como o modo desta execução é `auditar_apenas`, nenhum guia BK foi editado.

### Estado antes e depois desta execução

Como esta execução não editou BKs, o estado observado antes e depois mantém-se igual.

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado observado na auditoria completa | 12 | 5 | 0 |
| Depois desta execução `auditar_apenas` | 12 | 5 | 0 |

### Resultado por BK analisado

| BK | Estado | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-01 | PARCIAL | Estrutura, código, validação e handoff estão completos, mas o changelog fala em `auditoria focada`, `findings` e estado `PARCIAL`, que são linguagem interna para aluno. | P1 |
| BK-MF8-02 | OK | Guia alinhado com `RNF35`, citações/fallback, privacy, testes e UI; as ocorrências de `auditoria` referem auditoria pedagógica/evidence, não conversa interna. | P0 |
| BK-MF8-03 | OK | Guia completo para adaptação ao nível do aluno, com contratos de IA, frontend, testes e negativos; ocorrências de storage/tokens aparecem como proibições/privacidade. | P0 |
| BK-MF8-04 | OK | Guia completo para IA externa com políticas próprias, provider isolado, UI e validação; sem caminhos privados nem termos proibidos. | P0 |
| BK-MF8-05 | OK | Guia frontend-only de alinhamento ao mockup, com rotas reais, painel, teste E2E e limites de privacidade; passwords encontradas são credenciais seed/dev parametrizáveis por env. | P1 |
| BK-MF8-06 | OK | Guia completo para UTF-8/PT-PT, normalização, UI de estados e testes; nega explicitamente OCR/embeddings/tradução completa fora de escopo. | P0 |
| BK-MF8-07 | OK | Guia completo para exportação MD/PDF ancorada nos artefactos de `study-tools`, sem inventar domínio novo. | P0 |
| BK-MF8-08 | OK | Guia completo para datas `dd/mm/aaaa` no frontend mantendo contratos ISO no backend. | P0 |
| BK-MF8-09 | OK | Guia completo para preparação i18n sem dependência nova, catálogo tipado e fallback seguro. | P1 |
| BK-MF8-10 | OK | Guia completo para histórico privado de chats IA da sala, com membership, privacidade e testes. | P0 |
| BK-MF8-11 | OK | Guia completo para partilha read-only e fork privado, preservando membership e isolamento de respostas. | P0 |
| BK-MF8-12 | OK | Guia completo para realização de mini-testes oficiais por aluno, com service/controller/frontend/testes; o falso positivo de comentário didático era apenas em tipos TypeScript simples. | P0 |
| BK-MF8-13 | PARCIAL | Guia tecnicamente completo para rankings, mas o changelog refere `reauditoria CRITICO`, linguagem interna que deve sair do guia do aluno. | P1 |
| BK-MF8-14 | OK | Guia completo para flashcards em modo de exercício/revisão, com estado React local, testes e privacidade. | P0 |
| BK-MF8-15 | PARCIAL | Guia técnico e documental completo, mas o changelog fala em `findings da auditoria focada`. | P1 |
| BK-MF8-16 | PARCIAL | Guia completo para execução final de testes, runner, evidence e sanitização, mas o changelog fala em `findings da reauditoria focada`. | P1 |
| BK-MF8-17 | PARCIAL | Guia completo para correção/revalidação final, mas o changelog fala em `findings da reauditoria focada`. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite apenas relatório.

### Evidência documental e técnica consultada

- `README.md`: confirma o domínio StudyFlow, separação de IA individual/turma/sala, materiais e guardrails.
- `docs/RF.md` e `docs/RNF.md`: confirmam os RF/RNF usados na MF8, incluindo `RNF34` a `RNF45`, `RF12`, `RF16`, `RF28`, `RF30`, `RF42`, `RNF20` e `RNF23`.
- `docs/planificacao/README.md`: confirma hierarquia canónica e regra de atualização/validação.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `sprints/PLANO-SPRINTS.md`: confirmam a MF8 com 17 BKs, sequência `BK-MF8-01 -> BK-MF8-17`, sprint S12 predominante, owners, dependências e caminhos oficiais.
- `docs/planificacao/guias-bk/README.md` e `_TEMPLATE-BK.md`: confirmam naming, header e contrato semântico dos guias.
- Todos os guias em `docs/planificacao/guias-bk/MF0/` a `MF8/`, com foco de estrutura nos guias MF0-MF3 e coerência imediata MF7 -> MF8.
- Relatórios `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-*.md`, com preservação do histórico por secções em camadas.
- `real_dev/api` e `real_dev/web`: usados apenas para leitura/validação de contratos consolidados; nenhum caminho privado foi escrito em BKs.

### Findings da auditoria completa

#### F01 - Linguagem interna em changelog de guias destinados aos alunos

- Estado: `PARCIAL`
- BKs afetados: `BK-MF8-01`, `BK-MF8-13`, `BK-MF8-15`, `BK-MF8-16`, `BK-MF8-17`.
- Evidência:
  - `BK-MF8-01`: linha de changelog com `auditoria focada`, `findings` e `PARCIAL`.
  - `BK-MF8-13`: linha de changelog com `reauditoria CRITICO`.
  - `BK-MF8-15`: linha de changelog com `findings da auditoria focada`.
  - `BK-MF8-16`: linha de changelog com `findings da reauditoria focada`.
  - `BK-MF8-17`: linha de changelog com `findings da reauditoria focada`.
- O que falta completar: substituir essas entradas por linguagem pública de entrega, por exemplo "melhorado o roteiro", "clarificado o fluxo", "adicionados testes", sem mencionar auditoria interna, findings ou estados de relatório.
- Risco pedagógico: baixo/médio; o aluno consegue seguir o guia, mas recebe ruído de bastidor que a prompt proíbe nos BKs.
- Risco técnico: baixo; não afeta imports, endpoints, DTOs, scripts ou testes.
- Risco de segurança/privacidade: baixo; não expõe dados sensíveis.
- Dependências a reler: regra de separação relatório/BKs da prompt e `docs/planificacao/guias-bk/README.md`.
- Prioridade de correção: P1.
- Nota de scope: não corrigido nesta execução porque `MODO=auditar_apenas`.

#### F02 - Ocorrências de passwords/tokens/localStorage na pesquisa estática

- Estado: `FINDING_DESCARTADO`
- Evidência: as ocorrências analisadas aparecem como proibições explícitas, sanitização de output, referências a cookies HttpOnly/`credentials: "include"` ou credenciais seed/dev parametrizáveis por variáveis de ambiente em testes E2E.
- Justificação: não há token de sessão em `localStorage`, não há secret real exposto e os guias reforçam que evidence não deve incluir cookies, tokens, prompts privados, respostas completas ou materiais integrais.

#### F03 - Comentários didáticos em blocos JSON

- Estado: `FINDING_DESCARTADO`
- Evidência: o check automático bruto assinalou blocos `json` em `BK-MF8-15`, `BK-MF8-16` e `BK-MF8-17` por não terem comentários internos.
- Justificação: JSON não aceita comentários; os blocos estão acompanhados por explicação didática fora do bloco. A regra rígida de comentários aplica-se ao código executável JavaScript/TypeScript/JSX/TSX e scripts, onde a amostragem não encontrou falhas bloqueantes.

### Mapa de integração da MF

- Cadeia IA e segurança: `BK-MF8-01` a `BK-MF8-04` reforçam guardrails, factualidade, adaptação ao aluno e uso de provider externo com políticas próprias.
- Cadeia UX/compatibilidade/localização: `BK-MF8-05` a `BK-MF8-09` fecham aproximação visual ao mockup, UTF-8/PT-PT, exportação MD/PDF, datas PT-PT e preparação i18n.
- Cadeia sala/mini-testes/revisão: `BK-MF8-10` e `BK-MF8-11` tratam histórico/partilha/fork de IA da sala; `BK-MF8-12` e `BK-MF8-13` tratam realização e ranking de mini-testes; `BK-MF8-14` fecha flashcards.
- Cadeia de qualidade final: `BK-MF8-15` inventaria testes em falta, `BK-MF8-16` executa a bateria final e `BK-MF8-17` corrige/revalida erros.
- Endpoints e scripts: a macrofase mantém endpoints por domínio onde aplicável e usa scripts locais/evidence nos BKs de fecho de qualidade, sem inventar UI/backend quando o RNF é documental/operacional.
- Segurança transversal: os guias reiteram ownership/membership no backend, sessão por cookies HttpOnly, ausência de tokens no browser, sanitização de outputs e evidence sem dados sensíveis.
- Dependências seguintes: `BK-MF8-17` fecha a macrofase; não há próximo BK.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 entrega documentação técnica mínima, testes automatizados, deploy/readiness, health check, explicabilidade de fontes, perfis separados e limites da IA.
- MF alvo: MF8 consome esses contratos e fecha qualidade da IA, UX final, compatibilidade, localização, funcionalidades finais de sala/mini-testes/flashcards e evidência de testes.
- MF seguinte: não existe próxima macrofase na planificação atual; o handoff é a defesa/freeze final da PAP.
- Estado: coerente, com drift restante apenas textual nos changelogs de cinco guias.

### Decisões técnicas confirmadas

- Os guias dos alunos usam caminhos públicos `apps/api` e `apps/web`; não há `real_dev` nos BKs MF8.
- `real_dev` pode continuar a ser referência privada, mas não é caminho de entrega.
- A MF8 mantém 17 BKs canónicos e 107 guias totais na planificação.
- Os BKs de fecho de qualidade (`BK-MF8-15` a `BK-MF8-17`) são corretamente tratados como scripts/evidence e não como features novas de produto.

### Decisões de domínio confirmadas

- IA privada, IA da sala e IA de turma/disciplina devem continuar separadas por contexto.
- Mini-testes oficiais e rankings dependem dos contratos docentes/aluno já existentes.
- Flashcards usam o domínio de ferramentas de estudo sem substituir resumos/quizzes.
- Evidence final deve provar comandos e decisões sem expor materiais, prompts, tokens, cookies ou dados pessoais.

### Decisões marcadas como DERIVADO

- Usar scripts locais e ficheiros `docs/evidence/MF8/*.md` para os BKs de fecho final quando o RNF pede validação/evidence e não uma funcionalidade de UI.
- Tratar credenciais E2E seed/dev como aceitáveis apenas quando substituíveis por variáveis de ambiente e sem exposição em logs.

### Drift documental encontrado

- Drift crítico entre matriz/backlog/contrato/MF views/guias: nenhum.
- Drift textual nos BKs: cinco changelogs ainda incluem linguagem interna de auditoria/correção.

### Validações finais desta execução

- Estrutura dos guias MF8: `PASS` - 17 ficheiros, 16 secções `####` por guia, 7 passos `### Passo` por guia, passos numerados 1 a 7.
- Pesquisa obrigatória de termos proibidos: `PASS` - sem ocorrências para a expressão fornecida na prompt.
- Pesquisa obrigatória de caminhos privados: `PASS` - sem `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT` nos guias MF8.
- Pesquisa adicional de linguagem interna: `PARCIAL` - encontrou 5 entradas de changelog com `findings`/`auditoria focada`/`reauditoria`.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- TODO restante: limpar linguagem interna nos changelogs de `BK-MF8-01`, `BK-MF8-13`, `BK-MF8-15`, `BK-MF8-16` e `BK-MF8-17`.
- Risco restante: baixo, textual e pedagógico; a execução técnica da MF8 continua coerente.
- Bloqueios: nenhum.

## Execução 2026-07-02 - reauditoria focada BK-MF8-17 pós-correção

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-17]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada nova reauditoria fresca ao `BK-MF8-17 - Correção de erros`, depois da correção focada registada na execução anterior. A análise voltou a comparar o guia com `RNF45`, matriz, backlog, contrato de campos, MF views, plano de implementação, gate S12, `BK-MF8-16` e os comandos obrigatórios do prompt.

Resultado: `OK`. O guia está agora implementável como roteiro fechado para aluno: consome `docs/evidence/MF8/TESTES-FINAIS.md`, cria `apps/api/src/scripts/mf8-error-register.ts`, cria `apps/api/src/scripts/mf8-error-register.spec.ts`, expõe `mf8:error-register`, gera `docs/evidence/MF8/CORRECAO-ERROS.md` e fecha a MF8 sem inventar endpoint, controller, DTO, service de domínio ou UI.

Como o modo desta execução é `auditar_apenas`, nenhum guia BK nem ficheiro de produto foi editado. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria pós-correção | 1 | 0 | 0 |
| Depois da reauditoria pós-correção | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-17 | OK | OK | A reauditoria confirmou estrutura completa, metadados canónicos, spec Jest completa, inventário reconciliado, fluxo local `TESTES-FINAIS.md -> mf8:error-register -> CORRECAO-ERROS.md`, negativos úteis, validação final e ausência de caminhos privados/termos proibidos. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permitiu apenas atualizar este relatório.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RNF.md`: confirma `RNF45 - Correção dos erros encontrados nos testes e revalidação final`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam `BK-MF8-17`, owner `Daniel`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependência `BK-MF8-16`, sprint `S12`, tipo `Reforco` e próximo BK `-`.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md` e `docs/planificacao/sprints/GATES-S4-S8-S12.md`: confirmam que o gate S12 exige testes finais executados, erros corrigidos e auditoria automática em PASS.
- `docs/planificacao/backlogs/MF-VIEWS.md`: confirma a sequência MF8 com 17 BKs e `BK-MF8-17` como fecho da macrofase.
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`: confirma que o `BK-MF8-17` deve consumir `docs/evidence/MF8/TESTES-FINAIS.md`, com lista objetiva de falhas e bloqueios.
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`: confirma 16 secções `####`, 7 passos `### Passo`, script local, spec Jest completa, comando `mf8:error-register`, evidence final e handoff.

### Findings da reauditoria

#### F01 - Spec prometida sem código completo

- Estado atual: `JA_CORRIGIDO`
- Evidência: o guia inclui agora o bloco completo de `apps/api/src/scripts/mf8-error-register.spec.ts`.
- Cobertura confirmada: sucesso com `RETESTED`, ausência de causa, erro reaberto em `OPEN`, parsing de `TESTES-FINAIS.md`, criação de dois registos para `FAIL`/`BLOQUEADO` e decisão `BLOCKED`.

#### F02 - Inventário de ficheiros desalinhado com os passos

- Estado atual: `JA_CORRIGIDO`
- Evidência: a secção `Ficheiros a criar/editar/rever` lista apenas os artefactos realmente usados pelo tutorial: `mf8-error-register.ts`, `mf8-error-register.spec.ts`, `CORRECAO-ERROS.md`, `apps/api/package.json`, `TESTES-FINAIS.md`, `BK-MF8-16` e `GATES-S4-S8-S12.md`.
- Resultado: não há ficheiro técnico órfão fora do fluxo principal.

#### F03 - Integração backend/frontend demasiado genérica para RNF45

- Estado atual: `JA_CORRIGIDO`
- Evidência: o guia declara `Endpoint criado: nenhum` e `UI criada: nenhuma`, e substitui os passos genéricos por um fluxo local de qualidade e revalidação.
- Resultado: `BK-MF8-17` está alinhado com `RNF45` como fecho de qualidade, não como feature nova de produto.

#### F04 - Controlo textual e caminhos privados

- Estado atual: `NAO_REPRODUZIDO`
- Evidência: as pesquisas obrigatórias em `docs/planificacao/guias-bk/MF8/*.md` não encontraram termos proibidos nem referências a `real_dev`.

### Mapa de integração da MF

- Guia auditado:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/mf8-error-register.ts`
  - `apps/api/src/scripts/mf8-error-register.spec.ts`
  - `docs/evidence/MF8/CORRECAO-ERROS.md`
- Ficheiros que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-FINAIS.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
  - `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- Imports/inputs consumidos de BKs anteriores:
  - `docs/evidence/MF8/TESTES-FINAIS.md`, entregue por `BK-MF8-16`.
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Providers de IA criados ou usados:
  - nenhum.
- Testes criados pelo guia:
  - `apps/api/src/scripts/mf8-error-register.spec.ts`.
- BKs seguintes dependentes:
  - nenhum; `BK-MF8-17` fecha a MF8.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 mantém contratos de documentação técnica, testes automatizados, deploy/readiness, health, source-grounded AI e perfis/limites de IA.
- MF alvo: `BK-MF8-15` inventaria testes, `BK-MF8-16` executa a bateria final e `BK-MF8-17` corrige/revalida erros encontrados.
- Estado após reauditoria: a ponte `BK-MF8-16 -> BK-MF8-17` está coerente porque o BK17 consome `TESTES-FINAIS.md` e gera `CORRECAO-ERROS.md`.
- MF seguinte: não existe próximo BK; o handoff é o pacote final de defesa.

### Decisões técnicas confirmadas

- `BK-MF8-17` é um BK de qualidade/revalidação final, não feature nova de produto.
- O fluxo correto é local e documental: `TESTES-FINAIS.md -> mf8:error-register -> CORRECAO-ERROS.md`.
- A spec usa import relativo com `.js`, coerente com `NodeNext`.
- O comando público do aluno é `cd apps/api && npm run mf8:error-register`.

### Decisões de domínio confirmadas

- `RNF45` exige correção dos erros encontrados nos testes e revalidação final.
- O gate S12 exige testes finais executados, erros corrigidos e auditoria automática em PASS.
- Evidence de fecho não deve expor dados sensíveis, prompts privados, materiais completos, cookies ou tokens.

### Decisões marcadas como DERIVADO

- Usar estados `OPEN`, `FIXED`, `RETESTED` e `BLOCKED`.
- Usar `apps/api/src/scripts/mf8-error-register.ts` como script local de fecho.
- Usar `docs/evidence/MF8/CORRECAO-ERROS.md` como artefacto final de correção e revalidação.

### Drift documental encontrado

- Drift restante no escopo `BK-MF8-17`: nenhum identificado.
- Nota de execução: `docs/evidence/MF8/TESTES-FINAIS.md` não existe na árvore atual, mas isto não é drift do guia; o BK ensina o comando a falhar de forma controlada até essa evidence ser criada pelo aluno no `BK-MF8-16`.

### Validações finais desta execução

- Estrutura `BK-MF8-17`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo documental `BK-MF8-17`: nenhum identificado.
- TODOs restantes no guia: nenhum.

## Execução 2026-07-02 - correção focada BK-MF8-17 após reauditoria

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-17]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada dos findings registados na reauditoria imediatamente anterior de `BK-MF8-17 - Correção de erros`.

Resultado: `OK`. O guia passou a tratar `RNF45` como fluxo local de qualidade/revalidação, sem endpoint, controller, DTO, service de domínio ou UI inventados. A correção fechou as três lacunas: inclui agora o teste Jest completo `apps/api/src/scripts/mf8-error-register.spec.ts`, reconciliou a lista de ficheiros com todos os passos e substituiu as instruções genéricas de backend/frontend por um roteiro fechado baseado em `docs/evidence/MF8/TESTES-FINAIS.md -> docs/evidence/MF8/CORRECAO-ERROS.md`.

Foram editados apenas o guia alvo e este relatório, conforme `STRICT_SCOPE=true`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-17 | PARCIAL | OK | O guia passou a ter fluxo local completo para `RNF45`, spec Jest concreta, ficheiros reconciliados, comando `mf8:error-register`, evidence `CORRECAO-ERROS.md`, negativos e validação final clara. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Os ficheiros `apps/api/...`, `apps/web/...` e `docs/evidence/...` aparecem como instruções do guia para o aluno executar, não como alterações materiais desta correção documental.

### Correções aplicadas às findings

#### F01 - Spec prometida sem código completo

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a incluir o bloco completo de `apps/api/src/scripts/mf8-error-register.spec.ts`.
- Evidência: a spec cobre sucesso (`RETESTED` com causa/correção/validação), ausência de causa, erro reaberto (`OPEN`) e parsing de `TESTES-FINAIS.md` com comandos em `FAIL`/`BLOQUEADO`.
- Resultado: o aluno deixa de ter de inventar os testes de regressão centrais de `RNF45`.

#### F02 - Inventário de ficheiros desalinhado com os passos

- Estado após correção: `CORRIGIDO`
- Ação: removida a criação de `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts` e reconciliado o inventário principal com os passos.
- Evidência: a secção `Ficheiros a criar/editar/rever` lista agora `mf8-error-register.ts`, `mf8-error-register.spec.ts`, `CORRECAO-ERROS.md`, `apps/api/package.json`, `TESTES-FINAIS.md`, `BK-MF8-16` e `GATES-S4-S8-S12.md`.
- Resultado: a lista inicial volta a ser uma fonte confiável para preparar PR/evidence.

#### F03 - Integração backend/frontend demasiado genérica para o contrato RNF45

- Estado após correção: `CORRIGIDO`
- Ação: removidos os passos genéricos de controller/service/frontend e substituídos por um fluxo local de qualidade: confirmar contrato, criar script, adicionar comando, criar spec, gerar evidence, corrigir erros reais e fechar a MF8.
- Evidência: a arquitetura declara explicitamente `Endpoint criado: nenhum` e `UI criada: nenhuma`.
- Resultado: o BK deixa de sugerir endpoints, DTOs, services ou UI sem contrato documental.

#### F04 - Controlo textual e caminhos privados

- Estado após correção: `NAO_REPRODUZIDO`
- Evidência: as pesquisas obrigatórias em `docs/planificacao/guias-bk/MF8/*.md` não encontraram termos proibidos nem caminhos privados.

### Mapa de integração da MF

- Guia BK editado:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/mf8-error-register.ts`
  - `apps/api/src/scripts/mf8-error-register.spec.ts`
  - `docs/evidence/MF8/CORRECAO-ERROS.md`
- Ficheiros que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-FINAIS.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
  - `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- Exports produzidos:
  - `MF8_FINAL_EVIDENCE_PATH`
  - `MF8_CORRECTION_EVIDENCE_PATH`
  - `Mf8EvidenceStatus`
  - `Mf8ErrorStatus`
  - `Mf8ErrorSource`
  - `Mf8FinalTestRow`
  - `Mf8ErrorRecord`
  - `Mf8CorrectionRegister`
  - `RunMf8ErrorRegisterOptions`
  - `canCloseMf8Error`
  - `extractFinalTestRows`
  - `buildCorrectionRegister`
  - `renderCorrectionRegisterMarkdown`
  - `runMf8ErrorRegister`
- Imports consumidos de BKs anteriores:
  - `docs/evidence/MF8/TESTES-FINAIS.md`, entregue por `BK-MF8-16`.
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Providers de IA criados ou usados:
  - nenhum.
- Regras de segurança/autorização aplicadas:
  - evidence sanitizada, ausência de tokens/cookies/prompts privados/materiais completos e bloqueio de fecho sem revalidação.
- Testes criados pelo guia:
  - `apps/api/src/scripts/mf8-error-register.spec.ts`.
- BKs seguintes dependentes:
  - nenhum; `BK-MF8-17` fecha a MF8.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 mantém contratos de documentação técnica, testes automatizados, deploy/readiness, health, source-grounded AI e perfis/limites de IA.
- MF alvo: `BK-MF8-15` inventaria testes, `BK-MF8-16` executa a bateria final e `BK-MF8-17` corrige/revalida erros encontrados.
- Estado após correção: a ponte `BK-MF8-16 -> BK-MF8-17` fica coerente porque o BK17 consome `TESTES-FINAIS.md` e gera `CORRECAO-ERROS.md`.
- MF seguinte: não existe próximo BK; o handoff é o pacote final de defesa.

### Decisões técnicas confirmadas

- `BK-MF8-17` é um BK de qualidade/revalidação final, não feature nova de produto.
- O fluxo correto é local e documental: `TESTES-FINAIS.md -> mf8-error-register -> CORRECAO-ERROS.md`.
- A API usa `NodeNext`; a spec usa import relativo com `.js`.
- O comando público do aluno é `cd apps/api && npm run mf8:error-register`.

### Decisões de domínio confirmadas

- `RNF45` exige correção dos erros encontrados nos testes e revalidação final.
- O gate S12 exige testes finais executados, erros corrigidos e auditoria automática em PASS.
- Evidence de fecho não deve expor dados sensíveis, prompts privados, materiais completos, cookies ou tokens.

### Decisões marcadas como DERIVADO

- Usar estados `OPEN`, `FIXED`, `RETESTED` e `BLOCKED`.
- Usar `apps/api/src/scripts/mf8-error-register.ts` como script local de fecho.
- Usar `docs/evidence/MF8/CORRECAO-ERROS.md` como artefacto final de correção e revalidação.

### Drift documental encontrado

- Drift corrigido: histórico anterior marcava `BK-MF8-17` como `OK`, mas a reauditoria mostrou `PARCIAL`; esta execução corrigiu as lacunas e devolveu o BK a `OK`.
- Drift corrigido: ficheiro extra fora do inventário principal removido do fluxo.
- Drift corrigido: instruções genéricas de backend/frontend removidas.
- Drift restante no escopo `BK-MF8-17`: nenhum identificado.

### Validações finais desta execução

- Estrutura `BK-MF8-17`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo documental `BK-MF8-17`: nenhum identificado.
- Bloqueios de execução real: `docs/evidence/MF8/TESTES-FINAIS.md` não existe na árvore atual; o guia ensina o comando a falhar de forma controlada até essa evidence ser criada pelo aluno no `BK-MF8-16`.
- TODOs restantes no guia: nenhum.

## Execução 2026-07-02 - reauditoria focada BK-MF8-17

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-17]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-17 - Correção de erros`, sem assumir como prova automática o estado `OK` registado no histórico anterior do relatório. A análise comparou o guia com `RNF45`, matriz, backlog, contrato de campos, MF views, plano de sprints, gate S12, `BK-MF8-15`, `BK-MF8-16`, os scripts/configurações reais em `apps/` e a referência privada `real_dev`.

Resultado: `PARCIAL`. O guia já tem estrutura formal correta, metadados canónicos alinhados, 16 secções `####`, 7 passos `### Passo`, caminhos públicos em `apps/api` e `apps/web`, e não apresenta termos proibidos nem fuga de `real_dev`. Porém, ainda não é totalmente implementável por um aluno sem adivinhar peças técnicas: promete `apps/api/src/scripts/mf8-error-register.spec.ts` sem fornecer o teste completo, introduz `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts` fora do inventário principal de ficheiros, e mantém passos de controller/service/frontend demasiado genéricos para um BK que é essencialmente um registo de qualidade baseado em `TESTES-FINAIS.md`.

Como o modo é `auditar_apenas`, nenhum guia BK nem ficheiro de produto foi editado nesta execução. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada, segundo histórico do relatório | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-17 | OK | PARCIAL | O guia cumpre estrutura e metadados, mas a spec prometida não é entregue como código completo, a lista de ficheiros não está alinhada com os passos e a integração backend/frontend fica genérica face ao contrato de correção e revalidação final. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-17`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RNF.md`: confirma `RNF45 - Correção dos erros encontrados nos testes e revalidação final`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam `BK-MF8-17`, owner `Daniel`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependência `BK-MF8-16`, sprint `S12`, tipo `Reforco` e próximo BK `-`.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md` e `docs/planificacao/sprints/GATES-S4-S8-S12.md`: confirmam que o gate S12 exige testes finais executados, erros corrigidos, revalidação e auditoria em PASS.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a sequência MF8 com 17 BKs e `BK-MF8-17` como fecho da macrofase.
- `BK-MF8-15`: confirma que a correção de erros pertence a `BK-MF8-17`, depois do inventário de testes.
- `BK-MF8-16`: confirma que `BK-MF8-17` deve consumir `docs/evidence/MF8/TESTES-FINAIS.md`, com lista objetiva de falhas e bloqueios.
- `apps/api/package.json`, `apps/web/package.json` e `apps/api/tsconfig.json`: confirmam scripts reais (`test:unit`, `test:e2e`) e `NodeNext` na API.
- `real_dev/api/src/scripts` e `apps/api/src/scripts`: confirmam o padrão de scripts técnicos locais já usado no projeto.

### Findings da reauditoria

#### F01 - Spec prometida sem código completo

- Estado atual: `PARCIAL`
- Evidência: o guia declara `CRIAR: apps/api/src/scripts/mf8-error-register.spec.ts` na lista principal e nos passos 3 e 6, mas o único bloco de código do passo 6 é `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts`.
- Expected: o BK devia incluir a spec completa para `canCloseMf8Error(...)`, cobrindo pelo menos estado válido, ausência de causa e erro reaberto, tal como o próprio guia promete.
- Observed: o aluno teria de inventar os testes de regressão principais, apesar de `RNF45` depender precisamente de correção, teste de regressão e revalidação.
- Risco pedagógico: médio/alto; o aluno recebe o objetivo, mas não o contrato executável completo.
- Risco técnico: alto; o fecho da MF8 pode ficar sem teste objetivo para a regra central.
- Risco de segurança/privacidade: baixo direto, mas aumenta se a revalidação ficar manual e sem negativos.
- Dependências a reler: `RNF45`, `BK-MF8-16`, `apps/api/package.json`, `apps/api/src/scripts/*`.
- Prioridade de correção: `P0`.

#### F02 - Inventário de ficheiros desalinhado com os passos

- Estado atual: `PARCIAL`
- Evidência: a secção `Ficheiros a criar/editar/rever` lista `docs/evidence/MF8/CORRECAO-ERROS.md`, `apps/api/src/scripts/mf8-error-register.ts` e `apps/api/src/scripts/mf8-error-register.spec.ts`, mas o passo 6 adiciona `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts` sem o declarar no inventário principal.
- Expected: todos os ficheiros criados ou editados no tutorial devem aparecer no inventário inicial, com localização e função claras.
- Observed: a sequência cria um ficheiro adicional e deixa a spec principal sem bloco de implementação.
- Risco pedagógico: médio; a lista inicial deixa de ser fonte confiável para o aluno preparar o PR.
- Risco técnico: médio; facilita imports, commits ou evidence incompletos.
- Risco de segurança/privacidade: não aplicável.
- Dependências a reler: `_TEMPLATE-BK.md`, `BK-MF8-15`, `BK-MF8-16`.
- Prioridade de correção: `P1`.

#### F03 - Integração backend/frontend demasiado genérica para o contrato RNF45

- Estado atual: `PARCIAL`
- Evidência: o passo 4 diz `sem endpoint novo; registo de qualidade`, mas simultaneamente fala em controller, service, DTO e module sem caminhos concretos; o passo 5 pede cliente API e estados de UI, mas não identifica página/componente real nem código completo.
- Expected: se o BK for só registo de qualidade, deve ensinar um fluxo local/evidence completo; se exigir backend ou frontend reais, deve indicar ficheiros, contratos, código e testes completos.
- Observed: há uma mistura de instruções genéricas de aplicação com um BK que, pela evidência de `BK-MF8-16`, deve começar pela leitura de `TESTES-FINAIS.md` e corrigir falhas confirmadas.
- Risco pedagógico: alto; o aluno pode não saber se deve criar endpoint/UI, script local ou apenas evidence.
- Risco técnico: alto; pode criar endpoints, DTOs ou UI sem contrato canónico.
- Risco de segurança/privacidade: médio; instruções genéricas de permissões sem código concreto podem levar a validações só no frontend ou a ownership incompleto.
- Dependências a reler: `RNF45`, `BK-MF8-16`, `docs/evidence/MF8/TESTES-FINAIS.md`.
- Prioridade de correção: `P0`.

#### F04 - Controlo textual e caminhos privados

- Estado atual: `NÃO_REPRODUZIDO`
- Evidência: a pesquisa obrigatória por termos proibidos, `payload: unknown`, `as any`, padrões perigosos com `localStorage`, `real_dev`, `cd real_dev`, `npm --prefix real_dev` e `REFERENCE_ROOT` em `docs/planificacao/guias-bk/MF8/*.md` não encontrou ocorrências.
- Resultado: não há drift textual ou fuga de caminho privado no escopo MF8.

### Mapa de integração da MF

- Guia BK analisado:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Ficheiros que o BK manda criar:
  - `docs/evidence/MF8/CORRECAO-ERROS.md`
  - `apps/api/src/scripts/mf8-error-register.ts`
  - `apps/api/src/scripts/mf8-error-register.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts` aparece apenas no passo 6 e deve ser reconciliado com o inventário principal.
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-FINAIS.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
  - `apps/api/package.json`
  - `apps/web/package.json`
- Exports produzidos:
  - `Mf8ErrorStatus`
  - `Mf8ErrorRecord`
  - `canCloseMf8Error`
  - `bkMf817ExpectedResults`
  - `getBkMf817ExpectedResult`
- Imports consumidos de BKs anteriores:
  - evidence `docs/evidence/MF8/TESTES-FINAIS.md` produzida por `BK-MF8-16`.
- Endpoints criados:
  - nenhum confirmado de forma segura; o guia fala em `sem endpoint novo`.
- DTOs/validators/schemas/services criados:
  - nenhum confirmado de forma segura; a menção a controller/service/DTO/module é genérica e deve ser corrigida ou removida.
- Componentes/páginas frontend criados:
  - nenhum confirmado de forma segura; a menção a UI é genérica e deve ser concretizada apenas se houver falha visual/UX real em `TESTES-FINAIS.md`.
- Testes criados pelo guia:
  - prometido `apps/api/src/scripts/mf8-error-register.spec.ts`, mas falta código completo da spec.
- BKs seguintes dependentes:
  - nenhum; `BK-MF8-17` fecha a MF8.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 mantém contratos de documentação técnica, testes automatizados, deploy/readiness, health, source-grounded AI e perfis/limites de IA.
- MF alvo: MF8 tem 17 BKs; `BK-MF8-15` inventaria testes, `BK-MF8-16` executa a bateria final e `BK-MF8-17` deve corrigir e revalidar falhas confirmadas.
- Estado após reauditoria: a sequência canónica está correta, mas a ponte técnica `BK-MF8-16 -> BK-MF8-17` ainda está parcial porque o guia de BK17 não entrega a spec de regressão nem uma estratégia concreta para consumir `TESTES-FINAIS.md`.
- MF seguinte: não há próximo BK; o handoff é o pacote final de defesa.

### Decisões técnicas confirmadas

- `BK-MF8-17` é um BK de qualidade/revalidação final, não uma feature nova de IA, sala, turma ou UI.
- A origem principal dos erros a corrigir deve ser `docs/evidence/MF8/TESTES-FINAIS.md`.
- O formato de script local em `apps/api/src/scripts` é compatível com o padrão existente.
- A API usa `moduleResolution: NodeNext`, logo imports relativos em specs TypeScript devem respeitar o padrão ESM do projeto quando aplicável.

### Decisões de domínio confirmadas

- `RNF45` exige correção dos erros encontrados nos testes e revalidação final.
- O gate S12 exige funcionalidades MF8 expandidas, testes finais executados, erros corrigidos e auditoria automatizada em PASS.
- Evidence de correção não deve expor tokens, cookies, prompts privados, respostas IA completas, materiais privados ou dados pessoais.

### Decisões marcadas como DERIVADO

- Usar estados `OPEN`, `FIXED`, `RETESTED` e `BLOCKED` para o registo de correção.
- Usar `apps/api/src/scripts/mf8-error-register.ts` como helper local para validar se um erro pode ser fechado.
- Usar `docs/evidence/MF8/CORRECAO-ERROS.md` como artefacto final de correção e revalidação.

### Drift documental encontrado

- Drift principal: `BK-MF8-17` está marcado como `OK` no histórico anterior do relatório, mas a reauditoria atual encontrou lacunas técnicas suficientes para reclassificar como `PARCIAL`.
- Drift de inventário: ficheiro `apps/api/src/modules/mf8/bk-mf8-17.expected-results.ts` aparece no passo 6 sem aparecer na lista principal de ficheiros.
- Drift de executabilidade: `apps/api/src/scripts/mf8-error-register.spec.ts` é prometido, mas não tem código completo no guia.
- Drift de escopo: passos de backend/frontend sugerem controller, service, DTO, module, cliente API e UI sem contrato concreto para um BK que declara `sem endpoint novo; registo de qualidade`.
- Drift de caminhos privados `real_dev` nos guias MF8: nenhum encontrado.

### Validações finais desta execução

- Estrutura `BK-MF8-17`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Contagem MF8: `PASS` - 17 guias `BK-MF8-*.md`.
- Contagem global de guias: `PASS` - 107 guias de MF0 a MF8.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `docs/evidence/`: `BLOQUEADO` como validação de runtime/evidence local - a pasta não existe na árvore atual; isto não bloqueia a auditoria documental, mas reforça que o BK17 precisa de ensinar claramente como criar `CORRECAO-ERROS.md` a partir de `TESTES-FINAIS.md`.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- `TODO (P0)`: corrigir `BK-MF8-17` para incluir código completo de `apps/api/src/scripts/mf8-error-register.spec.ts` com sucesso, ausência de causa e erro reaberto.
- `TODO (P0)`: remover ou concretizar as instruções genéricas de controller/service/frontend conforme a evidence real de `TESTES-FINAIS.md`.
- `TODO (P1)`: reconciliar a lista de ficheiros com todos os ficheiros criados nos passos.
- Bloqueios: nenhum para a auditoria documental; validação de produto/evidence real fica dependente de existir `docs/evidence/MF8/TESTES-FINAIS.md` gerado pelo BK anterior.

## Execução 2026-07-02 - reauditoria focada BK-MF8-16 pós-correção

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-16]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-16 - Execução final de testes`, depois da correção focada anterior. A análise voltou a comparar o guia com os documentos canónicos, com `BK-MF8-15`, com `BK-MF8-17`, com os scripts/configurações reais em `apps/` e com a referência privada `real_dev`, sem assumir a conclusão anterior como prova automática.

Resultado: `OK`. Os dois problemas que tinham deixado o guia em `PARCIAL` já não se reproduzem: o teste do runner usa import ESM com extensão `.js`, compatível com `moduleResolution: NodeNext`, e os tipos exportados centrais do runner têm JSDoc próprio. O guia continua alinhado com `RNF42` como gate local de qualidade e evidence final, sem inventar endpoint, controller, DTO, service ou UI.

Como o modo é `auditar_apenas`, nenhum guia BK nem ficheiro de produto foi editado nesta execução. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-16 | OK | OK | O guia tem estrutura completa, metadados canónicos alinhados, runner CLI local, evidence final, teste Jest com import `.js`, JSDoc nos contratos exportados e handoff coerente para `BK-MF8-17`. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-16`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RNF.md`: confirma `RNF42 - Execução final da bateria de testes e recolha de evidence`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam `BK-MF8-16`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF8-15`, sprint `S12`, tipo `Reforco` e próximo BK `BK-MF8-17`.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, `docs/planificacao/sprints/PLANO-SPRINTS.md` e `docs/planificacao/MF-VIEWS.md`: confirmam a posição de `BK-MF8-16` no fecho de produto e na sequência da MF8.
- `BK-MF8-15`: confirma `mf8:test-inventory`, `docs/evidence/MF8/TESTES-EM-FALTA.md`, lacunas `P0` e decisão para avanço.
- `BK-MF8-17`: confirma dependência de `BK-MF8-16` e consumo de `docs/evidence/MF8/TESTES-FINAIS.md`.
- `apps/api/package.json` e `real_dev/api/package.json`: confirmam `test:unit` como script real da API.
- `apps/web/package.json` e `real_dev/web/package.json`: confirmam `test:e2e` como script real da web.
- `apps/api/tsconfig.json`: confirma `"module": "NodeNext"` e `"moduleResolution": "NodeNext"`.
- Specs reais em `apps/api/src/scripts` e `real_dev/api/src/scripts`: confirmam o padrão de imports relativos com extensão `.js` em specs TypeScript.

### Findings da reauditoria

#### F01 - Import relativo do teste não segue o contrato NodeNext

- Estado atual: `JÁ_CORRIGIDO`
- Evidência negativa: a pesquisa por `from "./run-mf8-final-tests";` em `BK-MF8-16` não encontrou ocorrências.
- Evidência positiva: o bloco de `apps/api/src/scripts/run-mf8-final-tests.spec.ts` no guia usa `from "./run-mf8-final-tests.js";`.
- Resultado: o teste indicado no guia está alinhado com o padrão ESM/NodeNext do projeto.

#### F02 - Tipos exportados centrais não têm JSDoc próprio

- Estado atual: `JÁ_CORRIGIDO`
- Evidência: o bloco de `apps/api/src/scripts/run-mf8-final-tests.ts` documenta com JSDoc `FinalGateStatus`, `FinalTestCommand`, `FinalTestResult`, `InventoryEvidenceCheck`, `FinalGateEvidence`, `CommandRunner` e `nodeCommandRunner`.
- Resultado: os contratos de estados, comandos, resultados, checks de evidence e runner substituível ficam explicados no próprio código do guia.

#### F03 - Fuga de caminhos privados `real_dev` para o guia público

- Estado atual: `NÃO_REPRODUZIDO`
- Evidência: a pesquisa obrigatória por `real_dev`, `cd real_dev`, `npm --prefix real_dev`, `// real_dev`, `# real_dev` e `REFERENCE_ROOT` em `docs/planificacao/guias-bk/MF8/*.md` não encontrou ocorrências.
- Resultado: os caminhos student-facing continuam públicos em `apps/api` e `apps/web`.

#### F04 - Marcadores de guia genérico, scaffold ou solução parcial

- Estado atual: `NÃO_REPRODUZIDO`
- Evidência: a pesquisa obrigatória por termos como `hidrata`, `scaffold`, `roteiro genérico`, `snippet`, `pseudo-código`, `solução parcial`, `payload: unknown`, `as any`, `ContextAction`, `contextApi` e padrões perigosos com `localStorage` não encontrou ocorrências em `docs/planificacao/guias-bk/MF8/*.md`.
- Resultado: não há novo drift textual detetado no escopo MF8.

### Mapa de integração da MF

- Guia BK analisado:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/run-mf8-final-tests.ts`
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
  - `docs/evidence/MF8/TESTES-FINAIS.md`
- Ficheiro que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
  - `apps/web/package.json`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Testes criados pelo guia:
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, com import ESM compatível com NodeNext.
- BKs seguintes dependentes:
  - `BK-MF8-17`, que consome `docs/evidence/MF8/TESTES-FINAIS.md`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 mantém contratos de documentação técnica, modularidade, testes automatizados, deploy/readiness e health.
- MF alvo: `BK-MF8-15` inventaria lacunas; `BK-MF8-16` executa a bateria final; `BK-MF8-17` corrige erros a partir da evidence.
- Estado após reauditoria: a ponte `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17` está coerente e implementável no guia.

### Decisões técnicas confirmadas

- `BK-MF8-16` continua a ser um gate local de qualidade, sem endpoint/UI.
- O import relativo nos testes TypeScript da API usa `.js` no padrão ESM/NodeNext do projeto.
- Tipos exportados que representam payloads, estados, comandos, results e evidence têm JSDoc didático.
- `npm --prefix apps/web run test:e2e` continua a ser o comando web real no guia.

### Decisões de domínio confirmadas

- `RNF42` é qualidade/evidence final, não funcionalidade de IA, sala, turma, ownership ou UI.
- A evidence final deve provar execução sem expor dados pessoais, tokens, cookies, prompts privados, respostas IA completas ou outputs extensos.

### Decisões marcadas como DERIVADO

- Usar `apps/api/src/scripts/run-mf8-final-tests.ts` como runner local sem dependência nova.
- Usar `docs/evidence/MF8/TESTES-FINAIS.md` como artefacto final de `RNF42`.
- Usar JSDoc curto nos tipos exportados para manter o código didático sem transformar o bloco num manual excessivo.
- Usar Playwright como check opcional quando o ambiente local tiver browser runner configurado.

### Drift documental encontrado

- Drift anterior `import sem .js`: `JÁ_CORRIGIDO`.
- Drift anterior `tipos exportados sem JSDoc`: `JÁ_CORRIGIDO`.
- Novo drift no escopo `BK-MF8-16`: nenhum encontrado.
- Drift de caminhos privados `real_dev` nos guias MF8: nenhum encontrado.
- Drift canónico entre `RNF42`, matriz/backlog/contrato e sequência `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17`: nenhum encontrado.

### Validações finais desta execução

- Estrutura `BK-MF8-16`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa pelo import antigo `from "./run-mf8-final-tests";`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo `BK-MF8-16`: nenhum identificado.
- Bloqueios: nenhum.
- TODOs restantes no escopo `BK-MF8-16`: nenhum.
- Nota de execução: os comandos de produto que o BK ensina a criar/executar, como `npm run mf8:final-tests`, não foram corridos como produto nesta reauditoria porque o modo pedido é auditoria documental do guia. A validação aplicável foi a validação de planificação, estrutura, drift textual e coerência com o código/configuração existente.

## Execução 2026-07-02 - correção focada BK-MF8-16 após reauditoria

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-16]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada dos dois problemas deixados pela reauditoria anterior em `BK-MF8-16 - Execução final de testes`.

Resultado: `OK`. O guia mantém o contrato completo de `RNF42` como gate local de qualidade e deixa de ter as duas lacunas que justificavam `PARCIAL`: o teste do runner usa agora import ESM com extensão `.js`, alinhado com `moduleResolution: NodeNext`, e os tipos exportados centrais do runner têm JSDoc próprio.

Não foram editados ficheiros de produto em `apps/`; esta execução corrigiu o guia BK e este relatório, conforme o escopo de guias.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-16 | PARCIAL | OK | Corrigido o import relativo do teste para `./run-mf8-final-tests.js` e acrescentado JSDoc aos tipos exportados que modelam estados, comandos, resultados, evidence e runner substituível. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Os caminhos `apps/api/...`, `apps/web/...` e `docs/evidence/...` continuam a aparecer como instruções do BK para o aluno aplicar, não como alterações materiais desta execução.

### Correções aplicadas às findings

#### F01 - Import relativo do teste não segue o contrato NodeNext

- Estado após correção: `CORRIGIDO`
- Ação: no bloco de `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, o import passou de `from "./run-mf8-final-tests"` para `from "./run-mf8-final-tests.js"`.
- Evidência: o guia fica alinhado com `apps/api/tsconfig.json`, que usa `moduleResolution: NodeNext`, e com os specs reais que importam módulos locais com `.js`.
- Resultado: o teste indicado no guia passa a seguir o padrão ESM/NodeNext do projeto.

#### F02 - Tipos exportados centrais não têm JSDoc próprio

- Estado após correção: `CORRIGIDO`
- Ação: o bloco de `apps/api/src/scripts/run-mf8-final-tests.ts` passou a documentar com JSDoc:
  - `FinalGateStatus`
  - `FinalTestCommand`
  - `FinalTestResult`
  - `InventoryEvidenceCheck`
  - `FinalGateEvidence`
  - `CommandRunner`
  - `nodeCommandRunner`
- Resultado: os contratos de evidence, estados, comandos, outputs sanitizados e runner substituível ficam explicados dentro do próprio código do guia.

### Mapa de integração da MF

- Guia BK corrigido:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/run-mf8-final-tests.ts`
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
  - `docs/evidence/MF8/TESTES-FINAIS.md`
- Ficheiro que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
  - `apps/web/package.json`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Testes criados pelo guia:
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, agora com import ESM compatível com NodeNext.
- BKs seguintes dependentes:
  - `BK-MF8-17`, que consome `docs/evidence/MF8/TESTES-FINAIS.md`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 mantém contratos de documentação técnica, modularidade, testes automatizados, deploy/readiness e health.
- MF alvo: `BK-MF8-15` inventaria lacunas; `BK-MF8-16` executa a bateria final; `BK-MF8-17` corrige erros a partir da evidence.
- Estado após correção: a ponte `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17` fica coerente e implementável no guia.

### Decisões técnicas confirmadas

- `BK-MF8-16` continua a ser um gate local de qualidade, sem endpoint/UI.
- O import relativo nos testes TypeScript da API deve usar `.js` no padrão ESM/NodeNext do projeto.
- Tipos exportados que representam payloads, estados e evidence devem ter JSDoc didático.
- `npm --prefix apps/web run test:e2e` continua a ser o comando web real.

### Decisões de domínio confirmadas

- `RNF42` é qualidade/evidence final, não funcionalidade de IA, sala, turma, ownership ou UI.
- A evidence final deve provar execução sem expor dados pessoais, tokens, cookies, prompts privados, respostas IA completas ou outputs extensos.

### Decisões marcadas como DERIVADO

- Usar `apps/api/src/scripts/run-mf8-final-tests.ts` como runner local sem dependência nova.
- Usar `docs/evidence/MF8/TESTES-FINAIS.md` como artefacto final de `RNF42`.
- Usar JSDoc curto nos tipos exportados para manter o código didático sem transformar o bloco num manual excessivo.

### Drift documental encontrado

- Drift anterior `import sem .js`: `CORRIGIDO`.
- Drift anterior `tipos exportados sem JSDoc`: `CORRIGIDO`.
- Não foi encontrado novo drift documental dentro do escopo `BK-MF8-16`.

### Validações finais desta execução

- Estrutura `BK-MF8-16`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- Riscos restantes no escopo `BK-MF8-16`: nenhum identificado após esta correção.
- Bloqueios: nenhum.
- TODOs restantes no escopo `BK-MF8-16`: nenhum.

## Execução 2026-07-02 - reauditoria focada BK-MF8-16 após correção

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-16]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-16 - Execução final de testes`, depois da correção focada anterior. A reauditoria não assumiu a conclusão anterior como prova automática: o guia foi relido contra os documentos canónicos, BK anterior, BK seguinte, scripts reais de `apps/api` e `apps/web`, referência privada `real_dev` e validações obrigatórias.

Resultado: `PARCIAL`. O guia já deixou de estar `CRITICO`: tem 16 secções `####`, 7 passos técnicos, metadados canónicos alinhados com `RNF42`, runner CLI completo, comando `mf8:final-tests`, evidence `TESTES-FINAIS.md`, consumo de `TESTES-EM-FALTA.md`, sanitização de outputs, teste Jest e handoff operacional para `BK-MF8-17`.

Ainda não fecho como `OK` porque encontrei duas lacunas estreitas que impedem cumprir literalmente o contrato de executabilidade e documentação didática: o teste do runner importa `./run-mf8-final-tests` sem extensão `.js` apesar de a API usar `moduleResolution: NodeNext`, e os tipos exportados principais do runner não têm JSDoc próprio apesar de representarem payloads/resultados relevantes da evidence final.

Como o modo é `auditar_apenas`, nenhum guia BK foi editado nesta execução. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-16 | OK | PARCIAL | A arquitetura e o tutorial central estão agora completos, mas o import relativo do teste não segue o padrão `.js` exigido/observado em NodeNext e os tipos exportados centrais não têm JSDoc próprio. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-16`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RNF.md`: confirma `RNF42 - Execução final da bateria de testes e recolha de evidence`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam `BK-MF8-16`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF8-15`, sprint `S12`, tipo `Reforco` e próximo BK `BK-MF8-17`.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md` e `docs/planificacao/sprints/PLANO-SPRINTS.md`: confirmam S12 como fecho de produto, testes finais e evidence completa.
- `BK-MF8-15`: confirma `mf8:test-inventory`, `docs/evidence/MF8/TESTES-EM-FALTA.md`, lacunas `P0` e decisão para avanço.
- `BK-MF8-17`: confirma dependência de `BK-MF8-16` e consumo de `docs/evidence/MF8/TESTES-FINAIS.md`.
- `apps/api/package.json` e `real_dev/api/package.json`: confirmam `test:unit` como script real da API.
- `apps/web/package.json` e `real_dev/web/package.json`: confirmam `test:e2e` como script real da web.
- `apps/api/tsconfig.json`: confirma `"module": "NodeNext"` e `"moduleResolution": "NodeNext"`.
- `apps/api/src/scripts/backup-database.spec.ts`, `real_dev/api/src/scripts/export-technical-map.spec.ts` e `real_dev/api/src/scripts/validate-deploy-readiness.spec.ts`: confirmam o padrão real de imports relativos com extensão `.js` em specs TypeScript.

### Findings da reauditoria

#### F01 - Import relativo do teste não segue o contrato NodeNext

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: o bloco de `apps/api/src/scripts/run-mf8-final-tests.spec.ts` importa `from "./run-mf8-final-tests"`, sem extensão.
- Evidência comparativa: a API usa `moduleResolution: NodeNext`, e os specs reais usam imports como `from "./backup-database.js"`, `from "./export-technical-map.js"` e `from "./validate-deploy-readiness.js"`.
- O que falta completar: trocar o import do guia para `from "./run-mf8-final-tests.js"`.
- Risco pedagógico: médio. O aluno pode copiar o teste e encontrar erro de resolução/compilação sem perceber que o problema é apenas a extensão.
- Risco técnico: médio. O teste indicado na validação final pode não executar no mesmo padrão ESM/NodeNext do projeto.
- Risco de segurança/privacidade/legal: sem impacto direto.
- Dependências a reler: `apps/api/tsconfig.json`, `apps/api/jest.config.cjs`, specs reais em `apps/api/src/scripts`.

#### F02 - Tipos exportados centrais não têm JSDoc próprio

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: `FinalGateStatus`, `FinalTestCommand`, `FinalTestResult`, `InventoryEvidenceCheck`, `FinalGateEvidence` e `CommandRunner` são exportados no bloco principal do runner, mas não têm JSDoc individual antes da declaração.
- O que falta completar: acrescentar JSDoc curto e didático a cada tipo exportado que representa estado, comando, resultado, evidence ou runner substituível.
- Risco pedagógico: médio. O guia ensina bem as funções, mas deixa tipos centrais de evidence sem explicação inline, contrariando a regra de documentação didática.
- Risco técnico: baixo. A falta de JSDoc não quebra execução, mas quebra o contrato de qualidade do BK.
- Risco de segurança/privacidade/legal: baixo. A lacuna não expõe dados; reduz apenas a clareza sobre evidence e sanitização.
- Dependências a reler: regra de JSDoc da prompt, bloco do runner e explicação do Passo 2.

### Pontos confirmados como OK nesta reauditoria

- Header, owner, apoio, prioridade, esforço, sprint, dependência, RF/RNF e próximo BK estão alinhados com matriz, backlog e contrato de campos.
- Estrutura formal: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- O guia já não inventa endpoint, controller, DTO, service, schema ou UI para `RNF42`.
- O runner proposto executa comandos reais, recolhe exit code/stdout/stderr, escreve Markdown e devolve exit code `1` quando há bloqueio.
- O comando web real é `npm --prefix apps/web run test:e2e`; não há dependência de `smoke:e2e` como comando a executar.
- A evidence final é derivada de forma aceitável em `docs/evidence/MF8/TESTES-FINAIS.md`.
- A ponte `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17` está conceptualmente correta.
- O guia prevê sanitização de outputs para padrões como `authorization`, `cookie`, `token`, `password`, `secret` e `Bearer`.

### Mapa de integração da MF

- Guia BK analisado:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/run-mf8-final-tests.ts`
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
  - `docs/evidence/MF8/TESTES-FINAIS.md`
- Ficheiro que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
  - `apps/web/package.json`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Exports produzidos:
  - `FinalGateStatus`
  - `FinalTestCommand`
  - `FinalTestResult`
  - `InventoryEvidenceCheck`
  - `FinalGateEvidence`
  - `CommandRunner`
  - `nodeCommandRunner`
  - `resolveRepoRoot`
  - `buildMf8FinalTestPlan`
  - `formatCommandLine`
  - `sanitizeOutput`
  - `validateInventoryEvidence`
  - `runFinalTestCommand`
  - `runFinalTestPlan`
  - `hasBlockingFailure`
  - `renderFinalEvidenceMarkdown`
  - `createMf8FinalEvidence`
  - `runMf8FinalTestsCli`
- Imports consumidos de BKs anteriores:
  - evidence `docs/evidence/MF8/TESTES-EM-FALTA.md`, entregue por `BK-MF8-15`.
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Providers de IA criados ou usados:
  - nenhum.
- Regras de segurança/autorização aplicadas:
  - sem sessão real, base de dados ou provider externo;
  - outputs sanitizados;
  - outputs truncados antes de entrarem na evidence;
  - não registar cookies, tokens, passwords, secrets, prompts privados, respostas IA completas ou dados pessoais em evidence.
- Testes criados pelo guia:
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, ainda com finding F01 por import sem `.js`.
- BKs seguintes dependentes:
  - `BK-MF8-17`, que consome `docs/evidence/MF8/TESTES-FINAIS.md`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 estabelece contratos de documentação técnica, modularidade, testes automatizados, deploy/readiness, health e limites de IA.
- MF alvo: MF8 fecha qualidade da IA, UX, localização, exportação, funcionalidades finais, testes e correção de erros.
- Sequência imediata: `BK-MF8-15` inventaria testes e lacunas; `BK-MF8-16` executa a bateria final; `BK-MF8-17` corrige erros com base na evidence final.
- Estado da ponte: coerente, mas ainda `PARCIAL` por detalhe de executabilidade do teste e documentação JSDoc dos tipos.

### Decisões técnicas confirmadas

- `BK-MF8-16` deve ser um gate local de qualidade, não um endpoint/API de domínio.
- `apps/api` é o local adequado para o runner Node por já ter Nest/Jest/build configurados.
- `npm --prefix apps/web run test:e2e` é o comando web real.
- `docs/evidence/MF8/TESTES-FINAIS.md` é o handoff correto para `BK-MF8-17`.
- Comandos obrigatórios em `FAIL` devem bloquear avanço; E2E pode ficar `BLOQUEADO` por ambiente, desde que fique visível.

### Decisões de domínio confirmadas

- `RNF42` pertence a qualidade/evidence final, não a funcionalidades IA, ownership, sala, turma ou UI.
- Não há requisito canónico para endpoint, DTO, schema, service de domínio ou componente React neste BK.
- A evidence deve provar execução sem expor dados pessoais, outputs sensíveis, prompts privados ou respostas IA completas.

### Decisões marcadas como DERIVADO

- Criar `apps/api/src/scripts/run-mf8-final-tests.ts` como runner local.
- Criar `apps/api/src/scripts/run-mf8-final-tests.spec.ts` como teste unitário do runner.
- Expor `mf8:final-tests` em `apps/api/package.json`.
- Usar Markdown em `docs/evidence/MF8/TESTES-FINAIS.md`.
- Tratar Playwright E2E como comando opcional/bloqueável por ambiente.

### Drift documental encontrado

- Drift confirmado: import do teste no guia não segue o padrão `.js` dos specs reais em NodeNext.
- Drift confirmado: tipos exportados relevantes não têm JSDoc próprio apesar de a prompt exigir JSDoc em tipos/interfaces importantes.
- Drift não confirmado: não há fuga `real_dev` nos guias MF8.
- Drift não confirmado: não há termos proibidos encontrados pela pesquisa obrigatória.

### Validações finais desta execução

- Estrutura `BK-MF8-16`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e TODOs restantes

- `TODO`: corrigir o import do teste para `from "./run-mf8-final-tests.js"`.
- `TODO`: acrescentar JSDoc próprio aos tipos exportados centrais do runner.
- Risco restante: se o aluno copiar o teste exatamente como está, pode encontrar uma falha de resolução de módulo antes de testar a regra de negócio do runner.
- Risco restante: a documentação inline dos tipos ainda não cumpre totalmente a exigência didática da prompt.
- Bloqueios: nenhum bloqueio ambiental ou documental para corrigir estas duas lacunas numa execução posterior com modo de correção.

## Execução 2026-07-02 - correção focada BK-MF8-16

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-16]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada do `BK-MF8-16 - Execução final de testes`, partindo da reauditoria imediatamente anterior, que classificava o guia como `CRITICO`.

Resultado: `OK`. O guia foi corrigido para transformar `RNF42` num gate final executável e autocontido: runner CLI em `apps/api/src/scripts/run-mf8-final-tests.ts`, teste unitário em `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, script `mf8:final-tests` em `apps/api/package.json`, evidence final `docs/evidence/MF8/TESTES-FINAIS.md`, consumo explícito de `docs/evidence/MF8/TESTES-EM-FALTA.md` e handoff objetivo para `BK-MF8-17`.

Não foram editados ficheiros de produto em `apps/`; a intervenção foi documental no guia BK e neste relatório, como esperado para `corrigir_apenas` em guias de planificação.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-16 | CRITICO | OK | O guia passou a executar a bateria final com comandos reais, validação da evidence anterior, geração de `TESTES-FINAIS.md`, teste Jest do runner, script `mf8:final-tests`, outputs sanitizados e handoff para `BK-MF8-17`. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Os ficheiros `apps/api/...`, `apps/web/...` e `docs/evidence/...` aparecem como instruções do BK para o aluno aplicar, não como alterações reais desta execução.

### Evidência documental e técnica usada

- Reauditoria focada imediatamente anterior nesta mesma página, que classificava `BK-MF8-16` como `CRITICO`.
- `docs/RNF.md`: confirma `RNF42 - Execução final da bateria de testes e recolha de evidence`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam owner, apoio, prioridade, esforço, sprint, dependência `BK-MF8-15` e próximo BK `BK-MF8-17`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` e `PLANO-IMPLEMENTACAO-TOTAL.md`: confirmam S12 como fecho de produto, testes finais e evidence completa.
- `BK-MF8-15`: confirma `mf8:test-inventory`, `docs/evidence/MF8/TESTES-EM-FALTA.md` e critério de avanço para BK16.
- `BK-MF8-17`: confirma dependência de `BK-MF8-16` e consumo de `docs/evidence/MF8/TESTES-FINAIS.md`.
- `apps/api/package.json`: confirma padrão de scripts com `nest build && node dist/scripts/...`.
- `apps/web/package.json`: confirma que o comando real é `test:e2e`, não `smoke:e2e`.
- `apps/api/jest.config.cjs`: confirma Jest/ts-jest em ES Modules para testes dos scripts.

### Correções aplicadas às findings

#### F01 - Contrato canónico de `RNF42`

- Estado após correção: `JA_CORRIGIDO`
- Evidência: header e metadados permaneceram alinhados com matriz, backlog e contrato de campos.
- Resultado: sem alteração necessária.

#### F02 - Estrutura pedagógica formal

- Estado após correção: `JA_CORRIGIDO`
- Evidência: o guia manteve 16 secções `####` e 7 passos `### Passo`.
- Resultado: a correção preservou a estrutura obrigatória da MF8.

#### F03 - Runner final não executa comandos nem recolhe evidence

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a incluir `apps/api/src/scripts/run-mf8-final-tests.ts` completo, com `buildMf8FinalTestPlan`, validação de `TESTES-EM-FALTA.md`, execução de comandos por `spawnSync`, recolha de exit code/stdout/stderr, sanitização de outputs, geração de Markdown e escrita de `docs/evidence/MF8/TESTES-FINAIS.md`.
- Resultado: `RNF42` deixa de estar representado por uma lista estática de comandos e passa a ter um runner final executável.

#### F04 - Comando web documentado não existe no projeto público

- Estado após correção: `CORRIGIDO`
- Ação: o guia removeu `smoke:e2e` e passou a usar o script real `npm --prefix apps/web run test:e2e`.
- Resultado: a bateria final já não depende de um script inexistente em `apps/web/package.json`.

#### F05 - Texto genérico de controller/service/frontend contradiz o contrato `sem endpoint novo`

- Estado após correção: `CORRIGIDO`
- Ação: os passos genéricos de controller/service/DTO/UI foram substituídos por um fluxo técnico local: confirmar evidence de entrada, criar runner CLI, expor script, testar runner, gerar evidence, interpretar falhas/bloqueios e preparar handoff.
- Resultado: o guia deixa claro que `BK-MF8-16` não cria endpoint, controller, DTO, service, cliente API ou página React.

#### F06 - Teste apresentado não testa o runner final

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a incluir `apps/api/src/scripts/run-mf8-final-tests.spec.ts`, com testes para bloqueio sem evidence de entrada, falha obrigatória e sanitização de outputs.
- Resultado: o comportamento crítico do runner fica testável com Jest, sem rede, base de dados ou browser.

#### F07 - Handoff para BK17 fica bloqueado por artefacto não produzido

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a criar `docs/evidence/MF8/TESTES-FINAIS.md`, a validar `docs/evidence/MF8/TESTES-EM-FALTA.md` antes da execução final e a entregar critério de avanço para `BK-MF8-17`.
- Resultado: `BK-MF8-17` recebe decisão final, tabela de comandos, estados `PASS`/`FAIL`/`BLOQUEADO` e outputs sanitizados.

#### F08 - Caminhos privados `real_dev` em texto destinado aos alunos

- Estado após correção: `NAO_REPRODUZIDO`
- Evidência: a pesquisa obrigatória nos guias MF8 não encontrou `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT`.
- Resultado: sem correção necessária.

#### F09 - Termos proibidos/língua interna nos guias MF8

- Estado após correção: `NAO_REPRODUZIDO`
- Evidência: a pesquisa textual obrigatória nos guias MF8 não devolveu ocorrências.
- Resultado: sem correção necessária.

### Mapa de integração da MF

- Guia BK corrigido:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/run-mf8-final-tests.ts`
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
  - `docs/evidence/MF8/TESTES-FINAIS.md`
- Ficheiro que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
  - `apps/web/package.json`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Exports documentados:
  - `FinalGateStatus`
  - `FinalTestCommand`
  - `FinalTestResult`
  - `InventoryEvidenceCheck`
  - `FinalGateEvidence`
  - `CommandRunner`
  - `nodeCommandRunner`
  - `resolveRepoRoot`
  - `buildMf8FinalTestPlan`
  - `formatCommandLine`
  - `sanitizeOutput`
  - `validateInventoryEvidence`
  - `runFinalTestCommand`
  - `runFinalTestPlan`
  - `hasBlockingFailure`
  - `renderFinalEvidenceMarkdown`
  - `createMf8FinalEvidence`
  - `runMf8FinalTestsCli`
- Endpoints criados:
  - nenhum.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Testes criados pelo guia:
  - `apps/api/src/scripts/run-mf8-final-tests.spec.ts`
- Regras de segurança/privacidade aplicadas:
  - sem acesso a base de dados, sessão real ou provider externo;
  - outputs sanitizados para remover padrões de `authorization`, `cookie`, `token`, `password`, `secret` e `Bearer`;
  - outputs truncados antes de entrarem na evidence.
- BKs seguintes dependentes:
  - `BK-MF8-17`, que consome `docs/evidence/MF8/TESTES-FINAIS.md`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 já estabelece documentação técnica, modularidade, testes automatizados para módulos críticos, deploy/health/readiness e limites de IA como contratos de qualidade.
- MF alvo: MF8 fecha produto, qualidade da IA e validação final. `BK-MF8-15` entrega inventário de testes; `BK-MF8-16` agora executa a bateria final; `BK-MF8-17` corrige e revalida erros encontrados.
- Sequência imediata: `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17` fica coerente porque BK16 consome `TESTES-EM-FALTA.md`, gera `TESTES-FINAIS.md` e entrega estados objetivos para correção.

### Decisões técnicas confirmadas

- O gate final deve ser um script local de qualidade, não endpoint/UI.
- O comando real da web é `npm --prefix apps/web run test:e2e`.
- O runner deve bloquear se `TESTES-EM-FALTA.md` não existir ou indicar que não se deve avançar.
- Comandos obrigatórios em `FAIL` bloqueiam o avanço; Playwright E2E pode ficar `BLOQUEADO` quando o ambiente local não estiver pronto.
- Evidence final deve ser Markdown, legível para PR/defesa e segura para dados sensíveis.

### Decisões marcadas como DERIVADO

- `apps/api/src/scripts/run-mf8-final-tests.ts` como runner local sem dependência nova.
- `docs/evidence/MF8/TESTES-FINAIS.md` como artefacto final de `RNF42`.
- `mf8:final-tests` em `apps/api/package.json` com `nest build && node dist/scripts/run-mf8-final-tests.js`.
- Sanitização simples por padrões textuais para segredos comuns e truncagem de output.

### Validações finais desta execução

- Estrutura `BK-MF8-16`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e notas de execução

- Os comandos documentados dentro do BK (`npm run mf8:final-tests` e o teste Jest do runner) não foram executados como comandos de produto, porque esta execução corrige guias e não materializa ficheiros em `apps/`.
- A working tree já continha alterações em todos os guias MF8 antes desta correção. Foram preservadas e não alarguei o escopo.
- A reauditoria anterior foi preservada abaixo para histórico; a verdade operacional mais recente está nesta secção superior.

## Execução 2026-07-02 - reauditoria focada BK-MF8-16

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-16]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-16 - Execução final de testes`, sem usar a classificação anterior como prova automática e sem editar o guia BK.

Resultado: `CRITICO`. O guia atual cumpre a moldura formal da MF8, com 16 secções `####`, 7 passos técnicos, caminhos públicos `apps/api` e `apps/web`, e metadados canónicos alinhados com `RNF42`. Contudo, ainda não permite a um aluno executar a bateria final de testes sem adivinhar peças essenciais: o runner apresentado apenas devolve uma lista de comandos, não executa comandos, não recolhe outputs, não escreve `docs/evidence/MF8/TESTES-FINAIS.md`, referencia um script web inexistente (`smoke:e2e`) e mantém texto genérico de controller/service/frontend apesar de o próprio guia declarar `sem endpoint novo; gate técnico`.

O modo ativo foi `auditar_apenas`, por isso nenhum guia BK nem ficheiro de produto foi editado nesta execução. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 0 | 0 | 1 |
| Depois da reauditoria focada | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-16 | CRITICO | CRITICO | O guia declara `RNF42` e uma execução final com evidence, mas entrega apenas um plano estático de comandos. Falta CLI real, recolha de exit code/output, escrita de evidence, teste unitário do runner, consumo explícito da evidence do BK15 e alinhamento com scripts reais de `apps/web`. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-16`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `README.md`: confirma StudyFlow como plataforma de estudo com contextos separados de aluno, turma/disciplina, grupo, IA, segurança e rastreabilidade.
- `docs/RNF.md`: confirma `RNF42 - Execução final da bateria de testes e recolha de evidence`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/README.md`: confirma a hierarquia canónica e a precedência de matriz/backlog/guias.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: confirma MF8 como fecho de produto, qualidade da IA e validação final, com Gate S12 orientado a testes finais, erros corrigidos e auditoria automática em `PASS`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-16`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF8-15`, requisito `RNF42`, sprint `S12`, tipo `Reforco` e próximo BK `BK-MF8-17`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirmam a mesma cadeia `BK-MF8-15 -> BK-MF8-16 -> BK-MF8-17`.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a sequência MF8 com 17 BKs.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: confirma `S12` como fecho de produto, funcionalidades MF8 expandidas, testes finais e evidence completa.
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`: confirma que passos técnicos devem ser executáveis, com código completo, explicação, validação e negativos.
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`: confirma que o handoff para BK16 deveria fornecer `mf8:test-inventory` e `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`: confirma que BK17 depende de `BK-MF8-16` e revê `docs/evidence/MF8/TESTES-FINAIS.md`.
- `apps/api/package.json`: confirma scripts reais `build`, `test`, `test:unit` e ausência de script MF8 final.
- `apps/web/package.json`: confirma scripts reais `build`, `test:e2e` e `test:e2e:headed`; não existe `smoke:e2e`.
- `apps/api/src/scripts/` e `apps/web/tests/e2e/`: confirmam que existem scripts/suites de qualidade anteriores, mas não existe ainda `run-mf8-final-tests.ts` materializado na árvore pública.

### Findings da reauditoria

#### F01 - Contrato canónico de `RNF42`

- Estado: `OK`
- Evidência: o header de `BK-MF8-16` declara `RNF42`, `P0`, owner `Guilherme`, apoio `Natalia`, esforço `M`, dependência `BK-MF8-15`, sprint `S12`, `Reforco` e próximo BK `BK-MF8-17`, alinhado com matriz, backlog e contrato de campos.
- Decisão: sem correção documental de metadados.

#### F02 - Estrutura pedagógica formal

- Estado: `OK`
- Evidência: a MF8 tem 17 guias com 16 secções `####` e 7 passos `### Passo`; `BK-MF8-16` também cumpre essa contagem formal.
- Decisão: a falha não é estrutural superficial; é de executabilidade técnica.

#### F03 - Runner final não executa comandos nem recolhe evidence

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: o guia manda criar `apps/api/src/scripts/run-mf8-final-tests.ts` e `docs/evidence/MF8/TESTES-FINAIS.md`, mas o código apresentado só exporta `buildMf8FinalTestPlan()`, uma lista estática de comandos. Não há `main`, execução com `child_process`, captura de exit code/stdout/stderr, escrita do Markdown de evidence, criação da pasta `docs/evidence/MF8`, nem regra operacional para falhar quando um comando obrigatório falha.
- O que falta completar: runner CLI completo, geração de `TESTES-FINAIS.md`, formato estável de observed/expected/result, tratamento de comandos obrigatórios/opcionais e instrução concreta para executar o script.
- Risco pedagógico: elevado. O aluno fica com a ideia de que listar comandos equivale a executar a bateria final.
- Risco técnico: elevado. `RNF42` exige execução final e evidence; o guia ainda não entrega o mecanismo que prova isso.
- Risco de segurança/privacidade: médio. Sem formato explícito, o aluno pode guardar outputs excessivos ou sensíveis.
- Dependências a reler: `RNF42`, `BK-MF8-15`, `BK-MF8-17`, `apps/api/package.json`, `apps/web/package.json`.
- Prioridade de correção: `P0`.

#### F04 - Comando web documentado não existe no projeto público

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: o plano inclui `npm run smoke:e2e --prefix apps/web`, mas `apps/web/package.json` só expõe `test:e2e`, `test:e2e:headed`, `test:e2e:install`, `build`, `dev` e `preview`.
- O que falta completar: substituir por comando real (`npm --prefix apps/web run test:e2e` ou variante com ficheiro específico) ou ensinar a criar explicitamente um script `smoke:e2e` com justificativa.
- Risco pedagógico: elevado. O aluno segue o guia e encontra um comando inexistente no momento crítico da execução final.
- Risco técnico: elevado. A bateria final fica não executável.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: `apps/web/package.json`, `apps/web/tests/e2e/README.md`, BKs MF8 com suites E2E esperadas.
- Prioridade de correção: `P0`.

#### F05 - Texto genérico de controller/service/frontend contradiz o contrato `sem endpoint novo`

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: a arquitetura declara `Endpoint/contrato principal: sem endpoint novo; gate técnico`, mas os Passos 2, 4 e 5 falam em service, DTO, model, controller, resposta HTTP, cliente API, página/componente React, UI, sessão expirada e ownership/membership no service. O guia não define endpoint, payload, DTO, service, controller, cliente API ou componente real.
- O que falta completar: transformar BK16 num gate local de qualidade coerente com `RNF42`, ou então definir explicitamente um contrato HTTP/UI canónico. Pela documentação atual, o caminho mais seguro é script local/evidence, sem endpoint novo.
- Risco pedagógico: elevado. O aluno pode inventar backend/UI sem requisito, duplicando responsabilidades e desviando do fecho de testes.
- Risco técnico: elevado. Pode criar endpoints, DTOs e UI artificiais sem integração real.
- Risco de segurança/privacidade: médio/alto se o aluno expuser outputs de testes ou dados de contexto por endpoint não previsto.
- Dependências a reler: `RNF42`, `_TEMPLATE-BK.md`, `BK-MF8-15`, `BK-MF8-17`.
- Prioridade de correção: `P0`.

#### F06 - Teste apresentado não testa o runner final

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: o Passo 6 manda criar `apps/api/src/modules/mf8/bk-mf8-16.expected-results.ts`, mas esse ficheiro não aparece na lista principal de ficheiros a criar/editar/rever. O código é apenas um helper de strings esperadas; não importa `buildMf8FinalTestPlan()`, não verifica comandos obrigatórios, não testa escrita de evidence, não simula comando falhado e não prova negativos do gate.
- O que falta completar: teste Jest real para o runner ou para funções puras do runner, cobrindo comando obrigatório com `PASS`, comando obrigatório com `FAIL`, comando opcional bloqueado e Markdown determinístico sem dados sensíveis.
- Risco pedagógico: elevado. O aluno fica sem exemplo de como testar a execução final.
- Risco técnico: elevado. O componente central de `RNF42` não tem regressão automatizada.
- Risco de segurança/privacidade: médio, porque a evidence não é validada contra exposição de informação sensível.
- Dependências a reler: `apps/api/jest.config.cjs`, padrões de scripts em `apps/api/src/scripts/`, `BK-MF8-15`.
- Prioridade de correção: `P0`.

#### F07 - Handoff para BK17 fica bloqueado por artefacto não produzido

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência observada: `BK-MF8-17` revê `docs/evidence/MF8/TESTES-FINAIS.md`, mas esse diretório/ficheiro não existe na árvore atual e `BK-MF8-16` não mostra código ou comando que o crie. Além disso, BK16 não consome explicitamente a evidence do BK15 (`TESTES-EM-FALTA.md`) antes de decidir se executa a bateria final.
- O que falta completar: leitura/referência explícita à evidence de BK15, geração de `TESTES-FINAIS.md`, regra de bloqueio quando BK15 reporta lacunas `P0`, e handoff para BK17 com lista objetiva de falhas.
- Risco pedagógico: elevado. O aluno não sabe de onde vem a decisão de avançar ou bloquear.
- Risco técnico: elevado. BK17 pode começar sem lista confiável de erros/falhas.
- Risco de segurança/privacidade: médio se evidence for criada manualmente sem política de minimização.
- Dependências a reler: `BK-MF8-15`, `BK-MF8-17`, `docs/evidence/MF8/`.
- Prioridade de correção: `P0`.

#### F08 - Caminhos privados `real_dev` em texto destinado aos alunos

- Estado: `NAO_REPRODUZIDO`
- Evidência: a pesquisa obrigatória em `docs/planificacao/guias-bk/MF8/*.md` não encontrou `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT`.
- Decisão: sem correção necessária.

#### F09 - Termos proibidos/língua interna nos guias MF8

- Estado: `NAO_REPRODUZIDO`
- Evidência: a pesquisa textual obrigatória de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md` não devolveu ocorrências.
- Decisão: sem correção necessária.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que `BK-MF8-16` manda criar:
  - `apps/api/src/scripts/run-mf8-final-tests.ts`
  - `docs/evidence/MF8/TESTES-FINAIS.md`
  - `apps/api/src/modules/mf8/bk-mf8-16.expected-results.ts` aparece apenas no Passo 6 e está desalinhado com a lista principal.
- Ficheiros que `BK-MF8-16` manda editar:
  - `apps/api/package.json`
- Ficheiros que `BK-MF8-16` manda rever:
  - `scripts/validate-planificacao.sh`
  - `apps/web/package.json`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- Exports produzidos pelo guia:
  - `FinalTestCommand`
  - `buildMf8FinalTestPlan`
  - `bkMf816ExpectedResults`
  - `getBkMf816ExpectedResult`
- Endpoints criados:
  - nenhum definido, mas o texto ainda sugere controller/HTTP/UI de forma genérica.
- DTOs/validators/schemas/services criados:
  - nenhum definido de forma concreta.
- Componentes/páginas frontend criados:
  - nenhum definido de forma concreta.
- Testes criados pelo guia:
  - nenhum teste real; apenas helper de expected results.
- Regras de segurança/autorização aplicadas:
  - o guia recomenda genericamente sessão/ownership/membership/role, mas não há fluxo real que as aplique porque o BK deveria ser um gate técnico local.
- BKs seguintes dependentes:
  - `BK-MF8-17`, que precisa de `docs/evidence/MF8/TESTES-FINAIS.md` para corrigir erros encontrados e revalidar.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 já estabelece documentação técnica, modularidade, testes automatizados para módulos críticos, deploy/health/readiness e limites de IA como contratos de qualidade.
- MF alvo: MF8 fecha produto, qualidade da IA e validação final. `BK-MF8-15` agora entrega, em guia, inventário de testes e evidence de lacunas para BK16 consumir.
- Sequência imediata: `BK-MF8-15` entrega comando/evidence; `BK-MF8-16` deveria executar a bateria final e produzir `TESTES-FINAIS.md`; `BK-MF8-17` deveria consumir essa evidence para correção de erros. Como BK16 não executa nem escreve evidence de forma concreta, a ponte BK15 -> BK16 -> BK17 continua tecnicamente frágil.

### Decisões técnicas confirmadas

- `BK-MF8-16` está corretamente ligado a `RNF42`.
- A decisão de usar caminhos públicos `apps/api` e `apps/web` está correta.
- A decisão de evitar dados sensíveis em logs/evidence está correta.
- O validador estrutural da planificação passa com score `100`, mas isso não prova executabilidade técnica do guia.

### Decisões marcadas como DERIVADO

- O formato de evidence `docs/evidence/MF8/TESTES-FINAIS.md` é uma decisão derivada aceitável, mas precisa de runner concreto que a produza.
- Um script local em `apps/api/src/scripts/run-mf8-final-tests.ts` é uma decisão derivada aceitável para `RNF42`, desde que seja CLI executável e testável.
- Parar o gate quando comando obrigatório falha é uma decisão derivada correta, mas ainda não está implementada no código apresentado.

### Validações finais desta execução

- Estrutura `BK-MF8-16`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Estrutura da MF8 completa: `PASS` - 17 guias, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências; o `rg` terminou com exit code `1` por não encontrar matches.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e notas de execução

- A working tree já continha alterações em todos os guias MF8 antes desta reauditoria. Foram preservadas e não alarguei o escopo.
- `docs/evidence/` não existe atualmente na árvore pública, o que reforça que a evidence de `BK-MF8-16` ainda é apenas contratual no guia, não materializada nesta execução.
- O risco residual principal é pedagógico e técnico: o aluno pode seguir o guia e continuar sem bateria final executável, sem artefacto `TESTES-FINAIS.md` e sem handoff objetivo para `BK-MF8-17`.

## Execução 2026-07-02 - reauditoria focada BK-MF8-15

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-15]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta`, sem reutilizar a classificação anterior como prova automática.

Resultado: `OK`. O guia atual cumpre o contrato canónico de `RNF41`, mantém os caminhos públicos `apps/api` e `apps/web`, não cria endpoint/UI sem requisito, entrega tutorial técnico completo para inventário de testes, inclui comando executável, teste unitário, evidence Markdown e handoff operacional para `BK-MF8-16`.

O modo ativo foi `auditar_apenas`, por isso nenhum guia BK nem ficheiro de produto foi editado nesta execução. O único ficheiro atualizado foi este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-15 | OK | OK | A reauditoria confirmou header canónico, 16 secções `####`, 7 passos técnicos, script local completo, teste Jest, script `mf8:test-inventory`, evidence `TESTES-EM-FALTA.md`, critérios de aceite, validação final e handoff para `BK-MF8-16`. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-15` nem `BK-MF8-16`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RNF.md`: confirma `RNF41 - Verificação dos testes atuais e criação dos testes em falta`, categoria `Qualidade`, prioridade `Must`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-15`, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependência `BK-MF8-14`, requisito `RNF41`, sprint `S12`, tipo `Reforco` e próximo BK `BK-MF8-16`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma a mesma linha canónica do BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma a cadeia `BK-MF8-14 -> BK-MF8-15 -> BK-MF8-16`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`: confirma que o handoff para BK15 envolve verificar `mf8-flashcards.spec.ts` e cobertura restante.
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`: confirma dependência de `BK-MF8-15`, mas mantém uma frase antiga sobre o BK15 estar genérico/incompleto; esse drift está registado abaixo.
- `apps/api/package.json`: confirma scripts reais existentes e valida que o exemplo do BK15 acrescenta `mf8:test-inventory` sem remover scripts atuais.
- `apps/api/src/modules/...` e `apps/web/src/components/...`: confirmam que os alvos críticos principais usados no manifesto têm paths públicos plausíveis em `apps/`.
- `real_dev/api` e `real_dev/web`: usados apenas como referência privada para confirmar nomes técnicos equivalentes quando necessário.

### Findings da reauditoria

#### F01 - Contrato canónico de `RNF41`

- Estado: `OK`
- Evidência: o header de `BK-MF8-15` declara `RNF41`, `P0`, owner `Natalia`, apoio `Guilherme`, esforço `M`, dependência `BK-MF8-14`, sprint `S12`, `Reforco` e próximo BK `BK-MF8-16`, alinhado com matriz, backlog e contrato de campos.
- Decisão: sem correção necessária.

#### F02 - Estrutura pedagógica do guia

- Estado: `OK`
- Evidência: o guia tem 16 secções `####` e 7 passos `### Passo`, com objetivo, importância, scope-in/out, estado antes/depois, pré-requisitos, glossário, teoria, arquitetura, ficheiros, tutorial, critérios de aceite, validação, evidence, handoff e changelog.
- Decisão: sem correção necessária.

#### F03 - Inventário executável para testes atuais e testes em falta

- Estado: `OK`
- Evidência: o guia define `apps/api/src/scripts/mf8-test-inventory.ts` com manifesto de alvos críticos, discovery controlado de ficheiros, normalização de paths públicos, classificação `covered`, `missing-spec` e `missing-source`, renderer Markdown e CLI.
- Decisão: sem correção necessária.

#### F04 - Teste unitário real do inventário

- Estado: `OK`
- Evidência: o guia inclui `apps/api/src/scripts/mf8-test-inventory.spec.ts` com três casos: alvo coberto, teste em falta, ficheiro base em falta e Markdown determinístico para evidence.
- Decisão: sem correção necessária.

#### F05 - Comando, evidence e handoff para `BK-MF8-16`

- Estado: `OK`
- Evidência: o guia define `mf8:test-inventory`, `docs/evidence/MF8/TESTES-EM-FALTA.md`, regra de exit code `1` para lacunas `P0`, critério de avanço e handoff explícito para `BK-MF8-16`.
- Decisão: sem correção necessária.

#### F06 - Caminhos privados `real_dev` em texto destinado aos alunos

- Estado: `NAO_REPRODUZIDO`
- Evidência: a pesquisa específica em `BK-MF8-15` e a pesquisa global em `docs/planificacao/guias-bk/MF8/*.md` não encontraram `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT`.
- Decisão: sem correção necessária.

#### F07 - Termos proibidos/língua interna nos guias MF8

- Estado: `NAO_REPRODUZIDO`
- Evidência: a pesquisa textual obrigatória de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md` não devolveu ocorrências.
- Decisão: sem correção necessária.

### Drift documental fora do BK alvo

#### D01 - `BK-MF8-16` ainda descreve o BK15 como guia antigo/genérico

- Estado: `DRIFT_FORA_ESCOPO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Evidência: a secção `Estado antes e depois` de `BK-MF8-16` ainda diz que `BK-MF8-15` deixa contratos anteriores prontos, mas que "este requisito ainda surge no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo".
- Impacto: baixo/médio. Não invalida o `BK-MF8-15`, que agora está completo, mas pode confundir o aluno ao entrar no BK seguinte.
- Decisão: não corrigido nesta execução porque `MODO=auditar_apenas`, `BK_IDS=[BK-MF8-15]` e `STRICT_SCOPE=true`. Deve ser tratado numa ronda que permita editar `BK-MF8-16`.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que `BK-MF8-15` manda criar:
  - `apps/api/src/scripts/mf8-test-inventory.ts`
  - `apps/api/src/scripts/mf8-test-inventory.spec.ts`
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Ficheiros que `BK-MF8-15` manda editar:
  - `apps/api/package.json`
- Exports produzidos pelo BK:
  - `mf8CriticalTestTargets`
  - `toReportPath`
  - `collectProjectFiles`
  - `mergeFileSets`
  - `checkTestCoverage`
  - `findMissingCriticalTests`
  - `createMf8TestInventory`
  - `renderInventoryMarkdown`
  - `runMf8TestInventoryCli`
- Endpoints criados:
  - nenhum.
- Componentes/páginas frontend criados:
  - nenhum.
- Testes criados pelo guia:
  - `apps/api/src/scripts/mf8-test-inventory.spec.ts`
- BKs seguintes dependentes:
  - `BK-MF8-16`, para execução final com base na evidence de testes em falta.

### Validações finais desta execução

- Estrutura `BK-MF8-15`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e notas de execução

- Os comandos documentados dentro do BK (`npm run mf8:test-inventory` e o teste unitário do inventário) não foram executados como comandos de produto, porque `auditar_apenas` não materializa os ficheiros em `apps/`; a validação desta ronda é documental/estática.
- A working tree já continha alterações noutros guias MF8 antes desta reauditoria. Foram preservadas e não alarguei o escopo.
- O único risco residual identificado é o drift downstream `D01` em `BK-MF8-16`.

## Execução 2026-07-02 - correção focada BK-MF8-15

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-15]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada do `BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta`, partindo da auditoria imediatamente anterior, que classificava o guia como `CRITICO`.

O guia foi reescrito dentro do escopo permitido para transformar `RNF41` num tutorial executável: script local de inventário, comando em `apps/api/package.json`, teste unitário Jest, evidence Markdown e handoff objetivo para `BK-MF8-16`. Não foram editados ficheiros de produto em `apps/`; a intervenção foi apenas documental, como esperado em `corrigir_apenas` para guias BK.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-15 | CRITICO | OK | O guia passou a definir contrato técnico completo para inventariar cobertura de testes, expor comando executável, testar a unidade central, gerar evidence e entregar critério de avanço a `BK-MF8-16`. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. O modo ativo corrige guias e relatório; os ficheiros `apps/api/...`, `apps/web/...` e `docs/evidence/...` aparecem como instruções do BK para o aluno aplicar, não como alterações reais desta execução.

### Evidência documental e técnica usada

- Auditoria focada anterior nesta mesma página, que classificava `BK-MF8-15` como `CRITICO`.
- `docs/RNF.md`: confirma `RNF41` como requisito de qualidade sobre verificação de testes atuais e criação dos testes em falta.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam owner, apoio, prioridade, esforço, sprint, dependência `BK-MF8-14` e próximo BK `BK-MF8-16`.
- `apps/api/package.json`: usado para alinhar o exemplo de `scripts` com os scripts reais existentes.
- `apps/web/package.json`: usado para manter o papel da web limitado a suites E2E existentes.
- `apps/api/src/scripts/` e `real_dev/api/src/scripts/`: usados como referência técnica para scripts locais de qualidade, sempre remapeados para caminhos públicos `apps/api`.
- `BK-MF8-14` e `BK-MF8-16`: usados para alinhar handoff de flashcards e execução final.

### Correções aplicadas às findings

#### F01 - Inventário de testes incompleto para `RNF41`

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a incluir `apps/api/src/scripts/mf8-test-inventory.ts` completo, com manifesto de alvos críticos, discovery controlado de ficheiros, classificação `covered`, `missing-spec` e `missing-source`, renderer Markdown e CLI com exit code `1` para lacunas `P0`.
- Resultado: o aluno deixa de depender de uma função parcial e passa a ter contrato operacional para inventariar cobertura.

#### F02 - `apps/api/package.json` sem script concreto

- Estado após correção: `CORRIGIDO`
- Ação: o Passo 3 passou a mostrar a alteração concreta em `scripts`, incluindo `mf8:test-inventory`.
- Resultado: `BK-MF8-16` recebe um comando estável: `cd apps/api && npm run mf8:test-inventory`.

#### F03 - Texto genérico de controller/UI sem contrato

- Estado após correção: `CORRIGIDO`
- Ação: os passos genéricos de controller, DTO, cliente API e UI foram substituídos por script local, package script, teste unitário, evidence e handoff.
- Resultado: o BK já não empurra o aluno para endpoint ou página sem requisito canónico.

#### F04 - Ficheiros desalinhados e ausência de teste real

- Estado após correção: `CORRIGIDO`
- Ação: a lista principal foi alinhada com os ficheiros criados/editados/revistos e o guia passou a incluir `apps/api/src/scripts/mf8-test-inventory.spec.ts` completo.
- Resultado: o comportamento central fica testado com caso coberto, teste em falta, ficheiro base em falta e Markdown determinístico.

#### F05 - Handoff frágil para BK16

- Estado após correção: `CORRIGIDO`
- Ação: o guia passou a definir artefacto `docs/evidence/MF8/TESTES-EM-FALTA.md`, comando de geração, critério de avanço e regra de bloqueio quando existem lacunas `P0`.
- Resultado: `BK-MF8-16` pode começar com evidence, comando e decisão explícita.

#### F06 - Caminhos privados `real_dev` em texto destinado aos alunos

- Estado após correção: `NAO_REPRODUZIDO`
- Ação: o guia corrigido usa caminhos públicos `apps/api`, `apps/web` e `docs/evidence`.
- Resultado: não há fuga de `real_dev` no BK corrigido.

#### F07 - Termos proibidos/língua interna nos guias MF8

- Estado após correção: `NAO_REPRODUZIDO`
- Ação: a linguagem do guia foi revista para evitar placeholders e instruções internas não aplicáveis ao aluno.
- Resultado: o problema original ficou limitado à completude técnica, já corrigida.

### Mapa de integração atualizado

- Guia BK corrigido:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Ficheiros que o BK manda criar:
  - `apps/api/src/scripts/mf8-test-inventory.ts`
  - `apps/api/src/scripts/mf8-test-inventory.spec.ts`
  - `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Ficheiro que o BK manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK manda rever:
  - `apps/api/src/modules/**/*.spec.ts`
  - `apps/web/tests/e2e/*.spec.ts`
  - `apps/web/package.json`
  - `BK-MF8-14`
  - `BK-MF8-16`
- Endpoints criados:
  - nenhum.
- UI criada:
  - nenhuma.
- Exports documentados:
  - `mf8CriticalTestTargets`
  - `toReportPath`
  - `collectProjectFiles`
  - `mergeFileSets`
  - `checkTestCoverage`
  - `findMissingCriticalTests`
  - `createMf8TestInventory`
  - `renderInventoryMarkdown`
  - `runMf8TestInventoryCli`
- Decisão DERIVADO:
  - script local sem dependência nova;
  - evidence Markdown;
  - manifesto explícito de alvos críticos;
  - exit code `1` quando há lacunas `P0`.

### Validações finais desta execução

- Estrutura `BK-MF8-15`: `PASS` - 16 secções `####` e 7 passos `### Passo`.
- Pesquisa de caminhos privados em `BK-MF8-15`: `PASS` - sem ocorrências de `real_dev`, `cd real_dev`, `npm --prefix real_dev` ou `REFERENCE_ROOT`.
- Pesquisa de termos de risco em `BK-MF8-15`: `PASS_COM_NOTA` - a única ocorrência relevante é `estado: TODO` no header canónico do BK.
- Pesquisa global de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- Pesquisa global de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS` - sem ocorrências.
- `git diff --check`: `PASS` - sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: `PASS` - `overall_pass: true`, score `100`, `rf_docs: 57`, `rnf_docs: 45`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos e notas de execução

- Os comandos do próprio BK (`npm run mf8:test-inventory` e o teste unitário do inventário) não foram executados nesta correção porque os ficheiros de produto não foram materializados em `apps/`; eles foram documentados no guia para aplicação futura pelo aluno.
- A working tree já tinha alterações noutros guias MF8 antes desta execução. Esta correção respeitou `STRICT_SCOPE` e só editou `BK-MF8-15` e este relatório.
- A auditoria anterior foi preservada abaixo para histórico; a verdade operacional mais recente está nesta secção superior.

## Execução 2026-07-02 - auditoria focada BK-MF8-15

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-15]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada auditoria focada ao `BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta`. O modo ativo foi `auditar_apenas`, por isso nenhum guia BK nem ficheiro de produto foi editado nesta execução.

Resultado da auditoria: `CRITICO`. O guia cumpre a moldura formal da MF8, com 16 secções `####` e 7 passos técnicos, mas ainda não permite a um aluno implementar `RNF41` sem adivinhar peças essenciais. O problema principal não é a ausência de estrutura; é a ausência de um contrato técnico completo para inventariar testes atuais, gerar uma lista de testes em falta, integrar o comando no `package.json`, produzir output/evidence determinístico e preparar `BK-MF8-16` para executar a bateria final.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da auditoria focada | 0 | 0 | 1 |
| Depois da auditoria focada | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-15 | CRITICO | CRITICO | O guia declara `RNF41`, inventário automático e criação de testes em falta, mas entrega apenas uma função auxiliar parcial, não define CLI/script executável, não mostra teste unitário real para a função, referencia ficheiros fora da lista principal e mantém passos genéricos de backend/frontend que não se aplicam claramente a um script de qualidade sem endpoint. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-15`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `README.md`: confirma o domínio StudyFlow, a separação entre estudo individual, turma/disciplina, modo coletivo, IA, segurança e rastreabilidade.
- `docs/RNF.md`: confirma `RNF41 - Verificação dos testes atuais e criação dos testes em falta`, categoria `Qualidade`, prioridade `Must`.
- `docs/RF.md`: usado para separar este BK de fluxos funcionais de mini-testes oficiais (`RF28`) e flashcards (`RF12`).
- `docs/planificacao/README.md`: confirma a hierarquia canónica e a regra de precedência documental.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: confirma MF8 como fecho de produto, qualidade da IA e validação final, com Gate S12 orientado a testes finais, correções e auditoria automática em `PASS`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-15`, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependência `BK-MF8-14`, requisito `RNF41`, sprint `S12`, tipo `Reforco` e próximo BK `BK-MF8-16`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma a mesma linha canónica do BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma a cadeia `BK-MF8-14 -> BK-MF8-15 -> BK-MF8-16`.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a sequência MF8 de 17 BKs.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: confirma `S12` como fecho de produto, funcionalidades MF8 expandidas, testes finais e evidence completa.
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`: confirma a estrutura obrigatória de passos, código completo, explicação, validação e negativos.
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`: confirma que o handoff para BK15 é verificar testes existentes, incluindo a suite `mf8-flashcards.spec.ts`, quando o BK14 for aplicado.
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`: confirma que BK16 depende de BK15 para receber inventário e lista de testes em falta antes da execução final.
- `apps/api/package.json`: confirma scripts reais `build`, `test`, `test:unit` e ausência de script MF8 específico.
- `apps/web/package.json`: confirma `test:e2e`, `build` e runner Playwright.
- `apps/api/src/scripts/`: confirma scripts existentes, mas ausência de `mf8-test-inventory.ts`.
- `apps/web/tests/e2e/`: confirma suites E2E existentes até MF6 na árvore pública atual; não existe ainda `mf8-flashcards.spec.ts` aplicado em `apps/`.
- `real_dev/api/src/scripts/`: confirma exemplos consolidados de scripts de qualidade (`export-technical-map.ts`, `validate-deploy-readiness.ts`) que o BK poderia usar como referência privada, remapeando sempre para `apps/api` no guia.
- `real_dev/web/tests/e2e/`: confirma suites E2E de referência até MF7.

### Findings confirmadas

#### F01 - Inventário de testes incompleto para `RNF41`

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Evidência observada: o BK promete "inventário automático de suites críticas" e "lista de testes em falta", mas o único código central é `findMissingCriticalTests(targets, existingFiles)`, uma função pura que recebe a lista já pronta. O guia não ensina a descobrir ficheiros reais, construir alvos críticos, ler `apps/api/src`, ler `apps/web/tests/e2e`, gerar output nem escrever evidence.
- O que falta completar: definir alvos críticos, discovery determinístico de ficheiros, output textual/JSON ou Markdown, comando executável e expected results reais.
- Risco pedagógico: elevado. O aluno fica dependente de adivinhação para transformar a função auxiliar num inventário real.
- Risco técnico: elevado. `BK-MF8-16` não recebe uma lista confiável de testes existentes e testes em falta.
- Risco de segurança/privacidade: baixo direto, mas a evidence final pode ficar incompleta ou inconsistente.
- Dependências a reler: `RNF41`, `PLANO-SPRINTS.md`, `BK-MF8-14`, `BK-MF8-16`, `apps/api/package.json`, `apps/web/package.json`.
- Prioridade de correção: `P0`.

#### F02 - `apps/api/package.json` é marcado como editado, mas o guia não define script concreto

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Evidência observada: a lista principal manda editar `apps/api/package.json`, mas nenhum passo mostra o bloco completo ou a alteração exata em `scripts`. O `package.json` público atual só confirma `build`, `test`, `test:unit` e scripts de smoke/backup/TLS já existentes.
- O que falta completar: indicar, com código completo, o script esperado, por exemplo um comando MF8 de inventário, e explicar como validar o seu output.
- Risco pedagógico: elevado. O aluno não sabe que comando executar nem que comando BK16 deve consumir.
- Risco técnico: elevado. O inventário pode existir como ficheiro isolado e nunca ser executável.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: `apps/api/package.json`, padrões de scripts existentes em `apps/api/src/scripts`.
- Prioridade de correção: `P0`.

#### F03 - Passos 4 e 5 mantêm texto genérico de controller/service/frontend sem contrato aplicável

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Evidência observada: o BK declara "sem endpoint novo; script de qualidade", mas o Passo 4 fala em controller, service, DTO, sessão, payload, persistência e resposta HTTP. O Passo 5 fala em tornar o inventário visível na UI, criar cliente API tipado e usar `credentials: "include"`, sem indicar página, endpoint ou componente. Estes pontos parecem herdados do template e não estão concretizados para um script local de qualidade.
- O que falta completar: decidir se BK15 é apenas script/CLI/evidence ou se cria UI. Se for script, remover a obrigação de controller/UI e entregar CLI completo; se houver UI, definir endpoint, cliente e componente reais.
- Risco pedagógico: elevado. O aluno pode criar endpoint ou UI desnecessários, duplicando responsabilidades.
- Risco técnico: elevado. Pode introduzir arquitetura falsa antes do gate final.
- Risco de segurança/privacidade: médio se o aluno tentar expor resultados ou paths internos por endpoint sem contrato.
- Dependências a reler: `RNF41`, `BK-MF8-16`, `apps/api/src/scripts`, `apps/web/tests/e2e`.
- Prioridade de correção: `P0`.

#### F04 - Ficheiros criados no Passo 6 não aparecem na lista principal e não têm teste real

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Evidência observada: o Passo 6 manda criar `apps/api/src/modules/mf8/bk-mf8-15.expected-results.ts`, mas esse ficheiro não aparece em `#### Ficheiros a criar/editar/rever`. Além disso, apesar de `apps/api/src/scripts/mf8-test-inventory.spec.ts` estar na lista, o código apresentado no Passo 6 é apenas um helper de expected results, não uma suite Jest que testa `findMissingCriticalTests(...)`.
- O que falta completar: alinhar a lista principal, criar teste unitário real para a função de inventário, testar caso sem spec, caso com spec existente e ordenação/saída determinística.
- Risco pedagógico: médio/alto. O aluno pode criar ficheiros não planeados e continuar sem teste do comportamento central.
- Risco técnico: médio/alto. A função central pode não ser protegida por regressão.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: `_TEMPLATE-BK.md`, `apps/api/jest.config.cjs`, suites `.spec.ts` existentes.
- Prioridade de correção: `P0`.

#### F05 - Handoff para BK16 fica frágil

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- Evidência observada: o handoff diz que BK16 pode assumir "inventário automático de suites críticas e uma lista de testes em falta", mas o guia não define artefacto de output, localização de evidence, nome de comando, formato ou critério para distinguir teste atual de teste em falta.
- O que falta completar: definir artefacto consumível por BK16, por exemplo relatório Markdown/JSON em `docs/evidence/MF8/`, ou output de CLI com campos estáveis.
- Risco pedagógico: elevado. BK16 começa sem contrato observável.
- Risco técnico: elevado. O gate final pode correr comandos sem saber que lacunas tinham sido identificadas.
- Risco de segurança/privacidade: baixo se o output não contiver dados sensíveis; deve ficar explicitamente limitado.
- Dependências a reler: `BK-MF8-16`, `PLANO-IMPLEMENTACAO-TOTAL.md`, `PLANO-SPRINTS.md`.
- Prioridade de correção: `P0`.

### Findings descartadas ou não reproduzidas

#### F06 - Caminhos privados `real_dev` em texto destinado aos alunos

- Estado: `NAO_REPRODUZIDO`
- Evidência observada: a pesquisa de caminhos privados nos guias MF8 não encontrou `real_dev`, `cd real_dev`, `npm --prefix real_dev` nem `REFERENCE_ROOT`.
- Justificação: o guia usa caminhos públicos `apps/api` e `apps/web`, como exigido.

#### F07 - Termos proibidos/língua interna nos guias MF8

- Estado: `NAO_REPRODUZIDO`
- Evidência observada: a pesquisa textual obrigatória de termos proibidos nos guias MF8 não devolveu ocorrências.
- Justificação: não foi encontrada linguagem interna proibida por essa pesquisa estática. O problema do BK15 é de completude técnica, não de termos internos explícitos.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/api/src/scripts/mf8-test-inventory.ts`
  - `apps/api/src/scripts/mf8-test-inventory.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-15.expected-results.ts` aparece apenas no Passo 6 e está desalinhado com a lista principal.
- Ficheiros que o BK alvo manda editar:
  - `apps/api/package.json`
- Ficheiros que o BK alvo manda rever:
  - `apps/api/src/modules/**/*.spec.ts`
  - `apps/web/src/**/*.spec.tsx`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/package.json`
  - `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- Endpoints criados:
  - nenhum.
- Endpoints consumidos:
  - nenhum definido de forma executável; o texto fala genericamente de contrato HTTP/UI, mas a arquitetura declara `sem endpoint novo`.
- Exports produzidos pelo BK:
  - `CriticalTestTarget`
  - `findMissingCriticalTests(...)`
  - `bkMf815ExpectedResults`
  - `getBkMf815ExpectedResult(...)`
- Imports consumidos de BKs anteriores:
  - não definidos de forma concreta.
- DTOs/validators/schemas/services criados:
  - nenhum.
- Regras de segurança/autorização aplicadas:
  - o guia recomenda genericamente sessão/ownership/membership/role, mas não há fluxo real que as aplique porque não há endpoint nem service concreto.
- Testes criados no guia:
  - o guia declara `apps/api/src/scripts/mf8-test-inventory.spec.ts`, mas não apresenta uma suite real para a função de inventário.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-16`, que precisa de comando, output e lista de testes em falta para a execução final.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 já introduziu documentação técnica, modularidade, testes automatizados para módulos críticos e health/deploy readiness como contratos de qualidade.
- MF alvo: MF8 fecha produto e validação final. `BK-MF8-14` entrega, em guia, uma suite de flashcards que BK15 deve inventariar quando aplicada.
- Sequência imediata: `BK-MF8-15` deve produzir inventário e lacunas; `BK-MF8-16` deve executar a bateria final. Como o BK15 não define comando/output/evidence completos, a passagem para BK16 fica tecnicamente frágil.

### Decisões técnicas confirmadas

- `BK-MF8-15` não deve criar endpoint novo por defeito; `RNF41` é um requisito de qualidade/testes.
- O artefacto mais coerente para o BK é um script local executável em `apps/api`, com teste Jest e output determinístico.
- `apps/api` já tem `test` e `test:unit`; `apps/web` já tem `test:e2e` e `build`.
- O guia deve inventariar testes existentes e testes em falta sem depender de rede, provider externo, dados privados ou sessão real.

### Decisões de domínio confirmadas

- `RNF41` pertence a qualidade/manutenção, não a mini-testes oficiais de professor.
- `BK-MF8-15` consome o handoff de `BK-MF8-14` e prepara o gate de `BK-MF8-16`.
- Evidence de testes não deve conter prompts privados, respostas IA completas, cookies, tokens, dados pessoais ou materiais integrais.

### Decisões DERIVADO confirmadas

- Usar script local sem dependência nova é uma decisão aceitável, mas o guia ainda precisa de código completo para esse script.
- A lista de testes em falta deve ter formato determinístico para ser reutilizável no BK16.
- O output pode ser CLI/Markdown/JSON, desde que fique definido e validável.

### Drift documental encontrado

Não foi encontrado drift entre matriz, backlog, contrato de campos, MF views e guia README para `BK-MF8-15`. O drift é interno ao próprio guia: ele declara entregas técnicas que os passos não implementam completamente.

### Riscos restantes

- Risco pedagógico alto: o aluno não consegue implementar o inventário de testes sem inventar discovery, CLI, output e script.
- Risco técnico alto: `BK-MF8-16` pode partir de um handoff que promete inventário/lista de lacunas sem artefacto real.
- Risco de scope: corrigir o problema exige editar `BK-MF8-15`, mas esta execução está em `MODO=auditar_apenas`.
- Risco operacional: a árvore pública atual ainda não contém `mf8-test-inventory.ts` nem `mf8-flashcards.spec.ts`; isto é aceitável para auditoria documental, mas reforça que o guia precisa de ser preciso.

### Verificações executadas

- Estrutura do BK alvo:
  - comando: `rg -c "^#### " docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - resultado: `16`.
  - comando: `rg -c "^### Passo " docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - resultado: `7`.
- Pesquisa de caminhos privados nos guias MF8:
  - comando: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa de termos proibidos nos guias MF8:
  - comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa estática focada no BK alvo:
  - comando: `rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|secret|token|password|cookie|RAG|embeddings|OCR|chunking|prompt|prompts privados|dados sensíveis" docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
  - resultado: ocorrências aceitáveis no header `estado: TODO`, em scope-out/privacidade e em avisos contra exposição de dados sensíveis. Não foram encontrados `payload: unknown`, `as any`, secrets reais ou storage inseguro de sessão.
- Inventário documental:
  - comando: `find docs/planificacao/guias-bk/MF0 docs/planificacao/guias-bk/MF1 docs/planificacao/guias-bk/MF2 docs/planificacao/guias-bk/MF3 docs/planificacao/guias-bk/MF4 docs/planificacao/guias-bk/MF5 docs/planificacao/guias-bk/MF6 docs/planificacao/guias-bk/MF7 docs/planificacao/guias-bk/MF8 -maxdepth 1 -type f -name 'BK-*.md' | sort | wc -l`
  - resultado: `107`.
- Whitespace geral:
  - comando: `git diff --check`
  - resultado: passou sem output.
- Validação documental:
  - comando: `bash scripts/validate-planificacao.sh`
  - resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`, com `107` BKs na matriz, backlog e guias.
- Testes de produto:
  - não executados, porque esta execução é auditoria documental em modo `auditar_apenas` e não aplica os ficheiros do BK em `apps/`.

### Blockers ou TODOs restantes

Não há blocker documental externo para decidir o estado do BK. A correção está bloqueada apenas por modo de execução: com `MODO=auditar_apenas`, as lacunas ficam registadas no relatório e o guia `BK-MF8-15` não deve ser editado nesta execução.

## Execução 2026-07-02 - re-auditoria focada BK-MF8-14

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-14]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada re-auditoria focada ao `BK-MF8-14 - Flashcards em modo de exercício e revisão`. O modo ativo foi `auditar_apenas`, portanto nenhum guia BK nem ficheiro de produto foi editado nesta execução.

Resultado da re-auditoria: `OK`. O guia alvo está no contrato tutorial ativo da MF8, com 16 secções `####`, 7 passos técnicos, caminhos públicos `apps/...`, endpoint real, frontend completo, estado local testável, suite Playwright prevista, validação por passo, cenários negativos, evidence e handoff claro para `BK-MF8-15`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da re-auditoria focada | 1 | 0 | 0 |
| Depois da re-auditoria focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-14 | OK | OK | A re-auditoria confirmou que o guia é implementável sem adivinhação: consome contrato backend existente, não duplica endpoints, entrega estado local frontend, componente completo, teste Playwright e regras de privacidade/ownership alinhadas com `RF12` e `BK-MF0-12`. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não permite editar `BK-MF8-14`.

### Ficheiros de produto editados nesta execução

Nenhum.

### Evidência documental e técnica consultada

- `docs/RF.md`: confirma `RF12 - Obter explicações, cards e quizzes personalizados`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-14`, owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF0-12`, sprint `S12`, próximo BK `BK-MF8-15`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma a mesma linha canónica do BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma a mesma cadeia de campos obrigatórios.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a presença do guia na sequência MF8 de 17 BKs.
- `apps/api/src/modules/ai/study-tools.controller.ts`: confirma `@Controller("api/study-areas/:id/study-tools")`, `SessionGuard`, `GET` e delegação para `StudyToolsService.listTools(...)`.
- `apps/api/src/modules/ai/study-tools.service.ts`: confirma `areasService.getMyStudyArea(userId, studyAreaId)`, filtro por `userId`, `studyAreaId` e validação opcional de `type`.
- `apps/api/src/modules/ai/validators/ai-artifact.validator.ts`: confirma validação de `FLASHCARDS`, incluindo `front`, `back` e `sourceMaterialIds`.
- `apps/web/src/lib/apiClient.ts`: confirma `requestJson(...)` com `credentials: "include"`, `listStudyTools(studyAreaId, type?)` e `generateStudyTool(...)`.
- `apps/web/src/pages/student/StudyToolsPage.tsx`: confirma renderização de `<FlashcardsPanel artifact={artifact} />` quando `artifact?.type === "FLASHCARDS"`.
- `apps/web/package.json` e `apps/web/playwright.config.ts`: confirmam `test:e2e` e Playwright configurado.

### Revalidação das findings anteriores

#### F01 - Linguagem interna no texto destinado ao aluno

- Estado: `JA_CORRIGIDO`
- Evidência observada: as secções do guia agora falam diretamente com o aluno e já não usam blocos genéricos, texto de auditoria ou instruções privadas como parte do tutorial.
- Validação executada: pesquisa de termos proibidos nos guias MF8 sem ocorrências.

#### F02 - Contrato backend indefinido

- Estado: `JA_CORRIGIDO`
- Evidência observada: o BK indica que não há backend novo e consome o contrato existente `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`; o backend real confirma `SessionGuard`, `StudyToolsService.listTools(...)`, `areasService.getMyStudyArea(...)`, filtro por `userId`/`studyAreaId` e validação de `type`.
- Validação executada: leitura cruzada de controller, service, DTO/schema/validator e `apiClient`.

#### F03 - Integração frontend de exercício/revisão incompleta

- Estado: `JA_CORRIGIDO`
- Evidência observada: o guia entrega `apps/web/src/features/mf8/flashcard-practice.ts` e `apps/web/src/components/ai/FlashcardsPanel.tsx` completos, com modo exercício, modo revisão, resposta escondida, revelar resposta, avançar, concluir, reiniciar e preservação de `ArtifactSources`.
- Validação executada: leitura integral dos passos 3 e 4; contagem de estrutura confirmou 16 secções `####` e 7 passos.

#### F04 - Testes sem suite real

- Estado: `JA_CORRIGIDO`
- Evidência observada: o guia cria `apps/web/tests/e2e/mf8-flashcards.spec.ts` com Playwright, testes de estado local e teste UI com resposta escondida, revelar resposta, avançar e concluir.
- Validação executada: `apps/web/package.json` confirma `test:e2e`; `apps/web/playwright.config.ts` confirma `testDir: "./tests/e2e"`.

#### F05 - Lista de ficheiros e passos desalinhados

- Estado: `JA_CORRIGIDO`
- Evidência observada: a lista principal do BK declara os ficheiros criados/editados/revistos que aparecem nos passos técnicos e no handoff.
- Validação executada: pesquisa focada por `flashcard-practice.ts`, `FlashcardsPanel.tsx`, `mf8-flashcards.spec.ts`, `ArtifactSources`, `StudyToolsService.listTools` e endpoint de study tools.

#### F06 - Forma filtrada do endpoint vs listagem geral da página existente

- Estado: `FINDING_DESCARTADO`
- Evidência observada: o guia usa a forma explícita `GET /api/study-areas/:id/study-tools?type=FLASHCARDS` para explicar o contrato de flashcards; a página real existente chama `listStudyTools(studyAreaId)` sem filtro e depois renderiza o artefacto selecionado por `artifact?.type === "FLASHCARDS"`.
- Justificação: não há endpoint duplicado nem contrato quebrado. `listStudyTools(studyAreaId, type?)` suporta o filtro opcional e o backend valida `type`. A diferença é de uso da mesma rota com ou sem query, não de API incompatível.
- Risco residual: baixo. Se a equipa quiser uma traceabilidade mais estrita, pode passar `"FLASHCARDS"` ao cliente no produto aplicado, mas o BK continua implementável com o contrato atual.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/web/src/features/mf8/flashcard-practice.ts`
  - `apps/web/tests/e2e/mf8-flashcards.spec.ts`
- Ficheiros que o BK alvo manda editar:
  - `apps/web/src/components/ai/FlashcardsPanel.tsx`
- Ficheiros que o BK alvo manda rever:
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/pages/student/StudyToolsPage.tsx`
  - `apps/web/src/components/ai/ArtifactSources.tsx`
  - `apps/api/src/modules/ai/study-tools.controller.ts`
  - `apps/api/src/modules/ai/study-tools.service.ts`
  - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
  - `apps/web/package.json`
  - `apps/web/playwright.config.ts`
- Endpoints criados:
  - nenhum.
- Endpoints consumidos:
  - `GET /api/study-areas/:id/study-tools`, com filtro opcional `?type=FLASHCARDS`.
  - `POST /api/study-areas/:id/study-tools`, apenas pelo contrato existente de geração de tools.
- Exports produzidos pelo BK:
  - `FlashcardPracticeMode`
  - `FlashcardPracticeState`
  - `createFlashcardPracticeState(...)`
  - `revealFlashcardAnswer(...)`
  - `moveToNextFlashcard(...)`
  - `setFlashcardPracticeMode(...)`
  - `restartFlashcardPractice(...)`
  - `FlashcardsPanel`
- Imports consumidos de BKs anteriores:
  - `AiArtifact`
  - `ArtifactSources`
  - `listStudyTools(...)`
  - `generateStudyTool(...)`
  - `StudyToolsService.listTools(...)`
  - `SessionGuard`
- DTOs/validators/schemas/services criados:
  - nenhum novo; o BK consome `CreateStudyToolDto`, validação de artefactos IA, `AiArtifact` e `StudyToolsService`.
- Regras de segurança/autorização aplicadas:
  - sessão via cookies HttpOnly no cliente API;
  - ownership no backend por `areasService.getMyStudyArea(userId, studyAreaId)`;
  - ausência de `userId` vindo do frontend;
  - estado de treino apenas em memória React;
  - sem persistência de tokens, cookies, prompts ou materiais no browser.
- Testes criados no guia:
  - estado local esconde resposta e termina lista;
  - modo revisão mantém resposta visível ao avançar;
  - UI revela resposta apenas após interação e conclui sessão.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-15`, que pode inventariar `mf8-flashcards.spec.ts` como teste existente quando o BK for aplicado no produto.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior/BK base: `BK-MF0-12` cria a base de study tools e artefactos `FLASHCARDS`; MF6/MF7 reforçam guardrails, fontes, privacidade e separação de contextos IA.
- MF alvo: `BK-MF8-14` melhora a experiência final de estudo com flashcards, sem reabrir geração IA, persistência ou ownership.
- MF seguinte/sequência imediata: `BK-MF8-15` recebe uma suite Playwright concreta para inventariar e validar como teste existente antes da criação dos testes em falta.

### Decisões técnicas confirmadas

- Não criar endpoint novo para flashcards.
- Consumir a rota existente de study tools, com filtro opcional para `FLASHCARDS`.
- Manter o progresso de exercício/revisão como estado local React.
- Usar Playwright porque `apps/web` já inclui runner E2E.
- Preservar `ArtifactSources` para rastreabilidade de fontes.

### Decisões de domínio confirmadas

- Flashcards pertencem ao estudo privado do aluno e a `RF12`.
- Flashcards não são mini-testes oficiais nem ranking docente.
- Ownership de artefactos IA fica no backend.
- Fontes apresentadas na UI são metadados curtos, não materiais completos.

### Decisões DERIVADO confirmadas

- `Modo exercício`: resposta escondida até interação do aluno.
- `Modo revisão`: resposta visível por defeito.
- `Sessão concluída`: estado visual local no fim da lista.
- `mf8-flashcards.spec.ts`: teste Playwright por compatibilidade com runner existente.

### Drift documental encontrado

Nenhum drift canónico novo. A re-auditoria encontrou apenas a nuance operacional descrita em `F06`, já descartada como finding porque usa a mesma rota real com query opcional.

### Riscos restantes

- Risco operacional: o código do BK ainda não está aplicado em `apps/`; por isso os testes Playwright propostos só serão executáveis quando o aluno implementar os ficheiros indicados.
- Risco de ambiente: `npm run test:e2e -- mf8-flashcards.spec.ts` depende de servidores Playwright, seed de utilizadores e variáveis E2E.
- Risco residual baixo: a página existente lista study tools sem filtro por `type`, embora o cliente e o backend suportem esse filtro opcional; não bloqueia a implementação do BK.

### Verificações executadas

- Estrutura do BK alvo:
  - comando: `rg -c "^#### " docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: `16`.
  - comando: `rg -c "^### Passo " docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: `7`.
- Pesquisa de termos proibidos nos guias MF8:
  - comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa de caminhos privados nos guias MF8:
  - comando: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa estática focada no BK alvo:
  - comando: `rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|secret|token|password|cookie|RAG|embeddings|OCR|chunking|prompt|prompts privados|dados sensíveis" docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: ocorrências aceitáveis no header `estado: TODO`, em regras negativas de privacidade/segurança, em password E2E por variável de ambiente e em referências a cookies HttpOnly. Não foram encontrados `payload: unknown`, `as any`, secrets reais ou storage inseguro de sessão.
- Whitespace geral:
  - comando: `git diff --check`
  - resultado: passou sem output.
- Validação documental:
  - comando: `bash scripts/validate-planificacao.sh`
  - resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`, com `107` BKs na matriz, backlog e guias.
- Testes de produto:
  - não executados, porque esta execução é auditoria documental em modo `auditar_apenas` e não aplica os ficheiros do BK em `apps/`.

### Blockers ou TODOs restantes

Nenhum blocker documental no `BK-MF8-14`. A re-auditoria fecha o BK como `OK`; a aplicação do código e a execução Playwright pertencem à implementação do BK pelos alunos.

## Execução 2026-07-02 - correção focada BK-MF8-14

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-14]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-14 - Flashcards em modo de exercício e revisão`, usando como ponto de partida a auditoria anterior que classificava o BK como `CRITICO`.

Resultado da correção: `OK`. O guia alvo foi reescrito dentro do contrato tutorial MF8, removeu linguagem interna, deixou de propor backend novo para flashcards, passou a consumir explicitamente o contrato `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, entregou estado local frontend, componente `FlashcardsPanel` completo, teste Playwright real e handoff testável para `BK-MF8-15`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-14 | CRITICO | OK | O guia passa a ter contrato backend concreto, UI completa de exercício/revisão, estado local testável, suite Playwright, validação por passo, expected results e handoff claro para BK-MF8-15. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução corrige o guia destinado aos alunos; o código dentro do BK é código final previsto para ser aplicado pelos alunos em `apps/`.

### Revalidação das findings anteriores

#### F01 - Linguagem interna permanecia no texto destinado ao aluno

- Estado: `CORRIGIDO`
- Evidência: a secção `Estado antes e depois` agora descreve o estado funcional do produto antes/depois e já não fala em guia antigo, bloco genérico, auditoria ou linguagem interna.
- Validação: pesquisa de termos proibidos nos guias MF8 sem ocorrências.

#### F02 - Contrato backend ficava indefinido e sem código integrado

- Estado: `CORRIGIDO`
- Evidência: o guia explicita que não há endpoint novo; consome `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, com `SessionGuard`, `StudyToolsService.listTools(...)`, `areasService.getMyStudyArea(...)`, resposta `AiArtifact[]` e erros esperados `401`, `404` e `400`.
- Validação: leitura cruzada de `apps/api/src/modules/ai/study-tools.controller.ts`, `apps/api/src/modules/ai/study-tools.service.ts` e `apps/web/src/lib/apiClient.ts`.

#### F03 - Integração frontend do modo exercício/revisão não era entregue

- Estado: `CORRIGIDO`
- Evidência: o guia passou a incluir `apps/web/src/components/ai/FlashcardsPanel.tsx` completo, com `useMemo`, `useEffect`, estado local, modo exercício, modo revisão, revelar resposta, avançar, concluir, reiniciar e preservação de `ArtifactSources`.
- Validação: estrutura do BK mantém 16 secções `####` e 7 passos; o passo 4 entrega componente completo.

#### F04 - Testes pedidos não formavam uma suite real

- Estado: `CORRIGIDO`
- Evidência: o guia passou a criar `apps/web/tests/e2e/mf8-flashcards.spec.ts` com `@playwright/test`, dois testes sobre estado local e um teste de UI para resposta escondida, revelar resposta, avançar cartão e concluir sessão.
- Validação: a suite está alinhada com `apps/web/package.json`, que já expõe `test:e2e` e Playwright; não foi adicionada dependência nova.

#### F05 - Lista de ficheiros e passos estavam desalinhados

- Estado: `CORRIGIDO`
- Evidência: a lista principal agora declara apenas `flashcard-practice.ts`, `FlashcardsPanel.tsx`, `mf8-flashcards.spec.ts` e ficheiros de revisão reais. O ficheiro artificial `apps/api/src/modules/mf8/bk-mf8-14.expected-results.ts` foi removido do guia.
- Validação: pesquisa textual no BK alvo e leitura do mapa de integração atualizado.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - `BK-MF8-14`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/web/src/features/mf8/flashcard-practice.ts`
  - `apps/web/tests/e2e/mf8-flashcards.spec.ts`
- Ficheiros que o BK alvo manda editar:
  - `apps/web/src/components/ai/FlashcardsPanel.tsx`
- Ficheiros que o BK alvo manda rever:
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/pages/student/StudyToolsPage.tsx`
  - `apps/web/src/components/ai/ArtifactSources.tsx`
  - `apps/api/src/modules/ai/study-tools.controller.ts`
  - `apps/api/src/modules/ai/study-tools.service.ts`
  - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
  - `apps/web/package.json`
  - `apps/web/playwright.config.ts`
- Exports produzidos:
  - `FlashcardPracticeMode`
  - `FlashcardPracticeState`
  - `createFlashcardPracticeState(...)`
  - `revealFlashcardAnswer(...)`
  - `moveToNextFlashcard(...)`
  - `setFlashcardPracticeMode(...)`
  - `restartFlashcardPractice(...)`
  - `FlashcardsPanel`
- Imports consumidos de BKs anteriores:
  - `AiArtifact`
  - `ArtifactSources`
  - `listStudyTools(...)`
  - `generateStudyTool(...)`
  - `StudyToolsService.listTools(...)`
  - `SessionGuard`
- Endpoints criados:
  - nenhum.
- Endpoints consumidos:
  - `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`
  - `POST /api/study-areas/:id/study-tools` quando a página gera novos flashcards pelo contrato existente.
- DTOs/validators criados:
  - nenhum novo; consome `CreateStudyToolDto` e validação já existente.
- Schemas/modelos criados:
  - nenhum novo; consome `AiArtifact`.
- Services criados:
  - nenhum novo.
- Componentes/páginas frontend criados ou editados:
  - `FlashcardsPanel` editado;
  - `StudyToolsPage` apenas revisto no guia.
- Providers de IA criados ou usados:
  - nenhum provider novo; consome artefactos gerados pelo provider isolado já existente.
- Regras de segurança/autorização aplicadas:
  - sessão por cookies HttpOnly via `requestJson(...)`;
  - ownership backend por `StudyToolsService.listTools(...)`;
  - ausência de `userId` vindo do frontend;
  - estado de treino apenas em memória React;
  - sem persistência de tokens, cookies, prompts ou materiais no browser.
- Testes criados no guia:
  - estado local esconde resposta e termina lista;
  - modo revisão mantém resposta visível ao avançar;
  - UI revela resposta só depois de interação e conclui sessão.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-15` pode inventariar `mf8-flashcards.spec.ts` como teste existente e validar se falta cobertura adicional.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior e BKs anteriores: `BK-MF0-12` entrega `AiArtifact`, geração/listagem de study tools e o painel inicial de flashcards; MF6/MF7 reforçam segurança IA, fontes, privacidade e testes.
- MF alvo: `BK-MF8-14` melhora a experiência final de flashcards sem reabrir geração IA, persistência ou ownership.
- MF seguinte/sequência imediata: `BK-MF8-15` recebe uma suite Playwright concreta para verificar como teste atual antes de criar testes em falta.

### Decisões técnicas confirmadas

- Não criar endpoint novo para flashcards.
- Consumir `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`.
- Manter progresso de exercício/revisão como estado local React.
- Usar Playwright para testes por já existir em `apps/web`.
- Preservar `ArtifactSources` para manter rastreabilidade de fontes.

### Decisões de domínio confirmadas

- Flashcards pertencem ao estudo privado do aluno e a `RF12`.
- Flashcards não são mini-testes oficiais nem ranking docente.
- Ownership de artefactos IA fica no backend.
- As fontes apresentadas na UI são metadados curtos, não materiais completos.

### Decisões DERIVADO confirmadas

- `Modo exercício`: resposta escondida até o aluno clicar em "Mostrar resposta".
- `Modo revisão`: resposta visível por defeito.
- `Sessão concluída`: estado visual local quando o aluno chega ao fim da lista.
- `mf8-flashcards.spec.ts`: teste Playwright escolhido por compatibilidade com o runner existente.

### Drift documental encontrado

Nenhum drift canónico novo. A correção resolveu drift interno do guia alvo, que antes sugeria backend/persistência não suportados pelo contrato canónico atual.

### Riscos restantes

- Risco operacional: o teste Playwright proposto no guia só será executável depois de o aluno aplicar os ficheiros em `apps/`.
- Risco de ambiente: `npm run test:e2e -- mf8-flashcards.spec.ts` depende do ambiente E2E local, seed de utilizadores e servidores Playwright.
- Risco residual baixo: a persistência de progresso de flashcards fica fora de escopo por falta de contrato canónico, mas o guia marca isso como decisão DERIVADO e não promete sincronização futura.

### Verificações executadas

- Pesquisa de termos proibidos nos guias MF8:
  - comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa de caminhos privados nos guias MF8:
  - comando: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa estática focada no BK alvo:
  - comando: `rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|secret|token|password|cookie|RAG|embeddings|OCR|chunking|prompt|prompts privados|dados sensíveis" docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: ocorrências aceitáveis no header `estado: TODO`, em regras negativas de privacidade/segurança, no código de teste com variável `password` E2E e em referências a cookies HttpOnly. Não foram encontrados `payload: unknown`, `as any`, secrets reais ou armazenamento inseguro de sessão.
- Whitespace do BK alvo:
  - comando: `rg -n "[[:blank:]]+$" docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Whitespace geral:
  - comando: `git diff --check`
  - resultado: passou sem output.
- Validação documental:
  - comando: `bash scripts/validate-planificacao.sh`
  - resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`, com `107` BKs na matriz, backlog e guias.
- Testes de produto:
  - não executados, porque esta execução corrige o guia e não aplica os ficheiros em `apps/`. O teste Playwright fica especificado no BK para execução quando o aluno implementar o código.

### Blockers ou TODOs restantes

Nenhum blocker documental no `BK-MF8-14`. A execução fica fechada como correção documental `OK`; a aplicação real do código e execução do Playwright pertencem à implementação do BK pelos alunos.

## Execução 2026-07-02 - auditoria focada BK-MF8-14

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-14]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada auditoria focada ao `BK-MF8-14 - Flashcards em modo de exercício e revisão`. O modo desta execução foi `auditar_apenas`, portanto nenhum guia BK nem ficheiro de produto foi editado.

Resultado da auditoria: `CRITICO`. O guia tem a sequência formal esperada, com 16 secções `####` e 7 passos técnicos, mas ainda não é implementável por um aluno sem adivinhar peças essenciais. As lacunas principais estão no contrato backend indefinido, integração frontend incompleta, testes apresentados como contrato didático em vez de suite real, inconsistência na lista de ficheiros e linguagem interna no texto destinado ao aluno.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da auditoria focada | 0 | 0 | 1 |
| Depois da auditoria focada | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-14 | CRITICO | CRITICO | O guia cumpre a moldura formal, mas não entrega código completo para o `FlashcardsPanel`, não define contrato HTTP concreto além de reutilizar genericamente endpoints de artefactos IA, não cria uma suite de testes real para exercício/revisão, contém ficheiros fora da lista principal e mantém linguagem interna no corpo do guia. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não editar o BK alvo.

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução não aplicou código em `apps/` nem em `real_dev/`.

### Evidência objetiva da auditoria

- Estrutura do BK alvo:
  - 16 secções `####`;
  - 7 passos `### Passo`;
  - 4 delimitadores de blocos de código;
  - todos os passos contêm os pontos 1 a 7.
- Fundamentação documental:
  - `docs/RF.md` define `RF12` como obter explicações, cards e quizzes personalizados;
  - `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `ANEXO-BK-SPRINT-OWNER.md` alinham `BK-MF8-14` com owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF0-12`, requisito `RF12`, sprint `S12`, core e próximo BK `BK-MF8-15`;
  - `BK-MF0-12` entrega `AiArtifact`, `StudyToolsService`, `POST /api/study-areas/:id/study-tools`, `GET /api/study-areas/:id/study-tools?type=...` e `FlashcardsPanel`;
  - `BK-MF8-13` faz handoff para `BK-MF8-14`;
  - `BK-MF8-15` depende de `BK-MF8-14`.
- Implementação de referência lida:
  - `apps/api/src/modules/ai/study-tools.controller.ts` expõe `GET /api/study-areas/:id/study-tools` e `POST /api/study-areas/:id/study-tools` atrás de `SessionGuard`;
  - `apps/api/src/modules/ai/study-tools.service.ts` filtra artefactos por `userId` e `studyAreaId`, valida tipo e bloqueia geração sem fontes processáveis;
  - `apps/web/src/components/ai/FlashcardsPanel.tsx` mostra atualmente todos os cartões com frente e verso visíveis;
  - `apps/web/src/lib/apiClient.ts` já tipa `AiArtifact`, `StudyToolType`, `listStudyTools(...)` e `generateStudyTool(...)`.

### Findings da auditoria

#### F01 - Linguagem interna permanece no texto destinado ao aluno

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- Evidência: na secção `Estado antes e depois`, o guia diz que o requisito ainda surge "no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo".
- O que falta completar: substituir a formulação por estado pedagógico do produto antes/depois, sem mencionar auditoria, guia antigo, bloco genérico ou linguagem interna.
- Risco pedagógico: o aluno recebe metanarrativa de revisão documental em vez de instrução técnica limpa.
- Risco técnico: baixo isoladamente, mas indica que o guia ainda não foi limpo para consumo direto.
- Risco de segurança/privacidade/legal: não aplicável diretamente.
- Dependências a reler: `_TEMPLATE-BK.md`, BKs MF0-MF3 já corrigidos e regras de separação entre relatório e BK.
- Prioridade de correção: P1.

#### F02 - Contrato backend fica indefinido e sem código integrado

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- Evidência: a arquitetura declara como contrato principal "`reutiliza endpoints de artefactos IA da área de estudo`", mas o passo de backend não apresenta endpoint, método, payload, DTO, service/controller completo, erro esperado ou alteração concreta. O passo 4 termina com `Sem código neste passo`.
- O que falta completar: decidir e documentar exatamente se o BK só altera o frontend sobre `GET /api/study-areas/:id/study-tools?type=FLASHCARDS` ou se cria endpoint/DTO novo; se usar contrato existente, deve explicitar método HTTP, payload/resposta, erros `401/404/422`, ownership por sessão e ficheiros a rever sem pedir código backend inexistente.
- Risco pedagógico: o aluno tem de adivinhar onde fica a regra de ownership e que endpoint deve chamar.
- Risco técnico: elevado, porque uma implementação pode duplicar endpoints, confiar no frontend ou partir o contrato `AiArtifact`.
- Risco de segurança/privacidade/legal: elevado se a filtragem por `userId`/`studyAreaId` deixar de ser garantida pelo backend.
- Dependências a reler: `BK-MF0-12`, `apps/api/src/modules/ai/study-tools.controller.ts`, `apps/api/src/modules/ai/study-tools.service.ts`, `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`.
- Prioridade de correção: P0.

#### F03 - Integração frontend do modo exercício/revisão não é entregue

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- Evidência: o guia manda editar `apps/web/src/components/ai/FlashcardsPanel.tsx`, mas só apresenta `apps/web/src/features/mf8/flashcard-practice.ts`. O passo 5, que deveria integrar UI, estados React, resposta escondida/visível e acessibilidade, diz `Sem código neste passo` e assume que "a integração varia consoante a página real".
- O que falta completar: fornecer o componente `FlashcardsPanel.tsx` completo ou a função/componente completa a substituir, com `useState`, botões de modo exercício/revisão, revelar resposta, próximo cartão, fim da lista, estados vazio/erro quando aplicáveis, mensagens PT-PT e preservação de `ArtifactSources`.
- Risco pedagógico: o aluno não consegue implementar a experiência visível do requisito apenas com o helper.
- Risco técnico: elevado, porque o helper pode compilar isoladamente sem alterar a UI real.
- Risco de segurança/privacidade/legal: médio, porque a UI deve continuar a não guardar tokens/prompts/materiais e deve preservar fontes minimizadas.
- Dependências a reler: `apps/web/src/components/ai/FlashcardsPanel.tsx`, `apps/web/src/pages/student/StudyToolsPage.tsx`, `apps/web/src/lib/apiClient.ts`.
- Prioridade de correção: P0.

#### F04 - Testes pedidos não formam uma suite real

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- Evidência: o passo 6 manda criar `apps/web/src/features/mf8/flashcard-practice.spec.ts`, mas o único bloco de código cria `apps/api/src/modules/mf8/bk-mf8-14.expected-results.ts`, que centraliza strings de expected results. Não há `describe`, `it`, `expect`, teste de `moveToNextFlashcard(...)`, teste de revelar resposta, teste de fim da lista nem teste de integração do componente.
- O que falta completar: apresentar uma suite real, preferencialmente frontend/unitária, que teste avanço de cartão, resposta escondida por defeito, revelar resposta, fim da lista e input limite; se houver smoke manual, ele deve complementar, não substituir, a suite.
- Risco pedagógico: o aluno pode confundir evidence textual com teste automatizado.
- Risco técnico: elevado, porque `BK-MF8-15` depende da existência de testes atuais e testes em falta.
- Risco de segurança/privacidade/legal: baixo direto, médio indireto por falta de regressão sobre dados apresentados.
- Dependências a reler: `apps/web/package.json`, padrão de testes existente e `BK-MF8-15`.
- Prioridade de correção: P0.

#### F05 - Lista de ficheiros e passos estão desalinhados

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- Evidência: a lista principal de ficheiros não inclui `apps/api/src/modules/mf8/bk-mf8-14.expected-results.ts`, mas o passo 6 manda criá-lo. O passo 3 também diz para integrar a função "no service principal do BK", embora o código apresentado seja um helper frontend.
- O que falta completar: alinhar a lista de ficheiros com os passos e remover ficheiros artificiais que não encaixam na arquitetura real, ou justificar claramente por que existem.
- Risco pedagógico: médio, porque o aluno não sabe qual lista é a fonte de verdade.
- Risco técnico: médio, porque cria ficheiros fora da arquitetura MF8 real e aumenta a probabilidade de imports soltos.
- Risco de segurança/privacidade/legal: não aplicável diretamente.
- Dependências a reler: `MF-VIEWS.md`, `BK-MF0-12`, árvore real `apps/web/src/features` e `apps/api/src/modules`.
- Prioridade de correção: P1.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/web/src/features/mf8/flashcard-practice.ts`
  - `apps/web/src/features/mf8/flashcard-practice.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-14.expected-results.ts` apenas aparece no passo 6 e está desalinhado com a lista principal.
- Ficheiros que o BK alvo manda editar:
  - `apps/web/src/components/ai/FlashcardsPanel.tsx`
- Ficheiros que o BK alvo manda rever:
  - `apps/api/src/modules/ai/study-tools.service.ts`
  - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/api/package.json`
  - `apps/web/package.json`
- Exports produzidos no guia:
  - `FlashcardPracticeState`
  - `moveToNextFlashcard(...)`
  - `bkMf814ExpectedResults`
  - `getBkMf814ExpectedResult(...)`
- Imports consumidos de BKs anteriores:
  - contrato `AiArtifact`;
  - `StudyToolType`;
  - `listStudyTools(...)` e `generateStudyTool(...)`, embora o guia não os integre em código completo;
  - `StudyToolsService`;
  - `SessionGuard`.
- Endpoints criados:
  - nenhum endpoint novo confirmado.
- Endpoints consumidos:
  - deve consumir `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, mas o guia não o escreve de forma suficientemente explícita.
- DTOs/validators criados:
  - nenhum novo confirmado.
- Schemas/modelos criados:
  - nenhum novo confirmado; o BK deve consumir `AiArtifact`.
- Services criados:
  - nenhum novo confirmado.
- Componentes/páginas frontend criados ou editados:
  - edita `FlashcardsPanel`, mas não fornece o componente completo.
- Providers de IA criados ou usados:
  - nenhum provider novo; deve consumir artefactos IA já autorizados.
- Regras de segurança/autorização aplicadas:
  - o guia declara sessão, ownership e ausência de dados sensíveis, mas não liga essas regras a um contrato backend concreto no passo técnico.
- Testes criados no guia:
  - pretendido: `flashcard-practice.spec.ts`;
  - entregue em código: apenas um ficheiro de expected results, sem suite real.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-15` depende de `BK-MF8-14` para existir uma base testável antes de verificar testes atuais e criar testes em falta.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior e BKs anteriores: `BK-MF0-12` já cria o contrato base de cards/flashcards via `AiArtifact`, `StudyToolsService`, endpoints de study tools e `FlashcardsPanel`. MF6/MF7 reforçam segurança IA, fontes, perfis e testes.
- MF alvo: `BK-MF8-14` deveria transformar flashcards já gerados em experiência de exercício/revisão, sem reabrir geração IA nem criar novo domínio de persistência.
- Sequência seguinte: `BK-MF8-15` fica em risco porque a auditoria de testes não pode assumir uma suite real de flashcards se o BK 14 só entrega expected results textuais.

### Decisões técnicas confirmadas

- `RF12` é o requisito canónico do BK.
- O fluxo deve reutilizar `AiArtifact` e os endpoints de study tools já existentes, salvo decisão explícita e justificada.
- O estado de exercício/revisão pode ser local no frontend desde que não crie dados privados persistidos nem substitua a autorização backend.
- `FlashcardsPanel` é o ponto natural de integração visível.

### Decisões de domínio confirmadas

- Flashcards são ferramentas de estudo privadas do aluno, não testes oficiais de professor.
- A fonte do flashcard deve continuar ligada ao artefacto IA autorizado.
- O BK não deve prometer RAG, embeddings, OCR, tradução completa, automação externa ou integração nova.
- Ownership de área/material/artefacto fica no backend, nunca no frontend.

### Decisões DERIVADO confirmadas

- Tratar "modo exercício" como resposta escondida por defeito e botão de revelar resposta.
- Tratar "modo revisão" como resposta visível para leitura sequencial.
- Manter o estado local de cartão atual e resposta visível no frontend, sem criar novo modelo persistido.

### Drift documental e observações fora do alvo

- Não foi encontrado drift entre matriz, backlog, contrato de campos e anexo de owner para `BK-MF8-14`.
- O drift encontrado é interno ao guia alvo: estrutura formal recente, mas conteúdo ainda parcialmente genérico e não implementável.
- O relatório anterior já estava criado como ficheiro untracked antes desta execução; esta execução preservou esse histórico e acrescentou uma nova secção no topo.

### Riscos restantes

- Risco pedagógico alto: o aluno pode produzir uma implementação superficial que compila o helper, mas não altera a experiência real de flashcards.
- Risco técnico alto: `BK-MF8-15` pode falhar ao procurar testes reais de flashcards.
- Risco de segurança médio: se o aluno tentar resolver a ambiguidade criando endpoint próprio ou filtragem frontend, pode quebrar ownership por sessão.
- Risco de coerência médio: ficheiro `apps/api/src/modules/mf8/bk-mf8-14.expected-results.ts` não encaixa claramente na arquitetura real do StudyFlow.

### Verificações executadas

- Pesquisa de termos proibidos nos guias MF8:
  - comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa de caminhos privados nos guias MF8:
  - comando: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa estática focada no BK alvo:
  - comando: `rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|mock|stub|fake|secret|token|password|cookie|RAG|embeddings|OCR|chunking|prompt|prompts privados|dados sensíveis" docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
  - resultado: ocorrências aceitáveis no header `estado: TODO`, no scope-out contra RAG/embeddings/OCR/tokens/cookies/prompts privados, nas notas de privacidade/evidence e na instrução para mockar provider em testes. Não foram encontrados tokens, secrets, `payload: unknown`, `as any` ou armazenamento inseguro de sessão.
- Pesquisa estática focada em `apps/` e `real_dev` para os ficheiros de referência de flashcards:
  - comando: `rg -n "localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|secret|token.*localStorage|localStorage.*token|console\\.log|RAG|embeddings|OCR|chunking" apps/api/src/modules/ai apps/web/src/components/ai apps/web/src/lib/apiClient.ts real_dev/api/src/modules/ai real_dev/web/src/components/ai real_dev/web/src/lib/apiClient.ts`
  - resultado: apenas falso positivo aceitável no comentário do CSRF marker, que diz explicitamente que cookies HttpOnly evitam guardar tokens em `localStorage`; sem findings novos.
- Pesquisa de mocks/stubs/fakes nas specs de referência:
  - comando: `rg -n "mock|stub|fake" apps/api/src/modules/ai/study-tools.service.spec.ts apps/api/src/modules/ai/validators/ai-artifact.validator.spec.ts real_dev/api/src/modules/ai/study-tools.service.spec.ts real_dev/api/src/modules/ai/validators/ai-artifact.validator.spec.ts`
  - resultado: ocorrências legítimas de Jest em ficheiros `.spec.ts`, usadas para isolar Mongo/OpenAI; falso positivo aceite.
- Whitespace:
  - comando: `git diff --check`
  - resultado: passou sem output.
- Validação documental:
  - comando: `bash scripts/validate-planificacao.sh`
  - resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`, com `107` BKs na matriz, backlog e guias.
- Teste unitário focado de produto:
  - não executado nesta auditoria porque `MODO=auditar_apenas` não cria nem altera a suite `flashcard-practice.spec.ts`; a falta da suite real é precisamente uma finding do guia alvo.

### Blockers ou TODOs restantes

Não há blocker documental externo para decidir o BK. A correção está bloqueada apenas por modo de execução: com `MODO=auditar_apenas`, as lacunas devem ficar registadas no relatório e o guia `BK-MF8-14` não deve ser editado nesta execução.

## Execução 2026-07-02 - reauditoria pós-correção BK-MF8-13

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-13]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria focada ao `BK-MF8-13 - Rankings dos mini-testes oficiais` após a correção anterior. O modo desta execução foi `auditar_apenas`, portanto nenhum guia BK nem ficheiro de produto foi editado.

Resultado da reauditoria: `OK`. O guia alvo cumpre a estrutura obrigatória, consome o contrato `OfficialTestAttempt` entregue pelo `BK-MF8-12`, entrega service/backend, endpoint, cliente API, página React, suite Jest proposta, validações por passo, negativos e handoff para `BK-MF8-14`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria pós-correção | 1 | 0 | 0 |
| Depois da reauditoria pós-correção | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-13 | OK | OK | O guia mantém 16 secções `####`, 7 passos técnicos com estrutura 1-7, caminhos públicos `apps/api` e `apps/web`, contrato `OfficialTestAttempt`, ranking minimizado, validação docente no backend, endpoint real, cliente API, página React e testes de autorização/ordenação. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Guias BK editados nesta execução

Nenhum. O modo `auditar_apenas` permite atualizar o relatório, mas não editar o BK alvo.

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução não aplicou código em `apps/` nem em `real_dev/`.

### Evidência objetiva da reauditoria

- Estrutura do BK alvo:
  - 16 secções `####`;
  - 7 passos `### Passo`;
  - 12 delimitadores de blocos de código;
  - todos os passos contêm os pontos 1 a 7.
- Fundamentação documental:
  - `docs/RF.md` define `RF28` como criação de testes/mini-testes oficiais;
  - `docs/RF.md` define `RF30` como painel com progresso, dificuldades e métricas da turma;
  - `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF8-13` com owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF8-12`, `RF28, RF30`, sprint `S12`, core e próximo BK `BK-MF8-14`;
  - `BK-MF8-12` declara que entrega `OfficialTestAttempt` com `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`;
  - `BK-MF8-14` é o próximo guia da sequência e não exige reabrir o ranking.
- Contratos técnicos no BK alvo:
  - `OfficialTestRankingService`;
  - `buildOfficialTestRanking(...)`;
  - `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`;
  - `getOfficialTestRanking(...)`;
  - `OfficialTestRankingPage`;
  - `official-test-ranking.service.spec.ts`.
- Segurança e privacidade:
  - valida role `TEACHER` antes de queries sensíveis;
  - valida ownership docente por `SubjectsService.findOwnedSubject(...)`;
  - filtra tentativas por `testId`, `subjectId` e `classId`;
  - minimiza dados do aluno com `Aluno XXXX`;
  - não devolve respostas completas, email, cookie, sessão ou dados sensíveis.

### Revalidação das findings anteriores

#### F01 - Ranking backend ficava sem service/controller executáveis

- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência: o BK alvo contém `OfficialTestRankingService`, helper `buildOfficialTestRanking(...)`, módulo atualizado e controller com `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- Impacto atual: sem lacuna aberta.

#### F02 - Contrato de tentativas do BK anterior não era consumido

- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência: o BK alvo consome `OfficialTestAttempt`, lê `attemptModel`, usa `percentage`, `answeredAt`, `correctAnswers`, `totalQuestions` e filtra por `testId`, `subjectId` e `classId`.
- Impacto atual: sem lacuna aberta.

#### F03 - Frontend e cliente API ficavam genéricos

- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência: o BK alvo define tipos `OfficialTestRankingRow`, `OfficialTestRanking`, função `getOfficialTestRanking(...)` e página `OfficialTestRankingPage` com loading, erro, vazio e sucesso.
- Impacto atual: sem lacuna aberta.

#### F04 - Testes pedidos não eram entregues como suite real

- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência: o BK alvo inclui `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts` com cenários de role errada, ownership, ranking minimizado, ordenação e teste inexistente.
- Impacto atual: sem lacuna aberta no guia.

#### F05 - Linguagem histórica interna permanecia no texto do aluno

- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência: pesquisa focada no BK alvo não encontrou `real_dev`, `REFERENCE_ROOT`, `payload: unknown`, `as any`, `guia antigo`, `bloco genérico` ou linguagem histórica interna.
- Impacto atual: sem lacuna aberta.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/api/src/modules/official-tests/official-test-ranking.service.ts`
  - `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
  - `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`
- Ficheiros que o BK alvo manda editar:
  - `apps/api/src/modules/official-tests/official-tests.module.ts`
  - `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - `apps/web/src/lib/apiClient.ts`
- Ficheiros que o BK alvo manda rever:
  - `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`
  - `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
  - `apps/api/src/modules/subjects/subjects.service.ts`
  - `apps/web/src/routes/protectedRoutes.tsx`
- Exports produzidos:
  - `OfficialTestRankingAttempt`
  - `OfficialTestRankingRow`
  - `OfficialTestRankingView`
  - `buildOfficialTestRanking(...)`
  - `OfficialTestRankingService`
  - `getOfficialTestRanking(...)`
  - `OfficialTestRankingPage`
- Imports consumidos de BKs anteriores:
  - `OfficialTest`
  - `OfficialTestAttempt`
  - `SubmitOfficialTestAttemptDto`
  - `SubjectsService.findOwnedSubject(...)`
  - `SessionGuard`
  - `AuthenticatedRequest`
  - `requestJson(...)`
- Endpoint criado:
  - `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`
- DTOs/validators criados:
  - nenhum novo; o endpoint usa parâmetros de rota e sessão autenticada.
- Schemas/modelos criados:
  - nenhum novo neste BK; consome `OfficialTest` e `OfficialTestAttempt`.
- Services criados:
  - `OfficialTestRankingService`
- Componentes/páginas frontend criados:
  - `OfficialTestRankingPage`
- Providers de IA criados ou usados:
  - nenhum; este BK não chama IA.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - role `TEACHER`;
  - ownership docente por `SubjectsService.findOwnedSubject(...)`;
  - filtro por `testId`, `subjectId` e `classId`;
  - minimização de dados;
  - ausência de autorização decidida no frontend.
- Testes criados no guia:
  - ordenação por percentagem;
  - desempate por data;
  - bloqueio de role errada;
  - bloqueio de professor sem ownership;
  - teste inexistente sem consulta de tentativas;
  - ranking minimizado.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-14` pode continuar a sequência sem depender de ranking público, analytics avançado ou dashboard preditivo.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior e BKs anteriores: `BK-MF2-04` entrega criação docente de `OfficialTest`; `BK-MF8-12` entrega realização por aluno e `OfficialTestAttempt`.
- MF alvo: `BK-MF8-13` transforma tentativas oficiais em ranking docente, sem reabrir submissão nem duplicar criação de testes.
- MF seguinte/sequência imediata: `BK-MF8-14` segue para flashcards e não depende de alterar contratos de ranking.

### Decisões técnicas confirmadas

- `OfficialTestRankingService` separado é adequado para não sobrecarregar `OfficialTestsService`.
- `buildOfficialTestRanking(...)` como helper puro permite testar ordenação sem base de dados real.
- O endpoint docente usa sessão autenticada e parâmetros de rota, sem aceitar `teacherId`, `studentId` ou `classId` vindos do frontend.
- `requestJson(...)` mantém cookies de sessão via contrato já existente no cliente API.

### Decisões de domínio confirmadas

- Ranking de mini-testes oficiais pertence ao fluxo docente.
- Resultados de alunos são dados pessoais escolares e devem ser minimizados.
- O ranking consome tentativas persistidas, não recalcula respostas no frontend.
- A UI apresenta estado autorizado pelo backend; não decide ownership, role ou membership.

### Decisões DERIVADO confirmadas

- Usar `Aluno XXXX` como identificador curto enquanto não existir perfil público de nome.
- Desempatar por `answeredAt` ascendente para premiar a tentativa mais antiga.
- Manter ranking privado para professor, sem ranking público para alunos.

### Drift documental e observações fora do alvo

- No `BK-MF8-13`: nenhum drift documental aberto.
- Na implementação real atual em `apps/`/`real_dev`: ainda não existe `OfficialTestAttempt` materializado como ficheiro de produto; isto é esperado porque a execução é documental e o contrato é entregue pelo `BK-MF8-12` quando os guias forem aplicados por ordem.
- Fora do BK alvo: leitura de coerência encontrou linguagem histórica no `BK-MF8-14` na frase de estado antes. Não foi corrigida porque `STRICT_SCOPE=true` e `BK-MF8-14` não é alvo desta execução.

### Riscos restantes

- Risco de integração real: a suite `official-test-ranking.service.spec.ts` só pode ser executada depois de o código do guia ser aplicado em `apps/api`.
- Risco de rotas frontend: `OfficialTestRankingPage` é criada no guia, mas a rota protegida final pode exigir ligação adicional em `apps/web/src/routes/protectedRoutes.tsx`.
- Risco fora de escopo: BKs MF8 posteriores podem manter linguagem histórica ou densidade inferior até serem auditados/corrigidos individualmente.

### Verificações executadas

- Pesquisa de termos proibidos nos guias MF8:
  - comando: `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Pesquisa de caminhos privados nos guias MF8:
  - comando: `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Whitespace:
  - comando: `git diff --check`
  - resultado: passou sem output.
- Whitespace adicional do relatório untracked:
  - comando: `rg -n "[[:blank:]]+$" docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
  - resultado: sem ocorrências; exit code `1` esperado do `rg` quando não há matches.
- Validação documental:
  - comando: `bash scripts/validate-planificacao.sh`
  - resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.
- Teste unitário focado de produto:
  - não executado nesta reauditoria porque `MODO=auditar_apenas` não cria `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`; a suite está especificada no guia como entrega a implementar pelo aluno.

### Blockers ou TODOs restantes

Nenhum blocker no `BK-MF8-13`. Os riscos restantes são de aplicação futura do guia no código real e de auditoria de BKs fora do alvo.

## Execução 2026-07-02 - correção focada BK-MF8-13

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-13]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-13 - Rankings dos mini-testes oficiais`, usando como ponto de partida a reauditoria imediatamente anterior, que classificava o BK como `CRITICO`.

Resultado da correção: `OK`. O guia alvo passou a consumir explicitamente o contrato de `OfficialTestAttempt` entregue pelo `BK-MF8-12`, criou service de ranking docente, integrou módulo e controller, definiu cliente API tipado, criou página React e substituiu expected results soltos por uma suite Jest focada para autorização e ordenação.

A correção ficou limitada ao BK alvo e a este relatório. Nenhum ficheiro de produto em `apps/` ou `real_dev/` foi editado nesta execução.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-13 | CRITICO | OK | O guia passou a entregar código completo para ranking docente: service, helper de ordenação, módulo, controller, cliente API, página React, testes unitários e handoff. Também removeu a frase histórica interna do texto do aluno. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução corrigiu apenas documentação de planificação e blocos de código ensinados no guia.

### Correções aplicadas sobre as findings abertas

#### F01 - Ranking backend fica sem service/controller executáveis

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 2 passou a criar `apps/api/src/modules/official-tests/official-test-ranking.service.ts`;
  - o service valida role `TEACHER`, ownership da disciplina via `SubjectsService.findOwnedSubject(...)`, existência do mini-teste e só depois consulta tentativas;
  - o Passo 4 passou a entregar o controller completo com `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`;
  - o controller delega autorização e ranking para `OfficialTestRankingService`.
- Evidência: o guia atual contém código completo para `OfficialTestRankingService`, `buildOfficialTestRanking(...)`, `OfficialTestsModule` e `OfficialTestsController`.

#### F02 - Contrato de tentativas do BK anterior não é consumido

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o objetivo, arquitetura e Passo 2 declaram que `BK-MF8-13` consome `OfficialTestAttempt` entregue pelo `BK-MF8-12`;
  - a query de ranking filtra `OfficialTestAttempt` por `testId`, `subjectId` e `classId`;
  - o ranking usa `percentage`, `correctAnswers`, `totalQuestions`, `studentId` e `answeredAt`.
- Evidência: pesquisa no BK alvo encontra `OfficialTestAttempt`, `official_test_attempts`, `attemptModel`, `percentage`, `answeredAt`, `correctAnswers` e `totalQuestions` em contexto de implementação.

#### F03 - Frontend e cliente API ficam genéricos

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 5 passou a adicionar `OfficialTestRankingRow`, `OfficialTestRanking` e `getOfficialTestRanking(...)` ao `apiClient.ts`;
  - o Passo 5 passou a criar `OfficialTestRankingPage.tsx` com loading, erro, vazio, sucesso e tabela acessível;
  - a UI não decide permissões e apenas consome o endpoint autorizado pelo backend.
- Evidência: o guia atual inclui código TS/TSX completo para cliente e página React.

#### F04 - Testes pedidos não são entregues como suite real

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 6 deixou de criar apenas expected results;
  - passou a criar `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`;
  - a suite cobre helper de ordenação, role errada, ownership da disciplina, ranking minimizado e teste inexistente sem consulta de tentativas.
- Evidência: o guia atual inclui uma suite Jest completa para `OfficialTestRankingService`.

#### F05 - Linguagem histórica interna permanece no texto do aluno

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - a secção `Estado antes e depois` foi reescrita para falar apenas do estado funcional da app;
  - foram removidas referências a guia antigo, bloco genérico e linguagem interna.
- Evidência: pesquisa adicional por `guia antigo`, `bloco genérico` e linguagem histórica no BK alvo não devolveu ocorrências.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/api/src/modules/official-tests/official-test-ranking.service.ts`
  - `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
  - `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`
- Ficheiros que o BK alvo manda editar:
  - `apps/api/src/modules/official-tests/official-tests.module.ts`
  - `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - `apps/web/src/lib/apiClient.ts`
- Ficheiros que o BK alvo manda rever:
  - `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
  - `apps/api/src/modules/subjects/subjects.service.ts`
  - `apps/web/src/routes/protectedRoutes.tsx`
- Exports produzidos:
  - `OfficialTestRankingAttempt`
  - `OfficialTestRankingRow`
  - `OfficialTestRankingView`
  - `buildOfficialTestRanking(...)`
  - `OfficialTestRankingService`
  - `getOfficialTestRanking(...)`
  - `OfficialTestRankingPage`
- Imports consumidos de BKs anteriores:
  - `OfficialTest`
  - `OfficialTestAttempt`
  - `SubjectsService.findOwnedSubject(...)`
  - `SessionGuard`
  - `AuthenticatedRequest`
  - `requestJson(...)`
- Endpoint criado:
  - `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`
- DTOs/validators criados:
  - nenhum novo; o endpoint usa parâmetros de rota e sessão autenticada.
- Schemas/modelos criados:
  - nenhum novo; consome `OfficialTest` e `OfficialTestAttempt`.
- Services criados:
  - `OfficialTestRankingService`
- Componentes/páginas frontend criados:
  - `OfficialTestRankingPage`
- Providers de IA criados ou usados:
  - nenhum; este BK não chama IA.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - role `TEACHER`;
  - ownership docente por `SubjectsService.findOwnedSubject(...)`;
  - filtro de tentativas por `testId`, `subjectId` e `classId`;
  - minimização de dados no ranking;
  - ausência de decisões de permissão no frontend.
- Testes criados:
  - ordenação por percentagem;
  - empate por data;
  - role errada bloqueada antes de queries;
  - professor sem ownership bloqueado antes de queries de teste/tentativa;
  - teste inexistente sem consulta de tentativas.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-14` pode continuar a sequência sem depender de ranking público nem analytics avançado.

### Decisões técnicas confirmadas

- CANONICO: `BK-MF8-13` pertence à `MF8`, sprint `S12`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF8-12` e próximo BK `BK-MF8-14`.
- CANONICO: `RF28` cobre testes/mini-testes oficiais e `RF30` cobre métricas/progresso da turma.
- CANONICO: `BK-MF8-13` deve consumir tentativas persistidas do `BK-MF8-12`.
- DERIVADO: criar `OfficialTestRankingService` separado evita aumentar demasiado `OfficialTestsService`.
- DERIVADO: usar `Aluno XXXX` minimiza exposição de dados enquanto não houver nome público do aluno.
- DERIVADO: empates usam a tentativa mais antiga primeiro para manter regra previsível.

### Decisões de domínio confirmadas

- Ranking de mini-testes oficiais é fluxo docente, não fluxo de IA privada, sala ou grupo.
- Resultados de alunos são dados pessoais em contexto escolar.
- O backend, não o frontend, decide se o professor pode ver o ranking.
- O ranking não reabre submissão, correção ou cálculo do aluno; consome tentativas já pontuadas.

### Decisões marcadas como DERIVADO

- Usar identificador curto derivado do `studentId`.
- Separar helper puro `buildOfficialTestRanking(...)` do service de autorização.
- Manter o endpoint dentro do domínio `official-tests`, em vez de criar módulo paralelo de analytics.

### Drift documental encontrado

- Drift anterior: o bloco histórico da reescrita global da MF8 marcava `BK-MF8-13` como `OK`; a reauditoria seguinte reclassificou como `CRITICO`.
- Estado atual: drift resolvido por correção focada. A nova secção deste relatório passa a refletir `BK-MF8-13` como `OK`.

### Riscos restantes

- A implementação ensinada no BK ainda não foi aplicada aos ficheiros de produto nesta execução.
- O teste unitário focado fica como código ensinado no guia; não foi executado contra a app real porque os ficheiros de produto não foram criados nesta run.
- Quando os alunos aplicarem o BK, devem ligar a rota `OfficialTestRankingPage` no ficheiro de rotas protegidas real.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF2-04` entrega criação/listagem docente de testes oficiais.
- `BK-MF8-12` entrega tentativas persistidas e pontuadas por aluno.
- `BK-MF8-13` transforma essas tentativas em ranking docente autorizado.
- `BK-MF8-14` pode seguir para flashcards sem depender de dashboard avançado.

### Validações executadas

- Estrutura do BK alvo:
  - `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` devolveu `16`.
  - `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` devolveu `7`.
- Pesquisa obrigatória de termos proibidos nos guias MF8:
  - Resultado: sem ocorrências.
- Pesquisa obrigatória de caminhos privados nos guias MF8:
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.
- Teste unitário de produto:
  - Não executado como prova de produto, porque esta execução não criou os ficheiros reais `apps/api/src/modules/official-tests/official-test-ranking.service.ts` e `.spec.ts`; o teste está entregue como código completo dentro do guia.

### Bloqueios ou TODOs restantes

- Sem `TODO (BLOCKER)` por falta de contrato canónico.
- Restante apenas operacional: aplicar o BK no produto e executar a suite ensinada quando os ficheiros reais forem criados.

## Execução 2026-07-02 - reauditoria BK-MF8-13

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-13]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-13 - Rankings dos mini-testes oficiais`, lendo a MF8 completa, o BK anterior `BK-MF8-12`, o BK seguinte `BK-MF8-14`, os documentos canónicos e a implementação de referência em `real_dev`.

Resultado da reauditoria: `CRITICO`. O guia alvo preserva metadados canónicos, usa caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, não contém caminhos `real_dev` no texto do aluno e mantém a sequência `BK-MF8-12 -> BK-MF8-13 -> BK-MF8-14`. Contudo, ainda não é implementável por um aluno sem adivinhar peças técnicas essenciais: promete ranking docente, endpoint HTTP, service/controller, página React e testes, mas só apresenta código completo para uma função isolada de ordenação e para um ficheiro didático de expected results.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria | 1 | 0 | 0 |
| Depois da reauditoria | 0 | 0 | 1 |

Nota: o estado "antes" reflete o bloco histórico da reescrita global da MF8, que marcava `BK-MF8-13` como `OK`. A reauditoria atual aplica a prompt ativa mais estrita e reclassifica o BK alvo como `CRITICO`.

### Resultado por BK analisado

| BK | Estado anterior registado | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-13 | OK | CRITICO | Estrutura formal e metadados estão alinhados, mas faltam código completo e integrado para query de tentativas, autorização docente, endpoint `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`, controller/service, cliente/página React e suite real de testes. | P1 |

### Evidência focada desta reauditoria

- Estrutura:
  - `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` devolveu `16`.
  - `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` devolveu `7`.
  - Os passos 1 a 7 existem e incluem a grelha formal 1 a 7.
- Contrato canónico:
  - `docs/RF.md` define `RF28` como criação de testes/mini-testes oficiais e `RF30` como painel de progresso, dificuldades e métricas da turma.
  - `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF8-13` como `MF8`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF8-12`, `RF28, RF30`, sprint `S12`, `Core` e próximo BK `BK-MF8-14`.
  - `BK-MF8-12` declara no handoff que `BK-MF8-13` pode consumir a coleção `official_test_attempts` com `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`.
- Implementação de referência:
  - `real_dev/api/src/modules/official-tests/official-tests.service.ts` ainda contém apenas criação/listagem docente e `countPublishedBySubjectIds(...)`, sem ranking nem `OfficialTestAttempt`.
  - `real_dev/api/src/modules/official-tests/official-tests.controller.ts` expõe apenas `POST` e `GET` docentes de testes oficiais, sem rota `/:testId/ranking`.
  - Isto é aceitável como referência estrutural da própria `MF_ALVO`, mas reforça que o BK13 deve ensinar explicitamente o contrato novo em `apps/api` e `apps/web`.
- Evidência do guia alvo:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:101` promete `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:114-118` manda criar service, spec e página React.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:223-255` mostra apenas `buildOfficialTestRanking(...)`, com comentário de ficheiro `official-test-ranking.ts`, divergente do inventário `official-test-ranking.service.ts`.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:288-300` deixa a integração backend sem código.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:323-331` deixa cliente API e página React sem código porque "a integração varia".
  - `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:359-380` cria apenas `bk-mf8-13.expected-results.ts`, não a suite `official-test-ranking.service.spec.ts`.
  - Pesquisa por `OfficialTestAttempt`, `official_test_attempts`, `attemptModel`, `answeredAt`, `correctAnswers` e `totalQuestions` no BK alvo não encontrou consumo real do contrato entregue por `BK-MF8-12`.

### Findings

#### F01 - Ranking backend fica sem service/controller executáveis

- Estado: `CRITICO`
- Problema principal: o BK promete endpoint e validação docente, mas o Passo 4 diz `Sem código neste passo` e remete a integração para instruções gerais.
- Exemplos concretos:
  - endpoint prometido: `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`;
  - ficheiros prometidos: `official-test-ranking.service.ts` e `official-tests.controller.ts`;
  - código entregue: apenas `buildOfficialTestRanking(...)`, sem query à tentativa, sem validação de professor/disciplina/turma e sem método de controller.
- O que falta completar:
  - service de ranking que valide professor dono da disciplina;
  - leitura de `OfficialTestAttempt` filtrada por `testId`, `subjectId` e turma/disciplina autorizada;
  - método no controller com `SessionGuard`;
  - resposta tipada com mínimo de dados pessoais.
- Risco pedagógico: o aluno tem de inventar imports, modelos, query Mongoose, erros HTTP e fronteira de autorização.
- Risco técnico: pode surgir endpoint que lista resultados de alunos sem filtrar professor/turma/disciplina.
- Risco de segurança/privacidade: alto, porque rankings expõem resultados de alunos.
- Dependências a reler: `BK-MF8-12`, `BK-MF2-04`, `SubjectsService`, `ClassesService`, `OfficialTestsService`.
- Prioridade de correção: `P1`.

#### F02 - Contrato de tentativas do BK anterior não é consumido

- Estado: `CRITICO`
- Problema principal: `BK-MF8-12` entrega `official_test_attempts`, mas o BK13 não ensina como consumir esse modelo nem como transformar tentativas em ranking.
- Exemplos concretos:
  - o BK12 deixa `OfficialTestAttempt` e campos `percentage`, `answeredAt`, `studentId`, `classId` e `subjectId`;
  - o BK13 fala em `percentage`, mas não menciona `OfficialTestAttempt`, `official_test_attempts`, `attemptModel`, `answeredAt`, `correctAnswers` ou `totalQuestions` como contrato de implementação.
- O que falta completar:
  - declarar import/schema/model de `OfficialTestAttempt`;
  - mapear tentativas para linhas de ranking;
  - definir empate com dados reais;
  - evitar que o ranking dependa de linhas previamente "mágicas" já filtradas.
- Risco pedagógico: o aluno não percebe a ligação real entre realização do mini-teste e ranking.
- Risco técnico: rankings podem ser implementados com dados duplicados ou fonte errada.
- Risco de segurança/privacidade: médio/alto, por risco de mistura de tentativas de outras disciplinas ou turmas.
- Dependências a reler: handoff de `BK-MF8-12`, schema `OfficialTestAttempt`, `OfficialTestsModule`.
- Prioridade de correção: `P1`.

#### F03 - Frontend e cliente API ficam genéricos

- Estado: `CRITICO`
- Problema principal: o BK manda criar `OfficialTestRankingPage.tsx`, mas não fornece cliente API tipado nem componente React completo.
- Exemplos concretos:
  - Passo 5 pede loading, vazio, erro, sucesso e `credentials: "include"`;
  - a secção de código do Passo 5 diz `Sem código neste passo` e justifica que a integração varia consoante a página real.
- O que falta completar:
  - tipos `OfficialTestRankingRow`/response no cliente;
  - função `getOfficialTestRanking(...)` em `apps/web/src/lib/apiClient.ts` ou helper compatível;
  - `OfficialTestRankingPage` com estados e mensagens PT-PT;
  - integração com rota/página docente real ou instrução clara de ligação.
- Risco pedagógico: o aluno fica sem exemplo funcional para UI, estados assíncronos e tratamento de erro.
- Risco técnico: frontend pode chamar endpoint inexistente ou decidir permissões localmente.
- Risco de segurança/privacidade: médio, se a UI expuser nomes/dados excessivos.
- Dependências a reler: `apiClient.ts`, páginas docentes de testes oficiais, rotas protegidas.
- Prioridade de correção: `P1`.

#### F04 - Testes pedidos não são entregues como suite real

- Estado: `PARCIAL`
- Problema principal: o BK pede professor errado, ordenação e empate, mas o único código do Passo 6 é um ficheiro de expected results.
- Exemplos concretos:
  - `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts` aparece como ficheiro a criar;
  - o bloco de código cria `apps/api/src/modules/mf8/bk-mf8-13.expected-results.ts`, que não prova comportamento.
- O que falta completar:
  - suite Jest para professor errado;
  - suite para ordenação por percentagem;
  - suite para empate por `answeredAt`;
  - asserts sobre ausência de dados de turma/disciplina não autorizada.
- Risco pedagógico: a defesa fica com slogans de expected result em vez de evidence executável.
- Risco técnico: regressões de ordenação/autorização podem passar sem detecção.
- Risco de segurança/privacidade: médio, porque o negativo de professor errado é essencial.
- Dependências a reler: `official-tests.service.spec.ts`, doubles de Mongoose usados na MF.
- Prioridade de correção: `P2`.

#### F05 - Linguagem histórica interna permanece no texto do aluno

- Estado: `PARCIAL`
- Problema principal: a secção `Estado antes e depois` fala de "guia antigo", "bloco genérico" e "linguagem interna".
- Exemplo concreto: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:52`.
- O que falta completar: substituir a frase por estado funcional da aplicação antes/depois do BK, sem mencionar auditoria, histórico documental ou linguagem interna.
- Risco pedagógico: o guia fala do processo de correção em vez da entrega incremental que o aluno deve implementar.
- Risco técnico: baixo isoladamente, mas reforça a evidência de que o BK ainda não foi fechado como material final para aluno.
- Risco de segurança/privacidade: indireto; os riscos fortes ficam cobertos por F01-F04.
- Dependências a reler: secção `Estado antes e depois` dos BKs já corrigidos.
- Prioridade de correção: `P3`.

### Mapa de integração da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar:
  - `apps/api/src/modules/official-tests/official-test-ranking.service.ts`
  - `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
  - `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`
  - `apps/api/src/modules/classes/classes.service.ts`
- Exports prometidos pelo guia:
  - `OfficialTestRankingRow`
  - `buildOfficialTestRanking(...)`
  - `bkMf813ExpectedResults`
  - `getBkMf813ExpectedResult(...)`
- Exports que ainda deveriam ser entregues numa correção:
  - service/método de ranking docente;
  - response tipada para ranking;
  - cliente API frontend;
  - página React;
  - suite Jest real.
- Imports consumidos de BKs anteriores:
  - o guia deveria consumir `OfficialTestAttempt`/`official_test_attempts` de `BK-MF8-12`, mas isso não aparece implementado.
  - o guia consome conceitualmente `OfficialTest` de `BK-MF2-04`.
- Endpoint prometido:
  - `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`
- DTOs/validators criados:
  - nenhum.
- Schemas/modelos criados:
  - nenhum.
- Services criados:
  - prometido `official-test-ranking.service.ts`, mas não demonstrado como service completo.
- Componentes/páginas frontend criados:
  - prometido `OfficialTestRankingPage.tsx`, mas não demonstrado com código.
- Providers de IA criados ou usados:
  - nenhum; este BK não chama IA.
- Regras de segurança/autorização esperadas:
  - sessão por `SessionGuard`;
  - professor autenticado;
  - disciplina/turma autorizada no backend;
  - minimização de dados no ranking;
  - ausência de decisões de permissão no frontend.
- Testes esperados:
  - professor errado;
  - ordenação;
  - empate;
  - ausência de dados fora do contexto autorizado.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-14` depende apenas do handoff sequencial, mas não deve assumir o ranking como fechado enquanto `BK-MF8-13` estiver `CRITICO`.

### Decisões técnicas confirmadas

- CANONICO: `BK-MF8-13` pertence à `MF8`, sprint `S12`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `S`, dependência `BK-MF8-12` e próximo BK `BK-MF8-14`.
- CANONICO: `RF28` cobre testes/mini-testes oficiais e `RF30` cobre progresso/métricas da turma.
- CANONICO: `BK-MF8-12` deve fornecer tentativas persistidas para o ranking.
- DERIVADO: ranking docente com nome curto e pontuação é aceitável se respeitar minimização de dados.
- DERIVADO: ordenar por percentagem descendente e `answeredAt` ascendente em empate é uma regra técnica previsível, mas precisa de ser implementada sobre dados reais.

### Decisões de domínio confirmadas

- Rankings de mini-testes oficiais pertencem ao contexto professor/disciplina/turma, não ao contexto de IA privada, sala ou grupo.
- Resultados de alunos são dados sensíveis no contexto escolar; o backend tem de filtrar por professor/disciplina/turma antes de devolver qualquer linha.
- O frontend não decide se um professor pode ver ranking; apenas consome o endpoint autorizado.

### Decisões marcadas como DERIVADO

- Usar `displayName` curto no ranking em vez de expor dados completos do aluno.
- Resolver empate por tentativa mais antiga quando a percentagem é igual.
- Separar helper de ordenação de service de autorização, desde que o service completo seja ensinado.

### Drift documental encontrado

- O bloco histórico da reescrita global da MF8 classificava `BK-MF8-13` como `OK`, mas a reauditoria atual conclui `CRITICO`.
- O BK alvo afirma que fica com "código integrado" e "tutorial técnico completo", mas os passos críticos de backend/frontend/testes não entregam esse código.
- A frase interna em `Estado antes e depois` permanece no BK alvo.

### Riscos restantes

- O aluno pode implementar ranking a partir de dados já filtrados manualmente, sem validação real de professor/disciplina/turma.
- O endpoint pode expor resultados de alunos fora do contexto autorizado se a query não for ensinada com filtros corretos.
- O BK seguinte pode assumir ranking fechado quando o guia ainda não ensina o fluxo executável.
- O validador documental passa, mas não detecta a ausência de código integrado dentro do contrato pedagógico mais rigoroso desta prompt.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior e BKs anteriores deixam criação docente de testes oficiais (`BK-MF2-04`) e, pelo BK imediatamente anterior, tentativas pontuadas (`BK-MF8-12`).
- `BK-MF8-13` deveria transformar essas tentativas em ranking autorizado e minimizado, mas o guia atual não fecha a integração.
- `BK-MF8-14` pode continuar como flashcards, mas não deve depender de ranking como evidence final enquanto `BK-MF8-13` estiver `CRITICO`.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- Pesquisa adicional no BK alvo por `guia antigo`, `linguagem interna` e `bloco genérico`
  - Resultado: ocorrência em `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:52`.
- Pesquisa adicional no BK alvo por `OfficialTestAttempt`, `official_test_attempts`, `attemptModel`, `answeredAt`, `correctAnswers` e `totalQuestions`
  - Resultado: sem consumo real do contrato de tentativas entregue pelo `BK-MF8-12`.
- Pesquisa adicional no BK alvo por `secret`, `password`, `token`, `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `mock`, `stub`, `fake`, `RAG`, `embeddings`, `OCR`, `chunking` e `indexação automática`
  - Resultado: falsos positivos aceitáveis (`TODO` no header canónico; `RAG`, `embeddings` e `OCR` em Scope-out; `token` em frases de proteção; `mock` apenas em contexto de testes).
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- Não há `TODO (BLOCKER)` por falta de documento canónico.
- O bloqueio é de completude do próprio guia: `BK-MF8-13` deve ser corrigido em `MODO=corrigir_apenas` ou `MODO=hidratar_corrigir` para entregar service/controller, query de tentativas, página React, cliente API e suite real de testes.

## Execução 2026-07-02 - reauditoria pós-correção BK-MF8-12

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-12]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-12 - Realização de mini-testes oficiais por aluno`, depois da correção focada que tinha fechado as findings críticas anteriores.

Resultado da reauditoria: `OK`. O guia alvo mantém metadados canónicos, caminhos públicos `apps/api` e `apps/web`, `16` secções `####`, `7` passos `### Passo`, passos técnicos com pontos 1 a 7, código completo para DTO, schema, módulo, scoring, service, controller, cliente API, página React e suite de testes focada.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria | 1 | 0 | 0 |
| Depois da reauditoria | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado anterior registado | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-12 | OK | OK | O guia está implementável sem adivinhação: ensina tentativa persistida, validação de aluno inscrito, teste apenas `PUBLISHED`, pontuação backend, ocultação de respostas corretas antes da submissão, UI de realização, testes negativos e handoff para rankings. | P0 |

### Evidência focada desta reauditoria

- Estrutura:
  - `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md` devolveu `16`.
  - `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md` devolveu `7`.
  - Os passos `1` a `7` contêm todos os pontos obrigatórios: objetivo, ficheiros, instruções, código, explicação, validação e cenário negativo.
- Contrato canónico:
  - `docs/RF.md` define `RF28` como criação de testes/mini-testes oficiais.
  - `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF8-12` como `MF8`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF2-04`, `RF28`, sprint `S12`, `Reforco` e próximo BK `BK-MF8-13`.
  - `BK-MF2-04` entrega a criação/listagem docente de `OfficialTest`.
  - `BK-MF8-13` depende de `BK-MF8-12` para construir rankings dos mini-testes oficiais.
- Implementação de referência:
  - `real_dev/api/src/modules/official-tests/dto/create-official-test.dto.ts` valida quatro opções e `correctOptionIndex`, coerente com o DTO de tentativa do guia.
  - `real_dev/api/src/modules/official-tests/schemas/official-test.schema.ts` define `OfficialTestStatus = "DRAFT" | "PUBLISHED"` e `OfficialTestQuestion` com `correctOptionIndex`.
  - `real_dev/api/src/modules/subjects/subjects.service.ts` expõe `findSubjectForStudent(...)`, usado pelo guia como fronteira de inscrição.
  - `real_dev/web/src/lib/apiClient.ts` centraliza `credentials: "include"` em `requestJson(...)`, coerente com o cliente API ensinado.
- Segurança e privacidade:
  - o guia obtém `studentId` da sessão;
  - valida inscrição no backend antes de procurar teste;
  - só permite teste `PUBLISHED`;
  - não envia `correctOptionIndex` na listagem do aluno;
  - não guarda tokens ou sessão no frontend;
  - usa doubles de Jest apenas em testes, não como substituto da implementação.

### Findings reavaliados

- F01 endpoint e service de tentativa do aluno: `JA_CORRIGIDO`.
- F02 DTO, schema e persistência de tentativa: `JA_CORRIGIDO`.
- F03 frontend de realização do teste: `JA_CORRIGIDO`.
- F04 testes e negativos críticos: `JA_CORRIGIDO`.
- F05 linguagem histórica e handoff demasiado optimista: `JA_CORRIGIDO` no BK alvo.

### Mapa de integração da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar:
  - `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
  - `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
  - `apps/api/src/modules/official-tests/official-test-attempt-scoring.ts`
  - `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`
- Ficheiros que o BK alvo manda editar:
  - `apps/api/src/modules/official-tests/official-tests.module.ts`
  - `apps/api/src/modules/official-tests/official-tests.service.ts`
  - `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - `apps/api/src/modules/official-tests/official-tests.service.spec.ts`
  - `apps/web/src/lib/apiClient.ts`
- Exports produzidos pelo guia:
  - `SubmitOfficialTestAttemptDto`
  - `OfficialTestAttempt`
  - `OfficialTestAttemptDocument`
  - `OfficialTestAttemptSchema`
  - `OfficialTestAttemptScore`
  - `scoreOfficialTestAttempt(...)`
  - `OfficialTestStudentQuestionView`
  - `OfficialTestStudentView`
  - `OfficialTestAttemptView`
  - `OfficialTestAttemptPage`
- Imports consumidos de BKs anteriores:
  - `OfficialTest`
  - `OfficialTestQuestion`
  - `OfficialTestStatus`
  - `SubjectsService.findSubjectForStudent(...)`
  - `SessionGuard`
  - `AuthenticatedRequest`
  - `requestJson(...)`
- Endpoints ensinados:
  - `GET /api/student/subjects/:subjectId/tests`
  - `POST /api/student/subjects/:subjectId/tests/:testId/attempts`
- DTOs/validators criados:
  - `SubmitOfficialTestAttemptDto`
- Schemas/modelos criados:
  - `OfficialTestAttempt`
- Services editados:
  - `OfficialTestsService`
- Componentes/páginas frontend criados:
  - `OfficialTestAttemptPage`
- Providers de IA criados ou usados:
  - nenhum; este BK não chama IA.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - `studentId` vem sempre da sessão;
  - inscrição na disciplina validada no backend;
  - mini-teste só pode ser realizado quando está `PUBLISHED`;
  - respostas corretas não são enviadas na listagem do aluno;
  - frontend não envia ownership, membership, role nem `studentId`.
- Testes ensinados:
  - aluno não inscrito;
  - teste não publicado;
  - tentativa incompleta;
  - pontuação calculada e persistida.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-13`, para rankings dos mini-testes oficiais.

### Decisões técnicas confirmadas

- CANONICO: `BK-MF8-12` consome o contrato de testes oficiais criado por `BK-MF2-04`.
- CANONICO: `BK-MF8-13` depende das tentativas persistidas e pontuadas do `BK-MF8-12`.
- DERIVADO: criar `OfficialTestAttempt` separado de `OfficialTest` preserva a versão oficial do professor.
- DERIVADO: calcular pontuação no backend impede manipulação pelo frontend.
- DERIVADO: usar `SubjectsService.findSubjectForStudent(...)` como fronteira de membership é coerente com a implementação de referência.
- DERIVADO: a listagem do aluno devolve perguntas e opções, mas não a resposta correta.

### Decisões de domínio confirmadas

- CANONICO: `RF28` cobre criação de testes/mini-testes oficiais.
- CANONICO: `BK-MF2-04` cria/lista testes oficiais docentes e deixa a realização pelo aluno para BK posterior.
- CANONICO: `BK-MF8-12` pertence à `MF8`, sprint `S12`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF2-04` e próximo BK `BK-MF8-13`.

### Decisões marcadas como DERIVADO

- Guardar tentativa oficial em `official_test_attempts`.
- Expor endpoint de listagem do aluno separado do endpoint docente.
- Ocultar `correctOptionIndex` antes da submissão.
- Mostrar correção pergunta a pergunta apenas depois de o aluno submeter a própria tentativa.

### Drift documental encontrado

- BK alvo: sem drift novo encontrado.
- Fora do alvo: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md:52` ainda contém linguagem histórica de guia antigo e linguagem interna na secção `Estado antes e depois`.
- Estado do drift fora do alvo: `BLOQUEADO_POR_SCOPE`, porque esta execução tem `BK_IDS=[BK-MF8-12]`, `MODO=auditar_apenas` e `STRICT_SCOPE=true`.

### Riscos restantes

- O guia está `OK`, mas a implementação ensinada ainda não foi aplicada ao produto nesta execução.
- Os doubles de Jest do Passo 7 são aceitáveis em testes unitários, mas devem ser complementados por validação de integração quando o aluno aplicar o BK.
- `BK-MF8-13` depende da aplicação correcta da coleção `official_test_attempts`.
- Existe drift textual fora do alvo em `BK-MF8-13`, sem impacto directo no estado `OK` de `BK-MF8-12`, mas relevante para uma ronda de coerência da MF8.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF2-04` criou a base docente de testes oficiais com `OfficialTest`, `OfficialTestStatus` e `correctOptionIndex`.
- `BK-MF8-12` fecha a lacuna de execução por aluno com submissão, pontuação backend e tentativa persistida.
- `BK-MF8-13` pode construir rankings sobre tentativas persistidas, desde que o seu drift textual seja limpo numa execução própria.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "mock|stub|fake|payload: unknown|localStorage|sessionStorage|password|secret|token|as any|TODO" docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
  - Resultado: `TODO` apenas no estado canónico do header; `token` apenas em frases de segurança sem armazenamento local; `mock` apenas em doubles de Jest no ficheiro de teste.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- BK alvo: sem blockers ou TODOs abertos.
- Fora do alvo: limpar a frase histórica em `BK-MF8-13`.

## Execução 2026-07-02 - correção focada BK-MF8-12

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-12]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-12 - Realização de mini-testes oficiais por aluno`, usando como base a reauditoria anterior que classificava o BK como `CRITICO`.

Resultado da correção: `OK`. O guia alvo passou de um roteiro estruturalmente válido mas incompleto para um tutorial técnico executável: define DTO, schema de tentativa, módulo, cálculo backend, service, controller, cliente API, página React, testes focados, validação final, evidence e handoff para `BK-MF8-13`.

A correção ficou limitada ao BK alvo e a este relatório. Nenhum ficheiro de produto em `apps/` ou `real_dev/` foi editado nesta execução.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-12 | CRITICO | OK | O guia passou a entregar código completo e explicação técnica para a realização de mini-testes oficiais por aluno, incluindo autorização backend por inscrição, teste apenas publicado, pontuação calculada no servidor, tentativa persistida, UI de submissão e testes focados. | P0 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução corrigiu apenas documentação de planificação e blocos de código ensinados no guia.

### Correções aplicadas sobre as findings abertas

#### F01 - Endpoint e service de tentativa do aluno não eram implementados no guia

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 4 passou a ensinar `OfficialTestsService` com listagem de testes publicados para aluno e submissão de tentativa;
  - o service valida inscrição através de `SubjectsService.findSubjectForStudent(...)`;
  - o service bloqueia testes não publicados;
  - o service calcula a pontuação no backend e persiste a tentativa;
  - o Passo 5 passou a expor `GET /api/student/subjects/:subjectId/tests` e `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.

#### F02 - DTO, schema e persistência de tentativa eram prometidos mas não entregues

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 2 cria `SubmitOfficialTestAttemptDto`;
  - o Passo 2 cria `OfficialTestAttempt` e `OfficialTestAttemptSchema`;
  - o módulo passa a registar o schema da tentativa;
  - o modelo guarda `studentId`, `subjectId`, `classId`, `testId`, respostas, pontuação e data;
  - o guia explica por que a tentativa deve ficar separada de `OfficialTest`.

#### F03 - Frontend de realização do teste ficava genérico

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 5 acrescenta tipos e funções em `apps/web/src/lib/apiClient.ts`;
  - o Passo 6 cria `OfficialTestAttemptPage`;
  - a página cobre loading, erro, lista de testes, formulário por pergunta, submissão, resultado e mensagens em PT-PT;
  - o frontend usa o cliente API existente e não decide permissões localmente.

#### F04 - Testes e negativos críticos não eram automatizados no guia

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o Passo 7 cria uma suite focada para `OfficialTestsService`;
  - os testes cobrem aluno não inscrito, teste em `DRAFT` e pontuação calculada;
  - os doubles de Jest ficam restritos ao ficheiro de teste e não substituem implementação real.

#### F05 - Linguagem histórica e handoff estavam demasiado optimistas

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - a secção `Estado antes e depois` passou a descrever o estado funcional real da aplicação antes e depois do BK;
  - o `Handoff` passou a declarar explicitamente o contrato que `BK-MF8-13` pode assumir: tentativas persistidas por aluno e pontuação própria calculada no backend;
  - o texto do aluno deixou de depender de linguagem histórica de auditoria.

### Mapa de integração da MF

- Guia BK editado nesta execução:
  - `BK-MF8-12`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução:
  - nenhum
- Ficheiros que o BK alvo manda criar:
  - `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
  - `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
  - `apps/api/src/modules/official-tests/official-test-attempt-scoring.ts`
  - `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`
- Ficheiros que o BK alvo manda editar:
  - `apps/api/src/modules/official-tests/official-tests.module.ts`
  - `apps/api/src/modules/official-tests/official-tests.service.ts`
  - `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - `apps/api/src/modules/official-tests/official-tests.service.spec.ts`
  - `apps/web/src/lib/apiClient.ts`
- Exports produzidos pelo guia:
  - `SubmitOfficialTestAttemptDto`
  - `OfficialTestAttempt`
  - `OfficialTestAttemptDocument`
  - `OfficialTestAttemptSchema`
  - `OfficialTestAttemptScore`
  - `scoreOfficialTestAttempt(...)`
  - `OfficialTestStudentQuestionView`
  - `OfficialTestStudentView`
  - `OfficialTestAttemptView`
  - `OfficialTestAttemptPage`
- Imports consumidos de contratos anteriores:
  - `OfficialTest`
  - `OfficialTestQuestion`
  - `OfficialTestStatus`
  - `SubjectsService.findSubjectForStudent(...)`
  - `SessionGuard`
  - `AuthenticatedRequest`
  - `requestJson(...)`
- Endpoints ensinados:
  - `GET /api/student/subjects/:subjectId/tests`
  - `POST /api/student/subjects/:subjectId/tests/:testId/attempts`
- DTOs/validators criados:
  - `SubmitOfficialTestAttemptDto`
- Schemas/modelos criados:
  - `OfficialTestAttempt`
- Services editados:
  - `OfficialTestsService`
- Componentes/páginas frontend criados:
  - `OfficialTestAttemptPage`
- Providers de IA criados ou usados:
  - nenhum; este BK não chama IA.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - `studentId` vem sempre da sessão;
  - inscrição na disciplina validada no backend;
  - mini-teste só pode ser realizado quando está `PUBLISHED`;
  - respostas corretas não são enviadas na listagem do aluno;
  - frontend não envia ownership, membership, role nem `studentId`.
- Testes ensinados:
  - negativo de aluno não inscrito;
  - negativo de teste não publicado;
  - pontuação calculada e tentativa persistida.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-13`, para rankings dos mini-testes oficiais.

### Decisões técnicas confirmadas

- CANONICO: `BK-MF8-12` consome o contrato de testes oficiais criado por `BK-MF2-04`.
- CANONICO: `BK-MF2-04` deixou fora do seu scope a realização do teste pelo aluno e a correção automática.
- CANONICO: `BK-MF8-13` depende das tentativas persistidas e pontuadas do `BK-MF8-12`.
- DERIVADO: guardar `OfficialTestAttempt` separadamente de `OfficialTest` preserva a versão oficial criada pelo professor.
- DERIVADO: calcular pontuação no backend é obrigatório para impedir manipulação pelo frontend.
- DERIVADO: usar `SubjectsService.findSubjectForStudent(...)` como fronteira de membership mantém coerência com a implementação existente.
- DERIVADO: a listagem do aluno deve devolver perguntas e opções, mas não a resposta correta.

### Decisões de domínio confirmadas

- CANONICO: `RF28` cobre criação de testes/mini-testes oficiais.
- CANONICO: apenas alunos inscritos devem aceder a conteúdo oficial da turma/disciplina.
- CANONICO: `BK-MF8-12` pertence à `MF8`, sprint `S12`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF2-04` e próximo BK `BK-MF8-13`.

### Drift documental encontrado

- O drift crítico registado na reauditoria anterior para `BK-MF8-12` foi encerrado nesta execução.
- Não foi encontrado novo drift documental dentro do BK alvo após a correção.
- As alterações existentes noutros BKs da MF8 foram preservadas e não foram reclassificadas nesta execução.

### Riscos restantes

- O guia está `OK`, mas a implementação ensinada ainda não foi aplicada ao produto nesta execução.
- Os testes do guia usam doubles de Jest apenas dentro da suite de teste; isso é aceitável para isolar o service, mas não substitui validação de integração quando o aluno aplicar o BK.
- `BK-MF8-13` continua dependente de o aluno aplicar correctamente a persistência de tentativas do `BK-MF8-12`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF2-04` cria a base docente de testes oficiais e deixa a realização pelo aluno fora do scope.
- `BK-MF8-12` fecha essa lacuna com submissão de tentativa por aluno, pontuação backend e persistência.
- `BK-MF8-13` pode assumir tentativas oficiais persistidas, pontuação própria e ligação segura por aluno/teste/disciplina.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "mock|stub|fake|payload: unknown|localStorage|sessionStorage|password|secret|token" docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
  - Resultado: apenas linguagem segura sobre tokens sem armazenamento local e doubles de Jest no ficheiro de teste ensinado; sem atalhos de implementação.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- BK alvo: sem blockers ou TODOs abertos.
- Fora do alvo: não foram auditados nem alterados outros BKs da MF8 nesta execução.

## Execução 2026-07-02 - reauditoria focada BK-MF8-12

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-12]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-12 - Realização de mini-testes oficiais por aluno`, lendo a MF8 completa, o BK anterior `BK-MF8-11`, o BK seguinte `BK-MF8-13`, o contrato anterior `BK-MF2-04`, os documentos canónicos e a implementação de referência em `real_dev`.

Resultado da reauditoria: `CRITICO`. O guia alvo preserva metadados canónicos, usa caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, não contém caminhos privados no texto do aluno e mantém a sequência `BK-MF8-11 -> BK-MF8-12 -> BK-MF8-13`. Contudo, ainda não é implementável por um aluno sem adivinhar peças centrais: promete DTO, schema de tentativa, service, controller, endpoint de submissão, página React e testes, mas só fornece código completo para uma função de scoring isolada e para expected results didáticos.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria | 1 | 0 | 0 |
| Depois da reauditoria | 0 | 0 | 1 |

Nota: o estado anterior corresponde à classificação herdada no bloco de hidratação MF8 de `2026-06-30`, que marcava `BK-MF8-12` como `OK`. Esta execução reavaliou o guia actual com evidência mais fina e substitui essa conclusão para o BK alvo.

### Resultado por BK analisado

| BK | Estado anterior registado | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-12 | OK | CRITICO | O guia tem estrutura externa válida, mas não entrega código completo para o fluxo essencial de realização de mini-testes oficiais: tentativa persistida, DTO, schema, endpoint do aluno, integração no service/controller, cliente/página React e testes reais ficam em instruções genéricas ou em ficheiros prometidos sem implementação. | P0 |

### Evidência focada desta reauditoria

- Estrutura:
  - `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md` devolveu `16`.
  - `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md` devolveu `7`.
- Contrato canónico:
  - `docs/RF.md` define `RF28` como "Criar testes/mini-testes oficiais" e a nota de turmas/disciplinas indica que apenas alunos inscritos acedem a conteúdo oficial.
  - `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md` alinham `BK-MF8-12` como `MF8`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF2-04`, `RF28`, sprint `S12`, `Reforco` e próximo BK `BK-MF8-13`.
  - `BK-MF2-04` cria/lista testes oficiais e deixa fora do seu scope a realização do teste pelo aluno e a correção automática de submissões.
  - `BK-MF8-13` depende de `BK-MF8-12` para construir rankings dos mini-testes oficiais.
- Implementação de referência:
  - `real_dev/api/src/modules/official-tests/official-tests.controller.ts` expõe apenas `api/teacher/subjects/:subjectId/tests`.
  - `real_dev/api/src/modules/official-tests/official-tests.service.ts` implementa criação/listagem docente e `countPublishedBySubjectIds(...)`, mas não implementa submissão de tentativa de aluno.
  - `real_dev/api/src/modules/subjects/subjects.service.ts` já oferece `findSubjectForStudent(...)`, contrato útil para validar inscrição do aluno antes da tentativa.
  - `real_dev/web/src/lib/apiClient.ts` tem tipos e funções para `OfficialTest` docente, mas não tem cliente de submissão de tentativa oficial por aluno.
- Lacuna principal no guia:
  - O BK promete `POST /api/student/subjects/:subjectId/tests/:testId/attempts`, mas esse endpoint não aparece no `real_dev` nem é ensinado com controller/service completos no guia.
  - O passo 3 lista DTO/schema/service, mas o bloco de código cria `official-test-attempt-scoring.ts`, ficheiro que não está na lista principal de ficheiros a criar/editar.
  - O passo 4, que deveria integrar DTO, schema, service e controller, diz `Sem código neste passo`.
  - O passo 5, que deveria criar `OfficialTestAttemptPage.tsx`, diz `Sem código neste passo` porque "a integração varia".
  - O passo 6 pede testes para aluno não inscrito, teste não publicado e pontuação calculada, mas só entrega um ficheiro de expected results, não uma suite real.
  - A linha de `Estado antes` ainda contém linguagem histórica sobre "guia antigo", inadequada para texto final destinado ao aluno.

### Findings reavaliados

#### F01 - Endpoint e service de tentativa do aluno não são implementados no guia

- Estado do BK: `CRITICO`
- Estado de correção nesta execução: `BLOQUEADO_POR_SCOPE`
- Evidência:
  - o guia declara `POST /api/student/subjects/:subjectId/tests/:testId/attempts`;
  - `real_dev` só tem controller docente `api/teacher/subjects/:subjectId/tests`;
  - o passo 4 não fornece código para controller, service, DTO nem persistência.
- O que falta completar:
  - método de controller para aluno autenticado;
  - método de service que use `SubjectsService.findSubjectForStudent(...)`;
  - leitura apenas de teste `PUBLISHED`;
  - cálculo backend;
  - persistência da tentativa;
  - respostas HTTP e erros em PT-PT.
- Risco pedagógico: o aluno teria de inventar a parte mais importante do BK.
- Risco técnico: endpoint documentado não nasce de código completo e pode divergir dos contratos existentes.
- Risco de segurança/privacidade: sem service completo, inscrição, membership e `studentId` da sessão ficam apenas como intenção textual.

#### F02 - DTO, schema e persistência de tentativa são prometidos mas não entregues

- Estado do BK: `CRITICO`
- Estado de correção nesta execução: `BLOQUEADO_POR_SCOPE`
- Evidência:
  - a lista de ficheiros inclui `submit-official-test-attempt.dto.ts` e `official-test-attempt.schema.ts`;
  - nenhum dos dois ficheiros tem código completo no guia;
  - o único bloco backend completo do passo 3 cria uma função de scoring isolada.
- O que falta completar:
  - DTO com validação de respostas;
  - schema/model de tentativa com `studentId`, `subjectId`, `classId`, `testId`, respostas, pontuação e data;
  - índices mínimos para aluno/teste/disciplina;
  - mapper de resposta pública sem dados excessivos.
- Risco pedagógico: os nomes aparecem no roteiro, mas o aluno não sabe que campos persistir nem como validar.
- Risco técnico: `BK-MF8-13` não tem base confiável para ranking.
- Risco de privacidade: uma tentativa mal modelada pode expor resultados entre alunos ou turmas.

#### F03 - Frontend de realização do teste fica genérico

- Estado do BK: `CRITICO`
- Estado de correção nesta execução: `BLOQUEADO_POR_SCOPE`
- Evidência:
  - o guia manda criar `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`;
  - o passo 5 não apresenta código de cliente API, página, estado, formulário, submissão, loading, erro, sucesso ou resultado.
- O que falta completar:
  - tipos de request/response;
  - função de cliente API com cookies via helper existente;
  - página React com labels, estados, submissão e resultado;
  - tratamento de erro de sessão, teste não publicado e aluno não inscrito.
- Risco pedagógico: o aluno fica sem exemplo completo de UI para um fluxo P0.
- Risco técnico: frontend pode calcular ou decidir acesso localmente se a fronteira backend não for exemplificada.
- Risco de acessibilidade: labels, foco, estados e mensagens ficam apenas declarados nos critérios.

#### F04 - Testes e negativos críticos não são automatizados no guia

- Estado do BK: `CRITICO`
- Estado de correção nesta execução: `BLOQUEADO_POR_SCOPE`
- Evidência:
  - o passo 6 pede aluno não inscrito, teste não publicado e pontuação calculada;
  - o bloco fornecido é `bk-mf8-12.expected-results.ts`, que centraliza frases, mas não executa o service, controller ou UI.
- O que falta completar:
  - suite focada para scoring e submissão;
  - negativo de aluno não inscrito;
  - negativo de teste `DRAFT`;
  - assert de pontuação e persistência;
  - opcionalmente teste de cliente/frontend para estados.
- Risco pedagógico: expected result sem teste real pode dar falsa sensação de validação.
- Risco técnico: regressões de autorização e pontuação não ficam cobertas.

#### F05 - Linguagem histórica e handoff demasiado optimista

- Estado do BK: `PARCIAL`
- Estado de correção nesta execução: `BLOQUEADO_POR_SCOPE`
- Evidência:
  - a secção `Estado antes e depois` diz que o requisito "ainda surge no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo";
  - o `Handoff` afirma que o próximo BK pode assumir alunos inscritos conseguem realizar testes publicados e receber pontuação própria, apesar de o guia não entregar a implementação completa.
- O que falta completar:
  - trocar a frase histórica por estado funcional real antes/depois;
  - alinhar o handoff com contratos efectivamente ensinados.
- Risco pedagógico: texto de auditoria fica dentro do guia do aluno.
- Risco técnico: `BK-MF8-13` pode assumir um contrato que o BK anterior não ensinou.

### Mapa de integração da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar/rever:
  - CRIAR: `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
  - CRIAR: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
  - EDITAR: `apps/api/src/modules/official-tests/official-tests.service.ts`
  - EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`
  - CRIAR: `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`
- Exports produzidos pelo guia:
  - `OfficialTestAttemptScore`
  - `scoreOfficialTestAttempt(...)`
  - `bkMf812ExpectedResults`
  - `getBkMf812ExpectedResult(...)`
- Imports consumidos de BKs anteriores:
  - `OfficialTestQuestion` de `apps/api/src/modules/official-tests/schemas/official-test.schema.ts`, criado pelo contrato de testes oficiais;
  - `SubjectsService.findSubjectForStudent(...)` existe em `real_dev` como referência técnica, mas ainda não é ensinado no BK alvo;
  - sessão via `SessionGuard` e `AuthenticatedRequest`.
- Endpoints prometidos:
  - `POST /api/student/subjects/:subjectId/tests/:testId/attempts`
- DTOs/validators prometidos:
  - `SubmitOfficialTestAttemptDto`, ainda sem código completo no guia.
- Schemas/modelos prometidos:
  - `OfficialTestAttempt`, ainda sem código completo no guia.
- Services prometidos:
  - extensão de `OfficialTestsService`, ainda sem método completo para tentativa do aluno.
- Componentes/páginas frontend prometidos:
  - `OfficialTestAttemptPage`, ainda sem código completo no guia.
- Providers de IA criados ou usados:
  - nenhum; este BK não deve chamar IA.
- Regras de segurança/autorização que o guia deve aplicar:
  - aluno autenticado via sessão;
  - `studentId` vindo da sessão;
  - inscrição na disciplina validada no backend;
  - teste apenas se `PUBLISHED`;
  - ausência de logs/evidence com dados sensíveis;
  - frontend sem decisões de ownership, membership, role ou permissão.
- Testes prometidos:
  - aluno não inscrito;
  - teste não publicado;
  - pontuação calculada.
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-13`, para rankings dos mini-testes oficiais.

### Decisões técnicas confirmadas

- CANONICO: `BK-MF8-12` deve consumir o contrato de testes oficiais criado em `BK-MF2-04`.
- CANONICO: `BK-MF8-13` depende de `BK-MF8-12`.
- DERIVADO: guardar tentativa separada de `OfficialTest` é adequado para preservar a versão oficial criada pelo professor.
- DERIVADO: calcular pontuação no backend é obrigatório para impedir manipulação pelo frontend.
- DERIVADO: o endpoint `POST /api/student/subjects/:subjectId/tests/:testId/attempts` é coerente com a separação docente/aluno já usada no repo, mas precisa de código completo para ser contrato seguro.
- DERIVADO: `SubjectsService.findSubjectForStudent(...)` é o ponto de referência técnica para validar inscrição do aluno antes da tentativa.

### Decisões de domínio confirmadas

- CANONICO: `RF28` cobre criação de testes/mini-testes oficiais.
- CANONICO: em turmas/disciplinas, apenas alunos inscritos têm acesso ao conteúdo oficial.
- CANONICO: `BK-MF2-04` cria a base docente de testes oficiais e exclui realização pelo aluno e correção automática.
- CANONICO: `BK-MF8-12` pertence à `MF8`, sprint `S12`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforço `M`, dependência `BK-MF2-04` e próximo BK `BK-MF8-13`.

### Decisões marcadas como DERIVADO

- Criar entidade/coleção de tentativa oficial separada de `OfficialTest`.
- Guardar pontuação calculada no backend, juntamente com respostas e identificadores mínimos.
- Mostrar ao aluno resultado próprio sem alterar nem expor a versão oficial do professor.
- Reutilizar `findSubjectForStudent(...)` como fronteira de membership para disciplinas.

### Drift documental encontrado

- O bloco histórico de `2026-06-30` marca `BK-MF8-12` como `OK`, mas a reauditoria actual conclui `CRITICO`.
- O guia diz que entrega "código integrado", mas deixa integrações essenciais sem código.
- A lista de ficheiros promete DTO/schema/página, mas o código completo fornecido cria principalmente uma unidade auxiliar fora da lista principal.
- A secção `Estado antes e depois` mantém linguagem histórica de auditoria dentro do texto do aluno.

### Riscos restantes

- O aluno não consegue implementar o fluxo P0 sem inventar DTO, schema, service, controller, página e testes.
- `BK-MF8-13` fica em risco porque rankings precisam de tentativas persistidas e pontuações reais do `BK-MF8-12`.
- Há risco de segurança se a validação de inscrição, teste publicado e `studentId` da sessão não forem ensinados como backend obrigatório.
- Há risco pedagógico de o validador documental passar, mas o guia continuar tecnicamente insuficiente para execução real.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF2/BK-MF2-04 entrega criação/listagem docente de testes oficiais e deixa a realização pelo aluno fora do seu scope.
- A implementação de referência até MF7/MF8 mantém contratos docentes de `OfficialTestsService` e já tem `SubjectsService.findSubjectForStudent(...)` para validar aluno inscrito.
- `BK-MF8-12` deveria fechar a lacuna de submissão de tentativa por aluno, mas o guia actual não ensina a implementação completa.
- `BK-MF8-13` deve ser tratado como dependente em risco até `BK-MF8-12` ser corrigido.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "OfficialTestAttempt|official-test-attempt|submit.*attempt|/api/student/subjects/.*/tests|attempts|scoreOfficialTestAttempt|OfficialTestAttemptPage" real_dev/api/src real_dev/web/src apps/api/src apps/web/src docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
  - Resultado: encontrou o contrato apenas no guia; em `real_dev`/`apps` não existe rota de tentativa oficial do aluno, apenas `quiz-attempts` de estudo/IA.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`, contagens `107/107/107`.

### Bloqueios ou TODOs restantes

- BK alvo: corrigir `BK-MF8-12` numa execução `hidratar_corrigir` ou `corrigir_apenas`.
- A correção deve substituir o guia genérico por código completo de DTO, schema/model, service, controller, cliente API, página React e suite de testes focada.
- Esta execução não corrigiu o BK porque `MODO=auditar_apenas` e `STRICT_SCOPE=true`.

## Execução 2026-07-02 - reauditoria pós-correção de acessibilidade BK-MF8-11

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-11]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala`, depois da correção de acessibilidade no formulário React do Passo 5.

Resultado da reauditoria: `OK`. O guia alvo mantém `16` secções `####`, `7` passos `### Passo`, metadados canónicos, caminhos públicos `apps/api` e `apps/web`, ausência de caminhos privados no texto do aluno, contrato backend/frontend completo para partilha read-only e fork privado, testes unitários focados e label acessível no campo de pergunta da IA da sala.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria | 1 | 0 | 0 |
| Depois da reauditoria | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-11 | OK | O guia está implementável como tutorial: define persistência, DTO, service, controller, module, cliente API, página React, testes, validação final, evidence, handoff e acessibilidade básica no formulário. | P1 |

### Evidência focada desta reauditoria

- Estrutura:
  - `rg -c '^#### ' ...BK-MF8-11...` devolveu `16`.
  - `rg -c '^### Passo ' ...BK-MF8-11...` devolveu `7`.
- Acessibilidade:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md:1037` contém `<label ... htmlFor="room-ai-question">`.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md:1041` contém `id="room-ai-question"` no `textarea`.
  - O texto do guia também explica a razão do label e inclui o critério de aceite correspondente.
- Contrato técnico do BK:
  - O guia define `ShareRoomAiAnswerDto`, `RoomAiSharingService`, `GET /api/study-rooms/:roomId/ai/answers?scope=shared` e `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`.
  - O guia usa `READ_ONLY` para tornar resposta própria partilhada e `PRIVATE_FORK` para criar cópia privada.
  - O guia ensina membership antes de leitura, ownership para partilha própria e `studentId` vindo da sessão no fork.
- Coerência canónica:
  - `RF16`, `RF42` e `RNF20` continuam alinhados com matriz, backlog, contrato de campos e anexos RF/RNF.
  - `BK-MF8-10` entrega `GET ?scope=mine` e o `BK-MF8-11` constrói sobre esse histórico privado.
  - `BK-MF8-12` continua como próximo BK na matriz/backlog.

### Findings reavaliados

- F01 backend sem service/controller executáveis: `JA_CORRIGIDO`.
- F02 frontend e cliente API genéricos: `JA_CORRIGIDO`.
- F03 testes pedidos não entregues como suite real: `JA_CORRIGIDO`.
- F04 persistência/modelo do fork e da partilha indefinidos: `JA_CORRIGIDO`.
- F05 linguagem histórica interna no texto do aluno: `JA_CORRIGIDO` no BK alvo.
- F06 campo de pergunta da UI sem label acessível: `JA_CORRIGIDO`, com evidência em `htmlFor="room-ai-question"` e `id="room-ai-question"`.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar/rever:
  - CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
  - EDITAR: `apps/web/src/lib/apiClient.ts`
  - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
- Exports produzidos pelo guia:
  - `RoomAiShareMode`
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
  - `RoomAiAnswerReuseView`
  - `RoomAiShareResult`
  - `RoomAiSharingService`
  - `listSharedRoomAiAnswers(...)`
  - `shareRoomAiAnswer(...)`
  - `RoomAiPage`
- Imports consumidos de BKs anteriores:
  - `RoomAiService.listMyRoomAiHistory(...)`, entregue por `BK-MF8-10`;
  - `RoomAiInteraction`, `StudyRoomsService.ensureMember(...)`, `SessionGuard`, `AuthenticatedRequest`;
  - `requestJson(...)`, `askRoomAi(...)` e `RoomAiAnswer`.
- Endpoints criados:
  - `GET /api/study-rooms/:roomId/ai/answers?scope=shared`
  - `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`
- DTOs/validators criados:
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
- Schemas/modelos alterados:
  - `RoomAiInteraction` recebe `visibility`, `sharedAt`, `forkedFromInteractionId`.
- Services criados:
  - `RoomAiSharingService`
- Componentes/páginas frontend editados:
  - `RoomAiPage`
- Providers de IA criados ou usados:
  - nenhum provider novo; partilha e fork reutilizam resposta persistida.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - membership antes de leitura;
  - ownership para `READ_ONLY`;
  - `studentId` do fork vem da sessão;
  - frontend não envia ownership, membership, role nem `studentId`.
- Testes criados:
  - `room-ai-sharing.service.spec.ts`
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-12`, apenas como continuidade da MF; os mini-testes oficiais não devem reutilizar permissões da partilha IA.

### Decisões técnicas confirmadas

- DERIVADO: reutilizar `RoomAiInteraction` em vez de criar entidade paralela.
- DERIVADO: usar `visibility: "PRIVATE" | "SHARED"`.
- DERIVADO: usar `sharedAt` para marcar o momento da partilha.
- DERIVADO: usar `forkedFromInteractionId` para rastrear a origem da cópia privada.
- DERIVADO: criar fork privado sem chamar provider de IA.
- DERIVADO: usar label visível ligado por `htmlFor/id` no campo de pergunta da IA da sala.

### Decisões de domínio confirmadas

- CANONICO: `RF16` cobre IA partilhada da sala.
- CANONICO: `RF42` cobre chat, partilha e notas coletivas.
- CANONICO: `RNF20` impede mistura de dados de turmas ou alunos.
- CANONICO: `BK-MF8-11` pertence à `MF8`, sprint `S12`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `M`, dependência `BK-MF8-10` e próximo BK `BK-MF8-12`.

### Drift documental encontrado

- Mantém-se o drift fora do alvo em `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md:52`, que ainda contém frase histórica sobre o estado antigo do `BK-MF8-11`.
- Estado: `BLOQUEADO_POR_SCOPE`, porque esta execução tem `BK_IDS=[BK-MF8-11]`, `MODO=auditar_apenas` e `STRICT_SCOPE=true`.

### Riscos restantes

- O guia está `OK`, mas o código ensinado não foi aplicado ao produto nesta execução; `apps/` e `real_dev/` foram usados apenas como referência estrutural.
- Não existe pasta `docs/planificacao/guias-bk/MF9`; a coerência futura foi limitada à continuidade interna `BK-MF8-12`.
- O drift textual em `BK-MF8-12` permanece fora do alvo.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 fecha fontes autorizadas, separação de perfis e limites de IA.
- `BK-MF8-10` entrega histórico privado da IA da sala com `GET ?scope=mine`.
- `BK-MF8-11` usa esse histórico para partilha read-only e fork privado, mantendo membership, ownership e frontend acessível.
- `BK-MF8-12` pode avançar para mini-testes oficiais sem reutilizar permissões da partilha IA.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- BK alvo: sem blockers ou TODOs abertos.
- Fora do alvo: corrigir a frase histórica em `BK-MF8-12` numa execução própria.

## Execução 2026-07-02 - correção pós-reauditoria focada BK-MF8-11

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-11]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala`, usando como ponto de partida a reauditoria pós-correção que classificava o BK como `PARCIAL`.

Resultado da correção: `OK`. A lacuna F06 foi corrigida no Passo 5: o `textarea` da pergunta da IA da sala passou a ter `label` visível ligado por `htmlFor="room-ai-question"` e `id="room-ai-question"`. O guia mantém `16` secções `####`, `7` passos `### Passo`, caminhos públicos `apps/api` e `apps/web`, metadados canónicos e ausência de referências privadas no texto do aluno.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-11 | PARCIAL | OK | O campo de pergunta da UI passou a ter label acessível e a explicação/critério de aceite foram alinhados com a regra de qualidade frontend. | P2 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução corrigiu apenas documentação de planificação e o bloco de código ensinado no guia.

### Correções aplicadas sobre as findings abertas

#### F06 - Campo de pergunta da UI sem label acessível

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o bloco React do Passo 5 passou a incluir `<label ... htmlFor="room-ai-question">Pergunta para a IA da sala</label>`;
  - o `textarea` passou a incluir `id="room-ai-question"`;
  - a explicação do código passou a explicar que o label dá nome acessível ao campo;
  - a validação do passo e os critérios de aceite passaram a exigir label acessível no campo de pergunta.
- Evidência:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md` contém `htmlFor="room-ai-question"`;
  - o mesmo ficheiro contém `id="room-ai-question"`;
  - a estrutura do guia continua com `16` secções `####` e `7` passos `### Passo`.

### Decisões técnicas confirmadas

- Mantém-se o contrato técnico já validado para partilha read-only e fork privado.
- DERIVADO confirmado: usar label visível ligado por `htmlFor/id` em vez de apenas `aria-label`, porque o formulário já tem espaço visual para o nome do campo e fica mais pedagógico para alunos.

### Decisões de domínio confirmadas

- CANONICO: `RF16`, `RF42` e `RNF20` continuam a definir o domínio do BK.
- CANONICO: `BK-MF8-11` mantém owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `M`, sprint `S12`, dependência `BK-MF8-10` e próximo BK `BK-MF8-12`.

### Drift documental encontrado

- Mantém-se o drift fora do alvo em `BK-MF8-12`, que ainda contém frase histórica sobre o estado antigo do `BK-MF8-11`.
- Estado: `BLOQUEADO_POR_SCOPE`, porque esta execução tem `BK_IDS=[BK-MF8-11]` e `STRICT_SCOPE=true`.

### Riscos restantes

- Não foram aplicadas alterações a código de produto em `apps/api` ou `apps/web`; o guia ensina a implementação que o aluno deve aplicar.
- O drift textual em `BK-MF8-12` deve ser corrigido numa execução própria ou numa ronda de coerência MF8.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 mantém a base de fontes autorizadas, separação de perfis e limites da IA.
- `BK-MF8-10` entrega histórico privado da IA da sala.
- `BK-MF8-11` fica novamente consistente como guia de partilha read-only e fork privado, agora também com acessibilidade básica no formulário.
- `BK-MF8-12` pode continuar para mini-testes oficiais, sem reutilizar permissões da partilha IA.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- BK alvo: sem TODOs restantes após a correção de acessibilidade.
- Fora do alvo: permanece a frase histórica em `BK-MF8-12`, a corrigir numa execução própria ou numa ronda de coerência MF8.

## Execução 2026-07-02 - reauditoria pós-correção focada BK-MF8-11

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-11]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala`, sem confiar no estado `OK` deixado pela correção anterior.

Resultado da reauditoria: `PARCIAL`. As lacunas críticas anteriores de backend, persistência, controller, cliente API, UI funcional e testes estão fechadas no guia atual. O BK tem `16` secções `####`, `7` passos `### Passo`, usa caminhos públicos `apps/api` e `apps/web`, não contém `real_dev` no texto do aluno, preserva metadados canónicos e mantém a sequência `BK-MF8-10 -> BK-MF8-11 -> BK-MF8-12`.

O único bloqueio encontrado no BK alvo é de qualidade frontend/acessibilidade: o código React do Passo 5 apresenta um `<textarea>` sem `label`, `htmlFor`, `id` ou `aria-label`. Como a prompt ativa exige acessibilidade básica quando há frontend, o BK não deve ser marcado como `OK` até essa lacuna ser corrigida.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Documentos e evidência consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-11]`, `MODO=auditar_apenas`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`.
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF7/*.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/api/src/modules/study-rooms/*`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/api/src/modules/study-rooms/*`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `mockup/` como referência visual/de fluxo, sem uso como contrato técnico.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria pós-correção | 1 | 0 | 0 |
| Depois da reauditoria pós-correção | 0 | 1 | 0 |

Nota: o estado "antes" reflete a classificação deixada pela correção focada anterior. O estado "depois" reflete esta reauditoria fresca.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-11 | PARCIAL | O guia já entrega as peças técnicas críticas da partilha read-only e do fork privado, mas o bloco React do Passo 5 falha acessibilidade básica por apresentar o campo de pergunta sem label acessível. | P2 |

### Findings encontrados

#### F06 - Campo de pergunta da UI sem label acessível

- Estado: `PARCIAL`
- Evidência:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md:1037` contém `<textarea`.
  - `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md:1037-1041` mostra `rows`, `value` e `onChange`, mas não mostra `id`, `aria-label` nem ligação a `<label htmlFor=...>`.
  - Pesquisa focada por `<textarea|aria-label|<label|htmlFor|id="room-ai-question"` no BK alvo devolveu apenas a linha do `<textarea>`.
- O que falta completar:
  - adicionar um label visível, por exemplo `Pergunta para a IA da sala`;
  - ligar o label ao campo com `htmlFor="room-ai-question"` e `id="room-ai-question"`, ou usar `aria-label` se a decisão visual exigir label não visível;
  - manter a mensagem de erro compreensível junto ao formulário.
- Risco pedagógico: o aluno recebe uma UI funcional mas não aprende a cumprir acessibilidade básica em formulários React.
- Risco técnico: leitores de ecrã não têm nome acessível claro para o campo de pergunta.
- Risco de segurança/privacidade/legal: baixo; não altera autorização, sessão, membership nem exposição de dados.
- Dependências a reler: Passo 5 do próprio BK e regra de qualidade frontend da prompt ativa.
- Prioridade de correção: P2.

### Findings anteriores reavaliados

- F01 backend sem service/controller executáveis: `JA_CORRIGIDO`. O guia atual inclui `RoomAiSharingService`, `GET ?scope=shared`, `POST :answerId/share`, controller e módulo.
- F02 frontend e cliente API genéricos: `PARCIAL`. O cliente API e a página React estão concretos, mas a acessibilidade do `textarea` ainda precisa de correção.
- F03 testes pedidos não entregues como suite real: `JA_CORRIGIDO`. O guia atual inclui `room-ai-sharing.service.spec.ts` com casos positivos e negativos.
- F04 persistência/modelo do fork e da partilha indefinidos: `JA_CORRIGIDO`. O guia atual define `visibility`, `sharedAt` e `forkedFromInteractionId`.
- F05 linguagem histórica interna no texto do aluno: `JA_CORRIGIDO` no BK alvo. A frase histórica ainda aparece em `BK-MF8-12`, mas esse ficheiro está fora de `BK_IDS` nesta execução.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar/rever:
  - CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
  - EDITAR: `apps/web/src/lib/apiClient.ts`
  - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
- Exports produzidos pelo guia:
  - `RoomAiShareMode`
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
  - `RoomAiAnswerReuseView`
  - `RoomAiShareResult`
  - `RoomAiSharingService`
  - `listSharedRoomAiAnswers(...)`
  - `shareRoomAiAnswer(...)`
  - `RoomAiPage`
- Imports consumidos de BKs anteriores:
  - `RoomAiService.listMyRoomAiHistory(...)`, entregue por `BK-MF8-10`;
  - `RoomAiInteraction`, `StudyRoomsService.ensureMember(...)`, `SessionGuard`, `AuthenticatedRequest`;
  - `requestJson(...)`, `askRoomAi(...)` e `RoomAiAnswer` no cliente frontend.
- Endpoints criados:
  - `GET /api/study-rooms/:roomId/ai/answers?scope=shared`
  - `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`
- DTOs/validators criados:
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
- Schemas/modelos alterados:
  - `RoomAiInteraction` recebe `visibility`, `sharedAt`, `forkedFromInteractionId`.
- Services criados:
  - `RoomAiSharingService`
- Componentes/páginas frontend editados:
  - `RoomAiPage`
- Providers de IA criados ou usados:
  - nenhum provider novo; partilha e fork reutilizam resposta persistida.
- Regras de segurança/autorização aplicadas:
  - sessão por `SessionGuard`;
  - membership antes de leitura;
  - ownership para `READ_ONLY`;
  - `studentId` do fork vem da sessão;
  - frontend não envia ownership, membership, role nem `studentId`.
- Testes criados:
  - `room-ai-sharing.service.spec.ts`
- BKs seguintes que dependem destes elementos:
  - `BK-MF8-12` apenas como continuidade da MF; os mini-testes não devem reutilizar permissões da partilha IA.

### Decisões técnicas confirmadas

- Reutilizar `RoomAiInteraction` para resposta privada, resposta partilhada e fork privado.
- Guardar `visibility: "PRIVATE" | "SHARED"`.
- Guardar `sharedAt` quando a resposta passa a estar partilhada.
- Guardar `forkedFromInteractionId` para rastrear a origem da cópia privada.
- Criar fork privado sem chamar provider de IA.
- Usar `GET ?scope=shared` para listagem read-only.
- Manter `GET ?scope=mine` como contrato do `BK-MF8-10`.

### Decisões de domínio confirmadas

- CANONICO: `RF16` cobre IA partilhada da sala.
- CANONICO: `RF42` cobre chat, partilha e notas coletivas.
- CANONICO: `RNF20` impede mistura de dados de turmas ou alunos.
- CANONICO: `BK-MF8-11` pertence à `MF8`, sprint `S12`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `M`, dependência `BK-MF8-10` e próximo BK `BK-MF8-12`.

### Decisões marcadas como DERIVADO

- `READ_ONLY` marca a resposta original como `SHARED`.
- `PRIVATE_FORK` cria nova interação privada com o aluno autenticado.
- `GET ?scope=shared` lista apenas respostas `SHARED` da sala.
- A resposta partilhada é read-only para outros membros.

### Drift documental encontrado

- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md:52` ainda diz que `BK-MF8-11` "surge no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo".
- Estado: `BLOQUEADO_POR_SCOPE` nesta execução, porque `BK_IDS=[BK-MF8-11]` e `MODO=auditar_apenas`.
- Impacto: não quebra o BK alvo, mas deve ser limpo numa correção própria do `BK-MF8-12` ou numa ronda de coerência MF8.

### Riscos restantes

- O `BK-MF8-11` fica `PARCIAL` até o campo de pergunta da UI ter label acessível.
- O validador documental não deteta esta falha de acessibilidade; requer revisão manual.
- O código ensinado no guia não foi aplicado ao produto nesta execução, por configuração de modo.
- Não existe pasta `docs/planificacao/guias-bk/MF9`; a coerência com fase seguinte foi verificada pela continuidade interna `BK-MF8-12`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 fecha fontes autorizadas, separação de perfis e limites da IA.
- `BK-MF8-10` entrega o histórico privado `GET /api/study-rooms/:roomId/ai/answers?scope=mine`.
- `BK-MF8-11` constrói sobre esse histórico para partilha read-only e fork privado.
- `BK-MF8-12` deve avançar para mini-testes oficiais por aluno sem usar a partilha IA como fonte de permissões.
- Não há MF9 documentada nesta árvore de guias; não foi possível validar handoff para uma macrofase posterior.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

### Bloqueios ou TODOs restantes

- TODO: corrigir o Passo 5 do `BK-MF8-11` para adicionar label acessível ao `<textarea>`.
- TODO fora do alvo: limpar a frase histórica em `BK-MF8-12`.

## Execução 2026-07-02 - correção focada BK-MF8-11

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-11]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala`, usando como base a reauditoria imediatamente anterior, que classificava o BK como `CRITICO`.

Resultado da correção: `OK`. O guia alvo passou a entregar um tutorial técnico linear com persistência, DTO, service, controller, módulo, cliente API, página React, suite unitária e validação final. A correção manteve os metadados canónicos, preservou os caminhos públicos `apps/api` e `apps/web`, não alterou código de produto e não tocou nos restantes BKs da MF8.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

Nota: o estado "antes" é o resultado da reauditoria focada ao `BK-MF8-11` nesta mesma data, não a classificação global anterior da MF8.

### Resultado por BK analisado

| BK | Estado antes | Estado depois | Justificação | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF8-11 | CRITICO | OK | O guia passou a definir o modelo persistido da partilha/fork, o DTO, o service, as rotas HTTP, a integração frontend e a suite real de testes. | P1 |

### Ficheiros editados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`

### Ficheiros de produto editados nesta execução

Nenhum. Esta execução corrigiu apenas documentação de planificação, conforme `MODO=corrigir_apenas` e `STRICT_SCOPE=true`.

### Correções aplicadas sobre as findings abertas

#### F01 - Contrato backend fica sem service nem controller executáveis

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o guia passou a criar `RoomAiSharingService`;
  - o guia passou a ensinar `GET /api/study-rooms/:roomId/ai/answers?scope=shared`;
  - o guia passou a ensinar `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`;
  - o controller passou a integrar `RoomAiService` e `RoomAiSharingService`;
  - `StudyRoomsModule` passou a registar `RoomAiSharingService`.
- Evidência documental: Passos 3 e 4 do BK corrigido.

#### F02 - Frontend e cliente API ficam genéricos

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o guia passou a definir `RoomAiShareMode`, `RoomAiSharedAnswer` e `RoomAiShareResult`;
  - o guia passou a criar `listSharedRoomAiAnswers(...)` e `shareRoomAiAnswer(...)`;
  - o guia passou a substituir `RoomAiPage.tsx` por uma versão com estados de loading, erro, vazio, sucesso, partilha read-only e fork privado.
- Evidência documental: Passo 5 do BK corrigido.

#### F03 - Testes pedidos não são entregues como suite real

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o guia passou a criar `room-ai-sharing.service.spec.ts`;
  - a suite cobre partilha de resposta própria, bloqueio de resposta de outro aluno, aluno fora da sala, fork privado e rejeição de fork de resposta não partilhada;
  - a suite prova que a leitura da resposta não acontece quando `ensureMember(...)` falha.
- Evidência documental: Passo 6 do BK corrigido.

#### F04 - Persistência/modelo do fork e da partilha não está definida

- Estado anterior: `CRITICO`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - o guia passou a reutilizar `RoomAiInteraction`;
  - o schema passou a incluir `visibility`, `sharedAt` e `forkedFromInteractionId`;
  - `READ_ONLY` marca a resposta original como `SHARED`;
  - `PRIVATE_FORK` cria nova interação privada ligada à resposta partilhada original.
- Evidência documental: Passos 2 e 3 do BK corrigido.

#### F05 - Linguagem histórica interna permanece no texto do aluno

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada:
  - a secção `Estado antes e depois` passou a descrever o estado incremental da aplicação;
  - o changelog passou a refletir a correção real do guia;
  - o BK corrigido já não inclui a linguagem histórica de auditoria no texto do aluno.
- Evidência documental: secções `Estado antes e depois` e `Changelog` do BK corrigido.

### Decisões técnicas e de domínio

- CANONICO: manter `RF16, RF42, RNF20`, owner `Natalia`, apoio `Guilherme`, sprint `S12`, dependência `BK-MF8-10` e próximo BK `BK-MF8-12`.
- DERIVADO: reutilizar `RoomAiInteraction` em vez de criar entidade paralela.
- DERIVADO: usar `visibility: "PRIVATE" | "SHARED"` para distinguir histórico privado de respostas partilhadas.
- DERIVADO: usar `forkedFromInteractionId` para preservar rastreabilidade do fork privado.
- DERIVADO: `PRIVATE_FORK` não chama provider de IA; cria cópia persistida a partir da resposta já partilhada.
- DERIVADO: `GET ?scope=shared` lista apenas respostas `SHARED` para membros da sala.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 fecha limites pedagógicos, fontes autorizadas e separação de perfis.
- `BK-MF8-10` entrega histórico privado por aluno para respostas IA da sala.
- `BK-MF8-11` acrescenta partilha controlada e fork privado sem quebrar o histórico privado.
- `BK-MF8-12` pode avançar para mini-testes oficiais por aluno sem depender de permissões frontend nem de dados privados de outro aluno.

### Riscos remanescentes

- O guia ensina alterações que só serão validadas contra o produto quando o aluno aplicar os passos em `apps/api` e `apps/web`.
- Se o branch do aluno não tiver o método `RoomAiService.listMyRoomAiHistory(...)` do `BK-MF8-10`, deve concluir esse BK antes de aplicar o controller deste BK.
- Como esta execução é documental, não foram executados testes de produto sobre os ficheiros ensinados no guia.

### Validações executadas

- `rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF8/*.md`
  - Resultado: sem ocorrências.
- `git diff --check`
  - Resultado: sem erros.
- `bash scripts/validate-planificacao.sh`
  - Resultado: `overall_pass=true`, `score_ge_97=true`, `drift_critical_zero=true`, score `100`.

## Execução 2026-07-02 - reauditoria focada BK-MF8-11

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-11]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala`, sem assumir como atual a classificação histórica `OK` da hidratação global.

Resultado da reauditoria: `CRITICO`. O guia alvo preserva os metadados canónicos, usa caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, não contém caminhos `real_dev` no texto do aluno e mantém a sequência `BK-MF8-10 -> BK-MF8-11 -> BK-MF8-12`. Contudo, ainda não é implementável por um aluno sem adivinhar peças técnicas essenciais: promete partilha read-only, fork privado, endpoint HTTP, service, controller, cliente/frontend e testes, mas só apresenta código completo para um DTO/validator simples e para um ficheiro didático de expected results.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Documentos e evidência consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-11]`, `MODO=auditar_apenas`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`.
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Varrimento dos guias `docs/planificacao/guias-bk/MF8/*.md`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/room-shares.service.ts`
- `real_dev/api/src/modules/study-rooms/room-shares.controller.ts`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/study-rooms.module.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 0 | 1 |

Nota: o estado "antes" reflete a classificação herdada da hidratação global da MF8, que tratava o `BK-MF8-11` como `OK`. Esta execução reavalia apenas o BK alvo com a prompt ativa e não altera os restantes BKs da MF8.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-11 | CRITICO | O guia tem estrutura formal, mas não fornece código completo para o service/controller de partilha, cliente API, UI de partilha/fork e suite real de testes. Para um fluxo de privacidade e membership, isto obriga o aluno a inventar peças críticas. | P1 |

### Findings encontrados

#### F01 - Contrato backend fica sem service nem controller executáveis

- Estado: `CRITICO`
- Evidência:
  - O guia declara o endpoint `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` e os ficheiros `room-ai-sharing.service.ts` e `room-ai.controller.ts`.
  - O Passo 3 só inclui código completo para `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`.
  - O Passo 4 diz `Sem código neste passo`, apesar de ser o passo que deveria ligar controller, service, sessão, `roomId`, `answerId`, membership e persistência.
  - A pesquisa em `real_dev/api/src/modules/study-rooms` não encontrou `room-ai-sharing`, `share-room-ai-answer`, `PRIVATE_FORK`, `READ_ONLY` nem rota `answers/:answerId/share` que pudesse ser tratada como contrato já fechado.
- O que falta completar:
  - `RoomAiSharingService` completo, com validação de `roomId` e `answerId`, `ensureMember(...)`, confirmação de autor quando a operação exige ownership, criação de cópia privada para `PRIVATE_FORK` e resposta pública sem dados sensíveis.
  - método no `RoomAiController` com `@Post(":answerId/share")`, `SessionGuard`, DTO e delegação para o service.
  - integração no módulo se for criado provider/service novo.
- Risco pedagógico: o aluno sabe o nome do ficheiro, mas não sabe que código escrever nem como ligar as peças.
- Risco técnico: o endpoint pode ficar sem compilação, duplicar responsabilidades ou quebrar a fronteira entre histórico privado e partilha.
- Risco de segurança/privacidade: partilha e fork de respostas IA da sala dependem de sessão, membership e ownership no backend; deixar isto por inferência é crítico.
- Dependências a reler: `BK-MF8-10`, `RoomAiInteraction`, `StudyRoomsService.ensureMember(...)`, `RoomAiService.askRoomAi(...)`, matriz e contrato de campos.
- Prioridade de correção: P1.

#### F02 - Frontend e cliente API ficam genéricos

- Estado: `CRITICO`
- Evidência:
  - O scope-in promete botões `Partilhar read-only` e `Guardar cópia privada`.
  - O Passo 5 manda criar cliente API tipado e cobrir loading/vazio/erro/sucesso, mas volta a dizer `Sem código neste passo` porque "a integração varia consoante a página real".
  - A referência privada atual tem `askRoomAi(...)` e `RoomAiPage`, mas não tem cliente ou UI de partilha/fork para este contrato.
- O que falta completar:
  - tipo público de resposta da operação de partilha/fork;
  - função cliente, por exemplo `shareRoomAiAnswer(...)`, a usar o helper com `credentials: "include"`;
  - integração concreta em `RoomAiPage.tsx`, com botões, estados, mensagens PT-PT e erro controlado;
  - confirmação de que o frontend não envia `studentId`, ownership, membership ou role.
- Risco pedagógico: o aluno teria de desenhar a API client e os estados React sem exemplo.
- Risco técnico: a UI pode chamar endpoint inexistente ou tomar decisões de acesso localmente.
- Risco de segurança/privacidade: erro ou estado mal desenhado pode expor resposta privada ou permitir fork de resposta indevida.
- Dependências a reler: `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/student/RoomAiPage.tsx`, `BK-MF8-10`.
- Prioridade de correção: P1.

#### F03 - Testes pedidos não são entregues como suite real

- Estado: `CRITICO`
- Evidência:
  - O guia lista `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`.
  - O Passo 6 promete resposta de outro aluno, aluno fora da sala e fork preserva original.
  - O código apresentado no Passo 6 é apenas `apps/api/src/modules/mf8/bk-mf8-11.expected-results.ts`, sem `describe(...)`, fixtures, mocks, asserts ou chamada real ao service.
- O que falta completar:
  - suite `.spec.ts` real para caminho feliz, aluno fora da sala, aluno tenta partilhar resposta que não é sua, fork de resposta não partilhada/quando aplicável e preservação do original;
  - asserts de erro público, ausência de provider externo e ausência de mutação indevida no documento original.
- Risco pedagógico: o aluno pode confundir expected results documentais com testes automatizados.
- Risco técnico: a defesa fica sem prova objetiva do contrato mais sensível do BK.
- Risco de segurança/privacidade: negativos de acesso cruzado ficam declarados, mas não comprovados.
- Dependências a reler: `room-ai.service.spec.ts`, `room-shares.service.spec.ts`, `RoomAiInteraction`.
- Prioridade de correção: P1.

#### F04 - Persistência/modelo do fork e da partilha não está definida

- Estado: `CRITICO`
- Evidência:
  - A arquitetura diz que a partilha read-only não permite editar o original e que o fork cria nova cópia privada.
  - O guia não define campos, modelo, reutilização de `RoomAiInteraction`, flags de visibilidade, `forkedFromInteractionId`, `sharedAt`, nem outro contrato de persistência equivalente.
  - O schema real `RoomAiInteraction` atual guarda `roomId`, `studentId`, `question`, `answer` e `sourceShareIds`, mas não tem campos de partilha/fork.
- O que falta completar:
  - decisão explícita e codificada sobre reutilizar `RoomAiInteraction` com campos novos ou criar entidade própria;
  - migração/alteração de schema correspondente;
  - mapeamento público que não exponha dados privados além do necessário;
  - regra de que fork privado pertence ao aluno autenticado e não altera o original.
- Risco pedagógico: o aluno não sabe onde gravar a cópia privada nem como representar read-only.
- Risco técnico: seguir o guia pode produzir service sem persistência real ou duplicar dados sem rastreabilidade.
- Risco de segurança/privacidade: a ausência de modelo claro aumenta o risco de mistura entre resposta privada, resposta partilhada e cópia privada.
- Dependências a reler: `RoomAiInteraction`, `BK-MF8-10`, `BK-MF1-04`, `BK-MF6-10`.
- Prioridade de correção: P1.

#### F05 - Linguagem histórica interna permanece no texto do aluno

- Estado: `PARCIAL`
- Evidência:
  - A secção `Estado antes e depois` diz que o requisito "ainda surge no guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo".
  - O changelog afirma que o guia foi reescrito com "código integrado", mas a auditoria atual mostra que a integração crítica não está realmente presente.
- O que falta completar:
  - trocar a frase histórica por uma descrição incremental da aplicação antes deste BK;
  - alinhar changelog e estado com a realidade do guia após correção.
- Risco pedagógico: o aluno lê contexto de auditoria/documentação em vez de contexto de implementação.
- Risco técnico: o changelog pode induzir o professor/equipa a pensar que o guia já está executável.
- Risco de segurança/privacidade: indireto; o risco principal fica coberto por F01-F04.
- Dependências a reler: próprio BK e relatório histórico.
- Prioridade de correção: P2.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar/rever:
  - CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
  - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
- Exports ensinados pelo guia:
  - `RoomAiShareMode`
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
  - `bkMf811ExpectedResults`
  - `getBkMf811ExpectedResult(...)`
- Exports prometidos mas não ensinados com código completo:
  - service de partilha/fork;
  - método de controller;
  - cliente API frontend;
  - componente/estado de UI;
  - suite real de testes.
- Imports consumidos de BKs anteriores:
  - `SessionGuard`
  - `AuthenticatedRequest` / `AuthenticatedUser`
  - `RoomAiInteraction`
  - `StudyRoomsService.ensureMember(...)`
  - contratos de histórico privado entregues por `BK-MF8-10`.
- Endpoint declarado:
  - `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`
- DTOs/validators criados no guia:
  - `ShareRoomAiAnswerDto`
  - `parseRoomAiShareMode(...)`
- Schemas/modelos criados: nenhum; isto é uma lacuna para o fork/partilha.
- Services criados: declarado, mas sem código completo.
- Componentes/páginas frontend editados: declarado, mas sem código completo.
- Providers de IA criados ou usados: nenhum provider novo; a operação deve reutilizar resposta persistida e não chamar IA.
- Regras de segurança/autorização exigidas:
  - sessão real via guard;
  - validação de `roomId` e `answerId`;
  - membership da sala antes de leitura;
  - ownership da resposta quando o aluno tenta partilhar a própria resposta;
  - fork privado com `studentId` vindo da sessão;
  - ausência de `studentId` enviado pelo frontend.
- Testes criados no tutorial:
  - não há suite real criada; apenas expected results documentais.
- BKs seguintes que dependem do contrato:
  - `BK-MF8-12` não depende funcionalmente do fork, mas a sequência da MF8 assume que o BK anterior ficou fechado.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos corretos para guias de aluno.
- `real_dev` foi usado apenas como referência privada de comparação e não aparece no BK alvo.
- `RoomAiInteraction` é o contrato real existente para respostas da IA da sala até esta execução; não existe ainda, na referência lida, implementação pronta de partilha/fork.
- A operação de partilha/fork não deve chamar provider de IA; deve operar sobre resposta persistida e autorizada.
- O controller deve ficar fino e delegar autorização/persistência para service.

### Decisões de domínio confirmadas

- `BK-MF8-11` consome `RF16`, `RF42` e `RNF20`.
- A matriz, o backlog, o contrato de campos e os anexos confirmam: owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforço `M`, dependência `BK-MF8-10`, sprint `S12`, core e próximo BK `BK-MF8-12`.
- Partilha read-only e fork privado são decisões `DERIVADO` aceitáveis para cumprir colaboração sem contaminar contexto pessoal.
- O aluno autenticado nunca deve escolher `studentId` no frontend.
- Respostas da IA da sala não podem atravessar salas nem alunos sem validação backend de membership e ownership.

### Decisões marcadas como DERIVADO

- Representar `READ_ONLY` e `PRIVATE_FORK` como modos explícitos é aceitável, mas precisa de service, persistência e testes para ser implementável.
- O endpoint único `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` pode ser aceitável para os dois modos, desde que o body e a resposta fiquem tipados e testados.
- Fork privado deve criar uma nova cópia pertencente ao aluno autenticado e preservar o original.

### Drift documental encontrado

- Drift entre a classificação histórica `OK` da hidratação global e a evidência atual de executabilidade: o guia tem forma, mas não tem código completo nas peças críticas.
- Drift entre o changelog do BK, que afirma "código integrado", e o conteúdo real, que deixa backend/frontend/testes como instruções genéricas.
- Drift entre o inventário de ficheiros, que promete `room-ai-sharing.service.ts` e `room-ai-sharing.service.spec.ts`, e os blocos de código, que não entregam esses ficheiros.

### Riscos restantes

- Risco pedagógico alto: um aluno do 12.o ano teria de inventar a implementação de service, controller, cliente API, UI e testes.
- Risco técnico alto: pode surgir endpoint sem persistência coerente, imports inexistentes, duplicação de modelo ou frontend a chamar contrato incompleto.
- Risco de segurança/privacidade alto: membership, ownership e separação entre resposta privada, resposta partilhada e fork privado são precisamente o centro do BK.
- Risco de sequência: `BK-MF8-12` pode avançar documentalmente, mas a cadeia MF8 fica com uma peça anterior em aberto.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF1-04`, `BK-MF3-06`, `BK-MF6-10` e `BK-MF7-09`/`BK-MF7-10`/`BK-MF7-11` fornecem bases de IA da sala, chat/partilha, isolamento de dados e perfis/contextos distintos.
- MF alvo: `BK-MF8-10` entrega o histórico privado que o `BK-MF8-11` deve consumir. A auditoria atual confirma que o `BK-MF8-11` ainda não transforma esse histórico num contrato executável de read-only/fork.
- MF seguinte direta na sequência: `BK-MF8-12` pode continuar como mini-testes oficiais, mas não deve usar o estado do `BK-MF8-11` como prova de fecho de colaboração IA da sala enquanto este estiver `CRITICO`.

### Validações executadas

- `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md` -> `16`
- `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md` -> `7`
- `rg -c '^```' docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md` -> `4`, correspondendo a 2 blocos de código reais.
- Pesquisa textual de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- Pesquisa textual de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- Pesquisa específica por `room-ai-sharing`, `share-room-ai-answer`, `answers/.*/share`, `PRIVATE_FORK`, `READ_ONLY` em `real_dev/api/src/modules/study-rooms`, `real_dev/web/src/lib/apiClient.ts` e `real_dev/web/src/pages/student/RoomAiPage.tsx` -> sem implementação real encontrada na referência privada.
- Pesquisa de padrões sensíveis em BK alvo e referência `real_dev` -> falsos positivos aceitáveis: `TODO` no header de estado do BK, proibições de scope-out sobre `RAG`/`embeddings`/`OCR`, comentários de segurança sobre cookies HttpOnly/localStorage no helper `requestJson(...)`, e mocks legítimos em suites `.spec.ts`.
- `git diff --check` -> sem erros.
- `bash scripts/validate-planificacao.sh` -> `overall_pass: true`, `score.total: 100`, `counts.matriz_bk: 107`, `counts.backlog_bk: 107`, `counts.guide_bk: 107`, `drift_critical_count: 0`.

### Decisão final

`BK-MF8-11` fica reclassificado como `CRITICO` para a prompt ativa. Não há `TODO (BLOCKER)` por falta de documento canónico; o bloqueio é de completude do próprio guia. A próxima ação recomendada é executar `MODO=corrigir_apenas` ou `MODO=hidratar_corrigir` para reescrever o BK alvo com service, controller, modelo/persistência, cliente frontend, UI e suite real de testes.

## Execução 2026-07-02 - reauditoria focada BK-MF8-10 após correção

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-10]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-10 - Histórico privado dos chats IA da sala`, depois da correção focada registada nesta mesma data.

Resultado da reauditoria: `OK`. O guia alvo está implementável como tutorial de aluno: mantém metadados canónicos, usa apenas caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, todos os passos preservam os pontos 1 a 7, inclui código completo para helper, service, controller, cliente API, componente React e suite Jest, e fecha o handoff para `BK-MF8-11` com contrato concreto.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado nesta execução. A única alteração desta execução é este bloco de relatório.

### Documentos e evidência consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-10]`, `MODO=auditar_apenas`, `OUTPUT_MODE=relatorio_e_resumo`, `RUN_COMMANDS=true`, `STRICT_SCOPE=true`, `CHECK_MF_COHERENCE=true`.
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
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `apps/api/src/modules/study-rooms/room-ai.service.ts`
- `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 1 | 0 | 0 |

Nota: o estado "antes" reflete a correção focada imediatamente anterior, que marcou `BK-MF8-10` como `OK`. Esta reauditoria voltou a verificar o guia alvo a partir da prompt ativa.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-10 | OK | O guia entrega tutorial linear completo para histórico privado da IA da sala, com endpoint `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, `RoomAiService.listMyRoomAiHistory(...)`, `RoomAiController.@Get()`, cliente `listMyRoomAiHistory(...)`, `RoomAiPage` com estados completos, suite `room-ai-history.spec.ts`, validação final e handoff para `BK-MF8-11`. | P1 |

### Findings reavaliadas

- `F01 - Endpoint e integração backend ficam sem código completo`: `JA_CORRIGIDO`. O guia atual inclui código completo para `RoomAiService.listMyRoomAiHistory(...)`, validação de `roomId`, `ensureMember(...)`, query por `roomId` e `studentId`, limite, ordenação e resposta tipada.
- `F02 - Ficheiro novo room-ai-history.ts aparece no código, mas não no inventário principal`: `JA_CORRIGIDO`. O inventário principal declara `CRIAR: apps/api/src/modules/study-rooms/room-ai-history.ts`.
- `F03 - Frontend privado e cliente API ficam genéricos`: `JA_CORRIGIDO`. O guia atual inclui `RoomAiHistoryItem`, `listMyRoomAiHistory(...)` e `RoomAiPage` com loading, vazio, erro e sucesso.
- `F04 - Testes pedidos não são entregues como suite real`: `JA_CORRIGIDO`. O guia atual inclui `apps/api/src/modules/study-rooms/room-ai-history.spec.ts` com testes para não membro, sala inválida, sala diferente, aluno diferente e ausência de chamada ao provider.
- `F05 - Handoff para BK-MF8-11 assume contrato que o BK-MF8-10 ainda não ensina de forma executável`: `JA_CORRIGIDO`. O handoff atual declara o endpoint privado e a fronteira entre resposta própria, resposta partilhada read-only e fork privado.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda criar/editar/rever:
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`
  - EDITAR: `apps/web/src/lib/apiClient.ts`
  - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
  - REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- Exports ensinados pelo guia:
  - `RoomAiHistoryItem`
  - `toPrivateRoomAiHistory(...)`
  - `RoomAiService.listMyRoomAiHistory(...)`
  - `RoomAiController.listMine(...)`
  - `listMyRoomAiHistory(...)`
- Imports consumidos de BKs anteriores:
  - `AuthenticatedUser`
  - `RoomAiInteractionDocument`
  - `RoomAiInteraction`
  - `AskRoomAiDto`
  - `SessionGuard`
  - `RoomAiService.askRoomAi(...)`
  - `requestJson(...)`
  - `askRoomAi(...)`
- Endpoint criado no tutorial:
  - `GET /api/study-rooms/:roomId/ai/answers?scope=mine`
- DTOs/validators criados: nenhum novo, porque o endpoint não recebe body.
- Schema/modelo criado: nenhum novo; reutiliza `RoomAiInteraction`.
- Service editado: `RoomAiService`, acrescentando `listMyRoomAiHistory(...)`.
- Componentes/páginas frontend editados: `RoomAiPage`.
- Provider de IA criado ou usado: nenhum provider novo; o histórico lê dados persistidos e não chama IA.
- Regras de segurança/autorização aplicadas:
  - sessão real via `SessionGuard`;
  - `roomId` validado;
  - membership por `ensureMember(actor.id, roomId)`;
  - filtro por `studentId` vindo da sessão;
  - UI sem `studentId` no payload;
  - ausência de tokens ou credenciais em storage.
- Testes criados no tutorial:
  - `room-ai-history.spec.ts`.
- BKs seguintes que dependem do contrato:
  - `BK-MF8-11`.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos corretos para guias de aluno.
- `real_dev` foi usado apenas como referência privada de comparação e não aparece no BK alvo.
- `RoomAiInteraction` é o model correto a reutilizar para histórico privado; não há necessidade de novo schema.
- `scope=mine` é uma decisão `DERIVADO` aceitável para tornar a intenção do endpoint explícita sem aceitar `studentId` do frontend.
- O limite de `30` itens no histórico é uma decisão `DERIVADO` aceitável para manter a resposta previsível e adequada à UI.
- Excluir `sourceShareIds` da resposta pública do histórico é uma decisão `DERIVADO` aceitável para minimizar dados expostos.

### Decisões de domínio confirmadas

- `BK-MF8-10` consome `RF16`, `RF42`, `RNF20` e `RNF23`.
- O histórico da IA da sala deve ser privado por aluno até `BK-MF8-11` introduzir partilha read-only e fork privado.
- `studentId` vem da sessão autenticada no backend, não do body, query string ou estado React.
- `roomId` só permite leitura depois de membership validado no backend.
- Listar histórico privado não deve chamar o provider de IA.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF1-04`, `BK-MF6-10` e `BK-MF7-01` fornecem a base de IA da sala, isolamento de dados e logs estruturados que este guia consome.
- MF alvo: `BK-MF8-09` prepara textos de UI e entrega handoff para `BK-MF8-10`; `BK-MF8-10` entrega histórico privado implementável.
- MF seguinte direta na sequência: `BK-MF8-11` pode consumir o `_id` privado das interações para partilha controlada, sem transformar o histórico privado numa lista global da sala.
- Risco externo ao alvo: `BK-MF8-11` foi lido apenas para coerência de dependência, não reclassificado. A qualidade completa do BK seguinte deve ser auditada numa execução própria se for esse o alvo.

### Validações executadas

- `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md` -> `16`
- `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md` -> `7`
- `rg` dos pontos 1 a 7 nos passos do BK alvo -> todos os `7` passos apresentam a estrutura esperada.
- `rg` de blocos de código, JSDoc e comentários no BK alvo -> blocos principais contêm JSDoc e comentários didáticos nos pontos de segurança, query, persistência, UI e testes.
- `rg` de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- `rg` de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- `rg` em `real_dev` para `listMyRoomAiHistory`, `scope=mine`, `RoomAiHistory`, `room-ai-history`, `localStorage`, `sessionStorage`, `as any`, `payload: unknown` e `token` -> apenas uma ocorrência aceitável em comentário de segurança do helper `requestJson(...)`, indicando que cookies HttpOnly evitam guardar tokens em `localStorage`.
- `git diff --check` -> sem erros.
- `bash scripts/validate-planificacao.sh` -> `overall_pass: true`, `score.total: 100`, `drift_critical_count: 0`.

### Decisão final

`BK-MF8-10` fica revalidado como `OK` para a prompt ativa. Não há blockers nem TODOs restantes dentro do BK alvo. O relatório foi atualizado porque `OUTPUT_MODE=relatorio_e_resumo`.

## Execução 2026-07-02 - correção focada BK-MF8-10

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-10]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção documental focada no `BK-MF8-10 - Histórico privado dos chats IA da sala`, dando seguimento à reauditoria que tinha classificado o guia como `CRITICO`.

Resultado final após correção: `OK`. O guia mantém os metadados canónicos, preserva a sequência `BK-MF8-09 -> BK-MF8-10 -> BK-MF8-11`, mantém caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, não contém caminhos `real_dev` no texto do aluno e passa a ensinar de forma executável o endpoint privado, service, controller, cliente frontend, página React, testes e handoff para `BK-MF8-11`.

Não foram editados ficheiros de produto, mockups, documentos canónicos nem outros BKs nesta execução.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Depois da reauditoria focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-10 | OK | Guia corrigido com inventário completo de ficheiros, código integrado para `room-ai-history.ts`, `RoomAiService.listMyRoomAiHistory(...)`, `RoomAiController.@Get()`, `listMyRoomAiHistory(...)` no frontend, `RoomAiPage` com estados completos e suite `room-ai-history.spec.ts`. | P1 |

### Findings encerradas

- `F01 - Endpoint e integração backend ficam sem código completo`: `CORRIGIDO`. O guia passa a incluir service, controller, validação de `roomId`, `ensureMember(...)`, query por `roomId` e `studentId` da sessão, limite e resposta tipada.
- `F02 - Ficheiro novo room-ai-history.ts aparece no código, mas não no inventário principal`: `CORRIGIDO`. O ficheiro foi adicionado ao inventário principal e ao passo técnico correspondente.
- `F03 - Frontend privado e cliente API ficam genéricos`: `CORRIGIDO`. O guia passa a incluir tipo `RoomAiHistoryItem`, função `listMyRoomAiHistory(...)` e `RoomAiPage` com loading, vazio, erro e sucesso.
- `F04 - Testes pedidos não são entregues como suite real`: `CORRIGIDO`. O guia passa a ensinar `room-ai-history.spec.ts` com casos de não membro, sala inválida, aluno diferente, sala diferente e ausência de chamada ao provider.
- `F05 - Handoff para BK-MF8-11 assume contrato que o BK-MF8-10 ainda não ensina de forma executável`: `CORRIGIDO`. O handoff agora declara o contrato privado concreto que o BK seguinte pode consumir.

### Mapa de integração da MF

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Contrato backend ensinado pelo guia:
  - `GET /api/study-rooms/:roomId/ai/answers?scope=mine`
  - `RoomAiService.listMyRoomAiHistory(...)`
  - `RoomAiController.listMine(...)`
  - `toPrivateRoomAiHistory(...)`
- Contrato frontend ensinado pelo guia:
  - `RoomAiHistoryItem`
  - `listMyRoomAiHistory(...)`
  - `RoomAiPage` com histórico privado e estados completos.
- Testes ensinados pelo guia:
  - `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`

### Validações executadas

- `rg -c '^#### ' docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md` -> `16`
- `rg -c '^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md` -> `7`
- `rg` de termos proibidos no guia alvo -> sem ocorrências.
- `rg` de caminhos privados no guia alvo -> sem ocorrências.
- `rg` de termos proibidos em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- `rg` de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md` -> sem ocorrências.
- `git diff --check` -> sem erros.
- `bash scripts/validate-planificacao.sh` -> `overall_pass: true`, `score.total: 100`, `drift_critical_count: 0`.

### Decisão final

`BK-MF8-10` fica fechado como `OK` para a prompt ativa. O restante estado MF8 não foi reclassificado nesta execução porque o scope era estritamente focado no BK alvo.

## Execução 2026-07-02 - reauditoria focada BK-MF8-10

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-10]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-10 - Histórico privado dos chats IA da sala`, sem confiar na classificação histórica `OK` da hidratação global de 2026-06-30.

Resultado da reauditoria: `CRITICO`. O guia alvo preserva metadados canónicos, usa caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, tem `7` passos `### Passo`, não contém caminhos `real_dev` no texto do aluno e mantém a sequência `BK-MF8-09 -> BK-MF8-10 -> BK-MF8-11`. Contudo, ainda não é implementável por um aluno sem adivinhar peças técnicas essenciais: promete um endpoint `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, query privada por `roomId` e `studentId`, lista frontend privada e testes negativos, mas só apresenta código completo para um helper isolado e para um ficheiro didático de expected results.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado. A única alteração desta execução é este bloco de relatório.

### Documentos e evidência consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-10]`, `MODO=auditar_apenas`, `REFERENCE_ROOT=real_dev`, `STRICT_SCOPE=true`.
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
- Inventário dos `107` guias BK de MF0 a MF8.
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `apps/api/src/modules/study-rooms/room-ai.service.ts`
- `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `apps/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `apps/web/src/lib/apiClient.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/web/src/lib/apiClient.ts`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 0 | 1 |

Nota: o estado "antes" reflete a classificação histórica da hidratação global de 2026-06-30, que marcou `BK-MF8-10` como `OK`. Esta execução reavalia apenas o BK alvo com a prompt ativa e não altera os restantes BKs da MF8.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-10 | CRITICO | Estrutura formal e metadados estão alinhados, mas faltam código completo e instruções executáveis para o endpoint `GET`, service/controller, cliente/frontend e suite real de testes do histórico privado da IA da sala. | P1 |

### Findings da reauditoria

#### F01 - Endpoint e integração backend ficam sem código completo

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Evidência:
  - O objetivo declara que o BK implementa "um endpoint que devolve apenas as interações IA da sala criadas pelo aluno autenticado".
  - A arquitetura define `GET /api/study-rooms/:roomId/ai/answers?scope=mine`.
  - O Passo 4 volta a prometer esse contrato HTTP, mas a secção `Código completo, correto e integrado com a app final` diz `Sem código neste passo`.
  - A referência em `apps/api` e `real_dev/api` expõe apenas `POST /api/study-rooms/:roomId/ai/answers` para `askRoomAi(...)`; não existe `@Get`, `scope=mine` nem método de histórico privado no `RoomAiService`.
- Problema principal: o guia manda o aluno ligar um endpoint autenticado e sensível, mas não fornece controller, service, query Mongoose, tratamento de erro, contrato de resposta nem integração com `ensureMember(...)`.
- O que falta completar: código completo para o método de service, método `@Get` no controller, validação de `roomId`, query por `roomId` e `studentId` obtido da sessão, resposta tipada, erros `401/403/400` ou equivalentes e integração no módulo existente se necessário.
- Risco pedagógico: o aluno fica obrigado a inventar a peça mais importante do BK, numa zona de autorização e privacidade.
- Risco técnico: alto; pode nascer um endpoint que devolve histórico de outro aluno ou outra sala.
- Risco de segurança/privacidade: alto; o requisito toca prompts/respostas IA privadas e membership de sala.
- Dependências a reler: `BK-MF1-04`, `BK-MF6-10`, `BK-MF7-01`, `RoomAiService`, `RoomAiController`, `RoomAiInteraction`.
- Prioridade de correção: `P0`.

#### F02 - Ficheiro novo `room-ai-history.ts` aparece no código, mas não no inventário principal

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Evidência:
  - A secção `Ficheiros a criar/editar/rever` lista `room-ai.service.ts`, `room-ai.controller.ts`, `room-ai-history.spec.ts`, `RoomAiPage.tsx` e `room-ai-interaction.schema.ts`.
  - O Passo 3 apresenta código completo com comentário de ficheiro `apps/api/src/modules/study-rooms/room-ai-history.ts`.
  - O inventário principal não declara `CRIAR: apps/api/src/modules/study-rooms/room-ai-history.ts`.
- Problema principal: o aluno recebe uma lista de ficheiros incompleta e pode não criar o helper que o próprio passo introduz.
- O que falta completar: alinhar a lista principal e os passos com `CRIAR: apps/api/src/modules/study-rooms/room-ai-history.ts`, ou mover a lógica para o service se o helper não for uma unidade real do projeto.
- Risco pedagógico: médio; a lista de ficheiros deixa de ser fonte de verdade.
- Risco técnico: médio; imports posteriores podem apontar para ficheiro não criado.
- Risco de segurança/privacidade: indireto, porque a função filtra dados privados por aluno/sala.
- Dependências a reler: secção `Ficheiros a criar/editar/rever`, Passo 3, Passo 4.
- Prioridade de correção: `P1`.

#### F03 - Frontend privado e cliente API ficam genéricos

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Evidência:
  - O scope-in exige "lista privada com vazio, loading, erro e sucesso".
  - O Passo 5 manda criar cliente API tipado, usar `credentials: "include"` e cobrir estados de UI.
  - A secção de código do Passo 5 diz `Sem código neste passo` porque "a integração varia consoante a página real".
  - A referência em `apps/web` e `real_dev/web` tem `RoomAiPage` com `askRoomAi(...)` para pergunta/resposta, mas sem chamada ao histórico privado.
- Problema principal: o guia não ensina a função cliente para `scope=mine`, o tipo de resposta, o estado React do histórico, nem como evitar exposição de prompts/respostas privadas de outros alunos.
- O que falta completar: código completo para cliente frontend tipado, integração em `RoomAiPage.tsx`, estados loading/vazio/erro/sucesso, mensagens PT-PT, `credentials: "include"` via helper existente e ausência de tokens/dados sensíveis em storage.
- Risco pedagógico: alto; o aluno não consegue implementar a parte visível do requisito sem desenhar a UI e o contrato sozinho.
- Risco técnico: alto; frontend e backend podem ficar desalinhados em URL, payload ou shape da resposta.
- Risco de segurança/privacidade: alto; a UI pode mostrar dados de outra sala ou guardar conteúdo sensível indevidamente se a fronteira não for ensinada.
- Dependências a reler: `RoomAiPage.tsx`, `apiClient.ts`, `requestMf3Json(...)` quando aplicável, `BK-MF8-09`.
- Prioridade de correção: `P0`.

#### F04 - Testes pedidos não são entregues como suite real

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Evidência:
  - O scope-in pede testes para aluno fora da sala, aluno vê apenas as suas respostas e sala diferente.
  - O Passo 6 manda criar `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`.
  - O único código do Passo 6 é `apps/api/src/modules/mf8/bk-mf8-10.expected-results.ts`, que centraliza frases de expected result, mas não testa service, controller, membership, query ou frontend.
  - A suite existente `room-ai.service.spec.ts` cobre ausência de fontes e provider inválido, mas não cobre histórico privado, `scope=mine`, sala diferente ou aluno fora da sala.
- Problema principal: expected results documentais não substituem uma suite `.spec.ts` executável com asserts sobre a regra de privacidade.
- O que falta completar: testes unitários ou de integração para `listMyRoomAiHistory(...)`, `ensureMember(...)`, query por `studentId`, sala diferente, não membro e resposta vazia controlada.
- Risco pedagógico: médio-alto; o aluno pode defender frases de intenção em vez de prova objetiva.
- Risco técnico: alto; regressões de acesso cruzado não ficam protegidas.
- Risco de segurança/privacidade: alto; a falha principal é precisamente isolamento entre alunos/salas.
- Dependências a reler: `room-ai.service.spec.ts`, `RoomAiService`, `StudyRoomsService.ensureMember`, `RoomAiInteraction`.
- Prioridade de correção: `P0`.

#### F05 - Handoff para BK-MF8-11 assume contrato que o BK-MF8-10 ainda não ensina de forma executável

- Estado: `CRITICO`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- Evidência:
  - O handoff diz que `BK-MF8-11` pode assumir um endpoint que devolve apenas interações IA da sala criadas pelo aluno autenticado.
  - O `BK-MF8-11` depende de `BK-MF8-10` e introduz partilha read-only/fork privado sobre respostas IA da sala.
  - Como o endpoint, cliente e testes de histórico não estão completos no BK10, o BK11 fica apoiado num contrato não materializado.
- Problema principal: a cadeia MF8 fica frágil no ponto de transição entre histórico privado e partilha controlada.
- O que falta completar: corrigir BK10 antes de depender dele em BK11, ou marcar explicitamente o contrato em falta como blocker.
- Risco pedagógico: alto; o aluno do BK11 herda uma premissa falsa.
- Risco técnico: alto; a partilha pode nascer sobre um identificador/resposta que o histórico privado nunca expôs de forma segura.
- Risco de segurança/privacidade: alto; partilha/fork depende de distinguir resposta própria, resposta de colega e membership.
- Dependências a reler: `BK-MF8-10`, `BK-MF8-11`, matriz e contrato de campos.
- Prioridade de correção: `P0`.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK alvo manda editar/criar/rever:
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`
  - EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
  - CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`
  - EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`
  - REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- Ficheiro novo mostrado em código mas em falta no inventário:
  - `apps/api/src/modules/study-rooms/room-ai-history.ts`
- Exports apresentados pelo guia:
  - `RoomAiHistoryItem`
  - `toPrivateRoomAiHistory(...)`
  - `bkMf810ExpectedResults`
  - `getBkMf810ExpectedResult(...)`
- Imports consumidos de BKs anteriores:
  - `RoomAiInteractionDocument`
  - `StudyRoomsService.ensureMember(...)` como contrato obrigatório, embora não implementado no código novo do guia.
  - `askRoomAi(...)` e `RoomAiPage`, já existentes para pergunta/resposta da sala.
- Endpoint prometido pelo BK:
  - `GET /api/study-rooms/:roomId/ai/answers?scope=mine`
- Endpoints reais observados em `apps`/`real_dev` para o domínio:
  - `POST /api/study-rooms/:roomId/ai/answers`
- DTOs/validators criados pelo guia: nenhum novo para a query de histórico.
- Schemas/modelos criados pelo guia: nenhum novo; reutiliza `RoomAiInteraction`.
- Services criados pelo guia: nenhum novo; deveria editar `RoomAiService`, mas falta código completo.
- Componentes/páginas frontend criados pelo guia: nenhum novo; deveria editar `RoomAiPage`, mas falta código completo.
- Providers de IA criados ou usados: nenhum provider novo; o histórico deve ler persistência existente sem chamar provider.
- Regras de segurança/autorização esperadas:
  - sessão autenticada;
  - `roomId` validado;
  - `ensureMember(actor.id, roomId)` antes de qualquer leitura;
  - filtro por `studentId` vindo da sessão, não do body/query;
  - ausência de prompts/respostas completas em logs/evidence.
- Testes criados pelo guia: nenhum teste executável completo; apenas expected results documentais.
- BKs seguintes dependentes:
  - `BK-MF8-11`, que depende de respostas IA privadas para partilha read-only e fork privado.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos corretos para guias de aluno.
- `real_dev/api` e `real_dev/web` foram usados apenas como referência privada de comparação.
- A base técnica já tem `RoomAiInteraction`, `RoomAiService.askRoomAi(...)`, `RoomAiController.@Post()` e `RoomAiPage` para pergunta/resposta.
- Não foi encontrado contrato real já implementado para `GET /api/study-rooms/:roomId/ai/answers?scope=mine`; por isso, o guia deve ensinar essa criação de forma autocontida se esse for o contrato escolhido.
- `scope=mine` é uma decisão `DERIVADO`, não requisito textual direto de RF/RNF.

### Decisões de domínio confirmadas

- `BK-MF8-10` consome `RF16`, `RF42`, `RNF20` e `RNF23`.
- O histórico IA da sala deve ser privado por aluno até `BK-MF8-11` introduzir partilha read-only e fork privado.
- `studentId` para filtrar histórico vem da sessão autenticada no backend, não do frontend.
- `roomId` só pode permitir leitura depois de validar membership no backend.
- O histórico privado não deve chamar o provider de IA; deve ler interações já persistidas e autorizadas.

### Decisões marcadas como DERIVADO

- Usar `GET /api/study-rooms/:roomId/ai/answers?scope=mine` para distinguir leitura privada da criação de resposta.
- Extrair `toPrivateRoomAiHistory(...)` para helper testável, se o helper for declarado como ficheiro real no inventário.
- Reutilizar `RoomAiInteraction` como persistência do histórico, sem criar modelo paralelo.

### Drift documental encontrado

- Drift entre a classificação histórica `OK` da hidratação global e a evidência atual de executabilidade: o guia tem estrutura formal, mas não fornece código completo para as peças críticas do requisito.
- Drift interno no BK alvo: a lista de ficheiros não inclui `room-ai-history.ts`, apesar de o passo 3 mostrar esse ficheiro como código novo.
- Drift de sequência: `BK-MF8-11` assume que `BK-MF8-10` deixou endpoint privado implementável, mas o BK10 não ensina esse contrato de forma suficiente.
- Drift fora do escopo alvo: há BKs antigos de MF3 com caminhos `real_dev` em texto destinado ao aluno; não foram alterados por `STRICT_SCOPE=true` e por esta execução ser focada em `BK-MF8-10`.

### Riscos restantes

- Risco alto de implementação insegura do histórico privado se o aluno criar a query sem filtrar por `studentId` da sessão.
- Risco alto de frontend/backend desalinhados porque a URL `scope=mine`, o tipo de resposta e a UI não têm código completo no guia.
- Risco alto para `BK-MF8-11`, que depende de um contrato privado ainda não materializado no BK10.
- Risco médio de evidence fraca, porque expected results documentais podem substituir testes reais se o guia não for corrigido.
- Risco residual de drift legado em BKs anteriores com caminhos privados, fora do escopo desta execução.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF1-04` criou a IA partilhada da sala, `RoomAiInteraction`, `POST /api/study-rooms/:roomId/ai/answers` e a validação de membership antes de responder.
- MF anterior/reforço: `BK-MF6-10` reforça que IA não acede a dados de outras turmas ou alunos; este princípio aplica-se diretamente ao histórico privado.
- MF anterior/reforço: `BK-MF7-01` reforça logs estruturados, mas o BK10 deve evitar logs com prompts/respostas privadas completas.
- MF alvo: `BK-MF8-10` deveria transformar interações persistidas em histórico privado por aluno, mas ainda deixa endpoint, frontend e testes por inferência.
- MF seguinte: `BK-MF8-11` não deve assumir o contrato de histórico privado como fechado enquanto `BK-MF8-10` estiver `CRITICO`.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Inventário de BKs MF0-MF8: `PASS`, `107` guias BK encontrados.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa em `apps`/`real_dev` para `@Get`, `scope=mine` e histórico privado de `RoomAi`: `PASS` como evidência de ausência do contrato já implementado; só foi encontrado o fluxo `POST` existente.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass=true`, `score_ge_97=true`, score `100`, `guide_bk=107`, `drift_critical_count=0`.

### Bloqueios e TODOs restantes

- `BK-MF8-10` fica `CRITICO` até o guia ser corrigido em modo `corrigir_apenas` ou `hidratar_corrigir`.
- TODO de correção: acrescentar código completo para backend, frontend e testes do histórico privado, mantendo `apps/api` e `apps/web` como caminhos públicos.
- TODO de coerência: reavaliar `BK-MF8-11` depois de corrigir `BK-MF8-10`, porque o próximo BK depende deste contrato.
- Não há blocker documental canónico para decidir o requisito; o bloqueio é de completude do guia, não de falta de RF/RNF.

## Execução 2026-07-02 - correção focada BK-MF8-09 após reauditoria

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-09]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-09 - Preparado para futura tradução/i18n`, usando a reauditoria imediatamente anterior como ponto de partida. O guia alvo foi reestruturado sem alterar código de produto e sem tocar noutros BKs.

Resultado final: `OK`. O guia mantém os metadados canónicos de `RNF44`, usa apenas caminhos públicos `apps/api` e `apps/web`, preserva `16` secções `####`, mantém `7` passos `### Passo`, passa a usar a ordem semântica obrigatória dos BKs, inclui a grelha interna 1 a 7 em todos os passos, acrescenta explicações após os blocos de código e normaliza o texto pedagógico para português de Portugal com acentuação.

### Documentos consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-09]`, `MODO=corrigir_apenas`, `STRICT_SCOPE=true`.
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `apps/web/src/features/mf3/request-mf3-json.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `apps/web/package.json`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

Nota: o estado "antes" reflete a reauditoria imediatamente anterior, que classificou `BK-MF8-09` como `PARCIAL` por falhas de estrutura semântica, passos internos e acentuação.

### Resultado por BK corrigido

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-09 | OK | Guia reestruturado para a ordem obrigatória, com 7 passos completos, código alinhado com contratos reais dos painéis MF8, explicações didáticas, validação, evidence e handoff. | P2 |

### Findings corrigidas

#### F01 - Estrutura semântica obrigatória não é seguida

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o guia passou a usar a estrutura esperada: `Objetivo`, `Importância`, `Scope-in`, `Scope-out`, `Estado antes e depois`, `Pre-requisitos`, `Glossário`, `Conceitos teóricos essenciais`, `Arquitetura do BK`, `Ficheiros a criar/editar/rever`, `Tutorial técnico linear`, `Critérios de aceite`, `Validação final`, `Evidence para PR/defesa`, `Handoff` e `Changelog`.
- Evidência: a pesquisa por `^#### ` no BK alvo devolve exatamente as `16` secções semânticas esperadas.

#### F02 - Passos técnicos não têm a grelha interna obrigatória 1 a 7

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: os sete passos foram reescritos com os pontos `1. Objetivo funcional`, `2. Ficheiros envolvidos`, `3. Instruções`, `4. Código`, `5. Explicação do código`, `6. Validação do passo` e `7. Cenário negativo/erro esperado`.
- Evidência: a pesquisa por marcadores `^[1-7]\. ` no BK alvo devolve os sete pontos em todos os passos.

#### F03 - Texto pedagógico não cumpre a regra de português com acentuação

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o texto narrativo, critérios, validação, evidence, handoff e mensagens visíveis foram normalizados para português de Portugal com acentuação.
- Evidência: a pesquisa focada por termos anteriormente problemáticos como `traducao`, `visiveis`, `nao`, `catalogo`, `solucao`, `logica`, `permissoes`, `aplicacao`, `validacao`, `autorizacao`, `tecnicas`, `decisao`, `alteracao`, `paineis`, `proximo` e `Ligacao` só devolve ocorrências em caminhos de ficheiro, não em texto pedagógico.

### Mapa de integracao da MF

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/messages.ts`
  - `apps/web/tests/e2e/mf8-messages.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
  - `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
  - `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
  - `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/src/pages/student/RoomAiPage.tsx`
  - `apps/web/package.json`
- Exports novos previstos pelo guia:
  - `messageKeys`
  - `MessageKey`
  - `isMessageKey(key: string): key is MessageKey`
  - `t(key: MessageKey): string`
  - `tOrDefault(key: string): string`
- Imports consumidos:
  - `checkAiGuardrails(...)`
  - `AiGuardrailContextType`
  - `AiGuardrailDecision`
  - `askSourceGroundedAi(...)`
  - `SourceGroundedAnswer`
  - `requestMf3Json(...)`
- Endpoints criados: nenhum.
- DTOs/validators criados: nenhum.
- Schemas/modelos criados: nenhum.
- Services criados: nenhum.
- Componentes/páginas frontend criados: nenhum novo; dois componentes existentes passam a consumir o catálogo.
- Providers de IA criados ou usados: nenhum provider novo; contratos existentes continuam isolados nos serviços.
- Regras de segurança/autorização aplicadas: o catálogo não decide ownership, membership, role ou permissão; essas regras continuam fora deste BK.
- Testes criados pelo guia: `apps/web/tests/e2e/mf8-messages.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-10`, que pode continuar a usar uma base centralizada para mensagens visíveis.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `RNF44` não exige biblioteca externa de i18n nesta fase.
- `AiGuardrailContextType` usa `"SOLO"`, `"STUDY_ROOM"` e `"CLASS_SUBJECT"`.
- `SourceGroundedAnswer` usa `citations`.
- `apps/web/package.json` disponibiliza `test:e2e` com Playwright.
- `requestMf3Json(...)` continua a preservar o padrão `credentials: "include"`.

### Decisões de domínio confirmadas

- `BK-MF8-09` entrega preparação para futura tradução/i18n, não tradução completa.
- Mensagens visíveis são responsabilidade de frontend.
- Guardrails, fontes autorizadas, membership, ownership e permissões não pertencem ao catálogo de mensagens.
- Não há endpoint novo para mensagens estáticas.

### Decisões marcadas como DERIVADO

- Criar `apps/web/src/lib/messages.ts` como catálogo local tipado.
- Usar Playwright para validar o catálogo, porque o frontend já tem esse runner.
- Integrar imediatamente `AiGuardrailsPanel` e `SourceGroundedAiPanel`.
- Rever `RoomAiPage` como superfície futura sem a reestruturar neste BK.

### Drift documental encontrado

- Drift anterior corrigido: o guia tinha contagem estrutural válida para o validador, mas não seguia a ordem semântica exigida pela prompt ativa.
- Drift anterior corrigido: o guia tinha passos numerados, mas faltava a grelha interna obrigatória por passo.
- Drift anterior corrigido: o guia continha texto pedagógico sem acentuação.

### Riscos restantes

- Testes de produto não foram executados porque esta execução é documental: o BK foi corrigido como guia, mas os ficheiros `messages.ts`, componentes e teste ainda serão criados pelo aluno quando implementar o BK.
- `RoomAiPage` continua fora da alteração direta deste BK; fica como superfície a expandir quando houver necessidade de cobrir mais mensagens.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF8-08` entrega a separação entre dados técnicos e apresentação visível.
- `BK-MF8-09` passa a entregar a separação entre mensagens visíveis e lógica dos painéis IA.
- `BK-MF8-10` pode avançar para histórico privado de chats IA da sala sem herdar o desvio estrutural anteriormente encontrado.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Grelha interna dos passos: `PASS`, todos os sete passos têm os pontos 1 a 7.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa focada de acentuação dos termos anteriormente problemáticos: `PASS` para texto pedagógico; ocorrências restantes apenas em caminhos.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass=true`, `score_ge_97=true`, score `100`, `guide_bk=107`, `drift_critical_count=0`.

### Bloqueios e TODOs restantes

- Sem blockers documentais para `BK-MF8-09`.
- TODO operacional futuro: quando o aluno implementar o BK, executar `npm --prefix apps/web run build` e `npm --prefix apps/web run test:e2e -- mf8-messages.spec.ts` depois de criar os ficheiros reais.

## Execução 2026-07-02 - reauditoria focada BK-MF8-09

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-09]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria fresca ao `BK-MF8-09 - Preparado para futura tradução/i18n`, sem confiar no estado `OK` da secção anterior do relatório. O modo desta passagem é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta execução é este bloco de relatório.

Resultado da reauditoria: `PARCIAL`. O guia alvo tem metadados canónicos corretos para `RNF44`, usa caminhos públicos `apps/api` e `apps/web`, mantém `16` secções `####` e `7` passos `### Passo`, não contém caminhos `real_dev` no texto do aluno, inclui uma proposta técnica útil para catálogo de mensagens, dois componentes frontend e um teste Playwright. Contudo, ainda não pode ficar `OK` à luz da prompt ativa, porque não segue a estrutura semântica obrigatória dos BKs, os passos técnicos não têm a grelha interna 1 a 7 exigida e o texto pedagógico contém muitas palavras sem acentuação em português de Portugal.

### Documentos consultados nesta execução

- Prompt ativa anexada: `PROJECT_NAME=StudyFlow`, `MF_ALVO=MF8`, `BK_IDS=[BK-MF8-09]`, `MODO=auditar_apenas`, `STRICT_SCOPE=true`.
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/web/package.json`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete a secção de correção focada imediatamente anterior, que tinha classificado `BK-MF8-09` como `OK`. Esta reauditoria aplica a prompt ativa mais estrita e reclassifica o BK alvo como `PARCIAL`.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-09 | PARCIAL | Conteúdo técnico útil, mas estrutura semântica, passos internos, explicação didática e acentuação do texto pedagógico não cumprem a prompt ativa. | P2 |

### Findings da reauditoria

#### F01 - Estrutura semântica obrigatória não é seguida

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - O guia usa secções numeradas como `#### 1. Objetivo do BK`, `#### 2. Contexto dentro do MF8`, `#### 3. Scope-in e scope-out`, `#### 6. Passos tecnicos`, `#### 9. Comandos de validacao` e `#### 16. Ligacao ao BK seguinte`.
  - A pesquisa por secções obrigatórias como `#### Importância`, `#### Pre-requisitos`, `#### Glossário`, `#### Conceitos teóricos essenciais`, `#### Arquitetura do BK`, `#### Tutorial técnico linear`, `#### Validação final` e `#### Handoff` no BK alvo não devolveu ocorrências.
  - Os BKs vizinhos `BK-MF8-08` e `BK-MF8-10` usam a ordem semântica esperada: `Objetivo`, `Importância`, `Scope-in`, `Scope-out`, `Estado antes e depois`, `Pre-requisitos`, `Glossário`, `Conceitos teóricos essenciais`, `Arquitetura do BK`, `Ficheiros a criar/editar/rever`, `Tutorial técnico linear`, `Critérios de aceite`, `Validação final`, `Evidence para PR/defesa`, `Handoff`, `Changelog`.
- Problema principal: o guia cumpre a contagem automática de `16` secções, mas não cumpre a estrutura real exigida pela prompt ativa.
- O que falta completar: reestruturar o BK para a ordem semântica obrigatória, sem fundir `Scope-in` e `Scope-out` e sem substituir `Tutorial técnico linear` por `Passos tecnicos`.
- Risco pedagógico: o aluno perde a sequência comum dos restantes BKs e não encontra teoria, arquitetura, pré-requisitos e handoff no local esperado.
- Risco técnico: médio; a quebra é principalmente documental/pedagógica, mas afeta a capacidade de seguir a MF por contrato comum.
- Risco de segurança/privacidade: baixo direto, desde que a futura correção preserve a fronteira frontend/backend já indicada.
- Dependências a reler: prompt ativa, `BK-MF8-08`, `BK-MF8-10`, `_TEMPLATE-BK.md`.
- Prioridade de correção: `P1`.

#### F02 - Passos técnicos não têm a grelha interna obrigatória 1 a 7

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - A pesquisa pelos marcadores `1. Objetivo funcional`, `2. Ficheiros envolvidos`, `3. Instruções`, `4. Código`, `5. Explicação do código`, `6. Validação do passo` e `7. Cenário` no BK alvo não devolveu ocorrências.
  - A mesma pesquisa encontrou apenas os cabeçalhos `### Passo 1` a `### Passo 7`.
  - Os blocos de código de `messages.ts`, `AiGuardrailsPanel`, `SourceGroundedAiPanel` e `mf8-messages.spec.ts` não são seguidos por uma secção `Explicação do código` completa no formato exigido pela prompt.
- Problema principal: o guia tem passos e código, mas não ensina cada passo com a grelha didática obrigatória, nem explica cada bloco de código com os critérios de contrato, dados de entrada/saída, validações, segurança, erros evitados e adaptação segura.
- O que falta completar: reescrever cada `### Passo` com os pontos 1 a 7 e acrescentar `Explicação do código` após cada bloco relevante.
- Risco pedagógico: alto; um aluno do 12.º ano continua a ter de inferir localização exata, validação por passo e negativo esperado.
- Risco técnico: médio; o código apresentado é mais completo do que antes, mas a falta de explicação e validação por passo dificulta uma implementação segura.
- Risco de segurança/privacidade: baixo a médio; mensagens de UI não devem decidir permissões, e essa regra aparece, mas a explicação de por que a autorização continua fora do catálogo ainda é insuficiente no formato exigido.
- Dependências a reler: `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`, `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`, `apps/web/package.json`.
- Prioridade de correção: `P1`.

#### F03 - Texto pedagógico não cumpre a regra de português com acentuação

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - Foram encontradas muitas ocorrências em texto destinado ao aluno como `traducao`, `visiveis`, `nao`, `catalogo`, `solucao`, `logica`, `permissoes`, `aplicacao`, `validacao`, `autorizacao`, `tecnicas`, `decisao`, `alteracao`, `paineis`, `proximo` e `Ligacao`.
  - Exemplos concretos aparecem logo nas linhas iniciais do BK: `futura traducao`, `mensagens visiveis`, `objetivo nao e`, `catalogo local`, `solucao`, `paineis`, `logica`, `permissoes`.
- Problema principal: a prompt ativa proíbe texto pedagógico em ASCII sem acentos por conveniência técnica.
- O que falta completar: normalizar todo o texto narrativo, critérios, evidence, perguntas, changelog e mensagens visíveis para português de Portugal com acentuação correta, preservando identificadores técnicos em inglês quando fizer sentido.
- Risco pedagógico: médio; o guia fica menos adequado para alunos e menos profissional na defesa PAP.
- Risco técnico: baixo; não afeta diretamente imports/endpoints, mas afeta a qualidade obrigatória do BK.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: prompt ativa, secção "Regra de lingua e caracteres no texto pedagogico".
- Prioridade de correção: `P2`.

### Mapa de integracao da MF - foco BK-MF8-09

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/messages.ts`
  - `apps/web/tests/e2e/mf8-messages.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
  - `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
  - `apps/web/src/pages/student/RoomAiPage.tsx`
  - `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
  - `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
- Exports novos previstos pelo guia:
  - `messageKeys`
  - `MessageKey`
  - `isMessageKey(key: string): key is MessageKey`
  - `t(key: MessageKey): string`
  - `tOrDefault(key: string): string`
- Endpoint previsto pelo guia: nenhum endpoint novo.
- DTOs/validators: nenhum novo DTO obrigatório para `RNF44`.
- Schemas/modelos: nenhum novo schema.
- Services: nenhum service backend novo.
- Componentes/páginas frontend: `AiGuardrailsPanel`, `SourceGroundedAiPanel` e revisão de `RoomAiPage`.
- Providers de IA: nenhum provider novo.
- Regras de segurança/autorização: manter ownership, membership, role e permissões fora do catálogo de mensagens; não mover validações para o frontend.
- Testes previstos pelo guia: `apps/web/tests/e2e/mf8-messages.spec.ts`.
- BK seguinte dependente: `BK-MF8-10`, que deve poder assumir uma base de mensagens centralizadas sem reestruturar o guia anterior.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `RNF44` não exige uma biblioteca externa de i18n nesta fase.
- A decisão de criar `apps/web/src/lib/messages.ts` como catálogo local é adequada como decisão `DERIVADO`, desde que a correção seguinte explique claramente que é uma preparação, não uma tradução completa.
- `apps/web/package.json` expõe `test:e2e` como `playwright test`, por isso o caminho `apps/web/tests/e2e/mf8-messages.spec.ts` é compatível com o tipo de suite indicado.

### Decisões de domínio confirmadas

- `BK-MF8-09` entrega `RNF44 - Preparado para futura tradução i18n`.
- O requisito é localização/preparação i18n, não tradução integral multi-idioma.
- Mensagens visíveis não podem decidir autorização, ownership, membership, role ou permissão.
- Não deve existir endpoint novo só para mensagens estáticas de frontend.

### Decisões marcadas como DERIVADO

- Usar um catálogo local tipado em `apps/web/src/lib/messages.ts`.
- Usar Playwright para um teste leve de catálogo, reaproveitando a stack disponível em `apps/web`.
- Limitar a integração concreta a `AiGuardrailsPanel` e `SourceGroundedAiPanel`, deixando `RoomAiPage` como revisão para não expandir o escopo de `RNF44`.

### Drift documental encontrado

- Há drift entre a classificação anterior `OK` e a evidência atual da prompt ativa: os gates automáticos passam, mas o guia não cumpre a estrutura semântica e a grelha interna obrigatória dos passos.
- O validador atual aceita `16` secções e `7` passos mesmo quando os nomes das secções não correspondem ao contrato completo da prompt.
- `BK-MF8-08` e `BK-MF8-10` estão estruturalmente alinhados com a ordem semântica esperada; `BK-MF8-09` ficou deslocado nesse aspeto.

### Riscos restantes

- Se o BK for entregue como está, um aluno pode implementar a ideia técnica, mas não recebe o formato pedagógico completo exigido para os restantes BKs da MF.
- A ausência de `Pre-requisitos`, `Glossário`, `Conceitos teóricos essenciais` e `Arquitetura do BK` dificulta a defesa oral e a ligação com MF8.
- A falta de `Explicação do código` após blocos grandes reduz a capacidade de justificar decisões sobre catálogo, fallback, mensagens de UI e fronteira backend.
- A falta de acentuação no texto pedagógico contraria a regra explícita da prompt e reduz a qualidade formal do guia.

### Coerência MF anterior -> MF alvo -> MF seguinte

- `BK-MF8-08` mantém a estrutura semântica esperada e prepara a separação entre dados técnicos e apresentação visível.
- `BK-MF8-09` tem a direção técnica correta para preparar mensagens/i18n, mas precisa de reestruturação para ficar coerente com o formato dos BKs vizinhos.
- `BK-MF8-10` pode depender da ideia de mensagens centralizadas, mas não deve herdar o desvio estrutural do `BK-MF8-09`.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass=true`, `score_ge_97=true`, score `100`, `guide_bk=107`, `drift_critical_count=0`.
- Pesquisa manual de estrutura semântica no BK alvo: `PARCIAL`, secções obrigatórias ausentes.
- Pesquisa manual da grelha interna dos passos: `PARCIAL`, apenas existem `### Passo 1` a `### Passo 7`; os pontos internos 1 a 7 não existem.
- Pesquisa manual de acentuação: `PARCIAL`, várias palavras pedagógicas aparecem sem acentos.

### Bloqueios e TODOs restantes

- `TODO`: numa execução `corrigir_apenas` ou `hidratar_corrigir`, reestruturar `BK-MF8-09` para a ordem semântica obrigatória.
- `TODO`: reescrever cada passo com a grelha interna 1 a 7.
- `TODO`: acrescentar `Explicação do código` completa após cada bloco relevante.
- `TODO`: normalizar o texto pedagógico para português de Portugal com acentuação correta.

## Execução 2026-07-02 - correção focada BK-MF8-09

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-09]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-09 - Preparado para futura tradução/i18n`, partindo das findings abertas na auditoria imediatamente anterior. O guia alvo foi atualizado sem alterar produto e sem tocar noutros BKs.

Resultado final: `OK`. O guia mantém metadados canónicos de `RNF44`, usa apenas caminhos públicos `apps/api` e `apps/web`, preserva a estrutura ativa da MF8 com `16` secções `####` e `7` passos `### Passo`, não contém caminhos privados nem linguagem interna proibida, e fecha as lacunas `F01` a `F04`: integração frontend concreta, fronteira backend explícita, inventário coerente e teste executável para o catálogo de mensagens.

### Documentos consultados nesta execução

- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/web/package.json`
- `apps/api/package.json`
- `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `apps/web/src/pages/student/RoomAiPage.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

Nota: o estado "antes" reflete a auditoria focada imediatamente anterior, que tinha reclassificado `BK-MF8-09` como `PARCIAL`. Esta execução aplica apenas a correção documental permitida por `corrigir_apenas`.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-09 | OK | Guia corrigido com catálogo local tipado, integração completa em `AiGuardrailsPanel` e `SourceGroundedAiPanel`, fronteira backend sem endpoint novo, inventário alinhado e teste Playwright para resolução/fallback de mensagens. | P2 |

### Findings corrigidas

#### F01 - Integração frontend fica por inferência

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 5 passou a mostrar código completo para `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx` e `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`, importando `messageKeys` e `t(...)` de `apps/web/src/lib/messages.ts`.
- Evidência: o guia agora substitui mensagens visíveis de loading, erro, título, submissão, estado de guardrails, resposta e fontes usadas por chaves do catálogo local.

#### F02 - Passo backend é contraditório para um requisito frontend-only

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 4 foi reescrito como confirmação da fronteira backend, declarando explicitamente que não há endpoint, controller, service, DTO, schema ou model novo neste BK.
- Evidência: o guia mantém a decisão "sem endpoint novo" e limita a entrega a frontend, catálogo de mensagens e testes do catálogo.

#### F03 - Inventário de ficheiros fica desalinhado com os passos

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o inventário passou a listar apenas os entregáveis coerentes com os passos: `apps/web/src/lib/messages.ts`, `apps/web/tests/e2e/mf8-messages.spec.ts` e os dois componentes frontend editados.
- Evidência: foi removida a entrega `apps/api/src/modules/mf8/bk-mf8-09.expected-results.ts`, que não provava comportamento executável para `RNF44`.

#### F04 - Teste de `messages.ts` não fica executável

- Estado anterior: `PARCIAL`
- Estado após correção: `CORRIGIDO`
- Correção aplicada: o passo 6 passou a criar `apps/web/tests/e2e/mf8-messages.spec.ts`, com asserts sobre chaves conhecidas, deteção de chave desconhecida, fallback seguro e ausência de dependência runtime de i18n.
- Evidência: o teste usa `@playwright/test` e importa `messageKeys`, `isMessageKey`, `t` e `tOrDefault` a partir de `../../src/lib/messages.js`.

### Mapa de integração da MF - foco BK-MF8-09

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/messages.ts`
  - `apps/web/tests/e2e/mf8-messages.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
  - `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
  - `apps/web/src/pages/student/RoomAiPage.tsx`
  - `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`
  - `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
- Exports novos previstos pelo guia:
  - `messageKeys`
  - `MessageKey`
  - `isMessageKey(key: string): key is MessageKey`
  - `t(key: MessageKey): string`
  - `tOrDefault(key: string): string`
- Endpoint previsto pelo guia: nenhum endpoint novo.
- Schemas/modelos/DTOs backend: nenhum.
- Regras de segurança/autorização: continuam no backend e nos serviços existentes; o catálogo de mensagens não decide permissões.
- BK seguinte dependente: `BK-MF8-10`, que pode assumir que a base de mensagens centralizadas para MF8 ficou preparada.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- `git diff --check`: `PASS`, sem output na execução final.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass=true`, `score_ge_97=true`, score `100`, `guide_bk=107`, `drift_critical_count=0`.

Notas de validação: a primeira execução de `git diff --check` detetou trailing whitespace no cabeçalho novo; foi corrigido. A primeira execução do validador detetou cabeçalho não canónico, `core_or_reforco` desalinhado e ausência das secções semânticas esperadas de critérios de aceite/evidence; tudo foi corrigido antes da validação final.

### Riscos restantes

- Não foram executados testes de produto `apps/web` ou `apps/api`, porque esta execução foi documental e não criou ficheiros reais de produto.
- O teste `mf8-messages.spec.ts` ficou especificado no guia, mas só será executável quando o aluno implementar os ficheiros indicados no projeto.
- `RoomAiPage` ficou como superfície a rever, não como ficheiro editado neste BK, para manter o escopo curto e evitar reestruturar o fluxo do estudante dentro de `RNF44`.

## Execução 2026-07-02 - auditoria focada BK-MF8-09

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-09]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada auditoria focada ao `BK-MF8-09 - Preparado para futura tradução i18n`. O modo desta passagem é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta execução é este bloco de relatório.

Resultado da auditoria: `PARCIAL`. O guia alvo está alinhado com `RNF44`, usa caminhos públicos `apps/api` e `apps/web`, mantém a estrutura ativa da MF8 com `16` secções `####` e `7` passos `### Passo`, e não contém caminhos `real_dev` nem linguagem interna proibida pela pesquisa obrigatória. Contudo, ainda não pode ficar `OK`, porque promete centralizar mensagens visíveis em componentes concretos, mas só entrega código completo para `apps/web/src/lib/messages.ts`; a integração real em `AiGuardrailsPanel`, `SourceGroundedAiPanel` e `RoomAiPage` fica por inferência.

### Documentos consultados nesta execução

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
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md` para estrutura e coerência de sequência.
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da auditoria focada | 1 | 0 | 0 |
| Depois da auditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete o relatório global anterior, que classificava `BK-MF8-09` como `OK` após a reescrita completa da MF8. Esta reauditoria foi fresca e reclassifica o BK alvo como `PARCIAL` com base na evidência atual.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-09 | PARCIAL | Estrutura formal correta e metadados canónicos preservados, mas integração frontend, validação executável e inventário de ficheiros ainda não são suficientemente autocontidos para `RNF44`. | P2 |

### Findings da auditoria

#### F01 - Integração frontend fica por inferência

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - A lista de ficheiros manda criar `apps/web/src/lib/messages.ts` e `apps/web/src/lib/messages.spec.ts`.
  - A mesma lista manda editar `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx` e `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`, e rever `apps/web/src/pages/student/RoomAiPage.tsx`.
  - O passo 5 diz `Sem código neste passo` porque "a integração varia consoante a página real".
  - A implementação atual desses componentes ainda tem strings visíveis hardcoded como `"Erro ao validar."`, `"Erro ao responder."`, `"Erro ao perguntar."`, `"A validar..."`, `"A responder..."`, `"Perguntar"`, `"Resposta"` e `"Fontes usadas:"`.
- Problema principal: o aluno sabe criar o catálogo `t(...)`, mas não recebe a versão completa de pelo menos um componente real a consumir `MessageKey`.
- O que falta completar: mostrar a alteração completa de `AiGuardrailsPanel` e/ou `SourceGroundedAiPanel`, importando `t(...)`, substituindo strings repetidas por chaves locais e mantendo estados loading/erro/sucesso.
- Risco pedagógico: o aluno continua a adivinhar onde aplicar o catálogo e que mensagens pertencem ao contrato mínimo de i18n.
- Risco técnico: `RNF44` pode ficar como helper isolado, sem impacto observável na UI.
- Risco de segurança/privacidade: baixo nesta finding, desde que as mensagens continuem genéricas e não exponham prompts, fontes privadas, tokens, cookies ou respostas IA completas.
- Dependências a reler: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-08`, `BK-MF8-10`, `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`, `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`.
- Prioridade de correção: `P1`.

#### F02 - Passo backend é contraditório para um requisito frontend-only

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - A arquitetura declara `Endpoint/contrato principal: sem endpoint novo; contrato frontend`.
  - O passo 4 pede "controller", "service", "DTO", sessão, ownership, membership, role e resposta de sucesso/erro.
  - A secção de código do mesmo passo diz `Sem código neste passo`.
- Problema principal: o BK mistura uma decisão válida de não criar endpoint novo com instruções backend genéricas, sem indicar que a correção real é estabilizar códigos/mensagens existentes ou manter backend fora do escopo.
- O que falta completar: substituir o passo backend genérico por uma revisão objetiva dos códigos de erro existentes ou por uma nota clara de "sem alteração backend", com critérios de aceite observáveis.
- Risco pedagógico: o aluno pode criar controller/service desnecessário para cumprir um requisito que a própria arquitetura define como frontend.
- Risco técnico: risco de endpoints artificiais ou duplicação de responsabilidades.
- Risco de segurança/privacidade: médio se o aluno criar backend novo sem necessidade e sem ownership/membership real.
- Dependências a reler: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `docs/RNF.md`.
- Prioridade de correção: `P1`.

#### F03 - Inventário de ficheiros fica desalinhado com os passos

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - A secção `Ficheiros a criar/editar/rever` não lista `apps/api/src/modules/mf8/bk-mf8-09.expected-results.ts`.
  - O passo 6 manda criar esse ficheiro e inclui código para ele.
  - O mesmo passo anuncia `apps/web/src/lib/messages.spec.ts`, mas não mostra a suite de testes real para `t(...)`.
- Problema principal: a lista de ficheiros e o tutorial não descrevem o mesmo conjunto de entregáveis.
- O que falta completar: decidir se o ficheiro `expected-results` pertence mesmo ao BK; se pertencer, listá-lo no inventário e explicar o seu papel. Caso contrário, substituir por testes reais de `messages.spec.ts`.
- Risco pedagógico: o aluno fica sem saber quais ficheiros entram no PR final.
- Risco técnico: PR pode incluir artefactos didáticos que não provam comportamento executável.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: `apps/web/package.json`, `apps/api/package.json`, padrão de testes MF8 nos BKs anteriores.
- Prioridade de correção: `P2`.

#### F04 - Teste de `messages.ts` não fica executável

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- Evidência:
  - O passo 3 manda criar `apps/web/src/lib/messages.spec.ts`.
  - O único bloco de código do passo 3 é `apps/web/src/lib/messages.ts`.
  - O passo 6 entrega `bk-mf8-09.expected-results.ts`, não uma suite `.spec.ts` com asserts sobre mensagem conhecida, fallback e ausência de biblioteca nova.
- Problema principal: o guia promete validação automatizada do catálogo, mas não ensina a escrever o teste executável correspondente.
- O que falta completar: incluir uma suite real para `messages.spec.ts`, com asserts sobre chaves conhecidas e decisão explícita para chave inválida ou ausência de dependência i18n.
- Risco pedagógico: o aluno pode confundir expected result textual com teste executável.
- Risco técnico: `RNF44` fica sem prova automatizada mínima.
- Risco de segurança/privacidade: baixo.
- Dependências a reler: scripts reais de teste em `apps/web/package.json` e padrão de validação usado em MF8.
- Prioridade de correção: `P2`.

### Mapa de integracao da MF - foco BK-MF8-09

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/messages.ts`
  - `apps/web/src/lib/messages.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-09.expected-results.ts` (apenas no passo 6; não aparece na lista principal de ficheiros)
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
  - `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
  - `apps/web/src/pages/student/RoomAiPage.tsx`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
- Exports novos previstos pelo guia:
  - `MessageKey`
  - `t(key: MessageKey): string`
  - `bkMf809ExpectedResults`
  - `getBkMf809ExpectedResult(...)`
- Endpoint previsto pelo guia: nenhum endpoint novo; contrato frontend.
- DTOs/validators: nenhum novo DTO obrigatório para `RNF44`.
- Schemas/modelos: nenhum novo schema.
- Services: revisão de mensagens/códigos existentes; não há service novo obrigatório.
- Componentes/páginas frontend: `AiGuardrailsPanel`, `SourceGroundedAiPanel` e `RoomAiPage`, mas o guia ainda não mostra a integração completa.
- Providers de IA: nenhum provider novo.
- Regras de segurança/autorização: manter sessão/cookies HttpOnly e não mover ownership, membership, role ou permissões para o frontend; evidence sem prompts privados, respostas IA completas, cookies, tokens ou materiais privados.
- Testes previstos pelo guia: `messages.spec.ts`, mas a suite executável ainda está ausente no texto do BK.
- BK seguinte dependente: `BK-MF8-10`, que deve poder assumir mensagens visíveis centralizadas sem criar dependências de tradução completa.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `RNF44` não exige biblioteca i18n nesta fase.
- A decisão de criar um catálogo local de mensagens é `DERIVADO` e adequada para MVP/PAP.
- Não deve existir endpoint novo só para preparação i18n.
- Códigos de erro backend podem ficar estáveis, mas a centralização de mensagens visíveis é principalmente frontend.

### Decisões de domínio confirmadas

- `BK-MF8-09` entrega `RNF44`.
- O requisito é preparação futura, não tradução completa.
- A preparação i18n deve preservar português de Portugal no MVP.
- Mensagens visíveis não podem expor dados privados, prompts, respostas IA completas, tokens, cookies ou materiais integrais.

### Decisões marcadas como DERIVADO

- Usar `apps/web/src/lib/messages.ts` como catálogo local.
- Adiar dependência i18n até existir necessidade real.
- Centralizar mensagens usadas por fluxos de IA já existentes em vez de criar novo backend.

### Drift documental encontrado

- Não há drift de matriz, backlog, contrato de campos, MF views, guia index ou sprint para os metadados de `BK-MF8-09`.
- Drift interno no guia alvo: inventário de ficheiros e passos não coincidem totalmente.
- Drift de implementação guiada: o guia diz editar componentes reais, mas não fornece o código completo dessas integrações.
- Drift menor fora do escopo permitido: `_TEMPLATE-BK.md` ainda usa exemplos `real_dev/...` na secção de ficheiros, mas a prompt ativa manda escrever guias dos alunos com `apps/api` e `apps/web`. Este ponto não foi editado por `STRICT_SCOPE=true` e por `MODO=auditar_apenas`.

### Riscos restantes

- Esta execução é `auditar_apenas`; o guia alvo não foi corrigido.
- Se o BK for implementado como está, `messages.ts` pode ficar criado mas não consumido pelos componentes.
- O aluno pode criar backend desnecessário por causa do passo 4, apesar da arquitetura dizer "sem endpoint novo".
- O ficheiro `expected-results` pode ser confundido com teste real.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 continua a fornecer sessão, guardrails, fonte fundamentada, limites de IA e padrões de componentes.
- MF8 mantém `17` guias ativos, todos com `16` secções `####` e `7` passos `### Passo`.
- `BK-MF8-08` fornece a separação entre dados técnicos e apresentação visível.
- `BK-MF8-09` ainda precisa de corrigir a integração frontend para que `BK-MF8-10` possa assumir mensagens centralizadas sem adivinhar contratos.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Estrutura dos guias MF8: `PASS`, todos os `17` guias mantêm `16` secções `####` e `7` passos `### Passo`.
- Coerência canónica de `BK-MF8-09`: `PASS`, `RNF44`, `S12`, `P2`, `S`, owner `Kaua`, apoio `Guilherme`, dependências `-` e próximo BK `BK-MF8-10` confirmados.
- Pesquisa focada em `apps/api/src`, `apps/web/src`, `real_dev/api/src` e `real_dev/web/src`: confirmou mensagens visíveis dispersas e ausência de catálogo local equivalente no escopo lido.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `apps/api` e `apps/web` não foram executados porque esta execução é documental e alterou apenas relatório de auditoria. Os testes específicos devem ser definidos/corrigidos no próprio `BK-MF8-09` antes de uma execução de implementação.

### Bloqueios e TODOs restantes

- Bloqueios: nenhum.
- TODO documental no escopo do BK alvo: corrigir `F01` a `F04` numa execução `corrigir_apenas` ou `hidratar_corrigir`.

---

## Execução 2026-07-02 - reauditoria focada BK-MF8-08

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-08]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada reauditoria focada ao `BK-MF8-08 - Datas no formato dd/mm/aaaa`, após a correção documental registada na execução anterior. O modo desta passagem é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta execução é este bloco de relatório.

Resultado final: `OK`. O guia alvo está alinhado com `RNF43`, preserva o contrato canónico de `BK-MF8-08`, usa apenas caminhos públicos `apps/api` e `apps/web`, mantém a estrutura ativa da MF8 com `16` secções `####` e `7` passos `### Passo`, e já contém evidência suficiente para fechar as lacunas `F01` a `F04` anteriormente identificadas.

### Documentos consultados nesta execução

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
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md` para estrutura e coerência de sequência.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/api/src/modules/study/dto/study-event.dto.ts`
- `apps/api/src/modules/study/history.service.ts`
- `apps/api/src/modules/study/history.service.spec.ts`
- `apps/api/src/modules/study/schemas/study-event.schema.ts`
- `apps/api/src/modules/study-alerts/study-alerts.service.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/components/study/StudyHistoryList.tsx`
- `apps/web/src/pages/student/StudyHistoryPage.tsx`
- `apps/web/src/pages/student/RoutinesPage.tsx`
- `apps/web/playwright.config.ts`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 1 | 0 | 0 |

Nota: o estado "antes" reflete a correção focada imediatamente anterior, que já tinha promovido `BK-MF8-08` para `OK`. Esta reauditoria confirmou a evidência atual sem editar o guia.

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-08 | OK | Guia contém helper frontend completo, cliente/histórico tipado, integração completa em `StudyHistoryList.tsx`, prova backend de preservação ISO, validação Playwright executável e inventário mínimo das superfícies visíveis de data. | P0 |

### Findings revalidados

#### F01 - Integração frontend fica aberta

- Estado revalidado: `JA_CORRIGIDO`
- Evidência: o guia contém instruções e código completo para `apps/web/src/lib/apiClient.ts`, `apps/web/src/pages/student/StudyHistoryPage.tsx` e `apps/web/src/components/study/StudyHistoryList.tsx`.
- Conclusão: a integração frontend deixou de estar aberta; o fluxo tipa `StudyHistoryEvent[]` e renderiza datas através de `formatDatePt(...)`.

#### F02 - Contrato backend/ISO estava ambíguo

- Estado revalidado: `JA_CORRIGIDO`
- Evidência: o guia explicita que não há endpoint novo e inclui teste backend para confirmar que `HistoryService` preserva `occurredAt` como `Date`/ISO serializável.
- Conclusão: o backend continua a transportar dados técnicos; a localização fica na camada de apresentação.

#### F03 - Testes pedidos não eram executáveis

- Estado revalidado: `JA_CORRIGIDO`
- Evidência: o guia pede Jest no backend e Playwright no frontend, incluindo `apps/web/tests/e2e/mf8-date-format.spec.ts` para data válida, data inválida, data indisponível e renderização `dd/mm/aaaa`.
- Conclusão: o BK já descreve validações executáveis com ferramentas existentes do projeto, sem dependência nova.

#### F04 - Cobertura de superfícies de data estava incompleta

- Estado revalidado: `JA_CORRIGIDO`
- Evidência: o guia inclui inventário próprio de superfícies, separando o obrigatório neste BK (`StudyHistoryList.tsx`, `StudyHistoryPage.tsx`, `apiClient.ts`) do que deve ser revisto ou registado (`RoutinesPage.tsx`, `study-alerts.service.ts`).
- Conclusão: a superfície mínima está fechada e os riscos relacionados ficam explicitamente enquadrados.

### Mapa de integracao da MF - foco BK-MF8-08

- Guias BK editados nesta execução: nenhum.
- Ficheiro de relatório atualizado nesta execução:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/format-date-pt.ts`
  - `apps/web/tests/e2e/mf8-date-format.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/components/study/StudyHistoryList.tsx`
  - `apps/web/src/pages/student/StudyHistoryPage.tsx`
  - `apps/api/src/modules/study/history.service.spec.ts`
  - `apps/api/src/modules/study/dto/study-event.dto.ts`
  - `apps/api/src/modules/study/history.service.ts`
  - `apps/api/src/modules/study/schemas/study-event.schema.ts`
  - `apps/web/src/pages/student/RoutinesPage.tsx`
  - `apps/api/src/modules/study-alerts/study-alerts.service.ts`
- Exports novos previstos pelo guia:
  - `formatDatePt`
  - `StudyHistoryEvent`
  - `listStudyHistory(): Promise<StudyHistoryEvent[]>`
- Endpoint previsto pelo guia: nenhum endpoint novo; mantém `GET /api/study/history`.
- DTOs/validators: reutilização de `StudyEventDto` e `HistoryQueryDto`.
- Schemas/modelos: reutilização de `StudyEvent`/`StudyEventSchema`; não há novo schema.
- Services: reutilização de `HistoryService`, com prova de preservação de ISO.
- Componentes/páginas frontend: `StudyHistoryPage` e `StudyHistoryList`.
- Providers de IA: nenhum.
- Regras de segurança/autorização: sessão existente no backend, sem `userId` enviado pelo frontend, sem logs/evidence com cookies, tokens, prompts privados, respostas IA completas ou dados pessoais reais.
- Testes previstos pelo guia:
  - `npm --prefix apps/api run test -- history.service.spec.ts`
  - `STUDYFLOW_E2E_START_SERVERS=false npm --prefix apps/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts`
- BK seguinte dependente: `BK-MF8-09`.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- A API preserva datas técnicas/ISO; a localização acontece na UI.
- `Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Lisbon" })` mantém-se como decisão `DERIVADO` aceitável para apresentação controlada.
- Playwright é a validação frontend correta neste BK porque `apps/web` já tem Playwright e não há necessidade de introduzir runner novo.
- Não foi adicionada dependência nova.

### Decisões de domínio confirmadas

- `BK-MF8-08` entrega `RNF43`.
- Datas de histórico pertencem ao aluno autenticado e não implicam envio de `userId` pelo frontend.
- Localização de datas é requisito de apresentação, não mudança de persistência.
- `BK-MF8-09` pode partir desta base para centralizar mensagens/i18n futura.

### Decisões marcadas como DERIVADO

- Formatar datas só no frontend.
- Usar `Europe/Lisbon` na apresentação visível.
- Validar a unidade frontend com Playwright em vez de introduzir Vitest/Jest no `apps/web`.
- Rever `RoutinesPage.tsx` e `study-alerts.service.ts` como superfícies relacionadas sem transformar ambas em requisito obrigatório deste BK.

### Drift documental encontrado

- Não há drift entre `BK-MF8-08` e `RNF43` nos documentos canónicos consultados.
- Não há drift de matriz, backlog, contrato de campos, MF views, guia index ou sprint para o escopo `BK-MF8-08`.
- O drift interno reportado na auditoria anterior está fechado na versão atual do guia.

### Riscos restantes

- Esta execução é `auditar_apenas`; a implementação real do produto não foi alterada.
- `RoutinesPage.tsx` continua registada como superfície relacionada a rever durante a implementação do BK, para evitar formatos divergentes fora do histórico.
- A validação de produto indicada no guia deve ser executada pelo aluno quando aplicar o BK, porque esta passagem só reaudita documentação.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 continua a fornecer sessão, ownership e contratos técnicos de base.
- MF8 mantém `17` guias ativos, todos com `16` secções `####` e `7` passos `### Passo`.
- `BK-MF8-08` fica confirmado como guia de localização de datas visíveis.
- `BK-MF8-09` pode avançar assumindo que dados técnicos e texto visível estão separados.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Estrutura dos guias MF8: `PASS`, todos os `17` guias mantêm `16` secções `####` e `7` passos `### Passo`.
- Coerência canónica de `BK-MF8-08`: `PASS`, `RNF43`, `S12`, `P0`, `M`, owner `Daniel`, apoio `Kaua`, dependências `-` e próximo BK `BK-MF8-09` confirmados.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `apps/api` e `apps/web` não foram executados porque esta execução alterou apenas relatório de auditoria; os comandos ficam especificados no próprio BK para a implementação real.

### Bloqueios e TODOs restantes

- Bloqueios: nenhum.
- TODOs documentais restantes no escopo desta execução: nenhum.

---

## Execução 2026-07-02 - correção focada BK-MF8-08

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-08]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-08 - Datas no formato dd/mm/aaaa`, usando a auditoria imediatamente anterior como ponto de partida. O guia alvo foi atualizado para fechar as lacunas `F01` a `F04`: integração frontend concreta, contrato backend/ISO explícito, validação Playwright executável e inventário mínimo das superfícies de data.

Resultado final: `OK`. O guia mantém metadados canónicos de `RNF43`, usa apenas caminhos públicos `apps/api` e `apps/web`, preserva a estrutura ativa da MF8 com `16` secções `####` e `7` passos `### Passo`, e deixa `BK-MF8-09` pronto para assumir uma separação clara entre dados técnicos e texto visível.

### Documentos consultados nesta execução

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/api/src/modules/study/dto/study-event.dto.ts`
- `apps/api/src/modules/study/history.service.ts`
- `apps/api/src/modules/study/history.service.spec.ts`
- `apps/api/src/modules/study/schemas/study-event.schema.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/components/study/StudyHistoryList.tsx`
- `apps/web/src/pages/student/StudyHistoryPage.tsx`
- `apps/web/src/pages/student/RoutinesPage.tsx`
- `apps/web/playwright.config.ts`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-08 | OK | Guia agora contém helper frontend completo, cliente/histórico tipado, integração completa em `StudyHistoryList.tsx`, prova backend de ISO, validação Playwright e inventário de superfícies de data. | P0 |

### Findings corrigidos

#### F01 - Integração frontend fica aberta

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia passou a incluir código completo para `apps/web/src/lib/apiClient.ts`, `apps/web/src/pages/student/StudyHistoryPage.tsx` e `apps/web/src/components/study/StudyHistoryList.tsx`.
- Evidência no guia: `StudyHistoryEvent` substitui a lista sem tipo específico, `StudyHistoryPage` passa a guardar `StudyHistoryEvent[]`, e `StudyHistoryList` usa `formatDatePt(event.occurredAt)` sem formatação inline.

#### F02 - Contrato backend/ISO estava ambíguo

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia explicita que não há endpoint novo e que o backend deve preservar `occurredAt` como `Date`/ISO serializável.
- Evidência no guia: o passo 4 inclui teste completo em `apps/api/src/modules/study/history.service.spec.ts` com assert de `occurredAt.toISOString()`.

#### F03 - Testes pedidos não eram executáveis

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia removeu o catálogo de expected results como substituto de teste e passou a usar as ferramentas existentes: Jest no backend e Playwright no frontend.
- Evidência no guia: `apps/web/tests/e2e/mf8-date-format.spec.ts` importa `formatDatePt(...)`, valida `01/01/2026`, `Data inválida`, `Data indisponível` e renderização visível.

#### F04 - Cobertura de superfícies de data estava incompleta

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia passou a ter um passo próprio de inventário, separando o que é obrigatório neste BK (`StudyHistoryList`, `StudyHistoryPage`, `apiClient`) do que deve ser revisto ou registado (`RoutinesPage`, `study-alerts.service.ts`).
- Evidência no guia: `#### Arquitetura do BK` e `### Passo 2 - Inventariar superfícies de data`.

### Mapa de integracao da MF - foco BK-MF8-08

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- Ficheiro de relatório atualizado:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/format-date-pt.ts`
  - `apps/web/tests/e2e/mf8-date-format.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/pages/student/StudyHistoryPage.tsx`
  - `apps/web/src/components/study/StudyHistoryList.tsx`
  - `apps/api/src/modules/study/history.service.spec.ts`
  - `apps/api/src/modules/study/dto/study-event.dto.ts`
  - `apps/api/src/modules/study/history.service.ts`
  - `apps/api/src/modules/study/schemas/study-event.schema.ts`
  - `apps/web/src/pages/student/RoutinesPage.tsx`
  - `apps/api/src/modules/study-alerts/study-alerts.service.ts`
- Exports novos previstos pelo guia:
  - `formatDatePt`
  - `StudyHistoryEvent`
  - `listStudyHistory(): Promise<StudyHistoryEvent[]>`
- Endpoint previsto pelo guia: nenhum endpoint novo; mantém `GET /api/study/history`.
- DTOs/validators: reutilização de `StudyEventDto` e `HistoryQueryDto`.
- Schemas/modelos: reutilização de `StudyEvent`/`StudyEventSchema`; não há novo schema.
- Services: reutilização de `HistoryService`, com prova de preservação de ISO.
- Componentes/páginas frontend: `StudyHistoryPage` e `StudyHistoryList`.
- Providers de IA: nenhum.
- Regras de segurança/autorização: sessão existente no backend, sem `userId` enviado pelo frontend, sem logs/evidence com dados sensíveis.
- Testes previstos pelo guia:
  - `npm --prefix apps/api run test -- history.service.spec.ts`
  - `STUDYFLOW_E2E_START_SERVERS=false npm --prefix apps/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts`
- BK seguinte dependente: `BK-MF8-09`.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- A API preserva datas técnicas/ISO; a localização acontece na UI.
- `Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Lisbon" })` é decisão `DERIVADO` aceitável para apresentação controlada.
- Playwright é a validação frontend correta neste BK porque `apps/web` já tem Playwright e não tem runner unitário próprio.
- Não foi adicionada dependência nova.

### Decisões de domínio confirmadas

- `BK-MF8-08` entrega `RNF43`.
- Datas de histórico pertencem ao aluno autenticado e não devem implicar envio de `userId` pelo frontend.
- Localização de datas é requisito de apresentação, não mudança de persistência.
- `BK-MF8-09` pode partir desta base para centralizar mensagens/i18n futura.

### Decisões marcadas como DERIVADO

- Formatar datas só no frontend.
- Usar `Europe/Lisbon` na apresentação visível.
- Validar a unidade frontend com Playwright em vez de introduzir Vitest/Jest no `apps/web`.
- Rever `RoutinesPage.tsx` e `study-alerts.service.ts` como superfícies relacionadas sem transformar ambas em requisito obrigatório deste BK.

### Drift documental encontrado

- Não há drift de matriz, backlog, contrato de campos, MF views ou sprint.
- Foi corrigido o drift interno do guia entre `RNF43` e a ausência de integração/teste executável.

### Riscos restantes

- A implementação real do produto não foi alterada nesta execução; o guia está pronto para orientar o aluno, mas o código real ainda dependerá da execução do BK.
- `RoutinesPage.tsx` continua registada como superfície relacionada a rever durante implementação, para evitar formatos divergentes fora do histórico.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 continua a fornecer sessão, ownership e contratos técnicos de base.
- MF8 passa a ter `BK-MF8-08` fechado como guia de localização de datas.
- `BK-MF8-09` pode avançar assumindo que datas técnicas e texto visível estão separados.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Estrutura dos guias MF8: `PASS`, todos os `17` guias mantêm `16` secções `####` e `7` passos `### Passo`.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `apps/api` e `apps/web` não foram executados porque esta execução alterou apenas documentação de guia e relatório; os comandos ficam especificados no próprio BK para a implementação real.

### Bloqueios e TODOs restantes

- Bloqueios: nenhum.
- TODOs documentais restantes no escopo desta execução: nenhum.

---

## Execução 2026-07-02 - auditoria focada BK-MF8-08

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-08]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada auditoria focada ao `BK-MF8-08 - Datas no formato dd/mm/aaaa`, lendo a MF8 envolvente para coerência de sequência e consultando `real_dev/api` e `real_dev/web` apenas como referência privada. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta passagem é este bloco de relatório.

Resultado da auditoria: `PARCIAL`. O guia alvo está alinhado com `RNF43`, usa caminhos públicos `apps/api` e `apps/web`, tem `16` secções `####`, `7` passos `### Passo`, não contém caminhos `real_dev` nem linguagem interna proibida pela pesquisa obrigatória. Contudo, ainda não pode ficar `OK`, porque só entrega código completo para o helper `formatDatePt(...)`; deixa a integração real em `StudyHistoryList.tsx` e `RoomAiPage.tsx` sem código completo, mistura instruções backend genéricas apesar de declarar "sem endpoint novo", e substitui testes executáveis por um catálogo de expected results.

### Documentos consultados nesta execução

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
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md` por sequência, estrutura e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `apps/api/src/modules/study/schemas/study-event.schema.ts`
- `apps/api/src/modules/study/dto/study-event.dto.ts`
- `apps/api/src/modules/study/history.service.ts`
- `apps/api/src/modules/study-alerts/study-alerts.service.ts`
- `apps/api/package.json`
- `apps/web/package.json`
- `apps/web/src/components/study/StudyHistoryList.tsx`
- `apps/web/src/pages/student/StudyHistoryPage.tsx`
- `apps/web/src/pages/student/RoomAiPage.tsx`
- `apps/web/src/pages/student/RoutinesPage.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete a classificação herdada da execução global de 2026-06-30, que tinha marcado `BK-MF8-08` como `OK`. Esta execução não corrigiu o guia; apenas reavaliou a evidência atual.

### Resultado por BK analisado

| BK | Estado atual | Problema principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-08 | PARCIAL | Guia tem estrutura e helper de formatação, mas não inclui integração completa nas superfícies reais, não fornece testes executáveis e mantém instruções backend genéricas sem contrato claro. | P0 |

### Findings

#### F01 - Integração frontend fica aberta

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- Evidência:
  - O guia manda criar `apps/web/src/lib/format-date-pt.ts` e editar `apps/web/src/components/study/StudyHistoryList.tsx` e `apps/web/src/pages/student/RoomAiPage.tsx`.
  - O único código completo entregue é o helper `formatDatePt(...)`.
  - O passo 5 diz `Sem código neste passo` porque "a integração varia consoante a página real".
  - A implementação atual em `apps/web/src/components/study/StudyHistoryList.tsx` usa `events: unknown[]`, cast local e `new Date(item.occurredAt).toLocaleDateString("pt-PT")` inline.
  - `apps/web/src/pages/student/RoomAiPage.tsx` é listado pelo guia, mas o BK não mostra alteração concreta nessa página nem identifica que data visível deve ser formatada ali.
- Impacto técnico: o aluno tem de decidir sozinho como tipar eventos, onde importar o helper e que superfícies reais entram no requisito `RNF43`.
- Impacto pedagógico: o BK ensina o utilitário, mas não ensina a substituição real no componente, que é a parte observável da app.
- Risco de segurança/privacidade: baixo direto, mas manter `unknown[]` e casts locais incentiva payloads frouxos no frontend e dificulta validação de output observável.
- O que falta completar: mostrar a versão completa de `StudyHistoryList.tsx`, tipar o evento consumido, integrar `formatDatePt(...)` e justificar ou remover a edição de `RoomAiPage.tsx`.

#### F02 - Contrato backend/ISO está descrito de forma ambígua

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- Evidência:
  - A arquitetura declara `sem endpoint novo; API mantém datas ISO`.
  - O passo 4 pede "controller", "service", validação de sessão, ownership e resposta de sucesso/erro, mas a secção de código diz `Sem código neste passo`.
  - O contrato real de histórico usa `StudyEvent.occurredAt: Date` no schema e devolve `occurredAt` no DTO/service; o guia não mostra teste ou assert que prove que o backend continua a devolver ISO serializável.
- Impacto técnico: o aluno pode tentar criar endpoint ou service desnecessário, ou pode ignorar completamente a preservação ISO no contrato HTTP.
- Impacto pedagógico: o BK mistura um requisito de localização de apresentação com instruções genéricas de backend, sem dizer exatamente o que deve ou não mudar.
- O que falta completar: explicitar que o backend não deve formatar datas para `dd/mm/aaaa`, indicar o contrato DTO existente e acrescentar prova concreta de que a API continua a devolver data ISO/serializável.

#### F03 - Testes pedidos não são entregues como testes executáveis

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- Evidência:
  - O guia lista `apps/web/src/lib/format-date-pt.spec.ts` como ficheiro a criar.
  - O passo 6 pede data válida, data inválida e preservação de ISO.
  - O bloco de código entregue é `apps/api/src/modules/mf8/bk-mf8-08.expected-results.ts`, um catálogo de mensagens, não uma suite `.spec.ts` com asserts.
  - `apps/web/package.json` não tem script unitário para executar `*.spec.ts`; só expõe `build`, `test:e2e` e variantes Playwright.
- Impacto técnico: a validação fica sem comando executável claro.
- Impacto pedagógico: o aluno recebe expected results, mas não aprende a transformar esses resultados em asserts automatizados ou smoke reproduzível.
- O que falta completar: incluir uma suite executável compatível com a stack existente ou trocar para validação Playwright/smoke documentada, com comando, expected e observed.

#### F04 - Cobertura de superfícies de data é incompleta para `RNF43`

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- Evidência:
  - O BK pretende criar uma função partilhada, mas a árvore atual tem formatações inline em `apps/web/src/components/study/StudyHistoryList.tsx`, `apps/web/src/pages/student/RoutinesPage.tsx` e `apps/api/src/modules/study-alerts/study-alerts.service.ts`.
  - O guia só lista `StudyHistoryList.tsx`, `RoomAiPage.tsx` e o schema de histórico, sem inventário mínimo das superfícies visíveis de data.
- Impacto técnico: `RNF43` pode ficar aplicado apenas a uma parte da UI, mantendo formatos divergentes noutras páginas ou mensagens.
- Impacto pedagógico: o aluno não recebe critério claro para saber quando o requisito "datas no formato dd/mm/aaaa" está suficientemente coberto.
- O que falta completar: definir o inventário mínimo de datas visíveis no MVP e indicar quais ficam dentro/fora do BK, marcando decisões `CANONICO` ou `DERIVADO`.

### Pontos confirmados como corretos

- `RNF43` existe em `docs/RNF.md` como "Datas no formato dd/mm/aaaa.", categoria `Localização`, prioridade `Must`.
- `BK-MF8-08` está alinhado com `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: owner `Daniel`, apoio `Kaua`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-`, próximo BK `BK-MF8-09`.
- `MF-VIEWS.md` inclui a sequência MF8 de 17 BKs e aponta para o ficheiro correto.
- O guia tem exatamente `16` secções `####` e `7` passos `### Passo`.
- O guia não contém `real_dev`, `REFERENCE_ROOT`, `cd real_dev` ou `npm --prefix real_dev`.
- O guia não contém as marcas internas proibidas pesquisadas na prompt.

### Mapa de integracao da MF - foco BK-MF8-08

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/web/src/lib/format-date-pt.ts`
  - `apps/web/src/lib/format-date-pt.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-08.expected-results.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/web/src/components/study/StudyHistoryList.tsx`
  - `apps/web/src/pages/student/RoomAiPage.tsx`
  - `apps/api/src/modules/study/schemas/study-event.schema.ts`
  - `apps/api/src/app.module.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/api/package.json`
  - `apps/web/package.json`
- Exports produzidos previstos: `formatDatePt(...)`.
- Imports consumidos de BKs anteriores: histórico de estudo, sessão autenticada, contratos MF6/MF7 de segurança, cliente API web e superfícies de IA/sala quando existirem datas visíveis.
- Endpoint previsto pelo guia: nenhum endpoint novo; API deve continuar a devolver datas ISO/serializáveis.
- DTOs/validators esperados: DTOs existentes de histórico devem manter datas como contrato de dados, não como texto localizado.
- Schemas/modelos: reutilização de `StudyEvent` e `StudyEventSchema`; não há novo modelo.
- Services esperados: preservação de `occurredAt` como `Date`/ISO no backend; formatação só na apresentação.
- Componentes/páginas frontend esperados: `StudyHistoryList.tsx` e superfícies visíveis de datas com helper partilhado.
- Providers de IA: nenhum provider novo.
- Regras de segurança/autorização esperadas: sem nova regra de acesso; manter ownership/backend existente nos endpoints que devolvem os dados.
- Testes esperados: helper com data válida, data inválida e valor vazio; prova de que a API preserva ISO; smoke/integração visual para `dd/mm/aaaa`.
- BK seguinte dependente: `BK-MF8-09`, que não deve assumir localização fechada enquanto o guia de datas estiver `PARCIAL`.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `real_dev` foi usado apenas como referência privada e não aparece no texto do BK.
- A decisão de formatar datas no frontend e preservar ISO no backend é tecnicamente correta e deve ser mantida.
- `Europe/Lisbon` como timezone de apresentação é decisão `DERIVADO` aceitável para a defesa, mas precisa de teste e explicação de impacto.
- Criar uma função partilhada é melhor do que manter formatações inline, desde que o guia mostre a integração real.

### Decisões de domínio confirmadas

- `BK-MF8-08` pertence à localização/preparação futura e entrega `RNF43`.
- A localização de datas é apresentação, não deve alterar persistência nem contratos HTTP.
- Datas visíveis em histórico, rotinas, alertas ou superfícies de sala devem ser consistentes quando estiverem no MVP.
- `BK-MF8-09` depende de uma base de localização coerente para avançar para mensagens/i18n futura.

### Decisões marcadas como DERIVADO

- Formatar apenas na UI e preservar ISO na API.
- Usar `Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Lisbon" })`.
- Tratar data ausente como `Data indisponível` e data inválida como `Data inválida`.
- Inventariar superfícies visíveis de data antes de declarar `RNF43` completo.

### Drift documental encontrado

- Não há drift de matriz, backlog, contrato de campos, MF views ou links.
- Há drift entre a classificação anterior `OK` e a evidência atual de executabilidade: o guia está estruturado, mas ainda não está completo o suficiente para `OK`.
- Há drift interno no guia: a promessa de "função partilhada" e "testes" não se reflete em integração completa nem em suite executável.

### Riscos restantes

- Risco pedagógico: o aluno pode criar apenas `formatDatePt(...)` e deixar a UI real sem alteração.
- Risco técnico: formatos de data continuam espalhados por componentes e services.
- Risco de validação: `apps/web/src/lib/format-date-pt.spec.ts` pode não ser executado por nenhum script existente.
- Risco de handoff: `BK-MF8-09` pode assumir que a localização de datas está fechada quando `RNF43` ainda não tem prova completa.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 continua a fornecer contratos de segurança, fontes autorizadas e estrutura técnica.
- MF8 mantém sequência canónica de 17 BKs; `BK-MF8-07` foi recentemente fechado como guia de exportação e `BK-MF8-08` deve fechar localização de datas antes do i18n futuro.
- `BK-MF8-09` pode consumir a decisão de preservar ISO e centralizar apresentação, mas só depois de `BK-MF8-08` corrigir integração e validação.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- Pesquisa focada por `formatDatePt`, `format-date-pt`, `toLocaleDateString`, `Intl.DateTimeFormat`, `dd/mm` e `RNF43` em `apps`/`real_dev`: `PASS` como evidência de helper ainda ausente e de formatações inline existentes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `apps/api` e `apps/web` não foram executados porque esta execução é documental/audit-only e não alterou produto.

### Bloqueios e TODOs restantes

- Bloqueios: nenhum.
- TODOs documentais restantes no escopo desta execução:
  - Corrigir `BK-MF8-08` para incluir integração completa em frontend, prova explícita de ISO no backend e teste/smoke executável.

---

## Execução 2026-07-02 - correção focada BK-MF8-07

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-07]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-02`

### Síntese executiva

Foi executada correção focada ao `BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD`, sem editar ficheiros de produto. O guia alvo foi atualizado para fechar as lacunas da auditoria de 2026-07-01: endpoint/service completo, decisão PDF implementável, cliente/UI de exportação e suite `.spec.ts` real.

Resultado final: `OK`. O guia mantém metadados canónicos de `RNF40`, usa caminhos públicos `apps/api` e `apps/web`, preserva a estrutura ativa da MF8 com `16` secções `####` e `7` passos, e passa as validações textuais e documentais exigidas.

### Documentos consultados nesta execução

- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `apps/api/src/modules/ai/study-tools.controller.ts`
- `apps/api/src/modules/ai/study-tools.service.ts`
- `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `apps/api/src/modules/ai/ai.module.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/pages/student/StudyToolsPage.tsx`
- `apps/web/src/components/ai/SummaryPanel.tsx`
- `apps/web/src/components/ai/QuizPanel.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado final | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-07 | OK | Guia agora apresenta exportador backend completo, contrato HTTP alinhado com `study-tools`, cliente/UI de download, preparação PDF por HTML imprimível e testes focados. | P1 |

### Findings corrigidos

#### F01 - Endpoint e service de exportação

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia passou a usar `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`, alinhado com o controller existente, e inclui `ArtifactExportService` completo com validação de formato, `getMyStudyArea(...)`, filtro por `_id`, `userId`, `studyAreaId` e tipo exportável.
- Evidência no guia: `apps/api/src/modules/ai/artifact-export.service.ts`, `apps/api/src/modules/ai/study-tools.controller.ts` e `apps/api/src/modules/ai/ai.module.ts`.

#### F02 - PDF/MD

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia documenta Markdown como formato base e `format=pdf` como documento HTML de impressão, decisão `DERIVADO` sem nova dependência backend. A UI abre esse documento e aciona impressão para o browser guardar como PDF.
- Risco residual aceite: não há geração binária de PDF no backend; esta limitação fica explícita e implementável.

#### F03 - Frontend e cliente API

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia inclui `exportStudyToolArtifact(...)` em `apps/web/src/lib/apiClient.ts`, com `credentials: "include"`, `x-studyflow-csrf`, leitura textual da resposta e extração de `Content-Disposition`. Também inclui `ArtifactExportPanel` para `StudyToolsPage.tsx`, com estados vazio/loading/erro/sucesso e botões `Exportar MD`/`Preparar PDF`.

#### F04 - Testes reais de exportação

- Estado anterior: `PARCIAL`
- Estado final: `CORRIGIDO`
- Correção aplicada: o guia substitui o antigo catálogo de expected results por `apps/api/src/modules/ai/artifact-export.service.spec.ts`, com asserts para Markdown, HTML de impressão, formato inválido, artefacto inacessível e quiz sem resposta correta exportada.

### Mapa de integração da MF - foco BK-MF8-07

- Guias BK editados nesta execução:
  - `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- Ficheiro de relatório atualizado:
  - `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/api/src/modules/ai/artifact-export.service.ts`
  - `apps/api/src/modules/ai/artifact-export.service.spec.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/api/src/modules/ai/study-tools.controller.ts`
  - `apps/api/src/modules/ai/ai.module.ts`
  - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/pages/student/StudyToolsPage.tsx`
- Imports novos previstos pelo guia:
  - `ArtifactExportService`
  - `buildArtifactExportContentDisposition`
  - `exportStudyToolArtifact`
  - `ArtifactExportFormat`
  - `ArtifactExportFile`
- Exports novos previstos pelo guia:
  - `ArtifactExportService`
  - `validateArtifactExportFormat`
  - `renderAiArtifactMarkdown`
  - `renderAiArtifactPrintHtml`
  - `buildArtifactExportContentDisposition`
- Endpoint previsto pelo guia: `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`.
- Schemas/modelos: reutilização de `AiArtifact`/`AiArtifactSchema`; não há novo modelo.
- Providers de IA: nenhum provider novo; exportação usa artefactos persistidos.
- Regras de segurança/autorização: sessão real, ownership no backend, ausência de `userId` vindo do frontend, fontes limitadas e conteúdo escapado no HTML imprimível.
- BK seguinte dependente: `BK-MF8-08`, que pode assumir o contrato de exportação como guia fechado.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- A rota de exportação fica sob `study-tools`, porque esse é o controller já existente para artefactos de estudo.
- `AiArtifact` já contém `userId`, `studyAreaId`, `type`, `contentJson` e `sourcesJson`, logo não é necessário criar outro schema/model.
- A exportação não chama provider IA.
- `format=pdf` devolve HTML imprimível escapado; o browser faz o passo de guardar como PDF.

### Decisões de domínio confirmadas

- `BK-MF8-07` continua a entregar `RNF40`.
- Resumos e quizzes exportados são artefactos privados do aluno autenticado.
- Quizzes exportados não incluem respostas corretas por omissão.
- Fontes exportadas são minimizadas para não expor materiais privados completos.

### Decisões marcadas como DERIVADO

- Reutilizar a família de rotas `study-tools` em vez de criar `/ai/artifacts`.
- Usar Markdown como formato base.
- Usar HTML de impressão para preparar PDF sem dependência backend adicional.
- Exportar quizzes sem respostas corretas por omissão.
- Limitar fontes a título, localização curta e excerto controlado.

### Drift documental encontrado

- Não há drift de matriz, backlog, contrato de campos, MF views ou sprint.
- Foi corrigido o drift interno do guia entre `RNF40` e a ausência de implementação PDF/MD completa.
- Foi corrigido o drift entre o endpoint antigo sugerido no guia e a rota real existente em `StudyToolsController`.

### Riscos restantes

- O guia foi corrigido, mas o produto não foi alterado nesta execução por `MODO=corrigir_apenas`; a implementação real ainda dependerá de um BK de desenvolvimento.
- O PDF é preparado via browser a partir de HTML imprimível, não gerado como binário pelo backend.
- A suite de produto não foi executada porque não houve alteração de produto; foram executadas as validações documentais obrigatórias.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF7 continua a fornecer fontes autorizadas, ownership e limites IA.
- MF8 agora tem `BK-MF8-07` fechado como guia de exportação de resumos/quizzes.
- `BK-MF8-08` pode avançar assumindo que o contrato público de exportação está documentado, testável e coerente.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output; exit code `1` esperado para zero matches).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output; exit code `1` esperado para zero matches).
- Estrutura do guia alvo: `PASS`, `16` secções `####` e `7` passos `### Passo`.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `apps/api` e `apps/web` não foram executados porque esta execução não alterou produto; o objetivo foi corrigir o guia BK e o relatório.

### Bloqueios e TODOs restantes

- Bloqueios: nenhum.
- TODOs documentais restantes no escopo desta execução: nenhum.

---

## Execução 2026-07-01 - auditoria focada BK-MF8-07

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-07]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma auditoria focada ao `BK-MF8-07 - Exportação de resumos/quizzes em PDF/MD`, lendo a MF8 completa para coerência estrutural, handoff e validação textual, e consultando `real_dev/api` e `real_dev/web` como referência privada da implementação existente. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta passagem é este bloco de relatório.

Resultado da re-auditoria: `PARCIAL`. O guia alvo cumpre a estrutura formal ativa da MF8, mantém metadados canónicos de `RNF40`, usa caminhos públicos `apps/api` e `apps/web`, e não contém linguagem interna proibida nem caminhos privados. No entanto, ainda não pode ficar `OK`, porque a exportação fica descrita por intenção e por uma unidade Markdown isolada, sem código completo de integração no controller/service, sem cliente/UI de download, sem prova real de PDF e sem suite `.spec.ts` com ownership e formato inválido.

### Documentos consultados nesta execução

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
- `docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md` por estrutura, sequência e handoff.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `apps/api/src/modules/ai/study-tools.controller.ts`
- `apps/api/src/modules/ai/study-tools.service.ts`
- `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/pages/student/StudyToolsPage.tsx`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai/study-tools.service.ts`
- `real_dev/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `real_dev/api/src/modules/ai/ai.module.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete a classificação existente no relatório de 2026-06-30 para este BK. Esta execução não corrigiu o guia, apenas reavaliou evidência atual.

### Resultado por BK analisado

| BK | Estado atual | Problema principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-07 | PARCIAL | O guia tem estrutura e helper Markdown inicial, mas não fornece código completo para endpoint/service, cliente frontend/UI, PDF e testes reais de exportação. | P1 |

### Findings

#### F01 - Endpoint e service de exportação ficam instruídos, mas não ficam demonstrados

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- Evidência:
  - A arquitetura declara `GET /api/study-areas/:id/ai/artifacts/:artifactId/export?format=md` como contrato principal.
  - O passo 3 cria apenas `renderAiArtifactMarkdown(...)` em `apps/api/src/modules/ai/artifact-export.service.ts`.
  - O passo 4 lista `apps/api/src/modules/ai/study-tools.controller.ts`, `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts` e `apps/api/src/app.module.ts`, mas a secção de código diz `Sem código neste passo`.
  - A implementação atual em `apps/api/src/modules/ai/study-tools.controller.ts` e `real_dev/api/src/modules/ai/study-tools.controller.ts` expõe `GET /api/study-areas/:id/study-tools`, `POST /api/study-areas/:id/study-tools`, `POST /api/study-areas/:id/study-tools/quiz-jobs`, `GET /api/study-areas/:id/study-tools/quiz-jobs/:jobId` e `POST /api/study-areas/:id/study-tools/:artifactId/quiz-attempts`; não há rota de exportação.
  - A implementação atual em `StudyToolsService` já filtra artefactos por `userId` e `studyAreaId` ao listar/submeter quizzes, mas o guia não mostra a função completa que deve procurar o artefacto exportável, validar `format`, confirmar ownership e devolver conteúdo/headers.
- Impacto técnico: o aluno ainda tem de decidir path real, decorator NestJS, validação de query `format`, Content-Type/Content-Disposition, integração no service e erro para artefacto inexistente/proibido.
- Impacto pedagógico: a zona mais importante do BK fica aberta precisamente onde a prompt exige código completo, integrado e executável.
- Risco de segurança/privacidade: uma integração por adivinhação pode exportar artefactos de outro aluno, aceitar `artifactId` sem filtro de `userId`/`studyAreaId`, ou devolver conteúdo privado sem minimização.
- O que falta completar: mostrar a função completa no `StudyToolsService` e o método completo no `StudyToolsController`, preservando sessão, ownership backend, validação de formato e erros controlados.

#### F02 - O requisito PDF/MD fica reduzido a Markdown e intenção de PDF

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- Evidência:
  - `RNF40` define "Exportação de resumos/quizzes em PDF/MD".
  - O guia declara botões `Exportar MD` e `Preparar PDF`, mas o contrato técnico principal é apenas `format=md`.
  - O único código de exportação renderiza Markdown; não há código para `format=pdf`, conversão PDF controlada, fallback explícito para impressão/browser, nem critério que limite o MVP a Markdown como decisão `DERIVADO`.
  - O handoff diz que o próximo BK pode assumir "exportador Markdown/PDF simples", mas a implementação mostrada não entrega PDF.
- Impacto técnico: o aluno pode terminar apenas com `.md` e declarar `RNF40` concluído sem uma decisão defensável sobre PDF.
- Impacto pedagógico: a diferença entre "exportar PDF" e "preparar PDF" fica ambígua.
- O que falta completar: decidir e documentar de forma implementável uma de duas opções: exportação PDF real com código e validação, ou Markdown como formato base com "imprimir/guardar como PDF" explicitamente tratado como limitação MVP e evidence própria.

#### F03 - Frontend e cliente API não têm código completo

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- Evidência:
  - O passo 5 pede cliente API tipado, `credentials: "include"`, estados loading/vazio/erro/sucesso e botões de exportação.
  - A secção de código do passo 5 diz `Sem código neste passo` porque "a integração varia consoante a página real".
  - O `apps/web/src/lib/apiClient.ts` atual tem `listSummaries(...)`, `listStudyTools(...)`, `generateStudyTool(...)`, `createQuizGenerationJob(...)`, `getQuizGenerationJob(...)` e `submitQuizAttempt(...)`, mas não tem função de exportação/download.
  - O `apps/web/src/pages/student/StudyToolsPage.tsx` atual mostra listas, geração e painéis de artefactos, mas não mostra botões `Exportar MD`/`Preparar PDF`.
- Impacto técnico: o aluno tem de inventar como descarregar blob/texto, como nomear ficheiros, como tratar erro 403/404/422, e onde renderizar os botões.
- Impacto pedagógico: o frontend fica descrito como intenção, não como tutorial aplicável por um aluno do 12.o ano.
- O que falta completar: incluir função completa de cliente API e alteração completa da página/componente com estados, mensagens PT-PT, `credentials: "include"` herdado do helper e download seguro.

#### F04 - Testes pedidos não são entregues como testes

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- Evidência:
  - O guia lista `apps/api/src/modules/ai/artifact-export.service.spec.ts` como ficheiro a criar.
  - O passo 6 pede testes para caminho feliz, ownership, formato inválido e markdown com fontes mínimas.
  - O bloco de código entregue é apenas `apps/api/src/modules/mf8/bk-mf8-07.expected-results.ts`, um catálogo de mensagens, não uma suite `.spec.ts` com asserts sobre `renderAiArtifactMarkdown(...)`, service integrado ou controller.
- Impacto técnico: `RNF40` não fica provado por teste automatizado ou smoke controlado.
- Impacto pedagógico: o aluno recebe expected results, mas não aprende a transformar esses resultados em asserts executáveis.
- O que falta completar: incluir pelo menos uma suite `artifact-export.service.spec.ts` com caminho feliz `SUMMARY`/`QUIZ`, formato inválido, artefacto de outro aluno e fontes limitadas; se houver controller, incluir teste do contrato HTTP ou indicar smoke exato.

### Pontos confirmados como corretos

- `RNF40` existe em `docs/RNF.md` como "Exportação de resumos/quizzes em PDF/MD", categoria `Compatibilidade`, prioridade `Should`.
- `BK-MF8-07` está alinhado com `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: owner `Kaua`, apoio `Guilherme`, prioridade `P1`, esforço `S`, sprint `S12`, dependências `-`, próximo BK `BK-MF8-08`.
- `MF-VIEWS.md` inclui a sequência MF8 de 17 BKs e aponta para o ficheiro correto.
- O guia tem exatamente `16` secções `####` e `7` passos `### Passo`.
- Todos os `17` guias MF8 mantêm o contrato estrutural de `16` secções e `7` passos.
- O guia não contém `real_dev`, `REFERENCE_ROOT`, `cd real_dev` ou `npm --prefix real_dev`.
- O guia não contém as marcas internas proibidas pesquisadas na prompt.
- A validação documental global passa com `107` BK na matriz, `107` no backlog e `107` guias.

### Mapa de integracao da MF - foco BK-MF8-07

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o BK manda criar:
  - `apps/api/src/modules/ai/artifact-export.service.ts`
  - `apps/api/src/modules/ai/artifact-export.service.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-07.expected-results.ts`
- Ficheiros que o BK manda editar/rever:
  - `apps/api/src/modules/ai/study-tools.controller.ts`
  - `apps/web/src/pages/student/StudyToolsPage.tsx`
  - `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`
  - `apps/api/src/app.module.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/src/lib/apiClient.ts`
- Exports produzidos previstos: `ExportableAiArtifact` e `renderAiArtifactMarkdown(...)`.
- Imports consumidos de BKs anteriores: sessão autenticada, `SessionGuard`, `StudyToolsService`, `AiArtifact`, `AiArtifactType`, modelos de artefactos IA, cliente API com cookies e contratos de resumos/quizzes já existentes.
- Endpoint previsto pelo guia: `GET /api/study-areas/:id/ai/artifacts/:artifactId/export?format=md`.
- Endpoint atual existente na app: `GET /api/study-areas/:id/study-tools` e restantes rotas de study tools; não existe exportação atual.
- DTOs/validators esperados: validação de `artifactId` e query `format`, com erro estável para formato inválido.
- Schemas/modelos: reutilização de `AiArtifact`/`AiArtifactSchema`.
- Services esperados: método backend que consulta artefacto por `_id`, `userId` e `studyAreaId` antes de renderizar.
- Componentes/páginas frontend esperados: botões de exportação na página de ferramentas IA ou nos painéis de resumo/quiz, com loading, erro e sucesso.
- Providers de IA: não há provider novo; exportação deve usar artefactos já persistidos e autorizados.
- Regras de segurança/autorização esperadas: sessão real, ownership no backend, ausência de `userId` vindo do body/query, fontes limitadas e logs/evidence sem conteúdo sensível completo.
- Testes esperados: caminho feliz de resumo/quiz, artefacto de outro aluno, formato inválido e fontes limitadas.
- BK seguinte dependente: `BK-MF8-08`, que deve assumir exportação fechada apenas depois de este BK ser corrigido.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `real_dev` foi usado apenas como referência privada e não aparece no texto do BK.
- A app já tem `AiArtifact` com `userId`, `studyAreaId`, `type`, `contentJson` e `sourcesJson`, o que torna viável uma exportação segura sem criar outro modelo.
- A exportação não precisa de chamar provider IA; deve usar artefactos persistidos e previamente autorizados.
- Markdown como formato base é uma decisão `DERIVADO` aceitável, mas só fecha `RNF40` se a decisão sobre PDF ficar implementável e defendida no guia.

### Decisões de domínio confirmadas

- `BK-MF8-07` pertence ao fecho de produto/compatibilidade e depende dos fluxos de resumo/quiz já introduzidos em fases anteriores.
- Resumos e quizzes exportados são artefactos privados do aluno ou artefactos autorizados; ownership continua a ser regra backend.
- A exportação deve minimizar fontes: título/localização/excerto curto quando existir, nunca material privado completo.
- `BK-MF8-08` não deve assumir exportação final enquanto o guia `BK-MF8-07` estiver `PARCIAL`.

### Drift documental encontrado

- Não há drift de matriz, backlog, contrato de campos, MF views ou links.
- Há drift entre a classificação anterior `OK` e a evidência atual de executabilidade: o guia está bem estruturado, mas não está completo o suficiente para `OK`.
- Há drift interno no próprio BK: o título e `RNF40` prometem PDF/MD, mas o contrato técnico demonstrado cobre apenas Markdown.

### Riscos restantes

- Risco pedagógico: o aluno pode criar apenas o helper Markdown e não conseguir ligar a exportação ao endpoint real.
- Risco técnico: o endpoint de exportação pode ficar ausente ou com path divergente do cliente frontend.
- Risco de segurança/privacidade: uma implementação inferida pode consultar artefactos sem filtro de `userId`/`studyAreaId` ou exportar fontes completas.
- Risco de handoff: `BK-MF8-08` pode tratar `BK-MF8-07` como fechado quando ainda falta prova de exportação real.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências (`rg` sem output).
- Estrutura dos guias MF8: `PASS`, todos os `17` guias mantêm `16` secções `####` e `7` passos `### Passo`; `BK-MF8-07` também tem `16`/`7`.
- Pesquisa focada por exportação em `apps/api`, `apps/web`, `real_dev/api` e `real_dev/web`: `PASS` como evidência de ausência de implementação atual de `artifact-export`, `format=md`, `format=pdf`, `/export`, `Exportar MD` e `Preparar PDF`.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`, score `100`.

### Validações não executadas

- Testes de produto `npm --prefix apps/api ...` e `npm --prefix apps/web ...` não foram executados porque esta execução é `auditar_apenas` e os ficheiros reais de exportação ainda não existem; executar essas suites validaria o produto atual, não a completude do guia corrigido.

### Bloqueios e TODOs restantes

- Sem bloqueio ambiental.
- `TODO`: em modo de correção futuro, completar o guia com código real de integração backend, cliente frontend/UI, decisão implementável para PDF e suite `.spec.ts` de exportação. Não foi aplicado nesta execução porque `MODO=auditar_apenas`.

---

## Execução 2026-07-01 - re-auditoria focada BK-MF8-06

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-06]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada re-auditoria fresca ao `BK-MF8-06 - Suporte a importação UTF-8 e PT-PT`, sem assumir automaticamente o resultado da correção anterior. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado nesta passagem. A única alteração desta execução é este bloco de relatório.

Resultado da re-auditoria: `OK`. O guia alvo cumpre a estrutura formal ativa da MF8, mantém metadados canónicos de `RNF39`, não contém linguagem interna proibida nem caminhos privados, e entrega um percurso implementável para normalização UTF-8/PT-PT em backend, indexação, UI e testes.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da correção anterior | 1 | 0 | 0 |
| Estado apurado nesta re-auditoria | 1 | 0 | 0 |
| Estado após esta execução audit-only | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Justificação | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-06 | OK | Guia autocontido, com código de normalização, integração backend, UI, testes, negativos e handoff coerente para `BK-MF8-07`. | P0 |

### Findings

Nenhum finding aberto nesta re-auditoria.

Os três findings da auditoria anterior continuam fechados:

- F01 - Integração backend: fechado. O guia mostra `normalizePortugueseStudyText(...)`, `MaterialsService.markIndexedText(...)`, `MaterialsService.submitTextMaterial(...)`, helper privado de normalização, `MaterialIndexService.extractPrivateMaterial(...)`, `extractOfficialMaterial(...)` e `toReadableExtraction(...)`.
- F02 - Testes executáveis: fechado. O guia inclui teste unitário da normalização e adições focadas às suites de `materials.service` e `material-index.service`.
- F03 - Frontend e mensagens PT-PT: fechado. O guia mostra helpers de cliente API, polling de job, `role="alert"` e fallback público `"O material não tem texto legível para estudar."`.

### Pontos confirmados como corretos

- `RNF39` existe em `docs/RNF.md` como suporte a importação UTF-8 e PT-PT, categoria `Compatibilidade`, prioridade `Must`.
- `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `ANEXO-RNF-PARA-BKS.md`, `ANEXO-BK-SPRINT-OWNER.md`, `ANEXO-CORE-DUAL-BK.md` e `guias-bk/README.md` confirmam `BK-MF8-06`, owner `Kaua`, apoio `Natalia`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-`, `RNF39` e handoff para `BK-MF8-07`.
- O guia tem exatamente `16` secções `####` depois do header e `7` passos `### Passo`.
- Todos os `17` guias MF8 mantêm o contrato estrutural de `16` secções e `7` passos.
- O guia usa apenas caminhos públicos `apps/api` e `apps/web` nos blocos destinados aos alunos.
- O guia evita prometer OCR, RAG, embeddings, tradução completa ou endpoints duplicados.
- O guia mantém `userId` como dado vindo da sessão/backend e não do body enviado pelo frontend.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros de produto consultados como referência estrutural:
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/api/src/modules/material-index/material-index.service.ts`
  - `apps/api/src/modules/material-index/material-index.controller.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/components/materials/MaterialList.tsx`
  - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
- Ficheiros que o guia manda criar:
  - `apps/api/src/common/text/pt-text-normalization.ts`
  - `apps/api/src/common/text/pt-text-normalization.spec.ts`
- Ficheiros que o guia manda editar:
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/api/src/modules/materials/materials.service.spec.ts`
  - `apps/api/src/modules/material-index/material-index.service.ts`
  - `apps/api/src/modules/material-index/material-index.service.spec.ts`
  - `apps/web/src/components/materials/MaterialList.tsx`
- Endpoints reais preservados:
  - `POST /api/study-areas/:studyAreaId/materials`
  - `POST /api/study-areas/:studyAreaId/materials/file`
  - `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs`
  - `GET /api/material-index-jobs/:jobId`
- Contratos entregues para `BK-MF8-07`:
  - texto normalizado em `NFC`;
  - acentos e cedilhas preservados;
  - falha controlada quando não existe texto legível;
  - UI com mensagem PT-PT para job `FAILED`;
  - testes focados de normalização e integração.

### Coerência MF

- `BK-MF8-05` continua a preparar o fecho visual e faz handoff para `BK-MF8-06`.
- `BK-MF8-06` entrega compatibilidade UTF-8/PT-PT sem alterar contratos de materiais fora do requisito.
- `BK-MF8-07` pode construir exportação PDF/MD sobre texto normalizado, sem repetir a regra Unicode.
- A MF8 completa mantém `17` guias listados e validados.

### Verificações executadas

| Comando | Resultado |
| --- | --- |
| `rg -n '^#### |^### Passo ' docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md` | `16` secções `####` e `7` passos `### Passo`. |
| `awk 'BEGIN{fail=0} /^#### /{sections[FILENAME]++} /^### Passo /{steps[FILENAME]++} END{for (f in sections){print f, sections[f], steps[f]; if (sections[f] != 16 || steps[f] != 7) fail=1} exit fail}' docs/planificacao/guias-bk/MF8/*.md` | Todos os `17` guias MF8 mantêm `16` secções e `7` passos. |
| Pesquisa obrigatória de linguagem interna proibida nos guias MF8 | Sem ocorrências. |
| Pesquisa obrigatória de caminhos privados nos guias MF8 | Sem ocorrências. |
| `git diff --check` | Sem output. |
| `bash scripts/validate-planificacao.sh` | `overall_pass: true`, score `100`. |

### Validações não executadas

- `npm --prefix apps/api run test -- pt-text-normalization materials.service material-index.service` não foi executado nesta re-auditoria porque o modo é `auditar_apenas` e o ficheiro `apps/api/src/common/text/pt-text-normalization.ts` é criado pelo aluno ao aplicar o guia. Executar essa suite agora validaria o produto antes da implementação descrita pelo BK, não a qualidade do guia.

### Riscos residuais

- Risco residual baixo: como a execução é docs-only, a implementação real em `apps/` continua dependente da aplicação futura do guia pelo aluno.
- O ponto de maior atenção na implementação será garantir que o aluno adiciona o helper de normalização antes de substituir os métodos de `MaterialsService` e `MaterialIndexService`.

## Execução 2026-07-01 - correção focada BK-MF8-06

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-06]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi corrigido o guia `BK-MF8-06 - Suporte a importação UTF-8 e PT-PT`, mantendo escopo estrito sobre o guia alvo e este relatório. A correção fecha os três findings da auditoria anterior: integração backend, testes executáveis e feedback PT-PT no frontend.

Resultado após correção: `OK`. O guia passa a entregar um percurso linear e implementável para `RNF39`, com normalização Unicode/PT-PT no backend, integração nos fluxos reais de materiais e indexação, erro visível na UI para conteúdo sem texto legível e testes focados para os comportamentos críticos.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da auditoria focada anterior | 0 | 1 | 0 |
| Estado após correção | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado anterior | Estado atual | Resultado |
| --- | --- | --- | --- |
| BK-MF8-06 | PARCIAL | OK | Guia corrigido para implementar `RNF39` com código completo, testes e validação. |

### Findings corrigidos

#### F01 - Integração backend

- Estado: `CORRIGIDO`
- Evidência de correção:
  - O passo 3 cria `apps/api/src/common/text/pt-text-normalization.ts` com `normalizePortugueseStudyText(...)`, preservação de acentos/cedilhas, normalização `NFC` e rejeição de texto sem conteúdo legível.
  - O passo 4 mostra alterações concretas para `apps/api/src/modules/materials/materials.service.ts`, incluindo `submitTextMaterial(...)`, `markIndexedText(...)` e helper privado de normalização.
  - O passo 4 também integra a normalização em `apps/api/src/modules/material-index/material-index.service.ts`, cobrindo material privado `TOPIC`, `URL`, `PDF`, `DOCX` e material oficial textual.
  - O guia preserva validação de sessão/ownership e não expõe `contentText` em contratos públicos.

#### F02 - Testes executáveis

- Estado: `CORRIGIDO`
- Evidência de correção:
  - O passo 6 inclui `apps/api/src/common/text/pt-text-normalization.spec.ts` com asserts para acentos, cedilhas, `NFC`, whitespace e caracteres de substituição.
  - O passo 6 acrescenta testes de integração orientados a `apps/api/src/modules/materials/materials.service.spec.ts`.
  - O passo 6 acrescenta testes orientados a `apps/api/src/modules/material-index/material-index.service.spec.ts`, cobrindo extração sem texto legível.

#### F03 - Frontend e mensagens PT-PT

- Estado: `CORRIGIDO`
- Evidência de correção:
  - O passo 5 documenta os helpers reais `indexPrivateMaterial(...)` e `getMaterialIndexJob(...)` em `apps/web/src/lib/apiClient.ts`.
  - O passo 5 entrega uma versão concreta de `apps/web/src/components/materials/MaterialList.tsx` com estado de indexação, `role="alert"` e mensagem PT-PT para material sem texto legível.
  - O guia mantém autenticação por cookies HttpOnly via `credentials: "include"` no cliente existente.

### Pontos de integração da MF

- Guia editado nesta execução: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`.
- Relatório atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum, porque o modo é `corrigir_apenas`.
- Ficheiros que o guia manda criar:
  - `apps/api/src/common/text/pt-text-normalization.ts`
  - `apps/api/src/common/text/pt-text-normalization.spec.ts`
- Ficheiros que o guia manda editar:
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/api/src/modules/materials/materials.service.spec.ts`
  - `apps/api/src/modules/material-index/material-index.service.ts`
  - `apps/api/src/modules/material-index/material-index.service.spec.ts`
  - `apps/web/src/components/materials/MaterialList.tsx`
- Ficheiros que o guia manda rever sem alterar se já estiverem corretos:
  - `apps/api/src/modules/material-index/material-index.controller.ts`
  - `apps/web/src/lib/apiClient.ts`
  - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
- Endpoints reais usados no guia:
  - `POST /api/study-areas/:studyAreaId/materials`
  - `POST /api/study-areas/:studyAreaId/materials/file`
  - `POST /api/student/study-areas/:studyAreaId/materials/:materialId/index-jobs`
  - `GET /api/material-index-jobs/:jobId`

### Decisões técnicas e domínio

- `normalize("NFC")` mantém os caracteres PT-PT e estabiliza texto Unicode antes de persistência/indexação.
- O guia rejeita texto vazio, whitespace e texto dominado por caracteres de substituição antes de marcar material como processável.
- A normalização fica no backend como ponto de confiança; a UI apenas apresenta estado e erro legível.
- A decisão de usar mensagem genérica para conteúdo sem texto legível reduz exposição de material privado.

### Coerência MF

- `BK-MF8-05` continua a entregar aproximação visual ao mockup e não é alterado por esta correção.
- `BK-MF8-06` fica pronto para fornecer texto normalizado ao fluxo seguinte.
- `BK-MF8-07` pode depender de texto processável para exportação PDF/MD sem assumir comportamento fora de `RNF39`.
- Não foi detetado drift documental ativo entre `RNF39`, matriz, backlog, contrato de campos, anexos e guia corrigido.

### Verificações executadas

| Comando | Resultado |
| --- | --- |
| `rg -n "^#### |^### Passo " docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md` | `16` secções `####` e `7` passos `### Passo`. |
| `awk 'BEGIN{fail=0} /^#### /{sections[FILENAME]++} /^### Passo /{steps[FILENAME]++} END{for (f in sections){print f, sections[f], steps[f]; if (sections[f] != 16 || steps[f] != 7) fail=1} exit fail}' docs/planificacao/guias-bk/MF8/*.md` | Todos os `17` guias MF8 mantêm `16` secções e `7` passos. |
| Pesquisa obrigatória de linguagem interna proibida nos guias MF8 | Sem ocorrências. |
| Pesquisa obrigatória de caminhos privados nos guias MF8 | Sem ocorrências. |
| `git diff --check` | Sem output. |
| `bash scripts/validate-planificacao.sh` | `overall_pass: true`, score `100`. |

### Riscos residuais

- Esta execução corrige documentação de execução para alunos; não implementa o produto em `apps/`.
- A suite `npm --prefix apps/api run test -- pt-text-normalization materials.service material-index.service` deve ser executada pelo aluno depois de aplicar o guia no código, porque os ficheiros novos descritos no BK ainda não fazem parte desta execução docs-only.
- O risco residual principal é erro humano na transcrição do código do guia para o produto; o guia mitiga esse risco com ficheiros, funções, testes e comandos explícitos.

## Execução 2026-07-01 - auditoria focada BK-MF8-06

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-06]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada auditoria fresca ao `BK-MF8-06 - Suporte a importação UTF-8 e PT-PT`. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única atualização desta execução é este relatório.

Resultado da auditoria: `PARCIAL`. O guia alvo já cumpre a estrutura formal da MF8, não contém linguagem interna proibida nem caminhos privados, e mantém os metadados canónicos de `RNF39`. Contudo, ainda não pode ser classificado como `OK`, porque a implementação real do requisito fica incompleta nos passos críticos: a integração backend é descrita sem código completo, o frontend fica genérico e os testes prometidos não são entregues como suite executável.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado do relatório anterior | 1 | 0 | 0 |
| Estado apurado nesta auditoria | 0 | 1 | 0 |
| Estado após esta execução audit-only | 0 | 1 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Problema principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-06 | PARCIAL | Estrutura correta, mas falta código completo para integrar normalização UTF-8/PT-PT nos fluxos reais de materiais, indexação, UI e testes. | P0 |

### Findings

#### F01 - Integração backend fica aberta no ponto central do BK

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- Evidência:
  - O guia declara `POST /api/study-areas/:id/materials` como contrato principal e lista `apps/api/src/modules/materials/materials.service.ts` como ficheiro a editar.
  - O passo 3 mostra apenas `apps/api/src/common/text/pt-text-normalization.ts`; a própria instrução manda integrar a função no service, mas não mostra a função completa alterada.
  - O passo 4, que devia ligar a normalização ao backend, diz `Sem código neste passo`.
  - A implementação atual em `apps/api/src/modules/materials/materials.service.ts` usa `input.topicText?.trim()` em `submitTextMaterial(...)` e `contentText.slice(0, 10000)` em `markIndexedText(...)`, sem normalização NFC nem `hasReadableContent`.
  - O fluxo real de importação de PDFs/DOCX/URLs também passa por `apps/api/src/modules/material-index/material-index.service.ts`, em `indexPrivateMaterial(...)`, `processQueuedPrivateJob(...)`, `extractPrivateMaterial(...)`, `extractPdfText(...)`, `extractDocxText(...)` e `fetchTextFromUrl(...)`; o guia não explica onde normalizar texto extraído antes de criar chunks ou persistir `contentText`.
- Impacto técnico: o aluno ainda tem de decidir onde importar `normalizePortugueseStudyText(...)`, se a normalização entra em `submitTextMaterial(...)`, `markIndexedText(...)`, `MaterialIndexService` ou em mais do que um ponto, e como tratar texto sem conteúdo legível.
- Impacto pedagógico: a peça mais importante do BK fica implícita, contrariando o requisito de tutorial linear com código completo.
- Risco de segurança/privacidade: uma integração improvisada pode marcar como `READY` material sem texto processável ou criar chunks vazios para IA, enfraquecendo o bloqueio sem fontes.
- O que falta completar: mostrar código completo ou função completa para os pontos reais de integração backend, preservando sessão, ownership, ausência de dados sensíveis em logs e erro PT-PT estável para texto não legível.

#### F02 - Testes prometidos não são entregues como testes executáveis

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- Evidência:
  - O guia lista `apps/api/src/common/text/pt-text-normalization.spec.ts` como ficheiro a criar.
  - O passo 6 pede testes para texto com acentos, texto vazio e caracteres substituídos.
  - O bloco de código entregue no passo 6 é `apps/api/src/modules/mf8/bk-mf8-06.expected-results.ts`, um contrato didático de mensagens, não uma suite `.spec.ts` com asserts.
  - A pesquisa atual em `apps/api` e `real_dev/api` não encontrou `normalizePortugueseStudyText`, `pt-text-normalization`, `NFC` ou `hasReadableContent`.
- Impacto técnico: `RNF39` fica sem prova automatizada direta.
- Impacto pedagógico: o aluno recebe expected results textuais, mas não recebe o modelo de teste que deve executar.
- O que falta completar: incluir `pt-text-normalization.spec.ts` com asserts para acentos/cedilhas preservados, normalização NFC, texto vazio/whitespace, caracteres substituídos e integração com o service ou indexação.

#### F03 - Frontend e mensagens PT-PT ficam genéricos

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- Evidência:
  - O scope promete mensagens PT-PT quando o ficheiro não tem texto legível.
  - O passo 5 pede cliente API tipado, `credentials: "include"`, estados loading/vazio/erro/sucesso e mensagens visíveis em português de Portugal.
  - A secção de código do passo 5 diz `Sem código neste passo` porque a integração "varia consoante a página real".
  - O componente atual `apps/web/src/components/materials/MaterialSubmitForm.tsx` mostra validação local de campos e a mensagem devolvida pela API, mas o guia não mostra alteração concreta para erros de texto não legível ou indexação falhada.
- Impacto técnico: a UI pode continuar sem estado específico para ficheiro sem texto processável, embora esse seja um comportamento central do BK.
- Impacto pedagógico: o aluno continua a inferir onde e como apresentar a mensagem PT-PT.
- O que falta completar: incluir código completo ou alteração concreta no componente/cliente real para apresentar o erro de conteúdo não legível sem expor material privado, mantendo cookies HttpOnly e `credentials: "include"` nos helpers existentes.

### Pontos confirmados como corretos

- `RNF39` existe em `docs/RNF.md` como requisito de compatibilidade `Must`.
- `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `guias-bk/README.md` e anexos confirmam `BK-MF8-06`, owner `Kaua`, apoio `Natalia`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-`, `RNF39` e handoff para `BK-MF8-07`.
- A estrutura formal do guia alvo tem 16 secções `####` e 7 passos `### Passo`.
- Todos os 17 guias MF8 mantêm 16 secções `####` e 7 passos `### Passo`.
- As pesquisas obrigatórias nos guias MF8 não encontraram linguagem interna proibida, `payload: unknown`, `as any`, tokens em storage, `real_dev` ou `REFERENCE_ROOT`.
- Não há drift documental ativo de matriz/backlog para `BK-MF8-06`.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Ficheiros que o guia promete criar:
  - `apps/api/src/common/text/pt-text-normalization.ts`
  - `apps/api/src/common/text/pt-text-normalization.spec.ts`
  - `apps/api/src/modules/mf8/bk-mf8-06.expected-results.ts`
- Ficheiros que o guia promete editar/rever:
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
  - `apps/api/src/app.module.ts`
  - `apps/web/src/features/mf3/request-mf3-json.ts`
  - `apps/web/src/lib/apiClient.ts`
- Contratos reais relacionados:
  - `POST /api/study-areas/:studyAreaId/materials`
  - `POST /api/study-areas/:studyAreaId/materials/file`
  - `MaterialIndexService.indexPrivateMaterial(...)`
  - `MaterialIndexService.processQueuedPrivateJob(...)`
- Export principal prometido: `normalizePortugueseStudyText(...)`.
- Regras de segurança/autorização: sessão via backend, ownership da área/material, não exposição de `contentText` no contrato público e ausência de dados sensíveis em logs/evidence.
- BK seguinte dependente: `BK-MF8-07`, que não deve assumir `BK-MF8-06` como fechado enquanto estes findings estiverem abertos.

### Decisões técnicas confirmadas

- `normalize("NFC")` é uma decisão `DERIVADO` aceitável para estabilizar Unicode sem remover acentos.
- Não transliterar acentos é uma decisão `DERIVADO` correta para cumprir PT-PT.
- A normalização deve ocorrer no backend antes de persistir ou indexar texto usado como fonte processável.
- O fluxo real de importação não se limita ao endpoint JSON; ficheiros e URLs passam por indexação textual e também precisam de cobertura.

### Decisões de domínio confirmadas

- Compatibilidade UTF-8/PT-PT pertence ao fecho de produto e qualidade operacional da experiência StudyFlow.
- Materiais privados continuam limitados ao aluno autenticado.
- Conteúdo extraído de materiais não deve aparecer em logs, screenshots ou evidence completa.
- A UI deve comunicar falhas de texto não legível em PT-PT sem tentar decidir ownership ou permissões localmente.

### Decisões marcadas como DERIVADO

- Usar `normalize("NFC")` para estabilizar Unicode.
- Usar `hasReadableContent` para distinguir texto útil de whitespace/caracteres sem conteúdo pedagógico.
- Centralizar a normalização num helper backend reutilizável, desde que o guia mostre todos os pontos reais onde esse helper é aplicado.

### Drift documental encontrado

- Drift de relatório herdado: a secção anterior do relatório marcava `BK-MF8-06` como `OK`, mas a reauditoria atual encontrou lacunas de completude técnica. Esta execução atualiza o estado focado para `PARCIAL`.
- Sem drift de matriz, backlog, contrato de campos, anexos, README de guias ou sprint para os metadados de `BK-MF8-06`.
- Sem caminhos privados nos guias MF8.

### Riscos restantes

- O aluno pode implementar a normalização só no tópico textual e deixar PDF/DOCX/URL sem cobertura.
- O aluno pode criar `pt-text-normalization.spec.ts`, mas sem integração real com `MaterialsService` ou `MaterialIndexService`.
- `BK-MF8-07` pode assumir exportação de texto já normalizado, quando o contrato ainda não está completamente ensinado.
- Não há `TODO (BLOCKER)` documental; o bloqueio é de completude do guia e deve ser corrigido em modo `corrigir_apenas` ou `hidratar_corrigir`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 entrega guardrails, fontes, limites de IA, health-check e testes críticos que continuam relevantes para materiais privados e evidence.
- MF alvo: `BK-MF8-06` está estruturalmente alinhado com a MF8, mas ainda não fecha `RNF39` de forma implementável porque faltam integração backend, UI e testes executáveis.
- MF seguinte: `BK-MF8-07` deve continuar a tratar exportação PDF/MD, mas não deve depender de normalização UTF-8/PT-PT como contrato fechado até `BK-MF8-06` ser corrigido.

### Verificações executadas nesta execução

- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa por `normalizePortugueseStudyText`, `pt-text-normalization`, `NFC` e `hasReadableContent` em `apps/api` e `real_dev/api`: `PASS` como evidência de ausência atual de implementação.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Bloqueios e TODOs restantes

- Sem bloqueios ambientais.
- Sem `TODO (BLOCKER)` por contrato documental.
- Ação recomendada: executar `MODO: corrigir_apenas` para `BK-MF8-06`, mantendo `STRICT_SCOPE=true`, e substituir os passos 4, 5 e 6 por código completo de integração backend/frontend/testes.

---

## Execução 2026-07-01 - reauditoria final BK-MF8-05

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-05]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-05 - Aproximação da UI à UI do mockup`, depois da correção final anterior. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única atualização desta execução é este relatório.

Resultado da reauditoria: `OK`. O guia alvo mantém `RNF38`, owner, apoio, sprint, handoff e estrutura pedagógica correta; não contém linguagem interna proibida, caminhos privados, `payload: unknown`, `as any`, pseudo-código ou snippets soltos. O BK está coerente como entrega frontend/evidence-only para aproximação visual ao mockup, sem backend novo.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da correção final anterior | 1 | 0 | 0 |
| Estado apurado nesta reauditoria | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-05 | OK | Guia com 16 secções `####`, 7 passos `### Passo`, rotas reais `/app`, `/app/salas` e `/app/professor/turmas`, código completo, teste Playwright e pesquisas obrigatórias sem ocorrências. | P0 |

### Findings reavaliados

| Finding | Estado nesta reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Linguagem interna residual no guia do aluno | JA_CORRIGIDO | A pesquisa focal no BK alvo por `corrigir_apenas`, `auditar_apenas`, caminhos privados e termos técnicos proibidos não devolveu ocorrências. O `Changelog` usa formulação neutra para alunos. |
| F02 - Rotas de inventário visual não correspondem à app real | JA_CORRIGIDO | `apps/web/src/routes/protectedRoutes.tsx` e `apps/web/src/components/layout/navigation.ts` confirmam `/app`, `/app/salas` e `/app/professor/turmas`. O guia usa essas rotas como contrato de revisão visual. |
| F03 - Ficheiros prometidos não têm código completo | JA_CORRIGIDO | O BK inclui código completo para `mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `SoloStudyDashboard.tsx` e `mf8-mockup-alignment.spec.ts`. |
| F04 - Contradição entre “sem backend” e instruções backend | JA_CORRIGIDO | Scope, arquitetura, ficheiros e critérios de aceite declaram que não há endpoint, controller, service, DTO, schema ou model backend novo. |
| F05 - Testes e comentários didáticos insuficientes | JA_CORRIGIDO | Os blocos longos têm comentários didáticos suficientes e o teste Playwright cobre painel, rotas reais e ausência das rotas antigas. |

### Evidência consultada

- `docs/RNF.md`: confirma `RNF38 - Aproximação da UI real à UI definida no mockup`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`: confirmam metadados e sequência de `BK-MF8-05`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma handoff anterior.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`: confirma handoff seguinte.
- `apps/web/src/routes/protectedRoutes.tsx` e `apps/web/src/components/layout/navigation.ts`: confirmam as rotas reais usadas no guia.
- `real_dev/web/src/routes/protectedRoutes.tsx` e `real_dev/web/src/components/layout/navigation.ts`: usados apenas como referência privada para confirmar a estrutura consolidada; os caminhos do guia permanecem em `apps/web`.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint criado pelo guia: nenhum.
- DTOs/validators criados pelo guia: nenhum.
- Schemas/modelos criados pelo guia: nenhum.
- Services criados pelo guia: nenhum.
- Ficheiros frontend que o guia ensina a criar:
  - `apps/web/src/features/mf8/mockup-alignment.ts`
  - `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
  - `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- Ficheiro frontend que o guia ensina a editar:
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- Exports documentados:
  - `buildMockupAlignmentChecklist`
  - `summarizeMockupAlignment`
  - `validateMockupAlignmentChecklist`
  - `MockupAlignmentPanel`
- Rotas reais consumidas:
  - `/app`
  - `/app/salas`
  - `/app/professor/turmas`
- Regras de segurança/autorização: nenhuma regra nova é decidida no frontend; autenticação, permissões, ownership e membership continuam nos fluxos backend existentes.
- BK seguinte dependente: `BK-MF8-06`.

### Decisões técnicas confirmadas

- `RNF38` é uma entrega de UX final e pode ser tratada sem backend novo.
- A checklist visual é uma decisão derivada aceitável para tornar a aproximação ao mockup verificável.
- Playwright é o runner E2E adequado porque já existe configuração no frontend.
- As rotas antigas `/student/dashboard`, `/student/rooms` e `/teacher/classes` aparecem no BK apenas como negativos deliberados.

### Decisões de domínio confirmadas

- O mockup orienta fluxo, hierarquia, navegação, estados e linguagem visível, mas não substitui RF/RNF nem código real.
- Evidence visual deve usar contas seed ou dados anonimizados.
- O frontend organiza a checklist, mas não decide ownership, membership, role ou permissões.
- Screenshots não devem expor dados pessoais reais, materiais privados, prompts privados, respostas IA completas, cookies ou tokens.

### Decisões marcadas como DERIVADO

- Checklist visual com estados `PENDENTE`, `VALIDADO` e `BLOQUEADO`.
- Integração do painel no dashboard do aluno para facilitar recolha de evidence.
- Teste Playwright focado no painel e na ausência das rotas antigas.
- Não houve nova decisão derivada nesta reauditoria.

### Drift documental encontrado

- Não foi encontrado drift documental ativo em `BK-MF8-05`.
- Não foram encontrados caminhos privados nos guias MF8.
- Não foram encontrados termos proibidos pela regex obrigatória nos guias MF8.

### Verificações executadas nesta execução

- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Regra de comentários nos blocos de código do guia alvo: `PASS`; blocos longos têm comentários didáticos suficientes.
- Pesquisa focal no guia alvo por `corrigir_apenas`, `auditar_apenas`, `real_dev`, `REFERENCE_ROOT`, `payload: unknown` e `as any`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- `npm --prefix apps/web run build`: `PASS`, `tsc --noEmit` e `vite build` concluíram.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Não há `TODO (BLOCKER)` restante para `BK-MF8-05`.
- Risco residual baixo: o teste E2E descrito pelo guia depende de ambiente com API, frontend e contas seed disponíveis quando o aluno implementar o BK.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: contratos de UI, testes e estrutura modular mantidos.
- MF alvo: `BK-MF8-05` está `OK` para `RNF38`, com rotas reais, frontend-only, teste Playwright e linguagem limpa para alunos.
- MF seguinte: `BK-MF8-06` pode continuar com suporte UTF-8/PT-PT sem redefinir a checklist visual.

---

## Execução 2026-07-01 - correção final BK-MF8-05

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-05]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção estritamente focada do finding residual identificado na reauditoria anterior de `BK-MF8-05 - Aproximação da UI à UI do mockup`. O escopo ficou limitado ao guia alvo e a este relatório.

Resultado após correção: `OK`. O `Changelog` do guia deixou de mencionar o modo interno `corrigir_apenas` e passou a usar uma formulação neutra, adequada a alunos, descrevendo apenas a alteração funcional: rotas reais, BK frontend-only, código completo, integração React, teste Playwright, validação e handoff.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da reauditoria anterior | 0 | 1 | 0 |
| Estado depois da correção final | 1 | 0 | 0 |

### Resultado por BK corrigido

| BK | Estado depois | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-05 | OK | `Changelog` sem linguagem interna; pesquisas obrigatórias sem ocorrências; build web, `git diff --check` e validador documental em PASS. | P1 |

### Finding corrigido

| Finding | Estado | Evidência da correção | Validação |
| --- | --- | --- | --- |
| F01 - Linguagem interna residual no guia do aluno | CORRIGIDO | A linha do `Changelog` foi substituída por texto neutro: `guia atualizado para usar rotas reais, clarificar que o BK é frontend-only e incluir código completo, integração React, teste Playwright, validação e handoff`. | Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: sem ocorrências. Pesquisa de caminhos privados: sem ocorrências. |

### Mapa de integracao da MF

- BK editado nesta execução: `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`.
- Relatório editado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint criado pelo guia: nenhum.
- DTOs/validators criados pelo guia: nenhum.
- Schemas/modelos criados pelo guia: nenhum.
- Services criados pelo guia: nenhum.
- Ficheiros frontend criados pelo guia:
  - `apps/web/src/features/mf8/mockup-alignment.ts`
  - `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
  - `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- Ficheiro frontend editado pelo guia:
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- Exports produzidos pelo guia:
  - `buildMockupAlignmentChecklist`
  - `summarizeMockupAlignment`
  - `validateMockupAlignmentChecklist`
  - `MockupAlignmentPanel`
- Rotas reais consumidas:
  - `/app`
  - `/app/salas`
  - `/app/professor/turmas`
- Regras de segurança/autorização: nenhuma regra nova é decidida no frontend; autenticação, permissões, ownership e membership continuam a pertencer aos fluxos backend existentes.
- BK seguinte dependente: `BK-MF8-06`.

### Decisões técnicas confirmadas

- `RNF38` continua a ser entregue sem backend novo.
- O guia mantém a estrutura de 16 secções `####` e 7 passos `### Passo`.
- A correção desta execução foi apenas textual e não alterou código, arquitetura, rotas, testes ou handoff técnico do BK.
- As validações finais confirmam que a alteração não introduziu linguagem interna proibida nem caminhos privados nos guias MF8.

### Decisões de domínio confirmadas

- O mockup continua a ser referência visual e de fluxo, não contrato técnico.
- A evidence visual continua limitada a screenshots ou provas sem dados pessoais reais, cookies, tokens, prompts privados ou materiais privados.
- `BK-MF8-06` pode continuar a assumir que `BK-MF8-05` deixa um inventário visual verificável e ligado a rotas reais.

### Decisões marcadas como DERIVADO

- Mantêm-se as decisões derivadas já registadas na correção anterior: checklist visual com estados controlados, painel no dashboard do aluno e teste Playwright focado.
- Não houve nova decisão derivada nesta execução.

### Drift documental encontrado

- Drift residual anterior: linguagem interna no `Changelog`.
- Estado atual: drift corrigido.
- Não foram encontrados caminhos privados `real_dev` ou `REFERENCE_ROOT` nos guias MF8.
- Não foram encontrados termos proibidos pela regex obrigatória nos guias MF8.

### Verificações executadas nesta execução

- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- `npm --prefix apps/web run build`: `PASS`, `tsc --noEmit` e `vite build` concluíram.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Não há `TODO (BLOCKER)` restante para `BK-MF8-05`.
- Risco residual baixo: o teste E2E descrito pelo guia continua dependente de ambiente com API, frontend e contas seed disponíveis quando o aluno implementar o BK.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: contratos de UI, testes e estrutura modular mantidos.
- MF alvo: `BK-MF8-05` fica novamente `OK`, com `RNF38`, rotas reais, frontend-only, teste Playwright e linguagem limpa para alunos.
- MF seguinte: `BK-MF8-06` pode continuar com suporte UTF-8/PT-PT sem redefinir a checklist visual.

---

## Execução 2026-07-01 - reauditoria focada BK-MF8-05

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-05]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-05 - Aproximação da UI à UI do mockup`, depois da correção focada anterior. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única atualização desta execução é este relatório.

Resultado da reauditoria: `PARCIAL`. O guia alvo está tecnicamente implementável e já corrige os problemas críticos anteriores: usa rotas reais, declara frontend/evidence-only, não cria backend desnecessário, apresenta código completo para checklist/painel/integração/teste e preserva a estrutura de 16 secções `####` e 7 passos `### Passo`. Fica apenas um problema pedagógico/documental residual: o `Changelog` do guia ainda menciona o modo interno `corrigir_apenas`, que não deve aparecer em texto destinado aos alunos.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da correção focada anterior | 1 | 0 | 0 |
| Estado apurado nesta reauditoria | 0 | 1 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-05 | PARCIAL | Guia tecnicamente coerente, mas com linguagem interna residual no `Changelog`: `modo corrigir_apenas`. | P1 |

### Findings reavaliados

| Finding | Estado nesta reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Linguagem interna residual no guia do aluno | PARCIAL | O corpo principal foi limpo, mas o `Changelog` ainda diz `guia corrigido em modo corrigir_apenas`. Deve passar a uma formulação neutra, por exemplo `guia atualizado para rotas reais, frontend-only e teste Playwright`. |
| F02 - Rotas de inventário visual não correspondem à app real | CORRIGIDO | A checklist usa `/app`, `/app/salas` e `/app/professor/turmas`, coerentes com `apps/web/src/routes/protectedRoutes.tsx`. As strings antigas aparecem apenas em cenários negativos/teste de ausência. |
| F03 - Ficheiros prometidos não têm código completo | CORRIGIDO | O guia inclui código completo para `mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `SoloStudyDashboard.tsx` e `mf8-mockup-alignment.spec.ts`. |
| F04 - Contradição entre “sem backend” e instruções backend | CORRIGIDO | O scope, arquitetura e passos dizem explicitamente que não há endpoint, controller, service, DTO, schema ou model backend neste BK. |
| F05 - Testes e comentários didáticos insuficientes | CORRIGIDO | Os blocos longos têm comentários didáticos suficientes e o teste Playwright substitui o antigo ficheiro didático de expected results. |

### Evidência consultada

- `docs/RNF.md`: confirma `RNF38 - Aproximação da UI real à UI definida no mockup`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`: confirmam metadados de `BK-MF8-05`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma handoff anterior.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`: confirma handoff seguinte.
- `apps/web/src/routes/protectedRoutes.tsx`, `apps/web/src/components/layout/navigation.ts`, `apps/web/src/pages/student/SoloStudyDashboard.tsx` e equivalentes em `real_dev/web`: confirmam rotas e padrão real de integração frontend.
- `apps/web/playwright.config.ts` e `apps/web/tests/e2e/*`: confirmam o runner E2E existente.
- `mockup/`: confirma referência visual geral para StudyFlow.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint confirmado para este BK: nenhum.
- Ficheiros frontend que o guia ensina a criar:
  - `apps/web/src/features/mf8/mockup-alignment.ts`
  - `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
  - `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- Ficheiro frontend que o guia ensina a editar:
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- Exports documentados:
  - `buildMockupAlignmentChecklist`
  - `summarizeMockupAlignment`
  - `validateMockupAlignmentChecklist`
  - `MockupAlignmentPanel`
- Rotas reais consumidas:
  - `/app`
  - `/app/salas`
  - `/app/professor/turmas`
- Teste documentado: `mf8-mockup-alignment.spec.ts`.
- Regras de segurança/autorização: sem decisão nova de permissões no frontend; rotas e páginas continuam dependentes da sessão existente e das validações reais de backend.
- BK seguinte dependente: `BK-MF8-06`.

### Decisões técnicas confirmadas

- `RNF38` pode ser entregue sem backend novo.
- O painel de checklist é uma decisão derivada aceitável para tornar o fecho visual verificável.
- As rotas reais da aplicação são `/app`, `/app/salas` e `/app/professor/turmas`.
- Playwright é o runner adequado para o teste E2E descrito no guia.
- As rotas antigas `/student/dashboard`, `/student/rooms` e `/teacher/classes` aparecem no guia apenas como exemplos negativos, não como rotas a implementar.

### Decisões de domínio confirmadas

- O mockup orienta fluxo, hierarquia, navegação, estados e linguagem visível, mas não substitui RF/RNF nem código real.
- Evidence visual deve usar contas seed ou dados anonimizados.
- O frontend organiza a checklist, mas não decide ownership, membership, role ou permissões.
- Screenshots não devem expor dados pessoais reais, materiais privados, prompts privados, respostas IA completas, cookies ou tokens.

### Decisões marcadas como DERIVADO

- Checklist `PENDENTE`/`VALIDADO`/`BLOQUEADO`.
- Integração da checklist no dashboard do aluno para facilitar recolha de evidence.
- Teste Playwright focado na presença do painel e na ausência das rotas antigas.

### Drift documental encontrado

- Drift residual baixo: `Changelog` com modo interno `corrigir_apenas`.
- Não foi encontrado drift nos metadados canónicos de `BK-MF8-05`.
- Não foram encontrados caminhos privados nos guias MF8.
- Não foram encontrados termos proibidos pela regex obrigatória nos guias MF8.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Regra de comentários nos blocos de código do guia alvo: `PASS`; os blocos longos têm comentários didáticos suficientes.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no guia alvo: `PARCIAL`, encontrou `corrigir_apenas` apenas no `Changelog`.
- `npm --prefix apps/web run build`: `PASS`, `tsc --noEmit` e `vite build` concluíram.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: a única lacuna encontrada é textual/pedagógica, não técnica.
- Risco residual baixo: o teste E2E descrito pelo guia continua dependente de ambiente com API, frontend e contas seed disponíveis quando o aluno o implementar.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-05`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 deixa modularidade, componentes, testes e documentação técnica como base.
- MF alvo: `BK-MF8-05` está tecnicamente coerente para `RNF38`, mas ainda deve limpar a formulação interna do `Changelog` antes de voltar a `OK`.
- MF seguinte dentro da sequência: `BK-MF8-06` pode consumir o handoff técnico da checklist visual; o drift textual não bloqueia UTF-8/PT-PT.

### Próxima ação recomendada

Em modo `corrigir_apenas`, editar apenas o `Changelog` de `BK-MF8-05`, substituindo a frase com `modo corrigir_apenas` por texto neutro para alunos, sem alterar a arquitetura nem o código do guia.

---

## Execução 2026-07-01 - correção focada BK-MF8-05

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-05]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção focada de `BK-MF8-05 - Aproximação da UI à UI do mockup`, usando a auditoria imediatamente anterior como ponto de partida. O escopo ficou limitado ao guia alvo e a este relatório; os restantes guias MF8, documentos canónicos e ficheiros de produto não foram editados.

Resultado da correção: `OK`. O guia passou a ser frontend/evidence-only de forma explícita, sem endpoint nem backend novo, com rotas reais da aplicação, código completo para checklist, painel React, integração no dashboard e teste Playwright focado.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado depois | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-05 | OK | Guia com 16 secções `####`, 7 passos `### Passo`, `RNF38`, rotas reais `/app`, `/app/salas`, `/app/professor/turmas`, componente React completo, integração no dashboard e teste Playwright. | P0 |

### Findings corrigidos

| Finding anterior | Estado | Evidência da correção | Validação |
| --- | --- | --- | --- |
| F01 - Linguagem interna residual no guia do aluno | CORRIGIDO | O `Estado antes e depois` foi reescrito para descrever estado funcional, sem termos de auditoria ou guia antigo. | Pesquisa focal por `guia antigo`, `bloco genérico`, `linguagem interna`, `expected-results`, `payload: unknown`, `as any`, `real_dev` e `REFERENCE_ROOT` ficou sem ocorrências no BK alvo. |
| F02 - Rotas de inventário visual não correspondem à app real | CORRIGIDO | A checklist passou a usar `/app`, `/app/salas` e `/app/professor/turmas`, confirmadas em `apps/web/src/routes/protectedRoutes.tsx` e na referência privada. | A pesquisa obrigatória de caminhos privados e a pesquisa focal do BK alvo passaram sem ocorrências proibidas. |
| F03 - Ficheiros prometidos não têm código completo | CORRIGIDO | O guia inclui código completo para `mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `SoloStudyDashboard.tsx` e `mf8-mockup-alignment.spec.ts`. | Estrutura 16/7 preservada e `bash scripts/validate-planificacao.sh` passou. |
| F04 - Contradição entre “sem backend” e instruções backend | CORRIGIDO | A arquitetura, scope e passos agora declaram explicitamente que `RNF38` não cria endpoint, controller, DTO, schema, model ou service backend. | Pesquisa textual obrigatória nos 17 guias MF8 passou; `git diff --check` passou. |
| F05 - Testes e comentários didáticos insuficientes | CORRIGIDO | O guia substituiu o ficheiro didático de expected results por um teste Playwright completo e adicionou comentários didáticos nos blocos longos. | Estrutura do guia alvo continua com 16 secções e 7 passos; validator documental passou. |

### Evidência consultada

- `docs/RNF.md`: confirma `RNF38 - Aproximação da UI real à UI definida no mockup`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`: confirmam metadados de `BK-MF8-05`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma handoff anterior.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`: confirma handoff seguinte.
- `apps/web/src/routes/protectedRoutes.tsx`, `apps/web/src/components/layout/navigation.ts`, `apps/web/src/pages/student/SoloStudyDashboard.tsx` e equivalentes em `real_dev/web`: confirmam rotas e padrão real de integração frontend.
- `apps/web/playwright.config.ts` e `apps/web/tests/e2e/*`: confirmam que Playwright é o runner E2E existente.
- `mockup/`: confirma referência visual geral para StudyFlow.

### Mapa de integracao da MF

- BK editado: `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`.
- Relatório editado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint criado pelo guia: nenhum.
- DTOs/validators criados pelo guia: nenhum.
- Schemas/modelos criados pelo guia: nenhum.
- Services criados pelo guia: nenhum.
- Ficheiros frontend criados pelo guia:
  - `apps/web/src/features/mf8/mockup-alignment.ts`
  - `apps/web/src/features/mf8/mockup-alignment-panel.tsx`
  - `apps/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- Ficheiro frontend editado pelo guia:
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
- Exports produzidos pelo guia:
  - `buildMockupAlignmentChecklist`
  - `summarizeMockupAlignment`
  - `validateMockupAlignmentChecklist`
  - `MockupAlignmentPanel`
- Rotas reais consumidas:
  - `/app`
  - `/app/salas`
  - `/app/professor/turmas`
- Teste criado pelo guia: `mf8-mockup-alignment.spec.ts`.
- Regras de segurança/autorização: sem decisão nova de permissões no frontend; rotas e páginas continuam protegidas pela sessão existente.
- BKs seguintes dependentes: `BK-MF8-06`, que pode continuar com suporte UTF-8/PT-PT sem redefinir a checklist visual.

### Decisões técnicas confirmadas

- `RNF38` pode ser entregue sem backend novo.
- O painel deve ficar integrado no dashboard do aluno (`/app`) para ser visível no primeiro ecrã autenticado.
- As rotas ensinadas no guia devem ser as rotas reais da app, não nomes derivados do mockup.
- Playwright é o runner correto para a prova E2E, porque já existe configuração em `apps/web/playwright.config.ts`.
- O teste E2E pode conter rotas antigas apenas como negativos deliberados.

### Decisões de domínio confirmadas

- O mockup orienta fluxo, hierarquia, navegação, estados e linguagem visível, mas não cria contrato técnico.
- Evidence visual deve usar contas seed ou dados anonimizados.
- Screenshots não devem expor dados pessoais reais, cookies, tokens, materiais privados, prompts privados ou respostas IA completas.
- O frontend organiza a checklist, mas não decide ownership, membership, role ou permissões.

### Decisões marcadas como DERIVADO

- Criar uma checklist `PENDENTE`/`VALIDADO`/`BLOQUEADO`.
- Validar páginas principais por rotas reais e screenshot, sem exigir pixel-perfect.
- Integrar a checklist no dashboard do aluno em vez de criar uma rota nova.
- Usar teste Playwright focado para garantir presença do painel e negativo das rotas antigas.

### Drift documental encontrado

- O drift registado na auditoria anterior foi corrigido no guia alvo.
- Não foi encontrado drift nos metadados canónicos de `BK-MF8-05`.
- A pesquisa obrigatória não encontrou termos proibidos nem caminhos privados nos 17 guias MF8.
- As restantes alterações já existentes nos outros guias MF8 foram preservadas e não foram reavaliadas como correção desta execução.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no guia alvo por `guia antigo`, `bloco genérico`, `linguagem interna`, `expected-results`, `payload: unknown`, `as any`, `real_dev` e `REFERENCE_ROOT`: `PASS`, sem ocorrências.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: a correção é documental; os ficheiros de produto ainda terão de ser criados pelos alunos ao seguir o BK.
- Risco residual baixo: o teste E2E depende de ambiente com API, frontend e contas seed disponíveis.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-05`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 deixa modularidade, componentes, testes e documentação técnica como base.
- MF alvo: `BK-MF8-05` fecha `RNF38` como checklist visual frontend-only, com rotas reais e prova E2E.
- MF seguinte dentro da sequência: `BK-MF8-06` pode assumir que a aproximação ao mockup tem inventário verificável e continuar para suporte UTF-8/PT-PT.

---

## Execução 2026-07-01 - auditoria focada BK-MF8-05

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-05]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma auditoria fresca ao `BK-MF8-05 - Aproximação da UI à UI do mockup`, lendo a MF8 completa, o BK anterior, o BK seguinte, documentação canónica e a referência privada `real_dev` apenas para validação estrutural.

Resultado da auditoria: `CRITICO`. O guia alvo tem a estrutura formal esperada, com 16 secções `####` e 7 passos `### Passo`, mas ainda não é implementável por um aluno sem adivinhar peças técnicas. O problema principal não é de matriz/backlog: `RNF38`, owner, apoio, prioridade, sprint e handoff estão alinhados. O problema é de completude e coerência técnica dentro do guia.

Como `MODO=auditar_apenas`, nenhum BK nem ficheiro de produto foi editado. A única atualização desta execução é este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado do relatório anterior para `BK-MF8-05` | 1 | 0 | 0 |
| Estado apurado nesta auditoria fresca | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-05 | CRITICO | Estrutura 16/7 presente, mas o guia mantém linguagem interna no `Estado antes`, usa rotas que não existem na app real, promete ficheiros sem código completo e mistura um BK sem endpoint/backend com instruções de controller, service, DTO e provider. | P0 |

### Findings da auditoria

| Finding | Estado | Evidência | Impacto |
| --- | --- | --- | --- |
| F01 - Linguagem interna residual no guia do aluno | PARCIAL | `BK-MF8-05`, linha 52: menciona `guia antigo`, `bloco genérico` e `linguagem interna`. | Risco pedagógico: o aluno recebe linguagem de auditoria/hidratação em vez de estado funcional antes/depois. |
| F02 - Rotas de inventário visual não correspondem à app real | CRITICO | O código do passo 3 usa `/student/dashboard`, `/student/rooms` e `/teacher/classes`; `apps/web/src/routes/protectedRoutes.tsx` e `real_dev/web/src/routes/protectedRoutes.tsx` usam `/app`, `/app/salas` e `/app/professor/turmas`. | Risco técnico: screenshots/evidence e navegação ficam apontados para páginas inexistentes. |
| F03 - Ficheiros prometidos não têm código completo | CRITICO | A lista promete `mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `mockup-alignment.spec.ts` e edição de `App.tsx`; o tutorial só dá código completo para `mockup-alignment.ts` e para um ficheiro didático de expected results. | Risco técnico/pedagógico: o aluno teria de inventar componente React, integração e suite de testes. |
| F04 - Contradição entre “sem backend” e instruções backend | CRITICO | A arquitetura diz `sem endpoint novo; validação frontend e evidence visual` e `Backend: sem alteração backend`; os passos 2, 4 e 6 pedem service, DTO, controller, provider, models e expected results em `apps/api`. | Risco de integração: o aluno não sabe se deve criar backend, só frontend, ou ambos. |
| F05 - Testes e comentários didáticos insuficientes | CRITICO | O passo 6 promete `mockup-alignment.spec.ts`, mas o código apresentado é `bk-mf8-05.expected-results.ts`, sem asserts reais; o bloco principal do passo 3 tem 39 linhas não vazias e não inclui os 2 comentários didáticos exigidos para blocos com 20+ linhas. | Risco de validação: o BK declara cobertura de caminho feliz/negativos sem entregar uma suite executável. |

### Evidência consultada

- `README.md`: confirma domínio StudyFlow, separação de contextos, IA pedagógica, segurança e rastreabilidade.
- `docs/RNF.md`: confirma `RNF38 - Aproximação da UI real à UI definida no mockup`.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`: confirma gate S12 com UI alinhada ao mockup, testes finais, correção de erros e auditoria em PASS.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`: confirmam `BK-MF8-05`, owner `Guilherme`, apoio `Natalia`, `P0`, esforço `M`, sprint `S12`, `RNF38` e próximo `BK-MF8-06`.
- `docs/planificacao/guias-bk/README.md` e `_TEMPLATE-BK.md`: confirmam contrato de header, estrutura e exigência de código completo, explicação, validação e cenários negativos.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma que o BK anterior entrega contexto externo limitado e prepara refinamento visual sem redefinir segurança.
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`: confirma handoff seguinte.
- `apps/web/src/routes/protectedRoutes.tsx` e `real_dev/web/src/routes/protectedRoutes.tsx`: confirmam as rotas reais da app.
- `mockup/meta.json`, `mockup/thumbnail.png`, `mockup/canvas.fig` e `mockup/images/*`: confirmam existência de referência visual geral para StudyFlow.
- `apps/web/src` e `real_dev/web/src`: não têm ficheiros `features/mf8/mockup-alignment*` já existentes.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint confirmado para este BK: nenhum endpoint novo deve ser necessário para `RNF38`, salvo decisão técnica futura explicitamente justificada.
- Ficheiros que o guia diz criar: `apps/web/src/features/mf8/mockup-alignment.ts`, `apps/web/src/features/mf8/mockup-alignment-panel.tsx`, `apps/web/src/features/mf8/mockup-alignment.spec.ts`.
- Ficheiro que o guia diz editar: `apps/web/src/App.tsx`.
- Ficheiro adicional introduzido pelo próprio tutorial: `apps/api/src/modules/mf8/bk-mf8-05.expected-results.ts`.
- Export documentado: `buildMockupAlignmentChecklist()`.
- Componentes/páginas frontend prometidos: `mockup-alignment-panel.tsx`, mas sem código completo no guia.
- Testes prometidos: `mockup-alignment.spec.ts`, mas sem suite real no guia.
- Regras de segurança/autorização: o guia menciona sessão, ownership, membership e role, mas isto fica incoerente com a decisão de não alterar backend neste BK.
- BK seguinte dependente: `BK-MF8-06`; o handoff não deve assumir `BK-MF8-05` como pronto enquanto estes findings estiverem abertos.

### Decisões técnicas confirmadas

- `RNF38` é um requisito de fecho visual e deve ser validado contra o mockup e páginas reais.
- A app real usa rotas protegidas em `/app`, incluindo `/app/salas` e `/app/professor/turmas`; as rotas `/student/dashboard`, `/student/rooms` e `/teacher/classes` não foram confirmadas como rotas reais.
- Um inventário/checklist visual é uma abordagem aceitável como decisão `DERIVADO`, desde que use rotas reais, componente completo, integração clara e testes executáveis.
- Não há fuga de caminhos `real_dev` nos guias MF8 pela pesquisa obrigatória.

### Decisões de domínio confirmadas

- `RNF38` pertence ao fecho de produto e à defesa PAP, não à criação de novas regras de IA, RAG, OCR, embeddings ou automações externas.
- Evidence visual não deve incluir dados pessoais, materiais privados, prompts privados, respostas IA completas, cookies ou tokens.
- O frontend pode organizar a checklist e screenshots, mas não deve ser apresentado como autoridade de ownership, membership, role ou permissão.

### Decisões marcadas como DERIVADO

- Usar uma checklist técnica `TODO`/`DONE`/`BLOCKED` para controlar aproximação ao mockup.
- Validar páginas principais por inventário e screenshot, em vez de exigir pixel-perfect.
- Manter `RNF38` sem endpoint novo, desde que o guia corrija a contradição backend/frontend e entregue componente/teste completos.

### Drift documental encontrado

- Drift entre relatório anterior e auditoria atual: a execução de hidratação global marcava `BK-MF8-05` como `OK`, mas a auditoria fresca mostra que a completude técnica ainda não cumpre o contrato da prompt.
- Drift interno no BK: o `Estado antes` ainda fala em guia antigo e linguagem interna.
- Drift técnico no código do guia: o inventário visual usa rotas não existentes na app real.
- Drift de escopo: o guia declara `sem backend`, mas instrui o aluno a trabalhar com controller, service, DTO, provider e models.
- Não foi encontrado drift nos metadados canónicos do BK.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências pela regex obrigatória.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no guia alvo por `guia antigo`, `bloco genérico`, `linguagem interna`, `expected-results`, `real_dev`, `REFERENCE_ROOT`, `payload: unknown` e `as any`: `FAIL QUALITATIVO`, com ocorrências de linguagem interna e expected-results didático no guia alvo.
- Pesquisa em `apps/web/src`, `real_dev/web/src`, `apps/api/src` e `real_dev/api/src` por armazenamento inseguro de sessão: ocorrências aceitáveis apenas como comentários de negação de `localStorage` ou centralização de cookies HttpOnly.
- Pesquisa por ficheiros `mf8/mockup-alignment*` em `apps/web/src` e `real_dev/web/src`: `PASS`, inexistentes; confirma que o guia precisa entregar código completo ao aluno.
- Verificação de rotas reais em `apps/web/src/routes/protectedRoutes.tsx` e `real_dev/web/src/routes/protectedRoutes.tsx`: `FAIL QUALITATIVO` para as rotas ensinadas no passo 3.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco pedagógico alto: o aluno não consegue implementar `BK-MF8-05` sem inventar componente, testes e integração.
- Risco técnico alto: as rotas do inventário visual não correspondem às rotas protegidas reais da app.
- Risco de escopo médio: a contradição entre frontend-only/evidence visual e backend/service/controller pode levar a implementação desnecessária ou incoerente.
- Risco de validação médio: o validador documental passa, mas não deteta esta incompletude técnica.
- Não há `TODO (BLOCKER)` por falta de documento canónico; há trabalho de correção do guia dentro do escopo de uma execução futura `corrigir_apenas` ou `hidratar_corrigir`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 deixa contratos de modularidade, componentes, documentação técnica e IA explicável como base.
- MF alvo: `BK-MF8-04` pode entregar segurança de IA externa; `BK-MF8-05` ainda não fecha `RNF38` de forma implementável; `BK-MF8-06` não deve assumir a checklist visual como pronta.
- MF seguinte dentro da sequência: `BK-MF8-06` pode continuar a tratar UTF-8/PT-PT, mas o handoff visual de `BK-MF8-05` deve ser corrigido antes de ser usado como evidência final de produto.

### Próxima ação recomendada

Em modo `corrigir_apenas`, corrigir apenas `BK-MF8-05` para:

- remover linguagem interna do `Estado antes`;
- substituir rotas inexistentes por rotas reais da app, como `/app`, `/app/salas` e `/app/professor/turmas`;
- decidir explicitamente se o BK é frontend/evidence-only ou se precisa de backend;
- entregar código completo para `mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `mockup-alignment.spec.ts` e a integração real escolhida;
- trocar expected-results soltos por testes executáveis com asserts observáveis;
- reforçar comentários didáticos nos blocos de código com 20+ linhas.

---

## Execução 2026-07-01 - reauditoria focada BK-MF8-04

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-04]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-04 - IA externa segue políticas e filtros próprios`, depois da correção focada anterior. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK nem ficheiro de produto foi editado. A única atualização desta execução é este relatório.

Resultado da reauditoria: `OK`. O guia alvo mantém a estrutura obrigatória com 16 secções `####` e 7 passos `### Passo`, usa apenas caminhos públicos `apps/api` e `apps/web`, ensina `RNF37` com policy, DTO, schema, controller, module, service, cliente React, painel, testes negativos e evidence, e não contém caminhos privados nem padrões inseguros pesquisados pela regex obrigatória.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da correção focada anterior | 1 | 0 | 0 |
| Estado apurado nesta reauditoria | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-04 | OK | Guia com contrato `RNF37`, policy `resolveExternalAiPolicy(...)`, endpoint `POST /api/ai/external-knowledge-answers`, separação `internalCitations`/`externalNotes`, UI com estados e specs documentadas. | P0 |

### Findings reavaliados

| Finding anterior | Estado nesta reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Integração backend não é autocontida | JA_CORRIGIDO | O guia inclui DTO, schema, controller, module e service completos para `external-knowledge-ai`, com ordem segura: role, ownership, fontes, policy, provider e persistência. |
| F02 - Policy nova não está integrada nem existente no contrato real | JA_CORRIGIDO | O guia cria `external-ai-policy.ts`, ensina `resolveExternalAiPolicy(...)`, importa a policy no service e usa `policy.externalAllowed`/`policy.externalNotes` antes de persistir. |
| F03 - Frontend fica sem código completo | JA_CORRIGIDO | O guia inclui `askExternalKnowledgeAi(...)` e `ExternalKnowledgeAiPanel`, com cliente tipado, helper com `credentials: "include"`, vazio, loading, erro, sucesso, citações internas e notas externas. |
| F04 - Testes pedidos não são entregues como suite real | JA_CORRIGIDO | O guia inclui specs para policy e service, com sucesso, sem permissão externa, sem fontes internas, role errada, provider inválido e asserts sobre `externalUsed`/`externalNotes`. |
| F05 - Linguagem interna residual no guia do aluno | JA_CORRIGIDO | A pesquisa focal no BK alvo não encontrou `guia antigo`, `bloco genérico`, `linguagem interna`, `expected-results`, caminhos privados, `payload: unknown` ou `as any`. |

### Evidência consultada

- `docs/RF.md`: confirma `RF39 - IA pode recorrer a conhecimento externo (limitado) quando permitido`.
- `docs/RNF.md`: confirma `RNF37 - IA externa segue políticas e filtros próprios`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `docs/planificacao/guias-bk/README.md`: confirmam metadados, sprint, owner, apoio, prioridade, esforço, reforço e handoff de `BK-MF8-04`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`: confirma handoff anterior com perfil pedagógico, fontes autorizadas e provider validado.
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`: confirma que o próximo BK pode tratar aproximação visual sem redefinir o contrato de segurança de `BK-MF8-04`.
- `apps/api/src/modules/external-knowledge-ai/*` e equivalentes em `real_dev/api`: confirmam controller, DTO, module, schema, service e suite atual do produto.
- `apps/web/src/features/external-knowledge-ai/*`, `apps/web/src/features/mf3/request-mf3-json.ts` e equivalentes em `real_dev/web`: confirmam cliente, painel e helper com `credentials: "include"`.
- `mockup/`: existe como referência visual geral; não foi encontrado contrato visual específico que obrigue `BK-MF8-04` a redefinir UI além do painel funcional. O refinamento visual continua corretamente delegado para `BK-MF8-05`.

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint confirmado no guia: `POST /api/ai/external-knowledge-answers`.
- Ficheiros que o guia ensina a criar: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts` e `apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`.
- Ficheiros que o guia ensina a editar/rever: DTO, schema, controller, module, service, service spec, cliente React, painel React e helper JSON.
- Exports documentados: `ExternalAiPolicyInput`, `ExternalAiPolicyDecision`, `resolveExternalAiPolicy`, `ExternalKnowledgeAiAnswerView`, `ExternalKnowledgeAnswer`, `AskExternalKnowledgeAiInput` e `askExternalKnowledgeAi(...)`.
- Imports consumidos de contratos anteriores: `SessionGuard`, `AuthenticatedUser`, `AI_PROVIDER`, `MaterialsService`, `StudyAreasService` e `requestMf3Json(...)`.
- DTO/validators documentados: `AskExternalKnowledgeAiDto` com validação de ObjectId, string/tamanho e booleano.
- Schemas/modelos documentados: `ExternalKnowledgeAiAnswer` e `ExternalKnowledgeInternalCitation`.
- Services documentados: `ExternalKnowledgeAiService` e policy `resolveExternalAiPolicy(...)`.
- Componentes frontend documentados: `ExternalKnowledgeAiPanel`.
- Provider de IA usado: `AI_PROVIDER` via `AiProvider.generateStudyTool(...)`.
- Regras de segurança/autorização documentadas: sessão via `SessionGuard`, role `STUDENT`, `userId` vindo da sessão, ownership da área, fontes internas obrigatórias, provider só depois de validações e separação entre citações internas e notas externas.
- Testes documentados: `external-ai-policy.spec.ts` e `external-knowledge-ai.service.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-05`, que pode refinar UI sem alterar endpoint, DTO, schema, policy ou regras de ownership.

### Decisões técnicas confirmadas

- `POST /api/ai/external-knowledge-answers` é o contrato HTTP único do fluxo.
- `allowExternalKnowledge` é a permissão explícita enviada pela UI.
- `resolveExternalAiPolicy(...)` é uma decisão técnica derivada e testável para aplicar `RNF37`.
- `externalUsed` e `externalNotes` separam contexto externo de `internalCitations`.
- `requestMf3Json(...)` mantém cookies HttpOnly via `credentials: "include"`.
- `apps/api` e `real_dev/api`, bem como `apps/web` e `real_dev/web`, estão alinhados nos módulos `external-knowledge-ai` atuais; a policy ensinada pelo guia é uma entrega nova prevista pelo próprio BK.

### Decisões de domínio confirmadas

- `RNF37` exige políticas e filtros próprios para IA externa.
- `RF39` permite conhecimento externo apenas de forma limitada e quando permitido.
- Fontes internas processáveis são obrigatórias antes de qualquer resposta.
- Contexto externo não substitui fontes internas autorizadas.
- O frontend mostra intenção e estados, mas ownership, role, fontes e provider continuam no backend.
- Prompts privados, respostas completas, cookies, materiais integrais e dados pessoais não devem aparecer em logs ou evidence.

### Decisões marcadas como DERIVADO

- Criar `resolveExternalAiPolicy(...)` como função pura e testável.
- Devolver `reason` na policy para tornar a decisão observável em testes e defesa.
- Guardar notas externas em `externalNotes[]`.
- Limitar citações internas a excertos curtos e separados das notas externas.
- Manter o refinamento visual fora deste BK e preparar `BK-MF8-05` para tratar aproximação ao mockup.

### Drift documental encontrado

- No BK alvo, não foi encontrado drift crítico: metadados, `RNF37`, caminhos públicos, contrato backend/frontend, testes, critérios de aceite, evidence e handoff estão coerentes.
- A pesquisa obrigatória não encontrou termos proibidos nem caminhos privados nos 17 guias MF8.
- Varrimento adicional, fora da regex obrigatória, encontrou linguagem de histórico em vários BKs MF8 fora do alvo, por exemplo `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`, `BK-MF8-13`, `BK-MF8-14`, `BK-MF8-15`, `BK-MF8-16` e `BK-MF8-17` na linha de `Estado antes`. Como `STRICT_SCOPE=true` e o alvo é apenas `BK-MF8-04`, nada foi editado fora do BK alvo; registo este ponto como drift fora de escopo.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa obrigatória de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências pela regex obrigatória.
- Pesquisa obrigatória de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no guia alvo por `external-ai-policy`, `resolveExternalAiPolicy`, `allowExternalKnowledge`, `externalNotes`, `internalCitations`, `NO_INTERNAL_SOURCES`, `STUDENT_ROLE_REQUIRED`, `credentials: "include"`, `payload: unknown` e `as any`: `PASS`, contratos encontrados e padrões proibidos ausentes.
- Pesquisa estática em `apps/api`, `apps/web`, `real_dev/api` e `real_dev/web` para `external-knowledge-ai`: `PASS`, contratos existentes confirmados e sem drift entre `apps` e referência privada.
- `npm --prefix apps/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `npm --prefix real_dev/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo para `BK-MF8-04`: a reauditoria é documental e o guia alvo está implementável.
- Risco residual médio fora do alvo: vários BKs MF8 ainda usam uma frase de `Estado antes` com linguagem de histórico. Não bloqueia `BK-MF8-04`, mas merece correção numa ronda própria com esses BKs em escopo.
- Risco residual baixo: o produto atual ainda tem a implementação inline de `allowExternalKnowledge`; o guia ensina a evolução com policy como entrega do aluno, e os testes atuais continuam verdes.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-04`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 deixa fontes, contexto e limites de IA como base de segurança.
- MF alvo: `BK-MF8-03` entrega adaptação ao nível do aluno; `BK-MF8-04` fecha contexto externo limitado com policy, fontes internas obrigatórias, separação de notas externas e testes; os BKs seguintes mantêm a sequência de fecho da MF8.
- MF seguinte dentro da sequência: `BK-MF8-05` pode tratar aproximação visual ao mockup sem redefinir endpoint, DTO, schema, service, policy ou ownership de `BK-MF8-04`.

---

## Execução 2026-07-01 - correção focada BK-MF8-04

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-04]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção focada do `BK-MF8-04 - IA externa segue políticas e filtros próprios`, usando a auditoria imediatamente anterior como ponto de partida. O escopo ficou limitado ao guia alvo e a este relatório; os restantes guias MF8 e os ficheiros de produto não foram editados nesta execução.

Resultado da correção: `OK`. O guia passou a ensinar `RNF37` de forma autocontida, com policy integrada, DTO, schema, controller, module, service, cliente React, painel, testes negativos e evidence. O texto destinado aos alunos usa caminhos públicos `apps/api` e `apps/web`, remove a linguagem de histórico interno e substitui instruções genéricas por código completo e explicado.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado depois | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-04 | OK | Guia com 16 secções `####`, 7 passos `### Passo`, policy `resolveExternalAiPolicy(...)`, backend completo, frontend completo, specs reais e validações finais. | P0 |

### Findings corrigidos

| Finding anterior | Estado | Evidência da correção | Validação |
| --- | --- | --- | --- |
| F01 - Integração backend não é autocontida | CORRIGIDO | `BK-MF8-04` passou a incluir DTO, schema, controller, module e service completo para `POST /api/ai/external-knowledge-answers`. | Estrutura 16/7, `npm --prefix apps/api test -- external-knowledge-ai` e `npm --prefix real_dev/api test -- external-knowledge-ai` passaram. |
| F02 - Policy nova não está integrada nem existente no contrato real | CORRIGIDO | O guia agora cria `external-ai-policy.ts`, importa `resolveExternalAiPolicy(...)` no service e usa `policy.externalAllowed` antes do provider. | O passo 7 inclui `external-ai-policy.spec.ts`; os testes focados atuais continuam verdes. |
| F03 - Frontend fica sem código completo | CORRIGIDO | O guia agora inclui `askExternalKnowledgeAi(...)` tipado e `ExternalKnowledgeAiPanel` com vazio, loading, erro, sucesso, citações internas e notas externas. | Pesquisa textual sem `payload: unknown`, sem tokens em armazenamento local e sem caminhos privados nos guias MF8. |
| F04 - Testes pedidos não são entregues como suite real | CORRIGIDO | O guia substitui o contrato documental solto por specs para policy e service, cobrindo sucesso, sem permissão externa, sem fontes internas, role errada e provider inválido. | Suites `external-knowledge-ai` em `apps/api` e `real_dev/api` passaram: 1 suite, 3 testes em cada root. |
| F05 - Linguagem interna residual no guia do aluno | CORRIGIDO | Foram removidas referências ao histórico do guia e as secções passaram a descrever o estado funcional antes/depois do BK. | Pesquisa focal por `guia antigo`, `linguagem interna`, `expected-results` e termos proibidos ficou sem ocorrências relevantes no guia alvo. |

### Evidência consultada

- `docs/RF.md`: confirma `RF39 - IA pode recorrer a conhecimento externo (limitado) quando permitido`.
- `docs/RNF.md`: confirma `RNF37 - IA externa segue políticas e filtros próprios`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `docs/planificacao/guias-bk/README.md`: confirmam metadados, sprint, owner, apoio, prioridade, esforço, reforço e handoff de `BK-MF8-04`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md` e `BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`: confirmam enquadramento anterior e próximo BK.
- `apps/api/src/modules/external-knowledge-ai/*`: confirma DTO, schema, controller, module, service e suite atual do produto.
- `apps/web/src/features/external-knowledge-ai/*` e `apps/web/src/features/mf3/request-mf3-json.ts`: confirmam cliente, painel e helper com `credentials: "include"`.

### Mapa de integracao da MF

- BK editado: `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`.
- Relatório editado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum, por `STRICT_SCOPE=true` e por se tratar de correção de guia.
- Ficheiros criados pelo guia: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts` e `apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`.
- Ficheiros editados pelo guia: DTO, schema, controller, module, service, service spec, cliente React e painel `external-knowledge-ai`.
- Exports produzidos pelo guia: `ExternalAiPolicyInput`, `ExternalAiPolicyDecision`, `resolveExternalAiPolicy`, `ExternalKnowledgeAiAnswerView`, `ExternalKnowledgeAnswer`, `AskExternalKnowledgeAiInput` e `askExternalKnowledgeAi(...)`.
- Imports consumidos de BKs anteriores: `SessionGuard`, `AuthenticatedUser`, `AI_PROVIDER`, `MaterialsService`, `StudyAreasService` e `requestMf3Json(...)`.
- Endpoint documentado: `POST /api/ai/external-knowledge-answers`.
- DTO/validators documentados: `AskExternalKnowledgeAiDto` com `@IsMongoId`, `@IsString`, `@MinLength`, `@MaxLength` e `@IsBoolean`.
- Schemas/modelos documentados: `ExternalKnowledgeAiAnswer` e `ExternalKnowledgeInternalCitation`.
- Services documentados: `ExternalKnowledgeAiService` e policy `resolveExternalAiPolicy(...)`.
- Componentes/páginas frontend documentados: `ExternalKnowledgeAiPanel`.
- Providers de IA usados: `AI_PROVIDER` via `AiProvider.generateStudyTool(...)`.
- Regras de segurança/autorização aplicadas: sessão via `SessionGuard`, role `STUDENT`, `userId` vindo da sessão, ownership da área via `StudyAreasService`, fontes internas via `MaterialsService`, bloqueio sem fontes e provider chamado só depois da policy.
- Testes documentados: `external-ai-policy.spec.ts` e `external-knowledge-ai.service.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-05`, que pode refinar UI sem alterar o contrato de segurança.

### Decisões técnicas confirmadas

- `POST /api/ai/external-knowledge-answers` continua a ser o endpoint único.
- `allowExternalKnowledge` é a permissão explícita recebida do frontend.
- `resolveExternalAiPolicy(...)` é a unidade derivada para aplicar `RNF37` antes do provider.
- `externalUsed` e `externalNotes` mantêm contexto externo separado de `internalCitations`.
- `requestMf3Json(...)` é o helper frontend que preserva cookies HttpOnly com `credentials: "include"`.

### Decisões de domínio confirmadas

- Fontes internas autorizadas são obrigatórias antes de qualquer resposta.
- Contexto externo é apoio pedagógico limitado, não fonte factual principal.
- A UI pode pedir permissão, mas não decide ownership, role ou acesso a fontes.
- Prompts, respostas completas, cookies, materiais privados e dados pessoais não entram em logs ou evidence.

### Decisões marcadas como DERIVADO

- Criar `resolveExternalAiPolicy(...)` como função pura e testável.
- Devolver `reason` na policy para facilitar testes e defesa.
- Guardar notas externas como array `externalNotes`.
- Limitar citações internas a três excertos curtos no service.

### Drift documental encontrado

- Não foi encontrado drift nos metadados canónicos de `BK-MF8-04`.
- Não foram encontrados caminhos privados ou `REFERENCE_ROOT` nos 17 guias MF8.
- Não foram encontrados termos proibidos pela regex obrigatória nos 17 guias MF8.
- Foi corrigido drift pedagógico no guia alvo: o documento deixou de declarar integração backend/frontend/testes sem entregar código completo.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências pela regex obrigatória.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no guia alvo por `guia antigo`, `linguagem interna`, `expected-results` e `bk-mf8-04.expected-results`: `PASS`, sem ocorrências críticas.
- `npm --prefix apps/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `npm --prefix real_dev/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: esta execução corrigiu o guia, não o produto, porque o modo e o escopo pediam correção documental.
- Risco residual baixo: os testes reais atuais continuam com 3 cenários; o guia ensina cenários adicionais para quando o aluno aplicar a policy no produto.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-04`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: MF7 deixa fontes, contextos e limites pedagógicos como base de segurança.
- MF alvo: `BK-MF8-01` a `BK-MF8-03` fecham segurança, factualidade e adaptação; `BK-MF8-04` passa a fechar contexto externo limitado com policy, backend, frontend e testes.
- MF seguinte: `BK-MF8-05` pode aproximar a UI ao mockup sem redefinir endpoint, schema, ownership ou separação entre citações internas e notas externas.

---

## Execução 2026-07-01 - auditoria focada BK-MF8-04

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-04]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma auditoria fresca ao `BK-MF8-04 - IA externa segue políticas e filtros próprios`, lendo a MF8 completa para coerência e comparando o guia com os contratos atuais em `apps` e na referência privada `real_dev`.

Resultado da auditoria: `CRITICO`. O guia alvo tem a estrutura formal esperada da MF8, usa caminhos públicos e mantém metadados canónicos de `RNF37`, mas ainda não é suficientemente autocontido para um aluno implementar o requisito sem adivinhar peças críticas. O problema principal é que o guia cria uma policy pequena em `external-ai-policy.ts`, mas deixa a integração backend, frontend e testes reais como instruções genéricas ou `Sem código neste passo`, apesar de declarar endpoint, service, cliente React, painel e negativos obrigatórios.

Como esta execução está em modo `auditar_apenas`, nenhum guia BK nem ficheiro de produto foi editado. A única alteração desta execução é este relatório.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da reescrita geral MF8 | 1 | 0 | 0 |
| Estado apurado nesta auditoria focada | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-04 | CRITICO | Estrutura formal correta, mas integração backend/frontend e testes ficam sem código completo; o aluno teria de inferir service/controller/DTO/module, cliente/painel React e specs reais. | P0 |

### Findings

| Finding | Estado | Evidência | Risco |
| --- | --- | --- | --- |
| F01 - Integração backend não é autocontida | CRITICO | O guia lista `external-knowledge-ai.service.ts` como ficheiro a editar e declara `POST /api/ai/external-knowledge-answers`, mas o Passo 4 diz `Sem código neste passo` e remete para integração genérica. A implementação atual já tem `AskExternalKnowledgeAiDto`, `ExternalKnowledgeAiController`, `ExternalKnowledgeAiModule` e `ExternalKnowledgeAiService`, mas o guia não mostra esse contrato completo. | O aluno teria de adivinhar imports, ordem de validação, persistência, provider, erros públicos e integração da policy nova no service. |
| F02 - Policy nova não está integrada nem existente no contrato real | CRITICO | O guia manda criar `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts` e `external-ai-policy.spec.ts`; a pesquisa em `apps/api` e `real_dev/api` não encontrou ficheiros `*external-ai-policy*`. O service atual resolve permissão externa inline com `allowExternalKnowledge`, `externalUsed` e `externalNotes`. | Seguir literalmente o guia pode criar uma policy isolada que compila sozinha, mas não fica ligada ao fluxo real nem aos testes de aceitação. |
| F03 - Frontend fica sem código completo | CRITICO | O guia exige checkbox, cliente tipado, loading, vazio, erro e sucesso, mas o Passo 5 diz `Sem código neste passo` porque a integração "varia consoante a página real". A implementação atual já tem `askExternalKnowledgeAi(...)` e `ExternalKnowledgeAiPanel`. | O aluno não recebe o código completo para preservar `credentials: "include"`, estados UI, mensagens PT-PT e separação entre `internalCitations` e `externalNotes`. |
| F04 - Testes pedidos não são entregues como suite real | PARCIAL | O guia pede `external-ai-policy.spec.ts`, sucesso, sem permissão externa, sem fontes internas e nota externa separada, mas no Passo 6 só fornece `bk-mf8-04.expected-results.ts`. As suites reais `external-knowledge-ai` passam em `apps/api` e `real_dev/api`, mas o guia não ensina uma spec alinhada com a policy que propõe. | A defesa pode ficar com expected results documentais em vez de asserts automatizados que provem `RNF37`. |
| F05 - Linguagem interna residual no guia do aluno | PARCIAL | A secção `Estado antes e depois` ainda diz que o requisito surgia no "guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo". | O guia fala do histórico de auditoria/documentação em vez de falar apenas da entrega incremental do aluno. |

### Evidência consultada

- `README.md`: confirma StudyFlow como plataforma com IA pedagógica, fontes, guardrails e isolamento de dados.
- `docs/RF.md`: confirma `RF39 - IA pode recorrer a conhecimento externo limitado quando permitido`.
- `docs/RNF.md`: confirma `RNF37 - IA externa segue políticas e filtros próprios`.
- `docs/planificacao/README.md`, `PLANO-IMPLEMENTACAO-TOTAL.md`, `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`, `guias-bk/README.md` e `_TEMPLATE-BK.md`: confirmam metadados, sequência e contrato pedagógico.
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`, `BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md` e `BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`: confirmam a cadeia anterior de fontes, contexto e limites.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md` e `BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`: confirmam handoff anterior e seguinte.
- `apps/api/src/modules/external-knowledge-ai/*` e equivalentes em `real_dev/api`: confirmam controller, DTO, module, schema, service e suite real atual para conhecimento externo limitado.
- `apps/web/src/features/external-knowledge-ai/*` e equivalentes em `real_dev/web`: confirmam cliente e painel React atuais.

### Mapa de integracao da MF

- Ficheiro auditado: `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Guias BK editados nesta execução: nenhum.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint real confirmado: `POST /api/ai/external-knowledge-answers`.
- Contratos backend reais confirmados: `AskExternalKnowledgeAiDto`, `ExternalKnowledgeAiController`, `ExternalKnowledgeAiModule`, `ExternalKnowledgeAiService`, `ExternalKnowledgeAiAnswer` e `ExternalKnowledgeInternalCitation`.
- Contratos frontend reais confirmados: `askExternalKnowledgeAi(...)`, `ExternalKnowledgeAnswer` e `ExternalKnowledgeAiPanel`.
- Segurança confirmada na implementação atual: sessão via `SessionGuard`, role `STUDENT`, `userId` vindo da sessão, ownership da área via `StudyAreasService`, bloqueio sem fontes internas processáveis e nota externa separada.
- Handoff em risco: `BK-MF8-05` pode continuar a usar o encadeamento MF8, mas `BK-MF8-04` não deve ser tratado como guia fechado enquanto faltar integração completa no próprio documento.

### Decisões técnicas confirmadas

- `POST /api/ai/external-knowledge-answers` é o contrato técnico real do fluxo.
- `allowExternalKnowledge` é a permissão explícita atual no DTO/frontend.
- `externalUsed` e `externalNotes` são os campos que separam nota externa de citações internas.
- `NO_INTERNAL_SOURCES` é o erro atual quando a área não tem fontes internas processáveis.
- A implementação atual não contém `external-ai-policy.ts`; a policy proposta pelo guia precisa de código de integração e teste próprios para ser ensinável.

### Decisões de domínio confirmadas

- `RNF37` exige governação de IA externa com políticas e filtros próprios.
- `RF39` permite conhecimento externo apenas de forma limitada e quando permitido.
- Contexto externo não substitui fontes internas verificáveis.
- Fontes internas são obrigatórias antes de qualquer resposta com nota externa.
- Prompts, respostas privadas, materiais completos, tokens e cookies não devem aparecer em logs ou evidence.

### Decisões marcadas como DERIVADO

- Criar `resolveExternalAiPolicy(...)` como unidade pequena e testável é uma decisão técnica derivada aceitável, desde que integrada no service.
- Manter a nota externa em `externalNotes` separada de `internalCitations` é uma decisão derivada alinhada com privacidade e explicabilidade.
- Usar specs unitárias sem rede real para provider externo é uma decisão derivada adequada para PAP.

### Drift documental encontrado

- Não foi encontrado drift nos metadados canónicos de `BK-MF8-04`: matriz, backlog, contrato de campos, MF views, README dos guias e RNF estão alinhados.
- Não foram encontrados caminhos privados `real_dev` ou `REFERENCE_ROOT` nos 17 guias MF8.
- Não foram encontrados termos proibidos pela regex obrigatória nos 17 guias MF8.
- Foi encontrado drift técnico/pedagógico no guia alvo: ficheiros e comportamentos reais existem, mas o guia não os apresenta como código completo e cria uma policy nova sem mostrar integração real.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências pela regex obrigatória.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal por `external-ai-policy` em `apps/api` e `real_dev/api`: `PASS` para descoberta de ausência; não existem ficheiros `*external-ai-policy*`.
- `npm --prefix apps/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `npm --prefix real_dev/api test -- external-knowledge-ai`: `PASS`, 1 suite, 3 testes.
- `git diff --check`: `PASS`, sem output no diff rastreado.
- Whitespace final no relatório `AUDITORIA-HIDRATACAO-MF8.md`: `PASS`, sem ocorrências.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco pedagógico alto: um aluno do 12.º ano não consegue implementar `RNF37` apenas com este guia sem inferir o backend, frontend e testes.
- Risco técnico alto: a policy proposta pode ficar solta se o aluno não souber como integrá-la no `ExternalKnowledgeAiService`.
- Risco de defesa médio: a implementação atual passa testes, mas o guia não ensina os mesmos contratos reais de forma completa.
- `TODO (BLOCKER)`: corrigir `BK-MF8-04` em modo `hidratar_corrigir` ou `corrigir_apenas`, acrescentando código completo para policy integrada, service/controller/DTO/module quando necessário, cliente/painel React e specs reais alinhadas com `RNF37`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF7-09`, `BK-MF7-10` e `BK-MF7-11` deixam explicabilidade, separação de contexto e limites docentes como bases de segurança.
- MF alvo: `BK-MF8-01`, `BK-MF8-02` e `BK-MF8-03` reforçam segurança, factualidade e adaptação pedagógica; `BK-MF8-04` deve fechar o uso externo limitado, mas nesta auditoria ainda não está ensinável como guia autónomo.
- MF seguinte: `BK-MF8-05` pode tratar UI/mockup, mas não deve depender de `BK-MF8-04` como guia tecnicamente fechado enquanto os findings acima estiverem abertos.

---

## Execução 2026-07-01 - reauditoria pós-correção BK-MF8-03

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-03]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-03 - IA adapta explicações ao nível do aluno`, depois da correção focada anterior. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK foi editado. A única atualização desta execução é este relatório.

Resultado da reauditoria: `OK`. O guia alvo mantém a estrutura obrigatória com 16 secções `####` e 7 passos técnicos, está alinhado com `RNF36`, usa caminhos públicos em `apps/api` e `apps/web`, não contém caminhos privados, não reintroduz o contrato antigo `BASIC`/`NORMAL`/`learning-level-policy.ts` e ensina backend, frontend, testes, validação e handoff de forma executável.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado herdado da correção focada anterior | 1 | 0 | 0 |
| Estado apurado nesta reauditoria | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-03 | OK | Guia com contrato `LearningProfile`, `LearningPace`, `LearningLevel`, fachada `POST /api/ai/adaptive-explanations`, cliente/painel React, testes e validações alinhados com `apps` e com a referência privada. | P0 |

### Findings reavaliados

| Finding anterior | Estado nesta reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Enum e perfil pedagógico desalinhados com o contrato real | FECHADO | O guia usa `LearningPace = SLOW/BALANCED/FAST` e `LearningLevel = BEGINNER/INTERMEDIATE/ADVANCED`; a pesquisa focal não encontrou `BASIC`, `NORMAL`, `difficultyScore` nem `learning-level-policy`. |
| F02 - Integração backend fica sem código completo | FECHADO | O guia inclui DTO, service, controller, module, ordem de validação, role `STUDENT`, `SessionGuard` e delegação para `AdaptiveLearningService`. |
| F03 - Integração frontend fica sem código completo | FECHADO | O guia inclui `askMf3AdaptiveExplanation(...)`, `AdaptiveExplanationPanel`, estados de UI e uso do helper que mantém cookies HttpOnly com `credentials: "include"`. |
| F04 - Testes pedidos não são entregues como testes reais | FECHADO | O guia ensina suites Jest concretas e as suites reais `adaptive-explanations` e `adaptive-learning` passaram em `apps/api` e `real_dev/api`. |
| F05 - Linguagem interna residual no guia do aluno | FECHADO | O guia alvo não contém caminhos privados, hidratação, scaffold, implementação real, código real ou conversa interna. |

### Evidência consultada

- `docs/RNF.md`: confirma `RNF36 - IA adapta explicações ao nível do aluno`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `docs/planificacao/guias-bk/README.md`: confirmam metadados, sprint, owner, apoio, prioridade, esforço, core e handoff de `BK-MF8-03`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md` e `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirmam o enquadramento anterior e seguinte dentro da MF8.
- `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`: confirma `LearningPace`, `LearningLevel` e defaults `BALANCED`/`INTERMEDIATE`.
- `apps/api/src/modules/adaptive-explanations/*`: confirma DTO, controller com `SessionGuard`, service com bloqueio de role e module.
- `apps/api/src/modules/ai/adaptive-learning.service.ts`: confirma uso de fontes autorizadas, provider validado, persistência e histórico.
- `apps/web/src/features/adaptive-explanations/*` e `apps/web/src/features/mf3/request-mf3-json.ts`: confirmam cliente React, painel e cookies via `credentials: "include"`.
- `real_dev/api` e `real_dev/web`: usados apenas como referência técnica privada; a comparação rápida de `adaptive-explanations` e frontend não devolveu diferenças face a `apps`.

### Mapa de integração da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Endpoint confirmado: `POST /api/ai/adaptive-explanations`.
- Contratos confirmados: `LearningProfile`, `LearningPace`, `LearningLevel`, `AskMf3AdaptiveExplanationDto`, `AdaptiveExplanationsService`, `AdaptiveLearningService`, `askMf3AdaptiveExplanation(...)` e `AdaptiveExplanationPanel`.
- Segurança confirmada: `userId` vem da sessão, role `STUDENT` é validada no backend, ownership da área fica no service, fontes processáveis são obrigatórias e o frontend não decide permissões.
- Handoff confirmado: `BK-MF8-04` pode assumir perfil pedagógico, fontes autorizadas, provider validado e UI de explicação adaptada.

### Drift documental encontrado

- No guia alvo, não foi encontrado drift técnico ou documental crítico.
- Não foram encontrados caminhos privados `real_dev`/`REFERENCE_ROOT` nos 17 guias MF8.
- A estrutura global da MF8 está coerente: os 17 guias têm 16 secções `####` e 7 passos `### Passo`.
- Nota fora do alvo: o varrimento amplo de linguagem encontrou usos de `auditoria` em `BK-MF8-02` ligados a auditoria pedagógica/evidence e uma menção de changelog em `BK-MF8-01` a `auditoria focada`. Como `STRICT_SCOPE=true` e o alvo é `BK-MF8-03`, nada foi editado fora do BK alvo; não há impacto funcional sobre `BK-MF8-03`.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa focal no guia alvo por contrato antigo, padrões inseguros e caminhos privados: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de whitespace final no guia alvo e neste relatório após a atualização: `PASS`, sem ocorrências.
- `npm --prefix apps/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix apps/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `npm --prefix real_dev/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix real_dev/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: esta execução é documental/auditoria; não altera produto nem guia por configuração `auditar_apenas`.
- Risco residual baixo fora do alvo: existe uma menção de changelog a auditoria focada em `BK-MF8-01`, mas está fora do escopo explícito desta execução e não afecta a executabilidade de `BK-MF8-03`.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-03`.

---

## Execução 2026-07-01 - correção focada BK-MF8-03

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-03]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção focada do `BK-MF8-03 - IA adapta explicações ao nível do aluno`, usando a auditoria imediatamente anterior como ponto de partida. O escopo ficou limitado ao guia alvo e a este relatório; os restantes guias MF8 não foram editados nesta execução.

Resultado da correção: `OK`. O guia foi reescrito para remover o contrato paralelo `learning-level-policy.ts` e alinhar `RNF36` com os contratos reais `LearningProfile`, `LearningPace`, `LearningLevel`, `AdaptiveExplanationsService`, `AdaptiveLearningService`, `askMf3AdaptiveExplanation(...)` e `AdaptiveExplanationPanel`. O guia passa a ensinar backend, frontend, testes, validação e handoff sem usar caminhos privados em texto destinado aos alunos.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 0 | 1 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-03 | OK | Guia corrigido com contrato real de perfil pedagógico, fachada backend completa, cliente/painel React completo, testes concretos e validações executadas. | P0 |

### Findings corrigidos

| Finding | Estado após correção | Evidência atual |
| --- | --- | --- |
| F01 - Enum e perfil pedagógico desalinhados com o contrato real | CORRIGIDO | O guia removeu a criação de policy paralela e passou a usar `LearningProfile`, `LearningPace = SLOW/BALANCED/FAST` e `LearningLevel = BEGINNER/INTERMEDIATE/ADVANCED`. |
| F02 - Integração backend fica sem código completo | CORRIGIDO | O guia inclui código completo para `AskMf3AdaptiveExplanationDto`, `AdaptiveExplanationsService`, `AdaptiveExplanationsController` e `AdaptiveExplanationsModule`, além de explicar a delegação para `AdaptiveLearningService`. |
| F03 - Integração frontend fica sem código completo | CORRIGIDO | O guia inclui `ask-adaptive-explanation.ts` e `AdaptiveExplanationPanel` completos, com helper `requestMf3Json(...)`, loading, vazio, erro, sucesso, labels e `credentials: "include"` via helper. |
| F04 - Testes pedidos não são entregues como testes reais | CORRIGIDO | O guia substituiu expected results soltos por suites Jest concretas para fachada e service adaptativo; a execução atual validou as suites reais `adaptive-explanations` e `adaptive-learning`. |
| F05 - Linguagem interna residual no guia do aluno | CORRIGIDO | A secção `Estado antes e depois` passou a descrever estado técnico da aplicação, não histórico de guia/auditoria. |

### Evidência consultada

- `docs/RNF.md`: confirma `RNF36 - IA adapta explicações ao nível do aluno`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `docs/planificacao/guias-bk/README.md`: confirmam os metadados canónicos de `BK-MF8-03`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`: confirma o handoff anterior de factualidade e fallback honesto.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma o BK seguinte.
- `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`, `apps/api/src/modules/ai/adaptive-learning.service.ts`, `apps/api/src/modules/adaptive-explanations/*`, `apps/web/src/features/adaptive-explanations/*`: confirmam os contratos públicos usados no guia.
- `real_dev/api` e `real_dev/web`: usados apenas como referência técnica privada para validar que os contratos de `apps` estão alinhados.

### Mapa de integracao da MF

- Ficheiro corrigido: `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`.
- Ficheiro atualizado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiros de produto editados nesta execução: nenhum.
- Exports ensinados no guia: `LearningPace`, `LearningLevel`, `LearningProfile`, `AskMf3AdaptiveExplanationDto`, `AdaptiveExplanationsService`, `AdaptiveExplanationsController`, `AdaptiveExplanationsModule`, `askMf3AdaptiveExplanation(...)` e `AdaptiveExplanationPanel`.
- Imports consumidos de BKs anteriores: `SessionGuard`, `AuthenticatedRequest`, `AuthenticatedUser`, `AdaptiveLearningService`, `requestMf3Json(...)` e tipos de `apiClient`.
- Endpoint confirmado: `POST /api/ai/adaptive-explanations`.
- DTOs/validators confirmados: `AskMf3AdaptiveExplanationDto` e `UpdateLearningProfileDto`.
- Schemas/modelos confirmados: `LearningProfile` e `AdaptiveExplanation`.
- Services confirmados: `AdaptiveExplanationsService` e `AdaptiveLearningService`.
- Componentes/frontend confirmados: `ask-adaptive-explanation.ts` e `AdaptiveExplanationPanel`.
- Provider IA: usado indiretamente por `AdaptiveLearningService` depois de sessão, role, ownership, perfil e fontes.
- Regras de segurança: `userId` vem da sessão, role `STUDENT`, ownership da área, bloqueio sem fontes processáveis, validação de fonte devolvida pelo provider e ausência de dados sensíveis em evidence.
- Testes ensinados no guia: fachada `adaptive-explanations` e service `adaptive-learning`.
- BK seguinte dependente: `BK-MF8-04`, que pode assumir perfil pedagógico, fontes autorizadas, provider validado e UI de explicação adaptada.

### Drift documental encontrado

- O drift técnico encontrado na auditoria anterior foi corrigido no guia alvo: o BK já não ensina `BASIC`, `NORMAL`, `difficultyScore`, `learning-level-policy.ts` nem expected-results soltos.
- Não foi encontrado drift nos metadados canónicos de `BK-MF8-03`.
- Não foram encontrados caminhos privados nos 17 guias MF8 após a correção.
- Não foram encontrados termos internos proibidos nos 17 guias MF8 após a correção.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa focal no guia alvo por contrato antigo, linguagem interna, padrões inseguros e caminhos privados: `PASS`, sem ocorrências.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- `npm --prefix apps/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix apps/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `npm --prefix real_dev/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix real_dev/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: o guia está alinhado com a implementação atual, mas os ficheiros de produto não foram alterados nesta execução por escopo documental.
- Risco operacional baixo: as suites reais atuais provam os contratos principais, mas a evidence de UI continua documental; não foi executado browser/E2E porque o BK corrige guia, não produto.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-03`.

---

## Execução 2026-07-01 - auditoria focada BK-MF8-03

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-03]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma auditoria fresca ao `BK-MF8-03 - IA adapta explicações ao nível do aluno`. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK foi editado. A única atualização desta execução é este relatório.

Resultado da auditoria: `CRITICO`. O guia tem a estrutura formal correta da MF8, com 16 secções `####` e 7 passos técnicos, mas não é tecnicamente executável por um aluno sem decisões em falta. O problema principal é a divergência entre o contrato ensinado no guia e o contrato real já existente: o guia cria `learning-level-policy.ts` com níveis `BASIC`, `INTERMEDIATE` e `ADVANCED`, enquanto a implementação validada usa `LearningProfile.level` com `BEGINNER`, `INTERMEDIATE` e `ADVANCED`. Além disso, os passos de backend e frontend ficam sem código completo, apesar de o guia declarar endpoint, service, DTO, módulo, cliente e componente.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Estado reportado historicamente após a reescrita geral MF8 | 1 | 0 | 0 |
| Estado apurado nesta auditoria focada | 0 | 0 | 1 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-03 | CRITICO | Estrutura documental correta, mas contrato de nível desalinhado com `LearningProfile`, integração backend/frontend sem código completo e testes pedidos não materializados como suite real no guia. | P0 |

### Findings

| Finding | Estado | Evidência | Risco |
| --- | --- | --- | --- |
| F01 - Enum e perfil pedagógico desalinhados com o contrato real | CRITICO | O guia ensina `LearningLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED"` e `preferredPace: "SLOW" | "NORMAL" | "FAST"`. A referência validada usa `LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"` e `LearningPace = "SLOW" | "BALANCED" | "FAST"` em `apps/api/src/modules/ai/schemas/learning-profile.schema.ts` e `real_dev/api/src/modules/ai/schemas/learning-profile.schema.ts`. | O aluno pode criar uma policy incompatível com o schema, DTOs, prompt e testes existentes. |
| F02 - Integração backend fica sem código completo | CRITICO | O guia declara `POST /api/ai/adaptive-explanations`, `AdaptiveExplanationsService`, `AdaptiveLearningService`, DTO e módulo, mas o Passo 4 diz `Sem código neste passo` e remete a integração para instruções gerais. A implementação real já tem `AdaptiveExplanationsController`, `AdaptiveExplanationsService` e `AskMf3AdaptiveExplanationDto`. | O aluno teria de adivinhar imports, controller, DTO, service, module e ordem de validação, contrariando a regra de BK autocontido. |
| F03 - Integração frontend fica sem código completo | CRITICO | O guia manda criar cliente tipado e painel React, mas o Passo 5 diz `Sem código neste passo` e afirma que a integração varia consoante a página real. A referência validada já tem `ask-adaptive-explanation.ts` e `adaptive-explanation-panel.tsx`. | O aluno não recebe código completo para loading, erro, sucesso, `credentials: "include"` e contrato da resposta. |
| F04 - Testes pedidos não são entregues como testes reais | PARCIAL | O guia pede role não aluno, perfil inexistente e nível normalizado, mas no Passo 6 cria apenas `bk-mf8-03.expected-results.ts`. As suites reais `adaptive-explanations` e `adaptive-learning` passam, mas o guia não ensina a suite que provaria exatamente o contrato novo que propõe. | A defesa pode ter evidence genérica em vez de negativos automatizados ligados a `RNF36`. |
| F05 - Linguagem interna residual no guia do aluno | PARCIAL | A secção `Estado antes e depois` diz que o requisito surgia no "guia antigo com bloco genérico, linguagem interna e sem tutorial técnico completo". | O guia fala da auditoria/documentação interna em vez de falar apenas da entrega incremental do aluno. |

### Evidência consultada

- `README.md`, `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/README.md`, `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`, matriz, backlog, contrato de campos, MF views, plano de sprints, README dos guias e template BK existem.
- `docs/RNF.md`: `RNF36` confirma o requisito "IA adapta explicações ao nível do aluno".
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: confirmam `BK-MF8-03`, MF8, owner `Daniel`, apoio `Natalia`, prioridade `P1`, esforço `S`, dependências `-`, `RNF36`, fase `Fase 3`, sprint `S12`, core e próximo BK `BK-MF8-04`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`: confirma o handoff anterior de factualidade com fontes e fallback honesto.
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`: confirma dependência sequencial de `BK-MF8-03`.
- `apps/api/src/modules/adaptive-explanations/*` e `real_dev/api/src/modules/adaptive-explanations/*`: confirmam controller, module, service, DTO e testes reais do endpoint.
- `apps/api/src/modules/ai/adaptive-learning.service.ts`, `apps/api/src/modules/ai/schemas/learning-profile.schema.ts` e equivalentes em `real_dev/api`: confirmam o contrato técnico real de perfil, fontes, provider, persistência e histórico.
- `apps/web/src/features/adaptive-explanations/*` e equivalentes em `real_dev/web`: confirmam cliente e painel React existentes.

### Mapa de integracao da MF

- Ficheiro auditado: `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Guias BK editados nesta execução: nenhum.
- Contratos backend reais que o guia devia consumir ou ensinar corretamente: `AdaptiveExplanationsController`, `AdaptiveExplanationsService`, `AskMf3AdaptiveExplanationDto`, `AdaptiveLearningService`, `LearningProfile`, `LearningLevel`, `LearningPace` e `buildAdaptiveExplanationPrompt(...)`.
- Contratos frontend reais que o guia devia consumir ou ensinar corretamente: `askMf3AdaptiveExplanation(...)`, `AdaptiveExplanationPanel` e helper `requestMf3Json(...)`.
- Endpoint real: `POST /api/ai/adaptive-explanations`.
- Segurança confirmada na implementação real: sessão via `SessionGuard`, role `STUDENT`, `userId` vindo da sessão, ownership da área via `StudyAreasService`, bloqueio sem fontes processáveis e validação de fontes devolvidas pelo provider.
- Handoff em risco: `BK-MF8-04` pode depender de personalização pedagógica, mas o guia atual de `BK-MF8-03` precisa de correção antes de ser tratado como contrato fechado para alunos.

### Drift documental encontrado

- Não foi encontrado drift nos metadados canónicos de `BK-MF8-03`: matriz, backlog, contrato de campos, MF views, README dos guias e RNF estão alinhados.
- Foi encontrado drift técnico entre o guia alvo e a implementação validada: `BASIC`/`NORMAL`/`difficultyScore`/`learning-level-policy.ts` não refletem o contrato real `BEGINNER`/`BALANCED`/`LearningProfile`.
- Não foram encontrados caminhos privados `real_dev` nos 17 guias MF8.
- Não foram encontrados termos proibidos pela pesquisa estática nos 17 guias MF8.
- Não existe MF9 no diretório de guias; a coerência seguinte verificada nesta execução é `BK-MF8-04`.

### Verificações executadas nesta execução

- Existência dos documentos obrigatórios principais: `PASS`.
- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos técnicos.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências pela regex obrigatória.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa canónica por `BK-MF8-03`/`RNF36`: `PASS`, matriz, backlog, contrato, MF views, README e RNF alinhados.
- Pesquisa estática em `apps/api`, `apps/web`, `real_dev/api` e `real_dev/web` para adaptive explanations/adaptive learning: `PASS` para descoberta de contratos; encontrou o drift técnico descrito em F01-F04.
- `npm --prefix apps/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix real_dev/api test -- adaptive-explanations`: `PASS`, 1 suite, 2 testes.
- `npm --prefix apps/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `npm --prefix real_dev/api test -- adaptive-learning`: `PASS`, 1 suite, 4 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco pedagógico alto: um aluno do 12.º ano não consegue implementar `RNF36` com segurança apenas com o guia atual, porque teria de decidir como integrar backend, frontend e testes.
- Risco técnico alto: seguir literalmente o guia pode introduzir enum/ficheiro/policy paralelos aos contratos reais, criando importações e payloads incompatíveis.
- Risco de segurança médio: a implementação real tem ownership e role no backend, mas o guia não mostra código suficiente para provar que o aluno preservaria essa ordem segura.
- `TODO (BLOCKER)`: corrigir o guia `BK-MF8-03` em modo `hidratar_corrigir` ou `corrigir_apenas`, alinhando-o com os contratos reais `LearningProfile`, `AdaptiveExplanationsService`, `AdaptiveLearningService`, cliente React e suites Jest.

---

## Execução 2026-07-01 - corrigir_apenas BK-MF8-02 sem alterações necessárias

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-02]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executado o modo `corrigir_apenas` para `BK-MF8-02 - IA não pode inventar informação factual`. O relatório existente mais recente já classificava o BK alvo como `OK`; por isso, não havia findings `PARCIAL` ou `CRITICO` pendentes para corrigir dentro do escopo.

Resultado desta execução: `OK`, sem alterações ao guia BK. O escopo ficou limitado à validação do guia alvo, à coerência da MF8 e à atualização deste relatório. Não foram editados ficheiros em `apps/api`, `apps/web` ou `real_dev`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes desta execução `corrigir_apenas` | 1 | 0 | 0 |
| Depois desta execução `corrigir_apenas` | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Decisão | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-02 | OK | Sem correção aplicada porque o relatório mais recente já tinha fechado F01-F04 e a validação atual não encontrou nova lacuna. | P0 |

### Findings do relatório existente

| Finding | Estado nesta execução | Evidência |
| --- | --- | --- |
| F01 - Integração backend fica sem código completo | JA_CORRIGIDO | O guia mantém DTO, schema/model, controller, module, service e policy completos para o fluxo com fontes obrigatórias. |
| F02 - Frontend e fallback honesto ficam genéricos | JA_CORRIGIDO | O guia mantém cliente tipado e painel React com loading, erro, vazio, sucesso e citações públicas limitadas. |
| F03 - Testes pedidos não são entregues como testes reais | JA_CORRIGIDO | O guia mantém suites Jest para policy e service, incluindo caminho feliz e negativos críticos. |
| F04 - Drift técnico entre policy nova e contrato real existente | JA_CORRIGIDO | O guia continua alinhado com `citation-policy.ts`, `normalizePublicCitation(...)`, `NO_INDEXED_SOURCES` e `SOURCE_GROUNDED_AI`; não reapareceu `factuality-policy.ts` nem `AI_FACTUAL_SOURCES_REQUIRED`. |

### Mapa de integracao da MF

- Guias BK editados nesta execução: nenhum.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Ficheiro alvo validado: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`.
- Contratos backend confirmados no guia: `AskSourceGroundedAiDto`, `SourceGroundedAiAnswer`, `SourceGroundedAiController`, `SourceGroundedAiModule`, `SourceGroundedAiService`, `citation-policy.ts`, `normalizePublicCitation(...)`, `NO_INDEXED_SOURCES` e `SOURCE_GROUNDED_AI`.
- Contratos frontend confirmados no guia: `askSourceGroundedAi(...)`, `SourceGroundedAiPanel`, chamada a `POST /api/ai/source-grounded-answers` e uso de sessão via helper com `credentials: "include"`.
- BK seguinte dependente: `BK-MF8-03`, que continua a poder assumir resposta factual com fontes obrigatórias, citações públicas e fallback honesto.

### Drift documental encontrado

- Não foi encontrado drift em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints ou índice de guias para `BK-MF8-02`.
- Não foram encontrados termos internos proibidos nos guias MF8.
- Não foram encontrados caminhos privados `real_dev` nos guias MF8 destinados aos alunos.
- Pesquisa estática nos módulos `source-grounded-ai` encontrou apenas uma menção negativa aceitável a `RAG` em `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, no comentário "não introduz RAG externo". Não é promessa indevida nem caminho de entrega privado.

### Verificações executadas nesta execução

- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Pesquisa canónica por `BK-MF8-02`/`RNF35`: `PASS`, documentação alinhada.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa estática em `real_dev/api`, `real_dev/web`, `apps/api` e `apps/web` para o módulo `source-grounded-ai`: `PASS`; a única ocorrência relevante foi uma menção negativa aceitável a `RAG`.
- `npm --prefix apps/api test -- source-grounded-ai`: `PASS`, 1 suite, 3 testes.
- `npm --prefix real_dev/api test -- source-grounded-ai`: `PASS`, 3 suites, 14 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: esta execução não aplicou alterações no guia porque o BK alvo já estava `OK`.
- Risco operacional baixo: `apps/api` mantém uma implementação atual mais simples do que a referência privada completa, mas o objetivo desta prompt é corrigir o guia, não aplicar o BK em código de produto.
- Não há `TODO (BLOCKER)` restante para `BK-MF8-02`.

---

## Execução 2026-07-01 - reauditoria pós-correção BK-MF8-02

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-02]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-02 - IA não pode inventar informação factual`, depois da correção documental focada. O modo desta execução é `auditar_apenas`; por isso, nenhum guia BK foi alterado nesta reauditoria. A única atualização desta execução é este relatório.

Resultado da reauditoria: `OK`. O guia alvo mantém os metadados canónicos de `RNF35`, a estrutura obrigatória de 16 secções `####` e 7 passos técnicos, os caminhos públicos em `apps/api` e `apps/web`, e ensina a integração completa para factualidade com fontes obrigatórias: DTO, schema/model, controller, module, `SourceGroundedAiService`, `citation-policy`, cliente React, painel React e suites Jest.

A reauditoria confirmou que o drift anterior foi fechado: o guia já não cria `factuality-policy.ts` nem o erro duplicado `AI_FACTUAL_SOURCES_REQUIRED`; usa `citation-policy.ts`, `normalizePublicCitation(...)`, `NO_INDEXED_SOURCES`, `SOURCE_GROUNDED_AI`, `findReadableDoneJob(...)`, consentimento, política de modelo e quota antes do provider.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria pós-correção | 1 | 0 | 0 |
| Depois da reauditoria pós-correção | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-02 | OK | Guia completo, coerente com `RNF35`, alinhado com `real_dev`, sem linguagem interna proibida e com validações documentais/produto a passar. | P0 |

### Findings reavaliados

| Finding | Estado após reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Integração backend fica sem código completo | FECHADO | O guia inclui código completo para `AskSourceGroundedAiDto`, `SourceGroundedAiAnswer`, `SourceGroundedAiController`, `SourceGroundedAiModule`, `SourceGroundedAiService` e `citation-policy.ts`, com fontes autorizadas antes de consentimento, política, quota, provider e persistência. |
| F02 - Frontend e fallback honesto ficam genéricos | FECHADO | O guia inclui `ask-source-grounded-ai.ts` e `SourceGroundedAiPanel`, com cliente tipado, chamada ao endpoint real, loading, erro, vazio, sucesso e lista de citações públicas limitadas. |
| F03 - Testes pedidos não são entregues como testes reais | FECHADO | O guia inclui `citation-policy.spec.ts` e `source-grounded-ai.service.spec.ts`, com caminho feliz, ausência de fontes, fonte proibida, consentimento recusado, quota excedida e provider inválido. |
| F04 - Drift técnico entre policy nova e contrato real existente | FECHADO | A auditoria confirmou ausência de `factuality-policy.ts` e `AI_FACTUAL_SOURCES_REQUIRED` no guia alvo; o contrato está alinhado com `citation-policy.ts`, `normalizePublicCitation(...)` e `NO_INDEXED_SOURCES`. |

### Evidência consultada

- `docs/RNF.md`: `RNF35` confirma o requisito "IA não pode inventar informação factual".
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: confirma `BK-MF8-02`, MF8, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependências `-`, `RNF35`, `Fase 3`, sprint `S11`, reforço e próximo BK `BK-MF8-03`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirmam o mesmo contrato canónico.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam MF8 com 17 guias e link correto para `BK-MF8-02`.
- `real_dev/api/src/modules/source-grounded-ai/*`: confirma referência privada com `citation-policy`, DTO, schema, controller, module, service, contract tests e suites unitárias.
- `real_dev/web/src/features/source-grounded-ai/*`: confirma cliente e painel React de referência.
- `apps/api/src/modules/source-grounded-ai/*` e `apps/web/src/features/source-grounded-ai/*`: confirmam que os alvos públicos existem; a implementação atual de `apps` ainda é mais simples do que a referência privada, mas isso é coerente com uma execução documental de guia.

### Mapa de integração da MF

- Ficheiro auditado: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`.
- Ficheiro atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`.
- Guias BK editados nesta reauditoria: nenhum.
- Ficheiros backend que o guia manda criar/editar em `apps/api`: `citation-policy.ts`, `ask-source-grounded-ai.dto.ts`, `source-grounded-ai-answer.schema.ts`, `source-grounded-ai.controller.ts`, `source-grounded-ai.module.ts`, `source-grounded-ai.service.ts`, `citation-policy.spec.ts` e `source-grounded-ai.service.spec.ts`.
- Ficheiros frontend que o guia manda criar/editar em `apps/web`: `ask-source-grounded-ai.ts` e `source-grounded-ai-panel.tsx`.
- Endpoint documentado: `POST /api/ai/source-grounded-answers`.
- Regra principal validada: sem fontes processáveis citáveis, o backend devolve `NO_INDEXED_SOURCES` antes de chamar provider ou persistir resposta.
- Handoff: `BK-MF8-03` pode assumir factualidade com fontes obrigatórias, citações públicas limitadas e fallback honesto.

### Drift documental encontrado

- Não foi encontrado drift em matriz, backlog, contrato de campos, MF views ou índice de guias para `BK-MF8-02`.
- Não foi encontrada linguagem interna proibida nos 17 guias MF8.
- Não foram encontrados caminhos privados `real_dev` nos 17 guias MF8.
- A pesquisa focal no guia alvo não encontrou `factuality-policy`, `AI_FACTUAL_SOURCES_REQUIRED`, `payload: unknown`, `as any`, `localStorage` com token, `TODO (BLOCKER)` ou promessas de implementação posterior.
- A pesquisa focal por `token` só encontrou avisos de privacidade para não expor tokens em evidence; são ocorrências aceitáveis.

### Verificações executadas nesta execução

- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos técnicos.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa canónica por `BK-MF8-02`/`RNF35`: `PASS`, matriz, backlog, contrato, MF views, README e RNF alinhados.
- `npm --prefix apps/api test -- source-grounded-ai`: `PASS`, 1 suite, 3 testes.
- `npm --prefix real_dev/api test -- source-grounded-ai`: `PASS`, 3 suites, 14 testes.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Riscos restantes

- Risco residual baixo: esta execução confirma a qualidade do guia, mas não aplica a implementação completa em `apps/api` ou `apps/web`.
- Risco operacional baixo: `apps/api` tem testes atuais a passar, mas a suite atual é mais curta do que a referência privada; a cobertura completa fica descrita no guia e validada em `real_dev`.
- Não há `TODO (BLOCKER)` documental restante para `BK-MF8-02`.

---

## Execução 2026-07-01 - correção focada BK-MF8-02

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-02]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção focada do `BK-MF8-02 - IA não pode inventar informação factual`, usando a reauditoria imediatamente anterior como ponto de partida. O escopo ficou limitado ao guia alvo e a este relatório; os restantes 16 guias MF8 não foram editados nesta execução.

Resultado da correção: `OK`. O guia passou a ensinar a integração completa de `RNF35`: DTO, schema/model, controller, module, `SourceGroundedAiService`, `citation-policy`, cliente React, painel React e suites Jest. A correção removeu a decisão duplicada `factuality-policy.ts`/`AI_FACTUAL_SOURCES_REQUIRED` e alinhou o guia com o contrato técnico existente de `citation-policy.ts`, `normalizePublicCitation(...)` e erro `NO_INDEXED_SOURCES`.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-02 | OK | Guia corrigido com backend, frontend, testes, validação e handoff completos para `RNF35`. | P0 |

### Findings corrigidos

| Finding | Estado | Evidência da correção |
| --- | --- | --- |
| F01 - Integração backend fica sem código completo | CORRIGIDO | `BK-MF8-02` passou a mostrar código completo para `AskSourceGroundedAiDto`, `SourceGroundedAiAnswer`, `SourceGroundedAiController`, `SourceGroundedAiModule` e `SourceGroundedAiService`, com validação de fontes antes de consentimento, política, quota, provider e persistência. |
| F02 - Frontend e fallback honesto ficam genéricos | CORRIGIDO | O guia passou a incluir `ask-source-grounded-ai.ts` e `SourceGroundedAiPanel`, com cliente tipado, chamada ao endpoint real, loading, erro, vazio, sucesso, labels e apresentação de citações públicas limitadas. |
| F03 - Testes pedidos não são entregues como testes reais | CORRIGIDO | O guia passou a incluir `citation-policy.spec.ts` e `source-grounded-ai.service.spec.ts`, com caminho feliz, ausência de fontes, fonte proibida, consentimento recusado, quota excedida e provider inválido. |
| F04 - Drift técnico entre policy nova e contrato real existente | CORRIGIDO | A lista de ficheiros e o tutorial deixaram de criar `factuality-policy.ts`; o guia usa `citation-policy.ts`, `normalizePublicCitation(...)` e `NO_INDEXED_SOURCES`, preservando o contrato já usado pelo módulo source-grounded. |

### Mapa de integracao da MF

- Ficheiros criados no guia: nenhum ficheiro novo fora do módulo existente.
- Ficheiros editados no guia: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`.
- Ficheiros que o guia manda editar em `apps/api`: `apps/api/src/modules/source-grounded-ai/citation-policy.ts`, `apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`, `apps/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`, `apps/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`, `apps/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`, `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `apps/api/src/modules/source-grounded-ai/citation-policy.spec.ts`, `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`.
- Ficheiros que o guia manda editar em `apps/web`: `apps/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`, `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`.
- Ficheiros que o guia manda rever: `apps/api/src/app.module.ts`, `apps/api/src/common/guards/session.guard.ts`, `apps/api/src/modules/material-index/material-index.service.ts`, `apps/api/src/modules/ai-consents/ai-consents.service.ts`, `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`, `apps/api/src/modules/ai-quotas/ai-quotas.service.ts`, `apps/web/src/features/mf3/request-mf3-json.ts`.
- Exports produzidos: `PublicCitation`, `normalizePublicCitation(...)`, `AskSourceGroundedAiDto`, `SourceGroundedCitation`, `SourceGroundedAiAnswer`, `SourceGroundedAiAnswerSchema`, `SourceGroundedAiController`, `SourceGroundedAiModule`, `SourceGroundedAiService`, `SourceGroundedAiAnswerView`, `SourceGroundedAnswer`, `askSourceGroundedAi(...)`, `SourceGroundedAiPanel`.
- Imports consumidos de BKs anteriores: `SessionGuard`, `AuthenticatedRequest`, `AuthenticatedUser`, `AI_PROVIDER`, `AiProvider`, `withAiResponseBudget(...)`, `AiConsentsService`, `AiModelPoliciesService`, `AiQuotasService`, `MaterialIndexService`, `MaterialIndexJobView`, `MaterialTextChunk`, `requestMf3Json(...)`.
- Endpoint criado/revisto: `POST /api/ai/source-grounded-answers`.
- DTOs/validators criados/revistos: `AskSourceGroundedAiDto`, com `sourceJobIds` e `question` validados.
- Schemas/modelos criados/revistos: `SourceGroundedAiAnswer` e `SourceGroundedCitation`.
- Services criados/revistos: `SourceGroundedAiService`, com ordem segura de fontes, consentimento, política, quota, provider e persistência.
- Componentes/páginas frontend criados/revistos: `askSourceGroundedAi(...)` e `SourceGroundedAiPanel`.
- Providers de IA usados: provider isolado `AI_PROVIDER`, chamado apenas depois de validação de fontes e governança IA.
- Regras de segurança/autorização aplicadas: sessão real, `userId` derivado da sessão, ownership/membership via `findReadableDoneJob(...)`, bloqueio sem fontes, bloqueio de fonte proibida antes do provider e ausência de dados sensíveis em evidence.
- Testes criados/revistos: `citation-policy.spec.ts` e `source-grounded-ai.service.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-03`, que agora pode assumir factualidade com fontes obrigatórias e fallback honesto.

### Decisões técnicas confirmadas

- `citation-policy.ts` é a policy correta para normalizar citações públicas; não é necessário criar `factuality-policy.ts`.
- `NO_INDEXED_SOURCES` é o erro observável correto quando não há fontes processáveis citáveis.
- `MaterialIndexService.findReadableDoneJob(...)` é a fronteira correta de ownership/membership para cada fonte.
- `SOURCE_GROUNDED_AI` é a finalidade correta para consentimento, política e quota.
- O provider não escolhe as citações; o backend escolhe e limita citações antes de construir o prompt.
- A UI consome o contrato backend com cliente tipado e não decide permissões localmente.

### Decisões de domínio confirmadas

- `RNF35` exige que a IA não invente informação factual.
- Respostas factuais só podem sair quando existem fontes processáveis, autorizadas e citáveis.
- A IA privada, IA da sala e IA de turma/disciplina continuam separadas porque a fonte é validada pelo backend antes do provider.
- O fallback honesto é comportamento correto quando faltam fontes, consentimento, quota ou provider válido.

### Decisões marcadas como DERIVADO

- Limitar excertos públicos a 420 caracteres para provar origem sem expor material completo.
- Usar seleção lexical simples e explicável para escolher até três chunks por fonte.
- Usar `SOURCE_GROUNDED_AI` como finalidade técnica única para governança deste fluxo.

### Drift documental encontrado

- Não foi encontrado drift em matriz, backlog, contrato de campos, MF views ou índice de guias.
- O drift técnico registado na reauditoria foi corrigido no guia alvo: a policy duplicada foi removida e substituída pelo contrato `citation-policy.ts`/`SourceGroundedAiService`.

### Riscos restantes

- Risco residual baixo: a execução é documental e corrige o guia, não cria ficheiros reais em `apps/api` nem `apps/web`.
- Os testes de produto descritos no guia devem ser executados quando o aluno aplicar o BK na implementação real.
- Não há `TODO (BLOCKER)` documental restante para `BK-MF8-02`.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF7-09`, `BK-MF7-10` e `BK-MF7-11` entregam fontes explicáveis, separação de perfis/contextos e limites docentes.
- MF alvo: `BK-MF8-01` entrega bloqueio ético; `BK-MF8-02` entrega factualidade com fontes obrigatórias.
- MF seguinte: `BK-MF8-03` pode adaptar explicações ao nível do aluno sem abdicar da regra de fontes obrigatórias.

### Verificações executadas nesta execução

- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos técnicos.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.
- Testes de produto `npm --prefix apps/api test -- source-grounded-ai`: não executados porque esta execução corrigiu o guia documental, não criou ainda os ficheiros reais em `apps/api`.

---

## Execução 2026-07-01 - reauditoria focada BK-MF8-02

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-02]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-02 - IA não pode inventar informação factual`, lendo a MF8 completa apenas para coerência, sequência e validação textual. O modo desta execução é `auditar_apenas`, por isso nenhum guia BK foi editado.

Resultado da reauditoria: `PARCIAL`. O guia mantém a estrutura formal obrigatória com 16 secções `####`, 7 passos técnicos, metadados canónicos alinhados com `RNF35`, caminhos públicos em `apps/api` e `apps/web`, ausência de linguagem interna proibida e ausência de fuga de `real_dev` no texto destinado aos alunos.

Mesmo assim, o guia ainda não deve ficar `OK`: os passos de integração backend, integração frontend e testes deixam decisões técnicas essenciais em aberto. Para um aluno do 12.o ano, isto ainda exige adivinhar como ligar a policy ao `SourceGroundedAiService`, como expor o erro/fallback no cliente React e como criar a suite real para sem fontes, provider inválido e resposta válida com citações.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete a classificação histórica da hidratação de 2026-06-30, que marcou todos os 17 guias MF8 como `OK`. Esta reauditoria substitui essa classificação apenas para o `BK-MF8-02`.

### Resultado por BK analisado

| BK | Estado atual | Problema principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-02 | PARCIAL | Estrutura formal boa, mas sem código completo para integração backend/frontend e sem suite real de testes para o requisito factual. | P1 |

### Documentos e evidência consultada nesta reauditoria

- `docs/RNF.md`: `RNF35` confirma o requisito "IA não pode inventar informação factual".
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: `BK-MF8-02` confirma MF8, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, dependências `-`, `RNF35`, fase `Fase 3`, sprint `S11`, reforço e próximo BK `BK-MF8-03`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` e `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirmam o mesmo contrato canónico.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a lista MF8 com 17 guias e o link para `BK-MF8-02`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`: confirma o handoff anterior para factualidade.
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`: confirma que o BK seguinte depende de um contrato anti-alucinação factual já fechado.
- `real_dev/api/src/modules/source-grounded-ai/*` e `real_dev/web/src/features/source-grounded-ai/*`: usados apenas como referência privada. A implementação real mostra contratos concretos para `SourceGroundedAiService`, `SourceGroundedAiController`, DTO, schema, `citation-policy`, testes e cliente/painel React.

### Findings

| Finding | Estado | Evidência atual |
| --- | --- | --- |
| F01 - Integração backend fica sem código completo | PARCIAL | O passo 4 promete ligar `POST /api/ai/source-grounded-answers`, mas a secção de código diz `Sem código neste passo`. A referência privada já tem `SourceGroundedAiService.ask(...)`, `AskSourceGroundedAiDto`, schema e controller, por isso o guia deveria ensinar a integração concreta em `apps/api`, incluindo ordem de autorização, fontes, consentimento, política, quota, provider e persistência. |
| F02 - Frontend e fallback honesto ficam genéricos | PARCIAL | O passo 5 pede cliente tipado, `credentials: "include"` e estados loading/vazio/erro/sucesso, mas volta a dizer `Sem código neste passo` porque "a integração varia". A referência privada já tem `ask-source-grounded-ai.ts` e `SourceGroundedAiPanel`, logo o aluno ainda fica sem exemplo completo para `apps/web`. |
| F03 - Testes pedidos não são entregues como testes reais | PARCIAL | O passo 6 pede sem fontes, provider sem citações e resposta válida com citações, mas o único código mostrado é `bk-mf8-02.expected-results.ts`. Isto não substitui uma suite `.spec.ts` com asserts sobre `SourceGroundedAiService`, provider, persistência e negativos de fontes. |
| F04 - Drift técnico entre policy nova e contrato real existente | PARCIAL | O guia manda criar `factuality-policy.ts` com erro `AI_FACTUAL_SOURCES_REQUIRED`, mas a referência privada já usa `citation-policy.ts`, `normalizePublicCitation(...)` e erro HTTP `NO_INDEXED_SOURCES` quando não há fontes citáveis. Sem instrução de migração ou compatibilidade, há risco de duplicar policies e códigos de erro. |

### Mapa de integracao da MF

- Ficheiros criados no guia: `apps/api/src/modules/source-grounded-ai/factuality-policy.ts`, `apps/api/src/modules/source-grounded-ai/factuality-policy.spec.ts`, `apps/api/src/modules/mf8/bk-mf8-02.expected-results.ts`.
- Ficheiros editados no guia: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`.
- Ficheiros apenas revistos no guia: `apps/api/src/modules/material-index/material-index.service.ts`, `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`, `apps/web/src/features/mf3/request-mf3-json.ts`, `apps/web/src/lib/apiClient.ts`.
- Exports produzidos pelo guia: `PublicCitation`, `assertFactualAnswerGrounded(...)`, `bkMf802ExpectedResults`, `getBkMf802ExpectedResult(...)`.
- Imports/contratos consumidos de BKs anteriores: sessão autenticada, `MaterialIndexService.findReadableDoneJob(...)`, source-grounded AI, citações públicas, consentimento IA, política de modelo, quota IA e cliente `requestMf3Json(...)`.
- Endpoint principal: `POST /api/ai/source-grounded-answers`.
- DTOs/validators: o guia remete para o contrato existente, mas não mostra código completo do DTO nem a ligação ao service.
- Schemas/modelos: o guia remete para persistência de respostas com citações, mas não mostra o schema completo nem a integração no module.
- Services: o guia promete integração no `SourceGroundedAiService`, mas ainda não fornece o código completo.
- Componentes/páginas frontend: o guia promete fallback honesto na UI, mas ainda não fornece cliente/componente completo.
- Providers de IA: devem ser chamados só depois de fontes autorizadas, consentimento, política e quota; a sequência está descrita, mas não demonstrada no código do guia.
- Regras de segurança/autorização: sessão real, validação backend, ownership/membership via `findReadableDoneJob(...)`, ausência de `userId` no body e ausência de dados sensíveis em logs/evidence.
- Testes esperados: sem fontes, fonte proibida, provider inválido/sem resposta factual citável, resposta válida com citações, sem persistência quando falha.
- BKs seguintes dependentes: `BK-MF8-03`, que precisa de factualidade/citações já fechadas antes de adaptar explicações ao nível do aluno.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF7-09` e `BK-MF7-10` já trabalham citações, fontes autorizadas e separação de perfis/contextos; `BK-MF7-11` fecha limites docentes e aponta para o início de MF8.
- MF alvo: `BK-MF8-01` fica como base de bloqueio ético; `BK-MF8-02` deve transformar `RNF35` em comportamento factual verificável.
- MF seguinte dentro da sequência: `BK-MF8-03` pode depender do contrato de anti-alucinação factual, mas apenas depois de o guia alvo ensinar a integração completa e os testes reais.
- A MF8 completa mantém 17 guias; todos os guias MF8 mantêm 16 secções `####` e 7 passos técnicos.

### Drift documental encontrado

- Não foi encontrado drift em matriz, backlog, contrato de campos, MF views ou índice de guias para `BK-MF8-02`.
- Há drift técnico dentro do guia entre o novo `factuality-policy.ts` e a implementação privada já existente em `citation-policy.ts`/`SourceGroundedAiService`.
- A pesquisa focal encontrou `RAG`, `embeddings` e `OCR` apenas como proibição no `Scope-out`; nesta reauditoria são falsos positivos aceitáveis.
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md` ainda contém exemplos `real_dev/...`, mas isso está fora do guia alvo e fora do escopo de edição desta execução.

### Riscos restantes

- Risco pedagógico médio: o aluno consegue perceber o objetivo, mas ainda teria de desenhar sozinho partes sensíveis da integração.
- Risco técnico médio: duplicação de policy/código de erro pode partir coerência com `SourceGroundedAiService`, `citation-policy.ts` e testes existentes.
- Risco de segurança/privacidade médio: a ordem correta de fontes autorizadas, consentimento, política, quota, provider e persistência está descrita, mas não é ensinada com código completo no guia.
- Risco de handoff: `BK-MF8-03` pode assumir factualidade já fechada quando o `BK-MF8-02` ainda não prova a integração completa.
- Não há `TODO (BLOCKER)` documental para matriz/backlog/RNF; a correção é possível dentro do próprio guia, mas não foi aplicada por `MODO=auditar_apenas`.

### Verificações executadas nesta execução

- Estrutura dos 17 guias MF8: `PASS`, todos com 16 secções `####` e 7 passos `### Passo`.
- Estrutura do guia alvo: `PASS`, com 16 secções `####` e 7 passos técnicos.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no `BK-MF8-02` por `TODO (BLOCKER)`, `payload: unknown`, `as any` e storage de tokens: `PASS`, sem ocorrências.
- Pesquisa focal por promessas indevidas de IA: `PASS_COM_RISCOS`, apenas falso positivo aceitável no `Scope-out` para `RAG`, `embeddings` e `OCR`.
- Verificação da referência privada: existem `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`, `source-grounded-ai.controller.ts`, `dto/ask-source-grounded-ai.dto.ts`, `schemas/source-grounded-ai-answer.schema.ts`, `citation-policy.ts`, `source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts`, `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts` e `source-grounded-ai-panel.tsx`.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.
- Testes de produto `npm --prefix apps/api test -- source-grounded-ai`: não executados porque esta execução é documental e o guia alvo descreve ficheiros a criar em `apps/api`, não ficheiros reais aplicados nesta auditoria.

---

## Execução 2026-07-01 - reauditoria focada BK-MF8-01

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-01]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma reauditoria fresca ao `BK-MF8-01 - IA evita enviesamentos e respostas inseguras`, sem assumir a validade da secção anterior do relatório. O escopo manteve-se limitado ao guia alvo e a este relatório; nenhum guia BK foi editado nesta execução.

Resultado da reauditoria: `OK`. O guia mantém a estrutura obrigatória com 16 secções `####`, 7 passos técnicos, caminhos públicos em `apps/api` e `apps/web`, contrato canónico `RNF34`, handoff para `BK-MF8-02`, ausência de linguagem interna proibida e ausência de fuga de `real_dev` no texto destinado aos alunos.

Os três findings históricos ficam reavaliados como `JA_CORRIGIDO`: o guia já inclui a policy `evaluateAiSafetyInput(...)`, a integração completa no `AiGuardrailsService`, o cliente/componente frontend tipado e as suites `.spec.ts` para policy e service.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 1 | 0 | 0 |

### Resultado por BK analisado

| BK | Estado atual | Evidência principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-01 | OK | Estrutura, contrato canónico, código backend/frontend/testes e validações textuais confirmados. | P0 |

### Documentos e evidência consultada nesta reauditoria

- `docs/RNF.md`: `RNF34` confirma o requisito "IA evita enviesamentos e respostas inseguras".
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: `BK-MF8-01` confirma MF8, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, `RNF34`, sprint `S12`, reforço e próximo BK `BK-MF8-02`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: confirma o mesmo contrato canónico e a sequência MF7 -> MF8.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`: confirma que `BK-MF8-01` não depende de campos novos obrigatórios fora de `RNF34`.
- `docs/planificacao/backlogs/MF-VIEWS.md` e `docs/planificacao/guias-bk/README.md`: confirmam a lista MF8 com 17 guias e o link para `BK-MF8-01`.
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`: confirma handoff para `BK-MF8-01`.
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`: confirma continuidade para `BK-MF8-02`.
- `real_dev/api` e `real_dev/web`: usados apenas como referência privada de contratos já existentes; o guia auditado mantém caminhos públicos para alunos.

### Findings reavaliados

| Finding histórico | Estado nesta reauditoria | Evidência atual |
| --- | --- | --- |
| F01 - Integração backend fica instruída, mas não fica demonstrada | JA_CORRIGIDO | `BK-MF8-01` mostra o ficheiro completo `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, com `evaluateAiSafetyInput(...)`, validação de role, ownership/membership/contexto e persistência sem prompt. |
| F02 - Frontend e contrato de UI ficam genéricos | JA_CORRIGIDO | `BK-MF8-01` mostra `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts` e `ai-guardrails-panel.tsx`, com cliente tipado, `requestMf3Json(...)`, estados React e distinção de `BIAS_RISK`, `UNSAFE_REQUEST` e `NON_PEDAGOGICAL`. |
| F03 - Testes pedidos não são entregues como testes | JA_CORRIGIDO | `BK-MF8-01` mostra `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts` e `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`, com caminho feliz, bloqueios éticos, contexto proibido, role inválida e ausência de prompt persistido. |

### Mapa de integracao da MF

- Ficheiros criados no guia: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`, `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`.
- Ficheiros editados no guia: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`, `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`, `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`.
- Exports produzidos: `AiSafetyReasonCode`, `AiSafetyDecision`, `evaluateAiSafetyInput(...)`, `AiGuardrailReasonCode`, `CheckAiGuardrailsInput`, `AiGuardrailDecision`, `checkAiGuardrails(...)`, `isAiSafetyBlock(...)`, `AiGuardrailsPanel`.
- Imports consumidos de BKs anteriores ou contratos existentes: `AuthenticatedUser`, `CheckAiGuardrailsDto`, `AiGuardrailContextType`, `AiGuardrailCheck`, `StudyAreasService`, `StudyRoomsService`, `SubjectsService`, `requestMf3Json(...)`.
- Endpoint criado: nenhum endpoint novo; o guia reutiliza `POST /api/ai/guardrails/check`.
- DTOs/validators criados: nenhum DTO novo; o guia consome `CheckAiGuardrailsDto`, que não aceita `userId` vindo do frontend.
- Schemas/modelos criados: nenhum schema novo; o guia consome `AiGuardrailCheck` e mantém persistência mínima sem prompt.
- Services criados/editados: `AiGuardrailsService` integra `evaluateAiSafetyInput(...)`.
- Componentes/páginas frontend criados/editados: `AiGuardrailsPanel` e cliente `checkAiGuardrails(...)`.
- Providers de IA criados/usados: nenhum provider novo; a policy bloqueia antes de qualquer chamada posterior ao provider.
- Regras de segurança/autorização aplicadas: role de aluno, ownership de área, membership de sala, acesso a disciplina/turma, bloqueio ético, ausência de prompt em persistência/evidence.
- Testes criados/editados: `ai-safety-policy.spec.ts` e `ai-guardrails.service.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-02`, que pode continuar com factualidade e anti-alucinação sobre a base de bloqueio ético.

### Coerência MF anterior -> MF alvo -> MF seguinte

- MF anterior: `BK-MF7-11` entrega limites da IA e aponta para `BK-MF8-01`.
- MF alvo: `BK-MF8-01` entrega a segurança ética `RNF34` sem alterar metadados, owners, sprint, prioridade ou sequência.
- MF seguinte dentro da sequência: `BK-MF8-02` pode assumir códigos e evidence de bloqueio ético antes de trabalhar factualidade e anti-alucinação.
- A MF8 completa mantém 17 guias; o validador confirmou `guide_bk: 107`, sem guias em falta ou extra.

### Drift documental encontrado

- Não foi encontrado drift de matriz, backlog, contrato de campos, MF views, índice de guias ou sequência MF7/MF8.
- A reauditoria encontrou apenas falsos positivos aceitáveis no guia alvo: `RAG`, `embeddings` e `OCR` aparecem como proibição de promessas fora de escopo; `PARCIAL` aparece no changelog para explicar a correção histórica.

### Riscos restantes

- Risco residual baixo: a reauditoria confirma o guia, não aplica o código real em `apps/api` nem `apps/web`.
- Os testes de produto do próprio BK não foram executados nesta reauditoria porque `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts` ainda é um ficheiro a criar pelo guia, não um ficheiro real desta execução documental.
- Não há `TODO (BLOCKER)` documental restante para `BK-MF8-01`.

### Verificações executadas nesta execução

- Estrutura do guia: `PASS`, com 16 secções `####` e 7 passos técnicos.
- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa focal no `BK-MF8-01` por `TODO (BLOCKER)`, `payload: unknown`, `as any`, storage de tokens, helpers por criar e promessas indevidas: `PASS`, com falsos positivos justificados acima.
- Verificação da referência privada: `real_dev/api/src/modules/ai-guardrails` e `real_dev/web/src/features/ai-guardrails` existem; `real_dev/api/src/modules/ai-safety` não existe, por isso a policy nova está corretamente marcada como `CRIAR` no guia.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.
- Testes de produto `npm --prefix apps/api test -- ai-safety-policy.spec.ts ai-guardrails.service.spec.ts`: não executados pelo motivo registado em riscos restantes.

---

## Execução 2026-07-01 - correção focada BK-MF8-01

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-01]`
- `modo`: `corrigir_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada a correção focada do `BK-MF8-01 - IA evita enviesamentos e respostas inseguras`, usando a auditoria imediatamente anterior como ponto de partida. O escopo ficou limitado ao guia alvo e a este relatório.

O BK passou de `PARCIAL` para `OK`. A correção adicionou código completo e didático para a policy `evaluateAiSafetyInput(...)`, a integração real no `AiGuardrailsService`, o contrato frontend tipado, a UI que distingue bloqueios éticos e suites de teste para policy/service. Os restantes 16 guias MF8 não foram editados nesta execução.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da correção focada | 0 | 1 | 0 |
| Depois da correção focada | 1 | 0 | 0 |

### Findings corrigidos

| Finding | Estado | Evidência da correção |
| --- | --- | --- |
| F01 - Integração backend fica instruída, mas não fica demonstrada | CORRIGIDO | `BK-MF8-01` passou a incluir código completo para `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, com `evaluateAiSafetyInput(...)`, validação de role, ownership/membership/contexto e persistência sem prompt. |
| F02 - Frontend e contrato de UI ficam genéricos | CORRIGIDO | `BK-MF8-01` passou a incluir código completo para `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts` e `ai-guardrails-panel.tsx`, com códigos `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL` e mensagens visíveis sem expor dados sensíveis. |
| F03 - Testes pedidos não são entregues como testes | CORRIGIDO | `BK-MF8-01` passou a incluir `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts` e uma versão completa de `ai-guardrails.service.spec.ts` com asserts de caminho feliz, bloqueios éticos, contexto proibido e ausência de prompt persistido. |

### Mapa de integracao da MF

- Ficheiros criados no guia: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`, `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`.
- Ficheiros editados no guia: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, `apps/api/src/modules/ai-guardrails/ai-guardrails.service.spec.ts`, `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts`, `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`.
- Exports produzidos: `AiSafetyReasonCode`, `AiSafetyDecision`, `evaluateAiSafetyInput(...)`, `AiGuardrailReasonCode`, `CheckAiGuardrailsInput`, `AiGuardrailDecision`, `checkAiGuardrails(...)`, `isAiSafetyBlock(...)`, `AiGuardrailsPanel`.
- Imports consumidos de BKs anteriores: `SessionGuard`, `AuthenticatedUser`, `CheckAiGuardrailsDto`, `AiGuardrailContextType`, `AiGuardrailCheck`, `StudyAreasService`, `StudyRoomsService`, `SubjectsService`, `requestMf3Json(...)`.
- Endpoint criado: nenhum endpoint novo; o BK reutiliza `POST /api/ai/guardrails/check`.
- DTOs/validators criados: nenhum DTO novo; o BK consome `CheckAiGuardrailsDto`, que já não aceita `userId` vindo do frontend.
- Schemas/modelos criados: nenhum schema novo; o BK consome `AiGuardrailCheck` e mantém persistência mínima sem prompt.
- Services criados/editados: `AiGuardrailsService` passa a integrar `evaluateAiSafetyInput(...)`.
- Componentes/páginas frontend criados/editados: `AiGuardrailsPanel` e cliente `checkAiGuardrails(...)`.
- Providers de IA criados/usados: nenhum provider novo; a policy bloqueia antes de qualquer chamada posterior ao provider.
- Regras de segurança/autorização aplicadas: role de aluno, ownership de área, membership de sala, acesso a disciplina/turma, bloqueio ético, ausência de prompt em persistência/evidence.
- Testes criados/editados: `ai-safety-policy.spec.ts` e `ai-guardrails.service.spec.ts`.
- BKs seguintes dependentes: `BK-MF8-02`, que pode consumir a base de bloqueio ético antes de tratar factualidade e anti-alucinação.

### Decisões técnicas confirmadas

- A policy pequena `evaluateAiSafetyInput(...)` é a unidade correta para transformar `RNF34` em comportamento testável.
- A integração deve acontecer no backend, dentro de `AiGuardrailsService`, mantendo o frontend como consumidor do contrato.
- Os códigos `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL` e `CONTEXT_ALLOWED` ficam estáveis para UI, testes e evidence.
- O prompt pode ser avaliado, mas não deve ser persistido em `AiGuardrailCheck`.
- A execução é documental: foram corrigidos os blocos de código do guia; não foram criados ficheiros reais em `apps/api` ou `apps/web`.

### Decisões de domínio confirmadas

- `RNF34` pertence ao fecho ético da IA e deve bloquear pedidos inseguros antes de qualquer geração.
- O fluxo respeita a separação entre IA privada, IA da sala e IA de turma/disciplina através da validação de contexto já existente.
- A correção preserva `RNF20` porque não permite acesso cruzado a área, sala ou disciplina.
- A correção preserva privacidade porque a decision auditável não guarda o texto livre do aluno.

### Drift documental encontrado

- Não foi encontrado drift de matriz, backlog, contrato de campos, MF views ou links.
- O drift anterior estava apenas na classificação/qualidade do guia: a estrutura estava boa, mas faltava completude técnica. Esse drift foi corrigido no BK alvo.

### Riscos restantes

- Risco residual baixo: como a execução é documental, a equipa/alunos ainda terão de aplicar o código descrito em `apps/api` e `apps/web` durante a implementação real do BK.
- Não há `TODO (BLOCKER)` documental restante para `BK-MF8-01`.
- Os restantes BKs MF8 estavam fora do escopo de edição desta execução.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.
- Testes de produto `npm --prefix apps/api test -- ai-safety-policy.spec.ts ai-guardrails.service.spec.ts`: não executados porque esta execução corrigiu o guia documental, não criou ainda os ficheiros reais em `apps/api`.

---

## Execução 2026-07-01 - auditoria focada BK-MF8-01

Nota: esta secção é histórico da auditoria que abriu os findings `PARCIAL`. O estado atual do `BK-MF8-01` é o da secção de correção focada acima: `OK`.

### Header da execução

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[BK-MF8-01]`
- `modo`: `auditar_apenas`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-07-01`

### Síntese executiva

Foi executada uma auditoria focada ao `BK-MF8-01 - IA evita enviesamentos e respostas inseguras`, lendo a MF8 completa apenas para coerência, handoff e validação textual. O modo desta execução é `auditar_apenas`, por isso nenhum guia BK foi editado.

O guia cumpre a estrutura formal da prompt: tem as 16 secções `####` esperadas, 7 passos técnicos, metadados alinhados com a matriz/backlog/contrato, ausência de `real_dev` em texto de aluno e ausência de linguagem interna proibida. No entanto, a auditoria não deve manter o estado `OK`: o BK ainda deixa lacunas de executabilidade nos pontos onde deveria ensinar a integração real.

Estado desta execução: `BK-MF8-01` fica `PARCIAL`. A causa principal é que o guia cria a policy `evaluateAiSafetyInput(...)`, mas não mostra código completo para integrar essa policy no `AiGuardrailsService`, no contrato frontend nem na suite de testes. Para alunos do 12.o ano, isto ainda exige adivinhação técnica numa zona sensível de IA, segurança e privacidade.

### Documentos consultados nesta execução

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
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- Todos os guias `docs/planificacao/guias-bk/MF8/*.md`
- `real_dev/api` e `real_dev/web` como referência privada de contratos já existentes.

### Estado antes e depois desta execução

| Escopo | OK | PARCIAL | CRITICO |
| --- | ---: | ---: | ---: |
| Antes da reauditoria focada | 1 | 0 | 0 |
| Depois da reauditoria focada | 0 | 1 | 0 |

Nota: o estado "antes" reflete a classificação existente no relatório de 2026-06-30 para este BK. Esta execução não corrigiu o guia, apenas reavaliou evidência atual.

### Resultado por BK analisado

| BK | Estado atual | Problema principal | Prioridade |
| --- | --- | --- | --- |
| BK-MF8-01 | PARCIAL | O guia tem estrutura e policy inicial, mas não fornece código completo para a integração real no service/backend, frontend e testes. | P1 |

### Findings

#### F01 - Integração backend fica instruída, mas não fica demonstrada

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- Evidência:
  - O passo 3 cria `evaluateAiSafetyInput(...)` e manda integrar a função no service, mas só mostra o ficheiro novo `apps/api/src/modules/ai-safety/ai-safety-policy.ts`.
  - O passo 4 lista `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts` como ficheiro a editar, mas a secção de código diz `Sem código neste passo`.
  - A implementação de referência já tem `AiGuardrailsService.check(...)` a validar contexto e persistir `CONTEXT_ALLOWED`/`CONTEXT_FORBIDDEN`, mas não existe no guia a versão completa da função depois de aplicar `evaluateAiSafetyInput(...)`.
- Impacto técnico: o aluno ainda tem de decidir onde importar a policy, qual a ordem exata entre role/contexto/safety, que `reasonCode` persistir e como preservar a regra de não guardar prompt sensível.
- Impacto pedagógico: a parte mais crítica do BK fica parcialmente aberta, quando a prompt exige tutorial linear e código completo nas unidades que o aluno deve alterar.
- Risco de segurança/privacidade: uma integração incorreta pode chamar o provider antes do bloqueio ético ou persistir excertos do prompt em logs/evidence.
- O que falta completar: mostrar o código completo ou a função completa de `AiGuardrailsService.check(...)`/helpers após integração da policy, mantendo sessão, ownership/membership e minimização de dados.

#### F02 - Frontend e contrato de UI ficam genéricos

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- Evidência:
  - O passo 5 pede cliente API tipado, `credentials: "include"`, estados loading/vazio/erro/sucesso e mensagens PT-PT.
  - A secção de código do passo 5 diz `Sem código neste passo` porque "a integração varia consoante a página real".
  - O ficheiro real `apps/web/src/features/ai-guardrails/check-ai-guardrails.ts` já existe e envia `prompt`, `contextType` e `resourceId`, mas o guia não mostra a alteração necessária para refletir códigos como `BIAS_RISK`, `UNSAFE_REQUEST` ou `NON_PEDAGOGICAL`.
- Impacto técnico: o frontend pode continuar a tratar bloqueios éticos como bloqueios genéricos de contexto, tornando a evidence menos demonstrável.
- Impacto pedagógico: o aluno sabe o objetivo, mas ainda precisa de inferir a implementação.
- O que falta completar: incluir cliente/componente ou alteração concreta que mostre mensagens de bloqueio ético sem expor dados sensíveis.

#### F03 - Testes pedidos não são entregues como testes

- Estado: `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- Evidência:
  - O passo 6 pede testes para pergunta discriminatória, pedido perigoso e pedido pedagógico permitido.
  - O bloco de código entregue é apenas `apps/api/src/modules/mf8/bk-mf8-01.expected-results.ts`, não uma suite `.spec.ts` com asserts sobre `evaluateAiSafetyInput(...)` ou sobre o service integrado.
- Impacto técnico: o BK não prova automaticamente `RNF34` nos negativos críticos que ele próprio define.
- Impacto pedagógico: o aluno pode criar evidence textual, mas não recebe um modelo real de teste para este comportamento.
- O que falta completar: incluir uma suite `ai-safety-policy.spec.ts` ou adaptar `ai-guardrails.service.spec.ts` com casos `BIAS_RISK`, `UNSAFE_REQUEST`, `NON_PEDAGOGICAL` e caminho feliz.

### Pontos confirmados como corretos

- `RNF34` existe e define "IA evita enviesamentos e respostas inseguras" como requisito `Must`.
- `BK-MF8-01` está alinhado com `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `CONTRATO-CAMPOS-BK.md`: owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforço `M`, sprint `S12`, dependências `-`, próximo BK `BK-MF8-02`.
- `MF-VIEWS.md` e `guias-bk/README.md` incluem a sequência MF8 de 17 BKs e apontam para o ficheiro correto.
- O guia não contém `real_dev`, `REFERENCE_ROOT`, `cd real_dev` ou `npm --prefix real_dev`.
- O guia não contém as marcas internas proibidas pesquisadas na prompt.
- A validação documental global passa com `107` BK na matriz, `107` no backlog e `107` guias.

### Mapa de integração da MF - foco BK-MF8-01

- Ficheiros que o BK manda criar: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`, `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`, `apps/api/src/modules/mf8/bk-mf8-01.expected-results.ts`.
- Ficheiros que o BK manda editar/rever: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`, `apps/api/src/modules/ai/providers/ai-provider.ts`, `apps/api/src/app.module.ts`, `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`, `apps/web/src/features/mf3/request-mf3-json.ts`, `apps/web/src/lib/apiClient.ts`.
- Exports produzidos previstos: `evaluateAiSafetyInput(...)` e `AiSafetyDecision`.
- Imports consumidos de BKs anteriores: sessão autenticada, `SessionGuard`, DTO de guardrails, validação de contexto solo/sala/disciplina e contrato frontend de `checkAiGuardrails(...)`.
- Endpoint principal: `POST /api/ai/guardrails/check`.
- Regras de segurança esperadas: role de aluno, ownership/membership/contexto no backend, bloqueio antes do provider, ausência de prompt completo em persistência/evidence.
- Testes esperados: pergunta discriminatória, pedido perigoso, input vazio/sem finalidade pedagógica e pedido pedagógico permitido.
- BK seguinte dependente: `BK-MF8-02`, que precisa de uma base de bloqueio ético antes de avançar para factualidade/citações.

### Decisões técnicas confirmadas

- `apps/api` e `apps/web` continuam a ser os caminhos públicos dos alunos.
- `real_dev` pode ser usado como referência privada, mas não aparece no texto do BK.
- A política pequena `evaluateAiSafetyInput(...)` é uma decisão `DERIVADO` aceitável, desde que o guia mostre a integração completa no service existente.
- Os códigos `BIAS_RISK`, `UNSAFE_REQUEST` e `NON_PEDAGOGICAL` são aceitáveis como códigos específicos, mas têm de ser ligados a `reasonCode`/mensagens da resposta real.

### Decisões de domínio confirmadas

- `BK-MF8-01` pertence à frente de ética/segurança da IA e consome contratos de guardrails já introduzidos em MF6/MF7.
- A IA deve bloquear pedidos enviesados ou inseguros antes de qualquer chamada ao provider.
- O prompt do aluno pode conter dados sensíveis; por isso, evidence e persistência devem guardar decisão/código, não o prompt completo.
- `BK-MF8-02` pode depender deste BK apenas depois de a integração estar explicitamente ensinada e testada.

### Drift documental encontrado

- Não há drift de matriz/backlog/links.
- Há drift entre a classificação anterior `OK` e a evidência atual de executabilidade: o BK está bem estruturado, mas não está completo o suficiente para `OK`.

### Riscos restantes

- Risco pedagógico: o aluno pode criar a policy e esquecer a integração efetiva no service.
- Risco técnico: `POST /api/ai/guardrails/check` pode continuar a devolver `CONTEXT_ALLOWED` sem avaliar enviesamento/segurança do prompt.
- Risco de privacidade: uma tentativa de integração feita por adivinhação pode persistir prompt completo ou logs sensíveis.
- Risco de handoff: `BK-MF8-02` pode assumir que o bloqueio ético já existe quando, seguindo apenas este guia, ainda não há prova completa.

### Verificações executadas nesta execução

- Pesquisa de linguagem interna proibida em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Pesquisa de caminhos privados em `docs/planificacao/guias-bk/MF8/*.md`: `PASS`, sem ocorrências.
- Estrutura do `BK-MF8-01`: `PASS`, 16 secções `####` e 7 passos `### Passo`.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `matriz_bk: 107`, `backlog_bk: 107`, `guide_bk: 107`.

### Bloqueios e TODOs restantes

- Sem bloqueio ambiental.
- `TODO`: em modo de correção futuro, completar o guia com código real de integração backend, frontend e testes. Não foi aplicado nesta execução porque `MODO=auditar_apenas`.

---

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF8`
- `project`: `StudyFlow`
- `mf_alvo`: `MF8`
- `bk_ids`: `[]`
- `modo`: `hidratar_corrigir`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `run_commands`: `true`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-06-30`

## Síntese executiva

Foram analisados os 17 BKs da MF8. Antes da correção, todos estavam em estado `CRITICO` para o contrato desta prompt: usavam o formato antigo com `Bloco pedagogico`/`Bloco operacional`, não tinham a estrutura obrigatória de secções `####`, não tinham passos técnicos com os pontos 1 a 7, continham linguagem de trabalho como `snippet` e vários guias expunham caminhos privados.

Depois da hidratação, os 17 BKs foram reescritos dentro de `docs/planificacao/guias-bk/MF8/` com caminhos públicos `apps/api` e `apps/web`, decisões `CANONICO`/`DERIVADO`, código integrado por BK, validação por passo, cenários negativos, expected results, evidence e handoff.

## Documentos consultados

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
- BKs MF0-MF7 relevantes para estrutura, IA, fontes, salas, testes e gates.
- Código em `apps/api`, `apps/web` e raiz privada de referência para confirmar contratos existentes. Os guias finais usam apenas caminhos públicos dos alunos.

## Estado antes

| BK | Estado antes | Evidência principal |
| --- | --- | --- |
| BK-MF8-01 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-02 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-03 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-04 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-05 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-06 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-07 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-08 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-09 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-10 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-11 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-12 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-13 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-14 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-15 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-16 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |
| BK-MF8-17 | CRITICO | Guia antigo com bloco pedagógico/operacional, sem estrutura obrigatória `####`, sem tutorial técnico linear completo e com termos proibidos em pelo menos parte da MF. |

Contagem antes: `0 OK / 0 PARCIAL / 17 CRITICO`.

## Correções aplicadas

- Reescrita completa dos 17 guias MF8 para a estrutura obrigatória: Objetivo, Importância, Scope-in, Scope-out, Estado antes e depois, Pre-requisitos, Glossário, Conceitos teóricos essenciais, Arquitetura, Ficheiros, Tutorial técnico linear, Critérios, Validação, Evidence, Handoff e Changelog.
- Substituição de linguagem interna e formato antigo por instruções diretas para o aluno.
- Remoção de caminhos privados nos BKs de aluno.
- Inclusão de decisões `CANONICO` e `DERIVADO` por BK.
- Inclusão de código completo por BK para a unidade técnica principal e expected results de validação.
- Inclusão de regras explícitas de segurança, ownership, membership, RGPD, privacidade e evidence.

## Estado depois

| BK | Estado depois | Evidência principal |
| --- | --- | --- |
| BK-MF8-01 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-02 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-03 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-04 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-05 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-06 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-07 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-08 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-09 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-10 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-11 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-12 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-13 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-14 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-15 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-16 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |
| BK-MF8-17 | OK | Reescrito com estrutura completa, 7 passos, ficheiros concretos, código integrado, validação, negativos, evidence e handoff. |

Contagem depois: `17 OK / 0 PARCIAL / 0 CRITICO`.

## Mapa de integracao da MF

### BK-MF8-01

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.ts`; CRIAR: `apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts`; EDITAR: `apps/api/src/modules/ai-guardrails/ai-guardrails.service.ts`; REVER: `apps/api/src/modules/ai/providers/ai-provider.ts`; REVER: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/ai-safety/ai-safety-policy.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `POST /api/ai/guardrails/check`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: pergunta discriminatória, pedido perigoso e pedido pedagógico permitido.
- BKs seguintes dependentes: BK-MF8-02.

### BK-MF8-02

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/source-grounded-ai/factuality-policy.ts`; CRIAR: `apps/api/src/modules/source-grounded-ai/factuality-policy.spec.ts`; EDITAR: `apps/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`; REVER: `apps/api/src/modules/material-index/material-index.service.ts`; REVER: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/source-grounded-ai/factuality-policy.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `POST /api/ai/source-grounded-answers`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: sem fontes, provider sem citações e resposta válida com citações.
- BKs seguintes dependentes: BK-MF8-03.

### BK-MF8-03

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/adaptive-explanations/learning-level-policy.ts`; CRIAR: `apps/api/src/modules/adaptive-explanations/learning-level-policy.spec.ts`; EDITAR: `apps/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`; REVER: `apps/api/src/modules/ai/adaptive-learning.service.ts`; REVER: `apps/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/adaptive-explanations/learning-level-policy.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `POST /api/ai/adaptive-explanations`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: role não aluno, perfil inexistente e nível normalizado.
- BKs seguintes dependentes: BK-MF8-04.

### BK-MF8-04

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts`; CRIAR: `apps/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`; EDITAR: `apps/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`; REVER: `apps/api/src/modules/ai-model-policies/ai-model-policies.service.ts`; REVER: `apps/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/external-knowledge-ai/external-ai-policy.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `POST /api/ai/external-knowledge-answers`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: sem permissão externa, sem fontes internas e nota externa separada.
- BKs seguintes dependentes: BK-MF8-05.

### BK-MF8-05

- Ficheiros criados/ editados no guia: CRIAR: `apps/web/src/features/mf8/mockup-alignment.ts`; CRIAR: `apps/web/src/features/mf8/mockup-alignment-panel.tsx`; CRIAR: `apps/web/src/features/mf8/mockup-alignment.spec.ts`; EDITAR: `apps/web/src/App.tsx`; REVER: `mockup/`.
- Exports produzidos: unidade técnica principal em `apps/web/src/features/mf8/mockup-alignment.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `sem endpoint novo; validação frontend e evidence visual`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: inventário contém páginas principais e estados essenciais.
- BKs seguintes dependentes: BK-MF8-06.

### BK-MF8-06

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/common/text/pt-text-normalization.ts`; CRIAR: `apps/api/src/common/text/pt-text-normalization.spec.ts`; EDITAR: `apps/api/src/modules/materials/materials.service.ts`; REVER: `apps/web/src/components/materials/MaterialSubmitForm.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/common/text/pt-text-normalization.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `POST /api/study-areas/:id/materials`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: texto com acentos, texto vazio e caracteres substituídos.
- BKs seguintes dependentes: BK-MF8-07.

### BK-MF8-07

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/ai/artifact-export.service.ts`; CRIAR: `apps/api/src/modules/ai/artifact-export.service.spec.ts`; EDITAR: `apps/api/src/modules/ai/study-tools.controller.ts`; EDITAR: `apps/web/src/pages/student/StudyToolsPage.tsx`; REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/ai/artifact-export.service.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `GET /api/study-areas/:id/ai/artifacts/:artifactId/export?format=md`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: ownership, formato inválido e markdown com fontes mínimas.
- BKs seguintes dependentes: BK-MF8-08.

### BK-MF8-08

- Ficheiros criados/ editados no guia: CRIAR: `apps/web/src/lib/format-date-pt.ts`; CRIAR: `apps/web/src/lib/format-date-pt.spec.ts`; EDITAR: `apps/web/src/components/study/StudyHistoryList.tsx`; EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`; REVER: `apps/api/src/modules/study/schemas/study-event.schema.ts`.
- Exports produzidos: unidade técnica principal em `apps/web/src/lib/format-date-pt.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `sem endpoint novo; API mantém datas ISO`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: data válida, data inválida e preservação de ISO.
- BKs seguintes dependentes: BK-MF8-09.

### BK-MF8-09

- Ficheiros criados/ editados no guia: CRIAR: `apps/web/src/lib/messages.ts`; CRIAR: `apps/web/src/lib/messages.spec.ts`; EDITAR: `apps/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`; EDITAR: `apps/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`; REVER: `apps/web/src/pages/student/RoomAiPage.tsx`.
- Exports produzidos: unidade técnica principal em `apps/web/src/lib/messages.ts`.
- Imports consumidos de BKs anteriores: contratos MF6/MF7 de sessão, guardrails, fontes, componentes e testes..
- Endpoint principal: `sem endpoint novo; contrato frontend`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: mensagem conhecida, fallback e ausência de biblioteca nova.
- BKs seguintes dependentes: BK-MF8-10.

### BK-MF8-10

- Ficheiros criados/ editados no guia: EDITAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`; EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`; CRIAR: `apps/api/src/modules/study-rooms/room-ai-history.spec.ts`; EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`; REVER: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/study-rooms/room-ai-history.ts`.
- Imports consumidos de BKs anteriores: BK-MF1-04.
- Endpoint principal: `GET /api/study-rooms/:roomId/ai/answers?scope=mine`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: aluno fora da sala, aluno vê apenas as suas respostas e sala diferente.
- BKs seguintes dependentes: BK-MF8-11.

### BK-MF8-11

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`; CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.ts`; CRIAR: `apps/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`; EDITAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`; EDITAR: `apps/web/src/pages/student/RoomAiPage.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`.
- Imports consumidos de BKs anteriores: BK-MF8-10.
- Endpoint principal: `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: resposta de outro aluno, aluno fora da sala e fork preserva original.
- BKs seguintes dependentes: BK-MF8-12.

### BK-MF8-12

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`; CRIAR: `apps/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`; EDITAR: `apps/api/src/modules/official-tests/official-tests.service.ts`; EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`; CRIAR: `apps/web/src/pages/student/OfficialTestAttemptPage.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/official-tests/official-test-attempt-scoring.ts`.
- Imports consumidos de BKs anteriores: BK-MF2-04.
- Endpoint principal: `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: aluno não inscrito, teste não publicado e pontuação calculada.
- BKs seguintes dependentes: BK-MF8-13.

### BK-MF8-13

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.ts`; CRIAR: `apps/api/src/modules/official-tests/official-test-ranking.service.spec.ts`; EDITAR: `apps/api/src/modules/official-tests/official-tests.controller.ts`; CRIAR: `apps/web/src/pages/teacher/OfficialTestRankingPage.tsx`; REVER: `apps/api/src/modules/classes/classes.service.ts`.
- Exports produzidos: unidade técnica principal em `apps/api/src/modules/official-tests/official-test-ranking.ts`.
- Imports consumidos de BKs anteriores: BK-MF8-12.
- Endpoint principal: `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: professor errado, ordenação e empate.
- BKs seguintes dependentes: BK-MF8-14.

### BK-MF8-14

- Ficheiros criados/ editados no guia: EDITAR: `apps/web/src/components/ai/FlashcardsPanel.tsx`; CRIAR: `apps/web/src/features/mf8/flashcard-practice.ts`; CRIAR: `apps/web/src/features/mf8/flashcard-practice.spec.ts`; REVER: `apps/api/src/modules/ai/study-tools.service.ts`; REVER: `apps/api/src/modules/ai/schemas/ai-artifact.schema.ts`.
- Exports produzidos: unidade técnica principal em `apps/web/src/features/mf8/flashcard-practice.ts`.
- Imports consumidos de BKs anteriores: BK-MF0-12.
- Endpoint principal: `reutiliza endpoints de artefactos IA da área de estudo`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: avanço de cartão, revelar resposta e fim da lista.
- BKs seguintes dependentes: BK-MF8-15.

### BK-MF8-15

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/scripts/mf8-test-inventory.ts`; CRIAR: `apps/api/src/scripts/mf8-test-inventory.spec.ts`; EDITAR: `apps/api/package.json`; REVER: `apps/api/src/modules/**/*.spec.ts`; REVER: `apps/web/src/**/*.spec.tsx`.
- Exports produzidos: unidade técnica principal em `apps/api/src/scripts/mf8-test-inventory.ts`.
- Imports consumidos de BKs anteriores: BK-MF8-14.
- Endpoint principal: `sem endpoint novo; script de qualidade`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: módulo sem spec, spec existente e saída determinística.
- BKs seguintes dependentes: BK-MF8-16.

### BK-MF8-16

- Ficheiros criados/ editados no guia: CRIAR: `apps/api/src/scripts/run-mf8-final-tests.ts`; CRIAR: `docs/evidence/MF8/TESTES-FINAIS.md`; EDITAR: `apps/api/package.json`; REVER: `scripts/validate-planificacao.sh`; REVER: `apps/web/package.json`.
- Exports produzidos: unidade técnica principal em `apps/api/src/scripts/run-mf8-final-tests.ts`.
- Imports consumidos de BKs anteriores: BK-MF8-15.
- Endpoint principal: `sem endpoint novo; gate técnico`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: runner regista comando, estado e ficheiro de evidence.
- BKs seguintes dependentes: BK-MF8-17.

### BK-MF8-17

- Ficheiros criados/ editados no guia: CRIAR: `docs/evidence/MF8/CORRECAO-ERROS.md`; CRIAR: `apps/api/src/scripts/mf8-error-register.ts`; CRIAR: `apps/api/src/scripts/mf8-error-register.spec.ts`; REVER: `docs/evidence/MF8/TESTES-FINAIS.md`; REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`.
- Exports produzidos: unidade técnica principal em `apps/api/src/scripts/mf8-error-register.ts`.
- Imports consumidos de BKs anteriores: BK-MF8-16.
- Endpoint principal: `sem endpoint novo; registo de qualidade`.
- DTOs/validators: definidos ou revistos conforme ficheiros do BK.
- Schemas/modelos: reutilizados quando já existem; criados apenas quando o BK introduz persistência nova.
- Services: responsabilidade concentrada no backend.
- Componentes/páginas frontend: estados loading, vazio, erro e sucesso.
- Providers de IA: usados só depois de validação de fontes, perfil, política e quota.
- Segurança/autorização: sessão, ownership, membership, role e ausência de dados sensíveis em logs/evidence.
- Testes: estado válido, ausência de causa e erro reaberto.
- BKs seguintes dependentes: -.


## Coerência MF7 -> MF8 -> fecho

- MF7 entrega observabilidade, modularidade, health-check, IA com fontes, separação de perfis e limites de professor.
- MF8 consome esses contratos para fechar ética da IA, anti-alucinação, personalização, IA externa, UI, localização, exportação, histórico/partilha de IA da sala, mini-testes, rankings, flashcards, testes finais e correção de erros.
- A sequência termina em `BK-MF8-17`, que fecha o ciclo de testes finais e revalidação.

## Drift documental encontrado

- Os guias MF8 estavam abaixo do contrato pedagógico atual e ainda seguiam formato antigo.
- Havia ocorrência de termos proibidos nos guias de aluno, incluindo linguagem de `snippet` e caminhos privados em vários BKs da cadeia de sala/testes/flashcards.
- Não foi necessário alterar matriz, backlog, anexos, README, scripts ou código de produto.

## Decisões técnicas confirmadas

- `apps/api` e `apps/web` são os caminhos públicos dos alunos.
- A raiz privada de referência só serve para leitura e validação de contratos.
- A IA só deve chamar provider depois de validar fontes, perfil, consentimento, política, quota, ownership ou membership conforme o fluxo.
- Datas ISO ficam no backend/API; formato `dd/mm/aaaa` é apresentação frontend.
- Markdown é o formato base de exportação; PDF pode nascer por conversão controlada, sem expor materiais privados completos.
- Testes finais e correções finais são gates técnicos com evidence, não funcionalidades soltas.

## Decisões de domínio confirmadas

- IA privada, IA de sala e IA de turma/disciplina continuam separadas.
- Histórico IA da sala é privado por aluno até existir partilha read-only explícita.
- Fork privado cria cópia do aluno sem alterar a resposta original.
- Mini-testes oficiais são criados por professor e tentativas de aluno ficam separadas.
- Rankings são pedagógicos e devem respeitar turma/disciplina e minimização de dados.
- Flashcards em modo exercício/revisão usam artefactos IA autorizados.

## Decisões DERIVADO

- Policies pequenas por BK para tornar RNF34-RNF37 testáveis sem duplicar providers.
- Catálogo local de mensagens para preparar i18n futuro sem dependência nova no MVP.
- Inventário visual e inventário de testes como artefactos de fecho controlado.
- Estados de erro final `OPEN`, `FIXED`, `RETESTED`, `BLOCKED` para não fechar falhas sem revalidação.

## Riscos restantes

- Os guias estão prontos documentalmente; a execução real pelos alunos ainda terá de criar/editar os ficheiros de `apps/api` e `apps/web` indicados.
- Alguns BKs da MF8 introduzem ficheiros novos; se a equipa preferir reaproveitar nomes existentes, deve manter a responsabilidade e atualizar imports de forma consistente.
- A validação automatizada do repositório pode continuar a acusar drift legado fora da MF8; esse resultado deve ser separado de regressões causadas por esta hidratação.

## Verificações executadas

- Pesquisa textual de linguagem proibida nos BKs MF8: `PASS`, sem ocorrências.
- Pesquisa textual de caminhos privados nos BKs MF8: `PASS`, sem ocorrências.
- Estrutura dos passos 1 a 7 em todos os BKs MF8: `PASS`.
- `git diff --check`: `PASS`, sem erros de whitespace.
- `bash scripts/validate-planificacao.sh`: `PASS`, `overall_pass: true`, `107` BK na matriz, `107` BK no backlog e `107` guias.

## Bloqueios e TODOs

- Sem `TODO (BLOCKER)` documental dentro da MF8 após a correção.
- Bloqueios ambientais só devem ser registados se algum comando final falhar fora do conteúdo dos guias.
