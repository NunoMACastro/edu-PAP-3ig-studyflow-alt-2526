# CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7

## Header

- `doc_id`: `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7`
- `project`: `StudyFlow`
- `macro`: `MF7`
- `implementation_root`: `real_dev`
- `modo`: `corrigir_auditoria`
- `audit_report_source`: `auto`
- `audit_report_path`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`
- `bk_ids_pedidos`: `BK-MF7-09`, `BK-MF7-10`
- `bk_ids_corrigidos`: `BK-MF7-09`, `BK-MF7-10`
- `finding_ids_corrigidos`: `P1-BK-MF7-09-AI-GOVERNANCE-001`, `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001`
- `fix_severities`: `P0`, `P1`, `P2`, `P3`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `permitir_alterar_docs`: `nao`, exceto relatorio tecnico de correcao
- `permitir_commits`: `nao`
- `status`: `CORRIGIDO`
- `created_at`: `2026-06-30`
- `updated_at`: `2026-06-30`
- `nota_atualizacao`: relatorio cumulativo; a primeira correcao cobre `BK-MF7-09` e a secao final cobre a correcao adicional de `BK-MF7-10`.

## Resumo executivo

Resultado final: `CORRIGIDO`.

O relatorio fonte resolvido por `AUDIT_REPORT_SOURCE=auto` foi `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`. O finding selecionado foi `P1-BK-MF7-09-AI-GOVERNANCE-001`, associado a `BK-MF7-09`.

A auditoria confirmava que `SourceGroundedAiService` validava fontes legiveis e citacoes, mas chamava o provider de IA sem passar primeiro pelos controlos de governanca ja existentes: consentimento, policy administrativa e quota.

## Finding corrigido

| Finding | Severidade | Estado antes | Estado final |
| --- | --- | --- | --- |
| `P1-BK-MF7-09-AI-GOVERNANCE-001` | `P1` | `CONFIRMADO` | `CORRIGIDO` |

### Causa raiz

`SourceGroundedAiService.ask(...)` fazia corretamente a autorizacao de leitura por job atraves de `MaterialIndexService.findReadableDoneJob(...)` e gerava citacoes normalizadas. No entanto, antes de `aiProvider.generateStudyTool(...)`, o fluxo nao executava:

- `AiConsentsService.assertGranted(actor.id, "SOURCE_GROUNDED_AI")`;
- `AiModelPoliciesService.resolveForUse("SOURCE_GROUNDED_AI")`;
- `assertPromptWithinLimit(prompt, policy)`;
- `AiQuotasService.reserveUsage(...)`.

Isto criava incoerencia com MF4/MF6 e com outros services de IA da MF7, onde chamadas externas sao bloqueadas por consentimento, policy, limite de prompt e quota antes do provider.

## Correcao aplicada

### Service

Ficheiro: `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`

- Adicionadas dependencias `AiConsentsService`, `AiModelPoliciesService` e `AiQuotasService`.
- Criado o purpose local `SOURCE_GROUNDED_AI` usando o valor ja existente no contrato de consentimentos/policies/quotas.
- Depois de validar que existem citacoes, o fluxo passou a executar:
  - `assertGranted(actor.id, "SOURCE_GROUNDED_AI")`;
  - `resolveForUse("SOURCE_GROUNDED_AI")`;
  - limitacao de citacoes com `policy.maxSourceCount`;
  - construcao do prompt final;
  - `assertPromptWithinLimit(prompt, policy)`;
  - `reserveUsage({ scope: "USER", targetId: actor.id, purpose: "SOURCE_GROUNDED_AI", units })`;
  - chamada ao provider apenas depois das validacoes anteriores.
- A chamada ao provider passou a usar `policy.model` e timeout resolvido por `resolveAiBudgetMs(policy.timeoutMs)`.
- As citacoes persistidas passaram a ser as citacoes limitadas por policy, mantendo auditoria alinhada com o contexto efetivamente enviado ao provider.

Evidencia principal:

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:19`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:39`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:72`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:115`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:122`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:124`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:125`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:132`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:140`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:251`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts:257`

### Module

Ficheiro: `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`

- `SourceGroundedAiModule` passou a importar:
  - `AiConsentsModule`;
  - `AiModelPoliciesModule`;
  - `AiQuotasModule`.

Evidencia:

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:7`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:8`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:9`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:26`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:27`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts:28`

### Testes

