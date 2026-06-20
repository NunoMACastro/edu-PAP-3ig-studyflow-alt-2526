# AUDITORIA-HIDRATACAO-MF5

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF5`
- `project`: `StudyFlow`
- `macro`: `MF5`
- `mode`: `auditar_apenas`
- `implementation_root`: `real_dev`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `run_commands`: `true`
- `output_mode`: `relatorio_e_resumo`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `last_updated`: `2026-06-20`

## Sumario executivo

A auditoria MF5 analisou os 11 guias oficiais da macrofase `Operacao e UX transversal`: `BK-MF5-01`, `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06`, `BK-MF5-07`, `BK-MF5-08`, `BK-MF5-09`, `BK-MF5-10`, `BK-MF5-11` e `BK-MF5-12`.

O modo desta execucao e `auditar_apenas`, por isso nao foram editados BKs nem codigo em `real_dev`. O unico artefacto criado foi este relatorio, porque `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` nao existia no workspace atual.

Resultado da auditoria dos guias MF5: `11 OK`, `0 PARCIAL`, `0 CRITICO`. A classificacao `OK` aplica-se ao estado dos guias enquanto tutoriais pedagogicos e tecnicamente executaveis para os alunos seguirem por ordem; nao significa que as alteracoes descritas nos BKs ja estejam aplicadas em `real_dev`.

## Escopo e fontes consultadas

### Variaveis aplicadas

- `PROJECT_NAME`: `StudyFlow`
- `MF_ALVO`: `MF5`
- `BK_IDS`: `[]`
- `MODO`: `auditar_apenas`
- `IMPLEMENTATION_ROOT`: `real_dev`
- `OUTPUT_MODE`: `relatorio_e_resumo`
- `RUN_COMMANDS`: `true`
- `STRICT_SCOPE`: `true`
- `CHECK_MF_COHERENCE`: `true`

### Documentos canonicos consultados

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
- `docs/planificacao/guias-bk/MF5/*.md`
- `docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md`
- `docs/planificacao/guias-bk/MF6/BK-MF6-01-indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui.md`
- relatorios existentes `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md` a `AUDITORIA-HIDRATACAO-MF4.md`

### Implementacao real consultada como referencia estrutural

- `real_dev/api`
- `real_dev/web`

`real_dev` foi usado apenas para validar nomes de pastas, stack e contratos estruturais provaveis. Nao foi usado para contrariar RF/RNF, matriz, backlog ou BKs ja corrigidos.

## Inventario normalizado da MF5

`BK-MF5-02` nao existe na sequencia oficial e isso nao e erro. A sequencia canonica em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `guias-bk/README.md` salta de `BK-MF5-01` para `BK-MF5-03`.

| BK | RF/RNF | Titulo | Estado |
| --- | --- | --- | --- |
| `BK-MF5-01` | `RF61` | Integracao com Drives Google/OneDrive para importacao unidirecional de materiais de estudo. | `OK` |
| `BK-MF5-03` | `RNF01` | Interface intuitiva e clara para alunos e professores. | `OK` |
| `BK-MF5-04` | `RNF02` | Layout responsivo para desktop/tablet/mobile. | `OK` |
| `BK-MF5-05` | `RNF03` | Feedback imediato em acoes guardar, IA e uploads. | `OK` |
| `BK-MF5-06` | `RNF04` | Navegacao consistente entre modulos. | `OK` |
| `BK-MF5-07` | `RNF05` | Regras basicas de acessibilidade. | `OK` |
| `BK-MF5-08` | `RNF06` | Validacao completa de formularios antes de submissao. | `OK` |
| `BK-MF5-09` | `RNF07` | Notificacoes discretas e contextualizadas. | `OK` |
| `BK-MF5-10` | `RNF08` | Dashboards e estudo carregam em <= 2s. | `OK` |
| `BK-MF5-11` | `RNF09` | Respostas da IA devem surgir em <= 4s. | `OK` |
| `BK-MF5-12` | `RNF10` | Suportar >= 200 utilizadores simultaneos por escola. | `OK` |

## Contagens

| Momento | OK | PARCIAL | CRITICO | Sem classificacao |
| --- | ---: | ---: | ---: | ---: |
| Antes desta auditoria | 0 | 0 | 0 | 11 |
| Depois desta auditoria | 11 | 0 | 0 | 0 |

Nota: o "antes" fica como `Sem classificacao` porque nao existia relatorio MF5 versionado no workspace atual. Os guias MF5 ja estavam hidratados antes desta execucao; esta auditoria formalizou a classificacao sem os editar.

## Auditoria BK a BK

| BK | Estado | Evidencia objetiva | Observacoes |
| --- | --- | --- | --- |
| `BK-MF5-01` | `OK` | 957 linhas; secoes obrigatorias presentes; 7 passos; 10 blocos de codigo; JSDoc e comentarios didaticos; sem termos proibidos. | Define importacao unidirecional Drive sem prometer OAuth, OCR, RAG ou indexacao automatica. Usa `real_dev/api` e `real_dev/web`. |
| `BK-MF5-03` | `OK` | 889 linhas; secoes obrigatorias presentes; 7 passos; 5 blocos de codigo; sem termos proibidos. | Foca clareza de UI, `PageHeader`, smokes e privacidade sem mover decisoes de permissao para o frontend. |
| `BK-MF5-04` | `OK` | 763 linhas; secoes obrigatorias presentes; 7 passos; 4 blocos de codigo; sem termos proibidos. | Cobre responsividade desktop/tablet/mobile com `ResponsivePageFrame` e testes por viewport. |
| `BK-MF5-05` | `OK` | 763 linhas; secoes obrigatorias presentes; 7 passos; 5 blocos de codigo; sem termos proibidos. | Cobre feedback imediato sem expor dados sensiveis nem substituir validacao backend. |
| `BK-MF5-06` | `OK` | 530 linhas; secoes obrigatorias presentes; 7 passos; 3 blocos de codigo; sem termos proibidos. | Cria contrato de navegacao consistente em `real_dev/web/src/components/layout/navigation.ts`. |
| `BK-MF5-07` | `OK` | 752 linhas; secoes obrigatorias presentes; 7 passos; 4 blocos de codigo; sem termos proibidos. | Cobre labels, foco, contraste, `aria-*`, smokes e mensagens seguras. |
| `BK-MF5-08` | `OK` | 927 linhas; secoes obrigatorias presentes; 7 passos; 5 blocos de codigo; sem termos proibidos. | Reforca validacao frontend sem retirar a validacao backend. |
| `BK-MF5-09` | `OK` | 614 linhas; secoes obrigatorias presentes; 7 passos; 3 blocos de codigo; sem termos proibidos. | Mantem notificacoes discretas e contextualizadas, sem prometer entrega email/push inexistente. |
| `BK-MF5-10` | `OK` | 855 linhas; secoes obrigatorias presentes; 8 passos; 5 blocos de codigo; sem termos proibidos. | Mede budget <= 2s na experiencia de UI e evita logging de dados pessoais. |
| `BK-MF5-11` | `OK` | 695 linhas; secoes obrigatorias presentes; 8 passos; 5 blocos de codigo; sem termos proibidos. | Introduz budget de resposta IA <= 4s sem quebrar fontes, guardrails ou quotas antes do provider. |
| `BK-MF5-12` | `OK` | 584 linhas; secoes obrigatorias presentes; 7 passos; 5 blocos de codigo; sem termos proibidos. | Corrige risco de sucesso falso com `401` e marca "escola de teste isolada" como `DERIVADO`. |

## Criterios de qualidade verificados

- Todos os BKs MF5 tem `## Header`.
- Todos os BKs MF5 tem as secoes obrigatorias do template.
- Todos os BKs MF5 tem `#### Tutorial tecnico linear`.
- Todos os BKs MF5 tem passos com os pontos 1 a 7.
- Todos os BKs MF5 tem `#### Criterios de aceite`, `#### Validacao final`, `#### Evidence para PR/defesa`, `#### Handoff` e `#### Changelog`.
- Os guias usam portugues de Portugal com acentuacao natural.
- Os guias usam `CANONICO` e `DERIVADO` quando relevante.
- Nao foram encontrados `TODO (BLOCKER)` indispensaveis nos BKs MF5.
- Nao foram encontrados `payload: unknown`, `as any`, `ContextAction`, `contextApi`, tokens em `localStorage` ou sessoes em `sessionStorage` nos BKs MF5.
- Referencias a `RAG`, `embeddings`, `OCR` e `indexacao automatica` aparecem como `Scope-out`, avisos de nao-promessa ou handoff futuro, nao como funcionalidade entregue nesta MF.

## Mapa de integracao da MF

Este mapa descreve os contratos previstos pelos guias. Como `MODO=auditar_apenas`, nenhum destes ficheiros foi criado ou editado nesta execucao.

| BK | Ficheiros/contratos principais previstos | Handoff |
| --- | --- | --- |
| `BK-MF5-01` | `external-material-imports` no backend; cliente e painel React em `real_dev/web/src/features/mf5`; endpoint `POST /api/external-material-imports`; testes de contrato. | Entrega base para melhorar UX, feedback e validacao de importacao sem prometer OCR/RAG. |
| `BK-MF5-03` | `PageHeader.tsx`, dashboards do aluno/professor e smoke de interface. | Entrega linguagem e hierarquia visual para responsividade. |
| `BK-MF5-04` | `ResponsivePageFrame.tsx`, paginas de materiais/turmas e smoke responsivo. | Entrega base visual para feedback imediato. |
| `BK-MF5-05` | `action-feedback.tsx`, `App.tsx`, submissao de materiais, IA privada e smoke de feedback. | Entrega feedback global para navegacao e formularios seguintes. |
| `BK-MF5-06` | `navigation.ts`, `AppShell.tsx` e smoke de navegacao. | Entrega navegacao estavel para acessibilidade e validacao de formularios. |
| `BK-MF5-07` | `FormField.tsx`, formularios de turma/material e smoke de acessibilidade. | Entrega componente base para validacao completa. |
| `BK-MF5-08` | `form-validation.ts`, formularios de turma/material e smoke de validacao. | Entrega validacao frontend coerente com backend. |
| `BK-MF5-09` | `notification-tray.tsx`, `AppShell.tsx` e smoke de notificacoes. | Entrega notificacoes discretas para fluxos de performance/operacao. |
| `BK-MF5-10` | `performance-budget.ts`, dashboards aluno/professor e smoke de performance <= 2s. | Entrega medicao de UI para budget de IA. |
| `BK-MF5-11` | `with-ai-response-budget.ts`, testes do helper, servicos IA privada/fundamentada, provider e quotas. | Entrega timeout/fallback honesto para concorrencia. |
| `BK-MF5-12` | `smoke-200-users.mjs`, `package.json`, `/api/auth/me`, `SessionGuard` e `SessionService`. | Entrega smoke de concorrencia para `BK-MF6-01`. |

### Coerencia de integracao

- Nao foram detetados endpoints duplicados dentro dos guias MF5.
- O frontend previsto chama endpoints documentados no mesmo BK ou em BKs anteriores.
- Os guias reforcam que ownership, membership, roles e permissoes sao confirmados no backend.
- Os guias nao movem decisoes de seguranca para o frontend.
- O handoff `BK-MF4-10 -> BK-MF5-01 -> ... -> BK-MF5-12 -> BK-MF6-01` esta coerente.

## Decisoes confirmadas

### Decisoes tecnicas confirmadas

- `real_dev/api` e `real_dev/web` sao as raizes operacionais usadas como referencia estrutural.
- Backend/API: TypeScript, Node.js, NestJS, ES Modules e MongoDB/Mongoose.
- Frontend/web: React, Vite, TypeScript e Tailwind.
- Sessoes web usam cookies HttpOnly; frontend deve usar `credentials: "include"`.
- MF5 deve reforcar UX, acessibilidade, validacao e performance sem inventar contratos funcionais fora dos RF/RNF.

### Decisoes de dominio confirmadas

- `RF61` e a integracao Drive unidirecional controlada.
- `RNF01` a `RNF07` cobrem UX, responsividade, feedback, navegacao, acessibilidade, validacao e notificacoes discretas.
- `RNF08` a `RNF10` cobrem performance de dashboards/estudo, budget de respostas IA e concorrencia por escola.
- A IA privada, IA de sala/grupo e IA de turma/disciplina continuam separadas por contexto.
- Turma/escola/tenant nao devem ser inventados quando o contrato canonico ainda nao os define.

### Decisoes marcadas como DERIVADO nos guias

- `POST /api/external-material-imports` em `BK-MF5-01` como endpoint unico para importacao externa sem duplicar materiais privados/oficiais.
- `PageHeader`, `ResponsivePageFrame`, `ActionFeedbackProvider`, `FormField`, `form-validation`, `notification-tray` e `performance-budget` como abstracoes minimas para cumprir RNFs sem dependencias novas.
- `schoolContext: "escola-teste-isolada"` em `BK-MF5-12` como etiqueta de evidence enquanto nao existir contrato canonico de escola/tenant.

## Findings e decisoes de auditoria

### MF5-REL-001 - Relatorio MF5 inexistente

- Estado: `CORRIGIDO`
- Evidencia: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` nao existia antes desta execucao e foi criado.
- Impacto: sem este relatorio, a MF5 ficava sem contagem formal OK/PARCIAL/CRITICO e sem registo das verificacoes executadas.
- Validacao: ficheiro criado nesta execucao; `git diff --check` executado sem output.

### MF5-AUD-001 - Guias MF5 auditados como tutoriais completos

- Estado: `JA_CORRIGIDO`
- Evidencia: os 11 BKs ja tinham secoes obrigatorias, passos lineares, codigo integrado, explicacao, validacao, negativos, evidence e handoff.
- Impacto: nenhum BK MF5 exige correcao no modo atual.
- Validacao: script local de inventario confirmou secoes obrigatorias, passos e ausencia de termos proibidos nos 11 ficheiros.

### MF5-DRIFT-001 - Drift em `CONTRATO-CAMPOS-BK.md` face a matriz canonica

- Estado: `BLOQUEADO_POR_SCOPE`
- Evidencia:
  - `BK-MF5-01`: `CONTRATO-CAMPOS-BK.md` usa sprint `S08`, matriz usa `S09`.
  - `BK-MF5-06`: `CONTRATO-CAMPOS-BK.md` usa owner `Daniel`, matriz usa `Kaua`.
  - `BK-MF5-09`: `CONTRATO-CAMPOS-BK.md` usa sprint `S10`, matriz usa `S11`.
  - `BK-MF5-10`: `CONTRATO-CAMPOS-BK.md` usa owner `Daniel`, matriz usa `Guilherme`.
  - `BK-MF5-11`: `CONTRATO-CAMPOS-BK.md` usa sprint `S08`, matriz usa `S07`.
  - `BK-MF5-12`: `CONTRATO-CAMPOS-BK.md` usa sprint `S09`, matriz usa `S10`.
- Impacto: baixo para os guias, porque headers dos BKs MF5 alinham com `MATRIZ-CANONICA-BK.md`, que tem precedencia superior.
- Risco: futuras geracoes automaticas podem voltar a introduzir metadados divergentes se consumirem o contrato de campos.
- Correcao: nao aplicada porque `STRICT_SCOPE=true` permite apenas BKs alvo e relatorio MF5.

### MF5-STATIC-001 - Falsos positivos de pesquisa estatica

- Estado: `FINDING_DESCARTADO`
- Evidencia:
  - `localStorage` aparece em comentarios que dizem explicitamente que a sessao nao e guardada em `localStorage`.
  - `STUDYFLOW_SMOKE_COOKIE="sf_sid=valor_de_teste_local"` em `BK-MF5-12` e marcador pedagogico, nao cookie real.
  - Passwords em `real_dev/api/src/scripts/seed-development-users.ts` sao credenciais de desenvolvimento para seed local.
  - `OPENAI_API_KEY` aparece como variavel de ambiente lida pelo provider, nao como chave exposta.
  - `RAG`, `embeddings`, `OCR` e `indexacao automatica` aparecem em `Scope-out`/avisos de nao-promessa.
- Impacto: sem violacao confirmada em BK MF5.

### PLAN-VALIDATOR-001 - Validador falha por drift MF3 fora do escopo

- Estado: `BLOQUEADO_POR_SCOPE`
- Evidencia: `bash scripts/validate-planificacao.sh` devolveu `overall_pass=false`, `guides_pass=true`, `coverage_pass=true`, `governance_pass=true`, mas `consistency_pass=false`.
- Drift reportado pelo validador:
  - `BK-MF3-07: estado matrix=TODO backlog=DONE`
  - `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md: estado=DONE matrix=TODO`
  - `docs/planificacao/guias-bk/MF3/BK-MF3-02-ia-nao-pode-inventar-conteudo-citacoes-obrigatorias.md: estado=DONE matrix=TODO`
  - `docs/planificacao/guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md: estado=DONE matrix=TODO`
  - `docs/planificacao/guias-bk/MF3/BK-MF3-04-ia-deve-ajustar-explicacoes-ao-perfil-do-aluno.md: estado=DONE matrix=TODO`
  - `docs/planificacao/guias-bk/MF3/BK-MF3-05-criar-grupos-de-estudo.md: estado=DONE matrix=TODO`
- Impacto: bloqueia PASS global da planificacao, mas nao invalida a qualidade dos guias MF5.
- Correcao: nao aplicada porque a prompt restringe esta execucao a MF5.

## Verificacoes executadas

### Pesquisa proibida nos BKs MF5

Comando:

```bash
rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF5/*.md
```

Resultado: exit code `1` sem output, isto e, sem ocorrencias.

### Pesquisa estatica refinada em `real_dev` e MF5

Comandos:

```bash
rg -n "localStorage|sessionStorage|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" -g '!real_dev/web/playwright-report/**' real_dev/api real_dev/web docs/planificacao/guias-bk/MF5
```

Resultado: apenas comentarios defensivos que dizem para nao guardar sessao/tokens em `localStorage`.

```bash
rg -n "password: \"|OPENAI_API_KEY|STUDYFLOW_SMOKE_COOKIE=\"sf_sid" -g '!**/*.spec.ts' -g '!real_dev/web/playwright-report/**' real_dev/api real_dev/web docs/planificacao/guias-bk/MF5
```

Resultado: fixtures de seed local, variaveis de ambiente e marcador pedagogico de cookie; sem segredo real confirmado.

```bash
rg -n "RAG|embeddings|OCR|chunking|indexa(c|ç)ão automática" docs/planificacao/guias-bk/MF5/*.md
```

Resultado: ocorrencias apenas como `Scope-out`, aviso de nao-promessa ou handoff futuro.

### `git diff --check`

Resultado: executado sem output e exit code `0`.

### `bash scripts/validate-planificacao.sh`

Resultado: exit code `1`.

Resumo do JSON:

- `coverage_pass`: `true`
- `guides_pass`: `true`
- `governance_pass`: `true`
- `adequacao_12o_pass`: `true`
- `consistency_pass`: `false`
- `score_ge_97`: `false`
- `drift_critical_zero`: `false`
- `overall_pass`: `false`
- `score.total`: `80`

Causa: seis drifts MF3 fora do escopo MF5, listados em `PLAN-VALIDATOR-001`.

## Riscos restantes

- O PASS global da planificacao continua bloqueado por drift MF3 fora desta execucao.
- `CONTRATO-CAMPOS-BK.md` tem metadados MF5 divergentes da matriz canonica; nao bloqueia os guias, mas deve ser corrigido numa execucao de sincronizacao documental.
- Os BKs MF5 estao prontos como guias, mas a implementacao descrita neles ainda precisa de ser aplicada e validada em modo de implementacao/correcao proprio.
- `BK-MF5-12` usa "escola de teste isolada" como `DERIVADO`; se o projeto criar tenancy/escola canonica, o smoke deve passar a receber esse identificador real.

## Coerencia MF4 -> MF5 -> MF6

- `BK-MF4-10` entrega quotas e monitorizacao de IA, que `BK-MF5-11` respeita antes do provider e que `BK-MF5-12` nao contorna.
- `BK-MF5-01` consome a stack real e prepara material URL/importado para validacao, feedback, UX e futuro processamento.
- `BK-MF5-03` a `BK-MF5-10` reforcam a experiencia transversal sem criar regras de negocio novas.
- `BK-MF5-11` entrega budget/fallback de IA antes da concorrencia.
- `BK-MF5-12` entrega smoke autenticado de 200 pedidos para `BK-MF6-01`, sem prometer filas, processamento assincrono ou escalabilidade horizontal nesta macrofase.

## Changelog

- `2026-06-20`: criado relatorio MF5 em modo `auditar_apenas`; 11 BKs classificados como `OK`; registado drift MF3 do validador e drift MF5 em `CONTRATO-CAMPOS-BK.md` sem editar ficheiros fora do escopo.
