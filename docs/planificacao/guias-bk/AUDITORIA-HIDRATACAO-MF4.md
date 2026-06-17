# Auditoria de guias BK - MF4

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF4`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `project`: `StudyFlow`
- `macro_funcionalidade`: `MF4`
- `modo`: `auditar_apenas`
- `implementation_root`: `real_dev`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `last_updated`: `2026-06-16`

## Escopo desta execução

Esta execução auditou os 10 guias de `docs/planificacao/guias-bk/MF4/` e atualizou apenas este relatório.

Não foram corrigidos BKs, código real, mockups, documentos canónicos, matriz, backlog ou sprints, porque `MODO=auditar_apenas` e `STRICT_SCOPE=true`.

## Fontes consultadas

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
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md`
- Todos os BKs de `MF4`
- BKs anteriores relevantes de `MF0`, `MF1`, `MF2` e `MF3`
- BKs seguintes relevantes de `MF5`, `MF6`, `MF7` e `MF8`
- `real_dev/api/src` e `real_dev/web/src`, apenas como referência estrutural validada
- `mockup/`, apenas como referência visual/fluxo

## Resultado global

| Estado | Quantidade |
| --- | ---: |
| `OK` | 10 |
| `PARCIAL` | 0 |
| `CRITICO` | 0 |

Resultado: a MF4 está, em termos documentais e pedagógicos, apta a ser seguida pelos alunos sem adivinhação estrutural. A auditoria não valida compilação de código extraído dos blocos Markdown como ficheiros reais, porque os BKs não foram materializados em `real_dev` nesta execução.

## Inventário dos BKs auditados

| BK | RF | Dependências | Próximo BK | Estado |
| --- | --- | --- | --- | --- |
| `BK-MF4-01` | `RF49` | `BK-MF1-12` | `BK-MF4-02` | `OK` |
| `BK-MF4-02` | `RF50` | `BK-MF2-11` | `BK-MF4-03` | `OK` |
| `BK-MF4-03` | `RF51` | `BK-MF4-02` | `BK-MF4-04` | `OK` |
| `BK-MF4-04` | `RF52` | `-` | `BK-MF4-05` | `OK` |
| `BK-MF4-05` | `RF53` | `-` | `BK-MF4-06` | `OK` |
| `BK-MF4-06` | `RF54` | `-` | `BK-MF4-07` | `OK` |
| `BK-MF4-07` | `RF55` | `BK-MF0-04` | `BK-MF4-08` | `OK` |
| `BK-MF4-08` | `RF56` | `BK-MF4-07` | `BK-MF4-09` | `OK` |
| `BK-MF4-09` | `RF57` | `BK-MF2-11` | `BK-MF4-10` | `OK` |
| `BK-MF4-10` | `RF58` | `BK-MF4-09` | `BK-MF5-01` | `OK` |

## Mapa de contratos anteriores consumidos

- `SessionGuard` e `AuthenticatedRequest` existem em `real_dev/api/src/common`.
- `User`, `UserRole`, `UsersService.findById` e `UsersService.toPublicUser` existem na fundação de autenticação/utilizadores.
- `ClassesService.findOwnedClass` existe e valida ownership docente por `teacherId`.
- `StudyGroupsService.ensureMember` existe e delega validação de membership para `StudyRoomsService`.
- `NotificationPreferencesService.listEffective` e `isInAppEnabled` existem e suportam preferências in-app.
- `MaterialsService.countMine`, `StudyAreasService`, `StudyEvent`, `AI_PROVIDER` e `requestMf3Json` existem no `real_dev`.
- Os módulos consumidos por MF4 exportam os services necessários: `ClassesModule`, `StudyGroupsModule`, `NotificationPreferencesModule`, `StudyAreasModule` e `MaterialsModule`.

## Avaliação por BK

### `BK-MF4-01`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: contém 6 passos, 8 blocos de código, explicações por passo, cenários negativos, validação final, evidence e handoff.
- Segurança: destinatários são calculados no backend; turma passa por `findOwnedClass`; grupo passa por `ensureMember`; preferências são aplicadas no service.
- Risco residual: integração real com quotas de `BK-MF4-03` fica para BK posterior, como declarado.

### `BK-MF4-02`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: contém DTO, schema, service, controller, módulo, frontend, teste e validação final.
- Segurança: professor é validado por role e ownership de turma antes do cálculo de alunos inativos.
- Risco residual: agendamento recorrente está corretamente fora de scope.

### `BK-MF4-03`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: define política administrativa de canais, quotas, endpoints admin e teste de autorização/quota.
- Segurança: `ADMIN` é validado no backend; quotas geram erro controlado.
- Falso positivo de pesquisa: a ocorrência `localStorage/sessionStorage` é aceitável porque aparece como instrução proibitiva, não como implementação.

### `BK-MF4-04`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: cria pedido de exportação, download JSON, minimização, ownership e teste contra exportação de outro utilizador.
- Segurança/RGPD: exclui `passwordHash`, cookies, tokens e dados de terceiros.
- Risco residual: formato ZIP/binário fica corretamente fora de scope.

### `BK-MF4-05`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: inclui confirmação forte, proteção do último admin, remoção controlada, revogação de sessão e teste negativo.
- Segurança/RGPD: evita `targetUserId` vindo do frontend e usa sessão autenticada.
- Risco residual: política de retenção legal/backups deve ser documentada fora deste BK antes de produção real.

### `BK-MF4-06`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: define consentimento por finalidade e versão, `assertGranted`, controller, módulo, frontend e teste.
- Segurança/IA: bloqueia antes de ler fontes privadas ou chamar `AI_PROVIDER`.
- Risco residual: os services IA reais só ficam alterados quando o aluno executar o BK.

