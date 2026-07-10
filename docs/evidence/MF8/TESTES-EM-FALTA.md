---
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
---

# TESTES-EM-FALTA — SUPERSEDED

```yaml
scope: MF8_HISTORICO
target: PAP_LOCAL_ENDURECIDA
status: SUPERSEDED
authoritative_for_release: false
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
legacy_generator_output: docs/evidence/MF8/historico/gerado/TESTES-EM-FALTA.md
historical_snapshot: docs/evidence/MF8/historico/original/TESTES-EM-FALTA-2026-07-06.md
```

## Decisão atual

O inventário de 2026-07-06 media apenas oito alvos MF8 anteriores à remediação.
Foi substituído pelas suites, coverage e evidence ligadas ao manifesto no ledger.
Não pode ser usado para concluir que a implementação atual não tem testes em falta.

Fonte operacional atual:

- Ledger: `docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`.
- Gate: `npm --prefix real_dev/api run verify:local-release`.
- Coverage web: `npm --prefix real_dev/web run test:coverage`.
- Snapshot antigo redigido:
  [historico/original/TESTES-EM-FALTA-2026-07-06.md](historico/original/TESTES-EM-FALTA-2026-07-06.md).

Uma reprodução do inventário antigo exige
`STUDYFLOW_ALLOW_LEGACY_MF8_EVIDENCE=true` e escreve apenas sob
`docs/evidence/MF8/historico/gerado/`; nunca substitui este banner.
