# BK-MF8-11 - Partilha read-only e fork privado de chat IA da sala.

## Header
- `doc_id`: `GUIA-BK-MF8-11`
- `bk_id`: `BK-MF8-11`
- `macro`: `MF8`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF8-10`
- `rf_rnf`: `RF16, RF42, RNF20`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-12`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-11-partilha-read-only-e-fork-privado-de-chat-ia-da-sala.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Partilha read-only e fork privado de chat IA da sala.` com rastreabilidade direta para `RF16, RF42, RNF20`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `room_ai_sharing`.

## Bloco pedagogico
### Objetivo
Permitir que o aluno partilhe uma resposta de IA da sala em modo read-only e que colegas criem um fork privado para continuar o raciocínio no seu próprio chat.

### Pre-requisitos
- Ler os requisitos de origem em `docs/RF.md` e `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF8-10`.

### Erros comuns
- Expor dados de outro aluno, sala, turma ou disciplina por falta de filtro de ownership/membership.
- Implementar apenas UI sem contrato backend validável e testes negativos.
- Misturar regras privadas e partilhadas sem estado explícito no modelo.
- Fechar BK sem evidence de autorização, fluxo feliz e falha controlada.

### Check de compreensao
- [ ] Sei explicar como `RF16, RF42, RNF20` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco de privacidade/autorização deste BK.
- [ ] Sei demonstrar evidence objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-11`
- Requisito(s): `RF16, RF42, RNF20`
- Dependencias: `BK-MF8-10`
- API alvo: `PATCH /api/study-rooms/:roomId/ai/answers/:answerId/share; POST /api/study-rooms/:roomId/ai/answers/:answerId/fork; GET /api/study-rooms/:roomId/ai/answers?scope=shared`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-11` e dos requisitos `RF16, RF42, RNF20`.
2. Rever o contrato existente em `real_dev/api` e `real_dev/web` antes de criar novos módulos.
3. Implementar backend: RoomAiInteraction.visibility = PRIVATE | SHARED, sharedAt e forkedFromInteractionId.
4. Implementar API: `PATCH /api/study-rooms/:roomId/ai/answers/:answerId/share; POST /api/study-rooms/:roomId/ai/answers/:answerId/fork; GET /api/study-rooms/:roomId/ai/answers?scope=shared`.
5. Implementar frontend: RoomAiPage ganha separador Partilhados, botão de partilhar respostas próprias e botão de fork em respostas partilhadas.
6. Garantir autorização por sessão, ownership, membership e contexto funcional.
7. Adicionar testes unitários/integrados para o caminho principal.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.
9. Registar evidence com request/response, screenshot ou output de teste.
10. Concluir handoff técnico para `BK-MF8-12`. Mini-testes oficiais passam a ter um fluxo de realização separado dos chats.

### Cenarios negativos recomendados
- colega tenta editar o original partilhado
- aluno tenta partilhar resposta que não é sua
- fork de resposta não partilhada ou de outra sala

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Backend implementa validação, autorização e erro explícito.
- [ ] Frontend cobre loading, vazio, sucesso e erro quando aplicável.
- [ ] Testes cobrem: colegas não alteram original, fork fica privado, partilhas de outra sala são rejeitadas.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-12`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Fork privado de resposta partilhada**
- BK vinculado: `BK-MF8-11`.

```ts
type Visibility = 'PRIVATE' | 'SHARED';
type Answer = { id: string; roomId: string; ownerId: string; visibility: Visibility };

export function criarForkPrivado(answer: Answer, studentId: string) {
  if (answer.visibility !== 'SHARED') throw new Error('Resposta nao partilhada');
  // O fork nunca reutiliza ownership do original; o novo contexto pertence ao aluno atual.
  return { roomId: answer.roomId, ownerId: studentId, visibility: 'PRIVATE', forkedFromInteractionId: answer.id };
}
```

Este snippet fixa a regra central do BK antes da integração completa no serviço real.
- Requisitos alvo deste BK: `RF16, RF42, RNF20`.

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
`BK-MF8-12`

## Changelog
- `2026-06-30`: guia criado para expansão end-to-end da MF8 antes da cadeia final de testes.
