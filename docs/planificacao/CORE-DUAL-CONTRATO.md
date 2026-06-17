# CORE-DUAL-CONTRATO

## Header
- `doc_id`: `CORE-DUAL-CONTRATO`
- `path`: `docs/planificacao/CORE-DUAL-CONTRATO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Definicao oficial
A StudyFlow opera em core dual:
1. `Aprendizagem inteligente` (explicacoes, personalizacao, tutor IA e progresso academico).
2. `Operacao pedagogica` (turmas, projetos, avaliacao, colaboracao e rotina de estudo).

## Regras canónicas
- Regra de equilibrio: por sprint, `>=70%` do esforco deve estar em `CORE-IA`, `CORE-COM` ou `CORE-HIBRIDO`.
- Regra de entrada BK (GO/NO-GO): BK novo so entra no MVP se reforcar aprendizagem inteligente, operacao pedagogica, ou ambos.
- Regra anti-desvio: BK sem contribuicao direta para os eixos core deve ser classificado como `SUPORTE`.
- Regra de evidencias: BK `CORE-*` exige evidencia tecnica e evidencia de impacto academico.
- Regra de viabilidade: quando necessario, o solver pode reclassificar `SUPORTE -> CORE-HIBRIDO` de forma minima e criterial.

## Classes e significado
- `CORE-IA`: entrega direta no eixo de aprendizagem inteligente.
- `CORE-COM`: entrega direta no eixo de operacao pedagogica.
- `CORE-HIBRIDO`: entrega com impacto simultaneo nos dois eixos.
- `SUPORTE`: habilitador transversal de operacao, qualidade ou governanca.

## KPIs minimos de acompanhamento
- `CORE-IA`: `taxa_resposta_util`, `tempo_resposta_p95`.
- `CORE-COM`: `adesao_turma_semana`, `taxa_tarefas_concluidas`.
- `CORE-HIBRIDO`: `tempo_estudo_semana`, `taxa_retencao_30d`.
- `SUPORTE`: `taxa_incidentes_criticos`, `taxa_conformidade_gates`.

## Fonte de verdade
- Classificacao por BK: `docs/planificacao/backlogs/ANEXO-CORE-DUAL-BK.md`.
- Planeamento de sprint: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Governanca de gate: `docs/planificacao/sprints/GATES-S4-S8-S12.md`.

## Changelog
- `2026-04-19`: contrato criado para institucionalizar o core dual e controlar desvio de conceito.
