# AUDITORIA-HIDRATACAO-MF7 - StudyFlow

## Header

- `project`: `StudyFlow`
- `macro`: `MF7`
- `modo`: `auditar_apenas`
- `bk_ids`: `[]`
- `reference_root`: `real_dev`
- `student_output_root`: `apps`
- `student_api_root`: `apps/api`
- `student_web_root`: `apps/web`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `output_mode`: `relatorio_e_resumo`
- `data_execucao`: `2026-06-27`

## Resumo executivo

Execucao `auditar_apenas` aplicada aos 11 BKs de `MF7`.

Por `STRICT_SCOPE=true`, esta execucao atualizou apenas este relatorio. Nao foram editados BKs, codigo real, mockup, backlogs, matriz, template global, relatorios de implementacao ou documentos canonicos fora do relatorio de auditoria da MF alvo.

O relatorio existente no inicio da execucao ainda descrevia uma execucao anterior em `corrigir_apenas`. Esse drift foi corrigido neste artefacto para alinhar o relatorio com a prompt atual: auditoria documental, sem correcao de guias.

Estado observado dos BKs alvo:

- `OK`: 11 BKs.
- `PARCIAL`: 0 BKs.
- `CRITICO`: 0 BKs.

Contagem normalizada:

| Momento | OK | PARCIAL | CRITICO | Observacao |
| --- | ---: | ---: | ---: | --- |
| Antes desta execucao | 11 | 0 | 0 | Estado corrente dos ficheiros MF7 no inicio desta auditoria. |
| Depois desta execucao | 11 | 0 | 0 | Sem edicoes aos BKs; apenas relatorio normalizado e atualizado. |

BKs analisados:

- `BK-MF7-01`
- `BK-MF7-02`
- `BK-MF7-03`
- `BK-MF7-04`
- `BK-MF7-05`
- `BK-MF7-06`
- `BK-MF7-07`
- `BK-MF7-08`
- `BK-MF7-09`
- `BK-MF7-10`
- `BK-MF7-11`

BKs editados nesta execucao: nenhum.

