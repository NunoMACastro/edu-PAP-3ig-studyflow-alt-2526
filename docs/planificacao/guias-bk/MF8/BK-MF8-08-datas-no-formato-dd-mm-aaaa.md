# BK-MF8-08 - Datas no formato dd/mm/aaaa.

## Header
- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF43`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-datas-no-formato-dd-mm-aaaa.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Datas no formato dd/mm/aaaa.` com rastreabilidade direta para `RNF43`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `localization`.

## Bloco pedagogico
### Objetivo
Garantir que datas visíveis na app e nos artefactos de defesa usam o formato português `dd/mm/aaaa`.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Misturar `yyyy-mm-dd`, `mm/dd/yyyy` e `dd/mm/aaaa` em ecrãs diferentes.
- Formatar datas diretamente dentro de componentes sem helper reutilizável.
- Esquecer exportações, histórico, logs visíveis ou mensagens de erro.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF43` se traduz em comportamento implementável.
- [ ] Sei indicar onde a app apresenta datas ao utilizador.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-08`
- Requisito: `RNF43`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-08` e do requisito `RNF43`.
2. Identificar ecrãs, componentes e exportações que mostram datas.
3. Definir ou reutilizar um helper de formatação PT-PT.
4. Substituir formatações inconsistentes nos fluxos de demo.
5. Garantir que datas inválidas geram fallback controlado.
6. Preparar evidence com exemplos reais antes/depois.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado a regressões de locale.
10. Concluir handoff técnico para `BK-MF8-09`.

### Cenarios negativos recomendados
- data inválida ou vazia
- data em timezone diferente
- exportação com data sem formatação local

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Datas visíveis seguem `dd/mm/aaaa`.
- [ ] Exportação ou evidence relevante preserva o mesmo formato.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-09`
- Registar formatos verificados e exceções aceites.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Normalização de data PT-PT**
- BK vinculado: `BK-MF8-08`.

```ts
export function formatarDataPT(dataIso: string) {
  const data = new Date(dataIso);

  if (Number.isNaN(data.getTime())) {
    return 'Data inválida';
  }

  return data.toLocaleDateString('pt-PT');
}
```

Centraliza a regra de apresentação e evita formatos misturados na UI.
- Requisitos alvo deste BK: `RNF43`.

## Criterios de aceite
- Datas dos fluxos principais aparecem em `dd/mm/aaaa`.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P0`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: screenshot/log/teste que comprova datas no formato correto.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-09`

## Changelog
- `2026-04-19`: guia renumerado para a nova sequência MF8 e alinhado ao fecho de produto.
