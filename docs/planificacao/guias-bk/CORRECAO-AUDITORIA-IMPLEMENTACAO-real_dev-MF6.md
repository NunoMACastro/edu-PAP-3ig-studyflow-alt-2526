---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6

## Header

- `doc_id`: `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6`
- `project`: `StudyFlow`
- `macro`: `MF6`
- `implementation_root`: `real_dev`
- `modo`: `corrigir_auditoria`
- `audit_report_source`: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`
- `bk_ids_pedidos`: `BK-MF6-11`, `BK-MF6-12`
- `bk_ids_corrigidos`: `BK-MF6-11`, `BK-MF6-12`
- `finding_ids`: `MF6-BK11-P2-BACKUP-DIR-DEFAULT`, `MF6-BK12-P3-RETRY-INTEGRATION-SPEC`
- `fix_severities`: `P2`, `P3`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `permitir_alterar_docs`: `nao`, exceto relatorios tecnicos permitidos
- `permitir_commits`: `nao`
- `status`: `CORRIGIDO_SEM_VALIDACAO_TOTAL`
- `created_at`: `2026-06-25`
- `updated_at`: `2026-06-25`

## Resultado geral

Resultado final desta execucao: `CORRIGIDO_SEM_VALIDACAO_TOTAL`.

Foram corrigidos os dois findings ativos da auditoria de `BK-MF6-11` e `BK-MF6-12`:

- `MF6-BK11-P2-BACKUP-DIR-DEFAULT`: o backup diario deixou de aceitar default local dentro do checkout. `STUDYFLOW_BACKUP_DIR` passou a ser obrigatorio e tem de apontar para fora do checkout da API/real_dev/repositorio.
- `MF6-BK12-P3-RETRY-INTEGRATION-SPEC`: `MaterialIndexService` passou a ter teste de integracao interna que prova retry de leitura URL apos `503` transitorio e sucesso na segunda tentativa.

Nao foram feitos commits.

Atualizacao adicional de riscos operacionais em `2026-06-25`:

- `RISK-MF6-BK11-REAL-BACKUP-EVIDENCE`: `CORRIGIDO`. Foi executado `backup:daily` real com `dryRun:false` contra `MongoMemoryServer` efemero e `STUDYFLOW_BACKUP_DIR=/private/tmp/studyflow-mf6-real-backup-smoke` fora do checkout. O manifest gerado nao contem URI, documentos ou credenciais.
- `RISK-MF6-BK04-PUBLIC-TLS-EVIDENCE`: `BLOQUEADO_POR_AMBIENTE`. `real_dev/api/.env` nao define `API_PUBLIC_HOST`; `real_dev/api/.env.example` deixa `API_PUBLIC_HOST=` vazio. Sem host publico de staging/deploy, nao e possivel provar TLS 1.2+ real com `verify:tls`.

## Escopo corrigido

| Item | Valor |
| --- | --- |
| MF alvo | `MF6` |
| BKs alvo | `BK-MF6-11`, `BK-MF6-12` |
| Findings corrigidos | `MF6-BK11-P2-BACKUP-DIR-DEFAULT`, `MF6-BK12-P3-RETRY-INTEGRATION-SPEC` |
| Codigo/testes alterados | `real_dev/api/src/scripts/backup-database.ts`, `real_dev/api/src/scripts/backup-database.spec.ts`, `real_dev/api/src/modules/material-index/material-index.service.spec.ts` |
| Relatorio atualizado | `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` |
| Resultado | `CORRIGIDO` |

## Estado final por finding

| Finding | Severidade | BK/RNF | Estado final | Justificacao |
| --- | --- | --- | --- | --- |
| `MF6-BK11-P2-BACKUP-DIR-DEFAULT` | `P2` | `BK-MF6-11` / `RNF21` | `CORRIGIDO` | `normaliseBackupOptions` exige `STUDYFLOW_BACKUP_DIR`, rejeita raiz generica, rejeita paths dentro de `real_dev/api`, `real_dev` e repositorio, e os testes cobrem ausencia de pasta e paths dentro do checkout. |
| `MF6-BK12-P3-RETRY-INTEGRATION-SPEC` | `P3` | `BK-MF6-12` / `RNF22` | `CORRIGIDO` | `material-index.service.spec.ts` cobre agora o caminho real de URL: primeira leitura devolve `503`, `retryWithRecovery` repete, segunda leitura devolve `200`, o job fica `DONE` e o texto recuperado e persistido. |

### MF6-BK11-P2-BACKUP-DIR-DEFAULT - Backup real sem default local

- Severidade: `P2`
- BK/RNF: `BK-MF6-11` / `RNF21`
- Estado final: `CORRIGIDO`
- Causa raiz confirmada: o script tinha `DEFAULT_BACKUP_ROOT = "./backups"` e aceitava execucao real sem `STUDYFLOW_BACKUP_DIR`.
- Correcao aplicada:
  - Removido o default local de backup real.
  - `STUDYFLOW_BACKUP_DIR` passou a ser obrigatorio em `normaliseBackupOptions`.
  - A validacao rejeita `/`, a pasta temporaria raiz, `real_dev/api`, `real_dev` e a raiz do repositorio como destinos de backup.
  - Criado helper `isInsidePath` para manter a validacao de paths legivel e testavel.
  - Adicionados testes para ausencia de pasta dedicada, pasta dentro da API e pasta dentro do repositorio.
- Evidence:
  - `real_dev/api/src/scripts/backup-database.ts:94-120`
  - `real_dev/api/src/scripts/backup-database.ts:278-287`
  - `real_dev/api/src/scripts/backup-database.spec.ts:79-103`
  - `MONGODB_URI=mongodb://127.0.0.1:27017/studyflow npm --prefix real_dev/api run backup:daily:dry-run` falhou de forma esperada com `STUDYFLOW_BACKUP_DIR é obrigatória para executar backup diário.`

