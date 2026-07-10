# Funções fundamentais da aplicação — StudyFlow

```yaml
doc_id: SF-FUNCTIONS-CHEATSHEET
source: real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md
generator: real_dev/api/src/scripts/generate-function-inventory.ts
authority: GENERATED_AST
manifest_binding: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
updated_at: 2026-07-10
```

## Fonte atual

O inventário exaustivo e atual é
[`real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md`](../../real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md).
É extraído do AST TypeScript de `real_dev/api/src` e `real_dev/web/src`, excluindo testes,
dependências, builds, comentários e snippets Markdown. Esta cábula não repete contagens nem
assinaturas, para não criar uma segunda fonte manual.

```bash
npm --prefix real_dev/api run function-inventory:write
npm --prefix real_dev/api run function-inventory:check
```

O `check` compara byte a byte. A correspondência ao código é ligada ao SHA-256 no ledger
externo; o hash não é escrito no artefacto dentro de `real_dev`, porque isso criaria uma
referência circular.

## Contratos fundamentais para leitura do inventário

- Sessão: Redis contém só `{ userId, sessionVersion }`; cada pedido relê `accountStatus`, role e
  versão em Mongo. Divergência termina em `401 SESSION_REVOKED`.
- IA: apenas `GovernedAiExecutionService` injeta o provider; `ROOM_AI` começa desativada e sem
  consentimento automático.
- Privacidade: `PersonalDataRegistry` classifica cada model como `DELETE`, `PULL_MEMBERSHIP`,
  `ANONYMIZE_90D` ou `RETAIN_NONPERSONAL`.
- Ficheiros/jobs: storage usa staging/promoção/reconciliação; jobs usam lease, heartbeat,
  fencing, retries e recuperação. Polling web é single-flight com abort.
- Frontend: React Router lazy, `ProtectedLayout`, `RoleGuard`, `ApiError`, sessão com estado
  `unavailable` e `useAsyncAction` evitam mounts/pedidos e estados falsos.
- Operação: `/api/health/live` é liveness; `/api/health/ready` e `/api/health` falham com `503`
  perante dependências indisponíveis. `verify:local-release` continua fail-closed.

## Snapshot narrativo preservado

As descrições manuais de 2026-07-07, incluindo as correções pedagógicas preexistentes, foram
preservadas em
[`historico/FUNCOES-FUNDAMENTAIS-APLICACAO-2026-07-07.md`](historico/FUNCOES-FUNDAMENTAIS-APLICACAO-2026-07-07.md).
Esse snapshot é útil para contexto, mas não é inventário atual nem evidence de release.
