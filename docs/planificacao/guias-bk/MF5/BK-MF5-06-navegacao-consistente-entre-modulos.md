# BK-MF5-06 - Navegação consistente entre módulos.

## Header
- `doc_id`: `GUIA-BK-MF5-06`
- `bk_id`: `BK-MF5-06`
- `macro`: `MF5`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF04`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-07`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-06-navegacao-consistente-entre-modulos.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Navegação consistente entre módulos.` com rastreabilidade direta para `RNF04`.
- Foco da macro `MF5`: Operacao e UX transversal.
- Dominio semântico aplicado: `ux_accessibility`.

## Bloco pedagogico
### Objetivo
Elevar qualidade de experiencia (usabilidade/acessibilidade) com criterios verificaveis.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Validar formulário apenas no backend.
- Quebrar contraste/foco teclado em componentes principais.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF04` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF5-06`
- Requisito: `RNF04`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF5-06` e do requisito `RNF04`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `comportamentos UX críticos (form, feedback, navegação)`.
4. Implementar o caminho principal de `comportamentos UX críticos (form, feedback, navegação)`.
5. Aplicar controlos para `acessibilidade básica (labels, foco, contraste)`.
6. Preparar evidencia operacional: `capturas/relatório de usabilidade`.
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
- Proximo BK recomendado: `BK-MF5-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Validação de formulário com feedback acessível**
- BK vinculado: `BK-MF5-06`.

```ts
type FormState = { email: string; nome: string };

export function validarFormulario(state: FormState) {
  const erros: string[] = [];
  if (!state.nome.trim()) erros.push('Nome obrigatório');
  if (!state.email.includes('@')) erros.push('Email inválido');
  return { bkId: 'BK-MF5-06', req: 'RNF04', valido: erros.length === 0, erros };
}
```

Cria feedback imediato e determinístico no fluxo de UI.
- Requisitos alvo deste BK: `RNF04`.

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
`BK-MF5-07`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