### MF6-BK12-P3-RETRY-INTEGRATION-SPEC - Teste de retry no MaterialIndexService

- Severidade: `P3`
- BK/RNF: `BK-MF6-12` / `RNF22`
- Estado final: `CORRIGIDO`
- Causa raiz confirmada: o helper `retryWithRecovery` estava testado isoladamente, mas o fluxo real de `MaterialIndexService.fetchTextFromUrl` nao tinha teste que provasse retry transitorio.
- Correcao aplicada:
  - Adicionado teste em `real_dev/api/src/modules/material-index/material-index.service.spec.ts`.
  - O teste simula `requestText` a devolver `503` primeiro e `200` depois.
  - A expectativa valida duas chamadas ao cliente URL, job `DONE` e persistencia do texto recuperado.
  - Os testes existentes de redirect publico, DNS privado, redirect privado e socket privado foram preservados.
- Evidence:
  - `real_dev/api/src/modules/material-index/material-index.service.ts:681-704`
  - `real_dev/api/src/modules/material-index/material-index.service.spec.ts:306-342`
  - `npm --prefix real_dev/api run test:unit -- backup-database.spec.ts material-index.service.spec.ts retry-with-recovery.spec.ts` passou com 3 suites e 24 testes.

## Coerencia entre MFs

Resultado: `COERENTE`.

### MF5 -> MF6

As correcoes nao alteram contratos de UI, cookies, CSRF, sessao, ownership ou performance herdados de MF5. O backup continua operacional e sem endpoint publico; o retry continua restrito a leitura externa idempotente.

### MF6 interna

`BK-MF6-11` fica mais seguro operacionalmente porque backups reais ja nao caem dentro do checkout por omissao. `BK-MF6-12` fica com evidence de integracao real do retry sem repetir criacao de jobs, escritas, ownership, membership ou parsers de documentos.

### MF6 -> MF7

