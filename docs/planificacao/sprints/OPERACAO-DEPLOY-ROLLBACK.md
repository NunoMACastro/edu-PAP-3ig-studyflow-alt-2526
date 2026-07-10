# OPERACAO-DEPLOY-ROLLBACK

## Header
- `doc_id`: `OPERACAO-DEPLOY-ROLLBACK`
- `path`: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo
Definir o protocolo pedagógico de entrega e ligar a implementação de referência ao runbook local
canónico. Este documento não autoriza deploy público nem substitui
[`docs/ops/LOCAL-PAP-RUNBOOK.md`](../../ops/LOCAL-PAP-RUNBOOK.md).

## Entrega local da referência (baseline)

1. Confirmar `real_dev_status` e blockers no ledger; `estado` do aluno não promove a referência.
2. Executar `npm --prefix real_dev/api run docs:verify` e o gate
   `npm --prefix real_dev/api run verify:local-release`.
3. Exigir Node `24.11.1`, npm `11.6.2`, Mongo replica set local, Redis dedicado, storage externo,
   scope `local-pap`, bind `127.0.0.1` e `trust proxy=false`.
4. O gate inclui três Chromium isolados, Firefox/WebKit críticos, readiness negativa, audits,
   coverage/bundle, smoke autenticado e restore real. E2E nunca é opcional.
5. Se OP-001 ou OP-005 estiver pendente, terminar em `BLOQUEADO_OPERADOR`; não publicar `PASS`.

## Rollback
1. Acionar rollback local se houver falha crítica, manifesto divergente ou quebra de evidence.
2. Verificar snapshot/HMAC e repor apenas em destino local vazio, nunca numa base de produção.
3. Reexecutar health/readiness, smokes, `docs:verify` e manifesto.
4. Registar causa, passos e exit codes sanitizados no ledger; invalidar evidence anterior.

## Verificacao pos-deploy
- Smoke obrigatorio para autenticacao, estudo assistido e colaboracao/turma.
- `/api/health/live` prova processo; `/api/health/ready` e `/api/health` devolvem `503` se Mongo,
  Redis, storage ou runner não estiverem prontos.
- Confirmar cleanup de artefactos Playwright, ausência de secrets e hash inalterado.
- O smoke de “200” prova 200 pedidos com uma sessão; não prova 200 utilizadores distintos.

## Incidentes
- Severidade `Alta`: indisponibilidade de fluxo core da app.
- Severidade `Media`: regressao parcial com workaround.
- Severidade `Baixa`: falha cosmetica sem impacto funcional core.
- Todo incidente deve registar causa, mitigacao e acao preventiva.

## Evidencias
- Identificador de release e timestamp.
- Resultado dos checks pre e pos deploy.
- Registo de rollback (quando aplicavel).
- Referencia no scorecard e no gate da sprint.

## Changelog
- `2026-07-10`: limitado a PAP local, ligado ao gate fail-closed/runbook/manifesto e removida
  qualquer inferência de release a partir dos gates pedagógicos.
- `2026-04-19`: artefacto criado para cumprir contrato canónico de operacao/deploy/rollback.
