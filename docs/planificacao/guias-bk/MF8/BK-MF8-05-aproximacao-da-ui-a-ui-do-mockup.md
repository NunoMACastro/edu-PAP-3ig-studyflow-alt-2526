# BK-MF8-05 - Aproximação da UI à UI do mockup.

## Header
- `doc_id`: `GUIA-BK-MF8-05`
- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-06`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-05-aproximacao-da-ui-a-ui-do-mockup.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Aproximação da UI à UI do mockup.` com rastreabilidade direta para `RNF38`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `ux_accessibility`.

## Bloco pedagogico
### Objetivo
Aproximar a interface real ao mockup usado como referência visual, sem transformar o mockup em contrato técnico absoluto.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Consultar `mockup/` se existir no repositório.
- Confirmar dependencias: `-`.

### Erros comuns
- Copiar o mockup sem validar estados reais de loading, erro, vazio e sucesso.
- Alterar fluxos funcionais para "ficar bonito" sem preservar comportamento existente.
- Ignorar responsividade mínima no ecrã de demo controlada.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar que elementos do mockup são referência visual e que elementos são comportamento real da app.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de antes/depois.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-05`
- Requisito: `RNF38`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-05` e do requisito `RNF38`.
2. Identificar os ecrãs da demo que precisam de aproximação ao mockup.
3. Comparar layout, espaçamento, hierarquia visual, navegação e estados principais.
4. Priorizar diferenças que afectam defesa, compreensão do produto ou confiança visual.
5. Ajustar componentes reais sem criar estilos isolados que quebrem o design existente.
6. Validar estados `loading`, `empty`, `error` e `success` quando existirem no fluxo.
7. Testar a UI no browser definido para a demo controlada.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Recolher evidence visual antes/depois ou screenshot final.
10. Concluir handoff técnico para `BK-MF8-06` com riscos de UI ainda abertos.

### Cenarios negativos recomendados
- ecrã sem dados para mostrar
- erro de API ou submissão
- viewport menor que o ecrã principal da demo

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal da UI.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Diferenças relevantes face ao mockup foram reduzidas ou justificadas.
- [ ] A UI continua funcional no browser definido para a defesa.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke visual + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-06`
- Registar decisões visuais, diferenças aceites e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Checklist de diferença visual**
- BK vinculado: `BK-MF8-05`.

```ts
type UiGap = {
  ecra: string;
  diferenca: string;
  impactoDemo: 'ALTO' | 'MEDIO' | 'BAIXO';
  decisao: 'CORRIGIR' | 'ACEITAR' | 'ADIAR';
};

export function priorizarAjustesUi(gaps: UiGap[]) {
  return gaps
    .filter((gap) => gap.decisao === 'CORRIGIR')
    .sort((a, b) => a.impactoDemo.localeCompare(b.impactoDemo));
}
```

Ajuda a transformar comparação visual em decisão técnica rastreável.
- Requisitos alvo deste BK: `RNF38`.

## Criterios de aceite
- UI dos fluxos principais mais próxima do mockup ou diferenças justificadas.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Evidence visual pronta para revisão técnica e defesa PAP.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Compatibilidade multi-browser completa fica fora do scope desta MF8 e segue como pós-MVP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo visual do BK.
- `proof`: screenshot/log/smoke que comprova o fluxo principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-06`

## Changelog
- `2026-04-19`: guia criado para substituir compatibilidade multi-browser por aproximação da UI ao mockup no fecho PAP.