Ficheiros editados nesta execucao:

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF7.md`

Resultado final: a MF7 fica classificada como `OK` no ambito documental desta auditoria, com riscos residuais apenas fora do scope: `BK-MF8-01` ainda esta em formato legacy e a implementacao real ainda nao contem todas as pecas que os guias MF7 mandam criar.

## Ficheiros consultados

Documentos canonicos:

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

Guias e relatorios:

- Todos os BKs de `docs/planificacao/guias-bk/MF7/`.
- BKs anteriores MF0-MF6 por inventario estrutural e dependencias diretas.
- `docs/planificacao/guias-bk/MF6/BK-MF6-09-guardrails-obrigatorios-na-ia.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-10-ia-nao-acede-a-dados-de-outras-turmas-ou-alunos.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-12-auto-recovery-apos-falhas.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-ia-evita-enviesamentos-e-respostas-inseguras.md`
- Relatorios existentes `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-*.md`.

Referencia tecnica privada usada apenas para validacao estrutural:

- `real_dev/api`
- `real_dev/web`
- `apps/api`
- `apps/web`

Nota de scope: `real_dev` foi usado como referencia privada do professor/orientador. Os BKs auditados continuam a apontar para `apps/api`, `apps/web` e `docs`, sem expor caminhos privados ao aluno.

## Inventario canonico da MF7

| BK | RF/RNF | Prioridade | Sprint | Proximo BK | Estado da auditoria |
| --- | --- | --- | --- | --- | --- |
| `BK-MF7-01` | `RNF23` | `P0` | `S11` | `BK-MF7-02` | `OK` |
| `BK-MF7-02` | `RNF24` | `P2` | `S10` | `BK-MF7-03` | `OK` |
| `BK-MF7-03` | `RNF25` | `P0` | `S11` | `BK-MF7-04` | `OK` |
| `BK-MF7-04` | `RNF26` | `P0` | `S11` | `BK-MF7-05` | `OK` |
| `BK-MF7-05` | `RNF27` | `P1` | `S06` | `BK-MF7-06` | `OK` |
| `BK-MF7-06` | `RNF28` | `P1` | `S07` | `BK-MF7-07` | `OK` |
| `BK-MF7-07` | `RNF29` | `P1` | `S12` | `BK-MF7-08` | `OK` |
| `BK-MF7-08` | `RNF30` | `P1` | `S12` | `BK-MF7-09` | `OK` |
| `BK-MF7-09` | `RNF31` | `P0` | `S12` | `BK-MF7-10` | `OK` |
| `BK-MF7-10` | `RNF32` | `P0` | `S12` | `BK-MF7-11` | `OK` |
| `BK-MF7-11` | `RNF33` | `P0` | `S12` | `BK-MF8-01` | `OK` |

## Estado dos BKs alvo

| BK | Estado | Justificacao | Risco residual |
| --- | --- | --- | --- |
| `BK-MF7-01` | `OK` | Estrutura obrigatoria completa: 16 secoes `####`, 7 passos, contrato de logs estruturados, redaccao de dados sensiveis, integracao com auditoria e testes negativos. | Baixo. Depende de eventos/recovery fechados em `BK-MF6-12`. |
| `BK-MF7-02` | `OK` | Entrega funcao pura para budget de disponibilidade, estados `HEALTHY`/`WARNING`/`BREACHED`, validacao de input e handoff para health-check. | Baixo. Nao promete monitorizacao externa fora de scope. |
| `BK-MF7-03` | `OK` | Define fronteiras modulares backend por dominio, sem criar endpoint paralelo nem quebrar services anteriores. | Baixo. A policy de fronteiras e uma decisao tecnica `DERIVADO`, controlada no guia. |
| `BK-MF7-04` | `OK` | Entrega componente frontend reutilizavel, integracao em paginas reais, estados loading/error/empty/success e testes frontend. | Baixo. Labels atuais de login ainda aparecem em ingles na app, mas a localizacao fica para MF8. |
| `BK-MF7-05` | `OK` | Entrega mapa tecnico minimo, script de exportacao e negativos contra exposicao de dados sensiveis. | Baixo. A documentacao tecnica nao substitui BKs nem evidence de implementacao. |
| `BK-MF7-06` | `OK` | Entrega contrato de testes para modulo critico de IA baseada em fontes, incluindo ausencia de fontes e provider invalido. | Baixo. Usa mocks deterministas apenas como fixtures de teste. |
| `BK-MF7-07` | `OK` | Entrega documento de rollback, script de readiness e teste unitario sem prometer pipeline CI/CD inexistente. | Baixo. Validacao real de deploy continua dependente do ambiente operacional. |
| `BK-MF7-08` | `OK` | Entrega `GET /api/health`, service/controller/module e teste que evita expor userId, cookies, tokens, URIs internas ou stack traces. | Baixo. Health-check e publico e minimizado por desenho. |
| `BK-MF7-09` | `OK` | Entrega policy de citacoes publicas, integracao com `SourceGroundedAiService`, frontend com excerto limitado e negativos de acesso. | Baixo. `chunk`/`locator` aparecem como termos de fonte processada, nao como promessa de RAG avancado. |
| `BK-MF7-10` | `OK` | Entrega policy de separacao de contexto/perfil IA antes de materiais, quota, provider e persistencia. | Baixo. Requer execucao dos testes pelo aluno quando implementar o BK. |
| `BK-MF7-11` | `OK` | Entrega limites docentes antes do provider, reutilizando policy, quota e contexto IA com testes negativos. | Baixo. Handoff final para MF8 depende da correcao futura do formato legacy da MF8. |

## Findings e decisoes

### MF7-AUD-701-R - Relatorio anterior estava desalinhado com a prompt atual

- Estado: `CORRIGIDO`.
- Evidencia: no inicio desta execucao, `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF7.md` descrevia `modo: corrigir_apenas`, BKs editados e findings de uma execucao anterior.
- Impacto: a prompt atual exige `MODO: auditar_apenas`; manter o relatorio anterior criaria uma entrega enganadora.
- Acao nesta execucao: relatorio reescrito como auditoria atual, sem declarar edicoes aos BKs.
- Validacao: este relatorio declara `modo: auditar_apenas`, `BKs editados: nenhum` e preserva o scope.

### MF7-AUD-702-R - Estrutura e comentarios didaticos da MF7 estao conformes

- Estado: `JA_CORRIGIDO`.
- Evidencia: verificador estrutural local encontrou 11 ficheiros, 77 passos, 62 blocos de codigo e 37 blocos TS/JS, sem falhas na ordem das secoes, pontos 1 a 7 dos passos ou minimo de comentarios didaticos.
- Impacto: os BKs MF7 podem ser classificados como `OK` no contrato documental desta auditoria.
- Acao nesta execucao: nenhuma edicao aos BKs; apenas registo de estado.

