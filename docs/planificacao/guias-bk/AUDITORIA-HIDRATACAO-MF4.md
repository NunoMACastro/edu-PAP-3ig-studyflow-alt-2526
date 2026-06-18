# Auditoria de guias BK - MF4

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF4`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `project`: `StudyFlow`
- `macro_funcionalidade`: `MF4`
- `bk_ids`: `BK-MF4-06`
- `modo`: `corrigir_apenas`
- `implementation_root`: `real_dev`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-06-18`

## Escopo desta execução

Esta execução corrigiu apenas `BK-MF4-06 - Gestão de consentimentos para IA`, porque era o único BK do alvo explícito com classificação `PARCIAL` no relatório anterior.

Foram respeitadas as restrições de scope:

- editado: `docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md`;
- editado: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`;
- não editado: código real em `apps/`;
- não editado: implementação inicial em `real_dev/`;
- não editado: matriz, backlog, sprints, contrato BK, RF/RNF ou outros BKs.

## Fontes consultadas

- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md`
- `docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md`
- `docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md`
- `apps/api/src/modules/private-area-ai/private-area-ai.service.ts`
- `apps/api/src/modules/study-group-ai/study-group-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/project-ai/project-ai.service.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/mf3/request-mf3-json.ts`
- `real_dev/api/src/modules/ai-consents`
- `real_dev/api/src/modules/study-group-ai`

## Resultado global desta execução

| Âmbito | `OK` | `PARCIAL` | `CRITICO` |
| --- | ---: | ---: | ---: |
| Antes da correção | 0 | 1 | 0 |
| Depois da correção | 1 | 0 | 0 |

Resultado: `BK-MF4-06` passa a `OK` como guia documental. O BK ficou mais explícito para alunos, mantém a estrutura canónica dos sete pontos por passo e agora cobre consentimento por finalidade, backend enforcement, frontend com erro/loading e testes de ausência, concessão e revogação.

## Inventário do BK alvo

| BK | RF/RNF | Dependências | Próximo BK | Estado após correção |
| --- | --- | --- | --- | --- |
| `BK-MF4-06` | `RF54` | `-` | `BK-MF4-07` | `OK` |

## Lacunas corrigidas

### F1 - Estrutura canónica quebrada no Passo 4

- Estado anterior: `PARCIAL`.
- Correção: o ponto `7. Cenário negativo/erro esperado.` foi separado para linha própria.
- Resultado: todos os passos do BK têm os pontos `1.` a `7.`.
- Estado após correção: `CORRIGIDO`.

### F2 - Conceitos teóricos essenciais insuficientes

- Estado anterior: `PARCIAL`.
- Correção: a secção `Conceitos teóricos essenciais` foi expandida com finalidade, consentimento activo, revogação, backend enforcement, DTO/schema/service/controller/module, privacidade/RGPD, frontend e testes.
- Resultado: o aluno passa a entender por que o consentimento não é global e por que o bloqueio tem de acontecer no backend antes de IA.
- Estado após correção: `CORRIGIDO`.

### F3 - Explicações de código demasiado curtas

- Estado anterior: `PARCIAL`.
- Correção: foram reforçadas as explicações dos passos críticos, em especial DTO/schema, service, controller/módulo, frontend e testes.
- Resultado: cada bloco principal explica contrato técnico, entrada/saída, validação aplicada, risco evitado e forma de validar.
- Estado após correção: `CORRIGIDO`.

### F4 - Teste prometido não cobria concessão e revogação

- Estado anterior: `PARCIAL`.
- Correção: o teste do Passo 6 passou a cobrir ausência de consentimento, último estado `GRANTED`, último estado `REVOKED` e criação append-only de decisões em `grant`/`revoke`.
- Resultado: RF54 fica testado no comportamento essencial de consentimento revogável.
- Estado após correção: `CORRIGIDO`.

### F5 - Frontend descrevia erro que não implementava

- Estado anterior: `PARCIAL`.
- Correção: o Passo 5 passou a incluir `loading`, `pendingPurpose`, `try/catch` no `toggle`, botão temporariamente desativado e erro em `role="alert"`.
- Resultado: falhas ao carregar, conceder ou revogar deixam feedback visível.
- Estado após correção: `CORRIGIDO`.

## Decisões técnicas e de domínio

- `CANONICO`: `RF54` exige gestão de consentimentos para IA.
- `CANONICO`: consentimento é por finalidade, não uma permissão global.
- `CANONICO`: revogação bloqueia chamadas futuras.
- `CANONICO`: endpoints usam sessão e não recebem `targetUserId`.
- `CANONICO`: services IA chamam `assertGranted` antes de provider/prompt.
- `DERIVADO`: `policyVersion` inicial fica `2026-06-16`.
- `DERIVADO`: o BK mantém `STUDY_GROUP_AI`, porque `BK-MF4-09` e `BK-MF4-10` já usam esse vocabulário.
- `DERIVADO`: frontend não guarda consentimento em storage do browser; carrega e altera sempre via API.

## Drift e riscos restantes

### D1 - `STUDY_GROUP_AI` no BK versus `GROUP_AI` em `real_dev`

- Estado: `BLOQUEADO_POR_SCOPE`.
- Evidência: `real_dev/api/src/modules/ai-consents` e `real_dev/api/src/modules/study-group-ai` usam `GROUP_AI`; os BKs MF4 usam `STUDY_GROUP_AI`.
- Decisão nesta correção: manter `STUDY_GROUP_AI` no BK, porque o contrato documental de MF4 e os BKs seguintes já dependem desse nome.
- Risco restante: quando for autorizada correção de código real, alinhar `real_dev` com o vocabulário documental ou registar uma decisão canónica única.