### `BK-MF4-07`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: altera `User.role` real, protege último admin, exige `reason`, cria histórico e teste.
- Nota técnica: o guia importa `UserRole` como import normal, embora no código real seja um `type`. Com o `tsconfig` atual da API, isto tende a ser elidido e não é bloqueante; numa configuração com `verbatimModuleSyntax` seria preferível `import type { UserRole }`.
- Risco residual: melhoria recomendada, não bloqueante, para rigor TypeScript.

### `BK-MF4-08`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: define `AuditEvent`, `AuditLogService.record`, listagem admin, integração em papéis/IA/materiais e testes.
- Segurança/privacidade: remove chaves sensíveis como `passwordHash`, `token`, `cookie`, `prompt` e `answer`.
- Falso positivo de pesquisa: a palavra `secret` surge dentro de teste de redacção de metadados sensíveis, não como segredo real.

### `BK-MF4-09`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: define políticas de modelo IA por finalidade, resolução antes do provider, auditoria e frontend admin.
- Segurança/IA: não altera prompts pedagógicos e bloqueia política desativada antes de chamar provider.
- Risco residual: passagem de `policy.model` ao provider depende de extensão explícita da interface do provider durante implementação.

### `BK-MF4-10`

- Estado: `OK`
- Problema principal: nenhum bloqueante encontrado.
- Evidência: define políticas e uso de quota, reserva atómica, endpoints admin, painel e teste de `AI_QUOTA_EXCEEDED`.
- Segurança/IA: reserva ocorre antes de chamar `AI_PROVIDER`; quotas são administrativas e mensais.
- Risco residual: unidade de IA é `DERIVADO` e simplificada para MVP, conforme declarado.

## Coerência MF3 -> MF4 -> MF5

- `MF3` entrega grupos, preferências de notificação, IA coletiva, pesquisa e alertas de estudo; `MF4` consome estes contratos sem os redefinir.
- `MF4` separa corretamente notificações, acompanhamento, políticas, privacidade, consentimentos, papéis, auditoria, modelos IA e quotas IA.
- `MF5` recebe de `MF4` uma base de administração, governança e limites que suporta usabilidade, feedback e performance sem inventar integrações externas.

## Drift documental encontrado

- `CONTRATO-CAMPOS-BK.md` diverge de `MATRIZ-CANONICA-BK.md`/`BACKLOG-MVP.md` em pelo menos `BK-MF4-05` e `BK-MF4-10`.
- O validador global reporta drift crítico em `MF3`, fora do scope desta execução:
  - `BK-MF3-07: estado matrix=TODO backlog=DONE`
  - `BK-MF3-01` a `BK-MF3-05`: guias com `estado=DONE` enquanto matriz mantém `TODO`

Classificação: `BLOQUEADO_POR_SCOPE` para correção nesta execução, porque a prompt permite apenas relatório de auditoria da MF4 e não autoriza alteração de documentos canónicos ou BKs fora da MF alvo.

## Verificações executadas

### Estrutura dos BKs

Comando executado:

`node -e '...'`

Resultado:

- 10/10 BKs têm as secções obrigatórias.
- 10/10 BKs têm passos técnicos numerados.
- 10/10 BKs têm blocos de código não vazios quando apresentam código.
- 10/10 BKs têm explicação do código, validação por passo e cenário negativo por passo.

### Pesquisa estática obrigatória

Comando executado:

`rg -n 'secret|token|password|cookie|localStorage|sessionStorage|payload: unknown|as any|TODO|FIXME|mock|stub|fake|RAG|embedding|OCR|chunking|prompt|resposta IA|passwordHash' docs/planificacao/guias-bk/MF4/*.md real_dev/api/src real_dev/web/src`

Resultado:

- Sem `payload: unknown`.
- Sem `as any` nos BKs MF4.
- Sem uso de `localStorage`/`sessionStorage` para sessão ou token nos BKs MF4.
- Ocorrências de `TODO` nos headers são o estado canónico dos BKs, não TODOs vagos.
- Ocorrências de `mock` surgem em testes ou como negação explícita de mocks de token.
- Ocorrências de `passwordHash`, `token`, `cookie`, `prompt` e `answer` surgem em contexto de exclusão, redacção, segurança ou teste negativo.

### `git diff --check`

Resultado: `OK`, sem saída.

### `bash scripts/validate-planificacao.sh`

Resultado: `FAIL` global, exit code `1`.

Resumo:

- `coverage_pass`: `true`
- `guides_pass`: `true`
- `governance_pass`: `true`
- `adequacao_12o_pass`: `true`
- `consistency_pass`: `false`
- `score`: `80`
- `drift_critical_count`: `6`

Interpretação: falha global por drift documental na `MF3`, fora do scope desta execução. Os guias passam no bloco `guides_quality`.

## Resumo executivo

- MF auditada: `MF4`.
- BKs auditados: `10`.
- Resultado: `10 OK`, `0 PARCIAL`, `0 CRITICO`.
- BKs editados nesta execução: nenhum.
- Relatório atualizado nesta execução: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`.
- Risco principal restante: drift documental global em `MF3`, reportado pelo validador.
- Risco menor: alguns imports type-only poderiam ser escritos com `import type` para maior robustez futura.
- Estado da coerência MF: MF4 está coerente com contratos anteriores e entrega uma base clara para MF5.

## Changelog

- `2026-06-16`: execução em modo `auditar_apenas`; relatório atualizado para refletir auditoria objetiva da MF4 sem editar BKs.
