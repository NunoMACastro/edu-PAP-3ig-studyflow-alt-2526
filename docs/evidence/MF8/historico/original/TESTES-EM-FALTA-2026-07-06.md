# TESTES-EM-FALTA MF8 — snapshot original redigido

```yaml
scope: MF8_HISTORICO
generated_at: 2026-07-06T14:53:49.640Z
status: SUPERSEDED
authoritative_for_release: false
redacted: true
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
```

Este inventário preserva os oito alvos definidos no fecho histórico MF8. Não mede a suite atual.

## Resultado observado naquele snapshot

- Raiz analisada: `real_dev`.
- Alvos críticos: 8.
- Alvos cobertos: 8.
- Specs em falta naquele conjunto: 0.
- Fontes em falta naquele conjunto: 0.

## Tabela histórica

| Prioridade | Área | Módulo | Estado | Spec esperada |
| --- | --- | --- | --- | --- |
| P0 | API | Ferramentas de estudo privadas | covered | `real_dev/api/src/modules/ai/study-tools.service.spec.ts` |
| P0 | API | Validação de artefactos IA | covered | `real_dev/api/src/modules/ai/validators/ai-artifact.validator.spec.ts` |
| P0 | API | Mini-testes oficiais | covered | `real_dev/api/src/modules/official-tests/official-tests.service.spec.ts` |
| P0 | API | IA da sala | covered | `real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts` |
| P0 | API | Partilhas da sala | covered | `real_dev/api/src/modules/study-rooms/room-shares.service.spec.ts` |
| P0 | API | Inventário MF8 | covered | `real_dev/api/src/scripts/mf8-test-inventory.spec.ts` |
| P1 | Web E2E | Background jobs de estudo | covered | `real_dev/web/tests/e2e/mf6-background-jobs.spec.ts` |
| P0 | Web E2E | Flashcards em exercício | covered | `real_dev/web/tests/e2e/mf8-flashcards.spec.ts` |

## Decisão histórica

O snapshot permitia avançar para o gate MF8 antigo. Essa decisão foi supersedida: o inventário
não cobre sessões v2, privacidade all-model, storage/outbox, recovery, frontend unit/component,
cross-browser, release local nem os restantes controlos da remediação integral.

