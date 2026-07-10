# TESTES-FINAIS MF8 — snapshot original redigido

```yaml
scope: MF8_HISTORICO
generated_at: 2026-07-06T15:55:48.833Z
status: SUPERSEDED
authoritative_for_release: false
redacted: true
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
```

Este documento preserva a estrutura e os resultados do snapshot anterior ao manifesto.
Stdout/stderr extensos, paths locais e qualquer valor de autenticação foram deliberadamente
removidos. As contagens não descrevem a implementação atual.

## Decisão registada naquele snapshot

- Bateria obrigatória: `PASS_HISTORICO`.
- Comandos opcionais sem PASS: zero naquele snapshot.
- Esta decisão foi posteriormente invalidada pela remediação integral.

## Evidence de entrada histórica

- Ficheiro: `docs/evidence/MF8/TESTES-EM-FALTA.md` na versão de 2026-07-06.
- Estado observado: `PASS_HISTORICO` para os oito alvos MF8 então inventariados.

## Comandos e resultados preservados

| Obrigatório | Comando | Estado histórico | Exit code | Linha executada |
| --- | --- | --- | ---: | --- |
| Sim | Validação da planificação | PASS | 0 | `bash scripts/validate-planificacao.sh` |
| Sim | Testes unitários da API | PASS | 0 | `npm --prefix real_dev/api run test:unit` |
| Sim | Build da API | PASS | 0 | `npm --prefix real_dev/api run build` |
| Sim | Build da web | PASS | 0 | `npm --prefix real_dev/web run build` |
| Não | E2E Playwright da web | PASS | 0 | `npm --prefix real_dev/web run test:e2e` |

## Resultados técnicos redigidos

### Validação da planificação

- Resultado histórico: exit code 0.
- Output original: removido; continha um relatório extenso anterior à planificação atual.

### Testes unitários da API

- Resultado histórico: 97 suites e 412 testes passaram.
- Output original: removido; continha a enumeração completa de ficheiros/specs.

### Build da API

- Resultado histórico: exit code 0.
- Output original: removido por não acrescentar evidence válida ao manifesto atual.

### Build da web

- Resultado histórico: exit code 0.
- Bundle principal observado: 357,31 kB (94,63 kB gzip).
- Output original: removido; os nomes de chunks deixaram de corresponder à aplicação atual.

### E2E Playwright

- Resultado histórico: 29 cenários passaram em Chromium.
- Output original: removido por poder conter paths, dados de formulários e ruído de ambiente.
- A suite e os contratos foram alterados posteriormente; esta contagem não pode ser reutilizada.

## Autoridade atual

O estado atual pertence ao ledger e a uma execução integral de `verify:local-release` ligada ao
manifesto final. Este snapshot nunca autoriza release, aptidão local ou prontidão para produção.