### MF7-AUD-712-S - Sucessor `BK-MF8-01` continua em contrato legacy

- Estado: `BLOQUEADO_POR_SCOPE`.
- Evidencia: `BK-MF8-01` ainda usa `Bloco pedagogico`, `Bloco operacional`, `### Passos` e `Snippet tecnico aplicavel`, nao o contrato tutorial de 16 secoes e 7 passos usado nos BKs MF7.
- Impacto: o handoff `BK-MF7-11 -> BK-MF8-01` existe na matriz, mas a MF seguinte ainda nao esta pronta para consumir a evidence da MF7 no mesmo formato pedagogico.
- Decisao: registar drift documental; nao editar MF8 porque `STRICT_SCOPE=true` e `MF_ALVO=MF7`.

### MF7-AUD-713-S - Implementacao real ainda nao contem todas as pecas guiadas pela MF7

- Estado: `BLOQUEADO_POR_SCOPE`.
- Evidencia: a pesquisa em `apps/` e `real_dev/` nao encontrou pecas novas como `structured-event`, `availability-budget`, `domain-boundary`, `AsyncStateBlock`, `HealthService`, `citation-policy` ou `ai-context-policy`.
- Evidencia complementar: existem contratos anteriores relevantes, incluindo `SessionGuard`, `AiModelPoliciesService`, `assertPromptWithinLimit`, `AiGuardrailsService`, `ClassAiService`, `SourceGroundedAiService` e `findReadableDoneJob(...)`.
- Impacto: nao e falha automatica dos BKs porque a prompt define que codigo da propria `MF_ALVO` e apenas referencia a validar, nao contrato consolidado.
- Decisao: registar risco de implementacao futura; nao editar codigo porque `auditar_apenas` so permite atualizar o relatorio.

### MF7-AUD-714-S - Pesquisas estaticas geram falsos positivos aceitaveis

- Estado: `NAO_APLICAVEL`.
- Evidencia: ocorrencias de `prompt`, `answer`, `cookie`, `password`, `mock`, `OCR`, `embedding`, `chunking` e termos semelhantes aparecem em scope-out, testes negativos, fixtures controladas, nomes tecnicos, validadores de ausencia ou avisos de privacidade.
- Impacto: nao ha evidencia de segredo real, token real, cookie real, prompt privado, resposta IA privada completa ou material privado exposto nos BKs alvo.
- Decisao: manter como falso positivo justificado.

## Mapa de integracao da MF

