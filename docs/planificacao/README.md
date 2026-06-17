# PLANIFICACAO-STUDYFLOW

## Header
- `doc_id`: `PLANIFICACAO-STUDYFLOW`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Normalizar a planificacao da StudyFlow ao padrao OPSA/FaithFlix com governanca completa, cobertura rastreavel e foco pedagogico para 12o ano.

## Hierarquia canónica (ordem oficial)
1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `sprints/PLANO-SPRINTS.md`
4. `sprints/SCORECARD-SPRINTS.md`
5. `sprints/GUIAO-DOCENTE-SEMANAL.md`
6. `sprints/GATES-S4-S8-S12.md`
7. `sprints/OPERACAO-DEPLOY-ROLLBACK.md`
8. `CORE-DUAL-CONTRATO.md`
9. `scripts/plan_constraints_studyflow.json`
10. `scripts/solver_reassignments.json`
11. `backlogs/MATRIZ-CANONICA-BK.md`
12. `backlogs/BACKLOG-MVP.md`
13. `backlogs/MF-VIEWS.md`
14. `backlogs/CONTRATO-CAMPOS-BK.md`
15. `backlogs/ANEXO-RF-PARA-BKS.md`
16. `backlogs/ANEXO-RNF-PARA-BKS.md`
17. `backlogs/ANEXO-BK-SPRINT-OWNER.md`
18. `backlogs/ANEXO-CORE-DUAL-BK.md`
19. `guias-bk/README.md`
20. `CONFORMIDADE-PLANIFICACAO.md`

## Regra de precedencia
- Em conflito de dados operacionais, prevalece a ordem da hierarquia canónica.
- `MATRIZ-CANONICA-BK.md` e a fonte de referencia para ownership/prioridade/dependencias/rf_rnf.
- `BACKLOG-MVP.md` e `guias-bk` herdam os metadados da matriz sem excecoes.

## Regra de atualizacao em cadeia
1. Executar solver com constraints formais (`scripts/plan_constraints_studyflow.json` -> `scripts/solver_reassignments.json`).
2. Atualizar matriz.
3. Regenerar backlog e MF views.
4. Regenerar guias BK e anexos de rastreabilidade.
5. Atualizar sprints/scorecard/gates.
6. Executar `scripts/validate-planificacao.sh` e publicar relatorio de conformidade.

## Contrato de scorecard (pesos oficiais)
- Cobertura/rastreabilidade: `25`
- Coerencia documental: `20`
- Pedagogia/guidance/step-by-step: `25`
- Adequacao ao 12o: `20`
- Governanca/avaliacao: `10`

## Contagem oficial de requisitos
- Total RF: **57**
- Total RNF: **44**

## Meta documental oficial
- Meta: `>=97/100`
- Estado alvo apos normalizacao: `PASS` em auditoria automatica.

## Changelog
- `2026-04-19`: estrutura/layout normalizados para alinhamento total com baseline OPSA+FaithFlix.
