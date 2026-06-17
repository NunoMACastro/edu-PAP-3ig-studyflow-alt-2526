# BK-MF7-08 - Endpoint de health-check.

## Header
- `doc_id`: `GUIA-BK-MF7-08`
- `bk_id`: `BK-MF7-08`
- `macro`: `MF7`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-09`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-08-endpoint-de-health-check.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Endpoint de health-check.` com rastreabilidade direta para `RNF30`.
- Foco da macro `MF7`: Operacao, modularidade e compliance.
- Dominio semântico aplicado: `reliability_ops`.

## Bloco pedagogico
### Objetivo
Garantir continuidade operacional (logs, backups, recovery, deploy seguro).

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Sem plano de recuperação após falha.
- Deploy sem rollback testado.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF30` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF7-08`
- Requisito: `RNF30`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF7-08` e do requisito `RNF30`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `health, backup/recovery e operação segura`.
4. Implementar o caminho principal de `health, backup/recovery e operação segura`.
5. Aplicar controlos para `circuit-breaker/retry/rollback`.
6. Preparar evidencia operacional: `runbook de falha + recuperação`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF7-09`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Health-check e retry controlado**
- BK vinculado: `BK-MF7-08`.

```ts
export function healthCheck(dbOk: boolean, filaOk: boolean) {
  const status = dbOk && filaOk ? 'UP' : 'DEGRADED';
  return { bkId: 'BK-MF7-08', req: 'RNF30', status };
}
```

Suporta operação e diagnóstico rápido em incidente.
- Requisitos alvo deste BK: `RNF30`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `2` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P1`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF7-09`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
