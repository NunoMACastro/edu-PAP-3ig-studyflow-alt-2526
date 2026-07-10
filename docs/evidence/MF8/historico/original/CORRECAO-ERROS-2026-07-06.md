# CORRECAO-ERROS MF8 — snapshot original redigido

```yaml
scope: MF8_HISTORICO
generated_at: 2026-07-06T15:56:40.210Z
status: SUPERSEDED
authoritative_for_release: false
redacted: true
superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md
```

Este registo preserva as três correções descritas no snapshot MF8. Comandos de pesquisa,
detalhes de autenticação e outputs extensos foram removidos. Não declara o estado atual.

## Decisão registada naquele snapshot

- Registo MF8: `PASS_HISTORICO`.
- A decisão foi posteriormente supersedida por alterações à implementação e pelo novo ledger.

## Correções históricas

| ID | Origem | Causa observada | Correção então aplicada | Revalidação redigida |
| --- | --- | --- | --- | --- |
| MF8-ERR-01 | Evidence | O relatório antigo guardava um path local absoluto. | O renderer passou a usar paths relativos e ganhou teste de regressão. | Specs do renderer/registo e scanner passaram naquele snapshot. |
| MF8-ERR-02 | Web E2E | O smoke usava seletores globais ambíguos. | A navegação e a resposta foram limitadas às respetivas regiões acessíveis. | Smoke focado e suite antiga com 29 cenários passaram. |
| MF8-ERR-03 | Web E2E | A suite exigia configuração externa mesmo com fixtures locais. | O teste passou a aceitar a fixture sintética do processo E2E. | Smoke focado e suite antiga com 29 cenários passaram. |

## Privacidade da preservação

Não foram preservados valores de autenticação, conteúdo de formulários, prompts, respostas IA,
dados pessoais, paths de utilizador nem outputs browser. A evidence atual está exclusivamente no
ledger ligado ao manifesto final.

