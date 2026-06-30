# BK-MF8-10 - Histórico privado dos chats IA da sala.

## Header
- `doc_id`: `GUIA-BK-MF8-10`
- `bk_id`: `BK-MF8-10`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-04`
- `rf_rnf`: `RF16, RF42, RNF20, RNF23`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-11`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-10-historico-privado-dos-chats-ia-da-sala.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Histórico privado dos chats IA da sala.` com rastreabilidade direta para `RF16, RF42, RNF20, RNF23`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `room_ai_privacy`.

## Bloco pedagogico
### Objetivo
Adicionar histórico privado para as interações da IA da sala, mantendo novas respostas privadas por defeito e visíveis apenas ao aluno que as criou.

### Pre-requisitos
- Ler os requisitos de origem em `docs/RF.md` e `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-04`.

### Erros comuns
- Expor dados de outro aluno, sala, turma ou disciplina por falta de filtro de ownership/membership.
- Implementar apenas UI sem contrato backend validável e testes negativos.
- Misturar regras privadas e partilhadas sem estado explícito no modelo.
- Fechar BK sem evidence de autorização, fluxo feliz e falha controlada.

### Check de compreensao
- [ ] Sei explicar como `RF16, RF42, RNF20, RNF23` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco de privacidade/autorização deste BK.
- [ ] Sei demonstrar evidence objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-10`
- Requisito(s): `RF16, RF42, RNF20, RNF23`
- Dependencias: `BK-MF1-04`
- API alvo: `GET /api/study-rooms/:roomId/ai/answers?scope=mine`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-10` e dos requisitos `RF16, RF42, RNF20, RNF23`.
2. Rever o contrato existente em `real_dev/api` e `real_dev/web` antes de criar novos módulos.
3. Implementar backend: RoomAiInteraction com ownership por aluno e filtro obrigatório por roomId + userId.
4. Implementar API: `GET /api/study-rooms/:roomId/ai/answers?scope=mine`.
5. Implementar frontend: RoomAiPage mostra histórico privado com estados vazio, loading e erro.
6. Garantir autorização por sessão, ownership, membership e contexto funcional.
7. Adicionar testes unitários/integrados para o caminho principal.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.
9. Registar evidence com request/response, screenshot ou output de teste.
10. Concluir handoff técnico para `BK-MF8-11`. A partilha do histórico privado fica preparada para o BK seguinte.

### Cenarios negativos recomendados
- aluno fora da sala tenta listar histórico
- aluno da sala tenta ver respostas de outro aluno
- roomId válido com interação de outra sala

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Backend implementa validação, autorização e erro explícito.
- [ ] Frontend cobre loading, vazio, sucesso e erro quando aplicável.
- [ ] Testes cobrem: membership obrigatório, aluno só vê as suas interações, IDs de outra sala não passam.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-11`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Filtro de histórico privado**
- BK vinculado: `BK-MF8-10`.

```ts
type RoomAiInteraction = { roomId: string; studentId: string; answer: string };

export function filtrarHistoricoPrivado(interactions: RoomAiInteraction[], roomId: string, studentId: string) {
  // Ownership e sala são invariantes: sem ambos, há risco de fuga entre alunos ou salas.
  return interactions.filter((item) => item.roomId === roomId && item.studentId === studentId);
}
```

Este snippet fixa a regra central do BK antes da integração completa no serviço real.
- Requisitos alvo deste BK: `RF16, RF42, RNF20, RNF23`.

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
`BK-MF8-11`

## Changelog
- `2026-06-30`: guia criado para expansão end-to-end da MF8 antes da cadeia final de testes.