Ficheiros:

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`

Cobertura adicionada/reforcada:

- caminho feliz prova `assertGranted`, `resolveForUse`, `reserveUsage` e provider com `model`/`timeoutMs` de policy;
- `maxSourceCount` limita as citacoes persistidas e enviadas ao provider;
- consentimento recusado bloqueia policy, quota, provider e persistencia;
- policy desativada bloqueia quota, provider e persistencia;
- quota excedida bloqueia provider e persistencia;
- teste de contrato NestJS injeta explicitamente os services de governanca.

Evidencia:

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:54`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:58`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:61`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:76`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:85`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:160`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:189`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts:216`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:10`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:119`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:123`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:126`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:261`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:262`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts:263`

## Coerencia entre MFs

Resultado: `COERENTE`.

### MF4 -> MF7

MF4 ja define consentimentos, policies de modelo e quotas por finalidade. A correcao usa o purpose existente `SOURCE_GROUNDED_AI`, sem criar finalidade paralela nem duplicar regras.

### MF6 -> MF7

MF6 deixa guardrails e autorizacao de fontes como pre-condicoes para IA segura. A correcao preserva `findReadableDoneJob(...)` e acrescenta a governanca administrativa antes da chamada externa, alinhando fonte legivel, consentimento, policy e quota.

### Dentro da MF7

O fluxo de `source-grounded-ai` passa a seguir o mesmo padrao dos outros services de IA da MF7:

1. autorizar contexto/fonte;
2. confirmar consentimento;
3. resolver policy;
4. limitar contexto;
5. validar tamanho de prompt;
6. reservar quota;
7. chamar provider.

Nao foi implementado scope de MF8 e nao foram alterados guias canonicos, backlog, matriz ou prompts.

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_INFORMATIVO` - existiam alteracoes pre-existentes em `docs/planificacao`, MF8, scripts e relatorios MF7; foram preservadas. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `PASS` - `real_dev/`, `real_dev/api` e `real_dev/web` estao ignorados por `.gitignore:2`. |
| `npm --prefix real_dev/api test -- source-grounded-ai --runInBand` | `PASS` - 3 suites, 14 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/api test -- --runInBand` | `PASS` - 86 suites, 325 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build; 122 modulos transformados. |
| `rg` de governanca em `real_dev/api/src/modules/source-grounded-ai` | `PASS` - confirmou `assertGranted`, `resolveForUse`, `assertPromptWithinLimit`, `reserveUsage` e `SOURCE_GROUNDED_AI` no escopo corrigido. |
| `rg` estatico para logs, segredos, skips, TODO/FIXME, `as any` e claims fora de escopo no modulo `source-grounded-ai` | `PASS` - sem ocorrencias. |
| `rg -n "[ \t]+$"` nos ficheiros alterados de codigo/teste | `PASS` - sem whitespace final. |

Nota: `scripts/validate-planificacao.sh` nao foi executado porque `PERMITIR_ALTERAR_DOCS=nao` e esta execucao nao alterou guias canonicos, matriz, backlog ou planificacao operacional; apenas este relatorio tecnico permitido.

## Ficheiros alterados nesta correcao

- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.module.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.service.spec.ts`
- `real_dev/api/src/modules/source-grounded-ai/source-grounded-ai.contract.spec.ts`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

## Estado final

- `P1-BK-MF7-09-AI-GOVERNANCE-001`: `CORRIGIDO`
- `BK-MF7-09`: `PASS`
- `coerencia_mf`: `COERENTE`
- `blockers`: `SEM_BLOCKERS`
- `todos_abertos_no_escopo`: `0`
- `commits`: `NAO_EXECUTADOS`

---

## Correcao adicional 2026-06-30 - BK-MF7-10

### Resumo executivo

Resultado final: `CORRIGIDO`.

O finding corrigido foi `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001`, associado a `BK-MF7-10` e `RNF32`.

A auditoria confirmava que a implementacao principal de separacao de perfis IA ja estava correta, mas faltava um negativo executavel de service que forçasse a falha de `assertAiContextProfile(...)` e provasse que o fluxo parava antes de consentimento, materiais, quota, provider e persistencia.

### Finding corrigido

| Finding | Severidade | Estado antes | Estado final |
| --- | --- | --- | --- |
| `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001` | `P1` | `CONFIRMADO` | `CORRIGIDO` |

### Causa raiz

`ClassAiService` chamava a policy no ponto correto, mas fazia-o por import direto. A spec existente verificava a ordem por leitura estatica do ficheiro, sem conseguir substituir a policy por uma falha controlada e sem provar por execucao que os collaborators seguintes ficavam sem chamadas.

### Correcao aplicada

#### Service

Ficheiro: `real_dev/api/src/modules/class-ai/class-ai.service.ts`

- A importacao de `assertAiContextProfile(...)` passou para namespace `aiContextPolicy`, mantendo a mesma policy e a mesma ordem runtime.
- `ClassAiService.askClassAi(...)` continua a chamar `aiContextPolicy.assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS")` depois de `findSubjectForStudent(...)` e antes de consentimento, policy, materiais, prompt, quota e provider.

