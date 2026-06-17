# BK-MF5-10 - Dashboards e estudo carregam em ≤ 2s.

## Header
- `doc_id`: `GUIA-BK-MF5-10`
- `bk_id`: `BK-MF5-10`
- `macro`: `MF5`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF08`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-11`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-10-dashboards-e-estudo-carregam-em-2s.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Dashboards e estudo carregam em ≤ 2s.` com rastreabilidade direta para `RNF08`.
- Foco da macro `MF5`: Operacao e UX transversal.
- Dominio semântico aplicado: `performance_scalability`.

## Bloco pedagogico
### Objetivo
Cumprir metas de latencia e escalabilidade com instrumentacao objetiva.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Medir latencia sem cenário reproduzível.
- Bloquear UI em tarefas assíncronas pesadas.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF08` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF5-10`
- Requisito: `RNF08`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF5-10` e do requisito `RNF08`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `cenário de carga e medição de latência`.
4. Implementar o caminho principal de `cenário de carga e medição de latência`.
5. Aplicar controlos para `timeouts, filas e controlo de concorrência`.
6. Preparar evidencia operacional: `métricas comparáveis pré/pós`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio
- permissão insuficiente

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Métrica alvo do BK é medida e comparável.
- [ ] Caminho crítico mantém-se dentro do orçamento definido.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF5-11`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Consulta de latência por janela**
- BK vinculado: `BK-MF5-10`.

```ts
// BK: BK-MF5-10 / RNF08
const porJanela = await metricasLatencyModel.aggregate([
  { $match: { contexto } },
  {
    $group: {
      _id: { $dateTrunc: { date: '$createdAt', unit: 'minute' } },
      latMedia: { $avg: '$latenciaMs' },
      latenciasMs: { $push: '$latenciaMs' },
    },
  },
  { $sort: { _id: -1 } },
  { $limit: 60 },
]);

const resultado = porJanela.map((janela) => ({
  janela: janela._id,
  latMedia: janela.latMedia,
  p95: calcularPercentil(janela.latenciasMs, 95),
}));
```

Base para validar SLA do caminho crítico com p95 mensurável.
- Requisitos alvo deste BK: `RNF08`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P0`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF5-11`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
