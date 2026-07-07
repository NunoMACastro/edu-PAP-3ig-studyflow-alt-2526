# IMPLEMENTACAO-REAL_DEV-MF8

## Execucao atual - BK-MF8-17

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-17`
- `Resultado`: `IMPLEMENTADO`
- `Decisao do gate final`: `PASS`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico e evidence do BK atualizados.

`BK-MF8-17 - Correcao de erros` foi implementado no `real_dev` como entrega de `RNF45`. A execucao consumiu `docs/evidence/MF8/TESTES-FINAIS.md`, corrigiu as falhas entregues pelo `BK-MF8-16`, criou o registo local `mf8:error-register`, gerou `docs/evidence/MF8/CORRECAO-ERROS.md` e reexecutou a bateria final ate todos os comandos, incluindo Playwright opcional, ficarem em `PASS`.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-17` / `RNF45` em matriz, backlog, contrato de campos e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` do guia foram mapeados para a estrutura real por contrato da prompt.
- Corrigido o finding herdado do `BK-MF8-16`: `TESTES-FINAIS.md` deixou de expor path absoluto local no campo `Ficheiro`.
- Criado `real_dev/api/src/scripts/mf8-error-register.ts` com parser de `TESTES-FINAIS.md`, regra `canCloseMf8Error(...)`, renderer Markdown e CLI.
- Criado `real_dev/api/src/scripts/mf8-error-register.spec.ts` com cobertura de erro revalidado, causa ausente, erro reaberto, parsing de tabela simples e parsing da tabela real do BK16.
- Atualizado `real_dev/api/package.json` com `mf8:error-register`.
- Corrigidos os E2E MF1/MF7 que tinham bloqueado o Playwright opcional: seletores ambíguos no smoke MF1 e dependência rígida de env vars no smoke MF7.
- Criada evidence `docs/evidence/MF8/CORRECAO-ERROS.md` com decisão final `PASS` e lista das correções revalidadas.
- Nao foram criados endpoints, controllers, DTOs, schemas, services de dominio, paginas React ou dependencias novas.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-17` | `RNF45` | `IMPLEMENTADO` | Script `mf8:error-register`, spec focada, evidence `CORRECAO-ERROS.md`, `TESTES-FINAIS.md` regenerado com todos os comandos em `PASS`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/mf8-error-register.ts` | Lê `TESTES-FINAIS.md`, cria registos para `FAIL`/`BLOQUEADO`, bloqueia fecho sem `RETESTED`, causa, correcao, validacao e nota de privacidade. |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/mf8-error-register.spec.ts` | `npm --prefix real_dev/api test -- mf8-error-register.spec.ts run-mf8-final-tests.spec.ts --runInBand`: 2 suites, 12 testes PASS. |
| `BK-MF8-17` | `RNF45` | `real_dev/api/src/scripts/run-mf8-final-tests.ts` | Normaliza path de evidence antes de renderizar `TESTES-FINAIS.md`. |
| `BK-MF8-17` | `RNF45` | `real_dev/web/tests/e2e/mf1-smoke.spec.ts` | Revalida smoke MF1 sem strict mode violation em links/textos duplicados. |
| `BK-MF8-17` | `RNF45` | `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts` | Revalida estados assíncronos MF7 com env vars opcionais e fallback para contas E2E semeadas. |
| `BK-MF8-17` | `RNF45` | `docs/evidence/MF8/CORRECAO-ERROS.md` | Regista decisão `PASS` e correções revalidadas desta execução. |

### Mapa de integracao da MF

- `BK-MF8-16 -> BK-MF8-17`: `COERENTE`. O BK17 consome `TESTES-FINAIS.md`, trata o path absoluto local e revalida o Playwright opcional que vinha como risco.
- `MF7 -> MF8`: `COERENTE`. A correção MF7 ficou limitada ao smoke E2E de estados assíncronos; não alterou serviços, endpoints, guards, ownership, membership ou UI real.
- `MF8 -> fecho de produto`: `COERENTE`. A cadeia `TESTES-EM-FALTA.md -> TESTES-FINAIS.md -> CORRECAO-ERROS.md` fica executável e pronta para defesa.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `RNF45` em `docs/RNF.md`: correção dos erros encontrados nos testes e revalidação final.
- `BK-MF8-16`: evidence `docs/evidence/MF8/TESTES-FINAIS.md`.
- Finding `P2-BK-MF8-16-01` do relatório de auditoria: path absoluto local em evidence final.
- Risco E2E opcional do BK16: Playwright com falhas MF1/MF7 a revalidar.

### Contratos entregues

- `MF8_FINAL_EVIDENCE_PATH`, `MF8_CORRECTION_EVIDENCE_PATH`, `Mf8FinalTestRow`, `Mf8ErrorRecord`, `Mf8CorrectionRegister`.
- `canCloseMf8Error(...)`, `extractFinalTestRows(...)`, `buildCorrectionRegister(...)`, `renderCorrectionRegisterMarkdown(...)`, `runMf8ErrorRegister(...)`.
- Comando `npm --prefix real_dev/api run mf8:error-register`.
- Evidence `docs/evidence/MF8/CORRECAO-ERROS.md`.
- `TESTES-FINAIS.md` regenerado com planificação, API unit, API build, web build e Playwright em `PASS`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: fechado nesta execucao: path absoluto local em `TESTES-FINAIS.md`; E2E opcional do BK16 revalidado com `29 passed`.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `FAIL`, `BLOQUEADO`, `/Users/`, `path-local`, `token=`, `cookie=`, `password=`, `secret=` em `docs/evidence/MF8/TESTES-FINAIS.md` | `PASS` - sem ocorrencias depois da regeneracao final. |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` nos ficheiros alterados | `PASS_COM_JUSTIFICACAO` - ocorrencias residuais pertencem a sanitizacao, nomes de variaveis de ambiente E2E, texto de privacidade/evidence ou testes; nao foram introduzidos storage de sessao, segredos reais, dados pessoais ou claims tecnicos proibidos. |

### Ficheiros alterados

- `real_dev/api/src/scripts/mf8-error-register.ts`
- `real_dev/api/src/scripts/mf8-error-register.spec.ts`
- `real_dev/api/src/scripts/run-mf8-final-tests.ts`
- `real_dev/api/src/scripts/run-mf8-final-tests.spec.ts`
- `real_dev/api/package.json`
- `real_dev/web/tests/e2e/mf1-smoke.spec.ts`
- `real_dev/web/tests/e2e/mf7-async-state-block.spec.ts`
- `docs/evidence/MF8/TESTES-FINAIS.md`
- `docs/evidence/MF8/CORRECAO-ERROS.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- mf8-error-register.spec.ts run-mf8-final-tests.spec.ts --runInBand` | `PASS` - 2 suites, 12 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts mf7-async-state-block.spec.ts` na sandbox | `BLOQUEADO_AMBIENTE` - `listen EPERM` ao arrancar MongoMemoryServer/API local. |
| `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts mf7-async-state-block.spec.ts` fora da sandbox | `PASS` - 5 testes. |
| `npm --prefix real_dev/web run test:e2e -- mf1-smoke.spec.ts` fora da sandbox | `PASS` - 1 teste. |
| `npm --prefix real_dev/api run mf8:final-tests` fora da sandbox | `PASS` - planificação PASS; API unit PASS com 97 suites e 412 testes; API build PASS; web build PASS; Playwright PASS com 29 testes. |
| `npm --prefix real_dev/api run mf8:error-register` | `PASS` - 0 erros finais registados; decisão `PASS`. |

### Blockers e TODOs

- Blockers de implementacao do BK17: nenhum.
- TODOs obrigatorios do BK17: nenhum.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git status` nao lista alteracoes internas de implementacao.

### Proxima acao recomendada

Executar uma auditoria fresca de `BK-MF8-17` se for preciso atualizar o relatório de auditoria MF8; nesta execução de implementação, a evidence final e o registo de correções já estão em `PASS`.

---

## Execucao atual - BK-MF8-16

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-16`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`, `BK-MF8-13`, `BK-MF8-14`, `BK-MF8-15`, `BK-MF8-16`
- `Resultado`: `IMPLEMENTADO`
- `Decisao do gate final`: `PASS_COM_RISCOS`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico e evidence do BK atualizados.

`BK-MF8-16 - Execucao final de testes` foi implementado no `real_dev` como entrega de `RNF42`. A implementacao cria um runner local para validar a evidence de `BK-MF8-15`, executar a bateria final de comandos reais, sanitizar outputs e gerar `docs/evidence/MF8/TESTES-FINAIS.md` como handoff objetivo para `BK-MF8-17`.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-16` / `RNF42` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` do guia foram mapeados para a estrutura real por contrato da prompt.
- Criado `real_dev/api/src/scripts/run-mf8-final-tests.ts` com plano final, runner substituivel, verificacao da evidence anterior, sanitizacao de stdout/stderr, renderer Markdown e CLI.
- Criado `real_dev/api/src/scripts/run-mf8-final-tests.spec.ts` com negativos de evidence ausente, falha obrigatoria, paths `real_dev`, sanitizacao, evidence acentuada e decisao positiva.
- Atualizado `real_dev/api/package.json` com `mf8:final-tests`.
- Criada evidence `docs/evidence/MF8/TESTES-FINAIS.md` com decisao `PASS` para comandos obrigatorios e risco explicito do E2E opcional.
- Nao foram criados endpoints, controllers, DTOs, schemas, paginas React, clientes API, dependencias novas, storage de browser ou acesso a dados reais.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF42` | `IMPLEMENTADO` | Runner `mf8:final-tests`, spec focada, comando npm e evidence `TESTES-FINAIS.md` com bateria obrigatoria em `PASS`. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF42` | `real_dev/api/src/scripts/run-mf8-final-tests.ts` | Valida `TESTES-EM-FALTA.md`, executa planificacao, API unit, API build, web build e Playwright opcional, e grava `TESTES-FINAIS.md`. |
| `BK-MF8-16` | `RNF42` | `real_dev/api/src/scripts/run-mf8-final-tests.spec.ts` | `npm --prefix real_dev/api test -- run-mf8-final-tests.spec.ts --runInBand`: 1 suite, 6 testes PASS. |
| `BK-MF8-16` | `RNF42` | `real_dev/api/package.json` | Script `mf8:final-tests` executa `nest build && node dist/scripts/run-mf8-final-tests.js`. |
| `BK-MF8-16` | `RNF42` | `docs/evidence/MF8/TESTES-FINAIS.md` | Evidence final: planificacao PASS, API unit PASS, API build PASS, web build PASS, Playwright opcional BLOQUEADO com 24/29 testes a passar fora da sandbox. |

### Mapa de integracao da MF

- `BK-MF8-15 -> BK-MF8-16`: `COERENTE`. O runner consome `docs/evidence/MF8/TESTES-EM-FALTA.md`, confirma estado `PASS` e so executa a bateria final quando a evidence anterior permite avancar.
- `BK-MF8-16 -> BK-MF8-17`: `COERENTE_COM_RISCOS`. A evidence final entrega a lista objetiva para correcao: comandos obrigatorios passaram; Playwright E2E opcional falhou com 5 testes a revalidar.
- `MF7 -> MF8`: `COERENTE_COM_RISCOS`. Build, unidade API e planificacao passam; o E2E opcional revelou falhas em fluxos MF1/MF7 que pertencem ao handoff de correcao, nao a implementacao nova de RNF42.
- Resultado geral de coerencia: `COERENTE_COM_RISCOS`.

### Contratos consumidos

- `RNF42` em `docs/RNF.md`: execucao final da bateria de testes e recolha de evidence.
- `BK-MF8-15`: evidence `docs/evidence/MF8/TESTES-EM-FALTA.md`, sem lacunas P0 e com decisao positiva para execucao final.
- Scripts reais: `bash scripts/validate-planificacao.sh`, `npm --prefix real_dev/api run test:unit`, `npm --prefix real_dev/api run build`, `npm --prefix real_dev/web run build`, `npm --prefix real_dev/web run test:e2e`.
- Configuracao real `real_dev/api/package.json`, `real_dev/api/jest.config.cjs`, `real_dev/api/tsconfig.json`, `real_dev/web/package.json` e `real_dev/web/playwright.config.ts`.

### Contratos entregues

- `FinalGateStatus`, `FinalTestCommand`, `FinalTestResult`, `InventoryEvidenceCheck`, `FinalGateEvidence`, `CommandRunner`.
- `resolveRepoRoot(...)`, `buildMf8FinalTestPlan(...)`, `formatCommandLine(...)`, `sanitizeOutput(...)`, `validateInventoryEvidence(...)`, `runFinalTestCommand(...)`, `runFinalTestPlan(...)`, `hasBlockingFailure(...)`, `renderFinalEvidenceMarkdown(...)`, `createMf8FinalEvidence(...)`, `runMf8FinalTestsCli()`.
- Comando `npm --prefix real_dev/api run mf8:final-tests`.
- Evidence `docs/evidence/MF8/TESTES-FINAIS.md`.
- Handoff para `BK-MF8-17`: corrigir ou revalidar as 5 falhas E2E opcionais, mantendo os obrigatorios ja comprovados.

### Coerencia entre MFs

- `MF6/MF7 -> MF8`: `COERENTE_COM_RISCOS`. O gate final reutiliza scripts e testes existentes sem alterar dominio, auth, ownership, membership, deploy readiness ou health check.
- `MF8 -> BK-MF8-17`: `COERENTE_COM_RISCOS`. O proximo BK pode consumir a evidence final para registar erros, causa, correcao e revalidacao.
- Resultado geral de coerencia: `COERENTE_COM_RISCOS`.

### Findings por severidade

- `P0`: nenhum finding aberto na implementacao do BK16.
- `P1`: nenhum finding aberto na implementacao do BK16.
- `P2`: risco de validacao opcional: `npm --prefix real_dev/web run test:e2e` executou fora da sandbox, mas terminou com 5 falhas e 24 testes passados; encaminhado para `BK-MF8-17`.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` nos ficheiros alterados | `PASS_COM_JUSTIFICACAO` - ocorrencias de `token`, `password`, `secret`, `cookie`, `prompt` aparecem apenas na funcao de sanitizacao, no teste que prova remocao de segredo e em nomes/outputs de comandos; nao foram introduzidos storage de sessao, segredos reais, dados pessoais ou claims tecnicos proibidos. |
| Paths privados `real_dev` em guias canonicos | `PASS` - os guias canonicos nao foram alterados nesta execucao; a implementacao e os relatorios usam `real_dev` por contrato da prompt. |

### Ficheiros alterados

- `real_dev/api/src/scripts/run-mf8-final-tests.ts`
- `real_dev/api/src/scripts/run-mf8-final-tests.spec.ts`
- `real_dev/api/package.json`
- `docs/evidence/MF8/TESTES-FINAIS.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `docs/evidence/MF8/TESTES-EM-FALTA.md`
- `real_dev/api/package.json`
- `real_dev/api/jest.config.cjs`
- `real_dev/api/tsconfig.json`
- `real_dev/web/package.json`
- `real_dev/web/playwright.config.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- run-mf8-final-tests.spec.ts --runInBand` | `PASS` - 1 suite, 6 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/api run mf8:final-tests` na sandbox | `PASS_COM_RISCO` - obrigatorios PASS; Playwright opcional bloqueou inicialmente por `listen EPERM`. |
| `npm --prefix real_dev/api run mf8:final-tests` fora da sandbox | `PASS_COM_RISCO` - evidence gerada; planificacao PASS; API unit PASS com 96 suites e 406 testes; API build PASS; web build PASS; Playwright opcional BLOQUEADO com 24 passed e 5 failed. |
| `bash scripts/validate-planificacao.sh` | `PASS` dentro do runner final - `overall_pass: true`, 107 BK na matriz/backlog/guias, score 100. |
| `npm --prefix real_dev/api run test:unit` | `PASS` dentro do runner final - 96 suites, 406 testes. |
| `npm --prefix real_dev/web run build` | `PASS` dentro do runner final - 129 modulos transformados. |
| `npm --prefix real_dev/web run test:e2e` | `BLOQUEADO/RISCO` dentro do runner final fora da sandbox - 24 passed, 5 failed; falhas encaminhadas para `BK-MF8-17`. |

### Falhas E2E opcionais entregues ao BK-MF8-17

- `tests/e2e/mf1-smoke.spec.ts:93:1` - `MF1 smoke: professor e aluno percorrem os fluxos principais com sessao real`.
- `tests/e2e/mf7-async-state-block.spec.ts:71:1` - `MF7 aluno mostra estado vazio quando não há artefactos`.
- `tests/e2e/mf7-async-state-block.spec.ts:88:1` - `MF7 aluno mostra erro de carregamento sem bloquear ações`.
- `tests/e2e/mf7-async-state-block.spec.ts:105:1` - `MF7 aluno mostra erro de geração sem perder listas`.
- `tests/e2e/mf7-async-state-block.spec.ts:134:1` - `MF7 professor mostra erro de listagem sem bloquear formulário`.

### Blockers e TODOs

