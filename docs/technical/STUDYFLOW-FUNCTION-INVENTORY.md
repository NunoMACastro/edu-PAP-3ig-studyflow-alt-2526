# StudyFlow — localização do inventário AST de funções

```yaml
doc_id: SF-FUNCTION-INVENTORY-BRIDGE
implementation_manifest_sha256: 43d68c7a959019e296394742ef5fb98796ce44cc64901d844d98b1da6a06d56d
canonical_artifact: real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md
updated_at: 2026-07-13
```

O artefacto operativo é
[`real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md`](../../real_dev/docs/technical/STUDYFLOW-FUNCTION-INVENTORY.md),
gerado por `real_dev/api/src/scripts/generate-function-inventory.ts`.

```bash
npm --prefix real_dev/api run function-inventory:write
npm --prefix real_dev/api run function-inventory:check
```

Este ficheiro externo liga o artefacto ao manifesto sem introduzir um hash circular dentro de
`real_dev`. O valor acima deve coincidir com o ledger e com o gerador canónico.
