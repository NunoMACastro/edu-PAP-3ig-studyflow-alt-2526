# BK-MF8-13 - Rankings dos mini-testes oficiais.

## Header
- `doc_id`: `GUIA-BK-MF8-13`
- `bk_id`: `BK-MF8-13`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-12`
- `rf_rnf`: `RF28, RF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-14`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-13-rankings-dos-mini-testes-oficiais.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Rankings dos mini-testes oficiais.` com rastreabilidade direta para `RF28, RF30`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `official_tests_rankings`.

## Bloco pedagogico
### Objetivo
Criar rankings dos mini-testes oficiais para aluno e professor, com ordenação determinística e visibilidade adequada ao papel.

### Pre-requisitos
- Ler os requisitos de origem em `docs/RF.md` e `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF8-12`.

### Erros comuns
- Expor dados de outro aluno, sala, turma ou disciplina por falta de filtro de ownership/membership.
- Implementar apenas UI sem contrato backend validável e testes negativos.
- Misturar regras privadas e partilhadas sem estado explícito no modelo.
- Fechar BK sem evidence de autorização, fluxo feliz e falha controlada.

### Check de compreensao
- [ ] Sei explicar como `RF28, RF30` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco de privacidade/autorização deste BK.
- [ ] Sei demonstrar evidence objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-13`
- Requisito(s): `RF28, RF30`
- Dependencias: `BK-MF8-12`
- API alvo: `GET /api/student/tests/:testId/ranking; GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-13` e dos requisitos `RF28, RF30`.
2. Rever o contrato existente em `real_dev/api` e `real_dev/web` antes de criar novos módulos.
3. Implementar backend: Ranking deriva de OfficialTestAttempt ordenado por scorePercent desc e answeredAt asc.
4. Implementar API: `GET /api/student/tests/:testId/ranking; GET /api/teacher/subjects/:subjectId/tests/:testId/ranking`.
5. Implementar frontend: Resultado do aluno mostra top 10 da turma e posição própria; painel docente mostra ranking completo por teste.
6. Garantir autorização por sessão, ownership, membership e contexto funcional.
7. Adicionar testes unitários/integrados para o caminho principal.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.
9. Registar evidence com request/response, screenshot ou output de teste.
10. Concluir handoff técnico para `BK-MF8-14`. Flashcards entram depois como modo de revisão independente de ranking.

### Cenarios negativos recomendados
- aluno pede ranking de teste sem acesso
- professor pede ranking de disciplina que não leciona
- attempts empatadas sem ordenação estável

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Backend implementa validação, autorização e erro explícito.
- [ ] Frontend cobre loading, vazio, sucesso e erro quando aplicável.
- [ ] Testes cobrem: empate usa answeredAt asc, aluno vê apenas top 10 + posição própria, professor vê ranking completo da disciplina/turma.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-14`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Ordenação determinística do ranking**
- BK vinculado: `BK-MF8-13`.

```ts
type RankingAttempt = { studentId: string; scorePercent: number; answeredAt: Date };

export function ordenarRanking(attempts: RankingAttempt[]) {
  return [...attempts].sort((a, b) => {
    if (b.scorePercent !== a.scorePercent) return b.scorePercent - a.scorePercent;
    // Em empate, quem respondeu primeiro fica acima, tornando o ranking previsível.
    return a.answeredAt.getTime() - b.answeredAt.getTime();
  });
}
```

Este snippet fixa a regra central do BK antes da integração completa no serviço real.
- Requisitos alvo deste BK: `RF28, RF30`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Backend e frontend entregam comportamento observável end-to-end.
- Cenarios negativos concluidos: minimo `2` com resultado controlado.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-14`

## Changelog
- `2026-06-30`: guia criado para expansão end-to-end da MF8 antes da cadeia final de testes.
