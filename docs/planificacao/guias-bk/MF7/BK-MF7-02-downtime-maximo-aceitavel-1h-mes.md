# BK-MF7-02 - Downtime máximo aceitável < 1h/mês.

## Header
- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF24`
- `fase_documental`: `Fase 3`
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-downtime-maximo-aceitavel-1h-mes.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Downtime máximo aceitável < 1h/mês.` com rastreabilidade direta para `RNF24`.
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
- [ ] Sei explicar como `RNF24` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF7-02`
- Requisito: `RNF24`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF7-02` e do requisito `RNF24`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `health, backup/recovery e operação segura`.
4. Implementar o caminho principal de `health, backup/recovery e operação segura`.
5. Aplicar controlos para `circuit-breaker/retry/rollback`.
6. Preparar evidencia operacional: `runbook de falha + recuperação`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 1) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `1` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF7-03`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Health-check e retry controlado**
- BK vinculado: `BK-MF7-02`.

```ts
export function healthCheck(dbOk: boolean, filaOk: boolean) {
  const status = dbOk && filaOk ? 'UP' : 'DEGRADED';
  return { bkId: 'BK-MF7-02', req: 'RNF24', status };
}
```

Suporta operação e diagnóstico rápido em incidente.
- Requisitos alvo deste BK: `RNF24`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `1` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P2`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF7-03`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
