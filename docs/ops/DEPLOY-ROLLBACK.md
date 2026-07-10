# StudyFlow — release e rollback no âmbito local

O StudyFlow desta auditoria não tem procedimento de deploy para staging ou
produção. O alvo autorizado é exclusivamente `PAP_LOCAL_ENDURECIDA`, em loopback
e single-instance.

O procedimento executável canónico está em
[real_dev/docs/ops/DEPLOY-ROLLBACK.md](../../real_dev/docs/ops/DEPLOY-ROLLBACK.md).
Ele cobre snapshot autenticado da implementação e rollback local; os dados exigem
o backup cifrado e restore para destinos locais vazios descritos no
[runbook local](LOCAL-PAP-RUNBOOK.md).

O estado, os blockers e o manifesto atual pertencem ao
[ledger de remediação](../PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md).

Este ficheiro não declara que um build, gate, backup, restore ou rollback passou.
Essas conclusões só podem ser registadas após execução real, com exit code e
manifesto SHA-256 correspondentes. Uma futura exposição pública reabre os riscos
mitigados pelo âmbito local e exige um plano operacional próprio.
