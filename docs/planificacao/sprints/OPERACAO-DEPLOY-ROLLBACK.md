# OPERACAO-DEPLOY-ROLLBACK

## Header
- `doc_id`: `OPERACAO-DEPLOY-ROLLBACK`
- `path`: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Definir protocolo operacional minimo para deploy e rollback no contexto PAP, com evidencias verificaveis para gates `S4`, `S8` e `S12`.

## Deploy (baseline)
1. Confirmar BKs da sprint em estado elegivel para release e sem bloqueios `P0`.
2. Executar validacao documental e tecnica (`validate-planificacao` + checks de regressao).
3. Publicar versao com changelog curto e identificador de release.
4. Validar smoke funcional dos fluxos centrais da StudyFlow.

## Rollback
1. Acionar rollback se houver falha critica em fluxo `P0` ou quebra de rastreabilidade.
2. Repor versao estavel anterior e confirmar integridade de dados.
3. Reexecutar smoke dos fluxos centrais e registar impacto.
4. Abrir acao corretiva no scorecard da sprint.

## Verificacao pos-deploy
- Smoke obrigatorio para autenticacao, estudo assistido e colaboracao/turma.
- Confirmar logs sem erro critico e tempos dentro do alvo documental.
- Validar alinhamento dos artefactos de sprint/gate apos release.

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
- `2026-04-19`: artefacto criado para cumprir contrato canónico de operacao/deploy/rollback.
