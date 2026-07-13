# StudyFlow — localização do inventário AST de funções

```yaml
doc_id: SF-FUNCTION-INVENTORY-BRIDGE
implementation_manifest_sha256: 951a8a6932d774f047caf8c7ea4c850238775ac8ab83e3c9c2883f26c6f7b18e
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