| BK | Entrega principal | Ficheiros criados/editados pelo guia | Exports/endpoints | Regras de seguranca e testes | Dependem dele |
| --- | --- | --- | --- | --- | --- |
| `BK-MF7-01` | Logs estruturados com redaccao | Cria `apps/api/src/common/observability/structured-event.service.ts`; edita `AuditLogService` e modulo | `StructuredEventService`, `StructuredEventInput`, `StructuredEventOutput`; sem endpoint novo | Redige `password`, `cookie`, `secret`, `prompt`, `answer`, `token`; testes de redaccao | `BK-MF7-02` |
| `BK-MF7-02` | Orcamento mensal de disponibilidade | Cria `apps/api/src/common/operations/availability-budget.ts` e spec | `evaluateAvailabilityBudget(...)`; sem endpoint novo | Metricas agregadas sem dados pessoais; testes `HEALTHY`, `WARNING`, `BREACHED`, input invalido | `BK-MF7-08` |
| `BK-MF7-03` | Fronteiras modulares backend | Cria `apps/api/src/common/architecture/domain-boundary.ts` e spec | `assertAllowedDomainImport(...)`, `resolveBackendDomainFromModulePath(...)`; sem endpoint novo | Bloqueia acoplamento que contorne services; teste arquitetural sobre `AppModule` | `BK-MF7-04` |
| `BK-MF7-04` | Componente frontend reutilizavel | Cria `AsyncStateBlock.tsx`; edita `StudyToolsPage` e `TeacherOfficialMaterialsPage` | `AsyncStateBlock`; sem endpoint novo | Frontend nao decide ownership/role; Playwright cobre vazio, erro e acao | `BK-MF7-05` |
| `BK-MF7-05` | Mapa tecnico minimo | Cria `docs/technical/STUDYFLOW-TECHNICAL-MAP.md`; cria script/spec de exportacao | `export-technical-map`; sem endpoint novo | Documenta endpoints/modelos sem dados sensiveis; testes de cobertura minima | `BK-MF7-06` |
| `BK-MF7-06` | Testes automatizados de modulo critico | Cria `source-grounded-ai.contract.spec.ts` | Sem export publico novo; protege `POST /api/ai/source-grounded-answers` ao nivel do service | Provider nao e chamado sem fontes; resposta invalida nao persiste | `BK-MF7-07` e `BK-MF7-09` |
| `BK-MF7-07` | Deploy com rollback | Cria `docs/ops/DEPLOY-ROLLBACK.md`, `validate-deploy-readiness.ts` e spec; edita `package.json` | Script `deploy:check`; sem endpoint novo | Falha fechado sem versao/plano; evita segredos em evidence | `BK-MF7-08` |
| `BK-MF7-08` | Health-check publico minimo | Cria `HealthService`, `HealthController`, `HealthModule`, spec; edita `AppModule` | `GET /api/health`, `HealthView` | Resposta minimizada sem userId/cookies/tokens/env privada; testes P1 | `BK-MF7-09` |
| `BK-MF7-09` | Citacoes publicas de IA | Cria `citation-policy.ts`; edita `SourceGroundedAiService` e painel frontend | `normalizePublicCitation(...)`; reutiliza `POST /api/ai/source-grounded-answers` | Cada fonte autorizada no backend; excerto limitado; negativos P0 | `BK-MF7-10` |
| `BK-MF7-10` | Separacao de perfis IA | Cria `ai-context-policy.ts`; edita `ClassAiService` e spec | `AiContextType`, `AiProfileType`, `assertAiContextProfile(...)`; sem endpoint novo | Bloqueia mistura antes de materiais/quota/provider; testes P0 | `BK-MF7-11` |
| `BK-MF7-11` | Limites docentes antes do provider | Edita `AiModelPoliciesService`, `ClassAiService` e specs | `DEFAULT_AI_MAX_PROMPT_CHARS`, `ResolvedAiModelPolicy`, `assertPromptWithinLimit(...)`; reutiliza endpoint IA da disciplina | Policy, prompt e quota antes do provider; testes P0 | `BK-MF8-01`, `BK-MF8-02` |

## Decisoes tecnicas confirmadas

- `CANONICO`: `RNF23` a `RNF33` cobrem operacao, fiabilidade, manutencao, qualidade, deploy, health-check, explicabilidade e controlo IA da MF7.
- `CANONICO`: a sequencia oficial e `BK-MF7-01` -> `BK-MF7-11`, com handoff final para `BK-MF8-01`.
- `CANONICO`: `BK-MF7-01`, `BK-MF7-03`, `BK-MF7-04`, `BK-MF7-09`, `BK-MF7-10` e `BK-MF7-11` sao `P0` ou tratam regras criticas de IA, seguranca ou operacao.
- `CANONICO`: autenticacao, autorizacao, ownership, membership, quotas, guardrails e privacidade pertencem ao backend quando afetam dados ou IA.
- `DERIVADO`: `evaluateAvailabilityBudget(...)` e uma funcao pura para cumprir `RNF24` sem inventar monitorizacao externa.
- `DERIVADO`: `domain-boundary.ts` usa prefixos de ficheiro para ensinar fronteiras backend sem adicionar dependencia nova.
- `DERIVADO`: `AsyncStateBlock` unifica estados visuais sem tomar decisoes de permissao.
- `DERIVADO`: `HealthService` deve devolver apenas metadados publicos minimos.
- `DERIVADO`: `normalizePublicCitation(...)` limita excerto e normaliza localizacao sem prometer RAG, OCR ou embeddings.
- `DERIVADO`: `assertAiContextProfile(...)` e `assertPromptWithinLimit(...)` tornam `RNF32` e `RNF33` testaveis.

## Decisoes de dominio confirmadas

- IA privada, IA de sala/grupo e IA de turma/disciplina continuam separadas por contexto.
- Fontes e materiais privados nao devem atravessar contextos sem ownership ou membership validado no backend.
- Health-check publico nao e endpoint de diagnostico profundo e nao deve expor dados internos.
- Logs e evidence operacional nao devem guardar prompts privados, respostas completas da IA, tokens, cookies, passwords ou materiais de alunos.
- Limites definidos pelo professor devem ser aplicados antes da chamada ao provider IA.

