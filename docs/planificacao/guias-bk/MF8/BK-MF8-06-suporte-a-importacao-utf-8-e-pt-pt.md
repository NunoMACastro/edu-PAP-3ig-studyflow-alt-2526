# BK-MF8-06 - Suporte a importação UTF-8 e PT-PT.

## Header
- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF39`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-suporte-a-importacao-utf-8-e-pt-pt.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Suporte a importação UTF-8 e PT-PT.` com rastreabilidade direta para `RNF39`.
- Foco da macro `MF8`: Compatibilidade e fecho PAP.
- Dominio semântico aplicado: `localization`.

## Bloco pedagogico
### Objetivo
Garantir localizacao PT-PT e preparo i18n sem regressao funcional.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Misturar formatos de data em ecrãs distintos.
- Quebrar acentuação PT-PT em import/export.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF39` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-06`
- Requisito: `RNF39`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-06` e do requisito `RNF39`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `locale PT-PT em UI e export/import`.
4. Implementar o caminho principal de `locale PT-PT em UI e export/import`.
5. Aplicar controlos para `normalização de datas/números e encoding`.
6. Preparar evidencia operacional: `evidência de UI + ficheiros gerados`.
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
- [ ] Interface e datas seguem PT-PT sem exceções no fluxo.
- [ ] Importação/exportação preserva UTF-8 e acentuação.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Normalização de locale PT-PT**
- BK vinculado: `BK-MF8-06`.

```ts
export function formatarDataPT(dataIso: string) {
  const d = new Date(dataIso);
  return d.toLocaleDateString('pt-PT');
}
```

Garante coerência de apresentação de datas em PT-PT.
- Requisitos alvo deste BK: `RNF39`.

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
`BK-MF8-07`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