### D2 - `real_dev` ainda valida consentimento depois de ler fontes em alguns services

- Estado: `BLOQUEADO_POR_SCOPE`.
- Evidência: a implementação inicial em `real_dev` lê fontes antes de `assertGranted` em fluxos de IA privada/grupo.
- Decisão nesta correção: o BK foi corrigido para ensinar a ordem segura: validação mínima de acesso, `assertGranted`, depois fontes/prompt/provider.
- Risco restante: se alguém implementar copiando apenas `real_dev`, pode preservar a ordem insegura. O BK agora mitiga esse risco documentalmente.

### D3 - Drift global de MF3

- Estado: `BLOQUEADO_POR_SCOPE`.
- Evidência: `scripts/validate-planificacao.sh` continua a falhar por inconsistência de estados em BKs MF3.
- Decisão nesta correção: não alterar MF3 porque `STRICT_SCOPE=true` e o alvo é `BK-MF4-06`.

## Coerência MF3 -> MF4 -> MF5

- MF3 fornece grupos, partilhas, mensagens e cliente `requestMf3Json`, usados pelo painel e por IA coletiva.
- MF4 introduz consentimento, administração, auditoria, políticas de modelos e quotas. `BK-MF4-06` agora entrega a base de finalidade e enforcement que `BK-MF4-09` e `BK-MF4-10` precisam.
- MF5 pode consumir um frontend mais previsível porque o painel tem loading, erro e estados de decisão claros.
- Coerência final: `OK` no guia alvo; drift de código real fica assinalado para execução própria.

## Verificações executadas

### Estrutura dos passos

Comando:

`node -e 'const fs=require("fs"); const p="docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md"; const s=fs.readFileSync(p,"utf8"); const steps=[...s.matchAll(/^### Passo (\d+) - /gm)].map(m=>({n:m[1],i:m.index})); for (let k=0;k<steps.length;k++){const sub=s.slice(steps[k].i, steps[k+1]?.i ?? s.indexOf("#### Critérios", steps[k].i)); const missing=[]; for (let i=1;i<=7;i++){ if(!new RegExp("^"+i+"\\. ","m").test(sub)) missing.push(i); } console.log(`Passo ${steps[k].n}: missing ${missing.join(",")||"none"}`); }'`

Resultado:

- `Passo 1`: missing none
- `Passo 2`: missing none
- `Passo 3`: missing none
- `Passo 4`: missing none
- `Passo 5`: missing none
- `Passo 6`: missing none
- `Passo 7`: missing none

### Pesquisa estática obrigatória

Comando:

`rg -n "hidrata|hidratacao|hidratação|pos-auditoria|pós-auditoria|scaffold|roteiro generico|roteiro genérico|conversa interna|este guia deixa de ser|codigo ainda nao corrigido|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicavel|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|pseudo-código|solucao parcial|solução parcial|payload: unknown|as any|ContextAction|contextApi|token.*localStorage|localStorage.*token" docs/planificacao/guias-bk/MF4/*.md`

Resultado:

- sem ocorrências;
- exit code `1` do `rg` significa "sem resultados", não falha operacional.

### Pesquisa adicional no BK alvo

Comando:

`rg -n "as never|as any|quando aplic|se a equipa quiser|missing 7|PARCIAL|snipp|payload: unknown|localStorage|ContextAction|contextApi" docs/planificacao/guias-bk/MF4/BK-MF4-06-gestao-de-consentimentos-para-ia.md`

Resultado:

- sem ocorrências;
- exit code `1` do `rg` significa "sem resultados", não falha operacional.

### `git diff --check`

Resultado:

- `OK`, sem saída.

### `bash scripts/validate-planificacao.sh`

Resultado:

- `FAIL` global, exit code `1`;
- `coverage_pass`: `true`;
- `guides_pass`: `true`;
- `governance_pass`: `true`;
- `adequacao_12o_pass`: `true`;
- `consistency_pass`: `false`;
- `score`: `80`;
- `drift_critical_count`: `6`.

Drift reportado pelo script:

- `BK-MF3-07: estado matrix=TODO backlog=DONE`;
- `BK-MF3-01` a `BK-MF3-05`: guias com `estado=DONE` enquanto a matriz mantém `TODO`.

Interpretação: a falha global não vem do `BK-MF4-06`. Vem de drift documental em `MF3`, fora do scope permitido nesta execução.

## Resumo executivo

- MF processada: `MF4`.
- BKs alvo analisados: `1`.
- BKs editados: `BK-MF4-06`.
- Contagem antes da correção: `0 OK`, `1 PARCIAL`, `0 CRITICO`.
- Contagem após correção: `1 OK`, `0 PARCIAL`, `0 CRITICO`.
- Lacunas corrigidas: estrutura do Passo 4, teoria, explicações, frontend com erro/loading e teste de concessão/revogação.
- Decisão técnica principal: `assertGranted` fica como enforcement central antes de fontes/prompt/provider.
- Decisão de domínio principal: consentimento IA é específico por finalidade e revogável.
- Drift restante: `GROUP_AI` em `real_dev`, ordem de validação em `real_dev`, estados MF3.
- Riscos restantes: apenas riscos fora de scope desta execução.
- Resultado de `git diff --check`: `OK`.
- Resultado de `bash scripts/validate-planificacao.sh`: `FAIL` por drift MF3 fora de scope.

## Changelog

- `2026-06-18`: relatório atualizado em modo `corrigir_apenas`; `BK-MF4-06` reclassificado de `PARCIAL` para `OK` após correções documentais.
