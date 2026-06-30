# BK-MF8-17 - Correção de erros.

## Header
- `doc_id`: `GUIA-BK-MF8-17`
- `bk_id`: `BK-MF8-17`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-16`
- `rf_rnf`: `RNF45`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-17-correcao-de-erros.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Correção de erros.` com rastreabilidade direta para `RNF45`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `quality_architecture`.

## Bloco pedagogico
### Objetivo
Corrigir os erros encontrados na execução final de testes e repetir as validações afetadas.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Consumir a lista de falhas produzida em `BK-MF8-16`.
- Confirmar dependencias: `BK-MF8-16`.

### Erros comuns
- Corrigir sintomas sem perceber a causa.
- Fazer refactors grandes durante o fecho final.
- Não repetir o teste que falhou depois da correção.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar a causa de cada erro corrigido.
- [ ] Sei indicar que teste foi repetido após a correção.
- [ ] Sei separar erro corrigido de risco residual aceite.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-17`
- Requisito: `RNF45`
- Dependencias: `BK-MF8-16`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-17` e do requisito `RNF45`.
2. Ler a lista de erros e falhas recolhida em `BK-MF8-16`.
3. Classificar cada falha por severidade, impacto na defesa e causa provável.
4. Corrigir primeiro erros que bloqueiam demo, build ou testes críticos.
5. Manter a correção pequena e limitada ao erro confirmado.
6. Reexecutar os testes afetados por cada correção.
7. Reexecutar smoke final quando a falha tocar fluxo de demo.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Registar erros corrigidos, riscos aceites e validações repetidas.
10. Fechar a MF8 com evidence final de produto demonstrável.

### Cenarios negativos recomendados
- regressão introduzida por correção
- falha que depende de ambiente indisponível
- erro corrigido sem teste de revalidação

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal afetado.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Cada erro corrigido tem causa, alteração e teste repetido.
- [ ] Riscos residuais estão documentados de forma honesta.

### Matriz minima de testes por prioridade
- `P0`: teste afetado + smoke relevante + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `-`
- Registar fecho final, riscos aceites e evidence usada na defesa.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Triage de erros finais**
- BK vinculado: `BK-MF8-17`.

```ts
type FalhaFinal = {
  id: string;
  severidade: 'CRITICA' | 'MEDIA' | 'BAIXA';
  bloqueiaDefesa: boolean;
  testeRepetido: boolean;
};

export function falhasPorCorrigir(falhas: FalhaFinal[]) {
  return falhas.filter((falha) => falha.bloqueiaDefesa && !falha.testeRepetido);
}
```

Evita fechar a MF8 sem revalidar erros que bloqueiam a demonstração.
- Requisitos alvo deste BK: `RNF45`.

## Criterios de aceite
- Erros encontrados nos testes finais corrigidos ou justificados como risco residual.
- Testes afetados repetidos depois da correção.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo das correções.
- `proof`: output dos testes repetidos após correção.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`-`

## Changelog
- `2026-04-19`: guia criado para correção de erros e revalidação final da MF8.
