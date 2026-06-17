# BK-MF8-02 - IA não pode inventar informação factual.

## Header
- `doc_id`: `GUIA-BK-MF8-02`
- `bk_id`: `BK-MF8-02`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF35`
- `fase_documental`: `Fase 3`
- `sprint`: `S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-03`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-02-ia-nao-pode-inventar-informacao-factual.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `IA não pode inventar informação factual.` com rastreabilidade direta para `RNF35`.
- Foco da macro `MF8`: Compatibilidade e fecho PAP.
- Dominio semântico aplicado: `ai_orchestration`.

## Bloco pedagogico
### Objetivo
Garantir respostas de IA fundamentadas, com guardrails e adaptacao ao contexto academico correto.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Responder sem citar fonte do material.
- Aplicar perfil de IA errado ao contexto atual.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF35` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-02`
- Requisito: `RNF35`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-02` e do requisito `RNF35`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `pipeline IA com contexto e fontes citadas`.
4. Implementar o caminho principal de `pipeline IA com contexto e fontes citadas`.
5. Aplicar controlos para `guardrails por perfil (aluno, turma, professor)`.
6. Preparar evidencia operacional: `amostras de prompts/respostas com fontes`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- pedido sem contexto documental
- pedido que tenta contornar guardrails
- pedido com perfil errado de utilizador

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Resposta referencia fontes reais (doc/página/secção).
- [ ] Perfil de IA aplicado corresponde ao contexto do pedido.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-03`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Resposta IA com guardrails e fontes**
- BK vinculado: `BK-MF8-02`.

```ts
type Fonte = { doc: string; secao: string };

export function responderIA(perfil: 'ALUNO' | 'TURMA' | 'PROFESSOR', pergunta: string, fontes: Fonte[]) {
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!fontes.length) throw new Error('Resposta sem fonte permitida');
  return { bkId: 'BK-MF8-02', req: 'RNF35', perfil, resposta: 'Gerada com base documental', fontes };
}
```

Força citação de fonte e aplica perfil de guardrail por contexto.
- Requisitos alvo deste BK: `RNF35`.

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
`BK-MF8-03`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