Evidencia:

- `real_dev/api/src/modules/class-ai/class-ai.service.ts:15`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts:85`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts:88`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts:89`
- `real_dev/api/src/modules/class-ai/class-ai.service.ts:90`

#### Testes

Ficheiro: `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`

- A spec passou a importar `aiContextPolicy` como namespace e a repor spies com `jest.restoreAllMocks()`.
- Foi adicionado o teste `bloqueia perfil incompatível antes de consentimento, materiais, quota, provider e persistência`.
- O teste força `assertAiContextProfile(...)` a lançar `AI_CONTEXT_PROFILE_MISMATCH`, executa `askClassAi(...)` e confirma que:
  - a membership da disciplina foi validada antes da policy;
  - `aiConsentsService.assertGranted(...)` nao foi chamado;
  - `aiModelPoliciesService.resolveForUse(...)` nao foi chamado;
  - `materialsService.listProcessedForSubject(...)` nao foi chamado;
  - `aiQuotasService.reserveUsage(...)` nao foi chamado;
  - `aiProvider.generateClassAnswer(...)` nao foi chamado;
  - `interactionModel.create(...)` nao foi chamado.
- O teste estatico de ordem foi preservado e atualizado para a chamada namespace real.

Evidencia:

- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:13`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:32`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:295`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:298`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:319`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:323`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:325`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:327`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:328`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts:338`

### Coerencia entre MFs

Resultado: `COERENTE`.

#### MF6 -> MF7

A correcao reforça a prova de isolamento e guardrail antes de qualquer chamada externa. O service continua a validar membership de disciplina no backend e a falhar cedo antes de preparar materiais, prompt, quota ou provider.

#### Dentro da MF7

`BK-MF7-10` passa a entregar o contrato exigido para `BK-MF7-11`: a separacao `CLASS_SUBJECT`/`TEACHER_CLASS` esta implementada e coberta por teste negativo de service.

#### MF7 -> MF8

O BK passa a poder ser usado como base de seguranca IA para MF8 no que toca a perfis distintos. Esta correcao nao altera o finding historico de `BK-MF7-09`, que ja estava tratado na primeira secao deste relatorio.

### Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api test -- ai-context-policy class-ai --runInBand` | `PASS` - 2 suites, 16 testes. |
| `npm --prefix real_dev/api run build` | `PASS` - `nest build`. |
| `npm --prefix real_dev/api test` | `PASS` - 86 suites, 326 testes. |
| `npm --prefix real_dev/web run build` | `PASS` - TypeScript e Vite build; 122 modulos transformados. |
| `rg` para `jest.spyOn(aiContextPolicy`, `AI_CONTEXT_PROFILE_MISMATCH`, `aiContextPolicy.assertAiContextProfile` e asserts negativos no modulo `class-ai` | `PASS` - confirmou o novo negativo de service e a chamada real da policy. |
| `rg` estatico para logs, segredos, storage, skips, TODO/FIXME, `as any` e claims fora de escopo nos modulos `ai/context` e `class-ai` | `PASS` - sem ocorrencias. |

### Ficheiros alterados nesta correcao adicional

- `real_dev/api/src/modules/class-ai/class-ai.service.ts`
- `real_dev/api/src/modules/class-ai/class-ai.service.spec.ts`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF7.md`

### Estado final adicional

- `P1-BK-MF7-10-SERVICE-PROFILE-NEGATIVE-001`: `CORRIGIDO`
- `BK-MF7-10`: `PASS`
- `coerencia_mf`: `COERENTE`
- `blockers`: `SEM_BLOCKERS`
- `todos_abertos_no_escopo`: `0`
- `commits`: `NAO_EXECUTADOS`
