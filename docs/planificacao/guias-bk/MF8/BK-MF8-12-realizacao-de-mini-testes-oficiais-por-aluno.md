# BK-MF8-12 - Realização de mini-testes oficiais por aluno.

## Header
- `doc_id`: `GUIA-BK-MF8-12`
- `bk_id`: `BK-MF8-12`
- `macro`: `MF8`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-04`
- `rf_rnf`: `RF28`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-13`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-12-realizacao-de-mini-testes-oficiais-por-aluno.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: `Realização de mini-testes oficiais por aluno.` com rastreabilidade direta para `RF28`.
- Foco da macro `MF8`: Fecho de produto, qualidade da IA e validação final.
- Dominio semântico aplicado: `official_tests_attempts`.

## Bloco pedagogico
### Objetivo
Fechar o ciclo dos mini-testes oficiais permitindo que o aluno liste testes publicados, responda MCQ e receba resultado sem exposição prévia das respostas corretas.

### Pre-requisitos
- Ler os requisitos de origem em `docs/RF.md` e `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF2-04`.

### Erros comuns
- Expor dados de outro aluno, sala, turma ou disciplina por falta de filtro de ownership/membership.
- Implementar apenas UI sem contrato backend validável e testes negativos.
- Misturar regras privadas e partilhadas sem estado explícito no modelo.
- Fechar BK sem evidence de autorização, fluxo feliz e falha controlada.

### Check de compreensao
- [ ] Sei explicar como `RF28` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco de privacidade/autorização deste BK.
- [ ] Sei demonstrar evidence objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF8-12`
- Requisito(s): `RF28`
- Dependencias: `BK-MF2-04`
- API alvo: `GET /api/student/subjects/:subjectId/tests; POST /api/student/tests/:testId/attempts`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF8-12` e dos requisitos `RF28`.
2. Rever o contrato existente em `real_dev/api` e `real_dev/web` antes de criar novos módulos.
3. Implementar backend: OfficialTestAttempt guarda respostas, pontuação, percentagem e answeredAt; MVP limita uma tentativa por aluno/teste.
4. Implementar API: `GET /api/student/subjects/:subjectId/tests; POST /api/student/tests/:testId/attempts`.
5. Implementar frontend: Aluno lista mini-testes publicados, resolve questões MCQ e vê resultado; professor mantém criação/publicação a partir da UI existente.
6. Garantir autorização por sessão, ownership, membership e contexto funcional.
7. Adicionar testes unitários/integrados para o caminho principal.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Registar evidence com request/response, screenshot ou output de teste.
10. Concluir handoff técnico para `BK-MF8-13`. O ranking do BK seguinte usa attempts submetidas e datadas.

### Cenarios negativos recomendados
- submeter teste em DRAFT
- segunda tentativa do mesmo aluno no mesmo teste
- payload com opção inexistente ou pergunta fora do teste

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Backend implementa validação, autorização e erro explícito.
- [ ] Frontend cobre loading, vazio, sucesso e erro quando aplicável.
- [ ] Testes cobrem: só testes PUBLISHED são resolvidos, uma tentativa por aluno/teste, respostas corretas não aparecem antes da submissão.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e/smoke + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF8-13`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Submissão sem expor gabarito antes do fim**
- BK vinculado: `BK-MF8-12`.

```ts
type AttemptAnswer = { questionId: string; optionId: string };
type OfficialTestAttempt = { testId: string; studentId: string; answers: AttemptAnswer[]; scorePercent: number; answeredAt: Date };

export function criarAttempt(testId: string, studentId: string, answers: AttemptAnswer[], scorePercent: number): OfficialTestAttempt {
  // A pontuação é calculada no backend; o cliente envia respostas, não recebe o gabarito antes da submissão.
  return { testId, studentId, answers, scorePercent, answeredAt: new Date() };
}
```

Este snippet fixa a regra central do BK antes da integração completa no serviço real.
- Requisitos alvo deste BK: `RF28`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Backend e frontend entregam comportamento observável end-to-end.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF8-13`

## Changelog
- `2026-06-30`: guia criado para expansão end-to-end da MF8 antes da cadeia final de testes.
