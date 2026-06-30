# BK-MF8-14 - Flashcards em modo de exercício e revisão.

## Header
- `doc_id`: `GUIA-BK-MF8-14`
- `bk_id`: `BK-MF8-14`
- `macro`: `MF8`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-12`
- `rf_rnf`: `RF12`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-15`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-14-flashcards-em-modo-de-exercicio-e-revisao.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Flashcards em modo de exercício e revisão.` com rastreabilidade direta para `RF12`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `flashcard_review`.

## Bloco pedagogico
### Objetivo
Transformar flashcards gerados em modo de exercício e revisão, com virar cartão e registo simples de resultado por cartão.

### Pre-requisitos
- Ler os requisitos de origem em `docs/RF.md` e `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF0-12`.

### Erros comuns
- Expor dados de outro aluno, sala, turma ou disciplina por falta de filtro de ownership/membership.
- Implementar apenas UI sem contrato backend validável e testes negativos.
- Misturar regras privadas e partilhadas sem estado explícito no modelo.
- Fechar BK sem evidence de autorização, fluxo feliz e falha controlada.

### Check de compreensao
- [ ] Sei explicar como `RF12` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco de privacidade/autorização deste BK.
- [ ] Sei demonstrar evidence objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-14`
- Requisito(s): `RF12`
- Dependencias: `BK-MF0-12`
- API alvo: `POST /api/study-areas/:id/study-tools/:artifactId/flashcard-reviews`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-14` e dos requisitos `RF12`.
2. Rever o contrato existente em `real_dev/api` e `real_dev/web` antes de criar novos módulos.
3. Implementar backend: FlashcardReview guarda artifactId, cardIndex, resultado e reviewedAt sem spaced repetition avançado.
4. Implementar API: `POST /api/study-areas/:id/study-tools/:artifactId/flashcard-reviews`.
5. Implementar frontend: Flashcard mostra frente, botão virar, verso e botões não sabia, quase e acertei.
6. Garantir autorização por sessão, ownership, membership e contexto funcional.
7. Adicionar testes unitários/integrados para o caminho principal.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.
9. Registar evidence com request/response, screenshot ou output de teste.
10. Concluir handoff técnico para `BK-MF8-08`. A MF8 segue para datas PT-PT e depois para a cadeia final de testes.

### Cenarios negativos recomendados
- aluno tenta rever flashcards de outra área
- artifactId não é FLASHCARDS
- cardIndex fora dos limites do baralho

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Backend implementa validação, autorização e erro explícito.
- [ ] Frontend cobre loading, vazio, sucesso e erro quando aplicável.
- [ ] Testes cobrem: só dono da área revê cartões, só artefactos FLASHCARDS aceitam review, cardIndex inválido falha.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-15`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Registo simples de revisão**
- BK vinculado: `BK-MF8-14`.

```ts
type ReviewOutcome = 'NAO_SABIA' | 'QUASE' | 'ACERTEI';

export function registarReview(cardCount: number, cardIndex: number, outcome: ReviewOutcome) {
  if (cardIndex < 0 || cardIndex >= cardCount) throw new Error('Cartao invalido');
  // O MVP guarda apenas a autoavaliacao imediata; spaced repetition fica fora deste BK.
  return { cardIndex, outcome, reviewedAt: new Date() };
}
```

Este snippet fixa a regra central do BK antes da integração completa no serviço real.
- Requisitos alvo deste BK: `RF12`.

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
`BK-MF8-15`

## Changelog
- `2026-06-30`: guia criado para expansão end-to-end da MF8 antes da cadeia final de testes.
