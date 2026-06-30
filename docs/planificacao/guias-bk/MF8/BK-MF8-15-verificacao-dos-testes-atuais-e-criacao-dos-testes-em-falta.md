# BK-MF8-15 - Verificação dos testes atuais e criação dos testes em falta.

## Header
- `doc_id`: `GUIA-BK-MF8-15`
- `bk_id`: `BK-MF8-15`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-14`
- `rf_rnf`: `RNF41`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-16`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-15-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Verificação dos testes atuais e criação dos testes em falta.` com rastreabilidade direta para `RNF41`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `quality_architecture`.

## Bloco pedagogico
### Objetivo
Perceber que testes já existem, identificar lacunas nos fluxos críticos e criar testes mínimos para fechar a defesa com confiança.

### Pre-requisitos
- Ler o requisito de origem em `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF8-14`.

### Erros comuns
- Criar testes só para aumentar número de ficheiros, sem cobrir comportamento real.
- Apagar ou enfraquecer testes existentes para ficarem verdes.
- Esquecer cenários negativos nos fluxos críticos.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei listar os testes existentes por camada.
- [ ] Sei justificar que lacunas precisam de teste antes da defesa.
- [ ] Sei demonstrar evidência objetiva de testes novos ou atualizados.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-15`
- Requisito: `RNF41`
- Dependencias: `BK-MF8-14`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-15` e do requisito `RNF41`.
2. Inventariar testes existentes por camada: unit, integration, e2e/smoke.
3. Mapear fluxos críticos da demo e requisitos sem cobertura suficiente.
4. Escolher lacunas que têm maior risco para a defesa.
5. Criar ou atualizar testes focados, sem introduzir dependências desnecessárias.
6. Garantir pelo menos um cenário negativo nos fluxos críticos adicionados.
7. Executar os testes afetados e registar resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Documentar testes ainda fora de scope com justificação.
10. Concluir handoff técnico para `BK-MF8-16`.

### Cenarios negativos recomendados
- input inválido em fluxo principal
- utilizador sem permissão
- falha controlada de API ou provider

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal testado.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Testes existentes foram inventariados antes de criar novos.
- [ ] Novos testes cobrem comportamento real e não apenas existência de ficheiros.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-16`
- Registar testes criados, testes não executados e riscos residuais.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Inventário mínimo de cobertura**
- BK vinculado: `BK-MF8-15`.

```ts
type TestGap = {
  fluxo: string;
  camada: 'unit' | 'integration' | 'e2e' | 'smoke';
  risco: 'ALTO' | 'MEDIO' | 'BAIXO';
  testeCriado: boolean;
};

export function lacunasCriticas(gaps: TestGap[]) {
  return gaps.filter((gap) => gap.risco === 'ALTO' && !gap.testeCriado);
}
```

Ajuda a justificar quais testes faltam antes da execução final.
- Requisitos alvo deste BK: `RNF41`.

## Criterios de aceite
- Testes atuais inventariados e lacunas críticas identificadas.
- Testes em falta mais relevantes criados ou justificados.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo dos testes criados/atualizados.
- `proof`: output dos testes afetados.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-16`

## Changelog
- `2026-04-19`: guia criado para a nova fase de testes em falta no fecho PAP.
