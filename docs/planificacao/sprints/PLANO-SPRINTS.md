# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Conversao S/M/L
- `S`: 1 unidade
- `M`: 2 unidades
- `L`: 3 unidades

## Capacidade semanal por aluno
| Pessoa | Capacidade alvo (u/semana) |
| --- | --- |
| Natalia | 6 |
| Guilherme | 4.5 |
| Kaua | 3.5 |
| Daniel | 2.5 |
| Total equipa | 16.5 |

## Carga global planeada (modelo normalizado)
- BK totais: `101`
- `esforco_unico_total_u`: `153` (cada BK conta 1x com `S=1`, `M=2`, `L=3`)
- `carga_planeada_sprint_u`: distribuicao do esforco pelas janelas declaradas (`Sxx-Syy`)
- Janela de execucao: `12` sprints (`2026-04-13` a `2026-07-05`)
- Capacidade total da janela: `205.5` unidades
- Margem operacional global (capacidade - esforco_unico_total_u): `52.5` unidades

## Linha temporal oficial (12 sprints)
| sprint | periodo | foco_macro | objetivo_operacional | carga_planeada_u | gate |
| --- | --- | --- | --- | --- | --- |
| S01 | 2026-04-13 a 2026-04-19 | MF0 | Carga planeada e entrega com evidence completa | 15 | NAO |
| S02 | 2026-04-20 a 2026-04-26 | MF0 | Carga planeada e entrega com evidence completa | 7 | NAO |
| S03 | 2026-04-27 a 2026-05-03 | MF1 | Carga planeada e entrega com evidence completa | 14 | NAO |
| S04 | 2026-05-04 a 2026-05-10 | MF1 | Carga planeada e entrega com evidence completa | 4 | SIM |
| S05 | 2026-05-11 a 2026-05-17 | MF2 | Carga planeada e entrega com evidence completa | 15 | NAO |
| S06 | 2026-05-18 a 2026-05-24 | MF2 | Carga planeada e entrega com evidence completa | 11 | NAO |
| S07 | 2026-05-25 a 2026-05-31 | MF3 | Carga planeada e entrega com evidence completa | 15 | NAO |
| S08 | 2026-06-01 a 2026-06-07 | MF3/MF4 | Carga planeada e entrega com evidence completa | 14 | SIM |
| S09 | 2026-06-08 a 2026-06-14 | MF4/MF5 | Carga planeada e entrega com evidence completa | 14 | NAO |
| S10 | 2026-06-15 a 2026-06-21 | MF5/MF6 | Carga planeada e entrega com evidence completa | 15 | NAO |
| S11 | 2026-06-22 a 2026-06-28 | MF6/MF7 | Carga planeada e entrega com evidence completa | 15 | NAO |
| S12 | 2026-06-29 a 2026-07-05 | MF7/MF8 | Carga planeada e entrega com evidence completa | 14 | SIM |

## Regra de replaneamento
1. Replaneamento apenas no fecho da sprint, exceto bloqueio critico.
2. Prioridade de execucao: `P0 > P1 > P2`.
3. Qualquer desvio exige sincronizacao de `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `MF-VIEWS` e `guias-bk`.
4. Em sobrecarga, reduzir primeiro paralelismo `P1/P2` sem perder cobertura RF/RNF.

## Matriz minima de testes por prioridade
- `P0`: evidencias obrigatorias de `unit + integration + e2e` e minimo `3` negativos.
- `P1`: evidencias obrigatorias de `unit/integration` e minimo `2` negativos.
- `P2`: teste focal do fluxo alterado e minimo `1` negativo.
- Aplicacao canónica: BK em `Sxx-Syy` distribui carga `50/50` por sprint para auditoria.

## KPI minimos por sprint
- Cobertura de BK planeados concluida >= 85%.
- Checklists smoke/negativos/tecnico completos por BK >= 90%.
- Bloqueios >48h com escalacao no scorecard.
- Esforco em core dual (CORE-IA + CORE-COM + CORE-HIBRIDO) >= 70%.

## Artefactos obrigatorios
- `SCORECARD-SPRINTS.md`
- `GUIAO-DOCENTE-SEMANAL.md`
- `GATES-S4-S8-S12.md`
- `OPERACAO-DEPLOY-ROLLBACK.md`
- `ANEXO-CORE-DUAL-BK.md`

## Changelog
- `2026-04-19`: plano de sprints reduzido e sincronizado para horizonte canónico `S01..S12`.