- Blockers de implementacao do BK16: nenhum.
- TODOs obrigatorios do BK16: nenhum.
- Risco entregue ao BK17: Playwright E2E opcional com 5 falhas reais fora da sandbox.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git status` nao lista alteracoes internas de implementacao.

### Proxima acao recomendada

Executar `BK-MF8-17 - Correcao de erros`, consumindo `docs/evidence/MF8/TESTES-FINAIS.md` para registar causa, correcao e revalidacao das falhas E2E opcionais.

---

## Execucao atual - BK-MF8-15

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-15`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`, `BK-MF8-13`, `BK-MF8-14`, `BK-MF8-15`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico e evidence do BK atualizados.

`BK-MF8-15 - Verificacao dos testes atuais e criacao dos testes em falta` foi implementado no `real_dev` como entrega de `RNF41`. A implementacao cria um inventario automatico de testes criticos, exposto por comando local, com teste unitario proprio e evidence segura em Markdown para o handoff do `BK-MF8-16`.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-15` / `RNF41` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de implementacao, plano de sprints e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` do guia foram mapeados para a estrutura real.
- Criado `real_dev/api/src/scripts/mf8-test-inventory.ts` com manifesto de 8 alvos criticos de API e web, discovery controlado, classificacao `covered` / `missing-spec` / `missing-source`, renderer Markdown e CLI.
- Criado `real_dev/api/src/scripts/mf8-test-inventory.spec.ts` com cobertura de caso coberto, teste em falta, ficheiro base em falta e output Markdown deterministico.
- Atualizado `real_dev/api/package.json` com `mf8:test-inventory`.
- Criada evidence `docs/evidence/MF8/TESTES-EM-FALTA.md` com 8/8 alvos cobertos, 0 testes em falta, 0 ficheiros base em falta e decisao positiva para `BK-MF8-16`.
- Nao foram criados endpoints, controllers, DTOs, schemas, paginas React, clientes API, dependencias novas, storage de browser ou acesso a dados reais.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-15` | `RNF41` | `IMPLEMENTADO` | Script `mf8-test-inventory`, spec focada, comando npm, evidence `TESTES-EM-FALTA.md` com 8/8 alvos cobertos. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-15` | `RNF41` | `real_dev/api/src/scripts/mf8-test-inventory.ts` | Manifesto cobre `study-tools`, `ai-artifact.validator`, `official-tests`, `room-ai`, `room-shares`, o proprio inventario, `mf8-flashcards` e `mf6-background-jobs`. |
| `BK-MF8-15` | `RNF41` | `real_dev/api/src/scripts/mf8-test-inventory.spec.ts` | `npm --prefix real_dev/api test -- mf8-test-inventory.spec.ts --runInBand`: 1 suite, 3 testes PASS. |
| `BK-MF8-15` | `RNF41` | `real_dev/api/package.json` | Script `mf8:test-inventory` executa `nest build && node dist/scripts/mf8-test-inventory.js`. |
| `BK-MF8-15` | `RNF41` | `docs/evidence/MF8/TESTES-EM-FALTA.md` | Evidence gerada pelo comando silencioso: 8 alvos criticos, 8 cobertos, 0 testes em falta, 0 ficheiros base em falta. |

### Mapa de integracao da MF

- `BK-MF8-14 -> BK-MF8-15`: `COERENTE`. O inventario confirma a suite `real_dev/web/tests/e2e/mf8-flashcards.spec.ts` entregue pelo BK14.
- `BK-MF8-15 -> BK-MF8-16`: `COERENTE`. O BK15 entrega comando `mf8:test-inventory`, script, spec e evidence que o gate final pode consultar antes da bateria final.
- `MF6/MF7 -> MF8`: `COERENTE`. O inventario reutiliza os contratos de testes, modularidade e qualidade ja existentes, sem duplicar dominio funcional nem contornar auth/ownership.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `RNF41` em `docs/RNF.md`: verificacao dos testes atuais e criacao dos testes em falta.
- `BK-MF8-14`: existencia de UI/teste de flashcards para inventario.
- Suites criticas existentes em `real_dev/api/src/modules/**` e `real_dev/web/tests/e2e/**`.
- Configuracao real `real_dev/api/package.json`, `real_dev/api/jest.config.cjs`, `real_dev/api/tsconfig.json` e `real_dev/web/package.json`.

### Contratos entregues

- `CriticalTestTarget`, `TestInventoryItem`, `TestInventorySummary`, `InventoryStatus`.
- `mf8CriticalTestTargets`.
- `collectProjectFiles(...)`, `mergeFileSets(...)`, `checkTestCoverage(...)`, `findMissingCriticalTests(...)`, `createMf8TestInventory(...)`, `renderInventoryMarkdown(...)`, `runMf8TestInventoryCli()`.
- Comando `npm --prefix real_dev/api run mf8:test-inventory`.
- Evidence `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Criterio de avanco para `BK-MF8-16`: sem lacunas P0, sem specs em falta e sem ficheiros base em falta no manifesto atual.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A implementacao reforca qualidade e manutencao sem alterar o mapa tecnico, deploy readiness, health checks ou contratos de seguranca anteriores.
- `MF8 -> BK-MF8-16`: `COERENTE`. A evidence permite que a execucao final de testes arranque com lista verificavel e decisao explicita.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` nos ficheiros alterados | `PASS_COM_JUSTIFICACAO` - nao foram introduzidos storage de sessao, segredos, prompts privados, dados pessoais, claims de RAG/OCR/chunking ou mocks usados como solucao final. Ocorrencias residuais pertencem a termos esperados de paths/strings de teste e a pesquisa negativa. |
| Paths de implementacao real no guia canonico `BK-MF8-15` | `PASS` - o guia nao foi alterado; a implementacao e o relatorio usam `real_dev` por contrato da prompt. |

### Ficheiros alterados

- `real_dev/api/src/scripts/mf8-test-inventory.ts`
- `real_dev/api/src/scripts/mf8-test-inventory.spec.ts`
- `real_dev/api/package.json`
- `docs/evidence/MF8/TESTES-EM-FALTA.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-execucao-final-de-testes.md`
- `real_dev/api/jest.config.cjs`
- `real_dev/api/tsconfig.json`
- `real_dev/api/src/modules/ai/study-tools.service.spec.ts`
- `real_dev/api/src/modules/ai/validators/ai-artifact.validator.spec.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-shares.service.spec.ts`
- `real_dev/web/package.json`
- `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`
- `real_dev/web/tests/e2e/mf6-background-jobs.spec.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- mf8-test-inventory.spec.ts --runInBand` | `PASS` - 1 suite, 3 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm run --silent mf8:test-inventory > ../../docs/evidence/MF8/TESTES-EM-FALTA.md` em `real_dev/api` | `PASS` - evidence gerada com 8/8 alvos cobertos. |
| `npm --prefix real_dev/api test` | `PASS` - 95 suites, 400 testes. |
| `npm --prefix real_dev/api run mf8:test-inventory` | `PASS` - 8 alvos criticos, 8 cobertos, 0 testes em falta, 0 ficheiros base em falta. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS` - `overall_pass: true`, 107 BK na matriz/backlog/guias, score 100. |
| `git diff --check` | `PASS` - sem output. |
| `rg -n "[ \t]+$" ...ficheiros alterados...` | `PASS` - sem whitespace final. |

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-15`.
- TODOs obrigatorios: nenhum.
- Sem lacunas `P0` no inventario atual.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git status` nao lista alteracoes internas de implementacao.

### Proxima acao recomendada

Avancar para `BK-MF8-16 - Execucao final de testes`, usando `docs/evidence/MF8/TESTES-EM-FALTA.md` como evidence de entrada e `npm --prefix real_dev/api run mf8:test-inventory` como gate previo.

---

## Execucao atual - BK-MF8-14

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-14`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`, `BK-MF8-13`, `BK-MF8-14`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-14 - Flashcards em modo de exercicio e revisao` foi implementado no `real_dev` como entrega de `RF12`. A implementacao reutiliza o contrato `AiArtifact` e o endpoint ja protegido por sessao `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, nao cria backend novo, nao persiste progresso de treino no browser e transforma o painel de flashcards numa experiencia ativa com modo exercicio, modo revisao, revelacao controlada, avancar, conclusao, recomeco e fontes.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-14` / `RF12` em `docs/RF.md`, matriz, backlog, contrato de campos, MF views, plano de implementacao, plano de sprints e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` do guia foram mapeados para a estrutura real.
- Revisto o backend existente: `StudyToolsController.list(...)` delega em `StudyToolsService.listTools(...)`, que valida `type`, chama `areasService.getMyStudyArea(userId, studyAreaId)` e filtra `AiArtifact` por `userId`, `studyAreaId` e tipo.
- Criado `real_dev/web/src/features/mf8/flashcard-practice.ts` para concentrar estado local de treino sem `localStorage` nem `sessionStorage`.
- Atualizado `real_dev/web/src/components/ai/FlashcardsPanel.tsx` para ler apenas cards validos, mostrar resposta escondida no modo exercicio, suportar modo revisao, avancar, concluir, recomecar e manter fontes via `ArtifactSources`.
- Criado `real_dev/web/tests/e2e/mf8-flashcards.spec.ts` com testes de unidade de estado e teste Playwright da UI real com API intercetada por dados minimos.
- Preservado o contrato de privacidade: sem prompts, tokens, cookies, materiais integrais ou respostas privadas em storage persistente ou logs.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-12` | `RF28` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-13` | `RF28, RF30` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-14` | `RF12` | `IMPLEMENTADO` | Estado local, UI interativa de flashcards, fontes preservadas, build web e Playwright focado com 3 testes. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-14` | `RF12` | `real_dev/api/src/modules/ai/study-tools.controller.ts`, `real_dev/api/src/modules/ai/study-tools.service.ts`, `real_dev/api/src/modules/ai/schemas/ai-artifact.schema.ts` | Contrato backend revisto: `GET /api/study-areas/:id/study-tools?type=FLASHCARDS`, `SessionGuard`, `getMyStudyArea(...)`, filtro por `userId`/`studyAreaId` e enum `FLASHCARDS`. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/student/StudyToolsPage.tsx` | Cliente `listStudyTools(...)` e pagina consumidora preservados; `requestJson(...)` centraliza `credentials: "include"` e CSRF marker. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/features/mf8/flashcard-practice.ts` | Funcoes puras cobertas por Playwright: estado inicial esconde resposta, revelar mostra resposta, avancar termina ou mantem revisao visivel. |
| `BK-MF8-14` | `RF12` | `real_dev/web/src/components/ai/FlashcardsPanel.tsx` | UI mostra modo exercicio/revisao, pergunta, resposta escondida, mostrar resposta, seguinte/concluir, recomecar e fontes. |
| `BK-MF8-14` | `RF12` | `real_dev/web/tests/e2e/mf8-flashcards.spec.ts` | 3 testes passam: dois de estado local e um fluxo UI com resposta escondida antes do clique, revelacao, avancar e conclusao. |

### Mapa de integracao da MF

- `BK-MF0-12 -> BK-MF8-14`: `COERENTE`. O BK14 consome o contrato de artefactos `FLASHCARDS` criado anteriormente, sem reabrir geracao IA nem criar outro modelo.
- `BK-MF8-13 -> BK-MF8-14`: `COERENTE`. O ranking de mini-testes oficiais nao e dependencia tecnica do painel de flashcards; a sequencia MF8 mantem dominios separados.
- `BK-MF8-14 -> BK-MF8-15`: `COERENTE`. O BK14 entrega uma suite `mf8-flashcards.spec.ts` e uma UI testavel para o inventario de testes do BK15.
- `MF6 -> MF8`: `COERENTE`. O acesso a artefactos continua protegido no backend por sessao e ownership; a UI nao recebe nem envia `userId`.
- `MF7 -> MF8`: `COERENTE`. O frontend preserva componentes reutilizaveis e o teste usa Playwright ja configurado.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `AiArtifact` com `type: "FLASHCARDS"`, `contentJson` e `sourcesJson`.
- `StudyToolsController.list(...)` e `StudyToolsService.listTools(...)`.
- `StudyAreasService.getMyStudyArea(userId, studyAreaId)` como barreira de ownership.
- Cliente frontend comum `requestJson(...)`, com cookies HttpOnly, `credentials: "include"` e `x-studyflow-csrf`.
- `ArtifactSources` para manter explicabilidade por metadados curtos de materiais.
- Rota protegida `/app/areas/:id/ferramentas`.

### Contratos entregues

- `FlashcardPracticeMode`.
- `FlashcardPracticeState`.
- `createFlashcardPracticeState(...)`.
- `revealFlashcardAnswer(...)`.
- `moveToNextFlashcard(...)`.
- `setFlashcardPracticeMode(...)`.
- `restartFlashcardPractice(...)`.
- `FlashcardsPanel` com modo exercicio/revisao e resposta controlada.
- Suite `mf8-flashcards.spec.ts` para o inventario do `BK-MF8-15`.

### Coerencia entre MFs

- `MF0 -> MF8`: `COERENTE`. `RF12` ja previa explicacoes, cards e quizzes personalizados; este BK melhora a experiencia dos cards sem alterar a persistencia.
- `MF6 -> MF8`: `COERENTE`. Sem storage persistente no browser, sem tokens/sessao em JavaScript e sem decisao de ownership no frontend.
- `MF7 -> MF8`: `COERENTE`. Implementacao componentizada no frontend e teste E2E focado.
- `MF8 -> BK-MF8-15`: `COERENTE`. O proximo BK pode verificar a existencia de `mf8-flashcards.spec.ts` e tratar o painel como fluxo testavel.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, `TODO`, `FIXME`, `mock`, `stub`, `fake`, `secret`, `token`, `password`, `cookie`, `RAG`, `embeddings`, `OCR`, `chunking`, `prompt`, `dados sensiveis` nos ficheiros alterados e backend revisto | `PASS_COM_JUSTIFICACAO` - ocorrencias benignas: `buildStudyToolPrompt(...)` no service existente e credenciais E2E/fallback de seed no teste; nenhum storage de sessao, segredo hardcoded novo, log sensivel ou promessa de RAG/OCR/chunking introduzido no BK14. |
| `AiArtifact`, `FLASHCARDS`, `getMyStudyArea`, `listTools`, `StudyToolsController`, `listStudyTools` na superficie revista | `PASS` - contratos encontrados em backend, cliente e pagina consumidora. |
| `real_dev` nos guias diretamente ligados ao BK14 | `PASS` - o codigo foi implementado em `real_dev`, mas os guias canonicos nao foram alterados nesta execucao. |

### Ficheiros alterados

- `real_dev/web/src/features/mf8/flashcard-practice.ts`
- `real_dev/web/src/components/ai/FlashcardsPanel.tsx`
- `real_dev/web/tests/e2e/mf8-flashcards.spec.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai/study-tools.service.ts`
- `real_dev/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `real_dev/web/package.json`
- `real_dev/web/playwright.config.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`
- `real_dev/web/src/components/ai/ArtifactSources.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 129 modulos transformados. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` | `BLOQUEADO_NO_SANDBOX` - primeira execucao falhou por `listen EPERM: operation not permitted 0.0.0.0` ao arrancar `MongoMemoryServer`, sem evidencia de regressao funcional. |
| `npm --prefix real_dev/web run test:e2e -- mf8-flashcards.spec.ts` fora do sandbox com aprovacao | `PASS` - 3 testes Playwright em Chromium passaram em 12.5s. |
| Pesquisa estatica obrigatoria nos ficheiros/superficie afetados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos esperados em service de IA existente e credenciais E2E de seed. |
| `git diff --check` | `PASS` - sem output. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md real_dev/web/src/features/mf8/flashcard-practice.ts real_dev/web/src/components/ai/FlashcardsPanel.tsx real_dev/web/tests/e2e/mf8-flashcards.spec.ts` | `PASS` - sem whitespace final. |
| `rg -n "real_dev" docs/planificacao/guias-bk/MF8/BK-MF8-13-... docs/planificacao/guias-bk/MF8/BK-MF8-14-... docs/planificacao/guias-bk/MF8/BK-MF8-15-...` | `PASS` - sem leakage de caminho privado nos guias canonicos adjacentes. |

Nota: nao foram executados `npm --prefix real_dev/api test` nem `npm --prefix real_dev/api run build` nesta execucao porque o BK14 nao alterou backend; a superficie backend foi revista estaticamente para confirmar o contrato consumido.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-14`.
- TODOs obrigatorios: nenhum.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git diff` nao lista as alteracoes de implementacao, mas os ficheiros foram alterados diretamente em `real_dev`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-14` ou avancar para `BK-MF8-15`, assumindo que os flashcards ficaram com UI de exercicio/revisao, estado local testavel, fontes preservadas, build web verde e suite Playwright focada.

---

## Execucao atual - BK-MF8-13

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-13`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`, `BK-MF8-13`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-13 - Rankings dos mini-testes oficiais` foi implementado no `real_dev` como entrega de `RF28` e `RF30`. A implementacao consome o contrato `OfficialTestAttempt` entregue por `BK-MF8-12`, cria ranking docente filtrado por professor, disciplina, teste e turma, expoe `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`, adiciona cliente frontend tipado, cria a pagina `OfficialTestRankingPage`, integra uma rota protegida de professor e fecha os negativos principais com suite Jest focada.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-13` / `RF28, RF30` em `docs/RF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` no guia foram mapeados para a estrutura real.
- Criado `OfficialTestRankingService` para validar role de professor, ownership docente da disciplina, existencia do teste dentro da disciplina e leitura de tentativas filtradas por `testId`, `subjectId` e `classId`.
- Criado helper puro `buildOfficialTestRanking(...)`, que ordena por `percentage` descendente e, em empate, por `answeredAt` ascendente.
- Atualizado `OfficialTestsModule` para registar e exportar `OfficialTestRankingService`, preservando `OfficialTestsService` e o schema `OfficialTestAttempt`.
- Atualizado `OfficialTestsController` para expor `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`, protegido por `SessionGuard`.
- Atualizado `apiClient.ts` com tipos `OfficialTestRankingRow`, `OfficialTestRanking` e funcao `getOfficialTestRanking(...)`.
- Criada `OfficialTestRankingPage` com loading, vazio, erro e sucesso em tabela acessivel.
- Atualizada a pagina docente de testes oficiais com link para o ranking de cada mini-teste.
- Atualizada a navegacao protegida para resolver `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`.
- Criada suite `official-test-ranking.service.spec.ts` para professor errado, ownership, teste inexistente, ordenacao e minimizacao de dados.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-12` | `RF28` | `IMPLEMENTADO` | Tentativas oficiais de aluno, pontuacao backend e UI real. |
| `BK-MF8-13` | `RF28, RF30` | `IMPLEMENTADO` | Ranking docente, endpoint, cliente API, pagina React, rota e 5 testes focados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts` | `OfficialTestRankingService.listForTeacher(...)` valida professor antes de queries sensiveis, usa `SubjectsService.findOwnedSubject(...)` e so lista tentativas de `testId`, `subjectId` e `classId` filtrados. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts` | `buildOfficialTestRanking(...)` ordena por pontuacao descendente e data ascendente em empate, devolvendo apenas posicao, referencia curta, score e data. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-tests.module.ts` | Provider de ranking registado e exportado sem remover `OfficialTestsService` nem o schema `OfficialTestAttempt`. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-tests.controller.ts` | `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking` delegado ao service de dominio e protegido por `SessionGuard`. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/web/src/lib/apiClient.ts` | `getOfficialTestRanking(...)` usa o cliente comum `requestJson(...)`, herdando `credentials: "include"` e CSRF marker sem storage local de sessao. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/web/src/pages/teacher/OfficialTestRankingPage.tsx` | UI com loading, erro, vazio e tabela com `caption`, headings e texto PT-PT. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/web/src/pages/teacher/TeacherOfficialTestsPage.tsx`, `real_dev/web/src/routes/protectedRoutes.tsx` | Link docente "Ver ranking" e rota protegida `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`. |
| `BK-MF8-13` | `RF28, RF30` | `real_dev/api/src/modules/official-tests/official-test-ranking.service.spec.ts` | 5 testes focados cobrem role errada, ownership, teste inexistente, ordenacao/empate e ausencia de `results`/email no ranking. |

### Mapa de integracao da MF

- `BK-MF8-12 -> BK-MF8-13`: `COERENTE`. O ranking consome `OfficialTestAttempt` persistido pelo aluno, incluindo `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage` e `answeredAt`.
- `BK-MF8-13 -> BK-MF8-14`: `COERENTE`. O handoff para flashcards nao depende de ranking publico, dashboard avancado ou novo endpoint de IA.
- `MF2 -> MF8`: `COERENTE`. O teste oficial continua a ser `OfficialTest`; o BK13 apenas le ranking de tentativas para um professor dono da disciplina.
- `MF6 -> MF8`: `COERENTE`. Role, ownership e filtros de disciplina/turma/teste ficam no backend; o frontend nao decide autorizacao.
- `MF7 -> MF8`: `COERENTE`. O codigo novo fica no dominio modular `official-tests`, com service/controller/module/testes e builds verdes.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `OfficialTest` e `OfficialTestAttempt` do dominio `official-tests`.
- `SubjectsService.findOwnedSubject(teacherId, subjectId)` como barreira de ownership docente.
- `SessionGuard` e `AuthenticatedRequest.user` como origem unica de role e `teacherId`.
- Cliente frontend comum `requestJson(...)`, com cookies HttpOnly, `credentials: "include"` e `x-studyflow-csrf`.
- Rota docente existente `/app/professor/disciplinas/:subjectId/testes`.

### Contratos entregues

- `OfficialTestRankingService`.
- `buildOfficialTestRanking(...)`.
- `OfficialTestRankingView` e `OfficialTestRankingRow`.
- `GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
- Tipos frontend `OfficialTestRanking` e `OfficialTestRankingRow`.
- Funcao frontend `getOfficialTestRanking(subjectId, testId)`.
- Pagina `OfficialTestRankingPage`.
- Rota `/app/professor/disciplinas/:subjectId/testes/:testId/ranking`.
- Suite `official-test-ranking.service.spec.ts`.

### Coerencia entre MFs

- `MF2 -> MF8`: `COERENTE`. `RF28` mantem a criacao docente de testes oficiais e o BK13 so acrescenta leitura segura de resultados.
- `MF6 -> MF8`: `COERENTE`. Sem `teacherId`, `classId`, role ou permissao vindos do frontend; a decisao critica fica no backend.
- `MF7 -> MF8`: `COERENTE`. A implementacao preserva organizacao modular e compila em API e web.
- `MF8 -> BK-MF8-14`: `COERENTE`. Flashcards continuam independentes do ranking; nao houve scope creep para analytics avancado.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embedding`, `OCR`, `chunking`, `prompt privado`, `dados pessoais`, `console.log`, `logger.`, `secret`, `apiKey`, `private key`, `token`, `password`, `cookie` nos ficheiros alterados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos ja existentes no cliente comum: comentarios de cookies HttpOnly/CSRF e tipos de login/password; nenhum segredo, storage local, log ou claim proibido introduzido no BK13. |
| `studentId`, `classId`, `teacherId`, `role`, `membership`, `owner`, `correctOptionIndex`, `results`, `selectedOptionIndexes` nos ficheiros de ranking | `PASS_COM_JUSTIFICACAO` - ocorrencias esperadas em tipos globais, testes e filtros backend; a resposta do ranking nao devolve `results`, email completo ou respostas completas. |
| `OfficialTestRanking`, `buildOfficialTestRanking`, `getOfficialTestRanking`, rota `/ranking` e `official-test-ranking` | `PASS` - contratos encontrados em backend, frontend, rota, suite e guia BK13. |
| `real_dev` nos guias diretamente ligados ao BK13 | `PASS` - sem leakage encontrado em `BK-MF8-12`, `BK-MF8-13` e `BK-MF8-14`. |

### Ficheiros alterados

- `real_dev/api/src/modules/official-tests/official-test-ranking.service.ts`
- `real_dev/api/src/modules/official-tests/official-test-ranking.service.spec.ts`
- `real_dev/api/src/modules/official-tests/official-tests.module.ts`
- `real_dev/api/src/modules/official-tests/official-tests.controller.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/teacher/OfficialTestRankingPage.tsx`
- `real_dev/web/src/pages/teacher/TeacherOfficialTestsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `real_dev/api/package.json`
- `real_dev/api/tsconfig.json`
- `real_dev/api/jest.config.cjs`
- `real_dev/api/src/modules/official-tests/*`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/web/package.json`
- `real_dev/web/tsconfig.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/teacher/TeacherOfficialTestsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- official-test-ranking` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 128 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 94 suites, 397 testes. |
| Pesquisa estatica obrigatoria nos ficheiros/superficie afetados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos benignos no cliente comum e tipos/testes esperados. |
| `git diff --check` | `PASS`. |

Nota: nao foi executado smoke manual em browser com conta real de professor. O comportamento critico ficou coberto por leitura do service/controller/UI, testes unitarios focados, suite API completa, build API e build web.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-13`.
- TODOs obrigatorios: nenhum.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git diff` nao lista as alteracoes de implementacao, mas os ficheiros foram alterados diretamente em `real_dev`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-13` ou avancar para `BK-MF8-14`, assumindo que o ranking docente de mini-testes oficiais ficou entregue com endpoint, service, cliente API, UI real, rota protegida, testes focados e builds verdes.

---

## Execucao atual - BK-MF8-12

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-12`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`, `BK-MF8-12`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-06`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-12 - Realizacao de mini-testes oficiais por aluno` foi implementado no `real_dev` como entrega de `RF28`. A implementacao consome o modulo docente `OfficialTestsModule` criado por `BK-MF2-04`, cria tentativas persistidas separadas em `OfficialTestAttempt`, lista ao aluno apenas testes `PUBLISHED` de disciplinas onde esta inscrito, submete respostas pela sessao autenticada, calcula pontuacao no backend e entrega uma UI real para realizacao dos mini-testes.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-12` / `RF28` em `docs/RF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` no guia foram mapeados para a estrutura real.
- Criado `SubmitOfficialTestAttemptDto` com lista validada de indices de opcoes.
- Criado schema `OfficialTestAttempt` na colecao `official_test_attempts`, com `testId`, `subjectId`, `classId`, `studentId`, respostas, pontuacao, resultados por pergunta e `answeredAt`.
- Criado helper puro `scoreOfficialTestAttempt(...)` para calcular `correctAnswers`, `totalQuestions`, `percentage` e resultados por pergunta.
- Atualizado `OfficialTestsModule` para registar `OfficialTestAttempt`.
- Atualizado `OfficialTestsService` com `listPublishedForStudent(...)` e `submitAttempt(...)`, validando role de aluno, inscricao por `SubjectsService.findSubjectForStudent(...)`, teste publicado e contagem de respostas.
- Atualizado `OfficialTestsController` para expor `GET /api/student/subjects/:subjectId/tests` e `POST /api/student/subjects/:subjectId/tests/:testId/attempts`, preservando os endpoints docentes existentes.
- Atualizado `apiClient.ts` com tipos e funcoes `listStudentOfficialTests(...)` e `submitOfficialTestAttempt(...)`.
- Criada `OfficialTestAttemptPage` com loading, vazio, erro, selecao por radio, submissao e resultado.
- Atualizada a navegacao protegida e a pagina de disciplinas do aluno para abrir `/app/disciplinas/:subjectId/testes`.
- Alargada `official-tests.service.spec.ts` para negativos de role, teste nao publicado/fora do ambito, respostas incompletas, ocultacao de `correctOptionIndex` antes da submissao e pontuacao persistida.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Registado em execucao anterior. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `IMPLEMENTADO` | Historico privado da IA da sala por sessao, endpoint, UI e testes. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `IMPLEMENTADO` | Partilha read-only, fork privado, UI real e testes dedicados. |
| `BK-MF8-12` | `RF28` | `IMPLEMENTADO` | Tentativas oficiais de aluno, endpoints discentes, pontuacao backend, UI real e 9 testes focados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts` | DTO aceita apenas lista de indices inteiros entre 0 e 3, sem `studentId`, `classId` ou pontuacao vindos do frontend. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts` | Tentativa separada de `OfficialTest`, pronta para `BK-MF8-13` consumir `testId`, `subjectId`, `classId`, `studentId`, `correctAnswers`, `totalQuestions`, `percentage`, `results` e `answeredAt`. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts` | `scoreOfficialTestAttempt(...)` calcula pontuacao no backend a partir da versao oficial. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/official-tests.service.ts` | `listPublishedForStudent(...)` valida aluno inscrito e remove `correctOptionIndex` antes da submissao. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/official-tests.service.ts` | `submitAttempt(...)` valida aluno, disciplina, teste `PUBLISHED`, contagem de respostas e persiste a tentativa com `studentId` da sessao. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/official-tests.controller.ts` | Endpoints discentes `GET /api/student/subjects/:subjectId/tests` e `POST /api/student/subjects/:subjectId/tests/:testId/attempts`. |
| `BK-MF8-12` | `RF28` | `real_dev/web/src/lib/apiClient.ts` | Cliente tipado herda `requestJson(...)`, `credentials: "include"` e CSRF marker sem storage local de sessao. |
| `BK-MF8-12` | `RF28` | `real_dev/web/src/pages/student/OfficialTestAttemptPage.tsx` | UI com loading, vazio, erro, radios, submissao, resultado e exibicao de respostas corretas apenas apos tentativa. |
| `BK-MF8-12` | `RF28` | `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts` | 9 testes focados cobrem criacao docente existente, listagem segura de aluno, role errado, teste nao publicado, respostas incompletas e pontuacao persistida. |

### Mapa de integracao da MF

- `BK-MF2-04 -> BK-MF8-12`: `COERENTE`. O BK12 consome `OfficialTest`, `OfficialTestsModule`, `OfficialTestsService`, `SubjectsService.findSubjectForStudent(...)` e o contrato `RF28` sem alterar a criacao docente.
- `BK-MF8-11 -> BK-MF8-12`: `COERENTE`. O fluxo de mini-testes nao reutiliza permissoes, historico ou partilha da IA da sala; a sequencia MF8 avanca para avaliacao oficial.
- `BK-MF8-12 -> BK-MF8-13`: `COERENTE`. O schema `OfficialTestAttempt` entrega os campos esperados para ranking: teste, disciplina, turma, aluno, pontuacao, resultados e data.
- `MF6 -> MF8`: `COERENTE`. Identidade, role e inscricao sao validadas no backend; o frontend nao envia `studentId`, role, membership ou pontuacao.
- `MF7 -> MF8`: `COERENTE`. O codigo novo fica no dominio `official-tests`, usa DTO/schema/service/controller e builds API/web verdes.
- Resultado geral de coerencia: `COERENTE`.

### Contratos consumidos

- `OfficialTest` e `OfficialTestQuestion` criados por `BK-MF2-04`.
- `SubjectsService.findSubjectForStudent(studentId, subjectId)` como barreira de inscricao na turma da disciplina.
- `SessionGuard` e `AuthenticatedRequest.user` como origem unica de `studentId`.
- Cliente frontend comum `requestJson(...)`, com cookies HttpOnly, `credentials: "include"` e `x-studyflow-csrf`.
- Rota de aluno para disciplinas ja existente em `StudentClassSubjectsPage`.

### Contratos entregues

- `SubmitOfficialTestAttemptDto`.
- `OfficialTestAttempt`, `OfficialTestAttemptSchema` e indices para ranking futuro.
- `scoreOfficialTestAttempt(...)`.
- `OfficialTestsService.listPublishedForStudent(actor, subjectId)`.
- `OfficialTestsService.submitAttempt(actor, subjectId, testId, input)`.
- `GET /api/student/subjects/:subjectId/tests`.
- `POST /api/student/subjects/:subjectId/tests/:testId/attempts`.
- Tipos frontend `StudentOfficialTest`, `OfficialTestAttempt` e `OfficialTestAttemptQuestionResult`.
- Funcoes frontend `listStudentOfficialTests(...)` e `submitOfficialTestAttempt(...)`.
- Pagina `OfficialTestAttemptPage` e rota `/app/disciplinas/:subjectId/testes`.

### Coerencia entre MFs

- `MF1/MF2 -> MF8`: `COERENTE`. Turmas, disciplinas e testes oficiais continuam a ser a fonte de verdade; o aluno so acede por inscricao confirmada no backend.
- `MF6 -> MF8`: `COERENTE`. Nao ha exposicao de respostas corretas antes da submissao, nem identidade vinda do frontend.
- `MF7 -> MF8`: `COERENTE`. Modulo NestJS e pagina React seguem a organizacao modular existente e compilaram.
- `MF8 -> BK-MF8-13`: `COERENTE`. O ranking de mini-testes passa a ter tentativa persistida com pontuacao e data.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embedding`, `OCR`, `chunking`, `prompt privado`, `dados pessoais`, `console.log`, `logger.`, `secret`, `apiKey`, `private key`, `token`, `password`, `cookie` nos ficheiros alterados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos ja existentes no cliente comum: comentarios de cookies HttpOnly/CSRF e tipos de login/password; nenhum segredo, storage local, log ou claim proibido introduzido no BK12. |
| `studentId`, `classId`, `teacherId`, `role`, `membership`, `owner`, `correctOptionIndex` em `OfficialTestAttemptPage.tsx` e `apiClient.ts` | `PASS_COM_JUSTIFICACAO` - campos aparecem em tipos globais e no resultado pos-submissao; a UI BK12 envia apenas `selectedOptionIndexes` e mostra `correctOptionIndex` apenas depois da tentativa devolvida pelo backend. |
| `OfficialTestAttempt`, `submitOfficialTestAttempt`, `listStudentOfficialTests`, `/api/student/subjects`, `official_test_attempts`, `scoreOfficialTestAttempt` | `PASS` - contratos esperados encontrados em backend, cliente frontend, rota e pagina. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros alterados

- `real_dev/api/src/modules/official-tests/dto/submit-official-test-attempt.dto.ts`
- `real_dev/api/src/modules/official-tests/schemas/official-test-attempt.schema.ts`
- `real_dev/api/src/modules/official-tests/official-test-attempt-scoring.ts`
- `real_dev/api/src/modules/official-tests/official-tests.module.ts`
- `real_dev/api/src/modules/official-tests/official-tests.controller.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.ts`
- `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/OfficialTestAttemptPage.tsx`
- `real_dev/web/src/pages/student/StudentClassSubjectsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `real_dev/api/package.json`
- `real_dev/api/tsconfig.json`
- `real_dev/api/jest.config.cjs`
- `real_dev/api/src/main.ts`
- `real_dev/api/src/modules/official-tests/*`
- `real_dev/api/src/modules/subjects/subjects.service.ts`
- `real_dev/api/src/modules/classes/classes.service.ts`
- `real_dev/web/package.json`
- `real_dev/web/tsconfig.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudentClassSubjectsPage.tsx`
- `real_dev/web/src/routes/protectedRoutes.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- official-tests.service.spec.ts` | `PASS` - 1 suite, 9 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 127 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 93 suites, 392 testes. |
| Pesquisa estatica obrigatoria nos ficheiros/superficie afetados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos benignos no cliente comum. |
| `git diff --check` | `PASS`. |

Nota: nao foi executado smoke manual em browser com conta real de aluno/professor nesta passagem. O comportamento critico ficou coberto por leitura do service/controller/UI, testes unitarios focados, suite API completa, build API e build web.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-12`.
- TODOs obrigatorios: nenhum.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git diff` nao lista as alteracoes de implementacao, mas os ficheiros foram alterados diretamente em `real_dev`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-12` ou avancar para `BK-MF8-13`, assumindo que a realizacao de mini-testes oficiais por aluno ficou entregue com tentativa persistida, pontuacao backend, UI real, testes focados e builds verdes.

---

## Execucao atual - BK-MF8-11

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-11`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`, `BK-MF8-11`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-05`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala` foi implementado no `real_dev` como entrega de `RF16`, `RF42` e `RNF20`. A implementacao reutiliza `RoomAiInteraction`, adiciona `visibility`, `sharedAt` e `forkedFromInteractionId`, expoe `GET /api/study-rooms/:roomId/ai/answers?scope=shared`, cria `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`, acrescenta cliente web tipado, integra a UI real em `RoomAiPage` e fecha os negativos principais de membership, ownership, modo invalido, fork privado e preservacao do original.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-11` / `RF16, RF42, RNF20` em `docs/RF.md`, `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Mantido `real_dev` como raiz operativa: `real_dev/api` e `real_dev/web`. Os caminhos `apps/...` no guia foram mapeados para a estrutura real.
- Criado `ShareRoomAiAnswerDto` com modos `READ_ONLY` e `PRIVATE_FORK`.
- Alargado `RoomAiInteraction` com `visibility`, `sharedAt`, `forkedFromInteractionId` e indices por `roomId/studentId` e `roomId/visibility`.
- Criado `RoomAiSharingService` para listar respostas partilhadas, partilhar resposta propria e criar fork privado sem chamar provider de IA.
- Atualizado `RoomAiController` para suportar `scope=mine`, `scope=shared` e `POST :answerId/share`, mantendo o `POST` existente da IA da sala.
- Registado `RoomAiSharingService` no `StudyRoomsModule`.
- Criadas funcoes/tipos frontend `RoomAiShareMode`, `RoomAiSharedAnswer`, `RoomAiShareResult`, `listSharedRoomAiAnswers(...)` e `shareRoomAiAnswer(...)`.
- Atualizada `RoomAiPage` com label acessivel, estado de respostas partilhadas, loading/erro/vazio/sucesso, botao `Partilhar read-only`, botao `Guardar copia privada` e refresh do historico privado apos fork.
- Criada suite `room-ai-sharing.service.spec.ts` com caminho feliz e negativos de seguranca.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior: policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior: respostas source-grounded, fontes obrigatorias, citacoes limitadas, negativos e builds. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior: explicacoes adaptadas, perfil pedagogico, IA da sala por ano escolar, painel React e testes. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior: policy de IA externa, fontes internas obrigatorias, notas externas separadas, UI e suite API. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior: checklist visual, `MockupAlignmentPanel`, `SoloStudyDashboard` e teste E2E. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior: normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel e UI com erro PT-PT. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior: exportador MD/HTML de impressao com ownership backend, UI tipada e testes focados. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior: helper `formatDatePt(...)`, historico tipado, preservacao ISO e testes Jest/Playwright. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Registado em execucao anterior: catalogo local tipado, integracao nos dois paineis IA MF8 e teste Playwright. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `IMPLEMENTADO` | Historico privado da IA da sala por sessao, endpoint GET autenticado, UI com estados completos e testes Jest de privacidade. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `IMPLEMENTADO` | Partilha read-only, listagem `scope=shared`, fork privado, UI real e 7 testes Jest dedicados. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-11` | `RF16, RF42` | `real_dev/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts` | DTO limita a operacao a `READ_ONLY` e `PRIVATE_FORK`; modo invalido e rejeitado antes da persistencia. |
| `BK-MF8-11` | `RNF20` | `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts` | `visibility`, `sharedAt` e `forkedFromInteractionId` permitem partilha/fork sem criar modelo paralelo nem alterar ownership original. |
| `BK-MF8-11` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts` | `listSharedAnswers(...)` e `shareOrForkAnswer(...)` validam ObjectIds e `ensureMember(actor.id, roomId)` antes de ler/escrever. |
| `BK-MF8-11` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts` | `shareOwnAnswer(...)` filtra por `_id`, `roomId` e `studentId` da sessao; aluno nao partilha resposta privada de outro aluno. |
| `BK-MF8-11` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts` | `createPrivateFork(...)` exige `visibility: "SHARED"`, cria nova interacao `PRIVATE` com `studentId` da sessao e preserva o original. |
| `BK-MF8-11` | `RF16, RF42` | `real_dev/api/src/modules/study-rooms/room-ai.controller.ts` | `GET ?scope=shared` lista respostas partilhadas e `POST :answerId/share` executa read-only/fork; `scope=mine` do BK10 fica preservado. |
| `BK-MF8-11` | `RF16, RF42` | `real_dev/web/src/lib/apiClient.ts` | Cliente tipado usa `requestJson(...)`, herdando `credentials: "include"` e CSRF marker sem `localStorage`/`sessionStorage`. |
| `BK-MF8-11` | `RF16, RF42, RNF20` | `real_dev/web/src/pages/student/RoomAiPage.tsx` | UI mostra partilha read-only, respostas partilhadas, fork privado, loading/erro/vazio/sucesso e historico privado apos fork. |
| `BK-MF8-11` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts` | 7 testes cobrem listagem partilhada, ownership, aluno fora da sala, fork privado, resposta nao partilhada e modo invalido. |

### Mapa de integracao da MF

- `BK-MF8-10 -> BK-MF8-11`: `COERENTE`. O BK11 consome o `RoomAiInteraction` e os IDs de historico privado entregues pelo BK10, sem criar entidade paralela.
- `BK-MF8-11 -> BK-MF8-12`: `COERENTE`. O handoff para mini-testes oficiais fica limpo; a partilha/fork de respostas IA nao e usada como permissao nem como fonte de testes oficiais.
- `MF1 -> MF8`: `COERENTE`. O dominio de salas continua a usar `StudyRoomsService.ensureMember(...)` como fronteira de membership.
- `MF6 -> MF8`: `COERENTE`. `RNF20` continua no backend: o frontend nao envia `studentId`, role, ownership ou membership.
- `MF7 -> MF8`: `COERENTE`. O modulo `study-rooms` continua coeso, com controller/service/schema dentro do dominio existente e builds API/web verdes.

### Contratos consumidos

- `RoomAiInteraction` com `roomId`, `studentId`, `question`, `answer` e `sourceShareIds`.
- `RoomAiService.listMyRoomAiHistory(...)` e `GET ?scope=mine` do `BK-MF8-10`.
- `StudyRoomsService.ensureMember(actor.id, roomId)` como barreira obrigatoria antes de ler respostas da sala.
- `SessionGuard` e `AuthenticatedRequest.user` como origem de identidade.
- `requestJson(...)` no frontend, com `credentials: "include"` e `x-studyflow-csrf` centralizados.

### Contratos entregues

- `ShareRoomAiAnswerDto`, `RoomAiShareMode`, `RoomAiAnswerReuseView` e `RoomAiShareResult`.
- Campos persistidos `visibility`, `sharedAt` e `forkedFromInteractionId` em `RoomAiInteraction`.
- `RoomAiSharingService.listSharedAnswers(actor, roomId)`.
- `RoomAiSharingService.shareOrForkAnswer(actor, roomId, answerId, input)`.
- `GET /api/study-rooms/:roomId/ai/answers?scope=shared`.
- `POST /api/study-rooms/:roomId/ai/answers/:answerId/share`.
- Cliente web `listSharedRoomAiAnswers(roomId)` e `shareRoomAiAnswer(roomId, answerId, { mode })`.
- UI com partilha read-only, listagem partilhada e fork privado preservando o historico privado.
- Suite `room-ai-sharing.service.spec.ts` como gate de regressao para membership/ownership/fork.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. A identidade vem da sessao e a sala continua a ser validada no backend.
- `MF6 -> MF8`: `COERENTE`. Dados de aluno/sala continuam isolados por membership, ownership e visibilidade no service.
- `MF7 -> MF8`: `COERENTE`. O codigo novo segue a modularidade existente de NestJS/React e os builds passam.
- `MF8 -> BK-MF8-12`: `COERENTE`. O proximo BK pode avancar para mini-testes oficiais sem reabrir a partilha de respostas IA.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `FIXME`, `RAG`, `embeddings`, `OCR`, `chunking`, `secret`, `apiKey`, `private key` em `real_dev/api/src/modules/study-rooms`, `RoomAiPage.tsx` e `apiClient.ts` | `PASS_COM_JUSTIFICACAO` - sem ocorrencias novas problemáticas; falsos positivos antigos em `apiClient.ts` sao tipos/comentarios de auth, cookies HttpOnly e nota explicita contra tokens em `localStorage`. |
| `password`, `token`, `cookie` no cliente comum | `PASS_COM_JUSTIFICACAO` - ocorrencias existentes de login/registo e comentarios de cookies HttpOnly/CSRF; nenhum segredo novo, nenhum storage de sessao. |
| Membership/ownership | `PASS` - `ensureMember(...)` corre antes de queries; `READ_ONLY` filtra por `studentId` da sessao; `PRIVATE_FORK` exige `visibility: "SHARED"`. |
| Provider de IA em partilha/fork | `PASS` - `RoomAiSharingService` nao injeta nem chama `AiProvider`; a operacao reutiliza resposta persistida. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros alterados

- `real_dev/api/src/modules/study-rooms/dto/share-room-ai-answer.dto.ts`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/study-rooms.module.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-sharing.service.spec.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `real_dev/api/package.json`
- `real_dev/api/tsconfig.json`
- `real_dev/api/jest.config.cjs`
- `real_dev/api/src/main.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.ts`
- `real_dev/api/src/modules/study-rooms/study-rooms.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.spec.ts`
- `real_dev/web/package.json`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- room-ai-sharing.service.spec.ts` | `PASS` - 1 suite, 7 testes. |
| `npm --prefix real_dev/api test -- room-ai-history.spec.ts room-ai.service.spec.ts` | `PASS` - 2 suites, 10 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit && vite build`, 126 modulos transformados. |
| `npm --prefix real_dev/api test` | `PASS` - 93 suites, 387 testes. |
| Pesquisa estatica obrigatoria nos ficheiros/superficie afetados | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos antigos no cliente comum, sem novo risco BK11. |
| `git diff --check` | `PASS`. |

Nota: nao foi executado smoke manual em browser com dois alunos reais nesta passagem. O comportamento critico ficou coberto por Jest, build API, build web e leitura do fluxo service/controller/UI.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-11`.
- TODOs obrigatorios: nenhum.
- Sem dependencias novas.
- Sem commits por `PERMITIR_COMMITS: nao`.
- `real_dev/` continua ignorado por Git conforme contrato local da prompt; por isso `git diff` nao lista as alteracoes de implementacao, mas os ficheiros foram alterados diretamente em `real_dev`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-11` ou avancar para `BK-MF8-12`, assumindo que a partilha read-only e o fork privado da IA da sala ficaram entregues com membership/ownership no backend, UI real, testes focados e builds verdes.

---

## Execucao atual - BK-MF8-10

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-10`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`, `BK-MF8-10`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-05`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-10 - Historico privado dos chats IA da sala` foi implementado no `real_dev` como entrega de `RF16`, `RF42`, `RNF20` e `RNF23`. A implementacao acrescentou leitura privada das interacoes `RoomAiInteraction`, endpoint `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, cliente frontend tipado, estados completos em `RoomAiPage` e uma suite Jest focada nos negativos de privacidade. O fluxo existente de `POST` da IA da sala foi preservado, incluindo a adaptacao pedagogica por `StudentProfileService`.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-10` / `RF16, RF42, RNF20, RNF23` em `docs/RF.md`, `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Criado mapper seguro `real_dev/api/src/modules/study-rooms/room-ai-history.ts`.
- Adicionado `RoomAiService.listMyRoomAiHistory(...)` com validacao de `roomId`, `ensureMember(actor.id, roomId)`, query por `roomId` + `studentId` da sessao, ordenacao descendente e limite de 30 itens.
- Exposto `RoomAiController.@Get()` no recurso `api/study-rooms/:roomId/ai/answers`, protegido pelo `SessionGuard` ja existente.
- Criado `RoomAiHistoryItem` e `listMyRoomAiHistory(...)` no cliente frontend comum.
- Atualizado `RoomAiPage` com loading, vazio, erro e sucesso para historico privado, carregamento ao montar a pagina e refresh apos nova pergunta.
- Criado teste `room-ai-history.spec.ts` para aluno fora da sala, sala invalida, aluno diferente, sala diferente e ausencia de chamada ao provider de IA.
- Mantido fora do escopo qualquer partilha read-only, fork privado, campo de visibilidade ou endpoint `scope=shared`; isso fica para `BK-MF8-11`.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior: policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior: respostas source-grounded, fontes obrigatorias, citacoes limitadas, negativos e builds. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior: explicacoes adaptadas, perfil pedagogico, IA da sala por ano escolar, painel React e testes. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior: policy de IA externa, fontes internas obrigatorias, notas externas separadas, UI e suite API. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior: checklist visual, `MockupAlignmentPanel`, `SoloStudyDashboard` e teste E2E. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior: normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel e UI com erro PT-PT. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior: exportador MD/HTML de impressao com ownership backend, UI tipada e testes focados. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior: helper `formatDatePt(...)`, historico tipado, preservacao ISO e testes Jest/Playwright. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Registado em execucao anterior: catalogo local tipado, integracao nos dois paineis IA MF8 e teste Playwright. |
| `BK-MF8-10` | `RF16, RF42, RNF20, RNF23` | `IMPLEMENTADO` | Historico privado da IA da sala por sessao, endpoint GET autenticado, UI com estados completos e 5 testes Jest de privacidade. |

### Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | RF/RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-10` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-history.ts:31` | `toPrivateRoomAiHistory(...)` faz defesa adicional por `roomId` e `studentId` antes de mapear resposta publica. |
| `BK-MF8-10` | `RF16, RF42, RNF20` | `real_dev/api/src/modules/study-rooms/room-ai.service.ts:55` | `listMyRoomAiHistory(...)` valida sala, chama `ensureMember(...)`, filtra por aluno da sessao e nao recebe `studentId` da UI. |
| `BK-MF8-10` | `RNF23` | `real_dev/api/src/modules/study-rooms/room-ai.service.ts:68` | Leitura usa persistencia existente `RoomAiInteraction`, ordena por `createdAt` e limita a 30 itens, sem logs com prompts/respostas privadas. |
| `BK-MF8-10` | `RF16, RF42` | `real_dev/api/src/modules/study-rooms/room-ai.controller.ts:30` | `GET /api/study-rooms/:roomId/ai/answers?scope=mine` reutiliza `SessionGuard` no controller existente. |
| `BK-MF8-10` | `RF16, RF42` | `real_dev/web/src/lib/apiClient.ts:237` e `real_dev/web/src/lib/apiClient.ts:1320` | `RoomAiHistoryItem` e `listMyRoomAiHistory(...)` tipam a chamada frontend com `credentials: "include"` herdado de `requestJson(...)`. |
| `BK-MF8-10` | `RF16, RF42, RNF20` | `real_dev/web/src/pages/student/RoomAiPage.tsx:34` | Pagina carrega historico privado, mostra loading/vazio/erro/sucesso e refresca a lista depois do `POST`. |
| `BK-MF8-10` | `RNF20` | `real_dev/api/src/modules/study-rooms/room-ai-history.spec.ts:20` | Suite cobre filtro por aluno, nao membro antes da query, sala invalida, sala diferente e provider nao chamado. |

### Mapa de integracao da MF

- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. A UI de historico privado pode evoluir para usar o catalogo local de mensagens sem alterar contratos HTTP; esta execucao manteve o cliente comum e os estados React reais.
- `BK-MF8-10 -> BK-MF8-11`: `COERENTE`. O BK10 entrega `_id`, `roomId`, pergunta, resposta e `createdAt` privados; o BK11 pode usar esses IDs como base para partilha controlada, sem transformar historico privado em lista global.
- `MF1 -> MF8`: `COERENTE`. A dependencia `BK-MF1-04` existe no dominio de salas/IA partilhada e a leitura chama `StudyRoomsService.ensureMember(...)` antes da query.
- `MF6 -> MF8`: `COERENTE`. O isolamento por aluno/sala fica no backend, `studentId` vem da sessao e a UI nao decide ownership ou membership.
- `MF7 -> MF8`: `COERENTE`. O endpoint encaixa no modulo existente `study-rooms`, os builds API/web passam e a suite automatizada cobre o contrato critico.

### Contratos consumidos

- `RoomAiInteraction` como entidade persistida de pergunta, resposta, sala, aluno e fontes usadas.
- `StudyRoomsService.ensureMember(actor.id, roomId)` como fronteira obrigatoria de membership.
- `SessionGuard` e `AuthenticatedRequest.user` como origem segura de `actor.id`.
- `requestJson(...)` no frontend, com `credentials: "include"` e marcador CSRF centralizados.
- Fluxo existente `askRoomAi(...)`, `RoomAiPage` e adaptacao pedagogica por `StudentProfileService`.

### Contratos entregues

- `RoomAiHistoryItem` backend/frontend com `_id`, `roomId`, `question`, `answer` e `createdAt`.
- `toPrivateRoomAiHistory(...)` como mapper defensivo e reutilizavel.
- `RoomAiService.listMyRoomAiHistory(actor, roomId)`.
- `GET /api/study-rooms/:roomId/ai/answers?scope=mine`, autenticado e filtrado no backend.
- `listMyRoomAiHistory(roomId)` no cliente web.
- `RoomAiPage` com estado privado de historico, erro proprio e refresh apos pergunta.
- `room-ai-history.spec.ts` como gate de privacidade para o handoff do `BK-MF8-11`.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. Identidade e membership continuam a vir da sessao/backend; a pagina nao envia `studentId`.
- `MF6 -> MF8`: `COERENTE`. A regra `RNF20` fica provada por filtro backend e testes negativos; nao ha exposicao de historico de outro aluno.
- `MF7 -> MF8`: `COERENTE`. O dominio continua modular dentro de `study-rooms`, sem novo model paralelo e sem provider chamado para leitura.
- `MF8 -> MF8 seguinte`: `COERENTE`. `BK-MF8-11` recebe uma base privada e identificavel para implementar partilha read-only/fork em BK proprio.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| Ficheiros BK10 por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, `secret`, `segredo` | `PASS` - sem ocorrencias nos ficheiros novos/alterados do BK10. |
| Pesquisa alargada nos ficheiros alvo por `password`, `token`, `cookie` | `PASS_COM_JUSTIFICACAO` - ocorrencias antigas e esperadas em `apiClient.ts` para tipos de login/registo e comentario do cliente comum; nao foram criadas por BK10 nem expõem segredos. |
| Contratos `ensureMember`, `studentId`, `generateRoomAnswer`, `scope=mine`, `@Get` | `PASS` - `ensureMember` e filtro `studentId` existem no service; `generateRoomAnswer` nao e chamado no teste de historico; cliente usa `scope=mine`. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros alterados

- `real_dev/api/src/modules/study-rooms/room-ai-history.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.controller.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-history.spec.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-01-logs-estruturados-de-eventos-e-erros.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `real_dev/api/src/modules/study-rooms/study-rooms.service.ts`
- `real_dev/api/src/common/guards/session.guard.ts`
- `real_dev/api/src/common/types/authenticated-request.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- room-ai-history` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- room-ai.service` | `PASS` - suite existente preservada, 5 testes. |
| `npm --prefix real_dev/api test -- study-rooms` | `PASS` - 6 suites, 38 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build, 126 modulos. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos e tokens nos ficheiros BK10 | `PASS_COM_JUSTIFICACAO` - apenas falsos positivos antigos no cliente comum, sem novo risco BK10. |
| `git check-ignore -v real_dev ...` | `PASS_COM_JUSTIFICACAO` - `real_dev/` ignorado por contrato local da prompt. |
| `rg -n "^[[:blank:]]+$\|[[:blank:]]+$" <ficheiros alterados BK10 + relatorio>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |

Nota: `real_dev/web/package.json` nao tem script `lint`; por isso foi executado o build real disponivel (`tsc --noEmit && vite build`) como gate frontend.

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-10`.
- TODOs obrigatorios: nenhum.
- Validacao manual/browser com sessoes reais nao foi executada nesta passagem; o comportamento critico ficou coberto por Jest e build web.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-10` ou avancar para `BK-MF8-11`, assumindo que o historico privado da IA da sala ficou entregue com filtro backend por sessao, membership obrigatoria, endpoint autenticado, cliente tipado, UI com estados completos e testes negativos de privacidade.

---

## Execucao atual - BK-MF8-09

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-09`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`, `BK-MF8-09`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-09 - Preparado para futura traducao/i18n` foi implementado no `real_dev` como entrega de `RNF44`. A implementacao criou um catalogo local tipado para mensagens visiveis da MF8, integrou esse catalogo nos paineis reais de guardrails e respostas com fontes, manteve intactos os contratos HTTP/backend existentes e acrescentou uma suite Playwright focada para chaves conhecidas, chaves desconhecidas e fallback seguro.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-09` / `RNF44` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Criado catalogo local `real_dev/web/src/lib/messages.ts` com `messageKeys`, `MessageKey`, `isMessageKey(...)`, `t(...)` e `tOrDefault(...)`.
- Atualizado `AiGuardrailsPanel` para resolver titulo, labels, opcoes, botao, loading, erro e estados permitido/bloqueado via catalogo.
- Atualizado `SourceGroundedAiPanel` para resolver titulo, labels, ajuda, botao, loading, erro, estado vazio, resposta, citacoes e fallback sem fontes via catalogo.
- Revistos `checkAiGuardrails(...)`, `askSourceGroundedAi(...)`, `requestMf3Json(...)` e `RoomAiPage` para confirmar fronteira: sem endpoint i18n, sem alteracao de payload, sem mover autorizacao para a UI.
- Criado teste Playwright isolado `real_dev/web/tests/e2e/mf8-messages.spec.ts`.
- Mantidos `POST /api/ai/guardrails/check`, `POST /api/ai/source-grounded-answers`, `credentials: "include"` e CSRF marker existentes.
- Nao foi instalada dependencia nova de i18n.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior: policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior: respostas source-grounded, fontes obrigatorias, citacoes limitadas, negativos e builds. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior: explicacoes adaptadas, perfil pedagogico, IA da sala por ano escolar, painel React e testes. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior: policy de IA externa, fontes internas obrigatorias, notas externas separadas, UI e suite API. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior: checklist visual, `MockupAlignmentPanel`, `SoloStudyDashboard` e teste E2E. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior: normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel e UI com erro PT-PT. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior: exportador MD/HTML de impressao com ownership backend, UI tipada e testes focados. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Registado em execucao anterior: helper `formatDatePt(...)`, historico tipado, preservacao ISO e testes Jest/Playwright. |
| `BK-MF8-09` | `RNF44` | `IMPLEMENTADO` | Catalogo local tipado, integracao nos dois paineis IA MF8, sem backend novo, sem dependencia i18n e 4 testes Playwright. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/lib/messages.ts:5` | `messageKeys` concentra chaves estaveis; `MessageKey` deriva do catalogo. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/lib/messages.ts:36` | `ptMessages: Record<MessageKey, string>` garante cobertura tipada das mensagens. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/lib/messages.ts:73` | `isMessageKey(...)`, `t(...)` e `tOrDefault(...)` cobrem chave conhecida, dinamica e fallback. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx:5` | Painel importa `messageKeys`/`t` e preserva `checkAiGuardrails({ contextType, resourceId, prompt })`. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx:5` | Painel importa `messageKeys`/`t` e preserva `askSourceGroundedAi({ sourceJobIds, question })`. |
| `BK-MF8-09` | `RNF44` | `real_dev/web/tests/e2e/mf8-messages.spec.ts:13` | Suite valida chaves conhecidas, chave desconhecida, fallback e loading sem dependencia externa. |

### Mapa de integracao da MF

- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. O helper de datas visiveis continua isolado; o BK09 centraliza outras mensagens MF8 sem alterar dados tecnicos ou contratos HTTP.
- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. O historico privado da IA da sala pode adicionar novas mensagens ao catalogo em vez de voltar a espalhar textos na UI.
- `MF6/MF7 -> MF8`: `COERENTE`. Guardrails, source-grounded AI, cookies HttpOnly, CSRF marker e fronteiras backend continuam nos services/controllers existentes.
- Backend/API: `COERENTE`. Nao foi criado controller/service/schema/DTO de i18n; os endpoints IA atuais continuam a ser a unica superficie HTTP envolvida.
- Frontend: `COERENTE`. Os paineis continuam a gerir estado local e a chamar clientes reais; o catalogo resolve apenas texto visivel.

### Contratos consumidos

- `RNF44` como requisito canonico de preparacao i18n futura.
- `checkAiGuardrails(...)` com `contextType`, `resourceId` e `prompt`.
- `askSourceGroundedAi(...)` com `sourceJobIds` e `question`.
- `requestMf3Json(...)` com `credentials: "include"` e header CSRF.
- Endpoints existentes `POST /api/ai/guardrails/check` e `POST /api/ai/source-grounded-answers`.
- `BK-MF8-08` como primeira separacao de apresentacao visual sem alterar contratos backend.

### Contratos entregues

- `messageKeys` como mapa central de chaves estaveis para mensagens MF8.
- `MessageKey` como tipo derivado das chaves conhecidas.
- `t(key)` para mensagens conhecidas em tempo de desenvolvimento.
- `isMessageKey(key)` e `tOrDefault(key)` para chaves dinamicas com fallback seguro.
- `AiGuardrailsPanel` e `SourceGroundedAiPanel` passam a consumir mensagens centralizadas sem mudar payloads.
- `mf8-messages.spec.ts` como gate reutilizavel para chaves conhecidas, chave desconhecida e fallback.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. Identidade, ownership e membership continuam no backend; o frontend nao ganhou qualquer decisao de permissao.
- `MF6 -> MF8`: `COERENTE`. Guardrails e bloqueio de IA sem fontes continuam nos services existentes; mensagens genericas evitam expor detalhes tecnicos ao utilizador.
- `MF7 -> MF8`: `COERENTE`. Build da API e build do frontend passam; a modularidade mantem mensagens na camada web e regras de dominio na API.
- `BK-MF8-09 -> BK-MF8-10`: `COERENTE`. O proximo BK pode reutilizar `messages.ts` para historico privado sem criar dependencia externa.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `api/i18n`, `I18nController`, `I18nService` em `real_dev/api/src` e `real_dev/web/src` | `PASS` - sem ocorrencias; nenhum backend i18n foi criado. |
| Ficheiros alvo por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, `RAG`, `embeddings`, `OCR`, `chunking`, `password`, `token`, `cookie`, `secret`, `segredo` | `PASS` - sem ocorrencias nos ficheiros novos/alterados do BK09. |
| Contratos HTTP dos paineis IA | `PASS` - `checkAiGuardrails` continua a chamar `/api/ai/guardrails/check`; `askSourceGroundedAi` continua a chamar `/api/ai/source-grounded-answers`. |
| `RoomAiPage` como superficie relacionada | `PASS_COM_JUSTIFICACAO` - revista sem edicao; reestruturacao fica para `BK-MF8-10` e BKs seguintes. |
| `real_dev/` ignorado por Git | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Ficheiros alterados

- `real_dev/web/src/lib/messages.ts`
- `real_dev/web/src/features/ai-guardrails/ai-guardrails-panel.tsx`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `real_dev/web/tests/e2e/mf8-messages.spec.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `real_dev/web/package.json`
- `real_dev/web/tsconfig.json`
- `real_dev/web/playwright.config.ts`
- `real_dev/web/src/features/ai-guardrails/check-ai-guardrails.ts`
- `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/ai-guardrails/ai-guardrails.controller.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.controller.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 126 modulos. |
| `STUDYFLOW_E2E_START_SERVERS=false npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-messages.spec.ts` | `PASS` - 4 testes Playwright. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build` concluido; nenhum backend novo foi introduzido. |
| `rg -n "api/i18n\|I18nController\|I18nService" real_dev/api/src real_dev/web/src` | `PASS` - sem ocorrencias. |
| Pesquisa estatica por storage, casts permissivos, TODOs, claims proibidos, segredos e tokens nos ficheiros BK09 | `PASS` - sem ocorrencias. |
| `git check-ignore -v real_dev real_dev/web real_dev/web/src/lib/messages.ts real_dev/web/tests/e2e/mf8-messages.spec.ts` | `PASS_COM_JUSTIFICACAO` - `real_dev/` ignorado por contrato local da prompt. |
| `rg -n "[ \t]+$" <ficheiros alterados BK09>` | `PASS` - sem whitespace final nos ficheiros alterados e no relatorio. |
| `git diff --check` | `PASS`. |

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-09`.
- TODOs obrigatorios: nenhum.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-09` ou avancar para `BK-MF8-10`, assumindo que `RNF44` ficou entregue com catalogo local tipado, paineis IA integrados, fallback seguro e validacao Playwright focada.

---

## Execucao atual - BK-MF8-08

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-08`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`, `BK-MF8-08`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-08 - Datas no formato dd/mm/aaaa` foi implementado no `real_dev` como entrega de `RNF43`. A implementacao centralizou a formatacao de datas visiveis no frontend, manteve o backend a devolver `occurredAt` como `Date`/ISO serializavel, removeu `unknown[]` e casts locais do historico, e acrescentou validacao automatizada focada para data valida, invalida, ausente e renderizacao visivel.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-08` / `RNF43` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Criado helper frontend partilhado `formatDatePt(...)` em `real_dev/web/src/lib/format-date-pt.ts`.
- Tipado o contrato `StudyHistoryEvent` e `listStudyHistory(): Promise<StudyHistoryEvent[]>` em `real_dev/web/src/lib/apiClient.ts`.
- Atualizado `StudyHistoryPage` para carregar historico tipado com estados `loading` e `error`, sem enviar `userId` pelo frontend.
- Atualizado `StudyHistoryList` para renderizar datas com `formatDatePt(...)`, usando `event.id` como chave estavel e sem cast local.
- Reutilizado `formatDatePt(...)` em `RoutinesPage` para a superficie revista de `targetDate`.
- Atualizado `HistoryService` test para provar que `occurredAt` continua como data tecnica serializavel para ISO.
- Criado teste Playwright isolado `mf8-date-format.spec.ts` para `01/01/2026`, `Data inválida`, `Data indisponível` e texto renderizado.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Registado em execucao anterior: policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Registado em execucao anterior: respostas source-grounded, fontes obrigatorias, citacoes limitadas, negativos e builds. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Registado em execucao anterior: explicacoes adaptadas, perfil pedagogico, IA da sala por ano escolar, painel React e testes. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Registado em execucao anterior: policy de IA externa, fontes internas obrigatorias, notas externas separadas, UI e suite API. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Registado em execucao anterior: checklist visual, `MockupAlignmentPanel`, `SoloStudyDashboard` e teste E2E. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Registado em execucao anterior: normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel e UI com erro PT-PT. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Registado em execucao anterior: exportador MD/HTML de impressao com ownership backend, UI tipada e testes focados. |
| `BK-MF8-08` | `RNF43` | `IMPLEMENTADO` | Helper `formatDatePt(...)`, historico tipado, preservacao ISO no backend, integracao em historico/rotinas e testes Jest/Playwright. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/lib/format-date-pt.ts:1` | `mf8-date-format.spec.ts` valida `01/01/2026`, data invalida e data ausente. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/lib/apiClient.ts:756` | Build web confirma `StudyHistoryEvent` e `listStudyHistory()` tipados. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/components/study/StudyHistoryList.tsx:4` | Lista usa `formatDatePt(event.occurredAt)` e remove `unknown[]`/casts locais. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/pages/student/StudyHistoryPage.tsx:6` | Pagina carrega `StudyHistoryEvent[]`, com loading/error e sem `userId` vindo do frontend. |
| `BK-MF8-08` | `RNF43` | `real_dev/web/src/pages/student/RoutinesPage.tsx:16` | Superficie revista de `targetDate` reutiliza o helper partilhado. |
| `BK-MF8-08` | `RNF43` | `real_dev/api/src/modules/study/history.service.spec.ts:58` | Jest prova `occurredAt.toISOString() === "2026-01-01T10:00:00.000Z"`. |

### Mapa de integracao da MF

- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. A exportacao MD/PDF fica intacta e o BK08 atua apenas em datas visiveis, sem alterar contratos HTTP de artefactos.
- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. O helper partilhado deixa uma primeira centralizacao de texto visivel sem introduzir biblioteca i18n nem alterar dados tecnicos.
- `MF7 -> MF8`: `COERENTE`. O contrato modular e os testes automatizados continuam a passar; a alteracao usa componentes/clientes existentes.
- Backend/API: `HistoryService` preserva `Date` e serializacao ISO; nao foi criado endpoint novo nem localizacao no backend.
- Frontend: o cliente web consome ISO tipado e a UI aplica `dd/mm/aaaa` no ultimo momento.

### Contratos consumidos

- `GET /api/study/history` e `HistoryService.listMyEvents(...)` como fonte autorizada do historico do aluno.
- `requestJson(...)` como cliente comum com `credentials: "include"` e sessao por cookie HttpOnly.
- `StudyEventDto.occurredAt: Date` como contrato backend tecnico.
- `StudyHistoryPage` e `StudyHistoryList` como superficie visivel minima de historico.
- `RoutinesPage` como superficie revista de data alvo, sem expandir para i18n geral.

### Contratos entregues

- `formatDatePt(value)` devolve `dd/mm/aaaa`, `Data inválida` ou `Data indisponível`.
- `StudyHistoryEvent` documenta o evento recebido no browser com `occurredAt?: string`.
- `listStudyHistory()` passa a devolver `Promise<StudyHistoryEvent[]>`.
- `StudyHistoryList` passa a renderizar datas localizadas sem casts locais.
- Teste Playwright `mf8-date-format.spec.ts` como gate reutilizavel para `RNF43`.
- Prova Jest de que o backend preserva `occurredAt` como data tecnica serializavel.

### Coerencia entre MFs

- `MF0/MF1 -> MF8`: `COERENTE`. A identidade continua a vir da sessao autenticada; a pagina nao envia `userId` manual.
- `MF6 -> MF8`: `COERENTE`. Cookies HttpOnly/CSRF e ausencia de storage de tokens continuam centralizados no cliente comum.
- `MF7 -> MF8`: `COERENTE`. Build, suite backend e teste browser focado passam; o BK nao duplica modulos, controllers ou clientes.
- `BK-MF8-08 -> BK-MF8-09`: `COERENTE`. A localizacao de datas fica isolada e pode ser consumida pela preparacao i18n sem prometer biblioteca de traducao.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `unknown[]`, casts locais e formatacao inline nas superficies do BK08 | `PASS` - `StudyHistoryPage`, `StudyHistoryList`, `RoutinesPage` e helper alvo sem `unknown[]`, `event as`, `toLocaleDateString` ou `Intl.DateTimeFormat("pt-PT")` fora do helper. |
| `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, claims indevidos sobre RAG/embeddings/OCR/chunking/indexacao automatica | `PASS_COM_JUSTIFICACAO` - sem ocorrencias nos ficheiros novos/alterados do BK08; falsos positivos globais no `apiClient.ts` correspondem a comentario de cookies HttpOnly e DTOs `email/password` pre-existentes. |
| segredos, tokens, cookies, passwords, prompts privados ou dados pessoais em logs/evidence | `PASS_COM_JUSTIFICACAO` - sem logs ou segredos novos; ocorrencias no `apiClient.ts` sao comentarios/DTOs de autenticacao ja existentes. |
| valores ISO no backend | `PASS` - `HistoryService` continua a devolver `Date`; teste confirma `toISOString()`. |
| valores visiveis no frontend | `PASS` - Playwright confirma `01/01/2026`, `Data inválida`, `Data indisponível` e texto renderizado. |

### Ficheiros alterados

- `real_dev/api/src/modules/study/history.service.spec.ts`
- `real_dev/web/src/lib/format-date-pt.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/components/study/StudyHistoryList.tsx`
- `real_dev/web/src/pages/student/StudyHistoryPage.tsx`
- `real_dev/web/src/pages/student/RoutinesPage.tsx`
- `real_dev/web/tests/e2e/mf8-date-format.spec.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

- `README.md`
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
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/study/history.service.ts`
- `real_dev/api/src/modules/study/dto/study-event.dto.ts`
- `real_dev/api/src/modules/study/schemas/study-event.schema.ts`
- `real_dev/web/playwright.config.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test -- history.service.spec.ts` | `PASS` - 1 suite, 4 testes. |
| `STUDYFLOW_E2E_START_SERVERS=false npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-date-format.spec.ts` | `BLOQUEADO_AMBIENTE` no sandbox por Chromium/MachPortRendezvousServer `Permission denied`; rerun fora do sandbox passou com 1 teste. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build` concluido. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 91 suites, 375 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 125 modulos. |
| Pesquisa estatica por `unknown[]`, casts, formatacao inline, storage, segredos, tokens, TODOs, claims proibidos e logs | `PASS_COM_JUSTIFICACAO` - falsos positivos globais apenas conforme descrito acima. |
| Pesquisa em guias MF8 por termos proibidos/caminhos privados | `PASS_COM_JUSTIFICACAO` - hits existem como scope-out, avisos de privacidade, exemplos sanitizados ou comandos de validacao; sem caminho privado `/Users/nuno` em guias de aluno. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs na matriz/backlog/guias, score 100, `overall_pass=true`. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final nos ficheiros alterados e no relatorio. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev real_dev/api real_dev/web ...` | `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Blockers e TODOs

- Blockers de implementacao: nenhum para `BK-MF8-08`.
- TODOs obrigatorios: nenhum.
- Nota ambiental: a primeira execucao Playwright em sandbox falhou por permissao do Chromium no macOS; a mesma validacao passou fora do sandbox.
- Nota Git: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=auditar_implementacao` para `BK-MF8-08` ou avancar para `BK-MF8-09`, assumindo que `RNF43` ficou entregue com helper frontend partilhado, historico tipado, preservacao ISO no backend e gate Playwright focado.

---

## Execucao atual - BK-MF8-07

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-07`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-07 - Exportacao de resumos/quizzes em PDF/MD` foi implementado no `real_dev` como entrega de `RNF40`. A implementacao adicionou exportacao backend para artefactos `SUMMARY` e `QUIZ` ja persistidos, validando sessao, area privada, ownership, artefacto e formato no backend antes de renderizar Markdown ou HTML de impressao. A UI passou a mostrar os estados vazio/erro/sucesso e os botoes `Exportar MD` e `Preparar PDF` apenas para resumos e quizzes selecionados.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-07` / `RNF40` em `docs/RNF.md`, matriz, backlog, contrato de campos, MF views, plano de sprints e guia alvo.
- Criado `ArtifactExportService` em `real_dev/api/src/modules/ai/artifact-export.service.ts`.
- Integrado endpoint `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf` no controller existente de study tools.
- Registado `ArtifactExportService` no `AiModule`, preservando `StudyToolsService`, `SummariesService`, `AI_PROVIDER` e rotas existentes.
- Adicionado cliente web tipado `exportStudyToolArtifact(...)` com `credentials: "include"` e marcador CSRF.
- Adicionado painel de exportacao em `StudyToolsPage`, com estado vazio, erro, loading e sucesso.
- Criado teste focado para caminho feliz Markdown, HTML de impressao, formato invalido, artefacto inacessivel e quiz sem respostas corretas.
- Mantida decisao `DERIVADO`: `format=pdf` devolve HTML de impressao para o browser guardar/imprimir como PDF, sem nova dependencia backend.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds registados em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint source-grounded, fontes obrigatorias, citacoes limitadas, negativos e builds registados em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Explicacoes adaptadas, perfil pedagogico, IA da sala por ano escolar, painel React e testes registados em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Policy de IA externa, fontes internas obrigatorias, notas externas separadas, UI e suite API completa. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Checklist visual frontend-only, painel `MockupAlignmentPanel`, integracao em `SoloStudyDashboard` e teste E2E. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel, UI com erro PT-PT e suite API/builds completos. |
| `BK-MF8-07` | `RNF40` | `IMPLEMENTADO` | Exportador MD/HTML de impressao com ownership backend, UI tipada e 5 testes focados. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/artifact-export.service.ts` | `artifact-export.service.spec.ts`; valida `md`, `pdf`, formato invalido, ownership e quiz sem respostas corretas. |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/study-tools.controller.ts` | Endpoint autenticado `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`, headers de ficheiro e delegacao para service. |
| `BK-MF8-07` | `RNF40` | `real_dev/api/src/modules/ai/ai.module.ts` | Build Nest confirma injecao de `ArtifactExportService` no modulo IA. |
| `BK-MF8-07` | `RNF40` | `real_dev/web/src/lib/apiClient.ts` | Cliente `exportStudyToolArtifact(...)` usa `fetch`, `credentials: "include"`, CSRF marker e leitura textual. |
| `BK-MF8-07` | `RNF40` | `real_dev/web/src/pages/student/StudyToolsPage.tsx` | Build Vite confirma painel `ArtifactExportPanel`, botoes `Exportar MD` / `Preparar PDF` e estados PT-PT. |

### Mapa de integracao da MF

- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. O exportador consome artefactos e fontes ja normalizados/validados, sem repetir normalizacao UTF-8/PT-PT.
- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. O handoff deixa exportacao fechada; o BK08 pode focar apenas datas visiveis `dd/mm/aaaa` sem alterar contratos HTTP de artefactos.
- `MF0/MF1 -> MF8`: `COERENTE`. A identidade continua a vir da sessao autenticada; `userId` nao vem do body nem da query.
- `MF6/MF7 -> MF8`: `COERENTE`. A implementacao preserva cookies HttpOnly/CSRF, modulos IA existentes, `StudyToolsService`, `SummariesService`, jobs de quiz e validacoes de fonte/artefacto.
- Backend/API: endpoint novo fica no controller existente de study tools, sem duplicar model, schema, provider IA ou controller de artefactos.
- Frontend: painel fica na pagina real de study tools e so ativa exportacao para `SUMMARY` e `QUIZ`.

### Contratos consumidos

- `SessionGuard` e `AuthenticatedRequest` como origem de identidade.
- `StudyAreasService.getMyStudyArea(...)` para validar ownership da area antes da exportacao.
- `AiArtifact`/`AiArtifactSchema` como persistencia unica dos artefactos IA.
- `StudyToolsController` como superficie HTTP existente de ferramentas de estudo.
- `requestJson(...)`/convencao de `credentials: "include"` e CSRF marker no cliente web.
- `BK-MF8-06`: texto/fonte processavel ja normalizado e falha honesta quando nao existe texto legivel.

### Contratos entregues

- `ArtifactExportService.exportArtifact(userId, studyAreaId, artifactId, format)` devolve ficheiro textual autorizado.
- `validateArtifactExportFormat(...)` aceita apenas `md`, `pdf` ou omissao equivalente a `md`.
- `renderAiArtifactMarkdown(...)` gera Markdown para `SUMMARY` e `QUIZ`.
- `renderAiArtifactPrintHtml(...)` devolve HTML escapado para preparacao de PDF no browser.
- `buildArtifactExportContentDisposition(...)` cria header de ficheiro sem aceitar aspas no nome.
- Endpoint `GET /api/study-areas/:id/study-tools/:artifactId/export?format=md|pdf`.
- Cliente `exportStudyToolArtifact(...)` devolve `{ fileName, contentType, body, format }`.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. O modulo IA continua modular e a nova exportacao fica limitada ao dominio `ai/study-tools`.
- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. Fontes completas nao sao exportadas; apenas titulos, localizacao curta e `excerpt` explicito quando existir.
- `BK-MF8-07 -> BK-MF8-08`: `COERENTE`. Nenhuma data ou contrato ISO foi alterado.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` nos ficheiros alvo | `PASS_COM_JUSTIFICACAO` - sem uso real; ocorrencia pre-existente em comentario do cliente explica que nao se guardam tokens em `localStorage`. |
| `as any`, `payload: unknown`, `TODO`, claims indevidos sobre RAG/embeddings/OCR/chunking/indexacao automatica | `PASS_COM_JUSTIFICACAO` - sem ocorrencias reais nos ficheiros alvo; `SOCRATIC` no cliente e falso positivo de `OCR`. |
| segredos, tokens, cookies, passwords, prompts privados ou dados pessoais em logs | `PASS_COM_JUSTIFICACAO` - hits de `cookie`/`password` sao comentarios/DTOs de auth pre-existentes; nao ha storage, logs ou segredos novos. |
| fontes privadas completas no exportador | `PASS` - `ArtifactExportService` nao faz fallback para `contentText`; usa apenas `source.excerpt` explicito e limitado quando existir. |
| whitespace final nos ficheiros alterados | `PASS` - `rg -n "[ \t]+$"` sem ocorrencias nos ficheiros alvo. |

### Ficheiros alterados

- `real_dev/api/src/modules/ai/artifact-export.service.ts`
- `real_dev/api/src/modules/ai/artifact-export.service.spec.ts`
- `real_dev/api/src/modules/ai/study-tools.controller.ts`
- `real_dev/api/src/modules/ai/ai.module.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/student/StudyToolsPage.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/ai/schemas/ai-artifact.schema.ts`
- `real_dev/api/src/modules/ai/summaries.service.ts`
- `real_dev/api/src/modules/ai/study-tools.service.ts`
- `real_dev/api/src/modules/ai/validators/ai-artifact.validator.ts`
- `real_dev/api/src/modules/ai/validators/quiz.validator.ts`
- `real_dev/web/src/components/ai/SummaryPanel.tsx`
- `real_dev/web/src/components/ai/QuizPanel.tsx`
- `real_dev/web/src/components/ai/ArtifactSources.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- artifact-export.service --runInBand` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 91 suites, 374 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build` concluido. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos, 124 modulos. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs, 107 guias, score 100, `overall_pass=true`. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e logs | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas conforme descrito acima. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev ...` | `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-07`.
- TODOs obrigatorios para `BK-MF8-07`: nenhum.
- Nota: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-08`, usando como pressuposto que `BK-MF8-07` deixou exportacao MD/HTML de impressao para resumos/quizzes com ownership backend e UI tipada.

---

## Execucao atual - BK-MF8-06

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-06`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-06 - Suporte a importacao UTF-8 e PT-PT` foi implementado no `real_dev` como entrega de `RNF39`. A implementacao criou uma normalizacao backend reutilizavel para preservar acentos/cedilhas em NFC, bloquear caracteres de substituicao, impedir texto vazio como fonte processavel e apresentar erro PT-PT seguro quando a indexacao nao encontra texto legivel.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-06` / `RNF39` em `docs/RNF.md`, matriz, backlog, contrato de campos, views, plano de sprints e guia alvo.
- Criado helper comum `normalizePortugueseStudyText(...)` em `real_dev/api/src/common/text/pt-text-normalization.ts`.
- Integrado `MaterialsService.submitTextMaterial(...)` para normalizar TOPIC antes de persistir `contentText`.
- Integrado `MaterialsService.markIndexedText(...)` para guardar texto indexado ja normalizado e limitado.
- Integrado `MaterialIndexService` para normalizar TOPIC, URL, PDF, DOCX e material oficial textual antes de criar chunks ou marcar jobs como `DONE`.
- Mantida falha controlada de job com mensagem publica: `O material nao tem texto legivel para estudar.`
- Ajustado `MaterialList` para apresentar erros de indexacao com `role="alert"` e fallback PT-PT quando o backend nao envia mensagem.
- Criados/atualizados testes focados para acentos, cedilhas, whitespace, caracteres de substituicao, TOPIC privado, PDF sem texto e material oficial textual.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds registados em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint `POST /api/ai/source-grounded-answers`, fontes obrigatorias, citacoes limitadas, negativos e builds registados em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Fachada `POST /api/ai/adaptive-explanations`, perfil pedagogico, IA da sala por ano escolar, painel React e testes registados em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Policy `resolveExternalAiPolicy(...)`, endpoint `POST /api/ai/external-knowledge-answers`, fontes internas obrigatorias, notas externas separadas, UI e suite API completa. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Checklist visual frontend-only, painel `MockupAlignmentPanel`, integracao em `SoloStudyDashboard` e teste E2E `mf8-mockup-alignment.spec.ts`. |
| `BK-MF8-06` | `RNF39` | `IMPLEMENTADO` | Normalizacao UTF-8/PT-PT backend, falha controlada sem texto legivel, UI com erro PT-PT e suite API/builds completos. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/common/text/pt-text-normalization.ts` | `real_dev/api/src/common/text/pt-text-normalization.spec.ts`; preserva `funcao` com cedilha/til, normaliza whitespace e rejeita `U+FFFD`. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/modules/materials/materials.service.ts` | `real_dev/api/src/modules/materials/materials.service.spec.ts`; TOPIC privado e normalizado antes de persistir; texto ilegivel rejeitado antes de criar material. |
| `BK-MF8-06` | `RNF39` | `real_dev/api/src/modules/material-index/material-index.service.ts` | `real_dev/api/src/modules/material-index/material-index.service.spec.ts`; TOPIC/URL/PDF/DOCX/material oficial passam por `toReadableExtraction(...)`. |
| `BK-MF8-06` | `RNF39` | `real_dev/web/src/components/materials/MaterialList.tsx` | `npm --prefix real_dev/web run build` - PASS; erro `FAILED` tem fallback PT-PT e `role="alert"`. |

### Mapa de integracao da MF

- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. A checklist visual fica intacta; o BK06 toca apenas materiais/indexacao e a lista de materiais.
- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. Exportacao futura de resumos/quizzes pode consumir texto ja normalizado em `contentText` e chunks de indexacao.
- `MF6/MF7 -> MF8`: `COERENTE`. O BK reutiliza ownership por `SessionGuard`, `MaterialsService.findOwnedTextMaterial(...)`, fila de indexacao e jobs autorizados, sem criar endpoint paralelo.
- Backend/API: nova unidade comum sem dependencia externa e sem alterar providers, auth, storage ou MIME validation.
- Frontend: apenas apresenta o estado publico do job; nao decide ownership, membership, role ou permissao.

### Contratos consumidos

- `MF0`: sessao autenticada e `userId` vindo do backend.
- `MF3`: fontes processaveis e jobs autorizados como base para IA e citacoes.
- `MF5`: `MaterialList` preserva estados loading/error/success e linguagem PT-PT.
- `MF6`: validacoes de seguranca, CSRF/cookies HttpOnly e ausencia de tokens em storage.
- `MF7`: indexacao textual, fila privada e leitura autorizada de jobs.
- `BK-MF8-05`: fecho visual preservado, sem reabrir mockup ou rotas.

### Contratos entregues

- `normalizePortugueseStudyText(value)` devolve `{ text, hasReadableContent }`.
- `MATERIAL_TEXT_NOT_READABLE` passa a bloquear TOPIC privado sem conteudo legivel.
- `MaterialIndexService.toReadableExtraction(...)` centraliza TOPIC, URL, PDF, DOCX e material oficial textual.
- Jobs sem texto legivel ficam `FAILED` com mensagem publica PT-PT, sem expor excertos do material.
- `MaterialList` mostra o erro de job com `role="alert"` e fallback seguro.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A implementacao reutiliza a fila e o service de indexacao ja existentes; nao duplica controllers nem models.
- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. A area visual continua separada da normalizacao de materiais.
- `BK-MF8-06 -> BK-MF8-07`: `COERENTE`. O exportador pode partir de texto normalizado, chunks previsiveis e erro controlado quando nao ha fonte processavel.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` nos ficheiros alvo | `PASS` - sem ocorrencias. |
| `as any`, `payload: unknown`, `TODO`, claims indevidos sobre RAG/OCR/chunking semantico | `PASS` - sem ocorrencias nos ficheiros alvo. |
| `embeddings` | `PASS_COM_JUSTIFICACAO` - uma ocorrencia pre-existente em comentario de `createChunks(...)` delimita negativamente o scope: "sem introduzir embeddings nesta fase". |
| segredos, tokens, cookies, prompts privados ou respostas IA privadas | `PASS` - sem ocorrencias novas nos ficheiros alvo. |
| whitespace final nos ficheiros alterados | `PASS` - `rg -n "[ \t]+$"` sem ocorrencias. |

### Ficheiros alterados

- `real_dev/api/src/common/text/pt-text-normalization.ts`
- `real_dev/api/src/common/text/pt-text-normalization.spec.ts`
- `real_dev/api/src/modules/materials/materials.service.ts`
- `real_dev/api/src/modules/materials/materials.service.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.spec.ts`
- `real_dev/web/src/components/materials/MaterialList.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-exportacao-de-resumos-quizzes-em-pdf-md.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/materials/materials.service.ts`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/material-index/material-index.controller.ts`
- `real_dev/api/src/modules/material-index/material-index-queue.service.ts`
- `real_dev/api/src/modules/official-materials/official-materials.service.ts`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/components/materials/MaterialList.tsx`
- `real_dev/web/src/components/materials/MaterialSubmitForm.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- pt-text-normalization materials.service material-index.service --runInBand` | `PASS` - 4 suites, 28 testes. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 90 suites, 369 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build` concluido. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e texto sensivel | `PASS_COM_JUSTIFICACAO` - apenas comentario pre-existente de ausencia de embeddings. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 BKs, 107 guias, `overall_pass: true`. |
| `git check-ignore -v real_dev ...` | `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-06`.
- TODOs obrigatorios para `BK-MF8-06`: nenhum.
- Nota: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-07`, usando o texto normalizado entregue por `BK-MF8-06` como base para exportacao MD/PDF.

---

## Execucao atual - BK-MF8-05

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-05`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-05 - Aproximacao da UI a UI do mockup` foi fechado no `real_dev` como entrega frontend-only de `RNF38`. A implementacao criou uma checklist visual com rotas reais (`/app`, `/app/salas`, `/app/professor/turmas`), painel React integrado no dashboard do aluno, validacao local contra rotas antigas e teste Playwright focado com sessao real. Nao foram criados endpoints, controllers, DTOs, schemas, models ou services backend.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-05` / `RNF38` em `docs/RNF.md`, matriz, backlog, contrato de campos, views, plano de sprints e guia alvo.
- Confirmada existencia das rotas reais em `real_dev/web/src/routes/protectedRoutes.tsx` e navegacao em `real_dev/web/src/components/layout/navigation.ts`.
- Consultado `mockup/` como referencia visual e de fluxo, sem o tratar como contrato tecnico.
- Criado contrato frontend `buildMockupAlignmentChecklist()`, `summarizeMockupAlignment(...)` e `validateMockupAlignmentChecklist(...)`.
- Criado `MockupAlignmentPanel` com heading acessivel, totais derivados, estados por item, rotas reais e mensagem de erro caso o contrato visual fique incoerente.
- Integrado o painel no fim do dashboard do aluno, preservando carregamento, erro, aviso de performance, cards e acoes existentes.
- Criado teste Playwright que faz login como aluno, abre `/app`, confirma o painel, confirma as tres rotas reais e bloqueia regressao para `/student/dashboard`, `/student/rooms` e `/teacher/classes`.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds registados em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint `POST /api/ai/source-grounded-answers`, fontes obrigatorias, citacoes limitadas, negativos e builds registados em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Fachada `POST /api/ai/adaptive-explanations`, perfil pedagogico, IA da sala por ano escolar, painel React e testes registados em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Policy `resolveExternalAiPolicy(...)`, endpoint `POST /api/ai/external-knowledge-answers`, fontes internas obrigatorias, notas externas separadas, UI e suite API completa. |
| `BK-MF8-05` | `RNF38` | `IMPLEMENTADO` | Checklist visual frontend-only, painel `MockupAlignmentPanel`, integracao em `SoloStudyDashboard` e teste E2E `mf8-mockup-alignment.spec.ts`. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/features/mf8/mockup-alignment.ts` | Contrato com rotas reais permitidas, checklist de 3 ecras, resumo derivado e validacao local. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/features/mf8/mockup-alignment-panel.tsx` | Painel React com heading `Alinhamento ao mockup`, totais, estados, rotas e alerta para checklist invalida. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/src/pages/student/SoloStudyDashboard.tsx` | Painel integrado no dashboard `/app` sem alterar o fluxo de carregamento do estudo individual. |
| `BK-MF8-05` | `RNF38` | `real_dev/web/tests/e2e/mf8-mockup-alignment.spec.ts` | `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts` - PASS, 1 teste. |

### Mapa de integracao da MF

- `BK-MF8-04 -> BK-MF8-05`: `COERENTE`. O contrato de IA externa fica intacto; o BK05 trata apenas do fecho visual e nao redefine endpoint, policy, ownership ou fontes.
- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. O handoff deixa uma checklist visual fechada; o BK06 pode focar UTF-8/PT-PT sem criar UI de mockup.
- `RNF38`: entregue como checklist objetiva e verificavel, nao como pixel-perfect nem como copia tecnica do mockup.
- `mockup/`: usado como referencia visual; as rotas reais da app continuam a ser a fonte tecnica de verdade.
- Backend/API: sem alteracoes e sem superficie nova.
- Frontend: novo namespace `features/mf8` sem duplicar componentes MF3-MF7 existentes.

### Contratos consumidos

- `MF0`: dashboard autenticado dentro de `AppShell`; a sessao e a autorizacao continuam nos fluxos existentes.
- `MF5`: `SoloStudyDashboard` preserva `startPerformanceBudget(...)`, `finishPerformanceBudget(...)` e feedback de performance.
- `MF7`: convencao de Playwright com login real e rotas protegidas.
- `BK-MF8-04`: handoff que limita o BK05 a refinamento visual, sem alterar seguranca de IA externa.
- Documentacao canonica: `RNF38`, `BK-MF8-05`, owner `Guilherme`, apoio `Natalia`, sprint `S12`, proximo BK `BK-MF8-06`.

### Contratos entregues

- `buildMockupAlignmentChecklist()` devolve os ecras prioritarios de fecho visual.
- `summarizeMockupAlignment(items)` calcula totais por estado sem numeros manuais.
- `validateMockupAlignmentChecklist(items)` bloqueia rotas que nao sejam `/app`, `/app/salas` ou `/app/professor/turmas`.
- `MockupAlignmentPanel` apresenta a checklist no dashboard do aluno.
- `mf8-mockup-alignment.spec.ts` prova painel, rotas reais e ausencia das rotas antigas.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A validacao E2E reutiliza login real e rotas protegidas, sem guardar tokens em storage nem criar bypass frontend.
- `BK-MF8-04 -> BK-MF8-05`: `COERENTE`. O BK05 nao mexe em IA externa, provider, DTOs ou persistencia.
- `BK-MF8-05 -> BK-MF8-06`: `COERENTE`. O BK06 fica livre para normalizacao UTF-8/PT-PT e pode assumir que o fecho visual ja tem inventario verificavel.
- Resultado geral de coerencia: `COERENTE`.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Pesquisa estatica obrigatoria

| Pesquisa | Resultado |
| --- | --- |
| `localStorage` / `sessionStorage` no alvo | `PASS` - sem ocorrencias. |
| `as any`, `payload: unknown`, `TODO`, claims indevidos sobre RAG/embeddings/OCR/chunking/indexacao automatica | `PASS` - sem ocorrencias nos ficheiros alvo. |
| segredos, tokens, cookies, prompts privados ou dados pessoais em logs | `PASS_COM_JUSTIFICACAO` - apenas aparece `password` no teste E2E como campo de credenciais seed/variaveis de ambiente; nao ha segredo real nem output sensivel. |
| rotas antigas `/student/dashboard`, `/student/rooms`, `/teacher/classes` | `PASS_COM_JUSTIFICACAO` - aparecem apenas no negativo deliberado do teste Playwright. |

### Ficheiros alterados

- `real_dev/web/src/features/mf8/mockup-alignment.ts`
- `real_dev/web/src/features/mf8/mockup-alignment-panel.tsx`
- `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
- `real_dev/web/tests/e2e/mf8-mockup-alignment.spec.ts`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `mockup/`
- `real_dev/web/package.json`
- `real_dev/web/playwright.config.ts`
- `real_dev/web/src/routes/protectedRoutes.tsx`
- `real_dev/web/src/components/layout/navigation.ts`
- `real_dev/web/src/pages/student/SoloStudyDashboard.tsx`
- `real_dev/web/tests/e2e/`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build concluidos. |
| `npm --prefix real_dev/web run test:e2e -- tests/e2e/mf8-mockup-alignment.spec.ts` | `BLOQUEADO_NO_SANDBOX` na primeira execucao por `listen EPERM: operation not permitted 0.0.0.0` ao arrancar `MongoMemoryServer`; rerun fora da sandbox: `PASS`, 1 teste. |
| Pesquisa estatica por storage, segredos, tokens, TODOs, claims proibidos e rotas antigas | `PASS_COM_JUSTIFICACAO` - falsos positivos apenas no teste E2E conforme descrito acima. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - validacao documental preservada. |
| `git check-ignore -v real_dev` | `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-05`.
- TODOs obrigatorios para `BK-MF8-05`: nenhum.
- Nota: `real_dev/` continua ignorado por Git conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-06`, mantendo o foco em UTF-8/PT-PT e preservando a checklist visual entregue por `BK-MF8-05`.

---

## Execucao atual - BK-MF8-04

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-04`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`, `BK-MF8-04`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-04 - IA externa segue politicas e filtros proprios` foi fechado no `real_dev` com policy backend isolada `resolveExternalAiPolicy(...)`, endpoint unico `POST /api/ai/external-knowledge-answers`, role `STUDENT` obrigatoria, `userId` vindo da sessao, ownership da area validado no backend, fontes internas processaveis obrigatorias, provider chamado apenas depois da policy, persistencia com `externalUsed`, `internalCitations` e `externalNotes` separados, cliente React tipado e painel com estados vazio/loading/erro/sucesso.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-04` / `RNF37` em `docs/RNF.md`, matriz, backlog, contrato de campos, views, plano de sprints e guia alvo.
- Criada policy pequena e testavel em `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts`.
- Integrada a policy em `ExternalKnowledgeAiService` depois de ownership/fontes e antes do provider.
- Mantido endpoint unico `POST /api/ai/external-knowledge-answers`, protegido por `SessionGuard` e sem identidade vinda do body.
- Reforcado o service para filtrar citacoes vazias e bloquear `NO_INTERNAL_SOURCES` antes de chamar o provider.
- Reforcados testes de policy, sucesso com nota externa, sem permissao externa, sem fontes internas, role errada e provider invalido.
- Alinhado o painel React com labels, `role="alert"`, limpeza de resposta anterior, estado vazio, `canSubmit`, fontes internas e notas externas.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds registados em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint `POST /api/ai/source-grounded-answers`, fontes obrigatorias, citacoes limitadas, negativos e builds registados em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Fachada `POST /api/ai/adaptive-explanations`, perfil pedagogico, IA da sala por ano escolar, painel React e testes registados em execucao anterior. |
| `BK-MF8-04` | `RNF37` | `IMPLEMENTADO` | Policy `resolveExternalAiPolicy(...)`, endpoint `POST /api/ai/external-knowledge-answers`, fontes internas obrigatorias, notas externas separadas, UI e suite API completa. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-04` | `RNF37` | `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts` | `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`; `npm --prefix real_dev/api test -- external-knowledge-ai --runInBand` - PASS, 2 suites, 8 testes. |
| `BK-MF8-04` | `RNF37` | `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`, `dto/ask-external-knowledge-ai.dto.ts`, `schemas/external-knowledge-ai-answer.schema.ts`, `external-knowledge-ai.controller.ts`, `external-knowledge-ai.module.ts` | `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`; `npm --prefix real_dev/api test` - PASS, 89 suites, 362 testes. |
| `BK-MF8-04` | `RNF37` | `real_dev/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`, `external-knowledge-ai-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts` | `npm --prefix real_dev/web run build` - PASS. |

### Mapa de integracao da MF

- Endpoint preservado: `POST /api/ai/external-knowledge-answers`.
- DTO preservado: `AskExternalKnowledgeAiDto` recebe apenas `studyAreaId`, `question` e `allowExternalKnowledge`.
- Controller protegido por `SessionGuard`; a identidade vem de `request.user`.
- Service aplica a ordem segura: role `STUDENT` -> ownership da area -> fontes internas processaveis -> policy -> provider -> validacao -> persistencia.
- Policy `resolveExternalAiPolicy(...)` bloqueia contexto externo sem fontes internas ou sem permissao explicita.
- Persistencia separa `internalCitations` de `externalNotes` e marca `externalUsed` apenas quando a policy permite.
- UI consome o endpoint real atraves de `requestMf3Json(...)`, que usa `credentials: "include"` e header CSRF.

### Contratos consumidos

- `MF0`: sessao autenticada por `SessionGuard` e `AuthenticatedUser`.
- `MF3`: helper frontend `requestMf3Json(...)` com cookies HttpOnly/CSRF.
- `MF4`: padrao de governanca IA antes do provider e ausencia de segredos no browser.
- `MF6`: isolamento de dados, CSRF, ownership backend e ausencia de tokens em storage.
- `MF7`: fontes processaveis e explicabilidade como base de seguranca para respostas IA.
- `BK-MF8-02`: resposta factual sustentada por fontes internas autorizadas.
- `BK-MF8-03`: UI com estados completos, provider validado e handoff para policy de IA externa.

### Contratos entregues

- `resolveExternalAiPolicy(input)` como unidade testavel para `RNF37`.
- `ExternalKnowledgeAiService.ask(actor, input)` como contrato que combina role, ownership, fontes internas, policy, provider e persistencia.
- `ExternalKnowledgeAiAnswerView` com `externalUsed`, `internalCitations` e `externalNotes` separados.
- `askExternalKnowledgeAi(input)` como cliente React tipado para o endpoint unico.
- `ExternalKnowledgeAiPanel` com estados vazio/loading/erro/sucesso, fontes internas e notas externas.
- `BK-MF8-05` pode refinar UI/mockup sem redefinir endpoint, DTO, policy, ownership ou separacao de fontes/notas.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 reutiliza fontes processaveis/autorizadas e nao cria fonte externa como base factual primaria.
- `BK-MF8-03 -> BK-MF8-04`: `COERENTE`. O BK04 consome provider validado, fontes internas e UI com estados completos sem reabrir personalizacao pedagogica.
- `BK-MF8-04 -> BK-MF8-05`: `COERENTE`. O proximo BK fica limitado a aproximacao visual e nao precisa alterar seguranca de IA externa.
- Sem regressao observada em auth, ownership, DTOs, schemas, frontend, testes ou builds.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Ficheiros alterados

- `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-ai-policy.spec.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.service.spec.ts`
- `real_dev/web/src/features/external-knowledge-ai/ask-external-knowledge-ai.ts`
- `real_dev/web/src/features/external-knowledge-ai/external-knowledge-ai-panel.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `real_dev/api/src/modules/external-knowledge-ai/dto/ask-external-knowledge-ai.dto.ts`
- `real_dev/api/src/modules/external-knowledge-ai/schemas/external-knowledge-ai-answer.schema.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.controller.ts`
- `real_dev/api/src/modules/external-knowledge-ai/external-knowledge-ai.module.ts`
- `real_dev/api/src/modules/materials/materials.service.ts`
- `real_dev/api/src/modules/ai/providers/ai-provider.ts`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/web/src/pages/student/Mf3CommunityPage.tsx`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- external-knowledge-ai --runInBand` | `PASS` - 2 suites, 8 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 89 suites, 362 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 RF/RNF/BK/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica no alvo por `localStorage`, `sessionStorage`, `as any`, `payload: unknown`, `TODO`, claims proibidos, segredos, tokens, cookies e dados privados | `PASS` - sem ocorrencias nos ficheiros alvo. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev` | `PASS_COM_JUSTIFICACAO` - `.gitignore:2:real_dev/`; esperado pela prompt e nao e finding. |

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-04`.
- TODOs obrigatorios para `BK-MF8-04`: nenhum.
- `real_dev/` continua tratado como area local/ignorada conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-05`, mantendo o escopo no refinamento visual/mockup e reutilizando o contrato de IA externa fechado neste BK sem alterar seguranca, policy, endpoint ou ownership.

---

## Execucao atual - BK-MF8-03

### Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-03`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`, `BK-MF8-03`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-04`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-03 - IA adapta explicacoes ao nivel do aluno` foi fechado no `real_dev` com a fachada `POST /api/ai/adaptive-explanations`, role `STUDENT` obrigatoria, `userId` vindo da sessao, ownership da area validado em `AdaptiveLearningService`, defaults seguros `BALANCED`/`INTERMEDIATE` quando nao existe perfil, prompt com `pace`, `level`, `difficulties`, `preferredExplanationStyle` e fontes autorizadas, negativos de ausencia de fontes/provider invalido, painel React com estados loading/erro/vazio/sucesso e IA da sala adaptada por `StudentProfile.year` sem aceitar ano/idade no body.

### Escopo implementado

- Confirmado contrato canonico `BK-MF8-03` / `RNF36` em `docs/RNF.md`, matriz, backlog, contrato de campos, views e plano de sprints.
- Mantida a fachada publica `POST /api/ai/adaptive-explanations`, protegida por `SessionGuard` e concentrando a regra de role no service.
- Reforcada a evidencia de que o frontend so envia `studyAreaId` e `question`; `userId`, `role`, `pace`, `level` e ano escolar continuam resolvidos no backend.
- Acrescentado teste focado para perfil ausente com defaults seguros antes de construir o prompt.
- Alinhado o painel React de explicacao adaptada com labels, validacao leve de input, `role="alert"`, limpeza de resposta anterior, estado vazio e sucesso.
- Confirmada a IA da sala: `RoomAiService` resolve `StudentProfile.year` via `StudentProfileService`, converte-o com `resolveRoomAiPedagogicalContext(...)` e limita a resposta as fontes da sala.

### Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend de seguranca IA, guardrail integrado, UI tipada, testes e builds registados em execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint `POST /api/ai/source-grounded-answers`, fontes obrigatorias, citacoes limitadas, negativos e builds registados em execucao anterior. |
| `BK-MF8-03` | `RNF36` | `IMPLEMENTADO` | Fachada `POST /api/ai/adaptive-explanations`, `AdaptiveLearningService`, `RoomAiService`, painel React, suite API completa e build web/API. |

### Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`, `adaptive-explanations.service.ts`, `adaptive-explanations.controller.ts`, `adaptive-explanations.module.ts` | `npm --prefix real_dev/api test -- adaptive-explanations` - 1 suite, 2 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/ai/adaptive-learning.service.ts`, `prompts/adaptive-explanation.prompt.ts`, `schemas/learning-profile.schema.ts`, `dto/update-learning-profile.dto.ts` | `npm --prefix real_dev/api test -- adaptive-learning` - 1 suite, 5 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/api/src/modules/study-rooms/room-ai.service.ts`, `room-ai-pedagogy.ts`, `prompts/room-ai.prompt.ts` | `npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand` - 1 suite, 5 testes; `npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand` - 1 suite, 11 testes. |
| `BK-MF8-03` | `RNF36` | `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`, `adaptive-explanation-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts` | `npm --prefix real_dev/web run build` - PASS. |

### Mapa de integracao da MF

- Endpoint preservado: `POST /api/ai/adaptive-explanations`.
- DTO preservado: `AskMf3AdaptiveExplanationDto` recebe apenas `studyAreaId` e `question`.
- Controller protegido por `SessionGuard`; a identidade vem de `request.user`.
- Service de fachada bloqueia utilizadores que nao sejam `STUDENT` com `STUDENT_ROLE_REQUIRED`.
- `AdaptiveLearningService` aplica a ordem segura: ownership da area -> perfil -> fontes processaveis -> provider -> validacao de fontes devolvidas -> persistencia -> historico.
- Defaults seguros sem perfil: `pace=BALANCED`, `level=INTERMEDIATE`, sem dificuldades nem estilo inventado.
- Erro observavel sem fontes: `NO_PROCESSABLE_SOURCES`.
- IA da sala preservada: `POST /api/study-rooms/:roomId/ai/answers` valida membership, fontes da sala, `StudentProfile.year` do aluno autenticado e provider.
- UI consome o endpoint real atraves de `requestMf3Json(...)`, que usa `credentials: "include"` e header CSRF.

### Contratos consumidos

- `MF0`: sessao autenticada por `SessionGuard` e `AuthenticatedUser`.
- `MF1`: `LearningProfile`, `LearningPace`, `LearningLevel`, `AdaptiveLearningService` e perfil pedagogico por area.
- `MF3`: helper frontend `requestMf3Json(...)`, cookies HttpOnly/CSRF e superficie historica de explicacoes adaptadas.
- `MF6`: isolamento por ownership, CSRF e ausencia de tokens guardados no browser.
- `MF7`: fontes processaveis e explicabilidade como base para respostas IA seguras.
- `BK-MF8-02`: factualidade limitada a fontes autorizadas e fallback honesto antes da personalizacao.

### Contratos entregues

- `AdaptiveExplanationsService.ask(actor, input)` e a fachada `POST /api/ai/adaptive-explanations` como caminho publico de `RNF36`.
- `AdaptiveLearningService.askAdaptiveExplanation(userId, studyAreaId, input)` como contrato que combina perfil, area privada, fontes, provider, validacao e historico.
- `buildAdaptiveExplanationPrompt(...)` inclui ritmo, nivel, dificuldades, estilo e fontes autorizadas.
- `RoomAiService.askRoomAi(...)` usa `StudentProfile.year` apenas no backend para adaptar linguagem da IA da sala.
- `AdaptiveExplanationPanel` apresenta loading, erro, vazio e sucesso sem decidir ownership, role ou perfil no frontend.
- `BK-MF8-04` pode assumir perfil pedagogico, fontes autorizadas, provider validado e UI adaptativa como base para politicas de IA externa.

### Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 consome fontes/processamento/explicabilidade e nao cria enum, endpoint ou policy paralela para nivel pedagogico.
- `BK-MF8-02 -> BK-MF8-03`: `COERENTE`. A adaptacao pedagogica parte de fontes processaveis e provider validado, preservando fallback honesto.
- `BK-MF8-03 -> BK-MF8-04`: `COERENTE`. O proximo BK pode acrescentar politicas de IA externa sem reescrever perfil, fachada, UI ou contratos de fontes.
- Sem regressao observada em auth, ownership, membership, DTOs, schemas, UI ou builds.

### Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

### Ficheiros alterados

- `real_dev/api/src/modules/adaptive-explanations/dto/ask-adaptive-explanation.dto.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.controller.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.module.ts`
- `real_dev/api/src/modules/adaptive-explanations/adaptive-explanations.service.spec.ts`
- `real_dev/api/src/modules/ai/adaptive-learning.service.spec.ts`
- `real_dev/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- `real_dev/web/src/features/adaptive-explanations/ask-adaptive-explanation.ts`
- `real_dev/web/src/features/adaptive-explanations/adaptive-explanation-panel.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md`
- `docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-09-ia-explica-fontes-dos-conteudos-paginas-seccoes.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-ia-respeita-perfis-distintos-aluno-turma-professor.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-11-ia-segue-limites-definidos-pelo-professor.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-ia-externa-segue-politicas-e-filtros-proprios.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `real_dev/api/src/modules/ai/adaptive-learning.service.ts`
- `real_dev/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- `real_dev/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- `real_dev/api/src/modules/ai/schemas/learning-profile.schema.ts`
- `real_dev/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- `real_dev/api/src/modules/study-rooms/room-ai.service.ts`
- `real_dev/api/src/modules/study-rooms/room-ai-pedagogy.ts`
- `real_dev/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`
- `real_dev/web/src/pages/student/RoomAiPage.tsx`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- adaptive-explanations` | `PASS` - 1 suite, 2 testes. |
| `npm --prefix real_dev/api test -- adaptive-learning` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- room-ai.service.spec.ts --runInBand` | `PASS` - 1 suite, 5 testes. |
| `npm --prefix real_dev/api test -- room-ai-pedagogy.spec.ts --runInBand` | `PASS` - 1 suite, 11 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 88 suites, 357 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 RF/RNF/BK/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica no alvo por storage de sessao/token, segredos, `as any`, `payload: unknown`, TODOs vagos e claims proibidos | `PASS_COM_JUSTIFICACAO` - apenas comentarios seguros sobre cookies HttpOnly e materiais privados; sem valores sensiveis nem storage de sessao. |
| `rg -n "[ \t]+$" <ficheiros alterados>` | `PASS` - sem whitespace final. |
| `git diff --check` | `PASS`. |

### Blockers e TODOs

- Blockers: nenhum para `BK-MF8-03`.
- TODOs obrigatorios para `BK-MF8-03`: nenhum.
- `real_dev/` continua tratado como area local/ignorada conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

### Proxima acao recomendada

Executar `MODO=implementar` ou `MODO=auditar_implementacao` para `BK-MF8-04`, reutilizando a fachada de explicacoes adaptadas, perfil pedagogico, fontes autorizadas e UI com estados completos como base para politicas e filtros de IA externa.

---

## Resultado geral

- `PROJECT_NAME`: StudyFlow
- `MODO`: implementar
- `IMPLEMENTATION_ROOT`: `real_dev`
- `MF_ALVO`: `MF8`
- `BKs abrangidos nesta execucao`: `BK-MF8-02`
- `BKs MF8 ja registados no relatorio`: `BK-MF8-01`, `BK-MF8-02`
- `Resultado`: `IMPLEMENTADO`
- `Data`: `2026-07-03`
- `Permissoes`: sem commits; sem alteracao de docs canonicos; relatorio tecnico atualizado.

`BK-MF8-02 - IA nao pode inventar informacao factual` foi implementado/fechado no `real_dev` com o fluxo `POST /api/ai/source-grounded-answers`, validacao backend de cada `sourceJobId`, fallback honesto `NO_INDEXED_SOURCES`, citacoes publicas limitadas, governanca IA antes do provider, testes focados e UI com estados loading/erro/vazio/sucesso.

## Escopo implementado

- Confirmado contrato canonico `BK-MF8-02` / `RNF35` em guia, matriz, backlog, contrato de campos, views e plano de sprints.
- Reutilizado `MaterialIndexService.findReadableDoneJob(...)` para validar ownership/membership e estado `DONE` de cada fonte antes do prompt.
- Reutilizados `AiConsentsService.assertGranted(...)`, `AiModelPoliciesService.resolveForUse(...)` e `AiQuotasService.reserveUsage(...)` antes da chamada ao provider.
- Reforcado `SourceGroundedAiService` para tratar chunks sem citacao publica valida como ausencia de fontes citaveis, sem chegar a consentimento, quota, provider ou persistencia.
- Acrescentados negativos de provider invalido e chunk nao citavel na suite `source-grounded-ai.service`.
- Alinhado `SourceGroundedAiPanel` com fallback honesto: limpa resposta anterior em nova submissao, usa `role="alert"`, estado vazio, ajuda do input e `canSubmit`.

## Estado por BK

| BK | RF/RNF | Estado | Evidencia |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF34` | `IMPLEMENTADO` | Policy backend `evaluateAiSafetyInput(...)`, guardrail integrado, UI tipada, testes e builds registados na execucao anterior. |
| `BK-MF8-02` | `RNF35` | `IMPLEMENTADO` | Endpoint `POST /api/ai/source-grounded-answers`, service com fontes obrigatorias, citacoes limitadas, negativos, suite API completa e build web/API. |

## Rastreabilidade BK -> RNF -> ficheiros -> testes

| BK | RNF | Ficheiros principais | Testes/evidence |
| --- | --- | --- | --- |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.ts` | `real_dev/api/src/modules/source-grounded-ai/citation-policy.spec.ts` |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts` | `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`, `source-grounded-ai.contract.spec.ts` |
| `BK-MF8-02` | `RNF35` | `real_dev/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts`, `schemas/source-grounded-ai-answer.schema.ts`, `source-grounded-ai.controller.ts`, `source-grounded-ai.module.ts` | `npm --prefix real_dev/api test -- source-grounded-ai` |
| `BK-MF8-02` | `RNF35` | `real_dev/web/src/features/source-grounded-ai/ask-source-grounded-ai.ts`, `source-grounded-ai-panel.tsx`, `real_dev/web/src/features/mf3/request-mf3-json.ts` | `npm --prefix real_dev/web run build` |

## Mapa de integracao da MF

- Endpoint preservado: `POST /api/ai/source-grounded-answers`.
- DTO preservado: `AskSourceGroundedAiDto` recebe apenas `sourceJobIds` e `question`, sem `userId` vindo do frontend.
- Controller protegido por `SessionGuard`; a identidade vem de `request.user`.
- Service aplica a ordem segura: fontes autorizadas -> citacoes publicas -> consentimento -> politica -> limite de prompt -> quota -> provider -> persistencia.
- Erro observavel sem fontes citaveis: `NO_INDEXED_SOURCES`.
- Criterio de citacao publica: `sourceLabel`, `locator` e `excerpt` obrigatorios, excerto limitado a 420 caracteres.
- UI consome o endpoint real atraves de `requestMf3Json(...)`, que usa `credentials: "include"` e header CSRF.

## Contratos consumidos

- `MF0`: sessao autenticada por `SessionGuard` e `AuthenticatedUser`.
- `MF3`: helper frontend `requestMf3Json(...)`, fonte de sessao via cookie HttpOnly e contrato historico de IA com citacoes.
- `MF4`: governanca IA por consentimentos, politicas e quotas.
- `MF6`: isolamento de dados, CSRF, HTTPS/cookies HttpOnly e negativos de acesso.
- `MF7`: `findReadableDoneJob(...)` como fronteira de fontes processaveis autorizadas, perfis/contextos separados e limites antes do provider.
- `BK-MF8-01`: barreira etica previa para pedidos inseguros/enviesados.

## Contratos entregues

- `SourceGroundedAiService.ask(actor, input)` devolve resposta apenas quando existem fontes processaveis, autorizadas e citaveis.
- `normalizePublicCitation(...)` continua a ser a policy pequena de citacoes publicas.
- Chunks sem citacao publica valida nao sustentam resposta factual e caem no fallback honesto.
- Provider invalido nao persiste resposta nem historico enganador.
- `SourceGroundedAiPanel` mostra erro/vazio/sucesso sem manter resposta antiga apos falha.
- `BK-MF8-03` pode assumir fontes obrigatorias, citacoes publicas limitadas e fallback honesto antes de adaptar explicacoes ao nivel do aluno.

## Coerencia entre MFs

- `MF7 -> MF8`: `COERENTE`. A MF8 consome a validacao de fontes e governanca IA ja entregues, sem criar endpoint paralelo nem aceitar identidade do frontend.
- `BK-MF8-01 -> BK-MF8-02`: `COERENTE`. O BK02 fecha factualidade com fontes obrigatorias depois da barreira etica do BK01.
- `BK-MF8-02 -> BK-MF8-03`: `COERENTE`. O proximo BK pode reutilizar respostas factualizadas com fontes autorizadas e fallback honesto.
- Sem regressao observada em auth, ownership, membership, DTOs, schemas, UI ou builds.

## Findings por severidade

- `P0`: nenhum finding aberto.
- `P1`: nenhum finding aberto.
- `P2`: nenhum finding aberto.
- `P3`: nenhum finding aberto.

## Ficheiros alterados

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/web/src/features/source-grounded-ai/source-grounded-ai-panel.tsx`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

## Ficheiros auditados/revistos

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
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-ia-adapta-explicacoes-ao-nivel-do-aluno.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `real_dev/api/src/modules/material-index/material-index.service.ts`
- `real_dev/api/src/modules/ai-consents/ai-consents.service.ts`
- `real_dev/api/src/modules/ai-model-policies/ai-model-policies.service.ts`
- `real_dev/api/src/modules/ai-quotas/ai-quotas.service.ts`
- `real_dev/web/src/features/mf3/request-mf3-json.ts`

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- source-grounded-ai` | `PASS` - 3 suites, 16 testes. |
| `npm --prefix real_dev/api test` | `PASS` - 88 suites, 356 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS`. |
| `bash scripts/validate-planificacao.sh` | `PASS` - 107 RF/RNF/BK/guias, score 100, `overall_pass=true`. |
| Pesquisa estatica no alvo por storage de sessao/token, `as any`, `payload: unknown`, TODOs vagos e claims proibidos | `PASS_COM_JUSTIFICACAO` - apenas comentarios sobre cookies HttpOnly no helper `requestMf3Json(...)`; sem valores sensiveis. |
| `git diff --check` | `PASS`. |
| Pesquisa de whitespace nos ficheiros alterados e no relatorio | `PASS` - sem ocorrencias. |

## Blockers e TODOs

- Blockers: nenhum para `BK-MF8-02`.
- TODOs obrigatorios para `BK-MF8-02`: nenhum.
- `real_dev/` continua tratado como area local/ignorada conforme contrato da prompt; nao e finding.
- Sem commits por `PERMITIR_COMMITS: nao`.

## Proxima acao recomendada

Executar `MODO=implementar` para `BK-MF8-03`, reutilizando `POST /api/ai/source-grounded-answers`, `NO_INDEXED_SOURCES`, citacoes publicas e governanca IA como base para explicacoes adaptadas ao nivel do aluno.
