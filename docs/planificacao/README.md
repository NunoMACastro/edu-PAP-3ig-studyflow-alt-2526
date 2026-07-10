# PLANIFICACAO-STUDYFLOW

## Header
- `doc_id`: `PLANIFICACAO-STUDYFLOW`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo
Normalizar a planificacao da StudyFlow ao padrao OPSA/FaithFlix com governanca completa, cobertura rastreavel e foco pedagogico para 12o ano.

## Duas autoridades documentais

O StudyFlow mantém duas cadeias deliberadamente separadas. Misturá-las faria o progresso dos
alunos parecer evidence da implementação de referência, ou faria o estado de `real_dev` alterar
o plano pedagógico.

### Autoridade da implementação de referência

1. [`../PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md`](../PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md), ledger operacional;
2. [`../technical/STUDYFLOW-TECHNICAL-MAP.md`](../technical/STUDYFLOW-TECHNICAL-MAP.md) e
   [`../technical/STUDYFLOW-FUNCTION-INVENTORY.md`](../technical/STUDYFLOW-FUNCTION-INVENTORY.md),
   pontes para o mapa técnico e inventário AST gerados;
3. [`../ops/LOCAL-PAP-RUNBOOK.md`](../ops/LOCAL-PAP-RUNBOOK.md), operação local canónica;
4. evidence ligada ao SHA-256 corrente em `ESTADO-REFERENCIA-REAL_DEV.md`.

O código existir não basta para marcar `VALIDADO`. Uma alteração a `real_dev/` invalida o
manifesto e toda a evidence dependente até o gate e a reauditoria serem repetidos.

### Autoridade pedagógica (ordem oficial)

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

## Regra de precedência

- Em conflito sobre a implementação real, prevalece a autoridade da implementação.
- Em conflito sobre sequência, ownership ou progresso dos alunos, prevalece a autoridade
  pedagógica pela ordem indicada.
- `MATRIZ-CANONICA-BK.md` e a fonte de referencia para ownership/prioridade/dependencias/rf_rnf.
- `BACKLOG-MVP.md` e `guias-bk` herdam os metadados da matriz sem excecoes.

## Dois estados por BK

- `estado: TODO|DONE` mede exclusivamente o progresso pedagógico.
- `real_dev_status` mede exclusivamente a implementação de referência e aceita:
  `VALIDADO`, `IMPLEMENTADO_NAO_VALIDADO`, `PARCIAL`, `MITIGADO_POR_ESCOPO`,
  `BLOQUEADO_OPERADOR`, `NAO_IMPLEMENTADO` ou `NAO_APLICAVEL`.
- A fonte de `real_dev_status`, evidence, risco residual e condição de reabertura é
  [`ESTADO-REFERENCIA-REAL_DEV.md`](ESTADO-REFERENCIA-REAL_DEV.md).
- É proibido inferir um estado a partir do outro.

## Matriz de requisitos futuros e fronteira PAP local

Esta matriz deriva regras dos RF/RNF sem criar novos IDs. `Evidence` identifica a prova
permitida no perfil atual; nunca transforma uma mitigação por âmbito ou um blocker manual em
funcionalidade implementada.

| requisito futuro | perfil PAP local | evidence | condição de reabertura |
| --- | --- | --- | --- |
| Horizontal scaling/multi-instância | `MITIGADO_POR_ESCOPO`: single-instance em loopback | mapa técnico, runner/storage local e manifesto corrente | segunda instância, worker distribuído ou storage partilhado |
| HTTPS/TLS/HSTS público | `MITIGADO_POR_ESCOPO`: HTTP apenas em loopback, sem proxy confiado | config fail-closed, runbook e teste de host público rejeitado | exposição fora de loopback, reverse proxy ou domínio público |
| Verificação de email/SSO escolar | `PARCIAL`: registo local protegido por rate limit; SSO/email não implementados | testes de registo/login e estado `BK-MF0-01` na referência | autenticação escolar obrigatória ou qualquer deploy público |
| 200 utilizadores simultâneos | `PARCIAL`: não existe prova de 200 utilizadores distintos | testes E2E isolados; smoke histórico de 200 pedidos com uma sessão não conta como 200 utilizadores | claim de capacidade, teste multiutilizador ou mudança de infraestrutura |
| Backup off-site e disaster recovery | `BLOQUEADO_OPERADOR`: backup local cifrado; restore real aguarda `OP-005` | testes sintéticos, runbook e confirmação manual sem chave | armazenamento off-site, RPO/RTO operacional ou restore real autorizado |
| Migrations/zero-downtime | `MITIGADO_POR_ESCOPO`: reset/index bootstrap apenas em base local vazia | testes fail-closed de seed/reset e bootstrap de índices | dados persistentes a preservar, deploy público ou rolling update |
| Email/push externos e integrações bidirecionais | `PARCIAL`: notificações in-app/importação unidirecional | contratos RF atuais e mapa técnico | ativação de provider externo, OAuth ou sincronização bidirecional |
| CI/CD e rollback de produção | `MITIGADO_POR_ESCOPO`: gate local ligado a manifesto; sem claim de deploy | `verify:local-release`, ledger e evidence sanitizada | pipeline remoto, ambiente público ou requisito de rollback operacional |

## Regra de atualizacao em cadeia
1. Executar solver com constraints formais (`scripts/plan_constraints_studyflow.json` -> `scripts/solver_reassignments.json`).
2. Atualizar matriz.
3. Regenerar backlog e MF views.
4. Regenerar guias BK e anexos de rastreabilidade.
5. Atualizar sprints/scorecard/gates.
6. Executar `scripts/validate-planificacao.sh` e `npm run docs:verify`; só publicar conformidade
   quando a validação estrutural e semântica passar.

## Contrato de scorecard (pesos oficiais)
- Cobertura/rastreabilidade: `25`
- Coerencia documental: `20`
- Pedagogia/guidance/step-by-step: `25`
- Adequacao ao 12o: `20`
- Governanca/avaliacao: `10`

## Contagem oficial de requisitos
- Total RF: **57**
- Total RNF: **45**

## Meta documental oficial
- Meta: `>=97/100`
- Estado alvo apos normalizacao: `PASS` em auditoria automatica.

## Changelog
- `2026-07-10`: separadas as autoridades da implementação e da pedagogia; introduzido
  `real_dev_status` ligado ao manifesto e à evidence.
- `2026-04-19`: estrutura/layout normalizados para alinhamento total com baseline OPSA+FaithFlix.
