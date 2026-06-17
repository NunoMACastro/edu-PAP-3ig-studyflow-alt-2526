# PLANO-IMPLEMENTACAO-TOTAL

## Header
- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Definir a linha temporal canónica de 12 sprints para executar os BK da StudyFlow com rastreabilidade RF/RNF, coerencia documental e preparacao para defesa PAP.

## Contrato canónico
- Pesos oficiais: `25/20/25/20/10`.
- Politica Core/Reforco: `P0 => Reforco`, `P1/P2 => Core`.
- Gates obrigatorios de revisao: `S4`, `S8`, `S12`.
- Replaneamento deterministico por constraints: `scripts/plan_constraints_studyflow.json`.
- Output operacional do solver: `scripts/solver_reassignments.json`.
- Invariantes: IDs BK preservados e cobertura `RF/RNF/BK` sem orfaos.

## Calendario macro
- `MF0` (Fundacoes de plataforma): janela `S01-S03` com `12` BK.
- `MF1` (Nucleo funcional I): janela `S02-S04` com `10` BK.
- `MF2` (Nucleo funcional II): janela `S04-S05` com `12` BK.
- `MF3` (Capacidades de produto I): janela `S06-S07` com `12` BK.
- `MF4` (Capacidades de produto II): janela `S02-S08` com `10` BK.
- `MF5` (Operacao e UX transversal): janela `S07-S11` com `11` BK.
- `MF6` (Qualidade, seguranca e performance): janela `S08-S11` com `12` BK.
- `MF7` (Operacao, modularidade e compliance): janela `S06-S12` com `11` BK.
- `MF8` (Compatibilidade e fecho PAP): janela `S03-S12` com `11` BK.

## Fases
1. Fase 1 (S01-S06): fundacoes + nucleo funcional aluno/professor.
2. Fase 2 (S07-S10): capacidades de produto, governanca e UX.
3. Fase 3 (S10-S12): qualidade, seguranca, compliance e fecho documental.

## Entregaveis obrigatorios por gate
- Gate S4: backlog/matriz/guias sincronizados para MF0-MF1.
- Gate S8: rastreabilidade completa MF0-MF4 com evidencias de validacao.
- Gate S12: pacote final de defesa com auditoria automatica em PASS.

## Changelog
- `2026-04-19`: plano reescrito para horizonte canónico de 12 sprints com gates S4/S8/S12.