## Drift documental encontrado

- O relatorio MF7 existente estava alinhado com uma execucao anterior de `corrigir_apenas`; foi normalizado para a prompt atual `auditar_apenas`.
- `BK-MF8-01` continua em formato legacy e deve ser hidratado/corrigido numa execucao propria de MF8.
- Nao existe `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`; nao bloqueia MF7 porque relatorios existentes foram consultados quando existiam.
- A implementacao atual de `apps/` e `real_dev/` ainda nao reflete todas as pecas novas propostas pela MF7, o que e esperado antes de executar os BKs, mas deve ser controlado na futura implementacao.
- `apps/web` e `real_dev/web` ainda usam label visivel `Password` no login atual; nao bloqueia MF7, mas deve ser tratado quando MF8 localizacao/PT-PT for executada.

## Coerencia MF anterior -> MF alvo -> MF seguinte

- MF6 entrega a base de seguranca, recovery, guardrails, isolamento IA, cookies/sessao e protecao contra mistura de dados.
- MF7 transforma essa base em operacao e manutencao: logs, disponibilidade, modularidade, componentes, docs, testes, deploy, health e regras finais de IA com fontes/perfis/limites.
- A cadeia interna da MF7 esta coerente: `BK-MF7-01` alimenta disponibilidade; `BK-MF7-02` alimenta health; `BK-MF7-05` alimenta testes; `BK-MF7-07` alimenta health; `BK-MF7-09` alimenta perfis; `BK-MF7-10` alimenta limites docentes.
- A MF seguinte (`MF8`) recebe IA limitada e explicavel, mas o primeiro BK da MF8 ainda esta em formato legacy e deve ser corrigido fora deste scope.

## Verificacoes textuais e validacao

Executadas nesta auditoria:

```bash
awk 'FNR==1{if(NR>1) print prev ": sections=" s ", steps=" p ", lines=" l; prev=FILENAME; s=0; p=0; l=0} /^#### /{s++} /^### Passo /{p++} {l++} END{print prev ": sections=" s ", steps=" p ", lines=" l}' docs/planificacao/guias-bk/MF7/*.md
```

Resultado: todos os 11 BKs de `MF7` tem `16` secoes `####` e `7` passos.

```bash
node - <<'NODE'
// verificador estrutural local de passos/seccoes e comentarios didaticos em blocos de codigo
NODE
```

Resultado:

- `files=11`
- `steps=77`
- `code_blocks=62`
- `ts_js_blocks=37`
- `OK: MF7 structure, steps and TS/JS didactic-comment floor passed.`

```bash
rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF7/*.md
```

Resultado: sem ocorrencias.

```bash
rg -n "real_dev|cd real_dev|npm --prefix real_dev|// real_dev|# real_dev|REFERENCE_ROOT" docs/planificacao/guias-bk/MF7/*.md
```

Resultado: sem ocorrencias.

```bash
rg -n --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/playwright-report/**' --glob '!**/test-results/**' "secret|segredo|token|password|cookie|localStorage|sessionStorage|prompt|answer|resposta IA|material privado|dado pessoal|RAG|embedding|OCR|chunking|mock|stub|fake|TODO|BLOCKER|as any|payload: unknown" docs/planificacao/guias-bk/MF7 real_dev/api real_dev/web
```

Resultado: ocorrencias classificadas como falso positivo aceitavel quando aparecem em scope-out, testes negativos, fixtures, nomes tecnicos, validadores de ausencia, mocks deterministas de teste ou warnings de privacidade. Nenhum segredo real foi identificado nos BKs alvo.

Validacoes finais executadas:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado:

- `git diff --check`: passou sem output.
- `bash scripts/validate-planificacao.sh`: passou com `overall_pass: true`, `score_ge_97: true` e `drift_critical_zero: true`.

## Bloqueios e TODOs restantes

- Sem bloqueios restantes nos BKs `MF7` no ambito documental desta auditoria.
- `BLOQUEADO_POR_SCOPE`: `BK-MF8-01` deve ser rehidratado/corrigido numa execucao propria de MF8.
- `BLOQUEADO_POR_SCOPE`: a implementacao real em `apps/` e `real_dev/` ainda nao contem todas as pecas novas propostas pela MF7; esta execucao audita guias, nao implementacao.
- `NAO_APLICAVEL`: alteracoes locais pre-existentes fora do scope foram preservadas.
