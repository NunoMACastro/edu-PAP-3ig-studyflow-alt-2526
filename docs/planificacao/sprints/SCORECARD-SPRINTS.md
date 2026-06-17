# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Contrato de avaliacao (pesos oficiais)
| criterio | peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| Total | 100 |

## Scorecard por sprint
| sprint | estado_sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | adequacao_12o | governanca | modelo_carga | carga_planeada_u | core_dual_percent | core_dual_ok | carga_real_u | desvio_u | risco_semaforo | acao_corretiva |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 15 | 100 | SIM | - | - | N/A | - |
| S02 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 7 | 71.4 | SIM | - | - | N/A | - |
| S03 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 14 | 92.9 | SIM | - | - | N/A | - |
| S04 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 4 | 100 | SIM | - | - | N/A | - |
| S05 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 15 | 100 | SIM | - | - | N/A | - |
| S06 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 11 | 72.7 | SIM | - | - | N/A | - |
| S07 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 15 | 80 | SIM | - | - | N/A | - |
| S08 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 14 | 71.4 | SIM | - | - | N/A | - |
| S09 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 14 | 71.4 | SIM | - | - | N/A | - |
| S10 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 15 | 86.7 | SIM | - | - | N/A | - |
| S11 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 15 | 80 | SIM | - | - | N/A | - |
| S12 | PLANEADA | - | - | - | - | - | S=1,M=2,L=3 + split 50/50 | 14 | 71.4 | SIM | - | - | N/A | - |

## Regra de preenchimento
1. `estado_sprint` so pode ser `PLANEADA`, `EM_CURSO` ou `FECHADA`.
2. Quando `carga_real_u` estiver vazia (`-`), `desvio_u` deve ficar `-` e `risco_semaforo` deve ficar `N/A`.
3. Sprint com total < 93 exige plano corretivo na sprint seguinte.
4. Gates `S4/S8/S12` exigem evidencias anexas de cobertura e coerencia.
5. `acao_corretiva` deve registar mitigacao quando `core_dual_percent < 70%`.

## Regras de semaforo
- `Verde`: desvio absoluto <= 2 unidades e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 unidades ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 unidades, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Changelog
- `2026-04-19`: scorecard migrado para schema canónico único entre as PAPs.
