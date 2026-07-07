# AUDITORIA-IMPLEMENTACAO-real_dev-MF8

## Auditoria consolidada atual - MF8 completa

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta auditoria`: `BK-MF8-01` a `BK-MF8-17`
- `Resultado`: `PASS`
- `Data`: `2026-07-07`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Esta seccao e a fonte operacional mais recente para a MF8 completa. As secoes historicas abaixo ficam preservadas como evidencia BK-a-BK, incluindo estados intermédios ja fechados pela evidence atual.

A auditoria confirmou que os 17 BKs da MF8 estao implementados em `real_dev/api` e `real_dev/web`, com contratos de seguranca, ownership/membership, IA com fontes, localizacao, partilha de sala, mini-testes oficiais, flashcards e gates finais encaixados. Nao ha findings `P0`, `P1`, `P2` ou `P3` abertos nesta passagem.

### Escopo auditado

- Pasta auditada: `real_dev`, com backend em `real_dev/api` e frontend em `real_dev/web`.
- Pastas tratadas como referencia: `apps/` e guias publicos, sem editar documentos canonicos.
- Relatorio atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`.
- `real_dev/` esta ignorado por Git via `.gitignore:2`; isto e esperado pela prompt e nao e finding.
- `BK_IDS=[]` foi interpretado como MF8 completa, nao como o ultimo BK auditado.
- Nao foram executados nesta auditoria os comandos `mf8:test-inventory`, `mf8:final-tests` ou `mf8:error-register`, porque regeneram evidence em `docs/evidence/MF8/`. A evidence existente foi lida e os comandos tecnicos equivalentes foram reexecutados de forma nao destrutiva quando possivel.

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:107-123` | Confirma a cadeia completa `BK-MF8-01` a `BK-MF8-17`, requisitos, prioridades, dependencias e handoff final. |
| `docs/planificacao/backlogs/MF-VIEWS.md:253-274` | Confirma que a MF8 contem exatamente 17 BKs e fecha a macrofase de produto, qualidade da IA e validacao final. |
| `docs/RNF.md:88-90` | Confirma `RNF41`, `RNF42` e `RNF45` para inventario, execucao final e correcao/revalidacao. |
| `docs/RNF.md:102-105` | Confirma `RNF34` a `RNF37` para seguranca etica, anti-alucinacao, adaptacao pedagogica e IA externa. |
| `docs/RNF.md:116-118` | Confirma `RNF38` a `RNF40` para UI/mockup, UTF-8/PT-PT e exportacao. |
| `docs/RNF.md:129-130` | Confirma `RNF43` e `RNF44` para datas `dd/mm/aaaa` e preparacao i18n. |
| `docs/evidence/MF8/TESTES-FINAIS.md:3-22` | Evidence final esta em `PASS`, sem comandos opcionais pendentes. |
| `docs/evidence/MF8/CORRECAO-ERROS.md:7-20` | Registo final sem `FAIL`/`BLOQUEADO`, com correcoes revalidadas e nota de privacidade. |

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `PASS` | Policy etica `evaluateAiSafetyInput(...)` bloqueia pedidos vazios, enviesados, inseguros e nao pedagogicos no backend antes de fluxo IA. |
| `BK-MF8-02` | `RNF35` | `PASS` | `SourceGroundedAiService` autoriza cada `sourceJobId`, bloqueia ausencia de fontes e limita resposta a citacoes publicas autorizadas. |
| `BK-MF8-03` | `RNF36` | `PASS` | Fachada autenticada de explicacoes adaptadas usa `userId` da sessao, role de aluno, ownership da area, perfil pedagogico e fontes processaveis. |
| `BK-MF8-04` | `RNF37` | `PASS` | IA externa fica condicionada a permissao explicita e fontes internas, com citacoes internas e notas externas separadas. |
| `BK-MF8-05` | `RNF38` | `PASS` | Checklist visual frontend-only integrada no dashboard, com rotas reais e Playwright especifico. |
| `BK-MF8-06` | `RNF39` | `PASS` | Normalizacao UTF-8/PT-PT em backend preserva acentos/cedilhas e rejeita texto ilegivel antes de marcar fontes. |
| `BK-MF8-07` | `RNF40` | `PASS` | Exportacao de `SUMMARY`/`QUIZ` valida ownership, formato `md`/`pdf`, tipos exportaveis e conteudo textual seguro. |
| `BK-MF8-08` | `RNF43` | `PASS` | `formatDatePt(...)` centraliza apresentacao `dd/mm/aaaa` em `pt-PT` sem alterar transporte ISO. |
| `BK-MF8-09` | `RNF44` | `PASS` | Catalogo local `messages.ts` prepara i18n futura sem dependencia externa nem chaves tecnicas expostas. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `PASS` | Historico privado de IA da sala filtra por membership, `roomId` e `studentId` da sessao. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `PASS` | Partilha read-only exige resposta propria; fork privado exige resposta partilhada e cria copia privada do aluno autenticado. |
| `BK-MF8-12` | `RF28` | `PASS` | Realizacao de mini-testes valida inscricao, teste publicado, contagem de respostas e pontua no backend. |
| `BK-MF8-13` | `RF28, RF30` | `PASS` | Ranking docente valida professor dono da disciplina e devolve linhas minimizadas sem respostas completas nem email. |
| `BK-MF8-14` | `RF12` | `PASS` | Flashcards reutilizam artefactos IA existentes, com modo exercicio/revisao, fontes preservadas e estado local sem novo backend. |
| `BK-MF8-15` | `RNF41` | `PASS` | Evidence `TESTES-EM-FALTA.md` regista 8 alvos criticos, 8 cobertos, 0 testes em falta e 0 ficheiros base em falta. |
| `BK-MF8-16` | `RNF42` | `PASS` | Evidence `TESTES-FINAIS.md` regista planificacao, unit API, build API, build web e Playwright em `PASS`. |
| `BK-MF8-17` | `RNF45` | `PASS` | `CORRECAO-ERROS.md` nao tem comandos finais em falha e revalida as correcoes do path local e dos E2E MF1/MF7. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Seguranca etica da IA | `CUMPRE` | `ai-safety-policy.ts:61-103` decide `SAFE`, `BIAS_RISK`, `UNSAFE_REQUEST` e `NON_PEDAGOGICAL`; `ai-guardrails.service.ts:71-96` aplica role/contexto/policy antes de permitir. |
| Ownership/membership antes de IA | `CUMPRE` | `ai-guardrails.service.ts:105-121`, `source-grounded-ai.service.ts:96-113`, `adaptive-learning.service.ts:162-171` e `room-ai.service.ts:93-106` validam contexto antes de provider. |
| Fontes obrigatorias e anti-alucinacao | `CUMPRE` | `source-grounded-ai.service.ts:96-132` autoriza jobs, bloqueia `NO_INDEXED_SOURCES`, aplica consentimento/policy/quota e so depois chama provider. |
| Adaptacao pedagogica | `CUMPRE` | `adaptive-explanations.service.ts:28-41` usa sessao e role de aluno; `adaptive-learning.service.ts:157-215` usa perfil, fontes e valida output antes de persistir. |
| IA externa limitada | `CUMPRE` | `external-ai-policy.ts:37-61` exige fontes internas e permissao; `external-knowledge-ai.service.ts:82-147` valida ownership, fontes e separa `externalUsed`, `internalCitations` e `externalNotes`. |
| Importacao UTF-8/PT-PT | `CUMPRE` | `pt-text-normalization.ts:15-31` normaliza em NFC, preserva texto portugues e rejeita `U+FFFD`/texto ilegivel. |
| Exportacao MD/PDF | `CUMPRE` | `study-tools.controller.ts:130-149` expoe export autenticado; `artifact-export.service.ts:77-120` valida formato, area, owner, artefacto e tipo `SUMMARY`/`QUIZ`. |
| Datas PT-PT | `CUMPRE` | `format-date-pt.ts:4-30` usa `Intl.DateTimeFormat("pt-PT")`, `Europe/Lisbon`, dia/mes/ano a 2 digitos. |
| Preparacao i18n | `CUMPRE` | `messages.ts:1-100` centraliza chaves/mensagens locais e fallback seguro para chave dinamica. |
| Historico privado da IA da sala | `CUMPRE` | `room-ai.controller.ts:47-65` separa `mine`/`shared`; `room-ai.service.ts:58-82` filtra por `roomId` e `studentId`; `room-ai-history.ts:31-58` reforca defesa em profundidade. |
| Partilha e fork de resposta IA | `CUMPRE` | `room-ai-sharing.service.ts:111-140` valida ObjectIds/membership; `:151-177` partilha resposta propria; `:187-220` cria fork a partir de resposta `SHARED`. |
| Mini-testes oficiais | `CUMPRE` | `official-tests.controller.ts:89-119` expoe listagem/submissao de aluno; `official-tests.service.ts:192-239` valida role, inscricao, teste publicado e pontua no backend. |
| Ranking docente | `CUMPRE` | `official-tests.controller.ts:69-80` expoe endpoint; `official-test-ranking.service.ts:115-151` valida professor/disciplina/teste e devolve ranking filtrado. |
| Flashcards | `CUMPRE` | `FlashcardsPanel.tsx:62-223` apresenta modos exercicio/revisao, resposta escondida/revelada, progresso, recomeco e fontes sem criar persistencia nova. |
| Cliente web com sessao segura | `CUMPRE` | `apiClient.ts:631-655` centraliza `credentials: "include"` e CSRF marker; exportacao tambem usa cookies em `apiClient.ts:1199-1235`. |
| Gates finais | `CUMPRE` | `TESTES-FINAIS.md:18-22` e validacoes frescas desta auditoria confirmam planificacao, unit API, builds e Playwright. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BKs | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `real_dev/api/src/modules/ai-safety/ai-safety-policy.ts`, `real_dev/api/src/modules/ai-guardrails/ai-guardrails.service.ts` | `ai-safety-policy.spec.ts`, `ai-guardrails.service.spec.ts`, API unit suite. |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/*`, `real_dev/web/src/features/source-grounded-ai/*` | `source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts`, `citation-policy.spec.ts`, web build. |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/adaptive-explanations/*`, `real_dev/api/src/modules/ai/adaptive-learning.service.ts`, `real_dev/web/src/features/adaptive-explanations/*` | `adaptive-explanations.service.spec.ts`, `adaptive-learning.service.spec.ts`, `room-ai-pedagogy.spec.ts`, web build. |
| `BK-MF8-04` | `RNF37` | `real_dev/api/src/modules/external-knowledge-ai/*`, `real_dev/web/src/features/external-knowledge-ai/*` | `external-ai-policy.spec.ts`, `external-knowledge-ai.service.spec.ts`, web build. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/features/mf8/mockup-alignment.ts`, `mockup-alignment-panel.tsx`, `SoloStudyDashboard.tsx` | `real_dev/web/tests/e2e/mf8-mockup-alignment.spec.ts`, Playwright full. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/common/text/pt-text-normalization.ts`, materials/material-index services, `MaterialList.tsx` | `pt-text-normalization.spec.ts`, `materials.service.spec.ts`, `material-index.service.spec.ts`, API unit suite. |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/artifact-export.service.ts`, `study-tools.controller.ts`, `apiClient.ts` | `artifact-export.service.spec.ts`, API unit suite, web build. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/lib/format-date-pt.ts`, pages/components que exibem datas | `real_dev/web/tests/e2e/mf8-date-format.spec.ts`, Playwright full. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/lib/messages.ts`, paineis MF8 consumidores | `real_dev/web/tests/e2e/mf8-messages.spec.ts`, Playwright full. |
| `BK-MF8-10`, `BK-MF8-11` | `RF16`, `RF42`, `RNF20`, `RNF23` | `room-ai.service.ts`, `room-ai-history.ts`, `room-ai-sharing.service.ts`, `RoomAiPage.tsx`, `apiClient.ts` | `room-ai-history.spec.ts`, `room-ai-sharing.service.spec.ts`, `room-ai.service.spec.ts`, Playwright full. |
| `BK-MF8-12`, `BK-MF8-13` | `RF28`, `RF30` | `official-tests.service.ts`, `official-test-ranking.service.ts`, `official-tests.controller.ts`, `OfficialTestAttemptPage.tsx`, `OfficialTestRankingPage.tsx` | `official-tests.service.spec.ts`, `official-test-ranking.service.spec.ts`, API unit suite. |
| `BK-MF8-14` | `RF12` | `FlashcardsPanel.tsx`, `flashcard-practice.ts`, `StudyToolsPage.tsx` | `mf8-flashcards.spec.ts`, Playwright full. |
| `BK-MF8-15` a `BK-MF8-17` | `RNF41`, `RNF42`, `RNF45` | `mf8-test-inventory.ts`, `run-mf8-final-tests.ts`, `mf8-error-register.ts`, `docs/evidence/MF8/*.md` | `mf8-test-inventory.spec.ts`, `run-mf8-final-tests.spec.ts`, `mf8-error-register.spec.ts`, `TESTES-EM-FALTA.md`, `TESTES-FINAIS.md`, `CORRECAO-ERROS.md`. |

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 consome os contratos de MF7 de fontes, perfis distintos, limites de professor, health/deploy/readiness e componentes/testes reutilizaveis sem os duplicar. Os checks `domain-boundary.spec.ts`, API unit suite e Playwright full continuam verdes.
- `MF8 interna`: `COERENTE`. A cadeia `BK-MF8-01 -> BK-MF8-17` evolui de seguranca IA, fontes, adaptacao, UI/localizacao, sala, mini-testes, flashcards e gates finais sem findings abertos.
- `MF8 -> MF seguinte`: `NAO_APLICAVEL`. Nao existe `MF9` implementada neste checkout; o handoff da matriz termina em `BK-MF8-17 -> -`.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum aberto. O antigo `P2-BK-MF8-16-01` esta fechado por `TESTES-FINAIS.md:10`, `CORRECAO-ERROS.md:18` e pesquisa estatica sem `/Users/` em `TESTES-FINAIS.md`.
- `P3`: nenhum aberto. O antigo risco de copy PT-PT do `BK-MF8-14` ja nao aparece como finding aberto nesta consolidacao.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `FAIL`, `BLOQUEADO`, `/Users/`, `path-local`, `token=`, `cookie=`, `password=`, `secret=` em `TESTES-FINAIS.md` | `PASS` - sem ocorrencias. |
| `FAIL`/`BLOQUEADO` em `CORRECAO-ERROS.md` | `PASS_COM_JUSTIFICACAO` - ocorrencias apenas no texto que declara ausencia de comandos finais em falha. |
| `localStorage`/`sessionStorage` em `real_dev/api/src`, `real_dev/web/src` e E2E MF8 | `PASS` - sem sessao/token em storage local. |
| `as any`, `payload: unknown`, `TODO`, `FIXME`, `stub`, `fake`, segredos, tokens, cookies, passwords, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt` | `PASS_COM_JUSTIFICACAO` - ocorrencias relevantes sao benignas: sanitizacao/redaction, JSDoc de cookies HttpOnly/CSRF, providers/testes IA, fallback E2E local, e uma nota explicita em `material-index.service.ts` a dizer que nao introduz embeddings nesta fase. |
| Leakage de `real_dev` em guias canonicos MF8 | `PASS_COM_JUSTIFICACAO` - os guias publicos podem manter exemplos `apps/...`; os relatorios/evidence usam `real_dev` por contrato da prompt. |

### Comandos executados nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - artefactos MF8 untracked ja existentes/esperados; `real_dev/` ignorado por contrato local. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `.gitignore:2:real_dev/`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - `overall_pass: true`, 57 RF, 45 RNF, 107 BK e score 100. |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 97 suites, 412 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/web run test:e2e` na sandbox | `BLOQUEADO_AMBIENTE` - `listen EPERM: operation not permitted 0.0.0.0` ao arrancar `MongoMemoryServer`. |
| `npm --prefix real_dev/web run test:e2e` fora da sandbox | `PASS` - 29 testes Playwright passaram. |

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo, guias canonicos, evidence MF8, package scripts ou commits nesta auditoria.

### Blockers e TODOs

- Blockers de auditoria: nenhum.
- TODOs obrigatorios: nenhum.
- Validacao E2E no sandbox: bloqueada por ambiente, mas reexecutada fora do sandbox com `PASS`.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Manter a MF8 como `AUDITADO_OK` / `PASS`. Se for preciso preparar defesa ou entrega, usar esta seccao consolidada como resumo tecnico atual e deixar as secoes historicas abaixo apenas como trilho de auditorias BK-a-BK.

---

## Auditoria atual - BK-MF8-17

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta auditoria`: `BK-MF8-17`
- `Resultado`: `PASS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Auditoria fresca ao `BK-MF8-17 - Correcao de erros`, sem assumir a implementacao anterior como prova suficiente. A implementacao cumpre `RNF45`: consome `docs/evidence/MF8/TESTES-FINAIS.md`, entrega script local `mf8:error-register`, spec propria, comando npm, evidence `docs/evidence/MF8/CORRECAO-ERROS.md`, revalidacao das correcoes e gate final em `PASS`.

O finding `P2-BK-MF8-16-01` e o risco E2E opcional que vinham do `BK-MF8-16` estao fechados por evidencia objetiva no BK17: `TESTES-FINAIS.md` ja nao contem path absoluto local, todos os comandos finais estao em `PASS` e o Playwright completo registado na evidence final tem `29 passed`. Nao ha findings `P0`, `P1`, `P2` ou `P3` abertos nesta auditoria.

### Escopo auditado

- BK alvo: `BK-MF8-17`.
- Requisito canonico: `RNF45`.
- Dependencia direta: `BK-MF8-16`.
- Handoff direto: fim da `MF8`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas tratadas como referencia publica/documental: `apps/`.
- `real_dev/` continua ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev real_dev/api real_dev/web`.
- Modo audit-only: nao houve alteracao de codigo, guias canonicos, evidence ou package scripts nesta auditoria.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-17` | `RNF45` | `PASS` | Registo de erros, teste unitario, comando npm, evidence de correcao e revalidacao final existem; todos os comandos finais auditados estao em `PASS`. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md:90` | `RNF45` define correcao dos erros encontrados nos testes e revalidacao final. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:123` | Confirma `BK-MF8-17`, owner `Daniel`, apoio `Guilherme`, prioridade `P0`, esforco `M`, dependencia `BK-MF8-16`, requisito `RNF45`, sprint `S12` e proximo BK `-`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:293` | Confirma a mesma linha operacional do MVP. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:141` | Confirma contrato de campos, dependencia `BK-MF8-16`, requisito `RNF45` e fim da sequencia. |
| `docs/planificacao/backlogs/MF-VIEWS.md:253-274` | Confirma que a MF8 termina em `BK-MF8-17`. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md:24-32` | Define objetivo, rastreabilidade e regra de privacidade da evidence. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md:36-42` | Define scope-in: consumir `TESTES-FINAIS.md`, criar script/spec/comando, gerar `CORRECAO-ERROS.md` e revalidar erros corrigidos. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md:46-51` | Exclui endpoint/UI/requisito novo e proibe evidence com tokens, cookies, prompts privados, respostas IA completas, materiais privados ou dados pessoais. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Metadados canonicos do BK | `CUMPRE` | Guia, matriz, backlog, contrato de campos, MF views e RNF alinham `BK-MF8-17` com `RNF45`, prioridade `P0`, dependencia `BK-MF8-16`, sprint `S12` e proximo BK `-`. |
| Entrada `TESTES-FINAIS.md` do BK16 | `CUMPRE` | `docs/evidence/MF8/TESTES-FINAIS.md:5-22` mostra bateria obrigatoria `PASS`, E2E Playwright `PASS` e ficheiro de entrada relativo `docs/evidence/MF8/TESTES-EM-FALTA.md`. |
| Script local de registo | `CUMPRE` | `real_dev/api/src/scripts/mf8-error-register.ts:5-40` define paths, tipos e contrato de execucao; `:175-188` le `TESTES-FINAIS.md` e escreve `CORRECAO-ERROS.md`. |
| Regra de fecho de erro | `CUMPRE` | `mf8-error-register.ts:49-65` so fecha `RETESTED` quando ha id, comando, causa, correcao, validacao e nota de privacidade. |
| Parsing de evidence final | `CUMPRE` | `mf8-error-register.ts:73-82` extrai linhas Markdown; `:202-217` transforma linhas em `Mf8FinalTestRow`; `:220-238` suporta a tabela real com `Linha executada`. |
| Registo de `FAIL`/`BLOQUEADO` | `CUMPRE` | `mf8-error-register.ts:91-105` cria registos apenas para rows sem `PASS`; `:245-263` classifica `OPEN`/`BLOCKED` com causa, comando e privacy note. |
| Renderer Markdown seguro | `CUMPRE` | `mf8-error-register.ts:114-167` renderiza decisao e tabela sem outputs completos; `:280-285` sanitiza tokens, cookies, passwords, secrets, Bearer e paths locais. |
| Comando npm estavel | `CUMPRE` | `real_dev/api/package.json:18-20` expoe `mf8:test-inventory`, `mf8:final-tests` e `mf8:error-register`. |
| Testes unitarios do registo | `CUMPRE` | `mf8-error-register.spec.ts:21-44` cobre fecho, ausencia de causa e erro reaberto; `:46-69` cobre `FAIL`/`BLOQUEADO`; `:71-94` cobre a tabela real de `TESTES-FINAIS.md`. |
| Correcao do finding P2 herdado | `CUMPRE` | `run-mf8-final-tests.ts:217-223` normaliza paths de evidence; `TESTES-FINAIS.md:10` mostra path relativo; pesquisa `rg -n "FAIL|BLOQUEADO|/Users/|path-local|token=|cookie=|password=|secret=" docs/evidence/MF8/TESTES-FINAIS.md` nao encontrou ocorrencias. |
| Revalidacao E2E opcional | `CUMPRE` | `TESTES-FINAIS.md:22` regista Playwright em `PASS`; `TESTES-FINAIS.md:276-310` mostra 29 testes executados e `29 passed`. Reexecucao auditada focada fora da sandbox passou com 5 testes. |
| Correcoes revalidadas | `CUMPRE` | `CORRECAO-ERROS.md:7-20` mostra decisao `PASS`, nenhum comando final em `FAIL`/`BLOQUEADO` e tres correcoes revalidadas com privacidade. |
| Ausencia de endpoint, controller, DTO, schema, service de dominio, UI ou dependencia nova | `CUMPRE` | Alteracoes auditadas estao limitadas a scripts/specs/package script/E2E/evidence/relatorio; `package.json:25-56` nao introduz dependencias novas. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/mf8-error-register.ts` | Parser, builder, regra de fecho, renderer e CLI para `CORRECAO-ERROS.md`. |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/mf8-error-register.spec.ts` | `npm --prefix real_dev/api test -- mf8-error-register.spec.ts run-mf8-final-tests.spec.ts --runInBand`: 2 suites, 12 testes PASS. |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/run-mf8-final-tests.ts` | Normalizacao de path local antes de renderizar `TESTES-FINAIS.md`. |
| `BK-MF8-17` | `RNF45` | `real_dev/web/tests/e2e/mf1-smoke.spec.ts` | `:176-180` limita link `Turmas` a `Navegação principal`; `:197-200` limita link `Salas`; `:223-230` limita resposta IA ao artigo atual. |
| `BK-MF8-17` | `RNF45` | `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts` | `:8-17` define credenciais locais E2E; `:28-47` usa env vars quando existem e fallback semeado pelo `start:e2e`. |
| `BK-MF8-17` | `RNF45` | `docs/evidence/MF8/TESTES-FINAIS.md` | `:18-22` mostra planificacao, API unit, API build, web build e E2E em `PASS`; `:204-205` mostra 97 suites/412 testes API; `:310` mostra 29 E2E passed. |
| `BK-MF8-17` | `RNF45` | `docs/evidence/MF8/CORRECAO-ERROS.md` | `:7-20` mostra decisao `PASS` e correcoes revalidadas. |

### Coerencia entre MFs e BKs vizinhos

- `BK-MF8-15 -> BK-MF8-16`: `COERENTE`. `TESTES-FINAIS.md:10-12` confirma que a evidence de entrada `TESTES-EM-FALTA.md` existe e permite iniciar a execucao final.
- `BK-MF8-16 -> BK-MF8-17`: `COERENTE`. O BK17 consome a evidence final, fecha o finding de path absoluto, fecha o bloqueio E2E opcional e gera `CORRECAO-ERROS.md`.
- `MF7 -> MF8`: `COERENTE`. As correcoes E2E MF7 ficam no contrato de teste/validacao e nao alteram dominio, endpoints, guards, ownership, membership ou UI real.
- `MF8 -> fecho de produto`: `COERENTE`. A cadeia `TESTES-EM-FALTA.md -> TESTES-FINAIS.md -> CORRECAO-ERROS.md` esta executavel, sanitizada e em `PASS`.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum finding aberto. O finding `P2-BK-MF8-16-01` foi fechado pela implementacao auditada do BK17.
- `P3`: nenhum.

### Findings fechados / revalidados

#### P2-BK-MF8-16-01 - Evidence final guardava caminho absoluto local

- Estado atual: `JA_CORRIGIDO` nesta auditoria do `BK-MF8-17`.
- Evidencia anterior: auditoria BK16 registava path absoluto local em `TESTES-FINAIS.md`.
- Evidencia atual: `docs/evidence/MF8/TESTES-FINAIS.md:10` usa `docs/evidence/MF8/TESTES-EM-FALTA.md`; `run-mf8-final-tests.ts:217-223` normaliza paths; pesquisa dedicada em `TESTES-FINAIS.md` nao encontrou `/Users/` nem `path-local`.
- Validacao: spec focada passou e `CORRECAO-ERROS.md:18` regista a correcao/revalidacao.

#### RISCO-BK-MF8-16-E2E-01 - E2E opcional permanecia BLOQUEADO

- Estado atual: `JA_CORRIGIDO` nesta auditoria do `BK-MF8-17`.
- Evidencia anterior: Playwright com 5 falhas MF1/MF7.
- Evidencia atual: `TESTES-FINAIS.md:22` marca E2E `PASS`; `TESTES-FINAIS.md:276-310` mostra `29 passed`; reexecucao auditada fora da sandbox passou com 5 testes focados.
- Nota ambiental: a tentativa dentro do sandbox falhou com `listen EPERM` ao arrancar MongoMemoryServer/API local, consistente com limitacao do ambiente e nao com regressao do produto.

### Pesquisa estatica reexecutada

| Pesquisa | Resultado |
| --- | --- |
| `FAIL`, `BLOQUEADO`, `/Users/`, `path-local`, `token=`, `cookie=`, `password=`, `secret=` em `TESTES-FINAIS.md` e `CORRECAO-ERROS.md` | `PASS_COM_JUSTIFICACAO` - `TESTES-FINAIS.md` nao tem ocorrencias; `CORRECAO-ERROS.md` contem apenas texto explicativo/negativo a dizer que nao ha `FAIL`/`BLOQUEADO` e a documentar a pesquisa executada. |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` nos ficheiros auditados | `PASS_COM_JUSTIFICACAO` - ocorrencias residuais pertencem a sanitizacao, teste de redacao de token, credenciais locais E2E semeadas, JSDoc de cookie HttpOnly e texto de privacidade/evidence; sem storage de sessao, segredos reais, dados pessoais ou claims tecnicos proibidos. |
| `real_dev` nos guias publicos MF8 | `PASS_COM_JUSTIFICACAO` - os guias canonicos mantem paths publicos `apps/...`; a implementacao e relatorios usam `real_dev` por contrato da prompt. |

### Comandos executados nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - artefactos MF8 untracked ja existentes/esperados: evidence, relatorio de auditoria e relatorio de implementacao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |
| `npm --prefix real_dev/api test -- mf8-error-register.spec.ts run-mf8-final-tests.spec.ts --runInBand` | `PASS` - 2 suites, 12 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS` - `overall_pass: true`, 57 RF, 45 RNF e 107 BK sincronizados. |
| `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts mf7-async-state-block.spec.ts` na sandbox | `BLOQUEADO_AMBIENTE` - `listen EPERM` ao arrancar MongoMemoryServer/API local. |
| `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts mf7-async-state-block.spec.ts` fora da sandbox | `PASS` - 5 testes. |
| `git diff --check` | `PASS` - sem output. |

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo, guias canonicos, evidence final, package scripts ou commits nesta auditoria.

### Blockers e TODOs

- Blockers de auditoria: nenhum.
- TODOs obrigatorios: nenhum.
- Sem findings abertos.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Se o objetivo for fechar a MF8 operacionalmente, este BK pode seguir como `AUDITADO_OK`. Uma auditoria completa da MF8 inteira pode ser feita depois se for necessária uma decisão consolidada para todos os 17 BKs, mas o alvo estrito desta prompt (`BK-MF8-17`) esta em `PASS`.

---

## Auditoria atual - BK-MF8-16

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta auditoria`: `BK-MF8-16`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Auditoria fresca ao `BK-MF8-16 - Execucao final de testes`, sem assumir a implementacao anterior como prova. A implementacao entrega a gate tecnica de `RNF42`: existe runner CLI, spec propria, script `mf8:final-tests`, validacao da evidence do `BK-MF8-15`, execucao dos comandos obrigatorios e artefacto `docs/evidence/MF8/TESTES-FINAIS.md`. Os comandos obrigatorios auditados passam.

O resultado fica `PASS_COM_RISCOS` por duas razoes: a evidence final atual inclui um caminho absoluto local no campo `Ficheiro`, que deve ser normalizado antes de a evidence ser partilhada como artefacto de defesa; e a bateria E2E opcional continua `BLOQUEADO` com 5 falhas reais a encaminhar para `BK-MF8-17`. Nao ha findings `P0` ou `P1`.

### Escopo auditado

- BK alvo: `BK-MF8-16`.
- Requisito canonico: `RNF42`.
- Dependencia direta: `BK-MF8-15`.
- Handoff direto: `BK-MF8-17`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas tratadas como referencia publica/documental: `apps/`.
- `real_dev/` continua ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev real_dev/api real_dev/web`.
- Modo audit-only: nao houve alteracao de codigo nem correcao dos findings.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF42` | `PASS_COM_RISCOS` | Gate final existe e comandos obrigatorios passam. Fica 1 finding `P2` de privacidade/evidence e 1 risco operacional E2E opcional para `BK-MF8-17`. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md:89` | `RNF42` define execucao final da bateria de testes e recolha de evidence. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:122` | Confirma `BK-MF8-16`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforco `M`, dependencia `BK-MF8-15`, requisito `RNF42`, sprint `S12`, proximo BK `BK-MF8-17`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:292` | Confirma a mesma linha operacional do MVP. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:140` | Confirma contrato de campos, dependencia e proximo BK. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md:24-26` | Define runner executavel, validacao da evidence anterior, comandos reais, geracao de `TESTES-FINAIS.md` e ausencia de endpoint/UI/domain service. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md:46-51` | Exclui correcao de testes encontrados, cria o handoff para `BK-MF8-17` e proibe guardar tokens, cookies, prompts privados, dados pessoais ou outputs extensos em evidence. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md:24-26` | Confirma que `BK-MF8-17` consome `TESTES-FINAIS.md` e corrige apenas `FAIL`/`BLOQUEADO` confirmados. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Metadados canonicos do BK | `CUMPRE` | Matriz, backlog, contrato de campos e guia alinham `RNF42`, prioridade `P0`, dependencia `BK-MF8-15`, sprint `S12` e handoff para `BK-MF8-17`. |
| Runner CLI local | `CUMPRE` | `real_dev/api/src/scripts/run-mf8-final-tests.ts:116-168` define a bateria final; `:378-393` gera e escreve `docs/evidence/MF8/TESTES-FINAIS.md`; `:401-408` expoe a CLI. |
| Evidence de entrada do BK15 | `CUMPRE` | `run-mf8-final-tests.ts:215-235` valida `TESTES-EM-FALTA.md`; `docs/evidence/MF8/TESTES-EM-FALTA.md:5-10` reporta 8 alvos criticos, 8 cobertos, 0 testes em falta e 0 fontes em falta. |
| Comandos obrigatorios da gate | `CUMPRE` | Plano inclui `bash scripts/validate-planificacao.sh`, `npm --prefix real_dev/api run test:unit`, `npm --prefix real_dev/api run build` e `npm --prefix real_dev/web run build` em `run-mf8-final-tests.ts:121-158`; a evidence final mostra todos como `PASS` em `TESTES-FINAIS.md:18-21`. |
| Comando E2E opcional | `CUMPRE_COM_RISCO` | Plano inclui `npm --prefix real_dev/web run test:e2e` como opcional em `run-mf8-final-tests.ts:160-168`; `TESTES-FINAIS.md:22` regista `BLOQUEADO`; execucao auditada fora da sandbox confirmou 24/29 testes a passar e 5 falhas. |
| Comando npm estavel | `CUMPRE` | `real_dev/api/package.json:18-19` expoe `mf8:test-inventory` e `mf8:final-tests`; `real_dev/web/package.json:7-12` expoe `build` e `test:e2e`. |
| Testes unitarios do runner | `CUMPRE_COM_LACUNA_P2` | `run-mf8-final-tests.spec.ts:28-164` cobre evidence ausente, falha obrigatoria, uso de `real_dev`, sanitizacao de token e decisoes bloqueantes. Falta uma assercao para impedir caminhos absolutos locais em `Ficheiro`, que e o finding `P2-BK-MF8-16-01`. |
| Evidence segura | `CUMPRE_COM_LACUNA_P2` | `sanitizeOutput(...)` remove `authorization`, `cookie`, `token`, `password`, `secret` e `Bearer` em `run-mf8-final-tests.ts:189-207`; contudo `TESTES-FINAIS.md:10` contem caminho absoluto local com `/Users/...`, gerado por `run-mf8-final-tests.ts:216`, `:230` e renderizado em `:352`. |
| Sem endpoint, controller, DTO, schema, UI ou dependencia nova | `CUMPRE` | Alteracoes auditadas estao limitadas a script CLI, spec, package script e evidence; nao ha controller/DTO/schema/UI novo ligado ao BK16. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF42` | `real_dev/api/src/scripts/run-mf8-final-tests.ts` | `npm --prefix real_dev/api test -- run-mf8-final-tests.spec.ts --runInBand`: 1 suite, 6 testes. |
| `BK-MF8-16` | `RNF42` | `real_dev/api/package.json` | `mf8:final-tests` compila/gera runner em `dist/scripts/run-mf8-final-tests.js`. |
| `BK-MF8-16` | `RNF42` | `docs/evidence/MF8/TESTES-FINAIS.md` | Evidence final: comandos obrigatorios `PASS`; E2E opcional `BLOQUEADO`; risco encaminhado para `BK-MF8-17`. |
| `BK-MF8-16 -> BK-MF8-17` | `RNF42 -> RNF45` | `real_dev/web/tests/e2e/mf1-smoke.spec.ts`, `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts` | Reexecucao E2E auditada: 5 falhas a corrigir/revalidar no BK seguinte. |

### Coerencia entre MFs e BKs vizinhos

- `BK-MF8-15 -> BK-MF8-16`: `COERENTE`. `TESTES-EM-FALTA.md` existe, nao contem decisao bloqueante e permite iniciar a execucao final.
- `BK-MF8-16 -> BK-MF8-17`: `COERENTE_COM_RISCOS`. `TESTES-FINAIS.md` deixa a lista objetiva de `PASS`/`BLOQUEADO`; as falhas E2E opcionais pertencem ao scope de correcao de `BK-MF8-17`.
- `MF8 -> fecho de produto`: `COERENTE_COM_RISCOS`. A gate obrigatoria passa, mas nao se deve declarar MF8 totalmente fechada enquanto o finding de evidence segura e o bloqueio E2E opcional nao forem tratados.
- Resultado geral de coerencia: `COERENTE_COM_RISCOS`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: 1 finding confirmado.
- `P3`: nenhum.

#### P2-BK-MF8-16-01 - Evidence final guarda caminho absoluto local

- Estado: `ABERTO`.
- Severidade: `P2`.
- BK/RNF: `BK-MF8-16` / `RNF42`.
- Evidencia observada: `docs/evidence/MF8/TESTES-FINAIS.md:10` guarda `/Users/nuno/Developer/.../docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Origem provavel: `real_dev/api/src/scripts/run-mf8-final-tests.ts:216` cria `evidencePath` absoluto, `:230` devolve esse path no objeto de inventory e `:352` renderiza diretamente `evidence.inventory.path`.
- Comportamento esperado: a evidence partilhavel deve usar path relativo ao repositorio, por exemplo `docs/evidence/MF8/TESTES-EM-FALTA.md`, mantendo a prova tecnica sem expor diretoria local, username ou estrutura privada da maquina.
- Impacto: medio. Nao compromete autenticacao, dados de alunos, tokens ou execucao da gate, mas contraria o objetivo de evidence segura do BK e pode expor metadados locais quando o artefacto for usado em defesa/auditoria externa.
- Recomendacao: no `BK-MF8-17` ou numa correcao autorizada, normalizar o path antes de renderizar a evidence e adicionar teste unitario que rejeite caminhos absolutos no campo `Ficheiro`.
- Motivo para nao corrigir nesta execucao: a prompt atual esta em `MODO=auditar_implementacao`, `STRICT_SCOPE=true` e `PERMITIR_ALTERAR_DOCS=nao`; apenas este relatorio podia ser atualizado.

### Riscos e handoff para BK-MF8-17

#### RISCO-BK-MF8-16-E2E-01 - E2E opcional permanece BLOQUEADO

- Estado: `A_REVALIDAR_NO_BK-MF8-17`.
- Evidencia em `TESTES-FINAIS.md`: `docs/evidence/MF8/TESTES-FINAIS.md:263-321` mostra Playwright opcional com 5 falhas e 24 testes passados.
- Reexecucao auditada fora da sandbox: `npm --prefix real_dev/web run test:e2e` terminou com exit code `1`, 24/29 testes passados e 5 falhas.
- Falha MF1: `real_dev/web/tests/e2e/mf1-smoke.spec.ts:176` usa `page.getByRole("link", { name: "Turmas" })`; Playwright reportou strict mode violation porque encontrou duas ligações com nome acessivel `Turmas`.
- Falhas MF7: `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts:17-21`, `:32-36`, `:71`, `:88`, `:105`, `:134` exigem variaveis `STUDYFLOW_E2E_STUDENT_EMAIL`/`STUDYFLOW_E2E_TEACHER_EMAIL` que nao estavam definidas no ambiente auditado.
- Impacto: nao bloqueia `BK-MF8-16`, porque Playwright e opcional no contrato deste BK quando dependente de ambiente; bloqueia apenas a afirmacao de fecho total da MF8 sem o tratamento/revalidacao do `BK-MF8-17`.

### Pesquisa estatica reexecutada

| Pesquisa | Resultado |
| --- | --- |
| `authorization`, `cookie`, `token`, `password`, `secret`, `Bearer`, `STUDYFLOW_E2E`, `real_dev`, `apps/` em guia BK16, runner, spec e evidence | `PASS_COM_FINDING_P2` - ocorrencias de sanitizacao e paths tecnicos esperadas; confirmou o caminho absoluto local em `TESTES-FINAIS.md:10` e o mapeamento correto da implementacao para `real_dev`. |
| `real_dev` nos guias publicos BK16 | `PASS_COM_JUSTIFICACAO` - o guia continua com paths `apps/` por contrato publico/tutorial; a implementacao real usa `real_dev`, conforme a prompt de auditoria. |

### Comandos executados nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - apenas artefactos MF8 untracked ja existentes: evidence, relatorio de auditoria e relatorio de implementacao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |
| `npm --prefix real_dev/api test -- run-mf8-final-tests.spec.ts --runInBand` | `PASS` - 1 suite, 6 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS` - `overall_pass: true`, 57 RF, 45 RNF e 107 BK sincronizados. |
| `npm --prefix real_dev/web run test:e2e` fora da sandbox | `BLOQUEADO_COM_RISCO` - exit code `1`; 24/29 testes passados; 5 falhas encaminhadas para `BK-MF8-17`. |

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo, guias canonicos, evidence final, package scripts ou commits.

### Blockers e TODOs

- Blockers de auditoria: nenhum.
- TODO obrigatorio antes de fechar MF8 sem riscos: corrigir `P2-BK-MF8-16-01` normalizando o path absoluto local em `TESTES-FINAIS.md`.
- TODO de handoff para `BK-MF8-17`: tratar/revalidar as 5 falhas E2E opcionais.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar uma correcao autorizada para o `P2-BK-MF8-16-01` ou avancar para `BK-MF8-17 - Correcao de erros`, usando `docs/evidence/MF8/TESTES-FINAIS.md` como input e tratando explicitamente o bloqueio E2E opcional antes de declarar a MF8 fechada sem riscos.

---

## Auditoria atual - BK-MF8-15

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta auditoria`: `BK-MF8-15`
- `Resultado`: `PASS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Auditoria fresca ao `BK-MF8-15 - Verificacao dos testes atuais e criacao dos testes em falta`, sem assumir o resultado da implementacao anterior como prova. A implementacao cumpre `RNF41`: existe script local de inventario, manifesto explicito de alvos criticos, comando `mf8:test-inventory`, spec propria, evidence segura e handoff objetivo para `BK-MF8-16`. Nao ha findings `P0`, `P1`, `P2` ou `P3`.

### Escopo auditado

- BK alvo: `BK-MF8-15`.
- Requisito canonico: `RNF41`.
- Dependencia direta: `BK-MF8-14`.
- Handoff direto: `BK-MF8-16`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`.
- `real_dev/` continua ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev real_dev/api real_dev/web`.
- Modo audit-only: nao houve alteracao de codigo.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-15` | `RNF41` | `PASS` | Script, spec, comando e evidence cumprem o contrato; inventario atual reporta 8/8 alvos cobertos e 0 lacunas. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md:88` | `RNF41` define verificacao dos testes atuais e criacao dos testes em falta. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:121` | Confirma `BK-MF8-15`, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforco `M`, dependencia `BK-MF8-14`, requisito `RNF41`, sprint `S12`, proximo BK `BK-MF8-16`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:291` | Confirma a mesma linha operacional do MVP. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:139` | Confirma contrato de campos, dependencia e proximo BK. |
| `docs/planificacao/backlogs/MF-VIEWS.md:253-274` | Confirma cadeia MF8 com `BK-MF8-15` entre flashcards e execucao final de testes. |
| `docs/planificacao/sprints/PLANO-SPRINTS.md:47` | Confirma S12 como fecho de produto, testes finais e evidence completa. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md` | Define script local, spec, package script, evidence `TESTES-EM-FALTA.md`, sem endpoint/UI e sem bateria final completa. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Metadados canonicos do BK | `CUMPRE` | Matriz, backlog, contrato de campos, MF views e guia alinham `RNF41`, prioridade `P0`, dependencia `BK-MF8-14`, sprint `S12` e handoff para `BK-MF8-16`. |
| Script local de inventario | `CUMPRE` | `real_dev/api/src/scripts/mf8-test-inventory.ts:42-107` define 8 alvos criticos; `:126-157` faz discovery controlado; `:184-208` classifica `covered`, `missing-spec` e `missing-source`; `:259-289` renderiza Markdown. |
| Alvos criticos de API e web | `CUMPRE` | Manifesto cobre `study-tools`, `ai-artifact.validator`, `official-tests`, `room-ai`, `room-shares`, o proprio inventario, `mf8-flashcards` e `mf6-background-jobs` em `mf8-test-inventory.ts:42-107`. |
| Comando npm estavel | `CUMPRE` | `real_dev/api/package.json:18` expoe `mf8:test-inventory` como `nest build && node dist/scripts/mf8-test-inventory.js`. |
| Teste unitario do inventario | `CUMPRE` | `real_dev/api/src/scripts/mf8-test-inventory.spec.ts:36-105` cobre caso coberto, teste em falta, ficheiro base em falta e Markdown deterministico. |
| Evidence de lacunas | `CUMPRE` | `docs/evidence/MF8/TESTES-EM-FALTA.md:5-10` regista 8 alvos criticos, 8 cobertos, 0 testes em falta e 0 ficheiros base em falta; `:16-23` lista todos os alvos. |
| Decisao para BK seguinte | `CUMPRE` | `docs/evidence/MF8/TESTES-EM-FALTA.md:25-27` permite avancar para a execucao final; `mf8-test-inventory.ts:282-286` gera decisao positiva ou bloqueante conforme lacunas. |
| Exit code bloqueante para lacunas P0 | `CUMPRE` | `mf8-test-inventory.ts:296-304` escreve output e define `process.exitCode = 1` quando algum alvo `P0` nao esta `covered`. |
| Sem endpoint, controller, DTO, schema, UI ou dependencia nova | `CUMPRE` | Alteracoes do BK15 limitam-se a `real_dev/api/src/scripts/mf8-test-inventory.ts`, `real_dev/api/src/scripts/mf8-test-inventory.spec.ts`, `real_dev/api/package.json`, evidence e relatorio de implementacao; `package.json:23-54` nao mostra dependencia nova. |
| Evidence segura | `CUMPRE` | Evidence contem apenas paths tecnicos, estados e razoes; pesquisa estatica nao encontrou segredos, tokens, storage, dados sensiveis, prompts privados ou claims proibidos nos ficheiros do BK15/evidence. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-15` | `RNF41` | `real_dev/api/src/scripts/mf8-test-inventory.ts` | `npm --prefix real_dev/api run mf8:test-inventory`: 8 alvos criticos, 8 cobertos, 0 testes em falta, 0 ficheiros base em falta. |
| `BK-MF8-15` | `RNF41` | `real_dev/api/src/scripts/mf8-test-inventory.spec.ts` | `npm --prefix real_dev/api test -- mf8-test-inventory.spec.ts --runInBand`: 1 suite, 3 testes. |
| `BK-MF8-15` | `RNF41` | `real_dev/api/package.json` | `mf8:test-inventory` compila Nest antes de executar o script em `dist`. |
| `BK-MF8-15` | `RNF41` | `docs/evidence/MF8/TESTES-EM-FALTA.md` | Evidence segura e legivel para entrada do `BK-MF8-16`. |

### Coerencia entre MFs e BKs vizinhos

- `BK-MF8-14 -> BK-MF8-15`: `COERENTE`. O inventario verifica a suite `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`, que e o handoff tecnico do BK14.
- `BK-MF8-15 -> BK-MF8-16`: `COERENTE`. A evidence existe, nao tem lacunas P0 e fornece decisao explicita para a execucao final.
- `MF7 -> MF8`: `COERENTE`. O BK15 reforca manutencao/qualidade sem alterar endpoints, auth, ownership, deploy readiness ou health checks.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica reexecutada

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` em `mf8-test-inventory.ts`, `mf8-test-inventory.spec.ts` e `TESTES-EM-FALTA.md` | `PASS` - sem ocorrencias. |
| `real_dev` nos guias canonicos `BK-MF8-15` e `BK-MF8-16` | `PASS` - sem leakage de caminho privado nos guias publicos. |

### Comandos executados nesta auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - apenas artefactos MF8 untracked conhecidos: evidence, relatorio de auditoria e relatorio de implementacao. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |
| `npm --prefix real_dev/api test -- mf8-test-inventory.spec.ts --runInBand` | `PASS` - 1 suite, 3 testes. |
| `npm --prefix real_dev/api run mf8:test-inventory` | `PASS` - 8 alvos criticos, 8 cobertos, 0 testes em falta, 0 ficheiros base em falta. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 95 suites, 400 testes. |
| `bash scripts/validate-planificacao.sh` | `PASS` - `overall_pass: true`, 107 BK na matriz/backlog/guias, score 100. |
| `git diff --check` | `PASS` - sem output. |
| `rg -n "[ \t]+$" ...ficheiros auditados/relatorio...` | `PASS` - sem whitespace final. |

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo.

### Blockers e TODOs

- Blockers de auditoria: nenhum.
- TODOs obrigatorios: nenhum.
- Sem lacunas P0/P1/P2/P3 confirmadas.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Avancar para `BK-MF8-16 - Execucao final de testes`, usando `docs/evidence/MF8/TESTES-EM-FALTA.md` como evidence de entrada e `npm --prefix real_dev/api run mf8:test-inventory` como gate previo.

---

## Correcao atual - P3-BK-MF8-14-01

### Resultado geral

- Pedido do utilizador: corrigir o `P3`.
- Finding corrigido: `P3-BK-MF8-14-01 - Copy visivel sem acentuacao PT-PT`.
- `PROJECT_NAME`: StudyFlow
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta correcao`: `BK-MF8-14`
- `Resultado`: `PASS`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; correcao restrita ao finding confirmado e a este relatorio tecnico.

A correcao fechou o `P3-BK-MF8-14-01`. A copy visivel do painel de flashcards foi normalizada para PT-PT com acentuacao correta, e o E2E especifico foi atualizado para validar a copy nova. Nao houve alteracao de backend, endpoints, schemas, ownership, persistencia ou regras de estado local.

### Estado do finding

| Finding | Estado anterior | Estado atual | Decisao |
| --- | --- | --- | --- |
| `P3-BK-MF8-14-01` | `ABERTO` | `FECHADO` | Corrigida copy visivel em `FlashcardsPanel` e textos E2E associados. |

### Ficheiros alterados nesta correcao

- `real_dev/web/src/components/ai/FlashcardsPanel.tsx`
- `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

### Evidencia da correcao

| Area | Evidencia |
| --- | --- |
| UI vazia de flashcards | `FlashcardsPanel.tsx:82` usa `Este artefacto não tem cartões válidos para rever.` |
| Descricao do modo | `FlashcardsPanel.tsx:106-107` usa `solução` e `revisão`. |
| Botoes de modo | `FlashcardsPanel.tsx:125` e `:136` usam `Modo exercício` e `Modo revisão`. |
| Estado concluido | `FlashcardsPanel.tsx:142-153` usa `Sessão concluída.`, `Recomeça`, `cartões`, `reforçar`, `memória` e `Recomeçar`. |
| E2E atualizado | `mf8-flashcards.spec.ts:41`, `:72`, `:84`, `:90`, `:110`, `:120`, `:123` validam textos acentuados e dados de teste PT-PT. |

### Validacao executada

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `rg -n 'Este artefacto nao|cartoes validos|solucao|Modo exercicio|Modo revisao|Sessao concluida|Recomeca|Recomecar|Qual e a capital|Oceano Atlantico' real_dev/web/src/components/ai/FlashcardsPanel.tsx real_dev/web/tests/e2e/mf8-flashcards.spec.ts` | `PASS` - sem ocorrencias antigas nos ficheiros corrigidos. |
| `rg -n '[ \t]+$' real_dev/web/src/components/ai/FlashcardsPanel.tsx real_dev/web/tests/e2e/mf8-flashcards.spec.ts` | `PASS` - sem whitespace final nos ficheiros corrigidos. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` | `BLOQUEADO_NA_SANDBOX` - `listen EPERM` ao iniciar `MongoMemoryServer`; bloqueio ambiental conhecido. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` fora da sandbox | `PASS` - 3 testes Playwright. |
| `git diff --check` | `PASS`. |

### Notas de escopo

- O `real_dev/` continua ignorado por `.gitignore`, portanto `git status` nao mostra estes ficheiros como alteracoes rastreadas.
- Nao foram corrigidos comentarios antigos fora dos ficheiros diretamente ligados ao finding.
- Sem commits por omissao.

## Re-auditoria atual - BK-MF8-14

### Resultado geral

- Pedido do utilizador: re-auditar.
- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta re-auditoria`: `BK-MF8-14`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Re-auditoria fresca ao `BK-MF8-14 - Flashcards em modo de exercicio e revisao`, sem confiar no resultado da auditoria anterior como prova. A implementacao continua funcionalmente conforme: reutiliza `AiArtifact` e `StudyToolsService`, mantem o filtro de ownership no backend, nao cria endpoint/schema/persistencia nova, isola o estado local no frontend, apresenta modos exercicio/revisao e tem Playwright especifico a passar fora da sandbox. O unico finding confirmado continua a ser `P3-BK-MF8-14-01`, sobre copy visivel sem acentuacao PT-PT; nao ha findings `P0`, `P1` ou `P2`.

### Escopo re-auditado

- BK alvo: `BK-MF8-14`.
- Requisito canonico: `RF12`.
- Referencia de qualidade: `RNF41`.
- Contexto de coerencia: `BK-MF0-12 -> BK-MF8-14 -> BK-MF8-15`.
- Pasta auditada: `real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`.
- `real_dev/` continua ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev`.
- Modo audit-only: nao houve correcao do `P3` nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-14` | `RF12`, `RNF41` | `PASS_COM_RISCOS` | Contrato funcional e de seguranca cumpre. Mantem 1 finding `P3` nao bloqueante de copy PT-PT sem acentuacao. |

### Evidencia canonica revalidada

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md:54` | `RF12` define explicacoes, cards e quizzes personalizados. |
| `docs/RNF.md:88` | `RNF41` exige verificacao dos testes atuais e criacao dos testes em falta. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:120` | Confirma `BK-MF8-14`, owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforco `S`, dependencia `BK-MF0-12`, requisito `RF12`, sprint `S12`, proximo BK `BK-MF8-15`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:139` | Confirma a mesma linha operacional para o MVP. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:138` | Confirma contrato de campos canonicos do BK. |
| `docs/planificacao/backlogs/MF-VIEWS.md:255` e `:271` | Confirma o BK na cadeia MF8 e o link para o guia. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md` | Mantem o scope: sem nova IA, sem novo endpoint, sem novo schema, com estado local e Playwright. |

### Evidencia de implementacao revalidada

| Requisito auditado | Estado | Evidencia atual |
| --- | --- | --- |
| Endpoint real e ownership backend | `CUMPRE` | `study-tools.controller.ts:31-62` usa `SessionGuard` e `request.user!.id`; `study-tools.service.ts:88-101` chama `areasService.getMyStudyArea(userId, studyAreaId)` antes de listar artefactos. |
| Sem novo schema para flashcards | `CUMPRE` | `ai-artifact.schema.ts:14` inclui `FLASHCARDS`; `:22-45` guarda `userId`, `studyAreaId`, `type`, `contentJson` e `sourcesJson`. |
| Cliente frontend consome contrato existente | `CUMPRE` | `apiClient.ts:87`, `:102-107`, `:631-644`, `:1103-1105` tipam artefactos e chamam `listStudyTools(...)` com cookies HttpOnly/CSRF. |
| Pagina real renderiza flashcards autorizados | `CUMPRE` | `StudyToolsPage.tsx:56-62` carrega artefactos; `:255` renderiza `FlashcardsPanel` quando `artifact.type === "FLASHCARDS"`. |
| Estado local de pratica isolado | `CUMPRE` | `flashcard-practice.ts:22-31`, `:39-46`, `:55-76`, `:85-95`, `:103-107` cobrem inicializacao, revelar, avancar/concluir, trocar modo e recomecar. |
| UI de exercicio/revisao | `CUMPRE_COM_RISCO_P3` | `FlashcardsPanel.tsx:77-85`, `:100-138`, `:140-155`, `:157-217` cobre vazio, modos, conclusao, resposta escondida/revelada e navegacao; risco residual e apenas copy sem acentos. |
| Fontes associadas | `CUMPRE` | `FlashcardsPanel.tsx:184-188` passa fontes para `ArtifactSources`; `ArtifactSources.tsx:20-50` filtra por `sourceMaterialIds` e mostra metadados curtos. |
| Testes especificos | `CUMPRE` | `mf8-flashcards.spec.ts:29-39`, `:41-51`, `:53-124` cobrem estado local, modo revisao e fluxo UI de revelar/concluir. |

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: 1, confirmado novamente.

#### P3-BK-MF8-14-01 - Copy visivel sem acentuacao PT-PT

- Estado: `ABERTO`.
- Severidade: `P3`.
- Evidencia revalidada: `FlashcardsPanel.tsx:82`, `:106-107`, `:125`, `:136`, `:142-144`, `:153` contem strings visiveis sem acentuacao; `mf8-flashcards.spec.ts:123` fixa uma dessas strings no teste.
- Impacto: baixo; nao afeta seguranca, ownership, contrato API, persistencia, testes ou fluxo funcional, mas reduz polimento PT-PT da UX.
- Motivo para nao corrigir nesta execucao: o pedido foi re-auditoria e a prompt base esta em `MODO=auditar_implementacao`.

### Pesquisa estatica reexecutada

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `mock`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompts privados`, `dados sensiveis` nos ficheiros BK14 e contratos consumidos | `PASS_COM_JUSTIFICACAO` - ocorrencias benignas em credencial de fallback E2E, comentarios/tipos de login/password e cookies HttpOnly/CSRF no cliente comum. Nao ha storage persistente novo, segredo, prompt privado, token exposto ou alteracao proibida. |
| `real_dev` nos guias `BK-MF8-13`, `BK-MF8-14`, `BK-MF8-15` | `PASS` - sem leakage de path privado nos guias publicos. |

### Comandos executados nesta re-auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - apenas relatorios MF8 untracked conhecidos. |
| `git check-ignore -v real_dev` | `PASS` - `.gitignore:2:real_dev/`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/api test -- study-tools.service.spec.ts ai-artifact.validator.spec.ts` | `PASS` - 2 suites, 14 testes. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` | `BLOQUEADO_NA_SANDBOX` - `listen EPERM` ao iniciar `MongoMemoryServer`; bloqueio ambiental. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` fora da sandbox | `PASS` - 3 testes Playwright. |
| `git diff --check` | `PASS`. |

### Ficheiros alterados por esta re-auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo.

### Proxima acao recomendada

Corrigir `P3-BK-MF8-14-01` em modo de correcao, limitando a alteracao a copy visivel PT-PT e assercoes E2E correspondentes.

## Auditoria atual - BK-MF8-14

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-14`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas atualizacao deste relatorio tecnico.

Auditoria fresca ao `BK-MF8-14 - Flashcards em modo de exercicio e revisao` em `real_dev/api` e `real_dev/web`. A implementacao cumpre o contrato funcional e de seguranca do BK: reutiliza o endpoint real de `AiArtifact`, nao cria IA nova, endpoint novo, schema novo nem persistencia local, mantem ownership no backend, adiciona estado local isolado para treino/revisao, melhora o `FlashcardsPanel` com resposta escondida, revelar, avancar, concluir, recomecar e fontes, e cobre o fluxo com Playwright especifico. O resultado fica `PASS_COM_RISCOS` apenas por um finding `P3` de copy visivel sem acentuacao PT-PT; nao ha findings `P0`, `P1` ou `P2`.

### Escopo auditado

- BK alvo: `BK-MF8-14`.
- Contexto de coerencia: `BK-MF0-12` como fornecedor historico dos flashcards IA, `BK-MF8-13` como BK anterior independente e `BK-MF8-15` como consumidor seguinte para testes/inventario.
- Requisito canonico: `RF12`.
- Referencia de qualidade transversal: `RNF41`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`.
- `real_dev/` esta ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev` e nao classificado como finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-14` | `RF12`, `RNF41` | `PASS_COM_RISCOS` | Cumpre reutilizacao de `AiArtifact`, ownership backend, estado local de pratica, UI de exercicio/revisao, fontes e Playwright. Risco residual: `P3` de copy PT-PT sem acentuacao em strings novas do painel/teste. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md:54` | `RF12` define explicacoes, cards e quizzes personalizados. |
| `docs/RNF.md:88` | `RNF41` exige verificacao dos testes atuais e criacao dos testes em falta. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:120` | `BK-MF8-14`, owner `Daniel`, apoio `Guilherme`, prioridade `P1`, esforco `S`, dependencia `BK-MF0-12`, requisito `RF12`, sprint `S12`, proximo BK `BK-MF8-15`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:139` | Confirma a mesma linha canonica e continuidade da MF8. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:138` | Confirma dependencia `BK-MF0-12`, requisito `RF12` e proximo BK `BK-MF8-15`. |
| `docs/planificacao/backlogs/MF-VIEWS.md:255` e `:271` | Confirma a cadeia MF8 e o link para o guia `BK-MF8-14`. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md` | Exige modo exercicio e revisao sobre flashcards existentes, sem IA nova, sem endpoint novo, sem schema novo, com estado local e Playwright. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Metadados canonicos do BK | `CUMPRE` | Matriz, backlog MVP, contrato de campos e `MF-VIEWS` alinham owner, apoio, dependencia, RF, sprint e proximo BK. |
| Reutiliza endpoint real de study tools | `CUMPRE` | `study-tools.controller.ts:31-62` expoe `GET /api/study-areas/:id/study-tools` protegido por `SessionGuard`; `apiClient.ts:1103-1110` consome `listStudyTools(studyAreaId, type?)`. |
| Nao cria IA, endpoint, schema ou persistencia novos | `CUMPRE` | Implementacao BK14 adiciona apenas estado local e painel web; backend existente mantem `generateStudyTool(...)` e `listTools(...)`; pesquisa estatica nao encontrou storage local novo nos ficheiros BK14. |
| Ownership e autorizacao ficam no backend | `CUMPRE` | `StudyToolsController.list(...)` usa `request.user!.id` em `study-tools.controller.ts:55-62`; `StudyToolsService.listTools(...)` valida `areasService.getMyStudyArea(userId, studyAreaId)` antes de consultar artefactos em `study-tools.service.ts:88-101`. |
| `AiArtifact` suporta flashcards sem novo schema | `CUMPRE` | `ai-artifact.schema.ts:14` inclui `FLASHCARDS`; `:22-45` guarda `userId`, `studyAreaId`, `type`, `contentJson` e `sourcesJson`. |
| Cliente e pagina carregam artefactos filtrados | `CUMPRE` | `StudyToolsPage.tsx:56-62` chama `listStudyTools`; `:230-255` renderiza `FlashcardsPanel` para tipo `FLASHCARDS`. |
| Estado local esta isolado e testavel | `CUMPRE` | `flashcard-practice.ts:22-31` cria estado inicial; `:39-46` revela resposta; `:55-76` avanca/termina; `:85-95` alterna modo; `:103-107` recomeca. |
| Modo exercicio esconde resposta por defeito | `CUMPRE` | `createFlashcardPracticeState()` inicia `answerVisible=false` em `flashcard-practice.ts:22-31`; `FlashcardsPanel.tsx:175-181` mostra resposta escondida ate acao explicita. |
| Modo revisao mantem resposta visivel | `CUMPRE` | `setFlashcardPracticeMode(..., "review")` poe `answerVisible=true` em `flashcard-practice.ts:85-95`; teste cobre o comportamento em `mf8-flashcards.spec.ts:41-51`. |
| UI permite revelar, avancar, concluir e recomecar | `CUMPRE` | `FlashcardsPanel.tsx:191-217` cobre revelar/seguinte/concluir; `:140-155` cobre estado concluido e recomeco. |
| Artefacto vazio ou invalido nao quebra a UI | `CUMPRE` | `readFlashcards(...)` valida `contentJson.cards` em `FlashcardsPanel.tsx:36-54`; estado vazio renderiza mensagem segura em `:77-85`. |
| Fontes continuam associadas aos cards | `CUMPRE` | `FlashcardsPanel.tsx:184-188` passa `sourceMaterialIds` e `sourcesJson` para `ArtifactSources`, que filtra fontes conhecidas. |
| Playwright cobre estado local e fluxo UI | `CUMPRE` | `mf8-flashcards.spec.ts:29-39` cobre esconder/revelar/concluir; `:41-51` cobre revisao; `:53-124` cobre login, artefacto, resposta escondida, revelar, avancar e concluir na UI. |
| Handoff para BK seguinte preservado | `CUMPRE` | `BK-MF8-15` continua a depender do inventario/testes, sem exigir alteracao de contrato dos flashcards. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-14` | `RF12` | `real_dev/api/src/modules/ai/study-tools.controller.ts`, `study-tools.service.ts`, `ai-artifact.schema.ts` | Endpoint e ownership reais para artefactos IA existentes. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/student/StudyToolsPage.tsx` | Cliente tipado e pagina de ferramentas carregam `FLASHCARDS` autorizados. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/features/mf8/flashcard-practice.ts` | Estado local puro para exercicio/revisao, revelacao, avanco e recomeco. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/components/ai/FlashcardsPanel.tsx`, `ArtifactSources.tsx` | UI interativa de flashcards, fontes e estados vazios. |
| `BK-MF8-14` | `RNF41` | `real_dev/web/tests/e2e/mf8-flashcards.spec.ts` | 3 testes Playwright passaram fora da sandbox. |

### Mapa de integracao da MF

- `BK-MF0-12 -> BK-MF8-14`: `COERENTE`. O BK14 consome artefactos `FLASHCARDS` ja persistidos como `AiArtifact`; nao altera geracao, provider IA nem schema.
- `BK-MF8-13 -> BK-MF8-14`: `COERENTE`. Ranking docente e flashcards de estudo sao dominios independentes; o BK14 nao depende de dados de ranking.
- `BK-MF8-14 -> BK-MF8-15`: `COERENTE`. O BK15 pode auditar/inventariar testes sem receber novo endpoint, novo schema ou novo contrato persistido de flashcards.
- `MF6/MF7 -> MF8`: `COERENTE`. Sessao, ownership e modularidade continuam concentrados nos services/controllers existentes.
- Resultado geral de coerencia: `COERENTE_COM_RISCO_P3`, apenas por copy visivel sem acentuacao PT-PT.

### Contratos consumidos

- `AiArtifact` com `type: "FLASHCARDS"`.
- `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`.
- `StudyToolsService.listTools(userId, studyAreaId, type?)`.
- `StudyAreasService.getMyStudyArea(userId, studyAreaId)`.
- Cliente comum `requestJson(...)` com cookies HttpOnly, CSRF marker e `credentials: "include"`.
- `ArtifactSources` para mostrar fontes ja autorizadas.

### Contratos entregues para BKs seguintes

- Helper local `createFlashcardPracticeState(...)`.
- Helper local `revealFlashcardAnswer(...)`.
- Helper local `moveToNextFlashcard(...)`.
- Helper local `setFlashcardPracticeMode(...)`.
- Helper local `restartFlashcardPractice(...)`.
- `FlashcardsPanel` com modos `exercise`/`review`, resposta escondida/revelada, conclusao e fontes.
- Suite `mf8-flashcards.spec.ts`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: 1.

#### P3-BK-MF8-14-01 - Copy visivel sem acentuacao PT-PT

- Estado: `ABERTO`.
- Severidade: `P3`.
- Ficheiros: `real_dev/web/src/components/ai/FlashcardsPanel.tsx`, `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`.
- Evidencia: strings visiveis novas usam texto sem acentos, por exemplo `cartoes validos` em `FlashcardsPanel.tsx:82`, `solucao`/`revisao` em `:106-107`, `Modo exercicio` em `:125`, `Modo revisao` em `:136`, `Sessao concluida`/`Recomeca`/`cartoes` em `:142-144` e `Recomecar` em `:153`; o teste fixa parte dessa copy em `mf8-flashcards.spec.ts:123`.
- Impacto: baixo; nao afeta autorizacao, privacidade, dados, API, fluxo funcional nem testes, mas reduz a qualidade de UX em Portugues de Portugal e fica desalinhado com a acentuacao esperada nos textos visiveis ao aluno.
- Recomendacao: em modo de correcao, atualizar apenas copy visivel e assercoes E2E correspondentes para PT-PT acentuado, preservando nomes de helpers/identificadores tecnicos em ingles.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `mock`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompts privados`, `dados sensiveis` nos ficheiros BK14 e contratos consumidos | `PASS_COM_JUSTIFICACAO` - ocorrencias apenas benignas: credencial de fallback E2E para aluno dev, comentarios/tipos globais de login/password e cookies HttpOnly/CSRF no cliente comum. Nao ha storage local novo, segredo, token exposto, prompt privado, RAG/OCR/chunking ou mock funcional da app. |
| `real_dev` nos guias diretamente ligados ao BK14 (`BK-MF8-13`, `BK-MF8-14`, `BK-MF8-15`) | `PASS` - sem leakage de path privado nos guias publicos. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - relatorios MF8 untracked ja existentes/esperados; nao e finding de implementacao. |
| `git check-ignore -v real_dev` | `PASS` - `.gitignore:2:real_dev/`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/api test -- study-tools.service.spec.ts ai-artifact.validator.spec.ts` | `PASS` - 2 suites, 14 testes. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` | `BLOQUEADO_NA_SANDBOX` - `listen EPERM` ao iniciar `MongoMemoryServer`; classificado como bloqueio ambiental. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` fora da sandbox | `PASS` - 3 testes Playwright. |
| `git diff --check` | `PASS`. |
| `rg -n '[ \t]+$' docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS` - sem whitespace final no relatorio untracked. |

### Ficheiros re-auditados

- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-inventario-e-testes-da-mf8.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai/study-tools.service.ts`
- `real_dev/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`
- `real_dev/web/src/features/mf8/flashcard-practice.ts`
- `real_dev/web/src/components/ai/FlashcardsPanel.tsx`
- `real_dev/web/src/components/ai/ArtifactSources.tsx`
- `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo.

### Blockers e TODOs

- Blockers de implementacao: nenhum.
- TODOs obrigatorios de codigo: nenhum.
- Findings bloqueantes: nenhum.
- Finding residual: `P3-BK-MF8-14-01`.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Corrigir o `P3` de copy PT-PT quando houver permissao de correcao, ou avancar para auditoria/implementacao de `BK-MF8-15` se o criterio operacional aceitar este risco residual nao funcional.

## Auditoria atual - BK-MF8-13

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-13`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria fresca ao `BK-MF8-13 - Rankings dos mini-testes oficiais` em `real_dev/api` e `real_dev/web`. A implementacao cumpre o contrato funcional e de seguranca do BK: consome `OfficialTestAttempt` do `BK-MF8-12`, valida professor antes de qualquer leitura sensivel, confirma ownership docente da disciplina, filtra ranking por `testId`, `subjectId` e `classId`, devolve dados minimizados, expoe endpoint HTTP real, fornece cliente frontend tipado, pagina React com estados completos, rota protegida e teste Jest focado para negativos principais. O resultado fica `PASS_COM_RISCOS` apenas porque nao foi executado smoke manual/browser com conta real de professor.

### Escopo auditado

- BK alvo: `BK-MF8-13`.
- Contexto de coerencia: `BK-MF8-12` como fornecedor de `OfficialTestAttempt`; `BK-MF8-14` como BK seguinte e independente do ranking.
- Requisitos canonicos: `RF28`, `RF30`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`.
- `real_dev/` esta ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev real_dev/api real_dev/web` e nao classificado como finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-13` | `RF28, RF30` | `PASS_COM_RISCOS` | Cumpre ranking docente, minimizacao de dados, ownership backend, endpoint, cliente API, pagina React, rota e testes focados. Risco residual: falta smoke manual/browser com conta real de professor. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md:89` | `RF28` define criacao de testes/mini-testes oficiais. |
| `docs/RF.md:91` | `RF30` define progresso, dificuldades e metricas da turma. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md:119` | `BK-MF8-13`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforco `S`, dependencia `BK-MF8-12`, requisitos `RF28, RF30`, sprint `S12`, proximo BK `BK-MF8-14`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md:138` | Confirma a mesma linha canonica e continuidade da MF8. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:137` | Confirma dependencia `BK-MF8-12`, requisitos `RF28, RF30` e proximo BK `BK-MF8-14`. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` | Exige ranking docente, endpoint `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`, cliente API, pagina React, testes e minimizacao de dados. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Consome tentativa oficial do `BK-MF8-12` | `CUMPRE` | `official-test-attempt.schema.ts:25-62` persiste `testId`, `subjectId`, `classId`, `studentId`, score, `results` e `answeredAt`; `official-test-ranking.service.ts:10-16` injeta `OfficialTest` e `OfficialTestAttempt`. |
| Ranking devolve dados minimizados | `CUMPRE` | `official-test-ranking.service.ts:32-40` define linha publica sem `results` nem email; `:73-83` devolve `studentRef`, `displayName`, score e data. |
| Ordenacao por pontuacao e empate por data | `CUMPRE` | `official-test-ranking.service.ts:58-84` ordena por `percentage` desc e `answeredAt` asc. |
| Professor e ownership sao validados antes das tentativas | `CUMPRE` | `official-test-ranking.service.ts:120-124` chama `assertTeacher(...)` e `SubjectsService.findOwnedSubject(...)` antes de consultar teste/tentativas; `subjects.service.ts:145-157` filtra `_id` e `teacherId`. |
| Teste pertence a disciplina validada | `CUMPRE` | `official-test-ranking.service.ts:125-134` valida ObjectId e procura o teste por `_id` e `subjectId`; erro publico `OFFICIAL_TEST_NOT_FOUND` fica em `:173-178`. |
| Tentativas sao filtradas por teste, disciplina e turma | `CUMPRE` | `official-test-ranking.service.ts:136-143` consulta `attemptModel.find({ testId, subjectId, classId })` e ordena na query. |
| Endpoint HTTP existe e esta protegido por sessao | `CUMPRE` | `official-tests.controller.ts:15-16` aplica `SessionGuard`; `:69-80` expoe `GET teacher/subjects/:subjectId/tests/:testId/ranking` e delega no service. |
| Provider de ranking esta registado no modulo | `CUMPRE` | `official-tests.module.ts:20-31` regista `OfficialTestAttempt`, `OfficialTestRankingService` em `providers` e `exports`. |
| Cliente API tipado chama endpoint real com cookies | `CUMPRE` | `apiClient.ts:478-495` define tipos de ranking; `:631-644` centraliza `credentials: "include"` e CSRF; `:1868-1875` chama `/api/teacher/subjects/:subjectId/tests/:testId/ranking`. |
| Pagina React cobre loading, erro, vazio e sucesso | `CUMPRE` | `OfficialTestRankingPage.tsx:32-62` carrega dados sem decidir permissoes; `:64-89` cobre loading/erro/vazio; `:92-131` renderiza tabela de sucesso. |
| Tabela tem estrutura acessivel basica | `CUMPRE` | `OfficialTestRankingPage.tsx:102-129` inclui `caption`, `th scope="col"` e linhas por tentativa. |
| Rota protegida e entrada pela pagina docente existem | `CUMPRE` | `protectedRoutes.tsx:18` importa a pagina; `:143-150` resolve `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`; `TeacherOfficialTestsPage.tsx:77-82` adiciona link "Ver ranking". |
| Negativos principais estao testados | `CUMPRE` | `official-test-ranking.service.spec.ts:25-41` testa ordenacao e ausencia de `results`/email; `:45-54` bloqueia aluno antes de queries; `:56-70` bloqueia professor sem ownership; `:96-106` bloqueia teste inexistente antes de listar tentativas. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts` | Service valida professor, ownership docente, teste da disciplina e tentativas filtradas por teste/disciplina/turma. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-tests.controller.ts` | Endpoint docente protegido por `SessionGuard`. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-tests.module.ts` | Provider e schema registados no modulo real. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/web/src/lib/apiClient.ts` | Tipos e funcao `getOfficialTestRanking(...)` com `requestJson(...)`. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/web/src/pages/teacher/OfficialTestRankingPage.tsx`, `real_dev/web/src/routes/protectedRoutes.tsx`, `TeacherOfficialTestsPage.tsx` | UI real, link de entrada e rota protegida. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-test-ranking.service.spec.ts` | 5 testes focados: ordenacao/empate, role errada, ownership, teste inexistente e minimizacao. |

### Mapa de integracao da MF

- `BK-MF8-12 -> BK-MF8-13`: `COERENTE`. `OfficialTestAttempt` fornece os campos que o ranking consome; o BK13 nao altera a submissao de aluno.
- `BK-MF8-13 -> BK-MF8-14`: `COERENTE`. `BK-MF8-14` trabalha flashcards e nao depende de ranking publico, analytics avancado ou dashboard preditivo.
- `MF2 -> MF8`: `COERENTE`. O teste oficial continua a ser `OfficialTest`; o BK13 consulta resultados por teste existente.
- `MF6 -> MF8`: `COERENTE`. Role, ownership, `subjectId` e `classId` sao validados no backend; o frontend nao decide permissoes.
- `MF7 -> MF8`: `COERENTE`. O dominio `official-tests` preserva organizacao modular e compila na API e na web.
- Resultado geral de coerencia: `COERENTE_COM_RISCOS`, apenas por falta de smoke manual/browser.

### Contratos consumidos

- `OfficialTest` e `OfficialTestAttempt` do dominio `official-tests`.
- `SubjectsService.findOwnedSubject(teacherId, subjectId)`.
- `SessionGuard` e `AuthenticatedRequest.user`.
- Cliente comum `requestJson(...)` com cookies HttpOnly, CSRF marker e `credentials: "include"`.
- Pagina docente existente de testes oficiais.

### Contratos entregues para BKs seguintes

- `OfficialTestRankingService`.
- `buildOfficialTestRanking(...)`.
- `OfficialTestRankingView` e `OfficialTestRankingRow`.
- `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- Tipos frontend `OfficialTestRanking` e `OfficialTestRankingRow`.
- Funcao frontend `getOfficialTestRanking(subjectId, testId)`.
- Pagina `OfficialTestRankingPage`.
- Rota `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`.
- Suite `official-test-ranking.service.spec.ts`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum finding de codigo. Risco residual de validacao manual/browser registado em `Blockers e TODOs`.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embedding`, `OCR`, `chunking`, `prompt privado`, `dados pessoais`, `console.log`, `logger.`, `secret`, `apiKey`, `private key`, `token`, `password`, `cookie` nos ficheiros BK13 | `PASS_COM_JUSTIFICACAO` - ocorrencias apenas benignas no cliente comum: `passwordHash` em comentario, cookies HttpOnly/CSRF e tipos de login/password; nada introduz storage local, segredo, log sensivel ou claim proibido no fluxo BK13. |
| `studentId`, `classId`, `teacherId`, `role`, `membership`, `owner`, `correctOptionIndex`, `results`, `selectedOptionIndexes`, `email` na superficie BK13 | `PASS_COM_JUSTIFICACAO` - ocorrencias esperadas em filtros backend, tipos globais e testes; o ranking publico nao devolve `results` nem email e a suite confirma essa ausencia. |
| `real_dev` nos guias diretamente ligados ao BK13 | `PASS` - sem leakage em `BK-MF8-12`, `BK-MF8-13` e `BK-MF8-14`. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - mostra relatorios MF8 untracked; nao e finding. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `.gitignore:2:real_dev/`. |
| `npm --prefix real_dev/api test -- official-test-ranking` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 128 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 94 suites, 397 testes. |
| `git diff --check` | `PASS`. |

### Ficheiros re-auditados

- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts`
- `real_dev/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
- `real_dev/api/src/modules/official-tests/official-tests.controller.ts`
- `real_dev/api/src/modules/official-tests/official-tests.module.ts`
- `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/teacher/OfficialTestRankingPage.tsx`
- `real_dev/web/src/pages/teacher/TeacherOfficialTestsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo.

### Blockers e TODOs

- Blockers de implementacao: nenhum.
- TODOs obrigatorios de codigo: nenhum.
- Risco residual: falta smoke manual/browser com professor real a abrir `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar smoke manual posterior com professor autenticado a abrir um mini-teste publicado e consultar o ranking; em alternativa, avancar para `BK-MF8-14`, mantendo este risco como lacuna de evidence manual e nao como finding de implementacao.

## Re-auditoria atual - BK-MF8-12

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- Pedido do utilizador: re-auditar
- Modo executado: `auditar_implementacao` / audit-only, por pedido explicito de re-auditoria.
- Nota de routing: a prompt anexada mantinha `MODO: implementar`, mas esta execucao foi tratada como re-auditoria porque o pedido mais recente do utilizador foi "Podes re-auditar por favor?". Nao houve alteracao de codigo.
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta re-auditoria`: `BK-MF8-12`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico atualizado.

Re-auditoria fresca ao `BK-MF8-12 - Realizacao de mini-testes oficiais por aluno` em `real_dev/api` e `real_dev/web`. A implementacao continua a cumprir o contrato funcional e de seguranca do BK: usa os testes oficiais de `BK-MF2-04`, cria tentativas separadas em `OfficialTestAttempt`, lista ao aluno apenas testes `PUBLISHED` de disciplinas onde esta inscrito, nao expoe `correctOptionIndex` antes da submissao, calcula pontuacao no backend, persiste `studentId` a partir da sessao, liga a UI a endpoints reais e inclui testes focados para os negativos principais. O resultado mantem `PASS_COM_RISCOS` apenas pela falta de smoke manual/browser com contas reais de professor e aluno.

### Escopo re-auditado

- BK alvo: `BK-MF8-12`.
- Contexto de coerencia: `BK-MF2-04` como fornecedor de `OfficialTest`, `BK-MF8-11` como BK anterior imediato e `BK-MF8-13` como consumidor de `OfficialTestAttempt`.
- Requisito canonico: `RF28`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`.
- `real_dev/` esta ignorado por `.gitignore`; confirmado por `git check-ignore -v real_dev` e nao classificado como finding.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-12` | `RF28` | `PASS_COM_RISCOS` | Cumpre listagem segura de testes publicados, submissao por aluno inscrito, pontuacao backend, persistencia separada, UI real e testes focados. Risco residual: falta smoke manual/browser com contas reais. |

### Requisitos re-auditados

| Requisito | Estado | Evidencia nova desta re-auditoria |
| --- | --- | --- |
| DTO limitado a respostas escolhidas | `CUMPRE` | `real_dev/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts:9-16` valida `selectedOptionIndexes` como array de 1 a 60 inteiros entre 0 e 3. |
| Tentativa persistida separada do teste oficial | `CUMPRE` | `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts:25-62` cria `official_test_attempts` com `testId`, `subjectId`, `classId`, `studentId`, score, resultados e indices. |
| Pontuacao calculada no backend | `CUMPRE` | `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts:24-47` compara respostas do aluno com `correctOptionIndex` oficial e calcula percentagem. |
| Listagem discente valida role e inscricao | `CUMPRE` | `real_dev/api/src/modules/official-tests/official-tests.service.ts:164-180` exige `STUDENT`, usa `findSubjectForStudent(...)` e filtra `status: "PUBLISHED"`; `subjects.service.ts:167-179` valida inscricao com `ensureStudentEnrollment(...)`. |
| Submissao valida role, disciplina, teste publicado e numero de respostas | `CUMPRE` | `official-tests.service.ts:192-239` exige aluno, ObjectId valido, disciplina por inscricao, teste publicado e contagem de respostas igual ao numero de perguntas antes de persistir. |
| Resposta correta nao e exposta antes da submissao | `CUMPRE` | `OfficialTestStudentQuestionView` omite `correctOptionIndex`; `official-tests.service.ts:354-375` devolve ao aluno apenas `statement`, `topic` e `options`. |
| Endpoints protegidos por sessao | `CUMPRE` | `official-tests.controller.ts:14-15` aplica `SessionGuard`; `:63-68` expoe listagem discente; `:80-92` expoe submissao de tentativa. |
| Modulo registado na API real | `CUMPRE` | `official-tests.module.ts:21-32` regista `OfficialTest` e `OfficialTestAttempt`; `mf2.module.ts:14-25` importa `OfficialTestsModule`; `app.module.ts:72-97` importa `Mf2Module`. |
| Cliente frontend usa endpoints reais com cookies | `CUMPRE` | `apiClient.ts:608-625` centraliza `credentials: "include"` e CSRF; `:1844-1872` chama `GET /api/student/subjects/:subjectId/tests` e `POST /api/student/subjects/:subjectId/tests/:testId/attempts`. |
| UI discente tem loading, empty, error, submit e resultado | `CUMPRE` | `OfficialTestAttemptPage.tsx:37-64`, `:143-153` e `:179-237` cobrem carregamento, vazio, erro, radios, submissao e resultado backend. |
| UI nao calcula pontuacao nem envia identidade/permissao | `CUMPRE` | `OfficialTestAttemptPage.tsx:91-123` envia apenas `selectedOptionIndexes`; `:193` mostra `correctOptionIndex` so depois de existir `attempt`; `:227-228` mostra score vindo do backend. |
| Rota esta navegavel | `CUMPRE` | `protectedRoutes.tsx:37` importa a pagina; `:102-104` resolve `/app/disciplinas/:subjectId/testes`; `StudentClassSubjectsPage.tsx:41-44` expoe link "Mini-testes". |
| Testes negativos principais existem | `CUMPRE` | `official-tests.service.spec.ts:82-109` cobre listagem segura e role errado; `:112-145` cobre pontuacao e persistencia; `:147-165` cobre teste em rascunho/fora de ambito e respostas incompletas. |
| Handoff para ranking futuro | `CUMPRE` | `OfficialTestAttemptView` em `official-tests.service.ts:68-80` e schema `OfficialTestAttempt` entregam os campos consumidos por `BK-MF8-13`. |

### Coerencia entre MFs

- `BK-MF2-04 -> BK-MF8-12`: `COERENTE`. O BK12 consome `OfficialTest` sem alterar a criacao/listagem docente.
- `BK-MF8-11 -> BK-MF8-12`: `COERENTE`. O fluxo de mini-testes oficiais nao reutiliza permissao nem historico de IA da sala.
- `BK-MF8-12 -> BK-MF8-13`: `COERENTE`. `OfficialTestAttempt` entrega `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`.
- Resultado de coerencia: `COERENTE_COM_RISCOS`, apenas por falta de smoke manual/browser com contas reais.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, claims de `RAG`/`embedding`/`OCR`/`chunking`, segredos, tokens, cookies, passwords, mocks/placeholders nos ficheiros BK12 | `PASS_COM_JUSTIFICACAO` - ocorrencias relevantes sao benignas: comentarios/tipos globais no cliente comum e mocks Jest dentro de `official-tests.service.spec.ts`; nenhum storage local de token, segredo, log sensivel ou placeholder como solucao final. |
| `studentId`, `classId`, `teacherId`, `role`, `membership`, `owner`, `correctOptionIndex`, `selectedOptionIndexes`, score na UI/cliente | `PASS_COM_JUSTIFICACAO` - ocorrencias em tipos globais do cliente e resultado pos-submissao; a pagina BK12 envia apenas `selectedOptionIndexes` e mostra correcao/pontuacao apenas apos resposta backend. |
| Contratos `OfficialTestAttempt`, `submitOfficialTestAttempt`, `listStudentOfficialTests`, `/api/student/subjects`, `official_test_attempts`, `scoreOfficialTestAttempt` | `PASS` - contratos encontrados em backend, schema, service, controller, cliente API, rota e pagina. |
| `real_dev` nos guias publicos diretamente ligados ao BK12 | `PASS` - sem leakage encontrado nos guias BK-MF8-12, BK-MF8-13 e BK-MF2-04. |

### Comandos executados nesta re-auditoria

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - mostra relatorios MF8 untracked; nao e finding. |
| `git check-ignore -v real_dev` | `PASS` - `.gitignore:2:real_dev/`. |
| `npm --prefix real_dev/api test -- official-tests.service.spec.ts` | `PASS` - 1 suite, 9 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 127 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 93 suites, 392 testes. |
| Pesquisas estaticas obrigatorias nos ficheiros BK12 | `PASS_COM_JUSTIFICACAO` - falsos positivos justificados; sem finding novo. |

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Ficheiros re-auditados

- `real_dev/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
- `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts`
- `real_dev/api/src/modules/official-tests/official-tests.module.ts`
- `real_dev/api/src/modules/official-tests/official-tests.controller.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/api/src/modules/mf2/mf2.module.ts`
- `real_dev/api/src/app.module.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/OfficialTestAttemptPage.tsx`
- `real_dev/web/src/pages/student/StudentClassSubjectsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`

### Ficheiros alterados por esta re-auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo.

### Blockers e TODOs

- Blockers de implementacao: nenhum.
- TODOs obrigatorios de codigo: nenhum.
- Risco residual: falta smoke manual/browser com contas reais de professor e aluno.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar smoke manual posterior com professor a criar/publicar mini-teste e aluno inscrito a abrir `/app/disciplinas/:subjectId/testes`, submeter respostas e receber pontuacao; em alternativa, avancar para `BK-MF8-13`, que pode consumir `OfficialTestAttempt`.

## Execucao atual - BK-MF8-12

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-12`
- `Resultado`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-12 - Realizacao de mini-testes oficiais por aluno` em `real_dev/api` e `real_dev/web`. A implementacao cumpre o contrato funcional e de seguranca do BK: reaproveita `OfficialTest` de `BK-MF2-04`, cria `OfficialTestAttempt` separado, lista ao aluno apenas testes `PUBLISHED` de disciplina onde esta inscrito, oculta `correctOptionIndex` antes da submissao, calcula pontuacao no backend, persiste a tentativa com `studentId` vindo da sessao, liga a UI a endpoints reais e entrega testes negativos focados. O resultado fica `PASS_COM_RISCOS` apenas porque nao foi executado smoke manual/browser com conta real de professor/aluno; testes e builds automatizados passaram.

### Escopo auditado

- BK alvo: `BK-MF8-12`.
- Contexto lido para coerencia: `BK-MF2-04` como fornecedor de testes oficiais, `BK-MF8-11` como BK anterior na MF8 e `BK-MF8-13` como consumidor de tentativas oficiais.
- Requisito canonico lido: `RF28`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos/tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-12` | `RF28` | `PASS_COM_RISCOS` | Implementacao cumpre listagem segura de testes publicados, submissao por aluno inscrito, pontuacao backend, persistencia separada, UI real e testes focados. Risco residual: falta smoke manual/browser com contas reais. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md` | `RF28` define criacao de testes/mini-testes oficiais; a nota de quizzes/testes indica que apenas alunos inscritos acedem a conteudo oficial. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-12`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforco `M`, dependencia `BK-MF2-04`, requisito `RF28`, sprint `S12`, `Reforco`, proximo BK `BK-MF8-13`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a mesma linha canonica e a continuidade `BK-MF8-11 -> BK-MF8-12 -> BK-MF8-13`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma campos obrigatorios do BK12, incluindo dependencia, requisito e proximo BK. |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-12` entre `BK-MF8-11` e `BK-MF8-13`; MF2 lista `BK-MF2-04` como contrato anterior. |
| `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md` | Scope-out exclui realizacao pelo aluno e correcao automatica; BK12 fecha essa lacuna sem alterar a criacao docente. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md` | Exige listagem `PUBLISHED`, submissao `POST /api/student/subjects/:subjectId/tests/:testId/attempts`, inscricao backend, pontuacao backend, tentativa separada, UI e negativos focados. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md` | Declara que rankings consomem `OfficialTestAttempt` com `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| DTO recebe apenas respostas escolhidas | `CUMPRE` | `submit-official-test-attempt.dto.ts:9-16` valida `selectedOptionIndexes` como array de 1 a 60 inteiros entre 0 e 3; nao recebe `studentId`, `classId`, role ou pontuacao. |
| Schema persiste tentativa separada do teste oficial | `CUMPRE` | `official-test-attempt.schema.ts:25-62` define `official_test_attempts` com `testId`, `subjectId`, `classId`, `studentId`, respostas, pontuacao, resultados e indices para ranking futuro. |
| Modulo regista o novo schema sem entidade paralela indevida | `CUMPRE` | `official-tests.module.ts:10-25` regista `OfficialTestAttempt` junto de `OfficialTest` no mesmo dominio `official-tests`. |
| Listagem do aluno valida role e inscricao | `CUMPRE` | `official-tests.service.ts:164-180` chama `assertStudent(actor)` e `SubjectsService.findSubjectForStudent(actor.id, subjectId)` antes de listar testes `PUBLISHED`; `subjects.service.ts:167-179` valida a inscricao via `ensureStudentEnrollment(...)`. |
| Listagem do aluno oculta respostas corretas | `CUMPRE` | `OfficialTestStudentQuestionView` omite `correctOptionIndex` em `official-tests.service.ts:44-63`; `toStudentView(...)` devolve apenas `statement`, `topic` e `options` em `:348-375`. |
| Submissao usa teste publicado e bloqueia rascunhos | `CUMPRE` | `official-tests.service.ts:192-213` exige role de aluno, ObjectId valido, disciplina por inscricao e `status: "PUBLISHED"`; ausencia/rascunho devolve erro publico `OFFICIAL_TEST_NOT_FOUND` em `:306-315`. |
| Pontuacao e persistencia ficam no backend | `CUMPRE` | `official-test-attempt-scoring.ts:24-47` calcula score por pergunta; `official-tests.service.ts:221-239` persiste resultado com `studentId` da sessao, `subjectId`, `classId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`. |
| Respostas incompletas falham antes de persistir | `CUMPRE` | `official-tests.service.ts:213-219` rejeita contagem de respostas diferente do numero de perguntas com `OFFICIAL_TEST_ANSWER_COUNT_MISMATCH`. |
| Controller expoe endpoints discentes protegidos | `CUMPRE` | `official-tests.controller.ts:14-15` aplica `SessionGuard`; `:63-68` expõe `GET /api/student/subjects/:subjectId/tests`; `:80-92` expõe `POST /api/student/subjects/:subjectId/tests/:testId/attempts`. |
| Endpoints docentes existentes foram preservados | `CUMPRE` | `official-tests.controller.ts:32-53` preserva `POST/GET /api/teacher/subjects/:subjectId/tests`; `official-tests.service.ts:109-154` mantem criacao/listagem docente. |
| Cliente frontend usa endpoints reais e cookies de sessao | `CUMPRE` | `apiClient.ts:430-473` tipa vista de aluno e tentativa; `:1844-1872` chama endpoints reais via `requestJson(...)`, que centraliza `credentials: "include"` e CSRF. |
| UI mostra loading, vazio, erro, submissao e resultado | `CUMPRE` | `OfficialTestAttemptPage.tsx:37-64` carrega testes com erro/loading; `:143-153` mostra loading/vazio; `:179-237` renderiza perguntas, radios, botao de submissao e resultado. |
| UI nao calcula pontuacao nem mostra correcao antes do backend | `CUMPRE` | `OfficialTestAttemptPage.tsx:91-123` envia apenas `selectedOptionIndexes`; `:186-193` so consulta `result.correctOptionIndex` quando existe `attempt` devolvido pelo backend; `:225-229` mostra a pontuacao backend. |
| Rota do aluno esta navegavel | `CUMPRE` | `protectedRoutes.tsx:37` importa a pagina; `:102-104` resolve `/app/disciplinas/:subjectId/testes`; `StudentClassSubjectsPage.tsx:41-44` adiciona link "Mini-testes". |
| Testes cobrem negativos principais | `CUMPRE` | `official-tests.service.spec.ts:82-109` cobre listagem segura e role errado; `:112-145` cobre pontuacao e persistencia; `:147-165` cobre teste nao publicado/fora do ambito e respostas incompletas. |
| Handoff para ranking futuro existe | `CUMPRE` | `OfficialTestAttemptView` em `official-tests.service.ts:68-80` e schema em `official-test-attempt.schema.ts:25-62` entregam os campos declarados por `BK-MF8-13`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-12` | `RF28` | `submit-official-test-attempt.dto.ts`, `official-test-attempt.schema.ts`, `official-test-attempt-scoring.ts` | DTO limitado, tentativa separada e pontuacao backend. |
| `BK-MF8-12` | `RF28` | `official-tests.service.ts`, `subjects.service.ts` | Inscricao validada antes de listar/submeter; `studentId` vem da sessao. |
| `BK-MF8-12` | `RF28` | `official-tests.controller.ts` | Endpoints discentes protegidos por `SessionGuard`. |
| `BK-MF8-12` | `RF28` | `apiClient.ts`, `OfficialTestAttemptPage.tsx`, `protectedRoutes.tsx`, `StudentClassSubjectsPage.tsx` | UI real chama endpoints tipados, mostra estados e resultado. |
| `BK-MF8-12` | `RF28` | `official-tests.service.spec.ts` | 9 testes focados, incluindo listagem segura, role errado, DRAFT/fora do ambito, respostas incompletas e pontuacao persistida. |

### Mapa de integracao da MF

- `BK-MF2-04 -> BK-MF8-12`: `COERENTE`. O BK12 consome `OfficialTest`, `OfficialTestsModule`, `OfficialTestsService` e `SubjectsService.findSubjectForStudent(...)` sem alterar criacao/listagem docente.
- `BK-MF8-11 -> BK-MF8-12`: `COERENTE`. Mini-testes oficiais nao reutilizam permissoes nem dados de chat/IA da sala; a sequencia MF8 avanca para avaliacao oficial.
- `BK-MF8-12 -> BK-MF8-13`: `COERENTE`. `OfficialTestAttempt` entrega campos necessarios para ranking docente, incluindo pontuacao, turma, aluno e data.
- `MF6 -> MF8`: `COERENTE`. Identidade, role, inscricao e autorizacao ficam no backend; frontend nao envia `studentId`, role, membership ou pontuacao.
- `MF7 -> MF8`: `COERENTE`. O dominio `official-tests` mantem DTO/schema/service/controller, tipos frontend e builds verdes.
- Resultado geral de coerencia: `COERENTE_COM_RISCOS` pela falta de smoke manual/browser.

### Contratos consumidos

- `OfficialTest` e `OfficialTestQuestion` do contrato docente `BK-MF2-04`.
- `SubjectsService.findSubjectForStudent(studentId, subjectId)`.
- `ClassesService.ensureStudentEnrollment(...)` via `SubjectsService`.
- `SessionGuard` e `AuthenticatedRequest.user`.
- Cliente comum `requestJson(...)` com cookies HttpOnly, CSRF marker e `credentials: "include"`.

### Contratos entregues para BKs seguintes

- `SubmitOfficialTestAttemptDto`.
- `OfficialTestAttempt`, `OfficialTestAttemptSchema`, `OfficialTestAttemptQuestionResult`.
- `scoreOfficialTestAttempt(...)`.
- `OfficialTestsService.listPublishedForStudent(...)`.
- `OfficialTestsService.submitAttempt(...)`.
- `GET /api/student/subjects/:subjectId/tests`.
- `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.
- Tipos frontend `StudentOfficialTest`, `OfficialTestAttempt` e `OfficialTestAttemptQuestionResult`.
- Funcoes frontend `listStudentOfficialTests(...)` e `submitOfficialTestAttempt(...)`.
- Pagina `OfficialTestAttemptPage` e rota `/app/disciplinas/:subjectId/testes`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embedding`, `OCR`, `chunking`, `prompt privado`, `dados pessoais`, `console.log`, `logger.`, `secret`, `apiKey`, `private key`, `token`, `password`, `cookie` nos ficheiros auditados | `PASS_COM_JUSTIFICACAO` - ocorrencias apenas benignas no cliente comum: comentario `passwordHash`, cookies HttpOnly/CSRF e tipos existentes de login/password; nenhuma ocorrencia introduz storage local, segredo, log ou claim proibido no fluxo BK12. |
| `studentId`, `classId`, `teacherId`, `role`, `membership`, `owner`, `correctOptionIndex` na UI/cliente | `PASS_COM_JUSTIFICACAO` - ocorrencias benignas em tipos globais e no resultado pos-submissao; `OfficialTestAttemptPage` envia apenas `selectedOptionIndexes` e so mostra `correctOptionIndex` depois de receber `attempt`. |
| `OfficialTestAttempt`, `submitOfficialTestAttempt`, `listStudentOfficialTests`, `/api/student/subjects`, `official_test_attempts`, `scoreOfficialTestAttempt` | `PASS` - contratos esperados encontrados em backend, cliente frontend, rota e pagina. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- official-tests.service.spec.ts` | `PASS` - 1 suite, 9 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 127 modulos. |
| `npm --prefix real_dev/api test` | `PASS` - 93 suites, 392 testes. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos, tokens e logging nos ficheiros BK12 | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos benignos no cliente comum. |
| Pesquisa estatica de campos sensiveis enviados pela UI | `PASS_COM_JUSTIFICACAO` - apenas tipos globais e resultado pos-submissao; chamadas BK12 enviam `selectedOptionIndexes`. |
| `git diff --check` | `PASS`. |

### Ficheiros auditados

- `real_dev/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
- `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts`
- `real_dev/api/src/modules/official-tests/official-tests.module.ts`
- `real_dev/api/src/modules/official-tests/official-tests.controller.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts`
- `real_dev/api/src/modules/official-tests/schemas/official-test.schema.ts`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/api/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/OfficialTestAttemptPage.tsx`
- `real_dev/web/src/pages/student/StudentClassSubjectsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-12`.
- TODOs obrigatorios de codigo: nenhum.
- Validacao manual browser com conta real de professor/aluno: nao executada nesta auditoria; coberta parcialmente por leitura do service/controller/UI, testes unitarios focados, suite API completa e build web.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Avancar para `BK-MF8-13` ou executar uma demo manual posterior: professor cria/publica um mini-teste; aluno inscrito abre `/app/disciplinas/:subjectId/testes`, submete respostas, recebe pontuacao; aluno nao inscrito ou teste `DRAFT` nao deve obter tentativa.

---

## Execucao atual - BK-MF8-11

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-11`
- `Resultado`: `PASS_COM_JUSTIFICACAO`
- `Data`: `2026-07-06`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala` em `real_dev/api` e `real_dev/web`. A implementacao cumpre o contrato funcional e de privacidade: reutiliza `RoomAiInteraction`, adiciona `visibility`, `sharedAt` e `forkedFromInteractionId`, expoe `GET /api/study-rooms/:roomId/ai/answers?scope=shared`, expoe `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`, valida membership no backend, so permite `READ_ONLY` para resposta propria, so permite `PRIVATE_FORK` a partir de resposta `SHARED` da mesma sala, cria copia privada sem chamar o provider de IA e liga a UI a funcoes frontend tipadas. A justificacao no resultado vem apenas da validacao manual browser com dois alunos nao ter sido executada nesta auditoria; os testes e builds automatizados passaram.

### Escopo auditado

- BK alvo: `BK-MF8-11`.
- Contexto lido para coerencia: `BK-MF8-10` como fornecedor do historico privado e `BK-MF8-12` como consumidor seguinte da cadeia MF8.
- Requisitos canonicos lidos: `RF16`, `RF42` e `RNF20`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos do tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-11` | `RF16`, `RF42`, `RNF20` | `PASS_COM_JUSTIFICACAO` | Implementacao cumpre partilha read-only, fork privado, autorizacao por membership/ownership no backend, UI real e testes focados. A justificacao e apenas operacional: nao foi executado smoke manual browser com dois alunos reais. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md` | `RF16` define IA partilhada da sala; `RF42` define chat, partilha e notas coletivas. |
| `docs/RNF.md` | `RNF20` exige que a IA nao aceda a dados de outras turmas ou alunos. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-11`, owner `Natalia`, apoio `Guilherme`, prioridade `P1`, esforco `M`, dependencia `BK-MF8-10`, requisitos `RF16, RF42, RNF20`, sprint `S12`, `Core`, proximo BK `BK-MF8-12`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a mesma linha canonica e a duplicacao de resumo para `BK-MF8-11`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma campos obrigatorios do BK11, incluindo dependencia, requisitos e proximo BK. |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-11` entre `BK-MF8-10` e `BK-MF8-12`. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md` | Exige DTO `READ_ONLY`/`PRIVATE_FORK`, campos de visibilidade no schema, service de partilha/fork, endpoint `share`, listagem `scope=shared`, cliente web, UI com estados e testes de ownership/membership/fork. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| DTO limita modos publicos | `CUMPRE` | `real_dev/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts:6-15` define `READ_ONLY` e `PRIVATE_FORK`; `:25-31` rejeita modo fora do contrato. |
| Schema reutiliza `RoomAiInteraction` com visibilidade | `CUMPRE` | `room-ai-interaction.schema.ts:7` define `RoomAiVisibility`; `:34-46` adiciona `visibility`, `sharedAt` e `forkedFromInteractionId`; `:51-53` mantem indices por sala/aluno/visibilidade. |
| Listagem partilhada valida membership antes da query | `CUMPRE` | `room-ai-sharing.service.ts:80-100` converte `roomId`, chama `ensureMember(actor.id, roomId)` e so lista `{ roomId, visibility: "SHARED" }`, ordenado e limitado a 30. |
| Partilha read-only so aceita resposta propria | `CUMPRE` | `room-ai-sharing.service.ts:151-177` faz `findOne` por `_id`, `roomId` e `studentId` do ator autenticado, marca `visibility = "SHARED"` e preserva conteudo. |
| Fork privado so parte de resposta partilhada da mesma sala | `CUMPRE` | `room-ai-sharing.service.ts:187-220` procura `_id`, `roomId` e `visibility: "SHARED"`; cria nova interacao com `studentId` do ator, `visibility: "PRIVATE"` e `forkedFromInteractionId`. |
| Fork nao chama provider de IA nem reprocessa fontes | `CUMPRE` | `RoomAiSharingService` injeta apenas `interactionModel` e `StudyRoomsService` (`room-ai-sharing.service.ts:67-71`); nao injeta `AI_PROVIDER`. O provider continua isolado no POST de pergunta (`room-ai.service.ts:93-157`). |
| Erros evitam enumeracao de respostas alheias | `CUMPRE` | `room-ai-sharing.service.ts:164-166`, `:201-203` e `:280-289` devolvem erro publico comum `ROOM_AI_ANSWER_NOT_FOUND` para ausencia, outra sala, outro aluno ou resposta nao partilhada. |
| Controller expoe GET `scope=shared` e POST `:answerId/share` protegido | `CUMPRE` | `room-ai.controller.ts:25-26` aplica `SessionGuard`; `:47-65` separa `scope=shared` de `scope=mine`; `:93-106` delega partilha/fork para o service. |
| Modulo liga novo service sem dependencia paralela | `CUMPRE` | `study-rooms.module.ts:11-13` importa `RoomAiSharingService`; `:41-47` regista controller e provider no modulo existente. |
| Cliente web tem funcoes tipadas para shared/fork | `CUMPRE` | `apiClient.ts:248-273` tipa modos e resultado; `:1362-1365` lista `scope=shared`; `:1376-1387` chama o endpoint `share` com body `{ mode }`. |
| UI nao envia `studentId`, role, ownership ou membership | `CUMPRE` | `RoomAiPage.tsx:109-129` envia apenas `READ_ONLY` sobre `answer._id`; `:136-157` envia apenas `PRIVATE_FORK` sobre a resposta partilhada escolhida. A autorizacao fica no backend. |
| UI mostra resposta propria, lista partilhada e fork privado | `CUMPRE` | `RoomAiPage.tsx:192-212` mostra resposta atual e botao "Partilhar read-only"; `:215-268` mostra respostas partilhadas, loading/erro/vazio e botao "Guardar copia privada"; `:270-301` mantem historico privado. |
| Testes cobrem fluxos e negativos principais | `CUMPRE` | `room-ai-sharing.service.spec.ts:26-53` lista shared com membership; `:55-75` partilha propria; `:77-103` bloqueia outro aluno/nao membro; `:105-153` valida fork privado e resposta nao partilhada; `:155-166` rejeita modo invalido antes da persistencia. |
| Historico privado de BK10 permanece protegido | `CUMPRE` | `room-ai.service.ts:58-83` continua a listar historico por `roomId` e `studentId` do ator; `room-ai-history.ts:31-58` mantem defesa em profundidade. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-11` | `RF16` | `room-ai.controller.ts`, `room-ai-sharing.service.ts`, `RoomAiPage.tsx` | Listagem de respostas partilhadas e reutilizacao controlada dentro da IA da sala. |
| `BK-MF8-11` | `RF42` | `apiClient.ts`, `RoomAiPage.tsx` | UI e cliente expõem partilha de chat IA e copia privada sem editar o original. |
| `BK-MF8-11` | `RNF20` | `room-ai-sharing.service.ts`, `room-ai.service.ts`, `room-ai-sharing.service.spec.ts` | Membership antes da leitura/escrita, ownership no `READ_ONLY`, `SHARED` obrigatorio no fork e `studentId` vindo da sessao. |

### Mapa de integracao da MF

- `BK-MF8-10 -> BK-MF8-11`: `COERENTE`. O BK11 consome `_id` de interacoes persistidas pelo historico privado e acrescenta partilha/fork sem abrir o historico de outros alunos.
- `BK-MF8-11 -> BK-MF8-12`: `COERENTE`. O BK12 pode avancar para mini-testes oficiais sem herdar chat editavel, comentarios, reacoes, ranking ou voting.
- `MF1 -> MF8`: `COERENTE`. A implementacao reutiliza `RoomAiInteraction`, `StudyRoomsService.ensureMember` e o endpoint base de IA da sala.
- `MF6 -> MF8`: `COERENTE`. Privacidade e autorizacao permanecem no backend; o frontend nao escolhe dono, role ou membership.
- `MF7 -> MF8`: `COERENTE`. Modulos e builds mantem a fronteira API/web sem dependencia nova.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `BK-MF8-10`: historico privado com `_id` de interacao da IA da sala.
- `RoomAiInteraction`: `roomId`, `studentId`, `question`, `answer`, `sourceShareIds`.
- `StudyRoomsService.ensureMember(actor.id, roomId)`.
- `SessionGuard` e `AuthenticatedRequest.user`.
- Cliente comum `requestJson(...)` com cookies HttpOnly, CSRF marker e `credentials: "include"`.

### Contratos entregues para BKs seguintes

- `GET /api/study-rooms/:roomId/ai/answers?scope=shared` devolve respostas `SHARED` da sala apos membership.
- `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` com `READ_ONLY` marca resposta propria como `SHARED`.
- `POST /api/study-rooms/:roomId/ai/answers/:answerId/share` com `PRIVATE_FORK` cria copia privada do aluno autenticado.
- Campos persistidos: `visibility`, `sharedAt`, `forkedFromInteractionId`.
- Funcoes frontend tipadas: `listSharedRoomAiAnswers(...)` e `shareRoomAiAnswer(...)`.
- UI com resposta propria, respostas partilhadas, fork privado, loading, erro, vazio e notice.
- Suite focada `room-ai-sharing.service.spec.ts` com 7 testes.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embedding`, `OCR`, `chunking`, `prompt privado`, `dados pessoais`, `console.log`, `logger.`, `token`, `secret`, `password`, `cookie`, `apiKey` nos ficheiros auditados | `PASS_COM_JUSTIFICACAO` - ocorrencias apenas benignas no cliente comum: comentario `passwordHash`, cookies HttpOnly/CSRF e tipos existentes de login/password; nenhuma ocorrencia introduz segredo, storage local ou exposicao no fluxo BK11. |
| `studentId`, `role`, `memberIds`, `ownerStudentId` na UI/cliente | `PASS_COM_JUSTIFICACAO` - ocorrencias benignas em tipos globais de API; `RoomAiPage.tsx` nao envia `studentId`, role, membership ou ownership nas chamadas BK11. |
| `RoomAiSharingService`, `RoomAiSharedAnswer`, `visibility`, `sharedAt`, `forkedFromInteractionId`, `READ_ONLY`, `PRIVATE_FORK` | `PASS` - contratos esperados encontrados nos ficheiros reais. |
| Metadados e cadeia MF8 nos guias/backlogs | `PASS` - confirmado BK10 -> BK11 -> BK12 e requisitos `RF16, RF42, RNF20`. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- room-ai-sharing.service.spec.ts` | `PASS` - 1 suite, 7 testes. |
| `npm --prefix real_dev/api test -- room-ai-history.spec.ts room-ai.service.spec.ts` | `PASS` - 2 suites, 10 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 93 suites, 387 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 126 modulos. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos, tokens e logging nos ficheiros BK11 | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos benignos no cliente comum. |
| Pesquisa estatica de campos sensiveis enviados pela UI | `PASS_COM_JUSTIFICACAO` - apenas tipos globais; chamadas BK11 enviam `mode`. |
| `git diff --check` | `PASS`. |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - apenas relatorios untracked ja esperados: `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `IMPLEMENTACAO-REAL_DEV-MF8.md`. |

### Ficheiros auditados

- `real_dev/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/study-rooms.module.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/api/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-11`.
- TODOs obrigatorios de codigo: nenhum.
- Validacao manual browser com dois alunos reais: nao executada nesta auditoria; coberta parcialmente por leitura do service/controller/UI, testes unitarios focados, suite API completa e build web.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Avancar para `BK-MF8-12` ou executar uma demo manual posterior com dois alunos na mesma sala: aluno A cria resposta e partilha `READ_ONLY`; aluno B lista `scope=shared`, guarda `PRIVATE_FORK`; confirmar que o original fica `SHARED` e a copia entra no historico privado do aluno B sem chamada ao provider.

---

## Execucao atual - BK-MF8-10

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-10`
- `Resultado`: `PASS_COM_JUSTIFICACAO`
- `Data`: `2026-07-05`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-10 - Historico privado dos chats IA da sala` em `real_dev/api` e `real_dev/web`. A implementacao cumpre o contrato funcional e de privacidade: o historico e listado por `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, protegido por `SessionGuard`, validado por membership no backend, filtrado por `roomId` e `studentId` derivados da sessao, sem expor dados de outros alunos e sem chamar o provider de IA durante a listagem. A justificacao no resultado vem apenas do facto de `real_dev/web` nao ter script `lint`; o comando recomendado pelo guia foi executado e falhou por script inexistente, sendo substituido por `npm --prefix real_dev/web run build`.

### Escopo auditado

- BK alvo: `BK-MF8-10`.
- Contexto lido para coerencia: `BK-MF8-09` como fornecedor anterior da preparacao i18n e `BK-MF8-11` como consumidor seguinte da lista privada para partilha read-only/fork privado.
- Dependencia principal lida: `BK-MF1-04`, que criou a IA partilhada da sala e o modelo `RoomAiInteraction`.
- Requisitos canonicos lidos: `RF16`, `RF42`, `RNF20` e `RNF23`.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos do tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RF/RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-10` | `RF16`, `RF42`, `RNF20`, `RNF23` | `PASS_COM_JUSTIFICACAO` | Implementacao cumpre historico privado por aluno/sala, usa sessao e membership no backend, preserva POST da IA da sala, nao antecipa BK11 e tem testes focados. A justificacao e apenas operacional: nao existe script frontend `lint`. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RF.md` | `RF16` define IA partilhada da sala; `RF42` define chat, partilha e notas coletivas. |
| `docs/RNF.md` | `RNF20` exige que a IA nao aceda a dados de outras turmas ou alunos; `RNF23` exige logs/eventos estruturados como base operacional. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-10`, owner `Guilherme`, apoio `Natalia`, prioridade `P1`, esforco `M`, dependencia `BK-MF1-04`, requisitos `RF16, RF42, RNF20, RNF23`, sprint `S12`, `Core`, proximo BK `BK-MF8-11`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a mesma linha canonica e a duplicacao de resumo para `BK-MF8-10`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma campos obrigatorios do BK10, incluindo dependencia, requisitos e proximo BK. |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-10` entre `BK-MF8-09` e `BK-MF8-11`. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md` | Exige contrato publico do historico, service com `ensureMember`, query por `roomId` e `studentId`, controller `GET`, cliente web, UI com loading/vazio/erro/sucesso, testes negativos e handoff para `BK-MF8-11`. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Contrato publico do historico privado existe | `CUMPRE` | `real_dev/api/src/modules/study-rooms/room-ai-history.ts:15-21` define `RoomAiHistoryItem` apenas com `_id`, `roomId`, `question`, `answer` e `createdAt`; `:31-58` mapeia documentos persistidos para resposta publica. |
| Defesa em profundidade no mapper | `CUMPRE` | `room-ai-history.ts:36-45` rejeita ids invalidos e filtra novamente por `roomId` e `actor.id`, mesmo depois da query privada. |
| Service valida sala antes da leitura | `CUMPRE` | `room-ai.service.ts:58-67` rejeita `roomId` invalido com `BadRequestException`; `:69` chama `ensureMember(actor.id, roomId)` antes de qualquer query. |
| Query usa dono vindo da sessao, nao do frontend | `CUMPRE` | `room-ai.service.ts:71-80` faz `find({ roomId: new Types.ObjectId(roomId), studentId: new Types.ObjectId(actor.id) })`, ordena por `createdAt: -1`, limita a 30 e executa a query. |
| Listagem nao chama provider de IA | `CUMPRE` | `listMyRoomAiHistory(...)` termina em `toPrivateRoomAiHistory(...)` (`room-ai.service.ts:82`); a chamada ao provider fica apenas no POST `askRoomAi(...)` (`:93-157`). O teste `room-ai-history.spec.ts:101-107` valida que `generateRoomAnswer` nao e chamado. |
| Endpoint GET protegido por sessao | `CUMPRE` | `room-ai.controller.ts:13-14` declara `@Controller("api/study-rooms/:roomId/ai/answers")` e `@UseGuards(SessionGuard)`; `:30-35` expoe `@Get()` e delega para `listMyRoomAiHistory(request.user!, roomId)`. |
| POST existente da IA da sala preservado | `CUMPRE` | `room-ai.controller.ts:46-52` mantem `@Post()` e delega para `askRoomAi`; `room-ai.service.ts:93-157` preserva fontes autorizadas, perfil pedagogico e validacao do provider. |
| Persistencia reutiliza `RoomAiInteraction` sem modelo paralelo | `CUMPRE` | `schemas/room-ai-interaction.schema.ts:15-30` mantem `roomId`, `studentId`, `question`, `answer` e `sourceShareIds`; `:35` mantem indice por `roomId` e `createdAt`. |
| Cliente web tipa historico privado | `CUMPRE` | `apiClient.ts:225-232` tipa `RoomAiAnswer`; `:237-243` tipa `RoomAiHistoryItem`; `:1320-1324` implementa `listMyRoomAiHistory(roomId)` para `GET /api/study-rooms/${roomId}/ai/answers?scope=mine`. |
| Cliente web usa cookies HttpOnly/CSRF centralizados | `CUMPRE` | `apiClient.ts:530-543` centraliza `requestJson(...)`, `x-studyflow-csrf` e `credentials: "include"`; nao ha storage local para autorizacao. |
| UI mostra loading, vazio, erro e sucesso do historico | `CUMPRE` | `RoomAiPage.tsx:23-29` declara estados separados; `:34-48` carrega historico e trata erro; `:111-142` mostra titulo, loading, erro, empty state e lista. |
| UI sincroniza historico depois do POST | `CUMPRE` | `RoomAiPage.tsx:60-73` chama `askRoomAi(...)`, limpa pergunta e chama `loadHistory()` apos resposta valida. |
| Testes cobrem negativos principais | `CUMPRE` | `room-ai-history.spec.ts:20-57` valida aluno certo/sala certa; `:59-74` bloqueia nao membro antes da query; `:76-84` bloqueia sala invalida; `:86-99` filtra sala diferente; `:101-107` prova que o provider nao e chamado. |
| BK11 nao foi antecipado | `CUMPRE` | Pesquisa por `scope=shared`, `PRIVATE_FORK`, `READ_ONLY`, `forkedFromInteractionId`, `visibility`, `RoomAiSharingService` e `share-room-ai-answer` em `real_dev/api/src` e `real_dev/web/src` sem ocorrencias. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-10` | `RF16` | `room-ai.controller.ts`, `room-ai.service.ts`, `RoomAiPage.tsx` | Mantem IA da sala e adiciona historico ligado ao mesmo endpoint base. |
| `BK-MF8-10` | `RF42` | `apiClient.ts`, `RoomAiPage.tsx` | UI e cliente expõem historico de interacoes de chat da sala. |
| `BK-MF8-10` | `RNF20` | `room-ai-history.ts`, `room-ai.service.ts`, `room-ai-history.spec.ts` | Filtro por `actor.id`, membership antes da query, defesa em profundidade e testes de outro aluno/outra sala. |
| `BK-MF8-10` | `RNF23` | `room-ai.service.ts`, `room-ai-history.spec.ts` | Erros controlados para sala invalida e membership; comportamento observavel por respostas HTTP esperadas e suite focada. |

### Mapa de integracao da MF

- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. O BK10 adiciona strings visiveis no `RoomAiPage`, mas nao quebra o catalogo local criado no BK09; a integracao i18n futura pode absorver estas mensagens depois.
- `BK-MF8-10 -> BK-MF8-11`: `COERENTE`. O BK11 pode consumir `_id` das interacoes privadas para iniciar partilha controlada, sem assumir lista global da sala.
- `BK-MF1-04 -> BK-MF8-10`: `COERENTE`. O BK10 reutiliza `RoomAiInteraction`, `RoomAiController`, `RoomAiService` e `StudyRoomsService.ensureMember`, sem recriar a IA da sala.
- `MF6 -> MF8`: `COERENTE`. `RNF20` continua protegido porque `studentId` vem da sessao no backend e a UI nao envia nem escolhe o dono do historico.
- `MF7 -> MF8`: `COERENTE`. A implementacao fica dentro dos modulos existentes e os builds API/web passam.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `RF16`: IA partilhada da sala como superficie funcional herdada.
- `RF42`: chat/partilha/notas coletivas como dominio de interacoes.
- `RNF20`: isolamento entre alunos, salas e turmas.
- `RNF23`: erros estruturados/controlados e comportamento verificavel.
- `BK-MF1-04`: `RoomAiInteraction`, `RoomAiService`, `RoomAiController`, `StudyRoomsService.ensureMember` e `POST /api/study-rooms/:roomId/ai/answers`.
- Cliente comum `requestJson(...)` com cookies HttpOnly, CSRF marker e `credentials: "include"`.

### Contratos entregues para BKs seguintes

- `GET /api/study-rooms/:roomId/ai/answers?scope=mine` devolve historico privado do aluno autenticado.
- `RoomAiHistoryItem` exposto sem `studentId`, `sourceShareIds`, dados de outro aluno ou dados pessoais extra.
- `listMyRoomAiHistory(roomId)` no cliente web.
- `RoomAiPage` com estados de historico: loading, vazio, erro e sucesso.
- Testes unitarios que protegem ownership, membership, sala invalida, sala diferente e ausencia de chamada ao provider.
- Handoff para `BK-MF8-11`: usar `_id` privado como ponto de partida para partilha/fork sem transformar o historico numa lista global da sala.

### Coerencia entre MFs

- `MF1 -> MF8`: `COERENTE`. O historico privado estende a IA da sala sem substituir o fluxo de pergunta/resposta criado anteriormente.
- `MF6 -> MF8`: `COERENTE`. Privacidade e autorizacao permanecem no backend; o frontend apenas pede "o meu historico".
- `MF7 -> MF8`: `COERENTE`. Modulos e builds mantem a fronteira API/web sem dependencia nova.
- `MF8 -> BK-MF8-11`: `COERENTE`. O BK11 permanece fora do escopo e nao foi antecipado.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, `password`, `token`, `cookie`, `secret`, `segredo`, `console.log`, `logger.`, `prompt` nos ficheiros BK10 | `PASS_COM_JUSTIFICACAO` - ocorrencias benignas no cliente comum: comentarios de `passwordHash`, `cookies HttpOnly`, CSRF e tipos de login existentes; `prompt` aparece apenas no fluxo POST da IA da sala, nao na listagem. |
| `scope=shared`, `PRIVATE_FORK`, `READ_ONLY`, `forkedFromInteractionId`, `visibility`, `RoomAiSharingService`, `share-room-ai-answer` em API/web | `PASS` - sem ocorrencias; BK11 nao foi antecipado. |
| Contratos `listMyRoomAiHistory`, `scope=mine`, `credentials: "include"`, `ensureMember`, `studentId`, `createdAt` | `PASS` - contratos esperados encontrados nos ficheiros reais. |
| Metadados e cadeia MF8 nos guias | `PASS_COM_JUSTIFICACAO` - pesquisa segura confirmou BK09 -> BK10 -> BK11; alguns guias antigos tem secoes duplicadas de metadados historicos, mas a entrada canonica do BK10 esta coerente. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- room-ai-history` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- study-rooms` | `PASS` - 6 suites, 38 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 126 modulos. |
| `npm --prefix real_dev/web run lint` | `FALHA_JUSTIFICADA` - `Missing script: "lint"`; `real_dev/web/package.json` nao define lint. Foi substituido por build TypeScript/Vite. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos e tokens nos ficheiros BK10 | `PASS_COM_JUSTIFICACAO` - apenas ocorrencias benignas do cliente comum e do POST existente. |
| Pesquisa estatica de scope-out BK11 | `PASS` - sem ocorrencias. |
| Pesquisa segura de metadados dos guias MF8 | `PASS` - confirmou cadeia BK09/BK10/BK11; a primeira tentativa com backticks nao escapados falhou por substituicao de shell e foi repetida com regex segura. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/api/src/modules/study-rooms/room-ai-history.ts real_dev/web/src/pages/student/RoomAiPage.tsx` | `PASS_COM_JUSTIFICACAO` - `real_dev/` ignorado por contrato local da prompt. |
| `rg -n '[ \t]+$' docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md ...` | `PASS` - sem whitespace final no relatorio e ficheiros BK10 auditados. |
| `git diff --check` | `PASS`. |
| `git status --short --untracked-files=all` | `PASS_COM_JUSTIFICACAO` - apenas relatorios untracked ja esperados: `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `IMPLEMENTACAO-REAL_DEV-MF8.md`. |

### Ficheiros auditados

- `real_dev/api/src/modules/study-rooms/room-ai-history.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.spec.ts`
- `real_dev/api/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-10`.
- TODOs obrigatorios de codigo: nenhum.
- Validacao nao executada em browser com dois alunos reais: nao havia ambiente autenticado/seed manual nesta execucao; a privacidade foi coberta por suite unitária, leitura do service/controller e build web.
- Script frontend `lint`: indisponivel em `real_dev/web/package.json`; nao e finding de produto para este BK, mas fica registado como lacuna de tooling.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Avancar para `BK-MF8-11` ou executar auditoria posterior da cadeia MF8, assumindo que `BK-MF8-10` esta funcionalmente entregue com historico privado por aluno/sala, membership no backend, listagem sem provider de IA, UI real ligada ao cliente tipado e testes focados. Antes de uma defesa/demo manual, criar ou confirmar fixtures para dois alunos na mesma sala e repetir o checklist visual do guia.

---

## Execucao atual - BK-MF8-09

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-09`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-09 - Preparado para futura traducao/i18n` em `real_dev/web`, com verificacao de fronteira em `real_dev/api`. A implementacao cumpre `RNF44`: existe catalogo local tipado de mensagens, os paineis reais de guardrails e respostas com fontes consomem `messageKeys`/`t`, os contratos HTTP e payloads permanecem iguais, nao ha endpoint/backend i18n nem dependencia externa, e a suite Playwright focada valida chaves conhecidas, chave desconhecida e fallback seguro.

### Escopo auditado

- BK alvo: `BK-MF8-09`.
- Contexto lido para coerencia: `BK-MF8-08` como fornecedor anterior da separacao de apresentacao visual e `BK-MF8-10` como consumidor seguinte para historico privado da IA da sala.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos do tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-09` | `RNF44` | `PASS` | Cumpre preparacao i18n futura com catalogo local tipado, integracao nos dois paineis IA MF8, fallback seguro, sem backend novo, sem dependencia i18n e com validacoes automatizadas. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF44` define "Preparado para futura traducao i18n" como requisito de localizacao `Could` (`docs/RNF.md:130`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-09`, owner `Kaua`, apoio `Guilherme`, prioridade `P2`, esforco `S`, dependencia `-`, `RNF44`, sprint `S12`, `Core`, proximo BK `BK-MF8-10` (`:115`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma `BK-MF8-09`, `RNF44`, `S12`, `Core` e proximo `BK-MF8-10` (`:134`, `:285`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint e proximo BK (`:133`). |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-09` entre `BK-MF8-08` e `BK-MF8-10` (`:255`, `:266`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md` | Exige catalogo local `messages.ts`, chaves tipadas, integracao em `AiGuardrailsPanel` e `SourceGroundedAiPanel`, teste Playwright, revisao de `RoomAiPage`, sem backend i18n e sem biblioteca externa (`:24-58`, `:99-133`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista implementacao BK09, ficheiros alterados, comandos executados e handoff para BK10. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Catalogo local de mensagens existe e fica no frontend | `CUMPRE` | `messages.ts:1-4` declara explicitamente preparacao i18n sem dependencia externa; `messages.ts:5-32` define `messageKeys` com chaves de guardrails, source-grounded AI e fallback. |
| Chaves de mensagens estao tipadas | `CUMPRE` | `messages.ts:34` deriva `MessageKey` de `messageKeys`; `messages.ts:36-65` usa `Record<MessageKey, string>`, obrigando cobertura das chaves conhecidas. |
| Resolucao de chaves conhecidas e dinamicas tem fallback seguro | `CUMPRE` | `messages.ts:73-75` valida chave conhecida; `messages.ts:83-85` resolve chave tipada; `messages.ts:93-100` devolve `Mensagem indisponivel.` para chave desconhecida sem expor chave tecnica crua. |
| `AiGuardrailsPanel` usa o catalogo para mensagens visiveis principais | `CUMPRE` | `ai-guardrails-panel.tsx:5` importa `messageKeys`/`t`; `:51-84` usa catalogo em titulo, labels, opcoes, loading e submit; `:89-98` usa catalogo para permitido/bloqueado e explicacao de safety block. |
| `AiGuardrailsPanel` preserva contrato HTTP e payload | `CUMPRE` | `ai-guardrails-panel.tsx:37-41` continua a chamar `checkAiGuardrails({ contextType, resourceId, prompt })`; `check-ai-guardrails.ts:26-30` mantem payload; `:54-57` continua a chamar `/api/ai/guardrails/check`. |
| `SourceGroundedAiPanel` usa o catalogo para mensagens visiveis principais | `CUMPRE` | `source-grounded-ai-panel.tsx:5` importa `messageKeys`/`t`; `:61-88` usa catalogo em titulo, labels, ajuda, loading e submit; `:91-118` usa catalogo em estado vazio, titulo da resposta, citacoes e sem fontes. |
| `SourceGroundedAiPanel` preserva contrato HTTP e payload | `CUMPRE` | `source-grounded-ai-panel.tsx:33-45` continua a enviar `{ sourceJobIds, question }`; `ask-source-grounded-ai.ts:9-21` mantem `citations`; `:30-40` continua a chamar `/api/ai/source-grounded-answers`. |
| Sessao/cookies continuam no cliente comum | `CUMPRE` | `request-mf3-json.ts:8-21` centraliza `fetch` com `credentials: "include"` e CSRF marker; os paineis continuam a usar os clientes existentes que chamam este helper. |
| Backend nao recebeu endpoint, controller, service, DTO, schema ou model i18n | `CUMPRE` | Pesquisa `rg -n "api/i18n|I18nController|I18nService|i18next|FormatJS|react-intl|@formatjs" real_dev/api/src real_dev/web/src real_dev/web/package.json real_dev/api/package.json` sem ocorrencias; controllers existentes continuam `api/ai/guardrails` e `api/ai/source-grounded-answers` (`ai-guardrails.controller.ts:13-35`, `source-grounded-ai.controller.ts:13-35`). |
| `RoomAiPage` foi revista sem reestruturacao | `CUMPRE` | `RoomAiPage.tsx:17-61` continua no fluxo atual da IA da sala; nao foi alterada para BK09, ficando como superficie futura para `BK-MF8-10`. |
| Teste Playwright cobre chaves conhecidas, desconhecidas e fallback | `CUMPRE` | `mf8-messages.spec.ts:13-34` valida `t(...)`, `isMessageKey(...)`, `tOrDefault("missing.key")` e mensagens de loading; comando focado passou com 4 testes. |
| Scope-out preservado | `CUMPRE` | Nao ha `i18next`, `FormatJS`, seletor de idioma, preferencia de idioma, endpoint `/api/i18n`, backend novo, alteracao de payload IA, nem decisao de autorizacao/ownership/membership movida para o frontend. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/lib/messages.ts` | `messageKeys`, `MessageKey`, `isMessageKey(...)`, `t(...)` e `tOrDefault(...)` implementados e tipados. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx` | UI usa catalogo e preserva `checkAiGuardrails({ contextType, resourceId, prompt })`. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx` | UI usa catalogo e preserva `askSourceGroundedAi({ sourceJobIds, question })`. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/tests/e2e/mf8-messages.spec.ts` | Playwright valida chaves conhecidas, chave desconhecida, fallback e decisao sem dependencia externa. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/features/mf3/request-mf3-json.ts` | `credentials: "include"` e CSRF marker preservados. |
| `BK-MF8-09` | `RNF44` | `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts` e `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts` | Build API confirma fronteira backend existente, sem controller/service i18n. |

### Mapa de integracao da MF

- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. O helper de datas visiveis continua isolado; o BK09 centraliza mensagens visiveis dos fluxos IA sem alterar ISO, dados tecnicos ou endpoints.
- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. O proximo BK pode adicionar mensagens de historico privado ao catalogo local em vez de voltar a espalhar strings na UI.
- `MF6/MF7 -> MF8`: `COERENTE`. Guardrails, source-grounded AI, cookies HttpOnly, CSRF marker, modularidade e fronteiras backend continuam preservados.
- Backend/API: `COERENTE`. O BK09 nao cria backend de i18n e nao duplica controllers, DTOs, schemas ou services.
- Frontend: `COERENTE`. O catalogo e consumido por componentes reais, mantendo estado local, loading/error/success, clientes API reais e fallback seguro.

### Contratos consumidos

- `RNF44` como requisito canonico de preparacao i18n futura.
- `BK-MF8-08` como primeira separacao de apresentacao visual.
- `checkAiGuardrails(...)` e endpoint `POST /api/ai/guardrails/check`.
- `askSourceGroundedAi(...)` e endpoint `POST /api/ai/source-grounded-answers`.
- `requestMf3Json(...)` como cliente comum com cookies HttpOnly via `credentials: "include"`.
- `RoomAiPage` como superficie futura relacionada, revista sem reestruturacao.

### Contratos entregues para BKs seguintes

- Catalogo local `messageKeys` para mensagens visiveis MF8.
- Tipo `MessageKey` derivado das chaves conhecidas.
- `t(key)` para chaves conhecidas em tempo de desenvolvimento.
- `isMessageKey(key)` e `tOrDefault(key)` para chaves dinamicas e fallback seguro.
- Paineis IA ja integrados com catalogo, mantendo payloads e autorizacao backend.
- Suite `mf8-messages.spec.ts` como gate reutilizavel para evoluir mensagens no `BK-MF8-10`.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. Identidade, ownership e membership continuam fora do catalogo e nos contratos backend existentes.
- `MF6 -> MF8`: `COERENTE`. Guardrails, bloqueio sem fontes e source-grounding mantem autorizacao nos services; a UI apenas mostra mensagens centralizadas.
- `MF7 -> MF8`: `COERENTE`. Build API e build web passam; a modularidade mantem mensagens na camada web e regras de dominio na API.
- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. Handoff claro para historico privado da IA da sala adicionar chaves ao catalogo sem dependencia externa.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `api/i18n`, `I18nController`, `I18nService`, `i18next`, `FormatJS`, `react-intl`, `@formatjs` em `real_dev/api/src`, `real_dev/web/src` e package.json | `PASS` - sem ocorrencias. |
| Ficheiros BK09 por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, `password`, `token`, `cookie`, `secret`, `segredo` | `PASS` - sem ocorrencias nos ficheiros novos/alterados do BK09. |
| Contratos dos paineis por `sourceJobIds`, `question`, `citations`, `contextType`, `resourceId`, `prompt`, `credentials: "include"` e endpoints IA | `PASS` - contratos esperados encontrados; sem `usedSources` nem payload divergente. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 126 modulos. |
| `STUDYFLOW_E2E_START_SERVERS=false npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-messages.spec.ts` | `PASS` - 4 testes Playwright. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `rg -n "api/i18n\|I18nController\|I18nService\|i18next\|FormatJS\|react-intl\|@formatjs" real_dev/api/src real_dev/web/src real_dev/web/package.json real_dev/api/package.json` | `PASS` - sem ocorrencias. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos e tokens nos ficheiros BK09 | `PASS` - sem ocorrencias. |
| Pesquisa estatica de contratos dos paineis IA | `PASS` - payloads/endpoints/`credentials: "include"` preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web real_dev/web/src/lib/messages.ts real_dev/web/tests/e2e/mf8-messages.spec.ts` | `PASS_COM_JUSTIFICACAO` - `real_dev/` ignorado por contrato local da prompt. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md real_dev/web/src/lib/messages.ts real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx real_dev/web/tests/e2e/mf8-messages.spec.ts` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |

### Ficheiros auditados

- `real_dev/web/src/lib/messages.ts`
- `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `real_dev/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/web/tests/e2e/mf8-messages.spec.ts`
- `real_dev/web/package.json`
- `real_dev/web/tsconfig.json`
- `real_dev/web/playwright.config.ts`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-09`.
- TODOs obrigatorios: nenhum.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Avancar para `BK-MF8-10` ou executar auditoria posterior da cadeia MF8, assumindo que `BK-MF8-09` esta `PASS` com `RNF44` entregue, catalogo local tipado, paineis IA integrados, fallback seguro, sem backend i18n e sem dependencia externa.

---

## Execucao atual - BK-MF8-08

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-08`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-08 - Datas no formato dd/mm/aaaa` em `real_dev/api` e `real_dev/web`. A implementacao cumpre `RNF43`: existe helper frontend partilhado para datas visiveis em `dd/mm/aaaa`, o historico do aluno deixou de usar `unknown[]`/casts locais, a UI aplica a localizacao no ultimo momento, `RoutinesPage` reutiliza o mesmo helper para a superficie revista de data alvo, o backend preserva `occurredAt` como `Date`/ISO serializavel e ha validacoes Jest/Playwright para caminho feliz e negativos.

### Escopo auditado

- BK alvo: `BK-MF8-08`.
- Contexto lido para coerencia: `BK-MF8-07` como fornecedor anterior da cadeia MF8 e `BK-MF8-09` como consumidor seguinte para preparacao i18n.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos do tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.
- Modo audit-only: nao houve alteracao de codigo nesta execucao.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-08` | `RNF43` | `PASS` | Cumpre datas visiveis `dd/mm/aaaa`, preserva ISO no backend, usa cliente/historico tipados, cobre data valida/invalida/ausente e mantem fronteira para `BK-MF8-09`. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF43` define "Datas no formato dd/mm/aaaa" como requisito `Must` (`docs/RNF.md:129`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-08`, owner `Daniel`, apoio `Kaua`, prioridade `P0`, esforco `M`, dependencia `-`, `RNF43`, sprint `S12`, reforco, proximo BK `BK-MF8-09` (`:114`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma `BK-MF8-08`, `RNF43`, `S12`, reforco e proximo `BK-MF8-09` (`:133`, `:284`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint e proximo BK (`:132`). |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-08` entre `BK-MF8-07` e `BK-MF8-09` (`:255`, `:265`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md` | Exige helper `formatDatePt(...)`, historico tipado sem `unknown[]`, `StudyHistoryList` com `dd/mm/aaaa`, backend a preservar ISO e teste Playwright para data valida/invalida/ausente (`:24-52`, `:99-133`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista implementacao BK08, ficheiros alterados, comandos executados e handoff para BK09. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Helper frontend partilhado para `dd/mm/aaaa` | `CUMPRE` | `format-date-pt.ts:1-9` centraliza `Intl.DateTimeFormat("pt-PT")` com `day/month` em `2-digit` e `timeZone: "Europe/Lisbon"`; `:17-30` aceita `string`, `Date`, `null` e `undefined`, devolvendo data formatada ou fallback PT-PT. |
| Data invalida e data ausente tratadas explicitamente | `CUMPRE` | `format-date-pt.ts:18-25` devolve `Data indisponivel` para valor vazio e `Data invalida` para valor nao parseavel; `mf8-date-format.spec.ts:10-12` valida estes negativos. |
| API preserva `Date`/ISO, sem localizar no backend | `CUMPRE` | `StudyEventDto` mantem `occurredAt: Date` (`study-event.dto.ts:21-27`); `StudyEventSchema` persiste `occurredAt` como `Date` (`study-event.schema.ts:46-47`); `HistoryService.listMyEvents` devolve `event.occurredAt` sem formatacao (`history.service.ts:49-55`). |
| Historico do aluno filtrado por sessao/backend | `CUMPRE` | `HistoryService.listMyEvents(userId, ...)` recebe `userId` vindo da camada autenticada e consulta `{ userId: new Types.ObjectId(userId) }` (`history.service.ts:39-47`); a pagina nao envia `userId` manualmente (`StudyHistoryPage.tsx:18-30`). |
| Cliente web tipa historico e preserva ISO serializado | `CUMPRE` | `apiClient.ts:751-783` define `StudyHistoryEvent` com `occurredAt?: string` e `listStudyHistory(): Promise<StudyHistoryEvent[]>`; `requestJson` usa `credentials: "include"` e marker CSRF sem storage de tokens (`apiClient.ts:519-532`). |
| `StudyHistoryPage` remove `unknown[]` e cobre estados UI | `CUMPRE` | `StudyHistoryPage.tsx:6-16` importa `StudyHistoryEvent` e guarda `StudyHistoryEvent[]`; `:18-35` cobre loading/erro e carrega por `listStudyHistory()`; `:37-42` passa eventos tipados para a lista. |
| `StudyHistoryList` aplica formatacao no ultimo momento | `CUMPRE` | `StudyHistoryList.tsx:4-8` recebe `StudyHistoryEvent[]`; `:24-33` usa `event.id` como key e chama `formatDatePt(event.occurredAt)` junto da UI. |
| Superficie revista `RoutinesPage` reutiliza helper sem expandir scope | `CUMPRE` | `RoutinesPage.tsx:16` importa `formatDatePt`; `:453-456` usa o helper para `Data alvo`, preservando `toDateInputValue(...)` tecnico para inputs (`:479-487`). |
| Validacao backend prova ISO serializavel | `CUMPRE` | `history.service.spec.ts:58-76` cria `occurredAt` tecnico e confirma `result?.occurredAt.toISOString() === "2026-01-01T10:00:00.000Z"`. |
| Validacao Playwright cobre texto visivel | `CUMPRE` | `mf8-date-format.spec.ts:7-21` confirma `01/01/2026`, `Data invalida`, `Data indisponivel` e renderizacao do texto visivel num elemento da pagina. |
| Scope-out preservado | `CUMPRE` | Nao ha endpoint novo de localizacao, formatacao backend para `dd/mm/aaaa`, dependencia nova, biblioteca i18n, RAG, embeddings, OCR, storage de tokens ou logs sensiveis nos ficheiros alvo. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/lib/format-date-pt.ts` | `mf8-date-format.spec.ts` valida `01/01/2026`, data invalida, data ausente e texto renderizado. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/lib/apiClient.ts` | `StudyHistoryEvent` tipa `occurredAt?: string`; `requestJson` mantem `credentials: "include"`. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/pages/student/StudyHistoryPage.tsx` | Build Vite/TypeScript confirma loading/error e `StudyHistoryEvent[]` sem `unknown[]`. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/components/study/StudyHistoryList.tsx` | UI usa `formatDatePt(event.occurredAt)` junto da renderizacao. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/pages/student/RoutinesPage.tsx` | Superficie de `targetDate` revista e alinhada com helper partilhado. |
| `BK-MF8-08` | `RNF43` | `real_dev/api/src/modules/study/history.service.ts` e DTO/schema | Jest confirma que `occurredAt` continua `Date` serializavel para ISO. |

### Mapa de integracao da MF

- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. O BK08 nao altera exportacao MD/PDF nem artefactos; atua apenas em datas visiveis e historico/rotinas.
- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. A separacao entre dados tecnicos ISO e texto visivel fica pronta para a preparacao i18n sem introduzir biblioteca de traducao.
- `MF0/MF1 -> MF8`: `COERENTE`. Identidade continua a vir da sessao autenticada; frontend nao envia `userId`.
- `MF6/MF7 -> MF8`: `COERENTE`. Cliente comum preserva cookies HttpOnly/CSRF; testes automatizados e builds continuam verdes.
- Resultado de coerencia: `COERENTE`.

### Contratos consumidos

- `GET /api/study/history` como contrato HTTP existente, sem endpoint novo.
- `HistoryService.listMyEvents(...)` e `StudyEventDto.occurredAt: Date` como contrato tecnico backend.
- `requestJson(...)` como cliente comum com `credentials: "include"` e CSRF marker.
- `StudyHistoryPage`/`StudyHistoryList` como superficie minima visivel de historico.
- `RoutinesPage` como superficie revista de `targetDate`.

### Contratos entregues para BKs seguintes

- `formatDatePt(value)` como helper frontend partilhado para datas visiveis.
- `StudyHistoryEvent` e `listStudyHistory(): Promise<StudyHistoryEvent[]>` como cliente tipado para historico.
- Prova automatizada de que o backend preserva ISO e a UI mostra `dd/mm/aaaa`.
- Fronteira tecnica para `BK-MF8-09`: localizacao visual isolada sem alterar contratos HTTP.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. Modulos, clientes e testes existentes continuam a compilar; o BK08 nao duplica controllers, schemas ou services.
- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. O BK07 deixa artefactos/exportacao prontos; o BK08 nao reabre essa superficie.
- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. O BK09 pode reutilizar a decisao de centralizar texto visivel sem alterar dados tecnicos.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| Ficheiros alvo por `unknown[]`, `event as`, `toLocaleDateString`, `Intl.DateTimeFormat("pt-PT")` fora do helper e `formatDate(` local | `PASS` - sem ocorrencias nas superficies BK08; a unica formatacao PT fica em `format-date-pt.ts`. |
| Ficheiros alvo por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, logs e segredos | `PASS_COM_JUSTIFICACAO` - sem ocorrencias nos ficheiros novos/alterados do BK08; falsos positivos globais no `apiClient.ts` sao comentarios de cookies HttpOnly e DTOs `email/password` pre-existentes. |
| Guia MF8 por termos proibidos/caminhos privados | `PASS_COM_JUSTIFICACAO` - hits existem como scope-out, avisos de privacidade, exemplos sanitizados ou comandos de validacao; sem caminho privado `/Users/nuno` em guias de aluno. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test -- history.service.spec.ts` | `PASS` - 1 suite, 4 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 91 suites, 375 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 125 modulos. |
| `STUDYFLOW_E2E_START_SERVERS=false npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts` | `BLOQUEADO_AMBIENTE` no sandbox por Chromium/MachPortRendezvousServer `Permission denied`; rerun fora do sandbox passou com 1 teste. |
| Pesquisa estatica por casts, formatacao inline, storage, segredos, tokens, TODOs, claims proibidos e logs | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas conforme descrito acima. |
| Pesquisa em guias BK07/BK08/BK09 por termos proibidos/caminhos privados | `PASS_COM_JUSTIFICACAO` - hits existem como scope-out, avisos de privacidade ou referencia a cookies HttpOnly; sem caminho privado `/Users/nuno`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS` - sem whitespace final no relatorio. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev ...` | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros auditados

- `real_dev/web/src/lib/format-date-pt.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/components/study/StudyHistoryList.tsx`
- `real_dev/web/src/pages/student/StudyHistoryPage.tsx`
- `real_dev/web/src/pages/student/RoutinesPage.tsx`
- `real_dev/web/tests/e2e/mf8-date-format.spec.ts`
- `real_dev/web/playwright.config.ts`
- `real_dev/api/src/modules/study/history.service.ts`
- `real_dev/api/src/modules/study/history.service.spec.ts`
- `real_dev/api/src/modules/study/dto/study-event.dto.ts`
- `real_dev/api/src/modules/study/schemas/study-event.schema.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-08`.
- TODOs obrigatorios: nenhum.
- Nota ambiental: a primeira execucao Playwright no sandbox falhou por permissao do Chromium no macOS; a mesma validacao passou fora do sandbox.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Avancar para `BK-MF8-09` ou executar auditoria posterior da cadeia MF8, assumindo que `BK-MF8-08` esta `PASS` com `RNF43` entregue, ISO preservado no backend e `dd/mm/aaaa` validado no frontend.

---

## Execucao atual - BK-MF8-07

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-07`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-07 - Exportacao de resumos/quizzes em PDF/MD` em `real_dev/api` e `real_dev/web`. A implementacao cumpre `RNF40`: existe endpoint autenticado para exportar artefactos `SUMMARY` e `QUIZ`, validacao de formato `md|pdf`, ownership backend por area e artefacto, Markdown minimizado, HTML imprimivel para PDF sem dependencia nova, cliente web tipado com `credentials: "include"`, botoes `Exportar MD` e `Preparar PDF`, estados de UI e testes focados para sucesso e negativos criticos.

### Escopo auditado

- BK alvo: `BK-MF8-07`.
- Contexto lido para coerencia: `BK-MF8-06` como fornecedor anterior de texto normalizado e `BK-MF8-08` como consumidor seguinte da cadeia MF8.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`; no guia aparecem como caminhos publicos do tutorial, nao como raiz operativa desta auditoria.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-07` | `RNF40` | `PASS` | Cumpre exportacao MD/PDF de resumos/quizzes com sessao real, ownership backend, minimizacao de fontes, quiz sem resposta correta exposta, UI tipada e validacoes automatizadas. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF40` define "Exportacao de resumos/quizzes em PDF/MD" como requisito `Should` (`docs/RNF.md:118`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-07`, owner `Kaua`, apoio `Guilherme`, prioridade `P1`, esforco `S`, dependencia `-`, `RNF40`, sprint `S12`, `Core`, proximo BK `BK-MF8-08` (`:113`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-06 -> BK-MF8-07 -> BK-MF8-08` e o requisito `RNF40` (`:131-133`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint, `Core` e proximo BK (`:131`). |
| `docs/planificacao/backlogs/MF-VIEWS.md` | MF8 lista `BK-MF8-07` entre `BK-MF8-06` e `BK-MF8-08` (`:253-265`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md` | Exige endpoint `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`, backend com artefactos `SUMMARY`/`QUIZ`, UI com `Exportar MD`/`Preparar PDF`, testes de ownership/formato/fontes e PDF via HTML imprimivel (`:98-112`, `:1468-1497`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista implementacao BK07, ficheiros alterados, comandos executados e handoff para BK08. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Endpoint autenticado integrado no controller existente | `CUMPRE` | `study-tools.controller.ts:31-33` mantem `@Controller("api/study-areas/:id/study-tools")` com `SessionGuard`; `:130-149` expoe `GET :artifactId/export`, usa `request.user!.id`, chama o service e define `Content-Type`/`Content-Disposition`. |
| Service registado no modulo IA | `CUMPRE` | `ai.module.ts:14` importa `ArtifactExportService`; `:74-81` regista provider; `:83-91` exporta o service junto dos contratos existentes. |
| Formato `md|pdf` validado no backend | `CUMPRE` | `artifact-export.service.ts:141-151` aceita `undefined`/`md`, aceita `pdf` e rejeita outro valor com `INVALID_ARTIFACT_EXPORT_FORMAT`; teste em `artifact-export.service.spec.ts:71-78`. |
| Ownership e area validados no backend | `CUMPRE` | `artifact-export.service.ts:83-95` chama `areasService.getMyStudyArea(userId, studyAreaId)`, valida `ObjectId` e procura por `_id`, `userId`, `studyAreaId` e tipo exportavel; negativo em `artifact-export.service.spec.ts:80-97`. |
| Exportacao limitada a `SUMMARY` e `QUIZ` | `CUMPRE` | `artifact-export.service.ts:18` define `EXPORTABLE_ARTIFACT_TYPES = ["SUMMARY", "QUIZ"]`; `:90-95` filtra na query; `:223-228` rejeita tipo nao exportavel se passar por outro caminho. |
| Markdown para resumo e quiz | `CUMPRE` | `artifact-export.service.ts:159-173` renderiza documento Markdown; `:256-274` exporta bullets de resumo; `:282-313` exporta perguntas/opcoes do quiz. |
| Quiz nao revela resposta correta por omissao | `CUMPRE` | `renderQuizMarkdown` usa apenas pergunta e opcoes (`artifact-export.service.ts:294-310`), sem `correctOptionIndex`; teste prova ausencia de `correctOptionIndex` e "Resposta correta" (`artifact-export.service.spec.ts:99-110`). |
| Fontes minimizadas, sem material privado completo | `CUMPRE` | `normalizeSources` usa apenas `title`, `page`, `section` e `excerpt` limitado (`artifact-export.service.ts:349-363`), sem fallback para `contentText`; teste inclui `contentText` privado e confirma que nao sai no corpo (`artifact-export.service.spec.ts:38-42`, `:154-160`). |
| PDF sem dependencia backend nova | `CUMPRE` | `artifact-export.service.ts:114-119` devolve HTML inline; `:182-197` gera HTML de impressao com Markdown escapado; teste em `artifact-export.service.spec.ts:48-69`. |
| Nome/header de ficheiro seguro | `CUMPRE` | `buildArtifactExportContentDisposition` remove aspas do filename (`artifact-export.service.ts:200-210`); `buildExportBaseFileName` e `sanitizeFilePart` constroem nome previsivel e seguro (`:372-391`). |
| Cliente web tipado e sessao por cookie | `CUMPRE` | `apiClient.ts:112-125` tipa formato/ficheiro; `:1062-1099` chama endpoint com `encodeURIComponent`, `credentials: "include"` e marker CSRF sem `localStorage`; `:1107-1125` trata filename/fallback. |
| UI com botoes e estados PT-PT | `CUMPRE` | `StudyToolsPage.tsx:252` integra `ArtifactExportPanel`; `:277-321` gere loading/erro/sucesso; `:323-367` cobre vazio, tipo nao exportavel, `Exportar MD`, `Preparar PDF`, mensagem de sucesso e `role="alert"`. |
| Download MD e preparacao PDF no browser | `CUMPRE` | `StudyToolsPage.tsx:376-385` faz download via Blob/ObjectURL; `:393-405` abre janela imprimivel e usa fallback de download se o popup falhar. |
| Testes focados para caminho feliz e negativos | `CUMPRE` | `artifact-export.service.spec.ts:20-46` cobre resumo Markdown autorizado; `:51-69` PDF; `:74-78` formato invalido; `:83-97` artefacto inacessivel; `:102-110` quiz sem resposta correta. |
| Scope-out preservado | `CUMPRE` | Nao foram adicionadas chamadas a provider IA, RAG, embeddings, OCR, armazenamento de tokens ou decisao de ownership no frontend. Pesquisa estatica nos ficheiros alvo teve apenas falsos positivos em comentarios/DTOs de autenticacao globais de `apiClient.ts`. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/artifact-export.service.ts` | `artifact-export.service.spec.ts` cobre Markdown, HTML imprimivel, formato invalido, inacessivel e quiz sem resposta correta. |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/study-tools.controller.ts` | Endpoint `GET :artifactId/export` autenticado por `SessionGuard` e baseado em `request.user`. |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/ai.module.ts` | Service registado/exportado sem modulo paralelo. |
| `BK-MF8-07` | `RNF40` | `real_dev/web/src/lib/apiClient.ts` | Cliente tipado, same-origin, `credentials: "include"` e tratamento de filename. |
| `BK-MF8-07` | `RNF40` | `real_dev/web/src/pages/student/StudyToolsPage.tsx` | Painel com estados, botoes de exportacao, download Markdown e impressao PDF. |

### Mapa de integracao da MF

- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. O BK07 exporta artefactos IA ja persistidos e nao reabre importacao/normalizacao UTF-8; tambem nao expande fontes completas.
- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. A exportacao introduz nomes e mensagens previsiveis sem alterar contratos de datas ou formatacao temporal.
- `MF6/MF7 -> MF8`: `COERENTE`. A implementacao preserva sessao, ownership, ausencia de `userId` vindo do frontend e minimizacao de dados privados.
- Resultado de coerencia: `COERENTE`.

### Contratos consumidos

- `SessionGuard` e `AuthenticatedRequest` como origem de identidade.
- `StudyAreasService.getMyStudyArea(...)` como validacao de ownership da area.
- `AiArtifact`/`AiArtifactSchema` como persistencia de resumos/quizzes ja autorizados.
- `requestJson`/padrao do `apiClient.ts` para cookies HttpOnly e CSRF marker.
- Componentes existentes `SummaryPanel`, `QuizPanel`, `ExplanationPanel` e `FlashcardsPanel` para preservar apresentacao de artefactos.

### Contratos entregues para BKs seguintes

- `ArtifactExportService.exportArtifact(...)` como fronteira backend para exportacao segura.
- `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`.
- `ArtifactExportFormat` e `ArtifactExportFile` no cliente web.
- `ArtifactExportPanel` integrado em `StudyToolsPage`.
- Decisao tecnica documentada: `format=pdf` devolve HTML imprimivel para o browser guardar como PDF, sem dependencia backend.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. Identidade continua em cookie HttpOnly/sessao; frontend nao envia `userId`.
- `MF2/MF3 -> MF8`: `COERENTE`. Artefactos de estudo e fontes continuam filtrados por area/aluno; exportacao nao abre acesso cruzado.
- `MF7 -> MF8`: `COERENTE`. A exportacao nao chama provider IA nem altera politicas de fonte; apenas serializa artefactos persistidos.
- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. O proximo BK pode assumir exportacao pronta sem dependencias novas.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| Ficheiros de implementacao alvo por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, logs e segredos | `PASS_COM_JUSTIFICACAO` - sem ocorrencias nos ficheiros novos/alterados do BK07; falsos positivos no `apiClient.ts` global correspondem a comentario de cookies HttpOnly, DTOs `email/password` e `SOCRATIC` contendo a substring `OCR`. |
| Guia MF8 por termos proibidos | `PASS_COM_JUSTIFICACAO` - ocorrencias em `BK-MF8-07` estao em `Scope-out`, seguranca/evidence e criterios de aceite, isto e, como proibicoes explicitas e nao promessas de RAG/OCR/embeddings/tokens. |
| Caminhos privados em textos publicos do BK07 | `PASS` - pesquisa por `real_dev`, `/Users/nuno`, `IMPLEMENTATION_ROOT`, `apps/private` e `mockup/` nos documentos canonicos/guia alvo nao encontrou ocorrencias. |
| `contentText`, `correctOptionIndex`, `Resposta correta` na superficie de exportacao | `PASS_COM_JUSTIFICACAO` - aparecem apenas como dados de teste/contrato global; o teste confirma que `contentText` privado e `correctOptionIndex` nao entram no export. |
| `console.` / `logger.` com conteudo privado | `PASS` - sem ocorrencias nos ficheiros alvo do BK07. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- artifact-export.service --runInBand` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 91 suites, 374 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 124 modulos. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e logs | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas conforme descrito acima. |
| Pesquisa por caminhos privados no guia/documentos canonicos do BK07 | `PASS` - sem ocorrencias. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS` - sem whitespace final no relatorio. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev ...` | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros auditados

- `real_dev/api/src/modules/ai/artifact-export.service.ts`
- `real_dev/api/src/modules/ai/artifact-export.service.spec.ts`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai/ai.module.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-07`.
- TODOs obrigatorios para `BK-MF8-07`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-08`, assumindo que `BK-MF8-07` deixou exportacao MD/PDF pronta, segura e testada.

---

## Execucao atual - BK-MF8-06

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-06`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-06 - Suporte a importacao UTF-8 e PT-PT` em `real_dev/api` e no ponto de UI que consome jobs de indexacao em `real_dev/web`. A implementacao cumpre `RNF39`: existe helper comum de normalizacao UTF-8/PT-PT, acentos e cedilhas sao preservados em NFC, texto vazio ou quebrado por `U+FFFD` e rejeitado, materiais privados `TOPIC`/`URL`/`PDF`/`DOCX` e materiais oficiais `TEXT`/`URL` passam pela mesma normalizacao, ownership continua no backend, jobs falham de forma controlada quando nao ha texto legivel e a UI apresenta erro publico em PT-PT.

### Escopo auditado

- BK alvo: `BK-MF8-06`.
- Contexto lido para coerencia: `BK-MF8-05` como fornecedor anterior e `BK-MF8-07` como consumidor seguinte.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`, usadas apenas como referencia documental/visual quando aplicavel.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-06` | `RNF39` | `PASS` | Cumpre suporte UTF-8/PT-PT, normalizacao comum, rejeicao clara de texto ilegivel, indexacao privada/oficial, UI PT-PT e validacoes automatizadas. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF39` define "Suporte a importacao UTF-8 e PT-PT" como requisito `Must` (`docs/RNF.md:117`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-06`, owner `Kaua`, apoio `Natalia`, prioridade `P0`, esforco `M`, dependencia `BK-MF8-05`, `RNF39`, sprint `S12`, reforco, proximo BK `BK-MF8-07` (`:112`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-05 -> BK-MF8-06 -> BK-MF8-07` e o requisito `RNF39` (`:130-131`, `:281-282`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, apoio, prioridade, dependencia, requisito, sprint, reforco e proximo BK (`:130`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md` | Exige normalizacao UTF-8/PT-PT, preservacao de acentos, falha clara sem texto legivel, helper backend, MaterialsService, MaterialIndexService, UI e testes (`:24-52`, `:109-133`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista implementacao BK06, ficheiros alterados, comandos executados e handoff para BK07. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Helper backend comum | `CUMPRE` | `pt-text-normalization.ts:1-32` define contrato tipado, padrao de texto legivel, rejeicao de `U+FFFD` e funcao `normalizePortugueseStudyText(...)`. |
| Preservacao de acentos, cedilhas e PT-PT | `CUMPRE` | `pt-text-normalization.ts:18-24` usa `.normalize("NFC")`, normaliza quebras CR/LF, compacta espacos e preserva caracteres acentuados; `pt-text-normalization.spec.ts:7-14` cobre `funcao` combinada para `funcao quadratica` com acentos reais. |
| Falha clara sem texto legivel | `CUMPRE` | `pt-text-normalization.ts:26-31` marca vazio/`U+FFFD` como ilegivel; `materials.service.ts:391-402` lanca `MATERIAL_TEXT_NOT_READABLE` com mensagem publica; `material-index.service.ts:660-670` devolve erro controlado para jobs. |
| `MaterialsService` normaliza TOPIC | `CUMPRE` | `materials.service.ts:294-356` cria `TOPIC` com `contentText` normalizado e `READY`; `:341-346` exige pelo menos 10 caracteres legiveis; `materials.service.spec.ts:101-153` cobre normalizacao e rejeicao. |
| Ownership no backend | `CUMPRE` | `materials.service.ts:64-78` lista sem expor `contentText`; `:100-110` lista fontes textuais so depois de `assertOwnArea`; `:121-147` valida area/material; `:411-425` centraliza ownership. |
| Texto indexado privado normalizado e limitado | `CUMPRE` | `materials.service.ts:209-229` normaliza antes de marcar `READY` e limita `contentText` a 10000 caracteres. |
| Indexacao privada cobre `TOPIC`, `URL`, `PDF`, `DOCX` | `CUMPRE` | `material-index.service.ts:57-66` tipa os quatro formatos privados; `:580-628` extrai TOPIC, URL, PDF e DOCX e passa tudo por `toReadableExtraction(...)`. |
| Indexacao oficial cobre `TEXT` e `URL` | `CUMPRE` | `material-index.service.ts:71-78` tipa materiais oficiais `TEXT`/`URL`; `:302-331` valida professor e material oficial; `:636-652` extrai texto oficial e normaliza. |
| Jobs `FAILED` sem texto legivel | `CUMPRE` | `material-index.service.ts:537-570` cria job `FAILED` quando nao ha chunks; `:413-421` fecha job queued como `FAILED`; `:660-670` usa mensagem publica sem excertos privados. |
| Endpoints existentes e autenticados | `CUMPRE` | `material-index.controller.ts:13-15` usa `@Controller("api")` com `SessionGuard`; `:35-47` cria job privado com `request.user`; `:71-74` consulta job autorizado; nao ha ownership decidido pelo frontend. |
| Cliente web usa cookies HttpOnly/CSRF | `CUMPRE` | `apiClient.ts:504-528` centraliza `requestJson`, `credentials: "include"` e marker CSRF sem `localStorage`; `:853-869` submete URL/TOPIC; `:879-895` submete ficheiros com cookie e CSRF; `:1707-1724` inicia/consulta jobs. |
| UI PT-PT e acessivel para falhas | `CUMPRE` | `MaterialList.tsx:32-61` faz polling de jobs; `:68-79` trata erro; `:87-88` usa `role="alert"`; `:114-131` mostra estado e fallback `O material nao tem texto legivel para estudar.`. |
| Scope-out preservado | `CUMPRE` | Pesquisa estatica nao encontrou `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, OCR/RAG/chunking semantico, prompts privados ou logs de conteudo nos ficheiros alvo. A unica ocorrencia de `embeddings` e comentario negativo em `material-index.service.ts:922`. |
| Sem duplicacao indevida de endpoint/contrato | `CUMPRE` | Fluxo reutiliza `MaterialsService`, `OfficialMaterialsService`, `MaterialIndexService`, `MaterialIndexQueueService` e endpoints ja existentes; nao foi criado endpoint paralelo para normalizacao. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/common/text/pt-text-normalization.ts` | `pt-text-normalization.spec.ts` cobre NFC, acentos, whitespace e rejeicao de texto ilegivel. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/modules/materials/materials.service.ts` | `materials.service.spec.ts` cobre TOPIC normalizado, rejeicao de `U+FFFD` e ausencia de `contentText` no contrato publico. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/modules/material-index/material-index.service.ts` | `material-index.service.spec.ts` cobre TOPIC privado, PDF sem texto, material oficial textual e safety de PDF/DOCX. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/modules/material-index/material-index.controller.ts` | Endpoints autenticados por `SessionGuard`, com `request.user` como origem de ownership. |
| `BK-MF8-06` | `RNF39` | `real_dev/web/src/lib/apiClient.ts` e `real_dev/web/src/components/materials/MaterialList.tsx` | Cliente usa cookies HttpOnly/CSRF e UI mostra estados/erros PT-PT sem expor conteudo privado. |

### Mapa de integracao da MF

- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. O BK06 nao reabre a UI de mockup; atua em importacao, normalizacao e indexacao textual.
- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. O BK07 pode consumir `contentText`/chunks normalizados para exportar respostas/versoes em MD/PDF sem voltar a resolver encoding.
- `MF6/MF7 -> MF8`: `COERENTE`. A implementacao respeita sessao, ownership, jobs observaveis, validacao de ficheiros e limites ja existentes.
- Resultado de coerencia: `COERENTE`.

### Contratos consumidos

- `SessionGuard` e `AuthenticatedRequest` como origem de identidade.
- `MaterialsService.assertOwnArea(...)` e `findOwnedTextMaterial(...)` para ownership privado.
- `OfficialMaterialsService.findOwnedMaterial(...)` e `markIndexedText(...)` para materiais oficiais.
- `DocumentProcessingSafetyService` para validacao/timeout antes de parsers PDF/DOCX.
- `requestJson(...)` no frontend para cookies HttpOnly, CSRF marker e erros tipados.

### Contratos entregues para BKs seguintes

- `normalizePortugueseStudyText(...)` como helper reutilizavel para texto de estudo PT-PT.
- `MATERIAL_TEXT_NOT_READABLE` como erro backend publico quando texto importado nao e legivel.
- `toReadableExtraction(...)` como fronteira comum para TOPIC, URL, PDF, DOCX e materiais oficiais.
- Jobs `FAILED` com `errorMessage` seguro para UI.
- `contentText`/chunks normalizados como base para exportacoes e leitura posterior.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. Identidade e sessao continuam no backend; nao ha `userId` vindo do body nem storage de token no frontend.
- `MF2/MF3 -> MF8`: `COERENTE`. Materiais oficiais e indexacao mantem ownership/membership e nao abrem conteudo privado no contrato publico.
- `MF7 -> MF8`: `COERENTE`. Safety de ficheiros e timeouts continuam antes de parsers externos.
- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. Conteudo textual normalizado prepara a exportacao sem alterar permissao.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` nos ficheiros alvo | `PASS` - sem ocorrencias. |
| `as any`, `payload: unknown`, `TODO`, `RAG`, `OCR`, `chunking semantico`, prompts privados ou resposta IA privada | `PASS_COM_JUSTIFICACAO` - sem ocorrencias reais nos ficheiros alvo; `SOCRATIC` apareceu apenas como falso positivo de `OCR` no contrato tipado do cliente quando a pesquisa foi alargada. |
| `embeddings` | `PASS_COM_JUSTIFICACAO` - unica ocorrencia e comentario negativo: "sem introduzir embeddings nesta fase" em `material-index.service.ts:922`. |
| `segredo`, `token`, `cookie`, `password` | `PASS_COM_JUSTIFICACAO` - ocorrencias no cliente sao comentarios/DTOs de autenticacao (`cookies HttpOnly`, `email/password`) e nao armazenamento de segredo; nao ha `localStorage`/`sessionStorage`. |
| `console.` / `logger.` com conteudo privado | `PASS` - sem ocorrencias nos ficheiros alvo auditados. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- pt-text-normalization materials.service material-index.service --runInBand` | `PASS` - 4 suites, 28 testes. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 90 suites, 369 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 124 modulos. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e logs | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas conforme descrito acima. |
| `rg -n "[ \\t]+$" <ficheiros alvo e relatorio>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev ...` | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros auditados

- `real_dev/api/src/common/text/pt-text-normalization.ts`
- `real_dev/api/src/common/text/pt-text-normalization.spec.ts`
- `real_dev/api/src/modules/materials/materials.service.ts`
- `real_dev/api/src/modules/materials/materials.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.controller.ts`
- `real_dev/api/src/modules/material-index/material-index-queue.service.ts`
- `real_dev/api/src/modules/official-materials/official-materials.service.ts`
- `real_dev/api/src/modules/official-materials/official-materials.service.spec.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/components/materials/MaterialList.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-respostas-em-md-e-pdf.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-06`.
- TODOs obrigatorios para `BK-MF8-06`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-07`, consumindo o texto normalizado entregue por `BK-MF8-06` para exportacao de respostas em MD/PDF.

---

## Execucao atual - BK-MF8-05

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-05`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-05 - Aproximacao da UI a UI do mockup` em `real_dev/web`. A implementacao cumpre `RNF38`: existe checklist visual frontend-only com as rotas reais `/app`, `/app/salas` e `/app/professor/turmas`, painel `MockupAlignmentPanel` integrado no dashboard do aluno, validacao local contra rotas incoerentes, teste Playwright com login real e negativo contra rotas antigas. Nao ha backend novo, endpoint novo, DTO, schema, model ou service associado a este BK.

### Escopo auditado

- BK alvo: `BK-MF8-05`.
- Contexto lido para coerencia: `BK-MF8-04` como fornecedor anterior e `BK-MF8-06` como consumidor seguinte.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/`, usada apenas como referencia documental; `mockup/`, usado apenas como referencia visual e de fluxo.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-05` | `RNF38` | `PASS` | Cumpre checklist visual frontend-only, painel no dashboard, rotas reais, ausencia de backend novo, negativos Playwright contra rotas antigas e validacoes executadas. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF38` define "Aproximacao da UI real a UI definida no mockup" como requisito `Must` (`docs/RNF.md:116`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-05`, owner `Guilherme`, apoio `Natalia`, prioridade `P0`, esforco `M`, dependencia `-`, `RNF38`, sprint `S12`, reforco, proximo BK `BK-MF8-06` (`:111`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-04 -> BK-MF8-05 -> BK-MF8-06` (`:129-130`, `:280-281`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint, reforco e proximo BK (`:129`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md` | Exige checklist visual, painel React, integracao no dashboard, teste Playwright, rotas reais e ausencia de backend novo (`:24-48`, `:117-145`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista implementacao BK05, ficheiros alterados, comandos executados e validacao E2E focada. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Checklist frontend reutilizavel | `CUMPRE` | `mockup-alignment.ts:1-18` tipa estados, itens e resumo; `:31-61` devolve os 3 ecras de referencia do BK. |
| Rotas reais obrigatorias | `CUMPRE` | `mockup-alignment.ts:20-24` limita rotas a `/app`, `/app/salas` e `/app/professor/turmas`; `protectedRoutes.tsx:216`, `:219` e fallback `:222` confirmam as paginas reais; `navigation.ts:19`, `:22`, `:49-50` confirmam navegacao real. |
| Validacao local da checklist | `CUMPRE` | `mockup-alignment.ts:91-108` valida rota permitida, evidence e foco visual antes de a UI apresentar os itens. |
| Painel React completo | `CUMPRE` | `mockup-alignment-panel.tsx:82-143` renderiza painel com heading, totais, validacao, cards e links reais; `:125-133` apresenta erro acessivel com `role=\"alert\"` se o contrato ficar incoerente. |
| Acessibilidade basica | `CUMPRE` | `mockup-alignment-panel.tsx:91` usa `aria-labelledby`; `:97-99` define heading; `:55-72` usa `dl/dt/dd` para rota, estado e evidence. |
| Integracao no dashboard do aluno | `CUMPRE` | `SoloStudyDashboard.tsx:6` importa `MockupAlignmentPanel`; `:110-111` integra o painel no fim da pagina preservando loading, erro, performance e cards existentes. |
| Sem backend novo | `CUMPRE` | Pesquisa por `MockupAlignment`, `mockup-alignment` e `RNF38` em `real_dev/web/src` e `real_dev/web/tests/e2e` encontra apenas frontend/teste alvo; nao ha endpoint, controller, DTO, schema, model ou service backend criado para este BK. |
| Teste Playwright focado | `CUMPRE` | `mf8-mockup-alignment.spec.ts:33-40` faz login real; `:42-56` confirma painel e rotas reais; `:58-61` confirma ausencia de `/student/dashboard`, `/student/rooms` e `/teacher/classes`. |
| Privacidade e dados sensiveis | `CUMPRE` | A checklist guarda apenas descricoes de evidence e nao screenshots; `mockup-alignment.ts:39`, `:48`, `:57` referem contas seed/screenshot como evidence externa. Pesquisa estatica nao encontrou storage, prompts privados ou materiais privados no alvo. |
| Scope-out preservado | `CUMPRE` | Nao foram alterados auth, sessoes, ownership, membership, roles ou permissoes; o componente nao decide autorizacao e os links apontam para rotas ja protegidas pela app. |
| Handoff para BK seguinte | `CUMPRE` | `IMPLEMENTACAO-REAL_DEV-MF8.md` regista que `BK-MF8-06` pode focar UTF-8/PT-PT sem recriar UI de mockup; `BK-MF8-06` declara esse pressuposto no estado antes/depois. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/features/mf8/mockup-alignment.ts` | Checklist com rotas reais, resumo derivado e validacao local. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/features/mf8/mockup-alignment-panel.tsx` | Painel React `Alinhamento ao mockup`, totais, cards, links e alerta acessivel. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/pages/student/SoloStudyDashboard.tsx` | Painel integrado em `/app`, sem regressao no fluxo de carregamento do dashboard. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/tests/e2e/mf8-mockup-alignment.spec.ts` | `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts` - PASS fora da sandbox, 1 teste. |

### Mapa de integracao da MF

- Superficie auditada: frontend `features/mf8`, dashboard do aluno e teste Playwright.
- Sem superficie backend nova.
- Rotas reais auditadas: `/app`, `/app/salas`, `/app/professor/turmas`.
- `mockup/` existe (`canvas.fig`, `meta.json`, imagens e thumbnail) e foi tratado como referencia visual, nao como contrato tecnico.
- `BK-MF8-04` fica intacto: nenhum endpoint, policy, DTO, schema, provider ou ownership de IA externa foi alterado.
- `BK-MF8-06` pode continuar com importacao UTF-8/PT-PT sem reabrir UI de mockup.

### Contratos consumidos

- `MF0`: shell autenticada e rotas protegidas continuam a enquadrar o dashboard.
- `MF5`: `SoloStudyDashboard` preserva `startPerformanceBudget(...)`, `finishPerformanceBudget(...)` e feedback de performance.
- `MF7`: Playwright E2E com login real e evidencia browser.
- `BK-MF8-04`: handoff que limita o BK05 a aproximacao visual.
- `RNF38`: aproximacao visual objetiva e verificavel sem pixel-perfect.

### Contratos entregues para BKs seguintes

- `buildMockupAlignmentChecklist()` como contrato estavel dos 3 ecras prioritarios.
- `summarizeMockupAlignment(items)` como resumo derivado por estado.
- `validateMockupAlignmentChecklist(items)` como guarda local contra rotas incoerentes.
- `MockupAlignmentPanel` como painel visivel no dashboard do aluno.
- `mf8-mockup-alignment.spec.ts` como prova automatizada das rotas reais e negativo das rotas antigas.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. O teste reutiliza sessao real e rotas protegidas sem guardar tokens em `localStorage` ou `sessionStorage`.
- `BK-MF8-04 -> BK-MF8-05`: `COERENTE`. O BK05 nao mexe em IA externa, provider, DTOs, persistencia, ownership ou citacoes.
- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. O BK06 pode focar normalizacao UTF-8/PT-PT e exportacoes futuras sem recriar inventario visual.
- Resultado de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` no alvo | `PASS` - sem ocorrencias. |
| `as any`, `payload: unknown`, `TODO`, claims indevidos sobre RAG/embeddings/OCR/chunking/indexacao automatica | `PASS` - sem ocorrencias nos ficheiros alvo. |
| segredos, tokens, cookies, prompts privados ou dados pessoais em logs | `PASS_COM_JUSTIFICACAO` - apenas `password` no teste E2E como campo de credenciais seed/variaveis de ambiente; nao ha segredo real nem output sensivel. |
| rotas antigas `/student/dashboard`, `/student/rooms`, `/teacher/classes` | `PASS_COM_JUSTIFICACAO` - aparecem apenas no negativo deliberado do teste Playwright. |
| duplicacao de contrato `MockupAlignment` | `PASS` - superficie limitada a `features/mf8`, dashboard e teste E2E alvo. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos. |
| `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts` | `BLOQUEADO_NO_SANDBOX` na primeira execucao por `listen EPERM: operation not permitted 0.0.0.0` ao arrancar `MongoMemoryServer`; rerun fora da sandbox: `PASS`, 1 teste. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e rotas antigas | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas no teste E2E conforme descrito acima. |
| `rg -n "[ \\t]+$" <ficheiros alvo e relatorios>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| `git check-ignore -v real_dev` | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros auditados

- `real_dev/web/src/features/mf8/mockup-alignment.ts`
- `real_dev/web/src/features/mf8/mockup-alignment-panel.tsx`
- `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
- `real_dev/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `real_dev/web/src/components/layout/navigation.ts`
- `real_dev/web/package.json`
- `real_dev/web/playwright.config.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
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
- `mockup/`

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-05`.
- TODOs obrigatorios para `BK-MF8-05`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proximos passos

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-06`, preservando a checklist visual entregue por `BK-MF8-05` e focando o suporte UTF-8/PT-PT.

---

## Execucao atual - BK-MF8-04

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-04`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-04 - IA externa segue politicas e filtros proprios` em `real_dev/api` e `real_dev/web`. A implementacao cumpre `RNF37`: existe policy backend isolada `resolveExternalAiPolicy(...)`, endpoint unico `POST /api/ai/external-knowledge-answers`, `SessionGuard`, DTO sem `userId`, role `STUDENT` obrigatoria, ownership da area antes das fontes, fontes internas processaveis obrigatorias, provider chamado apenas depois da policy, persistencia com `externalUsed`, `internalCitations` e `externalNotes` separados, cliente React tipado e painel com estados vazio/loading/erro/sucesso.

### Escopo auditado

- BK alvo: `BK-MF8-04`.
- Contexto lido para coerencia: `BK-MF8-03` como fornecedor de UI/IA com fontes e `BK-MF8-05` como consumidor seguinte de um contrato ja fechado para refinamento visual.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`, usadas apenas como referencia documental quando aplicavel.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-04` | `RNF37` | `PASS` | Cumpre policy propria de IA externa, permissao explicita, fontes internas obrigatorias, separacao de citacoes internas/notas externas, backend autenticado, UI tipada e negativos principais. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF37` define "IA externa segue politicas e filtros proprios" como requisito `Must` (`docs/RNF.md:105`). |
| `docs/RF.md` | `RF39` permite conhecimento externo limitado quando permitido (`docs/RF.md:114`). |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-04`, owner `Kaua`, apoio `Guilherme`, prioridade `P0`, esforco `M`, dependencia `-`, `RNF37`, sprint `S11`, reforco, proximo BK `BK-MF8-05` (`:110`). |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-03 -> BK-MF8-04 -> BK-MF8-05` (`:128-130`). |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint, reforco e proximo BK (`:128`). |
| `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md` | Exige permissao explicita, fontes internas, separacao de citacoes/notas, endpoint, DTO, schema, service, policy, cliente, painel e testes negativos (`:24-48`, `:117-145`). |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista a implementacao BK04, ficheiros alterados e validacoes executadas. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Endpoint HTTP unico | `CUMPRE` | `external-knowledge-ai.controller.ts:13-35` expoe `POST /api/ai/external-knowledge-answers`, aplica `SessionGuard` e delega no service. Pesquisa por `external-knowledge-answers` encontrou este endpoint como superficie publica do fluxo. |
| DTO sem identidade vinda do frontend | `CUMPRE` | `ask-external-knowledge-ai.dto.ts:9-28` valida apenas `studyAreaId`, `question` e `allowExternalKnowledge`; nao aceita `userId`, `studentId` ou role. |
| Permissao externa explicita e tipada | `CUMPRE` | `ask-external-knowledge-ai.dto.ts:24-28` exige `allowExternalKnowledge` booleano; `ExternalKnowledgeAiPanel.tsx:92-100` envia a checkbox explicitamente. |
| Schema separa fontes internas de notas externas | `CUMPRE` | `external-knowledge-ai-answer.schema.ts:50-57` persiste `externalUsed`, `internalCitations` e `externalNotes` em campos distintos. |
| Modulo registado na app | `CUMPRE` | `external-knowledge-ai.module.ts:20-35` regista `AuthModule`, `AiModule`, `StudyAreasModule`, `MaterialsModule`, schema, controller e service; `app.module.ts:24` e `:77` importam o modulo. |
| Role de aluno validada no backend | `CUMPRE` | `external-knowledge-ai.service.ts:75-80` bloqueia qualquer actor que nao seja `STUDENT` com `STUDENT_ROLE_REQUIRED`. |
| Ownership da area antes de fontes/provider | `CUMPRE` | `external-knowledge-ai.service.ts:82-90` chama `StudyAreasService.getMyStudyArea(actor.id, studyAreaId)` e depois `MaterialsService.listReadyTextSources(actor.id, studyAreaId)`. |
| Fontes internas processaveis obrigatorias | `CUMPRE` | `external-knowledge-ai.service.ts:91-113` bloqueia `NO_INTERNAL_SOURCES` quando nao ha materiais ou citacoes com excerto; `materials.service.ts:99-109` lista apenas materiais `READY` com `contentText`. |
| Policy pequena e testavel | `CUMPRE` | `external-ai-policy.ts:37-62` decide `externalAllowed`, `reason` e `externalNotes`; bloqueia sem fontes ou sem permissao. |
| Provider chamado so depois da policy | `CUMPRE` | `external-knowledge-ai.service.ts:115-126` calcula a policy e passa `policy.externalAllowed` para `generateAnswer`; `:165-190` constroi prompt e chama provider. |
| Nota externa nao substitui citacao interna | `CUMPRE` | `external-ai-policy.ts:57-60` devolve nota externa separada; `external-knowledge-ai.service.ts:128-136` persiste `internalCitations` e `externalNotes` separadamente; `:171` instrui o provider a nao apresentar nota externa como citacao interna. |
| Provider invalido nao persiste resposta | `CUMPRE` | `external-knowledge-ai.service.ts:198-204` rejeita resposta vazia com `AI_PROVIDER_INVALID_RESPONSE`; teste `external-knowledge-ai.service.spec.ts:122-133` confirma que `answerModel.create` nao e chamado. |
| Cliente frontend tipado | `CUMPRE` | `ask-external-knowledge-ai.ts:9-27` tipa payload/resposta com `externalUsed`, `internalCitations` e `externalNotes`; `:35-45` chama o endpoint real. |
| Frontend usa cookies HttpOnly | `CUMPRE` | `request-mf3-json.ts:17-21` usa `credentials: "include"` e header CSRF sem expor sessao ao JavaScript. |
| UI com loading, erro, vazio e sucesso | `CUMPRE` | `external-knowledge-ai-panel.tsx:16-23` guarda estados; `:62-66` mostra erro com `role="alert"`; `:103-110` cobre loading/vazio; `:114-146` cobre sucesso. |
| UI separa citacoes internas e notas externas | `CUMPRE` | `external-knowledge-ai-panel.tsx:121-132` lista fontes internas; `:134-145` lista notas externas em seccao propria. |
| Testes positivos e negativos principais | `CUMPRE` | `external-ai-policy.spec.ts:6-45` cobre policy sem fontes, sem permissao e sucesso; `external-knowledge-ai.service.spec.ts:25-133` cobre sucesso, sem fontes, role errada, sem permissao externa e provider invalido. |
| Ausencia de duplicacao do contrato | `CUMPRE` | Pesquisa por `external-knowledge-answers`, `ExternalKnowledgeAiModule`, `resolveExternalAiPolicy`, `externalUsed`, `internalCitations` e `externalNotes` confirmou uma superficie de endpoint e um modulo de dominio para este fluxo. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-04` | `RNF37` | `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts` | `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`; `npm --prefix real_dev/api test -- external-knowledge-ai --runInBand` - 2 suites, 8 testes. |
| `BK-MF8-04` | `RNF37` | `real_dev/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`, `schemas/external-knowledge-ai-answer.schema.ts`, `external-knowledge-ai.controller.ts`, `external-knowledge-ai.module.ts`, `external-knowledge-ai.service.ts` | `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`; `npm --prefix real_dev/api test` - 89 suites, 362 testes. |
| `BK-MF8-04` | `RNF37` | `real_dev/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`, `external-knowledge-ai-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts` | `npm --prefix real_dev/web run build` - PASS. |

### Mapa de integracao da MF

- Endpoint auditado: `POST /api/ai/external-knowledge-answers`.
- DTO auditado: `AskExternalKnowledgeAiDto`, limitado a `studyAreaId`, `question` e `allowExternalKnowledge`.
- Controller auditado: `ExternalKnowledgeAiController`, protegido por `SessionGuard`.
- Service auditado: `ExternalKnowledgeAiService`, com role `STUDENT`, ownership, fontes, policy, provider e persistencia.
- Policy auditada: `resolveExternalAiPolicy(...)`, bloqueando contexto externo sem fontes ou sem permissao.
- Schema auditado: `ExternalKnowledgeAiAnswer`, com `externalUsed`, `internalCitations` e `externalNotes`.
- UI auditada: `ExternalKnowledgeAiPanel`, com formulario, estados, citacoes internas e notas externas.

### Contratos consumidos

- `MF0`: `SessionGuard` e `AuthenticatedUser` como fonte de identidade.
- `MF3`: `requestMf3Json(...)` com cookies HttpOnly/CSRF e helper frontend comum.
- `MF6`: isolamento de dados, CSRF, ownership backend e ausencia de tokens em storage.
- `MF7`: fontes processaveis e explicabilidade como base de seguranca para respostas IA.
- `BK-MF8-02`: factualidade sustentada por fontes internas autorizadas antes de qualquer contexto adicional.
- `BK-MF8-03`: handoff de provider/fonte/UI com estados completos.

### Contratos entregues para BKs seguintes

- `resolveExternalAiPolicy(input)` como policy testavel de `RNF37`.
- `ExternalKnowledgeAiService.ask(actor, input)` como contrato de dominio para conhecimento externo limitado.
- `ExternalKnowledgeAiAnswerView` com `externalUsed`, `internalCitations` e `externalNotes` separados.
- `askExternalKnowledgeAi(input)` como cliente React tipado.
- `ExternalKnowledgeAiPanel` como componente funcional com estados completos e separacao visual de fontes/notas.
- `BK-MF8-05` pode tratar apenas aproximacao visual/mockup sem redefinir endpoint, ownership, policy ou separacao de origens.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. O BK04 reutiliza fontes processaveis/autorizadas e nao transforma contexto externo em fonte factual primaria.
- `BK-MF8-03 -> BK-MF8-04`: `COERENTE`. O BK04 consome o padrao de UI/IA com fontes e provider validado, sem reabrir personalizacao pedagogica.
- `BK-MF8-04 -> BK-MF8-05`: `COERENTE`. O proximo BK fica limitado a refinamento visual e nao depende de alterar seguranca de IA externa.
- Nao foi detetada regressao em auth, ownership, DTOs, schemas, UI, testes ou builds.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` no alvo | `PASS` - sem ocorrencias. |
| segredos, tokens, passwords, cookies ou chaves no alvo | `PASS` - sem ocorrencias relevantes nos ficheiros alvo. |
| `as any`, `payload: unknown`, TODOs vagos | `PASS` - sem ocorrencias nos ficheiros alvo. |
| claims indevidos sobre RAG, embeddings, OCR, chunking, indexacao automatica ou navegacao web | `PASS` - sem ocorrencias nos ficheiros alvo. |
| prompts privados, respostas IA privadas, materiais privados ou dados pessoais em logs/evidence | `PASS` - sem logs ou evidence com dados sensiveis no alvo. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- external-knowledge-ai --runInBand` | `PASS` - 2 suites, 8 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 89 suites, 362 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica por storage, segredos, tokens, TODOs e claims proibidos | `PASS` - sem ocorrencias no alvo. |

### Ficheiros auditados

- `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`
- `real_dev/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
- `real_dev/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`
- `real_dev/api/src/modules/materials/materials.service.ts`
- `real_dev/api/src/app.module.ts`
- `real_dev/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
- `real_dev/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
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

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers: nenhum.
- TODOs obrigatorios para `BK-MF8-04`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.

### Proximos passos

Executar `MODO=auditar_implementacao` ou `MODO=implementar` para `BK-MF8-05`, mantendo o escopo em aproximacao visual/mockup e reutilizando o contrato BK04 sem redefinir seguranca, ownership, policy ou endpoint.

---

## Execucao atual - BK-MF8-03

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-03`
- `Resultado`: `PASS`
- `Data`: `2026-07-04`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-03 - IA adapta explicacoes ao nivel do aluno` em `real_dev/api` e `real_dev/web`. A implementacao cumpre `RNF36`: a fachada `POST /api/ai/adaptive-explanations` exige sessao, valida role de aluno, nao aceita `userId`, `role`, `pace` ou `level` vindos do frontend, delega para `AdaptiveLearningService`, valida ownership da area, usa `LearningProfile` com defaults seguros, bloqueia ausencia de fontes processaveis, valida fontes devolvidas pelo provider antes de persistir, e a IA da sala adapta linguagem por `StudentProfile.year` resolvido no backend sem usar idade exata.

### Escopo auditado

- BK alvo: `BK-MF8-03`.
- Contexto lido para coerencia: `BK-MF8-02` como base factual/fallback honesto e `BK-MF8-04` como proximo consumidor de perfil, fontes e provider validado.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`, usadas apenas como referencia documental quando aplicavel.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

### Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-03` | `RNF36` | `PASS` | Cumpre perfil pedagogico por area, fachada autenticada, role de aluno, ownership, fontes obrigatorias, provider validado, UI com estados e IA da sala adaptada por ano escolar do aluno autenticado. |

### Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF36` define que a IA adapta explicacoes ao nivel do aluno, incluindo perfil pedagogico individual e ano escolar nas respostas da IA da sala. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-03`, owner `Daniel`, apoio `Natalia`, prioridade `P1`, esforco `S`, dependencia `-`, `RNF36`, sprint `S12`, core, proximo BK `BK-MF8-04`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-02 -> BK-MF8-03 -> BK-MF8-04`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint, core e proximo BK. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md` | Exige `LearningProfile`, `LearningPace`, `LearningLevel`, `AdaptiveLearningService`, fachada `POST /api/ai/adaptive-explanations`, IA da sala por `StudentProfile.year`, UI com estados e testes negativos. |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista a implementacao do BK03, ficheiros alterados e validacoes executadas. |

### Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Endpoint HTTP real | `CUMPRE` | `adaptive-explanations.controller.ts:13-36` expoe `POST /api/ai/adaptive-explanations`, aplica `SessionGuard` e delega para `AdaptiveExplanationsService`. |
| DTO sem identidade/perfil vindos do frontend | `CUMPRE` | `ask-adaptive-explanation.dto.ts:9-22` valida apenas `studyAreaId` e `question`; nao existem campos `userId`, `studentId`, `role`, `pace` ou `level`. |
| Role de aluno validada no backend | `CUMPRE` | `adaptive-explanations.service.ts:28-40` bloqueia atores que nao sejam `STUDENT` com `STUDENT_ROLE_REQUIRED` antes de delegar. |
| `userId` vindo da sessao | `CUMPRE` | `adaptive-explanations.service.ts:36-40` usa `actor.id` vindo de `AuthenticatedUser`; o frontend nao escolhe aluno. |
| Modulo registado com auth e IA | `CUMPRE` | `adaptive-explanations.module.ts:13-18` importa `AuthModule` e `AiModule`, regista controller e service da fachada. |
| Perfil pedagogico canonico | `CUMPRE` | `learning-profile.schema.ts:14-18` limita `LearningPace` a `SLOW/BALANCED/FAST` e `LearningLevel` a `BEGINNER/INTERMEDIATE/ADVANCED`; `:39-65` persiste ritmo, nivel, dificuldades e estilo. |
| DTO de perfil sem valores livres | `CUMPRE` | `update-learning-profile.dto.ts:17-35` aplica `IsIn`, limites de array/string e tamanho maximo aos campos editaveis. |
| Ownership da area antes de ler perfil | `CUMPRE` | `adaptive-learning.service.ts:82-104` chama `areasService.getMyStudyArea(userId, studyAreaId)` antes de procurar `LearningProfile`. |
| Defaults seguros sem perfil | `CUMPRE` | `adaptive-learning.service.ts:94-101` devolve `BALANCED`, `INTERMEDIATE`, lista vazia de dificuldades e estilo vazio quando nao ha perfil persistido. |
| Ownership/fontes antes do provider | `CUMPRE` | `adaptive-learning.service.ts:157-166` valida area, perfil e fontes antes de chamar IA; `:239-251` usa `materialsService.listReadyTextSources(userId, studyAreaId)`. |
| Bloqueio sem fontes processaveis | `CUMPRE` | `adaptive-learning.service.ts:166-172` devolve `NO_PROCESSABLE_SOURCES` sem chamar provider quando nao ha materiais prontos. |
| Prompt com perfil e fontes autorizadas | `CUMPRE` | `adaptive-learning.service.ts:174-184` passa area, pergunta, ritmo, nivel, dificuldades, estilo e fontes para `buildAdaptiveExplanationPrompt(...)`; `adaptive-explanation.prompt.ts:39-53` instrui o provider a responder apenas com fontes autorizadas. |
| Provider invalido sem persistencia | `CUMPRE` | `adaptive-learning.service.ts:260-277` rejeita resposta vazia, sem `sourceMaterialIds` ou com fonte fora do conjunto autorizado com `AI_PROVIDER_INVALID_ADAPTIVE_EXPLANATION`. |
| Persistencia apos validacao | `CUMPRE` | `adaptive-learning.service.ts:186-204` valida resultado antes de criar `AdaptiveExplanation` e registar historico. |
| Schema de explicacao adaptada | `CUMPRE` | `adaptive-explanation.schema.ts:15-43` guarda `userId`, `studyAreaId`, pergunta, resposta, proximos passos e fontes; indice por aluno/area/data preserva historico privado. |
| Cliente frontend tipado | `CUMPRE` | `ask-adaptive-explanation.ts:10-29` define payload tipado e chama o endpoint real `/api/ai/adaptive-explanations`. |
| Frontend com cookies HttpOnly | `CUMPRE` | `request-mf3-json.ts:17-21` usa `credentials: "include"` e header CSRF sem expor token de sessao. |
| UI de explicacao adaptada com estados | `CUMPRE` | `adaptive-explanation-panel.tsx:13-20` guarda area/pergunta/resposta/loading/error; `:68-97` apresenta labels, submissao e erro `role="alert"`; `:99-115` cobre vazio e sucesso. |
| IA da sala valida membership e fontes | `CUMPRE` | `room-ai.service.ts:54-67` chama `ensureMember(...)`, procura fontes utilizaveis e bloqueia `NO_ROOM_AI_SOURCES` antes do provider. |
| IA da sala usa ano escolar do backend | `CUMPRE` | `room-ai.service.ts:69-80` chama `studentProfileService.getMyProfile(actor.id)` e passa `askerProfile?.year` para `resolveRoomAiPedagogicalContext(...)`; `RoomAiPage.tsx:28-34` envia apenas `question`. |
| IA da sala nao persiste ano/idade no interaction | `CUMPRE` | `room-ai.service.ts:84-92` persiste `roomId`, `studentId`, pergunta, resposta e fontes; o contexto pedagogico nao e guardado. |
| Normalizacao pedagogica sem idade exata | `CUMPRE` | `room-ai-pedagogy.ts:55-78` mapeia ano escolar para `PRIMARY`, `LOWER_SECONDARY`, `UPPER_SECONDARY`, `HIGHER_EDUCATION` ou `UNKNOWN`; `room-ai.prompt.ts:30-33` instrui a adaptar forma sem revelar ano/idade. |
| Testes de caminho feliz e negativos | `CUMPRE` | `adaptive-explanations.service.spec.ts:21-45`, `adaptive-learning.service.spec.ts:18-155`, `room-ai.service.spec.ts:18-123` e `room-ai-pedagogy.spec.ts:6-42` cobrem role, ausencia de fontes, defaults, perfil no prompt, provider invalido e ano escolar. |
| Ausencia de endpoint duplicado para a responsabilidade | `CUMPRE` | Pesquisa por `adaptive-explanations` encontrou a fachada publica `POST /api/ai/adaptive-explanations` e o endpoint historico por area em `AdaptiveLearningController`; a fachada delega no contrato existente sem duplicar logica. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`, `adaptive-explanations.controller.ts`, `adaptive-explanations.service.ts`, `adaptive-explanations.module.ts` | `npm --prefix real_dev/api test -- adaptive-explanations` - 1 suite, 2 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/ai/schemas/learning-profile.schema.ts`, `dto/update-learning-profile.dto.ts`, `adaptive-learning.service.ts`, `prompts/adaptive-explanation.prompt.ts`, `schemas/adaptive-explanation.schema.ts` | `npm --prefix real_dev/api test -- adaptive-learning` - 1 suite, 5 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/study-rooms/room-ai.service.ts`, `room-ai-pedagogy.ts`, `prompts/room-ai.prompt.ts`, `room-ai.controller.ts` | `npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand` - 1 suite, 5 testes; `npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand` - 1 suite, 11 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`, `adaptive-explanation-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts`, `real_dev/web/src/pages/student/RoomAiPage.tsx` | `npm --prefix real_dev/web run build` - PASS. |

### Mapa de integracao da MF

- Endpoint auditado: `POST /api/ai/adaptive-explanations`.
- Endpoint complementar auditado: `POST /api/study-rooms/:roomId/ai/answers`.
- DTO da fachada: `AskMf3AdaptiveExplanationDto`, limitado a `studyAreaId` e `question`.
- Controller da fachada: `AdaptiveExplanationsController`, protegido por `SessionGuard`.
- Service de fachada: `AdaptiveExplanationsService`, com role `STUDENT` obrigatoria e `actor.id` vindo da sessao.
- Service de dominio: `AdaptiveLearningService`, com ownership da area, perfil, fontes, prompt, provider, validacao e persistencia.
- Perfil: `LearningProfile`, `LearningPace`, `LearningLevel`, `difficulties` e `preferredExplanationStyle`.
- IA da sala: `RoomAiService` valida membership, fontes da sala, perfil do aluno autenticado e resposta do provider.
- UI: `AdaptiveExplanationPanel`, com loading, erro, vazio, sucesso e labels; `RoomAiPage` nao envia ano escolar nem idade.

### Contratos consumidos

- `MF0`: `SessionGuard` e `AuthenticatedUser` como fonte de identidade.
- `MF1`: `LearningProfile`, `LearningPace`, `LearningLevel` e perfil pedagogico por area privada.
- `MF3`: `requestMf3Json(...)` com cookies HttpOnly/CSRF e fachada historica de explicacoes adaptadas.
- `MF6`: isolamento de dados, CSRF, cookies HttpOnly e ausencia de tokens no browser.
- `MF7`: fontes processaveis e explicabilidade como base de seguranca para respostas IA.
- `BK-MF8-02`: factualidade limitada a fontes autorizadas e fallback honesto antes da personalizacao.

### Contratos entregues para BKs seguintes

- `POST /api/ai/adaptive-explanations` como superficie publica para explicacoes adaptadas ao perfil pedagogico.
- `AdaptiveExplanationsService.ask(actor, input)` como fachada fina com role `STUDENT`.
- `AdaptiveLearningService.askAdaptiveExplanation(userId, studyAreaId, input)` como contrato que combina ownership, perfil, fontes, provider, validacao e historico.
- `buildAdaptiveExplanationPrompt(...)` como ponto unico que injeta ritmo, nivel, dificuldades, estilo e fontes autorizadas.
- `resolveRoomAiPedagogicalContext(...)` como normalizador de ano escolar seguro para a IA da sala.
- `BK-MF8-04` pode assumir perfil pedagogico, fontes autorizadas, provider validado e UI com estados completos antes de aplicar politicas/filtros de IA externa.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 consome fontes/processamento/explicabilidade e nao cria enum, endpoint ou policy paralela para nivel pedagogico.
- `BK-MF8-02 -> BK-MF8-03`: `COERENTE`. A adaptacao pedagogica parte de fontes processaveis e provider validado, preservando fallback honesto.
- `BK-MF8-03 -> BK-MF8-04`: `COERENTE`. O proximo BK pode acrescentar politicas de IA externa sem reescrever perfil, fachada, UI ou contratos de fontes.
- Nao foi detetada regressao em auth, ownership, membership, DTOs, schemas, UI ou comandos.

### Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` no alvo | `PASS` - sem ocorrencias. |
| segredos, tokens, passwords, secrets | `PASS` - sem valores sensiveis observados no alvo. |
| `as any`, `payload: unknown`, TODOs vagos | `PASS` - sem ocorrencias no alvo auditado. |
| claims indevidos sobre RAG, embeddings, OCR, chunking, indexacao automatica | `PASS` - sem ocorrencias no alvo auditado. |
| prompts privados, respostas IA privadas, materiais privados em logs/evidence | `PASS_COM_JUSTIFICACAO` - ocorrencia em `room-ai.prompt.ts:29` e apenas uma instrucao negativa ("Nao uses materiais privados..."); nao expoe material real. |
| `cookie` / `token` | `PASS_COM_JUSTIFICACAO` - ocorrencias sao comentarios de seguranca sobre cookies HttpOnly/CSRF em `request-mf3-json.ts`, referencias do relatorio e um comentario de token runtime do NestJS em modulo nao alterado; sem valores sensiveis. |

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- adaptive-explanations` | `PASS` - 1 suite, 2 testes. |
| `npm --prefix real_dev/api test -- adaptive-learning` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand` | `PASS` - 1 suite, 11 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 88 suites, 357 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, sem drift critico. |
| `git diff --check` | `PASS` - sem whitespace errors. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` | `PASS` - sem trailing whitespace no relatorio. |
| Pesquisa estatica por storage, segredos, tokens, TODOs e claims proibidos | `PASS_COM_JUSTIFICACAO` - apenas ocorrencias seguras descritas na seccao de pesquisa estatica. |

### Ficheiros auditados

- `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts`
- `real_dev/api/src/modules/ai/schemas/learning-profile.schema.ts`
- `real_dev/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- `real_dev/api/src/modules/ai/adaptive-learning.service.ts`
- `real_dev/api/src/modules/ai/adaptive-learning.service.spec.ts`
- `real_dev/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- `real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-pedagogy.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-pedagogy.spec.ts`
- `real_dev/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`
- `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
- `real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
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

### Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

### Blockers e TODOs

- Blockers: nenhum.
- TODOs obrigatorios para `BK-MF8-03`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.

### Proximos passos

Executar `MODO=auditar_implementacao` ou `MODO=implementar` para `BK-MF8-04`, reutilizando a fachada de explicacoes adaptadas, perfil pedagogico, fontes autorizadas, provider validado e UI com estados completos como base para politicas/filtros de IA externa.

---

## Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: `auditar_implementacao`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-02`
- `Resultado`: `PASS`
- `Data`: `2026-07-03`
- `Permissoes`: sem alteracao de codigo; sem commits; apenas relatorio tecnico permitido.

Auditoria focada ao `BK-MF8-02 - IA nao pode inventar informacao factual` em `real_dev/api` e `real_dev/web`. A implementacao cumpre `RNF35`: o endpoint `POST /api/ai/source-grounded-answers` exige sessao, valida cada `sourceJobId` no backend com ownership/membership, bloqueia falta de fontes citaveis com `NO_INDEXED_SOURCES`, limita citacoes publicas, aplica consentimento/politica/quota antes do provider, trata provider invalido sem persistir resposta enganadora e apresenta fallback honesto na UI.

## Escopo auditado

- BK alvo: `BK-MF8-02`.
- Contexto lido para coerencia: `BK-MF8-01` como barreira etica anterior e `BK-MF8-03` como proximo consumidor do contrato de fontes obrigatorias.
- Pasta auditada: `real_dev`, porque a prompt define `IMPLEMENTATION_ROOT=real_dev`.
- Pastas ignoradas como implementacao real: `apps/` e `mockup/`, usadas apenas como referencia documental quando aplicavel.
- Nota de Git: `real_dev/` esta ignorado por `.gitignore`; isso e esperado e nao e finding.

## Estado por BK

| BK | RNF | Estado | Decisao |
| --- | --- | --- | --- |
| `BK-MF8-02` | `RNF35` | `PASS` | Cumpre fontes obrigatorias, fallback honesto, citacoes publicas limitadas, governanca IA, UI, testes e handoff para `BK-MF8-03`. |

## Evidencia canonica

| Fonte | Evidencia |
| --- | --- |
| `docs/RNF.md` | `RNF35` define "IA nao pode inventar informacao factual" como requisito Must. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | `BK-MF8-02`, owner `Natalia`, apoio `Guilherme`, prioridade `P0`, esforco `M`, dependencia `-`, `RNF35`, sprint `S11`, proximo BK `BK-MF8-03`. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | Confirma a sequencia `BK-MF8-01 -> BK-MF8-02 -> BK-MF8-03`. |
| `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` | Confirma owner, prioridade, dependencia, requisito, sprint, reforco e proximo BK. |
| `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md` | Exige endpoint `POST /api/ai/source-grounded-answers`, DTO/schema/controller/module/service, validacao de cada `sourceJobId`, bloqueio sem fontes, governanca IA e UI com citacoes. |
| `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | Regista a implementacao do BK02, ficheiros alterados e validacoes executadas. |

## Auditoria por requisito

| Requisito auditado | Estado | Evidencia |
| --- | --- | --- |
| Endpoint HTTP real | `CUMPRE` | `source-grounded-ai.controller.ts:13-35` expõe `POST /api/ai/source-grounded-answers` com `SessionGuard` e delega no service. |
| DTO sem `userId` vindo do frontend | `CUMPRE` | `ask-source-grounded-ai.dto.ts:17-33` valida apenas `sourceJobIds` e `question`. |
| Schema/model de persistencia | `CUMPRE` | `source-grounded-ai-answer.schema.ts:40-57` guarda `actorId`, `sourceJobIds`, `question`, `answer` e `citations`. |
| Modulo registado na app | `CUMPRE` | `source-grounded-ai.module.ts:22-41` injeta auth, IA, consentimentos, politicas, quotas, materiais e schema; `app.module.ts:26` e `:76` importam o modulo. |
| Validacao de cada fonte no backend | `CUMPRE` | `source-grounded-ai.service.ts:96-100` chama `findReadableDoneJob(actor, jobId)` para cada fonte antes do prompt. |
| Ownership/membership e estado `DONE` | `CUMPRE` | `material-index.service.ts:447-454` carrega e valida job legivel; `:498-513` valida dono/professor/aluno inscrito; `:521-527` bloqueia job nao concluido. |
| Bloqueio sem fontes citaveis | `CUMPRE` | `source-grounded-ai.service.ts:102-112` normaliza/filtra citacoes e devolve `NO_INDEXED_SOURCES` quando nao ha citacoes. |
| Citacoes publicas limitadas | `CUMPRE` | `citation-policy.ts:18-41` exige fonte/localizacao/excerto e limita o excerto a 420 caracteres. |
| Consentimento antes do provider | `CUMPRE` | `source-grounded-ai.service.ts:115-118` chama `assertGranted(...)`; `ai-consents.service.ts:104-114` bloqueia consentimento ausente/revogado. |
| Politica e limite de prompt antes do provider | `CUMPRE` | `source-grounded-ai.service.ts:119-124` resolve politica e chama `assertPromptWithinLimit(...)`; `ai-model-policies.service.ts:37-52` bloqueia prompt demasiado grande. |
| Quota antes do provider | `CUMPRE` | `source-grounded-ai.service.ts:125-130` reserva quota antes de `generateAnswer(...)`; `ai-quotas.service.ts:81-107` aplica limite mensal de forma atomica. |
| Prompt limitado a fontes autorizadas | `CUMPRE` | `source-grounded-ai.service.ts:223-236` instrui a usar apenas factos suportados pelas fontes e lista apenas citacoes autorizadas. |
| Provider invalido sem persistencia | `CUMPRE` | `source-grounded-ai.service.ts:276-283` bloqueia resposta vazia/invalida; `source-grounded-ai.service.spec.ts:250-262` prova que nao persiste. |
| Persistencia apos validacoes | `CUMPRE` | `source-grounded-ai.service.ts:132-150` persiste apenas depois de fontes, governanca e provider validos. |
| Cliente frontend tipado | `CUMPRE` | `ask-source-grounded-ai.ts:9-22` tipa resposta; `:30-40` chama o endpoint real. |
| Frontend com cookies HttpOnly | `CUMPRE` | `request-mf3-json.ts:17-21` usa `credentials: "include"` e header CSRF. |
| UI com loading/erro/vazio/sucesso | `CUMPRE` | `source-grounded-ai-panel.tsx:27-47` gere loading/error/answer; `:61-94` mostra erro e estado vazio; `:95-110` mostra resposta e citacoes. |
| Testes de caminho feliz e negativos | `CUMPRE` | `source-grounded-ai.service.spec.ts:23-83`, `:125-191`, `:194-287`; `source-grounded-ai.contract.spec.ts:77-195`; `citation-policy.spec.ts:3-59`. |
| Ausencia de endpoint duplicado para a responsabilidade | `CUMPRE` | Pesquisa `source-grounded` encontrou o endpoint unico `POST /api/ai/source-grounded-answers` e referencias de teste/mapa tecnico, sem segunda surface concorrente. |

## Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts` |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts` |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`, `schemas/source-grounded-ai-answer.schema.ts`, `source-grounded-ai.controller.ts`, `source-grounded-ai.module.ts` | `npm --prefix real_dev/api test -- source-grounded-ai` |
| `BK-MF8-02` | `RNF35` | `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`, `source-grounded-ai-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts` | `npm --prefix real_dev/web run build` |

## Mapa de integracao da MF

- Endpoint auditado: `POST /api/ai/source-grounded-answers`.
- Controller: `SourceGroundedAiController`, protegido por `SessionGuard`.
- DTO: `AskSourceGroundedAiDto`, sem identidade controlada pelo frontend.
- Service: `SourceGroundedAiService`, com ordem segura: fonte legivel/concluida -> citacao publica -> consentimento -> politica -> limite de prompt -> quota -> provider -> persistencia.
- Policy de citacao: `normalizePublicCitation(...)`, com `sourceLabel`, `locator` e `excerpt` obrigatorios.
- Persistencia: `SourceGroundedAiAnswer`, com `actorId`, `sourceJobIds`, pergunta, resposta e citacoes publicas limitadas.
- UI: `SourceGroundedAiPanel`, com loading, erro, estado vazio, sucesso e lista de citacoes.
- Cliente API: `askSourceGroundedAi(...)`, reaproveitando `requestMf3Json(...)` com `credentials: "include"`.

## Contratos consumidos

- `MF0`: `SessionGuard` e `AuthenticatedUser` como fonte de identidade.
- `MF3`: `requestMf3Json(...)` com cookies HttpOnly/CSRF e contrato historico de IA com citacoes.
- `MF4`: consentimentos, politicas de modelo e quotas antes do provider.
- `MF6`: isolamento de dados, CSRF, HTTPS/cookies HttpOnly e negativos de acesso.
- `MF7`: `findReadableDoneJob(...)` como fronteira de fontes processaveis autorizadas e limites antes do provider.
- `BK-MF8-01`: pedidos inseguros/enviesados ficam cobertos pela barreira etica anterior ao trabalho factual.

## Contratos entregues para BKs seguintes

- `POST /api/ai/source-grounded-answers` como superficie estavel para respostas factuais com fontes obrigatorias.
- Erro funcional `NO_INDEXED_SOURCES` quando nao existem fontes citaveis.
- Finalidade de governanca `SOURCE_GROUNDED_AI`.
- Citacoes publicas limitadas com `sourceJobId`, `materialId`, `sourceLabel`, `locator` e `excerpt`.
- `BK-MF8-03` pode assumir que respostas factuais ja exigem fontes autorizadas e fallback honesto antes de adaptar explicacoes ao nivel do aluno.

## Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 consome a validacao de fontes e governanca IA ja entregues, sem criar modelo paralelo nem aceitar `userId` vindo do frontend.
- `BK-MF8-01 -> BK-MF8-02`: `COERENTE`. O BK02 fecha factualidade com fontes obrigatorias depois da barreira etica do BK01.
- `BK-MF8-02 -> BK-MF8-03`: `COERENTE`. O proximo BK pode reutilizar fontes obrigatorias, citacoes publicas e fallback honesto para explicacoes adaptadas.
- Nao foi detetada regressao em auth, ownership, membership, DTOs, schemas, UI ou comandos.

## Findings por severidade

- `P0`: nenhum.
- `P1`: nenhum.
- `P2`: nenhum.
- `P3`: nenhum.

## Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` no alvo | `PASS` - sem ocorrencias. |
| segredos, tokens, passwords, secrets | `PASS` - sem ocorrencias relevantes. |
| `as any`, `payload: unknown`, TODOs vagos | `PASS` - sem ocorrencias. |
| claims indevidos sobre RAG, embeddings, OCR, chunking, indexacao automatica | `PASS` - sem ocorrencias no alvo. |
| prompts privados, respostas IA privadas, materiais privados em logs/evidence | `PASS` - sem logs/evidence com dados sensiveis observados; persistencia guarda resposta e citacoes publicas do proprio pedido. |
| `cookie` | `PASS_COM_JUSTIFICACAO` - ocorrencias sao comentarios de seguranca sobre cookies HttpOnly no helper `requestMf3Json(...)` e referencias do relatorio; sem valores sensiveis. |
| `materiais privados` | `PASS_COM_JUSTIFICACAO` - comentario de dominio em `source-grounded-ai.service.ts:96`; nao expoe material nem dados reais. |

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- source-grounded-ai` | `PASS` - 3 suites, 16 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 88 suites, 356 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107/107/107, score 100, `overall_pass=true`. |

## Ficheiros auditados

- `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts`
- `real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`
- `real_dev/api/src/modules/source-grounded-ai/schemas/source-grounded-ai-answer.schema.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/ai-consents/ai-consents.service.ts`
- `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- `real_dev/api/src/modules/ai-quotas/ai-quotas.service.ts`
- `real_dev/api/src/app.module.ts`
- `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`

## Ficheiros alterados por esta auditoria

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`

Nao houve alteracao de codigo nesta execucao.

## Blockers e TODOs

- Blockers: nenhum.
- TODOs obrigatorios para `BK-MF8-02`: nenhum.
- Nota: `real_dev/` ignorado por Git e relatorios MF8 untracked sao estado de trabalho local esperado; nao foram tratados como finding.

## Proximos passos

Executar `MODO=implementar` para `BK-MF8-03`, reutilizando `POST /api/ai/source-grounded-answers`, `NO_INDEXED_SOURCES`, citacoes publicas limitadas e governanca IA como base para explicacoes adaptadas ao nivel do aluno.
