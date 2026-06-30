# BK-MF8-09 - Preparado para futura tradução i18n.

## Header
- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF44`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-preparado-para-futura-traducao-i18n.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Preparado para futura tradução i18n.` com rastreabilidade direta para `RNF44`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `localization`.

## Bloco pedagogico
### Objetivo
Preparar a app para futura internacionalização sem implementar uma tradução completa nesta fase.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Tentar traduzir a aplicação inteira durante o fecho da PAP.
- Criar chaves i18n sem padrão de nomes.
- Trocar textos visíveis sem validar o fluxo da demo.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei distinguir preparação i18n de tradução completa.
- [ ] Sei indicar os textos mais importantes para futura extração.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF8-09`
- Requisito: `RNF44`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-09` e do requisito `RNF44`.
2. Identificar textos visíveis dos fluxos mais importantes da demo.
3. Definir convenção simples para futuras chaves de tradução.
4. Isolar textos críticos quando isso não criar complexidade desnecessária.
5. Documentar o que fica fora do scope: tradução completa e multi-idioma real.
6. Preparar evidence com lista de textos ou helper criado.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 1) e validar erro controlado.

### Cenarios negativos recomendados
- chave de tradução inexistente

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `1` cenario com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Preparação i18n não altera comportamento visível da demo.
- [ ] Tradução completa fica explicitamente marcada como pós-MVP.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-10`
- Registar decisões i18n e riscos pós-MVP.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Catálogo mínimo de textos**
- BK vinculado: `BK-MF8-09`.

```ts
const mensagensPt = {
  common: {
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    erroGenerico: 'Não foi possível concluir a ação.',
  },
};

export function texto(chave: keyof typeof mensagensPt.common) {
  return mensagensPt.common[chave] ?? chave;
}
```

Mostra uma preparação mínima sem obrigar a app a suportar vários idiomas já.
- Requisitos alvo deste BK: `RNF44`.

## Criterios de aceite
- Preparação i18n mínima documentada ou implementada sem quebrar a demo.
- Cenarios negativos concluidos: minimo `1` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P2`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: lista, screenshot ou teste que comprova preparação i18n.
- `neg`: evidência do cenario negativo executado e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-10`

## Changelog
- `2026-04-19`: guia renumerado para a nova sequência MF8 e limitado a preparação i18n pós-MVP.
