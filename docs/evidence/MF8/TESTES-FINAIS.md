---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# TESTES-FINAIS — SUPERSEDED

```yaml
scope: MF8_HISTORICO
target: PAP_LOCAL_ENDURECIDA
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
legacy_generator_output: docs/evidence/MF8/historico/gerado/TESTES-FINAIS.md
historical_snapshot: docs/evidence/MF8/historico/original/TESTES-FINAIS-2026-07-06.md
```

## Decisão atual

As contagens e resultados anteriormente guardados neste ficheiro foram removidos
porque descreviam uma implementação anterior. Não podem ser usados para declarar
PASS, fecho da auditoria, aptidão local ou prontidão para produção.

O fecho atual exige uma nova execução integral de `verify:local-release`, ligada
ao manifesto SHA-256 final e aos gates manuais aplicáveis. Enquanto essa execução
não existir sem blockers, o estado permanece invalidado.

## Fonte operacional

- Ledger de remediação: `docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`.
- Gate local: `npm --prefix real_dev/api run verify:local-release`.
- Mapa técnico: `real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md`, verificado
  por comparação byte a byte no gate.
- Snapshot antigo redigido:
  [historico/original/TESTES-FINAIS-2026-07-06.md](historico/original/TESTES-FINAIS-2026-07-06.md).

Este documento não é um destino para logs com cookies, passwords, URIs com
credenciais, prompts, respostas IA ou dados pessoais.

Os geradores MF8 legados exigem
`STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE=true` e escrevem exclusivamente sob
`docs/evidence/MF8/historico/gerado/`. Nunca voltam a substituir este banner.
