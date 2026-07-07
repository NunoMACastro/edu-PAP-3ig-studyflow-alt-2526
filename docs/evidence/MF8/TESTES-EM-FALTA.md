# TESTES-EM-FALTA - MF8

<<<<<<< HEAD
## Resultado automático

- Gerado em: 2026-07-02T00:00:00.000Z
- Raiz analisada: /caminho/do/projeto
- Alvos críticos: 8
- Alvos cobertos: 6
- Testes em falta: 2
=======
## Resultado automatico

- Gerado em: 2026-07-06T14:53:49.640Z
- Raiz analisada: real_dev
- Alvos criticos: 8
- Alvos cobertos: 8
- Testes em falta: 0
>>>>>>> 2f1990b (Update: Cabulas)
- Ficheiros base em falta: 0

## Tabela de cobertura

<<<<<<< HEAD
| Prioridade | Área | Módulo | Estado | Teste esperado | Razão |
| --- | --- | --- | --- | --- | --- |
| P0 | web-e2e | Flashcards em exercício | missing-spec | apps/web/tests/e2e/mf8-flashcards.spec.ts | Consome o handoff do BK-MF8-14 e valida o fluxo visual de flashcards. |

## Decisão para BK-MF8-16

- Não avances para a execução final sem corrigir ou justificar as lacunas P0.
=======
| Prioridade | Area | Modulo | Estado | Teste esperado | Razao |
| --- | --- | --- | --- | --- | --- |
| P0 | api | Ferramentas de estudo privadas | covered | real_dev/api/src/modules/ai/study-tools.service.spec.ts | Garante artefactos de resumo, explicacao, flashcards e quizzes usados por RF12. |
| P0 | api | Validacao de artefactos IA | covered | real_dev/api/src/modules/ai/validators/ai-artifact.validator.spec.ts | Impede artefactos IA com conteudo invalido ou fontes desalinhadas. |
| P0 | api | Mini-testes oficiais | covered | real_dev/api/src/modules/official-tests/official-tests.service.spec.ts | Suporta os fluxos oficiais de professor e aluno usados em MF8. |
| P0 | api | IA da sala | covered | real_dev/api/src/modules/study-rooms/room-ai.service.spec.ts | Protege contexto de sala, membership e respostas IA partilhadas. |
| P0 | api | Partilhas da sala | covered | real_dev/api/src/modules/study-rooms/room-shares.service.spec.ts | Protege partilha read-only e fork privado preparados na MF8. |
| P0 | api | Inventario MF8 | covered | real_dev/api/src/scripts/mf8-test-inventory.spec.ts | Garante que o proprio inventario de RNF41 e testado. |
| P1 | web-e2e | Background jobs de estudo | covered | real_dev/web/tests/e2e/mf6-background-jobs.spec.ts | Confirma que fluxos assincronos continuam cobertos antes dos testes finais. |
| P0 | web-e2e | Flashcards em exercicio | covered | real_dev/web/tests/e2e/mf8-flashcards.spec.ts | Consome o handoff do BK-MF8-14 e valida o fluxo visual de flashcards. |

## Decisao para BK-MF8-16

- Pode avancar para a execucao final, mantendo esta evidence no PR.
>>>>>>> 2f1990b (Update: Cabulas)
