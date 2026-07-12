# StudyFlow — localização do mapa técnico canónico

```yaml
doc_id: SF-TECHNICAL-MAP-BRIDGE
implementation_manifest_sha256: 3e2a162b59e2d23c5276df21a10b439519df71c3b9cee67d04c709ec818dfd5c
canonical_artifact: real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md
updated_at: 2026-07-11
```

Este ficheiro é apenas uma ponte documental. O único mapa técnico operativo é
[real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md](../../real_dev/docs/technical/STUDYFLOW-TECHNICAL-MAP.md),
gerado a partir da fonte tipada
`real_dev/api/src/scripts/export-technical-map.ts`.

Não duplicar nem editar manualmente as tabelas neste caminho. Para atualizar e validar:

```bash
npm --prefix real_dev/api run technical-map:write
npm --prefix real_dev/api run technical-map:check
```

O segundo comando compara byte a byte o artefacto canónico. O gate
`verify:local-release` executa a mesma comparação e falha se existir drift. Este
controlo aplica-se apenas ao alvo `PAP_LOCAL_ENDURECIDA`; não constitui evidence
de prontidão para produção.

O mapa inclui os nove grupos de interfaces finais (sessão, IA, jobs, privacidade,
testes, ranking, notificações, chat e health). O grupo `CHAT` distingue o mural REST
assíncrono dos grupos de estudo do canal WebSocket coletivo por disciplina. Inclui também storage/workers, transações,
frontend e release local. O hash literal e o estado não entram no artefacto de
`real_dev`, para evitar uma referência circular no manifesto; ficam nesta ponte e no
[ledger de remediação](../PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md).