`BK-MF6-12` continua a entregar os nomes `RECOVERY_RETRY_SCHEDULED` e `RECOVERY_RETRY_EXHAUSTED` para futura observabilidade em `BK-MF7-01`. Esta correcao nao antecipa logs estruturados completos de MF7.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_INFORMATIVO` - relatorios MF6 untracked preservados; `real_dev/` ignorado por regra do repositorio. |
| `npm --prefix real_dev/api run test:unit -- backup-database.spec.ts material-index.service.spec.ts retry-with-recovery.spec.ts` | `PASS` - 3 suites, 24 testes. |
| `STUDYFLOW_BACKUP_DIR=/private/tmp/studyflow-mf6-backup-correction npm --prefix real_dev/api run backup:daily:dry-run` | `PASS` - JSON `ok:true`, `dryRun:true`, sem URI/documentos, `retentionDays:7`. |
| `MONGODB_URI=mongodb://127.0.0.1:27017/studyflow npm --prefix real_dev/api run backup:daily:dry-run` | `PASS_NEGATIVO` - falhou de forma esperada com `STUDYFLOW_BACKUP_DIR é obrigatória para executar backup diário.` |
| `npm --prefix real_dev/api run test:unit` | `PASS` - 77 suites, 270 testes. |
| `npm --prefix real_dev/api run build` | `PASS`. |
| `npm --prefix real_dev/web run build` | `PASS` - `tsc --noEmit` e `vite build`, 121 modulos transformados. |
| `backup:daily` com `MongoMemoryServer` efemero e `STUDYFLOW_BACKUP_DIR=/private/tmp/studyflow-mf6-real-backup-smoke` fora do checkout | `PASS` - JSON `ok:true`, `dryRun:false`, sem URI/documentos, `retentionDays:7`; manifest seguro escrito em `/private/tmp/studyflow-mf6-real-backup-smoke/daily-2026-06-25T19-16-53-933Z/manifest.json`. |
| `rg -n "^API_PUBLIC_HOST=|^API_PUBLIC_HTTP_PORT=|^STUDYFLOW_TLS" real_dev/api/.env real_dev/api/.env.example` | `BLOQUEADO_POR_AMBIENTE` - apenas `real_dev/api/.env.example` contem `API_PUBLIC_HOST=` vazio e `API_PUBLIC_HTTP_PORT=80`; nao ha host publico local para `verify:tls`. |
| `rg -n "[[:blank:]]$" docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md real_dev/api/src/scripts/backup-database.ts real_dev/api/src/scripts/backup-database.spec.ts real_dev/api/src/modules/material-index/material-index.service.spec.ts` | `PASS` - sem trailing whitespace nos ficheiros tocados. |
| `rg -n "as any\|payload: unknown\|TODO\|FIXME\|PREENCHER\|IMPLEMENTAR_DEPOIS\|localStorage\|sessionStorage\|OPENAI_API_KEY\|secret-key\|prompt privado\|resposta IA privada\|test\\.skip\|describe\\.skip\|it\\.skip\|\\.only\\(" real_dev/api/src/scripts/backup-database.ts real_dev/api/src/scripts/backup-database.spec.ts real_dev/api/src/modules/material-index/material-index.service.spec.ts` | `PASS` - sem ocorrencias nos ficheiros tocados. |
| `git diff --check` | `PASS`. |
| `git check-ignore -v real_dev/api/src/scripts/backup-database.ts real_dev/api/src/scripts/backup-database.spec.ts real_dev/api/src/modules/material-index/material-index.service.spec.ts docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md` | `PASS_INFORMATIVO` - confirmou que `real_dev/` e ignorado; o relatorio de correcao nao foi listado como ignorado. |

## Ficheiros alterados nesta execucao

- `real_dev/api/src/scripts/backup-database.ts`
- `real_dev/api/src/scripts/backup-database.spec.ts`
- `real_dev/api/src/modules/material-index/material-index.service.spec.ts`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF6.md`

## Ficheiros preservados

- Guias canonicos em `docs/planificacao/guias-bk/MF6/`
- `docs/planificacao/backlogs/*`
- `docs/planificacao/sprints/*`
- Prompts e documentos canonicos fora dos relatorios tecnicos permitidos

## Blockers e TODOs

Nao ficaram blockers tecnicos para os findings corrigidos nem para `BK-MF6-11`.

Permanece um blocker de ambiente, nao de codigo: fornecer `API_PUBLIC_HOST` publico de staging/deploy e executar `npm --prefix real_dev/api run verify:tls` para fechar `BK-MF6-04` sem ressalvas.

Follow-up opcional: numa proxima auditoria com host publico configurado, promover `BK-MF6-04` e a MF6 global para estado sem riscos ativos se `verify:tls` passar.
